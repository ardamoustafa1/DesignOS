# Industry: Food & Restaurants

## Buyer psychology
Nobody researches a restaurant; they **crave and verify**: does it look delicious, is it
open, where is it, can I book/order — usually on a phone, often hungry, frequently
standing on a sidewalk. The entire sector is a mobile-first, three-question game answered
in ten seconds. Every layer of "brand experience" between the user and hours/menu/booking
is negative design.

## Visual language
- **Food photography is the conversion engine:** appetite is visual — warm light, real
  plates from the actual kitchen, tight crops with texture; one bad photo hurts more than
  none (`foundations/iconography.md` photography grade discipline). Video (steam, pour,
  pull) is the sector's licensed motion.
- **Color:** appetite palette physics (`psychology/color-psychology.md`): warm reds/
  oranges/creams stimulate; blue suppresses (almost no blue food exists — blue-heavy
  restaurant sites fight biology). Fine dining: near-black + cream + serif restraint;
  casual: warm and generous; health-food: greens/naturals without the sad-beige trap.
- **Type:** personality lives here — expressive display faces licensed (one, for headings;
  menus stay readable: `foundations/typography.md` floors). The menu's typography IS fine
  dining's brand surface.

## Page priorities (ruthless order)
1. **The above-fold trinity:** open-now status ("Open until 23:00" live-stated),
   location (tappable address → maps), and THE action (Book / Order) — plus one appetite
   shot. Everything else is below.
2. **The menu — as HTML, never PDF:** categories as sticky-tab sections
   (`components/tabs-accordions.md`), dish name + short description + price (right-aligned,
   no dot-leaders needed with modern layout), dietary marks (v/vg/gf legend), allergen
   access (legally required in many markets). PDF menus fail SEO, accessibility, zoom,
   and sidewalk-loading — the single most common sector failure.
3. **Booking/ordering:** native or integrated (OpenTable/Resy/local) — integration styled
   to the brand, not an iframe cliff; date/time/party pickers per `components/pickers.md`;
   confirmation with calendar file + cancellation path.
4. **Location(s):** map + parking/transit notes; multi-location: picker-first with
   per-location hours/menus.
5. Story/gallery/press: below the utility layer, where the browsing mood lives.

## Local SEO (this sector's oxygen — `checklists/seo.md` localized)
Schema.org Restaurant markup (hours, menu link, geo, cuisine, price range) · Google
Business Profile parity (hours updated BOTH places — the site contradicting Maps is the
classic trust-killer) · per-location pages for chains · "near me" intent = fast mobile
pages (`checklists/performance.md` — a 6MB hero video on sidewalk 4G loses the customer
standing outside).

## Trust & operational honesty
Hours accuracy is sacred (wrong hours = a person standing at a locked door hating you) —
holiday hours updated, kitchen-close vs door-close distinguished · prices current and
dated ("menu updated Jul 2026") · photos from YOUR kitchen · reviews: link the profiles
(Google/Yelp), embed the real rating; astroturf detection is instant in this sector.

## Motion character
Warm and appetite-led: slow food-video loops (muted, `motion/performance.md` budgets),
gallery crossfades; the utility layer (menu, booking) instant and still. Fine dining may
run one editorial scroll moment; the burger joint should not.

## Anti-patterns
PDF menus · autoplay music (still happening; still firing customers) · splash pages/
"enter site" · reservation walls before the menu · stock food photos (reverse-image-
searchable = credibility zero) · hours in an image · Instagram-embed AS the site
(feeds die, links rot) · parallax storytelling between a hungry human and the menu.

## References
Local heroes over chains for craft: current SOTD restaurant sites for the editorial
ceiling · Sweetgreen (ordering UX), Resy/OpenTable ecosystems (booking conventions),
McDonald's/Domino's apps (order-flow mechanics at scale — study the flows, not the brand).
