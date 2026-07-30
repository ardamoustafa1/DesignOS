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

function contextualVariants(cwd, annotation = {}) {
  const context = projectContext(cwd);
  const issue = annotation.classification || 'Hierarchy weak';
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

function initSession(target, cwd = process.cwd()) {
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
    variants: existing.variants || contextualVariants(cwd),
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
  };
  annotations.push(item);
  writeJson(files.annotations, annotations);
  session.selectedSelector = item.selector;
  session.selectedSource = item.source;
  session.selectedSourceLock = fs.existsSync(item.source.file)
    ? sha(fs.readFileSync(item.source.file, 'utf8')) : null;
  session.variants = contextualVariants(cwd, item);
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
  const performance = report.results.reduce((summary, item) => ({
    transferBytes: Math.max(summary.transferBytes, item.performance?.transferBytes || 0),
    domContentLoadedMs: Math.max(summary.domContentLoadedMs, item.performance?.domContentLoaded || 0),
    loadMs: Math.max(summary.loadMs, item.performance?.load || 0),
    longTaskMs: Math.max(summary.longTaskMs, item.performance?.longTaskMs || 0),
    layoutShift: Math.max(summary.layoutShift, item.performance?.layoutShift || 0),
  }), { transferBytes: 0, domContentLoadedMs: 0, loadMs: 0, longTaskMs: 0, layoutShift: 0 });
  return { available: true, status: result.status, p1: report.summary.p1, p2: report.summary.p2, performance, report: out };
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
<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0e12;color:#f5f7fa;font:14px/1.5 system-ui}header{display:flex;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid #29313c}button,select,input{min-height:44px;border:1px solid #384352;border-radius:8px;background:#171c23;color:inherit;padding:8px 12px}button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #42d392;outline-offset:2px}main{display:grid;grid-template-columns:1fr 340px;height:calc(100vh - 69px)}iframe{width:100%;height:100%;border:0;background:white}aside{padding:16px;border-left:1px solid #29313c;overflow:auto}.variants{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.variants button{height:auto;min-height:88px}label{display:grid;gap:6px;margin:12px 0}.status{color:#42d392}code{color:#ffcc66}@media(max-width:800px){main{grid-template-columns:1fr;height:auto}iframe{height:65vh}aside{border-left:0;border-top:1px solid #29313c}}</style></head><body>
<header><strong>DesignOS Live Director</strong><span>${path.basename(target)}</span><span class="status" id="status">Select an element in the preview</span></header>
<main><iframe id="preview" src="/target" title="Live target"></iframe><aside>
<label>Issue<select id="classification">${CLASSIFICATIONS.map(item => `<option>${item}</option>`).join('')}</select></label>
<label>Note<input id="note" placeholder="Why this fails and for whom"></label>
<button id="annotate">Save annotation</button>
<h2>Three directions</h2><div class="variants">${Object.entries(VARIANTS).map(([id, item]) => `<button data-variant="${id}"><strong>${item.name}</strong><br><small>${item.rationale}</small></button>`).join('')}</div>
<p>Click a direction to preview. Acceptance is intentionally CLI-only: <code>designos live ${path.basename(target)} --accept a --reason "…"</code>. It runs before/after browser regression first.</p>
<h2>Selection</h2><pre id="selection">none</pre><h2>Annotations</h2><ol id="annotations"></ol>
</aside></main><script>
const frame=document.getElementById('preview');let selection=null;
frame.addEventListener('load',()=>{const doc=frame.contentDocument;doc.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();doc.querySelectorAll('[data-designos-selected]').forEach(el=>el.removeAttribute('data-designos-selected'));const el=event.target;el.setAttribute('data-designos-selected','');const r=el.getBoundingClientRect();const selector=el.id?'#'+CSS.escape(el.id):el.tagName.toLowerCase()+(el.classList[0]?'.'+CSS.escape(el.classList[0]):'');selection={selector,sourceMarker:el.getAttribute('data-designos-source'),rect:{x:r.x,y:r.y,width:r.width,height:r.height}};document.getElementById('selection').textContent=JSON.stringify(selection,null,2);document.getElementById('status').textContent='Selected '+selector},true)});
async function refresh(){const items=await fetch('/api/annotations').then(r=>r.json());document.getElementById('annotations').innerHTML=items.map(x=>'<li><strong>'+x.classification+'</strong><br><code>'+x.selector+'</code><br>'+x.note+'</li>').join('')}
document.getElementById('annotate').onclick=async()=>{if(!selection)return;await fetch('/api/annotations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...selection,classification:document.getElementById('classification').value,note:document.getElementById('note').value})});refresh()};
document.querySelectorAll('[data-variant]').forEach(button=>button.onclick=()=>{frame.src='/target?variant='+button.dataset.variant});
refresh();</script></body></html>`;
}

function serve(target, options = {}, cwd = process.cwd()) {
  const { files } = initSession(target, cwd);
  const port = Number(options.port) || 4179;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
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
    if (request.method === 'GET' && url.pathname === '/api/annotations') {
      response.setHeader('content-type', 'application/json');
      return response.end(fs.readFileSync(files.annotations));
    }
    if (request.method === 'POST' && url.pathname === '/api/annotations') {
      let body = ''; request.on('data', chunk => { body += chunk; });
      request.on('end', async () => {
        try {
          const item = annotate(target, JSON.parse(body), cwd);
          await captureAnnotationCrop(target, item, `http://127.0.0.1:${port}/target`, cwd);
          response.setHeader('content-type', 'application/json'); response.end(JSON.stringify(item));
        } catch (error) { response.statusCode = 400; response.end(error.message); }
      });
      return;
    }
    response.statusCode = 404; response.end('Not found');
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
  resolveComponentSource, performanceRegressions, transformComponent,
};
