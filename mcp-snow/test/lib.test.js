const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { TOOLS, createHandler } = require("../lib");

const EXPECTED_TOOLS = [
  "snow_query_records",
  "snow_get_record",
  "snow_create_record",
  "snow_update_record",
  "snow_delete_record",
  "snow_get_schema",
];

describe("TOOLS", () => {
  test("exposes the correct number of tools", () => {
    assert.equal(TOOLS.length, EXPECTED_TOOLS.length);
  });

  test("all expected tools are present", () => {
    const names = TOOLS.map((t) => t.name);
    for (const name of EXPECTED_TOOLS) {
      assert.ok(names.includes(name), `Missing tool: ${name}`);
    }
  });

  test("each tool has name, description, and inputSchema", () => {
    for (const tool of TOOLS) {
      assert.ok(tool.name, `Tool missing name`);
      assert.ok(tool.description, `${tool.name} missing description`);
      assert.ok(tool.inputSchema, `${tool.name} missing inputSchema`);
      assert.equal(tool.inputSchema.type, "object");
    }
  });

  test("each tool declares at least one required field", () => {
    for (const tool of TOOLS) {
      assert.ok(
        Array.isArray(tool.inputSchema.required) && tool.inputSchema.required.length > 0,
        `${tool.name} has no required fields`
      );
    }
  });
});

describe("createHandler", () => {
  test("returns isError for unknown tool", async () => {
    const handle = createHandler(async () => {});
    const result = await handle("snow_nonexistent", {});
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Unknown tool/);
  });

  test("returns isError when snow function throws", async () => {
    const failing = async () => { throw new Error("connection refused"); };
    const handle = createHandler(failing);
    const result = await handle("snow_get_record", { table: "incident", sys_id: "abc" });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /connection refused/);
  });

  test("snow_query_records passes correct sysparm_limit default", async () => {
    let capturedPath;
    const mockSnow = async (method, path) => { capturedPath = path; return []; };
    const handle = createHandler(mockSnow);
    await handle("snow_query_records", { table: "incident" });
    assert.match(capturedPath, /sysparm_limit=10/);
  });

  test("snow_query_records respects custom limit", async () => {
    let capturedPath;
    const mockSnow = async (method, path) => { capturedPath = path; return []; };
    const handle = createHandler(mockSnow);
    await handle("snow_query_records", { table: "incident", limit: 50 });
    assert.match(capturedPath, /sysparm_limit=50/);
  });

  test("snow_create_record calls POST with correct table", async () => {
    let capturedMethod, capturedPath;
    const mockSnow = async (method, path) => { capturedMethod = method; capturedPath = path; return {}; };
    const handle = createHandler(mockSnow);
    await handle("snow_create_record", { table: "incident", fields: { short_description: "Test" } });
    assert.equal(capturedMethod, "POST");
    assert.match(capturedPath, /\/table\/incident$/);
  });
});
