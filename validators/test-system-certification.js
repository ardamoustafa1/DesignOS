#!/usr/bin/env node
'use strict';
const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const run = spawnSync(process.execPath, [path.join(root, 'bin/designos.js'), 'system-certify', '--json'], { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
assert.equal(run.status, 0, run.stderr || run.stdout);
const report = JSON.parse(run.stdout.slice(run.stdout.indexOf('{')));
assert.ok(report.summary.total >= 200);
assert.equal(report.systems.find(item => item.id === 'kiln').certified, true);
assert.equal(report.summary.blocked, 0, 'P2 production catalog must contain no blocked systems');
assert.equal(report.summary.certified, report.summary.total);
assert.ok(report.systems.every(item => Object.values(item.checks).every(Boolean)), 'every picker system must pass every certification dimension');
console.log(`system-certification: ${report.summary.certified}/${report.summary.total} production systems certified; zero blocked picker entries`);
