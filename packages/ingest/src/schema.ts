/**
 * Index schema and writer.
 *
 * One SQLite file holds everything. Structured tables carry the facts; FTS5
 * external-content tables provide BM25 ranking without storing a second copy of
 * the text — which matters, because the documentation set alone is tens of
 * megabytes of prose.
 *
 * The index is written once and never mutated at runtime, so the FTS tables are
 * populated with a single INSERT ... SELECT after the base tables are loaded
 * rather than being kept in sync with triggers.
 */

import { INDEX_SCHEMA_VERSION } from '../../shared/index-descriptor.ts';

export const SCHEMA_VERSION = INDEX_SCHEMA_VERSION;

/**
 * FTS5 columns must exist by name on the content table, so a few searchable
 * fields (a chunk's page title, a binding's property-name list) are denormalised
 * onto the row. They are stored once and indexed once; nothing is duplicated.
 */
export const DDL = `
PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;
PRAGMA temp_store = MEMORY;

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Interned strings. Devicetree property descriptions are inherited through
-- include chains, so the same text is attached to thousands of bindings:
-- 20.7 MB of description text across 119 718 properties is only 0.8 MB of
-- distinct strings. Storing them once cuts roughly a quarter off the index.
CREATE TABLE text_pool (
  id   INTEGER PRIMARY KEY,
  text TEXT NOT NULL
);

-- ---------------------------------------------------------------- docs -----
CREATE TABLE doc (
  id     INTEGER PRIMARY KEY,
  path   TEXT NOT NULL UNIQUE,
  url    TEXT NOT NULL,
  title  TEXT NOT NULL,
  area   TEXT NOT NULL,
  labels TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX doc_area_idx ON doc(area);

CREATE TABLE doc_chunk (
  id           INTEGER PRIMARY KEY,
  doc_id       INTEGER NOT NULL REFERENCES doc(id),
  anchor       TEXT,
  heading      TEXT NOT NULL DEFAULT '',
  heading_path TEXT NOT NULL DEFAULT '',
  ord          INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT ''
);
CREATE INDEX doc_chunk_doc_idx ON doc_chunk(doc_id, ord);

CREATE TABLE doc_origin (
  id         INTEGER PRIMARY KEY,
  doc_id     INTEGER NOT NULL REFERENCES doc(id),
  path       TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line   INTEGER NOT NULL,
  directive  TEXT NOT NULL
);
CREATE INDEX doc_origin_doc_idx ON doc_origin(doc_id);

CREATE VIRTUAL TABLE doc_fts USING fts5(
  title, heading_path, body,
  content='doc_chunk', content_rowid='id',
  tokenize='porter unicode61 remove_diacritics 2'
);

-- ------------------------------------------------------------- kconfig -----
-- A symbol is identified by name *and* namespace. The application tree and the
-- sysbuild tree share 2876 of their 2909 symbol names while meaning different
-- things by some of them, so a bare name is not an identity here.
CREATE TABLE kconfig (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  scope      TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild')),
  type       TEXT,
  prompt     TEXT NOT NULL DEFAULT '',
  help       TEXT NOT NULL DEFAULT '',
  defaults   TEXT NOT NULL DEFAULT '[]',
  depends    TEXT NOT NULL DEFAULT '[]',
  selects    TEXT NOT NULL DEFAULT '[]',
  implies    TEXT NOT NULL DEFAULT '[]',
  ranges     TEXT NOT NULL DEFAULT '[]',
  defined_in TEXT NOT NULL DEFAULT '[]',
  menu_path  TEXT NOT NULL DEFAULT '',
  is_choice  INTEGER NOT NULL DEFAULT 0,
  choice     TEXT,
  n_defs     INTEGER NOT NULL DEFAULT 1,
  has_prompt INTEGER NOT NULL DEFAULT 0,
  UNIQUE(name, scope)
);
CREATE INDEX kconfig_scope_idx ON kconfig(scope);

-- Semantic Kconfig graph exported by the target tree's own Kconfiglib. The
-- legacy JSON columns above are a denormalised search/read projection only.
-- Symbols reachable only once an SoC is selected. Zephyr sources a series'
-- Kconfig from inside a conditional on that series, so a catalogue index -- which
-- has selected no SoC -- cannot see them, while Kconfig.soc next door is sourced
-- unconditionally and is fully indexed. That asymmetry is why the catalogue knows
-- SOC_STM32N657XX and cannot resolve STM32N6_BOOT_SERIAL, the symbol that board's
-- flash arguments are guarded on.
--
-- These come from the fallback parser rather than the tree's own Kconfiglib, so
-- they carry a declaration and not an evaluated dependency graph. The separate
-- table is what keeps the weaker claim from being read as the stronger one.
CREATE TABLE soc_kconfig (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  series TEXT NOT NULL,
  file   TEXT NOT NULL,
  line   INTEGER NOT NULL DEFAULT 0,
  type   TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  help   TEXT NOT NULL DEFAULT '',
  UNIQUE(name, series)
);
CREATE INDEX soc_kconfig_name_idx ON soc_kconfig(name);

-- What one build actually resolved to, layered over the catalogue rather than
-- replacing it. The catalogue says what a symbol is and what it depends on; this
-- says what it came out as, for one board, one application, one moment.
CREATE TABLE resolved_config (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  -- 0 records an explicitly unset symbol, which is a resolved value and not an
  -- absence: "I set this and it did not take" is unanswerable without it.
  is_set INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE resolved_node (
  id         INTEGER PRIMARY KEY,
  path       TEXT NOT NULL,
  label      TEXT NOT NULL DEFAULT '',
  compatible TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX resolved_node_path_idx ON resolved_node(path);
CREATE INDEX resolved_node_label_idx ON resolved_node(label);

CREATE TABLE kconfig_expr (
  id       INTEGER PRIMARY KEY,
  kind     TEXT NOT NULL,
  value    TEXT,
  display  TEXT NOT NULL,
  left_id  INTEGER REFERENCES kconfig_expr(id),
  right_id INTEGER REFERENCES kconfig_expr(id)
);

CREATE TABLE kconfig_definition (
  id                    INTEGER PRIMARY KEY,
  symbol_id             INTEGER NOT NULL REFERENCES kconfig(id),
  file                  TEXT NOT NULL,
  line                  INTEGER NOT NULL,
  prompt                TEXT,
  menu_path             TEXT NOT NULL DEFAULT '[]',
  condition_expr_id     INTEGER REFERENCES kconfig_expr(id),
  prompt_condition_id   INTEGER REFERENCES kconfig_expr(id),
  is_menuconfig         INTEGER NOT NULL DEFAULT 0,
  is_configdefault      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX kconfig_definition_symbol_idx ON kconfig_definition(symbol_id);

CREATE TABLE kconfig_default (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  value_expr_id     INTEGER NOT NULL REFERENCES kconfig_expr(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);
CREATE INDEX kconfig_default_definition_idx ON kconfig_default(definition_id, ord);

CREATE TABLE kconfig_relation (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  kind              TEXT NOT NULL CHECK(kind IN ('select', 'imply')),
  target_name       TEXT NOT NULL,
  target_symbol_id  INTEGER REFERENCES kconfig(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);
CREATE INDEX kconfig_relation_target_idx ON kconfig_relation(target_name, kind);

CREATE TABLE kconfig_range (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  low_expr_id       INTEGER NOT NULL REFERENCES kconfig_expr(id),
  high_expr_id      INTEGER NOT NULL REFERENCES kconfig_expr(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);

CREATE TABLE kconfig_choice (
  id                INTEGER PRIMARY KEY,
  stable_id         TEXT NOT NULL,
  scope             TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild')),
  name              TEXT,
  type              TEXT,
  definitions       TEXT NOT NULL DEFAULT '[]',
  -- A named choice yields its own name as the stable id, and BOOTLOADER exists
  -- in both trees, so the namespace is part of the identity here too.
  UNIQUE(stable_id, scope)
);

CREATE TABLE kconfig_choice_member (
  choice_id INTEGER NOT NULL REFERENCES kconfig_choice(id),
  symbol_id INTEGER NOT NULL REFERENCES kconfig(id),
  PRIMARY KEY(choice_id, symbol_id)
);

-- Reverse dependency graph: answers "what turns this symbol on?", which is the
-- question you actually have when a config silently fails to take effect.
CREATE TABLE kconfig_edge (
  from_sym TEXT NOT NULL,
  to_sym   TEXT NOT NULL,
  kind     TEXT NOT NULL,
  -- Edges join symbols by name, so they must not cross a namespace boundary.
  scope    TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild'))
);
CREATE INDEX kconfig_edge_to_idx ON kconfig_edge(to_sym, kind, scope);
CREATE INDEX kconfig_edge_from_idx ON kconfig_edge(from_sym, kind, scope);

CREATE VIRTUAL TABLE kconfig_fts USING fts5(
  name, prompt, help,
  content='kconfig', content_rowid='id',
  tokenize='unicode61 tokenchars ''_'''
);

-- -------------------------------------------------------- dt bindings ------
CREATE TABLE dt_binding (
  id          INTEGER PRIMARY KEY,
  compatible  TEXT NOT NULL,
  path        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bus         TEXT,
  on_bus      TEXT,
  cells       TEXT NOT NULL DEFAULT '{}',
  includes    TEXT NOT NULL DEFAULT '[]',
  prop_names  TEXT NOT NULL DEFAULT '',
  n_props     INTEGER NOT NULL DEFAULT 0,
  vendor      TEXT
);
CREATE INDEX dt_binding_compat_idx ON dt_binding(compatible);
CREATE INDEX dt_binding_vendor_idx ON dt_binding(vendor);

CREATE TABLE dt_property (
  id              INTEGER PRIMARY KEY,
  binding_id      INTEGER NOT NULL REFERENCES dt_binding(id),
  child_level     INTEGER NOT NULL DEFAULT 0,
  name            TEXT NOT NULL,
  type            TEXT,
  required        INTEGER NOT NULL DEFAULT 0,
  description_id  INTEGER REFERENCES text_pool(id),
  default_value   TEXT,
  enum_values     TEXT,
  const_value     TEXT,
  deprecated      INTEGER NOT NULL DEFAULT 0,
  specifier_space TEXT,
  inherited_from  TEXT,
  provenance      TEXT NOT NULL DEFAULT '{}',
  constraints     TEXT NOT NULL DEFAULT '{}',
  child_path      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX dt_property_binding_idx ON dt_property(binding_id, child_level);
CREATE INDEX dt_property_name_idx ON dt_property(name);

-- Hides the interning from every consumer: query this, not dt_property.
-- Where the tree *uses* a compatible, as against where it declares one. A
-- binding cannot say whether a driver fits your silicon; the set of boards and
-- SoC devicetree files upstream instantiates it on is the strongest signal that
-- exists, and answering it by grepping a vendor header costs a dozen calls.
CREATE TABLE dt_instance (
  id         INTEGER PRIMARY KEY,
  compatible TEXT NOT NULL,
  file       TEXT NOT NULL,
  -- Empty when the file is SoC or shared devicetree rather than a board's.
  board      TEXT NOT NULL DEFAULT '',
  -- The node that carries the compatible, with its unit address: mpu6886@68.
  -- The node name is the part number, and it is what turns "used on
  -- m5stack_atoms3" -- which requires the reader to know what that board
  -- carries -- into "used on m5stack_atoms3 as mpu6886@68", which names the
  -- part outright. Empty when the enclosing node could not be established.
  node       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX dt_instance_compatible_idx ON dt_instance(compatible);
CREATE INDEX dt_instance_board_idx ON dt_instance(board);

-- What a driver will accept, as against what a binding describes. Many drivers
-- refuse to initialise unless an identity register reads one of a fixed set of
-- values, and that set is the answer to "is the part on my bench supported?".
-- It appears in no binding: invensense,mpu6050 accepts 0x19, an MPU6880, whose
-- name is in no binding, no board file and no documentation page.
--
-- Absence of a row means the extractor did not recognise the driver's shape. It
-- never means the driver accepts nothing, and every rendering says so.
CREATE TABLE driver_identity (
  id            INTEGER PRIMARY KEY,
  compatible    TEXT NOT NULL,
  driver_file   TEXT NOT NULL,
  -- The macro the driver passed to the read, not one matched by name: vendors
  -- write REG_WAI, REG_CHIP_ID, DEVICE_ID_REG and REG_ID for the same thing.
  register_name TEXT NOT NULL DEFAULT '',
  -- Null when the call could be found but its register was not an integer macro.
  register      INTEGER,
  UNIQUE(compatible, driver_file)
);
CREATE INDEX driver_identity_compatible_idx ON driver_identity(compatible);

CREATE TABLE driver_identity_value (
  identity_id INTEGER NOT NULL REFERENCES driver_identity(id),
  -- Stored as an integer so the reverse lookup -- "what accepts 0x19?" -- is an
  -- index seek rather than a string comparison against 0x19, 0X19 and 25.
  value       INTEGER NOT NULL,
  name        TEXT NOT NULL,
  ord         INTEGER NOT NULL,
  PRIMARY KEY(identity_id, name)
);
CREATE INDEX driver_identity_value_idx ON driver_identity_value(value);

CREATE VIEW dt_property_v AS
  SELECT p.id, p.binding_id, p.child_level, p.name, p.type, p.required,
         COALESCE(t.text, '') AS description,
         p.default_value, p.enum_values, p.const_value, p.deprecated,
         p.specifier_space, p.inherited_from, p.provenance, p.constraints,
         p.child_path
  FROM dt_property p
  LEFT JOIN text_pool t ON t.id = p.description_id;

CREATE VIRTUAL TABLE dt_fts USING fts5(
  compatible, description, prop_names,
  content='dt_binding', content_rowid='id',
  tokenize='unicode61 tokenchars ''_,-'''
);

-- -------------------------------------------------------------- boards -----
CREATE TABLE board (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  full_name        TEXT NOT NULL DEFAULT '',
  vendor           TEXT NOT NULL DEFAULT '',
  dir              TEXT NOT NULL,
  arch             TEXT,
  ram              INTEGER,
  flash            INTEGER,
  socs             TEXT NOT NULL DEFAULT '[]',
  socs_text        TEXT NOT NULL DEFAULT '',
  targets          TEXT NOT NULL DEFAULT '[]',
  targets_text     TEXT NOT NULL DEFAULT '',
  revisions        TEXT NOT NULL DEFAULT '[]',
  default_revision TEXT,
  supported        TEXT NOT NULL DEFAULT '[]',
  supported_text   TEXT NOT NULL DEFAULT '',
  doc_path         TEXT,
  -- Build targets whose _defconfig sets CONFIG_XIP=n. ram and flash above
  -- are Twister metadata, not a memory budget, and on a target that does not
  -- execute in place the flash figure describes no internal part at all.
  no_xip_targets   TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX board_vendor_idx ON board(vendor);
CREATE INDEX board_arch_idx ON board(arch);

CREATE TABLE soc (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  series      TEXT,
  family      TEXT,
  vendor      TEXT,
  dir         TEXT NOT NULL,
  cpuclusters TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX soc_name_idx ON soc(name);
CREATE INDEX soc_series_idx ON soc(series);

-- The memory the application actually gets, as against the Twister figures.
--
-- twister.yaml sizes a test runner's expectations. Rendered bare those figures
-- read as a memory budget and are not one: upstream's NUCLEO-N657X0-Q declares
-- 1024 KB of each while the application gets 511 KB of SRAM and no internal
-- flash at all. What decides it is the board's own chosen node and the reg
-- of what it points at.
--
-- A row exists only where the whole chain resolved: the chosen phandle, the
-- labelled node, and a reg this can read. A board with an unresolvable chain
-- stores nothing, because a wrong number here is worse than no number.
CREATE TABLE board_memory (
  id      INTEGER PRIMARY KEY,
  board   TEXT NOT NULL,
  -- Empty when the declaration applies to every target of the board.
  target  TEXT NOT NULL DEFAULT '',
  role    TEXT NOT NULL CHECK(role IN ('sram', 'code-partition', 'flash')),
  label   TEXT NOT NULL,
  node    TEXT NOT NULL DEFAULT '',
  address INTEGER NOT NULL,
  size    INTEGER NOT NULL,
  source  TEXT NOT NULL,
  UNIQUE(board, target, role)
);
CREATE INDEX board_memory_board_idx ON board_memory(board, role);

CREATE VIRTUAL TABLE board_fts USING fts5(
  name, full_name, vendor, socs_text, supported_text, targets_text,
  content='board', content_rowid='id',
  tokenize='unicode61 tokenchars ''_-/'''
);

-- ---------------------------------------------------------------- west ------
-- The runner catalogue comes from the tree's own runner classes, so capabilities
-- are whatever this Zephyr implements rather than whatever a table once said.
CREATE TABLE runner (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  module       TEXT NOT NULL,
  description  TEXT,
  -- The RunnerCaps dataclass, verbatim. Held whole because Zephyr adds fields to
  -- it between releases and a fixed column set would silently drop the new ones.
  capabilities TEXT NOT NULL DEFAULT '{}',
  commands     TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE board_runner (
  id            INTEGER PRIMARY KEY,
  board_id      INTEGER NOT NULL REFERENCES board(id),
  runner        TEXT NOT NULL,
  -- Registered on ZEPHYR_RUNNERS by board_finalize_runner_args. A row can exist
  -- without this: upstream names a debug default it never registers on some boards.
  available     INTEGER NOT NULL DEFAULT 0,
  flash_default INTEGER NOT NULL DEFAULT 0,
  debug_default INTEGER NOT NULL DEFAULT 0,
  args          TEXT NOT NULL DEFAULT '[]',
  declared_in   TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX board_runner_board_idx ON board_runner(board_id);
CREATE INDEX board_runner_runner_idx ON board_runner(runner);

CREATE TABLE west_command (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  class_name TEXT NOT NULL DEFAULT '',
  file       TEXT NOT NULL DEFAULT '',
  help       TEXT
);

-- The modules the manifest declares, and how much of each this index actually
-- read. Two questions depend on the distinction and both were answered wrongly
-- without it.
--
-- Zephyr keeps in-tree glue for many modules under modules/, and the shape of
-- the path says who owns the symbols. modules/Kconfig.stm32 is upstream's own
-- file: it declares USE_STM32_HAL_* outright and hal_stm32 ships no Kconfig at
-- all, so nothing outside the tree can ever give those symbols a prompt.
-- modules/lvgl/Kconfig is a directory named after the lvgl module, and it
-- mirrors symbols that the module's own Kconfig declares *with* prompts. Reading
-- only the tree, the mirror looks promptless and an assignment to it looks like
-- an error — which is why glue_dir is stored per module rather than guessed
-- from the modules/ prefix, and why kconfig_ingested records whether the
-- module's own Kconfig was actually read.
CREATE TABLE west_module (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  -- Workspace-relative, as the manifest declares it: modules/hal/stm32.
  path             TEXT NOT NULL DEFAULT '',
  revision         TEXT NOT NULL DEFAULT '',
  -- The single path segment Zephyr's in-tree glue uses for this module, when it
  -- has one: modules/<glue_dir>/Kconfig. Empty when the tree carries no glue
  -- directory for it.
  glue_dir         TEXT NOT NULL DEFAULT '',
  -- 1 when this index evaluated the module's own Kconfig, so prompt status for
  -- its symbols is settled rather than a mirror of it.
  kconfig_ingested INTEGER NOT NULL DEFAULT 0,
  -- 1 when get_source can read files from this module's tree.
  source_ingested  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX west_module_glue_idx ON west_module(glue_dir);

-- ------------------------------------------------------------- samples -----
-- Samples and Twister test suites share one table because upstream validates
-- sample.yaml and testcase.yaml against a single schema; kind keeps them
-- separable for callers who want one or the other.
CREATE TABLE sample (
  id                    INTEGER PRIMARY KEY,
  path                  TEXT NOT NULL UNIQUE,
  kind                  TEXT NOT NULL DEFAULT 'sample' CHECK(kind IN ('sample', 'test')),
  name                  TEXT NOT NULL DEFAULT '',
  description           TEXT NOT NULL DEFAULT '',
  tags                  TEXT NOT NULL DEFAULT '[]',
  tags_text             TEXT NOT NULL DEFAULT '',
  scenarios             TEXT NOT NULL DEFAULT '[]',
  depends_on            TEXT NOT NULL DEFAULT '[]',
  integration_platforms TEXT NOT NULL DEFAULT '[]',
  platform_allow        TEXT NOT NULL DEFAULT '[]',
  files                 TEXT NOT NULL DEFAULT '[]',
  doc_path              TEXT
);
CREATE INDEX sample_kind_idx ON sample(kind);

-- Contents of a sample's small, high-value files (prj.conf, overlays, sources),
-- so the server can hand back a working configuration without needing a
-- Zephyr checkout on the user's machine.
CREATE TABLE sample_file (
  id        INTEGER PRIMARY KEY,
  sample_id INTEGER NOT NULL REFERENCES sample(id),
  path      TEXT NOT NULL,
  text      TEXT NOT NULL
);
CREATE INDEX sample_file_sample_idx ON sample_file(sample_id, path);

-- A suite's own per-board configuration, keyed by the build target its filename
-- resolves to.
--
-- Twister metadata is not the only way upstream names a board. A suite that
-- ships boards/<qualified_target>.overlay configures that exact target, and this
-- is the most directly useful upstream material a board has: ST's SPI loopback
-- overlay for the NUCLEO-N657X0-Q carries the DMA channels, the request numbers
-- and CONFIG_NOCACHE_MEMORY that nobody would guess. Recording only the Twister
-- keys undercounted what names one board by eight suites.
CREATE TABLE sample_board_file (
  id        INTEGER PRIMARY KEY,
  sample_id INTEGER NOT NULL REFERENCES sample(id),
  -- Relative to the sample directory: boards/nucleo_n657x0_q_stm32n657xx_sb.overlay.
  path      TEXT NOT NULL,
  -- Empty when the filename resolves to no board this index knows. The row is
  -- kept anyway: it is still evidence the suite ships per-board configuration.
  board     TEXT NOT NULL DEFAULT '',
  -- The qualified target, when the filename is that target's build string.
  target    TEXT NOT NULL DEFAULT '',
  kind      TEXT NOT NULL DEFAULT 'other'
);
CREATE INDEX sample_board_file_board_idx ON sample_board_file(board, target);
CREATE INDEX sample_board_file_sample_idx ON sample_board_file(sample_id);

CREATE TABLE sample_platform (
  sample_id INTEGER NOT NULL REFERENCES sample(id),
  platform  TEXT NOT NULL,
  evidence  TEXT NOT NULL CHECK(evidence IN ('integration', 'allowlist')),
  PRIMARY KEY(sample_id, platform, evidence)
);
CREATE INDEX sample_platform_lookup_idx ON sample_platform(platform, evidence);

CREATE VIRTUAL TABLE sample_fts USING fts5(
  name, path, description, tags_text,
  content='sample', content_rowid='id',
  tokenize='porter unicode61 tokenchars ''_-/'''
);

-- ----------------------------------------------------------------- api -----
CREATE TABLE api_symbol (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL,
  signature  TEXT NOT NULL DEFAULT '',
  brief      TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT '',
  params     TEXT NOT NULL DEFAULT '[]',
  returns    TEXT NOT NULL DEFAULT '[]',
  retvals    TEXT NOT NULL DEFAULT '[]',
  api_group  TEXT,
  since      TEXT,
  deprecated INTEGER NOT NULL DEFAULT 0,
  header     TEXT NOT NULL,
  line       INTEGER NOT NULL DEFAULT 0,
  doxygen_id TEXT,
  compound_id TEXT,
  doc_anchor TEXT,
  -- The owning symbol's name: for an enumvalue, its enum. compound_id cannot
  -- serve this. In Doxygen XML it names the containing group or file, which
  -- every sibling symbol in that compound shares.
  parent_symbol TEXT
);
CREATE INDEX api_symbol_name_idx ON api_symbol(name);
CREATE INDEX api_symbol_parent_idx ON api_symbol(parent_symbol, header);
CREATE INDEX api_symbol_doxygen_idx ON api_symbol(doxygen_id);
CREATE INDEX api_symbol_group_idx ON api_symbol(api_group);
CREATE INDEX api_symbol_header_idx ON api_symbol(header);

CREATE TABLE api_group (
  id     INTEGER PRIMARY KEY,
  gid    TEXT NOT NULL UNIQUE,
  title  TEXT NOT NULL DEFAULT '',
  parent TEXT,
  header TEXT NOT NULL DEFAULT ''
);

CREATE VIRTUAL TABLE api_fts USING fts5(
  name, brief, detail,
  content='api_symbol', content_rowid='id',
  tokenize='unicode61 tokenchars ''_'''
);
`;

