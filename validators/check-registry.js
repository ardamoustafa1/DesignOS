#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { finding } = require('./rule-registry');

const target = path.resolve(process.cwd(), process.argv[2] || '.');
const json = process.argv.includes('--json');
const TEXT_EXT = /\.(?:html?|css|scss|sass|less|jsx?|tsx?|vue|svelte)$/i;

function filesUnder(input) {
  if (!fs.existsSync(input)) return [];
  if (fs.statSync(input).isFile()) return TEXT_EXT.test(input) ? [input] : [];
  return fs.readdirSync(input, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', '.git', 'dist', 'designos-visual'].includes(entry.name)) return [];
    return filesUnder(path.join(input, entry.name));
  });
}

const lineAt = (source, index) => source.slice(0, Math.max(0, index)).split('\n').length;
const excepted = (source, index, token) => source.slice(Math.max(0, index - 280), index).includes(token);

function inspect(file) {
  const source = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  const out = [];
  const add = (id, match, detail = {}) => out.push(finding(id, {
    file: rel, line: lineAt(source, match.index), engine: 'static', ...detail,
  }));

  if (/\.(?:html?|jsx?|tsx?|vue|svelte)$/i.test(file)) {
    for (const match of source.matchAll(/<(?:div|span)\b[^>]*(?:onClick|onclick)\s*=/gi)) {
      if (!excepted(source, match.index, 'a11y-ok:')) add('source-clickable-noncontrol', match);
    }
    if (/(?:<(?:a|button|input|select|textarea)\b|<(?:div|span)\b[^>]*(?:onClick|onclick)\s*=)/i.test(source)
      && !/:focus-visible|outline-offset/i.test(source)
      && !/a11y-ok:\s*inherited focus system/i.test(source)) add('source-missing-focus', { index: 0 });
    for (const match of source.matchAll(/\b(?:SOC\s?2|ISO\s?27001|HIPAA|PCI DSS|FIPS|independently verified|certified)\b/gi)) {
      const window = source.slice(Math.max(0, match.index - 300), match.index + 500);
      if (!/(?:https?:\/\/|proof-source:|href=|unsourced|avoid\s*:|anti-pattern)/i.test(window)) add('source-fake-proof', match);
    }
    for (const match of source.matchAll(/\b(?:Acme(?: Corp)?|John Doe|Jane Doe|Lorem ipsum|example@example\.com)\b/gi)) {
      if (!/slop-ok:\s*before-state fixture/i.test(source)
        && !excepted(source, match.index, 'slop-ok:')) add('source-named-default', match);
    }
    for (const match of source.matchAll(/<[^>]*data-trigger=["']keyboard["'][^>]*>/gi)) {
      const durations = [...match[0].matchAll(/(\d+)ms/gi)].map(item => Number(item[1]));
      if (durations.some(duration => duration > 80) && !excepted(source, match.index, 'motion-ok:')) add('motion-keyboard-latency', match);
    }
  }

  if (/\.(?:css|scss|sass|less)$/i.test(file)) {
    for (const match of source.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
      const before = source.slice(0, match.index);
      const rootIndex = before.lastIndexOf(':root');
      const openIndex = before.lastIndexOf('{');
      const closeIndex = before.lastIndexOf('}');
      const insideRoot = rootIndex >= 0 && openIndex > rootIndex && openIndex > closeIndex;
      const line = source.slice(before.lastIndexOf('\n') + 1, source.indexOf('\n', match.index) < 0 ? source.length : source.indexOf('\n', match.index));
      if (!insideRoot && !/data:image|drift-ok:|token-ok:/i.test(line)
        && !excepted(source, match.index, 'drift-ok:')) add('source-raw-color', match);
    }
  }

  if (/\.(?:css|scss|sass|less|html?)$/i.test(file)) {
    for (const match of source.matchAll(/transition(?:-property)?\s*:\s*all\b/gi)) {
      if (!excepted(source, match.index, 'motion-ok:')) add('motion-transition-all', match);
    }
    for (const match of source.matchAll(/scale(?:3d)?\(\s*0(?:\s*[,)]|\s*,\s*0)/gi)) {
      if (!excepted(source, match.index, 'motion-ok:')) add('motion-scale-zero', match);
    }
    const spatialHover = source.search(/:hover[^{}]*\{[^}]*(?:transform|translate|scale|rotate)/is);
    const pointerGate = /@media[^{]*(?:hover\s*:\s*hover)[^{]*(?:pointer\s*:\s*fine)/is.test(source)
      || /matchMedia\(\s*['"][^'"]*hover\s*:\s*hover/i.test(source);
    if (spatialHover >= 0 && !pointerGate && !/motion-ok:\s*non-spatial fallback/i.test(source)) {
      add('motion-hover-without-pointer-query', { index: spatialHover });
    }
    for (const match of source.matchAll(/animation(?:-iteration-count)?\s*:[^;{}]*\binfinite\b/gi)) {
      if (!/IntersectionObserver|visibilitychange|animation-play-state/i.test(source)
        && !excepted(source, match.index, 'motion-ok:')) add('motion-unbounded-loop', match);
    }
    const delays = [...source.matchAll(/animation-delay\s*:\s*(\d+)ms/gi)].map(match => ({ match, value: Number(match[1]) }));
    for (const { match, value } of delays) if (value > 500 && !excepted(source, match.index, 'motion-ok:')) add('motion-stagger-budget', match);
    for (const match of source.matchAll(/--duration-enter\s*:\s*(\d+(?:\.\d+)?)ms[\s\S]{0,320}?--duration-exit\s*:\s*(\d+(?:\.\d+)?)ms/gi)) {
      if (Number(match[1]) === Number(match[2]) && !excepted(source, match.index, 'motion-ok:')) {
        add('motion-enter-exit-symmetry', match);
      }
    }
    const anchoredSurface = source.search(/[.#][\w-]*(?:popover|dropdown|menu|dialog|tooltip)[\w-]*[\s\S]{0,1200}?(?:scale\(|animation\s*:)/i);
    if (anchoredSurface >= 0 && /\bscale\(/i.test(source) && !/transform-origin\s*:/i.test(source)
      && !/motion-ok:\s*center-origin reason/i.test(source)) {
      add('motion-transform-origin', { index: anchoredSurface });
    }
    for (const match of source.matchAll(/pointer-events\s*:\s*none/gi)) {
      const open = source.lastIndexOf('{', match.index);
      const close = source.indexOf('}', match.index);
      const selector = source.slice(Math.max(0, source.lastIndexOf('}', open) + 1), open);
      const block = source.slice(open, close < 0 ? source.length : close);
      if (/animat|transition/i.test(block) && !/::(?:before|after)/i.test(selector)
        && !excepted(source, match.index, 'motion-ok:')) add('motion-interaction-blocked', match);
    }
  }

  if (/\.(?:js|jsx|ts|tsx|vue|svelte|html?)$/i.test(file)) {
    for (const match of source.matchAll(/addEventListener\(\s*['"]scroll['"]/g)) {
      const window = source.slice(match.index, match.index + 900);
      if (!/(?:passive\s*:\s*true|requestAnimationFrame|IntersectionObserver)/.test(window)
        && !excepted(source, match.index, 'motion-ok:')) add('motion-scroll-unthrottled', match);
    }
    const pointer = source.search(/pointerdown/);
    if (pointer >= 0 && /pointermove/.test(source) && !/setPointerCapture/.test(source) && !/motion-ok:\s*library guarantee/.test(source)) {
      add('motion-drag-no-capture', { index: pointer });
    }
    const recursiveRaf = /function\s+(\w+)[^{]*\{[\s\S]{0,1200}?requestAnimationFrame\(\s*\1\s*\)/.exec(source);
    const animation = source.search(/\.animate\(/) >= 0 ? source.search(/\.animate\(/) : recursiveRaf?.index ?? -1;
    if (animation >= 0 && !/(?:\.cancel\(|cancelAnimationFrame|AbortController|cleanup|revert\()/.test(source)
      && !/motion-ok:\s*library teardown/.test(source)) add('motion-no-cancellation', { index: animation });
    const continuousAnimation = recursiveRaf
      || /\.animate\([\s\S]{0,800}?(?:iterations\s*:\s*Infinity|Infinity)/.exec(source);
    if (animation >= 0 && continuousAnimation
      && !/visibilitychange/.test(source) && !/motion-ok:\s*finite interaction/.test(source)) {
      add('motion-no-visibility-pause', { index: animation });
    }
    const spring = source.search(/(?:type\s*:\s*['"]spring|useSpring|stiffness\s*:|damping\s*:)/);
    if (spring >= 0 && !/(?:prefers-reduced-motion|useReducedMotion|matchMedia)/.test(source)
      && !/motion-ok:\s*reduced path/.test(source)) add('motion-spring-no-reduction', { index: spring });
  }
  return out;
}

const findings = filesUnder(target).flatMap(inspect);
if (json) console.log(JSON.stringify({ target, findings, count: findings.length }, null, 2));
else if (findings.length) {
  for (const item of findings) {
    console.log(`${item.file}:${item.line}  ${item.severity}  ${item.id}  ${item.message}`);
    console.log(`  fix: ${item.fix} (${item.module})`);
  }
  console.log(`\ncheck-registry: ${findings.length} finding(s)`);
} else console.log('check-registry: clean');
if (findings.some(item => ['P1', 'P2'].includes(item.severity))) process.exit(1);
