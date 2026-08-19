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

// Byte-comparing what's already IN lib/ (above) can't catch a provider added to
// rule-registry.js whose command file was never added to sync-vendor.js's VENDORED_FILES
// in the first place — the exact bug that shipped when the craft-ceiling provider was
// registered here but its script wasn't vendored: every node-runtime provider resolved
// fine except that one, which threw MODULE_NOT_FOUND at runtime. Derive the required file
// list from the vendored rule-registry.js itself, the same way check-package-boundary.js
// derives its required-files check from package.json instead of a hand-maintained list.
const registryPath = path.join(LIB, 'rule-registry.js');
if (fs.existsSync(registryPath)) {
  delete require.cache[require.resolve(registryPath)];
  const { PROVIDERS } = require(registryPath);
  for (const provider of PROVIDERS) {
    if (provider.runtime !== 'node') continue;
    if (!fs.existsSync(path.join(LIB, provider.command))) {
      drifted.push(`${provider.command}: referenced by provider "${provider.id}" in rule-registry.js but missing from lib/ — add it to sync-vendor.js's VENDORED_FILES`);
    }
  }
}

if (drifted.length) {
  console.error('check-vendor-sync: drift detected — run `npm run vendor` in packages/designos-detect:');
  drifted.forEach(d => console.error(`  - ${d}`));
  process.exit(1);
}
console.log(`check-vendor-sync: clean (${fs.readdirSync(LIB).length} vendored files match validators/)`);
