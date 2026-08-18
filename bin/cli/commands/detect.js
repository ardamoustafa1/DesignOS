'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * `designos detect` — the productized front door to the rule registry
 * (`validators/rule-registry.js`'s RULES.length is the source of truth; check there
 * before trusting a number restated in prose like this one).
 *
 * `audit` already ran every provider and wrote a pass/fail ledger; this command is the
 * same mechanical floor exposed the way a CI pipeline or a pre-commit hook actually wants
 * it: one flat, severity-tagged findings array (file/line/rule/severity/message), a
 * `--rule <id>` filter to scope a single check, and a stable exit-code contract —
 * 0 clean, 2 findings, 1 a provider itself failed to run.
 */
function execute(target, args, context) {
  const dir = target || '.';
  const asJson = args.includes('--json');
  const rule = context.argValue(args, '--rule', '');
  const outArg = context.argValue(args, '--out', '');
  const vdir = fs.existsSync(path.join(context.cwd, 'DesignOS', 'validators'))
    ? path.join(context.cwd, 'DesignOS', 'validators')
    : path.join(context.pkgRoot, 'validators');
  if (!fs.existsSync(path.join(context.cwd, dir)) && dir !== '.') {
    context.fail(`Target "${dir}" not found — usage: ${context.run} detect [dir] [--rule <id>] [--json] [--out ledger.json]`);
  }
  const ledgerPath = outArg
    ? path.resolve(context.cwd, outArg)
    : path.join(context.cwd, '.designos', 'detect-ledger.json');
  const runnerArgs = [path.join(vdir, 'run-registry.js'), dir, '--with-refs', '--json-out', ledgerPath];
  if (rule) runnerArgs.push('--rule', rule);
  const result = spawnSync(process.execPath, runnerArgs, {
    cwd: context.cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32,
  });
  const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : null;

  if (asJson) {
    console.log(JSON.stringify(ledger || { error: 'ledger not produced', stderr: result.stderr }, null, 2));
  } else if (ledger) {
    context.log(`designos detect — ${dir}${rule ? ` (rule: ${rule})` : ''}`);
    context.log(`${ledger.summary.findingCount} finding(s) across ${ledger.summary.runs} provider run(s) — by severity: ${JSON.stringify(ledger.summary.bySeverity)}`);
    for (const f of ledger.findings) {
      context.log(`  ${f.severity}  ${f.rule}  ${f.file}:${f.line}  ${f.message}`);
    }
    context.log(`Ledger written to ${path.relative(context.cwd, ledgerPath)}`);
  } else {
    context.warn(`detect: no ledger was produced (${(result.stderr || result.stdout || '').trim().slice(0, 300)})`);
  }

  if (ledger && ledger.summary.findingCount > 0) process.exit(2);
  if (!ledger || (result.status !== 0 && ledger.summary.findingCount === 0)) {
    context.fail('detect: a repository-scope provider failed to run cleanly — see output above.');
  }
  context.ok(`detect: clean — mechanical floor holds${rule ? ` for rule ${rule}` : ''}.`);
}

module.exports = { execute };
