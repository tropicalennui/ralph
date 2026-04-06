"use strict";

/**
 * snowdb.js — DuckDB connection and schema management for snow.db.
 *
 * snow.db is separate from ralph.db — it is dedicated to mirrored SNOW data
 * and has a fully dynamic schema (one table per synced SNOW table).
 */

const { DuckDBInstance } = require("@duckdb/node-api");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "snow.db");

let _instance = null;
let _conn = null;

async function open() {
  _instance = await DuckDBInstance.create(DB_PATH);
  _conn = await _instance.connect();
  return _conn;
}

function close() {
  if (_conn)     { _conn.closeSync();     _conn = null; }
  if (_instance) { _instance.closeSync(); _instance = null; }
}

/**
 * Ensure a mirror table exists with the required columns.
 * Creates the table if it doesn't exist; adds any missing columns if it does.
 *
 * columns: Array of { name: string, duckdbType: string }
 *   Must NOT include "instance" or "sys_id" — those are always added by this function.
 */
async function ensureTable(conn, tableName, columns) {
  const colDefs = [
    "instance    VARCHAR   NOT NULL",
    "sys_id      VARCHAR   NOT NULL",
    ...columns.map(c => `"${c.name}" ${c.duckdbType}`),
    "_deleted    BOOLEAN   DEFAULT FALSE",
    "_deleted_at TIMESTAMP",
    `PRIMARY KEY (instance, sys_id)`,
  ].join(",\n    ");

  await conn.run(`CREATE TABLE IF NOT EXISTS "${tableName}" (\n    ${colDefs}\n)`);

  // Add any columns that appeared in a later sync (schema evolution)
  const result = await conn.runAndReadAll(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
    [tableName]
  );
  const existing = new Set(result.getRows().map(r => r[0]));

  for (const col of columns) {
    if (!existing.has(col.name)) {
      await conn.run(`ALTER TABLE "${tableName}" ADD COLUMN "${col.name}" ${col.duckdbType}`);
      console.log(`  + added column ${tableName}.${col.name} (${col.duckdbType})`);
    }
  }
}

module.exports = { open, close, ensureTable };