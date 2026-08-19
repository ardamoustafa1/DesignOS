#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { inspectPortfolio } = require('./check-generation-contract');

const failedCv = `
  <main className="cv-container"><h1>Arda</h1><a href="#">LinkedIn</a>
  <p>hello@example.com</p><section>Experience at Tech Innovators Inc.</section></main>
  <style>:root{--font-sans:Inter,system-ui;--shadow-1:none;--shadow-2:none;--shadow-3:none}
  main{display:flex}.tag:hover{transform:translateY(-1px)}
  @media(prefers-reduced-motion:reduce){*{transition:none}}</style>`;
const failed = inspectPortfolio(failedCv);
assert.ok(failed.some(f => f.id === 'portfolio-fake-identity'));
assert.ok(failed.some(f => f.id === 'portfolio-no-inspectable-work'));
assert.ok(failed.some(f => f.id === 'portfolio-motion-orchestra-incomplete'));

const flagship = `
  <main><section class="wide-section selected-work"><article data-project>Case study</article>
  <article class="project-card" data-project>Case study</article></section></main>
  <style>:root{--font-display:"Sora Variable";--shadow-1:x;--shadow-2:x;--shadow-3:x}
  body{background-image:url(noise.svg)}.grid{display:grid}.rail{position:sticky}.hero{display:flex}
  @keyframes arrival{to{opacity:1}}.card:hover{transform:translateY(-4px)}
  @media(prefers-reduced-motion:reduce){*{animation:none}}</style>
  <script>new IntersectionObserver(()=>{}); document.startViewTransition?.(()=>{});</script>`;
assert.deepStrictEqual(inspectPortfolio(flagship), []);
console.log('generation contract: 2/2 passed');
