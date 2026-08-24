#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const certified = require(path.join(root, 'systems/certification.json'));
const compositions = require(path.join(root, 'systems/compositions.json'));
const runtime = require(path.join(root, 'studio/lib/system-runtime-catalog.json'));
const supportedFamilies = new Set(['editorial-ledger', 'split-proof', 'rail-story']);
const requiredAliases = ['ground','ground-hi','ground-lo','surface','raised','ink','ink-2','ink-3','ember','ember-lift','on-ember','wash','ok','ring','ring-loud','r-sm','r-md','r-lg','ease','fast','base','slow','display','text','mono','shadow-1','shadow-2','shadow-3'];
const failures = [];

if (certified.summary.total < 200) failures.push(`Expected at least 200 certified systems; found ${certified.summary.total}.`);
if (certified.summary.blocked !== 0) failures.push(`${certified.summary.blocked} systems are blocked.`);
if (runtime.systems.length !== certified.summary.total) failures.push('Runtime catalog and certification ledger counts differ.');

for (const entry of certified.systems) {
  const id = entry.id;
  const manifestPath = path.join(root, 'systems', id, 'manifest.json');
  if (!fs.existsSync(manifestPath)) { failures.push(`${id}: manifest missing.`); continue; }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const families = compositions.systems[id]?.families;
  const runtimeSystem = runtime.systems.find((system) => system.id === id);
  if (!entry.certified) failures.push(`${id}: certification failed.`);
  if (!Array.isArray(families) || families.length !== 3 || new Set(families).size !== 3 || families.some((family) => !supportedFamilies.has(family))) failures.push(`${id}: three unique supported composition families are required.`);
  if (!runtimeSystem) { failures.push(`${id}: runtime contract missing.`); continue; }
  if (JSON.stringify(runtimeSystem.families) !== JSON.stringify(families)) failures.push(`${id}: runtime composition order drifted.`);
  if (!runtimeSystem.css.includes(':root')) failures.push(`${id}: runtime tokens have no root contract.`);
  for (const alias of requiredAliases) if (!runtimeSystem.aliases.includes(`--${alias}:`) && !runtimeSystem.css.includes(`--${alias}:`)) failures.push(`${id}: semantic alias --${alias} missing.`);
  if (!manifest.source || !['original','imported'].includes(manifest.source.type)) failures.push(`${id}: provenance type missing.`);
  if (manifest.source?.type === 'original' && !manifest.source.origin) failures.push(`${id}: original provenance origin missing.`);
  if (manifest.source?.type === 'imported' && (!manifest.source.upstream || !manifest.source.commit || !manifest.source.licence || !manifest.source.notice)) failures.push(`${id}: imported provenance fields incomplete.`);
}

if (failures.length) {
  console.error(`P2 system matrix failed with ${failures.length} finding(s):`);
  failures.slice(0, 80).forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`P2 system matrix PASS: ${certified.summary.total} certified systems × 3 composition families; runtime aliases and provenance complete.`);
