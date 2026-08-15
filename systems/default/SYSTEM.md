<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# Neutral Modern

> Category: Starter
> Bundled Open Design package for Neutral Modern, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

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
node validators/check-system-conformance.js <target> --system default
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Neutral Modern

> Category: Starter
> A clean, product-oriented default. Use when the brief doesn't call for a
> specific mood — good for B2B tools, dashboards, and utility pages.

## Visual Theme & Atmosphere
Calm, functional, quietly confident. No ornament. Content-first, chrome-second.

## Color Palette & Roles
- **Background:** `#FAFAFA`
- **Foreground:** `#111111`
- **Accent:** `#2F6FEB` (cobalt) — primary CTAs, links, one hero element per screen
- **Muted:** `#6B6B6B` — secondary text, captions
- **Border:** `#E5E5E5`
- **Surface:** `#FFFFFF` — cards, modals
- **Success:** `#17A34A`, **Warn:** `#EAB308`, **Danger:** `#DC2626`
Never pure black; never pure white for backgrounds.

## Typography Rules
- **Display / headings:** `'Inter', -apple-system, system-ui, sans-serif`, weight 600
- **Body:** `'Inter', -apple-system, system-ui, sans-serif`, weight 400
- **Mono:** `ui-monospace, 'JetBrains Mono', monospace`
- Scale (px): 12 · 14 · 16 · 20 · 24 · 32 · 48 · 64
- Line-height: 1.5 for body, 1.2 for headings
- Letter-spacing: -0.01em on display sizes ≥32px

## Component Stylings
- **Buttons:** 8px radius, 10px padding-block, 16px padding-inline. Primary = cobalt fill, white label. Secondary = 1px border, transparent fill.
- **Cards:** white, 1px border, 12px radius, 20px internal padding, no shadow by default.
- **Inputs:** 1px border, 8px radius, 10px vertical padding, cobalt border on focus.
- **Links:** cobalt, no underline, underline on hover.

## Layout Principles
- 12-column grid, 1200px max-width, 24px gutters.
- Hero: 40–60vh. Content top-biased, never centered vertically.
- Sections: 80px top+bottom spacing desktop, 48px tablet, 32px phone.
- Use whitespace as the main separator. Dividers only between unrelated top-level sections.

## Depth & Elevation
Two levels only:
- **Flat (0):** default.
- **Raised (1):** dropdowns, modals, floating buttons. 2px y-offset, 8px blur, foreground at 8% opacity.
No neumorphism, no glassmorphism.

## Do's and Don'ts
- ✅ Let whitespace do the work.
- ✅ One accent element per screen.
- ✅ Sentence-case headings by default; title case only for brand names.
- ❌ No gradients (except the accent → accent-at-80% on a hero, sparingly).
- ❌ No drop shadows on inputs.
- ❌ No more than three type sizes on one screen.

## Responsive Behavior
- **Desktop ≥ 1024px:** 12-col grid.
- **Tablet 640–1023px:** 8-col grid, 16px gutters.
- **Phone < 640px:** 4-col grid, 12px gutters; hero drops to 40vh.

## Agent Prompt Guide
- When in doubt, subtract. Fewer boxes, less chrome, more space.
- Use the accent color sparingly — at most one hero accent and one CTA accent per screen.
- Do not invent hex values outside this palette. If the request needs one, surface a warning comment in the artifact and use the closest existing token.


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system default` and `check-craft-ceiling.js` both clean
