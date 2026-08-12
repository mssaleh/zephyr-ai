/**
 * Minimal MCP server over stdio, targeting protocol revision 2025-11-25.
 *
 * Hand-written rather than taken from `@modelcontextprotocol/sdk` because that
 * package pulls in express, hono, jose, cors, ajv and zod to cover every
 * transport. This server speaks stdio only, where the wire format is
 * newline-delimited JSON-RPC 2.0 — a few hundred lines — and the server is
 * spawned on every Claude Code session, so startup cost is worth controlling.
 *
 * Spec points deliberately honoured:
 *  - Protocol version is negotiated: the client's version is echoed when
 *    supported, otherwise the newest this server implements.
 *  - stderr is free for logging on stdio transports; stdout carries only frames.
 *  - Tool *input validation* failures are returned as tool execution errors
 *    (`isError: true`), not JSON-RPC errors, so the model can correct itself
 *    (SEP-1303). Genuine protocol faults still use JSON-RPC error codes.
 *  - A tool that declares an `outputSchema` returns `structuredContent`, and
 *    also serialises it into a text block for clients that ignore the former.
 */

import { createInterface } from 'node:readline';

export const LATEST_PROTOCOL_VERSION = '2025-11-25';
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];

export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const;

type Id = string | number;

interface Request {
  jsonrpc: '2.0';
  id: Id;
  method: string;
  params?: Record<string, unknown>;
}

interface Notification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolResult {
  content: TextContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

export interface Tool extends ToolDefinition {
  handler: (args: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  title?: string;
  description?: string;
  mimeType?: string;
}

export interface Resource extends ResourceDefinition {
  read: () => string | Promise<string>;
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  title?: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface Prompt extends PromptDefinition {
  render: (args: Record<string, string>) => string;
}

/** Thrown by a tool handler to report a user-correctable problem. */
export class ToolError extends Error {}

export interface ServerOptions {
  name: string;
  version: string;
  title?: string;
  description?: string;
  /** Shown to the model once at connection time; keep it short. */
  instructions?: string;
}

export class McpServer {
  readonly #tools = new Map<string, Tool>();
  readonly #resources = new Map<string, Resource>();
  readonly #prompts = new Map<string, Prompt>();
  readonly #options: ServerOptions;
  #initialized = false;
  #negotiatedVersion = LATEST_PROTOCOL_VERSION;

  constructor(options: ServerOptions) {
    this.#options = options;
  }

  tool(tool: Tool): this {
    this.#tools.set(tool.name, tool);
    return this;
  }

  resource(resource: Resource): this {
    this.#resources.set(resource.uri, resource);
    return this;
  }

  prompt(prompt: Prompt): this {
    this.#prompts.set(prompt.name, prompt);
    return this;
  }

  /** Diagnostics go to stderr, which the spec reserves for exactly this. */
  static log(message: string): void {
    process.stderr.write(`[zephyr-mcp] ${message}\n`);
  }

  #send(message: unknown): void {
    process.stdout.write(`${JSON.stringify(message)}\n`);
  }

  #respond(id: Id, result: unknown): void {
    this.#send({ jsonrpc: '2.0', id, result });
  }

