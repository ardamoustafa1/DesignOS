'use strict';

const crypto = require('crypto');

const ALLOWED_HOSTS = new Set(['21st.dev', 'api.21st.dev', 'github.com', 'raw.githubusercontent.com']);
const ALLOWED_LICENSES = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'CC0-1.0']);
const MAX_SOURCE_BYTES = 256 * 1024;

function validateSourceUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Component sources must use HTTPS.');
  if (url.username || url.password || url.port) throw new Error('Component source URLs cannot contain credentials or custom ports.');
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error(`Component source host is not allowlisted: ${url.hostname}`);
  return url;
}

function inspectSource(source) {
  const findings = [];
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) findings.push('source-size-limit');
  if (/<script[^>]+src\s*=|import\s*\(\s*['"]https?:|fetch\s*\(\s*['"]https?:/i.test(source)) findings.push('remote-runtime-dependency');
  if (/eval\s*\(|new\s+Function\s*\(/.test(source)) findings.push('dynamic-code-execution');
  if (/process\.env\.|(?:api|secret|token)[_-]?key\s*[:=]/i.test(source)) findings.push('credential-access-pattern');
  return findings;
}

function quarantineComponent(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Component ingestion requires a manifest.');
  const url = validateSourceUrl(input.sourceUrl);
  const source = String(input.source || '');
  if (!source.trim()) throw new Error('Component source is empty.');
  const license = String(input.license || 'UNKNOWN');
  const findings = inspectSource(source);
  if (!ALLOWED_LICENSES.has(license)) findings.push('license-review-required');
  const digest = crypto.createHash('sha256').update(source).digest('hex');
  return Object.freeze({
    schema: 'designos.component-quarantine/v1',
    id: input.id || `component-${digest.slice(0, 12)}`,
    provider: input.provider || url.hostname,
    sourceUrl: url.toString(),
    license,
    attribution: String(input.attribution || ''),
    digest,
    bytes: Buffer.byteLength(source, 'utf8'),
    findings: Object.freeze(findings),
    status: 'QUARANTINED',
    source,
  });
}

function promoteComponent(record, review) {
  if (record?.schema !== 'designos.component-quarantine/v1') throw new TypeError('Promotion requires a quarantined component record.');
  if (!review || review.approved !== true || !review.reviewer) throw new Error('A named human or policy reviewer must approve promotion.');
  if (record.findings.length) throw new Error(`Component cannot be promoted with findings: ${record.findings.join(', ')}`);
  if (!ALLOWED_LICENSES.has(record.license)) throw new Error('Component license is not approved.');
  return Object.freeze({
    ...record,
    status: 'CERTIFIED',
    certifiedAt: new Date().toISOString(),
    reviewer: String(review.reviewer),
    reviewEvidence: String(review.evidence || ''),
  });
}

module.exports = { ALLOWED_HOSTS, ALLOWED_LICENSES, MAX_SOURCE_BYTES, inspectSource, promoteComponent, quarantineComponent, validateSourceUrl };
