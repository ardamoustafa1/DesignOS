'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const { compileSignature } = require('./intelligence');
const { VARIANT_TRANSFORMS, transformComponent } = require('./live/component-transform');

const CLASSIFICATIONS = ['Hierarchy weak', 'Too generic', 'Motion too slow', 'Proof unsupported', 'Target too small', 'Density mismatch', 'Brand signature missing'];
const VARIANTS = {
  a: {
    ...VARIANT_TRANSFORMS.a,
    rationale: 'Turn the selected product material into the structure and proof-bearing visual grammar.',
    transform: VARIANT_TRANSFORMS.a,
  },
  b: {
    ...VARIANT_TRANSFORMS.b,
    rationale: 'Use the audience’s decision order: evidence first, claim second, action third.',
    transform: VARIANT_TRANSFORMS.b,
  },
  c: {
    ...VARIANT_TRANSFORMS.c,
    rationale: 'Express the product belief through one repeated, origin-aware verification gesture.',
    transform: VARIANT_TRANSFORMS.c,
  },
};

const sha = input => crypto.createHash('sha256').update(input).digest('hex');
const slug = file => path.basename(file, path.extname(file)).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

/**
 * Extracts and synthesizes project context from memory files.
 * Used to align Live Director variants with project-specific brand and design decisions.
 * 
 * @param {string} cwd - The project root directory.
 * @returns {Object} Extracted context including sector, core belief, and proof policy.
 */
function projectContext(cwd) {
  const read = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const memory = ['client.md', 'brand.md', 'design.md'].map(name => read(path.join(cwd, 'memory', name))).join('\n');
  const lower = memory.toLowerCase();
  const sector = ['fintech', 'cybersecurity', 'healthcare', 'ecommerce', 'education', 'gaming', 'saas']
    .find(candidate => lower.includes(candidate)) || 'general';
  return {
    sector,
    belief: /product belief:\s*([^\n]+)/i.exec(memory)?.[1] || 'clarity must be earned through inspectable evidence',
    proofPolicy: /proof|evidence|trust/i.test(memory) ? 'inspectable-proof' : 'proof-neutral',
    memoryHash: sha(memory).slice(0, 12),
  };
}

// One page's motion budget (motion/signature-moments.md: "two signature moments per
// page, maximum, usually one") mapped onto three variants, cheapest to boldest — so an
// `--axis motion` request compares restraint against a signature, not three unrelated
// structural strategies.
const AXIS_OVERRIDES = Object.freeze({
  motion: {
    a: { motion: 'none', axisNote: 'no motion — the rest state alone carries the hierarchy (motion/principles.md default: it does not move)' },
    b: { motion: 'feedback-only', axisNote: 'state-feedback motion only — hover/press/toggle response, nothing spatial' },
    c: { motion: 'origin-aware-signature', axisNote: 'one interaction-scale signature moment, gated on the page’s MOTION_INTENSITY (motion/signature-moments.md)' },
  },
  layout: {
    a: { slotOrder: ['copy', 'content', 'proof', 'actions'], responsive: 'stack-below-48rem', axisNote: 'linear stack — copy leads, single reading column at every width' },
    b: { slotOrder: ['content', 'copy', 'actions', 'proof'], responsive: 'sidebar-above-64rem', axisNote: 'content-led sidebar split above 64rem, stacked below it' },
    c: { slotOrder: ['proof', 'content', 'copy', 'actions'], responsive: 'bento-above-64rem', axisNote: 'bento-grid composition above 64rem — proof-forward, broken symmetry' },
  },
  density: {
    a: { tokenDiff: { '--designos-direction-gap': '0.5rem', '--designos-direction-measure': '72ch' }, axisNote: 'dense — dashboard-tight spacing scale (components/data-density.md)' },
    b: { tokenDiff: { '--designos-direction-gap': '1rem', '--designos-direction-measure': '65ch' }, axisNote: 'standard — the default marketing/app spacing scale' },
    c: { tokenDiff: { '--designos-direction-gap': '2rem', '--designos-direction-measure': '56ch' }, axisNote: 'spacious — editorial breathing room, fewer elements per viewport' },
  },
});

/**
 * Generates context-aware variant configurations based on the selected DOM element's
 * classification and the project's sector and core belief.
 *
 * Without an axis, the three variants vary structural strategy (material/audience/belief-
 * led) — the general-purpose spread. With `annotation.axis` (motion|layout|density) set,
 * all three instead vary deliberately along that one named axis, cheapest to boldest, so
 * "give me three motion-only variants" is an actual request this function can answer.
 *
 * @param {string} cwd - The project root directory.
 * @param {Object} annotation - The annotation metadata describing the UI issue.
 * @returns {Object} Three distinct design variants (a, b, c) with tailored rationales.
 */
function contextualVariants(cwd, annotation = {}) {
  const context = projectContext(cwd);
  const issue = annotation.classification || 'Hierarchy weak';
  const axis = AXIS_OVERRIDES[annotation.axis] ? annotation.axis : null;
  const signature = compileSignature({
    brief: `${context.sector} interface: ${issue}`,
    material: annotation.note || 'the selected product element and its real state',
    audience: `the primary ${context.sector} operator`,
    belief: context.belief,
    variance: 5,
    motion: 4,
    density: 5,
  });
  const signatureDirection = signature.directions.find(item => item.kind === 'belief-led');
  if (axis) {
    const overrides = AXIS_OVERRIDES[axis];
    const strategyLabel = { a: 'restrained', b: 'standard', c: 'bold' };
    return Object.fromEntries(['a', 'b', 'c'].map(key => {
      const override = overrides[key];
      const { axisNote, ...transformOverride } = override;
      return [key, {
        ...VARIANT_TRANSFORMS[key],
        ...transformOverride,
        rationale: `${context.sector}, axis=${axis} (${strategyLabel[key]}): ${axisNote} — “${issue}” addressed without changing the other two axes.`,
        transform: { ...VARIANT_TRANSFORMS[key], ...transformOverride },
        provenance: { ...context, strategy: `${axis}-${strategyLabel[key]}`, axis, issue },
      }];
    }));
  }
  return {
    a: {
      ...VARIANT_TRANSFORMS.a,
      rationale: `${context.sector}: remove competing emphasis around “${issue}”; preserve ${context.proofPolicy}.`,
      transform: VARIANT_TRANSFORMS.a,
      provenance: { ...context, strategy: 'material-led', issue },
    },
    b: {
      ...VARIANT_TRANSFORMS.b,
      rationale: `${context.sector}: isolate the decision implied by “${issue}” without adding unsupported proof.`,
      transform: VARIANT_TRANSFORMS.b,
      provenance: { ...context, strategy: 'audience-led', issue },
    },
    c: {
      ...VARIANT_TRANSFORMS.c,
      rationale: `${signatureDirection.derivation}; no new proof claims.`,
      transform: VARIANT_TRANSFORMS.c,
      provenance: {
        ...context, strategy: 'belief-led', issue, proofGuard: 'no claims inserted',
        compiler: signature.module, signatureKind: signatureDirection.kind,
        signatureDerivation: signatureDirection.derivation,
      },
    },
  };
}

