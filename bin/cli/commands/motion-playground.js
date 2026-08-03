'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

function playgroundHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DesignOS Motion Playground</title><style>
:root{color-scheme:dark;--bg:#0b0c0e;--panel:#15171a;--text:#f4f4f5;--muted:#a1a1aa;--focus:#7dd3fc}*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:clamp(1rem,4vw,3rem);font:16px/1.5 system-ui,sans-serif;background:var(--bg);color:var(--text)}main{max-width:72rem;margin:auto;display:grid;grid-template-columns:minmax(17rem,25rem) 1fr;gap:2rem}.panel,.stage{background:var(--panel);border:1px solid #2b2e33;border-radius:1rem;padding:1.5rem}h1{font-size:1.5rem;margin:0 0 .5rem}p{color:var(--muted)}label{display:block;margin-top:1rem;font-weight:650}input,select,button{font:inherit}input[type=range]{width:100%;min-height:44px}select,button{min-height:44px;border-radius:.5rem;border:1px solid #3f444c;background:#202329;color:var(--text);padding:.5rem .75rem}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--focus);outline-offset:3px}.stage{min-height:24rem;display:grid;place-items:center}.target{width:7rem;height:7rem;border:0;border-radius:1rem;background:#22c55e;color:#07170d;font-weight:800}.output{display:block;margin-top:1rem;padding:1rem;overflow-wrap:anywhere;background:#090a0c;border-radius:.5rem}@media(max-width:720px){main{grid-template-columns:1fr}.stage{min-height:16rem}}@media(prefers-reduced-motion:reduce){.target{animation:none!important;transition:none!important}}
</style></head><body><main><section class="panel"><h1>Motion Playground</h1><p>Adjust, replay, then copy a production-safe timing token.</p><label for="duration">Duration: <output id="durationValue">180ms</output></label><input id="duration" type="range" min="0" max="600" step="10" value="180"><label for="easing">Easing</label><select id="easing"><option value="cubic-bezier(.16,1,.3,1)">Expressive out</option><option value="cubic-bezier(.2,0,0,1)">Standard out</option><option value="linear">Linear</option></select><div><button id="replay" type="button">Replay</button> <button id="copy" type="button">Copy CSS</button></div><code id="output" class="output">--motion-duration:180ms; --motion-ease:cubic-bezier(.16,1,.3,1);</code><p id="status" role="status" aria-live="polite"></p></section><section class="stage" aria-label="Motion preview"><button class="target" id="target" type="button">Preview</button></section></main><script>
const duration=document.querySelector('#duration'),durationValue=document.querySelector('#durationValue'),easing=document.querySelector('#easing'),target=document.querySelector('#target'),output=document.querySelector('#output'),status=document.querySelector('#status');
function css(){return '--motion-duration:'+duration.value+'ms; --motion-ease:'+easing.value+';'}function sync(){durationValue.value=duration.value+'ms';output.textContent=css()}function replay(){target.getAnimations().forEach(a=>a.cancel());if(matchMedia('(prefers-reduced-motion: reduce)').matches){status.textContent='Reduced motion is active; preview remains still.';return}target.animate([{transform:'translateX(0) scale(1)'},{transform:'translateX(min(18vw, 160px)) scale(1.08)'},{transform:'translateX(0) scale(1)'}],{duration:Number(duration.value)*2,easing:easing.value});status.textContent='Preview replayed.'}duration.addEventListener('input',sync);easing.addEventListener('change',sync);document.querySelector('#replay').addEventListener('click',replay);document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(css());status.textContent='CSS copied.'}catch{status.textContent='Copy unavailable; select the CSS value manually.'}});sync();
</script></body></html>`;
}

function execute(args, ctx) {
  const port = Number(ctx.argValue(args, '--port', '3333'));
  const out = ctx.argValue(args, '--out', '');
  if (!Number.isInteger(port) || port < 1 || port > 65535) ctx.fail('--port must be an integer from 1 to 65535.');
  const html = playgroundHtml();
  if (out) {
    const file = path.resolve(ctx.cwd, out);fs.mkdirSync(path.dirname(file), { recursive: true });fs.writeFileSync(file, html);ctx.ok(`Playground written to ${path.relative(ctx.cwd, file)}`);return;
  }
  const server = http.createServer((req,res)=>{if (!['/','/index.html'].includes(req.url)){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'"});res.end(html)});
  server.on('error', error => ctx.fail(`Could not start playground on port ${port}: ${error.message}`));
  server.listen(port, '127.0.0.1', ()=>{ctx.ok(`Playground running at http://127.0.0.1:${port}`);ctx.log('Bound to localhost only. Press Ctrl+C to stop.')});
}

module.exports = { playgroundHtml, execute };
