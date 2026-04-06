#!/usr/bin/env node
/**
 * fetch — fetch a script field from ServiceNow and save it to WIP/
 *
 * Usage:
 *   node tools/fetch/fetch.js <table> <name> [--fresh] [--field <fieldname>]
 *
 * Examples:
 *   node tools/fetch/fetch.js sys_script_include "MyScriptInclude"
 *   node tools/fetch/fetch.js sys_ui_action "My UI Action" --field client_script_v2
 *   node tools/fetch/fetch.js sys_script_include "MyScriptInclude" --fresh
 *
 * Flags:
 *   --fresh          Skip cache, always fetch from SNOW
 *   --field <name>   Specify which script field to use (required when a table
 *                    has multiple script fields and you want a non-default one)
 *
 * Output: WIP/<table>_<name>.js
 */

const fs = require("fs");
const path = require("path");
const { getConnection, close } = require("../db");
const { parseSecrets, resolveField } = require("./lib");

const ROOT = path.join(__dirname, "..", "..");
const WIP_DIR = path.join(ROOT, "WIP");
const SECRETS_FILE = path.join(ROOT, ".secrets");

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

function loadSecrets() {
  return parseSecrets(fs.readFileSync(SECRETS_FILE, "utf8"));
}

// ---------------------------------------------------------------------------
// ServiceNow REST
// ---------------------------------------------------------------------------

async function fetchFromSnow(secrets, table, name, field) {
  const base = `https://${secrets.SNOW_INSTANCE}/api/now/table`;
  const auth = "Basic " + Buffer.from(`${secrets.SNOW_USER}:${secrets.SNOW_PASS}`).toString("base64");
  const query = encodeURIComponent(`name=${name}`);
  const url = `${base}/${table}?sysparm_query=${query}&sysparm_fields=sys_id,name,${field}&sysparm_limit=1`;

  const res = await fetch(url, {
    headers: { Authorization: auth, Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SNOW ${res.status}: ${body}`);
  }

  const data = await res.json();
  const records = data.result;
  if (!records || records.length === 0) {
    throw new Error(`No record found in ${table} with name="${name}"`);
  }

  const record = records[0];
  const content = record[field];
  if (content == null) {
    throw new Error(`Field "${field}" is null/empty on the matched record`);
  }

  return { sys_id: record.sys_id, content };
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

async function getScriptField(conn, table, preferredField) {
  const result = await conn.runAndReadAll(
    `SELECT field_name, field_type FROM script_fields WHERE table_name = $1 ORDER BY field_type`,
    [table]
  );
  return resolveField(result.getRows(), table, preferredField);
}

async function getCached(conn, table, name, field) {
  const result = await conn.runAndReadAll(
    `SELECT content FROM script_cache WHERE table_name = $1 AND record_name = $2 AND field_name = $3`,
    [table, name, field]
  );
  const rows = result.getRows();
  return rows.length > 0 ? rows[0][0] : null;
}

async function upsertCache(conn, table, name, field, sysId, content) {
  await conn.run(
    `INSERT INTO script_cache (table_name, record_name, field_name, sys_id, content, fetched_at)
     VALUES ($1, $2, $3, $4, $5, current_timestamp)
     ON CONFLICT (table_name, record_name, field_name)
     DO UPDATE SET sys_id = excluded.sys_id, content = excluded.content, fetched_at = excluded.fetched_at`,
    [table, name, field, sysId, content]
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === "--help" || args[0] === "-h") {
    console.log("Usage: node tools/fetch/fetch.js <table> <name> [--fresh] [--field <fieldname>]");
    process.exit(args.length < 2 ? 1 : 0);
  }

  const table = args[0];
  const name = args[1];
  let fresh = false;
  let preferredField = null;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === "--fresh") { fresh = true; }
    else if (args[i] === "--field" && args[i + 1]) { preferredField = args[++i]; }
  }

  const conn = await getConnection();
  const field = await getScriptField(conn, table, preferredField);

  let content;

  if (!fresh) {
    content = await getCached(conn, table, name, field);
    if (content !== null) {
      console.log(`Using cached copy (field: ${field}). Use --fresh to re-fetch.`);
    }
  }

  if (content == null) {
    console.log(`Fetching from ServiceNow: ${table} / ${name} / ${field} ...`);
    const secrets = loadSecrets();
    const fetched = await fetchFromSnow(secrets, table, name, field);
    content = fetched.content;
    await upsertCache(conn, table, name, field, fetched.sys_id, content);
    console.log(`Fetched and cached (sys_id: ${fetched.sys_id}).`);
  }

  await close();

  fs.mkdirSync(WIP_DIR, { recursive: true });
  const safeName = name.replace(/[^a-zA-Z0-9_\-. ]/g, "_");
  const filename = `${table}_${safeName}.js`;
  const outPath = path.join(WIP_DIR, filename);
  fs.writeFileSync(outPath, content, "utf8");

  console.log(`Saved → WIP/${filename}`);
}

main().catch((err) => { console.error(`Error: ${err.message}`); process.exit(1); });
