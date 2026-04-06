---
type: Technical Design
user-guide: "[[Igloo User Guide]]"
---
Mirrors ServiceNow tables into a local DuckDB database (`snow.db`), enabling fast offline queries and local analysis of SNOW data.

---

## Problem Statement

Querying ServiceNow via the REST API is slow, requires a network connection, and is subject to rate limits. Many use cases (reporting, cross-table joins, local analysis) would benefit from having SNOW data available locally. Igloo addresses this by maintaining a local mirror that is incrementally updated — inserting new records, updating changed ones, skipping unchanged ones, and soft-deleting records that no longer exist in SNOW.

---

## Architecture Overview

```
[VSCode Terminal]
    │  snowsync [table]
    ▼
[snowsync.js]
    │  Read snowdb.config.yaml
    │  For each table:
    │    Query sys_db_object → inheritance chain
    │    Query sys_dictionary → full field schema
    │    Ensure table exists in snow.db
    │    GET /api/now/table/<table>?sysparm_display_value=all (paginated)
    │    Compare sys_updated_on → insert / update / skip / soft-delete
    ▼
[snow.db (DuckDB)]
```

---

## Components

### 1. snowsync.js

**Location:** `tools/snowsync/snowsync.js`

The CLI entry point. Reads config and credentials, opens `snow.db`, and runs the sync loop.

**Arguments:**

| Argument | Description |
|---|---|
| *(none)* | Sync all tables in `snowdb.config.yaml` |
| `<table>` | Sync only the named table (must be in config) |
| `--help` | Show usage |

**Sync logic per table:**
1. Fetch schema (via `schema.js`) — includes inherited fields
2. Filter to configured `fields` list (if any); always include `sys_id` and `sys_updated_on`
3. Expand reference fields into two columns: `fieldname` + `fieldname_dv`
4. Ensure table and columns exist in `snow.db` (create/alter as needed)
5. Fetch all matching records from SNOW (paginated, `sysparm_display_value=all`)
6. Load existing `(sys_id, sys_updated_on, _deleted)` from `snow.db`
7. Insert new, update changed (or un-delete), skip unchanged
8. Soft-delete records not returned by SNOW

**Output per table:**
```
Syncing sys_script_include... +12 ~3 =47 -1  (62 from SNOW)
```
`+` = inserted, `~` = updated, `=` = skipped, `-` = soft-deleted

---

### 2. schema.js

**Location:** `tools/snowsync/schema.js`

Resolves the complete field schema for a table, including inherited fields from parent tables.

**Steps:**
1. Walk `sys_db_object.super_class` chain to get the full inheritance hierarchy
2. Query `sys_dictionary` for all tables in the hierarchy in a single request
3. Merge fields (child table definitions override parent definitions)

**Type mapping:**

| SNOW internal_type | DuckDB type |
|---|---|
| boolean | BOOLEAN |
| integer | INTEGER |
| float / decimal / currency | DOUBLE |
| glide_date_time | TIMESTAMP |
| glide_date | DATE |
| reference | VARCHAR |
| *(anything else)* | VARCHAR |

`sys_updated_on` is always stored as `VARCHAR` regardless of type, for reliable string comparison.

---

### 3. snowdb.js

**Location:** `tools/snowsync/snowdb.js`

Manages the `snow.db` DuckDB connection and dynamic table creation.

**`ensureTable(conn, tableName, columns)`**

Creates the table if it doesn't exist:
```sql
CREATE TABLE IF NOT EXISTS "<table>" (
    instance    VARCHAR   NOT NULL,
    sys_id      VARCHAR   NOT NULL,
    <field>     <type>,
    ...
    <field_dv>  VARCHAR,      -- for each reference field
    _deleted    BOOLEAN   DEFAULT FALSE,
    _deleted_at TIMESTAMP,
    PRIMARY KEY (instance, sys_id)
);
```

If the table already exists, checks `information_schema.columns` and issues `ALTER TABLE ADD COLUMN` for any missing columns.

---

### 4. snowdb.config.yaml

**Location:** repo root

Configuration file specifying which tables to sync.

```yaml
tables:
  - name: sys_script_include         # sync all fields, no filter

  - name: sys_ui_action
    query: "active=true"             # SNOW encoded query

  - name: incident
    query: "active=true"
    fields:                          # explicit field list
      - number
      - short_description
      - state
      - assigned_to
```

---

### 5. snow.db

**Location:** repo root (gitignored)

DuckDB database file. One table per synced SNOW table. Can be queried directly:

```bash
duckdb snow.db "SELECT name, sys_updated_on FROM sys_script_include WHERE _deleted = false ORDER BY sys_updated_on DESC"
duckdb snow.db ".tables"
duckdb snow.db "DESCRIBE sys_script_include"
```

---

## Data Model

Every mirrored table has this shape:

| Column | Type | Notes |
|---|---|---|
| `instance` | VARCHAR | Hostname prefix, e.g. `dev123456` |
| `sys_id` | VARCHAR | SNOW record sys_id |
| *(schema fields)* | *(mapped)* | One column per SNOW field |
| `<ref>_dv` | VARCHAR | Display value for each reference field |
| `_deleted` | BOOLEAN | TRUE if no longer returned by SNOW |
| `_deleted_at` | TIMESTAMP | When the soft-delete was recorded |

Primary key: `(instance, sys_id)` — supports multi-instance use.

---

## Dependencies

| Package | Purpose |
|---|---|
| `@duckdb/node-api` | DuckDB Node.js driver (shared with getscript) |
| `js-yaml` | Parse `snowdb.config.yaml` |

No other runtime dependencies.

---

## Testing

**Location:** `tools/snowsync/test/lib.test.js`  
**Run:** `npm test` from the repo root

Pure functions are extracted into `tools/snowsync/lib.js` and tested without DuckDB or network dependencies.

| Suite | What's covered |
|---|---|
| `mapSnowType` | All SNOW internal types mapped to correct DuckDB types; unknown types fall back to VARCHAR; `sys_updated_on` forced to VARCHAR regardless of type |
| `val` | Extracts `.value` from `{value, display_value}` objects; returns null for empty string; passes scalars through; returns null for null |
| `dv` | Extracts `.display_value` from objects; falls back to `.value` when absent; passes scalars through; returns null for null |
| `classifyRecord` | Returns `insert` when no prior row; returns `skip` when `sys_updated_on` matches and not deleted; returns `update` when timestamp differs; returns `update` when soft-deleted (un-deletion) |
| `buildValues` | Extracts `val()` for regular columns; extracts `dv()` for `_dv` columns; handles mixed column lists; returns null for missing fields |

## Limitations

| Constraint | Detail |
|---|---|
| No push/write-back | Igloo is read-only. It never writes to SNOW. |
| Soft-delete only | Records removed from SNOW are flagged `_deleted = TRUE`, never physically deleted. |
| sys_updated_on granularity | Change detection relies on `sys_updated_on`. Records with the same timestamp are treated as unchanged even if content differs. |
| Large tables | Tables with tens of thousands of records will be slow on first sync. Subsequent runs are fast (only changed records are updated). |
