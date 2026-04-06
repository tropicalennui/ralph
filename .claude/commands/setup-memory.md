Read `.claude/CLAUDE.conventions.md` and save its conventions into local memory so they persist across sessions.

For each of the following convention groups, create or update the corresponding memory file in the user's memory directory for this project:

1. **Jira conventions** — save as a `feedback` type memory covering: assign issues to user on completion, check for existing Epic/Feature before starting work, fall back to REST API if MCP unavailable.

2. **Git conventions** — save as a `feedback` type memory covering: always check branch first, create `feature/<name>` branch if on master, ask user if already on a feature branch, never commit to master directly, rebase onto master after switching to an existing feature branch.

3. **Documentation conventions** — save as a `feedback` type memory covering: every feature needs a design doc in `Documentation/Features/`, a user guide in `Documentation/Knowledge/`, and tests under `npm test`. All three are mandatory before a feature is considered complete.

4. **Idea naming conventions** — save as a `feedback` type memory covering: top-level ideas named `Epic, {{title}}`; child ideas named `Epic, {{ParentEpicTitle}}, {{title}}`.

5. **ServiceNow background script style** — save as a `feedback` type memory: do not wrap background scripts in a function or IIFE; write at the top level directly.

6. **ServiceNow data model conventions** — save as a `feedback` type memory: role assignments are in `sys_user_has_role`, not `sys_user.roles`; `svc.claude` has admin + snc_readonly and is effectively read-only; do not attempt writes until the user explicitly grants scoped write access.

7. **Database design process** — save as a `feedback` type memory: always plan and present schema (tables, columns, rationale) and get explicit user sign-off before writing any code or creating any database files.

After saving all seven, confirm to the user that memory has been seeded and they won't need to run this again unless they reset their memory.
