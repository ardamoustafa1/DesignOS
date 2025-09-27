# Dark Mode — The Second First-Class Theme

Dark mode is not inverted light mode; it's a different lighting environment with its own
physics. "Dark mode by accident" (auto-inverted, unaudited) scores worse than no dark
mode — the kernel demands both themes deliberate or one explicitly declared out
(`CLAUDE.md` standards). This module is the physics.

## Surface architecture (light's shadow is dark's lightness)
```
Light mode:  depth = shadows on white          Dark mode:  depth = LIGHTER surfaces
             page #FFF → cards float via shadow            page #0A0A0B → surface #131316
                                                           → raised #1C1C21 (+3–5% L per level)
```
- Never pure black `#000` surfaces: OLED-smearing, crushing contrast against text, and
  no room to build elevation below. Base sits at 4–8% lightness, slightly tinted toward
  the brand hue (`foundations/colors.md` ramp tinting).
- Shadows nearly retire (invisible on dark); borders take over structure:
  `rgb(255 255 255 / 0.08)` hairlines (`brain/reference-library.md` Vercel doctrine).
  Keep ONE soft shadow tier for overlays (modals still float).
- The elevation ladder gets RECORDED (`memory/design.md`): page → surface → raised →
  overlay, each a defined lightness step — ad-hoc "slightly lighter" panels breed
  seven-gray soup.

## Text & contrast physics
- **Halation:** pure white on dark vibrates for astigmatic users (a large population) —
  headings `#FAFAFA`, body `#D4D4D8`-class, never `#FFF` paragraphs.
- The muted-text trap: light-mode's `--text-muted` translated naively FAILS AA on raised
  dark surfaces — the walkthrough's caught bug (`examples/saas-landing-walkthrough.md`)
  is the sector-universal bug. Audit muted-on-raised explicitly, both themes
  (`checklists/accessibility.md` contrast sweep).
- Weight optics: type reads THINNER on dark (light-on-dark blooms) — consider one weight
  step up for small text, or accept the lighter voice deliberately.

## Color desaturation law
Full-saturation accents vibrate on dark grounds. Every accent/semantic gets a dark
variant: **lightened + desaturated ~10–15%** (`--accent: #4F46E5` light →
`#818CF8`-class dark). Charts doubly so (`components/charts.md` dark palettes).
Semantic colors keep their MEANING but shift their values — success green on dark ≠
success green on light (`starter/tokens.css` shows the full pairing).

## Media & imagery in the dark
- Photos/illustrations designed on white get a `filter: brightness(.9)` courtesy at
  minimum; better: dark-aware variants (`<picture>` + `prefers-color-scheme` sources).
- Logos: the on-dark variant is mandatory brand infrastructure (`memory/brand.md` logo
  rules); customer-logo walls monochrome to light-neutral.
- Screenshots of the product: match the viewer's theme when the product has both
  (a light-mode screenshot island in a dark page reads as glare — and vice versa).
- Pure-white content surfaces (embedded docs, emails previews): frame them deliberately
  (border + radius) as "windows", don't let them flashbang.

## Mechanics (with `foundations/design-tokens.md`)
- Tier 2 swap via media query + `data-theme` override, both directions, toggle persisted.
- No flash-of-wrong-theme: inline the theme-restore script pre-paint (the classic
  first-paint white flash on a dark-preference user is a craft fail).
- `color-scheme: light dark` on `:root` — native form controls, scrollbars, and UA
  surfaces follow; without it, dark pages carry light scrollbars.
- Test EVERY state in both themes: hover tints designed for white backgrounds vanish or
  glare on dark (`checklists/responsive.md` cross-cutting: width × theme matrix).

## When dark-first / light-first / both (with `brain/decision-framework.md`)
Sector defaults live in `industries/` files (dev/security/gaming dark-native; health/
commerce/civic light-native). "Both" costs real maintenance — every new component lands
twice. Single-theme is a legitimate DECISION (recorded, with the toggle omitted honestly)
— half-maintained second themes score below committed single themes.

## Anti-patterns
`filter: invert(1)` "dark mode" · pure black + pure white at 21:1 (harsh ≠ premium) ·
one shadow system serving both themes · saturated light-mode accents pasted onto dark ·
theme toggle that forgets on reload · dark theme discovered broken only in the modal
nobody re-tested · charts with light-mode gridlines burning through.

## Checklist
- [ ] Elevation = lightness ladder, recorded; borders structure; one overlay shadow
- [ ] No #000 surfaces, no #FFF body text; muted-on-raised AA-audited
- [ ] All accents/semantics/charts have desaturated dark variants
- [ ] Logos/imagery dark-aware; product screenshots theme-matched
- [ ] color-scheme set; no first-paint flash; toggle persists and beats OS preference
- [ ] Full state × theme matrix tested, or single theme declared and recorded
