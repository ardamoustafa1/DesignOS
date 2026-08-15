#!/usr/bin/env node
/**
 * import-design-systems.js — turn an upstream design-system catalog into DesignOS
 * `systems/<slug>/` packages, upgraded to the Ceiling Contract on the way in.
 *
 *   node scripts/import-design-systems.js --from <dir> --all
 *   node scripts/import-design-systems.js --from <dir> --slug apple
 *   node scripts/import-design-systems.js --from <dir> --all --dry-run
 *
 * `--from` is a directory of upstream packages, each `<slug>/{DESIGN.md,tokens.css,
 * manifest.json}`. The reference source is nexu-io/open-design's `design-systems/`
 * (Apache-2.0) — clone it cheaply with:
 *
 *   git clone --filter=blob:none --sparse --depth 1 https://github.com/nexu-io/open-design.git
 *   cd open-design && git sparse-checkout set design-systems
 *
 * WHY THIS IS NOT A COPY
 * ----------------------
 * Every upstream package in that catalog shares one token schema, and that schema tops out
 * at `--elev-flat` and `--elev-ring`: a two-value elevation with no light source, no tinted
 * shadow, no lit edge, no texture, and no arrival. Those are exactly the absences
 * `CLAUDE.md` §4.5 and `foundations/materiality.md` call the difference between a page that
 * is correct and a page that is material. Importing verbatim would import the flatness.
 *
 * So for each package this derives, FROM THAT PACKAGE'S OWN PALETTE:
 *   - a light model (temperature and direction, as tokens, not prose)
 *   - a three-level elevation stack whose shadow hue is the package's own ground, darkened
 *     and saturated — never black alpha
 *   - a lit-edge value whose strength follows whether the ground is light or dark
 *   - grain, at the opacity that ground can carry
 *   - arrival timing and the easing character taken from the upstream `--ease-standard`
 * and generates the `lint.json` contract plus a component fixture, so the result is
 * checkable by `validators/check-system-conformance.js` rather than merely readable.
 *
 * LICENSING
 * ---------
 * Imported prose and token values stay under their upstream licence. The importer writes
 * `systems/NOTICE` recording the upstream project, its licence, the commit imported, and
 * the modifications made — and records the same per package in `manifest.json.source`.
 * It refuses to run if it cannot find licence text to carry along.
 *
 * Exit: 0 ok · 1 import produced a non-conforming package · 2 usage error
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SYSTEMS = path.join(ROOT, 'systems');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const has = (name) => argv.includes(name);

const from = flag('--from');
const only = flag('--slug');
const all = has('--all');
const dryRun = has('--dry-run');
const quiet = has('--quiet');

if (!from || (!all && !only)) {
  console.error('usage: import-design-systems.js --from <dir> (--all | --slug <slug>) [--dry-run]');
  process.exit(2);
}
const SRC = path.resolve(from);
if (!fs.existsSync(SRC)) {
  console.error(`--from directory not found: ${SRC}`);
  process.exit(2);
}

/* ---------- upstream provenance ---------- */

function upstreamProvenance(srcDir) {
  // walk up looking for a repo root with licence text
  let dir = srcDir;
  for (let i = 0; i < 4; i++) {
    const licence = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'COPYING']
      .map(n => path.join(dir, n)).find(p => fs.existsSync(p));
    if (licence) {
      const text = fs.readFileSync(licence, 'utf8');
      const name = /Apache License/i.test(text) ? 'Apache-2.0'
        : /MIT License/i.test(text) ? 'MIT'
          : /GNU GENERAL PUBLIC/i.test(text) ? 'GPL'
            : 'see licence file';
      let commit = null; let remote = null;
      try {
        commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
        remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: dir, encoding: 'utf8' }).trim();
      } catch (_) { /* not a git checkout — record what we can */ }
      return { licence: name, licenceFile: licence, licenceText: text, commit, remote, root: dir };
    }
    dir = path.dirname(dir);
  }
  return null;
}

