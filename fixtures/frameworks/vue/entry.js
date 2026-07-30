import { createApp, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { createMotionController } from '../../../runtime/motion/controller.js';
const app = createApp({
  setup() {
    const target = ref(null);
    let controller;
    onMounted(() => {
      const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
      controller = createMotionController(recipe, target.value, {
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        duration: 72,
      });
      controller.mount();
      window.__designosAdapter = controller;
      window.__designosReady = true;
    });
    onBeforeUnmount(() => controller?.destroy());
    return () => h('button', {
      id: 'run',
      ref: target,
      'data-designos-source': 'fixtures/frameworks/vue/entry.js:20:18',
    }, 'Vue motion fixture');
  },
});
app.mount('#app');
window.__designosUnmount = () => app.unmount();
