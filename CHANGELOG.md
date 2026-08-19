# Changelog

All notable changes to DesignOS.

## [Unreleased]

## [2.7.0] — 2026-08-18

### Fixed — the Ceiling Contract (CLAUDE.md §4.5) was wired into nothing
`validators/check-craft-ceiling.js` — the validator built to catch flat, generic, inert
output — ran in zero places an agent or CI actually consults: not in `bin/designos.js`'s
`review` command (what CLAUDE.md tells an agent to run before claiming SHIP), not in
`rule-registry.js`'s PROVIDERS (`designos detect`/`designos audit` never saw it), not in
`npm run validate`, not in any GitHub Action. Reproduced directly: a deliberately generic
"2020 SaaS template" sample (indigo accent, Inter, three equal feature cards, zero
elevation, zero texture, no arrival, "Powerful. Fast. Secure." headline) scored a clean
100/0 findings through `designos review --min 95`.
- `bin/designos.js`'s `analyzeDesignFile` now merges `check-craft-ceiling.js`'s findings
  into the review report; `summarizeReview` caps UI Craft at 89 when any Ceiling-Contract
  presence finding survives — the exact number CLAUDE.md §4.5 already states but nothing
  previously enforced. The reproduction sample now scores 84/8 findings and fails
  `--min 95`.
- Registered as a `rule-registry.js` provider (deliberately non-strict — this repo's own
  `examples/`/`website/`/`goldens/` carry pre-existing gaps this registration surfaces for
  the first time; `designos detect`/`designos audit` now see them).
- Fixed two vendoring gaps this exposed: `sync-vendor.js`'s file list never included
  `check-craft-ceiling.js` (the standalone `packages/designos-detect` package threw
  `MODULE_NOT_FOUND` at runtime), and `check-vendor-sync.js` had no way to catch that —
  it only diffs files already present in `lib/`. It now derives the required file list
  from the vendored `rule-registry.js` itself, the same pattern `check-package-boundary.js`
  uses against `package.json`.

### Fixed — two check-craft-ceiling.js rules missed the zero-effort case
Both `ceiling-flat-elevation` and `ceiling-uniform-rhythm` existed to catch a page that
never tried, and both only fired on a page that tried and got it slightly wrong — the
inversion of what a positive requirement should mean. `ceiling-flat-elevation` required at
least one resolvable shadow before judging anything, so a page with card surfaces and zero
shadow anywhere — the flattest possible page — produced no finding. `ceiling-uniform-rhythm`
only looked at `<section>`-tag pages with 4+ sections; a short hero + one features-grid
page (the most common "MVP" shape) carrying 3+ identical cards was invisible to it
entirely. Both fixed and verified against live reproductions, a false-positive check, and
this repo's own showcase content.

### Added — adjective-listing headlines ("Powerful. Fast. Secure.")
`check-aesthetic-slop.js`'s filler-copy list caught the hype-startup register
(revolutionize, supercharge, unlock the power) but had nothing for the equally common flat
register — short capitalized single-word sentence fragments in a row. `industries/saas.md`
names this exact anti-pattern by literal example but nothing executable implemented it.
Added as a structural pattern (shape, not vocabulary) so it generalizes.

### Fixed — `suggest`'s own palette contradicted its own sector modules
`bin/suggest-data.js`'s SaaS palette recommended indigo (#4F46E5) — `industries/saas.md`
explicitly names "electric blue/indigo" as safe-crowded and suggests a warm counter-move.
Changed to amber, contrast-reverified. Separately, 5 pairs of unrelated sectors
(fintech/crm-erp, ai-startup/cybersecurity, healthcare/hr-recruiting,
food-restaurant/media-news, insurance/manufacturing-b2b) shared byte-identical accent
colors; one member of each pair now gets a distinct, contrast-verified hue fitting that
sector's own written style line. `website/suggest.html`'s hand-synced mirror updated to
match. `foundations/typography.md`'s SaaS pairing-recipe row recommended Inter/Geist/
General Sans as if that were the answer, undercutting its own "Type identity" section
three lines later — added an opinionated-alternative column so the table nudges toward a
deliberate choice for the single most common brief this system routes.

