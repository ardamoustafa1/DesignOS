# Industry: E-commerce

## Buyer psychology
Shopping alternates between **browsing** (dopamine, discovery, low commitment) and **buying**
(anxiety spike: price, fit, shipping, returns, card safety). Design serves both modes:
frictionless, rich discovery — then a checkout so conventional and reassuring it disappears.
Cart abandonment (~70% baseline) is mostly *designed-in*: surprise costs, forced accounts,
long forms.

## Visual language
- **Color:** neutral chrome — the PRODUCTS are the color; UI recedes (white/warm-neutral ground, one accent for actions). Luxury: near-black + serif + extreme whitespace. Value/discount brands: warmer, denser, price-forward.
- **Type:** clean sans UI + optional serif display for premium; **prices in tabular-nums**, size hierarchy: product name ≥ price > meta; sale pricing: original struck + new emphasized + "-30%" chip (all three, honestly).
- **Imagery is the product:** consistent PDP photography (angles, background, lighting), zoom/360 where fit matters, on-model + flat-lay both for apparel, video for mechanism products. Real photos > renders; UGC/review photos convert.
- **Theme:** light. Commerce trust lives in daylight.

## Page priorities & patterns
1. **PLP (listing):** product cards (`components/cards.md` — image ≥60%, name, price, rating count, ONE badge max), filter sidebar/sheet with counts + applied-chips, sort defaults sane ("Popular"), pagination or hybrid load-more (position memory matters for compare-shopping)
2. **PDP (detail):** gallery left / buy-box right (sticky); buy-box order: name → rating link → price + shipping estimate → variants (visual swatches, size guide link) → quantity → **Add to Cart (the page's one hero button)** → trust row (returns, shipping, secure pay icons) → accordion details
3. **Cart:** editable line items, subtotal + *estimated total with shipping/tax as early as possible* (the #1 abandonment fix), promo field collapsed (open promo fields send people hunting for codes off-site), trust icons, clear checkout CTA
4. **Checkout:** guest-first (account optional AFTER purchase), single column, address autocomplete, express pays (Apple/Google Pay/Shop Pay) on top, payment fields grouped, zero navigation exits (logo unlinked or confirm-guarded), progress steps visible
5. **Post-purchase:** confirmation with everything (number, items, timeline, tracking promise) + account-creation offer NOW ("save your info for next time" — the honest moment for it)

## Trust requirements
Reviews with photos + verified-purchase labels + honest distribution (a 4.6 with visible 1-star
reviews outconverts a suspicious 5.0) · returns policy in one sentence near Add-to-Cart ·
shipping cost/time BEFORE checkout · recognizable payment marks · real stock states
("Only 3 left" only when true — `psychology/persuasion.md`).

## Motion character
Product-forward micro-delights licensed: image crossfades on variant switch, add-to-cart
fly/badge-count animation (one spring allowed), gallery swipe physics. Checkout: zero
decoration, instant feedback only.

## Anti-patterns
Forced account walls · costs revealed at step 4 · fake countdowns/stock · carousel heroes
hiding the catalog · quick-view modals that do everything the PDP does (pick one) ·
"people are viewing this" theater · newsletter popup at second one.

## References
Shopify's own store patterns (checkout doctrine), Apple Store (premium PDP), Zalando/ASOS (fashion PLP filtering), Amazon (density + trust mechanics — copy selectively).
