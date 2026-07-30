'use strict';

const fs = require('fs');
const path = require('path');

function gestureStudio(args = [], cwd = process.cwd()) {
  const outputIndex = args.indexOf('--out');
  const output = path.resolve(cwd, outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : '.designos/gesture-studio.html');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>DesignOS Gesture Physics Studio</title>
<style>
:root{color-scheme:dark;--bg:#0d0f12;--panel:#15191f;--line:#2c3440;--text:#edf2f7;--muted:#9aa6b2;--accent:#ffcc66;--danger:#ff2d78}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 ui-sans-serif,system-ui;user-select:none;touch-action:none;}
header{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px;background:color-mix(in srgb,var(--panel) 94%,transparent);border-bottom:1px solid var(--line)}
button,select,input{min-height:40px;border:1px solid var(--line);border-radius:8px;background:#20262e;color:var(--text);padding:8px 12px;font:inherit}
button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
button[aria-pressed=true]{border-color:var(--accent);color:var(--accent)}label{display:flex;gap:6px;align-items:center;color:var(--muted)}
main{display:grid;grid-template-columns:1fr 360px;height:calc(100vh - 65px)}
.surface{position:relative;background:var(--bg);overflow:hidden;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--line)}
.box{width:160px;height:160px;background:#42d392;border-radius:24px;cursor:grab;box-shadow:0 12px 32px rgba(66, 211, 146, 0.2);display:flex;align-items:center;justify-content:center;color:#000;font-weight:600;}
.box:active{cursor:grabbing}
.boundaries{position:absolute;top:20%;bottom:20%;left:20%;right:20%;border:2px dashed var(--line);pointer-events:none;border-radius:32px;}
aside{padding:16px;background:var(--panel);overflow:auto}h1{font-size:15px;margin:0 12px 0 0}h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:20px 0 8px}
.metric{display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)}
canvas{width:100%;height:100px;border:1px solid var(--line);border-radius:8px;background:#0b0e12;margin-bottom:8px}
pre{background:#0b0e12;padding:12px;border-radius:8px;border:1px solid var(--line);overflow:auto;font-size:12px;color:var(--accent);margin:0}
</style>
</head>
<body>
<header>
  <h1>Gesture Physics Studio</h1>
  <label>Simulate Hz <select id="hz"><option value="60">60 Hz</option><option value="90">90 Hz</option><option value="120" selected>120 Hz</option></select></label>
  <button id="reset">Reset Position</button>
  <label style="margin-left:auto"><input type="file" id="upload" accept=".json" style="display:none"><button onclick="document.getElementById('upload').click()">Load Gesture</button></label>
</header>
<main>
  <section class="surface" id="surface">
    <div class="boundaries"></div>
    <div class="box" id="box">Drag me</div>
  </section>
  <aside>
    <h2>Live Physics</h2>
    <div class="metric"><span>Pointer Velocity (EMA)</span><strong id="vel">0 px/s</strong></div>
    <div class="metric"><span>Spring Tension</span><input type="number" id="tension" value="200" style="width:80px;height:24px"></div>
    <div class="metric"><span>Spring Friction</span><input type="number" id="friction" value="20" style="width:80px;height:24px"></div>
    <div class="metric"><span>Rubber Band Factor</span><input type="number" id="rubber" value="0.45" step="0.05" style="width:80px;height:24px"></div>
    
    <h2>Velocity History</h2>
    <canvas id="velHistory" width="320" height="100"></canvas>
    
    <h2>Export Code</h2>
    <select id="framework" style="width:100%;margin-bottom:8px">
      <option value="react">React (framer-motion)</option>
      <option value="gsap">GSAP</option>
      <option value="vue">Vue (motion)</option>
      <option value="swiftui">SwiftUI</option>
      <option value="compose">Jetpack Compose</option>
    </select>
    <pre id="codeExport"></pre>
  </aside>
</main>
<script>
const box = document.getElementById('box');
const velDisplay = document.getElementById('vel');
const frameworkSelect = document.getElementById('framework');
const codeExport = document.getElementById('codeExport');

let x = 0, y = 0;
let activePointers = new Set();
let lastTime = 0, lastX = 0, lastY = 0;
let vx = 0, vy = 0;
const velHistory = [];
let springRaf = null;

// EMA settings
const alpha = 0.4; 

function updateCode() {
  const t = document.getElementById('tension').value;
  const f = document.getElementById('friction').value;
  const fw = frameworkSelect.value;
  let code = '';
  if (fw === 'react') code = \`<motion.div\\n  drag\\n  dragConstraints={boundaries}\\n  dragElastic={\${document.getElementById('rubber').value}}\\n  transition={{ type: "spring", stiffness: \${t}, damping: \${f} }}\\n/>\`;
  if (fw === 'gsap') code = \`gsap.to(el, {\\n  x: 0, y: 0,\\n  inertia: { x: { velocity: \${Math.round(vx)} }, y: { velocity: \${Math.round(vy)} } },\\n  duration: 0.5, ease: "power3.out"\\n});\`;
  if (fw === 'swiftui') code = \`.gesture(DragGesture()\\n  .onEnded { value in\\n    withAnimation(.interpolatingSpring(stiffness: \${t}, damping: \${f}, initialVelocity: \${Math.round(Math.abs(vx)/100)})) {\\n      // ...\\n    }\\n  }\\n)\`;
  if (fw === 'vue') code = \`<div v-motion :initial="{ x: 0 }" :enter="{ x: \${Math.round(x)}, transition: { type: 'spring', stiffness: \${t}, damping: \${f} } }" />\`;
  if (fw === 'compose') code = \`animateDecay(initialVelocity = \${Math.round(Math.max(vx, vy))}f, animationSpec = exponentialDecay())\`;
  codeExport.textContent = code;
}

frameworkSelect.onchange = updateCode;
document.getElementById('tension').oninput = updateCode;
document.getElementById('friction').oninput = updateCode;
document.getElementById('rubber').oninput = updateCode;
updateCode();

// Math
function rubberBand(dist, limit, constant) {
  return (limit * dist * constant) / (limit + Math.abs(dist * constant));
}

function render() {
  box.style.transform = \`translate(\${x}px, \${y}px)\`;
}

function simulateSpring(targetX, targetY, velocityX, velocityY) {
  const tension = Number(document.getElementById('tension').value);
  const friction = Number(document.getElementById('friction').value);
  
  const step = () => {
    // Determine simulated Hz delta
    const hz = Number(document.getElementById('hz').value);
    const dt = (1000 / hz) / 1000; 
    
    const forceX = -tension * (x - targetX) - friction * velocityX;
    const forceY = -tension * (y - targetY) - friction * velocityY;
    
    velocityX += forceX * dt;
    velocityY += forceY * dt;
    x += velocityX * dt;
    y += velocityY * dt;
    
    render();
    
    if (Math.abs(x - targetX) < 0.5 && Math.abs(velocityX) < 0.5) {
      x = targetX; y = targetY; render(); return;
    }
    springRaf = requestAnimationFrame(step);
  };
  springRaf = requestAnimationFrame(step);
}

box.addEventListener('pointerdown', e => {
  box.setPointerCapture(e.pointerId);
  activePointers.add(e.pointerId);
  if(activePointers.size > 1) return; // Multitouch cancellation logic
  cancelAnimationFrame(springRaf);
  
  lastX = e.clientX; lastY = e.clientY;
  lastTime = performance.now();
  vx = 0; vy = 0;
});

box.addEventListener('pointermove', e => {
  if(!activePointers.has(e.pointerId)) return;
  const now = performance.now();
  const hz = Number(document.getElementById('hz').value);
  const minDt = 1000 / hz;
  if(now - lastTime < minDt) return;
  
  const dt = (now - lastTime) / 1000;
  
  if (dt > 0.005) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const instVx = dx / dt;
    const instVy = dy / dt;
    
    // EMA velocity tracking
    vx = alpha * instVx + (1 - alpha) * vx;
    vy = alpha * instVy + (1 - alpha) * vy;
    
    // Boundary collision / rubber-banding
    const rb = Number(document.getElementById('rubber').value);
    const limit = 200;
    
    // Apply rubber banding if out of imaginary bounds (e.g. 200px)
    let appliedDx = dx, appliedDy = dy;
    if(x > limit) appliedDx = rubberBand(dx, limit, rb) - rubberBand(0, limit, rb);
    if(x < -limit) appliedDx = rubberBand(dx, -limit, rb) - rubberBand(0, -limit, rb);
    if(y > limit) appliedDy = rubberBand(dy, limit, rb) - rubberBand(0, limit, rb);
    if(y < -limit) appliedDy = rubberBand(dy, -limit, rb) - rubberBand(0, -limit, rb);
    
    x += appliedDx; y += appliedDy;
    
    velHistory.push(Math.sqrt(vx*vx + vy*vy));
    if(velHistory.length > 50) velHistory.shift();
    drawVel();
    
    lastX = e.clientX; lastY = e.clientY;
    lastTime = now;
    velDisplay.textContent = \`\${Math.round(Math.sqrt(vx*vx + vy*vy))} px/s\`;
    updateCode();
  }
  render();
});

box.addEventListener('pointerup', e => {
  activePointers.delete(e.pointerId);
  box.releasePointerCapture(e.pointerId);
  if(activePointers.size > 0) return;
  
  // Handoff velocity to spring returning to origin
  simulateSpring(0, 0, vx, vy);
});

document.getElementById('reset').onclick = () => {
  cancelAnimationFrame(springRaf);
  x = 0; y = 0; vx = 0; vy = 0; render();
};

document.getElementById('upload').onchange = e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      console.log('Loaded gesture data:', data);
      // Logic to auto-extract parameters based on json data could go here
    } catch(err) {
      console.error(err);
    }
  };
  reader.readAsText(file);
};

function drawVel() {
  const canvas = document.getElementById('velHistory');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(velHistory.length < 2) return;
  const max = Math.max(...velHistory, 1000);
  ctx.strokeStyle = '#42d392';
  ctx.beginPath();
  velHistory.forEach((v, i) => {
    const px = (i / 50) * canvas.width;
    const py = canvas.height - (v / max) * canvas.height;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.stroke();
}
</script>
</body></html>`;

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
  return output;
}

module.exports = { gestureStudio };

if (require.main === module) {
  const output = gestureStudio(process.argv.slice(2));
  console.log(`Gesture Studio generated at ${output}`);
}
