# Project Memory Protocol

DesignOS never forgets. Every project gets a `memory/` directory of seven files; the agent
reads them at boot (kernel step 5) and writes them at every delivery (Output Contract).
Decision #40 must be consistent with decision #4 — memory is how.

## Setup

At project start (see `workflows/new-project.md`):

```bash
mkdir -p memory
cp DesignOS/memory/templates/*.md memory/
```

Then fill `client.md` and `brand.md` from the kickoff conversation before any design work.

## The seven files

| File | Holds | Written when |
|---|---|---|
| `client.md` | who the client is, audiences, goals, constraints, the one-reader sentence | kickoff; updated on scope change |
| `brand.md` | voice, color decisions + reasoning, type choices, logo rules, glossary | kickoff + whenever a brand decision locks |
| `design.md` | the system: scales, tokens, radius/shadow/motion language, composition decisions, **overrides with reasons** | every session that decides anything |
| `pages.md` | page/screen inventory, per-page intent + primary metric, status | when pages are planned/started/shipped |
| `todo.md` | open work, prioritized; placeholder flags (fake numbers to replace!) | continuously |
| `bugs.md` | known visual/UX defects with severity + surface | when found (even if not fixing now) |
| `notes.md` | score history, assumption lists, client feedback verbatim, everything else worth keeping | every session |

## Writing rules

1. **Decisions carry reasons.** "Primary: #4F46E5" is data; "Primary: #4F46E5 — conforms to
   fintech trust prior, differentiates from competitor's #0066FF by depth
   (color-psychology procedure step 2)" is memory. Future sessions need the *why* to know
   when a decision may bend.
2. **Overrides are first-class.** When a module rule is deliberately broken, record:
   rule, override, reason, scope. The kernel's conflict order (memory > industry > component >
   foundation) only works if overrides are written down.
3. **Absolute dates.** "Decided 2026-07-10", never "today". Sessions don't share a today.
4. **Client's words verbatim** for preferences ("client: 'never purple, ever' — 2026-07-10").
   Paraphrase drifts; quotes don't.
5. **Prune on write.** Done todos move out, fixed bugs close with the fix noted, superseded
   decisions get struck-through with a pointer to the replacement — files stay readable or
   they stop being read.
6. **Never delete reasoning** — supersede it. The trail of *why decisions changed* is the
   project's institutional knowledge.

## Reading rules

- Boot: read all seven (they're designed to stay short enough).
- Conflicts: memory beats modules; newest memory beats older; explicit client instruction
  beats everything (and gets recorded).
- A memory that contradicts observable reality (the code moved on) → flag it, verify with
  the user, update the file — don't silently obey ghosts.
