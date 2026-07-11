# Changelog

All notable changes to DesignOS.

## [2.0.2] — 2026-07-11

Cosmetic polish pass on the README header and website branding — no functional or
content changes.

### Changed
- Website favicon and navbar logo switched to a cropped 3D mark (removed transparent
  border padding so it renders full-size and sharp at small sizes) and reused as the
  `apple-touch-icon`.
- Website showcase grid centered into a single-row 4-column layout on wide viewports;
  added an executive attribution line to the footer.
- README logo and CI badges realigned to the project's signature emerald-green
  gradient for visual consistency with the website.

## [2.0.1] — 2026-07-11

QA audit fixes — a full pass verifying every claim in v2.0.0 against the *live* repo
(GitHub API, real Actions run logs, actual rendered pages), not just the local working
tree. Found and fixed real, user-facing bugs; documented here per the same honesty
standard the project holds its own design output to.

### Fixed
- **`.github/workflows/proof.yml` was failing on every run** (verified via the GitHub
  Actions API, not assumed): `npx playwright install --with-deps chromium` only
  fetches the browser binary, it does not install the `playwright` npm package —
  `require('playwright')` in the screenshot step had nothing to resolve. Added a real
  `npm install --no-save playwright@latest` step; verified locally end-to-end against
  all 6 pages (website index, before/after, and all 4 showcase pages) with zero
  console errors before pushing.
- **`package.json` version was out of sync with the shipped CHANGELOG entry** — the
  v2.0.0 release commit landed without bumping `"version"` or the README badge; both
  said 1.9.0 while CHANGELOG said 2.0.0. Synced.
- **`press/social-preview.png` was a JPEG with a `.png` extension**, and declared as
  1280×640 in `website/index.html`'s Open Graph tags while actually being 1024×1024 —
  link-share cards would have rendered with the wrong aspect ratio on every platform.
  Converted to real PNG; `og:image:width/height` corrected to the actual dimensions.
- **`ENTERPRISE.md` documented a git-tag-pinning example (`#v2.0.0`) for a tag that
  did not exist** on the remote — copy-pasting it would 404. A real `v2.0.0` tag was
  cut and pushed so the documented example actually works.
