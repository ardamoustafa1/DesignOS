'use strict';

function execute(command, args, context) {
  const engines = require('../../intelligence');
  const handlers = {
    'motion-decide': engines.motionDecision,
    'motion-recipe': engines.motionRecipe,
    knowledge: engines.knowledge,
    coverage: engines.coverage,
    signature: engines.signature,
    compose: engines.composition,
    'asset-direct': engines.assetDirection,
  };
  try {
    handlers[command](args);
  } catch (error) {
    context.fail(error.message);
  }
}

module.exports = { execute };
