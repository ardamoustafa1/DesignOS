# Launch Playbook

Stars come from distribution × proof × timing — not from file count. This is the
operational plan for taking DesignOS worldwide. Work it top to bottom; check items off
in your fork.

## Phase 0 — Pre-flight (do BEFORE any public link exists)
- [ ] Replace every `USER` placeholder (README, website, package.json repo fields)
- [ ] Push to GitHub; enable Pages on `website/` (Settings → Pages → /website folder or
      a `gh-pages` action); verify the live URL on mobile
- [ ] Repo polish: description line ("Design intelligence OS for AI coding agents —
      one prompt in, Stripe-grade UI out"), topics (`claude`, `claude-code`, `cursor`,
      `ai-agents`, `design-systems`, `prompt-engineering`, `ui-design`), social-preview
      image uploaded — `press/social-preview.png` (1024×1024, dark, the boot-log
      terminal as the visual) is ready at Settings → Social preview → Edit
- [ ] Run the full validator suite + click every README link
- [ ] **Record the 30-second GIF** (the single highest-leverage asset): screen capture
      of a real session — prompt in → boot log → modules routing → scorecard → the
      showcase page. Put it at the top of the README. Tools: any recorder + gifski.
      No GIF = half the launch.
- [ ] Run `evals/` on at least one model pair and put the numbers in the README —
      "measured, not vibed" is the differentiator claim; back it before HN asks

## Phase 1 — Seeding (1–2 weeks before the spike)
- [ ] Soft-share in 3–5 niche communities where feedback > reach: Claude Code Discord,
      r/ClaudeAI, cursor forum, a designer-dev Slack. Ask for CRITICISM, not stars —
      the feedback hardens the repo and the early users become launch-day validators
- [ ] Fix everything they find; their issues/PRs make the repo look alive (it is)
- [ ] Line up 3–5 friends who'll genuinely try it launch-day (comments with real usage
      reports outperform any marketing reply)

## Phase 2 — The spike (pick ONE day, Tue–Thu, morning US-East)
**Hacker News (Show HN)** — the main event:
- Title (pick one, don't get clever past these):
  - `Show HN: DesignOS – an open-source "design brain" for AI coding agents`
  - `Show HN: I taught Claude taste – 150 files of design judgment, self-scored`
- First comment (yours, immediately): the honest story — why you built it, what it
  demonstrably improves (eval numbers), what it DOESN'T do (the honesty doctrine
  converts HN like nothing else), link to the 4-page showcase
- Stay online 6 hours; answer everything; concede valid criticism fast

**Product Hunt** (same day or +1):
- Tagline: "Give your AI coding agent design intelligence"
- Gallery: the GIF, 4 showcase screenshots, the scorecard, the boot log
- First comment: the maker story + the "kod kütüphanesi değil, yargı" positioning

**X/Twitter thread** (launch morning):
- Hook: the before/after — same prompt, with/without DesignOS, two screenshots
- Beats: the boot log → the 95 gate → the memory layer → the 24 sectors → the eval
  numbers → repo link. Tag relevant builders; don't beg for RTs
- Turkish thread separately — be the first voice from your market; local context hits differently

## Phase 3 — The long tail (weeks 2–8)
- [ ] Submit to lists: awesome-claude-code, awesome-cursorrules, awesome-ai-agents,
      awesome-design-systems (each accepts PRs — read their contribution rules)
- [ ] Write the deep-dive post (dev.to/Medium/own blog): "How we made an AI agent
      self-review its designs" — the scoring rubric + loop architecture is genuinely
      novel content; canonical-link it from the repo
- [ ] Short-form video (60s): the boot-log demo — YouTube Shorts/TikTok/Reels reach
      the design-tool audience GitHub never will
- [ ] Newsletter pitches: TLDR (Design + AI editions), Bytes, Console.dev, Prototypr —
      each has a submission path; the GIF + one-paragraph pitch
- [ ] Respond to every issue within 24h for the first month — early responsiveness
      converts visitors to contributors; slow repos die in the trough
- [ ] Ship a visible v1.3/v1.4 within 3 weeks of launch (the changelog IS marketing —
      `patterns/changelog.md`, applied to ourselves)

## The message discipline (all channels, one voice)
- **The claim:** agents write flawless code and 2015-grade UI; DesignOS closes the gap
- **The proof:** the showcase gallery + eval numbers + the caught-failure stories
- **The honesty:** it's judgment-as-markdown, not magic; distinctiveness transfers
  least (say so before they discover it)
- Never: "revolutionary", follower-begging, star-for-star schemes, fake momentum

## What success looks like (calibrate expectations)
100k stars is a years-long compounding outcome (shadcn took years + an ecosystem).
Realistic launch targets: HN front page → 1–3k stars week one; sustained shipping +
list placements + the GIF circulating → 10k in months. The playbook above is how every
repo that got there started. The variable you control after launch day: **shipping
cadence and issue responsiveness.**
