#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { finding } = require('../validators/rule-registry');

const args = process.argv.slice(2);
const value = (name, fallback = '') => {
  const direct = args.indexOf(name);
  const inline = args.find(item => item.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  return direct >= 0 && args[direct + 1] ? args[direct + 1] : fallback;
};
const targetArg = args.find(item => !item.startsWith('--') && !args[args.indexOf(item) - 1]?.startsWith('--'));
if (!targetArg) {
  console.error('Usage: browser-gate <html-or-url> [--out report.json] [--screenshots dir] [--max-diff pct]');
  process.exit(2);
}

let playwright;
let axePath;
try {
  playwright = require('playwright');
  axePath = require.resolve('axe-core/axe.min.js');
} catch {
  console.error('BROWSER_GATE_UNAVAILABLE: Playwright and axe-core are required. Run npm install, then npx playwright install chromium.');
  process.exit(2);
}

const target = /^https?:\/\//i.test(targetArg)
  ? targetArg
  : pathToFileURL(path.resolve(process.cwd(), targetArg)).href;
const outFile = path.resolve(process.cwd(), value('--out', 'designos-browser-gate.json'));
const screenshotDir = path.resolve(process.cwd(), value('--screenshots', 'designos-visual'));
const maxDiff = Number(value('--max-diff', 'NaN'));
const baselineDir = value('--baseline-dir', '');
const quick = args.includes('--quick');
const browserName = value('--browser', 'chromium');
if (!['chromium', 'firefox', 'webkit'].includes(browserName)) {
  console.error(`Usage: --browser must be one of chromium, firefox, webkit (got "${browserName}")`);
  process.exit(2);
}
// The Chrome DevTools Protocol (full AX-tree dump, live-announcement cross-check) is
// Chromium-only — Playwright exposes no CDP-equivalent session on Firefox/WebKit. Those
// engines still get the full DOM/axe-core/screenshot pass; the CDP-only checks degrade to
// "not collected" rather than crashing the run.
const supportsCDP = browserName === 'chromium';
const viewports = quick ? [{ name: 'fixture-375', width: 375, height: 812 }] : [
  { name: 'reflow-320', width: 320, height: 800 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
];
const themes = quick || args.includes('--single-theme') ? ['light'] : ['light', 'dark'];
const motions = quick || args.includes('--single-motion') ? ['full'] : ['full', 'reduced'];

// Third-party CDNs the gate does not control the uptime of (e.g. font hosts). A transient
// failure here reflects CI network jitter, not a regression in the code under test — it
// must not flip a deterministic quality gate. Failures are still recorded in the raw
// `runtime` evidence for debugging; they just don't become a blocking finding.
// Add a host here only for origins the page intentionally depends on and cannot self-host.
const THIRD_PARTY_NETWORK_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
]);
const hostnameOf = url => { try { return new URL(url).hostname; } catch { return null; } };

const selectorFor = element => {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && parts.length < 5) {
    let part = node.tagName.toLowerCase();
    const stableClass = [...node.classList].find(name => !/^(?:active|open|selected|hover|focus|js-)/.test(name));
    if (stableClass) part += `.${CSS.escape(stableClass)}`;
    const siblings = node.parentElement ? [...node.parentElement.children].filter(item => item.tagName === node.tagName) : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
};

