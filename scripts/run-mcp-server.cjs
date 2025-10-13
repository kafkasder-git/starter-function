#!/usr/bin/env node

/**
 * Secure MCP Server Runner
 *
 * Ensures Appwrite credentials are provided via environment variables before spawning the
 * Appwrite MCP server commands. This avoids hard-coding sensitive credentials in npm scripts.
 */

const { spawn } = require('child_process');

const REQUIRED_ENV_VARS = ['APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY', 'APPWRITE_ENDPOINT'];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[run-mcp-server] Missing required environment variables: ${missing.join(", ")}. Set them before running this command.`
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const isDebug = args.includes('--debug');
const filteredArgs = args.filter((arg) => arg !== '--debug');

const baseEnv = {
  ...process.env,
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
};

const command = isDebug ? 'npx' : 'uvx';
const commandArgs = isDebug
  ? ['@modelcontextprotocol/inspector', 'uvx', 'mcp-server-appwrite', ...filteredArgs]
  : ['mcp-server-appwrite', ...filteredArgs];

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: baseEnv,
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