## [2.6.0] — 2026-08-18

### Fixed — P0: `npx github:.../DesignOS init` and every npm/git install were broken
`scripts/postinstall-playwright.js` (referenced by the `postinstall` lifecycle script) was
never in `package.json`'s `files` allowlist, so it shipped in the repo but not in the
published tarball — verified with `npm pack --dry-run`, a real tarball install, and
`npx github:ardamoustafa1/DesignOS init`, all three reproducing `Cannot find module
'.../scripts/postinstall-playwright.js'`. This affected every install path, including the
already-tagged `v2.2.0` release. Fixed by adding the file to `files`; `validators/check-
package-boundary.js` now also derives a check from `package.json`'s own `bin`/lifecycle-
`scripts` entries (not hand-maintained) so a future script in the same position fails CI
instead of shipping broken — `.github/workflows/release.yml` also gained an install smoke
test (pack → install into a scratch dir → `designos doctor`) so this class of bug can't
reach a tag again.

### Fixed — `check-token-contrast.js`: three independent bugs, one file
- `hsl()`/`hsla()` colors (literal or in a `--token: hsl(...)` custom property) were
  invisible to `parseColor`/`resolveValue` — a token stack built on `hsl()` (Tailwind's
  default format, all of shadcn/ui) got zero contrast coverage. Added HSL→RGB resolution;
  `oklch()`/`lab()`/`lch()`/`hwb()` remain explicitly out of scope (documented in the
  file's "Honest scope" header, not silently dropped).
- `collectTokens` only captured hex-valued `:root` custom properties — an `rgb()`- or
  `hsl()`-valued token was invisible even after the parseColor fix, because it never
  entered the token map at all. Now captures the full declaration value.
- The same-rule pass's reported line number anchored on the selector's start (everything
  since the previous rule's `}`, including blank lines between rules), not the rule's own
  `{` — a violation could be reported dozens of lines from where it actually is. Fixed to
  anchor on the rule's real `{` position.
All three verified with reproduction fixtures before the fix and regression tests
(`validators/test-cli.js`) after.

### Fixed — a stray stdout line was silently dropping findings from the JSON ledger
`check-aesthetic-slop.js`, `check-drift.js`, and `check-token-contrast.js` all printed a
human-readable `skipped (ignore directive): <file>` line to stdout even when `--json` was
passed. `validators/run-registry.js` `JSON.parse`s each provider's stdout whole — one
polluting line breaks the parse, and the provider's real findings silently vanish from the
ledger `designos detect --json` and CI consume, while the run still reports "clean". This
existing on `check-aesthetic-slop.js` against this repo's own `website/` target — not just
a synthetic reproduction. Fixed by routing that line to stderr when `--json` is set;
`run-registry.js` also now reports (and fails on) a provider that emits invalid JSON,
instead of silently treating it as zero findings.

### Security — Live Director: CSRF/DNS-rebinding protection, XSS fix
`bin/live-director.js`'s local API (`/api/annotations`, `/api/locks`, `/api/accept`,
`/api/reject`, `/api/rollback`, `/api/merge`) had no Host/Origin validation and no auth —
verified live: a foreign-Origin, `Content-Type: text/plain` POST (a "simple request", no
CORS preflight, so any page on the internet could send it) successfully wrote to
`/api/locks`. Fixed with a per-process random session token embedded in the served page,
required on every state-changing request alongside a Host allowlist (defends DNS
rebinding) and an Origin/`Content-Type: application/json` check. Also fixed unescaped
`innerHTML` string-concatenation in `bin/live-director.js` (annotation notes, semantic
diff values) and `bin/motion-lab.js` (recorded event log) — replaced with `textContent`-
based DOM construction. `validators/test-live-studio.js`'s real-browser contract test
still passes unmodified against the new token/Host/Origin gate.

### Security — composite action `${{ inputs.* }}` no longer lands inside a `run:` script
`.github/actions/design-review/action.yml` interpolated `${{ inputs.path }}`,
`${{ inputs.min-score }}`, etc. directly into its bash `run:` block — `${{ }}` is
substituted textually by the runner before bash parses anything, so a caller able to
control an input (e.g. a workflow that feeds `path` from PR-supplied data) could break out
of quoting and run arbitrary shell. Every input now flows through `env:` and is referenced
as a normal shell variable instead.

### Fixed — 4 workflows had no `permissions:` block
`browser-gate.yml`, `native-smoke.yml`, `proof.yml`, and `validate.yml` inherited the
repository's default `GITHUB_TOKEN` scope (which can be `write-all` depending on org
settings) while running `npm ci` and third-party actions on every PR. All four now
declare `permissions: contents: read` explicitly.

