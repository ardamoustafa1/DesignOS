# Enterprise Adoption & Production Deployment Guide

DesignOS is built for commercial, high-security, and enterprise engineering teams adopting AI coding agents at scale. This guide addresses security, supply-chain risks, governance, and production deployment patterns.

---

## 1. Zero Supply-Chain Risk & Air-Gapped Readiness

Enterprise security teams often restrict external dependencies in developer tooling. DesignOS is architected specifically to eliminate third-party software supply-chain vectors:

- **Zero npm runtime or development dependencies:** `package.json` contains exactly `0` external libraries.
- **Pure Node.js Standard Library CLI:** Every command (`init`, `export`, `doctor`, `audit`) and validator (`check-drift`, `check-a11y-basics`) executes strictly against Node.js built-in modules (`fs`, `path`, `os`, `assert`).
- **Air-Gapped & Offline Friendly:** Once initialized inside a project repository (`./DesignOS/`), no external network calls are made. Design rules live locally as markdown inside your Git repository.

---

## 2. Mitigating Bus-Factor & Single-Maintainer Risk

To deploy DesignOS in enterprise production environments without organizational risk:

### Immutable Git SHA Pinning
Never depend on moving upstream branches in CI/CD pipelines. Pin your internal DesignOS distribution to an exact Release Tag or Git SHA:

```bash
# Pin to exact release v2.0.0
npx github:ardamoustafa1/DesignOS#v2.0.0 init
```

### Internal Enterprise Mirroring
Because DesignOS consists entirely of readable Markdown rules and standalone Node scripts, enterprise teams can mirror or fork DesignOS into their internal GitHub Enterprise / GitLab instance:

1. Mirror `ardamoustafa1/DesignOS` into your internal organization (`git@github.enterprise.com:core-infra/DesignOS.git`).
2. Customize `foundations/design-tokens.md` and `memory/brand.md` to encode your company's proprietary Design System tokens.
3. Distribute across product teams as an immutable internal standard.

For maintainer succession and multi-contributor governance policies, see [GOVERNANCE.md](GOVERNANCE.md).

---

## 3. Production Verification & Independent Evaluation

DesignOS adheres to a strict "measured, not vibed" honesty doctrine:

- **Automated Quality Gates:** Run `npm run validate` inside your PR CI pipelines to prevent design token drift and accessibility regressions before merging.
- **Independent Evaluation Protocol:** Corporate QA and Design systems teams can independently verify DesignOS outputs against control baselines using the protocol documented in `evals/RESULTS.md`. We actively welcome third-party certified evaluation reports (Run 003+) via Pull Request.

---

## 4. Enterprise Rollout Stages

1. **Stage 1: CI/CD Quality Gate (Non-Invasive)**
   - Add `npm run validate` to your frontend Pull Request checks.
   - Catches raw hex leaks, contrast failures below WCAG 2.2 AA, and off-grid spacing.

2. **Stage 2: Agent System Prompt Standardization**
   - Run `node DesignOS/bin/designos.js export all` to provision `.cursorrules`, `.github/copilot-instructions.md`, or `CLAUDE.md` across engineering teams.

3. **Stage 3: Corporate Brand Layer Integration**
   - Override the base tokens in `foundations/design-tokens.md` with your enterprise design tokens so all AI-generated code natively conforms to internal brand standards.
