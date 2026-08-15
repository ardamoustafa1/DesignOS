<!-- Imported by scripts/import-design-systems.js — do not hand-edit the
     "Upstream contract" section below; re-run the importer instead. The DesignOS
     supplement above it is ours and is safe to edit. -->

# Webex

> Category: Productivity & SaaS
> Bundled Open Design package for Webex, derived from curated DESIGN.md, tokens.css, and components.html fixtures.

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
node validators/check-system-conformance.js <target> --system webex
node validators/check-craft-ceiling.js <target>
```

### Where this system fits

- see the upstream contract below; the importer could not derive a `suits` list

Choosing a system is still a design decision. If the brief wants something this package
is not, saying so beats dressing the wrong product in the nearest available skin
(`brain/decision-framework.md`, `brain/originality.md`).

---

## Upstream contract

# Design System Inspired by Webex

> Category: Productivity & SaaS
> Collaboration platform. Momentum typography, blue action system, multi-user accent spectrum.

## 1. Visual Theme & Atmosphere

Webex is cleaner, friendlier, and more product-led than Cisco corporate while still living inside the same trust-oriented universe. The brand language combines bright white canvases with dark in-product surfaces, then anchors interaction around a precise family of blue action colors drawn from Momentum. The result is a collaboration platform aesthetic: capable, legible, modern, and designed for continuous use rather than one-shot marketing drama.

Typography is driven by the Momentum system, whose primary font stack is `Momentum, Inter, Arial, Helvetica Neue, Helvetica, sans-serif`. This gives Webex a more software-native rhythm than Cisco's broader corporate presence. Headings should be clear and confident, but not monumental. Body copy should feel practical and human. In contrast to Cisco's singular-signal visual system, Webex allows a broader supporting collaboration palette — cobalt, cyan, mint, lime, gold, orange, pink, purple — but these should appear as **secondary accents** for teams, avatars, presence, or workspace state, not as uncontrolled decoration.

What defines Webex is **blue-guided clarity plus collaborative color**. Action is blue. Surfaces are simple. Supporting colors represent people, teams, or activity.

**Key Characteristics:**
- Momentum typography stack with clean product rhythm
- Blue action system centered on `#1170cf`, `#0353a8`, and `#063a75`
- White marketing/product canvases paired with optional charcoal dark-mode surfaces
- Soft pill geometry for actions and controls
- Collaboration-spectrum accent colors used sparingly for people/workspaces
- Product-first clarity over ornamental flourish
- Motion should feel polished and unobtrusive

## 2. Color Palette & Roles

### Primary Action
- **Webex Action Blue** (`#1170cf`): Primary buttons, active controls, main links, selected states
- **Action Blue Hover** (`#0353a8`): Hover and stronger emphasis
- **Action Blue Pressed** (`#063a75`): Pressed / active interaction state
- **Accent Light Blue** (`#64b4fa`): Focus ring, bright dark-surface link state, supportive highlight

### Text & Surface
- **Primary Text (Light Theme)** (`#000000f2`): Main light-surface text
- **Secondary Text (Light Theme)** (`#000000b3`): Support copy and metadata
- **Primary Text (Dark Theme)** (`#fffffff2`): Main dark-surface text
- **Secondary Text (Dark Theme)** (`#ffffffb3`): Support copy on dark
- **White Canvas** (`#ffffff`): Primary light background
- **Black Canvas** (`#000000`): Full dark background
- **Dark Surface 1** (`#1a1a1a`): Dark cards, modals, product chrome
- **Dark Surface 2** (`#262626`): Elevated dark layers

### Collaboration / Team Spectrum
- **Team Cobalt** (`#5ebff7`)
- **Team Cyan** (`#22c7d6`)
- **Team Mint** (`#30c9b0`)
- **Team Lime** (`#93c437`)
- **Team Gold** (`#d6b220`)
- **Team Orange** (`#fd884e`)
- **Team Pink** (`#fc97aa`)
- **Team Purple** (`#f294f1`)

Use these as secondary collaboration accents: avatars, presence markers, workspace labels, chips, or lightweight category signals.

### Semantic
- **Success** (`#3cc29a`)
- **Warning** (`#f2990a`)
- **Danger** (`#fc8b98`)

## 3. Typography Rules

### Font Family
- **Primary**: `Momentum`, fallbacks: `Inter, Arial, Helvetica Neue, Helvetica, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Hero Display | Momentum | 64px | 500 | 1.10 | -1px | Marketing hero headline |
| Section Display | Momentum | 40px | 500 | 1.20 | -0.5px | Section lead |
| Heading | Momentum | 24px | 500 | 1.33 | normal | Card title, feature title |
| Body | Momentum | 16px | 400 | 1.50 | normal | Default product/marketing body |
| Body Small | Momentum | 14px | 400 | 1.43 | normal | Metadata, nav, helper text |
| Label | Momentum | 12px | 500 | 1.33 | normal | Chips, tags, presence labels |
| Button | Momentum | 16px | 500 | 1.25 | normal | CTA label |

### Principles
- Keep typography highly legible and product-oriented.
- Use medium weight for structural emphasis, not ultra-bold display theatrics.
- The system should feel modern and easy to scan, especially in dashboard and collaboration contexts.
- Avoid decorative font mixing unless the artifact explicitly requires a marketing flourish.

## 4. Component Stylings

### Buttons

**Primary Blue Pill**
- Background: Webex Action Blue (`#1170cf`)
- Text: White (`#ffffff`)
- Radius: pill
- Hover: `#0353a8`
- Active: `#063a75`

**Secondary Outline / Ghost on Light**
- Background: transparent or white
- Text: `#1170cf`
- Border: subtle dark or blue-tinted alpha border
- Radius: pill
- Purpose: secondary CTA on white or light product surfaces

