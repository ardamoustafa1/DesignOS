'use strict';

const { PATTERNS, searchPatterns, getPattern } = require('../../../runtime/pattern-atlas');

function execute(args, context) {
  const id = context.argValue(args, '--id', '');
  const query = context.positionals(args).join(' ');
  const options = {
    category: context.argValue(args, '--category', ''),
    intensity: context.argValue(args, '--motion', ''),
    limit: context.argValue(args, '--limit', '8'),
  };
  const patterns = id ? [getPattern(id)].filter(Boolean) : searchPatterns(query, options);
  if (id && patterns.length === 0) context.fail(`atlas: unknown pattern "${id}"`);
  if (args.includes('--json')) {
    console.log(JSON.stringify({ query, filters: options, totalPatterns: PATTERNS.length, patterns }, null, 2));
    return;
  }
  context.log(`\n  DesignOS Pattern Atlas · ${patterns.length}/${PATTERNS.length} result(s)\n`);
  for (const pattern of patterns) {
    context.log(`  ${pattern.id} · ${pattern.category}/${pattern.scale} · motion ${pattern.intensity[0]}–${pattern.intensity[1]}`);
    context.log(`    Intent: ${pattern.intent}`);
    context.log(`    Product truth: ${pattern.productTruth}`);
    context.log(`    Earned when: ${pattern.earnedWhen.join('; ')}`);
    context.log(`    Avoid when: ${pattern.avoidWhen.join('; ')}`);
    context.log(`    Reduced motion: ${pattern.reducedMotion}`);
    context.log(`    Budget: ${pattern.performance.maxDurationMs}ms · ${pattern.performance.properties.join(', ')}\n`);
  }
  if (!patterns.length) context.warn('No pattern matched. Broaden the query or remove category/motion filters.');
}

module.exports = { execute };
