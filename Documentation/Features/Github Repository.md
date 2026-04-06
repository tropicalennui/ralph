---
type: Technical Design
user-guide: "[[Github Repository User Guide]]"
---
## Purpose

Publish the Ralph workspace as a public GitHub repository that others can fork and configure for their own Jira, ServiceNow, and Obsidian instances.

## Sensitive File Strategy

Personal and credential files are gitignored. Each has a committed `.example` counterpart that contains structure and comments but no real values:

| Gitignored | Example | Contents |
|---|---|---|
| `.secrets` | _(documented in README)_ | API credentials |
| `.claude/CLAUDE.local.md` | `.claude/CLAUDE.local.md.example` | Instance URLs, account IDs |
| `.pii-patterns` | `.pii-patterns.example` | PII regex patterns |
| `.mcp.json` | `.mcp.json.example` | MCP server config |
| `Documentation/Ideas/` | — | Personal idea backlog |

## PII Enforcement

The `.githooks/pre-commit` hook (see [[PII Guardrails]]) scans staged content against user-defined patterns before allowing commits. This is the primary defence against accidental credential exposure.

## Publishing

The `/publish` slash command pushes the current state of `master` to the GitHub remote. See [[Slash Commands]] for implementation details.

## Testing

No automated tests. This is a configuration and convention feature. The PII pre-commit hook (see [[PII Guardrails]]) is the primary enforcement mechanism and is manually verified.

## Branch Convention

- `master` is the published branch
- All work happens on `feature/*` branches
- Merges to `master` are done via `/promote`, which runs tests first
