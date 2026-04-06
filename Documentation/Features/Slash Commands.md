---
type: Technical Design
user-guide: "[[Slash Command User Guide|Slash Command User Guide]]"
---
## Purpose

Custom slash commands that extend Claude Code with workspace-specific workflows. Defined as Markdown prompt files in `.claude/commands/` and invoked by typing `/command-name` in the Claude Code chat.

## Location

`.claude/commands/` — one `.md` file per command.

## Commands

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

## Testing

No automated tests. Slash commands are Markdown prompt files interpreted by Claude at runtime — there is no executable code to unit test. Manual testing: invoke the command in Claude Code and verify it follows the documented steps correctly.

## Adding New Commands

1. Create `.claude/commands/<name>.md`
2. Write the command prompt — Claude receives the file content as its instructions
3. Use `$ARGUMENTS` to accept user-supplied arguments
4. Add the command to the user guide at `Documentation/Knowledge/Slash Command User Guide.md`
