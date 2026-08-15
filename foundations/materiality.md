# Materiality — Why Two Correct Pages Feel $200 and $200,000 Apart

Every other foundation file defines a **floor**: contrast that must pass, spacing that must
land on the grid, tokens that must exist. Pass all of them and you get a page that is
correct and flat — the exact output `brain/taste-ladder.md` calls Level 80, and the exact
thing a client means by "it doesn't feel premium."

This file defines the **ceiling**. It is the layer that separates a screen made of *paper*
(flat fills, one hairline, one shadow, uniform surfaces) from a screen made of *material*
(lit surfaces at real depths, edges that catch light, texture under the fills). Materiality
is not decoration and it is not `components/visual-effects.md` — effects are one hero moment
per page; materiality is on **every surface, always**, and costs almost nothing.

The tell: hide every effect, every image, and every animation. If what remains reads as a
Figma wireframe with colors, the page has no materiality. Ship that and no signature moment
will save it.

---

## 1 · Declare the light source first

Flat pages are pages with no light source, or with three contradicting ones. Before any
shadow or highlight is written, put this in the token block as a comment and honour it
everywhere:

```css
/* LIGHT MODEL — one page, one sun.
   position:    above and slightly left (x -8%, y -100%)
   temperature: cool (#B8C4E8) — dark themes read colder light as glass, warmer as plastic
   intensity:   0.06 key / 0.30 occlusion
   falloff:     hero region bright → footer 40% dimmer                                   */
```

Three consequences, all mandatory:

1. **Shadows fall one way.** Every `box-shadow` offset is `+y` (and a consistent small `x`).
   A card with `0 4px` and a modal with `0 -2px` on the same page is the tell reviewers
   catch first.
2. **Highlights sit opposite the shadow.** If light comes from above, the top edge is lit:
   `inset 0 1px 0 rgb(255 255 255 / 0.07)`. This one line does more for perceived quality
   than any gradient.
