# Workflow: Final Gate

Use this before any design artifact is called "done", "ship", "95+", or "100/100".

## Core rule

Self-scoring is a draft. The final score is the deterministic gate output.

If the local CLI exists, run it before delivery:

```bash
node DesignOS/bin/designos.js review <target> --min 95
node DesignOS/bin/designos.js elevate <target> --no-fail
node DesignOS/bin/designos.js visual <target> --no-fail
node DesignOS/bin/designos.js report <target> --min 95 --no-fail
```

If the user requested a stricter bar, replace `95` with that number. For launch-quality
screens, use `--min 100` only when the deterministic review must be completely clean.

## No CLI output, no score claim

Do not write:

- "All dimensions passed"
- "98/100"
- "100/100"
- "SHIP"
- "zero findings"

unless the deterministic review command has actually been run and the result is included
or summarized honestly.

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

## Required final response

When delivering, include:

- command(s) run
- final deterministic score
- finding count
- files changed
- what was not checked

If there were fixes after an initial failure, include both scores. Hiding the first failed
score is a trust failure.
