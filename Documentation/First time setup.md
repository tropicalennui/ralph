---
type: User Guide
---
# Steps

1. Log on as system administrator, elevate to security admin, and create user accounts by running [create_users.js](create_users.js) as a background script (**System Definition > Scripts - Background**)
2. Navigate to `sys_user.list` and set passwords for `svc.claude` and `rosemary`
3. Update `.secrets` with the instance hostname, `svc.claude` username and password
4. Update `SNOW_INSTANCE` in `.mcp.json` to the new hostname
5. Reload the VS Code workspace to pick up the new MCP config

| User ID    | Roles                   |
| ---------- | ----------------------- |
| <your__id> | admin<br>security_admin |
| svc.claude | admin<br>snc_readonly   |

## Create the ServiceNow Application

1. Navigate to **ServiceNow Studio**
2. Create a new application: `Claude-Integration`