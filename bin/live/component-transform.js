'use strict';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

const VARIANT_TRANSFORMS = Object.freeze({
  a: Object.freeze({
    name: 'Material-led', direction: 'material-led', slotOrder: ['copy', 'content', 'proof', 'actions'],
    copyHierarchy: 'headline-support-detail', ctaOrder: 'primary-first', state: 'ready',
    motion: 'feedback-only', responsive: 'stack-below-48rem', proofPlacement: 'after-copy',
    tokenDiff: { '--designos-direction-gap': '1rem', '--designos-direction-measure': '68ch' },
    motionGraphDiff: { initial: 'idle', signature: 'product-artifact', exit: 'idle' },
    accessibilityImpact: 'DOM reading order remains copy → artifact → proof → action; focus order follows DOM.',
    performanceImpact: 'No signature motion; transform/opacity feedback only.',
    proofProvenance: 'Proof remains adjacent to the product material it substantiates.',
  }),
  b: Object.freeze({
    name: 'Audience-led', direction: 'audience-led', slotOrder: ['proof', 'copy', 'actions', 'content'],
    copyHierarchy: 'proof-headline-support', ctaOrder: 'primary-first', state: 'decision-ready',
    motion: 'enter-fast-exit-faster', responsive: 'actions-inline-above-48rem', proofPlacement: 'before-copy',
    tokenDiff: { '--designos-direction-gap': '0.75rem', '--designos-direction-measure': '62ch' },
    motionGraphDiff: { initial: 'proof', enter: 'decision-ready', exit: 'proof', interruptible: true },
    accessibilityImpact: 'Verified proof precedes the claim; primary action remains first in its action group.',
    performanceImpact: 'Compact entrance ≤150ms and faster exit; no layout animation.',
    proofProvenance: 'Proof source is promoted before the claim for a skeptical evaluator.',
  }),
  c: Object.freeze({
    name: 'Belief-led', direction: 'belief-led', slotOrder: ['copy', 'content', 'actions', 'proof'],
    copyHierarchy: 'product-truth-headline-proof', ctaOrder: 'primary-first', state: 'signature-ready',
    motion: 'origin-aware-signature', responsive: 'signature-split-above-64rem', proofPlacement: 'after-action',
    tokenDiff: { '--designos-direction-gap': '1.5rem', '--designos-direction-measure': '58ch' },
    motionGraphDiff: { initial: 'belief', enter: 'verified', exit: 'belief', interruptible: true },
    accessibilityImpact: 'Belief statement remains first; visual signature cannot reorder semantic content.',
    performanceImpact: 'One origin-aware signature; maximum three concurrent compositor animations.',
    proofProvenance: 'Proof follows the action as explicit verification, never as an unlinked badge.',
  }),
});

function scanTag(source, start) {
  let quote = null;
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '>') return index + 1;
  }
  throw new Error(`Unterminated markup tag at offset ${start}`);
}

function parseAttributes(raw) {
  const attributes = {};
  const pattern = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s>]+)))?/g;
  let match;
  while ((match = pattern.exec(raw))) attributes[match[1]] = match[2] ?? match[3] ?? match[4] ?? match[5] ?? true;
  return attributes;
}

