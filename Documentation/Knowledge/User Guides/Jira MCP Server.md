---
type: User Guide
---
The Jira MCP server gives Claude the ability to manage issues in the **ServiceNow-Claude Integration** Jira project (key: `AEI`) directly from the editor.

## Available Actions

| What you can ask | Tool used |
|---|---|
| "Get details of AEI-5" | `jira_get_issue` |
| "Search for open stories in AEI" | `jira_search_issues` |
| "Create a story for X under epic AEI-3" | `jira_create_issue` |
| "Update the summary of AEI-10" | `jira_update_issue` |
| "Mark AEI-10 as Done" | `jira_transition_issue` |
| "Assign AEI-5 to me" | `jira_assign_issue` |
| "Add a comment to AEI-3" | `jira_add_comment` |

## Conventions

- Issues are always assigned to the user when completed.
- Feature work is captured under an existing Epic before starting. If no suitable Epic exists, one is created first.
- Issue types used: Epic, Story, Task, Bug.

## Setup

Credentials are stored in `.mcp.json` (gitignored). If setting up on a new machine, copy `.mcp.json` from a working environment or create it from `.secrets`.

If the MCP server fails to load, Claude falls back to the Jira REST API directly:
`https://tropicalennui.atlassian.net/rest/api/3/`
