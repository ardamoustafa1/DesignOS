#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STACKS = Object.freeze(['html', 'react', 'vue', 'svelte', 'tailwind', 'css-modules']);

const COMPONENT_CONTRACTS = {
  dialog: { tag: 'dialog', role: 'dialog', contracts: { state: ['closed', 'open'], keyboard: { Escape: 'close' }, focus: 'trap', ax: { 'aria-modal': 'true' }, motion: { enter: 'fade-scale-in', exit: 'fade-scale-out' } } },
  drawer: { tag: 'div', role: 'dialog', contracts: { state: ['closed', 'open'], keyboard: { Escape: 'close' }, focus: 'trap', ax: { 'aria-modal': 'true' }, motion: { enter: 'slide-in-edge', exit: 'slide-out-edge' } } },
  popover: { tag: 'div', role: 'dialog', contracts: { state: ['closed', 'open'], keyboard: { Escape: 'close' }, focus: 'trap', ax: { 'aria-modal': 'false' }, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  tooltip: { tag: 'div', role: 'tooltip', contracts: { state: ['closed', 'open'], keyboard: { Escape: 'close' }, focus: 'none', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  tabs: { tag: 'div', role: 'tablist', contracts: { state: ['activeTabId'], keyboard: { ArrowLeft: 'prev', ArrowRight: 'next' }, focus: 'roving', ax: { 'aria-orientation': 'horizontal' }, motion: { enter: 'none', exit: 'none' } } },
  accordion: { tag: 'div', contracts: { state: ['expandedIds'], keyboard: { ArrowDown: 'next', ArrowUp: 'prev' }, focus: 'linear', ax: {}, motion: { enter: 'expand', exit: 'collapse' } } },
  combobox: { tag: 'div', role: 'combobox', contracts: { state: ['open', 'value', 'inputValue'], keyboard: { ArrowDown: 'nextOption', ArrowUp: 'prevOption', Enter: 'select', Escape: 'close' }, focus: 'input-active-descendant', ax: { 'aria-expanded': 'false', 'aria-haspopup': 'listbox' }, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  'command-palette': { tag: 'dialog', role: 'dialog', contracts: { state: ['open', 'query'], keyboard: { ArrowDown: 'nextOption', ArrowUp: 'prevOption', Enter: 'execute', Escape: 'close' }, focus: 'input-active-descendant', ax: { 'aria-modal': 'true' }, motion: { enter: 'fade-scale-in', exit: 'fade-scale-out' } } },
  toast: { tag: 'div', role: 'status', contracts: { state: ['visible', 'dismissed'], keyboard: { Escape: 'dismiss' }, focus: 'none', ax: { 'aria-live': 'polite' }, motion: { enter: 'slide-in-bottom', exit: 'slide-out-bottom' } } },
  carousel: { tag: 'div', role: 'region', label: 'Carousel', contracts: { state: ['currentIndex'], keyboard: { ArrowLeft: 'prev', ArrowRight: 'next' }, focus: 'roving', ax: { 'aria-roledescription': 'carousel' }, motion: { enter: 'slide-x', exit: 'slide-x' } } },
  'sortable-list': { tag: 'ul', contracts: { state: ['items'], keyboard: { Space: 'lift', ArrowUp: 'moveUp', ArrowDown: 'moveDown' }, focus: 'linear', ax: { 'aria-roledescription': 'sortable' }, motion: { enter: 'reorder', exit: 'reorder' } } },
  'data-table': { tag: 'table', role: 'grid', contracts: { state: ['sort', 'filter', 'selection'], keyboard: { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }, focus: 'grid', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  'date-picker': { tag: 'div', contracts: { state: ['date', 'month', 'year', 'open'], keyboard: { ArrowUp: 'prevWeek', ArrowDown: 'nextWeek', ArrowLeft: 'prevDay', ArrowRight: 'nextDay' }, focus: 'grid', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  'file-upload': { tag: 'div', contracts: { state: ['idle', 'dragging', 'uploading', 'success', 'error'], keyboard: { Enter: 'openDialog' }, focus: 'element', ax: {}, motion: { enter: 'scale', exit: 'scale' } } },
  stepper: { tag: 'div', contracts: { state: ['currentStep'], keyboard: {}, focus: 'linear', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  'inline-edit': { tag: 'div', contracts: { state: ['reading', 'editing'], keyboard: { Enter: 'save', Escape: 'cancel' }, focus: 'input', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  navigation: { tag: 'nav', role: 'navigation', contracts: { state: ['activeItem'], keyboard: {}, focus: 'linear', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  search: { tag: 'search', role: 'search', contracts: { state: ['query'], keyboard: {}, focus: 'input', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  filter: { tag: 'div', contracts: { state: ['activeFilters'], keyboard: {}, focus: 'linear', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  pagination: { tag: 'nav', role: 'navigation', label: 'Pagination', contracts: { state: ['currentPage', 'totalPages'], keyboard: {}, focus: 'linear', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  badge: { tag: 'span', contracts: { state: [], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  avatar: { tag: 'div', contracts: { state: ['loaded', 'fallback'], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  button: { tag: 'button', contracts: { state: ['idle', 'loading', 'disabled'], keyboard: { Enter: 'press', Space: 'press' }, focus: 'element', ax: {}, motion: { enter: 'scale-press', exit: 'scale-release' } } },
  checkbox: { tag: 'button', role: 'checkbox', contracts: { state: ['checked', 'unchecked', 'indeterminate'], keyboard: { Space: 'toggle' }, focus: 'element', ax: { 'aria-checked': 'false' }, motion: { enter: 'check', exit: 'uncheck' } } },
  'radio-group': { tag: 'div', role: 'radiogroup', contracts: { state: ['value'], keyboard: { ArrowDown: 'next', ArrowUp: 'prev' }, focus: 'roving', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  switch: { tag: 'button', role: 'switch', contracts: { state: ['on', 'off'], keyboard: { Space: 'toggle' }, focus: 'element', ax: { 'aria-checked': 'false' }, motion: { enter: 'slide', exit: 'slide' } } },
  slider: { tag: 'div', role: 'slider', contracts: { state: ['value'], keyboard: { ArrowLeft: 'decrement', ArrowRight: 'increment' }, focus: 'element', ax: { 'aria-valuemin': '0', 'aria-valuemax': '100' }, motion: { enter: 'none', exit: 'none' } } },
  progress: { tag: 'div', role: 'progressbar', contracts: { state: ['value', 'max'], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'scale-x', exit: 'none' } } },
  skeleton: { tag: 'div', contracts: { state: [], keyboard: {}, focus: 'none', ax: { 'aria-hidden': 'true' }, motion: { enter: 'pulse', exit: 'pulse' } } },
  breadcrumbs: { tag: 'nav', role: 'navigation', label: 'Breadcrumbs', contracts: { state: [], keyboard: {}, focus: 'linear', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  'dropdown-menu': { tag: 'div', role: 'menu', contracts: { state: ['open'], keyboard: { ArrowDown: 'nextItem', ArrowUp: 'prevItem', Escape: 'close' }, focus: 'linear', ax: {}, motion: { enter: 'fade-scale-in', exit: 'fade-scale-out' } } },
  'context-menu': { tag: 'div', role: 'menu', contracts: { state: ['open'], keyboard: { ArrowDown: 'nextItem', ArrowUp: 'prevItem', Escape: 'close' }, focus: 'linear', ax: {}, motion: { enter: 'fade-scale-in', exit: 'fade-scale-out' } } },
  menubar: { tag: 'div', role: 'menubar', contracts: { state: ['activeMenu'], keyboard: { ArrowLeft: 'prevMenu', ArrowRight: 'nextMenu' }, focus: 'roving', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  'scroll-area': { tag: 'div', contracts: { state: [], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  separator: { tag: 'hr', role: 'separator', contracts: { state: [], keyboard: {}, focus: 'none', ax: { 'aria-orientation': 'horizontal' }, motion: { enter: 'none', exit: 'none' } } },
  'hover-card': { tag: 'div', contracts: { state: ['open', 'closed'], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  alert: { tag: 'div', role: 'alert', contracts: { state: [], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'fade-in', exit: 'fade-out' } } },
  'alert-dialog': { tag: 'dialog', role: 'alertdialog', contracts: { state: ['open', 'closed'], keyboard: { Escape: 'close' }, focus: 'trap', ax: { 'aria-modal': 'true' }, motion: { enter: 'fade-scale-in', exit: 'fade-scale-out' } } },
  'aspect-ratio': { tag: 'div', contracts: { state: [], keyboard: {}, focus: 'none', ax: {}, motion: { enter: 'none', exit: 'none' } } },
  collapsible: { tag: 'div', contracts: { state: ['open', 'closed'], keyboard: { Space: 'toggle', Enter: 'toggle' }, focus: 'element', ax: {}, motion: { enter: 'expand', exit: 'collapse' } } },
  select: { tag: 'div', role: 'combobox', contracts: { state: ['open', 'value'], keyboard: { ArrowDown: 'nextOption', ArrowUp: 'prevOption', Enter: 'select', Escape: 'close' }, focus: 'input-active-descendant', ax: { 'aria-expanded': 'false', 'aria-haspopup': 'listbox' }, motion: { enter: 'fade-in', exit: 'fade-out' } } },
};

const PRIMITIVES = Object.freeze({
  hero: { tag: 'section', role: 'region' },
  split: { tag: 'div' },
  'proof-stack': { tag: 'aside', label: 'Verified proof' },
  'interactive-product-model': { tag: 'div', label: 'Interactive product model' },
  'trust-rail': { tag: 'ul', label: 'Trust evidence' },
  'action-cluster': { tag: 'div', label: 'Actions' },
  copy: { tag: 'div', label: 'Product copy' },
  media: { tag: 'figure', label: 'Product media' },
  grid: { tag: 'div' },
  stack: { tag: 'div' },
  ...COMPONENT_CONTRACTS
});

function tokenizeDsl(source) {
  return [...source.matchAll(/[A-Za-z][\w-]*|[(),]/g)].map(match => match[0]);
}

function parseComposition(source) {
  const tokens = tokenizeDsl(source);
  let index = 0;
  const parseNode = () => {
    const name = tokens[index++];
    if (!name || /[(),]/.test(name)) throw new Error(`Expected composition primitive at token ${index}.`);
    const node = { name, children: [] };
    if (tokens[index] === '(') {
      index += 1;
      while (tokens[index] !== ')') {
        node.children.push(parseNode());
        if (tokens[index] === ',') index += 1;
        else if (tokens[index] !== ')') throw new Error(`Expected "," or ")" after ${node.name}.`);
        if (index >= tokens.length) throw new Error(`Unclosed composition "${node.name}".`);
      }
      index += 1;
    }
    return node;
  };
  const ast = parseNode();
  if (index !== tokens.length) throw new Error(`Unexpected token "${tokens[index]}".`);
  return ast;
}

function validateAst(node, findings = []) {
  if (!PRIMITIVES[node.name]) findings.push({ code: 'unknown-primitive', node: node.name });
  if (node.name === 'split' && node.children.length !== 2) {
    findings.push({ code: 'split-arity', node: node.name, expected: 2, actual: node.children.length });
  }
  if (node.name === 'hero' && node.children.length < 2) {
    findings.push({ code: 'hero-incomplete', node: node.name });
  }
  node.children.forEach(child => validateAst(child, findings));
  return findings;
}

const className = name => `dos-${name}`;
const labelFor = name => PRIMITIVES[name]?.label || name.replaceAll('-', ' ');

function htmlNode(node, options = {}, depth = 0) {
  const primitive = PRIMITIVES[node.name] || { tag: 'div' };
  const indent = '  '.repeat(depth);
  const attrName = options.jsx ? 'className' : 'class';
  const attrList = [
    `${attrName}="${className(node.name)}"`,
    `data-composition="${node.name}"`,
    primitive.role ? `role="${primitive.role}"` : '',
    primitive.label ? `aria-label="${primitive.label}"` : '',
  ];
  
  if(primitive.contracts?.ax) {
    for(const [k, v] of Object.entries(primitive.contracts.ax)) {
      attrList.push(`${k}="${v}"`);
    }
  }
  
  const attrs = attrList.filter(Boolean).join(' ');
  const content = node.children.length
    ? `\n${node.children.map(child => htmlNode(child, options, depth + 1)).join('\n')}\n${indent}`
    : labelFor(node.name);
  return `${indent}<${primitive.tag} ${attrs}>${content}</${primitive.tag}>`;
}

const CSS = `.dos-hero{max-width:1200px;margin-inline:auto;padding:clamp(1rem,4vw,3rem);display:grid;gap:2rem}
.dos-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(16rem,2fr);gap:clamp(1rem,3vw,3rem);align-items:center}
.dos-stack,.dos-proof-stack,.dos-action-cluster{display:grid;gap:1rem;min-width:0}
.dos-grid,.dos-trust-rail{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:1rem;min-width:0}
.dos-interactive-product-model,.dos-media{min-width:0;aspect-ratio:16/10;overflow:clip}
.dos-action-cluster{grid-auto-flow:column;justify-content:start}
@media(max-width:48rem){.dos-split{grid-template-columns:minmax(0,1fr)}.dos-action-cluster{grid-auto-flow:row}.dos-hero{padding-inline:max(1rem,env(safe-area-inset-left))}}
@media(prefers-reduced-motion:reduce){[data-composition]{scroll-behavior:auto}}`;

function tailwindNode(node, depth = 0) {
  const primitive = PRIMITIVES[node.name] || { tag: 'div' };
  const indent = '  '.repeat(depth);
  const classes = {
    hero: 'mx-auto grid max-w-[1200px] gap-8 p-[clamp(1rem,4vw,3rem)]',
    split: 'grid min-w-0 grid-cols-1 items-center gap-[clamp(1rem,3vw,3rem)] md:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)]',
    'proof-stack': 'grid min-w-0 gap-4',
    'action-cluster': 'grid min-w-0 grid-flow-row gap-4 md:grid-flow-col md:justify-start',
    'trust-rail': 'grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4',
    grid: 'grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-4',
    stack: 'grid min-w-0 gap-4',
    'interactive-product-model': 'min-w-0 aspect-[16/10] overflow-clip',
    media: 'min-w-0 aspect-[16/10] overflow-clip',
  }[node.name] || 'min-w-0';
  
  const attrList = [
    `class="${classes}"`,
    `data-composition="${node.name}"`,
    primitive.role ? `role="${primitive.role}"` : '',
    primitive.label ? `aria-label="${primitive.label}"` : '',
  ];
  if(primitive.contracts?.ax) {
    for(const [k, v] of Object.entries(primitive.contracts.ax)) {
      attrList.push(`${k}="${v}"`);
    }
  }
  const attrs = attrList.filter(Boolean).join(' ');
  
  const content = node.children.length
    ? `\n${node.children.map(child => tailwindNode(child, depth + 1)).join('\n')}\n${indent}`
    : labelFor(node.name);
  return `${indent}<${primitive.tag} ${attrs}>${content}</${primitive.tag}>`;
}

function attachContracts(node) {
  if (PRIMITIVES[node.name]?.contracts) {
    node.contracts = PRIMITIVES[node.name].contracts;
  }
  node.children.forEach(attachContracts);
}

function compileComposition(source, stack = 'html') {
  if (!STACKS.includes(stack)) throw new Error(`Unsupported composition stack "${stack}".`);
  const ast = parseComposition(source);
  const findings = validateAst(ast);
  if (findings.length) {
    const error = new Error(`Invalid composition: ${findings.map(item => item.code).join(', ')}`);
    error.findings = findings;
    throw error;
  }
  
  attachContracts(ast);
  
  const markup = stack === 'tailwind' ? tailwindNode(ast)
    : htmlNode(ast, { jsx: ['react', 'css-modules'].includes(stack) });
  const outputs = {
    html: `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Compiled composition</title><style>${CSS}</style><body><main>${markup}</main></body></html>`,
    react: `import './composition.css';\nexport function Composition(){return (\n${markup}\n);}\n`,
    vue: `<template>\n${markup}\n</template>\n<style scoped>\n${CSS}\n</style>\n`,
    svelte: `${markup}\n<style>\n${CSS}\n</style>\n`,
    tailwind: markup,
    'css-modules': `import styles from './composition.module.css';\nexport function Composition(){return (\n${markup.replace(/className="dos-([\w-]+)"/g, (_, name) => `className={styles['dos-${name}']}`)}\n);}\n`,
  };
  return {
    schema: 1,
    stack,
    ast,
    source: outputs[stack],
    stylesheet: ['react', 'css-modules'].includes(stack) ? CSS : null,
    constraints: {
      widths: [375, 768, 1024, 1440],
      minimumReadableLinePx: 280,
      maximumMeasureCh: 72,
      touchTargetPx: 44,
      safeArea: true,
      intrinsicMediaRatio: '16/10',
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const source = value('--dsl') || args.find(arg => !arg.startsWith('--'));
  const stack = value('--stack', 'html');
  if (!source) throw new Error('Usage: composition-compiler --dsl "hero(split(copy,media),trust-rail,action-cluster)" [--stack react] [--out file]');
  const result = compileComposition(source, stack);
  const output = value('--out');
  
  // Output JSON schema if --json is passed
  if(args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  
  if (output) {
    const absolute = path.resolve(output);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, result.source + '\n');
    if (result.stylesheet) {
      const cssName = stack === 'css-modules' ? 'composition.module.css' : 'composition.css';
      fs.writeFileSync(path.join(path.dirname(absolute), cssName), result.stylesheet + '\n');
    }
    
    fs.writeFileSync(path.join(path.dirname(absolute), 'ast.json'), JSON.stringify(result.ast, null, 2) + '\n');
    console.log(`composition-compiler: ${stack} → ${path.relative(process.cwd(), absolute)}`);
  } else process.stdout.write(result.source + '\n');
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
module.exports = { STACKS, PRIMITIVES, CSS, parseComposition, validateAst, compileComposition };
