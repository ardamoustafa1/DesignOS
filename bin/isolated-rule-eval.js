#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { RULES } = require('../validators/rule-registry');

const ROOT = path.resolve(__dirname, '..');
const output = path.resolve(ROOT, process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1] : 'evals/isolated/registry-eval.json');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-isolated-rule-eval-'));
const results = [];

function runStatic(rule) {
  const fixture = path.join(ROOT, rule.fixture);
  const run = spawnSync(process.execPath, [path.join(ROOT, 'validators/check-registry.js'), fixture, '--json'], {
    cwd: ROOT, encoding: 'utf8',
  });
  let report = {};
  try { report = JSON.parse(run.stdout); } catch {}
  return {
    ruleId: rule.id, evaluator: 'isolated-static-black-box', fixture: rule.fixture,
    passed: Boolean(report.findings?.some(item => item.id === rule.id)),
    observed: report.findings?.map(item => item.id) || [],
  };
}

function runBrowser(rule) {
  const fixture = path.join(ROOT, rule.fixture);
  const slug = rule.id.replace(/[^a-z0-9]+/g, '-');
  const reportFile = path.join(temporary, `${slug}.json`);
  const screenshots = path.join(temporary, `${slug}-screenshots`);
  const argv = [path.join(ROOT, 'bin/browser-gate.js'), fixture, '--quick', '--out', reportFile, '--screenshots', screenshots];
  if (rule.id === 'visual-regression') {
    const baselineReport = path.join(temporary, `${slug}-baseline.json`);
    const baseline = path.join(temporary, `${slug}-baseline`);
    spawnSync(process.execPath, [path.join(ROOT, 'bin/browser-gate.js'), fixture, '--quick', '--out', baselineReport, '--screenshots', baseline], { cwd: ROOT });
    const changed = path.join(temporary, 'regression-changed.html');
    fs.writeFileSync(changed, fs.readFileSync(fixture, 'utf8').replace('Visual baseline fixture', 'Visually changed fixture with additional content'));
    argv[1] = changed;
    argv.push('--baseline-dir', baseline, '--max-diff', '0');
  }
  spawnSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
  const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};
  return {
    ruleId: rule.id, evaluator: 'isolated-browser-black-box', fixture: rule.fixture,
    passed: Boolean(report.findings?.some(item => item.id === rule.id)),
    observed: [...new Set(report.findings?.map(item => item.id) || [])],
    scenarios: report.summary?.scenarios || 0,
  };
}

function runLighthouse(rule) {
  const fixture = path.join(ROOT, rule.fixture);
  const reportFile = path.join(temporary, `${rule.id}.json`);
  spawnSync(process.execPath, [
    path.join(ROOT, 'bin/lighthouse-gate.js'), fixture, '--out', reportFile,
  ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
  const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : {};
  return {
    ruleId: rule.id,
    evaluator: 'isolated-lighthouse-black-box',
    fixture: rule.fixture,
    passed: Boolean(report.findings?.some(item => item.id === rule.id)),
    observed: report.findings?.map(item => item.id) || [],
    categories: report.categories || {},
  };
}

for (const rule of RULES) {
  const result = rule.engines.includes('lighthouse') ? runLighthouse(rule)
    : rule.fixture.includes('/browser/') || (rule.engines.includes('dom') && !rule.engines.includes('static'))
      ? runBrowser(rule) : runStatic(rule);
  results.push(result);
  console.log(`${result.passed ? '✓' : '✗'} ${rule.id} — ${result.evaluator}`);
}
const report = {
  schema: 2,
  generatedAt: new Date().toISOString(),
  isolatedRuleEval: true,
  externalEval: false,
  evaluatorContract: 'Each rule is exercised through a child-process black box using only its public fixture and emitted finding ID.',
  results,
  summary: { total: results.length, passed: results.filter(item => item.passed).length, failed: results.filter(item => !item.passed).length },
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
fs.rmSync(temporary, { recursive: true, force: true });
console.log(`isolated-rule-eval: ${report.summary.passed}/${report.summary.total} → ${path.relative(ROOT, output)}`);
if (report.summary.failed) process.exit(1);