### Fixed — `npm test` hard-crashed on any fresh/offline/sandboxed checkout
The old `test` script was 31 scripts joined by `&&`; the first failure (commonly one of
the 3 scripts that launch real Chromium via Playwright — `test-torture-simulator.js`,
`test-image-to-code.js`, `test-ax-timeline.js`, verified by tracing which bin scripts each
one actually spawns) silently skipped every script after it with no summary. Replaced with
`scripts/run-tests.js`: `npm test` now runs only the 28 scripts that never need a browser
(always runnable right after `npm ci`, even with `--omit=optional`/offline), `npm run
test:browser` runs the 3 that do, `npm run test:all` runs both — every script always runs
regardless of earlier failures, and the run ends with a `N/M passed` summary naming what
failed. CI (`release.yml`, `browser-gate.yml`, both of which already install Chromium)
switched to `npm run test:all` to keep full coverage.

### Fixed — Chrome extension (`extension/`) could not load
`manifest.json` referenced `assets/icon-{16,48,128}.png`, and the directory didn't exist —
Chrome refuses to load an extension with a missing icon. Added real icons generated from
`press/logo-3d.png`, and synced the manifest version (`1.0.0`) to the project version.

### Fixed — assorted correctness/hygiene
- `validators/contrast.js`: `--min` with no value silently became `parseFloat(undefined)`
  = `NaN`, and `ratio >= NaN` is always `false` — a real 21:1 pair would report failure.
  Now a usage error. The hex-length filter accepted 4/5/7/8-digit values that `parse()`
  then rejected anyway; narrowed to the 3-or-6-digit lengths `parse()` actually handles.
