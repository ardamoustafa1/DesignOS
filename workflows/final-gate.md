# Workflow: Final Gate

Use this before any design artifact is called "done", "ship", "95+", or "100/100".

## Core rule

Self-scoring is a draft. Static source review is a risk gate, not a complete design
assessment. A final numeric score exists only when the delivery report contains evidence
for every applicable rubric dimension; unchecked rows remain **NOT ASSESSED**.

If the local CLI exists, run it before delivery:

```bash
node DesignOS/bin/designos.js audit  <dir> [token-file]      # all eight registered validator providers
node DesignOS/bin/designos.js review <target> --min 95
node DesignOS/bin/designos.js elevate <target> --no-fail
node DesignOS/bin/designos.js visual <target> --no-fail
node DesignOS/bin/designos.js report <target> --min 95 --no-fail
```

`audit` runs token drift, a11y basics, contrast (same-rule **and** inherited cascade),
motion, aesthetic slop, internal-reference integrity, the unified static-rule registry,
and signature consistency (`validators/rule-registry.js` is the source of truth for this
list). A clean `review` with a skipped `audit` is not a cleared floor —
`review` is a regex pass over source, while the validators resolve tokens, walk the element
tree, and compute ratios.

When the work is an iteration on an existing screen, record the before and measure the
after rather than describing the change:

```bash
node DesignOS/bin/designos.js visual <target> --baseline    # before the edit
node DesignOS/bin/designos.js visual <target> --compare     # after it
```

The diff reports pixels changed, the changed band, and any full-page height shift per
viewport. Movement *outside* the region you edited is the finding worth chasing; add
`--max-diff <pct>` to turn it into a regression gate. A percentage is a measurement, not a
verdict — quote it, do not translate it into "looks the same".

If the user requested a stricter bar, replace `95` with that number. For launch-quality
screens, use `--min 100` only when the deterministic review must be completely clean.

The `review` command may report a 0–100 **static risk indicator** for backwards-compatible
CI thresholds. It must never be presented as the seven-dimension design score. Absence of a
regex/static finding does not prove visual quality, keyboard completion, WCAG conformance,
performance, or conversion quality.

## No complete evidence, no score claim

Do not write:

- "All dimensions passed"
- "98/100"
- "100/100"
- "SHIP"
- "zero findings"

unless the static review ran **and** the verification ledger records the applicable browser,
manual, performance, and accessibility evidence. Any NOT ASSESSED row blocks SHIP language.

If the environment cannot run the CLI, say:

> Deterministic DesignOS review was not run in this environment. This is a self-review,
> not a final score.

## The adversarial panel

The deterministic CLI covers what a regex can see. The seven rubric dimensions are
judgment, and judgment self-graded by the author who just produced the work is the weakest
evidence this system accepts — the same context that made the decisions is being asked to
find them wrong.

If the environment provides subagents, spawn **isolated reviewers** before delivery. Each
one gets the artifact and the rubric dimension, and **not** the rationale, the brief
history, or the score you were hoping for. Contaminating a reviewer with the defence is how
a panel becomes a rubber stamp.

Minimum panel for a shipped page (`CLAUDE.md` §3): **ui-designer → accessibility →
reviewer**. Each returns a structured verdict, not prose:

| Field | Required content |
|---|---|
| Dimension | one of the seven rubric dimensions |
| Score | 0–100 with the band from `scoring/rubric.md` |
| Heuristic scores | Nielsen's 10, each 0–4, for `reviewer` and `ux-researcher` |
| Findings | file:line, severity, what breaks and for whom |
| Blocking? | does any finding hit the `brain/quality-bar.md` instant-fail list |

Reviewers are told to **refute, not confirm**: the job is to find the reason this fails, and
"I could not find one" is a finding in itself. A panel that returns three enthusiastic
passes on the first attempt has usually been asked the wrong question.

Resolve disagreement by evidence, not by majority: a single reviewer with a reproducible
finding beats two without one. Record dissent in the delivery report — a suppressed
minority verdict is the same trust failure as a hidden first score.

### The blind screenshot critique (mandatory, before any SHIP language)

Source-reading yourself and calling it "reviewed" is the single most common way this system
fails silently — the eval history is one incident (Run 004/005) and one live example: a
CV site that passed a self-check on code alone, and was still the generic AI-portfolio
template underneath. `check-craft-ceiling.js` and a clean rubric self-score do not catch
this; only looking at the rendered thing, with fresh eyes, does.

This step is not optional and it is not satisfied by the RENDER/INSPECT stage's own author
looking at their own screenshots — that is measurement, not judgment, and the same context
that made the design decisions is the worst-positioned to see them as generic. Run it after
RENDER/INSPECT and before REVIEW/SCORE close (`loops/design-loop.md` stages 5→6):

