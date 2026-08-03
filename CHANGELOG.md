# Changelog

All notable changes to DesignOS.

## [Unreleased]

### Changed — portable motion authoring
- Replaced the placeholder motion playground with a keyboard-accessible timing editor,
  real replay/copy behavior, reduced-motion feedback, localhost-only serving, and static export.
- Rebuilt `signature-compile` as a dependency-free Vanilla/React/Vue/Svelte compiler with
  fine-pointer gating, animation-frame batching, cleanup, reset, and reduced-motion behavior.
- Rebuilt `scroll-animate` as a fail-closed companion stylesheet generator. Unknown recipes
  now error instead of silently producing the wrong animation; user source is never mutated.

### Added — category leadership workflow
- **Unified `improve` workflow.** One command inventories a target, runs explainable
  motion decisions, ranks inspectable patterns, orders blocking findings, optionally runs
  deep deterministic gates, and writes machine-readable plus human-readable reports without
  pretending source checks are a final design score.
- **Inspectable Pattern Atlas.** Fifteen motion patterns expose intent, earned/avoid
  conditions, product truth, pointer/keyboard/touch behavior, reduced-motion equivalence,
  performance budgets, recipes, and governing modules through `designos atlas`.
- **Frequency-aware no-motion decisions.** High-frequency keyboard actions resolve to
  an immediate semantic state instead of an 80ms animation. Every compiled decision includes
  a recommendation, reasons, rejected techniques, provenance, and confidence.

### Added — P0 semantic motion, studio and public truth
- **Motion Semantics Compiler.** Nine inputs now compile to animate/no-animation,
  frequency- and geometry-adjusted timing, easing/spring, honest transform origin,
  symmetric enter/exit paths, interruption, reduced-motion equivalence, explicit
  performance budgets, keyboard/pointer/touch decisions, and module/rule/recipe provenance.
- **Live Director Studio.** The browser surface now includes hover/select inspection,
  component boundaries, HTML/React/Vue/Svelte/Astro/Next/SvelteKit source identity,
  a variant carousel, component/copy/slot/CTA/responsive/motion/a11y/performance diffs,
  route/component locks, accept/reject/undo, and conflict-safe manual/generated merge.
  Acceptance independently requires browser, Axe/AX accessibility, motion/reduced-motion,
  and performance gates.
- **Deterministic Claim Compiler.** Version, rule, recipe, stack, fixture, browser-assertion,
  dependency, external-eval, and native-evidence claims generate from executable sources
  into README, Architecture, Roadmap, Limitations, plugin metadata, the public site, and
  `capabilities/public-claims.json`; CI rejects drift.

### Added — execution and evidence layer
- **Unified detector registry and edit hooks.** Thirty-six stable rules now carry
  category, severity, remediation, source module, exception syntax, and failing fixtures.
  `designos hooks install` exposes observe, warn, block, and deep-on-stop modes for Codex,
  GitHub Copilot, and Claude-compatible hook manifests without overwriting an existing
  provider configuration.
- **Browser-native final gate.** `browser-gate.js` renders five widths, light/dark, full
  and reduced motion, plus 200%/400% reflow; records keyboard paths, semantic snapshots,
  console/resource failures, target sizes, focus obstruction, clipping, fixed overlap,
  transfer/load evidence, screenshots, real pixel diffs, WCAG text-spacing reflow,
  forced-colors behavior, declared task completion, AX-tree live announcements, and
  interaction-latency evidence.
- **Golden regression suite.** Four manifest-backed goldens now retain 88 standard scenario
  screenshots plus eight supplemental accessibility screenshots, exact expected findings,
  keyboard coverage, ten declared tasks, performance budgets, and pixel tolerances.
- **Motion decision engine, runtime, adapters, and laboratory.** Fifteen physics and
  UI recipes are covered by fixtures and emitted across Vanilla, React, Motion, GSAP,
  Vue, and Svelte (90 adapters). The lab adds speed controls, pausing, frame stepping,
  easing and spring plots, transform-origin overlays, runtime telemetry, recording,
  replay, and full/reduced comparison.
- **Live Director.** A local inspection UI selects rendered elements, records classified
  annotations with source lines and screenshot crops, previews restraint/hierarchy/
  signature directions, and applies accepted variants only through a source-locked,
  backed-up transaction after before/after browser gates. Rollback verifies hashes.
