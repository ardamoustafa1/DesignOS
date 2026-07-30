'use strict';

const fs = require('fs');
const path = require('path');

function motionLab(target, args = [], cwd = process.cwd()) {
  if (!target) throw new Error('Usage: designos motion-lab <local-html> [--profile] [--selector <css>] [--out motion-lab.html]');
  if (/^https?:\/\//i.test(target)) throw new Error('Motion Lab requires a local HTML target so it can instrument animations without weakening cross-origin security.');
  const sourceFile = path.resolve(cwd, target);
  if (!fs.existsSync(sourceFile)) throw new Error(`Motion Lab target not found: ${target}`);
  const outputIndex = args.indexOf('--out');
  const output = path.resolve(cwd, outputIndex >= 0 && args[outputIndex + 1] ? args[outputIndex + 1] : '.designos/motion-lab.html');
  const profileIndex = args.indexOf('--profile-report');
  const profileFile = profileIndex >= 0 && args[profileIndex + 1] ? path.resolve(cwd, args[profileIndex + 1]) : null;
  const profile = profileFile && fs.existsSync(profileFile) ? JSON.parse(fs.readFileSync(profileFile, 'utf8')) : null;
  const source = fs.readFileSync(sourceFile, 'utf8');
  const base = `file://${path.dirname(sourceFile).replace(/\\/g, '/')}/`;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>DesignOS Motion Lab — ${path.basename(sourceFile)}</title>
<style>
:root{color-scheme:dark;--bg:#0d0f12;--panel:#15191f;--line:#2c3440;--text:#edf2f7;--muted:#9aa6b2;--accent:#42d392}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 ui-sans-serif,system-ui}
header{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px;background:color-mix(in srgb,var(--panel) 94%,transparent);border-bottom:1px solid var(--line)}
button,select,input{min-height:40px;border:1px solid var(--line);border-radius:8px;background:#20262e;color:var(--text);padding:8px 12px;font:inherit}
button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
button[aria-pressed=true]{border-color:var(--accent);color:var(--accent)}label{display:flex;gap:6px;align-items:center;color:var(--muted)}
main{display:grid;grid-template-columns:minmax(0,1fr) 320px;min-height:calc(100vh - 65px)}
.stage{display:grid;grid-template-columns:1fr;gap:1px;background:var(--line)}.stage.compare{grid-template-columns:1fr 1fr}
.frame{position:relative;min-width:0;background:white}.frame b{position:absolute;z-index:2;top:8px;left:8px;padding:4px 8px;border-radius:999px;background:#111c;color:white;font-size:11px}
iframe{display:block;width:100%;height:calc(100vh - 65px);border:0;background:white}
aside{padding:16px;border-left:1px solid var(--line);background:var(--panel);overflow:auto}h1{font-size:15px;margin:0 12px 0 0}h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:20px 0 8px}
canvas{width:100%;height:140px;border:1px solid var(--line);border-radius:8px;background:#0b0e12}.metric{display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)}
ol{padding-left:20px;color:var(--muted)}code{color:var(--accent)}
@media(max-width:900px){main{grid-template-columns:1fr}aside{border-left:0;border-top:1px solid var(--line)}.stage.compare{grid-template-columns:1fr}.frame iframe{height:70vh}}
</style>
</head>
<body>
<header>
  <h1>Motion Lab · ${path.basename(sourceFile)}</h1>
  <button data-rate=".25">0.25×</button><button data-rate=".5">0.5×</button><button data-rate="1" aria-pressed="true">1×</button>
  <button id="pause">Pause</button><button id="step">Frame +16.7ms</button>
  <button id="overlay" aria-pressed="false">Animation overlay</button>
  <button id="origins" aria-pressed="false">Transform origins</button>
  <button id="compare" aria-pressed="false">Full ↔ reduced</button>
  <button id="record" aria-pressed="false">Record</button><button id="replay">Replay</button>
  <label style="flex:1 1 200px">Timeline <input type="range" id="scrubber" min="0" max="2000" value="0" style="width:100%"></label>
</header>
<main>
  <section class="stage" id="stage" aria-label="Instrumented previews">
    <div class="frame"><b>Full motion / after</b><iframe id="full" title="Full-motion preview"></iframe></div>
    <div class="frame" id="reducedFrame" hidden><b>Reduced motion / before</b><iframe id="reduced" title="Reduced-motion preview"></iframe></div>
  </section>
  <aside>
    <h2>Runtime</h2>
    <div class="metric"><span>FPS</span><strong id="fps">—</strong></div>
    <div class="metric"><span>Long tasks</span><strong id="longTasks">0</strong></div>
    <div class="metric"><span>Layout shifts</span><strong id="shifts">0</strong></div>
    <div class="metric"><span>Animations</span><strong id="count">0</strong></div>
    <h2>CDP trace profile</h2>
    <div class="metric"><span>Average FPS / worst frame</span><strong id="fpsWorst">—</strong></div>
    <div class="metric"><span>Dropped frames</span><strong id="dropped">—</strong></div>
    <div class="metric"><span>Dropped-frame ratio</span><strong id="dropRatio">—</strong></div>
    <div class="metric"><span>Long animation frames</span><strong id="loaf">—</strong></div>
    <div class="metric"><span>Main-thread blocking</span><strong id="blocking">—</strong></div>
    <div class="metric"><span>Style / layout</span><strong id="styleLayout">—</strong></div>
    <div class="metric"><span>Paint / composite</span><strong id="paintComposite">—</strong></div>
    <div class="metric"><span>Layout / paint count</span><strong id="renderCounts">—</strong></div>
    <div class="metric"><span>Composite-only</span><strong id="compositeOnly">—</strong></div>
    <div class="metric"><span>Composite layers</span><strong id="layers">—</strong></div>
    <div class="metric"><span>Frame P50 / P95 / P99</span><strong id="percentiles">—</strong></div>
    <div class="metric"><span>Animation attribution</span><strong id="attribution">—</strong></div>
    <div class="metric"><span>Input latency / settle</span><strong id="latencySettle">—</strong></div>
    <div class="metric"><span>Overshoot / cancel response</span><strong id="overshootCancel">—</strong></div>
    <div class="metric"><span>Listener / heap cleanup</span><strong id="cleanup">—</strong></div>
    <div class="metric"><span>Reduced-motion result</span><strong id="reducedResult">—</strong></div>
    <h2>Easing curve</h2>
    <label>Curve <input id="curve" value="0.16,1,0.3,1" aria-label="Cubic bezier values"></label>
    <canvas id="easing" width="288" height="140"></canvas>
    <h2>Spring response</h2>
    <label>Duration <input id="duration" type="number" min=".1" max="2" step=".05" value=".5"></label>
    <label>Bounce <input id="bounce" type="number" min="0" max=".8" step=".05" value=".15"></label>
    <canvas id="spring" width="288" height="140"></canvas>
    <h2>Motion Analysis & Workbench</h2>
    <button id="layerPromo" aria-pressed="false" style="width:100%;margin-bottom:8px">Highlight Layer Promotion</button>
    <div class="metric"><span>Enter/Exit Symmetry</span><strong id="symmetry">—</strong></div>
    <div style="font-size:11px;color:var(--muted);margin-top:8px">Trajectory (x, y)</div>
    <canvas id="trajectory" width="288" height="60" style="height:60px"></canvas>
    <div style="display:flex;gap:4px;margin-top:4px">
      <div style="flex:1"><div style="font-size:11px;color:var(--muted)">Velocity</div><canvas id="velocity" width="142" height="60" style="height:60px"></canvas></div>
      <div style="flex:1"><div style="font-size:11px;color:var(--muted)">Acceleration</div><canvas id="acceleration" width="142" height="60" style="height:60px"></canvas></div>
    </div>
    <button id="reconstruct" style="width:100%;margin-top:8px">Reconstruct & Plot Current Animation</button>
    <h2>Interaction recording</h2>
    <ol id="events"><li>No events recorded.</li></ol>
    <h2>Rules</h2>
    <p>Frame stepping and slowdown are diagnostic only. Ship values still obey <code>motion/principles.md</code>. The reduced preview removes spatial motion while preserving state.</p>
  </aside>
</main>
<script>
const original=${JSON.stringify(source)};
const cdpProfile=${JSON.stringify(profile)};
const base=${JSON.stringify(base)};
const baseTag='<base href="'+base+'">';
const full=document.getElementById('full'), reduced=document.getElementById('reduced');
full.srcdoc=original.replace(/<head([^>]*)>/i,'<head$1>'+baseTag);
const reducedCss='<style>*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}</style>';
reduced.srcdoc=original.replace(/<head([^>]*)>/i,'<head$1>'+baseTag+reducedCss);
let rate=1, paused=false, recording=false, events=[], rafSamples=[], longTasks=0, shifts=0;
if(cdpProfile){const m=cdpProfile.metrics,fmt=v=>v==null?'not measured':Number(v).toFixed(1)+'ms';
document.getElementById('fpsWorst').textContent=m.averageFps.toFixed(1)+' / '+fmt(m.worstFrameMs);
document.getElementById('dropped').textContent=m.droppedFrames;
document.getElementById('dropRatio').textContent=(m.droppedFrameRatio*100).toFixed(2)+'%';
document.getElementById('loaf').textContent=m.longAnimationFrames.count;
document.getElementById('blocking').textContent=fmt(m.mainThread.blockingTimeMs);
document.getElementById('styleLayout').textContent=fmt(m.rendering.styleRecalculationMs)+' / '+fmt(m.rendering.layoutMs);
document.getElementById('paintComposite').textContent=fmt(m.rendering.paintMs)+' / '+fmt(m.rendering.compositeMs);
document.getElementById('renderCounts').textContent=m.rendering.layoutCount+' / '+m.rendering.paintCount;
document.getElementById('compositeOnly').textContent=String(m.rendering.compositeOnly);
document.getElementById('layers').textContent=m.rendering.maxCompositeLayers;
document.getElementById('percentiles').textContent=[m.frameTimeMs.p50,m.frameTimeMs.p95,m.frameTimeMs.p99].map(v=>v.toFixed(1)).join(' / ')+'ms';
document.getElementById('attribution').textContent=[...(m.animationAttribution.targets||[]),...(m.animationAttribution.traceEvents||[]).slice(0,3).map(v=>v.name+'×'+v.count)].join(', ')||'none';
document.getElementById('latencySettle').textContent=fmt(m.interaction.inputToMotionLatencyMs)+' / '+fmt(m.interaction.settleTimeMs);
document.getElementById('overshootCancel').textContent=(m.interaction.overshoot==null?'not measured':m.interaction.overshoot.toFixed(3))+' / '+fmt(m.interaction.cancelResponseTimeMs);
document.getElementById('cleanup').textContent=String(m.cleanup.listenerDelta)+' / '+(m.cleanup.heapDeltaBytes==null?'not measured':m.cleanup.heapDeltaBytes+'B');
document.getElementById('reducedResult').textContent=m.reducedMotion||'not measured'}
const doc=()=>full.contentDocument, win=()=>full.contentWindow;
function animations(){try{return doc().getAnimations({subtree:true})}catch{return[]}}
function applyRate(){for(const animation of animations()){animation.playbackRate=rate;if(paused)animation.pause();else animation.play()}document.getElementById('count').textContent=animations().length}
document.querySelectorAll('[data-rate]').forEach(button=>button.onclick=()=>{rate=Number(button.dataset.rate);document.querySelectorAll('[data-rate]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));applyRate()});
document.getElementById('pause').onclick=event=>{paused=!paused;event.currentTarget.textContent=paused?'Play':'Pause';applyRate()};
document.getElementById('step').onclick=()=>{paused=true;document.getElementById('pause').textContent='Play';for(const animation of animations()){animation.pause();animation.currentTime=(animation.currentTime||0)+16.6667}};
function toggle(id,css){const button=document.getElementById(id);const on=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(on));let style=doc().getElementById('dos-'+id);if(!style){style=doc().createElement('style');style.id='dos-'+id;doc().head.append(style)}style.textContent=on?css:''}
document.getElementById('overlay').onclick=()=>toggle('overlay','*{animation-play-state:inherit}.dos-animated{outline:2px solid #ff2d78!important;outline-offset:2px!important}');
document.getElementById('origins').onclick=()=>toggle('origins','[data-dos-origin]{outline:1px dashed #42d392!important;background-image:radial-gradient(circle at var(--dos-ox) var(--dos-oy),#42d392 0 3px,transparent 4px)!important}');
document.getElementById('compare').onclick=event=>{const on=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(on));document.getElementById('stage').classList.toggle('compare',on);document.getElementById('reducedFrame').hidden=!on};
function markAnimated(){for(const element of doc().querySelectorAll('*')){const style=win().getComputedStyle(element);if(style.animationName!=='none'||style.transitionDuration.split(',').some(v=>parseFloat(v)>0)){element.classList.add('dos-animated');const origin=style.transformOrigin.split(' ');element.dataset.dosOrigin='';element.style.setProperty('--dos-ox',origin[0]);element.style.setProperty('--dos-oy',origin[1])}}applyRate()}
function selector(element){if(element.id)return '#'+CSS.escape(element.id);const test=element.getAttribute('data-testid');if(test)return '[data-testid="'+CSS.escape(test)+'"]';return element.tagName.toLowerCase()+(element.classList[0]?'.'+CSS.escape(element.classList[0]):'')}
function bindRecording(){for(const type of ['click','pointerdown','pointerup','keydown'])doc().addEventListener(type,event=>{if(!recording)return;events.push({t:Math.round(performance.now()),type,selector:selector(event.target),key:event.key||null});renderEvents()},true)}
function renderEvents(){document.getElementById('events').innerHTML=events.length?events.map(item=>'<li><code>'+item.type+'</code> '+item.selector+(item.key?' · '+item.key:'')+'</li>').join(''):'<li>No events recorded.</li>'}
document.getElementById('record').onclick=event=>{recording=!recording;if(recording)events=[];event.currentTarget.setAttribute('aria-pressed',String(recording));event.currentTarget.textContent=recording?'Stop recording':'Record';renderEvents()};
document.getElementById('replay').onclick=async()=>{if(!events.length)return;const start=events[0].t;for(const item of events){await new Promise(resolve=>setTimeout(resolve,(item.t-start)/rate));const target=doc().querySelector(item.selector);if(target)target.dispatchEvent(item.type==='keydown'?new KeyboardEvent(item.type,{key:item.key,bubbles:true}):new PointerEvent(item.type,{bubbles:true}))}};
function observe(){try{new win().PerformanceObserver(list=>{longTasks+=list.getEntries().length;document.getElementById('longTasks').textContent=longTasks}).observe({type:'longtask',buffered:true})}catch{}try{new win().PerformanceObserver(list=>{shifts+=list.getEntries().filter(entry=>!entry.hadRecentInput).length;document.getElementById('shifts').textContent=shifts}).observe({type:'layout-shift',buffered:true})}catch{}}
function fps(now){rafSamples.push(now);while(rafSamples.length&&rafSamples[0]<now-1000)rafSamples.shift();document.getElementById('fps').textContent=rafSamples.length;requestAnimationFrame(fps)}requestAnimationFrame(fps);
function drawCurve(){const values=document.getElementById('curve').value.split(',').map(Number);const canvas=document.getElementById('easing'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#2c3440';ctx.strokeRect(10,10,268,120);ctx.strokeStyle='#42d392';ctx.beginPath();for(let i=0;i<=100;i++){const t=i/100,u=1-t;const x=10+268*(3*u*u*t*values[0]+3*u*t*t*values[2]+t*t*t);const y=130-120*(3*u*u*t*values[1]+3*u*t*t*values[3]+t*t*t);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
function drawSpring(){const duration=Number(document.getElementById('duration').value),bounce=Number(document.getElementById('bounce').value),zeta=1-bounce,w=2*Math.PI/duration;const canvas=document.getElementById('spring'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#2c3440';ctx.strokeRect(10,10,268,120);ctx.strokeStyle='#ffcc66';ctx.beginPath();for(let i=0;i<=200;i++){const t=i/200*duration*2;const y=1-Math.exp(-zeta*w*t)*Math.cos(w*Math.sqrt(Math.max(0,1-zeta*zeta))*t);const x=10+268*i/200,py=130-100*y;i?ctx.lineTo(x,py):ctx.moveTo(x,py)}ctx.stroke()}
document.getElementById('curve').oninput=drawCurve;document.getElementById('duration').oninput=drawSpring;document.getElementById('bounce').oninput=drawSpring;drawCurve();drawSpring();

// Motion Timeline Workbench additions
const scrubber = document.getElementById('scrubber');
scrubber.oninput = () => {
  paused = true;
  document.getElementById('pause').textContent = 'Play';
  const t = Number(scrubber.value);
  for (const animation of animations()) {
    animation.pause();
    animation.currentTime = t;
  }
};

document.getElementById('layerPromo').onclick = () => toggle('layerPromo','* { will-change: auto !important; } .dos-animated { outline: 2px dashed #a371f7 !important; background: rgba(163, 113, 247, 0.1) !important; will-change: transform, opacity !important; }');

let trackedPositions = [];
document.getElementById('reconstruct').onclick = () => {
  const el = doc().querySelector('.dos-animated');
  if(!el) return;
  const anims = el.getAnimations();
  if(!anims.length) return;
  const anim = anims[0];
  anim.pause();
  
  const sampleCount = 60;
  const duration = anim.effect.getComputedTiming().duration || 1000;
  const dt = duration / sampleCount;
  
  let pos = [];
  for(let i = 0; i <= sampleCount; i++) {
    anim.currentTime = i * dt;
    const rect = el.getBoundingClientRect();
    pos.push({ x: rect.x, y: rect.y, t: i * dt });
  }
  anim.currentTime = 0;
  anim.play();
  
  const v = pos.map((p, i) => i === 0 ? 0 : (p.y - pos[i-1].y)/dt);
  const a = v.map((vel, i) => i === 0 ? 0 : (vel - v[i-1])/dt);
  
  const drawLine = (id, data, color) => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(data.length < 2) return;
    const min = Math.min(...data), max = Math.max(...data);
    const range = (max - min) || 1;
    ctx.strokeStyle = color;
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * canvas.width;
      const y = canvas.height - ((val - min) / range) * canvas.height;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  };
  
  drawLine('trajectory', pos.map(p => p.y), '#42d392');
  drawLine('velocity', v, '#ffcc66');
  drawLine('acceleration', a, '#ff2d78');
  
  const sym = Math.abs(pos[0].y - pos[pos.length-1].y) < 1 ? 'Closed (Symmetric)' : 'Open (Asymmetric)';
  document.getElementById('symmetry').textContent = sym;
};

full.addEventListener('load',()=>{markAnimated();bindRecording();observe()});
</script>
</body></html>`;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html);
  return output;
}

module.exports = { motionLab };
