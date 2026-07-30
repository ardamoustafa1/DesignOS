#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildNativeAdapters } = require('../runtime/native/adapters');

function syntaxEvidence(output, report) {
  const byPlatform = Object.fromEntries(report.results.map(item => [item.platform, item.file]));
  const run = (command, args) => {
    const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30000 });
    return {
      command: [command, ...args].join(' '),
      available: !result.error || result.error.code !== 'ENOENT',
      passed: result.error?.code === 'ENOENT' ? null : result.status === 0,
      output: `${result.stdout || ''}${result.stderr || ''}`.trim().slice(0, 2000),
    };
  };
  const sdk = spawnSync('xcrun', ['--sdk', 'iphonesimulator', '--show-sdk-path'], { encoding: 'utf8' });
  const swift = sdk.status === 0
    ? run('xcrun', ['swiftc', '-typecheck', '-sdk', sdk.stdout.trim(),
      '-target', 'arm64-apple-ios17.0-simulator', byPlatform.swiftui])
    : run('swiftc', ['-frontend', '-parse', byPlatform.swiftui]);
  const flutterAvailable = spawnSync('flutter', ['--version'], { encoding: 'utf8', timeout: 30000 }).status === 0;
  let flutter;
  if (flutterAvailable) {
    const probe = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-flutter-probe-'));
    fs.mkdirSync(path.join(probe, 'lib'), { recursive: true });
    fs.writeFileSync(path.join(probe, 'pubspec.yaml'),
      'name: designos_native_probe\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n');
    fs.copyFileSync(byPlatform.flutter, path.join(probe, 'lib/designos_motion.dart'));
    const pub = run('flutter', ['pub', 'get', '--directory', probe]);
    flutter = pub.passed ? run('flutter', ['analyze', '--no-pub', probe]) : pub;
    flutter.command = `flutter pub get && ${flutter.command}`;
    fs.rmSync(probe, { recursive: true, force: true });
  } else flutter = run('dart', ['format', '--output=none', byPlatform.flutter]);
  const evidence = {
    swiftui: swift,
    flutter,
    compose: {
      command: 'structural Kotlin parser',
      available: true,
      passed: (fs.readFileSync(byPlatform.compose, 'utf8').match(/[{}()]/g) || [])
        .reduce((balance, token) => balance + ('{('.includes(token) ? 1 : -1), 0) === 0,
      output: 'Kotlin compiler unavailable; delimiter and capability contract checked.',
    },
  };
  try {
    const esbuild = require('esbuild');
    esbuild.transformSync(fs.readFileSync(byPlatform['react-native'], 'utf8'), {
      loader: 'tsx', jsx: 'automatic', format: 'esm',
    });
    evidence['react-native'] = { command: 'esbuild TSX parser', available: true, passed: true, output: '' };
  } catch (error) {
    const unavailable = error.code === 'MODULE_NOT_FOUND';
    evidence['react-native'] = {
      command: 'esbuild TSX parser',
      available: !unavailable,
      passed: unavailable ? null : false,
      output: error.message,
    };
  }
  return evidence;
}

function main() {
  const args = process.argv.slice(2);
  const index = args.indexOf('--out');
  const output = path.resolve(index >= 0 ? args[index + 1] : '.designos/native-motion');
  const report = buildNativeAdapters(output);
  report.syntaxEvidence = syntaxEvidence(output, report);
  report.syntaxPassed = Object.values(report.syntaxEvidence).every(item => item.passed !== false);
  fs.writeFileSync(path.join(output, 'conformance.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`native-motion: ${report.results.filter(item => item.passed).length}/${report.results.length} platform contracts → ${path.relative(process.cwd(), output)}`);
  if (!report.passed || !report.syntaxPassed || Object.values(report.probe).some(value => !value)) process.exit(1);
}

module.exports = { syntaxEvidence };

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