- **Design intelligence commands.** `knowledge`, `coverage`, `signature`, `compose`, and
  `asset-direct` add graph retrieval, coverage accounting, three-direction signature
  compilation, ten composition primitives, and an asset-direction contract.

### Added — CI and independent-evidence hardening
- **Required-check workflow.** Pull requests and `main` now expose separate
  `browser-gate-required` and `golden-pixel-required` status checks. Pages deployment is
  blocked by the same browser and pixel gates.
- **Real accessibility evidence.** Standard browser scenarios run pinned `axe-core` and
  capture Chromium's full accessibility tree. Golden verification rejects missing Axe or
  AX-tree artifacts.
- **Commit-bound public ledger.** The deployed evidence page links its exact commit SHA
  and Actions run and reports browser/golden results without turning them into a WCAG or
  design-score claim.
- **Real framework matrix.** Vanilla, React, Motion, GSAP, Vue, and Svelte are bundled
  from their actual packages, exercised in Playwright under full/reduced motion, and
  checked for React/Vue/Svelte source-map resolution.
- **Independent black-box evaluation.** All thirty-six registry capabilities now have an
  isolated static, browser, Lighthouse, or visual-regression run recorded in
  `evals/independent/registry-eval.json`.
- **Lighthouse release gate.** A pinned Node 22 Lighthouse runner blocks category scores
  below 95, LCP above 2s, CLS above 0.1, or TBT above 200ms. Its exact-version evidence is
  included in the commit-bound public browser ledger.
- **Live Director acceptance budgets.** Variant and manual transactions now block on
  transfer, load, long-task, and layout-shift regressions; React/Vue/Svelte runtime markers
  and source maps resolve annotations to component source. Variant provenance includes
  sector, memory, proof policy, and the actual Signature Compiler derivation.
- **Unified query engine.** `find` runs one BM25 ranking over motion, typography, and
  knowledge-graph nodes with exact-label and typed-filter boosts.

### Added — the wow layer
- **`motion/signature-moments.md`** — the gap the validators could not close. `check-motion.js`
  stops bad animation; nothing produced *exceptional* animation, and a page can pass every
  rule while being forgotten before the tab closes. Ten interactive techniques with working
  code, real cost accounting, and an "earned when" rule each: magnetic button, text
  scramble, cursor spotlight, 3D tilt, split-text reveal, scroll-driven storytelling,
  odometer, cursor parallax, noise canvas field, liquid/shared-element morph. Governed by a
  **scarcity law** — two signatures per page, maximum, because memory attaches to one
  violated expectation inside an otherwise calm frame, and salience is a ratio, not a
  quantity.
- **`brain/wow-calibration.md`** — turns "make it legendary" into a decision. Names the four
  routes to memorable (composition, material, voice, motion) and puts motion *fourth*,
  because reaching for effects is the reflex and usually the wrong one. Adds a courage
  ladder (1–10) with absolute sector caps, a five-step decision tree, the page shape that
  makes a signature land, numeric budget ceilings, and a table for the common case where
  "make it wow" actually means "make me feel safe".
- **`goldens/flagship-launch/`** — the first golden at the top of the dial (rung 9). Two
  signatures only: a scroll-driven six-steps-become-one collapse that *performs* the
  product's argument instead of describing it, and a magnetic primary CTA. Ships with a
  companion `lab.html` that deliberately breaks the scarcity law so all ten techniques can
  be inspected side by side — and says so at the top, because a reference sheet that looks
  like a golden is a trap. Both pass all five validators.
- **Ten expressive presets in `designos find`** — `find "wow hero effect"` previously
  returned nothing useful; the library held only standard-tier recipes. The catalogue is now
  23 presets across three tiers, each signature citing `signature-moments.md`.
- **Sound & haptics in `motion/micro-interactions.md`** — the module said "default: none"
  and stopped, but "never" and "here is how to do it correctly" are different instructions.
  Four gates (user-initiated, off by default, redundant, sector-licensed), craft rules
  (<100ms, <−20dBFS, one family, pitch carries meaning), a correct `AudioContext`
  implementation, and the honest state of `navigator.vibrate` on the web.

