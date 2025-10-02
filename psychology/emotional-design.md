# Emotional Design

Users don't remember interfaces; they remember how interfaces made them feel. Emotion is
not decoration ON the design — it's an output OF the design, produced whether you engineer
it or not. Unengineered, the default output is mild anxiety.

## The three levels (Norman's model, operationalized)
| Level | Fires | You control it via |
|---|---|---|
| **Visceral** | first 50ms — pretty/ugly, safe/sketchy | color temperature, whitespace, type quality, imagery (`brain/quality-bar.md` squint tier) |
| **Behavioral** | during use — capable/frustrated | speed, feedback, forgiveness, flow (`components/` + `motion/`) |
| **Reflective** | after — "I'm someone who uses this" | brand meaning, identity signals, story (`memory/brand.md` voice) |

Most teams over-invest visceral (the pretty hero) and starve behavioral (the flow) —
but behavioral emotion decides retention. A gorgeous product that loses your work is
hated; a plain one that never does is loved.

## Designing the emotional arc (per flow, explicitly)
Map the user's emotional line through each key flow (`memory/pages.md` flows get an
emotion annotation): where does anxiety peak (payment, permissions, destructive actions),
where is boredom likely (long forms, waits), where should pride land (completion, creation)?
Then place interventions:
- **Anxiety peaks** → calm design: fewer elements, reassurance microcopy, reversibility
  (`psychology/trust.md` micro-trust).
- **Boredom valleys** → momentum: progress, chunking, optimistic UI
  (`psychology/cognition.md` goal-gradient).
- **Pride moments** → ceremony, rationed (`components/states.md` milestone success;
  peak-end rule says ONE engineered peak beats five confetti showers).

## Personality (the voice made visible)
Personality = consistent small choices, not mascots: the 404 copy, the empty-state
illustration, the loading message, the button verbs. Rules:
- Personality lives in LOW-STAKES surfaces only (empty states, onboarding, success).
  Errors, money, security, deletion: personality OFF, plain voice ON
  (`agents/copywriter.md` register shifts). A joke on a failed payment costs more than
  a thousand delights earned.
- Intensity is a brand dial (`memory/brand.md`): Linear ≈ 5% personality, Notion ≈ 20%,
  Duolingo ≈ 60%. Pick the number, apply everywhere — oscillation reads as unstable.
- Sector gates it (`industries/`): healthcare/fintech cap it low; gaming/consumer open it up.

## Delight economics
Delight = expectation exceeded, slightly, at the right moment. It's a depleting currency:
- The 1st confetti is a smile, the 5th is noise, the 20th is contempt. Ration per
  `components/states.md`: milestones only.
- The strongest delights aren't animations — they're *anticipations*: the form remembering
  where you left off, the smart default that was exactly right, the error that already
  knows the fix. Invisible delight compounds; visible delight decays.
- Never delight where the user is in pain (celebration UI during an outage, upsell balloons
  on a failed export).

## Emotional failure modes (audit for these)
- **Guilt UI:** confirm-shaming, streak-shaming, "your team is waiting for you" —
  manipulation that converts once and churns forever (`psychology/persuasion.md` dark
  patterns).
- **Anxiety leakage:** ALL-CAPS warnings, ambient red, countdowns on non-urgent things —
  the interface's stress becomes the user's (`psychology/color-psychology.md` thermostat).
- **Condescension:** over-explaining to experts, exclamation-mark inflation, "Oops!"-ing
  serious failures.
- **Coldness:** technically-perfect-emotionally-vacant — no acknowledgment at completion,
  no humanity anywhere. The fix is tiny: one warm sentence at the right moments.

## Measuring it
Emotion shows up in behavior: rage clicks, instant bounces after errors, support-ticket
tone, cancellation-survey words ("frustrating" vs "didn't need it"). The review loop's
health checks (`loops/review-loop.md`) should read support/cancellation language quarterly —
it's the emotional telemetry you already have.

## Checklist
- [ ] All three levels addressed; behavioral prioritized over visceral
- [ ] Key flows annotated with emotional arcs; interventions placed at peaks/valleys
- [ ] Personality dial set in brand.md, applied only on low-stakes surfaces
- [ ] Delight rationed to milestones; anticipatory delight preferred
- [ ] Failure-mode sweep: no guilt, leakage, condescension, or vacancy
