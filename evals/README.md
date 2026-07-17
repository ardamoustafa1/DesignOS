# Evals — Measuring Whether DesignOS Actually Works

Claims need evidence (`psychology/trust.md` applies to us too). This folder is the
benchmark protocol: the same briefs, run with and without DesignOS, scored blind.
Run it on your own agent/model before trusting the system — and after modifying it.

## Protocol

### 1. Conditions
- **Control:** the agent with its default system prompt, no DesignOS.
- **Treatment:** the same agent + model + settings with DesignOS installed per
  `GETTING-STARTED.md` (kernel imported, agents registered).
- Same brief text, same single-turn constraint (no follow-up steering in either arm —
  steering skill is a confound), same output format request (single self-contained HTML).

### 2. Briefs
Use `briefs.md` — 10 briefs spanning sectors, surface types, and difficulty. Don't
cherry-pick; run all 10 or a pre-declared subset. Add your own briefs BEFORE seeing any
outputs (post-hoc brief selection is how benchmarks lie).

### 3. Blind scoring
- Strip identifying comments/headers from outputs; randomize order; label A/B.
- Scorers: human designers where available, or a STRONG judge model with NO DesignOS
  context, using the neutral judge rubric below (not DesignOS's own rubric — grading
  the treatment with the treatment's rulebook inflates it).
- Judge rubric (0–10 each, defined in one line to resist drift):
  1. **Hierarchy** — is there an unmistakable reading order?
  2. **Craft** — spacing/type/color discipline at a professional bar
  3. **Accessibility** — contrast, focus, semantics, reduced-motion (mechanical checks
     via `validators/` run FIRST and reported separately)
  4. **States** — hover/focus/loading/empty/error presence where applicable
  5. **Distinctiveness** — would it survive the logo-swap test?
  6. **Fitness** — does it serve THIS brief's audience and sector?
- Also record: `validators/check-drift.js` + `check-a11y-basics.js` finding counts per
  output (the objective floor).

### 4. Reporting honestly
- Report per-brief scores, not just means (one dimension may regress while means rise).
- Report validator counts, token/time cost of the treatment arm (DesignOS reads modules;
  the cost is real — measure it).
- Publish losses with the wins. A benchmark that never loses is marketing
  (`patterns/comparison-pages.md` doctrine, applied to ourselves).
- N matters: 10 briefs × 1 run is a smoke test; ×3 runs each starts meaning something
  (generation variance is large).

## Interpreting results
Expected signature of a working install: large gains on **States, Accessibility, Craft**
(mechanical discipline), moderate on **Hierarchy/Fitness**, smallest on
**Distinctiveness** (taste transfers hardest — see `brain/originality.md`).
If validator counts DON'T drop in the treatment arm, the kernel isn't loading — debug
the install before doubting the system (`GETTING-STARTED.md` troubleshooting).

## Regression use
After editing modules: re-run the affected briefs (a pricing-module change → briefs 3
and 8). Score deltas below the noise floor are fine; systematic drops are a
rule-challenge issue (`CONTRIBUTING.md`) with data attached — exactly the evidence
standard we ask of contributors.

## Submitting Run 003+

Use [`independent-run-guide.md`](independent-run-guide.md) and
[`RUN_TEMPLATE.md`](RUN_TEMPLATE.md) for independent reports. The template is
intentionally specific: model versions, agent surface, prompt text, raw validator output,
judge-pass medians, and negative findings all belong in the PR. Run 003 is tracked in
[`run-003-call-for-evals.md`](run-003-call-for-evals.md). A mixed or negative run is
useful evidence; a perfect-looking report with no raw outputs is marketing, not eval.
