# Motion Physics — Gestures, Springs, and Momentum

Everything in `principles.md` describes motion the interface *starts*. This file covers
motion the **user** starts — where the surface is under a finger and every frame is judged
against the physical world the hand already knows.

The distinction matters because a duration-and-easing system cannot answer the questions a
drag asks. "How long should this take?" has no answer when the user is still holding it.
The answer is a **velocity**, and velocity needs numbers.

`native/motion-gestures.md` covers the platform-specific side (iOS/Android conventions,
haptics). This file is the cross-platform mechanics — the same maths runs on the web.

## The two-parameter spring

Stiffness/damping/mass is a physics API, not a design one. Nobody can predict what
`stiffness: 180, damping: 22, mass: 1.2` feels like, so teams tune by flailing.

Describe a spring with two numbers a human can reason about instead:

| Parameter | Question it answers | Useful range |
|---|---|---|
| **duration** (response) | how long until it has essentially arrived | 0.3–0.6s for UI |
| **bounce** (damping ratio) | does it overshoot, and how much | 0 = none, 0.1–0.3 = alive, >0.4 = toy |

```js
// Framer Motion / `motion` — the readable form
{ type: 'spring', duration: 0.5, bounce: 0.2 }

// The same spring in the physics form, if your library demands it:
// bounce 0   → damping ratio 1.0 (critically damped — fastest arrival, zero overshoot)
// bounce 0.2 → damping ratio 0.8
// bounce 0.4 → damping ratio 0.6 (visibly springy; reserve for delight moments)
```

**Damping ratio 1.0 is the workhorse.** It is the fastest possible arrival with no
overshoot, and it is what most "snappy" interfaces are actually using. Bounce is a brand
decision, governed by `principles.md` easing law 4: one config system-wide, and none at all
in fintech, health, or enterprise dashboards.

Converting between the models, when a library gives you no choice:

```
ζ (damping ratio) = 1 − bounce
ω (natural freq)  = 2π / duration
stiffness = ω² × mass
damping   = 2 × ζ × ω × mass
```

## Tracking: the surface must be under the finger

While a gesture is active, there is no animation — there is **1:1 correspondence**. The
element's transform is a pure function of pointer position. Any easing, any transition, any
`requestAnimationFrame` smoothing inserts lag between the finger and the pixels, and the
hand notices ~16ms of it.

```js
let startX = 0;
let startT = 0;
let lastX  = 0;
let lastT  = 0;
let v      = 0;   // px/ms, signed

sheet.addEventListener('pointerdown', (e) => {
  sheet.setPointerCapture(e.pointerId);
  sheet.style.transition = 'none';        // kill the transition FOR the drag
  startX = lastX = e.clientX;
  startT = lastT = e.timeStamp;
  v = 0;
});

sheet.addEventListener('pointermove', (e) => {
  if (!sheet.hasPointerCapture(e.pointerId)) return;
  const dx = e.clientX - startX;
  sheet.style.transform = `translateX(${resist(dx)}px)`;

  // Exponential moving average: a single-frame delta is noise, a full-gesture
  // average is stale. 0.7/0.3 keeps it responsive without jitter.
  const dt = Math.max(1, e.timeStamp - lastT);
  v = 0.7 * ((e.clientX - lastX) / dt) + 0.3 * v;
  lastX = e.clientX;
  lastT = e.timeStamp;
});
```

## Rubber-banding: resistance past the edge

When a drag goes somewhere it cannot go, it must not stop dead (feels broken) and must not
follow freely (feels unbounded). It follows with increasing resistance:

```js
/**
 * @param {number} overshoot  how far past the boundary the finger has travelled
 * @param {number} dimension  the size of the axis being dragged
 * @param {number} c          resistance constant; 0.55 matches the platform feel
 */
function rubberBand(overshoot, dimension, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
```

The output asymptotically approaches `dimension * c`, so the surface can never be dragged
off into nothing. Drag 100px past the edge of a 400px sheet and it moves ~48px; drag 400px
and it moves ~118px. The resistance itself communicates the boundary — no bounce animation,
no error state, no copy required.

## Momentum: where the throw was going

On release, the element must continue to where the gesture was *heading*, not stop where
the finger happened to lift. Project the resting point from the exit velocity:

```js
/**
 * @param {number} velocity      px/ms at release
 * @param {number} deceleration  0.998 normal, 0.99 fast — the platform scroll constant
 * @returns {number} additional distance the throw would travel
 */
function project(velocity, deceleration = 0.998) {
  return (velocity / 1000) * deceleration / (1 - deceleration);
}
```

That constant is doing real work: at `deceleration = 0.998` the multiplier is ~499, so a
velocity of 1 px/ms projects ~500px of travel. Use the projected point to decide the
outcome, then spring to the snapped position — do not animate to the raw projection, or
items land between rows.

```js
const projected = lastX + project(v);
const target    = snapPoints.reduce((best, p) =>
  Math.abs(p - projected) < Math.abs(best - projected) ? p : best);
```

## Dismissal: distance OR velocity, never distance alone

A distance-only threshold punishes the fast, confident flick — the gesture users make when
they are most certain. Either condition alone should dismiss:

| Signal | Threshold | Why |
|---|---|---|
| **Velocity** | `|v| > 0.11 px/ms` | a deliberate flick, regardless of distance travelled |
| **Distance** | `> 50%` of the axis | a slow, considered drag past the halfway point |
| **Direction** | must match the dismiss axis | a sideways wander is not a dismissal |

```js
sheet.addEventListener('pointerup', (e) => {
  const dx = e.clientX - startX;
  const flicked  = Math.abs(v) > 0.11 && Math.sign(v) === Math.sign(dx);
  const dragged  = Math.abs(dx) > sheet.offsetWidth * 0.5;

  sheet.style.transition = 'transform var(--duration-slow) var(--ease-out)';
  sheet.style.transform  = (flicked || dragged) ? 'translateX(100%)' : 'none';
});
```

0.11 px/ms is 110 px/s — comfortably above an accidental drift, comfortably below a real
flick. Tune it per surface if you must, but tune it *once* and record it in
`memory/design.md`; two different dismissal feels in one product is the tell of two
different authors.

## Velocity inheritance

When a gesture hands off to an animation, the animation starts at the gesture's velocity.
A spring that begins at zero after a fast throw reads as a stutter — the object stopped and
then decided to move again.

```js
sheet.animate(
  [{ transform: `translateX(${current}px)` }, { transform: 'translateX(0)' }],
  { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
);
// Libraries with real springs take this directly:
// animate(x, 0, { type: 'spring', velocity: v * 1000, duration: 0.5, bounce: 0.15 })
```

Interruptibility is the other half: a gesture that starts mid-animation must take over from
the current position and velocity, never snap back to the animation's start. If your
implementation cannot be interrupted, it is a cutscene, not an interaction.

## Reduced motion applies here too

Gesture *tracking* is not decorative motion — a drag that does not follow the finger is
broken, not calm, so 1:1 tracking stays. What changes on release:

| Full motion | Reduced |
|---|---|
| Spring settle with bounce | critically damped, or an instant snap |
| Momentum projection | snap to the nearest point immediately |
| Rubber-band overshoot | hard stop at the boundary |
| Velocity-inherited handoff | direct state change |

Always provide a non-gesture path to the same outcome. A swipe-to-dismiss with no visible
close button is unreachable by keyboard, by switch control, and by anyone whose motor
control does not produce a clean 110 px/s flick.

## Anti-patterns

- Easing or transitions applied *during* a drag — the surface lags the finger and the
  illusion of direct manipulation dies.
- Distance-only dismissal thresholds, which fail exactly the users who were most decisive.
- Computing velocity from the last single frame (noise) or the whole gesture (stale).
- Springs with `bounce > 0.4` on anything a user touches more than once a day; playfulness
  amortized over a hundred repetitions becomes friction.
- Animating to the raw projected point instead of snapping to a real position.
- Gestures with no keyboard or button equivalent.
- Hard-coding these constants per component instead of once in the motion layer.

## Checklist

- [ ] The dragged surface tracks the pointer 1:1 with no transition active
- [ ] Out-of-bounds drag is rubber-banded, not free and not frozen
- [ ] Release decides via velocity **or** distance, and the direction is checked
- [ ] Momentum projects to a snap point, not to the raw projection
- [ ] The release animation inherits the gesture's exit velocity
- [ ] Any in-flight animation can be grabbed and redirected
- [ ] One spring config for the product, recorded in `memory/design.md`
- [ ] Reduced motion collapses settle/momentum but keeps tracking
- [ ] Every gesture has a keyboard-reachable equivalent