  #fail(id: Id, code: number, message: string, data?: unknown): void {
    this.#send({
      jsonrpc: '2.0',
      id,
      error: data === undefined ? { code, message } : { code, message, data },
    });
  }

  async #dispatch(method: string, params: Record<string, unknown>): Promise<unknown> {
    switch (method) {
      case 'initialize':
        return this.#initialize(params);

      case 'ping':
        return {};

      case 'tools/list':
        return {
          tools: [...this.#tools.values()].map(
            ({ handler: _handler, ...definition }) => definition,
          ),
        };

      case 'tools/call':
        return this.#callTool(params);

      case 'resources/list':
        return {
          resources: [...this.#resources.values()].map(({ read: _read, ...definition }) => definition),
        };

      case 'resources/templates/list':
        return { resourceTemplates: [] };

      case 'resources/read': {
        const uri = typeof params['uri'] === 'string' ? params['uri'] : '';
        const resource = this.#resources.get(uri);
        if (!resource) throw new RpcError(ErrorCode.InvalidParams, `Unknown resource: ${uri}`);
        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType ?? 'text/plain',
              text: await resource.read(),
            },
          ],
        };
      }

      case 'prompts/list':
        return {
          prompts: [...this.#prompts.values()].map(({ render: _render, ...definition }) => definition),
        };

      case 'prompts/get': {
        const name = typeof params['name'] === 'string' ? params['name'] : '';
        const prompt = this.#prompts.get(name);
        if (!prompt) throw new RpcError(ErrorCode.InvalidParams, `Unknown prompt: ${name}`);
        const args = (params['arguments'] ?? {}) as Record<string, string>;
        return {
          ...(prompt.description ? { description: prompt.description } : {}),
          messages: [
            { role: 'user', content: { type: 'text', text: prompt.render(args) } },
          ],
        };
      }

      case 'logging/setLevel':
        return {};

      default:
        throw new RpcError(ErrorCode.MethodNotFound, `Method not found: ${method}`);
    }
  }

  #initialize(params: Record<string, unknown>): unknown {
    const requested = typeof params['protocolVersion'] === 'string' ? params['protocolVersion'] : '';
    this.#negotiatedVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
      ? requested
      : LATEST_PROTOCOL_VERSION;
    this.#initialized = true;

    // Only advertise what is actually registered: a declared capability the
    // server cannot serve is worse than an absent one.
    const capabilities: Record<string, unknown> = {};
    if (this.#tools.size > 0) capabilities['tools'] = { listChanged: false };
    if (this.#resources.size > 0) {
      capabilities['resources'] = { listChanged: false, subscribe: false };
    }
    if (this.#prompts.size > 0) capabilities['prompts'] = { listChanged: false };

    return {
      protocolVersion: this.#negotiatedVersion,
      capabilities,
      serverInfo: {
        name: this.#options.name,
        version: this.#options.version,
        ...(this.#options.title ? { title: this.#options.title } : {}),
        ...(this.#options.description ? { description: this.#options.description } : {}),
      },
      ...(this.#options.instructions ? { instructions: this.#options.instructions } : {}),
    };
  }

  async #callTool(params: Record<string, unknown>): Promise<ToolResult> {
    const name = typeof params['name'] === 'string' ? params['name'] : '';
    const tool = this.#tools.get(name);
    if (!tool) throw new RpcError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);

    const args = (params['arguments'] ?? {}) as Record<string, unknown>;
    try {
      const result = await tool.handler(args);
      // A tool declaring an output schema must return conforming structured
      // content; mirror it into a text block for clients that ignore it.
      if (tool.outputSchema && result.structuredContent && result.content.length === 0) {
        result.content = [{ type: 'text', text: JSON.stringify(result.structuredContent, null, 2) }];
      }
      return result;
    } catch (err) {
      // Bad arguments are the model's to fix, so they come back as a tool
      // error it can read rather than a protocol error it cannot.
      const message = err instanceof Error ? err.message : String(err);
      if (!(err instanceof ToolError)) {
        McpServer.log(`tool ${name} failed: ${message}`);
      }
      return { content: [{ type: 'text', text: message }], isError: true };
    }
  }

  start(): void {
    const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (trimmed === '') return;

      let message: Request | Notification;
      try {
        message = JSON.parse(trimmed) as Request | Notification;
      } catch {
        this.#fail(0, ErrorCode.ParseError, 'Parse error');
        return;
      }

      if (typeof message !== 'object' || message === null || message.jsonrpc !== '2.0') {
        this.#fail((message as Request)?.id ?? 0, ErrorCode.InvalidRequest, 'Invalid Request');
        return;
      }

      const id = (message as Request).id;
      const isRequest = id !== undefined && id !== null;

      // Notifications get no response, ever — including for unknown methods.
      if (!isRequest) {
        if (message.method === 'notifications/initialized') this.#initialized = true;
        return;
      }

      void this.#dispatch(message.method, message.params ?? {})
        .then((result) => this.#respond(id, result))
        .catch((err: unknown) => {
          if (err instanceof RpcError) {
            this.#fail(id, err.code, err.message);
            return;
          }
          const detail = err instanceof Error ? err.message : String(err);
          McpServer.log(`internal error handling ${message.method}: ${detail}`);
          this.#fail(id, ErrorCode.InternalError, detail);
        });
    });

    rl.on('close', () => process.exit(0));
  }

  get initialized(): boolean {
    return this.#initialized;
  }
}

export class RpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
  }
}
