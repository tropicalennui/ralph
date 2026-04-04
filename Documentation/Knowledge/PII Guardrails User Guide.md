---
type: User Guide
parent: "[[Ralph User Guide]]"
---
## Overview

The PII guardrail is a pre-commit hook that blocks commits containing sensitive values — instance URLs, account IDs, credentials, or other personal details — before they reach the repository.

## Setup

Run once after cloning:

```bash
git config core.hooksPath .githooks
cp .pii-patterns.example .pii-patterns
```

Then open `.pii-patterns` and uncomment the patterns that match your setup, filling in your actual values:

```
yourname                        # Atlassian subdomain
dev123456\.service-now\.com     # ServiceNow PDI hostname
5f1a2b3c4d5e6f7a8b9c0d1e        # Jira account ID
/yourusername/                  # OS username in paths
```

## What It Does

Every time you run `git commit`, the hook scans staged changes against your patterns. If a match is found, the commit is blocked and the matching lines are shown:

```
PII check failed — staged changes contain blocked patterns:

  Pattern: dev123456\.service-now\.com
    +SNOW_INSTANCE=dev123456.service-now.com

Review the matches above. If intentional, remove the pattern from .pii-patterns temporarily.
```

## Bypassing a Block

If the match is intentional (e.g. committing an example file with placeholder values), temporarily remove the pattern from `.pii-patterns`, commit, then restore it.
