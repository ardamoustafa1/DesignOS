#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { serveTarget } = require('./motion/browser-target');

const DEFAULT_WIDTHS = Object.freeze([375, 768, 1024, 1440]);

async function inspectWidth(page, width, options) {
  await page.setViewportSize({ width, height: options.height || 900 });
  
  if (options.torture) {
    await page.evaluate(() => {
      // Adaptive Torture Simulator: Aggressive DOM Mutation
      // 1. Text Expansion & RTL
      document.documentElement.dir = 'rtl';
      document.documentElement.style.fontSize = '300%';
      
      const walk = node => {
        if (node.nodeType === 3 && node.nodeValue.trim()) {
          node.nodeValue = 'Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft ' + node.nodeValue + ' 日中韓 漢語';
        } else if (node.nodeType === 1) {
          // 2. Multiply Collections (1-100 items)
          if (node.tagName === 'UL' || node.tagName === 'OL' || node.tagName === 'TBODY' || node.getAttribute('role') === 'list') {
            if (node.children.length > 0) {
              const clone = node.children[0].cloneNode(true);
              for(let i=0; i<40; i++) node.appendChild(clone.cloneNode(true)); // Add 40 items
            }
          }
          // 3. Force scrollbars & virtual keyboard safe areas
          node.style.setProperty('--safe-area-inset-bottom', '300px'); // virtual keyboard
          for(const child of node.childNodes) walk(child);
        }
      };
      walk(document.body);
    });
  }
  
  await page.waitForTimeout(40);
  return page.evaluate(({ minimumReadableLinePx, maximumMeasureCh, touchTargetPx, safeAreaPx }) => {
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const cssPath = element => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const parts = [];
      let node = element;
      while (node && node !== document.body && parts.length < 4) {
        const index = [...node.parentElement.children].indexOf(node) + 1;
        parts.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
        node = node.parentElement;
      }
      return `body>${parts.join('>')}`;
    };
    const violations = [];
    const add = (type, element, measured, required, suggestion) =>
      violations.push({ type, selector: cssPath(element), measured, required, suggestion });
    for (const element of document.querySelectorAll('body *')) {
      if (!visible(element)) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (rect.right > innerWidth + .5 || rect.left < -.5) {
        const overflowPx = Math.max(rect.right - innerWidth, -rect.left);
        add('horizontal-overflow', element, { overflowPx, rect: { left: rect.left, right: rect.right } },
          { viewportWidth: innerWidth },
          { property: 'max-inline-size', value: '100%', deltaPx: Math.ceil(overflowPx), secondary: 'min-inline-size:0 on the nearest grid/flex child' });
      }
      if (/^(P|LI|BLOCKQUOTE)$/.test(element.tagName) && element.textContent.trim().length > 40) {
        const max = parseFloat(style.fontSize) * maximumMeasureCh;
        if (rect.width > max) add('maximum-content-measure', element, rect.width, max,
          { property: 'max-inline-size', value: `${maximumMeasureCh}ch`, deltaPx: Math.ceil(rect.width - max) });
        if (rect.width < minimumReadableLinePx && innerWidth >= minimumReadableLinePx + safeAreaPx * 2) {
          add('minimum-readable-line', element, rect.width, minimumReadableLinePx,
            { property: 'min-inline-size', value: `${minimumReadableLinePx}px`, deltaPx: Math.ceil(minimumReadableLinePx - rect.width) });
        }
      }
      if (element.matches('button,a[href],input,select,textarea,[role=button],[role=link]') &&
          (rect.width < touchTargetPx || rect.height < touchTargetPx)) {
        add('touch-target', element, { width: rect.width, height: rect.height },
          { width: touchTargetPx, height: touchTargetPx },
          { property: 'min-inline-size/min-block-size', value: `${touchTargetPx}px`, deltaPx: Math.ceil(Math.max(touchTargetPx - rect.width, touchTargetPx - rect.height)) });
      }
      if (['fixed', 'sticky'].includes(style.position) &&
          (rect.left < safeAreaPx || innerWidth - rect.right < safeAreaPx)) {
        add('safe-area', element, { left: rect.left, right: innerWidth - rect.right },
          { inset: safeAreaPx },
          { property: 'padding-inline', value: `max(${safeAreaPx}px, env(safe-area-inset-left/right))`, deltaPx: Math.ceil(Math.max(safeAreaPx - rect.left, safeAreaPx - (innerWidth - rect.right))) });
      }
      if (element.tagName === 'IMG') {
        const intrinsic = element.naturalWidth && element.naturalHeight ? element.naturalWidth / element.naturalHeight : null;
        const rendered = rect.width / Math.max(1, rect.height);
        if (!element.hasAttribute('width') || !element.hasAttribute('height') || (intrinsic && Math.abs(intrinsic - rendered) > .08)) {
          add('intrinsic-image-ratio', element, rendered, intrinsic,
            { property: 'aspect-ratio', value: intrinsic ? String(intrinsic) : 'declare width/height', delta: intrinsic ? Math.abs(intrinsic - rendered) : null });
        }
      }
      if (element.matches('nav,[role=navigation]') && element.scrollWidth > element.clientWidth + 1) {
        add('navigation-collapse', element, element.scrollWidth, element.clientWidth,
          { breakpoint: `${innerWidth + Math.ceil(element.scrollWidth - element.clientWidth)}px`, action: 'collapse to an operable menu before this width' });
      }
      if (element.tagName === 'TABLE' && rect.width > innerWidth - safeAreaPx * 2) {
        add('data-table-fallback', element, rect.width, innerWidth - safeAreaPx * 2,
          { action: 'wrap in keyboard-focusable horizontal region or switch to labelled rows', deltaPx: Math.ceil(rect.width - (innerWidth - safeAreaPx * 2)) });
      }
      
      // Torture constraints
      if (element.matches('button,a[href],input,select,textarea,[role=button],[role=link]')) {
        // Touch Collision
        for(const other of document.querySelectorAll('button,a[href],input,select,textarea,[role=button],[role=link]')) {
          if(element !== other && visible(other)) {
            const oRect = other.getBoundingClientRect();
            if (!(rect.right < oRect.left || rect.left > oRect.right || rect.bottom < oRect.top || rect.top > oRect.bottom)) {
              add('touch-collision', element, { overlap: true }, { overlap: false }, { action: 'Add sufficient spacing between touch targets' });
            }
          }
        }
      }
      
      // Hierarchy Collapse
      if (element.matches('header,main,footer,section,article')) {
        for(const other of document.querySelectorAll('header,main,footer,section,article')) {
          if(element !== other && element.parentElement === other.parentElement && visible(other)) {
            const oRect = other.getBoundingClientRect();
            if (!(rect.right < oRect.left || rect.left > oRect.right || rect.bottom < oRect.top || rect.top > oRect.bottom)) {
              add('hierarchy-collapse', element, { overlap: true }, { overlap: false }, { action: 'Fix z-index, absolute positioning, or float clearing' });
            }
          }
        }
      }
      
      // Orphan CTA
      if (element.matches('button[type="submit"],button.primary,[data-primary="true"]')) {
        let parent = element.parentElement;
        while(parent && parent !== document.body) {
          if(getComputedStyle(parent).overflowY === 'hidden' || getComputedStyle(parent).overflow === 'hidden') {
            const pRect = parent.getBoundingClientRect();
            if (rect.bottom > pRect.bottom || rect.top < pRect.top) {
              add('orphan-cta', element, { hidden: true }, { hidden: false }, { action: 'Primary CTA is trapped inside hidden overflow without a scroll route' });
            }
          }
          parent = parent.parentElement;
        }
      }
      
      // Clipped Focus
      if (element.matches(':focus-visible') || element.tabIndex >= 0) {
        let parent = element.parentElement;
        while(parent && parent !== document.body) {
          if(getComputedStyle(parent).overflow === 'hidden') {
            const pRect = parent.getBoundingClientRect();
            if (rect.left < pRect.left || rect.right > pRect.right || Math.max(0, rect.width) === 0) {
              add('clipped-focus', element, { clipped: true }, { clipped: false }, { action: 'Focusable element is clipped horizontally or scaled to 0 width' });
            }
          }
          parent = parent.parentElement;
        }
      }
    }
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentScrollWidth: document.documentElement.scrollWidth,
      violations,
    };
  }, {
    minimumReadableLinePx: options.minimumReadableLinePx || 280,
    maximumMeasureCh: options.maximumMeasureCh || 72,
    touchTargetPx: options.touchTargetPx || 44,
    safeAreaPx: options.safeAreaPx || 16,
  });
}

