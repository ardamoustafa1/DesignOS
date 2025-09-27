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

| Token | 1.25 scale | Use |
|---|---|---|
| text-xs | 12px | badges, legal, table meta |
| text-sm | 14px | UI labels, secondary text, dense app body |
| text-base | 16px | app body |
| text-lg | 18–20px | marketing body, leads |
| text-xl | 25px | h3 / card titles |
| text-2xl | 31px | h2 mobile / h3 desktop |
| text-3xl | 39px | section headings (h2) |
| text-4xl | 49px | hero mobile |
| text-5xl+ | 61–76px+ | hero desktop display |

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

## Checklist
- [ ] ≤2 families, ≤3 weights loaded, `font-display: swap`
- [ ] All sizes from the scale; hero uses clamp()
- [ ] Body ≥16px, line-height 1.6–1.7, measure ≤75ch
- [ ] Display tracking negative; caps labels tracked +
- [ ] tabular-nums on data; balance on headings
- [ ] Mobile: headings step down, body doesn't
