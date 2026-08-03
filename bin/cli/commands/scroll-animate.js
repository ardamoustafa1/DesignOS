'use strict';

const fs = require('fs');
const path = require('path');

const RECIPES = {
  'parallax-hero': ({ selector }) => `${selector}{view-timeline-name:--designos-parallax;view-timeline-axis:block}\n${selector}>[data-motion-layer]{animation:designos-parallax linear both;animation-timeline:--designos-parallax;animation-range:entry 0% exit 100%}\n@keyframes designos-parallax{from{transform:translate3d(0,-4%,0)}to{transform:translate3d(0,12%,0)}}`,
  'progress-indicator': ({ selector }) => `${selector}{transform:scaleX(0);transform-origin:0 50%;animation:designos-progress linear both;animation-timeline:scroll(root block)}\n@keyframes designos-progress{to{transform:scaleX(1)}}`,
  'section-reveal': ({ selector }) => `${selector}{opacity:0;transform:translate3d(0,16px,0);animation:designos-reveal linear both;animation-timeline:view();animation-range:entry 10% cover 28%}\n@keyframes designos-reveal{to{opacity:1;transform:none}}`,
};

function compileScrollRecipe(recipe, selector) {
  const body = RECIPES[recipe]({ selector });
  return `/* DesignOS ${recipe}: progressive enhancement; content remains complete without support. */\n@supports (animation-timeline:scroll()) {\n${body.split('\n').map(line=>`  ${line}`).join('\n')}\n}\n@media (prefers-reduced-motion:reduce) {\n  ${selector},${selector}>[data-motion-layer]{animation:none!important;transform:none!important;opacity:1!important}\n}\n`;
}

function execute(args, ctx) {
  const target = ctx.positionals(args)[0];
  const recipe = ctx.argValue(args, '--recipe', 'section-reveal');
  const selector = ctx.argValue(args, '--selector', recipe === 'progress-indicator' ? '.scroll-progress-bar' : '[data-scroll-animate]');
  if (!target) ctx.fail(`Usage: ${ctx.run} scroll-animate <target> --recipe <${Object.keys(RECIPES).join('|')}> [--selector <css>] [--out file.css]`);
  const absolute = path.resolve(ctx.cwd, target);
  if (!fs.existsSync(absolute)) ctx.fail(`Target not found: ${target}`);
  if (!RECIPES[recipe]) ctx.fail(`Unknown recipe "${recipe}". Available: ${Object.keys(RECIPES).join(', ')}`);
  const output = compileScrollRecipe(recipe, selector);
  const defaultOut = fs.statSync(absolute).isDirectory() ? path.join(absolute, 'designos-scroll.css') : path.join(path.dirname(absolute), `${path.basename(absolute, path.extname(absolute))}.scroll.css`);
  const file = path.resolve(ctx.cwd, ctx.argValue(args, '--out', defaultOut));
  fs.mkdirSync(path.dirname(file), { recursive: true });fs.writeFileSync(file, output);
  ctx.ok(`Generated ${recipe}: ${path.relative(ctx.cwd, file)}`);
  ctx.log(`Bind the recipe with selector ${selector}; the source target was not mutated.`);
}

module.exports = { RECIPES, compileScrollRecipe, execute };
