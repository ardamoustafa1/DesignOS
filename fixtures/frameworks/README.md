# Framework Runtime Matrix

These are executable integration fixtures, not documentation snippets. `npm run
test:frameworks` builds all six adapters with their real framework packages, serves the
outputs, and drives each control with Playwright in full and reduced-motion contexts.

Every fixture must expose `#run`, set `data-complete="true"` after activation, retain a
44×44 target, and carry a `data-designos-source` marker used by Live Director source
mapping.
