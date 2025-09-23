# Roadmap

Where DesignOS is going. Items move: planned → building → shipped (to `CHANGELOG.md`).
Propose additions via a module-proposal issue.

## Shipped (v1.1)
- 20-module component library (added: badges/chips, tooltips/popovers, tabs/accordions,
  search/⌘K, notifications, charts, code blocks, wizards, file upload, pickers)
- 10-pattern library (added: docs sites, blog/content, changelog, settings, comparison
  pages, company pages, email design)
- 20 industry playbooks (added: legal, travel, food/restaurants, media/news, web3,
  nonprofit/government, HR/recruiting, events)
- 8-module psychology layer (added: trust mechanics, emotional design, gamification
  ethics, habit/retention)
- Token architecture + dark-mode physics foundations; trend radar + originality brain
  modules
- `npx` installer, starter tokens, live showcase page

## Shipped (v1.2)
- Showcase gallery: dashboard, pricing, docs pages (+ gallery index) — one token system
- Mobile-native module set: `native/` (iOS, Android, app patterns, motion & gestures)
- Validators: `validators/` (refs, token drift, contrast, a11y basics) — CI-ready
- Evals: `evals/` blind benchmark protocol + 10 briefs
- Print & documents + conversational/AI UI patterns
- Industries: insurance, logistics, automotive, manufacturing B2B (→24)
- i18n: Türkçe README

## Shipped (v1.5)
- Before/After demo page (museum-pinned flaws vs the scored result) — the launch centerpiece
- `designos audit` command; validator upgrades (per-declaration parsing, :root exemption,
  file/line ignore directives) — hardened by dogfooding against our own showcases
- Community showcase + "Designed with DesignOS" badge; press kit + SVG logos
- Paste-ready neutral judge prompt; 4 more READMEs (ja/de/fr/pt — 7 languages)

## Shipped (v1.4)
- Universal agent exports (`designos export` → Cursor/Copilot/Windsurf/Cline/Aider) +
  the integrations capability matrix
- `designos doctor` health check; `/design-*` slash commands (`skills/`)
- The Anti-Pattern Museum (40+ exhibits); CHEATSHEET; GLOSSARY

## Shipped (v1.3)
- The project's own website (`website/` — designed by the system, Pages-ready)
- All four showcase walkthroughs; validators as a GitHub Action (self-validating CI)
- W3C Design Tokens JSON export; SECURITY / CODE_OF_CONDUCT / FUNDING
- `LAUNCH.md` distribution playbook; 中文 + Español READMEs

## Building (human-in-the-loop — see LAUNCH.md Phase 0)
- The 30-second demo GIF for the README (requires a recorded live session)
- First published eval run (requires executing `evals/` against a model pair)
- GitHub publication: repo creation, Pages activation, `USER` placeholder replacement

## Planned
- **Published eval results across major models** — the deltas as a living table
- **Design-review GitHub Action v2:** validators + a rubric-prompted model pass on PR diffs
- **Module translations** under `i18n/` (TR first), beyond the README layer
- **Industry expansion by demand:** open a module-proposal issue with your sector

## Non-goals (by design — see `ARCHITECTURE.md`)
- Becoming a component code library (shadcn exists; judgment is the product)
- Framework/tool lock-in of any kind
- Neutrality — DesignOS takes positions; a rule that hedges is a rule that's leaving
