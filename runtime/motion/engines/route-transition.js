'use strict';
function transitionRoute(update,{name='designos-route',reduced=false}={}){if(typeof update!=='function')throw new TypeError('Route transition requires an update function');if(reduced||!document.startViewTransition){update();return Promise.resolve({fallback:true})}document.documentElement.style.setProperty('--route-transition-name',name);const transition=document.startViewTransition(update);return transition.finished.then(()=>({fallback:false}),error=>({fallback:false,error}))}
function bindSharedElement(element,name){if(!element||!/^[a-z][\w-]*$/i.test(name))throw new TypeError('Shared element needs a safe transition name');element.style.viewTransitionName=name;return()=>element.style.removeProperty('view-transition-name')}
module.exports={transitionRoute,bindSharedElement};
