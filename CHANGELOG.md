# Changelog

All notable changes to DesignOS.

## [1.5.0] — 2026-07-10

The resonance wave: the demo asset, the community flywheel, and seven languages.

### Added
- **Before/After demo** — `website/before-after.html`: the same brief with and without
  DesignOS, side by side; every flaw on the "before" pane pinned with its Anti-Pattern
  Museum exhibit number — the launch's shareable centerpiece
- **`npx designos audit <dir>`** — all validators against a target directory in one
  command, CI-honest exit codes
- **Community showcase** — `SHOWCASE.md`: PR-submitted gallery + the
  "Designed with DesignOS" badge (the backlink flywheel)
- **Judge prompt** — `evals/judge-prompt.md`: the paste-ready neutral judge, so anyone
  can run the blind benchmark in minutes
- **Press kit** — `press/`: SVG logos (light/dark), boilerplate, key facts, honest
  story angles
- **i18n ×4** — 日本語, Deutsch, Français, Português READMEs (7 languages total)

## [1.4.0] — 2026-07-10

The universality wave: every agent, one keystroke, and the museum.

### Added
- **Universal exports** — `npx designos export <cursor|copilot|windsurf|cline|aider|all>`:
  generates each agent's rules file from the kernel (project overrides travel);
  `integrations/README.md` documents the capability matrix and honest degradation
- **`npx designos doctor`** — install health check: kernel wiring, subagents, slash
  commands, memory bootstrap — with actionable advisories
- **Slash commands** — `skills/`: `/design-review`, `/design-score`, `/design-brief`,
  `/design-tokens` as real Claude Code commands; installed via `init --skills` or
  `npx designos skills`
- **The Anti-Pattern Museum** — `museum/README.md`: 40+ cataloged design crimes in six
  wings, each with the rule that prevents it
- **CHEATSHEET.md** — the entire system's numbers, laws, and lists on one page
- **GLOSSARY.md** — the system vocabulary A–Z, module-cross-referenced

### Changed
- CLI grew from installer to toolkit (init/agents/skills/export/doctor); all commands
  end-to-end tested

## [1.3.0] — 2026-07-10

The world-launch wave: the project's own website, launch infrastructure, and i18n.

### Added
- **The website** — `website/index.html`: DesignOS's own landing page, designed by the
  system it documents (both themes, tokens-only, the boot-log signature); GitHub
  Pages-ready
- **Walkthroughs completed** — decision paper-trails for all four showcase pages
  (dashboard, pricing, docs join the landing walkthrough)
- **CI integration** — `.github/workflows/validate.yml`: the validators as a GitHub
  Action (self-validating repo; copyable into consumer projects)
- **W3C tokens** — `starter/tokens.json`: Design Tokens Community Group format twin of
  tokens.css, with dark-theme extensions
- **Launch playbook** — `LAUNCH.md`: the phased HN/Product Hunt/X distribution plan,
  message discipline, and honest expectation calibration
- **Community hardening** — `SECURITY.md` (private reporting, zero-dependency policy),
  `CODE_OF_CONDUCT.md`, `.github/FUNDING.yml`
- **i18n** — `README.zh.md` (中文), `README.es.md` (Español); language bar in all READMEs

## [1.2.0] — 2026-07-10

The proof-and-platforms wave: mobile-native, validators, evals, and a four-page showcase.

### Added
- **Native module set** — `native/`: iOS (HIG operationalized), Android (Material +
  predictive back), app patterns (IA, onboarding, offline doctrine), motion & gestures
  (the 1:1 tracking physics contract)
- **Validators** — `validators/`: CI-ready, zero-dependency scripts — cross-reference
  checker, token-drift checker (raw hex / off-grid px / bare outline / !important),
  WCAG contrast calculator, static a11y-basics checker
- **Evals** — `evals/`: blind with/without benchmark protocol + 10 fixed briefs across
  sectors and difficulty tiers
