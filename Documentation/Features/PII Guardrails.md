---
type: Technical Design
user-guide: "[[PII Guardrails User Guide]]"
---
## Purpose

A pre-commit hook that prevents personally identifiable information and sensitive values from being accidentally committed to the repository.

## How It Works

The hook lives at `.githooks/pre-commit` and is activated by setting `git config core.hooksPath .githooks` after cloning.

On each commit, the hook:
1. Reads regex patterns from `.pii-patterns` (one per line; blank lines and `#` comments are ignored)
2. Scans the staged diff (added lines only) for matches against each pattern
3. Blocks the commit and prints the matching lines if any pattern is found

## Pattern File

`.pii-patterns` is gitignored and must be created locally from `.pii-patterns.example`. Each line is a regex matched with `grep -E` against the staged diff. Patterns are personal to the user — they encode values specific to the user's setup (subdomain, instance hostname, account ID, OS username).

## Bypassing

If a match is intentional, the user can temporarily remove the pattern from `.pii-patterns`, commit, then restore it. The hook does not support inline suppression or `--no-verify` bypass by convention.

## Files

| File | Purpose | Tracked |
|---|---|---|
| `.githooks/pre-commit` | Hook script | Yes |
| `.pii-patterns.example` | Template with commented examples | Yes |
| `.pii-patterns` | User's actual patterns | No (gitignored) |
