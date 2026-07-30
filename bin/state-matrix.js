#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STATES = Object.freeze([
  'default', 'hover', 'focus', 'pressed', 'disabled', 'loading', 'empty', 'error',
  'success', 'partial', 'offline', 'permission-denied', 'reduced-motion',
  'forced-colors', 'rtl', 'long-content',
]);

const STATE_CONTRACTS = Object.freeze({
  default: { expected: 'ready', interaction: 'clickable' },
  hover: { expected: 'ready', interaction: 'pointer-hover' },
  focus: { expected: 'ready', interaction: 'keyboard-focus' },
  pressed: { expected: 'pressed', interaction: 'pointer-or-keyboard-press' },
  disabled: { expected: 'disabled', interaction: 'inert' },
  loading: { expected: 'loading', interaction: 'busy', aria: { 'aria-busy': 'true' } },
  empty: { expected: 'empty', interaction: 'recovery-action' },
  error: { expected: 'error', interaction: 'retry', live: 'alert' },
  success: { expected: 'success', interaction: 'acknowledged', live: 'status' },
  partial: { expected: 'partial', interaction: 'continue' },
  offline: { expected: 'offline', interaction: 'retry-or-queue', live: 'status' },
  'permission-denied': { expected: 'permission-denied', interaction: 'request-access', live: 'alert' },
  'reduced-motion': { expected: 'ready', interaction: 'functional-equivalent', media: 'prefers-reduced-motion: reduce' },
  'forced-colors': { expected: 'ready', interaction: 'system-color-visible', media: 'forced-colors: active' },
  rtl: { expected: 'ready', interaction: 'logical-order', direction: 'rtl' },
  'long-content': { expected: 'ready', interaction: 'wrap-without-clipping' },
});

function fixtureHtml(component) {
  const cards = STATES.map(state => {
    const contract = STATE_CONTRACTS[state];
    const disabled = state === 'disabled' ? ' disabled aria-disabled="true"' : '';
    const busy = contract.aria?.['aria-busy'] ? ' aria-busy="true"' : '';
    const dir = contract.direction ? ` dir="${contract.direction}"` : '';
    const label = state === 'long-content'
      ? `${component.label} with deliberately extended localized content that must wrap without clipping`
      : `${component.label} — ${state}`;
    const live = contract.live ? `<p role="${contract.live}">${state} state is inspectable.</p>` : '';
    return `<section class="state" data-state="${state}"${dir}>
      <h2>${state}</h2>
      <button type="button"${disabled}${busy} data-expected="${contract.expected}">${label}</button>
      ${live}
    </section>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${component.label} state matrix</title>
<style>
:root{--space:1rem;--border:CanvasText;--focus:Highlight;--duration:120ms}
*{box-sizing:border-box}body{margin:0;padding:var(--space);font:16px/1.5 system-ui;color:CanvasText;background:Canvas}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:var(--space)}
.state{min-width:0;padding:var(--space);border:1px solid var(--border)}button{min-width:44px;min-height:44px;max-width:100%;white-space:normal}
button:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
[data-state=pressed] button{transform:scale(.99)}[data-state=loading] button{cursor:progress}
[data-state=error]{border-style:dashed}[data-state=success]{border-width:2px}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
@media(forced-colors:active){.state{border-color:CanvasText}button{forced-color-adjust:auto}}
</style><body><main>${cards}</main>
<script>
for(const button of document.querySelectorAll('button:not([disabled])'))button.addEventListener('click',()=>{
  button.closest('.state').dataset.activated='true';
});
</script></body></html>`;
}

function generateStateMatrix(component = {}) {
  const normalized = {
    id: component.id || 'component',
    label: component.label || 'Component',
    selector: component.selector || '[data-state]',
  };
  const rows = STATES.map(state => ({
    state,
    ...STATE_CONTRACTS[state],
    fixtureSelector: `[data-state="${state}"]`,
    screenshot: `${state}.png`,
  }));
  return {
    schema: 1,
    component: normalized,
    rows,
    screenshotScenarios: rows.map(row => ({
      id: row.state,
      selector: row.fixtureSelector,
      colorScheme: 'light',
      reducedMotion: row.state === 'reduced-motion',
      forcedColors: row.state === 'forced-colors',
      direction: row.state === 'rtl' ? 'rtl' : 'ltr',
    })),
    accessibilityTasks: rows.map(row => ({
      id: `a11y-${row.state}`,
      state: row.state,
      task: row.interaction,
      assertions: ['accessible name', 'keyboard path', 'focus visible', 'state exposed', 'no serious Axe finding'],
    })),
    fixture: fixtureHtml(normalized),
  };
}

function interactionTestSource(component) {
  return `const {test,expect}=require('@playwright/test');
test('${component.id} state matrix',async({page})=>{
  await page.goto('state-matrix.html');
  for(const button of await page.locator('button:not([disabled])').all()){
    await button.click();
    await expect(button.locator('xpath=..')).toHaveAttribute('data-activated','true');
  }
  await expect(page.locator('[data-state=disabled] button')).toBeDisabled();
});`;
}

function motionTestSource(component) {
  return `const {test,expect}=require('@playwright/test');
test('${component.id} motion equivalence',async({browser})=>{
  for(const reducedMotion of ['no-preference','reduce']){
    const context=await browser.newContext({reducedMotion});
    const page=await context.newPage();await page.goto('state-matrix.html');
    await page.locator('[data-state=reduced-motion] button').click();
    await expect(page.locator('[data-state=reduced-motion]')).toHaveAttribute('data-activated','true');
    await context.close();
  }
});`;
}

function writeStateMatrix(outputDirectory, component = {}) {
  const matrix = generateStateMatrix(component);
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'state-matrix.json'), JSON.stringify({
    schema: matrix.schema, component: matrix.component, rows: matrix.rows,
  }, null, 2) + '\n');
  fs.writeFileSync(path.join(outputDirectory, 'state-matrix.html'), matrix.fixture + '\n');
  fs.writeFileSync(path.join(outputDirectory, 'screenshot-scenarios.json'), JSON.stringify(matrix.screenshotScenarios, null, 2) + '\n');
  fs.writeFileSync(path.join(outputDirectory, 'accessibility-tasks.json'), JSON.stringify(matrix.accessibilityTasks, null, 2) + '\n');
  fs.writeFileSync(path.join(outputDirectory, 'interaction.spec.js'), interactionTestSource(matrix.component) + '\n');
  fs.writeFileSync(path.join(outputDirectory, 'motion.spec.js'), motionTestSource(matrix.component) + '\n');
  return matrix;
}

function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const id = args.find(arg => !arg.startsWith('--')) || 'component';
  const output = path.resolve(value('--out', `.designos/state-matrix/${id}`));
  const matrix = writeStateMatrix(output, { id, label: value('--label', id), selector: value('--selector', '[data-state]') });
  console.log(`state-matrix: ${matrix.rows.length} states, 5 evidence artifact types → ${path.relative(process.cwd(), output)}`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
module.exports = { STATES, STATE_CONTRACTS, generateStateMatrix, writeStateMatrix };
