# Industry: Manufacturing & Industrial B2B

## Buyer psychology
The longest sales cycles in commerce: engineers SPEC, procurement NEGOTIATES, committees
APPROVE — over months, via RFQs, against catalogs of 40,000 SKUs. The website's real
users are **engineers mid-design** hunting exact specifications (CAD files, tolerances,
certifications) at 2pm on a deadline. Serve the engineer's search and the buyer follows;
market at the engineer and you've lost both. Marketing-speak is actively repellent here —
this audience trusts datasheets, not adjectives (`industries/cybersecurity.md`
professional-skeptic doctrine, industrial edition).

## Visual language
- **Color:** industrial-pragmatic — steel neutrals, safety-adjacent accents used
  semantically (safety orange/yellow mean things on factory floors; respect the
  vocabulary), one brand accent; zero gradient theater.
- **Type:** engineering-grade clarity — grotesque + mono for part numbers, dimensions,
  tolerances (the sector's textures: `M8×1.25`, `±0.05mm` — tabular, copyable);
  spec-table typography IS the brand surface (`components/tables.md` at maximum).
- **Imagery:** real products photographed like the engineering objects they are (clean
  ground, consistent angles, scale references), cutaways/technical drawings, facility
  photos that prove capability (certifications visible on real walls beat badge JPEGs);
  NO handshake-and-hardhat stock.

## Page priorities & patterns
1. **The catalog/product finder — the actual product:** parametric search (filter by
   spec ranges: diameter, load, material, temp rating — `components/tables.md` faceted
   filtering applied to physics), results as spec-dense comparison tables, part-number
   search tolerant of formats/dashes (`components/search-command.md` ranking doctrine:
   exact part match beats everything).
2. **Product detail = the datasheet, honored:** full specifications tabled (never
   PDF-only — HTML specs for search/SEO, PDF as the download twin —
   `patterns/print-documents.md`), **CAD downloads** (STEP/IGES per format — the
   conversion event of the sector: an engineer who designs your part in is a customer
   for the product's lifetime), certifications linked to real documents (ISO/CE/UL),
   variants matrixed, stock/lead-time honesty per variant.
3. **RFQ flow — the checkout equivalent:** quote-cart mechanics (add parts + quantities
   → structured RFQ), response-time promise stated and honored
   (`patterns/company-pages.md` SLA doctrine), file upload for drawings
   (`components/file-upload.md` — engineers send DWGs), human contact visible (this
   sector still buys by phone relationships; the site qualifies, humans close).
4. **Capability pages** (custom/contract manufacturing): machines listed with specs
   (the buyer's engineer checks your tolerances), materials, quality processes,
   industries served with real case studies (`psychology/persuasion.md` similarity
   doctrine: "we make parts for YOUR industry's requirements").
5. **Ops/IIoT dashboards** (for manufacturing SOFTWARE): `components/dashboard.md`
   real-time doctrine + `industries/logistics.md` exception-first hierarchy — OEE,
   downtime, alarm-fatigue discipline on the factory floor's wall screens (design for
   5-meter viewing: bigger type tier recorded in `memory/design.md`).

## Trust requirements
Certifications verifiable (linked certs, audit dates) · tolerances/specs with test
methodology · lead-time honesty (fantasy dates cost production lines — the trust
stakes are physical) · years-in-business/facility reality (longevity IS the signal
here; heritage design cues are licensed, not dated) · engineering support reachable
(application engineers listed — `patterns/company-pages.md` intent doors).

## Motion character
Minimal-functional: near-zero marketing motion; the licensed signatures: 360° product
viewers, exploded-view interactions, configurator transitions — all user-driven
(`native/motion-gestures.md` tracking physics on web), never autoplay theater.

## Anti-patterns
"Innovative solutions for tomorrow's challenges" word-fog · PDF-only catalogs ·
spec tables as images · CAD behind lead-gen walls with 12 fields (gate lightly:
email at most — every field costs design-ins) · stock industrial imagery · RFQ forms
into the void (no confirmation, no SLA) · hiding stock/lead-time until the quote.

## References
McMaster-Carr (the catalog-UX gold standard — genuinely the sector's Stripe: study its
speed, density, findability), Misumi (parametric configurators), Xometry (instant-quote
disruption), Siemens/ABB (enterprise industrial credibility surfaces).
