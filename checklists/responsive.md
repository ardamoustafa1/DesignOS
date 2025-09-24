# Responsive Checklist

Four widths, two themes, one standard: every breakpoint is a *designed* layout, not a
squeezed one. Check at **375 · 768 · 1024 · 1440** (plus 320 reflow for a11y).

## Global — BLOCKERS
- [ ] Zero horizontal scroll at any width (the #1 instant-fail — check with content extremes: long words, long emails, wide tables)
- [ ] Wide content (tables, code, diagrams) scrolls inside its OWN container, never the page
- [ ] Text: body never below 16px; headings step down 1–2 scale steps via `clamp()`
- [ ] Touch targets ≥44px on touch widths; hover-only affordances have touch equivalents
- [ ] Viewport meta correct; no `maximum-scale=1` zoom-blocking (a11y violation)

## 375 (mobile)
- [ ] Fold is a complete thought: identity + claim + CTA visible (`components/hero.md`)
- [ ] Reflow order = importance order (visual below text in split heroes; hero bento cell first)
- [ ] Secondary/decorative elements CUT, not shrunk (`foundations/layout.md` doctrine)
- [ ] Section padding compressed (~60–75% of desktop — no 128px canyons on a phone)
- [ ] Nav: collapsed pattern complete (CTA still reachable, 44px rows, close mirrors open)
- [ ] Forms: correct `inputmode` keyboards; inputs full-column; sticky CTAs where flows are long
- [ ] Tables: strategy applied (priority columns / sticky-first-col scroll / card transform — `components/tables.md`)
- [ ] Thumb zone: primary actions reachable, destructive out of the lazy arc

## 768 (the awkward middle)
- [ ] Split layouts stack BEFORE they squeeze (the width where split heroes break first)
- [ ] Card grids at intentional counts (3→2, not 2.4); gutters hold
- [ ] Sidebar shells: collapse decision made (rail / drawer / stacked)

## 1024 (small desktop / landscape tablet)
- [ ] Container paddings step up; measure caps hold (no 90ch lines)
- [ ] Nav expanded state correct; dropdowns don't clip viewport edges

## 1440 (and beyond)
- [ ] Containers capped (`foundations/layout.md` table) — content never stretches to 2560
- [ ] Whitespace grows gracefully (margins absorb width; type doesn't inflate past scale)
- [ ] Full-bleed moments still composed at ultrawide (bg meshes/images don't tile/pixelate)

## Cross-cutting
- [ ] Both themes at all four widths (theme bugs hide in breakpoint variants)
- [ ] Images: correct `srcset` candidate loads per width (check network panel, not vibes)
- [ ] Motion: entrance choreography sane at mobile (staggered 6-card rows are 1-column 6-beat delays — regroup)
- [ ] Orientation: landscape phone doesn't break fixed elements/100vh traps (`dvh` units)
- [ ] Print: not shattered (one glance)

**Verdict:** ☐ PASS ☐ FAIL — list each width×theme actually checked in the verification log
(unchecked combinations are "NOT ASSESSED", never assumed).