async function inspectPage(page, scenario) {
  return page.evaluate(({ scenario, selectorSource }) => {
    const selectorFor = new Function('element', selectorSource);
    const root = document.documentElement;
    const width = root.clientWidth;
    const height = window.innerHeight;
    const visible = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none'
        && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
    };
    const rectOf = element => {
      const rect = element.getBoundingClientRect();
      return { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right),
        bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    const all = [...document.body.querySelectorAll('*')].filter(visible);
    const controls = all.filter(element =>
      element.matches('button,input,select,textarea,[role="button"],[role="switch"],[role="checkbox"],a[href],[data-designos-target]'));
    const insideHorizontalScroller = element => {
      for (let ancestor = element.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (/auto|scroll/.test(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 2) return true;
      }
      return false;
    };
    const overflow = all.filter(element => {
      const rect = element.getBoundingClientRect();
      return !element.closest('[data-designos-allow-overflow]')
        && !insideHorizontalScroller(element)
        && (rect.right > width + 2 || rect.left < -2);
    }).slice(0, 20).map(element => ({ selector: selectorFor(element), rect: rectOf(element),
      text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100) }));
    const smallTargets = controls.filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    }).slice(0, 30).map(element => ({ selector: selectorFor(element), rect: rectOf(element),
      name: element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 80) }));
    const smallText = all.filter(element => {
      if (element.children.length || element.matches('script,style,svg,path')) return false;
      const text = (element.textContent || '').trim();
      return text && parseFloat(getComputedStyle(element).fontSize) < 12
        && !element.closest('[data-designos-small-text-ok]');
    }).slice(0, 30).map(element => ({
      selector: selectorFor(element), size: getComputedStyle(element).fontSize,
      text: (element.textContent || '').trim().slice(0, 80),
    }));
    const clipped = all.filter(element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const visuallyHidden = style.position === 'absolute'
        && ((rect.width <= 2 && rect.height <= 2 && /hidden|clip/.test(style.overflow + style.clip))
          || (style.clipPath && style.clipPath !== 'none'));
      const clips = /hidden|clip/.test(style.overflow + style.overflowX + style.overflowY)
        || style.textOverflow === 'ellipsis';
      return clips && !visuallyHidden && !element.matches('pre,code') && !element.closest('[data-designos-allow-clip]')
        && !insideHorizontalScroller(element)
        && (element.scrollWidth > element.clientWidth + 4 || element.scrollHeight > element.clientHeight + 4);
    }).slice(0, 30).map(element => ({ selector: selectorFor(element), rect: rectOf(element),
      scrollWidth: element.scrollWidth, scrollHeight: element.scrollHeight }));
    const header = document.querySelector('header,[role="banner"]');
    let headerCollision = null;
    if (header && visible(header)) {
      const headerRect = header.getBoundingClientRect();
      const children = [...header.querySelectorAll('a,button,[role="button"]')].filter(visible);
      const pairs = [];
      for (let i = 0; i < children.length; i++) for (let j = i + 1; j < children.length; j++) {
        const a = children[i].getBoundingClientRect();
        const b = children[j].getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
          && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
          pairs.push([selectorFor(children[i]), selectorFor(children[j])]);
        }
      }
      if (header.scrollWidth > header.clientWidth + 2 || pairs.length
        || headerRect.left < -2 || headerRect.right > width + 2) {
        headerCollision = { selector: selectorFor(header), rect: rectOf(header),
          scrollWidth: header.scrollWidth, clientWidth: header.clientWidth, pairs: pairs.slice(0, 10) };
      }
    }
    const fixed = all.filter(element => ['fixed', 'sticky'].includes(getComputedStyle(element).position));
    const fixedOverlaps = [];
    for (const overlay of fixed) {
      const a = overlay.getBoundingClientRect();
      for (const control of controls) {
        if (overlay.contains(control) || control.contains(overlay)) continue;
        const b = control.getBoundingClientRect();
        const iw = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const ih = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (iw * ih > Math.min(b.width * b.height, 176)) {
          fixedOverlaps.push({ overlay: selectorFor(overlay), target: selectorFor(control) });
          if (fixedOverlaps.length >= 20) break;
        }
      }
      if (fixedOverlaps.length >= 20) break;
    }
    const semantic = {
      lang: document.documentElement.lang || null,
      title: document.title,
      landmarks: ['header', 'nav', 'main', 'aside', 'footer'].reduce((acc, name) => {
        acc[name] = document.querySelectorAll(name).length; return acc;
      }, {}),
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(element => ({
        level: Number(element.tagName.slice(1)), text: (element.textContent || '').trim().slice(0, 120),
      })),
      controls: controls.slice(0, 200).map(element => ({
        selector: selectorFor(element), role: element.getAttribute('role') || element.tagName.toLowerCase(),
        name: element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 80),
      })),
    };
    return {
      scenario,
      document: { scrollWidth: root.scrollWidth, clientWidth: width, scrollHeight: root.scrollHeight, viewportHeight: height },
      overflow, smallTargets, smallText, clipped, headerCollision, fixedOverlaps, semantic,
      fonts: { status: document.fonts?.status || 'unsupported' },
      performance: {
        resources: performance.getEntriesByType('resource').length,
        transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || null,
        load: performance.getEntriesByType('navigation')[0]?.loadEventEnd || null,
        longTaskMs: window.__designosPerformance?.longTaskMs || 0,
        layoutShift: window.__designosPerformance?.layoutShift || 0,
      },
    };
  }, { scenario, selectorSource: selectorFor.toString().replace(/^element\s*=>\s*\{/, '{').replace(/\};?$/, '}') });
}

