---
type: Technical Design
user-guide: "[[Obsidian Integration User Guide]]"
---
## Purpose

Structure the Documentation folder as an Obsidian vault and establish conventions for how Claude generates and maintains documentation as features are built.

## Vault Layout

The vault root is `Documentation/`. All Obsidian config lives in `Documentation/.obsidian/` (gitignored).

```
Documentation/
├── Features/         # Technical design documents
├── Ideas/            # Personal feature backlog (gitignored)
├── Knowledge/
│   ├── Yoinked/      # Clipped external content (Yoink)
│   └── [User Guides] # User guides live flat in Knowledge/
├── User Guides.md    # Dataview index of all user guides
└── zTemplates/       # Templater templates
```

## Plugins

- **Templater** — provides dynamic templates via `<% %>` syntax. Templates live in `Documentation/zTemplates/`.

## Document Types and Frontmatter

### Idea
```yaml
type: Idea
state: new | in-progress | completed
created: YYYY-MM-DD
parent: "[[Parent Idea]]"   # if child idea
epic:                        # Jira Epic URL (top-level ideas)
feature:                     # Jira Feature URL (child ideas)
technical_design: "[[Design Doc]]"
```

### Technical Design
```yaml
type: Technical Design
user-guide: "[[User Guide Name]]"
```

### User Guide
```yaml
type: User Guide
```

## Conventions

- Every feature must have a design doc in `Documentation/Features/` and a user guide in `Documentation/Knowledge/`
- Design docs link to their user guide via the `user-guide` frontmatter property
- Ideas link to their design doc via the `technical_design` property
- Ideas are personal and gitignored — they may contain PII
