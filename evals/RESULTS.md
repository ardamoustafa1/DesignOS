# Eval Results

Published runs of the benchmark. Methodology: `evals/README.md`. Raw fixtures live in
`evals/samples/`. Honesty rules apply to ourselves: what was measured is stated, what
wasn't is labeled.

> ⚠️ **Read this before citing Run 001.** It is a **maintainer-authored sanity check**,
> not independent validation. Both arms were written by the same person who wrote the
> rules being tested. That's a legitimate way to verify the validators fire correctly
> and to demonstrate the methodology — it is **not** evidence that DesignOS improves
> *your* agent's *independent* output, because the "control" arm's flaws were written
> deliberately, not produced by an unprompted agent. Treat the numbers below as "the
> instrumentation works," not "the product is proven." **Run 002 — a real independent
> run — is the one that would actually support the claim, and it doesn't exist yet.**
> If you run one, PR it in, positive or negative result either way.

## Run 001 — mechanical floor, brief B-Relay (2026-07-10) — MAINTAINER SELF-TEST

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

## Run 002 — cross-file validator reproducibility (2026-07-11) — MAINTAINER CROSS-CHECK

> ⚠️ **Caveat applies.** This run is still maintainer-conducted — not an independent third
> party. What it adds over Run 001: the same validators are run against all fixtures and
> all DesignOS-produced pages in a single pass, confirming the findings are not
> cherry-picked or fixture-specific. Run 003 remains the slot for genuine third-party
> independent validation.

**Scope:** Full validator suite — `check-drift`, `check-a11y-basics`, `contrast.js` —
run against every file in `evals/samples/` and every file in `examples/`. Results
reproduced from live CLI output, 2026-07-11.

### check-drift findings (raw hex + off-grid spacing)

| File | Findings |
|---|---:|
| `evals/samples/control-relay.html` | **43** |
| `examples/showcase-relay.html` | **0** |
| `examples/showcase-relay-dashboard.html` | **0** |
| `examples/showcase-relay-pricing.html` | **0** |
| `examples/showcase-relay-docs.html` | **0** |

### check-a11y-basics findings (missing alt/labels/main, div-onclick)

| File | Findings |
|---|---:|
| `evals/samples/control-relay.html` | **6** |
| `examples/showcase-relay.html` | **0** |
| `examples/showcase-relay-dashboard.html` | **0** |
| `examples/showcase-relay-pricing.html` | **0** |
| `examples/showcase-relay-docs.html` | **0** |

### Contrast spot-checks (`contrast.js`)

| Surface | Ratio | AA Body (4.5:1) |
|---|---:|---:|
| Control: body text `#999` on `#fff` | 2.85:1 | ✗ FAIL |
| Control: card text `#bbb` on `#e0ffe0` | 1.79:1 | ✗ FAIL |
| Control: hero text `#eee` on `#764ba2` | 5.49:1 | ✓ PASS |
| Treatment: muted `#9a9fa8` on raised `#1b1e24` | 6.28:1 | ✓ PASS |

### Reading the numbers

Run 002 confirms two things Run 001 could not:
1. **Consistency across all four DesignOS showcase pages** — not one page passes and
   another hides findings. Zero drift, zero a11y failures across the entire gallery.
2. **The control page's 43 drift findings and 6 a11y failures reproduce exactly** —
   these numbers are not sensitive to run conditions or tooling version.

What this still does not prove: that an independent agent, given the same brief without
being the one who wrote the rules, would produce the same 0-finding output. That claim
requires a third-party run with their own model and their own output. The protocol and
judge prompt are ready — see `evals/README.md`.

### Reproduce Run 002

```bash
node validators/check-drift.js evals/samples
node validators/check-a11y-basics.js evals/samples
node validators/check-drift.js examples/
node validators/check-a11y-basics.js examples/
node validators/contrast.js "#999999" "#ffffff"
node validators/contrast.js "#bbbbbb" "#e0ffe0"
node validators/contrast.js "#eeeeee" "#764ba2"
node validators/contrast.js "#9a9fa8" "#1b1e24"
```

## Run 004 — full A/B on brief B1, control vs treatment (2026-07-18) — SELF-RUN, NON-BLIND

> ⚠️ **Caveat applies, same as above.** One agent (Claude Sonnet 5, single session)
> wrote both arms, fixed the treatment's own bugs, and scored both. L2 evidence per
> `PROOF_STANDARD.md`, not L3. Full report with raw artifacts:
> [`runs/run-004-ledgerline-landing/`](runs/run-004-ledgerline-landing/).

What this run adds that Runs 001–002 could not — the control arm was produced *as a
default agent would produce it*, not authored as a deliberate strawman:

| Measured | Control | Treatment |
|---|---:|---:|
| `check-drift` | 35 | 0 |
| `check-a11y-basics` | 1 (no `<main>`) | 0 |
| `designos review` static risk floor | 0/100, 41 findings (1×P1 nav-unreachable, 1×P1 fake proof) | 100/100, 0 findings |
| Self-scored judge rubric (/60, non-blind) | 26 | 50 |

The run's most useful products were its **failures**, all committed to the report:

1. A 3.14:1 contrast failure shipped **through** the 100/100 static gate, because no
   validator computed contrast on token-resolved pairs → `validators/check-token-contrast.js`
   now exists and is wired into `designos audit`. On its first repo-wide sweep it found
   real findings in the website, one golden pairing, and `starter/tokens.css` (dark-theme
   `::selection` at 2.98:1) — all fixed in the same change.
2. A header flex-collapse layout bug and an unwired `aria-expanded` menu button, both
   invisible to static review, both found only by rendering → recorded as first-pass
   traps in `workflows/final-gate.md` and as failure classes in `scoring/failure-taxonomy.md`.
3. The `check-drift.js` theme-color exemption Run 003's report claimed was shipped
   turned out to exist only in `designos review` — fixed in the validator with a
   regression test, which then exposed (and fixed) a second bug: single-line `:root`
   blocks left the brace tracker open and exempted the rest of the file from all checks.

## Run 005+ — your model, your judge (the one that matters most)

**This slot is the most important unfilled gap in the whole repository.**
Everything above this line is the maintainer checking their own homework; this is where
someone else checks it. Protocol: `evals/README.md` + `evals/judge-prompt.md`, three
judge passes, medians, raw outputs attached to the PR. A negative or mixed result is
exactly as welcome as a positive one — see `evals/field-report-001.md` for what an
honest negative-leaning finding looks like when we run the audit on ourselves.
