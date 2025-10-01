# Onboarding & Auth

Signup is a promise ("this will be worth it") and onboarding is keeping it fast.
The metric that matters: **time-to-first-value** — every field, step, and screen between
the user and their aha-moment must pay rent.

## Signup

### The form (`components/forms.md` governs details)
- **Ask the minimum:** email + password, or just SSO. Name, company, role, phone — all deferrable to onboarding or inferable. Every removed field is measurable conversion.
- **SSO first:** Google/GitHub/Microsoft buttons (per audience) above the email path, visually primary, official brand marks, "Continue with…" labels. Divider "or" → email form.
- Password: rules stated upfront (not revealed by failure), strength meter (segments, not red-shaming), show-password toggle, paste allowed (password managers are allies).
- Or go passwordless: magic link / OTP — then design the *check-your-email* state properly (which address, resend with cooldown timer, change-address escape, "check spam" hint).
- Legal: one line, links to terms/privacy, **no pre-checked marketing boxes** (`psychology/persuasion.md` defaults).

### The layout
- Split screen: form left (400–440px column), value reinforcement right (product shot, one testimonial, or 3 benefit bullets) — the right panel *re-sells during the ask*. Mobile: form only.
- Or centered card (400–480px) on quiet surface for minimal brands.
- Nav strips down to logo + "Already have an account? Log in" — no escape routes into the marketing site mid-conversion, no full footer.

### Login (different job: recognition, speed)
- Same layout family as signup; email field autofocused, `autocomplete="email current-password"` correct (free password-manager magic), "Forgot password?" adjacent to the password field *before* failure.
- Error message: "Email or password incorrect" (no user-enumeration), account-lockout communicated with recovery path, not a dead end.
- Session length choice ("Keep me signed in") default-on for consumer, default-off for finance/health (`industries/`).
- 2FA screen: 6-digit segmented input, auto-advance, auto-submit on complete, paste-the-whole-code support, fallback link ("Use backup code / Try another way").

### Password reset
- Request: one field, always claim success ("If that email exists, we sent a link") — no enumeration.
- Reset: new rules stated, both-fields-no ("confirm password" is dead — one field + show toggle), auto-login after success + toast.

## Onboarding

### The doctrine
1. **Deliver value before configuration.** Show the product working (sample data, templates, instant demo) *then* ask for setup. A blank dashboard asking 6 questions is a churn machine.
2. **One question per screen,** each visibly shaping the outcome ("We'll set up your workspace for design teams") — questions that don't change anything are surveys, cut them.
3. **Skippable everything** (except legal/security). "Skip for now" ghost link on every step; skipped items resurface in the checklist, not as nags.
4. **Progress visible:** stepper (labeled, 3–5 steps max) with the first step pre-completed ("Account created ✓" — `psychology/cognition.md` goal-gradient).

### The aha-path per product type
| Product | First-value moment to engineer |
|---|---|
| Analytics | a chart with THEIR data (or realistic sample) on first screen |
| Design/creative | a started canvas from a template, not a blank one |
| Dev tool | copy-paste snippet → visible result in <2 min ("deploy hello world") |
| Team tool | value single-player FIRST; invite step after (inviting into emptiness fails) |
| Data-heavy (CRM/finance) | import path with instant preview + sample-data fallback |

### The onboarding checklist (in-product)
- 4–6 items, first pre-checked, each = real value milestone (not "watch tutorial video"); progress bar; dismissible-but-recoverable; reward completion honestly (feature unlock or plain congratulations — `components/states.md` milestone).

### Empty states as onboarding (`components/states.md`)
Every empty surface in week-one is an onboarding screen: primary create-action + sample/import alternative. Audit them together as a *system* — tone and visual language consistent.

## Verification & security friction
- Email verification: don't wall the product (let them in, banner until verified) unless the sector demands otherwise (fintech/health KYC — `industries/`).
- Progressive security: ask for 2FA setup after value delivery, at a natural pause, with the why ("protect your 3 workspaces") — not at minute zero.

## Anti-patterns
- 11-field signup forms · CAPTCHA before any abuse signal · forced tours (the 9-tooltip parade nobody reads — contextual first-use hints beat tours) · welcome video walls · invite-teammates as step 1 · fake progress ("87% complete" forever) · asking "how did you hear about us" before delivering anything · blocking paste in ANY field

## Checklist
- [ ] Signup ≤2 fields or SSO-only; every asked field justified in memory/notes.md
- [ ] Auth flows complete: login, reset, magic-link states, 2FA, lockout recovery
- [ ] Autocomplete/inputmode attributes correct throughout
- [ ] First-session path to aha ≤2 minutes, measured in steps and listed in memory/pages.md
- [ ] All onboarding steps skippable; checklist pre-seeded; empty states audited as a system
- [ ] No enumeration leaks; no pre-checked consent; paste allowed everywhere
