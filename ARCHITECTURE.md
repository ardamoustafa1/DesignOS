# DesignOS Architecture

How the system fits together, and why it's shaped this way.

## Design goals

1. **Deterministic quality.** Same brief, same standard — regardless of model mood.
2. **Lazy loading.** Agents have finite context. The kernel routes; modules load on demand.
3. **Adversarial review.** The entity that grades should not be the entity that drew.
4. **Compounding memory.** Session 30 must honor decisions from session 1.
5. **Agent-agnostic.** Markdown + conventions. No runtime, no lock-in.

## The stack

```
┌─────────────────────────────────────────────────┐
│  KERNEL          CLAUDE.md                      │  boot sequence · routing · standards
├─────────────────────────────────────────────────┤
│  COGNITION       brain/                         │  how to think & judge
├─────────────────────────────────────────────────┤
│  KNOWLEDGE       foundations/ components/       │  the rules themselves
│                  psychology/ motion/ patterns/  │
│                  industries/                    │
├─────────────────────────────────────────────────┤
│  PROCESS         loops/ workflows/ checklists/  │  how work moves
├─────────────────────────────────────────────────┤
│  JUDGMENT        scoring/ agents/reviewer.md    │  the quality gate
├─────────────────────────────────────────────────┤
│  STATE           memory/                        │  what persists per project
└─────────────────────────────────────────────────┘
```

## Control flow for one brief

```
brief ──▶ kernel boot ──▶ route (task × sector) ──▶ load modules + memory
                                                        │
              ┌─────────────────────────────────────────┘
              ▼
        DESIGN LOOP:  research → wireframe → ui → review → a11y → perf → seo → refactor
              │
              ▼
        REVIEW ENGINE: 6-dimension score
              │
        under 95? ──yes──▶ reviewer objections feed back into loop (max 3 cycles,
              │            then surface the tradeoff to the user honestly)
              no
              ▼
        deliver: artifact + scorecard + rationale + memory writes
```

## Module anatomy

Every knowledge module follows the same skeleton so agents can scan fast:

1. **Principles** — the 3–7 rules that matter most, stated as imperatives.
2. **Specifications** — concrete numbers: sizes, ratios, durations, tokens.
3. **Patterns** — named, reusable solutions with when-to-use guidance.
4. **Anti-patterns** — what failure looks like, so it's recognizable.
5. **Reference moves** — what Apple/Stripe/Linear/Vercel do, stated as stealable tactics.
6. **Checklist** — binary pass/fail items for the review stage.

## Why markdown, not code

The product is *judgment*, and judgment lives in language. Markdown is diffable,
forkable, reviewable in a PR, and readable by every agent on the market. The only
"executable" parts are conventions the kernel enforces: boot order, score gates,
memory writes.

## Extending DesignOS

- **New sector:** copy any `industries/*.md`, keep the section skeleton, change the judgments.
- **New component module:** follow the module anatomy above; register it in the kernel routing table.
- **House style:** put overrides in the project's `memory/brand.md` + `memory/design.md` — memory
  outranks modules on conflicts (the kernel's conflict rule: memory > industry > component > foundation).
