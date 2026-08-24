'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { AGENTS, report } = require('../../../runtime/agent/capabilities');

function value(args, flag) {
  const inline = args.find(item => item.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : '';
}

function config(context) {
  const server = path.join(context.pkgRoot, 'runtime/agent/server.js');
  return { mcpServers: { designos: { command: process.execPath, args: [server], env: { DESIGNOS_WORKSPACE: context.cwd } } } };
}

function execute(args, context) {
  const action = context.positionals(args)[0] || 'status';
  const agent = value(args, '--agent') || context.positionals(args)[1] || 'codex';
  if (action === 'serve') {
    const child = spawn(process.execPath, [path.join(context.pkgRoot, 'runtime/agent/server.js')], { cwd: context.cwd, stdio: 'inherit', env: { ...process.env, DESIGNOS_WORKSPACE: context.cwd } });
    child.on('exit', code => { process.exitCode = code || 0; });
    return;
  }
  if (action === 'config') {
    const payload = JSON.stringify(config(context), null, 2) + '\n';
    const output = value(args, '--out');
    if (output) {
      const target = path.resolve(context.cwd, output);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, payload);
      context.ok(`Universal runtime config written to ${path.relative(context.cwd, target)}`);
    } else console.log(payload);
    return;
  }
  if (action === 'status') {
    const payload = agent === 'all' ? Object.keys(AGENTS).map(key => report(key, context.pkgRoot)) : report(agent, context.pkgRoot);
    if (args.includes('--json')) console.log(JSON.stringify(payload, null, 2));
    else {
      const rows = Array.isArray(payload) ? payload : [payload];
      for (const row of rows) console.log(`  ${row.agent.padEnd(12)} ${row.outcomeParity ? 'runtime parity' : 'degraded'} · native: ${row.nativeCapabilities.join(', ') || 'none'}`);
      console.log('\n  Runtime parity means shared DesignOS outcomes, not identical host UI or model behavior.');
    }
    return;
  }
  context.fail(`Usage: ${context.run} agent-runtime status [agent|all] [--json] | config [--out file] | serve`);
}

module.exports = { execute, config };
