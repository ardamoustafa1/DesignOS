#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const GOLDENS = path.join(ROOT, 'goldens');
const mode = process.argv.includes('--update') ? 'update' : 'verify';
const only = (() => {
  const index = process.argv.indexOf('--only');
  return index >= 0 ? process.argv[index + 1] : '';
})();
const REQUIRED = [
  'target', 'viewports', 'themes', 'motionModes', 'zoom', 'keyboardPath',
  'expectedFindings', 'acceptedAdvisories', 'expectedP1', 'expectedTasks',
  'performanceBudget', 'maxPixelDiffPercent',
];

function manifests() {
  return fs.readdirSync(GOLDENS, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && (!only || entry.name === only))
    .map(entry => path.join(GOLDENS, entry.name, 'designos-golden.json'))
    .filter(file => fs.existsSync(file));
}

let failures = 0;
for (const manifestFile of manifests()) {
  const dir = path.dirname(manifestFile);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const missing = REQUIRED.filter(key => !(key in manifest));
  if (missing.length) {
    console.error(`${path.relative(ROOT, manifestFile)} missing: ${missing.join(', ')}`);
    failures++;
    continue;
  }
  const target = path.join(dir, manifest.target);
  if (!fs.existsSync(target)) {
    console.error(`${path.relative(ROOT, target)} does not exist`);
    failures++;
    continue;
  }
  const evidenceDir = path.join(dir, 'evidence');
  const reportFile = path.join(evidenceDir, 'browser-gate.json');
  let activeReportFile = reportFile;
  let activeScreenshotDir = path.join(evidenceDir, 'screenshots');
  let verifyRoot = null;
  if (mode === 'update') {
    fs.mkdirSync(evidenceDir, { recursive: true });
    const result = spawnSync(process.execPath, [
      path.join(ROOT, 'bin/browser-gate.js'), target,
      '--out', reportFile,
      '--screenshots', path.join(evidenceDir, 'screenshots'),
    ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
    if (!fs.existsSync(reportFile)) {
      console.error(`${path.basename(dir)}: browser evidence was not produced\n${result.stderr || result.stdout}`);
      failures++;
      continue;
    }
  } else if (fs.existsSync(reportFile)) {
    verifyRoot = fs.mkdtempSync(path.join(os.tmpdir(), `designos-golden-${path.basename(dir)}-`));
    activeReportFile = path.join(verifyRoot, 'browser-gate.json');
    activeScreenshotDir = path.join(verifyRoot, 'screenshots');
    const result = spawnSync(process.execPath, [
      path.join(ROOT, 'bin/browser-gate.js'), target,
      '--out', activeReportFile,
      '--screenshots', activeScreenshotDir,
      '--baseline-dir', path.join(evidenceDir, 'screenshots'),
      '--max-diff', String(manifest.maxPixelDiffPercent),
    ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
    if (!fs.existsSync(activeReportFile)) {
      console.error(`${path.basename(dir)}: verification render was not produced\n${result.stderr || result.stdout}`);
      failures++;
      fs.rmSync(verifyRoot, { recursive: true, force: true });
      continue;
    }
  }
  if (!fs.existsSync(reportFile)) {
    console.error(`${path.basename(dir)}: missing evidence/browser-gate.json; run golden --update`);
    failures++;
    continue;
  }
  const report = JSON.parse(fs.readFileSync(activeReportFile, 'utf8'));
  const screenshotCount = fs.existsSync(activeScreenshotDir)
    ? fs.readdirSync(activeScreenshotDir).filter(name => name.endsWith('.png')).length : 0;
  const expectedScenarios = manifest.viewports.length * manifest.themes.length * manifest.motionModes.length + manifest.zoom.length;
  const standardResults = report.results.filter(item => !item.scenario.startsWith('text-zoom-'));
  const p1 = report.findings.filter(item => item.severity === 'P1').length;
  const actualFindingIds = [...new Set(report.findings.map(item => item.id))].sort();
  const expectedFindingIds = [...manifest.expectedFindings].sort();
  const performance = report.results.reduce((summary, item) => ({
    transferBytes: Math.max(summary.transferBytes, item.performance?.transferBytes || 0),
    domContentLoadedMs: Math.max(summary.domContentLoadedMs, item.performance?.domContentLoaded || 0),
    loadMs: Math.max(summary.loadMs, item.performance?.load || 0),
  }), { transferBytes: 0, domContentLoadedMs: 0, loadMs: 0 });
  const assertions = [
    [report.results.length >= expectedScenarios, `expected ${expectedScenarios} scenarios, received ${report.results.length}`],
    [screenshotCount >= expectedScenarios, `expected ${expectedScenarios} screenshots, received ${screenshotCount}`],
    [p1 === manifest.expectedP1, `expected ${manifest.expectedP1} P1 findings, received ${p1}`],
    [JSON.stringify(actualFindingIds) === JSON.stringify(expectedFindingIds),
      `expected finding IDs ${JSON.stringify(expectedFindingIds)}, received ${JSON.stringify(actualFindingIds)}`],
    [report.results.filter(item => item.keyboard?.complete).length >= manifest.viewports.length,
      `expected keyboard evidence at ${manifest.viewports.length} widths`],
    [report.results.every(item => item.semantic), 'accessibility-tree snapshot missing'],
    [standardResults.every(item => item.axe && Array.isArray(item.axe.violations)),
      'real Axe result missing from a standard viewport scenario'],
    [standardResults.every(item => Array.isArray(item.accessibilityTree) && item.accessibilityTree.length > 0),
      'Chromium accessibility-tree evidence missing from a standard viewport scenario'],
    [report.supplemental?.textSpacing?.scenario === 'text-spacing',
      'WCAG text-spacing evidence missing'],
    [report.supplemental?.forcedColors?.scenario === 'forced-colors'
      && report.supplemental.forcedColors.failures.length === 0,
    'forced-colors evidence missing or contains indiscernible controls'],
    [report.taskFlows?.length === manifest.expectedTasks
      && report.taskFlows.every(task => task.passed),
    `expected ${manifest.expectedTasks} passing declared tasks`],
    [performance.transferBytes <= manifest.performanceBudget.transferBytes,
      `transfer budget exceeded: ${performance.transferBytes} > ${manifest.performanceBudget.transferBytes}`],
    [performance.domContentLoadedMs <= manifest.performanceBudget.domContentLoadedMs,
      `DOMContentLoaded budget exceeded: ${performance.domContentLoadedMs} > ${manifest.performanceBudget.domContentLoadedMs}`],
    [performance.loadMs <= manifest.performanceBudget.loadMs,
      `load budget exceeded: ${performance.loadMs} > ${manifest.performanceBudget.loadMs}`],
    [manifest.acceptedAdvisories.every(item => item.id && item.reason),
      'every accepted advisory needs an id and a non-empty reason'],
    [mode === 'update' || (report.diffs.length >= expectedScenarios
      && report.diffs.every(item => item.status === 'compared')),
    `expected ${expectedScenarios} baseline pixel comparisons`],
  ];
  const broken = assertions.filter(([passes]) => !passes);
  if (broken.length) {
    failures += broken.length;
    for (const [, message] of broken) console.error(`${path.basename(dir)}: ${message}`);
    for (const findingItem of report.findings) {
      console.error(`${path.basename(dir)} finding: ${findingItem.id} ${JSON.stringify(findingItem.details || findingItem.elements || {})}`);
    }
    for (const diff of report.diffs.filter(item => item.status !== 'compared')) {
      console.error(`${path.basename(dir)} pixel evidence: ${diff.scenario} ${diff.status} ${diff.baseline}`);
    }
  } else {
    console.log(`${path.basename(dir)}: golden evidence complete (${report.results.length} scenarios, ${screenshotCount} screenshots)`);
  }
  if (verifyRoot) fs.rmSync(verifyRoot, { recursive: true, force: true });
}

if (!manifests().length) {
  console.error('No golden manifests found.');
  process.exit(1);
}
if (failures) {
  console.error(`golden-suite: ${failures} failure(s)`);
  process.exit(1);
}
console.log(`golden-suite: ${mode} clean`);
