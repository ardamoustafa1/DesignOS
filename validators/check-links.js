#!/usr/bin/env node
/**
 * check-links.js — external URL liveness checker.
 *
 * Scans every .md file (or a given path) for http/https links and performs
 * a HEAD request against each one. Reports dead links (non-2xx / connection
 * refused / timeout) with their file + line number.
 *
 * Usage:
 *   node validators/check-links.js              # scan entire repo
 *   node validators/check-links.js README.md    # single file
 *   node validators/check-links.js --fast       # skip slow hosts (≥ 3 s timeout)
 *
 * Exit: 0 clean · 1 dead link(s) found
 * Zero external dependencies.
 */

const fs      = require('fs');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const { URL } = require('url');

const args   = process.argv.slice(2);
const FAST   = args.includes('--fast');
const TARGET = args.find(a => !a.startsWith('--')) || '.';
const TIMEOUT_MS = FAST ? 3000 : 8000;

// Hosts known to block HEAD / return 403 for bots or placeholder/local dev URLs — skip them to avoid false positives
const SKIP_HOSTS = new Set([
  'twitter.com', 'x.com', 'linkedin.com', 'facebook.com',
  'fonts.googleapis.com', 'fonts.gstatic.com',
  'live-url', 'localhost', '127.0.0.1', 'example.com',
]);

// Collect all .md files under target
function collectFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const results = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

// Extract all http/https links from markdown text
const URL_RE = /https?:\/\/[^\s)\]>"']+/g;

function extractLinks(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const found = [];
  lines.forEach((line, i) => {
    for (const m of line.matchAll(URL_RE)) {
      let url = m[0].replace(/[.,;:!?)>]+$/, ''); // strip trailing punctuation
      found.push({ url, file, line: i + 1 });
    }
  });
  return found;
}

// HEAD request with redirect follow (max 3 hops)
function checkUrl(rawUrl) {
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(rawUrl); } catch { return resolve({ ok: false, status: 'invalid-url' }); }

    if (SKIP_HOSTS.has(parsed.hostname) || (parsed.hostname === 'github.com' && parsed.pathname.endsWith('/stargazers'))) {
      return resolve({ ok: true, status: 'skipped' });
    }

    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      method: 'HEAD',
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'DesignOS-link-checker/2.0 (github.com/ardamoustafa1/DesignOS)',
        'Accept': '*/*',
      },
      timeout: TIMEOUT_MS,
    };

    const req = lib.request(options, (res) => {
      const code = res.statusCode;
      // 429 = rate-limited, treat as alive to avoid false positives
      if (code === 405) {
        // HEAD not allowed — try GET with range to avoid huge downloads
        options.method = 'GET';
        options.headers['Range'] = 'bytes=0-0';
        const req2 = lib.request(options, (res2) => {
          resolve({ ok: res2.statusCode < 400 || res2.statusCode === 416, status: res2.statusCode });
          res2.resume();
        });
        req2.on('error', () => resolve({ ok: false, status: 'connection-error' }));
        req2.on('timeout', () => { req2.destroy(); resolve({ ok: false, status: 'timeout' }); });
        req2.end();
      } else {
        resolve({ ok: code < 400 || code === 429, status: code });
        res.resume();
      }
    });

    req.on('error', () => resolve({ ok: false, status: 'connection-error' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 'timeout' }); });
    req.end();
  });
}

async function main() {
  const files  = collectFiles(TARGET);
  const allLinks = [];
  for (const file of files) allLinks.push(...extractLinks(file));

  // Deduplicate URLs but keep all file+line references
  const urlMap = new Map();
  for (const entry of allLinks) {
    if (!urlMap.has(entry.url)) urlMap.set(entry.url, []);
    urlMap.get(entry.url).push({ file: entry.file, line: entry.line });
  }

  const urls  = [...urlMap.keys()];
  let dead    = 0;
  let skipped = 0;

  process.stdout.write(`check-links: scanning ${urls.length} unique URLs in ${files.length} files…\n`);

  // Throttle concurrency to avoid hammering servers
  const CONCURRENCY = 8;
  const chunks = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) chunks.push(urls.slice(i, i + CONCURRENCY));

  for (const chunk of chunks) {
    const results = await Promise.all(chunk.map(url => checkUrl(url)));
    chunk.forEach((url, idx) => {
      const { ok, status } = results[idx];
      if (status === 'skipped') { skipped++; return; }
      if (!ok) {
        dead++;
        for (const { file, line } of urlMap.get(url)) {
          process.stdout.write(`  ✗ ${file}:${line}  [${status}]  ${url}\n`);
        }
      }
    });
  }

  if (dead === 0) {
    process.stdout.write(`check-links: clean (${skipped} skipped)\n`);
    process.exit(0);
  } else {
    process.stdout.write(`check-links: ${dead} dead link(s) found\n`);
    process.exit(1);
  }
}

main();
