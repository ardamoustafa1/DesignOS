#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { serveTarget } = require('./motion/browser-target');

const percentile = (values, quantile) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(quantile * sorted.length) - 1)];
};

function summarizeTrace(events, runtime, maxLayers) {
  const durations = name => events
    .filter(event => event.name === name && Number.isFinite(event.dur))
    .map(event => event.dur / 1000);
  const sum = values => values.reduce((total, value) => total + value, 0);
  const frameTimes = runtime.frameTimes || [];
  const droppedFrames = frameTimes.reduce((total, duration) =>
    total + Math.max(0, Math.round(duration / 16.6667) - 1), 0);
  const expectedFrames = frameTimes.length + droppedFrames;
  const longFrames = frameTimes.filter(duration => duration > 50);
  const tasks = [...durations('RunTask'), ...durations('ThreadControllerImpl::RunTask')];
  const animationEvents = events.filter(event =>
    /animation/i.test(`${event.name} ${event.cat || ''}`));
  const eventCounts = animationEvents.reduce((counts, event) => {
    counts[event.name] = (counts[event.name] || 0) + 1;
    return counts;
  }, {});
  const attribution = {
    targets: [...new Set(animationEvents.map(event => event.args?.data?.name)
      .filter(value => typeof value === 'string' && value.length > 1))],
    traceEvents: Object.entries(eventCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count })),
  };
  const histogram = {
    under16_7: frameTimes.filter(value => value <= 16.7).length,
    from16_7To33_3: frameTimes.filter(value => value > 16.7 && value <= 33.3).length,
    from33_3To50: frameTimes.filter(value => value > 33.3 && value <= 50).length,
    over50: longFrames.length,
  };
  const traceLayerIds = new Set(events.flatMap(event => [
    event.args?.layerId,
    event.args?.data?.layerId,
    event.args?.data?.layer_id,
  ]).filter(value => value !== undefined && value !== null));
  return {
    averageFps: frameTimes.length ? 1000 / (sum(frameTimes) / frameTimes.length) : 0,
    worstFrameMs: frameTimes.length ? Math.max(...frameTimes) : 0,
    droppedFrameRatio: expectedFrames ? droppedFrames / expectedFrames : 0,
    frameTimeMs: {
      count: frameTimes.length,
      p50: percentile(frameTimes, 0.5),
      p95: percentile(frameTimes, 0.95),
      p99: percentile(frameTimes, 0.99),
      max: frameTimes.length ? Math.max(...frameTimes) : 0,
      histogram,
    },
    droppedFrames,
    longAnimationFrames: {
      count: runtime.longAnimationFrames?.length || longFrames.length,
      totalBlockingDurationMs: sum((runtime.longAnimationFrames || []).map(item => item.blockingDuration || 0)),
    },
    mainThread: {
      taskCount: tasks.length,
      blockingTaskCount: tasks.filter(duration => duration > 50).length,
      blockingTimeMs: sum(tasks.map(duration => Math.max(0, duration - 50))),
      p95TaskMs: percentile(tasks, 0.95),
    },
    rendering: {
      styleRecalculationCount: durations('RecalculateStyles').length + durations('UpdateLayoutTree').length,
      styleRecalculationMs: sum([...durations('RecalculateStyles'), ...durations('UpdateLayoutTree')]),
      layoutCount: durations('Layout').length,
      layoutMs: sum(durations('Layout')),
      paintCount: durations('Paint').length + durations('PaintImage').length,
      paintMs: sum([...durations('Paint'), ...durations('PaintImage')]),
      compositeCount: durations('CompositeLayers').length + durations('DrawFrame').length,
      compositeMs: sum([...durations('CompositeLayers'), ...durations('DrawFrame')]),
      maxCompositeLayers: Math.max(maxLayers, traceLayerIds.size),
      compositeOnly: durations('Layout').length === 0 &&
        durations('Paint').length === 0 && durations('PaintImage').length === 0,
    },
    interaction: {
      inputToMotionLatencyMs: runtime.inputToMotionLatencyMs ?? null,
      settleTimeMs: runtime.settleTimeMs ?? null,
      overshoot: runtime.overshoot ?? null,
      cancelResponseTimeMs: runtime.cancelResponseTimeMs ?? null,
    },
    cleanup: {
      listenerDelta: runtime.listenerDelta ?? null,
      heapDeltaBytes: runtime.heapDeltaBytes ?? null,
      heapBudgetBytes: 1024 * 1024,
      heapGrowthWithinBudget: runtime.heapDeltaBytes == null ? null : runtime.heapDeltaBytes <= 1024 * 1024,
      unhandledRejections: runtime.unhandledRejections || 0,
      leakFree: (runtime.listenerDelta ?? 0) <= 0 &&
        (runtime.heapDeltaBytes == null || runtime.heapDeltaBytes <= 1024 * 1024) &&
        (runtime.unhandledRejections || 0) === 0,
    },
    reducedMotion: runtime.reducedMotion || null,
    animationAttribution: attribution,
  };
}

async function readTraceStream(client, handle) {
  let data = '';
  while (true) {
    const chunk = await client.send('IO.read', { handle });
    data += chunk.data;
    if (chunk.eof) break;
  }
  await client.send('IO.close', { handle });
  return JSON.parse(data).traceEvents || [];
}

