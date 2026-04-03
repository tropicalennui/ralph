# Slash Commands

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
