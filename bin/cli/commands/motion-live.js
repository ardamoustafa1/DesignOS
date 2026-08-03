/**
 * designos motion-live — Live Motion Profiler
 *
 * Injects a real-time dev overlay into a target web page (via a local proxy server)
 * to monitor:
 *   - Frame rate (FPS)
 *   - Layout thrashing events (via PerformanceObserver / LoAF)
 *   - Main thread blocking time
 *
 * Usage:
 *   designos motion-live http://localhost:3000
 */

'use strict';
const http = require('http');

const INJECTED_SCRIPT = `
<script>
(function() {
  const overlay = document.createElement('div');
  overlay.id = 'designos-motion-live-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', bottom: '16px', right: '16px', zIndex: 999999,
    background: 'rgba(9, 9, 11, 0.9)', color: '#fafafa',
    fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '12px',
    padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: '8px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', pointerEvents: 'none', minWidth: '180px'
  });
  
  const createRow = (label, initialVal, color = '#34d399') => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.justifyContent = 'space-between';
    
    const l = document.createElement('span'); l.style.color = '#a1a1aa'; l.innerText = label;
    const v = document.createElement('span'); v.style.color = color; v.style.fontWeight = 'bold'; v.innerText = initialVal;
    
    row.appendChild(l); row.appendChild(v);
    overlay.appendChild(row);
    return v;
  };
  
  const fpsEl = createRow('FPS', '60');
  const loafEl = createRow('Long Frames', '0', '#f87171');
  const thrashEl = createRow('Layout Shifts', '0', '#fbbf24');
  
  document.body.appendChild(overlay);
  
  // FPS calculation
  let frames = 0, lastTime = performance.now();
  const loop = (now) => {
    frames++;
    if (now - lastTime >= 1000) {
      fpsEl.innerText = frames;
      fpsEl.style.color = frames >= 55 ? '#34d399' : frames >= 30 ? '#fbbf24' : '#f87171';
      frames = 0; lastTime = now;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  
  // PerformanceObserver for Long Animation Frames (LoAF) and Layout Shifts
  let longFrames = 0;
  let layoutShifts = 0;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask' || entry.entryType === 'long-animation-frame') {
          longFrames++;
          loafEl.innerText = longFrames;
        } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          layoutShifts++;
          thrashEl.innerText = layoutShifts;
        }
      }
    }).observe({ entryTypes: ['longtask', 'layout-shift'] });
  } catch (e) {}
})();
</script>
`;

function execute(args, ctx) {
  const { ok, log, fail } = ctx;
  const targetUrl = args.filter(a => !a.startsWith('--'))[0];
  
  if (!targetUrl || !targetUrl.startsWith('http')) {
    fail('Usage: designos motion-live <http://localhost:PORT>');
  }

  // Create a simple reverse proxy that injects the overlay script before </body>
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, targetUrl);
    
    http.get(url, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
        let body = '';
        proxyRes.on('data', chunk => body += chunk);
        proxyRes.on('end', () => {
          body = body.replace('</body>', INJECTED_SCRIPT + '</body>');
          res.end(body);
        });
      } else {
        proxyRes.pipe(res);
      }
    }).on('error', (err) => {
      res.writeHead(502);
      res.end('Proxy Error: ' + err.message);
    });
  });

  const port = 4000;
  server.listen(port, () => {
    console.log('\\n  \\x1b[1mDesignOS Live Motion Profiler\\x1b[0m\\n');
    console.log(\`  Targeting: \${targetUrl}\`);
    ok(\`Proxy running at: http://localhost:\${port}\`);
    log('Open the proxy URL in your browser to see the live motion overlay.');
    log('Press Ctrl+C to stop.\\n');
  });
}

module.exports = { execute };
