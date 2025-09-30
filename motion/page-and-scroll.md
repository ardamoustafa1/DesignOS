# Page Transitions & Scroll Motion

The most abused category of web motion. Rule zero: **the user owns the scrollbar.**
Anything that fights, hijacks, or taxes scrolling fails review.

## Scroll-triggered entrances
The tasteful default for marketing pages — and only there (apps: content is just *there*).

```
Trigger      IntersectionObserver at ~20% visibility (or animation-timeline: view())
Move         opacity 0→1 + translateY(16–24px→0)   — subtle; 40px+ feels like a curtain call
Duration     400–500ms ease-out
Stagger      60–80ms within a group, cap 5–6
Once         animate on first reveal only; never re-run on scroll-up
Threshold    elements already in the initial viewport DO NOT scroll-animate (hero has its
             own entrance; nothing should be invisible at load waiting for a scroll it already has)
```

- Variate by content, not per-element randomness: text blocks rise, images may scale 0.97→1, stats count up — one behavior per content type, consistent across the page.
- Below-fold sections animate as *groups* (heading + body + visual in one stagger), not as 14 individually-queued elements dribbling in.
- Long pages: by the 4th section the user has seen the trick — later sections may reduce to opacity-only or nothing. Motion budget depletes downward.

## Parallax (a scalpel, not a paintbrush)
- License: hero background layers, decorative shapes, image depth in editorial/portfolio/real-estate contexts. Max 2 layers, offsets ≤15% of scroll distance.
- Text NEVER parallaxes. Content NEVER desynchronizes from its section.
- Implementation: `animation-timeline: scroll()` / transform-only on composited layers; no scroll-event JS doing layout math (`motion/performance.md`).
- Full-page scroll-jacking (wheel = one section snap, cinematic scrub): banned in DesignOS deliverables. Product-tour scroll-scrub sections (Apple-style canvas scrubbing) are an *expert* exception — only with explicit user request, a static fallback, and mobile opt-out.

## Sticky choreography
The professional alternative to parallax theatrics:
- **Sticky product demo:** copy scrolls in steps left, product visual sticks right and swaps state per step (250ms crossfade per step). The best feature-tour pattern in modern SaaS.
- **Sticky section headers** in long docs/lists; sticky CTAs on mobile product pages (appear after hero, disappear at footer).
- Sticky elements need visible boundaries — users must sense where sticking starts/ends; jarring attach/detach = broken feel. Ease the transition with a subtle shadow/border on attach.

## Page transitions (SPA / View Transitions)
- Default: **fast beats fancy** — instant content swap with a 150ms fade covers 95% of products.
- View Transitions API for element continuity (list card → detail hero morph): 250–300ms, one morphing element + crossfade for the rest. Morph the element the user *clicked*, that's the thread of continuity.
- Loading between routes: top progress bar (2–3px, accent) for >300ms navigations; skeleton of the incoming page beats spinner-void.
- Scroll restoration: back-button returns to previous scroll position, always. New forward routes start at top with focus moved to h1 (`foundations/accessibility.md`).

## Scroll-linked UI (allowed set)
- Navbar transforms (solid-on-scroll, hide-down/show-up — `components/navigation.md`)
- Reading progress bar (articles ≥1500 words)
- Back-to-top (appears after 2 viewports)
- TOC active-section highlighting (scrollspy, 150ms)
- Scroll-cue in hero (subtle, stops after first scroll, never a bouncing arrow GIF)

## Anchors & smooth scroll
- `scroll-behavior: smooth` for same-page anchors (with `scroll-margin-top` matching sticky nav height) — and it auto-disables under reduced-motion via media query pairing.
- Anchor jumps move focus too, not just viewport.

## Anti-patterns
- Scroll-jacking of any flavor (wheel hijack, momentum override, inverted scroll)
- Entrance animations on above-the-fold content triggered by load+scroll double-queue
- Elements that animate every time they re-enter the viewport
- Parallax on mobile (janky + motion-sickness against touch physics)
- Horizontal scroll sections inside vertical pages without visible affordance + keyboard path
- 20-element stagger cascades (the "PowerPoint 2003" effect)
- Content invisible without JavaScript (progressive enhancement: animations enhance visible content, never gate it)

## Checklist
- [ ] All scroll entrances: once-only, group-staggered, subtle, in-viewport-at-load exempt
- [ ] No scroll-jacking; scrollbar honest; keyboard/anchor paths intact
- [ ] Parallax within license (≤2 layers, no text, no mobile)
- [ ] Route transitions ≤300ms with scroll restoration + focus management
- [ ] Content exists without JS; reduced-motion collapses everything to fades/none