async function solveResponsiveConstraints(options) {
  const served = await serveTarget(options.target, options.cwd);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(served.url, { waitUntil: 'networkidle' });
    const viewports = [];
    for (const width of options.widths || DEFAULT_WIDTHS) {
      viewports.push(await inspectWidth(page, width, options));
    }
    const violations = viewports.flatMap(viewport =>
      viewport.violations.map(item => ({ viewport: viewport.viewport.width, ...item })));
    return {
      schema: 1,
      generatedAt: new Date().toISOString(),
      target: options.target,
      constraints: {
        widths: options.widths || DEFAULT_WIDTHS,
        minimumReadableLinePx: options.minimumReadableLinePx || 280,
        maximumMeasureCh: options.maximumMeasureCh || 72,
        touchTargetPx: options.touchTargetPx || 44,
        safeAreaPx: options.safeAreaPx || 16,
      },
      viewports,
      violations,
      minimalChanges: violations.map(item => ({
        viewport: item.viewport, selector: item.selector, type: item.type, ...item.suggestion,
      })),
      passed: violations.length === 0,
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
  const torture = args.includes('--torture');
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: responsive-constraint <html-or-url> [--out report.json] [--no-fail] [--torture]');
  const report = await solveResponsiveConstraints({ target, cwd: process.cwd(), torture });
  const output = path.resolve(value('--out', '.designos/responsive-constraints.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`responsive-constraint: ${report.violations.length} violation(s) → ${path.relative(process.cwd(), output)}${torture ? ' (TORTURE MODE)' : ''}`);
  if (!report.passed && !args.includes('--no-fail')) process.exit(1);
}

if (require.main === module) main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
module.exports = { DEFAULT_WIDTHS, inspectWidth, solveResponsiveConstraints };
