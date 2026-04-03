---
type: Technical Design
user-guide: "[[Page Capture Tool User Guide]]"
---
Captures the content of the active browser tab and saves it as a markdown document in the Obsidian vault.

---

## Problem Statement

ServiceNow knowledge content is needed for offline reference and project documentation. ServiceNow pages require authentication and use dynamic URLs that don't point to stable, bookmarkable locations. A tool is needed that can capture the rendered page content from an active, authenticated browser session without requiring the user to copy-paste or manually format anything.

---

## Architecture Overview

```
[Edge Browser]
    │  Ctrl+Shift+A
    ▼
[Extension: background.js]
    │  executeScript → extract outerHTML + title + url
    │  POST /capture (JSON, ~100–500 KB)
    ▼
[Local Node.js Server: port 3737]
    │  Readability.js → extract article content
    │  Turndown → convert HTML to Markdown
    │  Write .md file
    ▼
[Obsidian Vault: Documentation/Knowledge/]
    │
    └── [Toast notification injected into page]
```

---

## Components

### 1. Browser Extension

**Location:** `tools/page-capture/extension/`

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker — handles keyboard command and server communication |

**Manifest V3 permissions:**
- `activeTab` — access the current tab when the shortcut is triggered
- `scripting` — inject scripts to extract page content and show toast
- `host_permissions: http://localhost:3737/*` — allow fetch to local server

**Flow:**
1. User presses `Ctrl+Shift+Q`
2. Background service worker's `chrome.action.onClicked` fires
3. `chrome.scripting.executeScript` identifies the best content element (via site config or generic selectors, piercing shadow DOM) and extracts its HTML, `document.title`, and `window.location.href`
4. Worker POSTs this payload to `http://localhost:3737/capture`
5. On success or failure, a toast is injected into the page via a second `executeScript` call

**Content extraction — site config table:**
The extension maintains a `SITE_CONFIGS` array in `background.js`. Each entry has a URL prefix (`match`) and an ordered list of CSS selectors to try. When the current URL matches an entry, those site-specific selectors are tried first, then generic semantic selectors (`main`, `article`, `[role="main"]`, etc.) as a fallback. Pages with no matching config go straight to generic selectors.

To add support for a new site, add one entry to `SITE_CONFIGS` — existing site configs are unaffected.

```js
// Example
{ match: 'https://example.com/docs', selectors: ['.doc-body', '.content-area'] }
```

Currently configured sites:

| URL prefix | Selectors |
|---|---|
| `https://developer.servicenow.com/dev.do#!/learn/courses` | `.dps-learn-module-content`, `.dps-learn-module-panel` |

**Why executeScript instead of a content script?**
A persistent content script would run on every page load. `executeScript` is on-demand, which avoids unnecessary overhead and avoids interfering with ServiceNow's own JavaScript.

---

### 2. Local Server

**Location:** `tools/page-capture/server/`

| File | Purpose |
|---|---|
| `server.js` | Express HTTP server |
| `package.json` | Node.js project manifest |

**Dependencies:**

| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `@mozilla/readability` | Extracts main article content from full page HTML |
| `jsdom` | Parses raw HTML into a DOM for Readability to consume |
| `turndown` | Converts HTML to Markdown |
| `turndown-plugin-gfm` | Adds GitHub Flavored Markdown support (tables, strikethrough) |

**Endpoint:** `POST /capture`

Request body:
```json
{
  "html": "<full page outerHTML>",
  "title": "Page title from document.title",
  "url": "https://..."
}
```

Response:
```json
{
  "filename": "Article Title.md",
  "filepath": "C:\\...\\Documentation\\Knowledge\\Article Title.md"
}
```

**Processing pipeline:**
1. Parse HTML with `jsdom`, passing the source URL so relative links resolve correctly
2. Run `Readability.parse()` to extract the main article body (strips nav, sidebars, footers)
3. As a fallback, Turndown is also configured to strip `nav`, `header`, `footer`, `script`, `style`, and `noscript` elements
4. Convert the extracted HTML to Markdown with Turndown (ATX headings, fenced code blocks, GFM tables)
5. Prepend YAML frontmatter with `title`, `source`, and `captured` date
6. Sanitise the title for use as a filename (strip illegal characters, truncate to 100 chars)
7. Write the file to `Documentation/Knowledge/`

**Why Readability?**
ServiceNow pages are complex — they include navigation rails, breadcrumbs, related article panels, and footer content. Readability (the same library used by Firefox Reader View) identifies and isolates the main article content reliably, without needing page-specific selectors.

**Why local server instead of doing everything in the extension?**
- File system access — browser extensions cannot write files directly to disk
- Node.js packages — Readability and Turndown are not available in extension contexts without complex bundling
- Separation of concerns — the extension handles browser interaction; the server handles content processing and persistence

---

## Data Flow

```
outerHTML (raw)
  → jsdom parse
  → Readability extract
  → Turndown convert
  → frontmatter prepend
  → fs.writeFileSync
  → .md file in vault
```

---

## Vault Output

Files are written to `Documentation/Knowledge/` with the following structure:

```markdown
---
title: "Article Title"
source: "https://..."
captured: 2026-04-03
---

# Article Title

[Markdown content...]
```

---

## Lifecycle Management

The server is managed via the `/catch` slash command in Claude Code:

- `/catch start` — spawns `node server.js` as a background process, saves PID to `/tmp/catch-server.pid`
- `/catch stop` — kills the process by PID, with a port-based fallback

The extension is loaded as an unpacked extension in Edge developer mode and persists across browser restarts without reinstallation.

---

## Limitations & Known Constraints

| Constraint | Detail |
|---|---|
| Server must be running | The extension will silently fail (red toast) if the server isn't started first |
| HTTP only on localhost | Server binds to `127.0.0.1` only — not exposed on the network |
| Single output folder | All captures go to `Documentation/Knowledge/` — no subfolder selection at capture time |
| Filename collisions | If a file with the same title already exists, it is overwritten without warning |
| Readability may fail | Some pages (e.g. SPAs that render content after load) may not parse cleanly; the raw body HTML is used as a fallback |
