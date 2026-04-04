---
type: Technical Design
user-guide: "[[Ralph User Guide]]"
---
## Purpose

Ralph is a personal Claude Code workspace that connects Claude to external tools and services — ServiceNow, Jira, Obsidian, and others — via MCP servers, slash commands, and documentation conventions.

## Architecture

```
Ralph/
├── .claude/
│   ├── CLAUDE.md          # Project instructions loaded by Claude automatically
│   └── CLAUDE.local.md    # Instance-specific config (gitignored)
├── mcp-jira/              # Custom Jira MCP server (Node.js)
├── mcp-snow/              # Custom ServiceNow MCP server (Node.js)
├── tools/                 # Utility tools (Yoink server, etc.)
├── .githooks/             # Git hooks (PII pre-commit check)
└── Documentation/         # Obsidian vault
    ├── Features/          # Technical design documents
    ├── Ideas/             # Personal feature backlog (gitignored)
    └── Knowledge/         # User guides and clipped content
```

## Key Integrations

| Integration | Mechanism | Design Doc |
|---|---|---|
| Jira | MCP server (`mcp-jira/`) | [[Jira MCP Server]] |
| ServiceNow | MCP server (`mcp-snow/`) | [[ServiceNow MCP Server]] |
| Yoink | Edge extension + Node server | [[Yoink]] |
| Slash commands | `.claude/commands/*.md` | [[Slash Commands]] |
| PII guardrails | `.githooks/pre-commit` | [[PII Guardrails]] |
| Documentation | Obsidian vault | [[Obsidian Integration]] |
| GitHub | `/publish` command | [[Github Repository]] |

## Conventions

- All features start as an Idea in `Documentation/Ideas/`
- Every feature requires a design doc, a user guide, and tests before being considered complete
- Sensitive config is gitignored; `.example` files are provided for each
- Work happens on `feature/*` branches; `master` is the published branch
