# Golden: Flagship Launch

The upper bound of the motion dial. Use when a brief genuinely reaches rung 8–10 on
`brain/wow-calibration.md` — a product launch, an agency page, a brand moment — and you
need a reference for what *disciplined* maximum looks like.

Every other golden in this repo shows restraint. This one exists because a model with no
example of the ceiling always drifts toward the safe middle, and "safe" is a failure state
for a launch page.

## Artifacts

- [`flagship-launch/index.html`](flagship-launch/index.html) — the golden. Obeys every rule.
- [`flagship-launch/lab.html`](flagship-launch/lab.html) — a technique lab that
  **deliberately** breaks the scarcity law so all ten catalogue entries can be inspected
  side by side. It is a reference sheet, not a page to imitate, and it says so at the top.

## Load

- `brain/wow-calibration.md`
- `motion/signature-moments.md`
- `motion/principles.md`, `motion/performance.md`
- `brain/originality.md`
- `industries/saas.md`

## Brief

> Launch page for Cadence, a release tool that collapses six manual steps — tag, changelog,
> build, sign, publish, announce — into one command. Technical buyers. The competitor set is
> loud. Make it memorable without making it slow.

Fictional product, clearly labelled as such in the footer. No customers, no logos, no
compliance badges, because none exist (`PROOF_STANDARD.md`).

## Dials and rung

```
dials:       variance 6 · motion 9 · density 3
rung:        9 of 10 — launch page, loud competitor set
cap check:   industries/saas.md — no sector cap. Under fintech/health this would be 4.
```

## The two signatures

**Signature 1 · hero-scale — scroll-driven storytelling.**
A pinned stage where six step chips fold away one at a time as the reader scrolls, the
count drops 6 → 1, and the surviving chip becomes `cadence ship`.

*Product truth it expresses:* the product's entire argument is "six things become one".
The page does not describe the collapse, it performs it. Remove the animation and the
visitor understands the product less — which is the test in `wow-calibration.md` §3.

Folding runs from the **end** of the row backwards so the survivor lands at the left edge,
where the eye started reading. Folding from the front leaves the last chip stranded on the
right and the composition reads as a bug.

**Signature 2 · interaction-scale — magnetic primary CTA.**
The one primary button leans toward the cursor inside a 130px field, with a 0.32 strength
and an exponential follow.

*Product truth it expresses:* the product is fast and wants to be run. Only the primary CTA
is magnetic; the ghost button next to it is inert, so the magnetism reads as hierarchy
rather than as a page-wide effect.

**The split-text hero entrance is not a third signature.** It is the composition arriving —
two lines, 80ms apart, done in 500ms. It carries no interaction and stops existing after
first paint.

## Rejected candidates

| Technique | Why not |
|---|---|
| Text scramble | no data-transformation story; the product moves steps, it does not decrypt anything |
| 3D tilt | no artefact worth turning over — the page has no product screenshot |
| Noise canvas | atmosphere is not the argument here; it would compete with the pinned stage |
| Cursor spotlight | only three cards, and they are not a comparison set |
| Odometer | the numbers section is proof, not the hero. Rolling digits there would pull weight away from the collapse |

The rejected list is the evidence a choice was made rather than a catalogue browsed.

## Must show

- exactly two signatures, with three calm sections doing the work between them
- a reduced-motion path that removes the pin and renders the story as a plain document
- token-driven durations and easings throughout — no literal `400ms` anywhere
- `will-change` armed by JS only while the follow loop runs, then dropped
- every listener and rAF returning a cleanup, wired to `pagehide`
- fictional framing stated plainly in the footer

## Failure to catch

A launch page that stacks five effects, ships 120KB of motion JS, animates the LCP heading
from `opacity: 0`, and leaves `will-change: transform` on a rest-state rule. It looks like
effort and reads as cheap. The scarcity law exists to prevent exactly this.

The second failure this golden guards against is the opposite one: a "launch page" that is
indistinguishable from a docs homepage because nobody was willing to spend the motion
budget the brief actually authorised.

## Recorded gate result (2026-07-29)

```
node validators/check-drift.js           goldens/flagship-launch   → clean
node validators/check-a11y-basics.js     goldens/flagship-launch   → clean
node validators/check-motion.js          goldens/flagship-launch   → clean
node validators/check-aesthetic-slop.js  goldens/flagship-launch   → clean
node validators/check-token-contrast.js  goldens/flagship-launch   → clean
```

Browser-verified in the DesignOS preview pane at 1440px:

- scroll story: progress 0 → 1 drives count 6 → 1, survivor swaps to `cadence ship`,
  `data-final` set only at the end of the rail
- magnetic CTA: 9.36px follow at 60px pointer offset inside the field; `data-armed` present
  only while the loop runs, absent once settled; transform returns to ~0 on leave
- lab: scramble resolves and exposes `aria-label`; spotlight sets `--mx`/`--my`; tilt
  reaches 4.80deg and arms; odometer builds 5 columns at offsets 9,4,2,1,8; parallax
  layers translate 2.82 / 6.58 / 11.74px by depth; morph toggles `aria-expanded` and the
  panel; no horizontal scroll at any tested width

**Final design score: NOT ASSESSED.** No `designos review` run and no adversarial panel ran
against these files (`workflows/final-gate.md` — DEGRADED, single-context review). The
validator results above are quoted, not interpreted.

## Known gaps

- Not measured under a 4× CPU throttle, which `wow-calibration.md` §5 makes mandatory at
  this rung. The noise canvas in `lab.html` is the line most likely to fail it.
- The scroll story is JS-driven rather than using `animation-timeline: view()`; the
  CSS path is documented in `signature-moments.md` §6 but not used here because the
  effect needs per-step text swaps, not just a transform ramp.
- No Lighthouse run. The pages are static and dependency-free, but that is an argument,
  not a measurement.