async function inspectKeyboard(page, scenario) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    const style = document.createElement('style');
    style.dataset.designosKeyboardAudit = '';
    style.textContent = '*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-delay:0ms!important}';
    document.head.append(style);
    if (!document.body.hasAttribute('tabindex')) document.body.setAttribute('tabindex', '-1');
    document.body.focus();
  });
  const stops = [];
  const seen = new Set();
  for (let index = 0; index < 120; index++) {
    await page.keyboard.press('Tab');
    await page.evaluate(() => document.activeElement?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const stop = await page.evaluate(selectorSource => {
      const selectorFor = new Function('element', selectorSource);
      const element = document.activeElement;
      if (!element || element === document.body) return null;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const visibleArea = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
        * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      const blockers = [...document.querySelectorAll('*')].filter(candidate => {
        if (candidate === element || candidate.contains(element) || element.contains(candidate)) return false;
        const candidateStyle = getComputedStyle(candidate);
        if (!['fixed', 'sticky'].includes(candidateStyle.position)
          || candidateStyle.display === 'none' || candidateStyle.visibility === 'hidden'
          || Number(candidateStyle.opacity) === 0 || candidateStyle.pointerEvents === 'none') return false;
        const candidateRect = candidate.getBoundingClientRect();
        const intersectionWidth = Math.max(0, Math.min(rect.right, candidateRect.right) - Math.max(rect.left, candidateRect.left));
        const intersectionHeight = Math.max(0, Math.min(rect.bottom, candidateRect.bottom) - Math.max(rect.top, candidateRect.top));
        return intersectionWidth * intersectionHeight > visibleArea * 0.25;
      });
      const visibleIndicator = parseFloat(style.outlineWidth) >= 1
        || style.boxShadow !== 'none'
        || parseFloat(style.borderWidth) >= 2;
      return {
        selector: selectorFor(element),
        name: element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 80),
        rect: { left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right),
          bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) },
        visibleIndicator,
        obscured: visibleArea < Math.max(1, rect.width * rect.height * 0.5) || blockers.length > 0,
        blockers: blockers.slice(0, 5).map(selectorFor),
      };
    }, selectorFor.toString().replace(/^element\s*=>\s*\{/, '{').replace(/\};?$/, '}'));
    if (!stop) break;
    if (seen.has(stop.selector)) break;
    seen.add(stop.selector);
    stops.push(stop);
  }
  return { scenario, stops, complete: stops.length > 0 && stops.length < 120 };
}

