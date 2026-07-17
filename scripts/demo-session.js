#!/usr/bin/env node
/**
 * Deterministic launch demo transcript.
 *
 * This is intentionally zero-dependency. Record it with any terminal recorder:
 *   node scripts/demo-session.js
 *
 * Suggested capture:
 * - 1280x720 terminal
 * - 18-22pt monospace
 * - dark background
 * - crop to terminal only
 */
const lines = [
  ['$ ', 'Design a pricing page for a cybersecurity SaaS. Dark theme.'],
  ['\nDesignOS ', 'kernel v2.0.2 booting...'],
  ['route ', 'patterns/pricing.md + industries/cybersecurity.md + components/cards.md'],
  ['load ', 'memory/brand.md + memory/design.md + memory/pages.md'],
  ['loop ', 'research -> wireframe -> ui -> review -> a11y -> perf -> seo'],
  ['review ', 'UI Craft 91: pricing cards lack hierarchy; redo required'],
  ['fix ', 'tightened tier contrast, clearer primary CTA, removed unverified metric'],
  ['a11y ', 'body contrast 4.2:1 failed; raised muted text to 6.28:1'],
  ['score ', 'UI 96 · UX 97 · A11y 96 · Perf 97 · Modernity 96 · Conversion 95'],
  ['ship ', 'all gates >= 95; decision log written to memory/design.md'],
  ['\nopen ', 'examples/showcase-relay-pricing.html'],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function type(text, delay = 18) {
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(ch === '\n' ? 180 : delay);
  }
}

async function main() {
  process.stdout.write('\x1b[2J\x1b[H');
  for (const [label, text] of lines) {
    process.stdout.write(label);
    await type(text);
    process.stdout.write('\n');
    await sleep(360);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
