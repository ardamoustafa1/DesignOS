# Industry: CRM & ERP (Enterprise Operations Software)

## Buyer psychology
Two brutally different users: the **economic buyer** (VP/C-level: ROI, migration risk,
adoption risk, vendor stability) and the **daily operator** (living in this UI 6 hours/day:
speed, density, keyboard, muscle memory). Marketing sells the first; the product's design
retains the second — and failed adoption is why enterprises churn. The evaluation is a
*committee process*: your pages will be screenshotted into slide decks; design pages to be
excerpted (self-contained sections, clear diagrams, quotable numbers).

## Visual language
- **Marketing:** enterprise-trust palette (navy/deep blue families, restrained accents),
  light theme, photography of real teams-at-work over illustration; gravitas over trendiness —
  a bento-gradient aesthetic reads as flight-risk startup to a 10-year-contract buyer.
- **Product:** neutral, calm, high-information chrome (`components/dashboard.md`,
  `components/tables.md` are the core surfaces); accent used strictly functionally; density
  toggles (comfortable/compact) as a first-class feature — operators choose compact, admins
  choose comfortable.
- **Type:** neo-grotesque discipline; tabular-nums everywhere (pipelines, inventory, ledgers);
  13–14px operational text is licensed here with the legibility floor enforced.

## Page priorities & patterns
1. **Marketing landing per persona/industry** (CRM for real estate ≠ CRM for SaaS sales —
   the sector's SEO and conversion structure), each: workflow story + role-relevant proof
2. **The workflow demo:** sticky product tour showing an actual task (lead → deal → close;
   PO → receipt → invoice) — abstract feature grids fail here; operators recognize real
   workflows instantly
3. **Migration/onboarding story page:** "switching from Salesforce/SAP" content — the #1
   objection; data-import guarantees, timeline honesty, dedicated support
4. **Security/compliance + integrations pages:** table-stakes trust; integration count with
   searchable directory
5. **Pricing:** per-seat tiers + Enterprise (`patterns/pricing.md`), TCO framing, annual-first

## In-product doctrine (where this sector is won)
- **Tables are the product:** saved views, bulk everything, inline edit, column customization
  persisted per user (`components/tables.md` at maximum depth)
- **Keyboard-first operators:** command palette (⌘K), shortcuts documented and discoverable,
  focus management flawless — speed is retention
- **Record pages:** the CRM's atom — identity header (who/status/owner/next action) → activity
  timeline → related records rail; every entity one click from its relations
- **Forms:** long but chunked, autosave-with-indicator (operators lose work = operators revolt),
  validation forgiving (`components/forms.md`)
- **Customization with guardrails:** admin-configurable fields/stages/layouts are the category's
  power AND its UX debt — defaults must be excellent because 80% never customize

## Trust requirements
Recognizable enterprise logos + industry-matched case studies with hard ROI numbers ·
analyst mentions (Gartner/G2 quadrants) if real · uptime SLA published · implementation-partner
ecosystem visible · long-term-vendor signals (about page depth, customer tenure stories).

## Motion character
Minimal-precise: state feedback only, zero marketing flourish in-product; operators on old
hardware and 6-hour sessions — animation fatigue is real (`motion/principles.md` frequency
discount at its extreme). Marketing site may warm up slightly, never past confident-premium.

## Anti-patterns
Dashboard screenshots with obviously fake perfect data · "digital transformation" word-salad ·
hiding per-seat price entirely while claiming SMB-friendliness · in-product: modal-on-modal
flows, unsaved-work loss, 12-equal-item sidebars (`components/navigation.md`), retiring
muscle-memory layouts without migration paths.

## References
Salesforce (category conventions to speak fluently — and complexity lessons), HubSpot (SMB-friendly enterprise), Attio/Linear (the modern-operator bar), Odoo (module breadth patterns), Stripe Dashboard (operational craft ceiling).
