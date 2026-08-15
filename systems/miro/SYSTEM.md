<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# Miro

> Category: Design & Creative
> Bundled Open Design package for Miro, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

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
node validators/check-system-conformance.js <target> --system miro
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Design System Inspired by Miro

> Category: Design & Creative
> Visual collaboration. Bright yellow accent, infinite canvas aesthetic.

## 1. Visual Theme & Atmosphere

Miro's website is a clean, collaborative-tool-forward platform that communicates "visual thinking" through generous whitespace, pastel accent colors, and a confident geometric font. The design uses a predominantly white canvas with near-black text (`#1c1c1e`) and a distinctive pastel color palette — coral, rose, teal, orange, yellow, moss — each representing different collaboration contexts.

The typography uses Roobert PRO Medium as the primary display font with OpenType character variants (`"blwf", "cv03", "cv04", "cv09", "cv11"`) and negative letter-spacing (-1.68px at 56px). Noto Sans handles body text with its own stylistic set (`"liga" 0, "ss01", "ss04", "ss05"`). The design is built with Framer, giving it smooth animations and modern component patterns.

**Key Characteristics:**
- White canvas with near-black (`#1c1c1e`) text
- Roobert PRO Medium with multiple OpenType character variants
- Pastel accent palette: coral, rose, teal, orange, yellow, moss (light + dark pairs)
- Blue 450 (`#5b76fe`) as primary interactive color
- Success green (`#00b473`) for positive states
- Generous border-radius: 8px–50px range
- Framer-built with smooth motion patterns
- Ring shadow border: `rgb(224,226,232) 0px 0px 0px 1px`

## 2. Color Palette & Roles

### Primary
- **Near Black** (`#1c1c1e`): Primary text
- **White** (`#ffffff`): `--tw-color-white`, primary surface
- **Blue 450** (`#5b76fe`): `--tw-color-blue-450`, primary interactive
- **Actionable Pressed** (`#2a41b6`): `--tw-color-actionable-pressed`

### Pastel Accents (Light/Dark pairs)
- **Coral**: Light `#ffc6c6` / Dark `#600000`
- **Rose**: Light `#ffd8f4` / Dark (implied)
- **Teal**: Light `#c3faf5` / Dark `#187574`
- **Orange**: Light `#ffe6cd`
- **Yellow**: Dark `#746019`
- **Moss**: Dark `#187574`
- **Pink** (`#fde0f0`): Soft pink surface
- **Red** (`#fbd4d4`): Light red surface
- **Dark Red** (`#e3c5c5`): Muted red

### Semantic
- **Success** (`#00b473`): `--tw-color-success-accent`

### Neutral
- **Slate** (`#555a6a`): Secondary text
- **Input Placeholder** (`#a5a8b5`): `--tw-color-input-placeholder`
- **Border** (`#c7cad5`): Button borders
- **Ring** (`rgb(224,226,232)`): Shadow-as-border

## 3. Typography Rules

### Font Families
- **Display**: `Roobert PRO Medium`, fallback: Placeholder — `"blwf", "cv03", "cv04", "cv09", "cv11"`
- **Display Variants**: `Roobert PRO SemiBold`, `Roobert PRO SemiBold Italic`, `Roobert PRO`
- **Body**: `Noto Sans` — `"liga" 0, "ss01", "ss04", "ss05"`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Roobert PRO Medium | 56px | 400 | 1.15 | -1.68px |
| Section Heading | Roobert PRO Medium | 48px | 400 | 1.15 | -1.44px |
| Card Title | Roobert PRO Medium | 24px | 400 | 1.15 | -0.72px |
| Sub-heading | Noto Sans | 22px | 400 | 1.35 | -0.44px |
| Feature | Roobert PRO Medium | 18px | 600 | 1.35 | normal |
| Body | Noto Sans | 18px | 400 | 1.45 | normal |
| Body Standard | Noto Sans | 16px | 400–600 | 1.50 | -0.16px |
| Button | Roobert PRO Medium | 17.5px | 700 | 1.29 | 0.175px |
| Caption | Roobert PRO Medium | 14px | 400 | 1.71 | normal |
| Small | Roobert PRO Medium | 12px | 400 | 1.15 | -0.36px |
| Micro Uppercase | Roobert PRO | 10.5px | 400 | 0.90 | uppercase |

## 4. Component Stylings

### Buttons
- Outlined: transparent bg, `1px solid #c7cad5`, 8px radius, 7px 12px padding
- White circle: 50% radius, white bg with shadow
- Blue primary (implied from interactive color)

### Cards: 12px–24px radius, pastel backgrounds
### Inputs: white bg, `1px solid #e9eaef`, 8px radius, 16px padding

## 5. Layout Principles
- Spacing: 1–24px base scale
- Radius: 8px (buttons), 10px–12px (cards), 20px–24px (panels), 40px–50px (large containers)
- Ring shadow: `rgb(224,226,232) 0px 0px 0px 1px`

## 6. Depth & Elevation
Minimal — ring shadow + pastel surface contrast

## 7. Do's and Don'ts
### Do
- Use pastel light/dark pairs for feature sections
- Apply Roobert PRO with OpenType character variants
- Use Blue 450 (#5b76fe) for interactive elements
### Don't
- Don't use heavy shadows
- Don't mix more than 2 pastel accents per section

## 8. Responsive Behavior
Breakpoints: 425px, 576px, 768px, 896px, 1024px, 1200px, 1280px, 1366px, 1700px, 1920px

## 9. Agent Prompt Guide
### Quick Color Reference
- Text: Near Black (`#1c1c1e`)
- Background: White (`#ffffff`)
- Interactive: Blue 450 (`#5b76fe`)
- Success: `#00b473`
- Border: `#c7cad5`
### Example Component Prompts
- "Create hero: white background. Roobert PRO Medium 56px, line-height 1.15, letter-spacing -1.68px. Blue CTA (#5b76fe). Outlined secondary (1px solid #c7cad5, 8px radius)."


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system miro` and `check-craft-ceiling.js` both clean