function pathsFor(target, cwd) {
  const source = path.resolve(cwd, target);
  const root = path.join(cwd, '.designos', 'live', slug(source));
  return {
    source, root,
    session: path.join(root, 'session.json'),
    annotations: path.join(root, 'annotations.json'),
    transactions: path.join(root, 'transactions.json'),
    original: path.join(root, 'source.original'),
    server: path.join(root, 'server.json'),
    screenshots: path.join(root, 'annotations'),
  };
}

/**
 * Initializes a new Live Director session for a target HTML or component file.
 * Creates necessary shadow directories and session state files.
 * 
 * @param {string} target - The target file path to inspect.
 * @param {string} cwd - The project root directory.
 * @returns {{files: Object, session: Object}} Initialized session paths and state.
 */
function initSession(target, cwd = process.cwd(), axis = null) {
  const files = pathsFor(target, cwd);
  if (!fs.existsSync(files.source)) throw new Error(`Live target not found: ${target}`);
  const source = fs.readFileSync(files.source, 'utf8');
  fs.mkdirSync(files.root, { recursive: true });
  if (!fs.existsSync(files.original)) fs.writeFileSync(files.original, source);
  if (!fs.existsSync(files.annotations)) writeJson(files.annotations, []);
  if (!fs.existsSync(files.transactions)) writeJson(files.transactions, []);
  const existing = fs.existsSync(files.session) ? json(files.session) : {};
  const session = {
    schema: 1,
    id: existing.id || crypto.randomUUID(),
    target: files.source,
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceLock: sha(source),
    selectedSelector: existing.selectedSelector || null,
    selectedSource: existing.selectedSource || null,
    selectedSourceLock: existing.selectedSourceLock || null,
    status: existing.status || 'active',
    axis: existing.axis || axis || null,
    variants: existing.variants || contextualVariants(cwd, { axis }),
  };
  writeJson(files.session, session);
  return { files, session };
}

function sourceLine(source, selector) {
  const needle = selector.startsWith('#') ? `id="${selector.slice(1)}"`
    : selector.startsWith('.') ? selector.slice(1) : selector.split(/[ >:[.]/)[0];
  const index = source.indexOf(needle);
  return index < 0 ? null : source.slice(0, index).split('\n').length;
}

function walkSourceFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', '.git', 'dist', 'build', '.next', '.designos'].includes(entry.name)) return [];
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(file);
    return /\.(?:jsx?|tsx?|vue|svelte|html?)$/i.test(entry.name) ? [file] : [];
  });
}

function resolveComponentSource(files, source, annotation) {
  if (annotation.sourceMarker) {
    const match = /^(.*?):(\d+)(?::(\d+))?$/.exec(annotation.sourceMarker);
    if (match) {
      let root = path.dirname(files.source);
      let resolved = path.resolve(root, match[1]);
      while (!fs.existsSync(resolved) && path.dirname(root) !== root) {
        root = path.dirname(root);
        resolved = path.resolve(root, match[1]);
      }
      return {
        file: resolved,
        line: Number(match[2]), column: Number(match[3] || 1),
        kind: 'runtime-marker', confidence: fs.existsSync(resolved) ? 1 : .75,
      };
    }
  }
  if (annotation.generatedSourceMap?.map && annotation.generatedSourceMap.line) {
    const mapFile = path.resolve(annotation.generatedSourceMap.map);
    const traced = originalPositionFor(new TraceMap(fs.readFileSync(mapFile, 'utf8')), {
      line: Number(annotation.generatedSourceMap.line),
      column: Number(annotation.generatedSourceMap.column || 0),
    });
    if (traced.source) return {
      file: path.resolve(path.dirname(mapFile), traced.source),
      line: traced.line, column: traced.column, name: traced.name,
      kind: 'source-map', confidence: 1,
    };
  }
  const needle = annotation.selector.startsWith('#') ? `id="${annotation.selector.slice(1)}"`
    : annotation.selector.startsWith('.') ? annotation.selector.slice(1) : annotation.selector.split(/[ >:[.]/)[0];
  for (const candidate of walkSourceFiles(path.dirname(files.source))) {
    const candidateSource = fs.readFileSync(candidate, 'utf8');
    const index = candidateSource.indexOf(needle);
    if (index >= 0) return {
      file: candidate,
      line: candidateSource.slice(0, index).split('\n').length,
      column: index - candidateSource.lastIndexOf('\n', index),
      kind: 'component-search', confidence: .65,
    };
  }
  return {
    file: files.source, line: sourceLine(source, annotation.selector), column: null,
    kind: 'html-search', confidence: .5,
  };
}

function detectFramework(file, source = '') {
  const normalized = String(file || '').replaceAll('\\', '/').toLowerCase();
  if (/\.vue$/.test(normalized) || /data-v-[\w-]+/.test(source)) return 'vue';
  if (/\.svelte$/.test(normalized) || /svelte/.test(normalized)) {
    return normalized.includes('sveltekit') || /\/routes\/\+(?:page|layout|error)\.svelte$/.test(normalized)
      ? 'sveltekit' : 'svelte';
  }
  if (/\.astro$/.test(normalized) || normalized.includes('/astro')) return 'astro';
  if (normalized.includes('/.next/') || normalized.includes('/app/') || normalized.includes('/pages/')) return 'next';
  if (/\.(?:jsx|tsx)$/.test(normalized) || /data-reactroot|__next/.test(source)) return 'react';
  return 'html';
}

/**
 * Records an annotation (hover selection) on a target element, attempts to resolve
 * its true source file (framework-aware), and generates corresponding design variants.
 * 
 * @param {string} target - The live target being inspected.
 * @param {Object} annotation - Data describing the selected element.
 * @param {string} cwd - The project root directory.
 * @returns {Object} The recorded annotation item with resolved source mapping.
 */
function annotate(target, annotation, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  if (!CLASSIFICATIONS.includes(annotation.classification)) throw new Error(`Unknown annotation classification: ${annotation.classification}`);
  const source = fs.readFileSync(files.source, 'utf8');
  const annotations = json(files.annotations);
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    selector: annotation.selector,
    classification: annotation.classification,
    note: annotation.note || '',
    rect: annotation.rect || null,
    source: resolveComponentSource(files, source, annotation),
    screenshotCrop: annotation.screenshotCrop || null,
    componentBoundary: annotation.componentBoundary || null,
  };
  item.source.framework = detectFramework(item.source.file, fs.existsSync(item.source.file)
    ? fs.readFileSync(item.source.file, 'utf8') : source);
  annotations.push(item);
  writeJson(files.annotations, annotations);
  session.selectedSelector = item.selector;
  session.selectedSource = item.source;
  session.selectedSourceLock = fs.existsSync(item.source.file)
    ? sha(fs.readFileSync(item.source.file, 'utf8')) : null;
  const axis = annotation.axis || session.axis || null;
  session.axis = axis;
  session.variants = contextualVariants(cwd, { ...item, axis });
  session.updatedAt = new Date().toISOString();
  writeJson(files.session, session);
  return item;
}

