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
  // goldens/*.md briefs ship (CLAUDE.md's routing table reads them); the generated
  // per-golden evidence subdirectories (screenshots, html, browser-gate.json) do not.
  /^goldens\/[^/]+\//,
  /^fixtures\/frameworks\/.*\/dist\//,
  /^evals\/runs\//,
  /^evals\/independent\//,
  // A design-system package's load-bearing contract is SYSTEM.md + tokens.css +
  // lint.json + manifest.json — what an agent actually consumes. example.html is a
  // generated demo fixture (same role as golden evidence) and is the single largest
  // contributor to systems/'s footprint across 152 packages; excluding it is what keeps
  // the catalog under the packed-size budget without dropping any package.
  /^systems\/[^/]+\/example\.html$/,
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
// 2MB was the ceiling before `systems/` existed. That directory is now 152 design-system
// packages (SYSTEM.md + tokens.css + lint.json + manifest.json each — example.html demo
// fixtures are excluded above, same role as golden evidence) and is a deliberate scope
// decision, not bloat: ~2.07MB packed as of the 152-package catalog landing. 3MB keeps a
// real ceiling — this still fails if evidence leaks back in — with headroom for the
// catalog to grow without every addition requiring a budget PR.
const packedLimit = 3 * 1024 * 1024;

if (leaked.length || missing.length || report.size > packedLimit) {
  if (leaked.length) console.error(`package-boundary: leaked evidence:\n${leaked.join('\n')}`);
  if (missing.length) console.error(`package-boundary: missing runtime files:\n${missing.join('\n')}`);
  if (report.size > packedLimit) {
    console.error(`package-boundary: ${report.size} packed bytes exceeds ${packedLimit}`);
  }
  process.exit(1);
}

console.log(`package-boundary: ${files.size} files, ${report.size} packed bytes, evidence excluded`);
