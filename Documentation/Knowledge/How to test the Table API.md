---
type: User Guide
parent: "[[User Guides]]"
---
1. Open **System Web Services > REST > REST API Explorer**
2. Configure a GET request: method = **Retrieve records from a table (GET)**, tableName = **incident**
3. Add query parameters:
   - `sysparm_query`: paste an encoded query (e.g. from the Condition Builder on the Incidents list)
   - `sysparm_display_value`: `true`
   - `sysparm_limit`: `10`
   - `sysparm_fields`: Number, Caller, Short description, Priority
4. Click **Send** and verify a **200** response

#### Debugging with session headers

1. Keep the REST API Explorer open with the request from Exercise 1
2. Scroll to **Request headers** and click **Add header**:
   - Name: `X-WantSessionDebugMessages`, Value: `true`
3. Enable **System Diagnostics > Session Debug > Debug SQL**
4. Click **Send** and inspect the `session` object in the response body
5. Disable all debugging, then re-enable with **Debug Security** and send again — ACL evaluation will appear in the `session` object
6. Disable all debugging when done: **System Diagnostics > Session Debug > Disable All**