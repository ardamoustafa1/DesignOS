/**
 * designos imagegen — Image Generation Skills (Web, Mobile, Brandkit)
 *
 * Simulates an image generation pipeline (or generates highly optimized prompts
 * for DALL-E 3 / Midjourney) to create reference boards.
 *
 * Usage:
 *   designos imagegen-web "SaaS dashboard dark theme"
 *   designos imagegen-mobile "Fintech onboarding"
 *   designos imagegen-brandkit "Cybersecurity startup"
 */

'use strict';
const path = require('path');
const fs = require('fs');

function buildPrompt(type, brief) {
  const base = "High-resolution, ultra-premium UI design mockup on Dribbble/Behance style, perfect lighting, clean aesthetics.";
  
  if (type === 'imagegen-web') {
    return \`\${base} A modern desktop web application interface for "\${brief}". Show a detailed layout with sidebar navigation, complex data tables or cards, subtle glassmorphism, and a cohesive color palette. The UI should look like it was designed by Stripe, Linear, or Vercel. Highly detailed, sharp, professional.\`;
  }
  if (type === 'imagegen-mobile') {
    return \`\${base} A modern iOS mobile app interface for "\${brief}". Show 2-3 screen variants side-by-side (e.g. home screen, detailed view, onboarding). Use native Apple HIG inspired paradigms, smooth gradients, large typography, and accessible contrast. Highly detailed, sharp, professional.\`;
  }
  if (type === 'imagegen-brandkit') {
    return \`\${base} A comprehensive brand identity kit for "\${brief}". Include a modern minimalist logo, typography hierarchy, primary and secondary color palette swatches, and small UI element snippets (buttons, badges). Layout presented neatly on a dark or neutral background. Highly detailed, professional.\`;
  }
  return brief;
}

function execute(cmd, args, ctx) {
  const { cwd, ok, log, warn, fail } = ctx;
  const brief = args.filter(a => !a.startsWith('--')).join(' ').trim();
  
  if (!brief) {
    fail(\`Usage: designos \${cmd} "<brief>"\`);
  }

  const prompt = buildPrompt(cmd, brief);
  const outName = \`designos-image-prompt-\${Date.now()}.md\`;
  const outPath = path.resolve(cwd, outName);

  const content = [
    \`# DesignOS Image Generation Pipeline (\${cmd})\`,
    '',
    \`**Brief:** \${brief}\`,
    '',
    \`## 1. Reference Generation Prompt\`,
    'Use this prompt in Midjourney, DALL-E 3, or ChatGPT to generate your reference board:',
    '',
    \`> \${prompt}\`,
    '',
    \`## 2. Extraction & Implementation Pipeline\`,
    'Once the image is generated and you select a winning direction, save the image (e.g., \`reference.png\`) and run the token extractor:',
    '',
    \`\`\`bash\`,
    \`designos extract-tokens reference.png --out theme-tokens.css\`,
    \`\`\`\`,
    '',
    'The extractor will analyze the image, pull out the dominant HSL palette, and convert it into a DesignOS-compatible CSS custom property structure.',
  ].join('\\n');

  fs.writeFileSync(outPath, content);

  console.log('\\n  \\x1b[1mDesignOS Image Pipeline Initiated\\x1b[0m\\n');
  console.log(\`  Target: \${cmd}\`);
  console.log(\`  Brief:  \${brief}\\n\`);
  ok(\`Pipeline instructions and prompt written to: \${outName}\`);
  log('Feed the prompt to your image generator, then use `designos extract-tokens` on the result.');
}

module.exports = { execute };
