# Design Tokens — The Value Architecture

Tokens are decisions frozen into variables. Every foundation module produces them; this
module defines how they're **named, layered, themed, and governed** so the system survives
its own growth (`loops/refactor-loop.md` exists because ungoverned values breed).

## The three-tier architecture
```
TIER 1  PRIMITIVE   raw values, no meaning:        --blue-600, --gray-100, --size-4
TIER 2  SEMANTIC    meaning, no location:          --accent, --bg-surface, --text-muted,
                                                   --duration-fast, --radius-md
TIER 3  COMPONENT   location-specific (sparingly): --button-height-lg, --card-padding
```
- **Components consume Tier 2** (occasionally 3, never 1). A component referencing
  `--blue-600` has hardcoded a decision that theming must later hunt down.
- Tier 2 is the THEME CONTRACT: dark mode, white-label, and brand changes swap Tier 2
  values only (`starter/tokens.css` is a Tier 2 reference implementation).
- Tier 3 exists only where a component's value genuinely decouples from the semantic layer
  (rare) — default to none; every Tier 3 token is maintenance surface.

## Naming grammar (predictability > brevity)
```
--{category}-{concept}-{variant?}-{state?}
   bg-surface-raised        text-muted          border-focus
   accent / accent-hover    space-6             duration-fast
```
- Categories fixed: `bg` `text` `border` `accent` + semantics (`success`…) · `space`
  `radius` `shadow` `duration` `ease` · `text-{size}` `font` `container`.
- States as suffixes (`-hover`, `-subtle`), never prefixes; numbers only in primitives
  and scales (`space-6`), never in semantics (`--gray-ish-2` is a system dying).
- One glossary, recorded in `memory/design.md` — synonyms (`surface` vs `panel` vs `card`
  for the same concept) are drift seeds.

## Theming mechanics
```css
:root { /* Tier 2 defaults (light) */ }
@media (prefers-color-scheme: dark) { :root { /* dark values */ } }
:root[data-theme="dark"]  { /* explicit override — user toggle wins over OS */ }
:root[data-theme="light"] { /* both directions, always */ }
```
- The toggle stamps `data-theme`; it must win in BOTH directions over the media query
  (`foundations/colors.md` dark construction supplies the values).
- Brand theming (white-label): a brand = one Tier 2 override file; if a rebrand requires
  touching components, the tier discipline failed — that's the test.
- Density theming (`components/dashboard.md` comfortable/compact): spacing/height tokens
  swap via `data-density` — same mechanics, same discipline.

## Scale governance (how tokens grow without rotting)
- **Adding a token needs a reason two existing tokens can't serve.** The request "we need
  a gap between space-4 and space-6" is usually a design error upstream, occasionally a
  real gap — creative-director arbitrates, decision recorded with reasoning
  (`memory/design.md` overrides table).
- Deprecation over deletion: alias the old name to the new value for one cycle
  (`--brand-blue: var(--accent)`), grep consumers, then remove — silent deletion breaks
  quietly.
- The drift metric (`loops/refactor-loop.md`): raw values outside token files, counted
  per audit. Target: zero; trend: the health indicator.

## Cross-platform notes
Tokens outlive CSS: the same Tier 2 contract exports to native (iOS/Android), email
(`patterns/email-templates.md` inline constraints), and design tools. Keep the source of
truth in ONE place (the token file; W3C Design Tokens JSON format when tooling justifies
it) — parallel hand-maintained copies always diverge.

## Anti-patterns
- Component styles referencing primitives (`color: var(--gray-700)` inside a card)
- Semantic tokens named by appearance (`--light-gray-bg` — what happens in dark mode?
  `--bg-surface` survives; appearance-names lie under theming)
- Token explosion (three teams, three spacing scales — one system or none)
- The "misc" section in a token file (entropy's front door)
- Values in JS/inline styles bypassing the system (grep for `style=` in refactor audits)

## Checklist
- [ ] Three tiers respected; components consume semantic only
- [ ] Naming grammar + glossary consistent; recorded in memory/design.md
- [ ] Both themes via data-theme overriding media query, both directions
- [ ] New tokens gated by reasoning; deprecations aliased then removed
- [ ] One source of truth; drift metric at zero in audits