async function runDeclaredTasks(browser, targetUrl, findings) {
  const discoveryContext = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const discoveryPage = await discoveryContext.newPage();
  await discoveryPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  const tasks = await discoveryPage.evaluate(() => {
    const contract = document.querySelector('script[type="application/json"][data-designos-tasks]');
    if (!contract) return [];
    try { return JSON.parse(contract.textContent); } catch { return [{ id: 'invalid-contract', steps: [], parseError: true }]; }
  });
  await discoveryContext.close();
  const evidence = [];
  for (const task of tasks) {
    const viewport = task.viewport || { width: 375, height: 812 };
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce', colorScheme: 'light' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__designosInteractionDurations = [];
      try {
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.interactionId) window.__designosInteractionDurations.push(entry.duration);
          }
        }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      } catch {}
    });
    const steps = [];
    let passed = !task.parseError;
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      for (const step of task.steps || []) {
        let result = { ...step, passed: true };
        try {
          if (step.action === 'click') {
            await page.locator(step.selector).first().click();
            await page.waitForTimeout(50);
          } else if (step.action === 'press') {
            if (step.selector) await page.locator(step.selector).first().press(step.key);
            else await page.keyboard.press(step.key);
            await page.waitForTimeout(50);
          } else if (step.action === 'fill') {
            await page.locator(step.selector).first().fill(step.value || '');
            await page.waitForTimeout(50);
          } else if (step.action === 'wait') {
            await page.waitForTimeout(Math.min(Number(step.ms) || 0, 2000));
          } else if (step.assert) {
            result.observed = await page.locator(step.selector).first().evaluate((element, assertion) => {
              const visible = Boolean(element.getClientRects().length)
                && getComputedStyle(element).visibility !== 'hidden'
                && getComputedStyle(element).display !== 'none';
              return {
                text: (element.textContent || '').trim(),
                visible,
                attribute: assertion.name ? element.getAttribute(assertion.name) : null,
                role: element.getAttribute('role'),
                ariaLive: element.getAttribute('aria-live'),
              };
            }, step);
            if (step.assert === 'text') result.passed = result.observed.text.includes(step.includes || '');
            else if (step.assert === 'attribute') result.passed = result.observed.attribute === String(step.equals);
            else if (step.assert === 'visible') result.passed = result.observed.visible === (step.equals !== false);
            else if (step.assert === 'announcement') {
              const live = ['status', 'alert'].includes(result.observed.role)
                || ['polite', 'assertive'].includes(result.observed.ariaLive);
              if (supportsCDP) {
                const cdp = await context.newCDPSession(page);
                await cdp.send('Accessibility.enable');
                const ax = await cdp.send('Accessibility.getFullAXTree');
                const expected = String(step.includes || '').toLowerCase();
                const children = new Map();
                for (const node of ax.nodes) {
                  if (!children.has(node.parentId)) children.set(node.parentId, []);
                  children.get(node.parentId).push(node);
                }
                const subtreeText = root => {
                  const queue = [root];
                  const names = [];
                  while (queue.length) {
                    const node = queue.shift();
                    if (node.name?.value) names.push(node.name.value);
                    queue.push(...(children.get(node.nodeId) || []));
                  }
                  return names.join(' ').trim();
                };
                const announcementNode = ax.nodes.find(node => {
                  const role = String(node.role?.value || '').toLowerCase();
                  return ['status', 'alert'].includes(role)
                    && subtreeText(node).toLowerCase().includes(expected);
                });
                result.axAnnouncement = announcementNode ? {
                  role: announcementNode.role?.value || null,
                  name: subtreeText(announcementNode),
                  ignored: Boolean(announcementNode.ignored),
                } : null;
                result.passed = live && result.observed.text.includes(step.includes || '')
                  && Boolean(result.axAnnouncement) && !result.axAnnouncement.ignored;
              } else {
                // No CDP AX tree on this engine — fall back to the DOM-level live-region
                // contract (role/aria-live + text) without the platform-AX cross-check.
                result.axAnnouncement = null;
                result.passed = live && result.observed.text.includes(step.includes || '');
              }
              if (!result.passed) findings.push(finding('dom-live-announcement', {
                engine: 'dom', scenario: `task-${task.id}`,
                message: `task-${task.id}: ${step.selector} did not expose “${step.includes || ''}” through a live announcement contract.`,
                details: result.observed,
              }));
            }
          }
        } catch (error) {
          result = { ...step, passed: false, error: error.message };
        }
        steps.push(result);
        if (!result.passed) passed = false;
      }
    } catch (error) {
      passed = false;
      steps.push({ passed: false, error: error.message });
    }
    await page.waitForTimeout(100);
    const interactionLatencyMs = await page.evaluate(() =>
      Math.max(0, ...(window.__designosInteractionDurations || [])));
    if (interactionLatencyMs > 200) {
      passed = false;
      findings.push(finding('runtime-interaction-latency', {
        engine: 'dom', scenario: `task-${task.id}`,
        message: `Declared task “${task.id}” recorded a ${interactionLatencyMs}ms interaction, above the 200ms budget.`,
        details: { interactionLatencyMs },
      }));
    }
    if (!passed) findings.push(finding('dom-task-flow', {
      engine: 'dom', scenario: `task-${task.id}`,
      message: `Declared task “${task.id}” did not complete every step.`,
      details: steps.filter(step => !step.passed),
    }));
    evidence.push({ id: task.id, viewport, passed, interactionLatencyMs, steps });
    await context.close();
  }
  return evidence;
}

