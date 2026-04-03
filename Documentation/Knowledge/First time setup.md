---
Instance Name: https://devXXXXXX.service-now.com
---
# Steps
1. Logon as system administrator, elevate to security admin, and create user accounts by running [create_users.js](create_users.js) as a background script (System Definition > Scripts - Background)
2. Navigate to sys_user.list and set passwords for `svc.claude` and `rosemary`
	1. todo - update script - claude needs to be setup with identity type machine and internal integration user ticked
3. Update the password for `svc.claude` in .secrets

- [ ] figure out how to setup the api authentication by doing the training on developer.servicenow.com

| User ID    | Roles                   |
| ---------- | ----------------------- |
| rosemary   | admin<br>security_admin |
| svc.claude | admin<br>snc_readonly   |

## Verify API Access

### Step 1 - Create a new application
1. Navigate to `ServiceNow Studio`
2. Create a new application `Claude-Integration`
