#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Greedy Pairwise (All-Pairs) Generator
function generatePairwise(parameters) {
  const keys = Object.keys(parameters);
  const pairs = [];
  
  // Generate all pairs
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      for (const val1 of parameters[keys[i]]) {
        for (const val2 of parameters[keys[j]]) {
          pairs.push({ [keys[i]]: val1, [keys[j]]: val2 });
        }
      }
    }
  }

  const uncoveredPairs = [...pairs];
  const testCases = [];

  while (uncoveredPairs.length > 0) {
    const testCase = {};
    // Greedily fill the test case
    for (const key of keys) {
      // Find the value that covers the most uncovered pairs given the current testCase
      let bestVal = parameters[key][0];
      let maxCovered = -1;
      
      for (const val of parameters[key]) {
        let coveredCount = 0;
        for (const pair of uncoveredPairs) {
          const pairKeys = Object.keys(pair);
          if (pairKeys.includes(key) && pair[key] === val) {
            const otherKey = pairKeys.find(k => k !== key);
            if (!testCase.hasOwnProperty(otherKey) || testCase[otherKey] === pair[otherKey]) {
              coveredCount++;
            }
          }
        }
        if (coveredCount > maxCovered) {
          maxCovered = coveredCount;
          bestVal = val;
        }
      }
      testCase[key] = bestVal;
    }
    
    testCases.push(testCase);
    
    // Remove covered pairs
    for (let i = uncoveredPairs.length - 1; i >= 0; i--) {
      const pair = uncoveredPairs[i];
      const pk = Object.keys(pair);
      if (testCase[pk[0]] === pair[pk[0]] && testCase[pk[1]] === pair[pk[1]]) {
        uncoveredPairs.splice(i, 1);
      }
    }
  }

  return testCases;
}

const DIMENSIONS = {
  loading: [false, true],
  empty: [false, true],
  error: [false, true],
  partial: [false, true],
  stale: [false, true],
  offline: [false, true],
  unauthorized: [false, true],
  role: ['admin', 'user', 'guest'],
  longContent: [false, true],
  missingMedia: [false, true],
  slowNetwork: [false, true],
  optimistic: [false, true],
  concurrent: [false, true],
  retry: [false, true],
  interrupted: [false, true]
};

function applyStateMutations(sourceHtml, state) {
  let html = sourceHtml;
  
  if (state.empty) {
    html = html.replace(/(<ul[^>]*>|<ol[^>]*>|<tbody[^>]*>)([\s\S]*?)(<\/ul>|<\/ol>|<\/tbody>)/gi, '$1$3');
  }
  
  if (state.longContent) {
    html = html.replace(/(<p[^>]*>|<span[^>]*>|<h[1-6][^>]*>)(.*?)(<\/p>|<\/span>|<\/h[1-6]>)/gi, 
      (match, p1, p2, p3) => `${p1}${p2} Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft 漢語 ${p3}`);
  }
  
  if (state.missingMedia) {
    html = html.replace(/<img([^>]*)src=["'][^"']+["']/gi, '<img$1');
  }
  
  // Wrap in state container for CSS targeting
  const classes = Object.entries(state)
    .filter(([k, v]) => v === true || typeof v === 'string')
    .map(([k, v]) => `state-${k}${typeof v === 'string' ? '-' + v : ''}`)
    .join(' ');
    
  return `<div class="variant-container ${classes}" data-state='${JSON.stringify(state)}'>
    <div class="variant-header">${Object.entries(state).filter(([k,v]) => v===true || typeof v === 'string').map(([k,v]) => typeof v==='string' ? v : k).join(', ') || 'happy-path'}</div>
    <div class="variant-body">${html}</div>
  </div>`;
}

function exploreStateSpace(sourceHtml) {
  const testCases = generatePairwise(DIMENSIONS);
  
  // Ensure the happy path (all false, role user) is included
  const happyPath = Object.fromEntries(Object.keys(DIMENSIONS).map(k => [k, k === 'role' ? 'user' : false]));
  if (!testCases.some(tc => JSON.stringify(tc) === JSON.stringify(happyPath))) {
    testCases.unshift(happyPath);
  }

  const variantsHtml = testCases.map(tc => applyStateMutations(sourceHtml, tc)).join('\n');
  
  const doc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>State Space Explorer</title>
  <style>
    body { font-family: system-ui; background: #f0f0f0; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
    .variant-container { background: white; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; }
    .variant-header { background: #111; color: white; padding: 8px; font-size: 12px; font-family: monospace; }
    .variant-body { padding: 16px; position: relative; }
    
    /* Simulated States */
    .state-loading .variant-body::after { content: 'Loading...'; position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; }
    .state-error .variant-body::before { content: '⚠️ Error occurred'; display: block; background: #fee; color: red; padding: 8px; margin-bottom: 16px; }
    .state-offline .variant-body::before { content: '🌐 Offline mode'; display: block; background: #555; color: white; padding: 8px; margin-bottom: 16px; }
    .state-unauthorized .variant-body { filter: blur(4px); pointer-events: none; }
  </style>
</head>
<body>
  <h1>State Space Explorer</h1>
  <p>Generated ${testCases.length} pairwise variants from 49,152 possible combinations.</p>
  <div class="grid">
    ${variantsHtml}
  </div>
</body>
</html>`;

  return { html: doc, count: testCases.length };
}

function main() {
  const args = process.argv.slice(2);
  const target = args.find(arg => !arg.startsWith('--'));
  if (!target) throw new Error('Usage: state-space-explorer <component.html>');
  
  const sourceHtml = fs.readFileSync(path.resolve(target), 'utf8');
  const result = exploreStateSpace(sourceHtml);
  
  const outputPath = path.resolve('.designos/state-space.html');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.html);
  
  console.log(`state-space-explorer: Capped 49,152 permutations to ${result.count} optimal pairs.`);
  console.log(`Output: ${path.relative(process.cwd(), outputPath)}`);
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exit(1); }
}

module.exports = { generatePairwise, DIMENSIONS, exploreStateSpace };