async function captureAnnotationCrop(target, item, pageUrl, cwd = process.cwd()) {
  const { files } = initSession(target, cwd);
  let playwright;
  try {
    playwright = require('playwright');
  } catch {
    return item;
  }
  fs.mkdirSync(files.screenshots, { recursive: true });
  const output = path.join(files.screenshots, `${item.id}.png`);
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
    const locator = page.locator(item.selector).first();
    if (await locator.count()) {
      await locator.scrollIntoViewIfNeeded();
      await locator.screenshot({ path: output });
      const annotations = json(files.annotations);
      const stored = annotations.find(annotation => annotation.id === item.id);
      if (stored) {
        stored.screenshotCrop = output;
        writeJson(files.annotations, annotations);
      }
      item.screenshotCrop = output;
    }
  } finally {
    await browser.close();
  }
  return item;
}

function injectVariant(source, selector, variantId, variants = VARIANTS) {
  const variant = variants[variantId];
  if (!variant) throw new Error(`Unknown variant: ${variantId}`);
  return transformComponent(source, selector, variantId, variants).source;
}

function runGate(file, root, label) {
  const out = path.join(root, `${label}-gate.json`);
  const screenshots = path.join(root, `${label}-screenshots`);
  const result = spawnSync(process.execPath, [path.resolve(__dirname, 'browser-gate.js'), file, '--out', out, '--screenshots', screenshots], {
    cwd: path.dirname(file), encoding: 'utf8', maxBuffer: 1024 * 1024 * 32,
  });
  if (!fs.existsSync(out)) return { available: false, status: result.status, message: result.stderr || result.stdout };
  const report = json(out);
  const reportFindings = report.findings || [];
  const performance = report.results.reduce((summary, item) => ({
    transferBytes: Math.max(summary.transferBytes, item.performance?.transferBytes || 0),
    domContentLoadedMs: Math.max(summary.domContentLoadedMs, item.performance?.domContentLoaded || 0),
    loadMs: Math.max(summary.loadMs, item.performance?.load || 0),
    longTaskMs: Math.max(summary.longTaskMs, item.performance?.longTaskMs || 0),
    layoutShift: Math.max(summary.layoutShift, item.performance?.layoutShift || 0),
  }), { transferBytes: 0, domContentLoadedMs: 0, loadMs: 0, longTaskMs: 0, layoutShift: 0 });
  const accessibilityFindings = reportFindings.filter(item =>
    item.engine === 'axe' || /(?:focus|tap-target|semantic|announcement|forced-colors|text-spacing)/.test(item.code || ''));
  const browserFindings = reportFindings.filter(item => !accessibilityFindings.includes(item));
  const motionCheck = spawnSync(process.execPath, [path.resolve(__dirname, '../validators/check-motion.js'), file], {
    cwd: path.dirname(file), encoding: 'utf8', maxBuffer: 1024 * 1024 * 8,
  });
  const reducedMotionScenarios = report.results.filter(item => /reduced/.test(item.scenario || '')).length;
  return {
    available: true,
    status: result.status,
    p1: report.summary.p1,
    p2: report.summary.p2,
    performance,
    report: out,
    gates: {
      browser: {
        passed: !browserFindings.some(item => ['P1', 'P2'].includes(item.severity)),
        findings: browserFindings,
      },
      accessibility: {
        passed: !accessibilityFindings.some(item => ['P1', 'P2'].includes(item.severity)),
        axeScenarios: report.results.filter(item => item.axe).length,
        accessibilityTrees: report.results.filter(item => item.accessibilityTree?.length).length,
        findings: accessibilityFindings,
      },
      motion: {
        passed: motionCheck.status === 0 && reducedMotionScenarios > 0,
        reducedMotionScenarios,
        validatorStatus: motionCheck.status,
        validatorOutput: `${motionCheck.stdout || ''}${motionCheck.stderr || ''}`.trim(),
      },
    },
  };
}

function performanceBudget(cwd) {
  const config = path.join(cwd, '.designos/config.json');
  const stored = fs.existsSync(config) ? json(config).live?.performanceBudget || {} : {};
  return {
    transferBytes: stored.transferBytes ?? 786432,
    domContentLoadedMs: stored.domContentLoadedMs ?? 2000,
    loadMs: stored.loadMs ?? 3000,
    longTaskMs: stored.longTaskMs ?? 200,
    layoutShift: stored.layoutShift ?? .1,
  };
}

