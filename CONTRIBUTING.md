# Contributing to DesignOS

DesignOS grows the way it works: opinionated, evidenced, and reviewed. Contributions are
welcome — rules for contributing rules:

## What we accept
- **New modules** (components, patterns, industries) following the module anatomy
- **Sharpened judgments** — replacing a vague rule with a specific one, with reasoning
- **Anti-pattern reports** — documented failure modes with the rule that prevents them
- **Corrections** — outdated references, broken links, contradictions between modules
- **Translations** — full-file translations under `i18n/<lang>/` mirroring the tree

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
