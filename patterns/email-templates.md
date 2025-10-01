# Email Design — Transactional & Lifecycle

Email is the product surface with the WORST rendering environment (Outlook still runs
Word's engine) and the highest stakes per pixel (password resets, receipts, alerts).
Design for the medium's brutal physics, not for your browser.

## The two families (never blend their designs)
| | Transactional | Marketing/lifecycle |
|---|---|---|
| Trigger | user action (reset, receipt, alert, invite) | campaigns, digests, onboarding drips |
| Job | complete ONE task instantly | earn a click without spending trust |
| Design | minimal, single-action, fast | branded, still restrained |
| Legal | no consent needed; NO promo smuggled in | consent + working one-click unsubscribe |

Smuggling promos into receipts is both illegal in many markets and a spam-folder ticket
for your password resets — the deliverability of transactional mail is a protected asset.

## Layout physics (the constraints ARE the spec)
```
Width       600px single column, centered · tables-for-layout still the reality for
            broad client support · mobile: fluid to 100%, 16px side padding
Type        system-font stacks (web fonts fail in most clients) · body 16px/1.6 ·
            headings 20–24px · buttons 16px 600
Buttons     bulletproof: padded table-cell/border technique, min 44px tall, full URL as
            fallback text link BELOW the button ("Button not working? Paste this link:")
Images      always with alt text that works ALONE (image-blocking is default in Outlook/
            privacy modes — the email must function as text) · no image-as-entire-email
Dark mode   clients invert unpredictably: test both, use transparent-background logos,
            avoid pure-white image backgrounds that become glare boxes
```

## Transactional anatomy (the DesignOS default template)
```
[logo, small, linked]
[one heading: the event — "Reset your password"]
[1–2 sentences of context, human voice]
[THE button — one, verb+outcome]
[fallback link · expiry note if any ("expires in 1 hour")]
[why-you-got-this line + support contact]
[footer: entity, address, minimal links]
```
- One email = one job. A reset email with three CTAs is a phishing-lookalike.
- **Security-adjacent emails** (resets, new-device, verification): extra plain — exact
  requesting context ("requested from Chrome on macOS, Istanbul, 14:02"), what-to-do-if-
  not-you path, and NEVER ask for credentials in-thread (train users on the real pattern —
  `industries/fintech.md` trust doctrine).
- Receipts/invoices: the numbers table (items, totals, payment method, date, invoice #) +
  PDF link — designed with `foundations/typography.md` number discipline; users file these.

## Subject lines & preview text
- Subject = the event, specific, no clickbait: "Your July invoice from Relay ($49.00)".
  Transactional subjects are UI labels, not copywriting canvases.
- Preheader text set deliberately (the gray line after the subject) — otherwise it shows
  "View in browser? Unsubscribe" as your opener.
- From-name: product name, human sender only for genuinely human mail (fake-personal
  "CEO" drips from a noreply@ insult everyone).

## Lifecycle sequences (with `patterns/onboarding-auth.md`)
- Onboarding drip: triggered by BEHAVIOR, not just time (day-3 "try feature X" to someone
  who used X yesterday = "we don't watch, we broadcast").
- Digest emails (`components/notifications.md` ladder): scannable card list, each item
  deep-linked, frequency user-controlled.
- Win-back/trial-end: loss-framed honestly (`psychology/persuasion.md` — show what they
  built, not fake discounts).
- Every lifecycle mail: one-click unsubscribe FROM THAT TYPE + preference-center link.

## Testing gate (emails ship blind — test or fail)
Litmus/manual matrix: Outlook Windows, Gmail web+app, Apple Mail (+dark), image-blocking
ON. Send-to-self is not testing. Render bugs in a password reset are P1 product bugs.

## Anti-patterns
- The 3-column-in-Outlook collapse · web-font dependence · image-only emails ·
  buttons that are images · promo in receipts · "noreply@" for mail asking users to reply ·
  unsubscribe hidden in 8px gray · centered 3-paragraph text walls · countdown-timer gifs
  in transactional mail

## Checklist
- [ ] 600px single column, system fonts, bulletproof buttons + fallback links
- [ ] Functions with images blocked; dark-mode tested; alt text complete
- [ ] One job per email; security mail extra-plain with context + not-you path
- [ ] Subject=event, preheader set, honest from-name
- [ ] Lifecycle: behavior-triggered, type-level unsubscribe, preference center
- [ ] Client-matrix tested before ship — logged in the report's verification table