async function inspectTextSpacing(browser, targetUrl, screenshotDir) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 800 },
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.addStyleTag({ content: `
    html,body,body * { line-height:1.5!important; letter-spacing:.12em!important; word-spacing:.16em!important; }
    p { margin-bottom:2em!important; }
  ` });
  const result = await inspectPage(page, 'text-spacing');
  result.screenshot = path.join(screenshotDir, 'text-spacing.png');
  await page.screenshot({ path: result.screenshot, fullPage: true });
  await context.close();
  return result;
}

async function inspectForcedColors(browser, targetUrl, screenshotDir) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    forcedColors: 'active',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  const failures = await page.evaluate(() => {
    const visible = element => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const transparent = value => value === 'transparent' || /rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(value);
    return [...document.querySelectorAll('button,input,select,textarea,a[href],[role="button"],[role="switch"]')]
      .filter(visible).flatMap(element => {
        const style = getComputedStyle(element);
        const hasText = Boolean((element.getAttribute('aria-label') || element.textContent || '').trim());
        const textLost = hasText && transparent(style.color);
        const boundaryLost = element.matches('button,input,select,textarea,[role="button"],[role="switch"]')
          && transparent(style.backgroundColor)
          && parseFloat(style.borderTopWidth) === 0
          && style.backgroundImage === 'none';
        return textLost || (boundaryLost && style.forcedColorAdjust === 'none') ? [{
          selector: element.id ? `#${element.id}` : element.tagName.toLowerCase(),
          textLost, boundaryLost, color: style.color, backgroundColor: style.backgroundColor,
          borderWidth: style.borderTopWidth, forcedColorAdjust: style.forcedColorAdjust,
        }] : [];
      });
  });
  const keyboard = await inspectKeyboard(page, 'forced-colors');
  const result = { scenario: 'forced-colors', failures, keyboard };
  result.screenshot = path.join(screenshotDir, 'forced-colors.png');
  await page.screenshot({ path: result.screenshot, fullPage: true });
  await context.close();
  return result;
}

