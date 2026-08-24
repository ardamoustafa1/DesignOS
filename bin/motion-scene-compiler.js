#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { getScene, validateScene } = require('../runtime/motion/scenes');
const { getRecipe } = require('../runtime/motion/catalog');
const { compileGenome } = require('../runtime/motion/genome');
const { browserRuntimeSource, BASE_CSS } = require('../runtime/motion/browser-runtime');

function compileScene({ sceneId, brief = '', seed = brief, intensity = 8 } = {}) {
  const genome = compileGenome({ brief, seed, intensity });
  const id = sceneId || genome.scenes[0];
  const scene = getScene(id);
  if (!scene) throw new Error(`Unknown MotionOS scene "${id}".`);
  const findings = validateScene(scene);
  if (findings.length) throw new Error(`Invalid scene: ${findings.map(item => item.code).join(', ')}`);
  return {
    schema: 1, scene, genome,
    recipes: scene.recipes.map(getRecipe),
    engines: {
      webgl: 'runtime/motion/engines/webgl.js',
      three: 'runtime/motion/engines/three-scene.js',
      rive: 'runtime/motion/engines/rive-state.js',
      svgMorph: 'runtime/motion/engines/svg-morph.js',
      routeTransition: 'runtime/motion/engines/route-transition.js',
      assets: 'runtime/motion/asset-pipeline.js',
    },
    contract: { roles: [...new Set(scene.recipes.map(id => getRecipe(id).role))], reducedMotion: true, cleanup: true, nativeScroll: true },
    css: BASE_CSS,
    javascript: browserRuntimeSource(),
  };
}

function main() {
  const args = process.argv.slice(2); const value = (name, fallback='') => { const i=args.indexOf(name); return i>=0?args[i+1]:fallback; };
  const result = compileScene({ sceneId: value('--scene'), brief: value('--brief'), seed: value('--seed'), intensity: value('--intensity', 8) });
  const out = value('--out');
  if (out) { const file=path.resolve(out);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');console.log(`motion-scene: ${result.scene.id} → ${path.relative(process.cwd(),file)}`); }
  else console.log(JSON.stringify(result,null,2));
}
if(require.main===module){try{main()}catch(error){console.error(error.message);process.exit(1)}}
module.exports={compileScene};
