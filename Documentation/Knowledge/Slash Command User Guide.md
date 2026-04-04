---
type: User Guide
parent: "[[Ralph User Guide]]"
---
Custom slash commands available in this workspace. Type them directly in the Claude Code chat.

---

## /yoink

Manages the Yoink server, which receives pages from the browser extension and saves them as markdown to the vault.

### Usage

```
/yoink start
/yoink stop
```

### Commands

#### `/yoink start`

Starts the Yoink server in the background.

**Expected result:**
- Server starts listening on `http://127.0.0.1:3737`
- A PID file is written to `/tmp/yoink-server.pid` so the process can be stopped cleanly
- Logs are written to `/tmp/yoink-server.log`
- Claude confirms the server is running and reminds you how to stop it

#### `/yoink stop`

Stops the running Yoink server.

**Expected result:**
- The server process is killed using the saved PID
- The PID file is removed
- If no PID file is found, falls back to finding and killing any process on port 3737
- Claude confirms the server has stopped

### Notes

- The server must be running before using the browser extension (`Ctrl+Shift+Q` in Edge)
- If you close the terminal or restart your machine, the server will need to be started again with `/yoink start`
- To check whether the server is running, visit `http://127.0.0.1:3737` in your browser — you should get a response (even a 404) if it's up
- Does **not** work in the VS Code extension context — start the server via the terminal directly instead

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
