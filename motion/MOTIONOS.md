# MotionOS — Executable Motion Direction

MotionOS turns a brief into a coherent motion character, scene graph, executable
recipe set, browser runtime and fail-closed quality evidence. It supplements the
principles in this directory; it does not license motion that those principles reject.

## Pipeline

```text
brief → motion genome → scene selection → recipe contracts → runtime → scene gate
```

- `runtime/motion/catalog.js` owns 120 executable recipe contracts in eight categories.
- `runtime/motion/scenes.js` owns 12 four-recipe scenes with at least three semantic roles.
- `runtime/motion/genome.js` selects a deterministic character and scene family from a brief/seed.
- `runtime/motion/browser-runtime.js` supplies dependency-free reveal, pointer, scroll and cleanup behavior.
- `runtime/motion/engines/` supplies raw WebGL2, injected Three.js, Rive state-machine,
  SVG morph and native View Transition engines with non-empty fallbacks.
- `runtime/motion/asset-pipeline.js` fingerprints images/video, enforces byte budgets,
  reads intrinsic dimensions where available and pairs depth/mask assets with sources.
- `runtime/motion/catalog-adapters.js` compiles all 120 contracts for six web stacks
  (720 combinations).
- `bin/motion-scene-compiler.js` emits the complete portable scene contract.
- `validators/check-motion-scene.js` blocks missing roles, bindings, reduced motion and passive scroll.

## Commands

```bash
designos motion-playground --out motion-atlas.html
designos motion-scene --brief "cinematic portfolio" --intensity 8 --out scene.json
designos motion-assets ./public/media --out motion-assets.json
npm run validate:motion-scene
```

## Runtime policy

Each recipe declares its driver, duration, easing, compositor properties, reduced-motion
equivalent, mobile fallback, cleanup contract and provenance. Spatial/WebGL recipes fall
back to a poster or CSS depth treatment when the asset or device budget is insufficient.
Native scroll remains authoritative; MotionOS never scroll-jacks.

The Atlas gives every recipe its own live descriptor, composition, timing and interaction
surface. Rive files, product models, footage and depth maps remain product assets: the
engines are executable, but DesignOS does not invent fake brand assets when none exist.

## Executed evidence

- `validators/test-motionos-catalog-matrix.js` compiles all 720 generated adapter modules
  with esbuild and runs all 120 contracts in Chromium in both full and reduced-motion
  modes (240 mount/cleanup cycles).
- `validators/test-motionos-context-loss.js` forces `WEBGL_lose_context` and asserts the
  shader stage reaches its declared static fallback.
- `validators/test-motionos-route-transition.js` navigates between two documents and
  verifies the shared `motionos-project` identity plus the reduced-motion duration.
- `studio/tests/motion-scene-browser.mjs` generates and mounts the editorial, cinematic,
  and technical Studio scene families; reduced motion suppresses the cinematic canvas.
- The pre-existing framework matrix remains the full framework lifecycle proof. The
  720-contract compiler proof does not pretend every generated module was independently
  mounted inside every framework runtime.

## Review checklist

- [ ] The scene expresses a product truth and uses no more than two signature moments.
- [ ] Four semantic roles are declared and backed by executable bindings.
- [ ] Reduced motion preserves content, hierarchy and task completion.
- [ ] Pointer motion is fine-pointer gated; scroll work is passive and rAF-batched.
- [ ] WebGL, Three and Rive surfaces have a non-empty static fallback.
- [ ] Assets pass size, intrinsic-dimension, poster and depth-pair checks.
- [ ] Full and reduced temporal evidence was captured.
- [ ] Motion profiling passed at the declared CPU rate and viewport.
- [ ] Physical-device evidence is labelled `NOT_ASSESSED` when no device was connected.
