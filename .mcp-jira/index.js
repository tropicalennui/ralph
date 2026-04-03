#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { TOOLS, createHandler } = require("./lib");

const SITE = process.env.JIRA_SITE;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_TOKEN;
const BASE = `https://${SITE}.atlassian.net/rest/api/3`;
const AUTH = Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");

async function jira(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${AUTH}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return { ok: true };
  const data = await res.json();
  if (!res.ok) throw new Error(data.errorMessages?.join(", ") || JSON.stringify(data.errors) || `HTTP ${res.status}`);
  return data;
}

const handleTool = createHandler(jira);

const server = new Server(
  { name: "mcp-jira", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (req) => handleTool(req.params.name, req.params.arguments));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
