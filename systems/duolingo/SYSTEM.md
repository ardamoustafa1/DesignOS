<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# Duolingo

> Category: Productivity & SaaS
> Bundled Open Design package for Duolingo, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

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
node validators/check-system-conformance.js <target> --system duolingo
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Design System Inspired by Duolingo

> Category: Productivity & SaaS
> Language-learning platform. Bright owl green, chunky shadows, gamified joy.

## 1. Visual Theme & Atmosphere

Duolingo is gamification rendered as visual language. The interface is unapologetically bright, with **owl green** (`#58cc02`) as the brand primary and a chunky 4px bottom-shadow on every interactive element that reads like a 3D button waiting to be pressed. The page is white (`#ffffff`) with thick 2–3px borders in a deep gray (`#e5e5e5`) and the entire system reads like an iOS app from 2015 reborn with better hierarchy.

Typography uses **Feather Bold** (a custom rounded sans) for chrome and **Mona Sans** (or Inter) for body. Display sizes are big and confident — Duolingo never whispers. Headings often carry the green underline-stroke or sit on a green pill, and the mascot Duo (a green owl) appears as an active illustration character, not a static logo.

Shape language is friendly: 16–20px radii on cards, 12px on buttons, 9999px on chips and progress bars. Iconography is filled, rounded, and color-coded by skill — every lesson surface has an instantly identifiable color pairing.

**Key Characteristics:**
- Owl green (`#58cc02`) as the dominant brand color, used in 30%+ of the surface
- Chunky 4px bottom-shadow on every button (the "tactile press" affordance)
- 2–3px solid borders, never hairlines
- Feather Bold (rounded display) + Mona Sans (body)
- Big confident type — display sizes start at 48px and climb
- Mascot-as-character: Duo the owl appears in onboarding, errors, streaks
- Streak orange (`#ff9600`) and gem pink (`#ce82ff`) as secondary brand colors

## 2. Color Palette & Roles

### Primary
- **Owl Green** (`#58cc02`): Brand primary, primary CTA, correct answer.
- **Owl Green Deep** (`#58a700`): Pressed/shadow color for green buttons.
- **Owl Green Light** (`#89e219`): Hover, soft fills.
- **Owl Green Pale** (`#dbf8c5`): Soft surface, success banner.

### Secondary Accents
- **Streak Orange** (`#ff9600`): Streak counter, fire icon, premium energy.
- **Streak Orange Deep** (`#cc7a00`): Pressed orange.
- **Gem Pink** (`#ce82ff`): Gem currency, Super Duolingo.
- **Eel Blue** (`#1cb0f6`): Hint button, info link.
- **Cardinal Red** (`#ff4b4b`): Wrong answer, life lost.
- **Bee Yellow** (`#ffc800`): Pro badge, achievement.

### Surface
- **Snow** (`#ffffff`): Primary background.
- **Eel** (`#f7f7f7`): Section break, secondary surface.
- **Swan** (`#e5e5e5`): Disabled background, inset block.
- **Wolf** (`#777777`): Dark divider, secondary text.

### Ink & Text
- **Eel Black** (`#3c3c3c`): Primary text.
- **Wolf** (`#777777`): Secondary text, captions.
- **Hare** (`#afafaf`): Disabled, placeholder.

### Border
- **Swan** (`#e5e5e5`): Standard 2px border.
- **Hare** (`#afafaf`): Emphasized border on hover.

## 3. Typography Rules

