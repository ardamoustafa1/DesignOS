#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { getRecipe } = require('../runtime/motion/catalog');

function checkMotionScene(target) {
  let source = fs.readFileSync(target, 'utf8');
  if (/\.html?$/i.test(target)) {
    const directory = path.dirname(target);
    const linked = [...source.matchAll(/(?:href|src)=["']([^"']+\.(?:css|js))["']/g)]
      .map(match => path.resolve(directory, match[1]))
      .filter(file => file.startsWith(directory) && fs.existsSync(file));
    source += linked.map(file => `\n/* ${path.basename(file)} */\n${fs.readFileSync(file, 'utf8')}`).join('');
  }
  const tokens = [...source.matchAll(/data-motion=["']([^"']+)["']/g)].flatMap(match => match[1].split(/\s+/)).filter(Boolean);
  const known = tokens.filter(token => getRecipe(token) || ['reveal','stagger','tilt','spotlight','parallax','magnetic','progress','press'].includes(token));
  const roleMatches = [...source.matchAll(/data-motion-role=["']([^"']+)["']/g)].map(match => match[1]);
  const findings = [];
  if (new Set(roleMatches).size < 4) findings.push({ severity:'P1', code:'motion-role-coverage', message:'At least four declared motion roles are required.' });
  if (!/prefers-reduced-motion\s*:\s*reduce/.test(source) && !/prefers-reduced-motion/.test(source)) findings.push({ severity:'P1', code:'reduced-motion-contract', message:'A reduced-motion path is required.' });
  if (known.length < 4) findings.push({ severity:'P2', code:'executable-motion-density', message:'At least four executable motion bindings are required.' });
  if (/addEventListener\(['"]scroll['"]/.test(source) && !/addEventListener\(['"]scroll['"][\s\S]{0,160}\{\s*passive\s*:\s*true\s*\}/.test(source)) findings.push({ severity:'P2', code:'passive-scroll', message:'Scroll listeners must be passive and rAF-batched.' });
  if (/animation\s*:\s*[^;]*(infinite)/i.test(source) && !/prefers-reduced-motion/.test(source)) findings.push({ severity:'P1', code:'unbounded-loop', message:'Ambient loops require a reduced-motion stop.' });
  return { target:path.resolve(target), passed:findings.every(item=>!['P1','P2'].includes(item.severity)), evidence:{bindings:known.length,roles:[...new Set(roleMatches)],reducedMotion:/prefers-reduced-motion/.test(source)}, findings };
}
if(require.main===module){const target=process.argv[2];if(!target){console.error('Usage: check-motion-scene <html> [--json]');process.exit(2)}const report=checkMotionScene(path.resolve(target));console.log(process.argv.includes('--json')?JSON.stringify(report,null,2):`motion-scene: ${report.passed?'clean':'failed'}; ${report.evidence.bindings} bindings, ${report.evidence.roles.length} roles`);if(!report.passed)process.exit(1)}
module.exports={checkMotionScene};
