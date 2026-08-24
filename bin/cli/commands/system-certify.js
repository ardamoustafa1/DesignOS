'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function runNode(file, args, cwd) { return spawnSync(process.execPath, [file, ...args], { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }); }

function execute(args, context) {
  const write = args.includes('--write');
  const integrity = runNode(path.join(context.pkgRoot, 'validators/check-system-integrity.js'), [path.join(context.pkgRoot, 'systems'), '--json', '--quiet'], context.pkgRoot);
  let report;
  try { report = JSON.parse(integrity.stdout); } catch { context.fail(integrity.stderr || 'Could not parse system integrity report.'); }
  const drift = new Map(report.results.map(item => [item.slug, item]));
  const slugs = fs.readdirSync(path.join(context.pkgRoot, 'systems')).filter(slug => fs.statSync(path.join(context.pkgRoot, 'systems', slug)).isDirectory()).sort();
  const systems = slugs.map(slug => {
    const directory = path.join(context.pkgRoot, 'systems', slug);
    const required = ['SYSTEM.md', 'tokens.css', 'manifest.json', 'lint.json', 'example.html'];
    const structural = required.every(file => fs.existsSync(path.join(directory, file)));
    let manifest = {}; try { manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8')); } catch { /* finding below */ }
    const source = manifest.source || {};
    const provenance = source.type === 'original'
      ? Boolean(source.origin)
      : source.type === 'imported' && Boolean(source.upstream && source.commit && source.licence && source.notice && Array.isArray(source.modifications));
    const item = drift.get(slug) || { drift: 100 };
    const conformance = structural ? runNode(path.join(context.pkgRoot, 'validators/check-system-conformance.js'), [path.join(directory, 'example.html'), '--system', slug], context.pkgRoot) : { status: 1 };
    const ceiling = structural ? runNode(path.join(context.pkgRoot, 'validators/check-craft-ceiling.js'), [path.join(directory, 'example.html')], context.pkgRoot) : { status: 1 };
    const checks = { structural, provenance: Boolean(provenance), proseTokenDrift: item.drift <= 20, conformance: conformance.status === 0, craftCeiling: ceiling.status === 0 };
    return { id: slug, certified: Object.values(checks).every(Boolean), checks, driftPercent: item.drift, manifestDigest: structural ? require('crypto').createHash('sha256').update(fs.readFileSync(path.join(directory, 'manifest.json'))).digest('hex') : null };
  });
  const output = { schema: 'designos.system-certification/v1', generatedAt: new Date().toISOString(), policy: { maxProseTokenDriftPercent: 20, requiredChecks: ['structural', 'provenance', 'proseTokenDrift', 'conformance', 'craftCeiling'] }, summary: { total: systems.length, certified: systems.filter(item => item.certified).length, blocked: systems.filter(item => !item.certified).length }, systems };
  if (write) {
    fs.writeFileSync(path.join(context.pkgRoot, 'systems/certification.json'), JSON.stringify(output, null, 2) + '\n');
    fs.writeFileSync(path.join(context.pkgRoot, 'studio/lib/certified-systems.json'), JSON.stringify({ schema: output.schema, generatedAt: output.generatedAt, systems: systems.filter(item => item.certified).map(item => ({ id: item.id, manifestDigest: item.manifestDigest })) }, null, 2) + '\n');
  }
  if (args.includes('--json')) console.log(JSON.stringify(output, null, 2));
  else context.log(`System certification: ${output.summary.certified}/${output.summary.total} certified; ${output.summary.blocked} blocked from product selection.${write ? ' Ledger written.' : ''}`);
  if (!systems.find(item => item.id === 'kiln')?.certified) context.fail('Kiln certification failed; Studio must not expose it.');
  return output;
}

module.exports = { execute };
