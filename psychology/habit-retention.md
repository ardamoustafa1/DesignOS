# Habit & Retention Psychology

Acquisition psychology gets users in the door (`psychology/persuasion.md`); this module
is about why they return Tuesday, and the Tuesday after. Retention is not a growth-team
metric — it's a design outcome: products get retained when returning is *easier and more
rewarding than not returning*.

## The habit loop, honestly applied
```
CUE → ROUTINE → REWARD → (investment that sharpens the next cue)
```
- **Cues you own:** notifications (`components/notifications.md` — spend sparingly),
  emails (`patterns/email-templates.md` — behavior-triggered), the OS-level presence
  (dock badge, widget). **Cues you earn:** the external trigger (a teammate mention, a
  real-world event the product serves) — designing to CAPTURE existing triggers beats
  manufacturing artificial ones ("your Monday planning" beats "we miss you").
- **Routine friction is the retention killer:** the return path must be shorter than the
  first-visit path — session restore ("continue where you left off" as the primary
  element — `industries/education.md` dashboard doctrine), remembered state everywhere
  (`components/tabs-accordions.md` persistence, `components/tables.md` saved views),
  auth that doesn't re-gate daily (`patterns/onboarding-auth.md` session length).
- **Reward = the product working**, arriving fast. Variable-reward engineering belongs to
  the ethics gate (`psychology/gamification.md`); the sustainable reward is competence:
  the user getting better at their job through you.

## The investment mechanic (the honest lock-in)
Every piece of user-created state — configs, saved views, history, integrations, content —
increases the product's value TO THEM and the cost of leaving. Design implications:
- Surface accumulated value: "your 8 dashboards", year-in-review moments, usage milestones
  (loss aversion framed as pride, not threat — `psychology/persuasion.md`).
- **Invest early:** onboarding that produces a real artifact in session one
  (`patterns/onboarding-auth.md` aha-paths) plants the first root.
- The ethics line: investment locks in through VALUE, never through hostage-taking —
  export always works (`psychology/persuasion.md` free-tier doctrine). Confidence in the
  exit door is, paradoxically, retention: users commit deeper to products they could leave.

## Retention moments (design these deliberately)
| Moment | Design job |
|---|---|
| **Session 2** (the cliff — most products die here) | the return must land on progress, not a reset: "welcome back + here's where you were" not the empty dashboard again |
| **The first lapse** (7–14 days absent) | re-entry without shame: "here's what changed" digest, NOT guilt ("we noticed you left 😢") · re-onboarding lite if the UI shifted |
| **The habit plateau** (weeks 3–8) | depth reveals: progressive feature disclosure as competence grows — power shortcuts surfaced (`components/search-command.md` palette), not dumped on day 1 |
| **The renewal/review** (subscription products) | value receipts: what they did with it this year, BEFORE the invoice lands |

## Frequency honesty (design to the product's natural cadence)
Products have a native frequency: expense tools are monthly, deploy tools daily, tax tools
yearly. Retention design means being excellent AT that cadence — a monthly product chasing
DAU with engagement mechanics becomes spam (`components/notifications.md` inflation).
The yearly product's retention surface is the email + the re-entry experience, not the app.

## Anti-patterns (the churn accelerants wearing retention costumes)
- Engagement theater: notifications/streaks/feeds bolted onto a utility (users notice
  their time being farmed)
- The punished lapse: logged-out sessions, wiped drafts, expired trials that deleted work
- Re-onboarding walls after absence (17 new-feature modals before the task)
- Cancellation flows as retention strategy (roach motels retain bodies, not customers —
  and `patterns/settings.md` cancellation doctrine bans them)
- Metrics-driven cue spam: every team adding "just one" notification until the mute-all
  event (the notification ledger in `memory/design.md` is the defense)

## Checklist
- [ ] Return path shorter than first-visit path; state remembered everywhere
- [ ] Session-2 lands on progress; lapse re-entry designed without shame
- [ ] Investment surfaced as pride; exit door visibly open
- [ ] Cadence-honest: cues match the product's natural frequency
- [ ] Every cue on the notification ledger; engagement-theater sweep clean
