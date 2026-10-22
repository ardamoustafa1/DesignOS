export type MotionEngine =
  | "webgl-field"
  | "spatial-orbit"
  | "particle-field"
  | "vector-morph"
  | "signal-trace"
  | "kinetic-type";

export type MotionScene = {
  id: string;
  character:
    | "cinematic"
    | "editorial"
    | "technical"
    | "organic"
    | "energetic"
    | "restrained";
  engine: MotionEngine;
  recipes: [string, string, string, string];
  roles: ["arrival", "scroll", "interaction", "transition"];
  signature: string;
  productTruth: string;
  fallback: string;
  paletteShift: number;
};

const scenes: readonly MotionScene[] = [
  {
    id: "kinetic-editorial-hero",
    character: "editorial",
    engine: "kinetic-type",
    recipes: [
      "word-cascade",
      "line-mask-rise",
      "depth-parallax",
      "shared-element",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A typographic field resolves from editorial tension into a stable claim.",
    productTruth: "The product turns ambiguity into a legible decision.",
    fallback: "complete-static-editorial-state",
    paletteShift: 0,
  },
  {
    id: "vector-brand-reveal",
    character: "editorial",
    engine: "vector-morph",
    recipes: [
      "logo-assemble",
      "path-draw",
      "magnetic-intent",
      "editorial-wipe",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A single vector contour changes state without losing continuity.",
    productTruth:
      "The brand keeps identity intact while the underlying state changes.",
    fallback: "resolved-vector-mark",
    paletteShift: 18,
  },
  {
    id: "editorial-signal-index",
    character: "restrained",
    engine: "signal-trace",
    recipes: [
      "baseline-sweep",
      "timeline-trace",
      "inspection-lens",
      "chapter-index-swap",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature: "Evidence is drawn as a trace rather than decorated as a card.",
    productTruth: "Every conclusion retains a visible path back to its source.",
    fallback: "complete-signal-trace",
    paletteShift: -12,
  },
  {
    id: "material-type-field",
    character: "organic",
    engine: "particle-field",
    recipes: [
      "particle-type",
      "ambient-ground-shift",
      "cursor-spotlight",
      "crossfade-depth",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A quiet particulate field gathers around the message hierarchy.",
    productTruth: "Scattered inputs become a coherent operating picture.",
    fallback: "static-material-field",
    paletteShift: 34,
  },

  {
    id: "cinematic-product-stage",
    character: "cinematic",
    engine: "webgl-field",
    recipes: [
      "image-curtain",
      "light-sweep",
      "scroll-progress",
      "route-curtain",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A shader light field reveals the product surface as material evidence.",
    productTruth:
      "The product exposes depth that a flat screenshot cannot explain.",
    fallback: "poster-and-css-depth",
    paletteShift: 8,
  },
  {
    id: "spatial-proof-orbit",
    character: "cinematic",
    engine: "spatial-orbit",
    recipes: ["product-orbit", "camera-dolly", "surface-tilt", "project-zoom"],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A dimensional proof object reacts to pointer intent and scroll depth.",
    productTruth:
      "The product is an inspectable system, not a list of promises.",
    fallback: "static-orbit-poster",
    paletteShift: 42,
  },
  {
    id: "split-vector-proof",
    character: "technical",
    engine: "vector-morph",
    recipes: [
      "contour-reveal",
      "data-trace",
      "proximity-label",
      "section-morph",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature: "Claim and evidence share one transforming vector grammar.",
    productTruth: "One underlying model produces several defensible views.",
    fallback: "resolved-proof-contour",
    paletteShift: -22,
  },
  {
    id: "split-particle-synthesis",
    character: "energetic",
    engine: "particle-field",
    recipes: [
      "noise-field",
      "depth-journey",
      "cursor-parallax",
      "portal-transition",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature: "Two information fields converge at the proof boundary.",
    productTruth:
      "Separate signals become useful only when their relationship is visible.",
    fallback: "static-synthesis-field",
    paletteShift: 70,
  },

  {
    id: "inspectable-case-study",
    character: "technical",
    engine: "signal-trace",
    recipes: [
      "sticky-chapter",
      "timeline-trace",
      "cursor-spotlight",
      "chapter-handoff",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature: "The page advances as one continuous evidence trace.",
    productTruth: "Progress is a sequence of attributable decisions.",
    fallback: "linear-labelled-document",
    paletteShift: 0,
  },
  {
    id: "shader-gallery",
    character: "cinematic",
    engine: "webgl-field",
    recipes: [
      "shader-displacement",
      "depth-gallery",
      "inspection-lens",
      "depth-blur-handoff",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A restrained displacement field gives the story a changing atmospheric ground.",
    productTruth:
      "The experience changes continuously while the information remains stable.",
    fallback: "static-shader-poster",
    paletteShift: 96,
  },
  {
    id: "technical-orbit-story",
    character: "technical",
    engine: "spatial-orbit",
    recipes: [
      "model-explode",
      "scroll-progress",
      "edge-attraction",
      "shared-element",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "A wireframe proof object exposes its internal layers across the narrative.",
    productTruth:
      "Complexity becomes trustworthy when its structure can be inspected.",
    fallback: "static-technical-object",
    paletteShift: 154,
  },
  {
    id: "kinetic-chapter-rail",
    character: "energetic",
    engine: "kinetic-type",
    recipes: [
      "headline-shutter",
      "viewport-type-scale",
      "elastic-label",
      "editorial-wipe",
    ],
    roles: ["arrival", "scroll", "interaction", "transition"],
    signature:
      "Chapter typography changes scale and alignment as the reader advances.",
    productTruth:
      "The product turns a long process into a sequence people can navigate.",
    fallback: "complete-chapter-index",
    paletteShift: -48,
  },
] as const;

const pools: Record<string, readonly MotionScene[]> = {
  "editorial-ledger": scenes.slice(0, 4),
  "split-proof": scenes.slice(4, 8),
  "rail-story": scenes.slice(8, 12),
};

function hashIndex(value: string, length: number) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

const engineIntent: Record<MotionEngine, readonly string[]> = {
  "webgl-field": ["cinematic", "atmosphere", "launch", "premium", "media", "gallery", "visual"],
  "spatial-orbit": ["product", "platform", "technical", "architecture", "inspectable", "system", "3d"],
  "particle-field": ["network", "signals", "community", "creative", "portfolio", "synthesis", "ambient"],
  "vector-morph": ["brand", "identity", "workflow", "transformation", "continuity", "logo", "process"],
  "signal-trace": ["evidence", "data", "analytics", "risk", "security", "climate", "compliance", "trace"],
  "kinetic-type": ["editorial", "story", "message", "campaign", "writing", "chapter", "narrative"],
};

function tokens(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? []);
}

export type RankedMotionScene = {
  scene: MotionScene;
  score: number;
  evidence: string[];
};

export function rankMotionScenes(input: {
  family: string;
  systemId: string;
  brief: string;
  variation: number;
}): RankedMotionScene[] {
  const query = tokens(input.brief);
  const preferred = new Set(pools[input.family]?.map((scene) => scene.id) ?? []);
  return scenes
    .map((scene) => {
      const intentMatches = engineIntent[scene.engine].filter((term) => query.has(term));
      const authoredTerms = tokens(
        `${scene.id} ${scene.signature} ${scene.productTruth} ${scene.recipes.join(" ")}`,
      );
      const authoredMatches = [...query].filter((term) => authoredTerms.has(term));
      const compositionBonus = preferred.has(scene.id) ? 18 : 0;
      const semanticScore = intentMatches.length * 13 + authoredMatches.length * 4;
      const tieBreak =
        hashIndex(`${input.systemId}:${input.variation}:${input.brief}:${scene.id}`, 997) /
        997;
      return {
        scene,
        score: compositionBonus + semanticScore + tieBreak,
        evidence: [
          preferred.has(scene.id) ? `composition:${input.family}` : "cross-family-wildcard",
          ...intentMatches.map((term) => `intent:${term}`),
          ...authoredMatches.slice(0, 3).map((term) => `artifact:${term}`),
        ],
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.scene.id.localeCompare(right.scene.id),
    );
}

export function selectMotionScene(input: {
  family: string;
  systemId: string;
  brief: string;
  variation: number;
}) {
  return rankMotionScenes(input)[0].scene;
}

export function sceneAttributes(scene: MotionScene, complete: boolean) {
  const recipes = complete ? scene.recipes : scene.recipes.slice(0, 3);
  return `data-motion-scene="${scene.id}" data-motion-character="${scene.character}" data-motion-engine="${scene.engine}" data-motion-recipes="${recipes.join(" ")}" data-motion-fallback="${scene.fallback}" data-motion-runtime="scene-graph"`;
}

export function sceneLayer(scene: MotionScene) {
  if (
    ["webgl-field", "spatial-orbit", "particle-field"].includes(scene.engine)
  ) {
    return `<canvas class="scene-engine scene-${scene.engine}" data-scene-canvas aria-hidden="true"></canvas><div class="scene-engine-fallback" aria-hidden="true"></div>`;
  }
  if (scene.engine === "vector-morph") {
    return `<svg class="scene-engine scene-vector" data-scene-vector viewBox="0 0 640 520" aria-hidden="true"><path data-morph-path d="M82 286 C142 96 282 76 360 210 C438 344 506 414 570 244" data-morph-to="M72 188 C158 382 292 420 382 248 C464 92 526 98 578 306"/><path class="scene-vector-echo" d="M70 352 C176 182 250 176 340 310 C430 444 516 328 582 164"/></svg>`;
  }
  if (scene.engine === "signal-trace") {
    return `<svg class="scene-engine scene-signal" data-scene-signal viewBox="0 0 640 520" aria-hidden="true"><path class="signal-grid" d="M64 92H576M64 196H576M64 300H576M64 404H576M128 54V462M256 54V462M384 54V462M512 54V462"/><path class="signal-line" pathLength="1" d="M64 376 C132 350 148 206 222 234 S330 396 390 278 S484 126 576 160"/><g class="signal-nodes"><circle cx="64" cy="376" r="6"/><circle cx="222" cy="234" r="6"/><circle cx="390" cy="278" r="6"/><circle cx="576" cy="160" r="6"/></g></svg>`;
  }
  return `<div class="scene-engine scene-type" data-scene-type aria-hidden="true"><span>TRACE</span><span>RESOLVE</span><span>PUBLISH</span><i></i></div>`;
}

export function motionDirectorCss() {
  return `.scene-engine{position:absolute;inset:2% -3% auto auto;width:min(51vw,720px);height:76%;pointer-events:none;z-index:0;opacity:.72;filter:saturate(.9);mask-image:linear-gradient(90deg,transparent 0,#000 22%,#000 86%,transparent)}.scene-engine-fallback{position:absolute;right:4%;top:16%;width:min(38vw,520px);aspect-ratio:1;border:1px solid var(--ring);border-radius:50%;background:radial-gradient(circle at 34% 28%,var(--wash),transparent 18%),repeating-radial-gradient(circle,var(--ring) 0 1px,transparent 1px 28px);opacity:.55}.scene-vector,.scene-signal{overflow:visible}.scene-vector path{fill:none;stroke:var(--ember);stroke-width:2.2;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 18px var(--wash))}.scene-vector .scene-vector-echo{stroke:var(--ring-loud);stroke-width:1}.scene-signal path{fill:none;vector-effect:non-scaling-stroke}.signal-grid{stroke:var(--ring);stroke-width:1}.signal-line{stroke:var(--ember);stroke-width:3;stroke-dasharray:1;stroke-dashoffset:calc(1 - var(--scene-progress,0))}.signal-nodes{fill:var(--ember)}.signal-nodes circle{transform-box:fill-box;transform-origin:center;transform:scale(calc(.7 + var(--scene-progress,0)*.3))}.scene-type{display:grid;align-content:center;justify-items:end;gap:4px;color:var(--ring-loud);font:800 clamp(34px,7vw,108px)/.78 var(--display);letter-spacing:-.07em;text-align:right;mix-blend-mode:screen}.scene-type span{transform:translate3d(calc((1 - var(--scene-progress,0))*var(--scene-type-shift,22px)),0,0);opacity:calc(.14 + var(--scene-progress,0)*.22)}.scene-type span:nth-child(2){--scene-type-shift:-34px;color:var(--wash)}.scene-type i{width:48%;height:1px;background:var(--ember);transform:scaleX(var(--scene-progress,0));transform-origin:right}.hero>.wrap,.hero>.index{position:relative;z-index:2}.scene-engine[data-fallback]{display:none}@media(max-width:760px){.scene-engine{inset:8% -32% auto auto;width:108vw;height:54%;opacity:.38}.scene-engine-fallback{right:-18%;width:78vw;opacity:.3}}@media(prefers-reduced-motion:reduce){.scene-engine{display:none}.scene-engine-fallback{display:block;opacity:.28}}`;
}

export function motionDirectorRuntime(scene: MotionScene) {
  const sceneJson = JSON.stringify({
    id: scene.id,
    engine: scene.engine,
    paletteShift: scene.paletteShift,
  });
  return `const mountScene=()=>{const spec=${sceneJson},root=document.body,canvas=document.querySelector('[data-scene-canvas]'),vector=document.querySelector('[data-scene-vector]'),signal=document.querySelector('[data-scene-signal]'),type=document.querySelector('[data-scene-type]');root.dataset.motionEngineActive=spec.engine;if(reduce){root.dataset.motionRuntimeState='reduced';return}let scrollFrame=0;const updateProgress=()=>{scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight,p=max?Math.max(0,Math.min(1,scrollY/max)):0;root.style.setProperty('--scene-progress',String(p))};const requestProgress=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress)};addEventListener('scroll',requestProgress,{passive:true});updateProgress();disposers.push(()=>{removeEventListener('scroll',requestProgress);cancelAnimationFrame(scrollFrame)});const pointer={x:0,y:0};const move=event=>{pointer.x=event.clientX/innerWidth-.5;pointer.y=.5-event.clientY/innerHeight;root.style.setProperty('--scene-x',event.clientX+'px');root.style.setProperty('--scene-y',event.clientY+'px')};addEventListener('pointermove',move,{passive:true});disposers.push(()=>removeEventListener('pointermove',move));if(canvas){const ratio=()=>Math.min(devicePixelRatio||1,1.5),resize=()=>{const rect=canvas.getBoundingClientRect(),r=ratio(),w=Math.max(1,Math.round(rect.width*r)),h=Math.max(1,Math.round(rect.height*r));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}return{w,h,r}};if(spec.engine==='webgl-field'||spec.engine==='spatial-orbit'){const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});if(gl){const vertex='#version 300 es\\nin vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';const fragment=spec.engine==='spatial-orbit'?'#version 300 es\\nprecision highp float;in vec2 uv;out vec4 outColor;uniform float t;uniform vec2 pointer;float sdSphere(vec3 p,float r){return length(p)-r;}void main(){vec2 q=(uv-.5)*2.;q.x*=1.2;vec3 ro=vec3(pointer*.22,2.8),rd=normalize(vec3(q,-2.4));float d=0.;for(int i=0;i<48;i++){vec3 p=ro+rd*d;p.xy*=mat2(cos(t*.12),-sin(t*.12),sin(t*.12),cos(t*.12));float m=sdSphere(p,.74)+sin(p.x*8.+t)*sin(p.y*7.-t)*.035;d+=m;if(abs(m)<.002||d>5.)break;}float glow=exp(-7.*abs(d-2.05));vec3 c=mix(vec3(.08,.09,.12),vec3(.94,.32,.12),glow);outColor=vec4(c,glow*.9);}' :'#version 300 es\\nprecision highp float;in vec2 uv;out vec4 outColor;uniform float t;uniform vec2 pointer;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}void main(){vec2 q=uv-.5-pointer*.08;float d=length(q);float n=noise(uv*4.+vec2(t*.035,-t*.02));float wave=sin((d-n*.12)*22.-t)*.5+.5;vec3 c=mix(vec3(.05,.04,.035),vec3(.94,.31,.12),smoothstep(.12,.9,wave+n*.35));outColor=vec4(c,smoothstep(.78,.08,d));}';const shader=(kind,source)=>{const value=gl.createShader(kind);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(value)||'shader');return value};try{const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('link');const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.useProgram(program);const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);let frame=0,visible=true;const draw=ms=>{if(!visible)return;const size=resize();gl.viewport(0,0,size.w,size.h);gl.uniform1f(gl.getUniformLocation(program,'t'),ms/1000);gl.uniform2f(gl.getUniformLocation(program,'pointer'),pointer.x,pointer.y);gl.drawArrays(gl.TRIANGLES,0,3);frame=requestAnimationFrame(draw)};const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(draw);else if(!visible){cancelAnimationFrame(frame);frame=0}});io.observe(canvas);frame=requestAnimationFrame(draw);disposers.push(()=>{cancelAnimationFrame(frame);io.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program)})}catch(error){canvas.dataset.fallback='shader-error'}}else canvas.dataset.fallback='webgl-unavailable'}else{const context=canvas.getContext('2d');let frame=0,visible=true;const particles=Array.from({length:52},(_,index)=>({phase:index*.618,radius:2+index%4,speed:.00008+(index%7)*.000012}));const draw=ms=>{if(!visible)return;const {w,h,r}=resize();context.clearRect(0,0,w,h);for(const particle of particles){const phase=particle.phase+ms*particle.speed,x=(.54+.4*Math.sin(phase*6.28+pointer.x))*w,y=(.5+.38*Math.cos(phase*4.7-pointer.y))*h,alpha=.08+(particle.radius%3)*.055;context.fillStyle='rgba(232,112,58,'+alpha+')';context.beginPath();context.arc(x,y,particle.radius*r,0,Math.PI*2);context.fill()}frame=requestAnimationFrame(draw)};const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(draw);else if(!visible){cancelAnimationFrame(frame);frame=0}});io.observe(canvas);frame=requestAnimationFrame(draw);disposers.push(()=>{cancelAnimationFrame(frame);io.disconnect()})}}if(vector){const path=vector.querySelector('[data-morph-path]'),from=path.getAttribute('d'),to=path.dataset.morphTo,number=/-?\\d*\\.?\\d+(?:e[-+]?\\d+)?/gi,a=from.match(number).map(Number),b=to.match(number).map(Number);let frame=0,start=0;const tick=ms=>{if(!start)start=ms;const p=Math.min(1,(ms-start)/900),e=1-Math.pow(1-p,3);let index=0;path.setAttribute('d',from.replace(number,()=>String(Number((a[index]+(b[index]-a[index++])*e).toFixed(3)))));if(p<1)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);disposers.push(()=>cancelAnimationFrame(frame))}if(signal)root.dataset.motionTrace='active';if(type){const stage=document.querySelector('.hero-grid');const tilt=event=>{const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;stage.style.setProperty('--scene-rx',(-y*2.4).toFixed(2)+'deg');stage.style.setProperty('--scene-ry',(x*3).toFixed(2)+'deg')};stage?.addEventListener('pointermove',tilt,{passive:true});disposers.push(()=>stage?.removeEventListener('pointermove',tilt))}root.dataset.motionRuntimeState='mounted'};`;
}

export function motionStageCss() {
  return `
.motion-stage{--stage-loop:6400ms;position:relative;min-width:0;min-height:560px;border:1px solid var(--ring-loud);border-radius:calc(var(--r-lg) + var(--r-sm));background:linear-gradient(145deg,color-mix(in srgb,var(--raised) 94%,var(--ember) 6%),var(--surface));box-shadow:var(--shadow-3);overflow:hidden;isolation:isolate;transform:perspective(1200px) rotateX(var(--stage-rx,0deg)) rotateY(var(--stage-ry,0deg));transform-style:preserve-3d;transition:transform var(--fast) var(--ease)}
.motion-stage:before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(360px circle at var(--stage-glow-x,72%) var(--stage-glow-y,22%),var(--wash),transparent 68%),linear-gradient(145deg,color-mix(in srgb,var(--raised) 72%,transparent),transparent 58%)}
.stage-bar{position:relative;z-index:6;min-height:56px;padding:0 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--ring);background:color-mix(in srgb,var(--ground-hi) 84%,transparent);font:600 12px var(--mono);letter-spacing:.06em;text-transform:uppercase}
.stage-brand,.stage-controls{display:flex;align-items:center;gap:12px}.stage-brand i{width:8px;height:8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 8px var(--wash)}.stage-engine{color:var(--ink-3)}
.stage-toggle{min-width:96px;min-height:44px;padding:8px 12px;border:0;border-inline-start:1px solid var(--ring);background:transparent;color:var(--ink-2);cursor:pointer;font:600 12px var(--mono);letter-spacing:.04em;text-transform:uppercase}.stage-toggle:hover{color:var(--ink)}.stage-toggle:focus-visible{outline-offset:-4px}
.stage-viewport{position:relative;height:444px;overflow:hidden;background:linear-gradient(160deg,color-mix(in srgb,var(--ground-lo) 88%,transparent),color-mix(in srgb,var(--surface) 72%,transparent))}
.stage-viewport:after{content:"";position:absolute;inset:0;z-index:5;pointer-events:none;box-shadow:inset 0 1px 0 var(--ring),inset 0 -1px 0 var(--ring);background:linear-gradient(90deg,var(--ring) 1px,transparent 1px),linear-gradient(var(--ring) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(130deg,#000,transparent 72%);opacity:.18}
.motion-stage .scene-engine{inset:0;width:100%;height:100%;max-width:none;z-index:0;opacity:.74;mask-image:linear-gradient(110deg,transparent 0,#000 22%,#000 92%)}.motion-stage .scene-engine-fallback{right:-6%;top:8%;width:72%;z-index:0;opacity:.36}
.stage-thesis{position:absolute;left:24px;bottom:20px;z-index:6;max-width:34ch;margin:0;color:var(--ink-3);font:500 12px/1.5 var(--mono);letter-spacing:.02em}
.motion-shot{position:absolute;z-index:4;width:min(74%,460px);padding:20px;border:1px solid var(--ring-loud);border-radius:var(--r-lg);background:linear-gradient(145deg,color-mix(in srgb,var(--raised) 94%,transparent),color-mix(in srgb,var(--surface) 88%,transparent));box-shadow:var(--shadow-2);opacity:0;transform:translate3d(0,28px,0) scale(.965);backface-visibility:hidden}
.motion-shot:before{content:attr(data-frame);display:block;margin-bottom:24px;color:var(--ember);font:700 12px var(--mono);letter-spacing:.08em;text-transform:uppercase}
.motion-shot strong{display:block;max-width:16ch;color:var(--ink);font:500 clamp(26px,3vw,42px)/.96 var(--display);font-variation-settings:"opsz" 112,"SOFT" 24;letter-spacing:-.04em}.motion-shot p{max-width:34ch;margin:16px 0 0;color:var(--ink-2);font-size:14px;line-height:1.5}
.shot-source{left:7%;top:9%}.shot-resolve{right:6%;top:17%}.shot-output{left:15%;top:12%;width:min(78%,500px)}
.shot-nodes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:28px}.shot-nodes span{min-width:0;padding:12px 8px;border:1px solid var(--ring);border-radius:var(--r-sm);color:var(--ink-2);background:color-mix(in srgb,var(--ground-hi) 82%,transparent);font:600 12px/1.35 var(--mono);text-align:center;overflow-wrap:anywhere}.shot-nodes i{display:block;width:8px;height:8px;margin:0 auto 8px;border-radius:50%;background:var(--ember);box-shadow:0 0 0 6px var(--wash)}
.shot-output .output-mark{display:flex;align-items:center;gap:12px;margin-top:28px;color:var(--ok);font:700 12px var(--mono);letter-spacing:.06em;text-transform:uppercase}.output-mark i{width:36px;height:1px;background:currentColor}
.stage-timeline{position:relative;z-index:7;min-height:60px;padding:12px 16px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;background:var(--ground-hi);font:600 12px var(--mono);letter-spacing:.05em;text-transform:uppercase}.stage-track{height:2px;background:var(--ring-loud);overflow:hidden}.stage-track i{display:block;width:100%;height:100%;background:var(--ember);transform:scaleX(0);transform-origin:left}.stage-frame-count{color:var(--ink-3);font-variant-numeric:tabular-nums}
.motion-stage:is([data-stage-state="playing"],[data-stage-state="paused"]) .shot-source{animation:stage-source var(--stage-loop) var(--ease) both}.motion-stage:is([data-stage-state="playing"],[data-stage-state="paused"]) .shot-resolve{animation:stage-resolve var(--stage-loop) var(--ease) both}.motion-stage:is([data-stage-state="playing"],[data-stage-state="paused"]) .shot-output{animation:stage-output var(--stage-loop) var(--ease) both}.motion-stage:is([data-stage-state="playing"],[data-stage-state="paused"]) .stage-track i{animation:stage-progress var(--stage-loop) linear both}.motion-stage[data-stage-state="paused"] .motion-shot,.motion-stage[data-stage-state="paused"] .stage-track i{animation-play-state:paused}.motion-stage[data-stage-state="complete"] .shot-output{opacity:1;transform:none}.motion-stage[data-stage-state="complete"] .stage-track i{transform:scaleX(1)}
@keyframes stage-source{0%,29%{opacity:1;transform:none}36%,100%{opacity:0;transform:translate3d(-28px,-8px,0) scale(.985)}}
@keyframes stage-resolve{0%,30%{opacity:0;transform:translate3d(28px,24px,0) scale(.965)}39%,61%{opacity:1;transform:none}69%,100%{opacity:0;transform:translate3d(24px,-8px,0) scale(.985)}}
@keyframes stage-output{0%,63%{opacity:0;transform:translate3d(0,28px,0) scale(.965)}72%,100%{opacity:1;transform:none}}
@keyframes stage-progress{to{transform:scaleX(1)}}
.motion-stage[data-engine="signal-trace"] .shot-nodes span,.motion-stage[data-engine="vector-morph"] .shot-nodes span{background:color-mix(in srgb,var(--surface) 92%,transparent)}
.motion-stage[data-engine="kinetic-type"] .motion-shot strong{font-size:clamp(34px,4vw,58px);max-width:12ch}.motion-stage[data-engine="spatial-orbit"] .stage-viewport,.motion-stage[data-engine="webgl-field"] .stage-viewport{background:radial-gradient(circle at 72% 36%,var(--wash),transparent 36%),var(--ground-lo)}
@media(max-width:980px){.motion-stage{min-height:520px}.stage-viewport{height:404px}.motion-shot{width:min(78%,440px)}body[data-family="rail-story"] .motion-stage{margin-top:40px}}
@media(max-width:760px){.motion-stage{min-height:0;border-radius:var(--r-lg);transform:none}.stage-engine{display:none}.stage-viewport{height:392px}.motion-shot{width:calc(100% - 32px);left:16px;right:auto;top:32px;padding:16px}.motion-shot strong{font-size:30px}.stage-thesis{left:16px;right:16px;bottom:16px}.stage-timeline{grid-template-columns:auto 1fr}.stage-frame-count{display:none}}
@media(prefers-reduced-motion:reduce){.motion-stage{transform:none}.stage-toggle,.stage-timeline{display:none}.stage-viewport{height:auto;min-height:0;padding:16px;display:grid;gap:12px}.motion-stage .scene-engine{display:none}.motion-stage .scene-engine-fallback{display:block;inset:0;width:100%;opacity:.18}.motion-shot,.motion-stage[data-stage-state] .motion-shot{position:relative;inset:auto;width:100%;padding:16px;opacity:1;transform:none;animation:none;background:color-mix(in srgb,var(--raised) 94%,var(--ground-hi))}.motion-shot:before{margin-bottom:12px}.motion-shot strong{font-size:28px}.motion-shot p{margin-top:8px}.shot-nodes{margin-top:16px}.stage-thesis{position:relative;left:auto;right:auto;bottom:auto;margin:4px 0 0;padding:12px;color:var(--ink-2)}}
`;
}

export function motionStageRuntime() {
  return `const mountMotionStage=()=>{
    const stage=document.querySelector('[data-motion-stage]'),toggle=stage?.querySelector('[data-stage-toggle]'),track=stage?.querySelector('.stage-track i');
    if(!stage||!toggle)return;
    const label=()=>{const state=stage.dataset.stageState;toggle.textContent=state==='playing'?'Pause motion':state==='paused'?'Resume motion':'Replay motion';toggle.setAttribute('aria-pressed',String(state==='paused'))};
    if(reduce){stage.dataset.stageState='complete';toggle.hidden=true;return}
    const restart=()=>{stage.dataset.stageState='idle';requestAnimationFrame(()=>{stage.dataset.stageState='playing';label()})};
    const onToggle=()=>{const state=stage.dataset.stageState;if(state==='complete'||state==='idle')restart();else{stage.dataset.stageState=state==='playing'?'paused':'playing';label()}};
    const onEnd=()=>{stage.dataset.stageState='complete';label()};
    toggle.addEventListener('click',onToggle);track?.addEventListener('animationend',onEnd);
    let autoPaused=false;
    const io=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting&&stage.dataset.stageState==='playing'){stage.dataset.stageState='paused';autoPaused=true;label()}else if(entry.isIntersecting&&autoPaused&&stage.dataset.stageState==='paused'){stage.dataset.stageState='playing';autoPaused=false;label()}},{threshold:.12});
    io.observe(stage);
    const onVisibility=()=>{if(document.hidden&&stage.dataset.stageState==='playing'){stage.dataset.stageState='paused';autoPaused=true;label()}else if(!document.hidden&&autoPaused&&stage.dataset.stageState==='paused'){stage.dataset.stageState='playing';autoPaused=false;label()}};
    document.addEventListener('visibilitychange',onVisibility);
    const fine=matchMedia('(hover:hover) and (pointer:fine)');
    if(fine.matches){const onMove=event=>{const rect=stage.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;stage.style.setProperty('--stage-rx',((.5-y)*3.2).toFixed(2)+'deg');stage.style.setProperty('--stage-ry',((x-.5)*4.2).toFixed(2)+'deg');stage.style.setProperty('--stage-glow-x',(x*100).toFixed(1)+'%');stage.style.setProperty('--stage-glow-y',(y*100).toFixed(1)+'%')};const onLeave=()=>{stage.style.setProperty('--stage-rx','0deg');stage.style.setProperty('--stage-ry','0deg')};stage.addEventListener('pointermove',onMove,{passive:true});stage.addEventListener('pointerleave',onLeave);disposers.push(()=>{stage.removeEventListener('pointermove',onMove);stage.removeEventListener('pointerleave',onLeave)})}
    label();
    disposers.push(()=>{toggle.removeEventListener('click',onToggle);track?.removeEventListener('animationend',onEnd);io.disconnect();document.removeEventListener('visibilitychange',onVisibility)});
  };`;
}

export const MOTION_SCENES = scenes;
