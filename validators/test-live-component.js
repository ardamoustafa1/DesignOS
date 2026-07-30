#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const live = require('../bin/live-director');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'designos-live-component-'));
const source = path.join(temp, 'src/component.html');
const preview = path.join(temp, 'dist/index.html');
const build = path.join(temp, 'build.js');
fs.mkdirSync(path.dirname(source), { recursive: true });
fs.mkdirSync(path.dirname(preview), { recursive: true });
fs.mkdirSync(path.join(temp, '.designos'), { recursive: true });
const original = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Live component</title>
<style>*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui}section{padding:24px}button{min-width:56px;min-height:56px}button:focus-visible{outline:3px solid currentColor;outline-offset:3px}</style>
<body><main><section id="hero"><h1>Inspectable decision</h1><p>Existing product copy stays intact.</p><div class="proof" data-proof>Verified fixture</div><button>Secondary</button><button class="primary">Primary</button></section></main></body></html>`;
fs.writeFileSync(source, original);
fs.writeFileSync(build, `const fs=require('fs'),path=require('path');fs.mkdirSync(path.join(__dirname,'dist'),{recursive:true});fs.copyFileSync(path.join(__dirname,'src/component.html'),path.join(__dirname,'dist/index.html'));`);
fs.writeFileSync(path.join(temp, '.designos/config.json'), JSON.stringify({
  live: { buildCommand: [process.execPath, 'build.js'], previewTarget: 'dist/index.html' },
}, null, 2));
require('child_process').execFileSync(process.execPath, [build], { cwd: temp });

live.initSession(preview, temp);
live.annotate(preview, {
  selector: '#hero',
  sourceMarker: 'src/component.html:3:13',
  classification: 'Hierarchy weak',
  note: 'Exercise a source-mapped component transaction',
}, temp);
const transaction = live.acceptVariant(preview, 'b', 'Component AST acceptance fixture', temp);
assert.strictEqual(transaction.componentNative, true);
assert.strictEqual(transaction.target, source);
assert(Object.values(transaction.componentTransform.changes).every(Boolean));
assert(transaction.componentTransform.impact.accessibility);
assert(transaction.componentTransform.impact.performance);
assert(transaction.componentTransform.impact.proofProvenance);
const transformed = fs.readFileSync(source, 'utf8');
assert(transformed.includes('data-slot="copy"'));
assert(transformed.includes('data-proof-placement="before-copy"'));
assert(transformed.includes('data-direction="audience-led"'));
assert(transformed.includes('--designos-direction-gap'));
assert(transformed.includes('data-motion-graph='));
assert(transformed.indexOf('class="primary"') < transformed.indexOf('>Secondary</button>'));
const rollback = live.rollback(preview, temp);
assert.strictEqual(rollback.id, transaction.id);
assert.strictEqual(fs.readFileSync(source, 'utf8'), original);

fs.rmSync(temp, { recursive: true, force: true });
console.log('live-component: source-mapped AST transaction, build gate, acceptance and rollback clean');
