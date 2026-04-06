"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { mapSnowType, val, dv, classifyRecord, buildValues } = require("../lib");

describe("mapSnowType", () => {
  test("maps boolean to BOOLEAN", () => {
    assert.equal(mapSnowType("active", "boolean"), "BOOLEAN");
  });

  test("maps integer to INTEGER", () => {
    assert.equal(mapSnowType("priority", "integer"), "INTEGER");
  });

  test("maps float, decimal, currency, currency2, price to DOUBLE", () => {
    for (const t of ["float", "decimal", "currency", "currency2", "price"]) {
      assert.equal(mapSnowType("amount", t), "DOUBLE");
    }
  });

  test("maps glide_date_time to TIMESTAMP", () => {
    assert.equal(mapSnowType("opened_at", "glide_date_time"), "TIMESTAMP");
  });

  test("maps glide_date to DATE", () => {
    assert.equal(mapSnowType("due_date", "glide_date"), "DATE");
  });

  test("maps reference to VARCHAR", () => {
    assert.equal(mapSnowType("assigned_to", "reference"), "VARCHAR");
  });

  test("maps unknown types to VARCHAR", () => {
    assert.equal(mapSnowType("some_field", "journal_input"), "VARCHAR");
  });

  test("forces sys_updated_on to VARCHAR regardless of internal_type", () => {
    assert.equal(mapSnowType("sys_updated_on", "glide_date_time"), "VARCHAR");
  });
});

describe("val", () => {
  test("extracts value from {value, display_value} object", () => {
    assert.equal(val({ value: "abc", display_value: "ABC" }), "abc");
  });

  test("returns null for empty string value", () => {
    assert.equal(val({ value: "", display_value: "ABC" }), null);
  });

  test("returns null for null input", () => {
    assert.equal(val(null), null);
  });

  test("returns scalar string directly", () => {
    assert.equal(val("hello"), "hello");
  });

  test("returns null for empty scalar string", () => {
    assert.equal(val(""), null);
  });
});

describe("dv", () => {
  test("extracts display_value from object", () => {
    assert.equal(dv({ value: "abc", display_value: "ABC" }), "ABC");
  });

  test("falls back to value when display_value absent", () => {
    assert.equal(dv({ value: "abc" }), "abc");
  });

  test("returns null for null input", () => {
    assert.equal(dv(null), null);
  });

  test("returns scalar string directly", () => {
    assert.equal(dv("hello"), "hello");
  });
});

describe("classifyRecord", () => {
  test("returns insert when prior is undefined", () => {
    assert.equal(classifyRecord(undefined, "2026-01-01 00:00:00"), "insert");
  });

  test("returns skip when sys_updated_on matches and not deleted", () => {
    const prior = { sysUpdatedOn: "2026-01-01 00:00:00", deleted: false };
    assert.equal(classifyRecord(prior, "2026-01-01 00:00:00"), "skip");
  });

  test("returns update when sys_updated_on differs", () => {
    const prior = { sysUpdatedOn: "2026-01-01 00:00:00", deleted: false };
    assert.equal(classifyRecord(prior, "2026-02-01 00:00:00"), "update");
  });

  test("returns update when record was soft-deleted (un-deletion)", () => {
    const prior = { sysUpdatedOn: "2026-01-01 00:00:00", deleted: true };
    assert.equal(classifyRecord(prior, "2026-01-01 00:00:00"), "update");
  });
});

describe("buildValues", () => {
  const record = {
    state:       { value: "1", display_value: "Open" },
    assigned_to: { value: "abc123", display_value: "John Doe" },
  };

  test("extracts val() for regular columns", () => {
    const columns = [{ name: "state", duckdbType: "VARCHAR" }];
    assert.deepEqual(buildValues(record, columns), ["1"]);
  });

  test("extracts dv() for _dv columns", () => {
    const columns = [{ name: "assigned_to_dv", duckdbType: "VARCHAR" }];
    assert.deepEqual(buildValues(record, columns), ["John Doe"]);
  });

  test("handles mixed regular and _dv columns", () => {
    const columns = [
      { name: "assigned_to", duckdbType: "VARCHAR" },
      { name: "assigned_to_dv", duckdbType: "VARCHAR" },
    ];
    assert.deepEqual(buildValues(record, columns), ["abc123", "John Doe"]);
  });

  test("returns null for missing fields", () => {
    const columns = [{ name: "nonexistent", duckdbType: "VARCHAR" }];
    assert.deepEqual(buildValues(record, columns), [null]);
  });
});