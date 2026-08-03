#!/usr/bin/env node
/**
 * CI guard: fails if packages/designos-detect/lib/ has drifted from validators/ — the
 * same "source of truth vs. mirrored copy" drift check DesignOS's own capability ledger
 * enforces for its generated docs. Run after any change to validators/*.js, before commit.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', '..', 'validators');
const LIB = path.resolve(__dirname, '..', 'lib');

let drifted = [];
for (const name of fs.readdirSync(LIB)) {
  const srcFile = path.join(SRC, name);
  const libFile = path.join(LIB, name);
  if (!fs.existsSync(srcFile)) { drifted.push(`${name}: no longer exists in validators/`); continue; }
  if (fs.readFileSync(srcFile, 'utf8') !== fs.readFileSync(libFile, 'utf8')) drifted.push(`${name}: differs from validators/${name}`);
}

if (drifted.length) {
  console.error('check-vendor-sync: drift detected — run `npm run vendor` in packages/designos-detect:');
  drifted.forEach(d => console.error(`  - ${d}`));
  process.exit(1);
}
console.log(`check-vendor-sync: clean (${fs.readdirSync(LIB).length} vendored files match validators/)`);
