---
type: User Guide
parent: "[[Ralph User Guide]]"
---

`getscript` pulls a script from any ServiceNow table and saves it as a `.js` file in the `WIP/` folder at the repo root. Run it from the VSCode terminal.

## Basic usage

```bash
node tools/getscript/getscript.js <table> <name>
```

**Examples:**

```bash
# Fetch a Script Include
node tools/getscript/getscript.js sys_script_include "GlideViewManager"

# Fetch a Business Rule
node tools/getscript/getscript.js sys_script "My Business Rule"

# Fetch a UI Action
node tools/getscript/getscript.js sys_ui_action "My UI Action"
```

Output is saved to `WIP/<table>_<name>.js`. The `WIP/` folder is gitignored.

## Flags

| Flag | Description |
|---|---|
| `--fresh` | Re-fetch from ServiceNow even if a cached copy exists |
| `--field <fieldname>` | Specify which script field to use (required when a table has more than one) |

## Tables with multiple script fields

Some tables have more than one script field (e.g. `sys_ui_action` has `script` and `client_script_v2`). If you don't specify `--field`, the tool defaults to the field named `script`. If there is no field named `script`, it will tell you the options:

```bash
node tools/getscript/getscript.js sys_ui_action "My Action" --field client_script_v2
```

## Caching

Fetched scripts are cached in `ralph.db`. The second time you run the same command, it serves from cache without hitting SNOW. Use `--fresh` to bypass this.

To see what's cached:
```bash
duckdb ralph.db "SELECT table_name, record_name, fetched_at FROM script_cache ORDER BY fetched_at DESC"
```

## Re-seeding the script field map

The tool knows which field is the "script field" for each table via a local lookup in `ralph.db`. If new script-type fields are added to the instance, re-seed by running a fresh `sys_dictionary` query via MCP and passing the result file to:

```bash
node tools/getscript/seed-script-fields.js <path-to-result-file>
```