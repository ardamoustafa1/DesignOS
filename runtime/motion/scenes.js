'use strict';

const { getRecipe } = require('./catalog');

const SCENES = Object.freeze([
  ['kinetic-editorial-hero', 'hero', ['word-cascade', 'line-mask-rise', 'depth-parallax', 'magnetic-intent']],
  ['cinematic-product-stage', 'hero', ['image-curtain', 'product-orbit', 'light-sweep', 'scroll-progress']],
  ['inspectable-case-study', 'scroll', ['sticky-chapter', 'image-curtain', 'chapter-handoff', 'cursor-spotlight']],
  ['horizontal-project-ribbon', 'scroll', ['horizontal-story', 'filmstrip-cascade', 'cursor-parallax', 'project-zoom']],
  ['spatial-product-tour', 'scroll', ['depth-journey', 'camera-dolly', 'focus-pull', 'chapter-handoff']],
  ['editorial-portfolio-grid', 'content', ['section-reveal', 'mask-wipe', 'hover-depth-stack', 'shared-element']],
  ['data-signal-story', 'content', ['data-trace', 'signal-pulse', 'odometer', 'sticky-chapter']],
  ['fluid-navigation', 'navigation', ['menu-takeover', 'character-flip', 'proximity-label', 'route-curtain']],
  ['vector-brand-reveal', 'hero', ['logo-assemble', 'path-draw', 'magnetic-intent', 'light-sweep']],
  ['particle-typography-stage', 'hero', ['particle-type', 'tracking-resolve', 'cursor-spotlight', 'section-reveal']],
  ['shader-gallery', 'media', ['shader-displacement', 'depth-gallery', 'inspection-lens', 'project-zoom']],
  ['conversion-finale', 'cta', ['kinetic-emphasis', 'magnetic-intent', 'success-confirmation', 'route-curtain']],
].map(([id, surface, recipes]) => Object.freeze({ id, surface, recipes, signature: recipes[0] })));

function getScene(id) { return SCENES.find(scene => scene.id === id) || null; }

function validateScene(scene) {
  const findings = [];
  if (!scene || !scene.id) findings.push({ code: 'scene-id-required' });
  if (!Array.isArray(scene?.recipes) || scene.recipes.length < 4) findings.push({ code: 'four-motion-roles-required' });
  for (const id of scene?.recipes || []) if (!getRecipe(id)) findings.push({ code: 'unknown-recipe', recipe: id });
  const roles = new Set((scene?.recipes || []).map(id => getRecipe(id)?.role).filter(Boolean));
  if (roles.size < 3) findings.push({ code: 'motion-role-diversity', actual: roles.size, minimum: 3 });
  return findings;
}

module.exports = { SCENES, getScene, validateScene };
