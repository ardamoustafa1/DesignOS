<div align="center">

# ⬡ DesignOS

**The Design Intelligence Operating System for AI Coding Agents**

*Claude, Fable, Cursor, Copilot — any agent. One prompt in, Stripe-grade UI out.*

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Made for Claude Code](https://img.shields.io/badge/Made%20for-Claude%20Code-d97757.svg)](https://claude.com/claude-code)
[![WCAG 2.2 AA](https://img.shields.io/badge/A11y-WCAG%202.2%20AA-2ea44f.svg)](checklists/accessibility.md)
[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](CHANGELOG.md)

[Website](website/index.html) · [Before/After demo](website/before-after.html) · [Getting Started](GETTING-STARTED.md) · [Showcase](SHOWCASE.md)

[Türkçe](README.tr.md) · [中文](README.zh.md) · [Español](README.es.md) · [日本語](README.ja.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Português](README.pt.md)

</div>

---

## The Problem

AI agents can write flawless code and still ship interfaces that feel like 2015: cramped
spacing, five competing CTAs, gray-on-gray contrast failures, animations that fight the user.
The model isn't missing capability — it's missing **taste, process, and a quality gate**.

## The Answer

DesignOS is not a prompt pack. It's an **operating system** the agent boots into:

```
You type:   "Design a Stripe-level SaaS landing page."

DesignOS:   boots the kernel → routes to the right modules → loads sector rules
            → runs the Design Loop → scores itself across 6 dimensions
            → iterates anything under 95 → writes decisions to memory
```

The agent stops thinking *"I'll make a button"* and starts thinking
*"Where does attention land, is the CTA winning, would Apple cut this element entirely?"*

---

## The Five Layers

| Layer | What it does | Where |
|---|---|---|
| **1 · Knowledge** | 60+ opinionated modules — foundations, 20 components, 8 psychology, motion, 12 patterns, 4 native | `foundations/` `components/` `psychology/` `motion/` `patterns/` `native/` |
| **2 · Loops** | Research → Wireframe → UI → Review → A11y → Perf → SEO → Refactor → Score | `loops/` |
| **3 · Review Engine** | Adversarial self-scoring, 6 dimensions, hard 95 threshold — plus CI validators | `scoring/` + `validators/` |
| **4 · Memory** | `client.md` `brand.md` `design.md` `pages.md` `todo.md` `bugs.md` `notes.md` per project | `memory/` |
| **5 · Industry Intelligence** | 24 sector playbooks with distinct visual languages | `industries/` |

Plus a **nine-agent studio** (`agents/`): creative director, UX researcher, UI designer,
frontend engineer, motion designer, accessibility specialist, copywriter, SEO, and an
adversarial reviewer with veto power.

---

## Quick Start

One command, from your project directory:

```bash
npx github:<you>/DesignOS init --agents --skills
```

That copies the system into `./DesignOS`, wires `@DesignOS/CLAUDE.md` into your project's
`CLAUDE.md`, registers the 9 specialists as real Claude Code subagents, and installs the
`/design-review` · `/design-score` · `/design-brief` · `/design-tokens` slash commands.

Not on Claude Code? **One export, every agent** ([integrations/](integrations/README.md)):

```bash
npx designos export all    # .cursorrules · copilot-instructions · .windsurfrules · .clinerules · CONVENTIONS.md
npx designos doctor        # verify the install's health anytime
```

<details>
<summary>Manual install (no npx)</summary>

```bash
git clone https://github.com/<you>/DesignOS.git
cd your-project
cp -r ../DesignOS ./DesignOS
echo "@DesignOS/CLAUDE.md" >> CLAUDE.md        # Claude Code auto-loads it
cp DesignOS/agents/*.md .claude/agents/         # optional: real subagents

# or globally, for all projects:
cp -r ../DesignOS ~/.claude/DesignOS
```
</details>

Then just ask:

> *Design a pricing page for a cybersecurity SaaS. Dark theme.*

The agent boots DesignOS, loads `industries/cybersecurity.md`, `patterns/pricing.md`,
`psychology/persuasion.md`, runs the loop, and refuses to hand you anything scoring under 95.

---

## What's Inside

```
DesignOS/
├── CLAUDE.md            ← the kernel: boot sequence, routing, standards, output contract
├── brain/               ← how to think: intelligence · decisions · quality bar ·
│                          references · trend radar · originality
├── agents/              ← 9 specialist personas (Claude Code subagent-compatible)
├── foundations/         ← colors · typography · spacing · layout · grids · icons · a11y ·
│                          design tokens · dark mode
├── components/          ← 20 modules: buttons · forms · cards · nav · footer · hero ·
│                          dashboard · tables · modals · states · badges & chips ·
│                          tooltips & popovers · tabs & accordions · search & ⌘K ·
│                          notifications · charts · code blocks · wizards · file upload ·
│                          pickers
├── psychology/          ← attention · persuasion · cognition · color psychology · trust ·
│                          emotional design · gamification · habit & retention
├── motion/              ← principles · micro-interactions · page & scroll · performance
├── patterns/            ← landing pages · pricing · onboarding & auth · docs sites ·
│                          blog & content · changelog · settings · comparison pages ·
│                          company pages · email design · print & documents ·
│                          conversational/AI UI
├── native/              ← iOS · Android · app patterns · motion & gestures
├── industries/          ← 24 sector playbooks (SaaS → AI → Fintech → … → Manufacturing)
├── loops/               ← design loop · review loop · refactor loop
├── scoring/             ← 6-dimension rubric + report template
├── checklists/          ← pre-flight · a11y · performance · SEO · responsive
├── validators/          ← CI scripts: refs · token drift · contrast · a11y basics
├── evals/               ← the with/without benchmark protocol + 10 briefs
├── memory/              ← per-project memory protocol + 7 file templates
├── workflows/           ← new project · redesign · single component · landing page
├── skills/              ← /design-review · /design-score · /design-brief · /design-tokens
├── integrations/        ← one export, every agent: Cursor · Copilot · Windsurf · Cline · Aider
├── museum/              ← the Anti-Pattern Museum: 40+ cataloged design crimes
├── prompts/             ← the prompt cookbook
├── starter/             ← tokens.css + tokens.json (W3C format)
├── examples/            ← 4-page showcase gallery, each with its decision walkthrough
├── website/             ← the project's own site — designed by the system itself
└── bin/                 ← the zero-dependency CLI: init · agents · skills · export · doctor
```

Quick references: [CHEATSHEET.md](CHEATSHEET.md) — the whole system on one page ·
[GLOSSARY.md](GLOSSARY.md) — the vocabulary, A–Z ·
[The Anti-Pattern Museum](museum/README.md) — learn from 40+ cataloged crimes.

---

## See It, Don't Take Our Word

**Start with the [Before/After demo](website/before-after.html):** the same brief, with
and without DesignOS — every flaw on the "before" page tagged with its
[Anti-Pattern Museum](museum/README.md) exhibit number.

The [`examples/`](examples/README.md) gallery holds **four complete pages produced by the
system** for one fictional product — landing, dashboard, pricing, and docs — all on a
single token system (the memory layer, demonstrated). Every page has its decision
paper-trail: [landing](examples/saas-landing-walkthrough.md) ·
[dashboard](examples/dashboard-walkthrough.md) ·
[pricing](examples/pricing-walkthrough.md) · [docs](examples/docs-walkthrough.md) —
including the real failures the loop caught before delivery.

The project's own site — [`website/`](website/index.html), GitHub Pages-ready — was
designed by the system it documents. View source; every value is a token.

And measure it yourself: [`evals/`](evals/README.md) is a blind with/without benchmark
protocol — 10 fixed briefs, neutral judge rubric, validators as the objective floor
(they also run in CI: [`.github/workflows/validate.yml`](.github/workflows/validate.yml)).

---

## The Review Engine

Nothing ships on vibes. Every deliverable is scored:

| Dimension | Gate |
|---|---|
| UI Craft | ≥ 95 |
| UX & Flow | ≥ 95 |
| Accessibility | ≥ 95 (AA failures cap the score at 60) |
| Performance | ≥ 95 |
| Modernity | ≥ 95 |
| Conversion | ≥ 95 |

Under threshold → the agent re-enters the loop with the reviewer's specific objections.
See [scoring/rubric.md](scoring/rubric.md).

---

## Philosophy

- **Taste is teachable.** Encoded as rules, references, and anti-patterns — not adjectives.
- **Process beats talent.** The loop catches what inspiration misses.
- **Self-criticism is a feature.** The reviewer agent is paid to say no.
- **Memory compounds.** Decision #40 should be consistent with decision #4.
- **Every rule earns its place.** If a rule can't cite a reason, it gets deleted.

---

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, ship with it.

<div align="center">
<sub>Built for the age of agents. Designed to make them dangerous.</sub>
</div>
