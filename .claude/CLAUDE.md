# Ralph

A personal development workspace connecting Claude to ServiceNow, Jira, Obsidian, and other tools. Features are tracked as ideas in `Documentation/Ideas/` and delivered as scoped applications, integrations, and tooling.

## Workspace Layout

```
Ralph/
├── .claude/
│   ├── CLAUDE.md              # Project instructions for Claude (checked in)
│   ├── CLAUDE.conventions.md  # Workspace conventions — run /setup-memory on first use
│   └── CLAUDE.local.md        # Local instance config (gitignored — see CLAUDE.local.md.example)
├── mcp-jira/             # Custom Jira MCP server
├── mcp-snow/             # Custom ServiceNow MCP server
├── tools/                # Utility tools (Yoink, etc.)
└── Documentation/        # Obsidian vault root
```

### Obsidian Vault

The vault root is the `Documentation/` folder. Plugins:
- **Templater** — installed. Templates in `Documentation/zTemplates/`. Folder template auto-applies to `Ideas/`.
- **Tasks** — installed. Format: Dataview. Custom statuses: `/` = In Progress, `-` = Cancelled.
- **Dataview** — installed.

## Integrations

- **Jira Cloud** — MCP via custom `mcp-jira` server (`mcp-jira/index.js`). Falls back to REST API if MCP unavailable. Instance details in `.claude/CLAUDE.local.md`.
- **ServiceNow REST API** — MCP via custom `mcp-snow` server (`mcp-snow/index.js`). Basic auth with `svc.claude` service account. Credentials in `.secrets` (gitignored). Instance details in `.claude/CLAUDE.local.md`.

## First-Time Setup

After cloning, run once:

```bash
git config core.hooksPath .githooks
cp .claude/CLAUDE.local.md.example .claude/CLAUDE.local.md
cp .pii-patterns.example .pii-patterns
```

Then fill in `.claude/CLAUDE.local.md` and `.pii-patterns` with your instance-specific values. Then run `/setup-memory` in Claude Code to load workspace conventions into local memory.

## Project Setup Tasks

- [x] Configure Jira Cloud integration
- [x] Configure ServiceNow API integration
- [x] Define documentation structure and Obsidian templates
