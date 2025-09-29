# Industry: Travel & Hospitality

## Buyer psychology
Travel is bought twice: first as a **daydream** (weeks of aspirational browsing), then as
a **logistics problem** (dates, prices, cancellation terms, "is this photo honest?").
Design must serve both without letting either poison the other — a booking engine that
kills the dream converts nobody; a dream site that hides the total price gets abandoned
at checkout. Anxiety is structural: users are prepaying for something they can't inspect,
in a place they don't know (`psychology/trust.md` at full deployment).

## Visual language
- **Photography IS the product** (`industries/real-estate.md` doctrine, intensified):
  full-bleed heroes, golden-hour reality (not HDR-nuked fantasy), consistent grading;
  rooms shot honestly (the review photos will testify). People-in-place beats empty-place
  for emotional charge; empty-place beats crowds for luxury.
- **Color:** the UI recedes to warm neutrals + one confident accent; destination
  photography supplies the palette. Luxury: near-black + serif + acres of space.
  Budget/deals: warmer, denser, price-chips forward.
- **Type:** serif display for dream layers (editorial travel energy), sans for the
  booking machine — the two-register pairing is the sector's signature.

## Page priorities & patterns
1. **Search-first hero** (`components/hero.md` full-bleed variant): destination + dates +
   guests in one bar over the money shot; autosuggest with recents/popular
   (`components/search-command.md`)
2. **Results:** card grids (photo-dominant, price-per-night + total toggle, rating +
   count, one badge max) + map sync (`industries/real-estate.md` split-view doctrine);
   filters with counts (`components/tables.md` filter discipline)
3. **Detail page:** gallery-first (grid teaser → lightbox) → booking box sticky right
   (dates, guests, **total price with ALL fees before any commitment** — the sector's #1
   trust battle) → amenities (iconed, honest) → location + neighborhood → reviews →
   policies in plain language
4. **Checkout:** `industries/ecommerce.md` doctrine + travel specifics: cancellation
   terms AT the button ("Free cancellation until Aug 1" beats a policy link), price-lock
   honesty, no seat-style pressure theater
5. **Post-booking:** the confirmation is a travel document — itinerary, confirmation
   codes, calendar files, offline-readable email (`patterns/email-templates.md`)

## Trust requirements
Real, recent reviews with dates + traveler-type context ("family, June 2026") · honest
photo/reality alignment (the gap is the review-killer) · total-price-first pricing
(resort-fee ambushes are lawsuit territory and churn) · cancellation clarity ·
human-reachable support with hours/channels (travelers in trouble need humans NOW —
support visibility is a purchase factor).

## Urgency ethics (the sector's chronic disease)
"2 rooms left" / "12 people viewing" mechanics: ONLY if real and only calm
(`psychology/persuasion.md` — this industry trained global users to distrust urgency;
absence of pressure is now a differentiator luxury brands exploit). Never countdown-timer
a hotel room.

## Motion character
Confident-premium: slow crossfade galleries, gentle parallax license on hero photography
(`motion/page-and-scroll.md` limits), map/list transitions smooth. The booking machine
itself: instant, zero decoration.

## Anti-patterns
HDR-nuked photos · fee ambush at step 4 · fake urgency pulsing · autoplay drone video
with sound · map pins that don't match list hover · burying cancellation terms ·
"from $99" prices no date combination produces.

## References
Airbnb (search + photo + review doctrine — `brain/reference-library.md`), Booking
(conversion mechanics to study AND the pressure-theater cautionary tale), Aman/Belmond
(luxury restraint), Hopper (playful-consumer pricing honesty).