function performanceRegressions(before, after, budget) {
  return Object.keys(budget).flatMap(metric => {
    const exceedsBudget = after[metric] > budget[metric];
    const allowance = metric === 'layoutShift' ? .01 : 10;
    const exceedsBefore = after[metric] > before[metric] * 1.1 && after[metric] - before[metric] > allowance;
    return exceedsBudget || exceedsBefore
      ? [{ metric, before: before[metric], after: after[metric], budget: budget[metric], exceedsBudget, exceedsBefore }]
      : [];
  });
}

function variantDiff(target, variantId, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  if (!session.selectedSelector) throw new Error('No selected element. Add an annotation or select an element first.');
  const componentFile = session.selectedSource?.file && fs.existsSync(session.selectedSource.file)
    ? session.selectedSource.file : files.source;
  const before = fs.readFileSync(componentFile, 'utf8');
  const variants = session.variants || contextualVariants(cwd);
  const transformed = transformComponent(before, session.selectedSelector, variantId, variants);
  const spec = variants[variantId];
  return {
    variant: variantId,
    name: spec.name,
    rationale: spec.rationale,
    framework: detectFramework(componentFile, before),
    source: {
      file: componentFile,
      selector: session.selectedSelector,
      location: session.selectedSource || null,
    },
    diffs: {
      componentTree: transformed.ast,
      slotStructure: { order: spec.slotOrder, changed: transformed.changes.slotStructure },
      copyHierarchy: { value: spec.copyHierarchy, changed: transformed.changes.copyHierarchy },
      ctaOrder: { value: spec.ctaOrder, changed: transformed.changes.ctaOrder },
      state: { value: spec.state, changed: transformed.changes.state },
      motion: { value: spec.motion, graph: spec.motionGraphDiff, changed: transformed.changes.motion },
      responsive: { value: spec.responsive, changed: transformed.changes.responsiveRules },
      proofPlacement: { value: spec.proofPlacement, provenance: spec.proofProvenance, changed: transformed.changes.proofPlacement },
      accessibility: { impact: spec.accessibilityImpact, changed: transformed.changes.accessibilityImpact },
      performance: { impact: spec.performanceImpact, changed: transformed.changes.performanceImpact },
    },
    provenance: spec.provenance || {},
    beforeHash: sha(before),
    candidateHash: sha(transformed.source),
  };
}

function setLocks(target, locks = {}, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  session.locks = {
    route: locks.route ?? session.locks?.route ?? true,
    component: locks.component ?? session.locks?.component ?? true,
  };
  session.updatedAt = new Date().toISOString();
  writeJson(files.session, session);
  return session.locks;
}

