'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * `designos system …` — the design-system package surface.
 *
 *   designos system list                     what is packaged
 *   designos system show <slug>              print the full contract to stdout
 *   designos system tokens <slug>            print just tokens.css
 *   designos system check <target> --system <slug>
 *
 * `show` is the whole no-service story: it writes the contract to stdout, so any agent in
 * any CLI can consume it by pipe or paste. There is no daemon to run, no key to hold, and
 * no request leaving the machine — the package is files, and files compose into a prompt
 * without anyone's permission.
 *
 * `check` is the half a prompt cannot do. Injecting a system makes the first screen obey
 * it; verifying the output is what keeps the fourth screen obeying it
 * (validators/check-system-conformance.js).
 */

function systemsRoot(context) {
  const local = path.join(context.cwd, 'systems');
  if (fs.existsSync(local)) return local;
  return path.join(context.pkgRoot, 'systems');
}

function readSystems(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .filter(e => fs.existsSync(path.join(root, e.name, 'manifest.json')))
    .map(e => ({
      slug: e.name,
      dir: path.join(root, e.name),
      manifest: JSON.parse(fs.readFileSync(path.join(root, e.name, 'manifest.json'), 'utf8')),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function resolve(context, root, slug) {
  const found = readSystems(root).find(s => s.slug === slug);
  if (!found) {
    const available = readSystems(root).map(s => s.slug).join(', ') || 'none packaged';
    context.fail(`Unknown design system "${slug}" — available: ${available}`);
  }
  return found;
}

function list(context, root, args) {
  const asJson = args.includes('--json');
  const verbose = args.includes('--verbose');
  const category = context.argValue(args, '--category', null);
  const grep = context.argValue(args, '--grep', null);

  let systems = readSystems(root);
  if (category) {
    const needle = category.toLowerCase();
    systems = systems.filter(s => String(s.manifest.category || '').toLowerCase().includes(needle));
  }
  if (grep) {
    const needle = grep.toLowerCase();
    systems = systems.filter(s => `${s.slug} ${s.manifest.name} ${s.manifest.description} ${(s.manifest.suits || []).join(' ')}`
      .toLowerCase().includes(needle));
  }

  if (asJson) {
    console.log(JSON.stringify(systems.map(s => ({ id: s.slug, ...s.manifest })), null, 2));
    return;
  }
  if (!systems.length) {
    context.warn(category || grep
      ? `no design system matches ${category ? `--category ${category}` : `--grep ${grep}`}`
      : `no design systems found in ${path.relative(context.cwd, root) || '.'}`);
    return;
  }

  /* With a large catalog an unfiltered dump is unreadable, so the default groups by
     category and prints one line each; --verbose restores the full entry. */
  if (verbose) {
    for (const s of systems) {
      console.log(`${s.slug.padEnd(24)} ${s.manifest.name} — ${s.manifest.category}`);
      console.log(`${' '.repeat(24)} ${s.manifest.description}`);
      if (Array.isArray(s.manifest.suits) && s.manifest.suits.length) {
        console.log(`${' '.repeat(24)} suits: ${s.manifest.suits.join(' · ')}`);
      }
      console.log('');
    }
  } else {
    const byCategory = new Map();
    for (const s of systems) {
      const key = s.manifest.category || 'Uncategorised';
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(s);
    }
    for (const key of [...byCategory.keys()].sort()) {
      console.log(`\n${key}`);
      for (const s of byCategory.get(key)) {
        const origin = s.manifest.source && s.manifest.source.type === 'imported' ? '' : ' *';
        console.log(`  ${(s.slug + origin).padEnd(26)} ${s.manifest.name}`);
      }
    }
    console.log('\n  * authored for DesignOS · everything else imported, see systems/NOTICE');
  }

  console.log(`\n${systems.length} system(s). Narrow with --category <text> or --grep <text>.`);
  console.log(`Load one with: ${context.run} system show <slug>`);
}

function show(context, root, slug, args) {
  const system = resolve(context, root, slug);
  const withTokens = !args.includes('--no-tokens');
  const parts = [fs.readFileSync(path.join(system.dir, 'SYSTEM.md'), 'utf8')];
  if (withTokens) {
    parts.push('\n---\n\n## Compiled tokens (`tokens.css`)\n\n```css\n'
      + fs.readFileSync(path.join(system.dir, 'tokens.css'), 'utf8').trimEnd()
      + '\n```\n');
  }
  parts.push(`\n---\n\nConformance: \`node validators/check-system-conformance.js <target> --system ${slug}\`\n`);
  console.log(parts.join(''));
}

function tokens(context, root, slug) {
  const system = resolve(context, root, slug);
  process.stdout.write(fs.readFileSync(path.join(system.dir, 'tokens.css'), 'utf8'));
}

function check(context, root, args) {
  const positionals = args.filter(a => !a.startsWith('--'));
  const slug = context.argValue(args, '--system', null);
  const target = positionals.find((_, i) => positionals[i] !== slug) || positionals[0];
  if (!target) {
    context.fail(`Usage: ${context.run} system check <target> --system <slug>`);
  }
  if (!slug) {
    const available = readSystems(root).map(s => s.slug).join(', ') || 'none packaged';
    context.fail(`A system is required: ${context.run} system check ${target} --system <slug>   (available: ${available})`);
  }
  resolve(context, root, slug);
  const validators = fs.existsSync(path.join(context.cwd, 'DesignOS', 'validators'))
    ? path.join(context.cwd, 'DesignOS', 'validators')
    : path.join(context.pkgRoot, 'validators');
  const scriptArgs = [
    path.join(validators, 'check-system-conformance.js'), target,
    '--system', slug, '--systems-dir', root,
  ];
  if (args.includes('--json')) scriptArgs.push('--json');
  const result = spawnSync(process.execPath, scriptArgs, { cwd: context.cwd, encoding: 'utf8', stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

function execute(sub, args, context) {
  const root = systemsRoot(context);
  switch (sub) {
    case undefined:
    case 'list': return list(context, root, args);
    case 'show': return show(context, root, context.firstPositional(args.slice(1)) || args[1], args);
    case 'tokens': return tokens(context, root, context.firstPositional(args.slice(1)) || args[1]);
    case 'check': return check(context, root, args.slice(1));
    default:
      context.fail(`Unknown subcommand "${sub}" — try: ${context.run} system list | show <slug> | tokens <slug> | check <target> --system <slug>`);
  }
}

module.exports = { execute };
