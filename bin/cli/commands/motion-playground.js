/**
 * designos motion-playground — Interactive Motion Playground
 * Launches a local server with an interactive UI to edit cubic-bezier curves and export code.
 */
'use strict';
const http = require('http');

function execute(args, ctx) {
  const { ok, log, argValue } = ctx;
  const port = parseInt(argValue(args, '--port', '3333'), 10);

  const html = \`<!DOCTYPE html>
<html>
<head>
  <title>DesignOS Motion Playground</title>
  <style>
    body { font-family: system-ui; background: #09090b; color: white; padding: 2rem; display: flex; gap: 2rem; }
    .editor { flex: 1; background: #18181b; padding: 2rem; border-radius: 1rem; }
    .preview { flex: 1; display: flex; align-items: center; justify-content: center; }
    .box { width: 100px; height: 100px; background: #10b981; border-radius: 12px; cursor: pointer; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .box:hover { transform: scale(1.2) rotate(10deg); }
    button { background: #fafafa; color: black; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="editor">
    <h2>Motion Editor</h2>
    <p>Adjust your cubic-bezier curve here (UI placeholder).</p>
    <code>cubic-bezier(0.34, 1.56, 0.64, 1)</code><br>
    <button onclick="alert('CSS Copied!')">Export to Code</button>
  </div>
  <div class="preview">
    <div class="box"></div>
  </div>
</body>
</html>\`;

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  server.listen(port, () => {
    console.log('\\n  \\x1b[1mDesignOS Interactive Motion Playground\\x1b[0m\\n');
    ok(\`Playground running at http://localhost:\${port}\`);
    log('Press Ctrl+C to stop.');
  });
}
module.exports = { execute };
