---
type: User Guide
feature: "[[Terminal Prompts]]"
---
Quick reference for CLI tools that run directly in the VS Code terminal. These don't need Claude — just run them.

---

## Fetch

Fetch a script from ServiceNow and save it to `WIP/`.

```bash
node tools/fetch/fetch.js <table> <name>
```

```bash
# Examples
node tools/fetch/fetch.js sys_script_include "GlideViewManager"
node tools/fetch/fetch.js sys_ui_action "My UI Action" --field client_script_v2
node tools/fetch/fetch.js sys_script_include "GlideViewManager" --fresh
```

Output is saved to `WIP/<table>_<name>.js`. See [[Fetch User Guide]] for flags and caching details.

---

## Igloo (snowsync)

Mirror ServiceNow tables into a local DuckDB database.

```bash
# Sync all configured tables
node tools/snowsync/snowsync.js

# Sync a single table
node tools/snowsync/snowsync.js sys_script_include
```

Tables are configured in `snowdb.config.yaml` at the repo root. See [[Igloo User Guide]] for configuration and query examples.

---

## Querying local databases

Both tools use DuckDB databases at the repo root.

```bash
# ralph.db — getscript cache
duckdb ralph.db "SELECT table_name, record_name, fetched_at FROM script_cache ORDER BY fetched_at DESC"

# snow.db — Igloo mirror
duckdb snow.db ".tables"
duckdb snow.db "SELECT name, sys_updated_on FROM sys_script_include WHERE _deleted = false ORDER BY sys_updated_on DESC LIMIT 20"
```
