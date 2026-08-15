<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# OpenAI

> Category: AI & LLM
> Bundled Open Design package for OpenAI, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

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
node validators/check-system-conformance.js <target> --system openai
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Design System Inspired by OpenAI

> Category: AI & LLM
> Calm, near-monochrome system anchored in deep teal-black with generous white space and editorial typography.

## 1. Visual Theme & Atmosphere

OpenAI's product surface reads like a research lab dressed for the public — clinical, restrained, deliberately quiet. The page background is a true white (`#ffffff`) layered against a near-black ink (`#0d0d0d`) with a subtle teal undertone, so even the text feels slightly cooled rather than aggressively dark. The result is a chromatic neutrality that puts model output, code, and prose front and center, not the chrome around them.

The signature move is the use of **Söhne** (or its system stand-in `inter`) at restrained weights — 400 for body, 500 for nav and labels, 600 for emphasis — paired with **Signifier**, a contemporary serif used for editorial display. Where most AI brands lean futuristic, OpenAI's serif headlines give the product a quietly literary tone, as if every announcement is an essay.

The shape system is uniformly soft: 8px–12px radii, 9999px pills for tags and chips, no harsh corners anywhere. Section transitions are denoted by whitespace rather than dividers; when borders appear they are `#e5e5e5` hairlines that read as the absence of color rather than its presence.

**Key Characteristics:**
- True white canvas (`#ffffff`) with deep teal-black ink (`#0d0d0d`)
- Söhne / Inter at modest weights (400, 500, 600) — restraint over assertion
- Signifier serif for editorial display headlines
- Soft 8–12px radii everywhere; 9999px pills for chips
- Hairline borders (`#e5e5e5`) used sparingly; whitespace as primary divider
- Single-color illustrations in deep teal — no gradients in marks
- Generous line-height (1.55–1.65) and tracking near zero

## 2. Color Palette & Roles

### Primary
- **Pure White** (`#ffffff`): Primary background, card surface, button background.
- **Ink Black** (`#0d0d0d`): Primary text, brand mark, primary CTA.
- **Soft Black** (`#1a1a1a`): Secondary heading, alternative ink for non-critical text.

### Surface & Background
- **Mist** (`#fafafa`): Section break background, footer surface.
- **Pearl** (`#f5f5f5`): Card surface, elevated panel.
- **Cloud** (`#ececec`): Disabled background, divider tint.

### Brand Accent
- **OpenAI Teal** (`#10a37f`): Brand primary, link, highlight badge — the lone color in an otherwise neutral system.
- **Teal Deep** (`#0a7a5e`): Hover and pressed state for the brand color.
- **Teal Soft** (`#e8f5f0`): Surface tint for success badges, highlight callouts.

### Neutrals & Text
- **Graphite** (`#3c3c3c`): Body text, default reading color.
- **Slate** (`#6e6e6e`): Secondary text, captions, metadata.
- **Ash** (`#9b9b9b`): Tertiary text, placeholder, disabled label.
- **Stone** (`#c4c4c4`): Decorative dividers, faint icons.

### Semantic & Border
- **Border Hairline** (`#e5e5e5`): Standard hairline separator.
- **Border Soft** (`#ededed`): Card outline on white surface.
- **Error** (`#ef4146`): Validation, destructive action.
- **Warning** (`#f5a623`): Soft amber for advisory states.
- **Info** (`#2563eb`): Informational link tone (used sparingly; teal still wins).

## 3. Typography Rules

### Font Family
- **Display / Editorial**: `Signifier`, with fallback: `'Source Serif Pro', Georgia, serif`
- **Body / UI**: `Söhne`, with fallback: `Inter, system-ui, -apple-system, 'Segoe UI', sans-serif`
- **Code / Mono**: `Söhne Mono`, with fallback: `ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display | Signifier | 56px (3.5rem) | 400 | 1.08 | -0.02em | Editorial hero, announcement titles |
| H1 | Söhne | 40px (2.5rem) | 600 | 1.15 | -0.01em | Page heading |
| H2 | Söhne | 28px (1.75rem) | 600 | 1.2 | -0.005em | Section heading |
| H3 | Söhne | 20px (1.25rem) | 600 | 1.3 | normal | Sub-section |
| Body Large | Söhne | 18px (1.125rem) | 400 | 1.6 | normal | Lede paragraphs |
| Body | Söhne | 16px (1rem) | 400 | 1.65 | normal | Standard reading text |
| Body Small | Söhne | 14px (0.875rem) | 400 | 1.55 | normal | Card body, dense UI |
| Caption | Söhne | 13px (0.8125rem) | 500 | 1.4 | 0.01em | Metadata, badges |
| Label | Söhne | 12px (0.75rem) | 500 | 1.3 | 0.04em | Eyebrow, uppercase nav links |
| Code | Söhne Mono | 14px (0.875rem) | 400 | 1.55 | normal | Code blocks, terminal output |

### Principles
- **Restraint as identity**: weights cap at 600; 700+ feels off-brand. Hierarchy comes from size and color, not weight.
- **Serif for soul, sans for system**: Signifier appears only in editorial display moments. The product UI is sans-only.
- **Negative tracking on display**: -0.02em on display sizes; tracking returns to zero by 16px.

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#0d0d0d`
- Text: `#ffffff`
- Padding: 10px 18px
- Radius: 9999px (full pill) on chips, 12px on rectangular CTAs
- Hover: `#1a1a1a` background
- Use: Primary CTA, "Try ChatGPT", "Sign in"

**Secondary**
- Background: `#ffffff`
- Text: `#0d0d0d`
- Border: 1px solid `#e5e5e5`
- Padding: 10px 18px
- Radius: 12px
- Hover: background `#fafafa`, border `#d4d4d4`

**Brand Accent**
- Background: `#10a37f`
- Text: `#ffffff`
- Padding: 10px 18px
- Radius: 12px
- Hover: `#0a7a5e`
- Use: Highlighted upgrade CTA, success path

### Cards
- Background: `#ffffff`
- Border: 1px solid `#ededed`
- Radius: 16px
- Padding: 24px–32px
- Shadow: none by default; on hover `0 4px 16px rgba(13,13,13,0.06)`

### Inputs
- Background: `#ffffff`
- Border: 1px solid `#e5e5e5`
- Radius: 12px
- Padding: 12px 14px
- Focus: border `#10a37f`, ring `0 0 0 3px rgba(16,163,127,0.12)`

### Pills & Tags
- Background: `#f5f5f5`
- Text: `#3c3c3c`
- Padding: 4px 10px
- Radius: 9999px
- Font: 12px / 500

## 5. Spacing & Layout

- **Base unit**: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Container**: max-width 1200px, 24px gutter on mobile, 48px on desktop.
- **Section rhythm**: 96–128px vertical between major sections; 64px on mobile.
- **Grid**: 12-column desktop, 4-column mobile, 24px gap.

## 6. Motion

- **Duration**: 150–220ms for hover; 280–360ms for layout transitions.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth out) for entrances.
- **Restraint**: no parallax, no scroll-jacking. Subtle fade and translate only.

## 7. Usage Guardrails

- Preserve the neutral editorial restraint, soft radius, and sparse accent usage together; green accents alone do not create an OpenAI-like surface.
- Use Signifier-style display moments only for editorial or announcement hierarchy, keeping product controls in the sans system.
- Avoid ornamental motion, heavy shadows, and oversized decorative cards; the system should feel calm, readable, and deliberate.


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system openai` and `check-craft-ceiling.js` both clean
