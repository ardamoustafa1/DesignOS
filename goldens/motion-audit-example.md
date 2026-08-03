# Golden: Motion Audit Example

Proof-of-mechanism for a single validator rule, not a page to imitate. Every other golden
in this catalog shows what a whole surface looks like when it clears the bar. This one
exists to answer a narrower, mechanical question: when a real motion regression ships,
does `validators/check-motion.js` actually catch it — and what does that look like end to
end, from a broken drag gesture to the exact JSON finding that names it?

The fixture pair lives under `validators/fixtures/motion-audit-example/`, not inside a
`goldens/<name>/` directory like the other entries in this catalog. That is deliberate:
`before.html` contains a real, intentional regression, and the repo-wide sweeps
(`npm run validate` and friends) scan every file under `goldens/` expecting it to ship
clean. A regression fixture that broke that sweep on every run would either have to be
silenced with an ignore directive — which would also hide it from the direct commands
below, defeating the point — or it lives where the other rule fixtures already do.

## Artifacts

- [`validators/fixtures/motion-audit-example/before.html`](../validators/fixtures/motion-audit-example/before.html) —
  a notification drawer with a real instance of `motion-uninterruptible-transition`
  (`validators/check-motion.js`, added for `motion/physics.md`'s tracking law): the sheet
  drags via `pointerdown`/`pointermove` and writes `transform` directly, but its CSS
  `transition` is never cleared on grab.
- [`validators/fixtures/motion-audit-example/after.html`](../validators/fixtures/motion-audit-example/after.html) —
  the same drawer with the one-line fix: `sheet.style.transition = 'none'` on
  `pointerdown`, restored on `pointerup` for the settle animation.

The two files are otherwise byte-for-byte equivalent — same tokens, same markup, same
reduced-motion handling, same focus styling — so the diff is exactly the bug and exactly
the fix.

## The bug, in the product's terms

Drag the drawer by its edge. In `before.html`, the sheet lags a beat behind the pointer on
every frame, because the 300ms CSS transition is still active while `pointermove` writes a
new `transform` value forty times a second — each write starts a new, never-finished
300ms tween racing the next one. In `after.html`, the sheet is glued to the pointer,
because the transition is turned off for the duration of the gesture and restored only for
the release animation. This is `motion/physics.md`'s "Tracking" section made concrete:
*"there is no animation — there is 1:1 correspondence. [...] Any easing, any transition
[...] inserts lag between the finger and the pixels, and the hand notices ~16ms of it."*

## Recorded gate result (2026-07-30)

```
$ node validators/check-motion.js validators/fixtures/motion-audit-example/before.html --json
{
  "target": "validators/fixtures/motion-audit-example/before.html",
  "findings": [
    {
      "file": "validators/fixtures/motion-audit-example/before.html",
      "line": 24,
      "rule": "motion-uninterruptible-transition",
      "severity": "P2",
      "message": "drags via pointermove/touchmove but this transition (\"transform var(--duration-slow) var(--ease-out)\") is never cleared on grab — the dragged surface will lag the finger instead of tracking it 1:1; set el.style.transition = 'none' on pointerdown before writing transform (physics.md tracking law)"
    }
  ],
  "count": 1
}

$ node validators/check-motion.js validators/fixtures/motion-audit-example/after.html --json
{ "target": "validators/fixtures/motion-audit-example/after.html", "findings": [], "count": 0 }
```

The other four static validators run clean on **both** files — this golden isolates one
rule, it does not fail the fixture on unrelated grounds:

```
node validators/check-drift.js           validators/fixtures/motion-audit-example/{before,after}.html  → clean
node validators/check-a11y-basics.js     validators/fixtures/motion-audit-example/{before,after}.html  → clean
node validators/check-aesthetic-slop.js  validators/fixtures/motion-audit-example/{before,after}.html  → clean
node validators/check-token-contrast.js  validators/fixtures/motion-audit-example/{before,after}.html  → clean
node validators/check-registry.js        validators/fixtures/motion-audit-example/{before,after}.html  → clean
```

Reproduce end to end with the productized front door instead of the raw script:

```
node bin/designos.js detect validators/fixtures/motion-audit-example --rule motion-uninterruptible-transition
```

## Why this rule exists

`motion/physics.md` has described the tracking law since before this rule did — this
golden exists because a *written* rule and an *enforced* one are different guarantees.
Before `check-motion.js` gained this rule, a page could pass every other static check,
ship a drag gesture with exactly this bug, and no automated pass would say so; it would
only be caught by a human noticing the sheet "feels laggy" during manual QA. The
`before.html`/`after.html` pair is the regression test for that gap
(`validators/test-cli.js`), kept as a real, runnable fixture rather than a claim.

## Known gaps

- This is a static-analysis catch, not a measured one — `check-motion.js` reads the
  declaration (a `pointermove` handler and an uncleared `transition`), it does not run the
  page and measure actual frame lag. A drag that clears the transition through some path
  the regex cannot see (e.g. a framework's synthetic event system) would not be flagged;
  conversely a file that clears it for unrelated reasons could suppress a true positive.
  Treat this rule as a strong heuristic, not a proof, exactly like every other entry in
  `validators/rule-registry.js`.
- No browser-verified frame-lag measurement is attached to this golden — the claim that
  `before.html` visibly lags is a description of the mechanism (physics.md), not a
  recorded trace.
