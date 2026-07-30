#!/usr/bin/env node

/**
 * Keep browser/golden evidence out of the core npm package. Evidence is
 * distributed through the separately built designos-evidence artifact.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, npm_config_update_notifier: 'false' },
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status || 1);
}

let report;
try {
  [report] = JSON.parse(result.stdout);
} catch (error) {
  console.error(`package-boundary: could not parse npm pack report: ${error.message}`);
  process.exit(1);
}

const files = new Set((report.files || []).map((entry) => entry.path));
const forbidden = [
  /^goldens\//,
  /^fixtures\/frameworks\/.*\/dist\//,
  /^evals\/runs\//,
  /^evals\/independent\//,
];
const leaked = [...files].filter((file) => forbidden.some((pattern) => pattern.test(file)));
const required = [
  'bin/motion-profiler.js',
  'bin/temporal-motion.js',
  'bin/live/component-transform.js',
  'bin/interruption-torture.js',
  'bin/design-genome.js',
  'bin/composition-compiler.js',
  'bin/responsive-constraint.js',
  'bin/state-matrix.js',
  'bin/mutation-testing.js',
  'bin/consistency-graph.js',
  'capabilities/ledger.json',
  'capabilities/product-features.js',
  'runtime/motion/state-graph.js',
  'runtime/native/adapters.js',
  'evals/external/registry.json',
  'evals/isolated/registry-eval.json',
];
const missing = required.filter((file) => !files.has(file));
const packedLimit = 2 * 1024 * 1024;

if (leaked.length || missing.length || report.size > packedLimit) {
  if (leaked.length) console.error(`package-boundary: leaked evidence:\n${leaked.join('\n')}`);
  if (missing.length) console.error(`package-boundary: missing runtime files:\n${missing.join('\n')}`);
  if (report.size > packedLimit) {
    console.error(`package-boundary: ${report.size} packed bytes exceeds ${packedLimit}`);
  }
  process.exit(1);
}

console.log(`package-boundary: ${files.size} files, ${report.size} packed bytes, evidence excluded`);