1. Render the artifact and capture real screenshots — desktop and mobile at minimum,
   any state that materially changes composition (hover/expanded/scrolled where relevant).
2. Hand the screenshots to an **independent, blind** reviewer: a spawned subagent if
   available, given the images and nothing else — no brief, no rationale, no "what I was
   going for," no prior turns of this conversation. If subagents are unavailable, do the
   pass yourself but only after setting the work aside — do not grade a screenshot you just
   composed while still holding its justification in mind — and the DEGRADED banner below
   is mandatory on the result.
3. The reviewer's only brief: *"You have seen thousands of AI-generated sites this year.
   Would this be mistaken for one of them? What's the first thing a jaded Awwwards judge
   would kill? Rate 1–10 on 'would I feature this' and justify the number harshly."* Ask for
   blunt, unhedged language — a critique softened to be encouraging is a critique that missed
   its job.
4. **Every finding gets actioned or explicitly rejected with a stated reason** before
   delivery — "noted for later" is the same as not running the pass. A finding that reveals a
   real bug (not just a taste call) — a stat that shows 0 before its animation fires, an
   effect that never resolves, a state that never appears — is not a style opinion; fix it
   the same turn.
5. Re-render and re-screenshot after fixes. The critique does not close on a promise, it
   closes on evidence the fix is visible in the artifact.

A score, a SHIP claim, or "95+" language written without this pass having run is the same
provenance failure as `visual pass NOT RUN` renarrated as `CLEAN` — see the renarration ban.

### The DEGRADED banner

When subagents are unavailable, or the panel could not be run, the delivery report carries
this verbatim:

> **DEGRADED — single-context review.** No isolated reviewer ran. Dimension scores below are
> self-assessed by the author of the work and are not independent.

Omitting the banner while claiming a dimension score is fabrication of provenance, and it
falls under the same rule as renarration below. A degraded review is a legitimate result; a
degraded review presented as a panel is not.

## The renarration ban

Generated reports are quoted, never paraphrased upward. If `designos-visual-report.md`
says "NOT RUN" or contains unchecked viewport boxes, your summary must say exactly that —
"visual pass NOT RUN, viewports unverified." Rewriting "Browser render not run" into
"4 viewports verified" or an unchecked ledger into "CLEAN" is fabrication of evidence,
the most serious failure this system recognizes. The same applies to
"Final design score: NOT ASSESSED" — it never becomes a number in your retelling.

## First-pass failure traps

Before running the gate, remove these common first-pass failures:

- clickable `<div>` or `<span>`; use `<button>` or `<a>`
- `outline: none` without an equivalent `:focus-visible`
- `overflow-x: hidden` on `body` as a layout patch
- off-grid spacing such as `6px`, `10px`, `14px`, `18px`, `22px`
- raw colors outside `:root` tokens or documented exceptions
- fake proof: unsourced logos, testimonials, usage counts, awards, compliance badges
- hard compliance claims such as SOC2, ISO 27001, HIPAA, PCI, GDPR, FIPS unless a real
  source is linked in the artifact
- score history or memory notes that claim a pass before the deterministic gate has run
- nav links hidden at any breakpoint without a menu button replacing them
- header items that wrap, collide, or slide under the CTA at 1024px (render it and look)
- a flex container whose only child is the centered `.container` — the child shrinks to
  content and its `max-width`/`margin: auto` silently dies (eval Run 004; render and measure)
- ARIA state attributes (`aria-expanded`, `aria-selected`) with no code that ever updates
  them — a menu button that renders but does nothing (eval Run 004; click it, don't read it)
- token pairs that fail contrast while the file is drift-clean — zero raw hex proves
  nothing about ratios; run `validators/check-token-contrast.js` (eval Run 004: 3.14:1
  badge through a 100/100 static gate)
- LaTeX or markdown syntax rendered as visible UI text (`\to`, `$…$`, `**bold**`)

## Required evidence ledger

- static review findings and command provenance
- screenshots inspected at 375 / 768 / 1024 / 1440; 320 CSS px reflow where applicable
- keyboard path, focus visibility/order, and focus-not-obscured check
- computed contrast and non-color meaning checks across real states
- reduced-motion check; accessibility-tree/screen-reader check for complex interactions
- Lighthouse/CWV measurement for deployable pages, otherwise explicitly NOT ASSESSED
- human/model review for hierarchy, brand fit, distinctiveness, and task completion
- **the blind screenshot critique** (above): reviewer identity (independent subagent or
  DEGRADED self-pass), verdict quoted verbatim, and disposition of every finding
  (fixed / rejected-with-reason) — missing this row blocks SHIP language same as any other

## Required final response

When delivering, include:

- command(s) run
- static risk indicator and final score (or **NOT ASSESSED**)
- finding count
- files changed
- what was not checked

If there were fixes after an initial failure, include both scores. Hiding the first failed
score is a trust failure.