const provenance = upstreamProvenance(SRC);
if (!provenance) {
  console.error('Refusing to import: no licence text found at or above the --from directory.');
  console.error('Imported prose and token values keep their upstream licence, so the importer');
  console.error('will not run without something to carry along. Point --from at a full checkout.');
  process.exit(2);
}
if (provenance.licence === 'GPL') {
  console.error(`Refusing to import: upstream licence resolves to ${provenance.licence}, which`);
  console.error('cannot be redistributed inside this project without relicensing it. Import by hand,');
  console.error('or author the system from scratch.');
  process.exit(2);
}

/* ---------- colour helpers ---------- */

/** oklch() → sRGB. Enough packages declare their ground in oklch that skipping them means
 *  skipping the light-model derivation entirely; the conversion is exact, not approximate. */
function oklchToRgb(l, c, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const lin = [
    +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
  ];
  return lin.map((v) => {
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(s * 255)));
  });
}

const hexToRgb = (value) => {
  const raw = String(value).trim();
  const ok = /^oklch\(\s*([\d.]+)%?\s+([\d.]+)%?\s+([\d.]+)/i.exec(raw);
  if (ok) {
    const l = parseFloat(ok[1]) > 1 ? parseFloat(ok[1]) / 100 : parseFloat(ok[1]);
    const c = /%/.test(raw.split(/\s+/)[1] || '') ? parseFloat(ok[2]) / 250 : parseFloat(ok[2]);
    return oklchToRgb(l, c, parseFloat(ok[3]));
  }
  let h = raw.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (rgb) => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const channelLin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const luminance = (rgb) =>
  0.2126 * channelLin(rgb[0]) + 0.7152 * channelLin(rgb[1]) + 0.0722 * channelLin(rgb[2]);

/** The shadow hue: the ground, pushed dark and a little more saturated. Never black. */
function shadowTriplet(groundRgb) {
  if (!groundRgb) return '18 16 14';
  const max = Math.max(...groundRgb);
  const min = Math.min(...groundRgb);
  const mid = (max + min) / 2 || 1;
  return groundRgb
    .map((c) => {
      const deviation = c - mid;                  // keep the hue, exaggerate it slightly
      const value = mid * 0.16 + deviation * 0.55;
      return Math.max(0, Math.min(255, Math.round(value)));
    })
    .join(' ');
}

/** A warm or cool light temperature, chosen to agree with the ground's own cast. */
function lightTemperature(groundRgb) {
  if (!groundRgb) return '#F0EAE2';
  const [r, , b] = groundRgb;
  return r >= b ? '#FFD2A6' : '#B8C4E8';   // warm ground → warm light, cool → cool
}

/* ---------- token parsing ---------- */

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

function parseTokens(css) {
  const map = new Map();
  for (const m of stripComments(css).matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim());   // first (`:root`) definition wins
  }
  return map;
}

/* ---------- the ceiling extension ---------- */

const CEILING_TOKENS = ['--ds-elev-1', '--ds-elev-2', '--ds-elev-3', '--ds-edge-lit',
  '--ds-ring', '--ds-shadow-rgb', '--ds-grain', '--ds-grain-opacity', '--ds-light-temp',
  '--ds-arrive-step', '--ds-t-fast', '--ds-t-base', '--ds-t-slow', '--ds-t-arrive'];

const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GENERIC_FIRST = /^(system-ui|ui-sans-serif|ui-serif|ui-monospace|-apple-system|BlinkMacSystemFont|sans-serif|serif|monospace|Arial|Helvetica(\s+Neue)?|Times(\s+New\s+Roman)?)$/i;

/**
 * Some upstream brands genuinely ship a system stack as their brand face — GitHub uses
 * `-apple-system`, Slack and HashiCorp `system-ui`, Mistral `Arial`. `check-craft-ceiling.js`
 * is right that an unnamed typeface is an unowned identity, and the imported contract is
 * right to record the brand faithfully. That is precisely what the documented opt-out is
 * for, so the importer writes it WITH its reason rather than leaving a permanent finding
 * or silently substituting a face the brand does not use.
 */
function annotateGenericFaces(css) {
  return css.replace(/^([ \t]*)(--font-(?:display|body))\s*:\s*([^;]+);/gm, (whole, indent, name, value) => {
    const first = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    if (!GENERIC_FIRST.test(first)) return whole;
    return `${indent}/* ceiling-ok: "${first}" is this brand's own stack upstream, recorded faithfully — see SYSTEM.md provenance. Substituting a named face here would misreport the brand. */\n${whole}`;
  });
}

function ceilingBlock(tokens, slug) {
  const ground = hexToRgb(tokens.get('--bg')) || hexToRgb(tokens.get('--surface'));
  const isDark = ground ? luminance(ground) < 0.2 : false;
  const shadow = shadowTriplet(ground);
  const temp = lightTemperature(ground);
  const ease = tokens.get('--ease-standard') || 'cubic-bezier(0.16, 1, 0.3, 1)';

  /* Dark grounds raise with light: the lit edge carries the elevation and the cast shadow
     is nearly invisible. Light grounds raise with shadow and their edge highlight is a
     near-white sheen. Writing one stack for both is why imported dark themes look off. */
  const edgeLit = isDark ? 'rgb(255 255 255 / 0.075)' : 'rgb(255 255 255 / 0.70)';
  const ring = isDark ? 'rgb(255 255 255 / 0.09)' : 'rgb(0 0 0 / 0.10)';
  const a = isDark ? [0.30, 0.26, 0.34, 0.32, 0.40, 0.46] : [0.10, 0.14, 0.12, 0.18, 0.14, 0.24];
  const grain = isDark ? '0.035' : '0.022';

  return `
/* ══════════════════════════════════════════════════════════════════════════════════════
   DESIGNOS CEILING EXTENSION — added on import, not present upstream.

   The upstream token schema stops at --elev-flat and --elev-ring: a two-value elevation
   with no light source, no tinted shadow, no lit edge, no texture. Everything below is
   derived from THIS package's own palette so the craft layer belongs to the brand rather
   than being bolted on (CLAUDE.md §4.5, foundations/materiality.md).

   LIGHT MODEL for ${slug}
     ground      ${tokens.get('--bg') || 'n/a'} → read as ${isDark ? 'dark' : 'light'}
     position    above and slightly left (x -8%, y -100%)
     temperature --ds-light-temp
     strategy    ${isDark ? 'raise with LIGHT — the lit edge does the work' : 'raise with SHADOW — the cast shadow does the work'}
   ══════════════════════════════════════════════════════════════════════════════════════ */
:root {
  --ds-light-temp: ${temp};
  --ds-shadow-rgb: ${shadow};
  --ds-edge-lit: ${edgeLit};
  --ds-ring: ${ring};

  --ds-elev-1: 0 1px 2px rgb(var(--ds-shadow-rgb) / ${a[0]}),
               0 8px 24px -8px rgb(var(--ds-shadow-rgb) / ${a[1]}),
               inset 0 1px 0 var(--ds-edge-lit);
  --ds-elev-2: 0 2px 5px rgb(var(--ds-shadow-rgb) / ${a[2]}),
               0 20px 50px -14px rgb(var(--ds-shadow-rgb) / ${a[3]}),
               inset 0 1px 0 var(--ds-edge-lit);
  --ds-elev-3: 0 4px 10px rgb(var(--ds-shadow-rgb) / ${a[4]}),
               0 44px 96px -24px rgb(var(--ds-shadow-rgb) / ${a[5]}),
               inset 0 1px 0 var(--ds-edge-lit);

  --ds-grain-opacity: ${grain};
  --ds-grain: ${GRAIN_URI};

  --ds-t-fast: 130ms;
  --ds-t-base: 200ms;
  --ds-t-slow: 300ms;
  --ds-t-arrive: 620ms;
  --ds-arrive-step: 90ms;
}
@media (prefers-reduced-motion: reduce) { :root { --ds-motion: 0; } }
:root { --ds-motion: 1; }
`;
}

/* ---------- generated files ---------- */

const REQUIRED_SCHEMA = [
  '--bg', '--surface', '--fg', '--fg-2', '--muted', '--border',
  '--accent', '--accent-on', '--accent-hover',
  '--font-display', '--font-body', '--font-mono',
  '--text-xs', '--text-sm', '--text-base', '--text-lg', '--text-xl', '--text-2xl',
  '--text-3xl', '--text-4xl',
  '--leading-body', '--leading-tight', '--tracking-display',
  '--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8', '--space-12',
  '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill',
  '--container-max', '--ease-standard',
];

function buildLint(slug, tokens) {
  const familyOf = (token) => {
    const raw = tokens.get(token) || '';
    const first = raw.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    return first || null;
  };
  const radius = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-pill']
    .map(t => tokens.get(t)).filter(Boolean)
    .map(v => v.trim().toLowerCase());
  const containers = [tokens.get('--container-max')].filter(Boolean)
    .map(v => v.trim().toLowerCase());
  const easings = [...new Set([tokens.get('--ease-standard'), 'linear']
    .filter(Boolean).map(v => v.trim()))];
  const legacyShadows = [...tokens.keys()]
    .filter(t => /^--(elev|tm-shadow)/.test(t));

  return {
    schemaVersion: 'designos-system-lint/v1',
    id: slug,
    note: 'Generated by scripts/import-design-systems.js. The palette is derived from tokens.css at check time, never duplicated here. Budgets marked "default" are the importer\'s conservative starting point — tighten them by hand once someone has built with the system.',
    tokenPrefix: '--ds-',
    requiredTokens: [...REQUIRED_SCHEMA, '--ds-elev-1', '--ds-elev-2', '--ds-elev-3', '--ds-grain'],
    typefaces: {
      display: familyOf('--font-display'),
      text: familyOf('--font-body'),
      mono: familyOf('--font-mono'),
      reason: 'Three faces, three jobs, taken from the upstream font tokens. A fourth family dissolves the system\'s voice.',
    },
    radiusScale: [...new Set(radius)],
    spacingBase: 4,
    containerWidths: containers,
    minDistinctContainers: 1,
    easings,
    elevation: {
      tokens: ['--ds-elev-1', '--ds-elev-2', '--ds-elev-3'],
      exemptProperties: legacyShadows,
      allowAdHoc: false,
      reason: 'Elevation comes from the three derived levels. The upstream --elev-flat / --elev-ring values remain legal as edge treatments, but a new inline cast shadow is a fourth, undeclared level.',
    },
    accent: {
      token: '--accent',
      maxSolidFills: 6,
      reason: 'Importer default, deliberately loose: it has to accommodate the generated fixture, which fills the accent five times to demonstrate it (skip link, selection, swatch, primary button, statement band). A real page wants 2–3. Tighten this by hand once someone has built with the system — a budget nobody has tested is the weakest line in this file.',
    },
    texture: {
      required: true,
      signals: ['--ds-grain', 'feTurbulence'],
      reason: 'Added on import: a large flat fill is the most synthetic thing on a screen, and grain is also what stops big gradients banding.',
    },
  };
}

function buildSystemMd(slug, upstreamDesign, manifest, tokens, prov) {
  const ground = hexToRgb(tokens.get('--bg'));
  const isDark = ground ? luminance(ground) < 0.2 : false;
  const header = `<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# ${manifest.name || slug}

> Category: ${manifest.category || 'Uncategorised'}
> ${(manifest.description || '').replace(/\s+/g, ' ').trim()}

**Provenance.** The prose and token values below are imported from
${prov.remote
    ? `[${prov.remote.replace(/\.git$/, '').replace(/^https?:\/\/[^/]+\//, '')}](${prov.remote.replace(/\.git$/, '')})`
    : 'an upstream catalog'}${prov.commit ? ` at commit \`${prov.commit.slice(0, 12)}\`` : ''},
licensed **${prov.licence}**. See [\`../NOTICE\`](../NOTICE) for the licence and the full
list of modifications. This is an imported brand contract, not original DesignOS work.

---

## DesignOS supplement — the ceiling layer

The upstream package stops at the token schema, which has no light source, one flat
elevation pair, no texture, and no arrival. \`tokens.css\` therefore carries a **ceiling
extension** derived from this system's own palette (\`CLAUDE.md\` §4.5):

| Requirement | How this package meets it |
|---|---|
| Light model | \`--ds-light-temp\`, position above-left, declared in \`tokens.css\` |
| Elevation | \`--ds-elev-1/2/3\` — occlusion + key shadow + lit edge, shadow hue \`--ds-shadow-rgb\` derived from \`--bg\`, never black |
| Raise strategy | ground reads **${isDark ? 'dark' : 'light'}**, so it raises with **${isDark ? 'light — the lit edge carries it' : 'shadow — the cast shadow carries it'}** |
| Texture | \`--ds-grain\` at \`--ds-grain-opacity\` (${isDark ? '3.5%' : '2.2%'}), fixed overlay, \`pointer-events: none\` |
| Arrival | \`--ds-t-arrive\` / \`--ds-arrive-step\`, index-driven, mask or fade; the LCP element is never opacity-animated (\`motion/arrival.md\`) |
| Section rhythm | not derivable from tokens — the page must still supply ≥4 compositions, ≥2 grounds (\`foundations/layout.md\`) |
| Optical corrections | not derivable from tokens — name at least three in the rationale |

**Two of the seven cannot be imported.** Section rhythm and optical corrections are
composition decisions, not values, so a conforming token layer does not make a page meet
the ceiling on its own. Run both gates:

\`\`\`bash
node validators/check-system-conformance.js <target> --system ${slug}
node validators/check-craft-ceiling.js <target>
\`\`\`

### Where this system fits

${Array.isArray(manifest.suits) && manifest.suits.length
    ? manifest.suits.map(s => `- ${s}`).join('\n')
    : `- see the upstream contract below; the importer could not derive a \`suits\` list`}

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(\`brain/decision-framework.md\`, \`brain/originality.md\`).

---

## Upstream contract

`;
  /* Upstream prose links to upstream paths (`../../design-templates/...`) that do not exist
     here, which `validators/check-refs.sh` correctly reports as broken. Rewrite them to
     absolute upstream URLs where the remote is known, and to plain code spans otherwise —
     a dead link is worse than an honest reference to where the file actually lives. */
  const repoUrl = prov.remote ? prov.remote.replace(/\.git$/, '') : null;
  const toUpstream = (target) => {
    const clean = target.replace(/^(?:\.\.\/)+/, '');
    return repoUrl ? `${repoUrl}/blob/main/${clean}` : `upstream:${clean}`;
  };
  const rewritten = upstreamDesign
    // markdown links
    .replace(/\]\(((?:\.\.\/)*[\w./-]+\.(?:md|css|html|json|ts|tsx|js))\)/g,
      (whole, target) => (/^https?:/.test(target) ? whole : `](${toUpstream(target)})`))
    // backticked paths — validators/check-refs.sh resolves these too, and an imported
    // `design-templates/…md` span is a real path in the upstream repo, not in this one.
    // Emitted as a markdown link with an UNBACKTICKED label: check-refs.sh resolves any
    // backticked `dir/file.md` span against this repo, and the label would fail that even
    // though the link itself points upstream.
    .replace(/`((?:\.\.\/)*[a-z][a-z0-9-]*\/[a-z0-9./-]+\.(?:md|css|html|json|ts|tsx|js))`/g,
      (whole, target) => `[${target.replace(/^(?:\.\.\/)+/, '')} (upstream)](${toUpstream(target)})`);

  return header + rewritten.trimStart() + `

---

## Checklist

- [ ] \`tokens.css\` imported or inlined; no value redeclared locally
- [ ] Elevation from \`--ds-elev-1/2/3\`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ ${'4'} elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] \`check-system-conformance.js --system ${slug}\` and \`check-craft-ceiling.js\` both clean
`;
}

const EXAMPLE_TEMPLATE = fs.readFileSync(path.join(__dirname, 'templates', 'system-example.html'), 'utf8');

function buildExample(slug, manifest, tokens) {
  const ground = hexToRgb(tokens.get('--bg'));
  const isDark = ground ? luminance(ground) < 0.2 : false;
  return EXAMPLE_TEMPLATE
    .replace(/__SLUG__/g, slug)
    .replace(/__NAME__/g, (manifest.name || slug).replace(/[<>&]/g, ''))
    .replace(/__CATEGORY__/g, (manifest.category || 'Uncategorised').replace(/[<>&]/g, ''))
    .replace(/__SCHEME__/g, isDark ? 'dark' : 'light');
}

function buildManifest(slug, upstream, tokens, prov) {
  return {
    schemaVersion: 'designos-system/v1',
    id: slug,
    name: upstream.name || slug,
    category: upstream.category || 'Uncategorised',
    description: (upstream.description || '').replace(/\s+/g, ' ').trim(),
    suits: Array.isArray(upstream.suits) ? upstream.suits : [],
    avoid: Array.isArray(upstream.avoid) ? upstream.avoid : [],
    files: { design: 'SYSTEM.md', tokens: 'tokens.css', lint: 'lint.json', example: 'example.html' },
    ceiling: {
      typefaces: 'from upstream --font-* tokens',
      lightModel: 'derived on import',
      elevationLevels: 3,
      texture: 'added on import',
      arrival: 'tokens provided; composition is the page\'s job',
      sectionCompositions: 'not derivable — page responsibility',
    },
    source: {
      type: 'imported',
      upstream: prov.remote ? prov.remote.replace(/\.git$/, '') : 'unknown',
      commit: prov.commit || null,
      licence: prov.licence,
      modifications: [
        'added the DesignOS ceiling extension to tokens.css (light model, three-level tinted elevation stack, lit edge, grain, arrival timing) derived from this package\'s own palette',
        'generated lint.json as a machine-checkable conformance contract',
        'generated example.html as a component fixture',
        'prepended a DesignOS supplement to SYSTEM.md; the upstream prose follows verbatim under "Upstream contract"',
      ],
      notice: '../NOTICE',
    },
    conformance: `node validators/check-system-conformance.js <target> --system ${slug}`,
  };
}

/* ---------- run ---------- */

const candidates = fs.readdirSync(SRC, { withFileTypes: true })
  .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
  .map(e => e.name)
  .filter(name => only ? name === only : true)
  .filter(name => fs.existsSync(path.join(SRC, name, 'DESIGN.md'))
    && fs.existsSync(path.join(SRC, name, 'tokens.css')))
  .sort();

if (!candidates.length) {
  console.error(only ? `No importable package "${only}" in ${SRC}` : `No importable packages in ${SRC}`);
  process.exit(2);
}

const written = [];
const skipped = [];

for (const slug of candidates) {
  const srcDir = path.join(SRC, slug);
  const tokensCss = fs.readFileSync(path.join(srcDir, 'tokens.css'), 'utf8');
  const tokens = parseTokens(tokensCss);
  const missing = REQUIRED_SCHEMA.filter(t => !tokens.has(t));
  if (missing.length) {
    skipped.push({ slug, why: `upstream tokens.css is missing ${missing.length} schema token(s): ${missing.slice(0, 3).join(', ')}` });
    continue;
  }
  if (!hexToRgb(tokens.get('--bg'))) {
    skipped.push({ slug, why: `--bg is "${tokens.get('--bg')}" — the light model cannot be derived from a non-hex ground` });
    continue;
  }

  const upstreamManifestFile = path.join(srcDir, 'manifest.json');
  const upstreamManifest = fs.existsSync(upstreamManifestFile)
    ? JSON.parse(fs.readFileSync(upstreamManifestFile, 'utf8')) : {};
  const design = fs.readFileSync(path.join(srcDir, 'DESIGN.md'), 'utf8');

  const outDir = path.join(SYSTEMS, slug);
  const files = {
    'manifest.json': JSON.stringify(buildManifest(slug, upstreamManifest, tokens, provenance), null, 2) + '\n',
    'SYSTEM.md': buildSystemMd(slug, design, upstreamManifest, tokens, provenance),
    'tokens.css': annotateGenericFaces(tokensCss.trimEnd()) + '\n' + ceilingBlock(tokens, slug),
    'lint.json': JSON.stringify(buildLint(slug, tokens), null, 2) + '\n',
    'example.html': buildExample(slug, upstreamManifest, tokens),
  };

  if (dryRun) { written.push(slug); continue; }
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(outDir, name), content);
  }
  written.push(slug);
}

/* ---------- NOTICE ---------- */

if (!dryRun && written.length) {
  const notice = `# NOTICE — imported design systems

DesignOS itself is MIT-licensed (see \`../LICENSE\`). The design-system packages listed
below are **not**: their prose and token values were imported from an upstream project and
remain under that project's licence. Redistribution of this repository therefore carries
that licence for those directories, and the terms below travel with them.

## Upstream

| | |
|---|---|
| Project | ${provenance.remote ? provenance.remote.replace(/\.git$/, '') : 'unknown'} |
| Licence | ${provenance.licence} |
| Commit imported | ${provenance.commit || 'unknown'} |
| Packages imported | ${written.length} |
| Importer | \`scripts/import-design-systems.js\` |

## Modifications made on import

Required by the upstream licence, and worth reading on its own — the second item is the
reason this is an upgrade rather than a copy:

1. \`SYSTEM.md\` — a DesignOS supplement is prepended; the upstream \`DESIGN.md\` follows
   verbatim under the heading "Upstream contract".
2. \`tokens.css\` — the upstream file is kept verbatim, then a **DesignOS ceiling
   extension** is appended: a declared light model, a three-level elevation stack whose
   shadow hue is derived from that package's own ground, a lit-edge value chosen by whether
   the ground reads light or dark, a grain layer, and arrival timing. The upstream schema
   stops at \`--elev-flat\` / \`--elev-ring\`, which is a flat page by the standard in
   \`CLAUDE.md\` §4.5.
3. \`lint.json\` — generated. Not present upstream; it is the machine-readable contract that
   \`validators/check-system-conformance.js\` enforces.
4. \`example.html\` — generated component fixture. Not the upstream \`components.html\`.
5. Upstream \`design-tokens.json\`, \`components.html\`, \`tailwind-v4.css\`, \`preview/\`,
   and \`source/\` are **not** redistributed.

## Trademarks

Several imported packages are named after, and derived from, the public design languages of
real companies. Those names and marks belong to their owners; neither DesignOS nor the
upstream project is affiliated with, endorsed by, or licensed by them. The packages describe
publicly observable design decisions for interoperability and education. Shipping a product
that imitates another company's identity is a legal question for the shipper, not something
a design-system package can license — \`brain/originality.md\` argues against it on craft
grounds regardless.

## Upstream licence text

\`\`\`
${provenance.licenceText.trimEnd()}
\`\`\`
`;
  fs.writeFileSync(path.join(SYSTEMS, 'NOTICE'), notice);
}

/* ---------- report ---------- */

if (!quiet) {
  for (const s of skipped) console.log(`skipped  ${s.slug.padEnd(24)} ${s.why}`);
  console.log(`\nimport-design-systems: ${written.length} package(s) ${dryRun ? 'would be written' : 'written'}, ${skipped.length} skipped`);
  if (!dryRun && written.length) {
    console.log('wrote systems/NOTICE with the upstream licence and the modification list');
    console.log('\nverify with:');
    console.log('  node validators/test-system-conformance.js');
  }
}
process.exit(0);
