# Failure Taxonomy

Use this file when a score is low but the reason feels fuzzy. Naming the failure makes
the next iteration faster.

## Visual Failures

| Failure | Signal | Fix |
|---|---|---|
| Weak hierarchy | eye lands on secondary content | resize, regroup, reduce competing emphasis |
| Token drift | raw color, magic spacing, one-off shadows | map to tokens or document exception |
| Density mismatch | SaaS dashboard looks like a landing page | tighten rhythm, reduce decoration, increase scan structure |
| Decorative noise | visual elements do not carry information | remove until each element earns a job |

## Flow Failures

| Failure | Signal | Fix |
|---|---|---|
| CTA ambiguity | two actions appear equally primary | choose one primary outcome |
| Missing state | happy path only | add loading, empty, error, partial, success |
| Dead end | user cannot recover or continue | add retry, back, request access, clear filters |
| Premature ask | signup/setup before value | move friction after first value |

## Trust Failures

| Failure | Signal | Fix |
|---|---|---|
| Fake proof | invented logos, metrics, testimonials | remove or source |
| Dark urgency | countdowns or scarcity without basis | replace with honest value |
| Compliance theater | badges without certification | cite real compliance or delete |
| Risk hidden | pricing/limits buried | surface constraints near decision point |

## Accessibility Failures

| Failure | Signal | Fix |
|---|---|---|
| Keyboard trap | cannot escape or complete task | fix focus order and escape behavior |
| Invisible focus | outline removed or too subtle | restore tokenized focus ring |
| Contrast debt | muted text below threshold | increase contrast or change background |
| Token-hidden contrast debt | zero raw hex, drift-clean, yet a token pair fails AA (eval Run 004: 3.14:1 through a clean gate) | run `validators/check-token-contrast.js`; token discipline and accessible contrast are different guarantees |
| Semantic mismatch | div buttons, missing landmarks | use correct HTML and ARIA only where needed |
| Unwired ARIA state | `aria-expanded`/`aria-selected` present in markup but no code ever changes it (eval Run 004: menu button with no JS at all) | wire the state or remove the control; ARIA must match reality, which only interaction testing proves |

## Render-Only Failures

Static review structurally cannot see these — they exist only in computed layout.
Every one requires opening the page (eval Run 004 found both through a 100/100 static gate).

| Failure | Signal | Fix |
|---|---|---|
| Flex-parent collapse | a flex container's only child ignores its own `max-width`/`margin: auto` and shrinks to content; header items bunch to 0px gaps | the parent centers, the child lays out — never both; remove the redundant `display: flex` |
| Ghost interactive | control renders, looks complete, does nothing on click | every interactive element gets one real interaction in a browser before ship |

## Performance Failures

| Failure | Signal | Fix |
|---|---|---|
| Layout shift | skeleton/image swaps move content | reserve dimensions |
| Heavy hero | video/canvas blocks first paint | poster, lazy load, reduce JS |
| Motion tax | animations trigger layout | transform/opacity only |
| Font delay | blank text or reflow | system fallback, preload, font-display |

## Anti-patterns

- Calling every issue "polish."
- Lowering the score without naming the failure class.
- Fixing symptoms while keeping the same broken flow.
- Treating accessibility as separate from product quality.

## Checklist

- [ ] Lowest score mapped to at least one failure class
- [ ] Every P0/P1 has a concrete fix
- [ ] Fake proof and dark patterns are classified as trust failures
- [ ] Accessibility failures cap the score according to `scoring/rubric.md`
- [ ] Iteration notes name what changed
