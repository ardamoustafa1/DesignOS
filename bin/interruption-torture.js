#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { serveTarget } = require('./motion/browser-target');
const { percentile } = require('./motion-profiler');

async function runScenario(browser, served, options, scenario) {
  const context = await browser.newContext({ viewport: { width: 960, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(() => {
    const balances = new WeakMap();
    const nativeAdd = EventTarget.prototype.addEventListener;
    const nativeRemove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (...args) {
      balances.set(this, (balances.get(this) || 0) + 1);
      return nativeAdd.apply(this, args);
    };
    EventTarget.prototype.removeEventListener = function (...args) {
      balances.set(this, Math.max(0, (balances.get(this) || 0) - 1));
      return nativeRemove.apply(this, args);
    };
    window.__designosTorture = {
      balances,
      detachedBalance: 0,
      unhandled: [],
      samples: [],
    };
    nativeAdd.call(window, 'unhandledrejection', event => {
      window.__designosTorture.unhandled.push(String(event.reason));
    });
  });
  await page.goto(served.url, { waitUntil: 'networkidle' });
  const locator = page.locator(options.selector).first();
  if (!await locator.count()) throw new Error(`Torture selector not found: ${options.selector}`);
  await page.evaluate(selector => {
    const target = document.querySelector(selector);
    requestAnimationFrame(function sample(t) {
      if (!target.isConnected) return;
      const style = getComputedStyle(target);
      const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
      window.__designosTorture.samples.push({
        t, x: matrix.e, y: matrix.f, opacity: Number(style.opacity),
        state: target.dataset.state || null,
      });
      requestAnimationFrame(sample);
    });
  }, options.selector);

  await scenario.exercise(page, locator, context);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(options.settleMs || 180);
  const evidence = await page.evaluate(selector => {
    const target = document.querySelector(selector);
    const harness = window.__designosTorture;
    const samples = harness.samples;
    const jumps = samples.slice(1).map((sample, index) =>
      Math.hypot(sample.x - samples[index].x, sample.y - samples[index].y));
    const style = target ? getComputedStyle(target) : null;
    return {
      connected: Boolean(target),
      finalState: target?.dataset.state || null,
      expectedState: target?.dataset.expectedState || 'idle',
      finalTransform: style?.transform || null,
      maxJumpPx: Math.max(0, ...jumps),
      p95JumpPx: jumps.length ? [...jumps].sort((a, b) => a - b)[Math.ceil(jumps.length * .95) - 1] : 0,
      listenerBalance: target ? (harness.balances.get(target) || 0) : harness.detachedBalance,
      unhandled: harness.unhandled,
    };
  }, options.selector);
  await context.close();
  const jumpRatio = evidence.maxJumpPx / Math.max(0.01, evidence.p95JumpPx);
  const passed = errors.length === 0 &&
    evidence.unhandled.length === 0 &&
    (evidence.connected || evidence.listenerBalance === 0) &&
    (!evidence.connected || evidence.finalState === evidence.expectedState) &&
    jumpRatio <= (options.maxJumpRatio || 8);
  return { id: scenario.id, passed, errors, jumpRatio, ...evidence };
}

const SCENARIOS = Object.freeze([
  {
    id: 'rapid-hover-unhover-20',
    exercise: async (page, target) => {
      const box = await target.boundingBox();
      for (let index = 0; index < 20; index += 1) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.move(1, 1);
      }
    },
  },
  {
    id: 'close-during-enter',
    exercise: async (_page, target) => {
      await target.click();
      await new Promise(resolve => setTimeout(resolve, 16));
      await target.click();
    },
  },
  {
    id: 'reverse-during-drag',
    exercise: async (page, target) => {
      const box = await target.boundingBox();
      const y = box.y + box.height / 2;
      await page.mouse.move(box.x + 10, y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 5, y, { steps: 4 });
      await page.mouse.move(box.x + 20, y, { steps: 4 });
      await page.mouse.up();
    },
  },
  {
    id: 'retarget-before-spring-settle',
    exercise: async (_page, target) => {
      for (let index = 0; index < 6; index += 1) {
        await target.click();
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    },
  },
  {
    id: 'route-transition-back',
    exercise: async page => {
      await page.locator('[data-route]').click();
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
    },
  },
  {
    id: 'resize-during-animation',
    exercise: async (page, target) => {
      await target.click();
      await page.setViewportSize({ width: 375, height: 720 });
      await page.setViewportSize({ width: 1024, height: 720 });
    },
  },
  {
    id: 'runtime-reduced-motion-change',
    exercise: async (page, target) => {
      await target.click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    },
  },
  {
    id: 'unmount-during-active-animation',
    exercise: async (page, target) => {
      await target.click();
      await page.evaluate(selector => {
        const node = document.querySelector(selector);
        node.dispatchEvent(new CustomEvent('designos:unmount'));
        window.__designosTorture.detachedBalance =
          window.__designosTorture.balances.get(node) || 0;
        node.remove();
      }, await target.evaluate(node => `#${node.id}`));
    },
  },
]);

async function interruptionTorture(options) {
  const { chromium } = require('playwright');
  const served = await serveTarget(options.target, options.cwd);
  const browser = await chromium.launch({ headless: true });
  try {
    const scenarios = [];
    for (const scenario of SCENARIOS) {
      scenarios.push(await runScenario(browser, served, options, scenario));
    }
    return {
      schema: 1,
      generatedAt: new Date().toISOString(),
      target: options.target,
      selector: options.selector,
      scenarios,
      summary: {
        total: scenarios.length,
        passed: scenarios.filter(item => item.passed).length,
        failed: scenarios.filter(item => !item.passed).length,
        p95JumpRatio: percentile(scenarios.map(item => item.jumpRatio), .95),
      },
      passed: scenarios.every(item => item.passed),
    };
  } finally {
    await browser.close();
    await served.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const target = args.find(arg => !arg.startsWith('--'));
  const selector = value('--selector');
  if (!target || !selector) throw new Error('Usage: interruption-torture <html-or-url> --selector <css> [--out report.json]');
  const report = await interruptionTorture({ target, selector, cwd: process.cwd() });
  const output = path.resolve(value('--out', '.designos/interruption-torture.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`interruption-torture: ${report.summary.passed}/${report.summary.total} scenarios → ${path.relative(process.cwd(), output)}`);
  if (!report.passed) process.exit(1);
}

if (require.main === module) main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
module.exports = { SCENARIOS, interruptionTorture };