**Secondary Outline / Ghost on Dark**
- Background: transparent or `#1a1a1a`
- Text: `#64b4fa` or white for the strongest emphasis
- Border: 1px white-alpha or Accent Light Blue (`#64b4fa`) depending on emphasis
- Radius: pill
- Hover: soft blue-tinted dark fill with the text color preserved
- Focus ring: 2px Accent Light Blue halo
- Purpose: dark-surface secondary CTA without dropping below contrast targets

### Cards & Containers
- Light cards: white fill with subtle outline
- Dark cards: `#1a1a1a` fill with bright text and light outline
- Radius: 16px
- Keep interiors airy; do not over-densify by default

### Inputs & Controls
- Light surfaces: subtle outline, blue focus
- Dark surfaces: bright text, soft white-alpha outline, blue focus signal
- Toggles, tabs, and nav should feel precise and product-native, not ornamental

### Collaboration Tokens
- Use team-spectrum colors for presence chips, avatar backgrounds, workspace badges, or lightweight categorization
- Do not assign them to all primary buttons or all large surfaces

### Brand-Specific Recipes

**Meeting Card**
- Anatomy: title, time block, participant count, host avatar, device or room status, primary join action
- States: upcoming, live, ended, recording, muted-device warning
- Brand behavior: primary action stays blue; meeting state uses subtle chips rather than full-surface color fills

**Presence Chip**
- Anatomy: avatar or initials, user name, compact status dot/chip, optional location/device label
- Sizes: 24px compact, 32px default, 40px prominent
- States: available, presenting, in meeting, away, do-not-disturb
- Color rule: use collaboration colors as supporting identity accents, not as replacements for semantic status

**Workspace Sidebar**
- Anatomy: workspace switcher, search, primary nav groups, badge counts, pinned spaces, footer utilities
- Behavior: keep hierarchy obvious and allow badge counts or unread state to read at a glance
- States: selected item, unread, hovered, collapsed narrow mode

**Roster Row**
- Anatomy: avatar, display name, role label, mute/video state, hand-raise or reaction slot, overflow actions
- States: speaking, muted, hand raised, spotlighted, disconnected
- Density: support both meeting roster density and more spacious messaging/contact density

## 5. Layout Principles

### Spacing & Grid
- Base rhythm: 8px
- Common scale: 8px, 12px, 16px, 24px, 32px, 48px, 64px, 88px
- Use clean marketing bands and product-story sections
- Prefer simple grids with clear scanning order
- Breakpoints: mobile up to 767px, tablet 768px-1199px, desktop 1200px and above

### Composition
- White space is important; the UI should not feel cramped
- Marketing layouts should balance clarity with product focus
- Collaboration/product pages may mix white sections with dark embedded product surfaces
- Blue should lead the eye; collaboration colors should support, not compete
- On tablet, reduce multi-panel collaboration layouts to two primary regions and preserve a clear action rail
- On mobile, stack sidebars beneath the main header, collapse meeting side-panels into drawers, and keep call controls centered in a single thumb-reachable row
- Navigation should shift to a compact app bar plus drawer on smaller screens rather than shrinking labels until they wrap

### Accessibility & Responsiveness
- Minimum touch target: 44px by 44px for buttons, tabs, roster actions, and call controls
- Maintain visible keyboard focus with an Accent Light Blue halo on both light and dark surfaces
- Any hover-revealed affordance must also appear on focus and touch
- Respect reduced-motion users by replacing staggered entrance motion with instant layout plus subtle opacity changes only

## 6. Motion & Interaction

- Motion should feel polished, calm, and practical
- Use fade, slide, and soft stagger in the 160ms–280ms range
- Hover and focus can use gentle blue glow or highlight
- Avoid loud spring physics or excessive flourish
- Under `prefers-reduced-motion`, remove stagger choreography and large panel slides; keep state feedback under 120ms with opacity or outline changes only

## 7. Voice & Brand

- Webex voice is practical, clear, and human
- Headlines should emphasize usefulness, outcomes, and collaborative capability
- The brand should feel like a trusted workspace platform for meetings, messaging, devices, and shared work
- It should be warmer than Cisco corporate, but still disciplined

## 8. Anti-patterns

- Do not turn Webex into a rainbow-heavy consumer social product
- Do not use collaboration colors as primary CTA colors
- Do not overuse gradients as core brand language
- Do not make the system overly corporate-dark when the artifact is meant to feel collaborative and accessible
- Do not use decorative typography that harms scannability

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary action: `#1170cf`
- Hover: `#0353a8`
- Pressed: `#063a75`
- Focus / bright dark-surface accent: `#64b4fa`
- Success: `#3cc29a`
- Warning: `#f2990a`
- Danger: `#fc8b98`

### Example Component Prompts
- "Create a Webex-style product landing page with white canvases, Momentum typography, and blue pill CTAs using #1170cf."
- "Design a collaboration dashboard with clean white cards, one embedded dark product panel, and secondary team-color chips for presence."
- "Build a settings or admin surface that uses calm spacing, blue action states, and restrained multi-user color accents."


---

## Checklist

- [ ] `tokens.css` imported or inlined; no value redeclared locally
- [ ] Elevation from `--ds-elev-1/2/3`; at least one element above level 1
- [ ] Grain layer present; large fills carry a 2–4% gradation
- [ ] Accent solid-filled on ≤ 4 elements; everything else uses a tint
- [ ] Arrival is index-driven and the LCP element is not opacity-animated
- [ ] ≥4 section compositions, ≥2 grounds — the part tokens cannot give you
- [ ] Three optical corrections applied and named
- [ ] `check-system-conformance.js --system webex` and `check-craft-ceiling.js` both clean