### Added
- **`validators/check-motion.js` — the animation half of the mechanical floor.** Every
  numeric law in `motion/` was previously enforceable only by a reader who already knew it:
  a file could be drift-clean, contrast-clean, and still ship `transition: all 400ms
  ease-in-out` on a hover, which is three violations at once. Sixteen rules, each a
  mechanization of a line already written in `motion/principles.md`,
  `micro-interactions.md`, `page-and-scroll.md`, or `performance.md` — `transition: all`,
  layout/paint properties in a transition, the 300ms interactive ceiling, the 150ms hover
  ceiling, `ease-in` outside an exit, `linear` on spatial movement, inline spring curves,
  decorative and unpaused infinite loops, stagger past the 500ms budget, rest-state
  `will-change`, non-passive scroll listeners, scroll-jacking, effects that start motion
  without a cleanup, and motion with no `prefers-reduced-motion` policy in scope.
- **`validators/check-aesthetic-slop.js` — the named defaults, made checkable.**
  `brain/design-intelligence.md` has always listed the model's own failure modes
  (centered-everything, gradient abuse, card-itis, emoji-as-icons); naming a failure mode
  in prose only helps a reader already looking for it. Now a gate. First validator with a
  severity model: P1/P2 fail the run, P3 taste advisories print and exit `0` (`--strict`
  promotes them), because "you picked the obvious thing" is a conversation, not a compile
  error.
- **`motion/recipes.md`** — the implementation layer under the motion laws. Sixteen
  copy-paste recipes already wired to the tokens and already compositor-safe, each passing
  `check-motion.js` as written.
- **`motion/physics.md`** — gesture mechanics a duration-and-easing system cannot express:
  the two-parameter spring (duration + bounce, with the conversion to stiffness/damping),
  1:1 pointer tracking, the rubber-band resistance function, momentum projection
  (`(v/1000)·d/(1−d)`), the 0.11 px/ms dismissal threshold, and velocity inheritance.
- **Design dials in `brain/brief-compiler.md`** — `DESIGN_VARIANCE`, `MOTION_INTENSITY`,
  `VISUAL_DENSITY` (1–10), with an inference table per brief type and explicit bindings to
  the modules each dial governs. Above `MOTION_INTENSITY 3` a reduced-motion path stops
  being optional.
- **`designos find <query>`** — BM25 retrieval over a curated library of motion presets and
  type pairings (`bin/library-data.js`). The kernel's first directive is "never design from
  memory alone"; loading a module satisfies that for rules, but concrete artefacts still
  came from recall. Every entry names the module that governs it, and every type pairing
  carries its counter-case.
- **`designos visual --baseline` / `--compare`** — iteration measurement built on the
  existing Playwright pass. Records a before, renders the after, and reports pixels changed,
  the changed band, and full-page height shift per viewport, with a diff image per frame.
  `--max-diff <pct>` turns it into a regression gate. Without Playwright it reports
  NOT RUN, as before.
- **The adversarial panel in `workflows/final-gate.md`** — isolated reviewers that receive
  the artifact and the rubric dimension but not the rationale, told to refute rather than
  confirm, with a mandatory verbatim **DEGRADED** banner when no panel could run.
- **Named Defaults section in `PROOF_STANDARD.md`** — the literal ban lists (placeholder
  identity, filler copy, visual defaults, em-dash cadence) that `check-aesthetic-slop.js`
  enforces.

### Fixed
- **`check-token-contrast.js` now walks the cascade.** Its documented blind spot was
  inherited color over an ancestor's background — which is the ordinary case, since almost
  nobody re-declares the background on the element holding the text. It now builds the
  element tree, matches simple selectors with real specificity ordering, inherits `color`
  down, walks *up* for the nearest painted surface, and composites translucent layers
  before judging. Combinators, attribute selectors, and pseudo-classes are skipped rather
  than guessed. Also fixes a parser bug where a comment above a rule was absorbed into its
  selector, silently preventing every match.
- **Seven real WCAG failures in this repo's own artifacts**, all found by the new
  validators and none visible to any previous gate: the site's `h1` display ramp ended on
  `#10b981` (2.54:1 on white — failing even the 3:1 large-text bar), the score value and
  eyebrow labels sat at 2.54:1 and 3.77:1, and muted text in three terminal blocks ran
  3.46–4.05:1. Fixed at the token layer with `--accent-text` / `--success-text` and
  corrected `--code-muted` / `--dim` / `--code-comment` values.
