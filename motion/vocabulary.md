# Motion Vocabulary — Reverse Lookup

A brief rarely arrives as a rule ID. It arrives as "the bouncy thing" or "make it feel
alive when you scroll." This file is the bridge: plain-language description → the exact
term, and the file/section that governs it. Look here first when a request names a
*feeling* instead of a *technique* — then load the governing module before implementing,
never implement from this table alone.

Also usable directly: `node bin/designos.js find "<phrase>" --kind motion` runs the same
retrieval over `bin/library-data.js`'s tagged preset list; this file is the human-readable
index that explains *why* a phrase maps where it does, including the recipes and physics
primitives that aren't full signature-moment entries in that database.

| They say... | They mean | Governed by |
|---|---|---|
| "the bouncy thing" / "make it springy" | a spring easing curve, `--ease-spring` | `motion/principles.md` easing law 4 — one config, system-wide; banned in fintech/health/enterprise |
| "the decryption effect" / "characters scrambling into place" | text scramble | `motion/signature-moments.md` §2 |
| "the glow that follows your mouse" | cursor spotlight | `motion/signature-moments.md` §3 |
| "the card that leans toward the cursor" | 3D tilt | `motion/signature-moments.md` §4 |
| "words flying in one at a time" | split-text reveal | `motion/signature-moments.md` §5 |
| "the section that sticks while you scroll through steps" | scroll-driven storytelling / pinned scroll | `motion/signature-moments.md` §6 |
| "the numbers rolling like a slot machine" | odometer number morph | `motion/signature-moments.md` §7 |
| "stuff moving at different speeds as you move your mouse" | cursor parallax layers | `motion/signature-moments.md` §8 |
| "that grainy moving background" / "atmosphere" | noise canvas field | `motion/signature-moments.md` §9 |
| "one shape flowing into another" / "the button that becomes a panel" | liquid morph / shared-element view transition | `motion/signature-moments.md` §10 |
| "the button that wants to be pressed" | magnetic button | `motion/signature-moments.md` §1 |
| "make the menu pop out of the button" | dropdown/popover reveal, origin-honest transform-origin | `motion/recipes.md` §2 |
| "the modal shouldn't just appear out of nowhere" | modal + backdrop, never `scale(0)→scale(1)` | `motion/recipes.md` §3, `motion/principles.md` "nothing collapses to a point" |
| "the panel should slide in from the side" | drawer/sheet, edge-honest origin | `motion/recipes.md` §4 |
| "make the accordion expand smoothly" | `grid-template-rows` trick — the one licensed layout animation | `motion/recipes.md` §5 |
| "the shadow that appears on hover" | shadow crossfade via `::after`, never animate `box-shadow` directly | `motion/recipes.md` §6 |
| "the underline that grows in" | `scaleX` underline on a pseudo-element | `motion/recipes.md` §7 |
| "stuff fading in as you scroll down" | scroll entrance, `IntersectionObserver`, fire once | `motion/recipes.md` §8 |
| "the list items appearing one after another" | capped stagger, ≤6 steps / ≤500ms total | `motion/recipes.md` §9, `motion/principles.md` choreography |
| "the shimmering loading placeholder" | skeleton shimmer, paused off-screen | `motion/recipes.md` §10 |
| "the tooltip shouldn't flash on every pass" | 500ms hover-intent filter, instant exit | `motion/recipes.md` §11 |
| "reordering the list should animate, not jump" | FLIP (measure → mutate → invert → play) | `motion/recipes.md` §13 |
| "swipe to dismiss like a native app" | drag-dismiss, velocity-or-distance threshold | `motion/physics.md` "Dismissal" |
| "it should keep going the way I was swiping" | momentum projection | `motion/physics.md` "Momentum" |
| "it fights back a little at the edge instead of just stopping" | rubber-banding | `motion/physics.md` "Rubber-banding" |
| "it should follow my finger exactly, no lag" | 1:1 gesture tracking, no transition during drag | `motion/physics.md` "Tracking" — the failure mode is `motion-uninterruptible-transition` (`validators/check-motion.js`) |
| "I should be able to grab it mid-animation" | interruptibility / velocity inheritance | `motion/physics.md` "Velocity inheritance" |
| "it shouldn't feel robotic when it bounces" | damping ratio / bounce, not raw stiffness/damping | `motion/physics.md` "The two-parameter spring" |
| "it slows down like it's really being thrown" | exit velocity → spring handoff | `motion/physics.md` "Velocity inheritance" |
| "one big unforgettable moment" | hero-scale signature moment (max one, occasionally two) | `motion/signature-moments.md` "The scarcity law", `brain/wow-calibration.md` |
| "how bold can we go with this" | the courage ladder, 1–10, sector-capped | `brain/wow-calibration.md` §2 |
| "don't overdo the animation" | the two-signature scarcity law | `motion/signature-moments.md` "The scarcity law" |
| "it should feel calmer for people who get motion-sick" | `prefers-reduced-motion`, movement collapses not content | `motion/principles.md`, `motion/recipes.md` §16 |
| "the page shouldn't jump around while it loads" | CLS discipline — reserve space before animating in | `motion/recipes.md` §5 note, `checklists/performance.md` |
| "don't let it hijack my scroll wheel" | scroll-jacking ban | `motion/page-and-scroll.md`; enforced as `motion-scroll-jacking` |
| "it keeps running even when I've scrolled away" | off-screen/hidden-tab pause | `motion/performance.md`; enforced as `motion-infinite-unpaused` / `motion-no-visibility-pause` |
| "why does the sidebar animation feel slow/laggy" | `transition: all` or a non-compositor property (`width`, `top`, `margin`) | `motion/performance.md` compositor rule; enforced as `motion-transition-all` / `motion-noncomposited` |
| "keyboard shortcuts shouldn't have a fade-in" | frequency discount — high-frequency UI gets zero or near-zero motion | `motion/principles.md` duration law 4, `motion/decision-engine.md` |

## Using this table

1. Find the row closest to the request's plain-language phrasing.
2. Load the module in the **Governed by** column before writing anything — this table
   names the term, it does not replace the rule.
3. If nothing fits, the request may be naming a technique DesignOS doesn't license (ask
   `brain/wow-calibration.md`'s decision tree) rather than one this table missed — check
   there before improvising a new effect.
