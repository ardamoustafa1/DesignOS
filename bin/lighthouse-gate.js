#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { finding } = require('../validators/rule-registry');

const args = process.argv.slice(2);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const targetArg = args.find((arg, index) => !arg.startsWith('--')
  && (index === 0 || !args[index - 1].startsWith('--')));
if (!targetArg) {
  console.error('Usage: lighthouse-gate <html-or-url> [--out report.json] [--min 95] [--lcp 2000] [--cls .1] [--tbt 200]');
  process.exit(2);
}

const output = path.resolve(process.cwd(), value('--out', 'designos-lighthouse.json'));
const rawOutput = value('--raw-out', '');
const budgets = {
  categoryScore: Number(value('--min', '95')),
  lcpMs: Number(value('--lcp', '2000')),
  cls: Number(value('--cls', '.1')),
  tbtMs: Number(value('--tbt', '200')),
};
const throttlingMethod = value('--throttling', 'provided');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

async function localServer(target) {
  const absolute = path.resolve(process.cwd(), target);
  if (!fs.existsSync(absolute)) throw new Error(`Lighthouse target not found: ${absolute}`);
  const cwd = path.resolve(process.cwd());
  const root = absolute.startsWith(`${cwd}${path.sep}`) ? cwd : path.dirname(absolute);
  const entry = path.relative(root, absolute).split(path.sep).map(encodeURIComponent).join('/');
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const requested = pathname === '/' ? entry : pathname.slice(1);
    const file = path.resolve(root, requested);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.statusCode = 403;
      return response.end('Forbidden');
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.statusCode = 404;
      return response.end('Not found');
    }
    // Lexical `../` check above; also resolve symlinks so a link inside root pointing
    // outside it can't be used to read arbitrary files.
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(file);
    if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${path.sep}`)) {
      response.statusCode = 403;
      return response.end('Forbidden');
    }
    response.setHeader('content-type', contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return { server, url: `http://127.0.0.1:${address.port}/${entry}` };
}

async function run() {
  const [{ default: lighthouse }, chromeLauncher, playwright] = await Promise.all([
    import('lighthouse'),
    import('chrome-launcher'),
    Promise.resolve(require('playwright')),
  ]);
  let local = null;
  const url = /^https?:\/\//i.test(targetArg)
    ? targetArg
    : (local = await localServer(targetArg)).url;
  const chrome = await chromeLauncher.launch({
    chromePath: playwright.chromium.executablePath(),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const runResult = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1440, height: 1000, deviceScaleFactor: 1, disabled: false },
      throttlingMethod,
    });
    const lhr = runResult.lhr;
    if (rawOutput) {
      const rawFile = path.resolve(process.cwd(), rawOutput);
      fs.mkdirSync(path.dirname(rawFile), { recursive: true });
      fs.writeFileSync(rawFile, JSON.stringify(lhr, null, 2) + '\n');
    }
    const categories = Object.fromEntries(Object.entries(lhr.categories).map(([id, category]) =>
      [id, Math.round((category.score || 0) * 100)]));
    const metrics = {
      lcpMs: lhr.audits['largest-contentful-paint']?.numericValue ?? null,
      cls: lhr.audits['cumulative-layout-shift']?.numericValue ?? null,
      tbtMs: lhr.audits['total-blocking-time']?.numericValue ?? null,
    };
    const failedCategories = Object.entries(categories)
      .filter(([, score]) => score < budgets.categoryScore)
      .map(([category, score]) => ({ category, score, budget: budgets.categoryScore }));
    const failedMetrics = [
      ['lcpMs', metrics.lcpMs, budgets.lcpMs],
      ['cls', metrics.cls, budgets.cls],
      ['tbtMs', metrics.tbtMs, budgets.tbtMs],
    ].filter(([, measured, budget]) => measured == null || measured > budget)
      .map(([metric, measured, budget]) => ({ metric, measured, budget }));
    const findings = failedCategories.length || failedMetrics.length
      ? [finding('lighthouse-budget', {
        engine: 'lighthouse',
        message: `Lighthouse missed ${failedCategories.length} category and ${failedMetrics.length} metric budget(s).`,
        details: { failedCategories, failedMetrics },
      })]
      : [];
    const report = {
      schema: 1,
      generatedAt: new Date().toISOString(),
      target: url,
      lighthouseVersion: lhr.lighthouseVersion,
      userAgent: lhr.userAgent,
      categories,
      metrics,
      budgets,
      throttlingMethod,
      findings,
      passed: findings.length === 0,
    };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ categories, metrics, passed: report.passed }));
    if (!report.passed) process.exitCode = 1;
  } finally {
    await chrome.kill();
    if (local) await new Promise(resolve => local.server.close(resolve));
  }
}

run().catch(error => {
  console.error(error.stack || error.message);
  process.exit(2);
});
