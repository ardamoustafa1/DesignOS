#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');
const live = require('../bin/live-director');

(async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-live-studio-'));
  const target = path.join(temp, 'index.html');
  fs.writeFileSync(target, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Studio fixture</title></head><body><main><section id="hero"><h1>Studio selection</h1><p>Inspectable copy.</p><button style="min-width:44px;min-height:44px">Act</button></section></main></body></html>`);
  const port = 44000 + process.pid % 1000;
  const server = live.serve(target, { port }, temp);
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve));
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
    const preview = page.frameLocator('#preview');
    await preview.locator('#hero').evaluate(element =>
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    assert.strictEqual(await preview.locator('#hero').getAttribute('data-designos-hover'), '');
    await preview.locator('#hero').click();
    await page.locator('#note').fill('Studio browser contract');
    await page.locator('#annotate').click();
    await page.locator('#framework').getByText('html').waitFor();
    await page.locator('[data-variant="b"]').click();
    await page.locator('#diff .diff-row').first().waitFor();
    assert.strictEqual(await page.locator('[data-variant="b"]').getAttribute('aria-pressed'), 'true');
    assert((await page.locator('#selection').textContent()).includes('#hero'));
    assert((await page.locator('#diff').textContent()).includes('copyHierarchy'));
    await page.locator('#route-lock').uncheck();
    const response = await page.request.get(`http://127.0.0.1:${port}/api/session`);
    const session = await response.json();
    assert.strictEqual(session.locks.route, false);
    assert.strictEqual(session.locks.component, true);
    assert.strictEqual(session.selectedSource.framework, 'html');
    assert.strictEqual(errors.length, 0, errors.join('\n'));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(temp, { recursive: true, force: true });
  }
  console.log('live-studio: hover/select inspector, source resolution, component boundary, carousel, semantic diff and locks clean');
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
