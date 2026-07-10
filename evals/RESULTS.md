# Eval Results

Published runs of the benchmark. Methodology: `evals/README.md`. Raw fixtures live in
`evals/samples/`. Honesty rules apply to ourselves: what was measured is stated, what
wasn't is labeled.

## Run 001 — mechanical floor, brief B-Relay (2026-07-10)

**Scope:** the objective, script-measurable layer only (the validators). The judge arm
(hierarchy, distinctiveness, fitness — `evals/judge-prompt.md`) requires independent
blind runs and is **NOT INCLUDED** in this table; run it yourself and PR the numbers.

**Arms:**
- **Control** — [`samples/control-relay.html`](samples/control-relay.html): the
  default-agent output style for the brief (the annotated version is the
  [Before/After demo](../website/before-after.html))
- **Treatment** — [`../examples/showcase-relay.html`](../examples/showcase-relay.html):
  the same brief through the DesignOS loop (decision trail:
  [walkthrough](../examples/saas-landing-walkthrough.md))

### Validator findings (lower is better)

| Check | Control | Treatment |
|---|---:|---:|
| `check-drift` (raw hex, off-grid spacing, bare outline, !important) | **43** | **0** |
| `check-a11y-basics` (missing alt/labels/main, div-onclick) | **6** | **0** |

### Contrast spot-checks (`contrast.js`, WCAG AA body = 4.5:1)

| Surface | Ratio | Verdict |
|---|---:|---|
| Control: body text `#999` on `#fff` | 2.85:1 | ✗ FAIL |
| Control: card text `#bbb` on `#e0ffe0` | 1.79:1 | ✗ FAIL |
| Control: hero text `#eee` on gradient mid `#764ba2` | 5.49:1 | ✓ (the one pass) |
| Treatment: muted text `#9a9fa8` on raised `#1b1e24` | 6.28:1 | ✓ PASS |

### Reading the numbers

- The control page isn't a strawman of *effort* — it's a strawman of *system*: it has
  a nav, hero, features, social proof, and CTAs. What it lacks is exactly what the
  validators count: token discipline, semantic structure, and contrast law.
- 43→0 and 6→0 are the **floor**, not the ceiling: scripts can't score hierarchy,
  honesty, or taste. Those live in the judge arm and the six-dimension review —
  which is the point: DesignOS clears the floor mechanically so attention goes to
  judgment.
- **Caveat, stated plainly:** both fixtures were authored in the DesignOS repository.
  For the claim to harden, third parties should reproduce with their own agents on the
  briefs in [`briefs.md`](briefs.md) — the protocol and judge prompt are ready. PR your
  runs into this file.

### Reproduce it

```bash
node validators/check-drift.js evals/samples
node validators/check-a11y-basics.js evals/samples
node validators/check-drift.js examples/showcase-relay.html
node validators/check-a11y-basics.js examples/showcase-relay.html
node validators/contrast.js "#999999" "#ffffff"
```

## Run 002 — your model, your judge (pending)

The judge-arm table is waiting for its first independent run:
`evals/README.md` protocol + `evals/judge-prompt.md`, three judge passes, medians.
Submit via PR with raw judge outputs attached.