function parseComponentAst(source) {
  const root = { tag: '#root', start: 0, end: source.length, children: [], parent: null };
  const stack = [root];
  let index = 0;
  while (index < source.length) {
    const start = source.indexOf('<', index);
    if (start < 0) break;
    if (source.startsWith('<!--', start)) {
      const end = source.indexOf('-->', start + 4);
      index = end < 0 ? source.length : end + 3;
      continue;
    }
    if (/^<!|^<\?/.test(source.slice(start, start + 2))) {
      index = scanTag(source, start);
      continue;
    }
    const tagEnd = scanTag(source, start);
    const raw = source.slice(start, tagEnd);
    const close = /^<\//.test(raw);
    const name = /^<\/?\s*([A-Za-z][\w:.-]*)/.exec(raw)?.[1];
    if (!name) { index = tagEnd; continue; }
    const tag = name.toLowerCase();
    if (close) {
      for (let cursor = stack.length - 1; cursor > 0; cursor -= 1) {
        if (stack[cursor].tag.toLowerCase() === tag) {
          const node = stack[cursor];
          node.endTagStart = start;
          node.end = tagEnd;
          stack.length = cursor;
          break;
        }
      }
    } else {
      const attributeRaw = raw.replace(/^<\s*[A-Za-z][\w:.-]*/, '').replace(/\/?>$/, '');
      const parent = stack.at(-1);
      const node = {
        tag: name, attributes: parseAttributes(attributeRaw), start, startTagEnd: tagEnd,
        endTagStart: null, end: tagEnd, children: [], parent,
        selfClosing: /\/>\s*$/.test(raw) || VOID.has(tag),
      };
      parent.children.push(node);
      if (!node.selfClosing) stack.push(node);
    }
    index = tagEnd;
  }
  for (const node of stack.slice(1)) if (!node.endTagStart) throw new Error(`Unclosed component tag <${node.tag}> at offset ${node.start}`);
  return root;
}

function allNodes(root) {
  return root.children.flatMap(node => [node, ...allNodes(node)]);
}

function selectorMatches(node, selector) {
  if (selector.startsWith('#')) return node.attributes.id === selector.slice(1);
  if (selector.startsWith('.')) {
    const value = node.attributes.class ?? node.attributes.className ?? '';
    return String(value).split(/\s+/).includes(selector.slice(1));
  }
  const dataTest = /^\[data-testid=(?:"([^"]+)"|'([^']+)'|([^\]]+))\]$/.exec(selector);
  if (dataTest) return node.attributes['data-testid'] === (dataTest[1] || dataTest[2] || dataTest[3]);
  return node.tag.toLowerCase() === selector.toLowerCase();
}

function findNode(root, selector) {
  const matches = allNodes(root).filter(node => selectorMatches(node, selector));
  if (matches.length !== 1) throw new Error(`Component selector "${selector}" must resolve exactly once; matched ${matches.length}.`);
  return matches[0];
}

function setAttributes(opening, attributes) {
  let result = opening;
  for (const [name, value] of Object.entries(attributes)) {
    const encoded = String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(\\s${escaped}\\s*=\\s*)(?:"[^"]*"|'[^']*'|\\{[^}]*\\}|[^\\s>]+)`);
    if (pattern.test(result)) result = result.replace(pattern, `$1"${encoded}"`);
    else result = result.replace(/(\s*\/?>)$/, ` ${name}="${encoded}"$1`);
  }
  return result;
}

function kindOf(node) {
  const tag = node.tag.toLowerCase();
  const classes = String(node.attributes.class ?? node.attributes.className ?? '').toLowerCase();
  if (node.attributes['data-proof'] !== undefined || /proof|metric|testimonial|trust/.test(classes)) return 'proof';
  if (['button', 'a'].includes(tag) || /actions?|cta/.test(classes)) return 'actions';
  if (/^h[1-6]$/.test(tag) || tag === 'p' || /copy|headline|description|lede/.test(classes)) return 'copy';
  return 'content';
}

function addRank(snippet, name, value) {
  return snippet.replace(/^(\s*<[A-Za-z][^>]*?)(\/?>)/, `$1 ${name}="${value}"$2`);
}

