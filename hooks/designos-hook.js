#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  let event = {};
  try { event = input.trim() ? JSON.parse(input) : {}; } catch {}
  const mode = process.env.DESIGNOS_HOOK_MODE || event.mode || 'warn';
  const candidate = event.file_path || event.path || event.tool_input?.file_path || process.argv[2];
  if (!candidate && mode === 'deep-on-stop') {
    const configPath = path.resolve('.designos/config.json');
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
    const target = config.hook?.target;
    if (!target) {
      process.stdout.write(JSON.stringify({ decision: 'warn',
        message: 'DesignOS deep-on-stop is installed but .designos/config.json has no hook.target.' }));
      return;
    }
    const cli = path.resolve(__dirname, '../bin/designos.js');
    const audit = spawnSync(process.execPath, [cli, 'audit', path.dirname(target) || '.'], { encoding: 'utf8' });
    const visual = spawnSync(process.execPath, [cli, 'visual', target, '--no-fail',
      '--out', '.designos/deep-visual.md', '--json-out', '.designos/deep-visual.json',
      '--screenshots', '.designos/deep-screenshots'], { encoding: 'utf8' });
    const failed = audit.status !== 0 || visual.status !== 0;
    process.stdout.write(JSON.stringify({
      decision: failed ? 'warn' : 'allow',
      message: `DesignOS deep gate\n${audit.stdout || audit.stderr}\n${visual.stdout || visual.stderr}`,
    }));
    return;
  }
  if (!candidate) process.exit(0);
  const file = path.resolve(candidate);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) process.exit(0);
  const checker = path.resolve(__dirname, '../validators/check-registry.js');
  const result = spawnSync(process.execPath, [checker, file, '--json'], { encoding: 'utf8' });
  let report = { findings: [] };
  try { report = JSON.parse(result.stdout || '{}'); } catch {}
  const blocking = report.findings.filter(item => item.severity === 'P1');
  if (report.findings.length) {
    const summary = report.findings.map(item =>
      `[${item.severity}] ${item.id} ${item.file}:${item.line} — ${item.message}\nFix: ${item.fix}`).join('\n');
    process.stdout.write(JSON.stringify({
      decision: mode === 'block' && blocking.length ? 'block' : 'warn',
      message: `DesignOS edit gate (${mode})\n${summary}`,
      findings: report.findings,
    }));
  }
  if (mode === 'block' && blocking.length) process.exit(2);
});
if (process.stdin.isTTY) process.stdin.emit('end');
