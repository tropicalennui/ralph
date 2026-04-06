const { DuckDBInstance } = require("@duckdb/node-api");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "ralph.db");

let _instance = null;
let _conn = null;

async function getConnection() {
  if (_conn) return _conn;
  _instance = await DuckDBInstance.create(DB_PATH);
  _conn = await _instance.connect();
  await migrate(_conn);
  return _conn;
}

async function migrate(conn) {
  await conn.run(`
    CREATE TABLE IF NOT EXISTS script_fields (
      table_name VARCHAR NOT NULL,
      field_name VARCHAR NOT NULL,
      field_type VARCHAR,
      PRIMARY KEY (table_name, field_name)
    )
  `);

  await conn.run(`
    CREATE TABLE IF NOT EXISTS script_cache (
      table_name  VARCHAR NOT NULL,
      record_name VARCHAR NOT NULL,
      field_name  VARCHAR NOT NULL,
      sys_id      VARCHAR,
      content     VARCHAR,
      fetched_at  TIMESTAMP DEFAULT current_timestamp,
      PRIMARY KEY (table_name, record_name, field_name)
    )
  `);
}

async function close() {
  if (_conn) { _conn.closeSync(); _conn = null; }
  if (_instance) { _instance.closeSync(); _instance = null; }
}

module.exports = { getConnection, close };