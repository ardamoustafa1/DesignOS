'use strict';

const fs = require('fs');
const path = require('path');

const STACKS = new Set(['vanilla', 'react', 'vue', 'svelte']);
const RECIPES = new Set(['magnetic-intent', 'cursor-spotlight', 'tilt']);

function runtime(recipe, selector) {
  const movement = recipe === 'tilt'
    ? "const rx=((.5-y/h)*8).toFixed(2);const ry=((x/w-.5)*8).toFixed(2);el.style.transform=`perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;"
    : recipe === 'cursor-spotlight'
      ? "el.style.setProperty('--intent-x',`${Math.round(x)}px`);el.style.setProperty('--intent-y',`${Math.round(y)}px`);"
      : "const dx=(x-w/2)*.16;const dy=(y-h/2)*.16;el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`;";
  const reset = recipe === 'cursor-spotlight'
    ? "el.style.removeProperty('--intent-x');el.style.removeProperty('--intent-y');"
    : "el.style.transform='';";
  return `function mountSignature(root=document){
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(pointer: fine)');
  const cleanups=[];
  root.querySelectorAll(${JSON.stringify(selector)}).forEach(el=>{
    let frame=0;
    const reset=()=>{cancelAnimationFrame(frame);${reset}};
    const move=event=>{
      if(media.matches||!fine.matches)return reset();
      const rect=el.getBoundingClientRect();const x=event.clientX-rect.left;const y=event.clientY-rect.top;const w=rect.width;const h=rect.height;
      cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{${movement}});
    };
    el.addEventListener('pointermove',move,{passive:true});el.addEventListener('pointerleave',reset);el.addEventListener('blur',reset);
    cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset);el.removeEventListener('blur',reset);reset();});
  });
  return ()=>cleanups.forEach(cleanup=>cleanup());
}`;
}

function compileSignature({ recipe, stack, selector }) {
  const core = runtime(recipe, selector);
  if (stack === 'vanilla') return `'use strict';\n${core}\nconst destroySignature=mountSignature();\nexport { mountSignature, destroySignature };\n`;
  if (stack === 'react') return `import { useEffect, useRef } from 'react';\n${core}\nexport function Signature(){const ref=useRef(null);useEffect(()=>mountSignature(ref.current),[]);return <div ref={ref}><button className=${JSON.stringify(selector.replace(/^\./,''))}>Interactive target</button></div>}\n`;
  if (stack === 'vue') return `<script setup>\nimport { onMounted,onBeforeUnmount,ref } from 'vue';\n${core}\nconst root=ref(null);let destroy=()=>{};onMounted(()=>{destroy=mountSignature(root.value)});onBeforeUnmount(()=>destroy());\n<\/script>\n<template><div ref="root"><button class=${JSON.stringify(selector.replace(/^\./,''))}>Interactive target</button></div></template>\n`;
  return `<script>\n  import { onMount } from 'svelte';\n  ${core}\n  let root;onMount(()=>mountSignature(root));\n<\/script>\n<div bind:this={root}><button class=${JSON.stringify(selector.replace(/^\./,''))}>Interactive target</button></div>\n`;
}

function execute(args, ctx) {
  const recipe = ctx.positionals(args)[0];
  const stack = ctx.argValue(args, '--stack', 'vanilla').toLowerCase();
  const selector = ctx.argValue(args, '--selector', '.signature-target');
  if (!recipe) ctx.fail(`Usage: ${ctx.run} signature-compile <${[...RECIPES].join('|')}> --stack <${[...STACKS].join('|')}> [--selector .target] [--out file]`);
  if (!RECIPES.has(recipe)) ctx.fail(`Unknown signature recipe "${recipe}". Available: ${[...RECIPES].join(', ')}`);
  if (!STACKS.has(stack)) ctx.fail(`Unsupported stack "${stack}". Available: ${[...STACKS].join(', ')}`);
  if (!/^[.#\[][\w\-.:#=\"'\] ]+$/.test(selector)) ctx.fail('Selector contains unsupported characters; use a class, id, or simple attribute selector.');
  const code = compileSignature({ recipe, stack, selector });
  const out = ctx.argValue(args, '--out', '');
  if (out) {
    const file = path.resolve(ctx.cwd, out);fs.mkdirSync(path.dirname(file), { recursive: true });fs.writeFileSync(file, code);ctx.ok(`Compiled ${recipe} for ${stack}: ${path.relative(ctx.cwd, file)}`);
  } else process.stdout.write(code);
}

module.exports = { STACKS, RECIPES, compileSignature, execute };