/** Populate the FTS indexes from the base tables, then compact them. */
export const BUILD_FTS = `
INSERT INTO doc_fts(rowid, title, heading_path, body)
  SELECT id, title, heading_path, body FROM doc_chunk;
INSERT INTO kconfig_fts(rowid, name, prompt, help)
  SELECT id, name, prompt, help FROM kconfig;
INSERT INTO dt_fts(rowid, compatible, description, prop_names)
  SELECT id, compatible, description, prop_names FROM dt_binding;
INSERT INTO board_fts(rowid, name, full_name, vendor, socs_text, supported_text, targets_text)
  SELECT id, name, full_name, vendor, socs_text, supported_text, targets_text FROM board;
INSERT INTO sample_fts(rowid, name, path, description, tags_text)
  SELECT id, name, path, description, tags_text FROM sample;
INSERT INTO api_fts(rowid, name, brief, detail)
  SELECT id, name, brief, detail FROM api_symbol;

INSERT INTO doc_fts(doc_fts)         VALUES('optimize');
INSERT INTO kconfig_fts(kconfig_fts) VALUES('optimize');
INSERT INTO dt_fts(dt_fts)           VALUES('optimize');
INSERT INTO board_fts(board_fts)     VALUES('optimize');
INSERT INTO sample_fts(sample_fts)   VALUES('optimize');
INSERT INTO api_fts(api_fts)         VALUES('optimize');
`;
