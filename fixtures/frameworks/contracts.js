'use strict';

const STACKS = Object.freeze(['vanilla', 'react', 'motion', 'gsap', 'vue', 'svelte']);
const MOTION_MODES = Object.freeze(['no-preference', 'reduce']);
const ASSERTIONS_PER_MODE = Object.freeze({ 'no-preference': 20, reduce: 19 });
const SOURCE_MAP_ASSERTIONS = 3;

function matrixCounts(recipeCount) {
  const fixtureCount = recipeCount * STACKS.length * MOTION_MODES.length;
  const browserAssertions = recipeCount * STACKS.length
    * MOTION_MODES.reduce((sum, mode) => sum + ASSERTIONS_PER_MODE[mode], 0);
  return {
    fixtureCount,
    browserAssertions,
    sourceMapAssertions: SOURCE_MAP_ASSERTIONS,
  };
}

module.exports = { STACKS, MOTION_MODES, ASSERTIONS_PER_MODE, SOURCE_MAP_ASSERTIONS, matrixCounts };
