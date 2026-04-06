"use strict";

/**
 * schema.js — discover field definitions for a ServiceNow table.
 *
 * Walks the table's inheritance chain (via sys_db_object) then queries
 * sys_dictionary for all fields across the chain, so inherited fields
 * (e.g. sys_updated_on from sys_metadata) are included.
 */

const { mapSnowType } = require("./lib");

function strVal(f) {
  if (f == null) return null;
  return typeof f === "object" ? (f.value ?? null) : String(f);
}

/**
 * Follow the super_class chain to get the full table hierarchy.
 * Returns an array like ["sys_script_include", "sys_metadata", ...],
 * most-specific table first.
 */
async function getTableHierarchy(auth, snowBase, tableName) {
  const hierarchy = [tableName];
  let current = tableName;

  for (let depth = 0; depth < 20; depth++) {
    const url =
      `${snowBase}/api/now/table/sys_db_object` +
      `?sysparm_query=${encodeURIComponent(`name=${current}`)}` +
      `&sysparm_fields=super_class.name&sysparm_limit=1`;

    const res = await fetch(url, { headers: { Authorization: auth, Accept: "application/json" } });
    if (!res.ok) break;

    const data = await res.json();
    const rec = data.result?.[0];
    if (!rec) break;

    const parent = strVal(rec["super_class.name"]);
    if (!parent || parent === current) break;

    hierarchy.push(parent);
    current = parent;
  }

  return hierarchy;
}

/**
 * Fetch the full column schema for a table (including inherited fields).
 * Returns an array of { element, duckdbType, isReference }.
 * Child table definitions take precedence over parent definitions.
 */
async function fetchSchema(auth, snowBase, tableName) {
  const hierarchy = await getTableHierarchy(auth, snowBase, tableName);

  const nameIn = hierarchy.join(",");
  const url =
    `${snowBase}/api/now/table/sys_dictionary` +
    `?sysparm_query=${encodeURIComponent(`nameIN${nameIn}^elementISNOTEMPTY^active=true`)}` +
    `&sysparm_fields=name,element,internal_type` +
    `&sysparm_limit=2000`;

  const res = await fetch(url, { headers: { Authorization: auth, Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Schema fetch failed for ${tableName}: HTTP ${res.status}`);
  }

  const data = await res.json();

  // Group fields by table so we can apply hierarchy order
  const byTable = {};
  for (const r of data.result ?? []) {
    const tbl     = strVal(r.name) ?? "";
    const element = strVal(r.element) ?? "";
    const itype   = strVal(r.internal_type) ?? "";
    if (!element) continue;

    const duckdbType = mapSnowType(element, itype);

    if (!byTable[tbl]) byTable[tbl] = [];
    byTable[tbl].push({ element, duckdbType, isReference: itype === "reference" });
  }

  // Merge: apply ancestor fields first, child fields override
  const fieldMap = new Map();
  for (const tbl of [...hierarchy].reverse()) {
    for (const field of byTable[tbl] ?? []) {
      fieldMap.set(field.element, field);
    }
  }

  return Array.from(fieldMap.values());
}

module.exports = { fetchSchema };