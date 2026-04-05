Read `.claude/CLAUDE.conventions.md` and save its conventions into local memory so they persist across sessions.

For each of the following convention groups, create or update the corresponding memory file in the user's memory directory for this project:

1. **Jira conventions** — save as a `feedback` type memory covering: assign issues to user on completion, check for existing Epic/Feature before starting work, fall back to REST API if MCP unavailable.

2. **Git conventions** — save as a `feedback` type memory covering: always check branch first, create `feature/<name>` branch if on master, ask user if already on a feature branch, never commit to master directly, rebase onto master after switching to an existing feature branch.

3. **Documentation conventions** — save as a `feedback` type memory covering: every feature needs a design doc in `Documentation/Features/`, a user guide in `Documentation/Knowledge/`, and tests under `npm test`. All three are mandatory before a feature is considered complete.

4. **Idea naming conventions** — save as a `feedback` type memory covering: top-level ideas named `Epic, {{title}}`; child ideas named `Epic, {{ParentEpicTitle}}, {{title}}`.

After saving all four, confirm to the user that memory has been seeded and they won't need to run this again unless they reset their memory.
