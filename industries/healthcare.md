# Industry: Healthcare

## Buyer psychology
Users arrive **anxious, in pain, or deciding for someone they love** — cognitive capacity
is reduced; stakes feel existential. Design must lower heart rates: clarity over cleverness,
calm over conversion pressure. For B2B health (providers, payers), add a second reader:
compliance officers who will screenshot your claims.

## Visual language
- **Color:** calm blues/teals/greens on warm-white; generous whitespace *is* the calm. Avoid alarm-red except true emergencies; avoid sickly yellow-greens near clinical content. Consumer wellness may warm up (sage, sand, soft corals); clinical/provider tools stay cool and neutral.
- **Type:** high-legibility humanist sans, **body 18px+ for patient-facing content** (older users, stressed reading), line-height generous, reading level ~6th–8th grade for patient content — medical jargon translated or tooltipped.
- **Imagery:** real, diverse humans — age, body, ability diversity is content, not decoration; no stock "doctor pointing at tablet"; illustration for sensitive topics (symptoms, procedures) where photos would distress.
- **Theme:** light. Dark mode is a niche preference here, not a default.

## Page priorities
1. Landing: who this helps + how, immediately — one primary action ("Book appointment" / "Check symptoms" / "Request demo")
2. **Trust/privacy page:** HIPAA/GDPR posture, data handling in plain language, certifications (HITRUST, SOC2) — linked at every data-entry point
3. Patient flows: appointment booking (calendar UX), intake forms (`components/forms.md` — chunked, progress-saved, "why we ask" per sensitive question)
4. Provider dashboards: density with calm (`components/dashboard.md`), alarm-fatigue-aware thresholds
5. Emergency escape hatch: "If this is an emergency, call 112/911" visible on all symptom/triage surfaces — a design element, styled, not legal fine print

## Trust requirements
Credentials visible (board certifications, affiliations) · citations for medical claims
(linked, dated) · privacy reassurance AT the point of disclosure ("Only your care team sees
this") · human contact path always visible · accessibility beyond AA where possible —
this sector's users *are* the a11y use cases (`foundations/accessibility.md`).

## Motion character
Calm preset: opacity-led, slower-but-fewer, zero springs/celebrations on clinical surfaces.
Progress reassurance on long tasks (uploads of records, claims). Success states are warm
but sober ("Your appointment is confirmed" + full details + calendar file).

## Compliance design notes
PHI never in URLs/screenshots/demos (use synthetic data that *looks* synthetic — real-looking
fake patients cause real incidents) · session timeouts with warnings + work preservation ·
audit-friendly timestamps · consent flows: granular, revocable, plain-language.

## Anti-patterns
Urgency/scarcity mechanics anywhere near care decisions · cutesy microcopy about symptoms ·
dark patterns in insurance/billing flows (this sector's lawsuits are famous) · unverifiable
outcome claims ("cure", "guaranteed") · burying costs until after intake.

## References
Zocdoc (booking UX), Oscar Health (humanized insurance), One Medical (calm premium care), NHS.uk (the plain-language clinical gold standard — genuinely study it).
