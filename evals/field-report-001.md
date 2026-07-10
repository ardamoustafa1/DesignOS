# Field Report 001 — RTL/Logistics Stress Test

**What this is:** a maintainer-conducted structural stress-test of the knowledge base
against a brief chosen specifically to hit an *untested* combination of modules — not a
polished showcase, not a live multi-turn agent session. It's the kind of audit
`loops/refactor-loop.md` prescribes, run once, honestly reported, findings fixed.

**What this is NOT:** independent third-party validation. It doesn't substitute for
someone else running DesignOS against their own project. See `evals/RESULTS.md`'s
caveats — the same honesty rule applies here.

## The brief

> Design a shipment-tracking dashboard for a logistics company serving the Gulf region.
> Needs: Arabic RTL support, multi-currency line items (SAR/AED/USD), dark theme, a data
> table with bulk actions, and a sidebar shell.

Chosen because it forces four modules to interact that had never been exercised
together: `industries/logistics.md` + `components/dashboard.md` + `components/tables.md`
+ whatever the kernel routes for "Arabic" / "RTL" — which, walking the routing table as
written, was **nothing**. That's finding #1.

## Finding 1 — RTL/bidi layout had no coverage (severity: real gap)

Grepping the full 180-file base before this exercise: **one** mention of "RTL" in the
entire knowledge base (`industries/nonprofit-government.md`, the throwaway phrase
"RTL-ready where relevant" — no specification behind it), and **one** use of a CSS
logical property anywhere in `foundations/` or `components/`. For a system claiming
worldwide relevance, that's not a rounding error — it's a missing foundation.

**Fix:** added `foundations/rtl-i18n.md` — logical-properties discipline, a
mirrors-vs-doesn't-mirror reference table, bidi text handling (`<bdi>`, `dir="auto"`),
non-Latin typography notes, `Intl`-based locale formatting, and a testing protocol added
to the review loop's edge-attack list. Routed in the kernel table.

## Finding 2 — downstream modules didn't cross-reference the gap they had

Even after drafting the RTL module, three components most affected by direction
(`components/tables.md` sticky columns, `components/dashboard.md` sidebar/timeframe
placement, `components/navigation.md` bar order and breadcrumb separators) still
described positions in **physical** terms ("sticky first column", "right-aligned",
"the `›` separator") with zero pointer to the new module. An agent routing to
`components/tables.md` for a table task would never discover the RTL rules existed.

**Fix:** added short RTL subsections to all three files, each converting the physical
description to its logical-property equivalent and linking `foundations/rtl-i18n.md`.
This is the more instructive finding of the two: **a new module is invisible until the
routing table AND the modules it should have cross-referenced both point to it.** Adding
a file is not the same as integrating it — this is a defect class the review loop should
watch for in every future addition, not just this one.

## What's still unresolved (stated, not hidden)

- The new module has not been tested against a live agent session actually producing
  Arabic-language HTML — this audit verified the *specification* is coherent and
  cross-referenced, not that an agent reliably applies it under real generation pressure.
- Currency/locale formatting (`Intl.NumberFormat` guidance in the new module) overlaps
  with `components/pickers.md`'s existing currency-picker notes; the two were not
  explicitly cross-linked in this pass — a small follow-up, logged rather than fixed
  silently.
- No native Arabic or Hebrew speaker has reviewed the typography guidance — it's sourced
  from documented platform conventions (system font behavior, script metrics), not
  first-language review. Flagged the same way the translated READMEs are flagged
  (`README.md` i18n note) — machine/LLM-authored guidance on a script the maintainer
  doesn't read natively deserves a discount until a native reviewer confirms it.

## Why this report exists

`psychology/trust.md`'s ledger is explicit: stated limitations are a *deposit*, not a
withdrawal. This project asks every deliverable it produces to publish its state matrix
and its instant-fail sweep before shipping. Applying a lighter standard to itself than it
demands of its output would be the least credible thing it could do.
