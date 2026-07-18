# Case Study: The Live Generator Page (website/suggest.html)

- Live URL: `website/suggest.html` (GitHub Pages once enabled; runs locally via any static server)
- Repository: this repo — every artifact referenced below is committed and inspectable
- Sector: developer tools (DesignOS's own marketing surface)
- Agent surface: Claude Code (Fable 5)
- DesignOS version: 2.1.0, commits `afaa99b` → `762305b` and successors
- **Honesty label: maintainer-session case study.** The system was applied by an agent
  in the maintainer's own session — this is L2 evidence per `PROOF_STANDARD.md`,
  documented because every claim below is verifiable in-repo, not because it is
  independent proof.

## The brief

Build a shareable, zero-dependency, in-browser design-system generator demonstrating
the `designos suggest` engine — and make it pass DesignOS's own gate.

## What the system caught (the actual value trail)

Every finding below was produced by a DesignOS validator or gate step during the build,
then fixed. Nothing here is reconstructed from memory — the validators' output formats
are quoted from the session.

1. **Own-goal grid violations.** First validation pass on the new page:
   `check-drift: 4 finding(s)` — `6px`/`14px` paddings off the 4px grid in the chip and
   tag components. Fixed to token spacing.
2. **The homepage's pre-existing debt surfaced by association.** Running the directory
   sweep for the new page exposed 11 older findings in `website/index.html`: a raw-hex
   gradient (`#09090b → #047857 → #10b981`) now tokenized, an `!important` whose root
   cause was inline styles on the creator link (moved to a class), off-grid `6px`
   spacings, and three macOS traffic-light hexes now carrying documented `drift-ok`
   exemptions.
3. **Render-only bug class, caught by rendering.** The harness's synthesized Enter key
   arrives with `e.key === ""`, which no page can interpret — but testing it exposed
   that some embedded webviews skip implicit form submission entirely. The page now
   carries an explicit Enter handler; the finding generalized into the repo's
   render-only failure taxonomy.
4. **Drift-proofing the demo itself.** The page mirrors the CLI's data; a dedicated
   test (`validators/test-cli.js` — "suggest web mirror") fails if any sector key or
   palette hex on the page diverges from `bin/suggest-data.js`.

## Before / After (verifiable)

| Check | Before | After |
|---|---:|---:|
| `check-drift` on `website/` | 11 findings + 4 on the new page | clean |
| `check-token-contrast` on `website/` | 6 findings (session start: incl. dark-mode 2.77:1 buttons) | clean |
| `designos review` static floor, suggest.html | n/a (page didn't exist) | 100/100, 0 findings |
| Browser pass | — | desktop + 375px, both themes, physical click/keyboard/copy verified over HTTP |

Reproduce: `node validators/check-drift.js website && node validators/check-token-contrast.js website && node bin/designos.js review website/suggest.html`

## What DesignOS did NOT do

The page's concept, information architecture, and copy came from the agent/maintainer —
DesignOS's modules shaped them (`components/hero.md` anatomy, `foundations/colors.md`
token discipline, `patterns/landing-pages.md` argument structure) but a system does not
invent taste. And no part of this case study demonstrates independent adoption; that
remains the open slot in `evals/RESULTS.md` Run 005+.
