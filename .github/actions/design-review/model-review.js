#!/usr/bin/env node
// Optional advisory pass for the DesignOS Review action (model-review: true).
// Sends the reviewed files + scoring/rubric.md to the Anthropic Messages API and prints
// its rubric-prompted read as Markdown. Never gates the build — see action.yml's
// fail-under-min, which only ever reads the deterministic staticRiskFloor.
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const [, , reviewPathArg, modelArg] = process.argv;
if (!reviewPathArg) {
  console.error('Usage: model-review.js <review-path> [model]');
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is not set.');
  process.exit(1);
}

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const model = modelArg || 'claude-sonnet-5';
const MAX_TOTAL_CHARS = 60000;

function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const entry of fs.readdirSync(p)) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry)) continue;
      walk(path.join(p, entry), out);
    }
  } else if (/\.(html|css|jsx?|tsx?|vue|svelte|mdx)$/.test(p)) {
    out.push(p);
  }
}

const files = [];
walk(path.resolve(reviewPathArg), files);
if (!files.length) {
  console.error('No reviewable files found for the model pass.');
  process.exit(1);
}

let bundle = '';
for (const file of files) {
  const rel = path.relative(reviewPathArg, file);
  const chunk = `\n\n--- ${rel} ---\n${fs.readFileSync(file, 'utf8')}`;
  if (bundle.length + chunk.length > MAX_TOTAL_CHARS) break;
  bundle += chunk;
}

let rubric = '';
try {
  rubric = fs.readFileSync(path.join(REPO_ROOT, 'scoring', 'rubric.md'), 'utf8').slice(0, 20000);
} catch {
  rubric = '(scoring/rubric.md not found — score qualitatively on hierarchy, craft, distinctiveness, accessibility, and conversion clarity.)';
}

const prompt = `You are reviewing UI code changed in a pull request against the DesignOS rubric below. \
Be specific and harsh — a critique softened to be encouraging has missed its job. Cite file \
names and line-level detail where relevant. Do not repeat deterministic/static findings \
(contrast, alt text, semantics) unless you have something the static check would miss — focus \
on hierarchy, craft, distinctiveness, and whether this reads as generic AI-generated output. \
End with a single line: "Rubric verdict: X/100".\n\n## Rubric\n${rubric}\n\n## Changed files\n${bundle}`;

const payload = JSON.stringify({
  model,
  max_tokens: 1500,
  messages: [{ role: 'user', content: prompt }],
});

const req = https.request(
  {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-length': Buffer.byteLength(payload),
    },
  },
  res => {
    let data = '';
    res.on('data', d => { data += d; });
    res.on('end', () => {
      if (res.statusCode >= 400) {
        console.error(`Anthropic API ${res.statusCode}: ${data}`);
        process.exit(1);
      }
      try {
        const parsed = JSON.parse(data);
        const text = (parsed.content || []).map(block => block.text || '').join('\n').trim();
        console.log(text || '(empty model response)');
      } catch (err) {
        console.error(`Failed to parse Anthropic response: ${err.message}`);
        process.exit(1);
      }
    });
  }
);
req.on('error', err => {
  console.error(err.message);
  process.exit(1);
});
req.write(payload);
req.end();
