# Ralph

> **ralph** (rɑːf) — *noun* — A personal AI development workspace; specifically, a VS Code environment where Claude Code is integrated with ServiceNow, Jira and Obsidian), enabling a solo developer to operate well above their pay grade. *"I hardly code these days — I just ralph."*
>
> *verb* (ralphed, ralphing) — *informal* — To rapidly ideate and ship a working feature by describing requirements into an IDE while an AI does the implementation. *"I ralphed up a new ServiceNow application over lunch."*
>
> *acronym* — **R.A.L.P.H.** — Reliably Automating Legacy Project Hassles

---

Ralph is a personal development workspace for VS Code which connects Claude to ServiceNow, Jira and Obsidian.

Ralph is intended for ServiceNow developers wanting to explore project ideas in a ServiceNow Personal Developer Instance, while using strucutured project methodology and coding best practices.

Track your ideas in `Documentation/Ideas/` and Ralph will assist you with analysing the requirements and delivering solutions according to your preferences, while making sure to produce documentation and tests for you along the way.

## Features

### Jira integration
Talk to your Jira backlog directly from VS Code. Create issues, check status, and move tickets through workflows without leaving your editor.

### ServiceNow integration
Query your ServiceNow PDI from the Claude chat — look up records, explore tables, and pull data without navigating the browser UI.

### Igloo
Mirror ServiceNow tables into a local database. Once synced, you can query your SNOW data instantly from the terminal — no network, no rate limits, no waiting.

### Fetch
Pull any script from ServiceNow and drop it straight into your working folder, ready to edit and review in VS Code.

### Slash commands
One-word workflows for the things you do every day — committing, merging, publishing, capturing pages. Describe what you want once; Ralph remembers how to do it.

### PII guardrails
A pre-commit hook that catches sensitive values (instance URLs, credentials, account IDs) before they can accidentally end up in your git history.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Claude Code](https://claude.ai/code) — VSCode extension or desktop app
- **Jira Cloud** — A project with an API token. To create a token: Atlassian account → **Security** → **API tokens** → **Create API token**. Note your subdomain (e.g. `yourname.atlassian.net`), project key, and account ID (found in your Atlassian profile URL).
- **ServiceNow PDI** — A free Personal Developer Instance from [developer.servicenow.com](https://developer.servicenow.com/). Register, request an instance, then create a dedicated service account (e.g. `svc.claude`) with the `snc_readonly` role for read-only access, or `admin` if you want full access.
- [Obsidian](https://obsidian.md/) — optional, but recommended. Download and install, then open the `Documentation/` folder as a vault. No extra plugins are required to get started.

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
```

**`.claude/CLAUDE.local.md`** — tells Claude about your specific instances. Fill in your ServiceNow hostname, Jira subdomain, project key, and account ID.

**`.pii-patterns`** — regex patterns the pre-commit hook scans for. Uncomment and fill in the values that match your setup:

```
yourname                         # Atlassian subdomain
dev123456\.service-now\.com      # ServiceNow PDI hostname
5f1a2b3c4d5e6f7a8b9c0d1e         # Jira account ID (24-char hex)
/yourOSusername/                 # OS username if it appears in paths
```

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

### 7. Load workspace conventions into memory

In the Claude Code chat, run:

```
/setup-memory
```

This reads the workspace conventions from `.claude/CLAUDE.conventions.md` and saves them to Claude's local memory so they persist across sessions. Run this once after first setup, and again if conventions change.

---

## Workspace layout

```
Ralph/
├── .claude/
│   ├── CLAUDE.md                   # Project instructions for Claude (checked in)
│   └── CLAUDE.local.md             # Your instance config (gitignored)
├── mcp-jira/                       # Custom Jira MCP server
├── mcp-snow/                       # Custom ServiceNow MCP server
├── tools/                          # Utility tools (Fetch, Igloo, Snowsync, etc.)
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
