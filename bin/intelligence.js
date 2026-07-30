'use strict';

const fs = require('fs');
const path = require('path');
const { RULES } = require('../validators/rule-registry');
const { RECIPES, STACKS, adapterSource } = require('../runtime/motion/recipes');
const { compileMotionSemantics } = require('../runtime/motion/semantics');
const { verifyExternalRegistry } = require('./external-eval');

const ROOT = path.resolve(__dirname, '..');
const value = (args, name, fallback = '') => {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1) || fallback;
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};
const positionals = args => {
  const valueFlags = new Set(['--frequency', '--purpose', '--initiator', '--interruptibility', '--cost', '--motion',
    '--material', '--audience', '--belief', '--variance', '--density', '--sector', '--platform', '--state', '--stack',
    '--evidence', '--out', '--role', '--surface', '--mode', '--aspect', '--component', '--transition', '--modality',
    '--geometry', '--preference', '--device-power', '--importance']);
  const out = [];
  for (let index = 0; index < args.length; index++) {
    if (!args[index].startsWith('--')) out.push(args[index]);
    else if (valueFlags.has(args[index])) index++;
  }
  return out;
};
const write = (payload, args) => {
  const output = value(args, '--out');
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  if (output) {
    const file = path.resolve(process.cwd(), output);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text + '\n');
    console.log(`Written ${path.relative(process.cwd(), file)}`);
  } else console.log(text);
  return payload;
};
const clampDial = input => Math.max(1, Math.min(10, Number(input) || 5));
const tokens = input => String(input).toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 1);

function motionDecision(args) {
  const interaction = positionals(args).join(' ') || 'interaction';
  const geometry = value(args, '--geometry', '0x0,0');
  const result = compileMotionSemantics({
    componentType: value(args, '--component', interaction),
    stateTransition: value(args, '--transition', value(args, '--purpose', 'update')),
    frequency: value(args, '--frequency', 'medium'),
    inputModality: value(args, '--modality', value(args, '--initiator', 'pointer')),
    geometry,
    motionIntensity: value(args, '--motion', '4'),
    userPreference: value(args, '--preference', 'full'),
    devicePower: value(args, '--device-power', 'medium'),
    semanticImportance: value(args, '--importance', 'normal'),
  });
  result.interaction = interaction;
  result.module = 'motion/decision-engine.md + runtime/motion/semantics.js';
  return write(result, args);
}

const COMPOSITIONS = [
  { id: 'editorial-offset', variance: [5, 9], density: [2, 6], surfaces: ['marketing', 'blog', 'portfolio'], rule: 'One stable reading edge; one intentional offset.' },
  { id: 'split-narrative', variance: [3, 7], density: [3, 7], surfaces: ['marketing', 'product'], rule: 'Claim on one side, inspectable material on the other.' },
  { id: 'sticky-product-tour', variance: [4, 8], density: [4, 7], surfaces: ['marketing', 'docs'], rule: 'Sticky artifact; sections change its state without scroll-jacking.' },
  { id: 'horizontal-chapter', variance: [7, 10], density: [2, 5], surfaces: ['portfolio', 'launch'], rule: 'Only when sequence is intrinsically horizontal; wheel remains native.' },
  { id: 'layered-artifact', variance: [6, 10], density: [3, 7], surfaces: ['marketing', 'launch'], rule: 'Layers are real product states, not decorative cards.' },
  { id: 'data-as-hero', variance: [3, 7], density: [6, 10], surfaces: ['dashboard', 'fintech', 'analytics'], rule: 'The decisive live value owns first fixation.' },
  { id: 'progressive-disclosure-canvas', variance: [3, 7], density: [5, 9], surfaces: ['app', 'onboarding', 'settings'], rule: 'Reveal complexity at the moment it becomes actionable.' },
  { id: 'controlled-collage', variance: [8, 10], density: [3, 7], surfaces: ['portfolio', 'editorial'], rule: 'Break one grid rule while every reading edge remains recoverable.' },
  { id: 'scrollytelling', variance: [7, 10], density: [2, 6], surfaces: ['launch', 'story'], rule: 'A real transformation drives the timeline; static reduced path required.' },
  { id: 'modular-dense-cockpit', variance: [2, 5], density: [8, 10], surfaces: ['dashboard', 'admin', 'ops'], rule: 'Grouping and row rhythm replace decorative card spacing.' },
];

