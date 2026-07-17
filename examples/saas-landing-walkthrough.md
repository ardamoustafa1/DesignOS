# Example Walkthrough: SaaS Landing Page

A condensed trace of DesignOS handling one real brief, showing what each layer contributes.
Read this to understand how the system *feels* in operation.

## The brief

> "Design a landing page for **Relay** — an incident-management tool for on-call engineering
> teams. We want trial signups. We have product screenshots and 5 customer logos (real).
> Dark theme feels right. — via landing-page workflow"

## Stage trace

**BOOT.** Kernel loads brain files → routes: `patterns/landing-pages.md`, `components/hero.md`,
`industries/saas.md` (+ `analytics-hosting.md` for the ops-adjacent audience), `psychology/*`,
memory bootstrapped (new project — templates copied, client.md filled from brief).

**RESEARCH out** (ux-researcher): One-reader sentence: *"This would have saved us during the
last 2am incident."* Audience: on-call engineers (skeptical, pager-trauma — the
analytics-hosting psychology applies: they're buying sleep) + eng managers (buyer: needs
MTTR numbers). Dark theme **validated** by sector file, not by vibes. Assumption flagged:
pricing is self-serve (→ notes.md).

**WIREFRAME out.** Headline-stack argument, tested alone:
1. *Incidents end 4× faster when nobody's hunting for context* (claim)
2. *Every alert arrives with its runbook, owner, and last-time-this-happened* (mechanism)
3. *Wake the right person, not the whole rotation* (mechanism)
4. *Your postmortem writes itself as you work* (mechanism)
5. *Teams at Loom and Vercel-class infra cut MTTR 43%* (proof — REAL number required, else flagged)
6. *Try it on your next incident — free 14 days* (ask)
Composition: split hero 55/45 (strong screenshot asset → decision-framework rule), sticky
product tour for the 3 mechanisms (workflow story → saas.md), one deep case-study block,
FAQ with the "vs PagerDuty" question (real objection), pre-footer CTA band.

**UI decisions** (the rationale bullets that shipped):
- Dark base `#0B0C0E`, elevation by surface steps; accent: **amber-signal** `#F5A623` family —
  deliberately NOT alert-red (alarm fatigue psychology) and NOT the blue every competitor owns
  (color-psychology procedure step 2: differentiate) → brand.md with reasoning.
- Type: Geist-class grotesque + **mono for log lines and timestamps** in screenshots
  (cybersecurity/analytics texture rule — real content only).
- Motion: precise preset; signature moment = the hero screenshot's incident-timeline drawing
  in once, 400ms; everything else ≤200ms tokens. Reduced-motion: static timeline.
- Trust strip: the 5 real logos, monochromed, captioned *"On call at 400+ engineering teams"*
  — count flagged to todo.md until verified.

**REVIEW (creative-director):** SHIP WITH FIXES — "the amber is the idea; it's currently
also used on the FAQ chevrons, which spends the accent decoratively (colors.md violation).
Protect: the timeline signature moment." Fixed at stage 3.

**ACCESSIBILITY:** FAIL first pass — muted text `#8A8F98` on raised surfaces measured 4.2:1
(dark-theme classic). Token lightened to pass 4.5:1 across all surfaces. Second pass clean.

**PERFORMANCE:** LCP risk — hero screenshot 340KB PNG → AVIF 68KB + `fetchpriority=high`.
Signature animation verified compositor-only. Pass.

**SEO:** intent "incident management tool"; FAQPage JSON-LD on the real FAQ; title
*"Relay — Incident management that ends 2am archaeology"* (≤60ch, promise-first). Pass.

**SCORE (reviewer, cycle 2):** UI 96 · UX 97 · A11y 96 · Perf 97 · Modernity 96 · Conversion 95
→ **SHIP.** (Cycle 1 had Conversion 91: CTA microcopy missing at the pricing-adjacent doubt
peak + fake "43%" unverified — fixed by real-number substitution and *"Free 14 days ·
No credit card · 5-min setup"*.)

**MEMORY after:** brand.md (amber decision + reasons), design.md (token block, motion preset),
pages.md (Home: shipped, min-score 95, metric: trial-signup rate), todo.md (verify logo-count
claim), notes.md (score line + the assumption list).

**EFFECTS PASS (post-2.0, `components/visual-effects.md`):** the page's effect budget spent
in full and no further: ONE backdrop effect (off-center amber glow behind the product panel —
placed away from the copy column, contrast re-verified against the unlit page background the
text actually sits on, static so it costs the LCP nothing) with the mandatory grain pass
(3% `feTurbulence` overlay — banding control, "felt not seen") · ONE interaction effect
(pointer spotlight on the feature cards — `hover: hover` gated so touch keeps the plain
elevated state, rAF-throttled, custom-property writes only). Both share the amber color
story per the deployment law. A border beam on the primary CTA was considered and rejected:
a third effect would cross the budget, and the CTA already wins the eye path without it.

## What to notice

- Every "taste" decision traces to a module rule or a recorded reason — nothing was vibes.
- The two failures (a11y contrast, fake number) are exactly the classes AI design usually
  ships. The loop caught both *before* the user saw the work.
- Total module reads: ~14 files. The kernel's routing meant the other 40+ stayed unloaded.
