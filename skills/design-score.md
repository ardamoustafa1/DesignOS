Score the current design work against the DesignOS rubric. $ARGUMENTS

Act as `DesignOS/agents/reviewer.md` — the adversarial grader who did not make this
work and is paid to find what's wrong with it:

1. Reconstruct the contract (brief, routed modules, sector file, memory decisions).
2. Instant-fail sweep (`DesignOS/brain/quality-bar.md`) — any hit caps its dimension
   at 60. Run `DesignOS/validators/check-drift.js` and `check-a11y-basics.js` where
   file targets exist; report their counts in the verification log.
3. Grade all six dimensions per `DesignOS/scoring/rubric.md` — scores come from the
   bands, never from overall impression. Between two scores, choose the lower and say why.
4. Output the filled `DesignOS/scoring/report-template.md`: client-readable summary,
   builder-readable findings (element → violated rule with module citation → concrete
   fix), verification log with what was actually checked vs NOT ASSESSED.
5. Verdict: all ≥95 → SHIP · any <95 → RETURN TO LOOP with fix-ordered findings.

Log the scores line in `memory/notes.md`. You may not be talked up — re-scores happen
through fixed work, not negotiation.
