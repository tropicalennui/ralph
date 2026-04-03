# ServiceNow MCP Server — User Guide

The ServiceNow MCP server gives Claude the ability to read and write records on the PDI during development, without needing to use the ServiceNow UI or write background scripts for simple queries.

## Available Actions

| What you can ask | Tool used |
|---|---|
| "Query all active incidents" | `snow_query_records` |
| "Get the record with sys_id abc123 from sc_cat_item" | `snow_get_record` |
| "Create a new record in u_my_table" | `snow_create_record` |
| "Update the short_description on incident sys_id xyz" | `snow_update_record` |
| "Delete the test record with sys_id abc from u_my_table" | `snow_delete_record` |
| "What fields does the sc_cat_item table have?" | `snow_get_schema` |

## Querying Records

Queries use ServiceNow's encoded query format, the same syntax used in list views and the Condition Builder:

```
active=true^category=software
short_descriptionCONTAINSemail
```

Fields are specified as comma-separated API names (not display labels):
```
number,short_description,assigned_to
```

## Setup

Credentials (`SNOW_INSTANCE`, `SNOW_USER`, `SNOW_PASS`) are stored in `.mcp.json` (gitignored).

When setting up a new PDI, follow [First time setup](../First time setup.md) to create the `svc.claude` service account, then update `.mcp.json` with the new instance hostname and password.