- **Fifteen motion violations in this repo's own artifacts**: five skip links animated
  `top` instead of `transform`, the website animated `box-shadow` directly (now the
  `::after` opacity crossfade from `performance.md`), two `transition: all` declarations,
  two transitions over the 300ms ceiling, and two inline spring curves (now the single
  `--ease-spring` token).
- **Exported rules files now resolve module paths.** `export` (all targets — AGENTS.md,
  `.cursorrules`, copilot-instructions, …) rewrites every kernel module reference
  (`foundations/colors.md` → `DesignOS/foundations/colors.md`). Claude Code's `@import` resolved
  these relative to the kernel's location, but every other agent reads the rules file
  from the project root and would look for `foundations/colors.md` where it doesn't exist —
  silently breaking module routing on Antigravity, Cursor, Copilot, Codex, and every
  agents.md-standard tool. Covered by a new `test-cli.js` regression test.
- **`goldens/` artifacts held to their own bar:** the three golden HTML artifacts now run
  through `check-a11y-basics` + `check-drift` in CI and `npm run validate`; fixed the one
  finding this surfaced (an unlabeled `!important` in a reduced-motion reset, now carrying
  its documented `drift-ok` reason).
- `llms.txt` refreshed with the newer discovery surfaces: adapters, recipes, goldens,
  references.

Visual-gate hardening, driven by a real field failure (the "Vigilant AI" test build):
a generated site shipped a navbar that collided at 1024px, had zero navigation on
mobile (links hidden, no menu button), rendered raw LaTeX (`$T+00s \to T+04s$`) as UI
text — and the agent then rewrote a "Browser render not run" report into
"4 viewports verified, 100/100."

### Added
- **`visual` renders 1024px** (mobile/tablet/laptop/desktop) — the classic nav danger
  zone was the one width the browser pass skipped.
- **Nav render checks in the browser pass:** `nav-overflow` (header content overflows
  its bar), `nav-wrap` (items wrap or escape bar bounds), `nav-unreachable` (all links
  hidden with no menu button) — all P1.
- **Static checks in `review`:** `artifact-leak` (LaTeX/markdown syntax rendered as
  visible text) and `nav-hidden-no-menu` (media query hides links, no menu control in
  the document) — both P1, verified against a regression fixture (risk floor 100 → 59).
- **Playwright resolution fallback:** `visual` now also resolves Playwright from
  DesignOS's own `node_modules` via `NODE_PATH`, not just the project's.
- **`components/navigation.md`: "The width budget & the crowded middle (769–1279px)"**
  — measured collapse breakpoints, zero-wrap bar law, hiding-requires-replacing,
  auxiliary widgets yield first, test-1024 rule; plus matching anti-patterns and
  checklist rows.
- **`workflows/final-gate.md`: the renarration ban** — generated reports are quoted,
  never paraphrased upward; "NOT RUN"/"NOT ASSESSED"/unchecked boxes must survive into
  the delivery summary verbatim. New first-pass traps: menu-less hidden nav, 1024
  header collision, LaTeX/markdown artifacts.
- **Report language hardened:** the visual report's not-run state now explicitly labels
  every viewport row UNVERIFIED and names renarration as fabrication.

