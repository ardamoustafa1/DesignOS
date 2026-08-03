'use strict';

/**
 * Heuristic source fingerprints for the eleven `motion/signature-moments.md` techniques,
 * keyed identically to `bin/library-data.js`'s MOTION_PRESETS ids. Used by
 * `check-signature-consistency.js` to answer one question: "does this page carry evidence
 * of a signature technique, and if so, which one?" — never "is this page beautiful."
 *
 * Fingerprints match the exact function/property names DesignOS's own recipes use
 * (`motion/signature-moments.md`). A hand-rolled implementation under different names
 * will not match — this is a heuristic over DesignOS's own code shape, not a general
 * animation classifier. Treat a miss as "no evidence found," never as "absent."
 */
const SIGNATURE_FINGERPRINTS = Object.freeze({
  'magnetic-button': { label: 'Magnetic button', patterns: [/\bfunction\s+magnetic\s*\(/, /\bSTRENGTH\s*=\s*0\.\d+/] },
  'text-scramble': { label: 'Text scramble', patterns: [/\bfunction\s+scramble\s*\(/, /CHARS\s*=\s*['"`]▓/] },
  'cursor-spotlight': { label: 'Cursor spotlight', patterns: [/\bfunction\s+spotlight\s*\(/, /--mx\b[\s\S]{0,80}--my\b/] },
  'tilt-3d': { label: '3D tilt', patterns: [/\bfunction\s+tilt\s*\(/, /--ry\b[\s\S]{0,80}--rx\b/, /\bMAX_DEG\s*=/] },
  'split-text-reveal': { label: 'Split-text reveal', patterns: [/\bfunction\s+splitWords\s*\(/, /class(?:Name)?=["'`][^"'`]*\bsplit\b/] },
  'scroll-story': { label: 'Scroll-driven storytelling', patterns: [/\bfunction\s+scene\s*\(/, /animation-timeline\s*:\s*view\(\)/] },
  odometer: { label: 'Odometer number morph', patterns: [/\bfunction\s+odometer\s*\(/, /class(?:Name)?=["'`][^"'`]*\bodo\b/] },
  'cursor-parallax': { label: 'Cursor parallax layers', patterns: [/\bfunction\s+parallax\s*\(/, /\bDEPTHS\s*=\s*\[/] },
  'noise-canvas': { label: 'Noise canvas field', patterns: [/\bfunction\s+noiseField\s*\(/, /hash\s*=\s*\(x,\s*y\)\s*=>/] },
  'liquid-morph': { label: 'Liquid / shared-element morph', patterns: [/class(?:Name)?=["'`][^"'`]*\bmorph\b/, /view-transition-name\s*:/] },
  'webgl-shader-field': { label: 'Raw WebGL shader field', patterns: [/\bfunction\s+shaderField\s*\(/, /getContext\(\s*['"`]webgl2['"`]/] },
});

/** Which technique ids (if any) a file's raw text shows evidence of. */
function detectSignatures(raw) {
  const hits = [];
  for (const [id, spec] of Object.entries(SIGNATURE_FINGERPRINTS)) {
    if (spec.patterns.some(re => re.test(raw))) hits.push(id);
  }
  return hits;
}

module.exports = { SIGNATURE_FINGERPRINTS, detectSignatures };
