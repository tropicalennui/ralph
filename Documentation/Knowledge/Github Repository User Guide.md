---
type: User Guide
parent: "[[Ralph User Guide]]"
---
## Overview

Ralph is published as a public GitHub repository. Others can fork it and configure it for their own instances. This guide covers how to set up your fork and how to publish changes.

## Forking and Setup

See the README in the repo root for the full setup walkthrough — fork, clone, install dependencies, configure git hooks, copy config files, and add credentials.

## Publishing Changes

Run `/publish` in Claude Code to push the current state of `master` to GitHub.

Before publishing, confirm that:
- No sensitive values are in committed files (the PII pre-commit hook enforces this)
- The README and any user-facing docs reflect current behaviour

## What Is and Isn't Published

**Published:** source code, design docs, user guides, example config files, git hooks, tests

**Not published:** `.secrets`, `.claude/CLAUDE.local.md`, `.pii-patterns`, `.mcp.json`, `Documentation/Ideas/`
