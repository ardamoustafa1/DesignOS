#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SOURCE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less', '.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.js', '.ts']);

function sourceFiles(target) {
  const absolute = path.resolve(target);
  if (!fs.statSync(absolute).isDirectory()) return [absolute];
  const files = [];
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['node_modules', '.git', '.designos', 'dist', 'build'].includes(entry.name)) continue;
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(child);
    }
  };
  walk(absolute);
  return files;
}

const unique = values => [...new Set(values)].sort();
const matches = (source, pattern, group = 1) => [...source.matchAll(pattern)].map(match => match[group]);
const frequency = values => Object.entries(values.reduce((counts, value) => {
  counts[value] = (counts[value] || 0) + 1;
  return counts;
}, {})).sort((left, right) => right[1] - left[1]).map(([value, count]) => ({ value, count }));

function parseNumberScale(source, propertyPattern) {
  const pattern = new RegExp(`(?:${propertyPattern})\\s*:\\s*(-?\\d*\\.?\\d+(?:px|rem|em|ms|s|%|vw|vh))`, 'gi');
  return frequency(matches(source, pattern));
}

function copyTone(source) {
  const text = matches(source, /<(?:h[1-6]|p|button|a|label)[^>]*>([^<>{}]+)</gi)
    .join(' ').replace(/\s+/g, ' ').trim();
  const words = text.match(/[A-Za-zÀ-ÿ0-9'-]+/g) || [];
  const sentences = text.split(/[.!?]+/).filter(value => value.trim());
  const imperatives = (text.match(/\b(?:get|start|try|create|build|explore|view|save|continue|learn|discover)\b/gi) || []).length;
  const exclamations = (text.match(/!/g) || []).length;
  return {
    sample: text.slice(0, 240),
    words: words.length,
    averageSentenceWords: sentences.length ? words.length / sentences.length : 0,
    imperativeRate: words.length ? imperatives / words.length : 0,
    exclamationRate: sentences.length ? exclamations / sentences.length : 0,
    fingerprint: exclamations > 2 ? 'energetic' : imperatives > 2 ? 'directive' : 'measured',
  };
}

function contrastProfile(colors) {
  const parse = hex => {
    let value = hex.slice(1);
    if (value.length === 3) value = [...value].map(char => char + char).join('');
    return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255);
  };
  const luminance = rgb => rgb.map(channel =>
    channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
  const six = colors.filter(value => /^#[0-9a-f]{6}$/i.test(value));
  const ratios = [];
  for (let left = 0; left < six.length; left += 1) {
    for (let right = left + 1; right < six.length; right += 1) {
      const values = [luminance(parse(six[left])), luminance(parse(six[right]))].sort((a, b) => b - a);
      ratios.push({ pair: [six[left], six[right]], ratio: (values[0] + .05) / (values[1] + .05) });
    }
  }
  return {
    measuredPairs: ratios.length,
    aaBodyPairs: ratios.filter(item => item.ratio >= 4.5).length,
    strongest: ratios.sort((a, b) => b.ratio - a.ratio).slice(0, 5),
  };
}

function scanGenome(target) {
  const files = sourceFiles(target);
  const source = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
  const tokenEntries = [...source.matchAll(/(--[\w-]+)\s*:\s*([^;}{]+)/g)]
    .map(match => ({ name: match[1], value: match[2].trim() }));
  const colors = unique([
    ...matches(source, /#[0-9a-f]{3,8}\b/gi, 0).map(value => value.toLowerCase()),
    ...matches(source, /\b(?:rgb|hsl)a?\([^)]*\)/gi, 0).map(value => value.toLowerCase()),
  ]);
  const classNames = matches(source, /class(?:Name)?\s*=\s*["']([^"']+)["']/gi)
    .flatMap(value => value.split(/\s+/)).filter(Boolean);
  const componentFamilies = frequency(classNames.map(name => name.split(/[-_]/)[0]).filter(Boolean)).slice(0, 20);
  const iconSignals = unique([
    ...matches(source, /data-icon\s*=\s*["']([^"']+)/gi),
    ...matches(source, /from\s+["'](?:lucide|@heroicons|react-icons)([^"']*)["']/gi, 0),
    ...matches(source, /<([A-Z][A-Za-z0-9]*(?:Icon|Glyph))\b/g),
  ]);
  const genome = {
    schema: 1,
    target: path.resolve(target),
    files: files.length,
    tokens: {
      declared: tokenEntries,
      categories: frequency(tokenEntries.map(token => token.name.split('-')[2] || 'other')),
      rawValueCandidates: frequency([
        ...colors,
        ...matches(source, /-?\d*\.?\d+(?:px|rem|em|ms|s)\b/gi, 0),
      ].filter(value => !tokenEntries.some(token => token.value === value))).slice(0, 40),
    },
    colorTokens: tokenEntries.filter(token => /color|bg|text|border|accent|#[0-9a-f]|rgb|hsl/i.test(`${token.name} ${token.value}`)),
    colors,
    typeScale: parseNumberScale(source, 'font-size'),
    spacingScale: parseNumberScale(source, 'margin(?:-[\\w]+)?|padding(?:-[\\w]+)?|gap|inset'),
    radii: parseNumberScale(source, 'border-radius'),
    shadows: frequency(matches(source, /box-shadow\s*:\s*([^;}{]+)/gi)),
    borders: frequency(matches(source, /border(?:-[\w]+)?\s*:\s*([^;}{]+)/gi)),
    componentFamilies,
    layoutGrammar: {
      grid: (source.match(/display\s*:\s*grid/gi) || []).length,
      flex: (source.match(/display\s*:\s*flex/gi) || []).length,
      containerQueries: (source.match(/@container\b/gi) || []).length,
      mediaQueries: (source.match(/@media\b/gi) || []).length,
      subgrid: (source.match(/\bsubgrid\b/gi) || []).length,
    },
    motion: {
      durations: parseNumberScale(source, 'transition-duration|animation-duration|transition|animation'),
      easings: frequency(matches(source, /(?:transition-timing-function|animation-timing-function)\s*:\s*([^;}{]+)|cubic-bezier\([^)]+\)/gi, 0)),
      reducedMotionRules: (source.match(/prefers-reduced-motion/gi) || []).length,
    },
    iconFamily: iconSignals.length ? iconSignals : ['not-detected'],
    density: {
      controls: (source.match(/<(?:button|input|select|textarea)\b/gi) || []).length,
      componentsPerFile: files.length ? classNames.length / files.length : 0,
      fingerprint: classNames.length / Math.max(1, files.length) > 30 ? 'dense' : 'balanced',
    },
    contrast: contrastProfile(colors),
    copyTone: copyTone(source),
  };
  
  // Genome 2: Anomaly Detection
  genome.anomalies = {
    duplicateTokens: Object.values(
      tokenEntries.reduce((acc, t) => {
        const v = t.value.toLowerCase();
        if (!acc[v]) acc[v] = [];
        if (!acc[v].includes(t.name)) acc[v].push(t.name);
        return acc;
      }, {})
    ).filter(names => names.length > 1),
    shadowSystem: 
      (source.match(/@apply/g) || []).length > 10 && (source.match(/\bstyled\./g) || []).length > 10 ? 'Tailwind + Styled Components clash' :
      (classNames.filter(n => n.startsWith('tw-') || n.includes(':')).length > 50 && (source.match(/\.module\.css/g) || []).length > 5) ? 'Tailwind + CSS Modules clash' :
      'None detected',
    fontClashes: unique(matches(source, /font-family\s*:\s*([^;}{]+)/gi)).length > 3 ? 'Too many font families declared' : 'None detected',
    abnormalComponents: componentFamilies.filter(f => f.count === 1).map(f => f.value),
  };
  
  // Genome 2: Safe Codemods
  const allValues = frequency([
    ...matches(source, /#[0-9a-f]{3,8}\b/gi, 0).map(value => value.toLowerCase()),
    ...matches(source, /\b(?:rgb|hsl)a?\([^)]*\)/gi, 0).map(value => value.toLowerCase()),
    ...matches(source, /-?\d*\.?\d+(?:px|rem|em|ms|s)\b/gi, 0)
  ]);
  
  genome.codemods = allValues.map(raw => {
    const matchingTokens = tokenEntries.filter(t => t.value.toLowerCase() === raw.value.toLowerCase());
    if (matchingTokens.length > 0 && raw.count > matchingTokens.length) {
      return {
        target: raw.value,
        occurrences: raw.count - matchingTokens.length,
        replacement: `var(${matchingTokens[0].name})`,
        reason: 'Hardcoded value matches existing design token'
      };
    }
  }).filter(Boolean);

  const canonical = JSON.stringify(genome, (key, value) =>
    ['target'].includes(key) ? undefined : value);
  genome.dialectFingerprint = crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 24);
  return genome;
}

function compareGenome(reference, candidate) {
  const refTokens = new Set(reference.tokens.declared.map(token => token.value));
  const candidateRaw = candidate.tokens.rawValueCandidates;
  const drift = candidateRaw.filter(item => !refTokens.has(item.value));
  const sharedFamilies = candidate.componentFamilies.filter(item =>
    reference.componentFamilies.some(ref => ref.value === item.value));
  const conformity = reference.dialectFingerprint === candidate.dialectFingerprint ? 1 : Math.max(0, Math.min(1,
    .4 * (candidateRaw.length ? 1 - drift.length / candidateRaw.length : 1) +
    .3 * (candidate.componentFamilies.length ? sharedFamilies.length / candidate.componentFamilies.length : 1) +
    .3 * (candidate.copyTone.fingerprint === reference.copyTone.fingerprint ? 1 : 0)));
  return {
    schema: 1,
    referenceFingerprint: reference.dialectFingerprint,
    candidateFingerprint: candidate.dialectFingerprint,
    conformity,
    drift,
    tokenProposals: drift.filter(item => item.count >= 2).map((item, index) => ({
      proposedToken: `--candidate-${index + 1}`,
      value: item.value,
      occurrences: item.count,
      reason: 'Repeated value is outside the reference dialect and should be governed centrally.',
    })),
    missingSystemTokens: reference.tokens.declared.filter(token =>
      !candidate.tokens.declared.some(item => item.name === token.name)).map(token => token.name),
  };
}

function generateDesignMd(genome, outputPath) {
  const md = `# Design DNA
Generated by DesignOS Genome 2

## Typography
- **Sizes**: ${genome.typeScale.map(s => s.value).join(', ') || 'None found'}

## Spacing & Layout
- **Spacing**: ${genome.spacingScale.map(s => s.value).join(', ') || 'None found'}
- **Radii**: ${genome.radii.map(s => s.value).join(', ') || 'None found'}
- **Grid Contexts**: ${genome.layoutGrammar.grid}
- **Container Queries**: ${genome.layoutGrammar.containerQueries}

## Colors
${genome.tokens.declared.filter(t => /color|bg|text|border|fill|stroke/i.test(t.name)).map(t => `- \`${t.name}\`: ${t.value}`).join('\n') || '*No semantic colors declared*'}

## Anomalies & Technical Debt
- **Duplicate Tokens**: ${genome.anomalies.duplicateTokens.map(d => d.join(' = ')).join(' | ') || 'None'}
- **Shadow Systems**: ${genome.anomalies.shadowSystem}
- **Font Clashes**: ${genome.anomalies.fontClashes}
- **Abnormal Components**: ${genome.anomalies.abnormalComponents.join(', ') || 'None'}

## Recommended Codemods
\`\`\`json
${JSON.stringify(genome.codemods, null, 2)}
\`\`\`
`;
  fs.writeFileSync(path.join(path.dirname(outputPath), 'DESIGN.md'), md);
}

function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback = '') => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: design-genome <project> [--compare component] [--out genome.json] [--export-design-md]');
  const genome = scanGenome(target);
  const compareTarget = value('--compare');
  const result = compareTarget ? { genome, comparison: compareGenome(genome, scanGenome(compareTarget)) } : genome;
  const output = path.resolve(value('--out', '.designos/design-genome.json'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  if (args.includes('--export-design-md')) {
    generateDesignMd(genome, output);
  }
  console.log(`design-genome: ${genome.files} files → ${genome.dialectFingerprint}`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.stack || error.message); process.exit(1); }
}
module.exports = { sourceFiles, scanGenome, compareGenome };
