# ServiceNow MCP Server — Technical Design

## Purpose

Exposes the ServiceNow Table API as an MCP tool server so Claude can query and modify records on the PDI during development.

## Location

`mcp-snow/` — Node.js, CommonJS, no external dependencies beyond `@modelcontextprotocol/sdk`.

## Architecture

```
mcp-snow/
├── index.js      # Server bootstrap — wires MCP SDK to lib
├── lib.js        # Tool definitions + handler factory (testable)
└── test/
    └── lib.test.js
```

Same pattern as `mcp-jira`: `lib.js` exports `TOOLS` and `createHandler(snowFn)`. `index.js` constructs the real `snow()` HTTP function from env vars.

## Authentication

Basic auth with a dedicated service account. Credentials in `.mcp.json`:

| Variable | Description |
|---|---|
| `SNOW_INSTANCE` | PDI hostname (e.g. `devXXXXXX.service-now.com`) |
| `SNOW_USER` | Service account username (e.g. `svc.claude`) |
| `SNOW_PASS` | Service account password |

The service account (`svc.claude`) is configured with:
- `identity_type = machine`
- `internal_integration_user = true`
- Roles: `admin`, `snc_readonly`

## Tools

| Tool | Method | Description |
|---|---|---|
| `snow_query_records` | GET /table/{table} | Query records with encoded query |
| `snow_get_record` | GET /table/{table}/{sys_id} | Fetch single record |
| `snow_create_record` | POST /table/{table} | Create a record |
| `snow_update_record` | PATCH /table/{table}/{sys_id} | Update a record |
| `snow_delete_record` | DELETE /table/{table}/{sys_id} | Delete a record |
| `snow_get_schema` | GET /table/sys_dictionary | Get field definitions for a table |

## ServiceNow REST API

Base URL: `https://{SNOW_INSTANCE}/api/now`

Uses `sysparm_display_value=false` by default to return raw values rather than display values.

## Error Handling

All errors caught and returned as `{ isError: true }` MCP responses. ServiceNow error messages are extracted from `error.message` or `error.detail` in the response body.
