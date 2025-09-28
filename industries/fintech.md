# Industry: Fintech

## Buyer psychology
Money = fear. Every user carries loss-scenarios ("what if it disappears / gets stolen /
they're a scam?"). Trust must be *ambient* — carried by craft, precision, and institutional
signals, not claimed in copy ("bank-level security!" said loudly reads as its opposite).
One misaligned decimal on a fintech page costs more credibility than any missing feature.

## Visual language
- **Color:** blues/navies own consumer trust; greens for wealth/growth products; near-black + metallic restraint for premium/trading. Semantic red/green (loss/gain) must never collide with brand hues — audit this first (`psychology/color-psychology.md`; note CN-market flip).
- **Type:** neo-grotesque authority; **tabular-nums everywhere money appears** — non-negotiable; currency symbols smaller than the number; negative values: −, color, AND parentheses in statements (never color alone).
- **Numbers doctrine:** consistent precision per context (balances 2dp, rates 2–4dp), thousands separators, ISO/locale-correct formats. The design system's number rules go in `memory/design.md` on day one.
- **Imagery:** the product (cards, dashboards, statements) rendered impeccably; real-card mockups; photography only with genuine humans (consumer credit/banking). Zero rocket ships to the moon (post-2022 crypto burn).
- **Theme:** light for consumer banking/payments; dark licensed for trading/pro terminals.

## Page priorities
1. Landing: what happens to my money, in one screen
2. Security page: specifics — encryption, custody, insurance (FDIC/SIPC/local equivalents), audits, bug bounty — linked from footer + every conversion form
3. Pricing/fees: **total transparency table** (every fee, no asterisk mazes) — the sector's strongest differentiator
4. Regulatory footer: licenses, registration numbers, disclosures per market — legal reviews this, design must make room gracefully (13px, organized, real)
5. In-app: transaction tables (`components/tables.md`), statements, limits/verification states

## Trust requirements
Regulator/license mentions (real) · security page depth · recognizable partner/bank logos ·
support that looks reachable (humans, hours, phone for money problems) · precise legal
footer · **KYC flows designed with care** (`patterns/onboarding-auth.md` — the document-upload
step is where fintech onboarding dies: progress states, camera guidance, "why we ask" notes).

## Motion character
Calm and instant. No springs, no confetti on transactions (a transfer is not a party) —
confirmation is a receipt: timestamped, referenced, exportable. Count-ups only on marketing
metrics, never on balances.

## Anti-patterns
Playful copy near money actions ("Oops! Your transfer failed 😅") · balance ambiguity during
loading (show skeleton, never $0.00 flash) · urgency mechanics on financial decisions ·
crypto-bro aesthetics for regulated products · fee surprises at the last step.

## References
Stripe (the sector's craft ceiling), Mercury (SMB banking done modern), Wise (fee transparency as brand), Robinhood (consumer clarity — and cautionary tales in gamification).
