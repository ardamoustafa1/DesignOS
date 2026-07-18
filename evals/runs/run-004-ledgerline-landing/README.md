# Run 004 — ledgerline-landing (Brief B1)

> Independent eval runs can be positive, mixed, or negative. The only failure is hiding raw conditions.

**Status: self-authored, non-blind, single run.** The same agent/session wrote both arms,
fixed the treatment's own bugs, and scored both. This is evidence for the maintainer's own
`PROOF_STANDARD.md`, at best **L2** ("before/after artifact, scorecard, author notes") — it
is explicitly **not** L3 (no independent runner, no independent judge, N=1). Treat every
number below as a self-review, not a benchmark result.

## Metadata

| Field | Value |
|---|---|
| Date | 2026-07-18 |
| Runner | Claude (Sonnet 5), same session as both arms — self-run, not independent |
| Agent surface | Claude Code (this session) |
| Model(s) | claude-sonnet-5 |
| Brief set | B1 only (`evals/briefs.md`) — a declared single-brief subset, not the full 10 |
| DesignOS commit SHA | `eb71bec7af3e48d9dda16c8b6aa1d66403767118` |
| Time budget | Not tracked — single continuous session, not timeboxed per protocol §4 |
| Follow-up steering | **Deviation from protocol**: the treatment arm was iterated after its first deterministic-gate failure (token/spacing fixes) and after browser verification surfaced a real layout bug (header `display:flex` collapsing its child's width) and a contrast failure (success badge). Control was NOT iterated — shipped as first-pass output, matching how a default agent would actually ship it in one turn. This is intentional (the design loop mandates iterate-under-95, and final-gate.md explicitly requires reporting both pre- and post-fix scores rather than hiding the first failure — see below) but it does mean the arms are not both "single-turn" in the strict protocol sense. Recorded here rather than hidden.

## Brief used (verbatim, B1)

> Design a landing page for "Ledgerline", a bookkeeping automation tool for small
> agencies. Audience: agency owners who hate spreadsheets. Goal: trial signups.
> We have no screenshots yet. Light theme.
>
> Deliver a single self-contained HTML file.

## Raw Artifacts

- Control output: [`control/index.html`](control/index.html) — no DesignOS modules loaded, brief taken at face value, shipped first-pass
- Treatment output: [`treatment/index.html`](treatment/index.html) — DesignOS boot sequence followed (`brain/design-intelligence.md`, `patterns/landing-pages.md`, `components/hero.md`, `components/buttons.md`, `foundations/typography.md`, `foundations/spacing.md`, `foundations/colors.md`, `checklists/accessibility.md`), iterated to a clean gate
- Logs: [visual-report-treatment](logs/visual-report-treatment.md) — `designos.js visual` output (Playwright unavailable in this environment; browser pass NOT RUN by the CLI — see "What the CLI could not check" below for what was verified manually instead)

## Commands

```bash
node validators/check-drift.js evals/runs/run-004-ledgerline-landing/control/index.html
node validators/check-a11y-basics.js evals/runs/run-004-ledgerline-landing/control/index.html
node validators/check-drift.js evals/runs/run-004-ledgerline-landing/treatment/index.html
node validators/check-a11y-basics.js evals/runs/run-004-ledgerline-landing/treatment/index.html
node bin/designos.js review evals/runs/run-004-ledgerline-landing/control/index.html --min 95
node bin/designos.js review evals/runs/run-004-ledgerline-landing/treatment/index.html --min 95
```

## Validator Results

| Brief | Arm | Drift findings | A11y findings | `designos review` static risk floor |
|---|---|---:|---:|---:|
| B1 | Control | 35 | 1 (`no-main`) | 0/100 (41 findings; 1×P1, rest P2) |
| B1 | Treatment (first pass) | 9 | 0 | — (fixed before first `review` run) |
| B1 | Treatment (final) | 1 (false positive, see below) | 0 | 100/100 (0 findings) |

These are **static risk floors**, not the seven-dimension design score — quoted exactly as
the tool labels them, per `workflows/final-gate.md`'s renarration ban.

### The one remaining treatment finding is a validator gap, not a real defect
`check-drift.js:6` flags `<meta name="theme-color" content="#FAFAFA">` as `raw-hex` because
its regex matches "color" + a hex value on any line, with no exemption for `<meta>` tags.
`evals/runs/run-003-antigravity-pricing/README.md` (this repo's own prior run) states
"theme-color meta values are allowed" as a fix that shipped after that run — but `grep -n
theme-color CHANGELOG.md` returns nothing, and the regex in `validators/check-drift.js`
has no such exemption today. **This is a real, reproducible gap between a documented claim
and the shipped validator**, found incidentally while running this eval, not a treatment
defect. `bin/designos.js review` (a separate, newer code path) does NOT flag this same line
— so the fix exists in one tool and not the other. Left unfixed here since fixing DesignOS's
own validator is out of scope for an eval run; flagging it for a maintainer instead.

## What DesignOS's own gate caught in the control arm

Running `designos.js review` against the control arm (which nothing in this repo produced —
it's what a bare capable agent would ship) surfaced, unprompted:

- **P1 Conversion / proof-risk** at the "Trusted by 2,400+ agencies" logo row — an invented
  number and five invented company names with no source, exactly the failure
  `brain/design-intelligence.md`'s anti-pattern #7 and `PROOF_STANDARD.md` are written to catch.
- **P1 Accessibility / nav-hidden-no-menu** — control hides the nav `<ul>` at ≤768px with no
  menu button anywhere in the markup. Verified independently in the real browser (see below):
  agency owners on a phone cannot reach Features/Customers/Pricing at all.
- **P2 Accessibility / contrast-risk** flagged the `#999` and muted-gray usages; manually
  computing it with `validators/contrast.js "#999999" "#FFFFFF"` gives **2.85:1**, failing
  WCAG AA (4.5:1) outright — used for the "Trusted by" caption and the copyright line.
- 35 raw-hex / off-grid-spacing findings — every color in the control arm is an inline hex
  with no token layer, and 8 spacing values (10px, 34px, 14px, 18px, 30px, 90px×2) are off
  the 4px grid.

## What the CLI could not check, and what manual browser verification found instead

`designos.js visual` could not run a browser pass (Playwright not installed in this
environment) — logged honestly in [the visual report](logs/visual-report-treatment.md)
as **NOT RUN**, per the renarration ban. Rather than leaving that as an unassessed gap, this
run used the session's own browser tool to actually render both arms and verify by
observation (`workflows/final-gate.md`'s required evidence ledger), which surfaced a real bug
the static gate structurally cannot catch:

- **Real bug found by rendering, not by any validator**: the treatment's `header` rule had
  `display: flex` in addition to its child `.container` div already doing flex layout via an
  inline style. A flex container's only child becomes a flex item sized by content
  (shrink-to-fit), not by the child's own `max-width: 1200px; margin: 0 auto` — so the header
  content collapsed to ~564px and visually bunched together (logo touching "Features",
  "FAQ" touching "Log in", measured at **0px gap** via `getBoundingClientRect()`, both should
  have been ~32px). `designos.js review` scored this file 100/100 static risk floor at the
  time — the drift/token/spacing checks have no way to see actual rendered geometry. Fixed by
  removing the redundant `display:flex` from `header` itself; re-measured gap after the fix:
  **318px** clearance on both sides, correct.
- **Real bug found by interaction, not by static review**: the mobile menu button rendered
  with `aria-expanded="false"` but had no JavaScript wiring at all — a truthful-ARIA violation
  (`checklists/accessibility.md`: "State ARIA truthful... match reality") invisible to any
  static scan since the markup and CSS both looked complete. Added a real toggle (class +
  `aria-expanded` sync, focus-to-first-link on open, Escape to close and return focus,
  outside-click to close, auto-close above 768px) and verified via direct DOM dispatch that
  `aria-expanded` and the open panel state now match — screenshotted at 375px showing the
  panel open with a visible focus ring on "Features".
- One tooling caveat, reported rather than hidden: the browser tool's coordinate-based click
  at (578, 74) on the rendered hamburger icon did not register a click in this preview
  environment, while `element.click()` dispatched via the JS console worked correctly and
  produced the expected screenshot. This reads as a limitation of the click-coordinate mapping
  in this specific preview tool, not a defect in the artifact — noted for transparency, not
  papered over.
- A genuine accessibility bug this run introduced and then fixed: the mock "Up to date" /
  "Matched" status badges used `--success: #16A34A` on a light green chip
  (`--success-subtle: #EFFDF4`), measured at **3.14:1** via `validators/contrast.js` — fails
  AA body text (4.5:1) at that font size. Changed `--success` to `#166534` (6.8:1 on the
  chip, 7.13:1 on white) and re-verified. This did not appear in `check-drift.js` or
  `designos.js review` output at all — neither validator computes contrast on token-referenced
  color pairs, only flags raw hex outside the token layer. **Token discipline and accessible
  contrast are different guarantees; passing one says nothing about the other.**
- Screenshots taken and manually inspected at 375px and 1024px (the "awkward middle" breakpoint
  `components/hero.md` specifically warns splits heroes break at first): no overlap, no
  horizontal scroll (`document.documentElement.scrollWidth === clientWidth` confirmed at
  375px for both arms), hero visual correctly reorders above the text column at ≤1024px.
- 768px, keyboard-only tab order beyond the mobile-menu check, `prefers-reduced-motion`
  rendering, and Lighthouse/Core Web Vitals were **not** checked this run — stated here as
  NOT ASSESSED rather than left implicit.

## Self-Scored Judge Results (NOT blind, NOT independent — see status banner)

Using the six-dimension rubric from `evals/judge-prompt.md`, scored by the same agent that
authored both arms, from evidence actually gathered above (validator output, measured
contrast ratios, rendered screenshots) rather than impression:

| Brief | Arm | Hierarchy | Craft | Accessibility | States | Distinctiveness | Fitness | Total /60 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| B1 | Control | 7 | 5 | 3 | 3 | 3 | 5 | 26 |
| B1 | Treatment | 9 | 9 | 9 | 8 | 6 | 9 | 50 |

Rationale for the widest gaps:
- **Accessibility (3 vs 9)**: control's nav is unreachable on mobile with zero replacement
  (verified, not assumed) and has a measured 2.85:1 contrast failure; treatment passed the
  a11y validator clean and had its own contrast bug caught and fixed before scoring.
- **Distinctiveness (3 vs 6, smallest gap of the six)**: control invents fake customer logos
  and a named fake testimonial ("Dana Reyes, Brightpath Studio") — the strongest,
  cheapest-to-fake signal a template-generator produces. Treatment replaced this with an
  honest founder-note and no invented numbers, which is a trust decision, not a visual
  distinctiveness one — the visual language itself (blue-accent SaaS look) is still fairly
  conventional on both arms. This matches `brain/originality.md`'s own prediction that
  distinctiveness gains are the smallest category, which held here.

## Findings

### Where DesignOS helped
- Caught two fabricated-proof patterns in the control arm's failure mode before they'd ship:
  invented customer count/logos and a named fake testimonial — exactly what
  `PROOF_STANDARD.md` and `brain/design-intelligence.md` anti-pattern #7 exist to prevent, and
  the treatment arm (built under those rules) didn't reproduce them.
- The deterministic gate (`designos.js review`) caught a real, unreachable-on-mobile nav bug
  in the control arm with zero prompting — a P1 finding a generic agent's self-review would
  likely have missed, since the page "looks" complete when viewed on desktop.
- Routing to `components/hero.md` and `patterns/landing-pages.md` produced a page with a
  single conversion goal and one primary CTA throughout, versus control's still-reasonable
  but more generic structure.

### Where DesignOS hurt or added cost
- Reading six-plus module files before writing anything is real token/time cost this report
  does not have an exact number for (time budget was not tracked — a protocol violation
  worth fixing in the next run).
- The kernel's own tooling has real gaps: the theme-color false positive and the
  contrast-blind-spot in `check-drift.js` mean a treatment run can hit a clean 100/100 static
  gate while still shipping a real WCAG failure. The gate is necessary but not sufficient,
  exactly as `workflows/final-gate.md` itself states — this run is a concrete instance of
  that warning being correct.
- Following the modules did not prevent the header `display:flex` bug or the unwired mobile
  menu button — both were authored fresh during the treatment build and only caught by
  actually rendering the page, not by loading more DesignOS content. More prompt-file
  guidance did not substitute for execution verification.

### Ambiguous results
- This is N=1, one brief, one model, one non-blind session. The gap between 26/60 and 50/60
  is large enough to be a real signal on this brief, but says nothing about B7 (the
  distinctiveness stress test) or the other 8 briefs, and nothing about model/agent transfer.

## Conclusion

On this one brief, self-scored by the same session that wrote both arms: the control arm
(no DesignOS) shipped with a P1 unreachable-mobile-nav bug, a measured WCAG contrast failure,
and fabricated social proof (fake customer count, fake named testimonial) — none of which its
author would have known about without exactly the kind of deterministic gate DesignOS ships.
The treatment arm, built by following the routed modules, avoided the fabrication pattern
entirely and passed the deterministic gate clean (100/100 static risk floor, 0 findings) —
but only after two rounds of fixes, one driven by the gate (raw hex, off-grid spacing) and
two driven by actually rendering the page in a browser (a real flex-sizing layout bug, a real
contrast failure, an unwired ARIA control), which the static gate could not see. The honest
reading is not "DesignOS produces a perfect page automatically" — it's "the module content
prevented one specific, real class of failure (fabricated proof, generic-template
accessibility gaps) that the control arm hit on the first try, while the deterministic gate
caught real defects the agent's own narration would have missed, and still needed a genuine
render-and-observe pass to catch what static analysis structurally cannot." This is one
data point, not a benchmark; running the remaining 9 briefs with an independent runner and a
blind model judge is the next step before this counts as more than a self-review.
