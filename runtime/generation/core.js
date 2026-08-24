'use strict';

const fs = require('fs');
const path = require('path');
const { fingerprint, executeGeneration } = require('./kernel');

const ROOT = path.resolve(__dirname, '../..');

function loadSystem(systemId, root = ROOT) {
  if (!/^[a-z0-9-]+$/.test(systemId)) throw new Error('INVALID_SYSTEM_ID');
  const directory = path.join(root, 'systems', systemId);
  const files = ['SYSTEM.md', 'tokens.css', 'manifest.json', 'lint.json'];
  for (const file of files) if (!fs.existsSync(path.join(directory, file))) throw new Error(`SYSTEM_INCOMPLETE:${systemId}:${file}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const fullContract = fs.readFileSync(path.join(directory, 'SYSTEM.md'), 'utf8');
  const [contract, ...archive] = fullContract.split(/^## Upstream contract\s*$/m);
  return Object.freeze({ id: systemId, directory, manifest, contract, provenanceArchive: archive.length ? `## Upstream contract${archive.join('')}` : null, tokens: fs.readFileSync(path.join(directory, 'tokens.css'), 'utf8') });
}

function routeModules(brief) {
  const value = String(brief).toLowerCase();
  const modules = ['brain/design-intelligence.md', 'brain/decision-framework.md', 'brain/brief-compiler.md'];
  if (/portfolio|agency|creative/.test(value)) modules.push('industries/portfolio-agency.md');
  else if (/security|risk|cyber/.test(value)) modules.push('industries/cybersecurity.md');
  else if (/finance|bank|payment|fintech/.test(value)) modules.push('industries/fintech.md');
  else modules.push('industries/saas.md');
  if (/dashboard|admin|analytics/.test(value)) modules.push('components/dashboard.md', 'foundations/grids.md');
  else modules.push('patterns/landing-pages.md', 'components/hero.md');
  modules.push('motion/signature-moments.md');
  return Object.freeze([...new Set(modules)].slice(0, 7));
}

function buildDesignIR({ brief, system, plan, variation }) {
  return Object.freeze({ schema: 'designos.design-ir/v1', brief, system: Object.freeze({ id: system.id, version: system.manifest.version || null }), routedModules: routeModules(brief), composition: Object.freeze({ family: plan.family, variation }), content: Object.freeze({ productName: plan.productName, eyebrow: plan.eyebrow, headline: plan.headline, summary: plan.summary, proof: Object.freeze([...plan.proof]) }) });
}

module.exports = { ROOT, fingerprint, loadSystem, routeModules, buildDesignIR, executeGeneration };