function composition(args) {
  const brief = positionals(args).join(' ').toLowerCase();
  const variance = clampDial(value(args, '--variance', '5'));
  const motion = clampDial(value(args, '--motion', '4'));
  const density = clampDial(value(args, '--density', '5'));
  const surface = value(args, '--surface', brief.includes('dashboard') ? 'dashboard' : 'marketing');
  const sector = value(args, '--sector', 'saas');
  const scored = COMPOSITIONS.map(item => {
    const rangeScore = (value, [min, max]) => value >= min && value <= max ? 4 : -Math.min(Math.abs(value - min), Math.abs(value - max));
    let score = rangeScore(variance, item.variance) + rangeScore(density, item.density);
    if (item.surfaces.includes(surface) || item.surfaces.some(tag => brief.includes(tag))) score += 6;
    if (item.id === 'scrollytelling' && motion < 6) score -= 12;
    if (['fintech', 'healthcare', 'legal'].includes(sector) && ['controlled-collage', 'horizontal-chapter'].includes(item.id)) score -= 10;
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);
  const selected = scored[0];
  return write({
    selected: selected.id,
    dials: { variance, motion, density },
    sector,
    surface,
    rule: selected.rule,
    guardrails: [
      motion < 6 ? 'No pinned/scrubbed choreography.' : 'Reduced-motion static narrative and 4× CPU pass required.',
      density > 7 ? 'Use row height and grouping as rhythm.' : 'Whitespace remains a primary grouping tool.',
      variance > 7 ? 'Record the one structural rule being broken and why.' : 'Keep all chrome on the grid.',
    ],
    alternatives: scored.slice(1, 3).map(item => ({ id: item.id, score: item.score, rule: item.rule })),
    module: 'brain/originality.md + foundations/layout.md',
  }, args);
}

function compileSignature(input = {}) {
  const brief = input.brief || 'product';
  const material = input.material || 'the product’s real input → output transformation';
  const audience = input.audience || 'the primary operator in their daily working environment';
  const belief = input.belief || 'the product removes uncertainty through visible evidence';
  const variance = clampDial(input.variance ?? 5);
  const motion = clampDial(input.motion ?? 4);
  const density = clampDial(input.density ?? 5);
  const direction = (kind, fact, vehicle, gesture) => ({
    kind,
    sourceFact: fact,
    signatureVehicle: vehicle,
    derivation: `${fact} → ${gesture} → the product becomes recognizable without borrowing a competitor motif`,
    repetitionPoints: ['hero/primary state', 'section transition or empty state', 'success/result state'],
    layoutGesture: gesture,
    typeBehavior: variance >= 7 ? 'One dramatic scale jump; stable body measure.' : 'Restrained scale with one product-derived emphasis.',
    motionBehavior: motion >= 6 ? 'One cancellable hero-scale signature plus state feedback.' : 'State feedback plus one compact signature moment.',
    responsiveCollapse: 'Preserve the semantic artifact and reading order; remove overlap before reducing type.',
    reducedMotionVariant: 'Same final composition and information; spatial motion becomes opacity ≤80ms or instant.',
    costCeiling: motion >= 6 ? '≤3 concurrent transforms; measured 4× CPU throttle; no LCP opacity gate.' : 'transform/opacity only; interaction ≤200ms.',
    antiCloneConstraint: 'Transfer the tactic, never another product’s palette, illustration, copy cadence, or branded geometry.',
  });
  return {
    brief,
    dials: { variance, motion, density },
    directions: [
      direction('material-led', material, 'product artifact/data language', 'the real transformation becomes the recurring visual grammar'),
      direction('audience-led', audience, 'working-world structure and rhythm', 'the interface borrows the audience’s credible organizational texture'),
      direction('belief-led', belief, 'type voice + one interaction', 'the belief is expressed as a repeated reveal/verification gesture'),
    ],
    selectionRule: 'Score intent, clarity, truth, distinctiveness, accessibility and performance; choose the highest evidence-backed direction.',
    module: 'brain/brief-compiler.md + brain/originality.md',
  };
}

function signature(args) {
  return write(compileSignature({
    brief: positionals(args).join(' ') || 'product',
    material: value(args, '--material', 'the product’s real input → output transformation'),
    audience: value(args, '--audience', 'the primary operator in their daily working environment'),
    belief: value(args, '--belief', 'the product removes uncertainty through visible evidence'),
    variance: value(args, '--variance', '5'),
    motion: value(args, '--motion', '4'),
    density: value(args, '--density', '5'),
  }), args);
}

function assetDirection(args) {
  const brief = positionals(args).join(' ') || 'product visual';
  const role = value(args, '--role', 'hero proof');
  const surface = value(args, '--surface', 'web');
  const aspect = value(args, '--aspect', surface === 'mobile' ? '9:19.5' : '16:10');
  const mode = value(args, '--mode', 'product-led');
  const budgets = { web: 180000, mobile: 240000, brand: 500000 };
  return write({
    brief,
    assetRole: role,
    surface,
    artDirection: `${mode}: show a real product material or audience-world object; no ornamental stock abstraction.`,
    framing: surface === 'mobile' ? 'Safe-area-aware full screen with one dominant action region.' : 'Reserve a stable media frame before load; crop around the product action.',
    focalPoint: { xPercent: 62, yPercent: 45, rationale: 'Keeps the subject away from the primary reading edge and CTA.' },
    safeTextRegion: surface === 'mobile' ? { top: 8, right: 6, bottom: 14, left: 6, unit: '%' } : { top: 10, right: 8, bottom: 10, left: 48, unit: '%' },
    aspectRatioFamily: [aspect, surface === 'mobile' ? '1:1' : '4:3', surface === 'brand' ? '1:1' : '3:2'],
    responsiveCropPolicy: 'Use art-directed sources. Preserve the focal point; never crop text baked into an image.',
    colorHarmony: 'Sample one low-chroma surface tone and one semantic accent; measure any overlaid text against the worst underlying pixel.',
    altTextIntent: role.includes('proof') ? 'Describe the product action and result, not the visual style.' : 'Decorative only when the adjacent copy carries identical meaning.',
    fileSizeBudgetBytes: budgets[surface] || budgets.web,
    fallbackStrategy: 'Explicit dimensions + dominant-color placeholder + AVIF/WebP source set + static reduced-data fallback.',
    validation: ['dimensions declared', 'responsive sources', 'alt intent', 'contrast over worst pixel', 'LCP preload only when truly above fold'],
    module: 'brain/brief-compiler.md + checklists/performance.md + foundations/accessibility.md',
  }, args);
}

function graphNodes() {
  const nodes = [];
  const addDir = (directory, type) => {
    const absolute = path.join(ROOT, directory);
    if (!fs.existsSync(absolute)) return;
    for (const name of fs.readdirSync(absolute).filter(item => item.endsWith('.md'))) {
      const file = path.join(absolute, name);
      const text = fs.readFileSync(file, 'utf8');
      nodes.push({ id: `${type}:${name.replace(/\.md$/, '')}`, type, label: name.replace(/\.md$/, ''), file: path.relative(ROOT, file), text });
    }
  };
  addDir('industries', 'sector');
  addDir('patterns', 'surface');
  addDir('components', 'component');
  addDir('native', 'platform');
  addDir('motion', 'motion');
  addDir('foundations', 'foundation');
  for (const rule of RULES) nodes.push({ id: `validator:${rule.id}`, type: 'validator', label: rule.id, file: rule.module, text: `${rule.message} ${rule.fix} ${rule.engines.join(' ')}` });
  for (const recipe of RECIPES) nodes.push({ id: `recipe:${recipe.id}`, type: 'recipe', label: recipe.id, file: 'runtime/motion/recipes.js', text: `${recipe.core} ${recipe.reduced} ${recipe.budget} ${recipe.adapters.join(' ')}` });
  for (const manifest of ['ai-copilot-landing', 'cybersecurity-pricing', 'fintech-dashboard', 'flagship-launch']) {
    const file = `goldens/${manifest}/designos-golden.json`;
    if (fs.existsSync(path.join(ROOT, file))) nodes.push({ id: `golden:${manifest}`, type: 'golden', label: manifest, file, text: fs.readFileSync(path.join(ROOT, file), 'utf8') });
  }
  return nodes;
}

function knowledge(args) {
  const query = positionals(args).join(' ');
  if (!query) throw new Error('knowledge requires a query');
  const filters = {
    platform: value(args, '--platform'),
    state: value(args, '--state'),
    stack: value(args, '--stack'),
    evidence: value(args, '--evidence'),
    motion: value(args, '--motion'),
  };
  const queryTokens = tokens(`${query} ${Object.values(filters).join(' ')}`);
  const hits = graphNodes().map(node => {
    const haystack = tokens(`${node.label} ${node.type} ${node.file} ${node.text}`);
    const score = queryTokens.reduce((sum, token) => sum + (haystack.includes(token) ? (node.label.includes(token) ? 6 : 1) : 0), 0);
    return { node, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
  const byType = type => hits.filter(item => item.node.type === type).map(item => ({ id: item.node.id, file: item.node.file, score: item.score }));
  return write({
    query,
    filters,
    governingRule: byType('foundation')[0] || byType('surface')[0] || null,
    sectorOverride: byType('sector')[0] || null,
    applicableRecipe: byType('recipe')[0] || byType('motion')[0] || null,
    validators: byType('validator'),
    goldens: byType('golden'),
    platform: byType('platform')[0] || null,
    performanceImplication: 'Use compositor-only motion, preserve INP <200ms, and run the browser gate under reduced motion and zoom.',
    reducedMotionAlternative: 'Keep state communication; remove spatial travel, momentum and autoplay.',
    nodes: hits.map(item => ({ ...item.node, text: undefined, score: item.score })),
  }, args);
}

function coverage(args) {
  const goldenEvidence = fs.existsSync(path.join(ROOT, 'goldens'))
    && fs.readdirSync(path.join(ROOT, 'goldens'), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .some(entry => fs.existsSync(path.join(ROOT, 'goldens', entry.name, 'evidence/browser-gate.json')));
  const isolatedFile = path.join(ROOT, 'evals/isolated/registry-eval.json');
  const isolatedReport = fs.existsSync(isolatedFile) ? JSON.parse(fs.readFileSync(isolatedFile, 'utf8')) : { results: [] };
  const isolatedRules = new Set(isolatedReport.results.filter(item => item.passed).map(item => item.ruleId));
  const external = verifyExternalRegistry(path.join(ROOT, 'evals/external/registry.json'));
  const rows = RULES.map(rule => {
    const recipe = RECIPES.find(item => rule.id.includes(item.id) || rule.module.includes('motion/'));
    return {
      capability: rule.id,
      ruleExists: true,
      implementationRecipe: Boolean(recipe),
      automatedValidator: rule.engines.some(engine => ['static', 'dom', 'visual', 'lighthouse'].includes(engine)),
      engines: rule.engines,
      testFixture: fs.existsSync(path.join(ROOT, rule.fixture)),
      goldenEvidence,
      isolatedRuleEval: isolatedRules.has(rule.id),
      externalEval: external.externalEval,
      gaps: [
        !recipe && rule.category === 'motion' ? 'implementation recipe' : null,
        !goldenEvidence ? 'browser evidence' : null,
        !isolatedRules.has(rule.id) ? 'isolated rule eval' : null,
        !external.externalEval ? 'external eval' : null,
      ].filter(Boolean),
    };
  });
  const summary = {
    capabilities: rows.length,
    fixtures: rows.filter(row => row.testFixture).length,
    automated: rows.filter(row => row.automatedValidator).length,
    goldenEvidence: rows.filter(row => row.goldenEvidence).length,
    isolated: rows.filter(row => row.isolatedRuleEval).length,
    external: rows.filter(row => row.externalEval).length,
  };
  return write({ generatedAt: new Date().toISOString(), summary, rows }, args);
}

function motionRecipe(args) {
  const [id] = positionals(args);
  const stack = value(args, '--stack', 'vanilla');
  if (!id) return write({ recipes: RECIPES, stacks: STACKS }, args);
  return write(adapterSource(id, stack), args);
}

module.exports = {
  motionDecision,
  composition,
  signature,
  assetDirection,
  knowledge,
  coverage,
  motionRecipe,
  graphNodes,
  COMPOSITIONS,
  compileSignature,
  compileMotionSemantics,
};
