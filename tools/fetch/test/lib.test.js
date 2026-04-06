"use strict";

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { parseSecrets, resolveField } = require("../lib");

describe("parseSecrets", () => {
  test("parses key=value pairs", () => {
    const result = parseSecrets("FOO=bar\nBAZ=qux");
    assert.deepEqual(result, { FOO: "bar", BAZ: "qux" });
  });

  test("ignores blank lines", () => {
    const result = parseSecrets("\nFOO=bar\n\n");
    assert.deepEqual(result, { FOO: "bar" });
  });

  test("ignores comment lines", () => {
    const result = parseSecrets("# comment\nFOO=bar");
    assert.deepEqual(result, { FOO: "bar" });
  });

  test("ignores lines without =", () => {
    const result = parseSecrets("INVALID\nFOO=bar");
    assert.deepEqual(result, { FOO: "bar" });
  });

  test("preserves values that contain = signs", () => {
    const result = parseSecrets("TOKEN=abc=def==");
    assert.deepEqual(result, { TOKEN: "abc=def==" });
  });

  test("returns empty object for empty input", () => {
    assert.deepEqual(parseSecrets(""), {});
  });
});

describe("resolveField", () => {
  test("returns preferredField immediately when provided", () => {
    const result = resolveField([], "sys_script_include", "client_script");
    assert.equal(result, "client_script");
  });

  test("throws when no rows and no preferred field", () => {
    assert.throws(
      () => resolveField([], "sys_script_include", null),
      /No script fields found/
    );
  });

  test("returns the single field when only one row", () => {
    const result = resolveField([["script", "script"]], "sys_script_include", null);
    assert.equal(result, "script");
  });

  test("returns 'script' field when multiple rows include one named script", () => {
    const rows = [["client_script", "script"], ["script", "script"], ["condition", "script"]];
    const result = resolveField(rows, "sys_ui_action", null);
    assert.equal(result, "script");
  });

  test("throws with options listed when multiple rows and none named script", () => {
    const rows = [["client_script_v2", "script"], ["condition", "script"]];
    assert.throws(
      () => resolveField(rows, "sys_ui_action", null),
      /multiple script fields/
    );
  });

  test("error message includes --field options when disambiguation needed", () => {
    const rows = [["client_script_v2", "script"], ["condition", "script"]];
    try {
      resolveField(rows, "sys_ui_action", null);
      assert.fail("expected throw");
    } catch (err) {
      assert.match(err.message, /--field client_script_v2/);
      assert.match(err.message, /--field condition/);
    }
  });
});