- **Showcase gallery** — dashboard, pricing, and docs pages join the landing page: four
  surfaces, one token system, one fictional product (Relay) — `examples/README.md` index
- **Patterns +2 (→12)** — `print-documents` (invoices, reports, decks, print stylesheets),
  `conversational-ui` (chat/copilot/voice: streaming, provenance, consent gradients)
- **Industries +4 (→24)** — `insurance`, `logistics`, `automotive`, `manufacturing-b2b`
- **i18n** — `README.tr.md` (Türkçe)
- Kernel routing: native platforms, conversational UI, print, and the 4 new sectors

### Fixed
- `contrast.js` argument parsing; stray non-ASCII characters in two content files

## [1.1.0] — 2026-07-10

The expansion wave: the knowledge layer roughly doubles.

### Added
- **Components 10 → 20** — `badges-chips`, `tooltips-popovers`, `tabs-accordions`,
  `search-command` (incl. ⌘K palettes), `notifications` (severity ladder, inbox, prefs),
  `charts` (honesty rules, a11y alternatives), `code-blocks`, `steppers-wizards`,
  `file-upload`, `pickers` (date/time/color/advanced selects)
- **Patterns 3 → 10** — `docs-sites`, `blog-content`, `changelog`, `settings` (incl.
  billing & danger zone), `comparison-pages` (the honesty doctrine), `company-pages`
  (about/careers/contact), `email-templates` (transactional & lifecycle)
- **Industries 12 → 20** — `legal`, `travel-hospitality`, `food-restaurant`,
  `media-news`, `web3-crypto`, `nonprofit-government`, `hr-recruiting`,
  `events-entertainment`
- **Psychology 4 → 8** — `trust` (the accumulation mechanics), `emotional-design`,
  `gamification` (with the ethics gate), `habit-retention`
- **Foundations +2** — `design-tokens` (three-tier architecture, theming, governance),
  `dark-mode` (surface physics, desaturation law, flash prevention)
- **Brain +2** — `trend-radar` (current/dated/watch shelves with maintenance protocol),
  `originality` (signature vehicles, derivation method, the swap test)
- **Community layer** — `CONTRIBUTING.md`, `ROADMAP.md`, GitHub issue/PR templates
- Kernel routing table expanded to cover all 24 new modules and 8 new sectors

## [1.0.0] — 2026-07-10

Initial release: the complete five-layer AI Design Operating System.

### Added
- **Kernel** — `CLAUDE.md`: boot sequence, routing table, non-negotiable standards,
  the Ten Questions, output contract
- **Cognition layer** — `brain/`: design intelligence, decision framework, quality bar,
  reference library (4 files)
- **Knowledge layer** — `foundations/` (7), `components/` (10), `psychology/` (4),
  `motion/` (4), `patterns/` (3): 28 opinionated modules with principles, specs,
  anti-patterns, and checklists
- **Industry intelligence** — `industries/`: 12 sector playbooks (SaaS, AI, fintech,
  healthcare, cybersecurity, e-commerce, real estate, education, gaming,
  portfolio/agency, CRM/ERP, analytics/hosting)
- **Agent studio** — `agents/`: 9 Claude Code subagent-compatible specialists with
  distinct authorities and protocols
- **Process layer** — `loops/` (design, review, refactor) + `workflows/` (new project,
  redesign, component request, landing-page sprint)
- **Review engine** — `scoring/`: six-dimension rubric with instant-fail caps and the
  95 threshold; report template
- **Quality gates** — `checklists/`: pre-flight, accessibility (WCAG 2.2 AA),
  performance (CWV budgets), SEO, responsive
- **Memory system** — `memory/`: the seven-file per-project protocol + templates
- **Docs** — README, GETTING-STARTED, ARCHITECTURE, prompt cookbook, full example walkthrough
- **Adoption layer** — `bin/designos.js`: zero-dependency `npx designos init [--agents]`
  installer; `starter/tokens.css`: the canonical token block; 
  `examples/showcase-relay.html`: a complete landing page produced by the system,
  paired with its decision walkthrough
