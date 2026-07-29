<script>
  import { projectMomentum } from '../../../runtime/motion/core.js';
  let complete = false;
  const run = () => { complete = true; };
</script>
<button id="run" data-complete={String(complete)}
  data-designos-source="fixtures/frameworks/svelte/App.svelte:6:1"
  style:transform={`translateX(${complete && !matchMedia('(prefers-reduced-motion: reduce)').matches ? projectMomentum(120, .8) : 0}px)`}
  on:click={run}>Svelte motion fixture</button>
