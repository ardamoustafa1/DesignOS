# Industry: HR & Recruiting Tech

## Buyer psychology
Three-sided market, three anxieties: **candidates** (judged by a black box, ghosted by
default — they bring dread), **recruiters/HR** (drowning in volume, living in the tool
6 hours/day — they bring `industries/crm-erp.md` operator needs), and **employers/buyers**
(compliance risk, brand risk, "will candidates hate us less?"). The design's rare trick:
every candidate-facing pixel is ALSO employer marketing — candidate cruelty is brand
damage the buyer pays for.

## Visual language
- **Color:** human-warm professional — the sector sits between enterprise (trustworthy
  blues/neutrals) and human (warm accents, real faces); avoid both extremes: banking-cold
  loses the "people" promise, startup-playful loses the compliance buyer.
- **Type:** clean grotesque; candidate-facing surfaces at generous sizes (application
  stress = reduced capacity — `industries/healthcare.md` stressed-reader doctrine).
- **Imagery:** real workplaces and diverse real humans (diversity here is subject matter,
  not decoration — and fake-diverse stock is instantly detected by the exact audience
  this sector serves); product UIs for the buyer side.

## Candidate-side patterns (the trust frontier)
1. **Job pages** per `patterns/company-pages.md` careers doctrine: MUST/NICE split,
   salary transparency (increasingly legally required — design for it, don't fight it),
   process + timeline stated.
2. **The application** (`components/forms.md` at maximum mercy): ≤5 minutes, CV-parse
   with EDITABLE results (parse errors happen; uneditable parses submit garbage under
   the candidate's name), no re-type-your-CV humiliation, save-and-resume, mobile-complete
   (majority of applications start mobile).
3. **Status transparency — the ghosting antidote:** application states visible
   (received → review → interview → decision), honest timestamps, and REJECTION DESIGNED:
   timely, humane, non-form-letter where feasible (`components/states.md` — the rejection
   is the peak-end moment thousands experience; it's also the employer's lasting brand
   impression — `psychology/emotional-design.md`).
4. Interview scheduling: `components/pickers.md` timezone doctrine at full strength
   (cross-zone interviews are the norm), calendar files, reschedule paths without shame.

## Recruiter-side patterns (the operator tool)
- **Pipeline board:** kanban of candidates (drag with keyboard alternative), stage
  vocabulary fixed (`components/badges-chips.md`), bulk actions with mercy (a mis-bulk
  rejection is a mass tragedy — undo windows mandatory: `components/modals.md`).
- **Candidate record:** the CRM record page doctrine (`industries/crm-erp.md`): identity
  header, timeline of touches, documents, structured evaluations (rubric scorecards beat
  vibes-comments — the tool should nudge structured input; it's also the bias defense).
- Search across candidates (`components/search-command.md`), saved views, email/calendar
  integration surfaces.

## Compliance & ethics design (load-bearing, not legal furniture)
- **Bias-aware by design:** structured evaluation defaults, optional anonymized-screening
  modes, EEO/demographic questions VISIBLY separated ("not seen by recruiters" — and
  true), audit trails for decisions (regulators ask).
- **AI-screening transparency:** where models rank/filter humans, disclose it
  candidate-side, provide human-review paths — regulation (EU AI Act class) treats hiring
  AI as high-risk; design the explainability surface NOW (`industries/ai-startup.md`
  honesty doctrine applied to people's livelihoods).
- Data retention/deletion honored in UI (candidates can request erasure — make it real).

## Trust requirements
Buyer side: SOC2/GDPR posture, integration ecosystem (HRIS/ATS logos), compliance
content per market · candidate side: privacy plain-language AT the form, no dark-pattern
consent (`psychology/persuasion.md`), response-time honesty.

## Motion character
Confident-warm: standard precise tokens with slightly softer edges; celebration licensed
ONCE candidate-side (offer accepted) and once recruiter-side (hire completed) —
`components/states.md` milestone rationing.

## Anti-patterns
Re-type-your-CV forms · black-hole applications (no state, no timeline, no closure) ·
"culture fit" free-text as the evaluation system · surveillance-flavored features
marketed cheerfully (candidate-tracking pixels, "engagement scoring" of humans) ·
diversity imagery ≠ diversity data · 40-field ATS iframes wearing your brand.

## References
Greenhouse (structured-hiring doctrine), Ashby (modern operator craft), Lever (pipeline
UX), Otta/candidate-first boards (the candidate-experience bar), GOV.UK forms (mercy
mechanics transferable to applications).
