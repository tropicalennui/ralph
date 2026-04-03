# Ralph

A personal development workspace connecting Claude to ServiceNow, Jira, Obsidian, and other tools. Features are tracked as ideas in `Documentation/Ideas/` and delivered as scoped applications, integrations, and tooling.

## Workspace Layout

```
Ralph/
├── CLAUDE.md
├── CLAUDE.local.md  # Local instance config (gitignored — see CLAUDE.local.md.example)
├── mcp-jira/        # Custom Jira MCP server
├── mcp-snow/        # Custom ServiceNow MCP server
├── tools/           # Utility tools (page capture, etc.)
└── Documentation/   # Obsidian vault root
```

### Obsidian Vault

The vault root is the `Documentation/` folder. Plugins:
- **Templater** — installed
- **Tasks** — intended, not yet installed

## Integrations

- **Jira Cloud** — MCP via custom `mcp-jira` server (`mcp-jira/index.js`). Falls back to REST API if MCP unavailable. Instance details in `CLAUDE.local.md`.
- **ServiceNow REST API** — MCP via custom `mcp-snow` server (`mcp-snow/index.js`). Basic auth with `svc.claude` service account. Credentials in `.mcp.json` (gitignored). Instance details in `CLAUDE.local.md`.

## Jira Conventions

- When completing a Jira issue, always assign it to the user before or during resolution.
- Before starting any feature work, check for an existing Epic or Feature in Jira and capture work under it. Create one if it doesn't exist.
- Use the Jira REST API when MCP tools are unavailable.
- Credentials are in `.mcp.json` (gitignored). Instance URL and account ID are in `CLAUDE.local.md`.

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

## First-Time Setup

After cloning, run once:

```bash
git config core.hooksPath .githooks
cp CLAUDE.local.md.example CLAUDE.local.md
cp .pii-patterns.example .pii-patterns
```

Then fill in `CLAUDE.local.md` and `.pii-patterns` with your instance-specific values.

## Project Setup Tasks

- [x] Configure Jira Cloud integration
- [x] Configure ServiceNow API integration
- [ ] Define documentation structure and Obsidian templates

