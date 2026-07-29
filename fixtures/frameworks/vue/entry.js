import { createApp, h, ref } from 'vue';
import { projectMomentum } from '../../../runtime/motion/core.js';
createApp({
  setup() {
    const complete = ref(false);
    return () => h('button', {
      id: 'run',
      'data-complete': String(complete.value),
      'data-designos-source': 'fixtures/frameworks/vue/entry.js:7:18',
      style: { transform: `translateX(${complete.value && !matchMedia('(prefers-reduced-motion: reduce)').matches ? projectMomentum(120, .8) : 0}px)` },
      onClick: () => { complete.value = true; },
    }, 'Vue motion fixture');
  },
}).mount('#app');
