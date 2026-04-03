# Page Capture Tool — User Guide

The page capture tool saves browser pages as Markdown files directly into the Obsidian vault. Useful for capturing ServiceNow developer documentation, course exercises, and reference material.

## Usage

1. Start the capture server (keep this terminal open):
   ```
   cd tools/page-capture/server && node server.js
   ```
2. Navigate to the page you want to capture in Edge
3. Press **Ctrl+Shift+Q**
4. The page is saved to `Documentation/Knowledge/Acquired/` as a Markdown file with YAML frontmatter

## Output Format

Files are saved with:
```yaml
---
title: "Page Title"
source: "https://original-url"
captured: 2026-04-03
---
```

## Notes

- The extension is loaded as an unpacked extension in Edge (developer mode). If it stops working after a browser update, go to `edge://extensions` and reload it.
- The capture server must be running before pressing the shortcut — there is no background daemon.
- ServiceNow Developer Portal pages render inside shadow DOM. The extension handles this automatically using a shadow-piercing content selector.
- The `/catch` slash command does **not** work in the VS Code extension context. Start the server via the terminal directly.
