Run the DesignOS Review Loop on: $ARGUMENTS

(If no target was given, review the design surfaces changed in the current working
state; state your inventory before starting.)

Follow `DesignOS/loops/review-loop.md` exactly:

1. **Inventory** — list what you're reviewing (pages/screens, states, breakpoints,
   themes) and explicitly what is OUT of scope.
2. **Contract check** — reconstruct the rules that apply: routed modules from
   `DesignOS/CLAUDE.md`'s table, the sector file, and project `memory/` decisions.
   Legacy work with no memory: reverse-engineer the implicit system and record it in
   `memory/design.md`.
3. **Instant-fail sweep first** — the eight instant-fails from
   `DesignOS/brain/quality-bar.md`; grep the greppable (raw hex, magic numbers,
   `outline: none`), run `DesignOS/validators/` where applicable. If
   `DesignOS/bin/designos.js` exists and the target is a file or directory, run
   `node DesignOS/bin/designos.js review <target> --json --no-fail` and use that output
   as the deterministic finding list. Hits cap dimensions at 60 before fine grading.
4. **Six-dimension audit** — per `DesignOS/scoring/rubric.md`, attacking the edges:
   states, 375px, dark theme, keyboard-only, reduced-motion, zoom.
5. **Report** — the filled `DesignOS/scoring/report-template.md` + a prioritized fix
   plan (instant-fails → structural → surface → advisory), each finding costed
   (trivial / hours / structural). New defects → `memory/bugs.md`.

Do NOT apply fixes in this pass — findings first, fixes are a separate instruction.
Unchecked surfaces are reported as NOT ASSESSED, never implied as passed.
Do not report 95+, 100/100, zero findings, or SHIP unless the deterministic review was
actually run; otherwise label the result SELF-REVIEW ONLY.
