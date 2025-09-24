# The Quality Bar — What 95+ Actually Looks Like

"Premium" and "modern" are not adjectives here; they are checkable properties.
This file defines the bar the Review Engine enforces.

## The tell-tale differences

What separates a 95 from an 80 is never one big thing. It's the accumulation of small
correctnesses. Auditors: look for these first.

### Spacing (the #1 giveaway)
- **80:** uniform padding, elements floating at arbitrary distances, cramped text blocks.
- **95:** 4px-grid discipline; related items visibly closer than unrelated ones (proximity encodes
  meaning); line length 60–75ch; sections breathe *differently* — rhythm, not repetition.

### Typography
- **80:** default weights, one size jump between heading levels, tight line-height headings, gray #999 body.
- **95:** a deliberate scale (1.2–1.333 ratio); display type with negative tracking (-0.02em to -0.04em);
  body 16–18px at 1.6–1.7 line-height; true text colors (near-black on light, ~#E5E5E5 on dark, never pure).

### Color
- **80:** 6+ saturated colors, gradient backgrounds everywhere, gray borders #ccc.
- **95:** one accent doing all the interactive work; neutrals doing 90% of the surface; borders barely
  visible (5–8% opacity lines); color used so sparingly that when it appears, it *means* something.

### Detail craft
- **95 includes:** consistent border radii from one scale; shadows with color (not pure black alpha);
  focus rings styled to brand; selection color set; scrollbar considered; favicon and og-image present;
  optical alignment corrections (icons visually centered, not mathematically).

### Motion
- **80:** everything fades in on scroll, 500ms+, bounces.
- **95:** interactions respond ≤150ms; one signature moment; easing curves consistent system-wide;
  nothing moves that doesn't communicate.

## Reference bar by product

Steal the *standard*, not the pixels (details: `brain/reference-library.md`):

- **Stripe** — the bar for: trust surface, docs-grade clarity in marketing, gradient restraint, footer IA.
- **Linear** — the bar for: speed-as-brand, dark UI craft, keyboard-first, changelog/marketing hybrid.
- **Apple** — the bar for: subtraction, product photography scale, one-message-per-viewport.
- **Vercel** — the bar for: monochrome confidence, developer credibility, typographic hierarchy without color.
- **Notion** — the bar for: friendly-professional balance, illustration voice, template ecosystems.
- **Airbnb** — the bar for: search-dominant IA, photographic warmth, review/social-proof presentation.

## Instant-fail conditions

Any of these caps the relevant score at 60 regardless of other merits:

1. Contrast failure on body text or primary CTA
2. Horizontal scroll at any standard breakpoint
3. Missing keyboard path to the primary action
4. Layout shift on image/font load (CLS symptoms)
5. Lorem ipsum or obvious placeholder in a "final" deliverable
6. Fake specificity (invented customer counts, fabricated testimonials) without a loud placeholder flag
7. Primary CTA below the fold on a marketing page with no CTA above it
8. Unstyled focus states / `outline: none` without replacement

## The squint, the glance, the minute

Three timescales every screen must win:

- **The squint (0.5s):** blurred, the page still shows clear structure — a dominant mass, a
  supporting mass, an action point.
- **The glance (3s):** a first-time visitor can answer *what is this* and *what do they want me to do*.
- **The minute (60s):** a skeptical visitor finds proof — real numbers, real screenshots, real logos,
  honest pricing — and no contradiction between claims and craft.

## Calibration notes for the reviewer

- Grade against the references above, not against "average websites." Average is failing.
- A score of 95 means: *a design director at one of the reference companies would ship this.*
- 100 is reserved for work with zero findings after an adversarial pass. It should be rare.
- When in doubt between two scores, give the lower one and say why.