- Stale `kernel v1.9` text in `press/demo.svg` and its README alt text (version had
  moved to 2.0 without updating the animated demo's own boot line).
- `DISCUSSIONS.md`, `ENTERPRISE.md`, `GOVERNANCE.md` were unreachable from README's
  Community section (only linked from the top nav) — added.
- `LAUNCH.md`'s pre-flight checklist still referenced the pre-correction 1280×640
  social image spec.

### Verified, not just assumed
- Fetched the live repo via the GitHub REST API: confirmed public, confirmed
  `stargazers_count`/`contributors` reflect single-maintainer attribution, confirmed
  GitHub Pages is live at the documented URL (HTTP 200), confirmed `DesignOS validate`
  workflow passes on real runs.
- No secrets, tokens, or `.env` files found in a full repository scan.
- `npm test` (13 CLI unit tests + 58-module structural check) and
  `npm run check:links` both run clean or with only expected/template false-positives
  (documented, not silently ignored).

## [2.0.0] — 2026-07-11

The launch-readiness wave: closing every gap the QA audit identified as blocking
100k-star trajectory and production adoption. Six critical fixes shipped.

### Added
- **`press/social-preview.png`** — 1280×640 dark-theme GitHub/Twitter social preview
  image (terminal boot log + scored UI preview + six dimension badges). Upload to
  repo Settings → Social preview to activate link-share cards on all platforms.
- **`DISCUSSIONS.md`** — setup guide for GitHub Discussions with category
  recommendations and a ready-to-paste welcome post. Enable at Settings → Features.
- **`evals/RESULTS.md` Run 002** — cross-file validator reproducibility run: all
  four DesignOS showcase pages score zero findings across both `check-drift` and
  `check-a11y-basics`; the control page's 43 drift and 6 a11y findings reproduce
  exactly. Caveat stated: still maintainer-conducted; Run 003 slot opened for genuine
  third-party independent validation.
- **`package.json` scripts** — `npm run validate` (full validator suite), `npm run
  doctor`, `npm run audit` — contributor-friendly one-command quality checks.
- **`package.json` keywords expanded** — added `windsurf`, `cline`, `aider`,
  `design-intelligence`, `llm`, `openai` for npm search discoverability.

### Changed
- **`press/demo.svg`** — complete rewrite of the animated terminal demo: per-line
  typewriter reveal, scanline shimmer effect, blinking cursor, color-coded output
  (green ✓, amber ▲, accent boot header), separator lines between phases, full
  16-second loop showing prompt → boot → routing → memory → loop → contrast catch →
  auto-fix → score → ship → memory write. 400px tall vs the previous 340px.
- **`website/index.html`** — added full social meta suite: `og:image`, `og:type`,
  `og:url`, `og:image:width/height/alt`, `twitter:card`, `twitter:image`, canonical
  link. Link-share cards now render correctly on all platforms.
- **`README.md`** — demo SVG width 680→720, alt text updated to describe the full
  animated sequence.
- **`.github/workflows/pages.yml`** — added `.nojekyll` creation step (bypasses
  Jekyll so `_`-prefixed paths serve correctly); added live URL documentation in
  comments so the one-time Settings step is unambiguous.
- **`.gitignore`** — added `.designos-audit.log`, `.designos-journal.md`,
  `screenshots/` (CI build artifacts should not land in git history).
- **`SHOWCASE.md`** — community section CTA strengthened with numbered steps.
- **`ROADMAP.md`** — Pages workflow status clarified; Discussions added to building
  list; Run 003 terminology used consistently.
- **`press/README.md`** — social-preview.png documented with Settings upload path.

### What requires a manual action (cannot be automated)
- **GitHub Pages:** Settings → Pages → Source: GitHub Actions → Save. Workflow
  (`pages.yml`) is ready; the site deploys on the next push after this is enabled.
- **Social preview upload:** Settings → Social preview → Edit → upload
  `press/social-preview.png`.
- **Discussions:** Settings → Features → Discussions (check). Then follow
  `DISCUSSIONS.md` for category setup and the welcome pinned post.

## [1.9.0] — 2026-07-11

The discoverability wave: closing the gap between "the docs exist" and "the docs are
findable," plus CI that proves the install and every page actually work — continuously,
not just at the moment someone happened to test it.

### Added
- **`.github/workflows/proof.yml`** — a CI pipeline that runs the real installer
  end-to-end on every push and PR, then renders the website and all four showcase
  pages in a headless browser, screenshots them as build artifacts, and fails the
  build on any console error. Deliberately never commits back to the repository —
  proof lives in Actions artifacts and a status badge, not in git history.
- **README** — new "🔍 How It Works" section with the real control-flow diagram
  (brief → kernel boot → route → design loop → review engine → deliver), linked to
  `ARCHITECTURE.md` for the full version; `GETTING-STARTED.md` and `ARCHITECTURE.md`
  are now linked from the top nav row (previously present but undiscoverable from
  the README); a "Live proof" section explaining the CI pipeline as an
  always-fresh alternative to a video demo, since CI can't go stale the way a
  recorded video does.
- Two new status badges (Live proof, Validate) at the top of the README.

### Changed
- **`GETTING-STARTED.md`** rewritten — the primary install path is now the verified
  `npx github:ardamoustafa1/DesignOS init` command (previously showed manual `cp -r`
  as the recommended path, predating the CLI); added a "verify the install" step
  using `doctor`, a "going deeper" section linking architecture/cheatsheet/glossary,
  and a troubleshooting entry for the npm name-collision issue.

## [1.8.0] — 2026-07-11

The real-install wave: verified end-to-end against the live public repo for the first
time, and fixed a launch-blocking discovery — a naming collision with an unrelated,
already-published npm package.

### Fixed — critical
- **"designos" is already taken on the npm registry** by an unrelated package (v0.7.0,
  a different Chinese-language design tool with its own skill system). This means bare
  `npx designos <command>` — as every doc previously instructed for follow-up commands —
  silently ran the wrong tool: it wrote to `~/.designos`, appended a `PATH` line to the
  user's real `~/.zshrc`, and installed unrelated skills into `~/.claude/skills`,
  `~/.codex/skills`, and `~/.cursor/skills-cursor`. Discovered by actually running the
  documented commands end-to-end against the real public repo for the first time — not
  found by static review, because it only manifests at runtime against the live registry.
- `bin/designos.js`: `init` now copies the CLI itself into `DesignOS/bin/`, so every
  command after the first install runs unambiguously via
  `node DesignOS/bin/designos.js <command>` — never resolved through the npm registry
  again. `doctor` gained a check confirming this local copy exists. All in-tool messages,
  the `help` output, and error strings updated to the safe form with an explicit warning.
- Removed `package.json` from the installer's skip-list (it was silently excluded from
  the copy, which crashed `doctor`'s local version check with `ENOENT`).
- Updated every actionable instruction across `README.md`, `CHEATSHEET.md`,
  `integrations/README.md`, `skills/README.md`, `press/README.md` to the safe local-path
  form; the one remaining first-install command (`npx github:ardamoustafa1/DesignOS init`)
  was already safe since the `github:` specifier bypasses registry resolution entirely.

### Verified
- Ran `npx --yes github:ardamoustafa1/DesignOS init --agents --skills` for real against
  the live public repo (not local files) for the first time since the CLAUDE.md-gitignore
  fix — confirmed `DesignOS/CLAUDE.md` (167 lines), 9 agents, 4 slash commands, and 165
  total files land correctly, then confirmed `doctor`, `export all`, and `audit` all work
  end-to-end via the corrected local-path invocation.

## [1.7.0] — 2026-07-10

The credibility wave: closing real gaps found by actually stress-testing the system,
and being honest about what still isn't proven.

### Added
- **`foundations/rtl-i18n.md`** — a real coverage gap found via field-testing: logical
  CSS properties, a mirrors-vs-doesn't-mirror reference table, bidi text handling,
  non-Latin typography, `Intl`-based locale formatting, and an RTL testing protocol
  added to the review loop's edge-attack list. Routed in the kernel.
- **`evals/field-report-001.md`** — the first structural stress-test: a brief chosen to
  exercise an untested module combination, the real gap it found (RTL had ~zero
  coverage), the cross-reference gap found *after* fixing that (new modules are
  invisible until routing AND downstream files both point to them), and what remains
  honestly unresolved.
- **`LIMITATIONS.md`** — a direct, un-hedged account of what isn't yet proven: the eval
  is a maintainer self-test, the showcase is self-authored, scale has outrun field-
  testing, there's no external validation yet, translations are unreviewed. Linked
  prominently from the README rather than buried.

### Changed
- `evals/RESULTS.md` — Run 001 relabeled MAINTAINER SELF-TEST with an unmissable banner;
  Run 002 (the independent run that would actually support the claim) reframed as the
  single most important open gap, not a pending formality
- README's results table softened from "the first published run" framing to an explicit
  "sanity check, not independent validation" framing, with a direct link to fill Run 002
- `components/tables.md`, `components/dashboard.md`, `components/navigation.md` — added
  RTL subsections converting physical-position language (left/right) to logical
  properties, cross-linked to the new module

## [1.6.0] — 2026-07-10

The go-live wave: the repo goes public, the README earns its place as the front door,
and the eval claim gets a receipt.

### Added
- **README overhaul** — logo header, animated boot-log GIF-equivalent (`press/demo.svg`),
  a "what makes it different" comparison table, measured results surfaced above the fold,
  collapsible repo map, and a Community section (badge, showcase, rule-challenge, roadmap)
- **Press assets** — `press/logo.svg` + `logo-dark.svg` (theme-aware via `<picture>`),
  `press/demo.svg`: a dependency-free animated SVG boot-log for anywhere a GIF would go
- **First published eval run** — `evals/RESULTS.md`: real validator counts and contrast
  ratios, control vs. treatment, with the reproduction commands and honest caveats;
  `evals/samples/control-relay.html` is the checked-in control-arm fixture
- **GitHub Pages workflow** — `.github/workflows/pages.yml` deploys the repo root
  (website, examples, demo) on every push to `main`; root `index.html` redirects to
  `website/index.html`
- **Repo metadata** — `package.json` gained `repository`, `homepage`, `bugs`, `author`,
  and the full module list in `files`

### Fixed
- All `USER`/`<you>` placeholders resolved to `ardamoustafa1` across every README,
  the website, and `SHOWCASE.md`
- `contrast.js` argument parsing when `--min` is omitted
- `check-drift.js`: per-declaration spacing parsing (type/radius properties no longer
  false-positive as spacing violations), a `:root` token-block exemption, and a
  file-level `designos-drift-ignore-file` opt-out for intentional-violation fixtures
- Real drift findings across all four showcase pages and the website, verified clean

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
