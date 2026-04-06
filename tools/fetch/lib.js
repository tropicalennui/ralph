"use strict";

/**
 * Pure, injectable functions extracted from fetch.js for testability.
 */

/**
 * Parse a .secrets-format string into a key→value object.
 * Lines beginning with # and blank lines are ignored.
 */
function parseSecrets(text) {
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

/**
 * Resolve which script field to use for a given table.
 *
 * @param {Array<[string, string]>} rows  Rows from script_fields: [field_name, field_type]
 * @param {string} table                  Table name (used in error messages only)
 * @param {string|null} preferredField    Value of --field flag, or null
 * @returns {string} The resolved field name
 * @throws {Error} When no fields exist or disambiguation is required
 */
function resolveField(rows, table, preferredField) {
  if (preferredField) return preferredField;

  if (rows.length === 0) {
    throw new Error(
      `No script fields found for table "${table}" in the local DB.\n` +
      `Re-seed with: node tools/fetch/seed-script-fields.js <result-file>`
    );
  }

  if (rows.length === 1) return rows[0][0];

  const scriptField = rows.find(([f]) => f === "script");
  if (scriptField) return scriptField[0];

  const options = rows.map(([f, t]) => `  --field ${f}  (${t})`).join("\n");
  throw new Error(
    `Table "${table}" has multiple script fields. Specify one with --field:\n${options}`
  );
}

module.exports = { parseSecrets, resolveField };