---
type: Technical Design
user-guide: "[[getscript User Guide]]"
---
Fetches a script field from any ServiceNow table and saves it as a `.js` file in the local `WIP/` folder.

---

## Problem Statement

ServiceNow scripts (business rules, script includes, UI actions, etc.) are edited and stored in the instance. To work on them locally — in a proper editor with syntax highlighting, version control, and search — they need to be pulled down to the filesystem. Navigating the instance UI to copy-paste script content is slow and error-prone.

---

## Architecture Overview

```
[VSCode Terminal]
    │  node tools/getscript/getscript.js <table> <name>
    ▼
[getscript.js]
    │  Look up script field name → ralph.db (script_fields)
    │  Check for cached content  → ralph.db (script_cache)
    │  If not cached: GET /api/now/table/<table>?sysparm_query=name=<name>
    ▼
[ServiceNow Table REST API]
    │  Returns record JSON
    ▼
[getscript.js]
    │  Store content → ralph.db (script_cache)
    │  Write file → WIP/<table>_<name>.js
    ▼
[WIP/ folder]
```

---

## Components

### 1. getscript.js

**Location:** `tools/getscript/getscript.js`

The CLI entry point. Reads credentials from `.secrets`, resolves the correct script field via the DB, checks the cache, fetches from SNOW if needed, and writes the output file.

**Arguments:**

| Argument | Required | Description |
|---|---|---|
| `<table>` | Yes | ServiceNow table name (e.g. `sys_script_include`) |
| `<name>` | Yes | Value of the record's `name` field |
| `--fresh` | No | Bypass cache and re-fetch from SNOW |
| `--field <name>` | No | Explicitly specify which script field to use |

**Field resolution logic:**
1. If `--field` is provided, use it directly
2. If the table has exactly one script field in the DB, use that
3. If the table has multiple script fields and one is literally named `script`, use that as the default
4. If the table has multiple fields and none is named `script`, exit with an error listing the options

**Output filename:** `WIP/<table>_<name>.js`
Special characters in `<name>` are replaced with `_`.

---

### 2. db.js

**Location:** `tools/db.js`

Shared DuckDB connection module used by all tools under `tools/`. Opens `ralph.db` at the repo root, runs schema migrations on first connection, and exposes `getConnection()` / `close()`.

**Schema:**

```sql
-- Script field definitions from sys_dictionary
CREATE TABLE script_fields (
  table_name VARCHAR NOT NULL,
  field_name VARCHAR NOT NULL,
  field_type VARCHAR,
  PRIMARY KEY (table_name, field_name)
);

-- Cached script content fetched from SNOW
CREATE TABLE script_cache (
  table_name  VARCHAR NOT NULL,
  record_name VARCHAR NOT NULL,
  field_name  VARCHAR NOT NULL,
  sys_id      VARCHAR,
  content     VARCHAR,
  fetched_at  TIMESTAMP DEFAULT current_timestamp,
  PRIMARY KEY (table_name, record_name, field_name)
);
```

---

### 3. seed-script-fields.js

**Location:** `tools/getscript/seed-script-fields.js`

One-time (and refresh) script that populates the `script_fields` table from a raw MCP tool result file. The input is the JSON output from querying `sys_dictionary` where `internal_type.label LIKE Script`.

The seed query used to generate the source data:
```
table: sys_dictionary
query: internal_type.labelLIKEScript^active=true^nameNOT LIKEv_^elementISNOTEMPTY
fields: name, element, internal_type.label
limit: 500
```

On the current PDI this yields 453 records across 309 tables.

---

### 4. ralph.db

**Location:** repo root (gitignored)

DuckDB database file. Stores `script_fields` (static reference data) and `script_cache` (fetched script content). Can be queried directly with the DuckDB CLI:

```bash
duckdb ralph.db "SELECT * FROM script_fields WHERE table_name = 'sys_ui_action'"
duckdb ralph.db "SELECT table_name, record_name, fetched_at FROM script_cache ORDER BY fetched_at DESC"
```

---

## Data Flow

```
.secrets → credentials
ralph.db (script_fields) → field name for table
ralph.db (script_cache) → cached content (if present and --fresh not set)
    ↓ (cache miss)
SNOW Table API → record JSON
    ↓
ralph.db (script_cache) → upsert
WIP/<table>_<name>.js → written to disk
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `@duckdb/node-api` | DuckDB Node.js driver (official, async) |

No other runtime dependencies. Node.js built-ins only (`fs`, `path`).

---

## Limitations & Known Constraints

| Constraint | Detail |
|---|---|
| Name field only | Queries by `name=<value>`. Tables that identify records differently (e.g. `short_description`) are not supported. |
| First match only | If multiple records share the same `name`, the first is used. |
| No push/write-back | `getscript` is read-only. There is no `putscript` to write local changes back to SNOW. |
| Cache staleness | Cached content reflects what was in SNOW at `fetched_at`. Use `--fresh` to get current content. |
| script_fields seeding | If new script-type fields are added to the instance, the DB must be re-seeded manually. |