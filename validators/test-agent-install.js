#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const agents = Object.keys(require('../runtime/agent/capabilities').AGENTS);
assert.ok(agents.length >= 25, `expected at least 25 runtime adapters, received ${agents.length}`);
for (const agent of agents) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), `designos-${agent}-`));
  const installed = spawnSync(process.execPath, [path.join(root, 'bin/designos.js'), 'agent', 'install', agent], { cwd, encoding: 'utf8' });
  assert.strictEqual(installed.status, 0, `${agent}: ${installed.stderr || installed.stdout}`);
  const doctor = spawnSync(process.execPath, [path.join(root, 'bin/designos.js'), 'agent', 'doctor', agent, '--json'], { cwd, encoding: 'utf8' });
  assert.strictEqual(doctor.status, 0, `${agent}: ${doctor.stderr || doctor.stdout}`);
  const report = JSON.parse(doctor.stdout.slice(doctor.stdout.indexOf('{')));
  assert.equal(report.ready, true, `${agent} should be ready`);
  const removed = spawnSync(process.execPath, [path.join(root, 'bin/designos.js'), 'agent', 'uninstall', agent], { cwd, encoding: 'utf8' });
  assert.strictEqual(removed.status, 0, `${agent}: ${removed.stderr || removed.stdout}`);
  const after = spawnSync(process.execPath, [path.join(root, 'bin/designos.js'), 'agent', 'doctor', agent, '--json'], { cwd, encoding: 'utf8' });
  assert.notStrictEqual(after.status, 0, `${agent}: doctor should fail after uninstall`);
  const afterReport = JSON.parse(after.stdout.slice(after.stdout.indexOf('{')));
  assert.equal(afterReport.config, false);
}
console.log(`agent-install: ${agents.length} agents pass install + rules + MCP handshake + safe uninstall`);
