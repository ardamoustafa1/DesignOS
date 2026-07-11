# Governance & Maintainer Succession Pathway

DesignOS operates under an open, transparent project governance model designed to ensure long-term stability, community representation, and enterprise continuity.

---

## 1. Core Principles

- **Open Source Permanence:** DesignOS is licensed under the MIT License (`LICENSE`). The core rules, CLI, and validators will always remain open source.
- **Evidence-Driven Evolution:** Changes to design rules are governed strictly by the evidenced critique standard documented in `CONTRIBUTING.md`. No rule lands on personal preference alone.

---

## 2. Bus-Factor Mitigation & Multi-Maintainer Pathway

To ensure continuity beyond a single maintainer:

### Contributor to Maintainer Graduation
Contributors who demonstrate consistent, high-rigor engagement are invited to join the core maintainer team under clear graduation criteria:

1. **Active Contribution:** Authoring or reviewing at least 5 meaningful pull requests (new modules, validator enhancements, or independent eval runs).
2. **Quality Bar Adherence:** Demonstrating deep alignment with the DesignOS honesty doctrine and adversarial review standards.
3. **Co-Maintainer Commit Rights:** Graduated maintainers receive full repository merge rights and release signing authority.

### Organizational Escrow & Continuity Guarantee
Every DesignOS release is self-contained within git history and requires zero external cloud services, API keys, or remote registries to function. In the event of maintainer inactivity (> 90 days without triage), active contributors are empowered under community consensus to fork and publish community-maintained releases without technical impediment.

---

## 3. Reporting Issues & RFCs

- **Security & Vulnerabilities:** See `SECURITY.md`.
- **New Modules & Architectural Changes:** Open an issue using the Module Proposal template or initiate a discussion under the **Ideas** category in GitHub Discussions (`DISCUSSIONS.md`).
