# Iconography & Imagery

## Icons — principles
1. **One set, one weight, one size grid.** Mixing Lucide with Font Awesome with Heroicons is instantly visible.
2. **Icons support, never carry.** If removing the icon loses meaning, add a label — icons alone are ambiguous to most users.
3. **Never emoji as UI icons.** Emoji render differently per OS, break monochrome schemes, and read as unfinished. (Emoji in *content* — a changelog, a chat product — is fine.)

## Icon specs
- Default sets by character: **Lucide** (neutral SaaS default) · **Heroicons** (friendly, rounded) · **Phosphor** (flexible weights) · **Tabler** (dense apps). Pick one.
- Sizes: 16 (inline/dense UI), 20 (buttons, nav), 24 (feature bullets, cards) — on the same pixel grid as the set was drawn for. Scaling 24px art to 19px = blur.
- Stroke: 1.5px reads refined at 20–24px; 2px for 16px sizes. Keep constant system-wide.
- Color: inherit text color (`currentColor`). Icons are text-rank, not accent-rank; accent icons only where the element is interactive or featured.
- Alignment: optical center (icons with visual weight at bottom sit 1px high); baseline-align with adjacent text via flexbox `align-items: center` plus manual nudges where needed.
- Feature-icon treatment (marketing): icon in a 40–48px container (subtle tinted bg `--accent-subtle`, radius from the scale) — gives icons mass without size inflation.

## Accessibility
- Decorative icons: `aria-hidden="true"`.
- Meaning-bearing solo icons (icon-only buttons): `aria-label` required + tooltip on hover/focus.
- Never color-only differentiation (e.g., same icon red vs green) — pair with shape or label.

## Illustrations
- One illustration *system* per product: consistent stroke weight, palette (≤3 colors + neutrals), corner language matching the UI radius scale.
- Styles that age well: monochrome line + single accent (Notion-class), abstract geometric/gradient meshes (infra/AI), isometric only for genuinely technical architecture stories.
- 3D blobs and "corporate Memphis people" are dated defaults — use only with a deliberate reason.
- Illustrations answer "what does this do / feel like"; screenshots answer "what will I get." B2B buyers trust screenshots more.

## Screenshots & product imagery
- Real product only; if the product is unbuilt, design the screenshot *as* the product (it becomes spec).
- Framing: browser chrome (web), device frame (mobile), or naked-with-shadow on a tinted surface. One framing language per page.
- Treatment: radius from the scale, two-layer shadow, optional 1px border (`--border-default`) to hold light screenshots on light backgrounds.
- Retina export (2×), compressed (WebP/AVIF), explicit width/height attributes (CLS).
- Angle/perspective tilts: maximum one hero moment; everything else flat and legible.

## Photography (where sectors need it: real estate, education, healthcare, e-commerce)
- Real people > stock, always; if stock is unavoidable: consistent color grade, no handshake-lightbulb clichés, crop with intent.
- Overlay discipline for text-on-photo: 40–60% scrim (gradient, darker at text edge) + verify contrast on the *lightest* pixel behind text.
- Duotone/single-grade unifies mixed photo sources cheaply.

## Logos (customer logo walls)
- Monochrome them (single neutral, ~45–60% opacity), uniform *optical* height (not uniform bounding box), generous gaps (48–64px).
- 5–8 logos; a wall of 20 unknowns is weaker than a row of 6 recognizable ones.
- Label the wall with a specific claim ("Backing 400+ engineering teams") not "Trusted by".

## Checklist
- [ ] One icon set, one stroke, sizes ∈ {16,20,24}
- [ ] `currentColor` inheritance; aria on decorative vs. meaningful
- [ ] No emoji-as-icons
- [ ] Screenshots framed consistently, retina, dimensioned
- [ ] Text-on-image passes contrast at worst pixel
- [ ] Logo wall monochrome, optically sized, specifically captioned
