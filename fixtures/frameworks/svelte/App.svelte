<script>
  import { onMount } from 'svelte';
  import { createMotionController } from '../../../runtime/motion/controller.js';
  let target;
  onMount(() => {
    const recipe = new URLSearchParams(location.search).get('recipe') || 'momentum-projection';
    const controller = createMotionController(recipe, target, {
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: 72,
    });
    controller.mount();
    window.__designosAdapter = controller;
    window.__designosReady = true;
    return () => controller.destroy();
  });
</script>
<button id="run" bind:this={target}
  data-designos-source="fixtures/frameworks/svelte/App.svelte:16:1">Svelte motion fixture</button>
