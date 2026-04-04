---
type: User Guide
parent: "[[Ralph User Guide]]"
---
## Overview

The `Documentation/` folder is an Obsidian vault. Open it in Obsidian by pointing Obsidian at the `Documentation/` directory as the vault root.

## Plugins

Install **Templater** from the Obsidian community plugins list. Once installed, set the template folder to `Documentation/zTemplates/`.

## Creating a New Idea

1. Create a new note in `Documentation/Ideas/`
2. Open the Templater menu and apply **Template, Idea**
3. Fill in the frontmatter properties — `state`, `epic` or `feature` (if a Jira issue exists), `technical_design` (if a design doc exists), and `parent` (if this is a child of another idea)

## Document Conventions

| Type | Folder | Template |
|---|---|---|
| Idea | `Documentation/Ideas/` | Template, Idea |
| Technical Design | `Documentation/Design/` | _(none yet)_ |
| User Guide | `Documentation/Knowledge/User Guides/` | _(none yet)_ |

## What Is Gitignored

`Documentation/Ideas/` and `Documentation/.obsidian/` are not committed to the repository. Ideas are personal and may contain PII.
