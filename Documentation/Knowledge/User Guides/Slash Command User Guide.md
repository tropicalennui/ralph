---
type: User Guide
---
Custom slash commands available in this workspace. Type them directly in the Claude Code chat.

---

## /catch

Manages the page capture server, which receives pages from the browser extension and saves them as markdown to the vault.

### Usage

```
/catch start
/catch stop
```

### Commands

#### `/catch start`

Starts the page capture server in the background.

**Expected result:**
- Server starts listening on `http://127.0.0.1:3737`
- A PID file is written to `/tmp/catch-server.pid` so the process can be stopped cleanly
- Logs are written to `/tmp/catch-server.log`
- Claude confirms the server is running and reminds you how to stop it

#### `/catch stop`

Stops the running page capture server.

**Expected result:**
- The server process is killed using the saved PID
- The PID file is removed
- If no PID file is found, falls back to finding and killing any process on port 3737
- Claude confirms the server has stopped

### Notes

- The server must be running before using the browser extension (`Ctrl+Shift+A` in Edge)
- If you close the terminal or restart your machine, the server will need to be started again with `/catch start`
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
