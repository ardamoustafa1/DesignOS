# Kiln

> Category: Editorial · Technical
> A fired-clay editorial system: warm near-black ground, one ember accent under a strict
> budget, a variable serif whose softness grows with size, lit surfaces at three real
> depths, and grain on every large fill. Dark-first with a fully rebuilt light theme.

Kiln exists for products that are technical but not cold — developer tools with an
editorial voice, studios, research products, portfolios, changelogs, documentation that
wants to be read rather than scanned. It is deliberately **not** the blue-black
single-accent SaaS dialect; if the brief wants that, Kiln is the wrong package and saying
so is the correct answer (`brain/originality.md`).

This file is the prose contract. [`tokens.css`](tokens.css) is the source of truth for
values, [`lint.json`](lint.json) is the machine-readable half, and
[`example.html`](example.html) is the baked component fixture. Where prose and tokens
disagree, tokens win and this file is wrong.

---

## 1 · Light model

Kiln's first commitment, and the reason its surfaces read as material rather than as
coloured rectangles. Every shadow, highlight, and gradation in the system derives from it.

```
position     above and slightly left   (x −8%, y −100%)
temperature  warm  #FFD2A6             fired clay, not glass
intensity    0.055 key · 0.32 occlusion
falloff      focal region bright → page end ~40% dimmer
```

Three consequences, all binding:

1. **Every shadow offsets downward.** A card at `0 8px` and a menu at `0 -4px` on the same
   page is the tell reviewers catch first.
2. **Every lit edge sits on top** — `inset 0 1px 0 var(--kiln-edge-lit)`. This one line is
   the largest single contributor to Kiln's perceived quality.
3. **The page is not evenly lit.** The ground runs `--kiln-ground-hi` at the top,
   `--kiln-ground` through the body, `--kiln-ground-lo` at the end. A flat body background
   is a conformance failure in spirit even where the linter cannot see it.

---

## 2 · Colour

All values are tokens. Do not invent hex.

### Ground and surfaces (dark, default)

- **Ground** `--kiln-ground` `#100D0A` — the page floor. Warm, never neutral, never black.
- **Ground-hi / Ground-lo** `#17120D` / `#0C0A07` — the two ends of the falloff.
- **Surface** `--kiln-surface` `#1B1611` — elevation 1. Cards, panels, table bodies.
- **Raised** `--kiln-raised` `#221C15` — elevation 2. The one flagship card, open overlays.
- **Inverse** `--kiln-inverse` `#F3EDE4` — the paper band. Exactly one per page, and it
  carries the page's largest statement.

### Ink

- **Ink** `--kiln-ink` `#F5EFE7` — headings and primary text.
- **Ink-2** `--kiln-ink-2` `#B3A797` — body copy. This is the default `color` on `body`.
- **Ink-3** `--kiln-ink-3` `#8A7E70` — metadata, mono labels, captions.

### The ember

`--kiln-ember` `#E8703A` is the only saturated colour in Kiln, and its budget is the
system's strictest rule.

- **At most three solid-filled ember elements in one document.** Beyond that it stops
  meaning "this is the action" and becomes the page's colour scheme. Enforced by
  `accent.maxSolidFills` in `lint.json`.
- Everything else that wants the ember uses `--kiln-ember-wash` (14% on dark, 10% on
  light): row hovers, focus glows, eyebrow dots, marginalia rules.
- `--kiln-ember-lift` exists **only** as a hover value. It is never a resting colour.
- The ember is never used decoratively *and* interactively on the same surface — if a
  section already tints with the wash, its links use ink weight, not ember.

### Light theme is rebuilt, not swapped

Dark themes raise with light; light themes raise with shadow. The light palette therefore
changes the elevation strategy, not just the values: `--kiln-edge-lit` becomes a near-white
70% highlight, the shadow hue shifts to `74 52 32`, and opacities drop by roughly two
thirds. The ember also **darkens to `#A73510`** — `#E8703A` on paper measures 2.65:1 and
fails AA, so it cannot survive the swap unchanged.

Grain drops from 3.5% to 2.2%, because the same noise reads twice as loud on a light field.

---

## 3 · Type

| Role | Face | Job |
|---|---|---|
| Display | `Fraunces` (variable) | every heading, the statement, index row titles |
| Text | `Inter Tight` | body, leads, UI labels, buttons |
| Mono | `JetBrains Mono` | metadata, numbers, eyebrows, timestamps, table keys |

