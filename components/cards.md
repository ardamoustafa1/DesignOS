# Cards

Cards are containers for *repeatable, comparable* content. If content isn't repeated or
compared, it probably shouldn't be a card — whitespace and headings group more elegantly.

## Principles
1. **Earn the border.** Every card boundary costs visual noise. Separation options in ascending weight: whitespace → background tint → hairline border → border+shadow. Use the lightest that works.
2. **One card, one subject.** A card with two topics is two cards or zero.
3. **Internal hierarchy is fixed:** visual/icon → title → supporting text → meta/action. Consistent across every card in a set (subgrid: `foundations/grids.md`).
4. **Sets are systems.** Same padding, radius, elevation, type scale across a set — variation only in content.

## Specs
- **Padding:** 24px (product), 32px (marketing feature cards); padding ≥ 1.5× internal element gaps.
- **Radius:** 8–12px product, 12–16px marketing; must exceed the radius of elements inside it (nested radii: outer = inner + gap).
- **Border:** 1px `--border-default`; dark themes may use surface-lightness instead.
- **Shadow:** resting cards either flat (border only) or shadow-tier-1 — not both heavy. Hover raises one tier max.
- **Title:** text-lg/xl weight 600; supporting text text-sm/base `--text-secondary`, 2–3 lines max with truncation rules decided (clamp + full text on detail page).

## Interaction models (pick one per set)
- **Fully clickable card:** whole surface is the link — wrap/overlay technique with the title as the true `<a>` (pseudo-element stretch), secondary actions above it with `position: relative`. Hover: raise + border-strengthen. Cursor pointer everywhere.
- **Actions-inside card:** card is static, buttons/links inside act. No hover-raise on the card itself (false affordance).
- Never mix models in one set. Never a clickable card whose *entire* affordance is cursor change.

## Common card recipes
- **Feature card (marketing):** icon in tinted container (40–48px) → title → 2 lines → optional ghost link. No "Learn more" on all six — link only where a real page exists.
- **Pricing card:** see `patterns/pricing.md` — one highlighted tier via border-accent + subtle scale/elevation, *not* a different background color that kills text contrast.
- **Metric/stat card (dashboard):** label (13px caps muted) → value (28–36px, tabular-nums, 600) → delta chip (▲ 12% with color + icon, never color alone). See `components/dashboard.md`.
- **Testimonial card:** quote (18–20px, real punctuation) → avatar 40px + name + role/company. Logos add weight. Never italicize whole quotes.
- **Blog/content card:** image (16:9, radius-top) → category chip → title (2-line clamp) → date/read-time. Image `object-fit: cover` with focal safety.
- **Product card (e-commerce):** `industries/ecommerce.md` — image dominates (≥60% of card), price adjacent to title, one action.

## Hover & motion
```css
.card { transition: transform 150ms ease-out, box-shadow 150ms ease-out,
                    border-color 150ms ease-out; }
.card:hover { transform: translateY(-2px); /* + shadow tier up */ }
```
- Lift ≤4px; no scale on text-bearing cards (blur). Image-zoom-on-hover (scale 1.03, overflow hidden) only for media cards.
- Stagger card entrances ≤60ms apart, ≤5 items (`motion/micro-interactions.md`).

## Empty & loading
- Loading: skeleton mirrors the exact card anatomy (image block, two text lines) — not a spinner in a void (`components/states.md`).
- An empty card *set* gets an empty state, not a lonely border.

## Anti-patterns
- Card-in-card-in-card (max nesting: 2, and the inner one should probably be a list row)
- Borders + heavy shadow + background tint simultaneously (pick ≤2)
- Uneven heights in a row without a resolving alignment (equalize via subgrid/flex, or embrace masonry only for media)
- Cards for single non-repeating content ("About us" in a card, alone, floating)
- Hover-revealed primary actions (undiscoverable on touch) — hover may *emphasize*, never *contain exclusively*

## Checklist
- [ ] Lightest sufficient separation chosen; set is visually uniform
- [ ] Fixed internal anatomy; aligned across rows
- [ ] One interaction model; keyboard + touch complete
- [ ] Skeletons mirror anatomy; clamp rules defined
- [ ] Nested radii computed; padding ≥ 1.5× internal gaps
