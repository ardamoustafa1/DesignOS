#!/usr/bin/env node
/**
 * DesignOS originality checker — structural self-similarity across a project's own output.
 *
 *   node check-originality.js <file> [--corpus .designos/originality-corpus.json]
 *                              [--threshold 0.82] [--add] [--json]
 *
 * `brain/originality.md` bans copying a NAMED external default (a template, a competitor's
 * motif). This script polices the failure mode one level closer to home: regenerating the
 * project's OWN previous shape brief after brief, because the same "hero > 3-card grid >
 * pricing table > footer-cta" skeleton is the path of least resistance for both a model
 * and a human under deadline. Nothing else in this repo checks a page against the
 * project's own history — every other validator checks a page against a written rule.
 *
 * Mechanics: `structure-fingerprint.js` reduces a page to its ordered landmark shingles
 * (section/heading tags + first class, in trigrams) and compares it by Jaccard similarity
 * against a local corpus of prior fingerprints. High similarity is a prompt to go compare
 * the two pages by eye, never an automatic verdict — see that module's own disclaimer.
 *
 * The corpus is opt-in and local: `--add` appends the current file's fingerprint after
 * checking it, so a project's own shipped pages become the comparison set over time. A
 * fresh project with an empty corpus always reports clean (nothing to compare against yet).
 */
const fs = require('fs');
const path = require('path');
const { fingerprint, similarity } = require('./structure-fingerprint');

const rawArgs = process.argv.slice(2);
const asJson = rawArgs.includes('--add-json') || rawArgs.includes('--json');
const shouldAdd = rawArgs.includes('--add');
const corpusIdx = rawArgs.indexOf('--corpus');
const corpusPath = corpusIdx >= 0 ? rawArgs[corpusIdx + 1] : '.designos/originality-corpus.json';
const thresholdIdx = rawArgs.indexOf('--threshold');
const threshold = thresholdIdx >= 0 ? Number(rawArgs[thresholdIdx + 1]) : 0.82;
const target = rawArgs.find((a, i) => !a.startsWith('--')
  && rawArgs[i - 1] !== '--corpus' && rawArgs[i - 1] !== '--threshold');

if (!target) {
  console.error('usage: check-originality.js <file> [--corpus path.json] [--threshold 0.82] [--add] [--json]');
  process.exit(2);
}
if (!fs.existsSync(target)) {
  console.error(`check-originality: target not found: ${target}`);
  process.exit(2);
}

function loadCorpus(file) {
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return raw.map(entry => ({ id: entry.id, shingles: new Set(entry.shingles) }));
}

function saveCorpus(file, corpus) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const serializable = corpus.map(entry => ({ id: entry.id, shingles: [...entry.shingles] }));
  fs.writeFileSync(file, JSON.stringify(serializable, null, 2) + '\n');
}

const rel = path.relative(process.cwd(), path.resolve(target)) || target;
const html = fs.readFileSync(target, 'utf8');
const { sequence, shingles } = fingerprint(html);
const corpus = loadCorpus(path.resolve(corpusPath));

let best = { id: null, score: -1 };
for (const entry of corpus) {
  if (entry.id === rel) continue;   // don't compare a file against its own prior corpus entry
  const score = similarity(shingles, entry.shingles);
  if (score > best.score) best = { id: entry.id, score };
}
if (best.id === null) best.score = 0;   // no comparable corpus entries at all

const findings = [];
if (best.id && best.score >= threshold) {
  findings.push({
    file: rel, line: 1, rule: 'structural-clone-risk', severity: 'P2',
    message: `${(best.score * 100).toFixed(0)}% structural similarity to ${best.id} (landmark-order shingles) — go compare the two by eye before shipping both; this is a prompt to look, not a verdict (structure-fingerprint.js is blind to copy, color, and imagery).`,
  });
}

if (shouldAdd) {
  const withoutSelf = corpus.filter(entry => entry.id !== rel);
  withoutSelf.push({ id: rel, shingles });
  saveCorpus(path.resolve(corpusPath), withoutSelf);
}

if (asJson) {
  console.log(JSON.stringify({
    target: rel, corpusSize: corpus.length, landmarkCount: sequence.length,
    closestMatch: best.id ? { id: best.id, similarity: Number(best.score.toFixed(3)) } : null,
    findings, count: findings.length,
  }, null, 2));
  process.exit(findings.length ? 2 : 0);
}

console.log(`check-originality: ${rel} — ${sequence.length} landmark(s), compared against ${corpus.length} corpus entr${corpus.length === 1 ? 'y' : 'ies'}`);
if (best.id) console.log(`  closest match: ${best.id} (${(best.score * 100).toFixed(0)}% structural similarity)`);
if (!findings.length) {
  console.log('check-originality: clean — no corpus entry crosses the similarity threshold.');
} else {
  for (const f of findings) console.log(`  ${f.severity}  ${f.rule}  ${f.message}`);
  console.log(`\ncheck-originality: ${findings.length} finding(s)`);
  process.exit(1);
}
if (shouldAdd) console.log(`Added ${rel} to ${corpusPath} (now ${corpus.filter(e => e.id !== rel).length + 1} entries).`);
