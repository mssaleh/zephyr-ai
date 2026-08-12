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
type ResponseId = Id | null;

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

type LifecycleState = 'new' | 'initializing' | 'ready' | 'closing' | 'closed';

function describePath(path: string): string {
  return path === '$' ? 'arguments' : `arguments${path.slice(1)}`;
}

/** Validate the dependency-free JSON Schema subset used by this server. */
export function validateSchema(value: unknown, schema: Record<string, unknown>, path = '$'): string[] {
  const errors: string[] = [];
  const type = schema['type'];
  const matchesType =
    type === undefined ||
    (type === 'object' && value !== null && typeof value === 'object' && !Array.isArray(value)) ||
    (type === 'array' && Array.isArray(value)) ||
    (type === 'string' && typeof value === 'string') ||
    (type === 'boolean' && typeof value === 'boolean') ||
    (type === 'integer' && typeof value === 'number' && Number.isInteger(value)) ||
    (type === 'number' && typeof value === 'number' && Number.isFinite(value));
  if (!matchesType) return [`${describePath(path)} must be ${String(type)}.`];

  if (Array.isArray(schema['enum']) && !schema['enum'].some((item) => Object.is(item, value))) {
    errors.push(`${describePath(path)} must be one of: ${schema['enum'].map(String).join(', ')}.`);
  }
  if (typeof value === 'number') {
    if (typeof schema['minimum'] === 'number' && value < schema['minimum']) {
      errors.push(`${describePath(path)} must be at least ${schema['minimum']}.`);
    }
    if (typeof schema['maximum'] === 'number' && value > schema['maximum']) {
      errors.push(`${describePath(path)} must be at most ${schema['maximum']}.`);
    }
  }
  if (typeof value === 'string') {
    if (typeof schema['minLength'] === 'number' && value.length < schema['minLength']) {
      errors.push(`${describePath(path)} must contain at least ${schema['minLength']} characters.`);
    }
    if (typeof schema['maxLength'] === 'number' && value.length > schema['maxLength']) {
      errors.push(`${describePath(path)} must contain at most ${schema['maxLength']} characters.`);
    }
  }
  if (Array.isArray(value)) {
    if (typeof schema['minItems'] === 'number' && value.length < schema['minItems']) {
      errors.push(`${describePath(path)} must contain at least ${schema['minItems']} item(s).`);
    }
    if (typeof schema['maxItems'] === 'number' && value.length > schema['maxItems']) {
      errors.push(`${describePath(path)} must contain at most ${schema['maxItems']} item(s).`);
    }
    const itemSchema = schema['items'];
    if (itemSchema && typeof itemSchema === 'object' && !Array.isArray(itemSchema)) {
      value.forEach((item, index) =>
        errors.push(...validateSchema(item, itemSchema as Record<string, unknown>, `${path}[${index}]`)),
      );
    }
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    const properties =
      schema['properties'] && typeof schema['properties'] === 'object' && !Array.isArray(schema['properties'])
        ? (schema['properties'] as Record<string, Record<string, unknown>>)
        : {};
    const required = Array.isArray(schema['required']) ? schema['required'] : [];
    for (const name of required) {
      if (typeof name === 'string' && !(name in object)) {
        errors.push(`${describePath(`${path}.${name}`)} is required.`);
      }
    }
    if (schema['additionalProperties'] === false) {
      for (const name of Object.keys(object)) {
        if (!(name in properties)) errors.push(`${describePath(`${path}.${name}`)} is not allowed.`);
      }
    }
    for (const [name, child] of Object.entries(object)) {
      const childSchema = properties[name];
      if (childSchema) errors.push(...validateSchema(child, childSchema, `${path}.${name}`));
    }
  }
  return errors;
}

export interface ServerOptions {
  name: string;
  version: string;
  title?: string;
  description?: string;
  /** Shown to the model once at connection time; keep it short. */
  instructions?: string;
  /** Called when a roots-capable client reports a new ordered root list. */
  rootsChanged?: (roots: string[]) => void;
}

