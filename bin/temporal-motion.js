#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { serveTarget } = require('./motion/browser-target');
const { percentile } = require('./motion-profiler');

const distance = (left, right) => Math.hypot(...left.map((value, index) => value - right[index]));

function cubicBezierValue(raw, progress) {
  const values = /cubic-bezier\(([^)]+)\)/.exec(raw || '')?.[1].split(',').map(Number);
  if (!values || values.length !== 4 || values.some(value => !Number.isFinite(value))) return progress;
  const [x1, y1, x2, y2] = values;
  const curve = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 14; index += 1) {
    const middle = (low + high) / 2;
    if (curve(middle, x1, x2) < progress) low = middle;
    else high = middle;
  }
  return curve((low + high) / 2, y1, y2);
}

function vector(sample) {
  return [
    sample.rect.x, sample.rect.y, sample.rect.width, sample.rect.height,
    Number(sample.opacity), ...sample.matrix,
  ];
}

function phaseMetrics(samples) {
  if (samples.length < 2) return {
    durationMs: 0, settleTimeMs: 0, overshoot: 0, easingRmse: 0,
    frameTimes: { p50: 0, p95: 0, p99: 0 }, maxFrameJump: 0,
  };
  const first = vector(samples[0]);
  const last = vector(samples.at(-1));
  const rawTotal = distance(first, last);
  const closedTrajectory = rawTotal < 0.01;
  const total = Math.max(rawTotal, 0.0001);
  const progresses = closedTrajectory ? samples.map(() => 0)
    : samples.map(sample => distance(first, vector(sample)) / total);
  const startTime = samples[0].t;
  const duration = Math.max(1, samples.at(-1).t - startTime);
  const expected = samples.map(sample => cubicBezierValue(samples.find(item => item.easing)?.easing, (sample.t - startTime) / duration));
  const easingRmse = closedTrajectory ? null : Math.sqrt(progresses.reduce((sum, value, index) =>
    sum + (value - expected[index]) ** 2, 0) / progresses.length);
  const deltas = samples.slice(1).map((sample, index) => sample.t - samples[index].t);
  const jumps = samples.slice(1).map((sample, index) => distance(vector(sample), vector(samples[index])));
  let settleIndex = samples.length - 1;
  for (let index = samples.length - 2; index >= 0; index -= 1) {
    if (distance(vector(samples[index]), last) > Math.max(0.05, total * 0.005)) break;
    settleIndex = index;
  }
  return {
    durationMs: duration,
    settleTimeMs: samples[settleIndex].t - startTime,
    overshoot: Math.max(0, Math.max(...progresses) - 1),
    easing: samples[0].easing,
    easingRmse,
    frameTimes: {
      p50: percentile(deltas, 0.5),
      p95: percentile(deltas, 0.95),
      p99: percentile(deltas, 0.99),
    },
    maxFrameJump: Math.max(...jumps, 0),
    medianFrameJump: percentile(jumps, 0.5),
    p95FrameJump: percentile(jumps, 0.95),
  };
}

async function samplePhase(page, selector, action, durationMs, screenshotDir, label) {
  const promise = page.evaluate(async ({ selector: targetSelector, action: phaseAction, duration }) => {
    const target = document.querySelector(targetSelector);
    if (!target) throw new Error(`Temporal selector not found: ${targetSelector}`);
    const samples = [];
    const sample = timestamp => {
      const style = getComputedStyle(target);
      const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
      const rect = target.getBoundingClientRect();
      samples.push({
        t: timestamp,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        matrix: [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f],
        opacity: style.opacity,
        transformOrigin: style.transformOrigin,
        easing: target.getAnimations()[0]?.effect?.getTiming?.().easing || style.transitionTimingFunction,
        semantic: {
          state: target.dataset.state ?? null,
          pressed: target.getAttribute('aria-pressed'),
          expanded: target.getAttribute('aria-expanded'),
          value: target.getAttribute('aria-valuenow'),
          text: target.textContent.trim(),
        },
      });
    };
    sample(performance.now());
    if (phaseAction === 'click') target.click();
    else if (phaseAction === 'interrupt') {
      target.click();
      setTimeout(() => target.click(), Math.min(64, duration / 3));
    }
    const started = performance.now();
    await new Promise(resolve => requestAnimationFrame(function frame(timestamp) {
      sample(timestamp);
      if (timestamp - started >= duration) resolve();
      else requestAnimationFrame(frame);
    }));
    return samples;
  }, { selector, action, duration: durationMs });

  const screenshots = [];
  if (screenshotDir) {
    fs.mkdirSync(screenshotDir, { recursive: true });
    let frame = 0;
    while (true) {
      const complete = await Promise.race([
        promise.then(() => true),
        page.waitForTimeout(33).then(() => false),
      ]);
      const file = path.join(screenshotDir, `${label}-${String(frame).padStart(3, '0')}.png`);
      await page.locator(selector).screenshot({ path: file });
      screenshots.push(file);
      frame += 1;
      if (complete) break;
    }
  }
  return { samples: await promise, screenshots };
}

