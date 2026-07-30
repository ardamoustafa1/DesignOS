#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const BASE_FIXTURE = `<!doctype html><html><meta name="viewport" content="width=device-width">
<style>
:root{--enter:160ms;--exit:120ms}
*{box-sizing:border-box}.control{min-width:44px;min-height:44px;transform-origin:top left}
.control:focus-visible{outline:3px solid currentColor}
.surface{max-width:100%}
@media(prefers-reduced-motion:reduce){.control{transform:none;transition-duration:1ms}}
</style>
<button class="control">Continue</button>
<img src="fixture.png" width="320" height="180" alt="Fixture">
<p role="status" aria-live="polite">Saved</p>
<script>
let animation;function play(){animation?.cancel();animation=document.querySelector('.control').animate([], {duration:160})}
</script></html>`;

const MUTATIONS = Object.freeze([
  { id: 'touch-target-40', rule: 'dom-tap-target', apply: source => source.replace('min-width:44px;min-height:44px', 'min-width:40px;min-height:40px') },
  { id: 'exit-four-times-enter', rule: 'motion-enter-exit-symmetry', apply: source => source.replace('--exit:120ms', '--exit:640ms') },
  { id: 'origin-forced-center', rule: 'motion-transform-origin', apply: source => source.replace('transform-origin:top left', 'transform-origin:center') },
  { id: 'focus-outline-removed', rule: 'source-missing-focus', apply: source => source.replace('outline:3px solid currentColor', 'outline:none') },
  { id: 'one-pixel-overflow', rule: 'dom-horizontal-overflow', apply: source => source.replace('max-width:100%', 'width:calc(100vw + 1px)') },
  { id: 'reduced-motion-removed', rule: 'motion-reduced-motion-missing', apply: source => source.replace('@media(prefers-reduced-motion:reduce)', '@media(prefers-color-scheme:dark)') },
  { id: 'asset-dimensions-removed', rule: 'source-image-dimensions', apply: source => source.replace(' width="320" height="180"', '') },
  { id: 'live-region-silenced', rule: 'dom-live-announcement', apply: source => source.replace(' role="status" aria-live="polite"', '') },
  { id: 'spring-not-interruptible', rule: 'motion-no-cancellation', apply: source => source.replace('animation?.cancel();', '') },
]);

function cssMilliseconds(source, name) {
  const match = new RegExp(`${name}\\s*:\\s*(\\d+(?:\\.\\d+)?)(ms|s)`).exec(source);
  if (!match) return null;
  return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
}

const DETECTORS = Object.freeze({
  'dom-tap-target': source => {
    const widths = [...source.matchAll(/min-(?:width|height)\s*:\s*(\d+(?:\.\d+)?)px/gi)].map(match => Number(match[1]));
    return widths.some(value => value < 44);
  },
  'motion-enter-exit-symmetry': source => {
    const enter = cssMilliseconds(source, '--enter');
    const exit = cssMilliseconds(source, '--exit');
    return enter != null && exit != null && exit / enter > 1.25;
  },
  'motion-transform-origin': source => /transform-origin\s*:\s*(?:center|50%\s+50%)/i.test(source),
  'source-missing-focus': source => /:focus-visible[^}]*outline\s*:\s*(?:none|0)\b/is.test(source),
  'dom-horizontal-overflow': source => /calc\(\s*100vw\s*\+\s*(?:1px|0\.0*625rem)\s*\)/i.test(source),
  'motion-reduced-motion-missing': source => !/prefers-reduced-motion\s*:\s*reduce/i.test(source),
  'source-image-dimensions': source => [...source.matchAll(/<img\b[^>]*>/gi)]
    .some(match => !/\bwidth\s*=/.test(match[0]) || !/\bheight\s*=/.test(match[0])),
  'dom-live-announcement': source => />\s*Saved\s*</i.test(source) &&
    !/(?:role\s*=\s*["'](?:status|alert)|aria-live\s*=)/i.test(source),
  'motion-no-cancellation': source => /\.animate\s*\(/.test(source) &&
    !/(?:\.cancel\s*\(|AbortController|\.stop\s*\(|\.kill\s*\()/i.test(source),
});

function detect(source) {
  const started = performance.now();
  const hits = [];
  for (const [rule, detector] of Object.entries(DETECTORS)) {
    if (detector(source)) hits.push(rule);
  }
  return { hits, latencyMs: performance.now() - started };
}

function runMutationSuite(base = BASE_FIXTURE) {
  const clean = detect(base);
  const rows = MUTATIONS.map(mutation => {
    const result = detect(mutation.apply(base));
    const truePositive = result.hits.includes(mutation.rule);
    const extras = result.hits.filter(rule => rule !== mutation.rule);
    return {
      mutation: mutation.id,
      expectedRule: mutation.rule,
      detectedRules: result.hits,
      truePositive,
      falseNegative: !truePositive,
      falsePositives: extras,
      ruleOverlap: result.hits.length,
      detectionLatencyMs: result.latencyMs,
    };
  });
  const truePositives = rows.filter(row => row.truePositive).length;
  const falseNegatives = rows.filter(row => row.falseNegative).length;
  const falsePositives = clean.hits.length + rows.reduce((total, row) => total + row.falsePositives.length, 0);
  const precision = truePositives / Math.max(1, truePositives + falsePositives);
  const recall = truePositives / Math.max(1, truePositives + falseNegatives);
  return {
    schema: 1,
    generatedAt: new Date().toISOString(),
    rows,
    cleanBaselineHits: clean.hits,
    summary: {
      mutations: rows.length,
      truePositives,
      falsePositives,
      falseNegatives,
      recall,
      precision,
      averageRuleOverlap: rows.reduce((sum, row) => sum + row.ruleOverlap, 0) / rows.length,
      p95DetectionLatencyMs: rows.map(row => row.detectionLatencyMs)
        .sort((a, b) => a - b)[Math.ceil(rows.length * .95) - 1],
    },
    passed: recall === 1 && precision === 1,
  };
}

function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const fixture = value('--fixture');
  const report = runMutationSuite(fixture ? fs.readFileSync(path.resolve(fixture), 'utf8') : BASE_FIXTURE);
  const output = path.resolve(value('--out', '.designos/mutation-report.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`mutation-testing: recall ${(report.summary.recall * 100).toFixed(1)}%, precision ${(report.summary.precision * 100).toFixed(1)}%`);
  if (!report.passed) process.exit(1);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
module.exports = { BASE_FIXTURE, MUTATIONS, DETECTORS, detect, runMutationSuite };
