# ⬡ DesignOS — The One-Page Cheatsheet

The whole system, compressed for the wall. Numbers are laws; files are where the law lives.

## The numbers that decide everything
```
TYPE      base 16px · ratio 1.25 (marketing) / 1.2 (apps) · body 1.6–1.7 lh · 60–75ch
          display tracking −0.02→−0.04em · caps labels +0.08em · ≤2 families ≤3 weights
SPACE     4px grid: 4 8 12 16 24 32 48 64 96 128 · groups ≥2× intra-group
          sections 96→128px (mobile ~60–75% of desktop)
COLOR     60/30/10 · one accent owns interactivity · never #000/#FFF text
          AA: 4.5:1 body · 3:1 large/UI · dark accents −10–15% saturation
RADIUS    6 · 10 · 16 · pill — one language per product · nested: outer = inner + gap
MOTION    100/150/200/300/500ms · ease-out default · exits < entrances
          interactive ≤300ms · stagger ≤60ms × ≤6 · transform/opacity ONLY
TARGETS   44×44px touch · 48px inputs · 40–48px buttons · 44–48px table rows
PERF      LCP <2.0s · CLS <0.1 · INP <200ms · Lighthouse ≥95 · page ≤1.5MB
SCORE     7 dimensions · threshold 95 · AA failure caps at 60 · max 3 loop cycles
```

## The one-of-each laws
One primary CTA per view · one accent hue for interaction · one gradient moment per
page · one signature moment per page · one motion character per product · one icon set,
one radius language, one shadow system · one term per concept · 1–2 brand signatures, total.

## The always-list
Every interactive element: hover + active + focus-visible + disabled (+ loading) ·
every data surface: loading + empty×3 + partial + error + success · every image:
dimensions + alt · every form field: visible label + justified existence · every number:
tabular-nums + unit + comparison · both themes deliberate or one declared · reduced
motion respected · keyboard path complete · work preserved through every failure.

## The never-list
Fake urgency/testimonials/counts · placeholder in production · color-only meaning ·
`outline: none` bare · scroll hijack · pie >3 slices · gauges · confirm-shaming ·
pre-checked consent · fee ambush · emoji icons · PDF menus · `<div onclick>` ·
carousel heroes · modal-on-modal · animating layout properties · 3D charts. Ever.

## The eye path (before any pixels)
1st fixation → 2nd → 3rd → action — one visual instrument each (motion > faces > size
contrast > color contrast > isolation > position). Squint test: structure survives blur.
Headlines alone must carry the whole argument.

## The loop (nothing ships without it)
```
RESEARCH → WIREFRAME → UI → REVIEW → A11Y → PERF → SEO → REFACTOR → SCORE
                                                            <95 → back (max 3×)
```

## The landing-page spine
nav → hero (claim + proof cue) → logos → mechanism ×3 → deep proof → pricing/CTA →
FAQ (real objections) → final CTA band → footer-as-sitemap. CTA cadence: hero, mid, end.

## The conflict order
user's explicit word > project memory > industry file > component file > foundation >
your judgment — overrides recorded with reasons, always.

## The ten questions (before finalizing)
Eye lands right? CTA unmistakable in 3s? Whitespace breathes? Hierarchy survives squint?
How would Apple cut it? Stripe trust it? Linear time it? Holds at 375px? Lighthouse 95+?
Keyboard-only completes everything?

## Commands
```
npx github:ardamoustafa1/DesignOS init --agents --skills   install everything (first time only)
node DesignOS/bin/designos.js doctor                        health check
node DesignOS/bin/designos.js export all                    rules for Cursor/Copilot/Windsurf/Cline/Aider/AGENTS.md
/design-brief · /design-review · /design-score · /design-tokens
```
⚠️ Never bare `npx designos …` — that name is taken by an unrelated npm package.
