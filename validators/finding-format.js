'use strict';

/**
 * Shared "--json" plumbing for the text-based validators (check-drift.js,
 * check-a11y-basics.js, check-token-contrast.js). Each of those already builds a
 * findings array as `"file:line  rule-id  message"` strings; this module is the one
 * place that turns that convention into a structured, severity-tagged object so
 * `run-registry.js --json-out` (and `designos detect`) can emit one flat, machine-
 * readable findings array instead of a blob of provider stdout per validator.
 *
 * Severity is resolved from the central rule registry when the emitting rule id is
 * registered there; validators that mint their own short rule names (raw-hex,
 * img-no-alt, contrast-fail, ...) fall back to the local map passed in, and finally
 * to P2 — never silently dropped, never invented as P0/P1 without a source.
 */
const LINE_RE = /^(.+?):(\d+)\s{2}([\w-]+)\s{2}([\s\S]*)$/;

function parseLine(line, severityFor) {
  const m = LINE_RE.exec(line);
  if (!m) return { file: '', line: 0, rule: '', severity: 'P2', message: line };
  const [, file, ln, rule, message] = m;
  return { file, line: Number(ln), rule, severity: severityFor(rule), message };
}

/** Build a severity resolver: local map first, then the shared registry, then P2. */
function severityResolver(localMap = {}) {
  let registry = null;
  try { registry = require('./rule-registry'); } catch (_) { /* optional */ }
  return (rule) => localMap[rule]
    || (registry && registry.RULES.find(r => r.id === rule)?.severity)
    || 'P2';
}

function emitJson(target, findings, severityFor) {
  const structured = findings.map(f => parseLine(f, severityFor));
  console.log(JSON.stringify({ target, findings: structured, count: structured.length }, null, 2));
  return structured;
}

module.exports = { parseLine, severityResolver, emitJson, LINE_RE };
