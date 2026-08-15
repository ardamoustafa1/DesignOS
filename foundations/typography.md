# Typography

Typography *is* the interface: on most screens 90% of pixels are text. Get this right and
mediocre color/layout still reads as professional; get it wrong and nothing saves the design.

## Principles
1. **Two families maximum.** Usually one. Hierarchy comes from size/weight/color, not font-count.
2. **A modular scale, always.** Never invent one-off sizes.
3. **Line-height is inversely proportional to size.** Display: 1.0–1.15 · Headings: 1.2–1.3 · Body: 1.6–1.7.
4. **Tracking is inversely proportional to size.** Display: −0.02em to −0.04em · Body: 0 · Caps labels: +0.05em to +0.1em.
5. **Measure 60–75 characters.** Enforce with `max-width: 65ch` on prose.

## The scale

Base 16px (never smaller for body). Ratio 1.25 (marketing) or 1.2 (dense apps):

| Token | 1.25 scale (marketing) | 1.2 scale (dense apps) | Use |
|---|---|---|---|
| text-xs | 12px | 12px | badges, legal, table meta |
| text-sm | 14px | 13px | UI labels, secondary text, dense app body |
| text-base | 16px | 16px | app body |
| text-lg | 20px | 19px | marketing body, leads |
| text-xl | 25px | 23px | h3 / card titles |
| text-2xl | 31px | 28px | h2 mobile / h3 desktop |
| text-3xl | 39px | 33px | section headings (h2) |
| text-4xl | 49px | 40px | hero mobile |
| text-5xl+ | 61–76px+ | 48px+ | hero desktop display |

Responsive: use `clamp()` — e.g. hero `clamp(2.5rem, 5vw + 1rem, 4.5rem)`. Headings drop 1–2
scale steps on mobile; body never shrinks below 16px.

## Weights
- Load only what you use (2–3 weights: 400/500/600 or 400/600/700 — one bold weight, not two adjacent).
- Display type: 600–700. Ultra-large display (>60px) can drop to 500 — mass comes from size.
- UI labels/buttons: 500. Body: 400. Never 300 below 20px (contrast casualty).

## Pairing recipes
| Context | Display | Body | Character |
|---|---|---|---|
| SaaS / AI / dev tools | Inter, Geist, General Sans | same family | neutral, technical |
| Editorial / portfolio | Fraunces, Newsreader, Canela-class serif | Inter/Söhne-class sans | distinctive, warm |
| Fintech / enterprise | Neue Haas/Helvetica Now class | same | authoritative |
| Friendly consumer | Rounded grotesque (Nunito Sans class) sparingly | neutral sans | approachable |
| Data-heavy | any above + **tabular-nums mono for numbers** (JetBrains Mono, Geist Mono) | | precise |

## Type identity (the choice that decides whether the page has a voice)

The pairing table above lists *safe* families. Safe is why so much output looks alike: a
neutral grotesque at 600 weight is the visual equivalent of a system default, and
`ui-sans-serif, system-ui` is worse — it renders as a different font on every OS, so the
brand has no typographic identity at all. **A shipped page names its typefaces.**

Three decisions, in this order:

1. **Pick the display face for its opinion, not its neutrality.** The headline is 5–8 words
   at 48–80px; it is the only place on the page where a typeface can say anything. A
   high-contrast serif, a tight grotesque with real character, a variable face with an
   optical-size axis — the choice is the brand argument. Neutral is a valid answer only
   when neutrality *is* the positioning (infrastructure, enterprise, security).
2. **Pick the text face for reading, and let it disappear.** Different from the display
   face is normal and good; three families is not (`Principles` §1 counts display + text
   as the two).
3. **Give numbers their own treatment** — tabular mono or the text face's `tnum` — wherever
   figures carry meaning.

At display sizes, the face is not enough — the *optical settings* are the craft:

| Size band | Tracking | Weight | Optical size |
|---|---|---|---|
| 14–20px (UI, body) | 0 | 400–500 | `opsz` at the size |
| 24–40px (h3/h2) | −0.01em to −0.02em | 500–600 | `opsz` at the size |
| 48–80px (hero) | −0.025em to −0.04em | 500–700 (mass from size, not weight) | `opsz` high — display cuts have thinner hairlines and tighter joins |
| 100px+ (statement) | −0.04em to −0.05em | 400–500 | display cut mandatory; text cuts look muddy huge |

- **Variable fonts are the default in 2026.** One file, `font-variation-settings` for
  `wght`/`opsz`/`wdth`, and animatable axes — one `wght` transition is a whole signature
  vocabulary (`motion/arrival.md`, weight settle).
- **Self-host or preload.** `<link rel="preload" as="font" crossorigin>` + `font-display: swap`
  + a `size-adjust`/`ascent-override` metric-matched fallback. A hero that reflows on font
  swap fails CLS, which is an instant-fail in `brain/quality-bar.md`.
- **Two weights beat five.** Load 400 + 600, or a variable file's range — not eight statics.

## Craft details (the 95-point tier)
- `font-feature-settings`: enable `tnum` for tables/metrics; `ss01`+ where the family improves.
- Hanging punctuation feel: pull oversized quotes/bullets into the margin optically.
- Multi-line display headings: `text-wrap: balance`. Prose: `text-wrap: pretty` where supported.
- True apostrophes and quotes (’ “ ”) — straight quotes are an instant amateur tell.
- Numbers in metrics: tighter tracking, heavier weight than their labels; label in caps-xs-muted.
- Links in prose: underline (not color-only — a11y); UI links may use weight+color.
- `font-display: swap` + metric-compatible fallback (size-adjust) to kill CLS.

## Hierarchy pattern (marketing section)

```
EYEBROW    12–13px · caps · +0.08em · accent or muted · weight 600
Heading    39–49px · −0.02em · text-primary · weight 600–700 · max 2 lines
Lead       18–20px · 1.6 · text-secondary · max 65ch
Body       16–18px · 1.65 · text-secondary
```

The eyebrow-heading-lead triple solves 80% of section design. Don't fight it.

## Anti-patterns
- Three+ font families (including "just for the logo section")
- Headings at 1.5+ line-height (floating lines, no cohesion) or body at 1.3 (bricks)
- Center-aligned paragraphs longer than 2 lines
- ALL CAPS body text; caps anywhere without tracking added
- Font-size hierarchy with 2px steps (18/20/22/24…) — steps must be *visibly* different
- Faux bold/italic from missing weights
- Shipping `system-ui`/`ui-sans-serif` as the *brand* face — an unnamed typeface is an
  unowned identity, and it renders differently on every platform
- Display headlines set with body optical settings (0 tracking, text cut) — the "big body
  text" look that reads as a document, not a design

## Checklist
- [ ] Display face chosen for its opinion and named; not the system stack
- [ ] Display sizes carry negative tracking and a display/optical cut
- [ ] ≤2 families, ≤3 weights loaded, `font-display: swap`, metric-matched fallback
- [ ] All sizes from the scale; hero uses clamp()
- [ ] Body ≥16px, line-height 1.6–1.7, measure ≤75ch
- [ ] Display tracking negative; caps labels tracked +
- [ ] tabular-nums on data; balance on headings
- [ ] Mobile: headings step down, body doesn't
