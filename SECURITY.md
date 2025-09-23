# Security Policy

DesignOS is a markdown knowledge base plus a zero-dependency installer and validator
scripts — the attack surface is small, but we treat it seriously (our own
`industries/cybersecurity.md` demands nothing less).

## Reporting

Found something — a malicious-pattern risk in the installer, a script injection vector,
a supply-chain concern? **Please don't open a public issue.** Use GitHub's private
vulnerability reporting on this repository (Security → Report a vulnerability).

You'll get an acknowledgment within 72 hours and a status update within 7 days.

## Scope

- `bin/designos.js` (the installer — file operations on user machines)
- `validators/*.js|sh` (executed in user CI)
- Anything in the repo that could execute or exfiltrate when consumed as intended

Out of scope: the markdown content itself (it's read by agents, not executed), and
vulnerabilities in the AI agents/models that consume DesignOS.

## Supply-chain posture

Zero runtime dependencies, by policy — `package.json` declares none, and PRs adding one
need extraordinary justification. Verify: `npm ls --all` on an install returns nothing
but the package itself.
