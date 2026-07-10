# Limitations — What DesignOS Is Not (Yet)

Every module in this project demands a state matrix, an instant-fail sweep, and honest
labeling of what wasn't checked before anything ships (`checklists/pre-flight.md`,
`brain/quality-bar.md`). Holding the project itself to a lower standard than its own
output would be the least credible thing it could do
(`psychology/trust.md` — the ledger applies to us too). This file is that sweep.

## 1. The eval results are a maintainer self-test, not independent proof

Both arms of `evals/RESULTS.md`'s Run 001 were authored by the same person who wrote the
rules being tested — the "control" page's flaws were written deliberately, not produced
by an unprompted agent under real conditions. That demonstrates the *validators* fire
correctly. It does not demonstrate that DesignOS reliably changes an *independent* agent's
output on a brief it wasn't tuned for. Run 002 — the slot that would actually support the
claim — is open and empty. **Until someone else fills it, treat every "measured" claim in
this README as a hypothesis with working instrumentation, not a proven result.**

## 2. The showcase is self-authored, not field-tested

All four pages in `examples/` and the website itself were built by the maintainer
applying the rules to a fictional product invented for the purpose. They prove the system
is *internally coherent* — the rules don't contradict each other when followed carefully.
They do not prove the rules survive contact with a real client's ambiguous brief, a real
existing codebase's constraints, or a real deadline. `evals/field-report-001.md` is the
first attempt at closing this gap (a structural stress-test that found and fixed a real
coverage hole — RTL/i18n layout was almost entirely missing before that audit). It is one
data point, self-conducted, not a track record.

## 3. Scale outran field-testing

180+ files of specific, opinionated rules (4px grids, 95-point thresholds, named
compositions) were written in a concentrated burst, not accumulated from years of
real projects hitting real edge cases. Some rules will turn out too rigid for a real
brand's constraints, some will contradict each other in combinations not yet tried, and
some sector files will have gaps like the RTL one until someone with real domain
experience in that sector reads them critically. `CONTRIBUTING.md`'s rule-challenge
process exists specifically for this — it hasn't been exercised by anyone outside the
project yet.

## 4. Zero external validation as of this writing

No independent contributors, no third-party showcase entries, no field reports from
outside the maintainer, no production usage the maintainer can point to. The
comprehensiveness is real; the track record is not yet. A reader should weight this
project's claims accordingly until that changes — and it can only change through real
external use, which this document is explicitly inviting rather than obscuring.

## 5. Translations are unreviewed

The seven non-English READMEs are LLM-authored in a single pass with no native-speaker
review. Treat them as a starting point for that language's community, not as
authoritative — corrections are one of the highest-value contributions available right
now (`CONTRIBUTING.md`).

## 6. The routing table's coverage is asserted, not exhaustively tested

The kernel (`CLAUDE.md`) routes task signals to modules via a large table. It has been
checked for internal consistency (`validators/check-refs.sh` verifies every cross-
reference resolves to a real file) but not exhaustively tested for *completeness* — i.e.,
whether every realistic brief actually finds the module it needs. Finding #2 in the field
report (modules missing cross-references to a newly-added file) is the exact failure mode
to expect more of: a module can exist and still be effectively invisible to routing.

## What would change these ratings

- An independent Run 002 in `evals/RESULTS.md`, positive or negative
- Real third-party entries in `SHOWCASE.md` — actual products, actual friction reports
- Rule-challenge issues from people who hit a contradiction or a bad fit
- Native-speaker review of any translated README
- More field reports in `evals/field-report-*.md` — self-conducted ones from the
  maintainer are welcome too; more audits finding more real gaps is the system working
  as designed, not a sign it's failing

This file gets edited as those things happen — a limitation that's been resolved should
be struck through with the fix linked, not silently deleted (`memory/README.md`'s
"supersede, don't delete" rule, applied to the project's own record).
