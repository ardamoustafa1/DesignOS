#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const normalize = value => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const signature = value => crypto.createHash('sha1').update(JSON.stringify(value)).digest('hex').slice(0, 12);

function htmlFiles(target) {
  const absolute = path.resolve(target);
  if (!fs.statSync(absolute).isDirectory()) return [absolute];
  const result = [];
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['node_modules', '.git', '.designos', 'evidence'].includes(entry.name)) continue;
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (/\.html?$/.test(entry.name)) result.push(child);
    }
  };
  walk(absolute);
  return result;
}

function attributes(raw) {
  return Object.fromEntries([...raw.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
    .map(match => [match[1], match[2] ?? match[3] ?? match[4] ?? true]));
}

function relevantCss(file, html) {
  let css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join('\n');
  for (const match of html.matchAll(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi)) {
    const linked = path.resolve(path.dirname(file), match[1]);
    if (fs.existsSync(linked)) css += `\n${fs.readFileSync(linked, 'utf8')}`;
  }
  return css;
}

function ruleFor(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`[^{}]*${escaped}[^{}]*\\{([^}]*)\\}`, 'gi'))]
    .map(match => match[1].replace(/\s+/g, ' ').trim()).join(';');
}

function scanPage(file) {
  const html = fs.readFileSync(file, 'utf8');
  const css = relevantCss(file, html);
  const nodes = [];
  const add = (type, identity, value, location) => nodes.push({
    id: `${path.basename(file)}:${type}:${nodes.length + 1}`,
    page: file,
    type,
    identity,
    value,
    signature: signature(value),
    location,
  });
  for (const match of html.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const attrs = attributes(match[2]);
    const text = normalize(match[3]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    if (attrs['data-cta'] !== undefined || classes.some(name => /cta|primary|action/.test(name))) {
      add('cta', text || attrs['aria-label'] || 'unnamed',
        { tag: match[1].toLowerCase(), classes: classes.sort(), order: attrs['data-priority'] || null, text },
        match.index);
    }
  }
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*(?:role=["']dialog["']|data-dialog)[^>]*)>/gi)) {
    const attrs = attributes(match[2]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    add('dialog-motion', attrs.id || classes[0] || 'dialog',
      { classes: classes.sort(), css: classes.map(name => ruleFor(css, `.${name}`)).filter(Boolean) }, match.index);
  }
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*(?:data-status|role=["']status["'])[^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const attrs = attributes(match[2]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    const identity = attrs['data-status'] || normalize(match[3]).split(/\s+/)[0] || 'status';
    add('status-color', identity,
      { classes: classes.sort(), css: classes.map(name => ruleFor(css, `.${name}`)).filter(Boolean) }, match.index);
  }
  for (const match of html.matchAll(/<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const attrs = attributes(match[2]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    add('heading-scale', match[1].toLowerCase(),
      { classes: classes.sort(), css: [ruleFor(css, match[1]), ...classes.map(name => ruleFor(css, `.${name}`))].filter(Boolean) },
      match.index);
  }
  const nav = /<nav\b([^>]*)>/i.exec(html);
  if (nav) {
    const attrs = attributes(nav[1]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    add('navigation', attrs['aria-label'] || 'primary',
      {
        classes: classes.sort(),
        mediaRules: [...css.matchAll(/@media([^{]+)\{[\s\S]*?(?:nav|menu)[\s\S]*?\}/gi)]
          .map(match => normalize(match[1])),
        hasMenuButton: /<button[^>]*(?:aria-expanded|aria-controls)[^>]*>/i.test(html),
      }, nav.index);
  }
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*(?:data-proof|class=["'][^"']*proof)[^>]*)>/gi)) {
    const attrs = attributes(match[2]);
    const classes = String(attrs.class || '').split(/\s+/).filter(Boolean);
    add('proof-presentation', attrs['data-proof'] || 'product-proof',
      { tag: match[1].toLowerCase(), classes: classes.sort(), cited: /(?:href|cite|data-source)=/.test(match[2]) },
      match.index);
  }
  return nodes;
}

function buildConsistencyGraph(target) {
  const pages = htmlFiles(target);
  const nodes = pages.flatMap(scanPage);
  const groups = new Map();
  for (const node of nodes) {
    const key = `${node.type}:${node.identity}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(node);
  }
  const edges = [];
  const findings = [];
  for (const [key, group] of groups) {
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        const consistent = group[left].signature === group[right].signature;
        edges.push({ from: group[left].id, to: group[right].id, relationship: consistent ? 'consistent' : 'conflict' });
      }
    }
    const signatures = new Set(group.map(node => node.signature));
    if (group.length > 1 && signatures.size > 1) {
      findings.push({
        code: 'cross-page-drift',
        key,
        severity: 'P2',
        pages: [...new Set(group.map(node => node.page))],
        variants: [...signatures],
        fix: `Unify ${key} through one semantic token/component contract or record a scoped exception.`,
      });
    }
  }
  return {
    schema: 1,
    generatedAt: new Date().toISOString(),
    target: path.resolve(target),
    pages: pages.length,
    nodes,
    edges,
    findings,
    summary: {
      nodes: nodes.length,
      comparisons: edges.length,
      conflicts: edges.filter(edge => edge.relationship === 'conflict').length,
      findingGroups: findings.length,
    },
    passed: findings.length === 0,
  };
}

function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: consistency-graph <project-or-page> [--out report.json] [--no-fail]');
  const report = buildConsistencyGraph(target);
  const output = path.resolve(value('--out', '.designos/consistency-graph.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`consistency-graph: ${report.pages} pages, ${report.summary.conflicts} conflict edge(s)`);
  if (!report.passed && !args.includes('--no-fail')) process.exit(1);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
module.exports = { htmlFiles, scanPage, buildConsistencyGraph };
