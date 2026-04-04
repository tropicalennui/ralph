# Ralph

A personal development workspace connecting Claude to ServiceNow, Jira, Obsidian, and other tools. Features are tracked as ideas in `Documentation/Ideas/` and delivered as scoped applications, integrations, and tooling.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Claude Code](https://claude.ai/code) — VSCode extension
- A [Jira Cloud](https://www.atlassian.com/software/jira) account with an API token
- A [ServiceNow PDI](https://developer.servicenow.com/) (Personal Developer Instance) with a service account
- [Obsidian](https://obsidian.md/) — optional, for the Documentation vault

## Setup

### 1. Fork and clone

1. On GitHub, click **Fork** to create your own copy of this repo under your account.
2. In VSCode, open the Command Palette (`Ctrl+Shift+P`) and run **Git: Clone**.
3. Paste your fork URL, choose a local folder, and click **Open** when prompted.

### 2. Install dependencies

Open the integrated terminal (`` Ctrl+` ``) and run:

```bash
cd mcp-jira && npm install && cd ../mcp-snow && npm install && cd ..
```

### 3. Configure git hooks

```bash
git config core.hooksPath .githooks
```

This enables the PII pre-commit guardrail, which prevents sensitive values (instance URLs, account IDs, credentials) from being accidentally committed.

### 4. Copy config files

```bash
cp .claude/CLAUDE.local.md.example .claude/CLAUDE.local.md
cp .pii-patterns.example .pii-patterns
cp .mcp.json.example .mcp.json
```

**`.claude/CLAUDE.local.md`** — tells Claude about your specific instances. Fill in your ServiceNow hostname, Jira subdomain, project key, and account ID.

**`.pii-patterns`** — regex patterns the pre-commit hook scans for. Uncomment and fill in the values that match your setup:

```
yourname                         # Atlassian subdomain
dev123456\.service-now\.com      # ServiceNow PDI hostname
5f1a2b3c4d5e6f7a8b9c0d1e         # Jira account ID (24-char hex)
/yourOSusername/                 # OS username if it appears in paths
```

**`.mcp.json`** — MCP server config pointing to the Jira and ServiceNow servers. No edits needed after copying unless you rename directories.

### 5. Add credentials

Create a `.secrets` file in the repo root (gitignored):

```
JIRA_SITE=yourname.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_TOKEN=<your-jira-api-token>
SNOW_INSTANCE=https://dev123456.service-now.com
SNOW_USER=<your-snow-service-account>
SNOW_PASS=<your-snow-password>
```

To get a Jira API token: go to **Atlassian account settings → Security → API tokens → Create API token**.

### 6. Open in Claude Code

Open the Command Palette and run **Claude Code: Open**. Claude will load `.claude/CLAUDE.md` and `.claude/CLAUDE.local.md` automatically, and the Jira and ServiceNow MCP servers will start on demand.

---

## Workspace layout

```
Ralph/
├── .claude/
│   ├── CLAUDE.md                   # Project instructions for Claude (checked in)
│   └── CLAUDE.local.md             # Your instance config (gitignored)
├── mcp-jira/                       # Custom Jira MCP server
├── mcp-snow/                       # Custom ServiceNow MCP server
├── tools/                          # Utility tools (Yoink, etc.)
└── Documentation/                  # Obsidian vault root
    ├── Features/                   # Technical design documents
    ├── Ideas/                      # Feature ideas and backlog
    └── Knowledge/                  # User guides and clipped content
```

## Gitignored files

These files hold sensitive or machine-specific values and must be created locally after cloning:

| File | Purpose | Template |
|------|---------|----------|
| `.secrets` | API credentials for Jira and ServiceNow | See step 5 above |
| `.claude/CLAUDE.local.md` | Your instance URLs and account IDs | `.claude/CLAUDE.local.md.example` |
| `.pii-patterns` | PII regex patterns for the pre-commit hook | `.pii-patterns.example` |
| `.mcp.json` | MCP server config for Claude Code | `.mcp.json.example` |