async function runMode(browser, served, options, reducedMotion) {
  const context = await browser.newContext({
    reducedMotion,
    viewport: options.viewport || { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.goto(served.url, { waitUntil: 'networkidle' });
  const selector = options.selector;
  const duration = options.durationMs || 420;
  const frameRoot = options.framesDir ? path.join(options.framesDir, reducedMotion) : null;
  const enter = await samplePhase(page, selector, 'click', duration, frameRoot, 'enter');
  const exit = await samplePhase(page, selector, 'click', duration, frameRoot, 'exit');
  const interruption = await samplePhase(page, selector, 'interrupt', duration, frameRoot, 'interrupt');
  await context.close();
  return {
    enter: { samples: enter.samples, metrics: phaseMetrics(enter.samples), screenshots: enter.screenshots },
    exit: { samples: exit.samples, metrics: phaseMetrics(exit.samples), screenshots: exit.screenshots },
    interruption: {
      samples: interruption.samples,
      metrics: phaseMetrics(interruption.samples),
      screenshots: interruption.screenshots,
    },
  };
}

function semanticEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function temporalRegression(options) {
  const { chromium } = require('playwright');
  const served = await serveTarget(options.target, options.cwd);
  const browser = await chromium.launch({ headless: true });
  try {
    const full = await runMode(browser, served, options, 'no-preference');
    const reduced = await runMode(browser, served, options, 'reduce');
    const fullFinal = full.enter.samples.at(-1);
    const reducedFinal = reduced.enter.samples.at(-1);
    const fullSpatialDistance = distance(vector(full.enter.samples[0]), vector(fullFinal));
    const continuityRatio = full.interruption.metrics.maxFrameJump /
      Math.max(0.001, full.interruption.metrics.p95FrameJump);
    const report = {
      schema: 1,
      generatedAt: new Date().toISOString(),
      target: options.target,
      selector: options.selector,
      sequence: { interval: 'requestAnimationFrame', fullFrames: full.enter.samples.length, reducedFrames: reduced.enter.samples.length },
      full,
      reduced,
      comparison: {
        easingCurveRmse: {
          enter: full.enter.metrics.easingRmse,
          exit: full.exit.metrics.easingRmse,
        },
        enterExitDurationRatio: full.exit.metrics.settleTimeMs /
          Math.max(1, full.enter.metrics.settleTimeMs),
        transformOriginMatch: full.enter.samples[0].transformOrigin === full.exit.samples[0].transformOrigin,
        maxOvershoot: Math.max(full.enter.metrics.overshoot, full.exit.metrics.overshoot),
        interruptionContinuityRatio: continuityRatio,
        interruptionContinuous: continuityRatio <= (options.maxContinuityRatio || 6),
        reducedMotionSemanticEquivalent: semanticEqual(fullFinal.semantic, reducedFinal.semantic),
        reducedMotionSpatialDistance: distance(vector(reduced.enter.samples[0]), vector(reducedFinal)),
        reducedMotionSpatialSuppressed: distance(vector(reduced.enter.samples[0]), vector(reducedFinal)) <= fullSpatialDistance * 0.25,
      },
    };
    report.passed = report.comparison.transformOriginMatch &&
      report.comparison.interruptionContinuous &&
      report.comparison.reducedMotionSemanticEquivalent &&
      report.comparison.reducedMotionSpatialSuppressed &&
      report.comparison.enterExitDurationRatio <= (options.maxExitRatio || 1.25) &&
      report.comparison.maxOvershoot <= (options.maxOvershoot || 0.15) &&
      report.comparison.easingCurveRmse.enter <= (options.maxEasingRmse || 0.25) &&
      report.comparison.easingCurveRmse.exit <= (options.maxEasingRmse || 0.25);
    return report;
  } finally {
    await browser.close();
    await served.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith('--'));
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  if (!target || !value('--selector')) throw new Error('Usage: temporal-motion <html-or-url> --selector <css> [--duration 420] [--frames dir] [--out report.json]');
  const output = path.resolve(value('--out', '.designos/temporal-motion.json'));
  const report = await temporalRegression({
    target,
    selector: value('--selector'),
    durationMs: Number(value('--duration', '420')),
    framesDir: value('--frames') ? path.resolve(value('--frames')) : null,
    cwd: process.cwd(),
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`temporal-motion: ${report.passed ? 'clean' : 'failed'}; ${report.sequence.fullFrames + report.sequence.reducedFrames} sampled frames → ${path.relative(process.cwd(), output)}`);
  if (!report.passed) process.exit(1);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exit(1); });
module.exports = { cubicBezierValue, phaseMetrics, temporalRegression };
