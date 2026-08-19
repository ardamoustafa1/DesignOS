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
const ruleFilterIndex = args.indexOf('--rule');
const ruleFilter = ruleFilterIndex >= 0 ? args[ruleFilterIndex + 1] : '';
const VALUE_FLAGS = new Set(['--json-out', '--rule']);
const targets = args.filter((arg, index) => !arg.startsWith('--')
  && (index === 0 || !VALUE_FLAGS.has(args[index - 1])));
if (!targets.length) targets.push('.');

// Node providers all speak the same structured-findings contract now
// (check-registry.js originally, check-motion.js / check-drift.js / check-a11y-basics.js /
// check-token-contrast.js / check-aesthetic-slop.js extended to match): `--json` prints
// `{ target, findings: [{file, line, rule, severity, message}], count }` to stdout and
// exits 0 clean / 2 findings. That lets this runner build one flat, machine-readable
// findings array across every validator instead of a blob of provider stdout per script.
const ledger = { schema: 2, generatedAt: new Date().toISOString(), providers: [], findings: [], passed: true };
for (const provider of PROVIDERS) {
  if (provider.scope === 'repository' && !withRefs) continue;
  if (ruleFilter && provider.ruleIds.length && !provider.ruleIds.includes(ruleFilter)) continue;
  const providerTargets = provider.scope === 'repository' ? [null] : targets;
  for (const target of providerTargets) {
    const command = path.join(__dirname, provider.command);
    const supportsJson = provider.runtime === 'node';
    const extraArgs = provider.extraArgs || [];
    const invocation = provider.runtime === 'bash'
      ? { executable: 'bash', argv: [command] }
      : { executable: process.execPath, argv: supportsJson ? [command, target, '--json', ...extraArgs] : [command, target, ...extraArgs] };
    const result = spawnSync(invocation.executable, invocation.argv, {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32,
    });
    let parsed = null;
    let jsonParseError = null;
    if (supportsJson) {
      try { parsed = JSON.parse(result.stdout); } catch (err) { parsed = null; jsonParseError = err.message; }
    }
    // A provider that claims --json support but doesn't emit valid JSON is a contract
    // break, not a clean run with zero findings — surface it instead of silently dropping
    // whatever that provider found (this is exactly how a real finding used to vanish from
    // the ledger: a stray console.log before the JSON blob broke JSON.parse here).
    if (jsonParseError) {
      console.error(`registry-runner: ${provider.id} did not emit valid JSON on stdout — findings from this provider are NOT in the ledger (${jsonParseError})`);
    }
    // check-registry.js's finding() (rule-registry.js) names the field `id`; every other
    // validator's --json output names it `rule`. Normalize to `rule` here so a consumer
    // of the flat ledger never has to know which provider a finding came from.
    const providerFindings = parsed && Array.isArray(parsed.findings)
      ? parsed.findings
        .map(f => ({ ...f, rule: f.rule || f.id }))
        .filter(f => !ruleFilter || f.rule === ruleFilter)
        .map(f => ({ ...f, provider: provider.id }))
      : [];
    const item = {
      provider: provider.id,
      target: target || 'repository',
      command: provider.command,
      capabilities: provider.capabilities,
      ruleIds: provider.ruleIds,
      status: result.status,
      passed: result.status === 0 && !jsonParseError,
      findingCount: providerFindings.length,
      jsonParseError,
      output: parsed ? '' : `${result.stdout || ''}${result.stderr || ''}`.trim(),
    };
    ledger.providers.push(item);
    ledger.findings.push(...providerFindings);
    if (item.output) process.stdout.write(`${item.output}\n`);
    if (!item.passed) ledger.passed = false;
  }
}
ledger.summary = {
  runs: ledger.providers.length,
  passed: ledger.providers.filter(item => item.passed).length,
  failed: ledger.providers.filter(item => !item.passed).length,
  findingCount: ledger.findings.length,
  bySeverity: ledger.findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {}),
};
if (jsonOut) {
  const output = path.resolve(process.cwd(), jsonOut);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(ledger, null, 2) + '\n');
}
if (args.includes('--json')) console.log(JSON.stringify(ledger, null, 2));
console.log(`registry-runner: ${ledger.passed ? 'clean' : 'failed'} (${ledger.summary.passed}/${ledger.summary.runs} provider runs, ${ledger.summary.findingCount} finding(s))`);
if (!ledger.passed) process.exit(1);
