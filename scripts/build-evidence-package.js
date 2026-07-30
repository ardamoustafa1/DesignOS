#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outIndex = args.indexOf('--out');
const outputDirectory = path.resolve(ROOT, outIndex >= 0 && args[outIndex + 1]
  ? args[outIndex + 1] : 'dist/evidence');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-evidence-package-'));

function copyIfExists(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function directoryBytes(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const file = path.join(directory, entry.name);
    return total + (entry.isDirectory() ? directoryBytes(file) : fs.statSync(file).size);
  }, 0);
}

try {
  const evidenceRoot = path.join(temporary, 'goldens');
  if (!fs.existsSync(path.join(ROOT, 'goldens'))) {
    throw new Error('Evidence sources are not present in the core package. Run this command from the full DesignOS repository.');
  }
  const projects = fs.readdirSync(path.join(ROOT, 'goldens'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  for (const project of projects) {
    const source = path.join(ROOT, 'goldens', project);
    copyIfExists(path.join(source, 'designos-golden.json'), path.join(evidenceRoot, project, 'designos-golden.json'));
    copyIfExists(path.join(source, 'evidence'), path.join(evidenceRoot, project, 'evidence'));
  }
  copyIfExists(path.join(ROOT, 'evals/isolated/registry-eval.json'), path.join(temporary, 'evals/isolated/registry-eval.json'));
  copyIfExists(path.join(ROOT, 'evals/external/registry.json'), path.join(temporary, 'evals/external/registry.json'));
  const manifest = {
    schema: 1,
    corePackage: `${pkg.name}@${pkg.version}`,
    projects,
    generatedAt: new Date().toISOString(),
    contents: ['golden manifests', 'platform screenshots/diffs', 'browser ledgers', 'isolated/external eval registries'],
  };
  fs.writeFileSync(path.join(temporary, 'evidence-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({
    name: 'designos-evidence',
    version: pkg.version,
    description: `Commit-bound evidence companion for ${pkg.name}@${pkg.version}`,
    license: pkg.license,
    files: ['goldens', 'evals', 'evidence-manifest.json'],
  }, null, 2) + '\n');
  const bytes = directoryBytes(temporary);
  if (dryRun) {
    console.log(`evidence-package: ${projects.length} goldens, ${bytes} unpacked bytes (dry run)`);
  } else {
    fs.mkdirSync(outputDirectory, { recursive: true });
    const result = spawnSync('npm', ['pack', temporary, '--pack-destination', outputDirectory], {
      cwd: ROOT, encoding: 'utf8',
    });
    if (result.status) throw new Error(result.stderr || result.stdout);
    console.log(`evidence-package: ${result.stdout.trim()} → ${path.relative(ROOT, outputDirectory)}`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
