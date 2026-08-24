import webgl from '../../runtime/motion/engines/webgl.js';
const canvas=document.querySelector('canvas');const destroy=webgl.mountWebGLField(canvas,{maxDpr:1.25,colorA:[.015,.025,.04],colorB:[.98,.26,.07],onError:error=>console.error(error)});addEventListener('pagehide',destroy,{once:true});document.documentElement.dataset.ready='true';
