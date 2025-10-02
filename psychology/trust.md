# Trust — The Accumulation Mechanics

Persuasion (`psychology/persuasion.md`) covers the levers; this module covers the physics:
how trust is earned, stored, spent, and destroyed by interface decisions. Core law:
**trust accumulates in drops and evaporates in buckets** — one fake element outweighs
ten real ones, because the reader now audits everything.

## The trust ledger (every element deposits or withdraws)
| Deposits | Withdrawals |
|---|---|
| specific numbers with sources | round marketing numbers ("10,000+!") |
| real faces, names, titles | stock humans, "John D." testimonials |
| visible craft (alignment, states, speed) | typos, misalignment, broken focus states |
| stated limitations ("not built for X") | omniscient claims ("works for everyone") |
| prices shown | "contact us" for a $29 tool |
| fast pages | spinners, jank, layout shift |
| honest empty/error states | "Something went wrong" dead ends |
| dated, updated content | stale copyright years, dead blogs |

Design reviews should read the ledger: sum the page's withdrawals BEFORE polishing its
deposits — removing one fake beats adding three truths.

## Craft as competence proof
Users can't evaluate your encryption/uptime/model quality — so they evaluate what they CAN
see and extrapolate: kerning → code quality, broken mobile nav → broken product, misspelled
security page → insecure product. This transfer is irrational and universal
(`brain/quality-bar.md` is therefore a trust document). Sectors where the transfer is
strongest: security, fintech, health, infra (`industries/` trust sections).

## Stage-appropriate trust (match signals to relationship depth)
```
Stranger (first visit)     craft + specificity + recognizable logos — 3 seconds of signals
Evaluator (return visits)  depth: docs, security page, real pricing, comparison honesty
Committer (signup/payment) risk reversal, security cues AT the form, humans reachable
Customer (in product)      reliability + honest failures + work preservation
Advocate                   being right for THEM to recommend (wrong-fit sales burn advocates)
```
Front-loading committer-stage signals on a stranger ("SOC2! Money back!" in the hero)
reads as protesting too much. Sequence per `memory/pages.md` flows.

## Breach & repair (trust after failures)
Products WILL fail; trust survives failures handled well — and often ends *higher*
(the service-recovery paradox):
1. **Tell them before they notice** (status banners, proactive incident email beats
   discovered downtime).
2. **Specifics, not sorries:** what broke, impact, ETA, workaround — the post-mortem
   pattern (`industries/analytics-hosting.md`).
3. **The interface stays calm:** error states that panic (red everywhere, alarmist copy)
   amplify breach damage (`psychology/color-psychology.md` thermostat).
4. **Repair costs you something visible:** credits offered unprompted, the fix shipped
   and changelogged — repair without cost reads as PR.

## Micro-trust in flows (where commitment happens)
- Point-of-disclosure reassurance beats page-level badges: the "why we ask" line at the
  phone field, the lock at the card field, "only your team sees this" at the upload
  (`patterns/onboarding-auth.md`, `industries/healthcare.md`).
- Reversibility disclosed upfront ("you can change this later") lowers commitment anxiety
  more than persuasion raises desire.
- Progress honesty: real progress bars, real "2 steps left" — flow-level lies
  (`components/steppers-wizards.md`) teach users your UI lies, which taxes every future label.

## The consistency engine
Trust is pattern-recognition: same term for same concept (`agents/copywriter.md` glossary),
same behavior for same control, promises kept at the micro-scale ("we'll email you in 1
day" → it arrives). Every kept micro-promise compounds; every broken one audits backwards
through memory. This is why `memory/` files exist — decision #40 consistent with #4 IS
the trust architecture.

## Checklist
- [ ] Ledger audit: withdrawals removed before deposits added
- [ ] Craft-transfer surfaces (states, speed, alignment) at 95 on trust-critical pages
- [ ] Signals sequenced to relationship stage, not front-loaded
- [ ] Failure paths: proactive, specific, calm, costly repair
- [ ] Point-of-disclosure reassurance at every sensitive field
- [ ] Glossary + behavior consistency verified across the surface
