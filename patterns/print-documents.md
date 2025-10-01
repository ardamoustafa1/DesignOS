# Print & Documents — Invoices, Reports, Decks, PDFs

Screens scroll; documents PAGE. The moment output is destined for paper, PDF, or a
projector, a different physics applies: fixed canvases, no interaction, no hover, no
retry — the document must survive alone, forwarded, printed in grayscale, filed for
seven years.

## Universal document rules
- **Design for the page, not the viewport:** A4/Letter with real margins (18–25mm);
  content chunked to never break badly (`break-inside: avoid` on blocks, headings never
  orphaned from their first paragraph, table rows unsplit).
- **Grayscale survival:** documents get printed on office lasers — color is enhancement,
  never the only channel (the a11y color rule, physically enforced). Check every chart
  and status indicator in grayscale.
- Type for paper: 10–11pt body (≈13–14px), serif or humanist sans both fine; tighter
  line-height than screen (1.4–1.5); REAL typographic details show hardest on paper
  (`foundations/typography.md` quotes/numbers discipline).
- Identity carried by restraint: logo (small, one), one accent used sparingly, generous
  whitespace — paper amplifies clutter (`foundations/spacing.md` doubly binding).
- Every document self-identifies: what it is, who issued it, date, ID/reference, page X
  of Y — a page separated from its stack must still make sense.

## Invoices & receipts (the most-filed document in software)
```
Header    issuer identity + legal details left · "INVOICE" + number/date/due right
Parties   billed-to / issued-by blocks, unambiguous
Table     items: description · qty · unit · amount — numbers right-aligned,
          tabular, uniform precision (components/tables.md rules, printed)
Totals    subtotal → tax (rate stated) → TOTAL (visually decisive) — right-aligned block
Footer    payment terms/methods · tax registration numbers · contact
```
Legal completeness per market (VAT/KDV numbers, sequential numbering) is design
inventory, not fine print — `industries/fintech.md` number doctrine at full strength.
The PDF and the in-app receipt view are the same design; email version follows
`patterns/email-templates.md`.

## Reports (the exported analytics artifact)
- Cover: title (the finding, not just "Q3 Report" — `components/charts.md` title
  doctrine), period, issuer, date.
- **The one-page executive summary is the report** — verdict, 3–5 key numbers with
  deltas, one chart; everything after is appendix for the 10% who read on.
- Charts re-specced for print: thicker lines, direct labels over legends, grayscale-safe
  series (dash/marker differentiation), sources under every figure.
- Running headers/footers (report title · page numbers); section starts on fresh pages.

## Slide decks (projected documents)
- **One idea per slide** (`foundations/layout.md` one-message-per-viewport, literalized);
  headline states the takeaway ("Churn concentrated in month 2"), not the topic
  ("Churn Analysis").
- Type floor: 24pt body minimum, 36–44pt headlines — if it needs 16pt to fit, it's two
  slides or a handout.
- Contrast for projectors (washed-out reality): dark-on-light travels safest; test the
  deck at 50% perceived contrast.
- The deck ≠ the document: speaker decks are sparse; leave-behind decks may be dense —
  decide which is being built, never both in one file.

## Print stylesheets (the web page's paper twin)
For content pages worth printing (articles, docs, tickets, confirmations):
```css
@media print {
  nav, footer, .no-print { display: none; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
  body { color: #000; background: #fff; font-size: 11pt; }
}
```
Chrome collapses, URLs reveal themselves, dark themes flip to ink-on-paper (nobody
prints 20 pages of black background). The pre-flight checklist's "print isn't broken"
line (`checklists/pre-flight.md`) points here.

## Anti-patterns
Screenshots-of-tables in PDFs · color-only status in printed reports · 8pt legal text
walls · decks with paragraph slides read aloud · invoices missing legal identifiers ·
page breaks mid-table-row · dark-theme PDFs · "page 2 of ?" (unnumbered multi-page docs).

## Checklist
- [ ] Page-physics: margins, break rules, self-identifying pages, X-of-Y
- [ ] Grayscale pass on every figure and status
- [ ] Invoices: legally complete, totals decisive, numbers disciplined
- [ ] Reports: one-page summary carries the verdict; print-specced charts
- [ ] Decks: takeaway headlines, 24pt floor, audience-type decided
- [ ] Print stylesheet on printable web surfaces
