# Spacing

Spacing is the most reliable predictor of perceived quality. Amateur and professional UIs
often share the same components — they never share the same spacing.

## Principles
1. **4px base grid.** Every margin, padding, and gap is a multiple of 4. No 13px, no 27px.
2. **Proximity encodes relationship.** Related = close, unrelated = far. Spacing *is* information architecture.
3. **The 2× rule.** Space *between* groups ≥ 2× the space *within* groups.
4. **Whitespace is an active element.** It's not "empty" — it's emphasis, luxury, and focus. Budget it deliberately.
5. **Rhythm, not repetition.** Vertical spacing varies with content importance; identical gaps everywhere = monotone.

## The scale

```
4   8   12   16   24   32   48   64   96   128   160
```

| Step | Typical use |
|---|---|
| 4–8 | icon↔label, badge padding, tight inline gaps |
| 12–16 | inside components: button padding-y, input padding, card gutters (small) |
| 16–24 | between related elements: label↔input, heading↔body, card padding |
| 24–32 | between component groups; grid gaps |
| 48–64 | between subsections; hero internal spacing |
| 96–160 | between page sections (marketing); 96 mobile → 128–160 desktop |

## Component internals (reference values)
- **Buttons:** padding-x ≈ 2–2.5× padding-y (e.g. 12×24, 14×28). Icon↔label gap 8.
- **Inputs:** 12–14px padding-y, 14–16px padding-x; 8px label gap above, 6px help-text gap below.
- **Cards:** 24px padding (compact) / 32px (marketing). Never let card padding be smaller than the gap between cards' content and border radius demands.
- **Nav:** items separated 24–32; logo isolated by ≥40 from links.
- **Prose:** paragraph gap = 1em; heading top margin ≈ 2× its bottom margin (headings attach to what follows).

## Section rhythm (marketing pages)

```
Section padding-y:  96 (mobile) → 128 (desktop);  hero may take 128→160
Within a section:   heading block ↔ content: 48–64
                    content rows/cards gap: 24–32
Alternate weights:  a full-bleed proof section may compress to 64 for tempo
```

A page with sections at 128/128/64/128/96 has *pacing*. A page at 80/80/80/80 has a pulse of a metronome — technically alive.

## Density modes
- **Marketing:** generous — err 1 step larger between groups.
- **Application:** compact-comfortable — 8/12/16 do most work; density lives in tables (`components/tables.md`).
- **Never mix modes on one screen** without an explicit boundary (e.g. app shell compact, settings page comfortable).

## Optical corrections
- Icons next to text: vertical-center optically, often 1px above mathematical center.
- Circular/diagonal shapes need slight overshoot to *look* aligned with rectangles.
- Text blocks: the cap-height, not the line box, should align with adjacent images (negative-margin trick).

## Anti-patterns
- Magic numbers (`margin-top: 37px`) — always a scale value
- Padding symmetry ignoring content: equal padding around a heading that hugs the top of a card
- Cramped CTAs: a primary button needs ≥24px isolation from competing elements
- Spacing by `<br>` or empty divs
- Mobile keeping desktop section padding (128px on a 667px-tall viewport = one section per screen)

## Checklist
- [ ] Every value ∈ scale (audit: grep for px values not in {4,8,12,16,24,32,48,64,96,128,160})
- [ ] Group separation ≥ 2× intra-group spacing everywhere
- [ ] Section rhythm varies deliberately; mobile section padding ≈ 60–75% of desktop
- [ ] Primary CTA visually isolated
- [ ] Prose: measure + paragraph rhythm correct
