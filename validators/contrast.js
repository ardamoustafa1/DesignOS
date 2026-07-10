#!/usr/bin/env node
/**
 * WCAG 2.x contrast-ratio calculator.
 *
 *   node contrast.js <fg-hex> <bg-hex> [--min 4.5]
 *
 * Exit 0 if ratio >= min, 1 otherwise. Defaults: --min 4.5 (AA body text).
 * Use --min 3 for large text / UI components (accessibility.md thresholds).
 */
const args = process.argv.slice(2);
const minIdx = args.indexOf('--min');
const min = minIdx > -1 ? parseFloat(args[minIdx + 1]) : 4.5;
const positional = minIdx > -1 ? args.filter((a, i) => i !== minIdx && i !== minIdx + 1) : args;
const hexes = positional.filter(a => /^#?[0-9a-fA-F]{3,8}$/.test(a));

if (hexes.length !== 2) {
  console.error('usage: contrast.js <fg-hex> <bg-hex> [--min 4.5]');
  process.exit(2);
}

function parse(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    console.error(`invalid hex: ${hex}`);
    process.exit(2);
  }
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance([r, g, b]) {
  const lin = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const [l1, l2] = hexes.map(h => luminance(parse(h))).sort((a, b) => b - a);
const ratio = (l1 + 0.05) / (l2 + 0.05);
const rounded = Math.round(ratio * 100) / 100;

const verdicts = [
  ['AA body (4.5:1)', ratio >= 4.5],
  ['AA large/UI (3:1)', ratio >= 3],
  ['AAA body (7:1)', ratio >= 7],
];
console.log(`${hexes[0]} on ${hexes[1]} → ${rounded}:1`);
verdicts.forEach(([label, pass]) => console.log(`  ${pass ? '✓' : '✗'} ${label}`));

process.exit(ratio >= min ? 0 : 1);
