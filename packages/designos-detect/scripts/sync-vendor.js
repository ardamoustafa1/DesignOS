#!/usr/bin/env node
/**
 * Vendors the DesignOS validator registry into this package's lib/, so
 * `packages/designos-detect` can be published and installed standalone — no dependency
 * on the rest of the DesignOS repo at runtime. `validators/` stays the single source of
 * truth; this script is the one place that copies from it. Run after any change to a
 * vendored file, before `npm publish` (wired as `prepublishOnly`, see package.json).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', '..', 'validators');
const DEST = path.resolve(__dirname, '..', 'lib');

// Only the files the eight registry providers and their shared modules actually need at
// runtime — not test-*.js, not fixtures/, not check-capability-ledger.js (that script
// reaches into capabilities/, which is a repo-maintenance concern, not a detection one).
const VENDORED_FILES = [
  'rule-registry.js',
  'run-registry.js',
  'finding-format.js',
  'signature-fingerprints.js',
  'structure-fingerprint.js',
  'check-refs.sh',
  'check-drift.js',
  'check-a11y-basics.js',
  'check-token-contrast.js',
  'check-motion.js',
  'check-aesthetic-slop.js',
  'check-registry.js',
  'check-craft-ceiling.js',
  'check-signature-consistency.js',
  'check-motion-gaps.js',
  'check-originality.js',
];

fs.mkdirSync(DEST, { recursive: true });
let copied = 0;
for (const name of VENDORED_FILES) {
  const src = path.join(SRC, name);
  if (!fs.existsSync(src)) {
    console.error(`sync-vendor: expected source file missing: ${src}`);
    process.exitCode = 1;
    continue;
  }
  fs.copyFileSync(src, path.join(DEST, name));
  copied++;
}
console.log(`sync-vendor: copied ${copied}/${VENDORED_FILES.length} files from validators/ into lib/`);