async function compareScreenshots(browser, baseline, current, diffFile) {
  if (!fs.existsSync(baseline)) return { status: 'missing-baseline', baseline, current };
  const baselineBuffer = fs.readFileSync(baseline);
  const currentBuffer = fs.readFileSync(current);
  if (baselineBuffer.equals(currentBuffer)) {
    return {
      status: 'compared', baseline, current, diff: null, width: null, height: null,
      changedPixels: 0, totalPixels: null, percent: 0, dimensionMismatch: false,
      byteIdentical: true,
    };
  }
  const baselineData = `data:image/png;base64,${baselineBuffer.toString('base64')}`;
  const currentData = `data:image/png;base64,${currentBuffer.toString('base64')}`;
  const page = await browser.newPage();
  const comparison = await page.evaluate(async ({ baselineData, currentData }) => {
    const load = source => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
    const [before, after] = await Promise.all([load(baselineData), load(currentData)]);
    const width = Math.max(before.naturalWidth, after.naturalWidth);
    const height = Math.max(before.naturalHeight, after.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.clearRect(0, 0, width, height); context.drawImage(before, 0, 0);
    const a = context.getImageData(0, 0, width, height);
    context.clearRect(0, 0, width, height); context.drawImage(after, 0, 0);
    const b = context.getImageData(0, 0, width, height);
    const diff = context.createImageData(width, height);
    let changed = 0;
    for (let index = 0; index < a.data.length; index += 4) {
      const delta = Math.max(
        Math.abs(a.data[index] - b.data[index]),
        Math.abs(a.data[index + 1] - b.data[index + 1]),
        Math.abs(a.data[index + 2] - b.data[index + 2]),
        Math.abs(a.data[index + 3] - b.data[index + 3]),
      );
      if (delta > 16) {
        changed++;
        diff.data[index] = 255; diff.data[index + 1] = 0; diff.data[index + 2] = 90; diff.data[index + 3] = 220;
      } else {
        const gray = Math.round((b.data[index] + b.data[index + 1] + b.data[index + 2]) / 3);
        diff.data[index] = gray; diff.data[index + 1] = gray; diff.data[index + 2] = gray; diff.data[index + 3] = 50;
      }
    }
    context.putImageData(diff, 0, 0);
    return {
      width, height, changedPixels: changed, totalPixels: width * height,
      percent: (changed / (width * height)) * 100,
      diff: canvas.toDataURL('image/png').split(',')[1],
      dimensionMismatch: before.naturalWidth !== after.naturalWidth || before.naturalHeight !== after.naturalHeight,
    };
  }, { baselineData, currentData });
  await page.close();
  fs.mkdirSync(path.dirname(diffFile), { recursive: true });
  fs.writeFileSync(diffFile, Buffer.from(comparison.diff, 'base64'));
  delete comparison.diff;
  return { status: 'compared', baseline, current, diff: diffFile, ...comparison };
}

async function run() {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const browser = await playwright[browserName].launch({ headless: true });
  const results = [];
  const findings = [];
  try {
    for (const viewport of viewports) {
      for (const theme of themes) {
        for (const motion of motions) {
          const scenario = `${viewport.name}-${theme}-${motion}`;
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            colorScheme: theme,
            reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference',
          });
          const page = await context.newPage();
          await page.addInitScript(() => {
            window.__designosPerformance = { longTaskMs: 0, layoutShift: 0 };
            // Firefox/WebKit don't support the longtask/layout-shift entry types (Chromium-only
            // APIs) — feature-detect before observing so unsupported types don't get registered
            // at all. Registering anyway doesn't throw; it logs an "unsupported entryTypes"
            // console warning on Firefox, which the gate would otherwise misreport as a page bug.
            const supported = typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes
              ? PerformanceObserver.supportedEntryTypes : [];
            try {
              if (supported.includes('longtask')) {
                new PerformanceObserver(list => {
                  for (const entry of list.getEntries()) window.__designosPerformance.longTaskMs += entry.duration;
                }).observe({ type: 'longtask', buffered: true });
              }
              if (supported.includes('layout-shift')) {
                new PerformanceObserver(list => {
                  for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__designosPerformance.layoutShift += entry.value;
                }).observe({ type: 'layout-shift', buffered: true });
              }
            } catch {}
          });
          const runtime = [];
          page.on('console', message => {
            const text = message.text();
            // Every engine echoes failed resource/font loads to the console in its own
            // words (Chromium: "Failed to load resource: the server responded with a
            // status of ..."; Firefox: "downloadable font: download failed (... source:
            // <url>)"; WebKit has its own phrasing too) — none of it carries information
            // beyond what the paired requestfailed/response event already provides
            // (including third-party-host classification), so recording it here too would
            // double-count the same failure under a different message per engine and
            // bypass that classification. Match by URL when the message embeds one
            // (Firefox/WebKit); fall back to Chromium's known no-URL phrasing otherwise.
            const urls = text.match(/https?:\/\/[^\s")]+/g) || [];
            if (urls.some(url => THIRD_PARTY_NETWORK_HOSTS.has(hostnameOf(url)))) return;
            if (!urls.length && /^Failed to load resource: the server responded with a status of \d+/.test(text)) return;
            if (['error', 'warning'].includes(message.type())) runtime.push({ type: message.type(), text });
          });
          page.on('pageerror', error => runtime.push({ type: 'pageerror', text: error.message }));
          page.on('requestfailed', request => runtime.push({ type: 'requestfailed', url: request.url(), text: `${request.url()} — ${request.failure()?.errorText || 'failed'}` }));
          page.on('response', response => {
            if (response.status() >= 400) runtime.push({ type: 'response', url: response.url(), text: `${response.status()} ${response.url()}` });
          });
          await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
          await page.evaluate(() => document.fonts?.ready);
          const result = await inspectPage(page, scenario);
          await page.addScriptTag({ path: axePath });
          result.axe = await page.evaluate(async () => {
            const report = await axe.run(document, {
              resultTypes: ['violations', 'incomplete'],
              runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
            });
            return {
              testEngine: report.testEngine,
              testEnvironment: report.testEnvironment,
              violations: report.violations,
              incomplete: report.incomplete,
              passes: report.passes?.length || 0,
            };
          });
          if (supportsCDP) {
            const cdp = await context.newCDPSession(page);
            await cdp.send('Accessibility.enable');
            const ax = await cdp.send('Accessibility.getFullAXTree');
            result.accessibilityTree = ax.nodes.map(node => ({
              nodeId: node.nodeId,
              parentId: node.parentId,
              role: node.role?.value || null,
              name: node.name?.value || null,
              ignored: Boolean(node.ignored),
              properties: (node.properties || []).reduce((acc, property) => {
                if (['disabled', 'expanded', 'focused', 'level', 'checked', 'selected'].includes(property.name)) {
                  acc[property.name] = property.value?.value;
                }
                return acc;
              }, {}),
            }));
          } else {
            result.accessibilityTree = null; // not collected — see supportsCDP note above
          }
          if (theme === 'light' && motion === 'full') {
            result.keyboard = await inspectKeyboard(page, scenario);
            for (const stop of result.keyboard.stops) {
              if (!stop.visibleIndicator) findings.push(finding('source-missing-focus', {
                engine: 'dom', scenario, message: `${scenario}: ${stop.selector} has no computed focus indicator.`,
                details: stop,
              }));
              if (stop.obscured) findings.push(finding('dom-focus-obscured', {
                engine: 'dom', scenario, message: `${scenario}: ${stop.selector} is obscured while focused.`,
                details: stop,
              }));
            }
          }
          result.runtime = runtime;
          const screenshot = path.join(screenshotDir, `${scenario}.png`);
          await page.screenshot({ path: screenshot, fullPage: true });
          result.screenshot = screenshot;
          fs.writeFileSync(path.join(screenshotDir, `${scenario}.a11y.json`), JSON.stringify({
            semantic: result.semantic,
            axe: result.axe,
            accessibilityTree: result.accessibilityTree,
          }, null, 2));
          results.push(result);
          if (result.document.scrollWidth > result.document.clientWidth + 2) {
            findings.push(finding('dom-horizontal-overflow', { engine: 'dom', scenario,
              message: `${scenario}: ${result.document.scrollWidth}px document exceeds ${result.document.clientWidth}px viewport.`,
              elements: result.overflow }));
          }
          if (result.headerCollision) findings.push(finding('dom-header-collision', { engine: 'dom', scenario, details: result.headerCollision }));
          for (const item of result.smallTargets) findings.push(finding('dom-tap-target', { engine: 'dom', scenario, details: item }));
          for (const item of result.smallText) findings.push(finding('dom-text-too-small', { engine: 'dom', scenario, details: item }));
          for (const item of result.clipped) findings.push(finding('dom-clipped-text', { engine: 'dom', scenario, details: item }));
          for (const item of result.fixedOverlaps) findings.push(finding('dom-fixed-overlap', { engine: 'dom', scenario, details: item }));
          for (const violation of result.axe.violations.filter(item => ['serious', 'critical'].includes(item.impact))) {
            findings.push(finding('axe-violation', {
              engine: 'axe', scenario,
              message: `${scenario}: axe ${violation.id} (${violation.impact}) — ${violation.help}`,
              details: {
                id: violation.id, impact: violation.impact, help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.map(node => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })),
              },
            }));
          }
          for (const item of runtime) {
            const isNetworkEvent = ['requestfailed', 'response'].includes(item.type);
            if (isNetworkEvent && THIRD_PARTY_NETWORK_HOSTS.has(hostnameOf(item.url))) continue;
            findings.push(finding(
              isNetworkEvent ? 'runtime-broken-resource' : 'runtime-console-error',
              { engine: 'dom', scenario, message: `${scenario}: ${item.text}` }));
          }
          await context.close();
        }
      }
    }

    for (const zoom of quick ? [] : [2, 4]) {
      const context = await browser.newContext({
        viewport: { width: Math.round(1280 / zoom), height: Math.round(900 / zoom) },
        screen: { width: 1280, height: 900 },
        colorScheme: 'light',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
      const scenario = `text-zoom-${zoom * 100}`;
      const result = await inspectPage(page, scenario);
      const screenshot = path.join(screenshotDir, `${scenario}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      result.screenshot = screenshot;
      results.push(result);
      if (result.document.scrollWidth > result.document.clientWidth + 2) {
        findings.push(finding('dom-horizontal-overflow', { engine: 'dom', scenario,
          message: `${scenario}: reflow produces horizontal scrolling.`, elements: result.overflow }));
      }
      await context.close();
    }

    const textSpacing = await inspectTextSpacing(browser, target, screenshotDir);
    if (textSpacing.document.scrollWidth > textSpacing.document.clientWidth + 2
      || textSpacing.clipped.length || textSpacing.headerCollision || textSpacing.fixedOverlaps.length) {
      findings.push(finding('dom-text-spacing', {
        engine: 'dom', scenario: 'text-spacing',
        details: {
          document: textSpacing.document,
          overflow: textSpacing.overflow,
          clipped: textSpacing.clipped,
          headerCollision: textSpacing.headerCollision,
          fixedOverlaps: textSpacing.fixedOverlaps,
        },
      }));
    }
    const forcedColors = await inspectForcedColors(browser, target, screenshotDir);
    if (forcedColors.failures.length || forcedColors.keyboard.stops.some(stop => !stop.visibleIndicator || stop.obscured)) {
      findings.push(finding('dom-forced-colors', {
        engine: 'dom', scenario: 'forced-colors',
        details: {
          controls: forcedColors.failures,
          keyboard: forcedColors.keyboard.stops.filter(stop => !stop.visibleIndicator || stop.obscured),
        },
      }));
    }
    const taskFlows = await runDeclaredTasks(browser, target, findings);

    const diffs = [];
    if (baselineDir) {
      const resolvedBaseline = path.resolve(process.cwd(), baselineDir);
      for (const result of results) {
        const filename = path.basename(result.screenshot);
        const comparison = await compareScreenshots(
          browser,
          path.join(resolvedBaseline, filename),
          result.screenshot,
          path.join(screenshotDir, 'diffs', filename),
        );
        diffs.push({ scenario: result.scenario, ...comparison });
        if (comparison.status === 'compared' && Number.isFinite(maxDiff)
          && (comparison.percent > maxDiff || comparison.dimensionMismatch)) {
          findings.push(finding('visual-regression', {
            engine: 'pixel', scenario: result.scenario,
            message: `${result.scenario}: ${comparison.percent.toFixed(3)}% pixel difference exceeds ${maxDiff}% tolerance.`,
            details: comparison,
          }));
        }
      }
    }
    results.diffs = diffs;
    results.supplemental = { textSpacing, forcedColors };
    results.taskFlows = taskFlows;
  } finally {
    await browser.close();
  }

  const report = {
    schema: 1,
    target,
    generatedAt: new Date().toISOString(),
    viewports,
    themes,
    motions,
    zooms: quick ? [] : [200, 400],
    results,
    supplemental: results.supplemental || {},
    taskFlows: results.taskFlows || [],
    diffs: results.diffs || [],
    findings,
    summary: {
      scenarios: results.length,
      screenshots: results.length,
      keyboardPaths: results.filter(item => item.keyboard?.complete).length,
      tasksDeclared: (results.taskFlows || []).length,
      tasksPassed: (results.taskFlows || []).filter(item => item.passed).length,
      p1: findings.filter(item => item.severity === 'P1').length,
      p2: findings.filter(item => item.severity === 'P2').length,
      passed: !findings.some(item => ['P1', 'P2'].includes(item.severity)),
    },
    maxDiff: Number.isFinite(maxDiff) ? maxDiff : null,
    baselineDir: baselineDir || null,
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.summary));
  if (!report.summary.passed) process.exitCode = 1;
}

run().catch(error => {
  console.error(error.stack || error.message);
  process.exit(2);
});
