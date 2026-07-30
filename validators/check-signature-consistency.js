#!/usr/bin/env node
/**
 * DesignOS signature-consistency checker — the brand-signature lock, enforced.
 *
 *   node check-signature-consistency.js <src-dir-or-file> [--memory memory/design.md] [--json]
 *
 * `motion/signature-moments.md` licenses at most two signatures per PAGE. This script
 * enforces the next level up: at most one signature *system* per PROJECT. A brief that
 * locks "magnetic button" as its recurring motif and then ships a different signature
 * technique on another page — with no documented reason — has stopped being a system and
 * started being a portfolio of unrelated effects, which is exactly the failure mode
 * `brain/originality.md` calls a costume rather than a brand.
 *
 * The lock lives in project memory, written once a signature is chosen:
 *
 *   ## Signature Lock
 *   - Technique: magnetic-button
 *   - Derivation: the product is fast and wants to be run
 *   - Locked: 2026-07-30
 *
 * No lock section → nothing to check, exits clean (this is an opt-in consistency check,
 * not a mandate that every project must have exactly one signature system).
 *
 * Opt-out for a deliberate, documented departure on one page:
 *   `signature-override: <reason>` within ~200 chars of the differing evidence.
 */
const fs = require('fs');
const path = require('path');
const { detectSignatures, SIGNATURE_FINGERPRINTS } = require('./signature-fingerprints');

const rawArgs = process.argv.slice(2);
const asJson = rawArgs.includes('--json');
const memIdx = rawArgs.indexOf('--memory');
const memoryPath = memIdx >= 0 ? rawArgs[memIdx + 1] : 'memory/design.md';
const target = rawArgs.find((a, i) => !a.startsWith('--') && rawArgs[i - 1] !== '--memory');
if (!target) {
  console.error('usage: check-signature-consistency.js <src-dir-or-file> [--memory memory/design.md] [--json]');
  process.exit(2);
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(e)) continue;
      yield* walk(path.join(p, e));
    }
  } else if (/\.(html|jsx?|tsx?|vue|svelte)$/.test(p)) yield p;
}

function parseLock(memoryFile) {
  if (!fs.existsSync(memoryFile)) return null;
  const text = fs.readFileSync(memoryFile, 'utf8');
  const section = /##\s*Signature Lock\b([\s\S]*?)(?=\n##\s|$)/i.exec(text);
  if (!section) return null;
  const technique = /-\s*Technique:\s*([\w-]+)/i.exec(section[1]);
  if (!technique) return null;
  const id = technique[1].trim();
  if (!SIGNATURE_FINGERPRINTS[id]) {
    console.error(`check-signature-consistency: memory declares an unknown technique id "${id}" — known ids: ${Object.keys(SIGNATURE_FINGERPRINTS).join(', ')}`);
    process.exit(2);
  }
  const derivation = /-\s*Derivation:\s*(.+)/i.exec(section[1]);
  return { id, label: SIGNATURE_FINGERPRINTS[id].label, derivation: derivation ? derivation[1].trim() : '' };
}

const lock = parseLock(path.resolve(memoryPath));
const findings = [];

if (!lock) {
  if (asJson) {
    console.log(JSON.stringify({ target, lock: null, findings: [], count: 0, note: `no Signature Lock section found in ${memoryPath}` }));
  } else {
    console.log(`check-signature-consistency: no Signature Lock declared in ${memoryPath} — nothing to check.`);
    console.log('Once a project chooses a recurring signature, record it there (see this script\'s header for the format).');
  }
  process.exit(0);
}

for (const file of walk(path.resolve(target))) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  const hits = detectSignatures(raw);
  if (!hits.length) continue;                 // most pages carry no signature at all — fine
  if (hits.includes(lock.id)) continue;        // consistent with the lock

  const overridden = /signature-override:\s*[^\n]{3,}/i.test(raw);
  if (overridden) continue;

  const otherLabels = hits.map(id => SIGNATURE_FINGERPRINTS[id].label).join(', ');
  findings.push({
    file: rel, line: 1, rule: 'signature-drift', severity: 'P2',
    message: `carries evidence of ${otherLabels}, but the project's locked signature is "${lock.label}"${lock.derivation ? ` (${lock.derivation})` : ''} — either use the locked technique, or add a signature-override: <reason> comment documenting the deliberate departure.`,
  });
}

if (asJson) {
  console.log(JSON.stringify({ target, lock, findings, count: findings.length }, null, 2));
  process.exit(findings.length ? 2 : 0);
}

console.log(`check-signature-consistency: locked technique is "${lock.label}" (${lock.id})`);
if (!findings.length) {
  console.log('check-signature-consistency: clean — every page carrying signature evidence matches the lock.');
} else {
  for (const f of findings) console.log(`  ${f.severity}  ${f.rule}  ${f.file}\n    ${f.message}`);
  console.log(`\ncheck-signature-consistency: ${findings.length} finding(s)`);
  process.exit(1);
}
