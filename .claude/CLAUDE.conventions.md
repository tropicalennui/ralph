# Ralph — Conventions

These conventions apply to all work in this workspace. Run `/setup-memory` on first use to load them into your local memory so they don't need to be re-read each session.

## Jira Conventions

- When completing a Jira issue, always assign it to the user before or during resolution.
- Before starting any feature work, check for an existing Epic or Feature in Jira and capture work under it. Create one if it doesn't exist.
- Use the Jira REST API when MCP tools are unavailable.
- Credentials are in `.secrets` (gitignored). Instance URL and account ID are in `.claude/CLAUDE.local.md`.

## Git Conventions

- Always check the current branch before starting feature work (`git branch`).
- If on `master`, create a new branch: `git checkout -b feature/<short-description>`.
- If already on a feature branch, ask the user whether to continue in that branch or create a new one.
- Never commit directly to `master`.
- Rebase onto master immediately after switching to any existing feature branch.

## Documentation Conventions

Every feature — new or existing — must have all three:
- A **technical design document** in `Documentation/Features/`
- A **user guide** in `Documentation/Knowledge/`
- **Tests** covered by `npm test` at the project root

When building or modifying a feature, create or update all three as part of the same piece of work. Do not consider a feature complete without them. `/promote` enforces this by running tests before merging.

## Idea Naming Conventions

- Top-level ideas: `Epic, {{title}}`
- Child ideas: `Epic, {{ParentEpicTitle}}, {{title}}` (not "Epic, Feature, ...")
