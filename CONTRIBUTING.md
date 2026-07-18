# Contributing to DesignOS

DesignOS grows the way it works: opinionated, evidenced, and reviewed. Contributions are
welcome — rules for contributing rules:

## What we accept
- **New modules** (components, patterns, industries) following the module anatomy
- **Sharpened judgments** — replacing a vague rule with a specific one, with reasoning
- **Anti-pattern reports** — documented failure modes with the rule that prevents them
- **Corrections** — outdated references, broken links, contradictions between modules
- **Translations** — full-file translations as `README.<lang>.md` in the repo root (e.g.
  `README.fr.md`), mirroring the English README. A native-speaker review note is required
  in the PR description if the translation is LLM-assisted.

## What we don't
- Rules without reasons ("I prefer X" — every rule must cite a why a design director
  could defend: `ARCHITECTURE.md` module anatomy)
- Neutrality ("it depends, use judgment" — DesignOS takes positions; hedged rules are
  deleted weight)
- Tool/framework lock-in (the system stays markdown + conventions, agent-agnostic)
- Generated filler (we can tell; the reviewer agent can too)

## Module anatomy (mandatory skeleton)
1. **Principles** — 3–7 imperatives that matter most
2. **Specifications** — concrete numbers: sizes, ratios, durations, tokens
3. **Patterns** — named solutions with when-to-use
4. **Anti-patterns** — recognizable failure modes
5. **Reference moves** — what the canon does, stated as stealable tactics
6. **Checklist** — binary pass/fail items for the review stage

Plus: cross-reference related modules with relative paths (`components/buttons.md` style) —
run the reference check before submitting:

```bash
grep -rhoE '`[a-z-]+/[a-z0-9./-]+\.md`' --include="*.md" . | tr -d '`' | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
```

(`memory/*.md` references are intentionally virtual — they point at per-project files.)

## New industry files
Follow the sector skeleton: Buyer psychology → Visual language → Page priorities &
patterns → Trust requirements → Motion character → Anti-patterns → References.
The bar: a designer who's never worked the sector ships credible work from your file alone.

## First contributions (concrete, scoped, genuinely wanted)

Each of these is a real gap the maintainer cannot fill alone, sized for a first PR, with
its acceptance test stated. Governance status, honestly: the co-maintainer pathway in
`GOVERNANCE.md` is defined but **not yet exercised** — these are the road into it.

1. **Run an eval brief independently** — the single most valuable PR this repo can
   receive. Pick any brief from `evals/briefs.md` (B2–B10 are unclaimed), follow
   `evals/independent-run-guide.md`, submit via `evals/RUN_TEMPLATE.md`. A negative or
   mixed result is exactly as publishable as a win. *Accepted when:* raw outputs +
   validator logs attached, conditions stated.
2. **Add a sector to the suggest engine** — extend `bin/suggest-data.js` (and mirror it
   in `website/suggest.html`). *Accepted when:* `node validators/test-cli.js` passes —
   the palette-integrity test computes your contrast pairs, so a bad palette cannot merge.
3. **Regenerate a golden's screenshot/Lighthouse evidence** — run any
   `goldens/*/index.html` through a real Lighthouse pass and PR the numbers into its
   `.md`. *Accepted when:* command + environment recorded next to the scores.
4. **File a rule-challenge with data** — find a module rule you can beat, show the
   evidence (A/B, real-world example, better reference). *Accepted when:* the challenge
   names the rule, the evidence, and the replacement wording.
5. **Native-speaker translation review** — any `README.<lang>.md` carries an
   "LLM-authored, unreviewed" disclaimer; remove one by reviewing it. *Accepted when:*
   the PR lists corrections made (or states none were needed) and drops the disclaimer.

## Process
1. Open an issue describing the change + the reasoning (for new modules: the outline)
2. PR with the change; kernel routing table (`CLAUDE.md`) updated if you added a module
3. Review standard: the same 95 bar the system enforces — expect adversarial reading;
   "fine" is a rejection here too (`agents/creative-director.md`)

## Style
- English, direct, present tense, second person where instructive
- Dense over long: cut every sentence that doesn't change what the reader does
- Em-dashes, tables, and code blocks as the existing files use them
- No emojis in module content (the system's own iconography rules apply to itself)

## License
Contributions land under the project's MIT license.
