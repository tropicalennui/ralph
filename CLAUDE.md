# ServiceNow–Claude Integration

A collection of ServiceNow scoped applications and tooling enabling Claude to interact with and build on ServiceNow. The first deliverable is **Actual Easy Import** — a catalog item allowing users to import data to any configured table without requiring `import_admin` permissions.

## ServiceNow Instance

- **Instance**: https://devXXXXXX.service-now.com/
- **Type**: Personal Developer Instance (PDI)
- **Region**: Australia

## Workspace Layout

```
ActualEasyImport/
├── CLAUDE.md
├── mcp-jira/        # Custom Jira MCP server
├── mcp-snow/        # Custom ServiceNow MCP server
└── Documentation/   # Obsidian documentation vault
```

### Obsidian Vault

Used for project documentation. Plugins:
- **Templater** — installed
- **Tasks** — intended, not yet installed

## Integrations

- **Jira Cloud** — `tropicalennui.atlassian.net`, project key `AEI`. MCP via custom `mcp-jira` server (`mcp-jira/index.js`). Falls back to REST API if MCP unavailable.
- **ServiceNow REST API** — MCP via custom `mcp-snow` server (`mcp-snow/index.js`). Basic auth with `svc.claude` service account. Credentials in `.mcp.json` (gitignored).

## Jira Conventions

- When completing a Jira issue, always assign it to the user before or during resolution.
- User's Jira account ID: `603c1d6dd4c62100717465df`
- Before starting any feature work, check for an existing Epic or Feature in Jira and capture work under it. Create one if it doesn't exist.
- Use the Jira REST API (`https://tropicalennui.atlassian.net/rest/api/3/`) when MCP tools are unavailable.
- Credentials are in `.mcp.json` (gitignored).

## Git Conventions

- Always check the current branch before starting feature work (`git branch`).
- If on `master`, create a new branch: `git checkout -b feature/<short-description>`.
- If already on a feature branch, ask the user whether to continue in that branch or create a new one.
- Never commit directly to `master`.

## Documentation Conventions

Every feature — new or existing — must have all three:
- A **technical design document** in `Documentation/Design/`
- A **user guide** in `Documentation/Knowledge/User Guides/`
- **Tests** covered by `npm test` at the project root

When building or modifying a feature, create or update all three as part of the same piece of work. Do not consider a feature complete without them. `/promote` enforces this by running tests before merging.

## Project Setup Tasks

- [x] Configure Jira Cloud integration
- [x] Configure ServiceNow API integration
- [ ] Define documentation structure and Obsidian templates

## Key Design Decisions

- **Actual Easy Import**: No `import_admin` requirement — permissions enforced at the target table level
- Delivered as catalog items within scoped apps