3. **The page is not evenly lit.** One focal region is brightest (usually the hero or the
   primary CTA's neighbourhood) and brightness falls off toward the footer. An evenly lit
   page reads as a template because templates have no camera.

---

## 2 · Elevation is a stack, never a shadow

`foundations/dark-mode.md` gives the surface ladder; this gives the physics at each rung.
A raised surface is **four simultaneous properties**, not one:

| Layer | What it does | Value at elevation 1 |
|---|---|---|
| Occlusion | contact darkness where the surface meets the page | `0 1px 2px rgb(<shadow-hue> / 0.28)` |
| Key shadow | the cast shadow, offset along the light direction | `0 8px 24px -6px rgb(<shadow-hue> / 0.22)` |
| Edge highlight | the lit top edge | `inset 0 1px 0 rgb(255 255 255 / 0.07)` |
| Surface tint | the fill itself lifts | +4% L, −1.5% chroma vs. the layer beneath |

```css
--shadow-1: 0 1px 2px rgb(var(--shadow-rgb) / .28),
            0 8px 24px -6px rgb(var(--shadow-rgb) / .22),
            inset 0 1px 0 rgb(255 255 255 / .07);
--shadow-2: 0 2px 4px rgb(var(--shadow-rgb) / .32),
            0 18px 48px -12px rgb(var(--shadow-rgb) / .30),
            inset 0 1px 0 rgb(255 255 255 / .09);
--shadow-3: 0 4px 8px rgb(var(--shadow-rgb) / .36),
            0 40px 90px -20px rgb(var(--shadow-rgb) / .40),
            inset 0 1px 0 rgb(255 255 255 / .11);
```

**The shadow hue is never black.** `--shadow-rgb` carries the page's own hue pushed darker
and *more* saturated (a slate page shadows in deep slate-blue, a warm page in deep brown).
Pure `rgb(0 0 0 / .1)` on a tinted surface produces the grey film that makes cheap sites
look dusty — the failure `foundations/colors.md` names as shadow-tinted-black.

**Depth budget: three levels, and they must be used.** A page where every card sits at
elevation 1 has a depth *system* but no depth *hierarchy*. Base → cards at 1 → the one
flagship card or open overlay at 2–3. If nothing on the page is at 2, the page is flat.

**Dark themes raise with light, light themes raise with shadow.** On dark, elevation is
mostly the surface tint plus the edge highlight — a big soft shadow on near-black is
invisible work. On light, it is mostly the shadow — tinting a white card whiter does
nothing. Writing one shadow scale for both themes is why dark modes look "off."

---

## 3 · Edges: the cheapest premium signal there is

A 1px border at 8% white is the DesignOS default and it is *fine* — which is the problem.
Real surfaces have a two-tone edge, because the top catches light and the bottom does not.

```css
/* the ring + highlight pair — one extra line, whole different class of surface */
.surface {
  border: 1px solid rgb(255 255 255 / .07);           /* the ring */
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .08),   /* lit top edge */
              inset 0 -1px 0 rgb(0 0 0 / .20),        /* shaded bottom edge */
              var(--shadow-1);
}
```

Edge rules:

- **Hairlines must be sub-pixel-honest.** At 2× DPR a "1px" border is 2 device pixels;
  premium surfaces use `0.5px` or a `box-shadow: 0 0 0 1px` ring, which does not compound
  with the radius the way a border does.
- **Rings scale with elevation.** Higher surfaces get *brighter* edges (7% → 9% → 11%),
  because they are closer to the light.
- **The focus ring is part of the material system**, not an accessibility bolt-on:
  `outline: 2px solid var(--accent); outline-offset: 3px` plus a matching soft accent glow
  at 20%. `foundations/accessibility.md` requires it to exist; materiality requires it to
  look like it belongs to the same object.

---

## 4 · Radius: one scale, correctly nested

Mixed radius languages are an auto-finding in `scoring/rubric.md`. Nesting is the part
that gets missed:

```
inner-radius = outer-radius − padding        (never equal, never larger)
```

A 16px card with 12px padding holds an 4px-radius image well; giving that image 16px too
produces the "sticker inside a sticker" look. Buttons ≤ 44px tall never exceed 10px radius
unless the language is fully pill (`9999px`) — half-pills read as indecision.

**Radius smoothing.** Browsers draw circular corners; Apple-class surfaces use a
superellipse ("squircle"). Where a corner is large (≥20px) and prominent (hero card, modal,
app icon), approximate it with `corner-shape: squircle` behind `@supports`, or accept the
circular corner deliberately — do not accidentally ship a 32px circular corner next to a
squircled logo.

---

## 5 · Texture: the difference between "rendered" and "designed"

A large flat fill is the single most synthetic thing on a screen. Real materials have
noise. Two layers, both near-free, both required on any surface larger than ~40vh:

1. **Grain.** An SVG `feTurbulence` data-URI tile, `opacity: .025–.04`,
   `mix-blend-mode: overlay`, `pointer-events: none`, fixed. Recipe in
   `components/visual-effects.md`. It also kills gradient banding, which is the other
   cheap-looking failure.
2. **Fill gradation.** No large area is one flat colour. A 2–4% linear or radial shift
   across a hero, a section, or a card gives the surface a direction consistent with the
   light model. This is *below* the threshold of noticing — that is the point.

Structural textures (line grids, dot matrices) are optional and sector-flavoured, and the
craft is always the mask: they must dissolve before they reach content.

---

## 6 · Optical corrections — the accumulation nobody can name

`brain/quality-bar.md` lists these as "the tells." They are mechanical:

| Correction | Why | The move |
|---|---|---|
| Optical centring | a play-triangle centred by bounding box looks left-heavy | nudge 1–2px toward the visual mass |
| Icon weight matching | 1.5px icon strokes beside 600-weight text look thin | match stroke to the text weight beside it |
| Cap-height alignment | text boxes have leading; boxes align, letters don't | negative margin the half-leading, or `leading-trim` |
| Overshoot | circles/pills at the same height as squares look smaller | round shapes get +1–2% size |
| Punctuation hang | flush quotes/bullets break the left edge | pull into the margin optically |
| Border-radius drift on scale | a scaled-up card scales its radius too | animate `transform` but re-check the visual radius |

None of these is visible individually. All of them together are the entire difference
between "clean" and "expensive."

---

## 7 · The materiality pass (run before scoring)

Four minutes, in this order:

1. **Greyscale it.** `filter: grayscale(1)` on `<html>`. Depth must still be readable. If
   the page collapses into one flat plane, the elevation stack is decorative.
2. **Kill every effect and image.** What remains must still read as material — lit edges,
   tinted shadows, surface tints. If not, effects are carrying the page (`components/visual-effects.md`
   anti-pattern: *effects as rescue*).
3. **Squint at 25% zoom.** One region should be clearly brightest. If brightness is uniform,
   there is no camera; add falloff.
4. **Screenshot the light theme and dark theme side by side.** The shadow scale must differ.
   If it is the same string of values, one of the two themes is wrong.

---

## Anti-patterns

- **One shadow value for the whole page.** A design system with a single `--shadow` has an
  elevation token, not an elevation system.
- **Pure black alpha shadows** on any tinted or coloured surface — the grey-film tell.
- **Contradicting light.** Card shadow below, nav shadow above, modal glow centred.
- **Flat-everything as "minimalism."** Minimal means fewer elements, not unlit ones. Vercel
  is minimal *and* materially precise; a wireframe is neither.
- **Elevation without hierarchy** — every card at the same depth, so depth means nothing.
- **Edge highlights on a light theme** at the same 8% white — invisible there; light themes
  get their edge definition from the ring and the shadow, not the highlight.
- **Texture at visible strength.** If a reviewer can point at the grain, it is 3× too strong.
- **Copying these values verbatim** into a brand that has a different light. Derive the
  numbers from the declared light model; the table is a starting point, not the palette.

## Checklist

- [ ] A light model is declared in the token block: position, temperature, intensity, falloff
- [ ] Every shadow offsets the same direction; every lit edge is opposite it
- [ ] `--shadow-rgb` carries the page hue, not `0 0 0`
- [ ] Three elevation levels exist and at least one element sits above level 1
- [ ] Light and dark themes have *different* elevation strategies (shadow-led vs. light-led)
- [ ] Surfaces use a ring + inset highlight pair, not a lone 1px border
- [ ] Radii nest correctly (`inner = outer − padding`); one radius language throughout
- [ ] Grain and fill gradation present on every fill larger than ~40vh
- [ ] At least three optical corrections applied and named in the rationale
- [ ] The four-step materiality pass ran, greyscale test included
