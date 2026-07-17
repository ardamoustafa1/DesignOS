# Visual Effects — The Wow Execution Catalog

`brain/originality.md` decides WHERE the 5% boldness budget goes; this module is HOW it
gets built. Every recipe here is a signature-moment candidate: correct values, known
costs, and the rule for when it's earned. Effects are seasoning — the dish is hierarchy,
type, and spacing. A page that needs three of these to feel premium isn't premium yet.

## Deployment law
- **Budget: one hero-scale effect + one interaction-scale effect per page, maximum.**
  They must share one color story (the accent — `foundations/colors.md`).
- Every effect is a decorative layer: `pointer-events: none` where non-interactive,
  contrast re-verified under it (`foundations/accessibility.md`), zero effect on layout
  (no CLS), compositor-only animation (`motion/performance.md`).
- Dark themes carry light effects better than light themes carry dark ones — glow,
  grain, and beams read as craft on dark, as smudge on white. On light themes, prefer
  structure effects (grids, masks, frames) over light effects.
- Record the chosen effect + reason in `memory/design.md` like any signature.

## Backdrop recipes (hero-scale — pick ONE)

### Radial glow / light leak
The workhorse. One or two large radial gradients in the accent, blurred, behind content:
`background: radial-gradient(ellipse 600px 400px at 70% 20%, rgb(from var(--accent) r g b / 0.15), transparent 70%)`
— or a positioned pseudo-element with `filter: blur(60px)`. Opacity 8–18% on dark,
5–10% on light. Off-center beats centered (symmetric glow reads as template). Never
behind body text without re-checking contrast against the *lightened* result.

### Gradient mesh, done right
3–4 overlapping radial gradients, all within ±30° of the accent hue plus one neutral —
NOT purple-to-blue-to-pink (`brain/trend-radar.md` dated shelf; `industries/ai-startup.md`).
Add the grain overlay (below) at 2–3% to kill banding. Static only — animated mesh is a
GPU tax with no hierarchy payoff. One per site, hero only.

### Grain / noise overlay
The texture that separates "rendered" from "designed": an SVG `feTurbulence` data-URI
tile (`baseFrequency` 0.6–0.9, `numOctaves` 3) as a fixed pseudo-element,
`opacity: 0.02–0.04`, `mix-blend-mode: overlay`. Subtle enough that users feel it
without seeing it. Also the standard fix for gradient banding. Cost: near zero.

### Line grid / dot matrix
Engineering-credibility texture (dev tools, fintech, infra):
`background-image: linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, ...)`
at 40–64px cells, or `radial-gradient(circle, var(--border-default) 1px, transparent 1px)`
dots at 24–32px. **The craft is the fade**: `mask-image: radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)`
so the grid dissolves before it competes with content. Full-strength edge-to-edge grid = graph paper.

## Element recipes (interaction-scale)

### Gradient text
The page's single gradient moment (`components/hero.md`): 2–3 word span,
`background-clip: text` + `color: transparent`, gradient from `--text-primary` to the
accent (not accent-to-accent — legibility dies). Keep ≥4.5:1 at the gradient's lightest
stop. Solid-color fallback declared first.

### Border beam / conic ring
A slow-traveling light along a card or CTA border: `@property --angle` (syntax
`"<angle>"`) animated 0→360° over 4–8s, painted via
`conic-gradient(from var(--angle), transparent 80%, var(--accent))` on a 1px padding-box
ring (pseudo-element + `mask` composite). One element per page — the flagship card or
the primary CTA, never both. Pause when off-viewport (`animation-play-state` via
IntersectionObserver). Registered-property animation is compositor-cheap; `border-image`
animation is not.

### Spotlight hover
Card surface lightening that follows the pointer: on `pointermove` set `--mx/--my`
(rAF-throttled), paint `radial-gradient(240px circle at var(--mx) var(--my), rgb(from var(--accent) r g b / 0.08), transparent)`.
Reads as responsive material, not decoration. Desktop-only — gate behind
`@media (hover: hover)`; touch gets the plain elevated state (`components/cards.md`).

### Glass surface
Only where content genuinely scrolls beneath: sticky nav, overlay chrome
(`components/navigation.md`). Recipe: `backdrop-filter: blur(12px) saturate(1.4)`,
background at 60–75% opacity, 1px hairline border, and an opaque fallback via
`@supports not (backdrop-filter: blur(1px))`. Glass on static sections is the dated-shelf
glassmorphism the radar flags.

### Framed screenshot
The trust asset, staged: hairline ring (`box-shadow: 0 0 0 1px var(--border-default)`),
then a 2–3 layer shadow stack (tight+dark, mid, wide+soft — `foundations/colors.md`
shadow discipline), optional browser-chrome bar, on a raised surface token. Entrance may
be the hero's one signature move: 2–3° tilt settling flat, 500ms ease-out, once
(`components/hero.md`). Never a naked screenshot floating on the page background.

### Logo marquee
For >8 logos where a static row can't hold them (`components/hero.md` trust strip):
duplicated track, `translateX(-50%)` loop at 30–60s (slower = more premium), edge fade
via `mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent)`,
pauses on hover/focus, and **stops entirely** under `prefers-reduced-motion` (render as
a static wrapped row, not a frozen half-cut track).

## Anti-patterns
- Effect stacking: mesh + beam + spotlight + glow on one page = template cosplay — the
  exact "three trends ≠ signature" failure (`brain/originality.md`)
- Glow promiscuity: accent glow on every card/button — glow marks THE ONE (primary CTA
  or hero visual), or it marks nothing
- Banding: any large gradient shipped without grain or dither check on a cheap display
- Animated background consuming the LCP budget (`checklists/performance.md`) — backdrop
  effects are static or idle-cheap; only beams/marquees move, and they pause off-screen
- Spotlight/tilt on touch devices; `backdrop-filter` without fallback; scroll-driven
  effects without `prefers-reduced-motion` collapse (`motion/performance.md` — binding)
- Effects as rescue: reaching for this file because the layout is boring — fix the
  hierarchy first (`brain/design-intelligence.md` subtraction doctrine)

## Checklist
- [ ] ≤1 backdrop effect + ≤1 interaction effect, same color story, recorded in memory
- [ ] Contrast re-verified on top of every effect layer; decorative layers `pointer-events: none`
- [ ] Grain applied to any large gradient; no visible banding at 1x on sRGB
- [ ] All moving effects: compositor-only, paused off-viewport, reduced-motion collapse
- [ ] Touch and no-support fallbacks (`hover: hover`, `@supports`) in place
- [ ] The squint test still passes with every effect layer hidden — effects season, never carry
