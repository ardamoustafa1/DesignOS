#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('BROWSER_GATE_UNAVAILABLE: Playwright is required for this command. Run npx playwright install chromium (playwright is an optional dependency — npm install --omit=optional skips it).');
  process.exit(2);
}
const { serveTarget } = require('./motion/browser-target');

function getAxPropertyValue(node, propName) {
  const prop = (node.properties || []).find(p => p.name === propName);
  return prop ? prop.value.value : null;
}

function extractFocusedNode(axNodes) {
  return axNodes.find(n => getAxPropertyValue(n, 'focused') === true) || null;
}

function findModalDialog(axNodes) {
  return axNodes.find(n => n.role && n.role.value === 'dialog' && getAxPropertyValue(n, 'modal') === true) || null;
}

function getLiveRegions(axNodes) {
  const regions = [];
  for (const node of axNodes) {
    const live = getAxPropertyValue(node, 'live');
    if (live) {
      regions.push({ 
        name: node.name ? node.name.value : '', 
        status: live 
      });
    }
  }
  return regions;
}

async function analyzeAccessibilityTimeline(options) {
  const served = await serveTarget(options.target, options.cwd);
  const browser = await chromium.launch({ headless: true });
  
  const timeline = [];
  const interactions = options.interactions || ['Tab', 'Tab', 'Enter', 'Escape'];

  try {
    const page = await browser.newPage();
    // Simulate Reduced Motion if requested
    if (options.reducedMotion) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
    }
    
    await page.goto(served.url, { waitUntil: 'networkidle' });

    const client = await page.context().newCDPSession(page);
    await client.send('Accessibility.enable');

    // Initial snapshot
    timeline.push(await recordFrame(page, client, 'Initial Load'));

    // Execute interactions
    for (const key of interactions) {
      await page.waitForTimeout(50); // settle
      if (key.startsWith('Focus:')) {
        await page.focus(key.split(':')[1]);
      } else {
        await page.keyboard.press(key);
      }
      await page.waitForTimeout(50); // layout settle
      timeline.push(await recordFrame(page, client, `Action: ${key}`));
    }

    
    const violations = evaluateTimeline(timeline);
    
    return {
      schema: 1,
      target: options.target,
      steps: timeline.length,
      violations,
      timeline
    };

  } finally {
    await browser.close();
    await served.close();
  }
}

async function recordFrame(page, client, trigger) {
  const axData = await client.send('Accessibility.getFullAXTree');
  const axNodes = axData.nodes || [];
  
  const domState = await page.evaluate(() => {
    const active = document.activeElement;
    return {
      focusedTag: active ? active.tagName : null,
      focusedId: active ? active.id : null,
      isHidden: active ? getComputedStyle(active).display === 'none' || active.getAttribute('aria-hidden') === 'true' : false
    };
  });
  
  return {
    trigger,
    axNodes,
    domState,
    focusedNode: extractFocusedNode(axNodes),
    modalDialog: findModalDialog(axNodes),
    liveRegions: getLiveRegions(axNodes)
  };
}

function evaluateTimeline(timeline) {
  const violations = [];
  let previousFocus = null;
  let preModalFocus = null;
  let wasModalOpen = false;
  let previousLiveText = '';

  for (let i = 0; i < timeline.length; i++) {
    const frame = timeline[i];
    
    // 1. Hidden/Focusable conflict
    if (frame.domState.isHidden && frame.domState.focusedTag !== 'BODY') {
      violations.push({ step: i, trigger: frame.trigger, type: 'hidden-focusable', message: 'Element with display:none or aria-hidden=true received focus' });
    }
    
    // 2. Dialog Obscuring
    const isModalOpen = !!frame.modalDialog;
    if (isModalOpen) {
      const isDescendant = (nodeId, ancestorId) => {
        if (nodeId === ancestorId) return true;
        const node = frame.axNodes.find(n => n.nodeId === nodeId);
        if (!node || !node.parentId) return false;
        return isDescendant(node.parentId, ancestorId);
      };
      
      const leakedNodes = frame.axNodes.filter(n => 
        !n.ignored && 
        n.role?.value === 'StaticText' && 
        !isDescendant(n.nodeId, frame.modalDialog.nodeId)
      );
      
      if (leakedNodes.length > 0) {
        violations.push({ step: i, trigger: frame.trigger, type: 'dialog-obscuring', message: 'Background content exposed to screen reader while modal dialog is active' });
      }
    }
    
    // 3. Focus Restoration
    if (isModalOpen && !wasModalOpen) {
      preModalFocus = previousFocus; // record where we were before dialog
    } else if (!isModalOpen && wasModalOpen) {
      // Dialog closed. Ensure focus returned to preModalFocus (or reasonably close)
      // Since nodes are regenerated, we match by name and role
      if (preModalFocus && frame.focusedNode) {
        const preName = preModalFocus.name ? preModalFocus.name.value : '';
        const curName = frame.focusedNode.name ? frame.focusedNode.name.value : '';
        console.log(`[DEBUG] Frame ${i}: preName="${preName}", curName="${curName}"`);
        if (preName !== curName) {
          violations.push({ step: i, trigger: frame.trigger, type: 'focus-restoration', message: 'Focus was not restored to trigger after dialog closed' });
        }
      } else {
        console.log(`[DEBUG] Frame ${i}: Missing focus nodes. preModalFocus=${!!preModalFocus}, curFocus=${!!frame.focusedNode}`);
      }
    }
    
    // 4. Live Region Spam
    const liveText = frame.liveRegions.map(r => r.name).join(' | ');
    if (liveText && liveText === previousLiveText) {
      violations.push({ step: i, trigger: frame.trigger, type: 'live-region-spam', message: 'aria-live region announced the identical string consecutively' });
    }
    
    wasModalOpen = isModalOpen;
    previousFocus = frame.focusedNode || previousFocus;
    if (liveText) previousLiveText = liveText;
  }
  
  return violations;
}

async function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: ax-timeline <html-or-url> [--out report.json]');
  
  const interactions = value('--interactions', 'Tab,Tab,Enter,Escape').split(',');
  const report = await analyzeAccessibilityTimeline({ target, cwd: process.cwd(), interactions, reducedMotion: args.includes('--reduced-motion') });
  
  const output = path.resolve(value('--out', '.designos/ax-timeline.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  
  console.log(`ax-timeline: Evaluated ${report.steps} timeline frames. ${report.violations.length} violation(s) found.`);
  if (report.violations.length > 0) {
    report.violations.forEach(v => console.log(`  - [Step ${v.step}] ${v.type}: ${v.message}`));
    process.exit(1);
  }
}

if (require.main === module) main().catch(err => { console.error(err.stack || err.message); process.exit(1); });
module.exports = { analyzeAccessibilityTimeline, evaluateTimeline };
