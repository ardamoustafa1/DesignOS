# Design Intelligence — How to Think

This is the cognitive core. Read it before every design task. It replaces the default
"generate plausible UI" reflex with a designer's reasoning sequence.

## The reasoning sequence

Run these in order. Each stage's output constrains the next.

### 1. Intent — *what must this screen cause?*
Every screen exists to cause one behavior: sign up, trust us, find the number, complete the task.
Name it in one sentence. If you can't, you don't understand the brief yet — ask or infer from
`memory/client.md`. Everything on the screen either serves this behavior or competes with it.

### 2. Audience — *who is looking, and in what state?*
A CFO scanning at 11pm reads differently from a developer evaluating tooling.
Determine: expertise level, emotional state (anxious? curious? impatient?), device likelihood,
and what they've already seen before arriving. This decides density, tone, and proof requirements.

### 3. Hierarchy — *in what order should attention move?*
Decide the eye path **before** any visual work: 1st fixation → 2nd → 3rd → action.
Then assign each step exactly one visual instrument (size, weight, color, position, isolation).
If two elements compete for the same fixation, one of them is wrong.

### 4. Structure — *what layout expresses that hierarchy?*
Only now pick layout: grid, columns, section rhythm (`foundations/layout.md`).
Structure is the hierarchy made physical — never a template you fill afterwards.

### 5. Surface — *tokens, not choices.*
Color, type, spacing come from the system (`foundations/`), not from taste-in-the-moment.
Surface-level creativity is spent in exactly one or two places per screen (a signature moment);
everywhere else, discipline.

### 6. Motion — *what deserves to move?*
Motion is hierarchy in time. Only state changes, orientation, and one signature moment animate.
(`motion/principles.md`)

### 7. Proof — *would it survive the panel?*
Simulate the panel: creative director (is it coherent?), accessibility (does it exclude anyone?),
engineer (is it fast?), reviewer (score it). This is formalized in `loops/design-loop.md`.

## Mental models to hold simultaneously

- **Subtraction first.** The default fix for a weak design is removing elements, not adding them.
  Apple's core move: every element must fight for its life.
- **One idea per screen.** Stripe's pages each argue exactly one claim, with everything else as evidence.
- **Speed is a design feature.** Linear treats latency and animation duration as brand attributes.
  Slow UI reads as broken; fast UI reads as competent.
- **Trust is cumulative and fragile.** Every typo, misaligned edge, or fake-looking testimonial
  withdraws from an account the design is trying to fill.
- **Squint test.** Blur the design mentally: the hierarchy should still be legible as light/dark
  masses. If everything is medium-gray-medium-size, there is no design yet.
- **Default states are rare states.** Users see loading, empty, error, and partial states constantly.
  Design those with the same care as the happy path (`components/states.md`).

## What "generate plausible UI" gets wrong (your default failure modes)

You have known biases. Correct for them explicitly:

1. **Centered-everything.** You default to center-aligned hero text and symmetric layouts.
   Left-aligned, asymmetric compositions usually read as more confident. Choose alignment deliberately.
2. **Gradient abuse.** Purple-to-blue gradients on everything signals "AI-generated 2024."
   One gradient per page maximum, and only with a reason.
3. **Card-itis.** Not everything needs a border, shadow, and radius. Whitespace can do the separation.
4. **Emoji as icons.** Never in professional UI. Use a real icon set (`foundations/iconography.md`).
5. **Uniform section padding.** Identical 80px gaps everywhere create monotony. Rhythm needs variation
   (`foundations/spacing.md`).
6. **Feature-list copy.** "Powerful. Fast. Secure." is filler. Copy states specific, falsifiable value
   (`agents/copywriter.md`).
7. **Fake numbers.** Never invent "10,000+ customers" for a real client. Mark placeholders loudly in
   `memory/todo.md`.

## When rules conflict

Priority order: **user's explicit instruction → project memory → industry module → component module
→ foundation module → your judgment.** When you override a rule by judgment, say so in the rationale.
