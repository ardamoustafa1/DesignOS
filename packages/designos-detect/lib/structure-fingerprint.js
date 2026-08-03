'use strict';

/**
 * A structural fingerprint for an HTML page — the shape of its section/heading order and
 * class vocabulary, deliberately blind to copy, color, and imagery. Two pages with wildly
 * different content but the same "hero > 3-card grid > pricing table > footer-cta" skeleton
 * fingerprint near-identically; that sameness is exactly what `brain/originality.md` calls
 * a costume rather than a system, and prose review can miss it across dozens of briefs.
 *
 * This is NOT a visual-similarity or plagiarism detector — it reads markup structure only,
 * has no notion of what the page looks like rendered, and a page that shuffles its landmark
 * order while keeping the same content would score as dissimilar despite being the same
 * design. Treat a high score as "go look at these two side by side," never as a verdict.
 */
const LANDMARK_TAGS = new Set(['header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'h1', 'h2', 'h3']);

/** Extracts the ordered sequence of landmark elements as `tag.firstClass` (or bare `tag`). */
function landmarkSequence(html) {
  const stripped = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ');
  const sequence = [];
  for (const match of stripped.matchAll(/<([a-zA-Z0-9-]+)\b([^>]*)>/g)) {
    const tag = match[1].toLowerCase();
    if (!LANDMARK_TAGS.has(tag)) continue;
    const classAttr = /\bclass\s*=\s*["']([^"']*)["']/.exec(match[2]);
    const firstClass = classAttr ? classAttr[1].trim().split(/\s+/)[0] : '';
    sequence.push(firstClass ? `${tag}.${firstClass}` : tag);
  }
  return sequence;
}

/** Order-sensitive trigram shingles over the landmark sequence — the actual fingerprint. */
function shingles(sequence, size = 3) {
  const set = new Set();
  for (let i = 0; i <= sequence.length - size; i++) set.add(sequence.slice(i, i + size).join('>'));
  if (!set.size && sequence.length) set.add(sequence.join('>'));   // short pages: whole sequence is the one shingle
  return set;
}

function fingerprint(html) {
  const sequence = landmarkSequence(html);
  return { sequence, shingles: shingles(sequence) };
}

/** Jaccard similarity of two shingle sets, 0 (nothing shared) to 1 (identical shape). */
function similarity(a, b) {
  if (!a.size && !b.size) return 0;   // two empty pages aren't "identical," they're both unmeasurable
  let intersection = 0;
  for (const s of a) if (b.has(s)) intersection++;
  const union = a.size + b.size - intersection;
  return union ? intersection / union : 0;
}

module.exports = { fingerprint, similarity, landmarkSequence, shingles, LANDMARK_TAGS };
