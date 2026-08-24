#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const UI_EXT = /\.(html|css|jsx?|tsx?|vue|svelte|mdx)$/i;
const SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'DesignOS']);

function collect(target, out = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue;
      collect(path.join(target, entry.name), out);
    }
  } else if (UI_EXT.test(target)) out.push(target);
  return out;
}

function finding(id, message) { return { id, message }; }

function inspectPortfolio(source) {
  const findings = [];
  const text = source.toLowerCase();

  const fakeIdentity = [
    /hello@example\.com/i, /href\s*=\s*["']#["']/i, /tech innovators/i,
    /creative agency studio/i, /university of technology/i, /lorem ipsum/i,
  ];
  if (fakeIdentity.some(re => re.test(source))) {
    findings.push(finding('portfolio-fake-identity', 'Placeholder identity, dead contact links, or fictional résumé proof is present. A portfolio must use verified material or label a demo explicitly.'));
  }

  const projectSignals = (text.match(/case[- ]study|selected work|project[-_ ]card|project[-_ ]grid|work[-_ ]item|data-project/g) || []).length;
  if (projectSignals < 2) {
    findings.push(finding('portfolio-no-inspectable-work', 'Fewer than two inspectable project/case-study signals were found. Skills and résumé prose are not portfolio evidence.'));
  }

  const compositions = new Set();
  if (/grid-template-columns|display\s*:\s*grid/.test(text)) compositions.add('grid');
  if (/position\s*:\s*sticky/.test(text)) compositions.add('sticky');
  if (/min\(100%|100vw|container-wide|full-bleed|wide-section/.test(text)) compositions.add('wide');
  if (/display\s*:\s*flex/.test(text)) compositions.add('flex');
  if (/position\s*:\s*absolute|overlap|translate[xy]?\(/.test(text)) compositions.add('layered');
  if (compositions.size < 3) {
    findings.push(finding('portfolio-flat-composition', `Only ${compositions.size} composition families were detected; a flagship portfolio needs at least three structural families, not one prose column.`));
  }

  const defaultFace = /--font-(?:sans|display)\s*:\s*(?:inter|system-ui|ui-sans-serif)/i.test(source);
  const namedFace = /--font-display\s*:\s*["'][^"']+["']/i.test(source) || /font-family\s*:\s*["'][^"']+["']/i.test(source);
  if (defaultFace && !namedFace) findings.push(finding('portfolio-default-type', 'The brand face is an unmodified Inter/system-ui starter default. A named display face and optical display settings are required.'));

  const shadowLevels = new Set(source.match(/--shadow-[123]/g) || []);
  const hasTexture = /grain|noise|texture|background-image\s*:/.test(text);
  if (shadowLevels.size < 3 || !hasTexture) {
    findings.push(finding('portfolio-flat-material', 'A three-level elevation stack plus texture/gradation on large fills is required. Declared-but-unused starter tokens do not count as material direction.'));
  }

  const roles = {
    arrival: /@keyframes[^}]*?(?:arriv|enter|reveal|intro)|data-motion-role=["']arrival/i.test(source),
    scroll: /intersectionobserver|animation-timeline|view-timeline|data-motion-role=["']scroll/i.test(source),
    interaction: /:hover|:focus-visible|pointermove|data-motion-role=["']interaction/i.test(source),
    transition: /(?:start)?viewtransition|view-transition|data-motion-role=["']transition|page-transition|shared-element/i.test(source),
  };
  const roleCount = Object.values(roles).filter(Boolean).length;
  if (roleCount < 4) {
    const missing = Object.entries(roles).filter(([, ok]) => !ok).map(([name]) => name).join(', ');
    findings.push(finding('portfolio-motion-orchestra-incomplete', `Motion roles ${roleCount}/4; missing: ${missing}. Flagship work requires arrival, scroll, interaction, and transition semantics with reduced-motion equivalence.`));
  }
  if (!/prefers-reduced-motion/.test(text)) findings.push(finding('portfolio-no-reduced-motion', 'No prefers-reduced-motion path was found.'));

  return findings;
}

function run(target, surface = 'auto') {
  const files = collect(path.resolve(target));
  const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const inferred = surface === 'auto' && /portfolio|selected work|experience|curriculum|résumé|resume|cv[-_ ]/i.test(source)
    ? 'portfolio' : surface;
  const findings = inferred === 'portfolio' ? inspectPortfolio(source) : [];
  return { surface: inferred, files: files.length, findings };
}

if (require.main === module) {
  const target = process.argv[2];
  const surfaceArg = process.argv.find(arg => arg.startsWith('--surface='));
  const surfaceIndex = process.argv.indexOf('--surface');
  const surface = surfaceArg ? surfaceArg.split('=')[1] : (surfaceIndex >= 0 ? process.argv[surfaceIndex + 1] : 'auto');
  if (!target) {
    console.error('Usage: check-generation-contract.js <target> [--surface portfolio] [--json]');
    process.exit(2);
  }
  const result = run(target, surface);
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else if (!result.findings.length) console.log(`check-generation-contract: clean (${result.surface}; ${result.files} files)`);
  else {
    console.error(`check-generation-contract: ${result.findings.length} blocking finding(s)`);
    for (const item of result.findings) console.error(`- ${item.id}: ${item.message}`);
  }
  process.exit(result.findings.length ? 1 : 0);
}

module.exports = { run, inspectPortfolio };
