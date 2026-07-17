# Navigation

The navbar is the most-seen component of any product and the first credibility check.
It must answer instantly: *whose site is this, what can I do, where's the action?*

## Principles
1. **Ruthless economy.** 4–6 top-level items for marketing, 5–8 for app sidebars. Every added item taxes all others (Hick's law — `psychology/cognition.md`).
2. **The CTA lives in the nav.** Marketing navbars end with the primary CTA (solid) and optionally login (ghost) beside it.
3. **Current location always visible.** `aria-current="page"` + a visible marker.
4. **Predictable beats clever.** Logo left (links home), nav center or left-adjacent, actions right. Users have a spatial habit; breaking it costs comprehension.

## Marketing navbar spec
```
Height:      64–72px desktop · 56–60px mobile
Container:   same max-width as page content (edges align with hero content)
Logo:        20–28px tall (wordmark) · isolated ≥40px from links
Links:       14–15px · 500 · --text-secondary → --text-primary on hover/current
Gaps:        24–32px between items · CTA isolated 16px+ from last link
Background:  transparent over hero → solid/blur on scroll (see behavior)
```

### Scroll behavior (pick deliberately)
- **Solid sticky:** always visible, `background: color-mix(bg 80%, transparent)` + `backdrop-filter: blur(12px)` + hairline bottom border appearing after 8px scroll. The modern default.
- **Hide-on-down, show-on-up:** for content-heavy pages; transition 200ms; never hide while a dropdown is open.
- Height may compress 8px on scroll — animate `height`, not padding jumps.

### The width budget & the crowded middle (769–1279px)
The navbar's most common real-world failure is not mobile — it's the **middle widths**,
where desktop layout persists but no longer fits. These rules are binding:
1. **The collapse breakpoint is measured, not defaulted.** Sum the bar's worst-case widths
   (logo + gaps + every link at its longest label + auxiliary widgets + CTA + container
   padding). Links collapse into the menu at the width where that sum exceeds the
   container **minus 48px of breathing room** — not at a framework's 768px habit.
   A 5-link bar with a wide logo typically needs to collapse below ~1150px, not 768px.
2. **Bar items never wrap.** Logo, links, pills, and CTA all carry `white-space: nowrap`;
   the bar is a single 64–72px line at every width until the collapse breakpoint. A
   two-line logo or a wrapped link label is an instant finding, not a quirk.
3. **Hiding links requires replacing them.** `display: none` on the link list without a
   visible menu button in the same breakpoint = navigation unreachable = instant fail
   (the CLI's `nav-unreachable` / `nav-hidden-no-menu` checks enforce this).
4. **Auxiliary widgets yield first.** A status pill, version badge, or search box between
   logo and links is a luxury: it needs a compact variant (icon/dot + short label) below
   ~1280px and disappears from the bar entirely before any link does. One auxiliary
   widget maximum — the bar is not a dashboard.
5. **Test 1024 explicitly.** It's the classic danger zone: too wide to trigger tablet
   collapse habits, too narrow for a full desktop bar. The visual gate renders it;
   look at it.

### Dropdowns / mega-menus
- Trigger: click (mobile+desktop safe) or hover-with-intent (150ms delay in, generous exit paths — no diagonal-move dropouts).
- Panel: radius + shadow tier-2, 8px offset from bar, entrance 150ms fade+4px translate.
- Mega-menu content: grouped links with 13px caps group labels; max 3 columns; one featured cell max (screenshot/promo). Every item real — no filler links to fake bigness.
- Keyboard: Enter/Space opens, arrows navigate, Esc closes and returns focus.

## Mobile
- Hamburger (24px, right) → full-screen or full-height sheet, entrance 250ms ease-out.
- Menu type: full-page overlay with 20–24px links, generous 16px+ tap rows, CTA pinned at bottom.
- The primary CTA stays visible in the collapsed bar if space allows (logo + CTA + burger is the strongest mobile nav).
- Close: X in same position as burger was + Esc + scrim tap.

## App navigation (sidebar shell)
- Width 240–280px expanded; collapsible to 64px icon rail (labels → tooltips) with state persisted.
- Anatomy top→bottom: workspace/logo block → primary nav (icon 20px + label 14px, 36–40px rows, 8px radius selection) → spacer → secondary (settings, help) → user block.
- Selection state: filled row (`--accent-subtle` bg + `--accent` text/icon or strong-neutral) — not just a text color change; left 2–3px indicator bar is the compact alternative.
- Section labels: 11–12px caps muted, 24px top gap.
- Badge counts right-aligned, tabular-nums; cap display at 99+.
- Mobile app shell: bottom tab bar (3–5 items, 24px icons + 10–11px labels) beats hidden drawer for daily-use products.

## Breadcrumbs & secondary levels
- Breadcrumbs for hierarchies ≥3 deep: 13–14px, `/` or `›` separators muted, current page unlinked, truncate middle on mobile.
- Second-level nav: horizontal tab row under the header (marketing/apps) — underline-indicator tabs, scrollable on mobile with fade-edge cue.

## RTL
Logo stays reading-start (`inset-inline-start`), primary nav follows, CTA reading-end —
the whole bar flips as a unit under `dir="rtl"` if built with logical properties and
flex (no manual reordering needed). The `›` breadcrumb separator is directional — mirror
it to `‹` under RTL, or use a script-neutral `/`. Full protocol: `foundations/rtl-i18n.md`.

## Anti-patterns
- Hiding nav links at a breakpoint with no hamburger/menu replacing them (navigation death)
- Desktop bar surviving into widths where items wrap, collide, or slide under the CTA (the 1024 collision)
- A status/version pill wider than the logo, wrapping to two lines, or outliving the links in the bar
- Nav items that are one-word mysteries ("Solutions", "Resources" hiding everything — if a dropdown has <3 strong items, promote or delete)
- Logo not linking home; logo center on desktop marketing (breaks scan start)
- Transparent nav with white text over a light hero photo (contrast roulette)
- Sticky nav >80px tall eating mobile viewports
- Hover-only dropdowns with zero click affordance (touch users locked out)
- Ten sidebar items at equal rank — group or cut

## Checklist
- [ ] ≤6 top items (marketing); CTA present and visually terminal
- [ ] Collapse breakpoint measured from real content widths; bar is one line with zero wrap/overflow at 375/768/1024/1440
- [ ] Every breakpoint that hides links shows a menu button; auxiliary widgets have compact variants and yield first
- [ ] Current page marked visibly + `aria-current`
- [ ] Scroll behavior deliberate; contrast valid over all scroll positions
- [ ] Full keyboard support incl. dropdown Esc/arrows; skip-link present
- [ ] Mobile: reachable CTA, 44px rows, close mirrors open
- [ ] Sidebar: selection state unmistakable, collapse persists
