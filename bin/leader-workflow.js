'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { analyzeFile } = require('./cli/commands/animation-review');
const { searchPatterns } = require('../runtime/pattern-atlas');
const { compileMotionSemantics } = require('../runtime/motion/semantics');

const SOURCE_RE = /\.(?:html|css|js|jsx|ts|tsx|vue|svelte)$/i;
const SKIP = new Set(['.git', '.designos', 'node_modules', 'dist', 'build', '.next', 'coverage']);

function collectFiles(target) {
  const files = [];
  const visit = current => {
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(current)) {
        if (!SKIP.has(name)) visit(path.join(current, name));
      }
    } else if (SOURCE_RE.test(current)) files.push(current);
  };
  visit(target);
  return files.sort();
}

function inferComponents(source) {
  const tests = {
    popover: /popover|tooltip|dropdown|menu/i,
    dialog: /dialog|modal/i,
    drawer: /drawer|sheet/i,
    accordion: /accordion|details\b/i,
    sortable: /sortable|drag.?reorder/i,
    carousel: /carousel|slider/i,
    value: /odometer|counter|ticker/i,
    button: /<button|\.btn\b|button\s*\{/i,
  };
  const found = Object.entries(tests).filter(([, test]) => test.test(source)).map(([name]) => name);
  return found.length ? found : ['generic'];
}

function runGate(root, cwd, command, args) {
  const result = spawnSync(process.execPath, [path.join(root, command), ...args], {
    cwd, encoding: 'utf8', timeout: 180000,
  });
  return {
    command: `node ${command} ${args.join(' ')}`,
    passed: result.status === 0,
    status: result.status,
    stdout: String(result.stdout || '').trim().slice(-8000),
    stderr: String(result.stderr || '').trim().slice(-4000),
  };
}

function buildLeaderReport({ target, cwd, root, brief = '', motionIntensity = 5, deep = false }) {
  const absolute = path.resolve(cwd, target);
  if (!fs.existsSync(absolute)) throw new Error(`improve: target not found: ${target}`);
  const files = collectFiles(absolute);
  const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const components = inferComponents(source);
  const motionFindings = files.flatMap(file => analyzeFile(file, cwd));
  const patternQuery = `${brief} ${components.join(' ')}`.trim();
  const candidates = searchPatterns(patternQuery, { intensity: motionIntensity, limit: 12 });
  const patterns = candidates.filter(pattern => {
    if (pattern.id === 'hold-to-confirm' && !/destructive|delete|confirm|irreversible|hold/i.test(brief)) return false;
    if (pattern.category === 'gesture' && !/gesture|drag|swipe|reorder|touch/i.test(`${brief} ${components.join(' ')}`)) return false;
    if (pattern.scale === 'hero' && !/hero|launch|story|marketing/i.test(brief)) return false;
    return true;
  }).slice(0, 6);
  const motionDecisions = components.map(component => compileMotionSemantics({
    componentType: component,
    stateTransition: component === 'button' ? 'press' : component === 'sortable' ? 'drag' : 'open',
    frequency: ['button', 'popover', 'menu'].includes(component) ? 'high' : 'medium',
    inputModality: 'pointer',
    motionIntensity,
    semanticImportance: component === 'generic' ? 'normal' : 'high',
  }));
  const gates = [];
  if (deep) {
    gates.push(runGate(root, cwd, 'validators/run-registry.js', [target]));
    gates.push(runGate(root, cwd, 'bin/designos.js', ['review', target, '--min', '95']));
  }
  const blockers = motionFindings.filter(item => item.severity === 'P1');
  const priorities = [
    blockers.length ? { priority: 'P0', action: `Resolve ${blockers.length} blocking motion finding(s).`, evidence: blockers.slice(0, 8) } : null,
    !brief ? { priority: 'P1', action: 'Provide --brief so originality and product-truth routing can be assessed.', evidence: 'brief missing' } : null,
    { priority: 'P1', action: 'Implement complete pointer, keyboard, touch and reduced-motion behavior for every selected pattern.', evidence: patterns.map(item => item.id) },
    { priority: 'P1', action: 'Run browser evidence before claiming completion.', evidence: 'source analysis is not rendered proof' },
    { priority: 'P2', action: 'Choose at most one interaction signature and one hero signature; reject the rest explicitly.', evidence: patterns.filter(item => item.category === 'signature').map(item => item.id) },
  ].filter(Boolean);
  const passed = blockers.length === 0 && gates.every(gate => gate.passed);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    target,
    brief: brief || null,
    mode: deep ? 'deep' : 'source',
    passed,
    finalDesignScore: 'NOT ASSESSED',
    inventory: { files: files.length, components },
    motion: {
      intensity: motionIntensity,
      findings: motionFindings,
      decisions: motionDecisions,
      recommendedPatterns: patterns,
    },
    gates,
    priorities,
    evidenceRequired: [
      'screenshots at 375, 768, 1024 and 1440 plus 320px reflow',
      'keyboard path, focus order and focus-not-obscured',
      'computed contrast and accessibility tree',
      'full and reduced motion',
      'Lighthouse/Core Web Vitals for deployable pages',
    ],
  };
}

function markdown(report) {
  const lines = [
    '# DesignOS Leader Report', '',
    `- Target: \`${report.target}\``,
    `- Mode: ${report.mode}`,
    `- Source gate: ${report.passed ? 'PASS' : 'RETURN TO LOOP'}`,
    '- Final design score: **NOT ASSESSED**', '',
    '## Inventory', '',
    `- ${report.inventory.files} source files`,
    `- Components: ${report.inventory.components.join(', ')}`, '',
    '## Motion decisions', '',
  ];
  for (const decision of report.motion.decisions) {
    lines.push(`- **${decision.inputs.componentType}/${decision.inputs.stateTransition}:** ${decision.recommendation}`);
    lines.push(`  Why: ${decision.reasons.join('; ')}`);
    if (decision.rejectedTechniques.length) lines.push(`  Rejected: ${decision.rejectedTechniques.join(', ')}`);
  }
  lines.push('', '## Pattern shortlist', '');
  for (const pattern of report.motion.recommendedPatterns) {
    lines.push(`- **${pattern.id}:** ${pattern.intent}`);
    lines.push(`  Product truth: ${pattern.productTruth}`);
    lines.push(`  Avoid when: ${pattern.avoidWhen.join('; ')}`);
  }
  lines.push('', '## Fix order', '');
  for (const item of report.priorities) lines.push(`- **${item.priority}:** ${item.action}`);
  lines.push('', '## Evidence still required', '');
  for (const item of report.evidenceRequired) lines.push(`- [ ] ${item}`);
  return `${lines.join('\n')}\n`;
}

module.exports = { collectFiles, inferComponents, buildLeaderReport, markdown };
