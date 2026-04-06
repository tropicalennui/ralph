---
type: User Guide
parent: "[[User Guides]]"
---
## Overview

Ralph is a personal Claude Code workspace. Once set up, you interact with it entirely through Claude Code — asking Claude to work with Jira issues, query ServiceNow, clip web pages, or run workspace commands.

## Getting Started

See the README in the repo root for initial setup: forking, cloning, installing dependencies, configuring git hooks, and adding credentials.

## Working with Claude

Open the project in VS Code with the Claude Code extension active. Claude automatically loads `.claude/CLAUDE.md` (project conventions) and `.claude/CLAUDE.local.md` (your instance details).

From there you can:
- Ask Claude to look up or create Jira issues — the Jira MCP server handles this
- Ask Claude to query ServiceNow tables — the ServiceNow MCP server handles this
- Run `npm run yoink:start` in the terminal to start the Yoink server and clip web pages into the vault
- Run `/promote` to merge a feature branch into master after tests pass
- Run `/publish` to push master to GitHub

## Adding a New Feature

1. Create an Idea in `Documentation/Ideas/` using the Idea template
2. Ask Claude to check for an existing Jira epic or create one when ready
3. Create a feature branch: `git checkout -b feature/<name>`
4. Build the feature with Claude
5. Ensure a design doc and user guide exist before promoting
6. Run `/promote` to merge, then `/publish` to push
