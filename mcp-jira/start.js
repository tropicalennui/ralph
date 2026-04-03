#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const secretsPath = path.join(__dirname, "..", ".secrets");
if (fs.existsSync(secretsPath)) {
  for (const line of fs.readFileSync(secretsPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

require("./index.js");
