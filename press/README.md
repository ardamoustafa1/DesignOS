# Press Kit

Everything needed to write about DesignOS — per our own doctrine
(`patterns/company-pages.md`: journalists on deadline write about whoever makes it easy).

## Boilerplate (copy verbatim)

> **DesignOS** is an open-source "design intelligence" operating system for AI coding
> agents — Claude, Cursor, Copilot, and any agent that reads rules files. It packages
> 60+ opinionated design modules, 24 industry playbooks, a nine-agent review studio,
> and a self-scoring engine with a hard quality threshold: work scoring under 95/100
> on any of six dimensions goes back for another pass before the user ever sees it.
> DesignOS is MIT-licensed, dependency-free, and installs with one command.

**One-liner:** *One prompt in, Stripe-grade UI out — the open-source design brain for
AI coding agents.*

## Key facts

| | |
|---|---|
| What | Markdown-native design OS for AI coding agents |
| License | MIT, zero runtime dependencies |
| Size | 170+ files, ~9,500 lines of design judgment |
| Install | `npx github:ardamoustafa1/DesignOS init --agents --skills` |
| Works with | Claude Code (native) · Cursor · Copilot · Windsurf · Cline · Aider (via `export`) |
| The gate | 6 dimensions, 95/100 threshold, accessibility failures cap at 60 |
| Proof | 4-page showcase with per-decision walkthroughs; blind eval protocol included |

## Assets

- [logo.svg](logo.svg) — light backgrounds · [logo-dark.svg](logo-dark.svg) — dark backgrounds
- Usage: don't stretch, recolor, or set on busy imagery; clear space = the mark's height
- Screenshots: render any `examples/showcase-*.html` or `website/index.html` at
  1440×900 — they're self-contained; or use the before/after demo
  (`website/before-after.html`) for the story-in-one-image
- The scorecard visual: `website/index.html#engine` section

## Story angles (the honest ones)

1. **The self-critic:** an AI that grades its own design work adversarially and redoes
   anything under threshold — with the caught-failure receipts published
   (`examples/*-walkthrough.md`).
2. **Taste as infrastructure:** design judgment encoded as version-controlled,
   PR-reviewable markdown — forkable opinion.
3. **The anti-slop position:** fake testimonials, dark patterns, and invented metrics
   are *instant-fail conditions* in the scoring engine, not style suggestions.
4. **The museum:** 40+ cataloged design crimes (`museum/`) — every exhibit shipped by
   someone having a normal day.

## Contact

Maintainer: via GitHub issues/discussions on the repository · security:
private vulnerability reporting (see `SECURITY.md`).
