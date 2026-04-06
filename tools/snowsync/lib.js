"use strict";

/**
 * Pure, injectable functions extracted from snowsync.js and schema.js for testability.
 */

// ---------------------------------------------------------------------------
// SNOW type mapping (from schema.js)
// ---------------------------------------------------------------------------

const SNOW_TYPE_MAP = {
  boolean:         "BOOLEAN",
  integer:         "INTEGER",
  float:           "DOUBLE",
  decimal:         "DOUBLE",
  currency:        "DOUBLE",
  currency2:       "DOUBLE",
  price:           "DOUBLE",
  glide_date_time: "TIMESTAMP",
  glide_date:      "DATE",
  reference:       "VARCHAR",
};

const FORCE_VARCHAR = new Set(["sys_updated_on"]);

/**
 * Map a ServiceNow internal_type to a DuckDB column type.
 * sys_updated_on is always VARCHAR regardless of internal_type.
 */
function mapSnowType(element, internalType) {
  if (FORCE_VARCHAR.has(element)) return "VARCHAR";
  return SNOW_TYPE_MAP[internalType] ?? "VARCHAR";
}

// ---------------------------------------------------------------------------
// Field value extraction (sysparm_display_value=all returns {value, display_value})
// ---------------------------------------------------------------------------

/**
 * Extract the raw value from a SNOW field (may be a {value, display_value} object).
 * Returns null for empty strings.
 */
function val(f) {
  if (f == null) return null;
  const v = typeof f === "object" ? (f.value ?? null) : f;
  return v === "" ? null : v;
}

/**
 * Extract the display value from a SNOW field.
 * Falls back to value if display_value is absent.
 */
function dv(f) {
  if (f == null) return null;
  return typeof f === "object" ? (f.display_value ?? f.value ?? null) : f;
}

// ---------------------------------------------------------------------------
// Sync decision logic
// ---------------------------------------------------------------------------

/**
 * Determine what action to take for a record during sync.
 *
 * @param {{ sysUpdatedOn: string|null, deleted: boolean }|undefined} prior
 *   The existing row in snow.db, or undefined if not present.
 * @param {string|null} snowUpdatedOn  sys_updated_on from SNOW
 * @returns {"insert"|"update"|"skip"}
 */
function classifyRecord(prior, snowUpdatedOn) {
  if (!prior) return "insert";
  if (prior.deleted || prior.sysUpdatedOn !== snowUpdatedOn) return "update";
  return "skip";
}

// ---------------------------------------------------------------------------
// Column value builder
// ---------------------------------------------------------------------------

/**
 * Build the ordered array of values for a DB write, aligned to columns.
 * Reference _dv columns are derived from the base field using dv(); all others use val().
 */
function buildValues(record, columns) {
  return columns.map(c => {
    if (c.name.endsWith("_dv")) {
      return dv(record[c.name.slice(0, -3)]);
    }
    return val(record[c.name]);
  });
}

module.exports = { mapSnowType, val, dv, classifyRecord, buildValues };
