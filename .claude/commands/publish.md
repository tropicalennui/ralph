Push the current state of master to GitHub.

Follow these steps exactly, stopping and reporting to the user if anything fails:

## Step 1 — Confirm we're on master

Run `git branch --show-current`. If the result is not `main` or `master`, stop and tell the user: "You're not on the main branch. Run /promote first, then /publish."

## Step 2 — Confirm remote is configured

Run `git remote get-url origin`. If it fails or returns nothing, stop and tell the user: "No remote named 'origin' is configured. Add one with: git remote add origin <url>"

## Step 3 — Check for unpushed commits

Run `git log origin/master..HEAD --oneline`. If there are no unpushed commits, tell the user: "Nothing to publish — master is already up to date with origin." and stop.

Otherwise, show the user the list of commits that will be pushed and ask them to confirm before proceeding.

## Step 4 — Push

Run:

```bash
git push origin master
```

If the push fails, show the full error and stop. Do not attempt a force push.

## Step 5 — Report

Tell the user:
- How many commits were pushed
- The current HEAD SHA (`git rev-parse --short HEAD`)
- The remote URL
