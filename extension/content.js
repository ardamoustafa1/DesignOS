/* DesignOS Extension Content Script (The main Audit Engine) */

let inspectorActive = false;
let profilerActive = false;

// UI Elements
let inspectorOverlay = null;
let profilerOverlay = null;

// Initialize
chrome.storage.local.get(['inspectorEnabled', 'profilerEnabled'], (res) => {
  if (res.inspectorEnabled) toggleInspector(true);
  if (res.profilerEnabled) toggleProfiler(true);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TOGGLE_INSPECTOR') {
    toggleInspector(msg.payload);
  } else if (msg.type === 'TOGGLE_PROFILER') {
    toggleProfiler(msg.payload);
  } else if (msg.type === 'RUN_CHECKS') {
    const issues = runDeterministicChecks();
    sendResponse({ completed: true, issues });
  }
});

/* ─── 1. Token Drift Inspector ────────────────────────────────────────── */

function toggleInspector(enable) {
  inspectorActive = enable;
  if (enable) {
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    if (!inspectorOverlay) createInspectorOverlay();
    inspectorOverlay.style.display = 'block';
  } else {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    if (inspectorOverlay) inspectorOverlay.style.display = 'none';
    removeHighlight();
  }
}

let currentHighlighted = null;

function handleMouseOver(e) {
  if (!inspectorActive) return;
  e.stopPropagation();
  currentHighlighted = e.target;
  currentHighlighted.classList.add('designos-highlight');
  updateInspectorData(e.target);
}

function handleMouseOut(e) {
  if (!inspectorActive) return;
  e.stopPropagation();
  e.target.classList.remove('designos-highlight');
}

function removeHighlight() {
  if (currentHighlighted) {
    currentHighlighted.classList.remove('designos-highlight');
    currentHighlighted = null;
  }
}

function createInspectorOverlay() {
  inspectorOverlay = document.createElement('div');
  inspectorOverlay.id = 'designos-inspector-panel';
  document.body.appendChild(inspectorOverlay);
}

function updateInspectorData(el) {
  const styles = window.getComputedStyle(el);
  const color = styles.color;
  const bg = styles.backgroundColor;
  const fs = styles.fontSize;
  const p = styles.padding;
  
  // Calculate a crude contrast ratio (mocked for simplicity here, real formula is complex)
  const isHardcodedHex = color.match(/^rgb\\(/) === null; // In real DOM, it's always rgb, we'd check raw CSS for hex.
  
  inspectorOverlay.innerHTML = \`
    <strong>Element:</strong> \${el.tagName.toLowerCase()}<br>
    <strong>Color:</strong> <span class="\${isHardcodedHex ? 'designos-warn' : ''}">\${color}</span><br>
    <strong>Bg:</strong> \${bg}<br>
    <strong>Font Size:</strong> \${fs}<br>
    <strong>Padding:</strong> \${p}<br>
    <em>Click to copy token CSS</em>
  \`;
}

/* ─── 2. Motion Profiler ─────────────────────────────────────────────── */

let frames = 0, lastTime = performance.now();
let profilerLoopId = null;

function toggleProfiler(enable) {
  profilerActive = enable;
  if (enable) {
    if (!profilerOverlay) createProfilerOverlay();
    profilerOverlay.style.display = 'flex';
    profilerLoopId = requestAnimationFrame(profilerLoop);
  } else {
    if (profilerOverlay) profilerOverlay.style.display = 'none';
    cancelAnimationFrame(profilerLoopId);
  }
}

function createProfilerOverlay() {
  profilerOverlay = document.createElement('div');
  profilerOverlay.id = 'designos-profiler-panel';
  profilerOverlay.innerHTML = \`
    <div>FPS: <span id="designos-fps">60</span></div>
    <div>LoAF: <span id="designos-loaf">0</span></div>
  \`;
  document.body.appendChild(profilerOverlay);
}

function profilerLoop(now) {
  if (!profilerActive) return;
  frames++;
  if (now - lastTime >= 1000) {
    const fpsEl = document.getElementById('designos-fps');
    if (fpsEl) {
      fpsEl.innerText = frames;
      fpsEl.style.color = frames >= 55 ? '#34d399' : '#f87171';
    }
    frames = 0;
    lastTime = now;
  }
  profilerLoopId = requestAnimationFrame(profilerLoop);
}

/* ─── 3. Run Deterministic Checks ────────────────────────────────────── */

function runDeterministicChecks() {
  let issues = 0;
  const elements = document.querySelectorAll('*');
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    
    // Check for transition: all
    if (style.transitionProperty === 'all' && style.transitionDuration !== '0s') {
      issues++;
      el.style.outline = '2px solid red';
      el.setAttribute('data-designos-error', 'ANIM-005: transition:all blocks compositor');
    }
    
    // Check for hardcoded z-index (drift)
    if (style.zIndex !== 'auto' && parseInt(style.zIndex) > 100) {
      issues++;
      el.style.outline = '2px solid orange';
      el.setAttribute('data-designos-error', 'DRIFT: Unmanaged high z-index');
    }
  });
  return issues;
}
