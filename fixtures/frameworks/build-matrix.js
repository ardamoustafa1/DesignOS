#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { compile } = require('svelte/compiler');
const { RECIPES, STACKS, adapterSource } = require('../../runtime/motion/recipes');

const ROOT = path.resolve(__dirname, '../..');
const MATRIX = path.join(ROOT, 'fixtures/frameworks');
const DIST = path.join(MATRIX, 'dist');
const stacks = ['vanilla', 'react', 'motion', 'gsap', 'vue', 'svelte'];

async function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  let emittedAdapters = 0;
  for (const recipe of RECIPES) for (const stack of STACKS) {
    await esbuild.build({
      stdin: {
        contents: adapterSource(recipe.id, stack),
        resolveDir: ROOT,
        sourcefile: `generated/${recipe.id}.${stack}.js`,
        loader: 'js',
      },
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      write: false,
      logLevel: 'silent',
    });
    emittedAdapters += 1;
  }
  for (const stack of stacks) {
    const out = path.join(DIST, stack);
    fs.mkdirSync(out, { recursive: true });
    const plugins = [];
    if (stack === 'svelte') plugins.push({
      name: 'svelte',
      setup(builder) {
        builder.onLoad({ filter: /\.svelte$/ }, async args => {
          const source = fs.readFileSync(args.path, 'utf8');
          const compiled = compile(source, { filename: args.path, generate: 'client', dev: false });
          return { contents: compiled.js.code, loader: 'js' };
        });
      },
    });
    await esbuild.build({
      entryPoints: [path.join(MATRIX, stack, stack === 'svelte' ? 'entry.js' : stack === 'react' || stack === 'motion' ? 'entry.jsx' : 'entry.js')],
      outfile: path.join(out, 'bundle.js'),
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      plugins,
      sourcemap: true,
    });
    const sourceMarker = stack === 'vanilla' || stack === 'gsap'
      ? ` data-designos-source="fixtures/frameworks/${stack}/entry.js:2:1"` : '';
    const button = stack === 'vanilla' || stack === 'gsap'
      ? `<button id="run" data-complete="false"${sourceMarker}>${stack} motion fixture</button>` : '';
    fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${stack} fixture</title><style>button{min-width:56px;min-height:56px;transition:transform 120ms ease-out}:focus-visible{outline:2px solid #075985;outline-offset:3px}@media(prefers-reduced-motion:reduce){button{transition:none}}</style><body><main id="app">${button}</main><script src="bundle.js"></script></body></html>`);
  }
  console.log(`framework-build: ${emittedAdapters} emitted adapters compiled + ${stacks.length} real packages bundled with source maps`);
}
build().catch(error => { console.error(error); process.exit(1); });
