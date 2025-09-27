# Industry: Analytics & Hosting/Infrastructure

Two developer-adjacent sectors sharing one truth: **the product is invisible until it fails,
so the design must make competence visible.** Numbers, latency, uptime, and honesty are the
brand. Split guidance below where they differ.

## Buyer psychology
- **Analytics:** buyers drown in metrics elsewhere; they're buying *clarity* — "will I finally
  understand what's happening?" Show the insight, not the data volume. Privacy posture is now
  a primary differentiator (GDPR-era buyers ask first).
- **Hosting/Infra:** engineers with pager trauma. They're buying *sleep* — reliability evidence,
  escape hatches (no lock-in), and docs. Marketing that sounds like marketing repels them;
  the sector's best pages read like engineering documents with great typography.

## Visual language
- **Color:** dark-first native for both (terminals, dashboards, ops rooms); layered dark
  neutrals + data-viz accent discipline — chart palettes ARE the brand palette (design them
  as one system, `foundations/colors.md` + `dataviz` doctrine). Analytics may run light for
  business-user products (marketing/product analytics).
- **Type:** grotesque + heavy mono usage (metrics, code, configs, logs — all real);
  tabular-nums universally; numbers get display-type treatment (a big honest "99.98%" is the
  sector's hero image).
- **Imagery:** THE DASHBOARD is the hero — real product, real-looking data (plausible curves,
  realistic noise; perfect hockey sticks read as fake); architecture diagrams engineer-grade;
  zero stock photography, zero server-rack clichés.

## Page priorities & patterns
1. **Landing:** live-feeling product demo above the fold (interactive dashboard embed or
   flawless recording); for hosting: the deploy story in one visual ("git push → live URL")
2. **The status page** (hosting especially): public, honest, historical — THE trust asset;
   link it from the footer's "All systems operational" dot (`components/footer.md`)
3. **Pricing:** usage-based calculators with cap/estimate stories (`patterns/pricing.md` —
   bill-shock fear is the #1 objection; "predictable pricing" claims need mechanisms shown);
   analytics: event/session-volume tiers with overage clarity
4. **Docs:** first-class product surface — search-first, copy-paste-ready, dark-mode-correct
   code blocks; docs quality is evaluated before the product is
5. **Benchmarks/comparison pages:** methodology-transparent (reproducible = credible;
   cherry-picked = detected), honest "when NOT to use us" sections outperform pure boasting

## In-product doctrine
- Analytics: `components/dashboard.md` at full depth — question-first widget hierarchy,
  chart-type correctness, timeframe rigor; empty states teach instrumentation (the activation
  cliff: "no data yet" must become a setup wizard)
- Hosting: deploy/build states are the core UX — streaming logs (mono, timestamped,
  searchable), progressive build steps with real progress, failure states with actionable
  errors + docs links (`components/states.md` error doctrine at max)
- Both: incident communication design — degraded-service banners, honest post-mortems
  (post-mortem pages are marketing assets in this sector)

## Trust requirements
Published SLAs with teeth · transparent incident history · third-party benchmarks or
reproducible methodology · data-residency/privacy specifics (analytics: cookie posture,
data ownership, GDPR mechanics in plain language) · migration/export paths documented
("leave anytime" sells staying) · real engineering blog.

## Motion character
Precise preset; licensed signatures: live-ticking metrics (real), log streaming, deploy-progress
choreography, chart draw-ins (once, 300ms, then data updates crossfade —
`motion/micro-interactions.md` data rules). Nothing decorative; latency-obsessed audience:
the site itself must be the performance proof (static-fast, `checklists/performance.md` strictest tier).

## Anti-patterns
Fake dashboards with impossible data · "blazing fast" without numbers · uptime claims without
status-page links · pricing pages that require a calculator PhD · dark-theme charts with
unreadable gridlines (`foundations/colors.md` dark discipline) · animated network-globe heroes
eating the CPU the copy claims to save.

## References
Vercel (deploy-story ceiling + monochrome authority), Datadog (density at scale), Plausible/Fathom (privacy-first analytics positioning), Grafana (ops-viz conventions), Cloudflare (infra marketing + status honesty), Netlify (docs-marketing integration).
