#!/usr/bin/env node
'use strict';

/**
 * designos-detect — the DesignOS validator registry, standalone.
 *
 *   designos-detect [dir] [--rule <id>] [--json] [--out ledger.json]   # the 40-rule sweep
 *   designos-detect motion-gaps [dir] [--limit 7] [--json]             # advisory, never fails
 *   designos-detect signature-check [dir] [--memory memory/design.md] [--json]
 *   designos-detect originality-check <file> [--corpus path.json] [--add] [--json]
 *
 * A standalone, dependency-free package wrapping the same rule registry documented at
 * https://github.com/ardamoustafa1/DesignOS/blob/main/validators/rule-registry.js — this
 * package exists so a project can install the detector alone, without cloning the full
 * DesignOS knowledge base. `npm run vendor` (in the parent repo) keeps lib/ in sync with
 * validators/; this file never edits lib/ directly.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const LIB = path.join(__dirname, '..', 'lib');
const CWD = process.cwd();

function fail(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
  process.exit(1);
}

function argValue(args, name, fallback = '') {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
}

function positional(args, valueFlags) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { if (valueFlags.has(args[i])) i++; continue; }
    out.push(args[i]);
  }
  return out;
}

function detect(args) {
  const dir = positional(args, new Set(['--rule', '--out']))[0] || '.';
  const rule = argValue(args, '--rule', '');
  const outArg = argValue(args, '--out', '');
  const ledgerPath = outArg ? path.resolve(CWD, outArg) : path.join(CWD, '.designos-detect', 'ledger.json');
  const runnerArgs = [path.join(LIB, 'run-registry.js'), dir, '--with-refs', '--json-out', ledgerPath];
  if (rule) runnerArgs.push('--rule', rule);
  const result = spawnSync(process.execPath, runnerArgs, { cwd: CWD, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
  const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : null;

  if (args.includes('--json')) {
    console.log(JSON.stringify(ledger || { error: 'ledger not produced', stderr: result.stderr }, null, 2));
  } else if (ledger) {
    console.log(`designos-detect — ${dir}${rule ? ` (rule: ${rule})` : ''}`);
    console.log(`${ledger.summary.findingCount} finding(s) across ${ledger.summary.runs} provider run(s) — by severity: ${JSON.stringify(ledger.summary.bySeverity)}`);
    for (const f of ledger.findings) console.log(`  ${f.severity}  ${f.rule}  ${f.file}:${f.line}  ${f.message}`);
    console.log(`Ledger written to ${path.relative(CWD, ledgerPath)}`);
  } else {
    fail(`no ledger produced: ${(result.stderr || result.stdout || '').trim().slice(0, 300)}`);
  }
  if (ledger && ledger.summary.findingCount > 0) process.exit(2);
  if (!ledger || (result.status !== 0 && ledger.summary.findingCount === 0)) fail('a repository-scope provider failed — see output above.');
}

function passthrough(script, args) {
  const result = spawnSync(process.execPath, [path.join(LIB, script), ...args], { cwd: CWD, stdio: 'inherit' });
  process.exit(result.status || 0);
}

const [, , cmd, ...rest] = process.argv;
switch (cmd) {
  case 'motion-gaps': passthrough('check-motion-gaps.js', rest); break;
  case 'signature-check': passthrough('check-signature-consistency.js', rest); break;
  case 'originality-check': passthrough('check-originality.js', rest); break;
  case 'help':
  case '--help':
    console.log('Usage: designos-detect [dir] [--rule <id>] [--json] [--out ledger.json]');
    console.log('       designos-detect motion-gaps|signature-check|originality-check ...');
    break;
  default: detect(process.argv.slice(2));
}
