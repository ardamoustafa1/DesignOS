# Validators

Mechanical enforcement for the rules machines can check — so the review loop's attention
goes where judgment is needed. Static providers use bash + Node; browser evidence uses the
pinned Playwright and Axe versions in `package-lock.json`. They mechanize the
refactor-loop's *measure* stage (`loops/refactor-loop.md`).

| Script | Checks | Fails on |
|---|---|---|
| `check-refs.sh` | DesignOS internal cross-references | broken module cross-references |
| `check-drift.js` | token discipline in a CSS/HTML codebase | raw hex outside token blocks, px values off the 4-grid, `outline: none` without replacement, `!important` |
| `contrast.js` | WCAG contrast ratio of a color pair | ratio below the threshold you pass |
| `check-token-contrast.js` | same-rule pairs **and** inherited color over an ancestor's painted background | pairs below 3:1 (hard) or 4.5:1 (flagged as large-text-only) |
| `check-a11y-basics.js` | static HTML accessibility tells | images without alt, inputs without labels, missing `<main>`/h1, div-onclick |
| `check-motion.js` | every numeric law in `motion/` | `transition: all`, layout/paint properties in a transition, >300ms interactive, >150ms hover, `ease-in` outside an exit, `linear` on spatial movement, inline springs, unpaused infinite loops, stagger past 500ms, static `will-change`, non-passive scroll listeners, scroll-jacking, effects with no cleanup, motion with no reduced-motion policy |
| `check-aesthetic-slop.js` | the named defaults in `PROOF_STANDARD.md` | **P2:** violet→fuchsia gradient, gradient text, nested cards, emoji-as-icons, filler copy, placeholder identity · **P3 advisory:** default typefaces, warm-craft palette, glass on a flat surface, centered-everything, eyebrow inflation, em-dash cadence |
| `check-registry.js` | unified source rules from `rule-registry.js` | P1/P2 token, semantics, proof, interaction, and motion-contract failures |
| `run-registry.js` | provider commands and their rule/capability ownership from registry metadata | any owned provider failure |
| `bin/browser-gate.js` | rendered DOM, runtime, keyboard, reflow, themes, reduced motion, Axe, Chromium accessibility tree, text spacing, forced colors, declared tasks, AX live announcements, interaction latency, screenshots, and pixel baselines | P1/P2 geometry, accessibility, task, runtime, resource, latency, and visual-regression findings |
| `bin/lighthouse-gate.js` | pinned Lighthouse category scores plus LCP/CLS/TBT lab budgets | category <95, LCP >2s, CLS >0.1, or TBT >200ms |

`rule-registry.js` is the canonical finding contract. Every rule declares its stable ID,
category, severity, enforcing engines, remediation, governing module, exception syntax,
and a failing fixture. Source and browser engines emit the same finding shape, so hooks,
CI, golden tests, and Live Director regression checks cannot silently disagree.
Legacy validator orchestration is also registry-owned: every provider declares its command,
runtime, scope, capabilities, and mapped rule IDs. `run-registry.js` executes that metadata;
the CLI and `npm run validate` do not maintain a second hard-coded validator list.

`check-aesthetic-slop.js` is the one validator with a severity model: P1/P2 exit non-zero,
P3 prints and exits `0` (add `--strict` to promote them). "You reached for the obvious
thing" is a conversation, not a compile error — but it should still be said out loud.

## Usage

```bash
# Inside DesignOS: verify the knowledge base itself
./validators/check-refs.sh

# Against your project:
node DesignOS/validators/check-drift.js ./src ./styles/tokens.css
node DesignOS/validators/contrast.js "#9a9fa8" "#1b1e24" --min 4.5
node DesignOS/validators/check-token-contrast.js ./src ./styles/tokens.css
node DesignOS/validators/check-a11y-basics.js ./dist/index.html
node DesignOS/validators/check-motion.js ./src ./styles/tokens.css
node DesignOS/validators/check-aesthetic-slop.js ./src
node DesignOS/validators/check-registry.js ./src
node DesignOS/validators/run-registry.js --with-refs ./src --json-out .designos/validator-ledger.json
node DesignOS/bin/browser-gate.js ./dist/index.html --out browser-gate.json --screenshots evidence/
node DesignOS/bin/lighthouse-gate.js ./dist/index.html --out lighthouse.json

# or the complete static suite at once
node DesignOS/bin/designos.js audit ./src ./styles/tokens.css
```

Pass the shared token file to `check-motion.js` too: a project-wide
`prefers-reduced-motion` policy declared there counts for every component that imports it,
and without the argument each component file looks like it has none.

`check-token-contrast.js` exists because of eval Run 004: a page passed token discipline
with zero raw hex and still shipped a 3.14:1 badge, because tokens hide the values that
`check-drift.js` polices. Scope is honest — same-rule pairs only; inherited color over an
ancestor background needs a renderer. Passing it is a floor, not a contrast clearance.

Exit codes: `0` clean, `1` findings (CI-friendly). Output format: one finding per line,
`file:line  rule  detail` — pasteable straight into a review report
(`scoring/report-template.md` verification log).

## CI example (GitHub Actions)

```yaml
- name: DesignOS validators
  run: |
    ./DesignOS/validators/check-refs.sh
    node DesignOS/validators/check-drift.js ./src ./src/tokens.css
    node DesignOS/validators/check-a11y-basics.js ./dist
```

## What they deliberately DON'T do

Static checks can't judge hierarchy, taste, or honesty — a page can pass every validator
and still score 70. Validators clear the mechanical floor (`brain/quality-bar.md`
instant-fail sweep, automated); the seven-dimension review still runs above them.
Conversely: a validator finding is never overridden by taste — fix it or record the
exception in `memory/design.md` with a reason.
