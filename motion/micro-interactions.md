# Micro-interactions

The 100–200ms layer where products earn the word "polished". Each micro-interaction is a
tiny conversation: user acts → interface acknowledges → state is clear.

## The grammar
Every micro-interaction has four beats:
**trigger** (user/system act) → **feedback** (instant, ≤100ms start) → **state change** (the actual result) → **settle** (rest state, no residual motion).
If any beat is missing the interaction feels broken; if any beat is long it feels sluggish.

## Canonical specs

### Buttons (`components/buttons.md`)
- Hover: bg shift + optional −1px translate-y, 120ms ease-out · Press: return + scale(0.99) — the mechanical click feel · Release into loading: spinner in, width locked.

### Inputs
- Focus: border→2px ring transition 120ms (ring fades in, doesn't pop).
- Validation flip: error shake is allowed ONCE per submit — 3 small oscillations, 250ms total, ±4px, reduced-motion→none. Checkmark on newly-valid: 200ms scale-in.
- Character counters: color-warm as limit approaches (no pulsing).

### Toggles & checkboxes
- Toggle knob: 150ms ease-out slide + track color crossfade; the state must be legible *mid-animation*.
- Checkbox: SVG check stroke-draw 150ms; group select-all cascades with 20ms stagger (cap 10).

### Selection & lists
- Row/card selection: background tint 100ms + control appearance; deselection instant-feel (100ms).
- Reorder (drag): lifted item scales 1.02 + shadow tier-up + others FLIP around it 200ms; drop settles 150ms.
- Item removal: collapse height (grid-rows trick) + fade 200ms, siblings close ranks smoothly — never blink-out leaving a hole.

### Dropdowns, tooltips, popovers
- Dropdown: 150ms fade + 4px translate from trigger; Esc/blur exits at 100ms.
- Tooltip: 500ms hover *delay* (intent filter), then 100ms fade-in; instant between adjacent tooltips (warm state); never animate position.

### Data & numbers
- Value changes: count-up/down 300–400ms ease-out for milestone reveals; live-updating metrics just crossfade (counting constantly = casino).
- Changed-cell highlight: background pulse 1×, 400ms fade-out (`psychology/attention.md` change blindness).
- Chart updates: morph 250ms ease-in-out; entering series fade in; never re-run entrance choreography on data refresh.

### Feedback moments
- Copy-to-clipboard: icon swap (copy→check) 150ms + revert after 1.5s — the canonical acknowledgment pattern.
- Like/save/star: one spring pop (scale 1→1.2→1) 250ms — the licensed delight exception, even in serious products.
- Save states: "Saving…" → "Saved ✓" inline crossfade; the checkmark may draw (150ms).

### Skeletons & loading (`components/states.md`)
- Shimmer 1.2–1.5s linear; content swap = plain 150ms fade at matched layout (zero shift).

## Hover philosophy
- Hover is *preview*, not content: it may emphasize, reveal affordances (row actions), or hint (image zoom 1.03) — it must never be the only path to information or actions (touch exists; `components/cards.md`).
- Hover-in 100–120ms, hover-out slightly faster; no hover effects that shift layout.

## Cursor & pointer craft
- `cursor: pointer` on all interactive elements (and *only* interactive — pointer on a plain card that does nothing is a lie).
- Custom cursors: creative-portfolio license only; never in products.
- Drag affordances: `grab`/`grabbing` + visible handle.

## Sound
- Default: none. Web products are silent. (Exceptions: explicit media, games, opt-in notification sounds — always with user control.)

## Anti-patterns
- Hover effects >150ms (the UI feels like it's underwater)
- Everything pulsing/breathing "for life" — rest state means REST
- Ripple effects on non-Material products (borrowed identity)
- Shake on every keystroke error (assault); shake once on submit
- Micro-interactions that block input (animation-gated clicking)
- Re-triggering entrance animations on every hover/scroll pass

## Checklist
- [ ] Four beats present; feedback starts ≤100ms
- [ ] All specs from motion tokens; hovers ≤150ms
- [ ] Nothing moves at rest; nothing blocks input
- [ ] Hover = enhancement only; touch parity verified
- [ ] Delight moments rationed (1–2 per product) and reduced-motion safe
