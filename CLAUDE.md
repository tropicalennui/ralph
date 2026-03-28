# Actual Easy Import

A ServiceNow scoped application providing a catalog item that allows users to import data to any configured table without requiring `import_admin` permissions. Users only need their own table-level permissions to use it.

## ServiceNow Instance

- **Instance**: https://devXXXXXX.service-now.com/
- **Type**: Personal Developer Instance (PDI)
- **Region**: Australia

## Workspace Layout

```
ActualEasyImport/
├── CLAUDE.md
└── Vault/               # Obsidian documentation vault
```

### Obsidian Vault

Used for project documentation. Plugins:
- **Templater** — installed
- **Tasks** — intended, not yet installed

## Integrations

- **Jira Cloud** — `tropicalennui.atlassian.net`, project key `AEI`. MCP via official Atlassian Rovo server (`.mcp.json`). Falls back to REST API if MCP unavailable.
- **ServiceNow REST API** — for interacting with the dev instance during build. Setup pending.

## Jira Conventions

- When completing a Jira issue, always assign it to the user before or during resolution.
- User's Jira account ID: `603c1d6dd4c62100717465df`
- Use the Jira REST API (`https://tropicalennui.atlassian.net/rest/api/3/`) when MCP tools are unavailable.
- Credentials are in `.mcp.json` (gitignored).

## Project Setup Tasks

- [x] Configure Jira Cloud integration
- [ ] Configure ServiceNow API integration
- [ ] Define documentation structure and Obsidian templates

## Key Design Decisions

- No `import_admin` requirement — permissions enforced at the target table level
- Delivered as a catalog item within a scoped app
