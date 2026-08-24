#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const routes = path.join(root, 'examples/motionos-flagships/routes');

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://motionos.local').pathname;
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(routes, `.${requested}`);
  if (!file.startsWith(routes) || !fs.existsSync(file)) {
    response.statusCode = 404;
    return response.end();
  }
  response.setHeader('content-type', 'text/html; charset=utf-8');
  response.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(resolve => server.listen(43193, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:43193/index.html');
    const source = await page.locator('.card').first().evaluate(node => ({
      name: getComputedStyle(node).viewTransitionName,
      navigationRule: [...document.styleSheets[0].cssRules].some(rule => rule.constructor.name === 'CSSViewTransitionRule'),
    }));
    assert.strictEqual(source.name, 'motionos-project');
    assert.strictEqual(source.navigationRule, true);
    await Promise.all([page.waitForURL('**/detail.html'), page.locator('.card').first().click()]);
    const target = await page.locator('.hero').evaluate(node => getComputedStyle(node).viewTransitionName);
    assert.strictEqual(target, 'motionos-project');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedDuration = await page.locator('.hero').evaluate(() => {
      const probe = document.createElement('div');
      probe.style.viewTransitionName = 'motionos-project';
      document.body.append(probe);
      const duration = getComputedStyle(probe, '::view-transition-group(motionos-project)').animationDuration;
      probe.remove();
      return duration;
    });
    assert(['0.001s', '1ms'].includes(reducedDuration));
    console.log('motionos-route-transition: cross-document shared element contract and reduced-motion path clean');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  server.close();
  process.exit(1);
});