- `bin/designos.js`: `--audience` was listed twice in the `VALUE_FLAGS` set (no functional
  effect — it's a `Set` — but a genuine copy-paste artifact).
- `bin/motion/browser-target.js`, `bin/lighthouse-gate.js`, `bin/live-director.js`'s three
  local static servers checked path traversal lexically (`path.resolve` + prefix check)
  but never resolved symlinks — a symlink inside the served root pointing outside it could
  still leak an arbitrary file. All three now also verify the `fs.realpathSync`-resolved
  path stays inside the realpath-resolved root; verified with a live symlink-escape
  reproduction against `bin/motion/browser-target.js` (200 + leaked content before, 403
  after).
- `bin/cli/commands/detect.js`'s docstring hardcoded "39-rule registry"; the registry has
  40 rules (`validators/rule-registry.js`). Reworded to point at the source of truth
  instead of restating a number that will go stale again.
- Removed `designos-visual/` (22MB of generated screenshots/a11y JSON), `designos-visual-
  report.json` (5.1MB), and three generated `.md` reports from git tracking — reproducible
  `designos visual/report/elevate` output, not source; `.gitignore` updated. (Existing git
  history is unchanged — that's a separate, deliberate `git filter-repo` operation with
  its own blast radius, not bundled into this fix.)

### Known gaps not closed in this pass
A full technical audit (`DesignOS-Denetim-Raporu.md`, 13 Ağustos 2026) also named several
larger, lower-severity items intentionally left open rather than rushed: no linter/
formatter across 170 JS files, ~2,283 lines duplicated between `validators/` and
`packages/designos-detect/lib/` (currently managed by `sync-vendor.js` + CI drift check,
not eliminated), several oversized files/functions (`bin/designos.js` at 1,635 lines) and
minified inline `<script>` blocks that are unreadable in diffs, stale non-English READMEs
(`README.tr.md` etc. — separate from this release's `i18n/tr/CLAUDE.md` module
translation), `validate.yml`'s live network dependency on `check:links` on every PR, and
no test coverage measurement (no `node:test`/`c8`). Each needs either a scope decision
(how much to invest in dev tooling for a project this size) or a genuine architectural
change (splitting the CLI, a workspace restructure) rather than a same-session fix.

### Added — first `i18n/` module translation (Turkish kernel)
- `i18n/tr/CLAUDE.md`: a Turkish translation of the root `CLAUDE.md` operating kernel —
  the one file every agent reads before any other module (boot sequence §1). File paths,
  module names, code fences, and CLI flags are left untranslated since they are literal
  references other files and commands depend on; a header comment states the English
  source is binding on any conflict.
- `i18n/README.md`: documents the convention for adding further translations (mirror the
  source's relative path, never translate literal references, update the coverage table)
  and records honestly that this covers 1 of 98 knowledge modules — not translation
  parity. `validators/check-modules.js`'s `MODULE_DIRS` intentionally excludes `i18n/`,
  so translated copies are not held to the English originals' anatomy checks.
- `ROADMAP.md`'s "Module translations under `i18n/`" Planned item is narrowed to reflect
  what's actually left (97 remaining modules) rather than removed outright.

## [2.4.0] — 2026-08-18

### Added — Design-review GitHub Action v2 (PR-diff scoping + advisory model pass)
- `.github/actions/design-review` gains a `diff-only` input: instead of a fixed `path`,
  it computes the merge-base against `base-ref` (or `GITHUB_BASE_REF` on `pull_request`),
  stages only the changed reviewable files (`html/css/js/jsx/ts/tsx/vue/svelte/mdx`), and
  reviews that. A diff with no reviewable files produces a clean "nothing to review"
  report instead of failing.
- `.github/workflows/design-review.yml` now runs `diff-only: true` on `pull_request`
  events and keeps the full `examples/` pass on `workflow_dispatch`.
- New optional `model-review` input (default off): when `true` and an
  `ANTHROPIC_API_KEY` repository secret is present, `model-review.js` sends the changed
  files plus `scoring/rubric.md` to the Anthropic Messages API and appends the response
  to the sticky PR comment under a section explicitly labeled advisory and
  non-deterministic — it is never read by `fail-under-min`. Absent a key, this step is
  skipped with a log line, not a failure.

### Fixed — v1's score output was always `"undefined"`
- The composite action read `r.summary.overall`, a field the CLI's review report has
  never emitted (it emits `summary.staticRiskFloor`). Every real run would set
  `score="undefined"` and then hard-fail the `[ "$SCORE" -lt "$min-score" ]` bash integer
  comparison with `integer expression expected` — the action could not have passed on a
  real PR. Verified against a live clone: before the fix, `score` was the string
  `undefined`; after, it reports the same `staticRiskFloor` the CLI prints
  (`node bin/designos.js review <path> --json`).

## [2.3.0] — 2026-08-18

### Added — mandatory blind screenshot critique before SHIP language
- `loops/design-loop.md` stage 6 (REVIEW) now gates on the blind screenshot critique
  defined in `workflows/final-gate.md`: an independent, blind reviewer (or a
  DEGRADED-flagged self-pass) judging real screenshots with zero framing, answering
  "would this be mistaken for another AI-generated template?" A source-code read of your
  own work no longer satisfies this stage.
- `workflows/final-gate.md` documents the five-step protocol (render → hand to a blind
  reviewer → harsh 1–10 verdict → action or reject every finding → re-render as evidence)
  and adds it as a required row in the pre-gate checklist — missing it blocks SHIP
  language the same as any other missing check. Closes the Run 004/005 failure mode where
  a clean rubric self-score and a passing `check-craft-ceiling.js` run still let a
  generic, self-reviewed page through.

### Added — §4.5 requirement 7: one memorable moment (material or motion, never both)

`brain/wow-calibration.md` names four routes to memorable — composition, material, voice,
motion — and ranks motion fourth: "before opening the catalogue, answer: could composition,
material, or voice carry this?" The Ceiling Contract covered composition (requirement 4) but
had no requirement for the other measurable routes, so a page could satisfy every other item
and still be inert and generic — no artifact, no signature, nothing to remember.

- **`CLAUDE.md` / `AGENTS.md` §4.5, requirement 7.** Closes on EITHER route: an inspectable
  material artifact (a real table, code block, chart, or framed screenshot) OR evidence of
  one licensed signature technique. Never both, and never motion specifically — voice is the
  fourth route and is correctly left unchecked because a regex cannot judge copy quality.
- **`validators/check-craft-ceiling.js` — `ceiling-no-memorable-moment` (P3).** Material
  detection: `<table>`, a substantial `<pre>`/`<code>` block, an inline `<svg>` with real
  chart markup, or a "framed screenshot" selector (shadow + radius, name matching
  `shot|screenshot|frame|artifact|report|plate|preview`). Motion detection: reuses
  `validators/signature-fingerprints.js`'s eleven named techniques, plus three broader
  mechanism patterns matched by shape rather than by motion/signature-moments.md's sample
  function names — `@property --angle` + conic-gradient (border beam), pointermove + a
  `.style.transform` write + `will-change` toggle (pointer-follow — magnetic/spotlight/tilt
  share this shape), and a `position: sticky` stage inside a rail ≥150vh (scroll story).
- **Verified in both directions**, not just "clean run" — `validators/test-craft-ceiling.js`
  asserts a material-only fixture and a motion-only fixture both pass, so the rule cannot
  regress into silently requiring both routes. `examples/rehearsal-devtool.html`
  (material-led, no JS signature) and `examples/editorial-portfolio.html` (a pointer-follow
  plate, no table) are the real-world proof: both stay clean.
- Sweep: `systems/` stays at 0 violations / 0 advisories (every generated fixture has a
  table). `goldens/`, `website/`, `examples/` gain zero new violations and a handful of new
  advisories on surfaces that genuinely have neither route yet — logged honestly in
  `LIMITATIONS.md` §7 rather than papered over with a placeholder table.

### Fixed — the reference artifacts now meet the Ceiling Contract

The 16 §4.5 violations logged as `LIMITATIONS.md` #7 are closed, and the two checker bugs
found while closing them mattered more than the artifacts did.

- **`goldens/`: 8 violations → 0.** Every golden shipped `ui-sans-serif` as its brand face.
  All seven pages now name real faces and degrade through them; `flagship-launch` also
  gained a declared light model, a three-level tinted elevation stack with lit edges, grain,
  fill gradation with hero→footer falloff, one surface above elevation 1, display tracking
  on the hero, and a second container width. Pixel-diff evidence regenerated with
  `npm run update:goldens`; `npm run test:goldens` verifies clean.
- **`website/`: 8 violations → 0.** Seven pure-black cast shadows tinted to the site's own
  ink hue. The deliberate anti-pattern exhibit in `before-after.html` is opted out with a
  stated reason rather than "fixed" — its Arial stack and black glow are the specimens on
  display.
- **Two checker false negatives fixed.** `--shadow-rgb: 4 6 12` parsed as a single-layer
  cast shadow, so `ceiling-flat-elevation` reported the flattest possible verdict on files
  whose elevation was correct; and `#100D0A` did not match `rgb(16 13 10 / .72)` as one
  palette entry, so `system-offpalette-color` fired on legitimate use of the ground at
  alpha. Both would have hidden real failures behind noise.
- **Large piped JSON was truncated.** `check-system-integrity`, `check-system-conformance`,
  and `check-craft-ceiling` called `process.exit()` immediately after writing their `--json`
  report; past the 64KB pipe buffer that truncates the payload mid-string. All three now set
  `process.exitCode` and return.

### Added — `validators/check-system-integrity.js`

`check-system-conformance.js` asks whether a page obeys its system. This asks whether the
system is coherent at all, which turns out to be the prior question — and the answer for an
imported catalog is mostly no.

```
npm run audit:systems
150 packages judged · 140 over the 20% threshold
1203/1925 colours named in prose (62%) do not exist in the token layer
```

Twenty-five packages disagree with themselves completely. `atelier-zero` specifies warm
ivory paper `#efe7d2` and a coral accent `#ed6f5c` under the sentence "All values are
tokens. Do not invent new hex", above a token file that reads pure white with a black
accent. Two rules: `system-prose-token-drift` (a named colour exists nowhere in the tokens)
and `system-prose-ground-drift` (prose and tokens disagree about the ground, the one value
everything else derives from). Fixtures separate agrees / contradicts / ground-drift /
too-thin; `kiln` measures 0%. Wired into `npm test`.

### Added — oklch support in the importer

`oklch()` grounds are converted to sRGB exactly (verified against the canonical red and
both achromatic endpoints), so the light-model derivation no longer skips packages that
declare colour in oklch. `cloudflare-kumo` imports; the catalog is 152/152.


### Added — a 152-package system catalog, imported and upgraded

`systems/` went from one package to 152: `kiln` (authored) plus 151 imported from
nexu-io/open-design's catalog (Apache-2.0).

- **`scripts/import-design-systems.js`** — the importer, and the reason this is not a copy.
  Every upstream package shares one token schema whose elevation is `--elev-flat` +
  `--elev-ring`: no light source, no tinted shadow, no lit edge, no texture, no arrival —
  a flat page by the standard in `CLAUDE.md` §4.5. For each package the importer derives,
  **from that package's own palette**, a light model, a three-level elevation stack whose
  shadow hue is the package's own ground (never black alpha), a lit-edge value chosen by
  whether the ground reads light or dark, grain at the opacity that ground can carry, and
  arrival timing using the upstream easing. It then generates `lint.json` and a component
  fixture, so each package is *checkable* rather than only readable.
- **`scripts/templates/system-example.html`** — the generated fixture. Declares no colour,
  radius, spacing step, or easing of its own; resolves entirely against `tokens.css`.
- **`systems/NOTICE`** — upstream project, licence, imported commit, and the full list of
  modifications, as the upstream licence requires. Also states the trademark position for
  the packages named after real companies. The importer refuses to run without licence text
  to carry, and refuses copyleft outright.
- **`designos system list`** now groups by category and takes `--category`, `--grep`, and
  `--verbose`; an unfiltered dump of 152 packages is unreadable.
- Every package passes `check-system-conformance.js` against its own contract **and**
  `check-craft-ceiling.js` with zero findings. `validators/test-system-conformance.js`
  asserts both for every directory under `systems/` on each `npm test`, and was verified to
  fail when a single package is made to drift.
- `cloudflare-kumo` is skipped: its ground is `oklch()` and the light-model derivation needs
  an sRGB hex. The importer reports the skip rather than guessing.

Honest scope in `LIMITATIONS.md` §8: breadth is now at parity, field evidence is not — no
product has been built with any of these, the generated accent budgets are untested
defaults, and an imported brand system produces competent imitation, which is what
`brain/originality.md` argues against. Two of the seven ceiling requirements (section
rhythm, optical corrections) are composition decisions and cannot be imported at all.

### Fixed — three more validator bugs, all surfaced by importing 152 stylesheets

Running the gates over a catalog an order of magnitude larger than the repo had before is
the cheapest fuzzing available, and it found bugs that would have fired on anyone's code:

- **`check-craft-ceiling.js` judged token layers as pages.** A stylesheet that only defines
  custom properties has no surfaces, so reporting "every shadow in this file is
  single-layer" on it was noise — 144 false advisories across the catalog. A file whose
  declarations are ≥90% custom properties is now treated as a token layer and skips the
  page-level depth rules; the value rules (black shadows, system fonts, display tracking)
  still apply, because those are wrong wherever they appear.
- **`check-links.js` swallowed the closing backtick of a URL in a code span.** Any
  `` `https://example.com/` `` reported a false 404. The URL pattern now terminates at a
  backtick. `xiaohongshu.com` is added to the skip list — it answers 404 to non-browser
  agents, which is what that list is for.
- **`check-refs.sh` false-positived on link labels**, which is why the importer now emits
  upstream paths as unbackticked markdown link labels rather than code spans.

### Fixed — `check-registry.js` treated comments as cascade

Found by importing 152 stylesheets. The `source-raw-color` rule scanned raw text, so a
`:root` *mentioned in a comment* was taken for the real one and every token after it was
reported as living outside the token layer (4 P1s in one imported package). The rule now
runs against a length-preserving comment-blanked copy, which also subsumes the earlier fix
for hexes inside comments. Vendored copy re-synced.

### Added — design-system packages with a conformance contract

DesignOS could tell an agent how to *think* about type, light, and hierarchy, and had no
way to tell it what *this product's* amber is, what its radius scale is, or how many solid
accent fills a page may carry. The nearest thing — `memory/packs/premium-saas.md` — was
seven bullet points. Reasoning without a system produces a competent median, which is the
same complaint the Ceiling Contract addressed from the other direction.

The tools that already solve this ship brand contracts and inject them into a prompt. That
has one failure mode and it is always the same: the first screen obeys the system and the
fourth has drifted, because nothing was measuring. So packages here carry a gate.

- **`systems/` — the package format.** `manifest.json` (discovery, dials, signature,
  `suits`/`avoid`), `SYSTEM.md` (the prose contract, opening with the light model),
  `tokens.css` (single source of truth), `lint.json` (policy: required tokens, budgets,
  scales — deliberately **no colours**), `example.html` (baked component fixture). Spec and
  honest catalog state in [`systems/README.md`](systems/README.md).
- **`systems/kiln/` — the first package.** Fired-clay editorial system: warm near-black
  ground, one ember accent capped at three solid fills per document, Fraunces with a `SOFT`
  axis that rises with size, three lit elevation levels, grain always on, and a light theme
  that rebuilds the elevation strategy rather than swapping tokens (the ember darkens from
  `#E8703A` to `#B33F14` because `#E8703A` measures 2.65:1 on paper).
- **`validators/check-system-conformance.js`** — eleven rules answering "does this page
  still belong to the system it claims?": off-palette colour, forbidden values, typeface
  drift, radius off-scale, container off-scale, easing off-system, ad-hoc elevation, accent
  overuse, missing texture, missing tokens. **The palette is derived from `tokens.css` at
  check time**, never duplicated into `lint.json`, so the contract cannot drift from the
  values. `var()` references are resolved, so a page written correctly in tokens is still
  checked rather than skipped.
- **`validators/test-system-conformance.js`** — asserts each rule individually against a
  drift fixture, asserts package structure, and asserts that **every package's own
  `example.html` conforms to its own system**.
- **`designos system list | show <slug> | tokens <slug> | check <target> --system <slug>`**
  — `show` prints the whole contract to stdout, so any agent in any CLI consumes it by pipe
  or paste. No daemon, no account, no key, nothing leaving the machine.
- Kernel: boot step 5b loads a system when one is chosen, a routing row for design-system
  requests, and §4.5 now names conformance alongside the ceiling check.

### Fixed — `check-craft-ceiling.js` false positives on correct code

Both found by running the new checker against a token-driven page, which is what the
ceiling asks for in the first place:

- `box-shadow: var(--elev-2)` was counted as a single-layer shadow, so keeping elevation in
  a token layer reported the page as flat. `var()` values are now unresolvable rather than
  flat, and only *cast* shadows (non-inset, non-zero blur) are judged — a focus ring and an
  inset highlight are edges, not failed elevation.
- `@media (max-width: 720px)` was counted as a container width, so a page with correct
  responsive breakpoints and token-based containers was told it had only one width.

### Added — the Ceiling Contract

DesignOS enforced floors almost exclusively: contrast that must pass, tokens that must
exist, named defaults that must never ship. A page could satisfy every rule in the kernel
and still read as flat, unlit, system-font, four-identical-card-sections generated work —
which is precisely the complaint the rules were supposed to prevent. Passing a ban list is
not the same as making something.

- **`CLAUDE.md` / `AGENTS.md` §4.5 — The Ceiling Contract.** Six requirements phrased as
  *must be present*, not *must be absent*: named typefaces, a declared light model with a
  real elevation stack, texture on large fills, section rhythm, a composed arrival, and
  optical corrections. A page meeting §4 and missing §4.5 caps at 89 on UI Craft and
  Distinctiveness. It also states the thing the restraint doctrine kept being misread as:
  **restraint governs effects and signature moments, and never licenses a plain page.**
  The Fourteen Questions became the Sixteen Questions (materiality survives effect-stripping;
  type, light, and rhythm survive the swap test).
- **`foundations/materiality.md`** — new. The layer between "correct" and "expensive":
  declaring one light source, elevation as a four-property stack (occlusion, key shadow, lit
  edge, surface tint) with hue-tinted shadows, two-tone edges, radius nesting, grain and fill
  gradation, and the six optical corrections. Includes the four-step materiality pass.
- **`motion/arrival.md`** — new. The first 1200ms, which `principles.md` ("default: it does
  not move") and `page-and-scroll.md` (above-the-fold excluded from reveals) left uncovered
  between them. Four-beat structure, five reveal vocabularies, index-driven sequencing, and
  the three failure states an arrival must survive. The LCP element never fades in.
- **`foundations/typography.md` § Type identity** — display face chosen for its opinion,
  display-scale optical settings by size band, variable-font axes. `system-ui` /
  `ui-sans-serif` as a brand face is now a named anti-pattern.
- **`foundations/layout.md` § Section rhythm** — no composition repeats in adjacent
  sections, ≥4 per page, ≥2 container widths and ≥2 grounds, one large statement moment.
- **`validators/check-craft-ceiling.js`** — new validator with `validators/test-craft-ceiling.js`
  and two fixtures. Ten rules split P2 (a ceiling rule is contradicted) / P3 (a ceiling
  requirement is absent, advisory unless `--strict`). Wired as `npm run validate:ceiling`
  and into `npm test`.
- **`examples/editorial-portfolio.html`** — the ceiling built out end to end, clean under
  every validator including the new one.

### Known gap

The existing reference artifacts were swept with the new validator and most of them fail
it: `goldens/` 8 violations / 13 advisories, `website/` 8 / 7, `examples/` 0 / 8. Full
table and reasoning in `LIMITATIONS.md` §7. `npm run validate:ceiling` gates on the two
artifacts that conform; `npm run audit:ceiling` reports the gap without failing the build.
The goldens set the imitation bar, so they are the next thing to rebuild — their pixel-diff
evidence has to be regenerated with the artwork, which is a separate pass.

## [2.2.0] — 2026-08-12

### Added — motion module hardening
- Fixed a doc/validator mismatch: `motion-hover-without-pointer-query` (`validators/check-registry.js`)
  cites `motion/micro-interactions.md` as its governing rule, but the file never actually stated
  the `@media (hover: hover) and (pointer: fine)` gating rule for spatial hover effects. Added it.
- `motion/principles.md`: replaced the soft "frequency discount" law with a hard frequency-gating
  table (100+/day → zero animation, tens/day → strip to minimum, occasional → standard, rare →
  delight budget), and added a general **Interruptibility** principle — CSS transitions retarget
  from wherever an element currently is, `@keyframes` restarts from `0%` — for any re-triggerable
  UI (toasts, dropdowns, tooltips), not just gesture handoff (which `physics.md` already covered).
- `motion/recipes.md`: added `@starting-style` (JS-free entrance for `display: none` elements),
  `clip-path: inset()` as a general reveal/wipe/before-after-slider primitive, and a short
  `filter: blur()` crossfade-masking technique for structurally mismatched state swaps. Renumbered
  the reduced-motion recipe to §19 and fixed its cross-reference in `motion/vocabulary.md`.
- `motion/vocabulary.md`: added reverse-lookup rows for all of the above.
- Verified: full `npm test` (63 tests), `npm run validate`, `validate:strict/motion/contrast`,
  `test:goldens`, `test:isolated` (40/40), and `check:links` all still pass clean — no regressions.

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
  `evals/isolated/registry-eval.json`.
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
