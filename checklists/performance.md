# Performance Checklist

Speed is design (`brain/reference-library.md` — Linear doctrine). Budgets are gates, not
aspirations; "we'll optimize later" is how 6MB pages ship.

## Budgets — the gates
- [ ] **LCP < 2.0s** (4G, mid-device) · **CLS < 0.1** · **INP < 200ms**
- [ ] Lighthouse ≥ 95 all categories (throttled run, not dev-machine-warm-cache)
- [ ] Page weight: marketing ≤ 1.5MB first load (hero-video pages ≤ 2.5MB with lazy strategy); JS ≤ 200KB compressed on content pages
- [ ] Measured, projected, or NOT ASSESSED — labeled honestly (`scoring/rubric.md`)

## Images (the usual 70% of weight)
- [ ] AVIF/WebP with fallbacks; quality tuned per image (hero ≠ thumbnail)
- [ ] `width`/`height` (or aspect-ratio) on EVERY image — CLS discipline
- [ ] `srcset`/`sizes` responsive variants; retina without 4× waste
- [ ] Below-fold: `loading="lazy"`; LCP image: `fetchpriority="high"` + preload, never lazy
- [ ] SVG for icons/logos (optimized, inlined where reused); no icon-font zombies

## Fonts
- [ ] ≤2 families, only used weights, subset where possible; WOFF2
- [ ] `font-display: swap` + metric-compatible fallback (`size-adjust`) — zero layout jump
- [ ] Critical fonts preloaded; no FOIT walls

## CSS & JS
- [ ] Critical CSS inline-or-fast; unused styles purged (refactor-loop grep)
- [ ] JS does only what CSS can't; no framework for a brochure page
- [ ] Third-party scripts inventoried — each one justified, deferred, or deleted (analytics/chat/tag-manager pileups are the silent killers)
- [ ] Code-split by route; nothing blocks first paint that isn't first-paint's job

## Motion & interaction (`motion/performance.md`)
- [ ] Compositor-only animation (transform/opacity); zero layout-property tweens
- [ ] Infinite animations pause off-viewport and hidden-tab
- [ ] ≤3 concurrent movers; `will-change` applied/removed surgically
- [ ] Interaction feedback never waits on long tasks (INP coupling)
- [ ] 4× CPU throttle test: still 60fps on the signature moment

## Loading architecture
- [ ] App shell / skeleton strategy: chrome instant, content-shaped placeholders (`components/states.md`)
- [ ] Indicators delayed 300ms; skeleton→content swap = zero CLS
- [ ] Fonts/images/data race gracefully — no pop-in cascade reordering the page
- [ ] Video: poster + lazy + compressed (≤2MB bg loops) + `preload="none"` off-fold

## Delivery
- [ ] Compression (brotli/gzip) verified; caching headers sane; CDN for static
- [ ] No 3-hop redirect chains; DNS/preconnect for critical origins
- [ ] Test on real mid-range mobile + throttled network — the Mac lies (`motion/performance.md`)

**Verdict:** ☐ PASS ☐ FAIL — attach numbers + method to the report's verification log.
