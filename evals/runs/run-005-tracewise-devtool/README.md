# Run 005 — tracewise-devtool

> Independent eval runs can be positive, mixed, or negative. The only failure is hiding raw conditions.

> ⚠️ **Self-run, non-blind — same caveat as Runs 001/002/004.** One agent (Claude Fable 5,
> single session) wrote both arms, fixed the treatment's own bugs, and scored both. This is
> L2 evidence per `PROOF_STANDARD.md`, not L3. It exists to exercise the protocol and the
> validator suite on a **dark, developer-tool** brief — Run 004 covered light/SaaS; this
> covers the theme and audience Run 004 didn't.

## Metadata

| Field | Value |
|---|---|
| Date | 2026-07-18 |
| Runner | Claude (Fable 5), self-run |
| Agent surface | Claude Code |
| Model(s) | claude-fable-5 |
| Brief | B2 — `evals/briefs.md` |
| DesignOS commit SHA | `762305b1583e705e7064c4820230b939b1061520` |
| Time budget | one session, not separately timed |
| Follow-up steering | none — brief run verbatim, both arms single-turn |

## Brief (verbatim, B2)

```text
Design a landing page for "Tracewise", a distributed-tracing tool for backend teams.
Audience: senior engineers, skeptical of marketing. Goal: docs visits and CLI installs.
Dark theme.

Deliver a single self-contained HTML file.
```

## Raw Artifacts

- Control output: [`control/index.html`](control/index.html)
- Treatment output: [`treatment/index.html`](treatment/index.html)
- Logs: none captured (no browser-automation log export in this environment)

## Commands

```bash
node validators/check-drift.js evals/runs/run-005-tracewise-devtool/control
node validators/check-a11y-basics.js evals/runs/run-005-tracewise-devtool/control
node validators/check-drift.js evals/runs/run-005-tracewise-devtool/treatment
node validators/check-a11y-basics.js evals/runs/run-005-tracewise-devtool/treatment
node validators/check-token-contrast.js evals/runs/run-005-tracewise-devtool/treatment
node bin/designos.js review evals/runs/run-005-tracewise-devtool/control/index.html --no-fail
node bin/designos.js review evals/runs/run-005-tracewise-devtool/treatment/index.html --no-fail
```

## Validator Results

| Brief | Arm | Drift findings | A11y findings | Token-contrast | `designos review` static floor |
|---|---|---:|---:|---:|---:|
| B2 | Control | 51 | 1 (missing `<main>`) | not run (n/a — control has no token layer to check) | 0/100, 55 findings |
| B2 | Treatment | 0 (14 on first pass, iterated to 0) | 0 | 0 findings | 100/100, 0 findings |

Contrast spot-checks (`contrast.js`, treatment token pairs):

| Pair | Ratio | AA body (4.5:1) |
|---|---:|---|
| `#34D399` accent on `#0A0A0B` bg | 10.29:1 | ✓ |
| `#C7C9CC` secondary text on `#0A0A0B` bg | 11.93:1 | ✓ |
| `#8B8D91` muted text on `#0A0A0B` bg | 5.95:1 | ✓ |
| `#04150C` on-accent text on `#34D399` accent | 9.77:1 | ✓ |

## Blind Judge Results

**Not run.** No independent judge model was used — scoring above is entirely the mechanical
validator suite plus the deterministic `designos review` gate. The judge-rubric table is
omitted rather than filled with a self-graded number (`evals/judge-prompt.md` requires a
judge with no DesignOS context; that step is unfilled here, same as every prior run).

## Findings

### Where DesignOS helped

- **35 raw-hex + off-grid-spacing findings avoided by construction.** The treatment used a
  `:root` token layer from the first draft (mirroring `foundations/colors.md` /
  `foundations/design-tokens.md`); the control, written as a default agent would, hard-codes
  colors and spacing throughout — reproducing the same class of debt Runs 001/002/004 found.
- **`industries/analytics-hosting.md`'s named anti-patterns were exactly what the control
  fell into**, unprompted: the control's `.card` grid claims "Blazing Fast" with zero
  number attached, and its stats row (`10B+ spans processed daily`, `5,000+ engineering
  teams`, `99.99% uptime SLA`) are unsourced invented metrics — the module's anti-pattern
  list names both failure modes before this run ever produced them.
- **The proof-risk check caught the fabricated testimonial** ("Sarah Chen, Principal
  Engineer at CloudScale") but — see below — missed the bigger fabrication.

### Where DesignOS hurt or added cost

- **Real authoring cost.** The treatment took materially more iteration than the control:
  a first-pass 14 off-grid-spacing findings had to be fixed by hand before the gate cleared.
  Token discipline is not free even when you're the one enforcing it.

### The genuinely useful failure this run produced

- **The static gate's proof-risk check has a real blind spot, confirmed here.** It flagged
  the named-person testimonial in the control but did **not** flag `10B+ spans processed
  daily`, `5,000+ engineering teams`, or `99.99% uptime SLA` — three fabricated numbers with
  zero source, exactly what `PROOF_STANDARD.md` and `industries/analytics-hosting.md`
  ("uptime claims without status-page links") both name as violations. The regex-based
  proof-risk check apparently keys on phrases like "Trusted by" / "Loved by" and named
  quotes, not on bare unsourced statistics. **This is a real product gap, not a run
  artifact** — filed as a follow-up: `check-drift.js`/`designos review` should flag bare
  large numbers (`\d[\d,]*\+?\s*(teams|customers|spans|requests|users)`) near marketing
  copy without an adjacent source link.
- **The header flex-parent-collapse bug from Run 004 reproduced itself, in a fresh file,
  written by the same agent that documented the fix.** `header { display:flex }` wrapping
  a `.container` that is *also* `display:flex` collapsed the container to shrink-to-fit,
  visually fusing the logo into the first nav link at 1024px — with the static gate still
  reporting 100/100, 0 findings throughout. Caught only by measuring
  `getBoundingClientRect()` gaps in the browser, exactly as `scoring/failure-taxonomy.md`
  (added after Run 004) predicted a static tool cannot see this class of bug. This is the
  taxonomy entry's first real-world confirmation: knowing about a failure mode in a
  document did not prevent authoring it again minutes later — only rendering caught it.

### Ambiguous results

- Whether the treatment's visual/UX quality is actually better — not just more
  token-disciplined — remains unassessed. No blind judge ran. The "Illustrative trace —
  not a live account" and "Illustrative product preview" honesty labels are a deliberate
  DesignOS-influenced choice (proof standard) but their effect on a skeptical-engineer
  audience's actual trust is a taste/psychology claim, not something this run measured.

## Conclusion

Mechanically, treatment cleared the same categories of debt as Runs 001/002/004 (token
drift, missing landmarks, off-grid spacing) — consistent, not novel. What this run adds:
first dark-theme/dev-tool brief exercised, and it surfaced two concrete, actionable product
gaps rather than just confirming known ones — the proof-risk regex misses bare fabricated
statistics, and the flex-parent-collapse bug survives even when the same agent already
knows about it from a prior run, because knowledge in a markdown file doesn't reach code
unless something forces a render-and-measure step. Both are logged as follow-up work, not
silently fixed and hidden. Independent, blind-judged Run 006+ remains the open, most
important gap.