async function profileMotion(options) {
  const served = await serveTarget(options.target, options.cwd);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    viewport: options.viewport || { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const profile = window.__designosProfile = {
      timestamps: [], longAnimationFrames: [], inputs: [], changes: [], positions: [],
      listenerAdds: 0, listenerRemoves: 0, unhandledRejections: 0,
    };
    const nativeAdd = EventTarget.prototype.addEventListener;
    const nativeRemove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (...args) {
      profile.listenerAdds += 1;
      return nativeAdd.apply(this, args);
    };
    EventTarget.prototype.removeEventListener = function (...args) {
      profile.listenerRemoves += 1;
      return nativeRemove.apply(this, args);
    };
    nativeAdd.call(window, 'unhandledrejection', () => { profile.unhandledRejections += 1; });
    nativeAdd.call(document, 'pointerdown', () => profile.inputs.push(performance.now()), true);
    nativeAdd.call(document, 'keydown', () => profile.inputs.push(performance.now()), true);
    requestAnimationFrame(function frame(timestamp) {
      profile.timestamps.push(timestamp);
      if (profile.target) {
        const style = getComputedStyle(profile.target);
        const signature = `${style.transform}|${style.opacity}`;
        const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
        profile.positions.push({ t: timestamp, x: matrix.e, y: matrix.f });
        if (signature !== profile.lastSignature) {
          profile.changes.push(timestamp);
          profile.lastSignature = signature;
        }
      }
      requestAnimationFrame(frame);
    });
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          profile.longAnimationFrames.push({
            duration: entry.duration,
            blockingDuration: entry.blockingDuration || 0,
            name: entry.name,
          });
        }
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch {}
  });
  const client = await context.newCDPSession(page);
  let maxLayers = 0;
  client.on('LayerTree.layerTreeDidChange', event => {
    maxLayers = Math.max(maxLayers, event.layers?.length || 0);
  });
  await client.send('LayerTree.enable');
  const tracingComplete = new Promise(resolve => client.once('Tracing.tracingComplete', resolve));
  await client.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    categories: [
      'devtools.timeline', 'blink.user_timing', 'cc', 'animation',
      'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame',
    ].join(','),
  });
  try {
    await page.goto(served.url, { waitUntil: 'networkidle' });
    const before = await page.evaluate(selector => {
      const profile = window.__designosProfile;
      profile.target = selector ? document.querySelector(selector) : document.body;
      if (!profile.target) throw new Error(`Profiler selector not found: ${selector}`);
      const style = getComputedStyle(profile.target);
      profile.lastSignature = `${style.transform}|${style.opacity}`;
      return {
        heap: performance.memory?.usedJSHeapSize ?? null,
        listenerBalance: profile.listenerAdds - profile.listenerRemoves,
      };
    }, options.selector || null);
    if (options.selector) {
      const target = page.locator(options.selector).first();
      if (!await target.count()) throw new Error(`Profiler selector not found: ${options.selector}`);
      await target.click();
      if (options.cancelProbe !== false) {
        await page.waitForTimeout(options.cancelDelayMs || 32);
        await target.click();
      }
    }
    await page.waitForTimeout(options.durationMs || 1000);
    await client.send('Tracing.end');
    const complete = await tracingComplete;
    const events = await readTraceStream(client, complete.stream);
    const runtime = await page.evaluate(beforeMetrics => {
      const timestamps = window.__designosProfile.timestamps;
      const profile = window.__designosProfile;
      const inputs = profile.inputs;
      const changes = profile.changes;
      const positions = profile.positions;
      const firstInput = inputs[0];
      const firstChange = changes.find(value => value >= firstInput);
      const secondInput = inputs[1];
      const cancelChange = changes.find(value => value >= secondInput);
      const start = positions[0] || { x: 0, y: 0 };
      const end = positions.at(-1) || start;
      const total = Math.hypot(end.x - start.x, end.y - start.y);
      const maxDistance = Math.max(0, ...positions.map(point => Math.hypot(point.x - start.x, point.y - start.y)));
      return {
        frameTimes: timestamps.slice(1).map((value, index) => value - timestamps[index]),
        longAnimationFrames: profile.longAnimationFrames,
        inputToMotionLatencyMs: firstChange == null ? null : firstChange - firstInput,
        settleTimeMs: firstChange == null ? null : (changes.at(-1) - firstChange),
        cancelResponseTimeMs: cancelChange == null ? null : cancelChange - secondInput,
        overshoot: total > 0.01 ? Math.max(0, maxDistance / total - 1) : 0,
        listenerDelta: profile.listenerAdds - profile.listenerRemoves - beforeMetrics.listenerBalance,
        heapDeltaBytes: beforeMetrics.heap == null || performance.memory?.usedJSHeapSize == null
          ? null : performance.memory.usedJSHeapSize - beforeMetrics.heap,
        unhandledRejections: profile.unhandledRejections,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'reduce-observed' : 'full-motion-observed',
      };
    }, before);
    return {
      schema: 2,
      target: options.target,
      selector: options.selector || null,
      reducedMotion: Boolean(options.reducedMotion),
      durationMs: options.durationMs || 1000,
      generatedAt: new Date().toISOString(),
      metrics: summarizeTrace(events, runtime, maxLayers),
      trace: { eventCount: events.length, categories: 'devtools.timeline,cc,animation' },
    };
  } finally {
    await browser.close();
    await served.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: motion-profiler <html-or-url> [--selector <css>] [--duration 1000] [--out report.json]');
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const report = await profileMotion({
    target,
    selector: value('--selector'),
    durationMs: Number(value('--duration', '1000')),
    reducedMotion: args.includes('--reduced'),
    cwd: process.cwd(),
  });
  const output = path.resolve(value('--out', '.designos/motion-profile.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`motion-profiler: ${report.metrics.frameTimeMs.count} frames, ${report.metrics.droppedFrames} dropped → ${path.relative(process.cwd(), output)}`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exit(1); });
module.exports = { percentile, summarizeTrace, profileMotion };
