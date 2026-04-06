---
type: User Guide
parent: "[[Ralph User Guide]]"
---
How to add new features to Ralph. Ralph is intentionally extensible — different developers have different workflows, and the structure is designed to accommodate that.

---

## The delivery pattern

Every feature follows the same pattern:

1. **Idea** — create a file in `Documentation/Ideas/` describing what you want and why
2. **Jira** — ask Claude to create a Jira epic or feature to track the work
3. **Feature branch** — Claude creates `feature/<name>` before any code is written
4. **Build** — Claude implements the feature; you review and confirm
5. **Three deliverables** — every feature must have all three before promoting:
   - Technical design in `Documentation/Features/`
   - User guide in `Documentation/Knowledge/`
   - Tests covered by `npm test`
6. **Promote** — run `/promote` to merge to `master` after tests pass
7. **Publish** — run `/publish` to push to GitHub

---

## Types of extension

### Slash commands

Slash commands are Markdown prompt files in `.claude/commands/`. Claude receives the file content as its instructions when you type `/command-name`.

To add one:
1. Create `.claude/commands/<name>.md`
2. Write the prompt — describe what Claude should do step by step
3. Use `$ARGUMENTS` to accept user-supplied input if needed
4. Add the command to `Documentation/Knowledge/Slash Command User Guide.md`
5. Add a design doc entry to `Documentation/Features/Slash Commands.md`

Best for: multi-step workflows that require Claude's judgment, confirmation gates, or decision-making.

### Terminal tools

Terminal tools are Node.js scripts in `tools/` that run directly without Claude. Add a convenience wrapper in `bin/` so users don't need to type the full path.

To add one:
1. Create `tools/<name>/<name>.js` — the main script
2. Create `bin/<name>` (bash) and `bin/<name>.cmd` (Windows) wrapping the script
3. Add a `"<name>": "node <name>/<name>.js"` entry to `tools/package.json`
4. Create `Documentation/Features/<Name>.md` (technical design)
5. Create `Documentation/Knowledge/<Name> User Guide.md`
6. Add tests and register them in the root `package.json` test script
7. Add the tool to `Documentation/Features/Terminal Prompts.md` and `Documentation/Knowledge/Terminal Prompts User Guide.md`

Best for: deterministic operations with known inputs and outputs — fetching data, syncing tables, starting servers.

### MCP tools

MCP tools expose new capabilities to Claude via the Model Context Protocol. Ralph has two MCP servers: `mcp-jira/` and `mcp-snow/`. You can extend either or create a new server.

To add a tool to an existing server:
1. Add a new tool handler in `mcp-jira/index.js` or `mcp-snow/index.js`
2. Add supporting logic in `mcp-jira/lib.js` or `mcp-snow/lib.js`
3. Add tests in the corresponding `test/` folder
4. Document the new capability in the server's design doc and user guide

To add a new MCP server:
1. Create `mcp-<name>/` following the structure of `mcp-jira/` or `mcp-snow/`
2. Register it in `.mcp.json`
3. Create `Documentation/Features/<Name> MCP Server.md` and the corresponding user guide

Best for: capabilities that require Claude to reason about results, decide next steps, or integrate with an external API where the response varies.

---

## Conventions to follow

- Feature branches for all work — never commit directly to `master`
- Every feature needs a design doc, user guide, and tests before promoting
- Sensitive values go in `.secrets` or `.claude/CLAUDE.local.md` — never hardcoded
- Example values in docs use generic placeholders (e.g. `dev123456`, `yourname`)
- Idea files use the naming convention: `Epic, {{title}}` or `Epic, {{ParentTitle}}, {{title}}`
