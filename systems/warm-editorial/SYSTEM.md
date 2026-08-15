<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# Warm Editorial

> Category: Starter
> Bundled Open Design package for Warm Editorial, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

**Provenance.** The prose and token values below are imported from
[nexu-io/open-design](https://github.com/nexu-io/open-design) at commit `f9c07517b74a`,
licensed **Apache-2.0**. See [`../NOTICE`](../NOTICE) for the licence and the full
list of modifications. This is an imported brand contract, not original DesignOS work.

---

## DesignOS supplement — the ceiling layer

The upstream package stops at the token schema, which has no light source, one flat
elevation pair, no texture, and no arrival. `tokens.css` therefore carries a **ceiling
extension** derived from this system's own palette (`CLAUDE.md` §4.5):

| Requirement | How this package meets it |
|---|---|
| Light model | `--ds-light-temp`, position above-left, declared in `tokens.css` |
| Elevation | `--ds-elev-1/2/3` — occlusion + key shadow + lit edge, shadow hue `--ds-shadow-rgb` derived from `--bg`, never black |
| Raise strategy | ground reads **light**, so it raises with **shadow — the cast shadow carries it** |
| Texture | `--ds-grain` at `--ds-grain-opacity` (2.2%), fixed overlay, `pointer-events: none` |
| Arrival | `--ds-t-arrive` / `--ds-arrive-step`, index-driven, mask or fade; the LCP element is never opacity-animated (`motion/arrival.md`) |
| Section rhythm | not derivable from tokens — the page must still supply ≥4 compositions, ≥2 grounds (`foundations/layout.md`) |
| Optical corrections | not derivable from tokens — name at least three in the rationale |

**Two of the seven cannot be imported.** Section rhythm and optical corrections are
composition decisions, not values, so a conforming token layer does not make a page meet
the ceiling on its own. Run both gates:

```bash
node validators/check-system-conformance.js <target> --system warm-editorial
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Warm Editorial

> Category: Starter
> A serif-led magazine aesthetic. Terracotta accent on warm off-white paper —
> good for long-form, editorial, and brand-led marketing pages.

## Visual Theme & Atmosphere
Warm, unhurried, magazine-like. Think "a New Yorker interview column online." Generous whitespace, long-form readability, restrained chrome. Playful but never novelty.

## Color Palette & Roles
- **Background:** `#FAF7F2` (warm off-white paper)
- **Foreground:** `#1C1A17` (near-black, slightly warm)
- **Accent (primary):** `#C0512F` (terracotta) — used for links, primary CTAs, 1 hero element max per page
- **Accent (secondary):** `#2F5B4F` (forest) — section dividers, tags
- **Muted:** `#8A817A` (mid-warm-grey) — timestamps, metadata
- **Surface:** `#FFFFFF` — elevated cards only
Never use pure black or pure white anywhere user-facing.

## Typography Rules
- **Display / headings:** "GT Sectra" or fallback serif (`'GT Sectra', 'Times New Roman', serif`)
- **Body:** "Söhne" or fallback sans (`'Söhne', -apple-system, system-ui, sans-serif`)
- **Mono:** `'JetBrains Mono', ui-monospace, monospace` for code only
- Scale (px): 12 · 14 · 16 · 20 · 28 · 40 · 56 · 80
- Line-height: 1.6 for body, 1.2 for display
- Letter-spacing: -0.02em for display sizes above 40px; default elsewhere

## Component Stylings
- **Buttons:** flat fill, 12px radius, 14px padding-block, 20px padding-inline. Primary = terracotta fill, off-white label. Secondary = outlined 1px foreground, transparent fill.
- **Cards:** off-white background, 1px forest-at-8%-opacity border, 16px radius, 24–32px internal padding. No shadow except hover (y+2px, blur 16, foreground-at-6%).
- **Inputs:** underline only (no box), 1px muted baseline, terracotta baseline on focus, 16px vertical padding.
- **Links:** terracotta, 1px terracotta-at-40% underline, no underline on hover (swap for terracotta-at-8% background).

## Layout Principles
- 12-column grid, 1200px max-width, 24px gutters.
- Hero sections: 72vh minimum, 120vh maximum. Content top-biased, never centered vertically.
- Body sections: 80px top+bottom spacing at desktop; 48px at tablet; 32px at phone.
- One accent color per screen. If a page has a terracotta hero, secondary CTAs are foreground-only, not forest.

## Depth & Elevation
Minimal. Only two elevation levels:
- **Flat (0):** everything by default.
- **Raised (1):** cards on hover, dropdown menus, floating CTAs. 2px y-offset, 16px blur, foreground at 6% opacity.
No shadows on inputs. No shadows on the hero. No neumorphism, no glassmorphism.

## Do's and Don'ts
- ✅ Let whitespace breathe. A short headline on 50% of the viewport height is correct.
- ✅ Use serif for numbers when they matter (pricing, stats).
- ✅ Draw one accent element per page; the rest is foreground.
- ❌ No gradients.
- ❌ No emojis in product copy.
- ❌ No sentence-case for headings — use title case for H1/H2, sentence case for H3 and below.
- ❌ No border-radius above 24px; no border-radius below 8px.

## Responsive Behavior
- **Desktop ≥ 1024px:** 12-col grid, full hero heights, side-by-side columns.
- **Tablet 640–1023px:** 8-col grid; hero drops to 60vh; columns stack at 3+.
- **Phone < 640px:** 4-col grid; single-column layout; hero drops to 50vh; all padding -33%.

## Agent Prompt Guide
When generating artifacts against this design system:
- Lead with typography and whitespace; chrome (borders, shadows) is subtractive.
- If you need more than one accent element on a screen, you're doing too much — cut one.
- When asked for "professional" or "serious," lean harder on serif + whitespace. When asked for "modern," this system isn't the right answer; pick a different DESIGN.md.
- Color tokens are non-negotiable. Do not invent new hex values. If the request needs a color outside this palette, produce a warning comment in the artifact and use the closest existing token.
- Prefer 1 hero + 3–5 body sections over 1 hero + 8+ sections. Editorial means restraint.


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system warm-editorial` and `check-craft-ceiling.js` both clean
