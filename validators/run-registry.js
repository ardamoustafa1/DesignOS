#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PROVIDERS } = require('./rule-registry');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const withRefs = args.includes('--with-refs');
const jsonOutIndex = args.indexOf('--json-out');
const jsonOut = jsonOutIndex >= 0 ? args[jsonOutIndex + 1] : '';
const targets = args.filter((arg, index) => !arg.startsWith('--')
  && (index === 0 || !['--json-out'].includes(args[index - 1])));
if (!targets.length) targets.push('.');

const ledger = { schema: 1, generatedAt: new Date().toISOString(), providers: [], passed: true };
for (const provider of PROVIDERS) {
  if (provider.scope === 'repository' && !withRefs) continue;
  const providerTargets = provider.scope === 'repository' ? [null] : targets;
  for (const target of providerTargets) {
    const command = path.join(__dirname, provider.command);
    const invocation = provider.runtime === 'bash'
      ? { executable: 'bash', argv: [command] }
      : { executable: process.execPath, argv: [command, target] };
    const result = spawnSync(invocation.executable, invocation.argv, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32,
    });
    const item = {
      provider: provider.id,
      target: target || 'repository',
      command: provider.command,
      capabilities: provider.capabilities,
      ruleIds: provider.ruleIds,
      status: result.status,
      passed: result.status === 0,
      output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
    };
    ledger.providers.push(item);
    if (item.output) process.stdout.write(`${item.output}\n`);
    if (!item.passed) ledger.passed = false;
  }
}
ledger.summary = {
  runs: ledger.providers.length,
  passed: ledger.providers.filter(item => item.passed).length,
  failed: ledger.providers.filter(item => !item.passed).length,
};
if (jsonOut) {
  const output = path.resolve(process.cwd(), jsonOut);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(ledger, null, 2) + '\n');
}
console.log(`registry-runner: ${ledger.passed ? 'clean' : 'failed'} (${ledger.summary.passed}/${ledger.summary.runs} provider runs)`);
if (!ledger.passed) process.exit(1);
