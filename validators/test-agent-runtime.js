#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { AGENTS, report } = require('../runtime/agent/capabilities');

assert.ok(AGENTS.kimi, 'Kimi adapter missing');
assert.ok(AGENTS.hermes, 'Hermes adapter missing');
const digests = new Set(Object.keys(AGENTS).map(agent => report(agent).kernelDigest));
assert.strictEqual(digests.size, 1, 'All adapters must resolve the same kernel digest');
assert.ok(Object.keys(AGENTS).every(agent => report(agent).runtimeCapabilities.includes('gate-execution')));

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-agent-export-'));
for (const agent of ['kimi', 'hermes']) {
  const exported = spawnSync(process.execPath, [path.join(__dirname, '../bin/designos.js'), 'export', agent], { cwd: fixture, encoding: 'utf8' });
  assert.strictEqual(exported.status, 0, exported.stderr);
  assert.ok(fs.readFileSync(path.join(fixture, 'AGENTS.md'), 'utf8').includes('DESIGNOS:BEGIN'));
}

const server = spawn(process.execPath, [path.join(__dirname, '../runtime/agent/server.js')], { cwd: path.join(__dirname, '..'), stdio: ['pipe', 'pipe', 'inherit'] });
let buffer = ''; const replies = [];
server.stdout.setEncoding('utf8');
server.stdout.on('data', chunk => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/); buffer = lines.pop();
  for (const line of lines.filter(Boolean)) replies.push(JSON.parse(line));
});
server.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })}\n`);
server.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })}\n`);
server.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'designos_route', arguments: { brief: 'animated portfolio landing page' } } })}\n`);
server.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'designos_memory_append', arguments: { file: '../escape.md', entry: 'must fail' } } })}\n`);

const deadline = setTimeout(() => {
  server.kill();
  console.error('agent-runtime: timed out waiting for MCP replies');
  process.exitCode = 1;
}, 3000);

const verify = setInterval(() => {
  if (replies.length < 4) return;
  clearInterval(verify);
  clearTimeout(deadline);
  server.kill();
  assert.strictEqual(replies.find(item => item.id === 1)?.result?.serverInfo?.name, 'designos-universal-runtime');
  const names = replies.find(item => item.id === 2)?.result?.tools?.map(tool => tool.name) || [];
  for (const required of ['designos_boot', 'designos_route', 'designos_review', 'designos_memory_append']) assert.ok(names.includes(required), `${required} missing`);
  const route = replies.find(item => item.id === 3)?.result?.content?.[0]?.text;
  assert.ok(route && JSON.parse(route).modules.length > 0, 'route returned no modules');
  assert.ok(replies.find(item => item.id === 4)?.error?.message.includes('allow-listed'), 'memory traversal was not rejected');
  console.log(`agent-runtime: ${Object.keys(AGENTS).length} adapters, 1 kernel digest, ${names.length} MCP tools — pass`);
}, 20);
