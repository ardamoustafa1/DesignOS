/**
 * designos prototype — A/B UI Denemesi
 *
 * emilkowalski's prototype skill inspired tool.
 * Generates an HTML skeleton with a built-in switcher to view 3-5 different visual variants
 * of the same UI component or section.
 *
 * Usage:
 *   designos prototype "pricing card" --variants 4
 */

'use strict';
const fs = require('fs');
const path = require('path');

function execute(args, ctx) {
  const { cwd, ok, log, fail, argValue } = ctx;
  const targetName = args.filter(a => !a.startsWith('--')).join(' ').trim();
  const variants = parseInt(argValue(args, '--variants', '3'), 10);

  if (!targetName) {
    fail('Usage: designos prototype "<component name>" [--variants 3]');
  }

  const safeName = targetName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const outPath = path.resolve(cwd, `prototype-${safeName}.html`);

  const variantStyles = [
    `/* Variant 1: Minimal & Clean */
[data-variant="1"] .prototype-target {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  box-shadow: none;
  border-radius: var(--radius-sm);
}`,
    `/* Variant 2: Elevated & Soft */
[data-variant="2"] .prototype-target {
  background: var(--bg-surface-raised);
  border: 1px solid transparent;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.08);
  border-radius: var(--radius-lg);
}`,
    `/* Variant 3: High Contrast / Bold */
[data-variant="3"] .prototype-target {
  background: var(--text-primary);
  color: var(--bg-page);
  border: 2px solid var(--accent);
  box-shadow: 8px 8px 0 var(--accent);
  border-radius: 0;
}`,
    `/* Variant 4: Glassmorphism */
[data-variant="4"] .prototype-target {
  background: rgb(255 255 255 / 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 0.2);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.1);
  border-radius: var(--radius-xl);
}`,
    `/* Variant 5: Brutalist */
[data-variant="5"] .prototype-target {
  background: var(--bg-page);
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  border-radius: 0;
  text-transform: uppercase;
}`
  ].slice(0, variants).join('\n\n');

  const variantButtons = Array.from({ length: variants }, (_, i) =>
    `<button class="switcher-btn" data-set="${i + 1}">Variant ${i + 1}</button>`
  ).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Prototype: ${targetName}</title>
<style>
  :root {
    --bg-page: #ffffff; --bg-surface: #f8fafc; --bg-surface-raised: #ffffff;
    --text-primary: #09090b; --text-secondary: #3f3f46; --border-default: #e4e4e7;
    --accent: #10b981; --radius-sm: 6px; --radius-lg: 12px; --radius-xl: 20px;
    font-family: system-ui, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-page: #09090b; --bg-surface: #18181b; --bg-surface-raised: #27272a;
      --text-primary: #fafafa; --text-secondary: #a1a1aa; --border-default: #3f3f46;
    }
  }
  body { background: var(--bg-page); color: var(--text-secondary); margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: background 0.3s; }
  
  /* Switcher UI */
  .switcher { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--bg-surface-raised); border: 1px solid var(--border-default); padding: 8px; border-radius: 99px; display: flex; gap: 8px; box-shadow: 0 12px 24px rgb(0 0 0 / 0.1); z-index: 100; }
  .switcher-btn { appearance: none; border: none; background: transparent; color: var(--text-secondary); padding: 8px 16px; border-radius: 99px; cursor: pointer; font-weight: 500; font-size: 14px; transition: 0.2s; }
  .switcher-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
  .switcher-btn.active { background: var(--text-primary); color: var(--bg-page); }

  /* Base Target Styles */
  .prototype-target {
    padding: 32px;
    width: 320px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .prototype-target h2 { color: inherit; margin: 0 0 8px; }
  
  ${variantStyles}
</style>
</head>
<body data-variant="1">

  <!-- THE TARGET COMPONENT -->
  <div class="prototype-target">
    <h2>${targetName}</h2>
    <p>This is a placeholder for the component you are prototyping. Apply your HTML structure here.</p>
  </div>

  <!-- SWITCHER CONTROL -->
  <div class="switcher">
    ${variantButtons}
  </div>

<script>
  const body = document.body;
  const btns = document.querySelectorAll('.switcher-btn');
  btns[0].classList.add('active');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      body.setAttribute('data-variant', btn.getAttribute('data-set'));
    });
  });
</script>
</body>
</html>`;

  fs.writeFileSync(outPath, htmlContent);
  ok(`Prototype environment created: ${path.relative(cwd, outPath)}`);
  log(`Open the file in a browser and add your HTML structure inside .prototype-target.`);
  log(`The file contains ${variants} CSS variant blocks ready for your design exploration.`);
}

module.exports = { execute };
