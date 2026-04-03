const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { TOOLS, createHandler } = require("../lib");

const EXPECTED_TOOLS = [
  "jira_get_issue",
  "jira_search_issues",
  "jira_create_issue",
  "jira_update_issue",
  "jira_transition_issue",
  "jira_assign_issue",
  "jira_add_comment",
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
  const noop = async () => {};
  const handle = createHandler(noop);

  test("returns isError for unknown tool", async () => {
    const result = await handle("jira_nonexistent", {});
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Unknown tool/);
  });

  test("returns isError when jira function throws", async () => {
    const failing = async () => { throw new Error("network error"); };
    const failHandler = createHandler(failing);
    const result = await failHandler("jira_get_issue", { key: "AEI-1" });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /network error/);
  });

  test("jira_transition_issue returns error when status not found", async () => {
    const mockJira = async (method, path) => {
      if (path.includes("/transitions")) return { transitions: [{ id: "1", name: "Done" }] };
    };
    const handle = createHandler(mockJira);
    const result = await handle("jira_transition_issue", { key: "AEI-1", status: "Nonexistent" });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /not found/);
  });

  test("jira_transition_issue succeeds when status matches", async () => {
    const mockJira = async (method, path, body) => {
      if (path.includes("/transitions") && method === "GET") return { transitions: [{ id: "41", name: "Done" }] };
      if (path.includes("/transitions") && method === "POST") return { ok: true };
    };
    const handle = createHandler(mockJira);
    const result = await handle("jira_transition_issue", { key: "AEI-1", status: "done" });
    assert.equal(result.isError, undefined);
  });
});
