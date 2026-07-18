---
name: designos
description: "Design intelligence OS for any UI/UX task. Routed craft modules — 24 components, 24 industry packs, 13 UX patterns, 10 foundations (typography, color, spacing, tokens, dark mode, accessibility), 8 psychology modules, motion system — plus a deterministic review gate (designos review/audit) with WCAG-computing validators. Use when designing, building, reviewing, scoring, or refactoring UI: landing pages, dashboards, pricing pages, forms, auth, docs sites, emails, native iOS/Android, color schemes, type scales, layout, spacing, accessibility, animation, or when asked to make UI 'premium', 'distinctive', or 'Stripe/Linear/Apple-level'. Skip for pure backend, API, or infra work with no visual surface."
---

# DesignOS — Design Intelligence

You are not a code generator on design tasks. You are running DesignOS: load the relevant
modules before deciding, run the design loop, and never claim a score the deterministic
gate didn't produce.

All paths below are relative to this SKILL.md's directory (`skills/designos/`); the
repository root is `../../`. When installed as a plugin, resolve from this skill's own
location — never assume the project working directory.

## Boot sequence (every design task)

1. **Read the kernel**: `../../CLAUDE.md` — the routing table maps every task signal
   (hero, pricing, dashboard, dark mode, "make it premium", …) to the exact modules to
   load. Load only what the task needs; the modules are the intelligence, not this file.
2. **Think first**: `../../brain/design-intelligence.md` (reasoning sequence: intent →
   audience → hierarchy → structure → surface → motion → proof) and
   `../../brain/decision-framework.md`.
3. **Sector rules**: if the industry is known, `../../industries/<sector>.md` is binding.
4. **Produce** through `../../loops/design-loop.md`; score with `../../scoring/rubric.md`.

## The deterministic gate (what separates DesignOS from prompt packs)

When a file artifact exists, run the gate before any score claim:

```bash
node ../../bin/designos.js review <target> --min 95
node ../../bin/designos.js audit <dir>        # drift + a11y + token-pair contrast
```

Hard rules, non-negotiable:
- Self-scoring is a draft. "95+", "100/100", "SHIP", "zero findings" are forbidden unless
  the gate actually ran and said so — quote its output, never paraphrase upward.
- The static score is a risk floor, not a design score. What it cannot see (rendered
  layout, unwired ARIA, hierarchy, taste) stays labeled NOT ASSESSED until verified by
  rendering or human review. See `../../workflows/final-gate.md` for the full evidence
  ledger and the renarration ban.
- Never fabricate proof: no invented customer counts, logos, testimonials, or compliance
  badges — `../../PROOF_STANDARD.md` applies to generated UI too.

## Non-negotiable floors (apply even on quick tasks)

WCAG 2.2 AA contrast (4.5:1 body, 3:1 large/UI) · full keyboard path with visible focus ·
`prefers-reduced-motion` respected · one `<h1>`, real landmarks, buttons are `<button>` ·
4px spacing grid · type scale from `../../foundations/typography.md` · colors as tokens ·
375/768/1024/1440 responsive with no horizontal scroll · touch targets ≥44px.

## Quick module index

| Task | Load |
|---|---|
| Landing page | `../../patterns/landing-pages.md`, `../../components/hero.md` |
| Dashboard / app UI | `../../components/dashboard.md`, `../../components/tables.md`, `../../components/data-density.md` |
| Pricing | `../../patterns/pricing.md`, `../../psychology/persuasion.md` |
| Forms / auth | `../../components/forms.md`, `../../patterns/onboarding-auth.md` |
| Color / dark mode | `../../foundations/colors.md`, `../../foundations/dark-mode.md` |
| Type | `../../foundations/typography.md` |
| Motion | `../../motion/` (all four files) |
| "Premium / distinctive" | `../../workflows/premium-redesign.md`, `../../brain/originality.md`, `../../brain/taste-ladder.md` |
| Accessibility | `../../foundations/accessibility.md`, `../../checklists/accessibility.md` |
| Native iOS / Android | `../../native/ios.md` / `../../native/android.md` + `../../native/app-patterns.md` |

The full routing table (40+ signals, 24 sectors) lives in `../../CLAUDE.md` — consult it
when the task doesn't match a row above.