Universal-agent reach: first-class support for the open [agents.md](https://agents.md)
standard and LLM discoverability.

### Added
- **`components/visual-effects.md` — the "wow" execution catalog.** The system taught
  restraint and *where* to spend the signature budget (`brain/originality.md`) but had
  no concrete recipes for *how*: radial glow/light leak, gradient mesh with grain-pass
  banding control, noise overlay, line-grid/dot-matrix with mask fades, gradient text,
  border beam (`@property` conic ring), pointer spotlight, glass surfaces with
  fallbacks, framed screenshots, logo marquee — each with exact values, cost notes,
  touch/reduced-motion gates, and a hard one-backdrop-one-interaction budget. Wired
  into the kernel routing table (new "wow effects" row + the "premium/modern" row),
  `components/hero.md` background treatments, and the README/website module counts.
- **The showcase practices the new module:** `examples/showcase-relay.html` now carries
  exactly the budgeted pair — an off-center amber hero glow + 3% grain pass (backdrop)
  and a `hover: hover`-gated pointer spotlight on the feature cards (interaction) —
  with the decision trail appended to `examples/saas-landing-walkthrough.md`, including
  the effect that was *rejected* to stay inside the budget. Verified in-browser
  (render, hover behavior, custom-property writes) plus `check-drift`/`check-a11y-basics` clean.
- **Root `AGENTS.md`** — a byte-identical mirror of the kernel, so agents.md-standard
  tools (Codex CLI, Gemini CLI, Amp, Zed, Jules, …) boot DesignOS from a clone with
  zero setup. Sync is enforced: a `test-cli.js` unit test and a dedicated
  `validate.yml` CI step both fail if the mirror drifts from `CLAUDE.md`.
- **`export agentsmd` CLI target** — writes the kernel to your project's `AGENTS.md`
  (included in `export all`).
- **`llms.txt`** — the llmstxt.org discovery file mapping the kernel, brain, loop,
  rubric, and getting-started docs for LLM consumers.
- Animated `press/demo.gif` (rendered from `demo.svg`) now used at the top of the
  README — GitHub does not run SMIL animations inside `<img>`, so the SVG rendered
  as a static frame there.

### Changed
- **`export` no longer overwrites hand-written rules files.** Any export destination
  that exists without the DesignOS generated-file header is skipped with a warning
  (`--force` overrides) — previously `export all` would clobber a project's own
  `CONVENTIONS.md` or `AGENTS.md`.
- `AGENTS.md` and `llms.txt` added to the npm `files` list; export-target listings
  updated across README, GETTING-STARTED, CHEATSHEET, and `integrations/README.md`.
- Website hero/score grids: `min-width: 0` on grid children so long content can't
  force horizontal overflow at narrow viewports.

## [2.1.0] — 2026-07-17

The productization wave: DesignOS becomes something teams can run in PRs, not only
something agents can read.

### Added
- **Proof and adoption expansion:** `PROOF_STANDARD.md`, independent eval guidance,
  Run 003 call, case-study template, team rollout, and PR review workflow.
- **New quality modules:** command palettes, data density, loading skeletons, product
  tours, failure taxonomy, and scorecard examples.
- **Antigravity hardening:** `adapters/antigravity.md`, maintainer-observed Run 003
  notes, stronger proof-risk detection, token-aware review exceptions, and
  `designos review --fix-prompt`.
- **Taste and productization layer:** visual reference packs, golden target bars,
  memory packs, copyable starter code, `designos starter`, `designos visual`, and
  `designos brief --interactive`.
- **Browser-grade visual QA:** `designos visual` now runs real Playwright screenshots
  when Playwright is installed, and the Review Action comments include a collapsible
  agent-ready fix prompt.
- **Proof-collection CLI:** `designos report` writes a delivery report with review
  gate, fix prompt, and sign-off checklist; `designos eval` scaffolds independent
  benchmark folders; `designos case` creates external case studies plus a ready
  `SHOWCASE.md` row.
- **Premium elevation layer:** `designos elevate` generates an agent-ready refactor
  prompt for taste, signature vehicles, product artifacts, proof quality, hierarchy,
  and state depth; `brain/taste-ladder.md` and `workflows/premium-redesign.md` define
  the 70→99 upgrade path.
- **First-pass hardening:** `workflows/final-gate.md` makes deterministic CLI review
  mandatory before any 95+/100/SHIP claim, and the kernel/brief/score commands now forbid
  unsupported score claims and unsourced hard compliance language.
- **`designos review <file-or-dir>`** — deterministic design-risk scoring for UI files:
  a11y tells, contrast risk, fake proof, token drift, missing states, and a
  six-dimension gate score. Supports `--json`, `--min`, and `--no-fail` for CI.
- **`designos brief`** — structured brief generator for high-signal agent prompts,
  with `--type`, `--industry`, `--audience`, `--goal`, `--tone`, `--constraints`,
  and `--out`.
- **DesignOS Review Action** — `.github/actions/design-review`, documented in
  `actions/README.md`, for drop-in PR review workflows.
- **Adoption surface:** `playbooks/`, `adapters/`, `recipes/`, `case-studies/`, and
  `evals/runs/` so real-world use, agent setup, and independent proof have permanent
  homes.
- **Starter packages:** Next SaaS, React dashboard, landing page, mobile app, and docs
  site recipes under `starter/`.

### Changed
- README now links the review action, starters, recipes, adapters, case studies, and
  real-project adoption playbook from the main proof/adoption path.
- `package.json` exposes `npm run review` and `npm run brief` convenience scripts and
  packages the new adoption folders.

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
