# Industry: Cybersecurity

## Buyer psychology
The buyer is a **professional skeptic** — CISOs and security engineers are paid to distrust
claims, and they extend that to your marketing. Fear-based selling ("hackers are coming!")
insults them; they live the threat model daily. What converts: technical specificity,
evidence of competence, and the sense that *the vendor's own security posture is visible
in their craft*. A security company with a broken focus state has failed the interview.

## Visual language
- **Color:** dark-first is the genre's native habitat (SOC rooms, terminals) — layered dark neutrals + one signal accent (cyan, green, or amber families; red reserved strictly for threat semantics). Light variants for GRC/compliance products aimed at auditors.
- **Type:** technical grotesque + **monospace as a core texture** (log lines, CVEs, hashes, code) — mono must be real content, not decoration.
- **Imagery:** the product's actual detection/triage UI; architecture diagrams that a security engineer would nod at; threat data visualized honestly. BAN: hoodie hackers, padlocks, glowing shields, binary rain, world-map "attack pew-pew" (unless it's your actual live product view).
- **Density:** this audience *prefers* information density — err toward dashboard-grade layouts even in marketing.

## Page priorities
1. Landing: what you detect/prevent, stated precisely, with the console visible
2. **How-it-works / architecture page:** deployment models, data flow, agent vs agentless — the technical evaluation page IS the conversion page here
3. Trust center: your own SOC2/ISO/pentest summaries, disclosure policy, security.txt — a security vendor without a public trust center is disqualified
4. Docs (public, good) — gated docs read as weak product
5. Threat research/blog — the credibility engine of the sector

## Trust requirements
CVE/vuln research publications · named framework mappings (MITRE ATT&CK, NIST, CIS) used
accurately · real compliance certs · responsible-disclosure program · specific numbers with
methodology ("blocks X of Y in Z benchmark") · engineering-literate copy (one misused term —
"military-grade encryption" — and the audience closes the tab).

## Motion character
Precise preset, near-zero decoration. Licensed signatures: live-data ticking (real),
terminal/log streaming (real), scan-progress states. Alert animations follow alarm-fatigue
discipline (`components/dashboard.md` real-time section) — everything urgent = nothing urgent.

## In-product notes
Triage tables are the product (`components/tables.md`: bulk actions, severity chips with
defined thresholds, absolute timestamps for forensics) · empty states for "no threats" must
read as *vigilant calm*, not "nothing works" ("Monitoring 4,210 endpoints — no active threats").

## Anti-patterns
FUD headlines with breach-cost statistics as the hero · fake live attack maps · "unhackable /
100% secure" claims (legally and technically radioactive) · dark theme with 8 neon accents
(threat-disco) · security theater badges that don't resolve to real attestations.

## References
Cloudflare (technical marketing ceiling), Tailscale (docs-as-marketing, honest voice), CrowdStrike (enterprise gravitas), Vercel (dark-UI craft transferable here).