function recordRejection(target, variant, reason, cwd = process.cwd()) {
  const { files } = initSession(target, cwd);
  const transactions = json(files.transactions);
  const transaction = {
    id: crypto.randomUUID(),
    type: 'variant-reject',
    variant,
    reason: reason || 'Rejected in Live Director Studio',
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  writeJson(files.transactions, transactions);
  return transaction;
}

function componentBuildConfig(cwd) {
  const configFile = path.join(cwd, '.designos/config.json');
  const config = fs.existsSync(configFile) ? json(configFile).live || {} : {};
  if (!Array.isArray(config.buildCommand) || !config.buildCommand.length || !config.previewTarget) {
    throw new Error('Component source transforms require .designos/config.json live.buildCommand (argv array) and live.previewTarget.');
  }
  return {
    command: config.buildCommand,
    previewTarget: path.resolve(cwd, config.previewTarget),
  };
}

function runComponentBuild(config, cwd) {
  const [command, ...args] = config.command;
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
  if (result.status) throw new Error(`Component build failed: ${result.stderr || result.stdout}`);
  if (!fs.existsSync(config.previewTarget)) throw new Error(`Component build did not produce preview target: ${config.previewTarget}`);
}

function updateMemory(cwd, transaction) {
  const memoryDir = path.join(cwd, 'memory');
  fs.mkdirSync(memoryDir, { recursive: true });
  const design = path.join(memoryDir, 'design.md');
  if (!fs.existsSync(design)) fs.writeFileSync(design, '# Design Decisions\n');
  fs.appendFileSync(design, `\n## ${new Date().toISOString().slice(0, 10)} — Live Director ${transaction.variant}\n\n- Target: ${transaction.target}\n- Selector: \`${transaction.selector}\`\n- Decision: ${transaction.variantSpec?.name || transaction.variant}\n- Reason: ${transaction.reason}\n- Context: ${JSON.stringify(transaction.variantSpec?.provenance || {})}\n- Regression: before P1 ${transaction.beforeGate.p1}; after P1 ${transaction.afterGate.p1}\n- Performance: ${JSON.stringify(transaction.afterGate.performance)}\n- Transaction: ${transaction.id}\n`);
}

/**
 * Accepts a variant, runs a strict pipeline of browser, performance, motion, and 
 * accessibility gates, and writes the transformation back to the source file if successful.
 * 
 * @param {string} target - The live target or component file.
 * @param {string} variantId - The ID of the variant being accepted ('a', 'b', 'c').
 * @param {string} reason - Justification for accepting the variant.
 * @param {string} cwd - The project root directory.
 * @returns {Object} Transaction record representing the successful transformation.
 */
function acceptVariant(target, variantId, reason, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  if (!session.selectedSelector) throw new Error('No selected element. Add an annotation or select an element first.');
  const componentFile = session.selectedSource?.file && fs.existsSync(session.selectedSource.file)
    ? session.selectedSource.file : files.source;
  const componentNative = componentFile !== files.source;
  const before = fs.readFileSync(componentFile, 'utf8');
  const expectedLock = componentNative ? session.selectedSourceLock : session.sourceLock;
  if (sha(before) !== expectedLock) throw new Error('Selected component source lock changed. Re-annotate before applying a variant.');
  const variants = session.variants || contextualVariants(cwd);
  const transformed = transformComponent(before, session.selectedSelector, variantId, variants);
  const after = transformed.source;
  const backup = path.join(files.root, `backup-${Date.now()}${path.extname(componentFile) || '.html'}`);
  fs.copyFileSync(componentFile, backup);
  let beforeGate;
  let afterGate;
  let previewTarget = files.source;
  let build = null;
  if (componentNative) {
    build = componentBuildConfig(cwd);
    previewTarget = build.previewTarget;
    beforeGate = runGate(previewTarget, files.root, 'before');
    try {
      fs.writeFileSync(componentFile, after);
      runComponentBuild(build, cwd);
      afterGate = runGate(previewTarget, files.root, `candidate-${variantId}`);
    } catch (error) {
      fs.copyFileSync(backup, componentFile);
      try { runComponentBuild(build, cwd); } catch {}
      throw error;
    }
  } else {
    const temporary = path.join(files.root, `candidate-${variantId}${path.extname(files.source) || '.html'}`);
    fs.writeFileSync(temporary, after);
    beforeGate = runGate(files.source, files.root, 'before');
    afterGate = runGate(temporary, files.root, `candidate-${variantId}`);
  }
  if (!beforeGate.available || !afterGate.available) {
    if (componentNative) {
      fs.copyFileSync(backup, componentFile);
      try { runComponentBuild(build, cwd); } catch {}
    }
    throw new Error('Browser regression evidence is required before accepting a live variant.');
  }
  const failedCandidateGates = Object.entries(afterGate.gates || {})
    .filter(([, gate]) => !gate.passed).map(([name]) => name);
  if (failedCandidateGates.length) {
    if (componentNative) {
      fs.copyFileSync(backup, componentFile);
      try { runComponentBuild(build, cwd); } catch {}
    }
    throw new Error(`Variant rejected by required ${failedCandidateGates.join(', ')} gate(s).`);
  }
  if (afterGate.p1 > beforeGate.p1 || afterGate.p2 > beforeGate.p2) {
    if (componentNative) {
      fs.copyFileSync(backup, componentFile);
      try { runComponentBuild(build, cwd); } catch {}
    }
    throw new Error(`Variant rejected by regression gate: before P1/P2 ${beforeGate.p1}/${beforeGate.p2}, after ${afterGate.p1}/${afterGate.p2}.`);
  }
  const budget = performanceBudget(cwd);
  const performanceFindings = performanceRegressions(beforeGate.performance, afterGate.performance, budget);
  if (performanceFindings.length) {
    if (componentNative) {
      fs.copyFileSync(backup, componentFile);
      try { runComponentBuild(build, cwd); } catch {}
    }
    throw new Error(`Variant rejected by performance gate: ${performanceFindings.map(item =>
      `${item.metric} ${item.before}→${item.after} (budget ${item.budget})`).join(', ')}.`);
  }
  if (!componentNative) fs.writeFileSync(componentFile, after);
  const acceptanceGates = {
    browser: afterGate.gates.browser,
    accessibility: afterGate.gates.accessibility,
    motion: afterGate.gates.motion,
    performance: {
      passed: performanceFindings.length === 0,
      budget,
      findings: performanceFindings,
    },
  };
  const transaction = {
    id: crypto.randomUUID(),
    type: 'variant-accept',
    target: componentFile,
    previewTarget,
    componentNative,
    variant: variantId,
    selector: session.selectedSelector,
    reason: reason || variants[variantId].rationale,
    beforeHash: sha(before),
    afterHash: sha(after),
    backup,
    beforeGate,
    afterGate,
    performanceBudget: budget,
    performanceFindings,
    acceptanceGates,
    variantSpec: variants[variantId],
    componentTransform: {
      ast: transformed.ast,
      changes: transformed.changes,
      transform: transformed.transform,
      impact: transformed.impact,
    },
    createdAt: new Date().toISOString(),
  };
  const transactions = json(files.transactions);
  transactions.push(transaction);
  writeJson(files.transactions, transactions);
  if (componentNative) session.selectedSourceLock = transaction.afterHash;
  else session.sourceLock = transaction.afterHash;
  session.updatedAt = new Date().toISOString();
  writeJson(files.session, session);
  updateMemory(cwd, transaction);
  return transaction;
}

function mergeManualWithVariant(target, variantId, edits, reason, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  if (!session.selectedSelector) throw new Error('No selected element. Add an annotation before merging.');
  const componentFile = session.selectedSource?.file && fs.existsSync(session.selectedSource.file)
    ? session.selectedSource.file : files.source;
  const current = fs.readFileSync(componentFile, 'utf8');
  const expectedLock = componentFile === files.source ? session.sourceLock : session.selectedSourceLock;
  if (sha(current) !== expectedLock) {
    throw new Error('Manual/generated merge conflict: source changed after selection. Re-annotate to establish a new base.');
  }
  const variants = session.variants || contextualVariants(cwd);
  let generated = transformComponent(current, session.selectedSelector, variantId, variants).source;
  const conflicts = [];
  for (const edit of edits || []) {
    if (!edit.search || !Object.hasOwn(edit, 'replace')) throw new Error('Every merge edit needs exact search and replace strings.');
    const matches = generated.split(edit.search).length - 1;
    if (matches !== 1) {
      conflicts.push({ search: edit.search, matches, reason: 'edit must match the generated candidate exactly once' });
      continue;
    }
    generated = generated.replace(edit.search, edit.replace);
  }
  if (conflicts.length) {
    const error = new Error(`Manual/generated merge has ${conflicts.length} conflict(s).`);
    error.conflicts = conflicts;
    throw error;
  }
  const temporary = path.join(files.root, `candidate-merge-${variantId}${path.extname(componentFile) || '.html'}`);
  fs.writeFileSync(temporary, generated);
  if (componentFile !== files.source) {
    throw new Error('Component-source manual merge requires a build-aware merge adapter; no source was changed.');
  }
  const beforeGate = runGate(componentFile, files.root, 'before-merge');
  const afterGate = runGate(temporary, files.root, `candidate-merge-${variantId}`);
  if (!beforeGate.available || !afterGate.available) {
    throw new Error('Merged candidate requires browser evidence before source can change.');
  }
  const budget = performanceBudget(cwd);
  const performanceFindings = performanceRegressions(beforeGate.performance, afterGate.performance, budget);
  const failed = Object.entries(afterGate.gates || {}).filter(([, gate]) => !gate.passed).map(([name]) => name);
  if (failed.length || performanceFindings.length
    || afterGate.p1 > beforeGate.p1 || afterGate.p2 > beforeGate.p2) {
    throw new Error(`Merged candidate rejected by gates${failed.length ? `: ${failed.join(', ')}` : ''}.`);
  }
  const backup = path.join(files.root, `backup-${Date.now()}${path.extname(componentFile) || '.html'}`);
  fs.copyFileSync(componentFile, backup);
  fs.writeFileSync(componentFile, generated);
  const transaction = {
    id: crypto.randomUUID(),
    type: 'variant-manual-merge',
    target: componentFile,
    variant: variantId,
    selector: session.selectedSelector,
    reason: reason || 'Manual edits merged with generated variant',
    edits,
    conflicts: [],
    beforeHash: sha(current),
    afterHash: sha(generated),
    backup,
    beforeGate,
    afterGate,
    acceptanceGates: {
      ...afterGate.gates,
      performance: { passed: true, budget, findings: [] },
    },
    createdAt: new Date().toISOString(),
  };
  const transactions = json(files.transactions);
  transactions.push(transaction);
  writeJson(files.transactions, transactions);
  session.sourceLock = transaction.afterHash;
  session.updatedAt = new Date().toISOString();
  writeJson(files.session, session);
  return transaction;
}

function applyManualEdits(target, edits, reason, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  const before = fs.readFileSync(files.source, 'utf8');
  if (sha(before) !== session.sourceLock) throw new Error('Source lock changed. Reinitialize before applying manual edits.');
  let after = before;
  for (const edit of edits) {
    if (!edit.search || !('replace' in edit)) throw new Error('Every edit needs exact search and replace strings.');
    const occurrences = after.split(edit.search).length - 1;
    if (occurrences !== 1) throw new Error(`Manual edit search must match exactly once; matched ${occurrences}.`);
    after = after.replace(edit.search, edit.replace);
  }
  const temporary = path.join(files.root, `candidate-manual${path.extname(files.source) || '.html'}`);
  fs.writeFileSync(temporary, after);
  const beforeGate = runGate(files.source, files.root, 'before-manual');
  const afterGate = runGate(temporary, files.root, 'candidate-manual');
  if (!beforeGate.available || !afterGate.available || afterGate.p1 > beforeGate.p1 || afterGate.p2 > beforeGate.p2) {
    throw new Error('Manual edit failed the no-regression browser gate.');
  }
  const budget = performanceBudget(cwd);
  const performanceFindings = performanceRegressions(beforeGate.performance, afterGate.performance, budget);
  if (performanceFindings.length) throw new Error(`Manual edit failed performance budgets: ${JSON.stringify(performanceFindings)}`);
  const backup = path.join(files.root, `backup-${Date.now()}${path.extname(files.source) || '.html'}`);
  fs.copyFileSync(files.source, backup);
  fs.writeFileSync(files.source, after);
  const transaction = {
    id: crypto.randomUUID(), type: 'manual-apply', target: files.source, reason,
    beforeHash: sha(before), afterHash: sha(after), backup, edits, beforeGate, afterGate,
    performanceBudget: budget, performanceFindings,
    createdAt: new Date().toISOString(),
  };
  const transactions = json(files.transactions); transactions.push(transaction); writeJson(files.transactions, transactions);
  session.sourceLock = transaction.afterHash; writeJson(files.session, session);
  return transaction;
}

function rollback(target, cwd = process.cwd()) {
  const { files, session } = initSession(target, cwd);
  const transactions = json(files.transactions);
  const transaction = [...transactions].reverse().find(item => !item.rolledBackAt);
  if (!transaction) throw new Error('No recoverable live transaction exists.');
  const transactionTarget = transaction.target || files.source;
  const current = fs.readFileSync(transactionTarget, 'utf8');
  if (sha(current) !== transaction.afterHash) throw new Error('Current source differs from the transaction. Refusing destructive rollback.');
  fs.copyFileSync(transaction.backup, transactionTarget);
  if (transaction.componentNative) {
    const build = componentBuildConfig(cwd);
    runComponentBuild(build, cwd);
  }
  transaction.rolledBackAt = new Date().toISOString();
  writeJson(files.transactions, transactions);
  if (transaction.componentNative) session.selectedSourceLock = sha(fs.readFileSync(transactionTarget, 'utf8'));
  else session.sourceLock = sha(fs.readFileSync(files.source, 'utf8'));
  session.updatedAt = new Date().toISOString();
  writeJson(files.session, session);
  return transaction;
}

function directorHtml(target) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DesignOS Live Director</title>
<style>:root{color-scheme:dark;--bg:#0b0e12;--panel:#11161d;--line:#29313c;--muted:#aab4c0;--accent:#42d392;--warn:#ffcc66}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:#f5f7fa;font:14px/1.5 system-ui}header{display:flex;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);min-height:64px}.status{color:var(--accent);margin-left:auto}.locks{display:flex;gap:10px}.locks label{display:flex;align-items:center;gap:6px;margin:0}main{display:grid;grid-template-columns:minmax(0,1fr) 420px;height:calc(100vh - 64px)}.canvas{position:relative;background:#202630}iframe{width:100%;height:100%;border:0;background:white}aside{padding:16px;border-left:1px solid var(--line);overflow:auto;background:var(--panel)}button,select,input,textarea{min-height:44px;border:1px solid #384352;border-radius:8px;background:#171c23;color:inherit;padding:8px 12px;font:inherit}button{cursor:pointer}button:hover{border-color:#5a6a7e}button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}label{display:grid;gap:6px;margin:12px 0}.variants{display:flex;gap:8px;overflow:auto;scroll-snap-type:x mandatory}.variants button{min-width:185px;min-height:104px;text-align:left;scroll-snap-align:start}.actions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;position:sticky;bottom:0;padding:12px 0;background:linear-gradient(transparent,var(--panel) 24%)}.actions .accept{border-color:var(--accent)}.actions .reject{border-color:#e57373}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px}.card{border:1px solid var(--line);border-radius:10px;padding:10px;background:#0d1218}.card strong{display:block;color:var(--warn)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#080b0f;padding:10px;border-radius:8px;color:#dce6ef}.diff-grid{display:grid;gap:8px}.diff-row{display:grid;grid-template-columns:110px 1fr;gap:8px;border-bottom:1px solid var(--line);padding:7px 0}.diff-row span{color:var(--muted)}h2{font-size:16px;margin:20px 0 8px}small,p{color:var(--muted)}code{color:var(--warn)}textarea{width:100%;min-height:100px;resize:vertical}@media(max-width:900px){main{grid-template-columns:1fr;height:auto}.canvas,iframe{height:65vh}aside{border-left:0;border-top:1px solid var(--line)}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}</style></head><body>
<header><strong>DesignOS Live Director Studio</strong><span>${path.basename(target)}</span><div class="locks"><label><input id="route-lock" type="checkbox" checked>Route lock</label><label><input id="component-lock" type="checkbox" checked>Component lock</label></div><span class="status" id="status" role="status">Hover, then select an element</span></header>
<main><section class="canvas" aria-label="Live preview"><iframe id="preview" src="/target" title="Live target"></iframe></section><aside>
<div class="meta"><div class="card"><strong>Framework</strong><span id="framework">not resolved</span></div><div class="card"><strong>Source</strong><span id="source">not selected</span></div></div>
<label>Issue<select id="classification">${CLASSIFICATIONS.map(item => `<option>${item}</option>`).join('')}</select></label>
<label>Director note<input id="note" placeholder="Why this fails and for whom"></label>
<button id="annotate">Save selection and resolve source</button>
<h2>Variant carousel</h2><div class="variants" role="list">${Object.entries(VARIANTS).map(([id, item]) => `<button role="listitem" data-variant="${id}" aria-pressed="false"><strong>${item.name}</strong><br><small>${item.rationale}</small></button>`).join('')}</div>
<h2>Component boundary</h2><pre id="selection">none</pre>
<h2>Semantic diff</h2><div class="diff-grid" id="diff"><p>Select and save an element, then choose a direction.</p></div>
<h2>Manual/generated merge</h2><p>Optional exact edits JSON. Conflicts never overwrite source.</p><textarea id="merge-edits" spellcheck="false" aria-label="Manual merge edits">[]</textarea>
<div class="actions"><button class="accept" id="accept">Accept</button><button class="reject" id="reject">Reject</button><button id="undo">Undo</button></div>
<h2>Annotations</h2><ol id="annotations"></ol>
</aside></main><script>
const frame=document.getElementById('preview');let selection=null;let activeVariant=null;
const status=(text,error)=>{const el=document.getElementById('status');el.textContent=text;el.style.color=error?'#ff8a80':''};
const request=async(url,options={})=>{const response=await fetch(url,{headers:{'content-type':'application/json'},...options});const text=await response.text();let data;try{data=JSON.parse(text)}catch{data={error:text}}if(!response.ok)throw new Error(data.error||text);return data};
const selectorFor=el=>{if(el.id)return '#'+CSS.escape(el.id);const test=el.getAttribute('data-testid');if(test)return '[data-testid="'+CSS.escape(test)+'"]';const cls=[...el.classList][0];return el.tagName.toLowerCase()+(cls?'.'+CSS.escape(cls):'')};
const boundaryFor=el=>{const boundary=el.closest('[data-designos-component],[data-reactroot],[data-v-app],[data-svelte-h]')||el;return{tag:boundary.tagName.toLowerCase(),selector:selectorFor(boundary),path:[...(function*(){let node=el;while(node&&node!==frame.contentDocument.body){yield selectorFor(node);node=node.parentElement}})()].reverse()}};
frame.addEventListener('load',()=>{const doc=frame.contentDocument;const style=doc.createElement('style');style.dataset.designosInspector='';style.textContent='[data-designos-hover]{outline:2px dashed #42d392!important;outline-offset:2px}[data-designos-selected]{outline:3px solid #ffcc66!important;outline-offset:3px}';doc.head.append(style);doc.addEventListener('mouseover',event=>{doc.querySelectorAll('[data-designos-hover]').forEach(el=>el.removeAttribute('data-designos-hover'));event.target.setAttribute('data-designos-hover','')},true);doc.addEventListener('mouseout',event=>event.target.removeAttribute('data-designos-hover'),true);doc.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();doc.querySelectorAll('[data-designos-selected]').forEach(el=>el.removeAttribute('data-designos-selected'));const el=event.target;el.setAttribute('data-designos-selected','');const r=el.getBoundingClientRect();selection={selector:selectorFor(el),sourceMarker:el.getAttribute('data-designos-source'),componentBoundary:boundaryFor(el),rect:{x:r.x,y:r.y,width:r.width,height:r.height}};document.getElementById('selection').textContent=JSON.stringify(selection.componentBoundary,null,2);status('Selected '+selection.selector)},true)});
async function refresh(){const [items,session]=await Promise.all([request('/api/annotations'),request('/api/session')]);document.getElementById('annotations').innerHTML=items.map(x=>'<li><strong>'+x.classification+'</strong><br><code>'+x.selector+'</code><br>'+x.note+'</li>').join('');document.getElementById('route-lock').checked=session.locks?.route!==false;document.getElementById('component-lock').checked=session.locks?.component!==false;if(session.selectedSource){document.getElementById('framework').textContent=session.selectedSource.framework||'html';document.getElementById('source').textContent=(session.selectedSource.file||'').split('/').slice(-2).join('/')+':'+(session.selectedSource.line||'?')}}
document.getElementById('annotate').onclick=async()=>{if(!selection)return status('Select an element first',true);try{const item=await request('/api/annotations',{method:'POST',body:JSON.stringify({...selection,classification:document.getElementById('classification').value,note:document.getElementById('note').value})});document.getElementById('framework').textContent=item.source.framework;document.getElementById('source').textContent=item.source.file.split('/').slice(-2).join('/')+':'+(item.source.line||'?');status('Source resolved; choose a variant');await refresh()}catch(error){status(error.message,true)}};
const renderDiff=data=>{const rows=Object.entries(data.diffs).map(([key,value])=>'<div class="diff-row"><span>'+key+'</span><code>'+JSON.stringify(value)+'</code></div>').join('');document.getElementById('diff').innerHTML=rows};
document.querySelectorAll('[data-variant]').forEach(button=>button.onclick=async()=>{activeVariant=button.dataset.variant;document.querySelectorAll('[data-variant]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));frame.src='/target?variant='+activeVariant;try{renderDiff(await request('/api/variants/'+activeVariant+'/diff'));status('Previewing '+activeVariant+'; acceptance will run four gates')}catch(error){status(error.message,true)}});
const locks=async()=>request('/api/locks',{method:'POST',body:JSON.stringify({route:document.getElementById('route-lock').checked,component:document.getElementById('component-lock').checked})});
document.getElementById('route-lock').onchange=locks;document.getElementById('component-lock').onchange=locks;
document.getElementById('accept').onclick=async()=>{if(!activeVariant)return status('Choose a variant first',true);status('Running browser, accessibility, motion and performance gates…');try{const edits=JSON.parse(document.getElementById('merge-edits').value||'[]');const endpoint=edits.length?'/api/merge':'/api/accept';const transaction=await request(endpoint,{method:'POST',body:JSON.stringify({variant:activeVariant,edits,reason:document.getElementById('note').value})});status('Accepted transaction '+transaction.id);frame.src='/target';await refresh()}catch(error){status(error.message,true)}};
document.getElementById('reject').onclick=async()=>{if(!activeVariant)return status('Choose a variant first',true);try{const transaction=await request('/api/reject',{method:'POST',body:JSON.stringify({variant:activeVariant,reason:document.getElementById('note').value})});status('Rejected '+transaction.variant)}catch(error){status(error.message,true)}};
document.getElementById('undo').onclick=async()=>{try{const transaction=await request('/api/rollback',{method:'POST',body:'{}'});status('Rolled back '+transaction.id);frame.src='/target';await refresh()}catch(error){status(error.message,true)}};
refresh().catch(error=>status(error.message,true));</script></body></html>`;
}

function readRequestJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body exceeds 1 MB.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON request body.')); }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function serve(target, options = {}, cwd = process.cwd()) {
  const { files } = initSession(target, cwd);
  const port = Number(options.port) || 4179;
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    try {
      if (request.method === 'GET' && url.pathname === '/') {
        response.setHeader('content-type', 'text/html; charset=utf-8');
        return response.end(directorHtml(files.source));
      }
      if (request.method === 'GET' && url.pathname === '/target') {
        let source = fs.readFileSync(files.source, 'utf8');
        const variant = url.searchParams.get('variant');
        const session = json(files.session);
        if (variant && session.selectedSelector) source = injectVariant(source, session.selectedSelector, variant, session.variants || VARIANTS);
        if (!/<base\b/i.test(source)) source = source.replace(/<head([^>]*)>/i, '<head$1><base href="/assets/">');
        response.setHeader('content-type', 'text/html; charset=utf-8');
        return response.end(source);
      }
      if (request.method === 'GET' && url.pathname.startsWith('/assets/')) {
        const requested = decodeURIComponent(url.pathname.slice('/assets/'.length));
        const assetRoot = path.dirname(files.source);
        const asset = path.resolve(assetRoot, requested);
        if (asset !== assetRoot && !asset.startsWith(`${assetRoot}${path.sep}`)) {
          response.statusCode = 403; return response.end('Forbidden');
        }
        if (!fs.existsSync(asset) || !fs.statSync(asset).isFile()) {
          response.statusCode = 404; return response.end('Not found');
        }
        const extension = path.extname(asset).toLowerCase();
        const contentTypes = {
          '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
        };
        response.setHeader('content-type', contentTypes[extension] || 'application/octet-stream');
        return fs.createReadStream(asset).pipe(response);
      }
      if (request.method === 'GET' && url.pathname === '/api/session') {
        return sendJson(response, 200, json(files.session));
      }
      if (request.method === 'GET' && url.pathname === '/api/annotations') {
        return sendJson(response, 200, json(files.annotations));
      }
      const diffMatch = /^\/api\/variants\/([a-z0-9-]+)\/diff$/.exec(url.pathname);
      if (request.method === 'GET' && diffMatch) {
        return sendJson(response, 200, variantDiff(target, diffMatch[1], cwd));
      }
      if (request.method === 'POST' && url.pathname === '/api/annotations') {
        const item = annotate(target, await readRequestJson(request), cwd);
        await captureAnnotationCrop(target, item, `http://127.0.0.1:${port}/target`, cwd);
        return sendJson(response, 201, item);
      }
      if (request.method === 'POST' && url.pathname === '/api/locks') {
        return sendJson(response, 200, setLocks(target, await readRequestJson(request), cwd));
      }
      if (request.method === 'POST' && url.pathname === '/api/accept') {
        const body = await readRequestJson(request);
        return sendJson(response, 200, acceptVariant(target, body.variant, body.reason, cwd));
      }
      if (request.method === 'POST' && url.pathname === '/api/reject') {
        const body = await readRequestJson(request);
        return sendJson(response, 200, recordRejection(target, body.variant, body.reason, cwd));
      }
      if (request.method === 'POST' && url.pathname === '/api/rollback') {
        await readRequestJson(request);
        return sendJson(response, 200, rollback(target, cwd));
      }
      if (request.method === 'POST' && url.pathname === '/api/merge') {
        const body = await readRequestJson(request);
        return sendJson(response, 200, mergeManualWithVariant(
          target, body.variant, body.edits, body.reason, cwd));
      }
      response.statusCode = 404;
      return response.end('Not found');
    } catch (error) {
      return sendJson(response, 400, { error: error.message, conflicts: error.conflicts || [] });
    }
  });
  server.listen(port, '127.0.0.1', () => {
    writeJson(files.server, { pid: process.pid, port, url: `http://127.0.0.1:${port}`, startedAt: new Date().toISOString() });
    console.log(`DesignOS Live Director: http://127.0.0.1:${port}`);
  });
  return server;
}

module.exports = {
  CLASSIFICATIONS, VARIANTS, initSession, annotate, injectVariant, acceptVariant,
  applyManualEdits, rollback, serve, pathsFor, captureAnnotationCrop, contextualVariants,
  resolveComponentSource, performanceRegressions, transformComponent, detectFramework,
  variantDiff, setLocks, recordRejection, mergeManualWithVariant, directorHtml,
};
