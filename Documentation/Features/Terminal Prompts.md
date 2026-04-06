---
type: Technical Design
user-guide: "[[Terminal Prompts User Guide]]"
---
A collection of CLI tools that run directly in the VS Code terminal without involving Claude. These are deterministic, scripted operations where no judgment is required — the user provides inputs, the tool executes, and the output is immediate.

---

## Purpose

Not everything needs to go through Claude. Tools that follow a fixed procedure — fetch a script, sync a table, start a server — consume tokens unnecessarily when routed through the chat. Terminal Prompts covers all such tools under a single umbrella, with a shared user guide as the entry point.

---

## Tools

### Fetch

Fetches a named script from a ServiceNow table and writes it to `WIP/` as a `.js` file. Uses a local DuckDB cache (`ralph.db`) to avoid re-fetching unchanged scripts.

**Location:** `tools/fetch/fetch.js`

See [[Fetch User Guide]] for full usage.

---

### snowsync (Igloo)

Mirrors ServiceNow tables into a local DuckDB database (`snow.db`). Incrementally syncs on each run.

**Location:** `tools/snowsync/snowsync.js`

See [[Igloo User Guide]] for full usage.

---

### Yoink server

The local HTTP server that receives page captures from the browser extension and saves them as Markdown to the vault.

**Location:** `tools/yoink/server/server.js`

Managed via npm scripts at the repo root — no Claude required.

---

## What belongs here vs slash commands

| Criterion | Terminal Prompt | Slash Command |
|---|---|---|
| Fixed procedure, no judgment needed | ✓ | |
| Requires Claude to interpret, decide, or draft | | ✓ |
| Pure shell / Node execution | ✓ | |
| Multi-step workflow with confirmation gates | | ✓ |

Examples: `fetch`, `snowsync`, `npm run yoink:start` → Terminal Prompts. `/promote`, `/publish`, `/setup-memory` → Slash Commands.
