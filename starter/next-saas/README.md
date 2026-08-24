# Starter: Next SaaS

Use this for App Router SaaS products, waitlists, dashboards, pricing, and docs.

> **Scaffold only:** the included page and neutral tokens are an installation check, not
> a design and never a shippable first pass. Replace the page with verified product
> material, a derived composition, complete states, and measured browser evidence.

## Install

```bash
npx github:ardamoustafa1/DesignOS init --agents --skills
node DesignOS/bin/designos.js export all
```

## First Brief

```text
Build the first pass of a Next.js SaaS product shell: marketing landing, pricing route,
authenticated dashboard shell, and docs route. Load DesignOS industries/saas.md,
patterns/landing-pages.md, patterns/pricing.md, components/dashboard.md,
patterns/docs-sites.md, and scoring/rubric.md. Use starter/tokens.css as the token seed.
End with a scorecard and redo anything under 95.
```

## Required Routes

- `/` landing
- `/pricing`
- `/dashboard`
- `/docs`

## Verification

```bash
node DesignOS/bin/designos.js review app --no-fail
node DesignOS/bin/designos.js audit app
```