### Font Family
- **Display / UI / Headings**: `Feather Bold`, with fallback: `'DIN Round Pro', 'Helvetica Neue', sans-serif`
- **Body / Long-form**: `Mona Sans`, with fallback: `'Helvetica Neue', system-ui, sans-serif`
- **Code (rare, schools/admin)**: `JetBrains Mono`, with fallback: `ui-monospace, Menlo, monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display | Feather Bold | 56px (3.5rem) | 800 | 1.05 | -0.01em | Onboarding hero |
| H1 | Feather Bold | 32px (2rem) | 800 | 1.15 | -0.005em | Page title |
| H2 | Feather Bold | 24px (1.5rem) | 800 | 1.2 | normal | Section heading |
| H3 | Feather Bold | 18px (1.125rem) | 700 | 1.25 | normal | Card title, lesson row |
| Body Large | Mona Sans | 17px (1.0625rem) | 500 | 1.5 | normal | Lesson prompt, instruction |
| Body | Mona Sans | 15px (0.9375rem) | 400 | 1.5 | normal | Standard prose |
| Caption | Mona Sans | 13px (0.8125rem) | 600 | 1.4 | 0.01em | XP counter, metadata |
| Button | Feather Bold | 16px (1rem) | 800 | 1.2 | 0.02em | Standard button label |
| Streak | Feather Bold | 14px (0.875rem) | 800 | 1.2 | normal | Streak number, on flame |

### Principles
- **800 is default**: Feather Bold runs at 800 across headings and buttons. 700 feels weak in this system.
- **Big type**: heading sizes are 25–40% larger than typical product brands — confidence as identity.
- **Rounded letterforms**: every glyph has soft terminals; sharp serifs would break the friendliness contract.

## 4. Component Stylings

### Buttons

**Primary (Owl Green)**
- Background: `#58cc02`
- Text: `#ffffff`
- Padding: 14px 24px
- Radius: 16px
- Border-bottom: 4px solid `#58a700` (the chunky shadow)
- Hover: background `#89e219`
- Active: translate-y 4px, border-bottom 0 (button "presses")
- Use: "Continue", "Check", main CTA.

**Secondary (White with Bottom-Shadow)**
- Background: `#ffffff`
- Text: `#777777`
- Border: 2px solid `#e5e5e5`
- Border-bottom: 4px solid `#e5e5e5`
- Radius: 16px
- Padding: 14px 24px
- Hover: text `#3c3c3c`, border `#afafaf`

**Streak Orange**
- Background: `#ff9600`
- Text: `#ffffff`
- Border-bottom: 4px solid `#cc7a00`
- Use: streak goal, "Start streak"

**Error (Cardinal Red)**
- Background: `#ff4b4b`
- Text: `#ffffff`
- Border-bottom: 4px solid `#cc3b3b`
- Use: wrong answer feedback.

### Cards / Lesson Tiles
- Background: `#ffffff`
- Border: 2px solid `#e5e5e5`
- Border-bottom: 4px solid `#e5e5e5`
- Radius: 16px
- Padding: 16px
- Hover: lift 2px, shadow `0 4px 0 #d7d7d7`

### Skill Tree Node (Lesson Bubble)
- Size: 80×72px
- Background: skill-color tinted (green for active, gray for locked)
- Border-bottom: 6px solid darker variant
- Radius: 50% (circular)
- Active: pulses 1.0 → 1.05 every 1.6s

### Inputs
- Background: `#ffffff`
- Border: 2px solid `#e5e5e5`
- Radius: 12px
- Padding: 12px 16px
- Focus: border `#1cb0f6` (eel blue), ring `0 0 0 3px rgba(28, 176, 246, 0.2)`

### Progress Bar
- Track: `#e5e5e5`
- Fill: `#58cc02` (or `#ff9600` for streak)
- Radius: 9999px
- Height: 16px
- Animated fill: 320ms ease-out on increment.

## 5. Spacing & Layout

- **Base unit**: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64.
- **Container**: max 1080px, 24px gutter.
- **Lesson tree column**: 320px wide; centered on desktop.

## 6. Motion

- **Duration**: 180ms for button press; 320ms for skill-node unlock; 1.6s for active-node pulse.
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out, slight overshoot) for unlocks.
- **Mascot**: Duo blinks every 4–6s, jumps on streak milestones (480ms ease-out spring).

## 7. Usage Guardrails

- Keep the high-saturation owl green, chunky bottom shadows, and rounded lesson geometry together; flat green buttons alone do not read as Duolingo.
- Reserve oversized bold type for lesson, streak, and progress moments where the product needs encouragement or feedback.
- Use playful motion sparingly around progress state changes, avoiding generic bouncy animation on every control.


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system duolingo` and `check-craft-ceiling.js` both clean
