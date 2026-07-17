# Prompt Cookbook

DesignOS does the heavy lifting — but better prompts route better. Patterns that get the
most out of the system, with the *why*.

## The anatomy of a strong brief

```
[PRODUCT] for [AUDIENCE + STATE]. [THE ONE ACTION]. [PRODUCT MATERIAL]. [REAL PROOF].
[BRAND BELIEF]. [NEVER-LIST]. [CONSTRAINTS]. [ACCEPTANCE EVIDENCE].
```

> Design a landing page for an AI meeting-notes tool for heads of sales. AI-startup sector,
> conversion action is trial signup. Confident and technical, not hypey. We have real
> dashboard screenshots and 6 customer logos; dark theme.

Every clause routes something. Before implementation, compile it through
`brain/brief-compiler.md`: compare material-led, audience-led, and belief-led directions;
select a signature with a derivation chain; then boot the kernel. A recipe is a brief,
never an alternate mini-kernel.

## Universal master prompt

```text
Use DesignOS on <target>. First read the kernel and compile my request with
brain/brief-compiler.md. Preserve verified facts; label assumptions; never invent proof.
For a full page, compare three structurally distinct directions derived from product
material, audience, and brand belief, then choose one with reasons. Route only relevant
modules and run the complete Design Loop, including real render inspection at applicable
viewports. Deliver the artifact, evidence ledger, rationale, and memory updates. Run the
static Final Gate when files exist, but report unmeasured dimensions as NOT ASSESSED;
never turn absence of static findings into a final numeric design score.

Product: <what it is>
Reader and state: <who, expertise, emotion, device>
Primary action: <one behavior>
Product material and assets: <inputs, outputs, workflows, data, screenshots>
Verified proof: <sources and unavailable claims>
Brand belief and never-list: <point of view; clichés/competitors to avoid>
Scope and constraints: <stack, files, themes, locales, legal, performance>
Acceptance evidence: <states, breakpoints, keyboard, a11y, performance, business metric>
```

## Recipes

**Full project:**
> New project: <brief>. Run the new-project workflow — intake questions first if anything's missing.

**Landing page sprint:**
> Landing page for <product>. The five answers: 1)… 2)… 3)… 4)… 5)… Run the landing-page workflow.

**Single component (in-project):**
> Build the pricing section. Use project memory; 3 tiers, we want Pro recommended. Component-request workflow.

**Single component (standalone):**
> Standalone data table for a security triage tool — severity, asset, age, assignee columns,
> bulk actions. Declare your defaults and include the token block.

**Audit what exists:**
> Run the review loop on <page/path>. Full six-dimension report; don't fix anything yet — findings and fix plan first.

**Redesign:**
> Our pricing page underperforms (2.1% → we need 4%). Run the redesign workflow — autopsy first,
> and tell me if the disease is design, copy, or trust before proposing anything.

**Cleanup:**
> The codebase has drifted. Run the refactor loop on styles/ — measure drift, propose canon, then consolidate spacing only.

**Re-score after edits:**
> I changed the hero copy and CTA. Re-verify affected surfaces and re-score Conversion and UI Craft.

## Steering phrases the kernel understands

| You say | The system does |
|---|---|
| "Threshold is 97 for this client" | rubric gate rises project-wide (→ memory/notes.md) |
| "Record in brand.md: …" | locks a decision with today's date |
| "Treat this as fintech from now on" | reroutes the sector file, re-audits trust requirements |
| "Skip SEO stage, internal tool" | stage skipped WITH the reason logged |
| "Show me the wireframe stage before UI" | inserts a checkpoint at the stage gate |
| "Why did you choose X?" | answers from the rationale/module citations, not vibes |

## Getting better output

- **Name the enemy:** "not hypey", "nothing like Salesforce", "no purple gradients" —
  negative space is design direction; it goes to brand.md's never-list.
- **Give real assets early.** Composition is asset-driven; a brief without an asset
  inventory gets a guessed layout.
- **Ask for the checkpoint** on big scopes: "confirm the page plan with me before production."
- **Don't skip the questions.** If the system asks the five answers, the 30 seconds spent
  answering beats three revision cycles.
- **Challenge scores:** "The reviewer gave Conversion 96 — attack it again, assume it's
  hiding something." Adversarial re-passes are free quality.

## Anti-prompts (what gets weak results and why)

- "Make it pop / more modern / premium" → adjectives without referents. Say instead:
  "use the product's event timeline as a recurring layout gesture; keep Linear's speed
  tactic but prohibit its dark palette, typography, and branded motifs."
- "Just quickly, no need for the whole process" → the loop *is* the quality; the scaled
  ceremony already makes small things fast (`loops/design-loop.md`).
- "Copy stripe.com" → reference-library tactics get stolen, pixels don't
  (`brain/reference-library.md` usage rule).
