'use strict';
const numberPattern=/-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
function numbers(path){return String(path).match(numberPattern)?.map(Number)||[]}
function compatiblePaths(from,to){const a=numbers(from),b=numbers(to);return a.length>0&&a.length===b.length&&String(from).replace(numberPattern,'#')===String(to).replace(numberPattern,'#')}
function interpolatePath(from,to,progress){if(!compatiblePaths(from,to))throw new Error('SVG morph paths must have matching commands and coordinate counts');const a=numbers(from),b=numbers(to);let index=0;return String(from).replace(numberPattern,()=>String(Number((a[index]+(b[index]-a[index++])*progress).toFixed(3))))}
function mountSvgMorph(path,{from=path?.getAttribute('d')||'',to,duration=600,reduced=false,easing=t=>1-Math.pow(1-t,3)}={}){if(!path||!to)throw new TypeError('SVG morph requires a path and destination');if(!compatiblePaths(from,to))throw new Error('SVG morph paths are incompatible');if(reduced){path.setAttribute('d',to);return()=>{}}let frame=0,start=0,stopped=false;const tick=ms=>{if(!start)start=ms;const p=Math.min(1,(ms-start)/duration);path.setAttribute('d',interpolatePath(from,to,easing(p)));if(p<1&&!stopped)frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>{stopped=true;cancelAnimationFrame(frame)}}
module.exports={numbers,compatiblePaths,interpolatePath,mountSvgMorph};
