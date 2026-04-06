---
type: User Guide
parent: "[[Ralph User Guide]]"
---
Custom slash commands available in this workspace. Type them directly in the Claude Code chat.

---

## /promote

Promotes the current feature branch to `master`. Runs the full test suite before merging — the merge will not proceed if any tests fail.

### Usage

```
/promote
```

No arguments needed. Run it from any feature branch when you're ready to merge.

### What it does

1. Refuses to run if you're already on `master`
2. If there are uncommitted changes: shows a diff, proposes a commit message, and asks you to confirm before committing
3. Runs `npm test` — stops here if anything fails
4. Merges the feature branch into `master` with `--no-ff`
5. Reports the merge commit SHA and how to delete the feature branch

### Notes

- Always run from a feature branch (`feature/...`), never from `master`
- The commit will be co-authored by Claude
- To delete the feature branch after merging: `git branch -d <branch-name>`

---

## /publish

Pushes `master` to GitHub. Run this after `/promote` when you're ready to share.

### Usage

```
/publish
```

No arguments needed. Must be on `master`.

### What it does

1. Refuses to run if you're not on `master`
2. Checks that a remote named `origin` is configured
3. Shows the list of unpushed commits and asks you to confirm
4. Pushes to `origin/master`
5. Reports the result

### Notes

- Always run `/promote` first to merge your feature branch
- Will never force-push — if the push is rejected, it stops and reports the error
- To check what would be pushed before running: `git log origin/master..HEAD --oneline`
