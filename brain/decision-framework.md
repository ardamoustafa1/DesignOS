# Decision Framework — How to Choose

Design work is a stream of decisions under uncertainty. This file makes the big ones fast
and consistent.

## The priority stack

When goals collide, resolve in this order:

1. **Usability** — the user can complete the task
2. **Accessibility** — *every* user can complete the task
3. **Clarity** — they understand what they're looking at without effort
4. **Performance** — it happens fast
5. **Conversion** — the business goal is served
6. **Beauty** — it's a pleasure to look at
7. **Novelty** — it's memorable

Beauty never buys back a usability loss. Novelty never buys back anything — it's a bonus,
not a currency.

## Decision recipes

### Choosing a layout direction
- Product with a strong visual (screenshot/device/data) → **asymmetric split hero**, product right.
- Pure message, no visual asset → **left-aligned editorial hero**, oversized type.
- Enterprise trust play → **centered but restrained**, logos immediately under the fold line.
- Never decide by coin flip: the asset inventory decides.

### Choosing density
- Marketing pages → low density, one idea per viewport-height.
- Dashboards → high density is a *feature*; whitespace budget goes into grouping, not padding
  (`components/dashboard.md`).
- Forms → one column, generous vertical rhythm, density is the enemy (`components/forms.md`).

### Choosing a theme (light/dark)
- Developer tools, cybersecurity, gaming, AI-infra → dark-first is credible.
- Healthcare, education, e-commerce, real estate → light-first; dark reads as niche.
- Fintech → light for consumer trust, dark for trading/pro tools.
- Whatever you pick: **commit**. A half-considered second theme scores worse than none.

### Choosing typefaces
Default pairing logic (full spec: `foundations/typography.md`):
- SaaS/AI: grotesque sans for display (Inter/Geist/General Sans class) + same family for body.
- Editorial/portfolio: high-contrast serif display + neutral sans body.
- Fintech/enterprise: neo-grotesque, tight tracking on display, generous on captions.
- Never more than 2 families. Weight and size create hierarchy, not font-count.

### Choosing how much motion
- Every product: micro-interactions on interactive elements (≤200ms).
- Marketing: + one signature scroll or entrance moment.
- Dashboards/tools: entrance animations near zero; motion budget goes to state feedback.
- If `prefers-reduced-motion`: everything collapses to opacity ≤150ms or nothing.

### Build vs. decorate
When a screen underperforms, diagnose in this order:
1. Wrong hierarchy? (most common) → restructure
2. Weak copy? → rewrite before redesigning
3. Missing proof? → add evidence, not ornament
4. Only then: visual polish

## Tradeoff table

| Tension | Resolution |
|---|---|
| Rich visuals vs. LCP < 2.0s | Visuals lose. Compress, lazy-load, or cut. |
| Brand color vs. contrast ratio | Contrast wins; adjust the shade, keep the hue. |
| Clever navigation vs. recognized pattern | Recognition wins. Innovate in content, not chrome. |
| More features on pricing page vs. decision fatigue | Three tiers, one highlighted. Full matrix behind a toggle. |
| Animation delight vs. INP < 200ms | Compositor-only properties or cut it. |
| Client "make the logo bigger" vs. hierarchy | Offer isolation (whitespace) instead of size. Record in `memory/notes.md`. |

## Irreversibility check

Before locking a decision, classify it:
- **Reversible** (a color token, a section order) → decide fast, record in `memory/design.md`, move on.
- **Expensive to reverse** (IA, framework, type system, URL structure) → generate 2–3 options,
  score against the priority stack, state the tradeoff to the user.

## The 70% rule

When a brief is ambiguous, don't stall and don't guess silently. Build the 70%-confident
interpretation, list the assumptions explicitly in the rationale, and flag the 2–3 forks where
a different answer would change the design materially.
