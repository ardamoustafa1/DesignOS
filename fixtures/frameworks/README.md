# Framework Runtime Matrix

These are executable integration fixtures, not documentation snippets. `npm run
test:frameworks` builds all six adapters with their real framework packages, serves the
outputs, and drives each control with Playwright in full and reduced-motion contexts.

The matrix executes every one of the 15 recipes in every stack in both full and
reduced-motion modes. Each of the 90 adapter combinations must expose a 44×44 `#run`
target and a Live Director source marker, then mount, run from a real click, reach a
measured final DOM state, reverse, cancel an in-flight animation, unmount through the
framework lifecycle, and report zero retained listeners. The reduced-motion pass
repeats the same semantic state transitions without spatial motion.
