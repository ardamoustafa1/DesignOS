# Settings Pages

Settings are where products confess their complexity. Users arrive with ONE intent
("change my email", "add a card", "turn that noise off"), navigate a space they visit
monthly, and leave. Optimize for findability and safety, never for tour-ability.

## Architecture
```
Shell     settings sub-nav (left rail 220–240px within the app shell, or tabs for ≤5
          sections) · content column 640–720px MAX — full-width settings rows are
          unreadable and look broken
Grouping  by USER mental model, not by backend service:
          Account (profile, email, password, 2FA) · Preferences (theme, language,
          notifications) · Workspace/Team (members, roles) · Billing (plan, payment,
          invoices) · Integrations · Advanced/Danger
Search    products with >6 sections: a settings search (filters items live) — the
          highest-ROI feature on any large settings surface
```
- One page per section; anchor-linkable subsections (support docs link straight to
  "Settings → Notifications → Email" — make the URL real).
- Every item: label + one-line explanation of CONSEQUENCE ("Weekly digest — a summary
  every Monday morning") — settings without explanations are a quiz.

## Save models (pick per section, be consistent)
| Model | Where |
|---|---|
| **Instant-apply** (toggles, radios, theme) | preferences — with inline "Saved" whisper (`components/states.md` autosave) |
| **Explicit Save per card/section** | text inputs, grouped fields — dirty-state enables Save, warns on nav-away (`components/modals.md`) |
| **Confirmed flows** | email change (verify), password (current-password gate), plan changes (review step) |

Never mix instant and explicit inside one visual card — users can't tell what's committed.

## The rows
- **Toggle rows:** label+explanation left, toggle right (`components/forms.md` toggle
  doctrine: instant or it's a checkbox), 56–64px row height, hairline separators.
- **Value rows:** label + current value + "Edit" affordance opening inline expansion or
  a focused modal — showing current state beats blank fields ("Email: a•••@hotmail.com [Change]").
- **Notification matrix:** per `components/notifications.md` preferences spec.
- **Connected accounts/integrations:** logo + name + status + Connect/Disconnect with
  consequence copy ("Disconnecting stops Slack alerts immediately").

## Billing (the highest-stakes section)
- Current plan card: name, price, renewal date, usage-vs-limits meters — the "what am I
  paying and why" answer in one glance (`patterns/pricing.md` honesty doctrine indoors).
- Payment methods: card brand + last4 + expiry, default marked, add/remove safe.
- Invoice history: table with download-PDF per row (`components/tables.md`).
- Plan changes: preview the proration BEFORE confirm ("You'll be charged $14 today,
  then $29/mo from Aug 1") — surprise charges are churn letters.
- **Cancellation is findable and honest:** a real button, a short exit survey (skippable),
  clear end-of-access date, data-export offer (`psychology/persuasion.md` — hostage-taking
  is a dark pattern; peak-end rule: the exit IS the lasting memory).

## The danger zone
- Visually quarantined at the bottom of Advanced: bordered section (danger-subtle tint),
  each action with consequence sentence + type-to-confirm for irreversibles
  (`components/modals.md` destructive doctrine).
- Delete account/workspace: what dies, what's exportable, grace period if any — stated
  BEFORE the confirm, not in the goodbye email.

## Anti-patterns
- Settings organized by microservice ("General" holding 40 unrelated items)
- Save button ambiguity (one floating Save for a page of six cards — which changed?)
- Toggles that need a save · destructive actions styled like siblings of safe ones
- The buried cancel (support-ticket-only cancellation earns regulatory attention and rage)
- Uncached settings pages that reset scroll/section on every save
- "Are you sure?" on trivial preference changes (confirm-fatigue spends real trust —
  save confirmations for consequences)

## Checklist
- [ ] Grouped by mental model; column ≤720px; deep-linkable sections; search when large
- [ ] Every item explains its consequence; current values visible
- [ ] Save models assigned per section, never mixed in a card; dirty-state guarded
- [ ] Billing: usage visible, proration previewed, invoices downloadable, cancel honest
- [ ] Danger zone quarantined with type-to-confirm; exports offered before deletions
