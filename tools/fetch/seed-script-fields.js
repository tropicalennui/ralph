#!/usr/bin/env node
/**
 * Seed the script_fields table from a sys_dictionary query result file.
 * Usage: node seed-script-fields.js <path-to-result-json>
 *
 * The input JSON is the raw MCP tool result: an array of { type, text } objects
 * where the first text entry contains a JSON array of sys_dictionary records.
 *
 * Re-run this any time you want to refresh the field map from a fresh SNOW query.
 */

const fs = require("fs");
const { getConnection, close } = require("../db");

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: node seed-script-fields.js <path-to-result-json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputFile, "utf8");
  const wrapper = JSON.parse(raw);
  const textEntry = wrapper.find((x) => x.type === "text");
  if (!textEntry) throw new Error("No text entry found in result file");
  const records = JSON.parse(textEntry.text);

  const conn = await getConnection();

  // Clear and repopulate
  await conn.run("DELETE FROM script_fields");

  let inserted = 0;
  const stmt = await conn.prepare(
    "INSERT INTO script_fields (table_name, field_name, field_type) VALUES ($1, $2, $3)"
  );

  for (const r of records) {
    if (!r.name || !r.element) continue;
    stmt.bind([r.name, r.element, r["internal_type.label"] ?? null]);
    await stmt.run();
    inserted++;
  }

  stmt.destroySync();
  await close();

  console.log(`Seeded ${inserted} script field records.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