export class McpServer {
  readonly #tools = new Map<string, Tool>();
  readonly #resources = new Map<string, Resource>();
  readonly #prompts = new Map<string, Prompt>();
  readonly #options: ServerOptions;
  #state: LifecycleState = 'new';
  #negotiatedVersion = LATEST_PROTOCOL_VERSION;
  #clientSupportsRoots = false;
  #clientRootsListChanged = false;
  #outboundSequence = 0;
  #rootsRequestPending = false;
  readonly #outbound = new Map<Id, (result: unknown, error?: unknown) => void>();

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

  #respond(id: ResponseId, result: unknown): void {
    this.#send({ jsonrpc: '2.0', id, result });
  }

  #fail(id: ResponseId, code: number, message: string, data?: unknown): void {
    this.#send({
      jsonrpc: '2.0',
      id,
      error: data === undefined ? { code, message } : { code, message, data },
    });
  }

  #refreshRoots(): void {
    if (!this.#clientSupportsRoots || this.#state !== 'ready' || this.#rootsRequestPending) return;
    const id = `zephyr-roots-${++this.#outboundSequence}`;
    this.#rootsRequestPending = true;
    const timeout = setTimeout(() => {
      if (this.#outbound.delete(id)) {
        this.#rootsRequestPending = false;
        McpServer.log('roots/list timed out; continuing with the explicit project environment');
      }
    }, 5000);
    timeout.unref();
    this.#outbound.set(id, (value, error) => {
      clearTimeout(timeout);
      this.#rootsRequestPending = false;
      if (error) {
        McpServer.log('the client rejected roots/list; continuing with the explicit project environment');
        return;
      }
      const roots =
        value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>)['roots'])
          ? ((value as Record<string, unknown>)['roots'] as unknown[])
              .flatMap((root) =>
                root && typeof root === 'object' && typeof (root as Record<string, unknown>)['uri'] === 'string'
                  ? [String((root as Record<string, unknown>)['uri'])]
                  : [],
              )
          : [];
      this.#options.rootsChanged?.(roots);
    });
    this.#send({ jsonrpc: '2.0', id, method: 'roots/list', params: {} });
  }

  async #dispatch(method: string, params: Record<string, unknown>): Promise<unknown> {
    if (method === 'initialize') {
      if (this.#state !== 'new') {
        throw new RpcError(ErrorCode.InvalidRequest, 'The server has already been initialized.');
      }
      return this.#initialize(params);
    }
    if (method === 'ping') return {};
    if (this.#state !== 'ready') {
      throw new RpcError(ErrorCode.InvalidRequest, 'The MCP initialization lifecycle is not complete.');
    }
    switch (method) {
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
    const clientInfo = params['clientInfo'];
    if (
      typeof params['protocolVersion'] !== 'string' ||
      params['capabilities'] === null ||
      typeof params['capabilities'] !== 'object' ||
      Array.isArray(params['capabilities']) ||
      clientInfo === null ||
      typeof clientInfo !== 'object' ||
      Array.isArray(clientInfo) ||
      typeof (clientInfo as Record<string, unknown>)['name'] !== 'string' ||
      typeof (clientInfo as Record<string, unknown>)['version'] !== 'string'
    ) {
      throw new RpcError(
        ErrorCode.InvalidParams,
        'initialize requires protocolVersion, capabilities, and clientInfo with name and version.',
      );
    }
    const requested = typeof params['protocolVersion'] === 'string' ? params['protocolVersion'] : '';
    this.#negotiatedVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
      ? requested
      : LATEST_PROTOCOL_VERSION;
    this.#state = 'initializing';
    const clientCapabilities = params['capabilities'] as Record<string, unknown>;
    const roots = clientCapabilities['roots'];
    this.#clientSupportsRoots = roots !== null && typeof roots === 'object' && !Array.isArray(roots);
    this.#clientRootsListChanged =
      this.#clientSupportsRoots && (roots as Record<string, unknown>)['listChanged'] === true;

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
      const validation = validateSchema(args, tool.inputSchema);
      if (validation.length > 0) {
        throw new ToolError(`Invalid input for ${name}:\n${validation.map((error) => `- ${error}`).join('\n')}`);
      }
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
      if (err instanceof ToolError) {
        return { content: [{ type: 'text', text: err.message }], isError: true };
      }
      const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
      McpServer.log(`tool ${name} failed: ${detail}`);
      return {
        content: [
          {
            type: 'text',
            text: `The ${name} lookup failed because the local index could not be read. Run index_status and rebuild the index if needed.`,
          },
        ],
        isError: true,
      };
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
        this.#fail(null, ErrorCode.ParseError, 'Parse error');
        return;
      }

      if (typeof message !== 'object' || message === null || Array.isArray(message)) {
        this.#fail(null, ErrorCode.InvalidRequest, 'Invalid Request');
        return;
      }

      const envelope = message as unknown as Record<string, unknown>;
      const rawId = envelope['id'];
      const responseId: ResponseId =
        typeof rawId === 'string' || (typeof rawId === 'number' && Number.isFinite(rawId)) ? rawId : null;

      // Responses to server-originated requests (currently roots/list) have no
      // method and must never themselves receive a response.
      if (
        !('method' in envelope) &&
        'id' in envelope &&
        envelope['jsonrpc'] === '2.0' &&
        (typeof rawId === 'string' || typeof rawId === 'number') &&
        this.#outbound.has(rawId)
      ) {
        const validId = typeof rawId === 'string' || (typeof rawId === 'number' && Number.isFinite(rawId));
        const hasResult = 'result' in envelope;
        const hasError = 'error' in envelope;
        if (!validId || hasResult === hasError) {
          McpServer.log('ignored a malformed response to a server-originated request');
          return;
        }
        const resolver = this.#outbound.get(rawId as Id);
        if (resolver) {
          this.#outbound.delete(rawId as Id);
          resolver(envelope['result'], envelope['error']);
        }
        return;
      }
      if (
        envelope['jsonrpc'] !== '2.0' ||
        typeof envelope['method'] !== 'string' ||
        envelope['method'] === '' ||
        (rawId !== undefined && rawId !== null && responseId === null) ||
        ('params' in envelope &&
          (envelope['params'] === null || typeof envelope['params'] !== 'object' || Array.isArray(envelope['params'])))
      ) {
        this.#fail(responseId, ErrorCode.InvalidRequest, 'Invalid Request');
        return;
      }

      const id = responseId;
      // JSON-RPC permits a null request ID (while discouraging it). Presence,
      // not truthiness, distinguishes a request from a notification.
      const isRequest = 'id' in envelope;

      // Notifications get no response, ever — including for unknown methods.
      if (!isRequest) {
        if (message.method === 'notifications/initialized' && this.#state === 'initializing') {
          this.#state = 'ready';
          this.#refreshRoots();
        } else if (
          message.method === 'notifications/roots/list_changed' &&
          this.#state === 'ready' &&
          this.#clientRootsListChanged
        ) {
          this.#refreshRoots();
        }
        return;
      }

      void this.#dispatch(message.method, message.params ?? {})
        .then((result) => this.#respond(id, result))
        .catch((err: unknown) => {
          if (err instanceof RpcError) {
            this.#fail(id, err.code, err.message);
            return;
          }
          const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
          McpServer.log(`internal error handling ${message.method}: ${detail}`);
          this.#fail(id, ErrorCode.InternalError, 'Internal server error');
        });
    });

    rl.on('close', () => {
      if (this.#state !== 'closing') this.#state = 'closing';
      this.#state = 'closed';
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      this.#state = 'closing';
      rl.close();
    });
  }

  get initialized(): boolean {
    return this.#state === 'ready';
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
