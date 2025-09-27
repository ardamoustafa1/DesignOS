# Colors

## Principles
1. **Neutrals do 90% of the work.** Accent color is punctuation, not prose.
2. **One accent owns interactivity.** Everything clickable shares its hue family.
3. **Never pure.** No `#000` text, no `#FFF` on dark — use near-blacks and near-whites.
4. **Tokens, not hexes.** Components reference semantic tokens; raw hex lives only in the palette definition.
5. **Contrast is law.** 4.5:1 body, 3:1 large text and UI components (WCAG 2.2 AA). Adjust lightness, keep hue.

## Building a palette (the formula)

```
1 brand accent  (choose by sector psychology → psychology/color-psychology.md)
1 accent-hover  (accent shifted ~8% darker on light themes, ~8% lighter on dark)
9-step neutral ramp (50→900), slightly tinted toward the accent hue (2–4% saturation)
4 semantic colors: success (green), warning (amber), danger (red), info (blue)
   — each with a subtle background tint variant (e.g. red-50) for banners/badges
```

### Neutral ramp targets (light theme)
| Token | Role | Guide value |
|---|---|---|
| neutral-50 | page alt background | #FAFAFA |
| neutral-100 | card/section bg | #F4F4F5 |
| neutral-200 | borders, dividers | #E4E4E7 |
| neutral-400 | placeholders, disabled text | #A1A1AA |
| neutral-500 | secondary text (min for 4.5:1 on white: ~#6B7280) | #71717A |
| neutral-700 | body text | #3F3F46 |
| neutral-900 | headings | #18181B |

### Dark theme construction
- Base surface `#0A0A0B`–`#111113`, **not** `#000`.
- Elevation = lighter surface (+3–5% lightness per level), not shadows.
- Borders: `rgba(255,255,255,0.08)` — structure without lines shouting.
- Body text `#D4D4D8`; headings `#FAFAFA`; never `#FFF` for paragraphs (halation).
- Desaturate accents ~10–15% vs. light theme; full-saturation colors vibrate on dark.
- Semantic colors need dark-specific variants (success on dark: lighter, less saturated green).

## Semantic token layer

```css
--bg-page  --bg-surface  --bg-surface-raised  --bg-inverse
--text-primary  --text-secondary  --text-muted  --text-on-accent
--border-default  --border-strong  --border-focus
--accent  --accent-hover  --accent-subtle          /* subtle = 10% tint bg */
--success --warning --danger --info  (+ -subtle variants)
```

Components use only this layer. Theme switch = swapping token values, nothing else.

## Usage ratios
- **60/30/10:** 60% neutral surfaces, 30% neutral text/structure, 10% accent — at most.
- A page where the accent covers >10% of pixels reads as a flyer, not a product.
- Two accents on one screen: only if one is strictly decorative and never interactive.

## Gradients
- Maximum one gradient *moment* per page (hero mesh, text highlight, or card glow — pick one).
- Never on primary buttons (kills state affordance), never behind body text.
- Analogous hues only (blue→violet ✓, orange→teal ✗). 15–30° hue spread.
- The "AI-startup purple-blue mesh" is saturated as a cliché — if the sector file allows a gradient,
  prefer an off-cliché axis (e.g. deep blue→cyan, warm neutrals).

## Anti-patterns
- Rainbow feature sections (each card its own color) — kills scanning, reads as a toy.
- Gray text on gray cards on gray background with gray borders — a contrast graveyard.
- Accent used for decoration *and* interaction — users can't tell what's clickable.
- Pure red for anything but destructive/error semantics.
- Shadow-tinted-black on colored backgrounds — shadows should carry the surface hue.

## Checklist
- [ ] All text passes AA against its actual background (check hover/focus states too)
- [ ] One accent hue owns all interactive elements
- [ ] Neutral ramp is tinted, consistent, and used from tokens
- [ ] Dark theme: no pure black surfaces, no pure white text, desaturated accents
- [ ] ≤1 gradient moment; none on buttons or under body text
- [ ] Semantic colors reserved for semantics
