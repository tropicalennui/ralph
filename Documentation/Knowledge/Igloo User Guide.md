---
type: User Guide
feature: "[[Igloo]]"
---
Igloo mirrors ServiceNow tables into a local DuckDB database (`snow.db`). Once synced, you can query SNOW data instantly from the terminal — no network required.

---

## Running a sync

```bash
# Sync all tables in snowdb.config.yaml
snowsync

# Sync a single table
snowsync sys_script_include
```

Output:
```
Syncing sys_script_include... +62 ~0 =0 -0  (62 from SNOW)
Syncing sys_ui_action... +148 ~0 =0 -0  (148 from SNOW)
Done.
```

On subsequent runs, only changed records are updated:
```
Syncing sys_script_include... +0 ~2 =60 -0  (62 from SNOW)
Done.
```

---

## Querying snow.db

Use the DuckDB CLI (available as `duckdb` in the VSCode terminal):

```bash
# List all synced tables
duckdb snow.db ".tables"

# Show the schema of a table
duckdb snow.db "DESCRIBE sys_script_include"

# Query records
duckdb snow.db "SELECT name, sys_updated_on FROM sys_script_include WHERE _deleted = false ORDER BY sys_updated_on DESC LIMIT 20"

# Find records updated in the last 7 days
duckdb snow.db "SELECT name FROM sys_script_include WHERE sys_updated_on > (now() - INTERVAL 7 DAYS)::VARCHAR AND _deleted = false"
```

---

## Configuring which tables to sync

Edit `snowdb.config.yaml` at the repo root:

```yaml
tables:
  # Sync all fields, no filter
  - name: sys_script_include

  # Sync with a SNOW query filter
  - name: sys_ui_action
    query: "active=true"

  # Sync specific fields only
  - name: incident
    query: "active=true^stateIN1,2"
    fields:
      - number
      - short_description
      - state
      - priority
      - assigned_to
      - caller_id
      - opened_at
```

- **`query`** — any valid ServiceNow encoded query string
- **`fields`** — list of field names to sync; omit to sync all fields

`sys_id` and `sys_updated_on` are always included regardless of the `fields` list.

---

## Reference fields

Fields that reference another SNOW record (e.g. `assigned_to`, `caller_id`) are stored as two columns:

| Column | Contains |
|---|---|
| `assigned_to` | The sys_id of the referenced user record |
| `assigned_to_dv` | The display name (e.g. "Jane Smith") |

---

## Deleted records

Igloo never physically deletes rows. If a record is no longer returned by SNOW (because it was deleted or filtered out by your `query`), it is soft-deleted:

```sql
_deleted    = TRUE
_deleted_at = <timestamp when the sync noticed it was gone>
```

To query only active records:
```bash
duckdb snow.db "SELECT * FROM sys_script_include WHERE _deleted = false"
```

---

## Multi-instance support

The `instance` column stores the hostname prefix (e.g. `dev200264`) derived from the `SNOW_INSTANCE` value in `.secrets`. If you point `.secrets` at a different instance and re-sync, data from both instances coexists in the same `snow.db` table, distinguished by `instance`.