**The SOFT axis is Kiln's typographic signature.** Fraunces exposes `opsz`, `wght`, and
`SOFT`; Kiln raises softness *with size*, so large type reads warmer instead of merely
bigger. This is the single detail most responsible for the system not looking like a
default serif pairing.

| Band | `opsz` | `SOFT` | Tracking | Weight |
|---|---|---|---|---|
| 16–20px inline display | 24 | 0 | −0.01em | 500 |
| 24–40px (h3/h2) | 96 | 30 | −0.024em | 400–500 |
| 48–80px (h1) | 144 | 0 | −0.042em | 400 |
| 100px+ (statement) | 144 | 40 | −0.035em | 400 |

Mass comes from size, not weight — Kiln headlines above 48px sit at weight 400. A 700-weight
hero is a different system.

**Mono is a structural device, not an accent.** Every eyebrow, section index, timestamp,
table key, and figure caption is mono, uppercase, `+0.06em`, `--kiln-ink-3`, with
`font-feature-settings: "tnum" 1` wherever a number appears. That consistency is what makes
the page read as an index rather than a brochure.

Body: 16px minimum, 1.62 line-height, measure ≤ 65ch.

---

## 4 · Material

### Elevation

Three levels, and **at least one element on every page must sit above level 1** — a page
where everything is at elevation 1 has a depth token, not a depth hierarchy.

| Level | Token | Use |
|---|---|---|
| 1 | `--kiln-elev-1` | cards, facts, table surfaces |
| 2 | `--kiln-elev-2` | the flagship card, sticky bars on scroll |
| 3 | `--kiln-elev-3` | overlays, the index preview plate, modals |

Each is occlusion + key shadow + lit edge in one value. **Ad-hoc `box-shadow` is a
conformance failure** (`elevation.allowAdHoc: false`) — an inline shadow means a fourth,
undeclared level exists.

The shadow hue is `--kiln-shadow-rgb` `24 12 4`, never `0 0 0`. Black alpha over a warm
ground produces the grey film that makes a page look dusty.

### Edges

A ring plus a lit line, never a lone border:

```css
border: 1px solid var(--kiln-ring);
box-shadow: inset 0 1px 0 var(--kiln-edge-lit), var(--kiln-elev-1);
```

Rings brighten with elevation (7.5% → higher). `--kiln-ring-loud` is for controls that must
read as outlined — ghost buttons, the nav CTA.

### Radius

`6 / 10 / 18 / pill`, and nesting is `inner = outer − padding`. An 18px card with 24px
padding holds a 6px image; giving that image 18px produces the sticker-inside-a-sticker
look. Buttons never exceed 10px unless the language is fully pill.

### Texture

Grain is **always on**: `--kiln-grain` as a fixed, `pointer-events: none`,
`mix-blend-mode: overlay` layer at `--kiln-grain-opacity`. If a reviewer can point at it,
it is three times too strong. Large fills additionally carry a 2–4% gradation so no area
above ~40vh is one flat colour.

### Optical corrections

At least three per page, named in the rationale. Kiln's usual set: cap-height alignment on
the mono eyebrow against its heading, icon stroke matched to adjacent text weight, and
radius re-check on any scaled card.

---

## 5 · Composition

Kiln pages are **indexes**, not card grids. The default move for a list of things is a
numbered row list with a mono index, a display-face title, a note, and a right-aligned
figure — not four equal cards.

Section rhythm is mandatory (`foundations/layout.md`): at least four distinct compositions,
no shape repeated in adjacent sections, at least two of the three container widths, and at
least two grounds. A worked page:

```
hero        wide      · editorial stack   · breathing · ground-hi
status      base      · single dense row  · dense     · bordered
index       wide      · numbered rows     · normal    · surface
approach    narrow    · prose + marginalia· breathing · ground
record      base      · table             · dense     · surface
statement   narrow    · one large line    · breathing · INVERSE
contact     base      · split             · breathing · ground-lo
```

The inverse band appears **once**. It is where the page's single largest type lives, and it
is the reason the rest of the page can stay quiet.

---

## 6 · Motion

Kiln's motion character is *precise, not playful*: strict ease-out, no springs, nothing
interactive over 300ms.

**Arrival** (`motion/arrival.md`) is required on every marketing surface and forbidden on
app, settings, and checkout surfaces. Kiln's reveal vocabulary is **mask rise** — a line in
`overflow: hidden` with the inner span travelling `translateY(100%) → 0`. Not fade-up.
Index-driven at `--kiln-arrive-step` (90ms), 620–700ms per element, and the h1 is revealed
by the mask, never by opacity.

