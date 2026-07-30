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

## Sound & haptics

**Default: silent, and no vibration.** Web products are silent, and this is right almost
always — an unrequested sound in an open-plan office or a quiet room is not delight, it is
an intrusion the user cannot undo. But "never" and "here is how to do it correctly" are
different instructions, and the top tier of launch and consumer work does use this layer.

### The four gates

Sound or haptics may exist only when **all four** hold:

1. **User-initiated.** It answers an action the user just took. Nothing the system decides
   to do on its own makes a noise — that is a notification, and notifications are opt-in.
2. **Off by default, with a visible control.** A toggle the user can find without hunting,
   its state persisted. `prefers-reduced-motion: reduce` also silences the layer: the same
   people frequently want both.
3. **Redundant.** The sound or buzz *confirms* something already visible. It is never the
   only channel — deaf users, muted phones, and desktop browsers with no vibration API all
   have to get the same information.
4. **Licensed by the sector.** Consumer, gaming, media, and creative tools may. Fintech,
   health, legal, enterprise dashboards, and anything used all day may not
   (`industries/`). Frequency is the real test: a sound heard 200 times a day is a
   grievance, however lovely it was the first time.

### Sound craft, when it is earned

- **Under 100ms, under −20dBFS.** A UI sound is a *texture*, not a note. If a listener can
  hum it back, it is too long and too loud.
- **One family.** Sounds from one instrument or one synthesis source, differing by pitch
  and length, not by character. Three unrelated stock sounds is the audio equivalent of
  three unrelated fonts.
- **Pitch carries meaning:** upward interval = success/forward, downward = dismissal/back,
  flat click = acknowledgement, dissonant = error. Never a "buzzer" — the error sound
  should be the *quietest* thing in the set, because errors already have the user's
  attention.
- **Debounce.** Rapid repeats (a key held, a list scrubbing) collapse to a single event or
  drop the sound entirely. Machine-gun UI audio is the fastest route to a permanent mute.
- **Preload and decode once.** Use `AudioContext` with a decoded buffer, not `new Audio()`
  per event, or the first play arrives late and the feedback lands after the visual.

```js
// One context, one decoded buffer, gated behind an explicit user preference.
const enabled = () => prefs.sound && !matchMedia('(prefers-reduced-motion: reduce)').matches;
let ctx, buf;
async function prime() {                        // call from the first real user gesture —
  ctx = ctx || new AudioContext();              // browsers refuse to start audio otherwise
  if (!buf) buf = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());
}
function tick(gain = 0.08) {                    // ~ -22dBFS
  if (!enabled() || !ctx || !buf) return;
  const src = ctx.createBufferSource(); const g = ctx.createGain();
  src.buffer = buf; g.gain.value = gain;
  src.connect(g).connect(ctx.destination); src.start();
}
```

### Haptics (mobile web and native)

- **Web:** `navigator.vibrate()` is the only primitive, it is coarse, iOS Safari does not
  support it, and it is silently ignored without a user gesture. Treat it as a bonus that
  usually does not fire — never build meaning on top of it.
- **Native:** the vocabulary is real and should be used properly —
  `selection` for a picker crossing a detent, `impact(light|medium|heavy)` for a landing or
  a snap, `notification(success|warning|error)` for an outcome. Full platform tables in
  `native/motion-gestures.md`.
- **Pair haptics with the frame the event happens on**, not with the start of an animation.
  A buzz that arrives 200ms before the visual snap reads as a fault in the device.
- **One per gesture.** A drag that ticks at every detent is a broken toy; tick at the
  detent the user lands on.

### Anti-patterns

- Sound on page load, on scroll, or on hover. All three are the interface talking without
  being spoken to.
- A "delightful" success chime on an action performed dozens of times a day.
- Vibration used as the only error signal — it is invisible, inaudible, and frequently
  disabled at the OS level.
- Audio feedback with no visible control, or a control buried in a settings sub-page.
- Sounds that duck or interrupt the user's own media playback.

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
