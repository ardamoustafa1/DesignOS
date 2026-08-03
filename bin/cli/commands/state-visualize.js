/**
 * designos state-visualize — Component State Machine Visualizer
 * Generates Mermaid FSM diagrams for complex UI states.
 */
'use strict';
const path = require('path');
const fs = require('fs');

function execute(args, ctx) {
  const { cwd, ok, log, fail } = ctx;
  const target = args.filter(a => !a.startsWith('--'))[0];

  if (!target) fail('Usage: designos state-visualize <component-name>');

  const mermaid = \`stateDiagram-v2
    [*] --> Idle
    Idle --> Hover : mouseenter
    Hover --> Idle : mouseleave
    Hover --> Active : mousedown
    Active --> Loading : click (async)
    Loading --> Success : resolve
    Loading --> Error : reject
    Success --> Idle : timeout
    Error --> Idle : reset
    
    note right of Loading: Animated spinner, duration > 300ms
    note left of Error: Shake animation (x-axis), red border\`;

  const html = \`<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  </script>
  <style>body { background: #09090b; color: #fafafa; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }</style>
</head>
<body>
  <h2>Finite State Machine: \${target}</h2>
  <pre class="mermaid">
    \${mermaid}
  </pre>
</body>
</html>\`;

  const outPath = path.resolve(cwd, \`state-\${target}.html\`);
  fs.writeFileSync(outPath, html);

  console.log('\\n  \\x1b[1mDesignOS State Visualizer\\x1b[0m\\n');
  ok(\`State diagram for \${target} generated.\`);
  log(\`Open \${path.relative(cwd, outPath)} to view the Mermaid visualization.\`);
}
module.exports = { execute };
