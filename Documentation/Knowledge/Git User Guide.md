---
type: User Guide
parent: "[[Ralph User Guide]]"
---
How Ralph uses git — branching conventions, the promote/publish workflow, and how to start a new ServiceNow project repository.

---

## Branching conventions

Ralph enforces a strict branch model to keep `master` clean and publishable:

- **Never commit directly to `master`**
- All work happens on `feature/*` branches
- Merges to `master` go through `/promote`, which runs tests first

Claude Code enforces this automatically. When you ask Claude to start a new piece of work, it will:
1. Check the current branch (`git branch`)
2. If on `master`, create a new feature branch (`git checkout -b feature/<short-description>`)
3. If already on a feature branch, ask whether to continue or create a new one

If you switch back to an existing feature branch after working elsewhere, Claude will rebase it onto `master` before continuing, to keep it current.

---

## Making changes

When Claude makes changes, it stages and commits them with a descriptive message. You'll be asked to confirm before anything is committed. Commits are co-authored by Claude.

To commit manually:
```bash
git add <files>
git commit -m "Your message"
```

---

## Promoting to master

Run `/promote` in Claude Code when your feature branch is ready to merge.

What it does:
1. Refuses to run if you're already on `master`
2. If there are uncommitted changes: shows a diff, proposes a commit message, waits for confirmation
3. Runs `npm test` — stops if anything fails
4. Merges the feature branch into `master` with `--no-ff`
5. Reports the merge commit SHA

After promoting, delete the feature branch:
```bash
git branch -d feature/<name>
```

---

## Publishing to GitHub

Run `/publish` in Claude Code to push `master` to the GitHub remote.

Before publishing, confirm:
- No sensitive values are in committed files (the PII pre-commit hook checks this on every commit)
- Docs reflect current behaviour

---

## Starting a new ServiceNow project repository

Once Ralph is set up, you can use it as a base for a dedicated ServiceNow project repo:

1. Create a new empty repo on GitHub
2. Clone it locally and open in VS Code with Claude Code
3. Copy `.githooks/`, `.gitignore`, `.pii-patterns.example`, and `CLAUDE.md` from Ralph as a starting point
4. Run `git config core.hooksPath .githooks` to activate the PII guardrail
5. Create `.claude/CLAUDE.local.md` with your instance details
6. Ask Claude to help scaffold the project structure for your use case

The same branching conventions apply: feature branches for all work, `/promote` to merge, `/publish` to push.
