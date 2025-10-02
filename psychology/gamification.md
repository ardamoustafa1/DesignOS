# Gamification — Motivation Mechanics, Ethically

Gamification is applied motivation psychology. Done honestly it makes progress visible
and effort rewarding; done cynically it's a slot machine wearing a productivity costume.
DesignOS rule: **mechanics may amplify motivation that exists; they may not manufacture
compulsion.**

## When gamification fits (gate it first)
- **Yes:** learning (`industries/education.md`), fitness/habits, skill-building, community
  contribution (Stack Overflow-class), long-horizon goals needing near-term feedback.
- **Carefully:** developer tools (subtle: streaks of deploys, contribution graphs),
  team products (leaderboards create losers — see below).
- **No:** finance (gamified trading is regulatorily radioactive —
  `industries/fintech.md`), health decisions, anything where "more engagement" ≠ user
  benefit. If the user's goal is to LEAVE quickly (utilities), gamification is friction.

## The mechanics toolbox (each with its physics)

### Progress & completion (the safest, strongest tier)
Progress bars, checklists, profile-completeness, levels-as-milestones. Works via
goal-gradient + the Zeigarnik itch of the incomplete (`psychology/cognition.md`).
Honest rules: progress = real value delivered (not "watched the promo video"), pre-seed
the start, never reset without cause.

### Streaks
The habit engine (`psychology/habit-retention.md`) — and the guilt engine. Rules:
- **Mercy mechanics required:** freezes, repair windows, vacation modes
  (`industries/education.md`). A streak that dies to one sick day converts motivation
  into resentment + churn.
- Streaks measure showing up, so make showing up = real value (a 200-day streak of
  hollow check-ins teaches the product is hollow).
- Never streak-shame in notifications ("Don't lose your streak!" at 11pm is guilt UI —
  `psychology/emotional-design.md`).

### Badges & achievements
Work when they mark GENUINE accomplishment tiers or surprise discovery (hidden
achievements for power behaviors); fail as confetti-stickers for breathing. Cap the
catalog (30 meaningful > 300 noise), design them as artifacts worth the profile space
(`components/badges-chips.md` craft applies).

### Points & currencies
Only when spendable on something real (features, cosmetics, donations) — points that buy
nothing are a number going up, and users smell it. Exchange rates stable; earned ≠
purchasable mixing destroys meaning (pay-to-win taints the earned tier).

### Leaderboards
The sharpest double-edge: motivating for the top 10%, demoralizing for the rest.
- Prefer cohorted (friends, team, league tiers) or percentile framing ("top 30%") over
  global rank #48,201.
- Team products: leaderboards of INDIVIDUALS create surveillance dynamics — leaderboard
  the teams, celebrate the individuals privately.
- Always opt-outable; never leaderboard sensitive metrics (health data, spending).

## Design integration rules
- Mechanics live in the product's visual system — the moment gamification looks pasted-on
  (cartoon layer over a pro tool), both layers lose credibility (`memory/brand.md`
  personality dial gates the rendering intensity).
- Celebration budget per `components/states.md`: milestone ceremony, not per-point noise.
- Motion: earned moments may spring (`motion/principles.md` character presets — the one
  licensed spring even in serious products is the achievement pop).
- Numbers craft: tabular-nums, honest scales, no odometer-inflation (10,000 "XP" for
  one action is Zimbabwe-dollar design).

## The ethics gate (instant-fail conditions)
- Variable-reward loops engineered for compulsion (loot-box psychology) in non-game products
- Mechanics that punish absence beyond losing un-earned progress (decay of EARNED status)
- Social pressure as a weapon ("3 teammates finished; you didn't")
- Gamifying spending, trading frequency, or health-critical decisions
- Dark streak mechanics: notifications escalating in guilt as absence grows

The test: **would the mechanic survive the user reading its design doc?** "We show your
real progress to motivate you" survives. "We schedule guilt at your weakest hour" does not.

## Checklist
- [ ] Sector/context gate passed; user's goal genuinely served by engagement
- [ ] Progress = real value; streaks have mercy; badges mark real tiers
- [ ] Leaderboards cohorted/percentiled, opt-outable, never surveillance
- [ ] Rendered in the product's own visual system at the brand's personality dial
- [ ] Ethics gate: every mechanic survives its own design doc being public
