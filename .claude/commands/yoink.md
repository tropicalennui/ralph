Start or stop the page capture server (tools/page-capture/server/server.js).

The user's argument is: $ARGUMENTS

## If the argument is "start":

Run the server in the background and save its PID so it can be stopped later:

```bash
cd "tools/page-capture/server" && node server.js > /tmp/catch-server.log 2>&1 &
echo $! > /tmp/catch-server.pid
echo "Server started (PID $(cat /tmp/catch-server.pid)). Logs → /tmp/catch-server.log"
```

Then confirm to the user that the server is running on http://127.0.0.1:3737 and how to stop it (`/catch stop`).

## If the argument is "stop":

Kill the server using the saved PID:

```bash
if [ -f /tmp/catch-server.pid ]; then
  PID=$(cat /tmp/catch-server.pid)
  kill "$PID" 2>/dev/null && echo "Server stopped (PID $PID)" || echo "Process $PID was already gone"
  rm /tmp/catch-server.pid
else
  echo "No PID file found — trying to kill by port 3737"
  PID=$(netstat -ano 2>/dev/null | grep ':3737 ' | grep LISTENING | awk '{print $NF}' | head -1)
  if [ -n "$PID" ]; then
    taskkill //PID "$PID" //F && echo "Stopped process $PID on port 3737"
  else
    echo "No process found listening on port 3737"
  fi
fi
```

Then confirm to the user that the server has been stopped.

## If the argument is anything else or empty:

Tell the user the valid usage:
- `/catch start` — start the page capture server
- `/catch stop` — stop the page capture server
