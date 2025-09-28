# Industry: Logistics & Supply Chain

## Buyer psychology
Everything here orbits one question asked anxiously, repeatedly, by everyone from a
consumer awaiting a package to an ops manager routing 400 trucks: **"where is my thing
and when will it arrive?"** Answer it instantly and honestly and the design has done
its job. Buyers of logistics software are operators (`industries/crm-erp.md` daily-tool
psychology) plus their customers downstream — B2B tools are judged partly by the
tracking pages they let customers show THEIR customers.

## Visual language
- **Color:** operational clarity — neutral chrome, one brand accent, and a DESIGNED
  status system doing the heavy lifting (in-transit/delayed/delivered/exception — the
  `components/badges-chips.md` fixed-vocabulary rule is this sector's spine); semantic
  discipline absolute: amber = attention, red = exception ONLY.
- **Type:** grotesque + mono for the sector's textures: tracking numbers (copy-button
  treatment — `components/code-blocks.md` doctrine), container/SKU codes, timestamps
  (absolute + zone-stated for anything crossing borders —
  `components/pickers.md` timezone law).
- **Imagery:** real operations (warehouses, fleets, ports) photographed honestly;
  MAPS are the sector's hero visual — designed as UI (`industries/real-estate.md`
  map-sync doctrine, applied to movement).

## Page priorities & patterns
1. **The tracking page — the sector's most-visited artifact:** status headline first
   ("Arriving tomorrow, Jul 11, 9:00–12:00"), then the timeline (vertical stepper of
   real scan events, timestamped, newest state emphasized —
   `components/steppers-wizards.md` rail rendered as history), map when live-trackable,
   **delay honesty** (a stated delay with a new ETA beats optimistic silence — the
   sector's `psychology/trust.md` breach-and-repair moment happens daily), no login
   wall, mobile-first, shareable.
2. **Ops dashboards** (`components/dashboard.md` real-time section at full depth):
   exception-first hierarchy (the 12 problem shipments outrank the 4,000 fine ones —
   answer-first = "what needs me?"), alarm-fatigue discipline, bulk actions on tables
   (`components/tables.md` maximum tier: filters, saved views, virtualization).
3. **Booking/quoting flows:** multi-leg complexity chunked (`components/steppers-wizards.md`),
   rates with total-cost honesty (surcharges upfront — the fee-ambush rule, freight
   edition), document upload (`components/file-upload.md` — customs docs, BOLs).
4. **B2B marketing:** the workflow demo doctrine (`industries/crm-erp.md`), integration
   ecosystem (ERPs, marketplaces, carriers — the logo-grid that matters here),
   uptime/SLA proof (`industries/analytics-hosting.md` status-page doctrine: an outage
   here strands physical goods).

## Trust requirements
Real-time data honesty (a "live" map on 4-hour-old data destroys the word live) ·
ETA methodology reasonable and consistent · exception communication proactive
(`components/notifications.md` severity ladder: delay = needs-you tier) · compliance
surface (customs, dangerous goods, chain-of-custody) designed not disclaimed ·
carrier/partner logos real.

## Motion character
Precise-operational: live position updates smooth (interpolated, not teleporting pins),
status transitions quietly animated (`motion/micro-interactions.md` data rules),
zero decoration in ops surfaces. The tracking page may carry one warm moment: DELIVERED.

## Anti-patterns
Login-walled consumer tracking · "in transit" as a 9-day information void · optimistic
ETAs that slip silently · map theater (fake precision, decorative globes —
`industries/analytics-hosting.md` warning) · exception states styled identically to
normal · timezone-ambiguous timestamps on international shipments · carrier-jargon
statuses surfaced raw to consumers ("OFD SORT FACILITY EXCEPTION").

## References
Flexport (B2B logistics craft ceiling), consumer parcel leaders' tracking pages (study
the timeline conventions), Samsara (fleet ops density), Shopify's post-purchase tracking
(commerce-side conventions).
