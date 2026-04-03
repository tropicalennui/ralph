---
type: Technical Design
user-guide: "[[Slash Command User Guide|Slash Command User Guide]]"
---
## Purpose

Custom slash commands that extend Claude Code with workspace-specific workflows. Defined as Markdown prompt files in `.claude/commands/` and invoked by typing `/command-name` in the Claude Code chat.

## Location

`.claude/commands/` — one `.md` file per command.

## Commands

### `/catch`

**File:** `.claude/commands/catch.md`

Manages the page capture server (`tools/page-capture/server/server.js`).

| Argument | Action |
|---|---|
| `start` | Starts the server in the background, writes PID to `/tmp/catch-server.pid`, logs to `/tmp/catch-server.log` |
| `stop` | Kills the process via saved PID, falls back to killing by port 3737 if no PID file exists |

The server listens on `http://127.0.0.1:3737`. The command is a convenience wrapper — the server can also be started manually via `cd tools/page-capture/server && node server.js`.

**Note:** `/catch` does not work in the VS Code extension context (no background process support). Use the terminal directly there.

### `/promote`

**File:** `.claude/commands/promote.md`

Promotes the current feature branch to `master` via a structured, gated workflow.

Steps executed in order:

1. **Guard** — refuses to run on `master` directly
2. **Uncommitted changes** — diffs, proposes a commit message, waits for user confirmation before committing
3. **Tests** — runs `npm test`; stops and reports if any tests fail
4. **Merge** — `git merge --no-ff` into `master`
5. **Report** — prints the merge commit SHA and cleanup instructions

The commit is co-authored by Claude (`Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`).

### `/publish`

**File:** `.claude/commands/publish.md`

Pushes `master` to `origin` on GitHub. Intended to be run after `/promote`.

Steps executed in order:

1. **Guard** — refuses to run unless on `master`
2. **Remote check** — verifies `origin` is configured
3. **Unpushed commits** — lists commits not yet on remote, asks for confirmation before pushing
4. **Push** — `git push origin master`; stops and reports on failure, never force-pushes
5. **Report** — prints commit count, HEAD SHA, and remote URL

## Adding New Commands

1. Create `.claude/commands/<name>.md`
2. Write the command prompt — Claude receives the file content as its instructions
3. Use `$ARGUMENTS` to accept user-supplied arguments
4. Add the command to the user guide at `Documentation/Knowledge/User Guides/Slash Commands.md`