function isPrimaryAction(snippet) {
  return /data-primary|aria-current|class(?:Name)?=["'][^"']*(?:primary|main|accent)/i.test(snippet);
}

function transformComponent(source, selector, variantId, variants = VARIANT_TRANSFORMS) {
  const variant = variants[variantId];
  const transform = variant?.transform || variant;
  if (!transform) throw new Error(`Unknown component variant: ${variantId}`);
  const ast = parseComponentAst(source);
  const target = findNode(ast, selector);
  if (target.selfClosing || target.endTagStart == null) throw new Error(`Selected <${target.tag}> cannot host component slots.`);

  const existingStyle = target.attributes.style && target.attributes.style !== true
    ? String(target.attributes.style).replace(/;?\s*$/, ';') : '';
  const tokenStyle = Object.entries(transform.tokenDiff || {})
    .map(([name, value]) => `${name}:${value}`).join(';');
  const opening = setAttributes(source.slice(target.start, target.startTagEnd), {
    'data-designos-live': variantId,
    'data-designos-component': variant?.name || transform.name,
    'data-state': transform.state,
    'data-motion': transform.motion,
    'data-responsive': transform.responsive,
    'data-copy-hierarchy': transform.copyHierarchy,
    'data-cta-order': transform.ctaOrder,
    'data-proof-placement': transform.proofPlacement,
    'data-direction': transform.direction,
    'data-motion-graph': JSON.stringify(transform.motionGraphDiff || {}),
    'data-proof-provenance': transform.proofProvenance || '',
    style: `${existingStyle}${tokenStyle}${tokenStyle ? ';' : ''}`,
  });
  const closing = source.slice(target.endTagStart, target.end);
  const buckets = { copy: [], proof: [], actions: [], content: [] };
  let cursor = target.startTagEnd;
  for (const child of target.children) {
    const gap = source.slice(cursor, child.start);
    if (gap.trim()) buckets.content.push(gap);
    const existingSlot = child.attributes['data-slot'];
    if (existingSlot && buckets[existingSlot] && child.endTagStart != null) {
      if (child.children.length) {
        for (const grandchild of child.children) {
          buckets[kindOf(grandchild)].push(source.slice(grandchild.start, grandchild.end));
        }
      } else {
        const inner = source.slice(child.startTagEnd, child.endTagStart);
        if (inner.trim()) buckets[existingSlot].push(inner);
      }
    } else buckets[kindOf(child)].push(source.slice(child.start, child.end));
    cursor = child.end;
  }
  const tail = source.slice(cursor, target.endTagStart);
  if (tail.trim()) buckets.content.push(tail);
  buckets.copy = buckets.copy
    .sort((left, right) => Number(/^<p\b/i.test(left.trim())) - Number(/^<p\b/i.test(right.trim())))
    .map((snippet, position) =>
    addRank(snippet, 'data-copy-rank', position === 0 ? 'primary' : position === 1 ? 'supporting' : 'detail'));
  buckets.actions = buckets.actions
    .sort((left, right) => Number(isPrimaryAction(right)) - Number(isPrimaryAction(left)))
    .map((snippet, position) => addRank(snippet, 'data-cta-priority', position === 0 ? 'primary' : 'secondary'));

  const hasChildren = Object.values(buckets).some(items => items.length);
  const slotTag = ['button', 'a', 'label', 'span', 'strong', 'em'].includes(target.tag.toLowerCase()) ? 'span' : 'div';
  const slots = hasChildren
    ? transform.slotOrder.filter(kind => buckets[kind].length)
      .map(kind => `\n  <${slotTag} data-slot="${kind}">\n    ${buckets[kind].join('\n    ')}\n  </${slotTag}>`).join('')
    : `\n  <${slotTag} data-slot="content">${source.slice(target.startTagEnd, target.endTagStart)}</${slotTag}>`;
  const component = `${opening}${slots}\n${closing}`;
  return {
    source: source.slice(0, target.start) + component + source.slice(target.end),
    ast: { selector, tag: target.tag, range: [target.start, target.end], childCount: target.children.length },
    changes: {
      componentTree: true, slotStructure: true, copyHierarchy: true, ctaOrder: true,
      state: true, motion: true, responsiveRules: true, proofPlacement: true,
      designTokens: true, motionGraph: true, accessibilityImpact: true,
      performanceImpact: true, proofProvenance: true,
    },
    impact: {
      accessibility: transform.accessibilityImpact,
      performance: transform.performanceImpact,
      proofProvenance: transform.proofProvenance,
    },
    transform,
  };
}

module.exports = { VARIANT_TRANSFORMS, parseComponentAst, findNode, transformComponent };
