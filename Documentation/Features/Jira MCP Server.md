---
type: Technical Design
user-guide: "[[Jira MCP Server User Guide]]"
---


## Purpose

Exposes Jira Cloud as an MCP tool server so Claude can create, read, update, and transition issues during development without leaving the editor.

## Location

`mcp-jira/` — Node.js, CommonJS, no external dependencies beyond `@modelcontextprotocol/sdk`.

## Architecture

```
mcp-jira/
├── index.js      # Server bootstrap — wires MCP SDK to lib
├── lib.js        # Tool definitions + handler factory (testable)
└── test/
    └── lib.test.js
```

`lib.js` exports `TOOLS` (tool schema array) and `createHandler(jiraFn)` (returns a tool handler using the injected HTTP function). `index.js` constructs the real `jira()` HTTP function from env vars and passes it to `createHandler`.

## Authentication

Basic auth via Jira API token. Credentials passed as environment variables in `.mcp.json`:

| Variable | Description |
|---|---|
| `JIRA_SITE` | Atlassian subdomain (e.g. `yourname`) |
| `JIRA_EMAIL` | Account email |
| `JIRA_TOKEN` | API token |

## Tools

| Tool | Method | Description |
|---|---|---|
| `jira_get_issue` | GET | Fetch issue by key |
| `jira_search_issues` | POST /search | JQL search |
| `jira_create_issue` | POST | Create issue |
| `jira_update_issue` | PUT | Update summary/description |
| `jira_transition_issue` | POST /transitions | Move to a named status |
| `jira_assign_issue` | PUT /assignee | Assign to account ID |
| `jira_add_comment` | POST /comment | Add comment |

## Jira REST API

Base URL: `https://{JIRA_SITE}.atlassian.net/rest/api/3`

Descriptions use Atlassian Document Format (ADF) for rich text fields.

## Error Handling

All errors are caught and returned as `{ isError: true, content: [{ type: "text", text: "Error: ..." }] }` so the MCP host surfaces them cleanly rather than crashing.
