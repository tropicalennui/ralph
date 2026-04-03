#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { TOOLS, createHandler } = require("./lib");

const INSTANCE = process.env.SNOW_INSTANCE;
const USER = process.env.SNOW_USER;
const PASS = process.env.SNOW_PASS;
const BASE = `https://${INSTANCE}/api/now`;
const AUTH = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");

async function snow(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return { ok: true };
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || data?.error?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data.result ?? data;
}

const handleTool = createHandler(snow);

const server = new Server(
  { name: "mcp-snow", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (req) => handleTool(req.params.name, req.params.arguments));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
