# Workflow: Final Gate

Use this before any design artifact is called "done", "ship", "95+", or "100/100".

## Core rule

Self-scoring is a draft. Static source review is a risk gate, not a complete design
assessment. A final numeric score exists only when the delivery report contains evidence
for every applicable rubric dimension; unchecked rows remain **NOT ASSESSED**.

If the local CLI exists, run it before delivery:

```bash
node DesignOS/bin/designos.js review <target> --min 95
node DesignOS/bin/designos.js elevate <target> --no-fail
node DesignOS/bin/designos.js visual <target> --no-fail
node DesignOS/bin/designos.js report <target> --min 95 --no-fail
```

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

## Required evidence ledger

- static review findings and command provenance
- screenshots inspected at 375 / 768 / 1024 / 1440; 320 CSS px reflow where applicable
- keyboard path, focus visibility/order, and focus-not-obscured check
- computed contrast and non-color meaning checks across real states
- reduced-motion check; accessibility-tree/screen-reader check for complex interactions
- Lighthouse/CWV measurement for deployable pages, otherwise explicitly NOT ASSESSED
- human/model review for hierarchy, brand fit, distinctiveness, and task completion

## Required final response

When delivering, include:

- command(s) run
- static risk indicator and final score (or **NOT ASSESSED**)
- finding count
- files changed
- what was not checked

If there were fixes after an initial failure, include both scores. Hiding the first failed
score is a trust failure.