**Interaction**: `--kiln-t-fast` for hover, `--kiln-t-base` for surfaces, `--kiln-t-slow`
for overlays. Easing is `--kiln-ease` for everything spatial; `--kiln-ease-inout` only for
things that return to where they started.

**Signature**: at most one, and Kiln's canonical choice is the **index preview plate** — a
level-3 plate that tracks the pointer while a row is hovered, showing the artefact instead
of describing it. Gated behind `(hover: hover) and (pointer: fine)`, with the same artwork
shown inline for touch and reduced motion. `transform` is written 1:1 with no transition
(`motion/physics.md` tracking law); only opacity fades.

---

## 7 · Components

| Component | Kiln specification |
|---|---|
| Button · primary | 48px min-height, `--kiln-r-md`, ember fill, `--kiln-on-ember` text, warm ember glow in the shadow stack, `translateY(-1px)` on hover |
| Button · ghost | `inset 0 0 0 1px var(--kiln-ring-loud)`; hover strengthens via an `::after` opacity crossfade, never a `box-shadow` transition |
| Index row | `4.5rem / 1fr / 22ch / 8rem` grid, mono index, display title, ember wash on hover, `--kiln-ember` on the index number |
| Card | surface fill, ring, `--kiln-elev-1`, `--kiln-r-lg`; the flagship card takes `raised` + `--kiln-elev-2` |
| Table | mono uppercase `th` on `--kiln-ring` rule, `tnum` on every figure, rows collapse to blocks below 720px |
| Nav | sticky, `backdrop-filter: blur(14px) saturate(1.35)` with an opaque `@supports` fallback, one ember-outlined CTA |
| Focus | `outline: 2px solid var(--kiln-ember-lift)`, `outline-offset: 3px`, plus a 6px ember-wash glow — part of the material system, not an a11y bolt-on |
| Statement | inverse band, display face at `SOFT` 40, one line, nothing else in the section |

---

## 8 · What Kiln is not

- **Not a warm skin over a SaaS layout.** If the page is four equal cards per section with
  a `border-top` between them, changing the palette to Kiln does not make it Kiln.
- **Not multi-accent.** Adding a second hue for "variety" is the fastest way to destroy the
  ember's meaning. Variety comes from ground changes and container width.
- **Not high-contrast maximalism.** Pure black and pure white are forbidden values; the
  system's drama comes from warmth and depth, not from extremes.
- **Not springy.** No overshoot, no bounce, no `cubic-bezier` outside the two declared.
- **Not for dense operational UI.** A trading terminal or an admin table at 12px row height
  wants a cooler, tighter system — use one, and say why (`brain/decision-framework.md`).

---

## 9 · Conformance

Kiln is the first DesignOS system that can be **checked**, not merely read:

```bash
node validators/check-system-conformance.js <target> --system kiln
```

The checker derives the legal palette from `tokens.css` at run time — there is no second
copy of the values to drift — and enforces `lint.json`: required tokens present, no
off-palette colour, the three declared typefaces, radius and container values on-scale,
easings from the declared set, elevation from the three tokens rather than ad-hoc shadows,
the ember budget, and the texture layer.

Conformance is necessary and not sufficient. A page can pass every rule here and still be
badly composed; `scoring/rubric.md` and `workflows/final-gate.md` still apply, and so does
the Ceiling Contract in `CLAUDE.md` §4.5.

---

## Checklist

- [ ] `tokens.css` is imported or inlined; no value is redeclared locally
- [ ] Light model honoured: one shadow direction, lit edges opposite, ground falloff present
- [ ] Three elevation levels used, at least one element above level 1, no ad-hoc shadows
- [ ] Ember solid-filled on ≤3 elements; everything else uses the wash
- [ ] Light theme verified independently — ember darkened, shadows rebuilt, grain reduced
- [ ] Fraunces `SOFT` rises with size; headlines at weight 400–500
- [ ] Every eyebrow, index, timestamp, and figure is mono uppercase `+0.06em` with `tnum`
- [ ] ≥4 section compositions, ≥2 container widths, ≥2 grounds, exactly one inverse band
- [ ] Mask-rise arrival, index-driven, LCP element not opacity-animated
- [ ] At most one signature; reduced-motion and touch paths show the same content
- [ ] `check-system-conformance.js --system kiln` clean, and `check-craft-ceiling.js` clean
