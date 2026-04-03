Promote the current feature branch to main by committing pending changes, running tests, and merging.

Follow these steps exactly, stopping and reporting to the user if anything fails:

## Step 1 — Confirm we're on a feature branch

Run `git branch --show-current`. If the result is `main` or `master`, stop immediately and tell the user: "You're already on the main branch. Nothing to promote."

## Step 2 — Check for uncommitted changes

Run `git status --short`. If there are changes:

1. Run `git diff` and `git diff --cached` to understand what's changed.
2. Draft a concise commit message summarising the changes.
3. Tell the user the proposed commit message and the list of changed files, and ask them to confirm before proceeding.
4. Once confirmed, stage all changes with `git add -A` and commit using the agreed message, co-authored by Claude:

```
git commit -m "$(cat <<'EOF'
<message here>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

## Step 3 — Run the test suite

Run `npm test` from the project root. If any tests fail:
- Show the user which tests failed and why.
- Stop. Do not merge. Tell the user: "Tests failed — fix the failures before promoting."

## Step 4 — Merge to main

Record the current branch name, then:

```bash
git checkout main   # or master — use whichever exists
git merge --no-ff <feature-branch> -m "Merge <feature-branch> into main"
```

If there are merge conflicts, stop and tell the user which files conflict so they can resolve them manually.

## Step 5 — Report

Tell the user:
- Which branch was merged
- The commit SHA of the merge commit (`git rev-parse --short HEAD`)
- That they're now on main and the feature branch can be deleted with `git branch -d <feature-branch>` when ready