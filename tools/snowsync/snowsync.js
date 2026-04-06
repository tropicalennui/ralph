#!/usr/bin/env node
/**
 * snowsync — mirror ServiceNow tables into a local DuckDB database (snow.db)
 *
 * Usage:
 *   snowsync                 Sync all tables in snowdb.config.yaml
 *   snowsync <table>         Sync a single table
 *   snowsync --help          Show help
 *
 * On each run snowsync:
 *   - Fetches full schema from sys_dictionary (including inherited fields)
 *   - Inserts new records, updates changed ones, skips unchanged, soft-deletes missing
 *   - Change detection is based on sys_updated_on (stored as VARCHAR for reliable comparison)
 *   - Reference fields are stored as two columns: fieldname (sys_id) + fieldname_dv (display value)
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { fetchSchema } = require("./schema");
const { open, close, ensureTable } = require("./snowdb");
const { val, dv, buildValues, classifyRecord } = require("./lib");

const ROOT        = path.join(__dirname, "..", "..");
const CONFIG_FILE = path.join(ROOT, "snowdb.config.yaml");
const SECRETS_FILE = path.join(ROOT, ".secrets");
const PAGE_SIZE   = 1000;

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

function loadSecrets() {
  const lines = fs.readFileSync(SECRETS_FILE, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

// ---------------------------------------------------------------------------
// ServiceNow REST
// ---------------------------------------------------------------------------

async function fetchAllRecords(auth, snowBase, tableName, query, fields) {
  const url = `${snowBase}/api/now/table/${tableName}`;
  let offset = 0;
  const all = [];

  while (true) {
    const params = new URLSearchParams({
      sysparm_fields:                 fields.join(","),
      sysparm_limit:                  String(PAGE_SIZE),
      sysparm_offset:                 String(offset),
      sysparm_display_value:          "all",
      sysparm_exclude_reference_link: "true",
    });
    if (query) params.set("sysparm_query", query);

    const res = await fetch(`${url}?${params}`, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`SNOW ${res.status} fetching ${tableName}: ${body}`);
    }

    const data = await res.json();
    const records = data.result ?? [];
    all.push(...records);
    if (records.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

// ---------------------------------------------------------------------------
// DB write helpers
// ---------------------------------------------------------------------------

async function insertRecord(conn, tableName, instance, sysId, record, columns) {
  const colNames   = ["instance", "sys_id", ...columns.map(c => `"${c.name}"`)].join(", ");
  const values     = [instance, sysId, ...buildValues(record, columns)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  await conn.run(`INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders})`, values);
}

async function updateRecord(conn, tableName, instance, sysId, record, columns) {
  const values     = buildValues(record, columns);
  const setClauses = columns.map((c, i) => `"${c.name}" = $${i + 1}`);
  values.push(instance, sysId);
  const p1 = values.length - 1;
  const p2 = values.length;
  await conn.run(
    `UPDATE "${tableName}"
     SET ${setClauses.join(", ")}, _deleted = FALSE, _deleted_at = NULL
     WHERE instance = $${p1} AND sys_id = $${p2}`,
    values
  );
}

// ---------------------------------------------------------------------------
// Sync a single table
// ---------------------------------------------------------------------------

async function syncTable(conn, auth, snowBase, instance, tableConfig) {
  const { name: tableName, query, fields: requestedFields } = tableConfig;
  process.stdout.write(`Syncing ${tableName}... `);

  // 1. Discover schema (full inheritance chain)
  const schemaFields = await fetchSchema(auth, snowBase, tableName);

  // 2. Filter to requested fields (if config specifies any)
  let usedFields = schemaFields;
  if (requestedFields && requestedFields.length > 0) {
    const wanted = new Set(requestedFields);
    wanted.add("sys_id");
    wanted.add("sys_updated_on");
    usedFields = schemaFields.filter(f => wanted.has(f.element));
    // Safety: ensure sys_id and sys_updated_on are present even if not in dictionary
    for (const required of ["sys_id", "sys_updated_on"]) {
      if (!usedFields.find(f => f.element === required)) {
        usedFields.push({ element: required, duckdbType: "VARCHAR", isReference: false });
      }
    }
  }

  // 3. Build DB column list (reference fields get a _dv companion)
  //    Exclude sys_id — ensureTable adds it as part of the PK.
  const dbColumns = [];
  for (const f of usedFields) {
    if (f.element === "sys_id") continue;
    dbColumns.push({ name: f.element, duckdbType: f.duckdbType });
    if (f.isReference) {
      dbColumns.push({ name: f.element + "_dv", duckdbType: "VARCHAR" });
    }
  }

  // 4. Fetch all records from ServiceNow
  const snowFields = usedFields.map(f => f.element);
  const records    = await fetchAllRecords(auth, snowBase, tableName, query, snowFields);

  // 5. Drop columns that have no populated values across all fetched records.
  //    sys_updated_on is always kept (required for change detection).
  const ALWAYS_KEEP = new Set(["sys_updated_on"]);
  const activeColumns = dbColumns.filter(col => {
    if (ALWAYS_KEEP.has(col.name)) return true;
    const base = col.name.endsWith("_dv") ? col.name.slice(0, -3) : col.name;
    return records.some(r => {
      const v = col.name.endsWith("_dv") ? dv(r[base]) : val(r[col.name]);
      return v != null;
    });
  });

  // 6. Ensure table and columns exist in snow.db
  await ensureTable(conn, tableName, activeColumns);

  // 7. Load what we already have (including soft-deleted, for un-deletion)
  const existing = await conn.runAndReadAll(
    `SELECT sys_id, sys_updated_on, _deleted FROM "${tableName}" WHERE instance = $1`,
    [instance]
  );
  // existingMap: sys_id → { sysUpdatedOn, deleted }
  const existingMap = new Map();
  for (const [sysId, sysUpdatedOn, deleted] of existing.getRows()) {
    existingMap.set(sysId, { sysUpdatedOn, deleted });
  }

  // 8. Insert / update / skip
  let inserted = 0, updated = 0, skipped = 0;
  const seenIds = new Set();

  for (const record of records) {
    const sysId = val(record.sys_id);
    if (!sysId) continue;
    seenIds.add(sysId);

    const snowUpdatedOn = val(record.sys_updated_on);
    const prior = existingMap.get(sysId);
    const action = classifyRecord(prior, snowUpdatedOn);

    if (action === "insert") {
      await insertRecord(conn, tableName, instance, sysId, record, activeColumns);
      inserted++;
    } else if (action === "update") {
      await updateRecord(conn, tableName, instance, sysId, record, activeColumns);
      updated++;
    } else {
      skipped++;
    }
  }

  // 8. Soft-delete records no longer returned by ServiceNow
  let deleted = 0;
  for (const [sysId, { deleted: alreadyDeleted }] of existingMap) {
    if (!seenIds.has(sysId) && !alreadyDeleted) {
      await conn.run(
        `UPDATE "${tableName}"
         SET _deleted = TRUE, _deleted_at = current_timestamp
         WHERE instance = $1 AND sys_id = $2`,
        [instance, sysId]
      );
      deleted++;
    }
  }

  console.log(`+${inserted} ~${updated} =${skipped} -${deleted}  (${records.length} from SNOW)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--help" || args[0] === "-h") {
    console.log(
      "Usage: snowsync [<table>]\n" +
      "\n" +
      "  <table>   Sync only this table (must be listed in snowdb.config.yaml)\n" +
      "  (none)    Sync all tables in snowdb.config.yaml\n"
    );
    process.exit(0);
  }

  const filterTable = args[0] ?? null;

  // Load config
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error("Error: snowdb.config.yaml not found at repo root.");
    process.exit(1);
  }
  const config = yaml.load(fs.readFileSync(CONFIG_FILE, "utf8"));
  const tables = config.tables ?? [];

  if (tables.length === 0) {
    console.error("No tables configured in snowdb.config.yaml.");
    process.exit(1);
  }

  const toSync = filterTable
    ? tables.filter(t => t.name === filterTable)
    : tables;

  if (filterTable && toSync.length === 0) {
    console.error(`"${filterTable}" is not listed in snowdb.config.yaml.`);
    process.exit(1);
  }

  // Load credentials
  const secrets  = loadSecrets();
  const snowBase = `https://${secrets.SNOW_INSTANCE}`;
  const auth     = "Basic " + Buffer.from(`${secrets.SNOW_USER}:${secrets.SNOW_PASS}`).toString("base64");
  const instance = secrets.SNOW_INSTANCE.split(".")[0]; // e.g. "dev123456"

  // Open snow.db
  const conn = await open();

  try {
    for (const tableConfig of toSync) {
      await syncTable(conn, auth, snowBase, instance, tableConfig);
    }
    console.log("Done.");
  } finally {
    close();
  }
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});