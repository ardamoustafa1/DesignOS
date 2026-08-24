#!/usr/bin/env node
'use strict';

/**
 * Resilient test runner — replaces the old single `&&`-chained `npm test` command,
 * where the first failing script (commonly a missing-Playwright-browser failure on a
 * fresh/offline/sandboxed checkout) silently skipped every script after it and never
 * printed a summary of what actually ran.
 *
 * `unit` scripts never launch a browser and must always be runnable straight after
 * `npm ci`, even with `--omit=optional` or no network access. `browser` scripts launch
 * real Chromium via Playwright (bin/responsive-constraint.js, bin/image-to-code.js,
 * bin/ax-timeline.js) and need `npx playwright install chromium` to have succeeded —
 * postinstall best-effort-installs it, but that can fail offline/sandboxed, so these are
 * kept out of the suite a first-time contributor runs by default.
 *
 * Usage: node scripts/run-tests.js --suite unit|browser|all
 */

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const suite = (process.argv.includes('--suite') && process.argv[process.argv.indexOf('--suite') + 1]) || 'unit';

const UNIT = [
  'node validators/test-cli.js',
  'node validators/test-agent-runtime.js',
  'node validators/test-agent-install.js',
  'node validators/test-generation-core.js',
  'node validators/test-artifact-worker-protocol.js',
  'node validators/test-system-certification.js',
  'node validators/test-generation-contract.js',
  'node validators/check-modules.js',
  'node runtime/motion/test-runtime.js',
  'node validators/test-motionos.js',
  'node validators/test-motionos-engines.js',
  'node validators/test-motion-semantics.js',
  'node validators/test-craft-ceiling.js',
  'node validators/test-system-conformance.js',
  'node validators/test-system-integrity.js',
  'node validators/test-public-claims.js',
  'node validators/test-product-engines.js',
  'node validators/test-motion-workbench.js',
  'node validators/test-gesture-studio.js',
  'node validators/test-component-grammar.js',
  'node validators/test-design-genome.js',
  'node validators/test-state-space.js',
  'node validators/test-native-evidence.js',
  'node validators/test-physics-handoff.js',
  'node validators/test-scroll-timeline.js',
  'node validators/test-flip-morph.js',
  'node validators/test-motion-blur.js',
  'node validators/test-micro-stagger.js',
  'node validators/test-fluid-typography.js',
  'node validators/test-sensory-sync.js',
  'node validators/test-magnetic-physics.js',
  'node validators/test-motion-gaps.js',
  'node validators/test-signature-consistency.js',
  'node validators/test-originality.js',
  'node packages/designos-detect/scripts/check-vendor-sync.js',
  'node packages/designos-detect/test/smoke.js',
];

// Each of these launches real Chromium via Playwright, indirectly (bin/responsive-
// constraint.js, bin/image-to-code.js, bin/ax-timeline.js) — verified by grepping the
// chain for those bin scripts, not a guess.
const BROWSER = [
  'node validators/test-motionos-context-loss.js',
  'node validators/test-motionos-route-transition.js',
  'node validators/test-motionos-catalog-matrix.js',
  'npm --prefix studio run test:motion-browser',
  'node validators/test-torture-simulator.js',
  'node validators/test-image-to-code.js',
  'node validators/test-ax-timeline.js',
];

const specs = suite === 'unit' ? UNIT : suite === 'browser' ? BROWSER : suite === 'all' ? [...UNIT, ...BROWSER] : null;
if (!specs) {
  console.error(`run-tests: unknown --suite "${suite}" (expected unit, browser, or all)`);
  process.exit(2);
}

const results = [];
for (const cmd of specs) {
  const [bin, ...args] = cmd.split(' ');
  process.stdout.write(`\n> ${cmd}\n`);
  const result = spawnSync(bin, args, { cwd: ROOT, stdio: 'inherit' });
  results.push({ cmd, status: result.status, signal: result.signal });
}

const failed = results.filter(r => r.status !== 0);
console.log(`\n${'─'.repeat(60)}`);
console.log(`run-tests (${suite}): ${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log('Failed:');
  for (const f of failed) {
    console.log(`  ✗ ${f.cmd}${f.signal ? ` (signal ${f.signal})` : ` (exit ${f.status})`}`);
  }
  if (suite === 'browser' || suite === 'all') {
    console.log('\nIf these failed because Chromium is not installed, run: npx playwright install chromium');
  }
  process.exit(1);
}
