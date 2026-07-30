#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const value = (name, fallback = '') => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const root = path.resolve(__dirname, '..');
const browserReport = path.resolve(process.cwd(), value('--browser', 'browser-evidence/browser-gate.json'));
const lighthouseReport = path.resolve(process.cwd(), value('--lighthouse', 'browser-evidence/lighthouse.json'));
const output = path.resolve(process.cwd(), value('--out', 'website/browser-ledger.json'));
if (!fs.existsSync(browserReport)) throw new Error(`Browser report not found: ${browserReport}`);

const website = JSON.parse(fs.readFileSync(browserReport, 'utf8'));
const lighthouse = fs.existsSync(lighthouseReport)
  ? JSON.parse(fs.readFileSync(lighthouseReport, 'utf8')) : null;
const goldenRoot = path.join(root, 'goldens');
const goldens = fs.readdirSync(goldenRoot, { withFileTypes: true }).filter(entry => entry.isDirectory())
  .flatMap(entry => {
    const report = path.join(goldenRoot, entry.name, 'evidence/browser-gate.json');
    if (!fs.existsSync(report)) return [];
    const data = JSON.parse(fs.readFileSync(report, 'utf8'));
    return [{ name: entry.name, generatedAt: data.generatedAt, summary: data.summary }];
  });
const repository = process.env.GITHUB_REPOSITORY || 'local/DesignOS';
const sha = process.env.GITHUB_SHA || value('--sha', 'local');
const runId = process.env.GITHUB_RUN_ID || null;
const ledger = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  repository,
  sha,
  shortSha: sha === 'local' ? 'local' : sha.slice(0, 12),
  ref: process.env.GITHUB_REF || 'local',
  runId,
  runUrl: runId ? `https://github.com/${repository}/actions/runs/${runId}` : null,
  commitUrl: sha === 'local' ? null : `https://github.com/${repository}/commit/${sha}`,
  browserGate: {
    generatedAt: website.generatedAt,
    summary: website.summary,
    axeViolations: website.findings.filter(item => item.id === 'axe-violation').length,
    scenarios: website.results.map(item => ({
      scenario: item.scenario,
      screenshot: path.basename(item.screenshot),
      axeViolations: item.axe?.violations?.length || 0,
      axNodes: item.accessibilityTree?.length || 0,
      performance: item.performance,
    })),
  },
  lighthouse: lighthouse ? {
    generatedAt: lighthouse.generatedAt,
    version: lighthouse.lighthouseVersion,
    categories: lighthouse.categories,
    metrics: lighthouse.metrics,
    budgets: lighthouse.budgets,
    throttlingMethod: lighthouse.throttlingMethod,
    passed: lighthouse.passed,
  } : null,
  goldens,
  claim: website.summary.passed && lighthouse?.passed && goldens.every(item => item.summary.passed)
    ? 'Browser, Lighthouse and golden gates passed for this exact commit.'
    : 'This commit does not have a clean browser ledger.',
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(ledger, null, 2) + '\n');
console.log(`browser-ledger: ${output} (${ledger.shortSha})`);
