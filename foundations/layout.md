# Layout

## Principles
1. **Layout is hierarchy made physical.** Decide the eye path first (`brain/design-intelligence.md`), then choose the structure that enforces it.
2. **Alignment is non-negotiable.** Every element aligns to something. One broken alignment reads as a bug; two read as incompetence.
3. **Asymmetry is confidence.** Centered-everything is the default of the unsure. Use asymmetry deliberately, alignment religiously.
4. **Contain, then compose.** A max-width container per content type; full-bleed only as a deliberate accent.

## Containers

| Content | Max-width |
|---|---|
| Prose / articles | 680–720px |
| Marketing sections | 1140–1200px |
| Wide showcases (screenshots, tables) | 1280–1440px |
| App shells | fluid, with 1600px cap for readability |

Side padding: 16–24px mobile, 32px tablet, 48px+ desktop. Content never touches viewport edges.

## Core compositions (name them, use them)

- **Split hero (60/40 or 55/45):** message left, visual right. The workhorse of SaaS. Visual may bleed off-canvas right for energy.
- **Editorial stack:** left-aligned oversized type, full-width, content below. For message-first brands (Vercel-style).
- **Centered spotlight:** single centered column ≤800px. Only when there is exactly one element chain (headline→sub→CTA→visual). Beyond that it collapses into vagueness.
- **Zig-zag features:** alternating image/text rows. Cap at 3 rows; alternate *proof types* instead of only flipping sides.
- **Bento grid:** mixed-size cards in a dense grid. Modern default for feature overviews; needs strict internal alignment and one hero cell. Don't force content into it that has hierarchy — bento flattens hierarchy.
- **Sidebar shell:** 240–280px nav + fluid content. The app default (`components/dashboard.md`).
- **Holy-grail marketing page:** nav / hero / logos / features / proof / pricing-or-CTA / FAQ / footer. Deviate by intent, not by accident (`patterns/landing-pages.md`).

## Section rhythm (the difference between a page and a list)

Pick the right composition per section and a page still fails if *every* section is the same
shape. The default output — eyebrow, centred h2, three-or-four equal cards, `border-top`,
repeat — is the "uniform card rhythm" anti-pattern in `brain/taste-ladder.md`, and it is the
single most reliable tell of generated work.

**The rule: no composition repeats twice in a row, and no page uses fewer than four.**

Rhythm has four axes; vary at least two between adjacent sections:

| Axis | Values to alternate |
|---|---|
| Width | contained (1140) · narrow (720) · wide (1400) · full-bleed |
| Structure | split · stack · grid · single artefact · table · quote/statement |
| Density | breathing (128px block padding) · normal (96) · dense (64, for data) |
| Ground | page background · raised surface · inverted (dark band in a light page) · bordered |

A worked rhythm for a marketing page — read the shape column top to bottom and notice that
no two neighbours match:

```
hero        full-bleed   · split          · breathing · page
proof strip contained    · single row     · dense     · bordered
how-it-works wide        · sticky demo    · breathing · raised
argument    narrow       · editorial text · normal    · page
data        contained    · table          · dense     · raised
objection   narrow       · statement      · breathing · inverted
CTA         contained    · centred        · breathing · page
```

**Separators earn their place.** A `border-top` on every section is a rhythm substitute, not
a rhythm. Change of ground colour, a change of width, or a deliberate overlap separates
sections better than a hairline — keep the hairline for where a *hard* break is meant.

**Scale contrast is a rhythm tool.** If the largest type on the page is 2.5× the body and
everything between is evenly spaced, the page has a ramp, not a hierarchy. One section
should be allowed a genuinely large statement (4–6× body) with almost nothing around it.

## Visual weight & balance
- Weight sources: size, darkness/saturation, density, isolation. A small dark logo can balance a large light illustration.
- Every viewport-height slice of the page should have a dominant element. Two rivals = split attention = neither wins.
- Direction: faces and product screenshots "look" somewhere — point them *into* the content, never off-page.

## The fold (still real)
- Above the fold at 1440×900 *and* 390×844: identity (what is this), value claim, primary CTA, one credibility cue.
- Don't cram: the fold needs a *complete thought*, not the whole story. A visible edge of the next section ("scroll cue") beats an arrow icon.

## Layering & depth
- Elevation scale: page → surface (+1) → raised (hover/dropdown, +2) → overlay (modal, +3). Each level = one shadow token or one surface-lightness step (dark themes).
- Shadows: large+soft+low-opacity, tinted with surface hue. Two-layer shadows (tight+ambient) read most naturally. Never `box-shadow: 0 0 10px #000`.
- Overlap as craft: cards overlapping a hero's bottom edge, screenshots breaking section boundaries — stitches sections together. Use 1–2 overlaps per page maximum.

## Responsive behavior
- Columns: 12 (desktop) → contents reflow to 6/4 (tablet) → single column (mobile) — but *reorder by importance*, not DOM luck: visual-after-text on mobile for split heroes.
- Line lengths and touch targets drive breakpoints — break where the layout breaks, not at device folklore. Standard checks: 375, 768, 1024, 1440.
- Mobile is not "desktop, squeezed": cut secondary elements (decorative illustration, tertiary nav) rather than shrinking everything.

## Anti-patterns
- Full-width text (measure violation) — the most common AI layout failure
- Three center-aligned sections in a row (no anchor for the eye)
- Cards of equal visual weight for content of unequal importance
- Sections that are each exactly 100vh ("slideshow disease")
- Screenshot floating with no frame, shadow, or background association
- Every section built from the same eyebrow → h2 → card-grid → `border-top` block
- One container width for the entire page (no wide, narrow, or full-bleed moment anywhere)

## Checklist
- [ ] Eye path stated; layout enforces it
- [ ] ≥4 distinct section compositions; no shape repeats in adjacent sections
- [ ] ≥2 container widths and ≥2 grounds used across the page
- [ ] One section carries a genuinely large statement (4–6× body size)
- [ ] All elements on a container/grid; zero orphan alignments
- [ ] One dominant element per viewport slice
- [ ] Fold complete at 1440 and 390 widths
- [ ] Depth from one elevation scale; ≤2 overlap moments
- [ ] Mobile order = importance order
