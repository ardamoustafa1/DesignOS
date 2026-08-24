'use strict';

/** Dependency-free runtime used by compiled scenes and static exports. */
function browserRuntimeSource() {
  return `(function(){'use strict';
const media=matchMedia('(prefers-reduced-motion: reduce)');const fine=matchMedia('(hover:hover) and (pointer:fine)');
const controllers=[];const q=(s,r=document)=>[...r.querySelectorAll(s)];
function animate(el,frames,options){if(media.matches){Object.assign(el.style,frames.at(-1));return null}const a=el.animate(frames,options);controllers.push(()=>a.cancel());return a}
function reveal(root){const els=q('[data-motion~="reveal"],[data-motion~="stagger"]',root);if(media.matches){els.forEach(el=>el.dataset.motionVisible='true');return}const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.dataset.motionVisible='true';io.unobserve(entry.target)}),{threshold:.14,rootMargin:'0px 0px -8%'});els.forEach(el=>io.observe(el));controllers.push(()=>io.disconnect())}
function pointers(root){if(media.matches||!fine.matches)return;q('[data-motion~="magnetic"]',root).forEach(el=>{let raf=0;const move=e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.14,y=(e.clientY-r.top-r.height/2)*.14;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)')};const reset=()=>{cancelAnimationFrame(raf);el.style.transform=''};el.addEventListener('pointermove',move,{passive:true});el.addEventListener('pointerleave',reset);controllers.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset);reset()})});q('[data-motion~="tilt"],[data-motion~="spotlight"],[data-motion~="parallax"]',root).forEach(el=>{let raf=0;const move=e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{el.style.setProperty('--motion-x',x+'px');el.style.setProperty('--motion-y',y+'px');el.style.setProperty('--motion-rx',((.5-y/r.height)*5).toFixed(2)+'deg');el.style.setProperty('--motion-ry',((x/r.width-.5)*5).toFixed(2)+'deg')})};el.addEventListener('pointermove',move,{passive:true});controllers.push(()=>el.removeEventListener('pointermove',move))})}
function scroll(root){let raf=0;const update=()=>{raf=0;const max=document.documentElement.scrollHeight-innerHeight,p=max?scrollY/max:0;document.documentElement.style.setProperty('--motion-page-progress',p);q('[data-motion~="progress"],[data-motion~="parallax"]',root).forEach(el=>{const r=el.getBoundingClientRect(),local=Math.max(0,Math.min(1,1-r.top/(innerHeight+r.height)));el.style.setProperty('--motion-progress',local)})};const request=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',request,{passive:true});update();controllers.push(()=>{removeEventListener('scroll',request);cancelAnimationFrame(raf)})}
function mount(root=document){reveal(root);pointers(root);scroll(root);document.documentElement.dataset.motionReady='true';return destroy}
function destroy(){controllers.splice(0).forEach(fn=>fn())}window.DesignOSMotion={mount,destroy,animate,media};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(),{once:true});else mount();
})();`;
}

const BASE_CSS = `
[data-motion~="reveal"],[data-motion~="stagger"]{opacity:0;transform:translate3d(0,24px,0);transition:opacity 640ms cubic-bezier(.16,1,.3,1),transform 640ms cubic-bezier(.16,1,.3,1)}
[data-motion-visible="true"]{opacity:1;transform:none}[data-motion~="stagger"]:nth-child(2){transition-delay:70ms}[data-motion~="stagger"]:nth-child(3){transition-delay:140ms}[data-motion~="stagger"]:nth-child(4){transition-delay:210ms}
[data-motion~="tilt"]{transform:perspective(900px) rotateX(var(--motion-rx,0deg)) rotateY(var(--motion-ry,0deg));transition:transform 120ms linear;transform-style:preserve-3d}
[data-motion~="spotlight"]{--motion-x:50%;--motion-y:50%}[data-motion~="parallax"]{--motion-progress:0;transform:translate3d(0,calc((.5 - var(--motion-progress)) * 32px),0)}
[data-motion~="magnetic"]{will-change:transform}[data-motion~="press"]:active{transform:scale(.97)}
@media(prefers-reduced-motion:reduce){[data-motion]{animation:none!important;transition:none!important;transform:none!important;opacity:1!important}}
`;

module.exports = { browserRuntimeSource, BASE_CSS };
