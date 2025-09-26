# Steppers & Wizards

Multi-step flows exist to make big tasks feel small. The moment a wizard feels *longer*
than the equivalent form, it has failed — steps are a psychological device
(`psychology/cognition.md` decision fatigue, goal-gradient), not a pagination device.

## When to wizard (and when not)
- **Yes:** >8 fields with distinct topics · decisions that depend on earlier answers ·
  high-stakes flows needing review-before-commit (checkout, provisioning) · onboarding
  (`patterns/onboarding-auth.md`).
- **No:** 5 related fields (one form) · content that benefits from overview (settings —
  users need to SEE all options) · steps invented to "feel guided" (3 questions split
  into 3 screens with 3 clicks of overhead).

## The stepper (progress indicator)
```
Horizontal   3–5 steps · dot/number + label · states: done (✓, accent), current (filled,
             bold label), upcoming (muted) · connector line fills with progress
Vertical     left rail for long/branching flows (setup guides) — steps can hold summaries
             of completed answers
Minimal      "Step 2 of 4" text + thin progress bar — right for mobile & short flows
Mobile       current-step label + bar; full stepper collapses (5 labeled dots don't fit 375px)
```
- Labels are outcomes, not numbers: "Payment", "Team", "Review" — a stepper of unlabeled
  dots is decoration.
- Progress pre-seeded where honest ("Account created ✓" as step 0 —
  `psychology/cognition.md` goal-gradient).
- Clickable steps: completed steps yes (revisit/edit), future steps only if genuinely
  order-free (then reconsider: is this a wizard or tabs?).

## Step design rules
1. **One topic per step,** named by the stepper label. A step needing a scroll on desktop
   is two steps (or too many fields — cut first, split second).
2. **First step is the easiest** (momentum before commitment); the scariest ask
   (payment, permissions) goes latest-possible.
3. **Branching:** answers prune later steps — show the pruned count honestly (stepper
   updates from 5 steps to 4; don't fake-freeze the total).
4. **Every step validates on advance,** errors inline (`components/forms.md`), focus to
   first error — never a step-3 error reported at step 5.

## Navigation contract
```
Primary     "Continue" / final: verb+outcome ("Create workspace") — right-aligned,
            loading state on async advance (components/buttons.md)
Back        ghost, left of primary (or top-left) · ALWAYS SAFE: state preserved perfectly,
            nothing resubmitted, nothing lost — the #1 wizard trust rule
Save+exit   long wizards (>3 min): explicit "Save draft" or ambient autosave with
            indicator; re-entry resumes at the departed step
Cancel      exists, confirms only when data would be lost (modals.md dirty-state)
Keyboard    Enter advances from any field · full tab order per step
```

## The review step (high-stakes flows)
Before irreversible commits: a summary of every answer, grouped by step, each with an
Edit link jumping back (and returning to review after the fix — not restarting the flow).
The review step is where trust is won: totals with no surprises
(`industries/ecommerce.md` checkout doctrine), consequences stated plainly.

## Completion
A milestone moment (`components/states.md`): what was created (with a link to it),
what happens next, ONE next action. Never dead-end at "Success!" — the wizard's end is
the product's beginning.

## Motion
Steps transition directionally: forward = slide-left 200–250ms, back = slide-right —
spatial consistency is the orientation model. Stepper fills animate 200ms. Reduced motion:
crossfade (`motion/principles.md`).

## Anti-patterns
- Back buttons that wipe the step's data (users test this ONCE, then abandon)
- Progress bars lying ("90%" for three screens straight)
- Steps that exist to split a 4-field form across 4 clicks
- The unskippable intro step ("Welcome! Here's what this wizard does" — the stepper
  already says it)
- Total step count hidden ("Next… next… next…" into the fog)
- Validation errors from a FUTURE step's constraint surfacing late (validate what's
  visible, when it's visible)

## Checklist
- [ ] Wizard justified (topic count/dependencies/stakes) — not a chopped form
- [ ] Stepper: labeled outcomes, honest count, completed-steps clickable
- [ ] One topic per step; easiest first; validate-on-advance with inline errors
- [ ] Back is perfectly safe; long flows resumable; Enter advances
- [ ] Review step before irreversible commits; edit-and-return loops
- [ ] Directional motion + reduced-motion crossfade; completion links to the created thing
