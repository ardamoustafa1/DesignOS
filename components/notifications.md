# Notifications & Activity Systems

Toasts confirm (`components/modals.md`); this module is the *persistent* layer: notification
centers, inboxes, unread models, and digests. The design problem is attention economics:
every notification spends user trust — over-notify and users mute you forever.

## The severity ladder (route each event type deliberately)
```
Interrupt   modal/full-screen — security events, destructive confirmations ONLY
Badge+item  notification center entry with unread mark — needs-you items (mentions,
            approvals, assignments, failures you own)
Feed-only   activity stream, no badge — FYI events (teammate actions, system changes)
Digest      batched email/summary — everything else
Silent      logged, queryable, never pushed
```
Classify every event type in `memory/design.md`. The default for a new event is one level
LOWER than the PM wants — inflation is one-way (users who mute never unmute).

## The bell & badge
- Bell icon in topbar; count badge = **needs-action items only**, not all unread
  (`components/badges-chips.md` count rules: 99+ cap, zero disappears).
- One bell. Products with bell + inbox + alerts icon have already lost.
- New-item pulse: one subtle animation on arrival (`motion/micro-interactions.md`), never
  perpetual.

## Notification center (the dropdown/panel)
```
Panel      380–440px · right-aligned under bell · max-height 70vh, internal scroll
Header     "Notifications" + Mark-all-read + settings gear (routes to preferences)
Tabs       optional: All / Mentions / Following — only if volume genuinely demands
Row        avatar-or-icon (typed) · actor + verb + object copy · relative time ·
           unread: bg tint + leading dot · 64–72px, full-row clickable to the subject
Footer     "View all" → full-page inbox (when volume justifies one)
```
- Copy pattern: **actor verb object** ("Maya approved your expense report") — specific
  nouns, linked object. Never "You have a new notification" (a notification about a
  notification).
- Grouping: collapse same-type bursts ("Maya and 4 others reacted…"); group by day after
  today.
- Actions inline where the response is binary (Approve/Decline buttons in the row) —
  acting from the notification is the premium experience; navigating is the fallback.
- Read model: opening the panel ≠ read; clicking an item = read; explicit mark-all.
  Unread must be recoverable (a "read" filter) — auto-vanishing items feel like data loss.

## Full inbox (high-volume products: CRMs, dev tools)
When notifications are a *workspace* (GitHub-class): full page, filters (type/repo/person),
bulk select + mark/mute, keyboard j/k traversal, archive-vs-done semantics defined.
This is `components/tables.md` discipline applied to attention.

## Preferences (the trust contract)
- Per-event-type × per-channel (in-app / email / push / Slack) matrix — grouped by
  category with sane master toggles, NOT 40 flat checkboxes.
- Defaults conservative; every marketing-ish type default-off (`psychology/persuasion.md`
  consent doctrine).
- Every email footer: one-click unsubscribe *of that type* + link to the matrix.
- Mute granularly: this thread, this project, this person — mute-everything is the rage
  option users reach when granular mute is missing.

## Real-time behavior
- Arrivals while the panel is open: append with a "1 new" pill at top (click to reveal) —
  never reflow the list under the user's cursor.
- `aria-live="polite"` for arrival announcements; critical alerts may use assertive
  (`foundations/accessibility.md`).
- Cross-tab sync: reading in one tab clears the badge in all.

## Anti-patterns
- Badge counting FYI events (a bell crying wolf)
- "Clear all" as the only management tool (that's a landfill, not an inbox)
- Notifications with no deep link (told something happened, can't go there)
- Unread state lost on panel-open (read-on-sight model punishes glancing)
- Celebration/marketing events in the needs-you channel ("We shipped a new feature! 🎉"
  belongs in the changelog — `patterns/changelog.md`)
- Push permission requested on first page load (earn it at a moment of relevant value)

## Checklist
- [ ] Every event type classified on the severity ladder, recorded in memory
- [ ] Badge = needs-action only; copy = actor-verb-object with deep links
- [ ] Inline actions for binary responses; grouping for bursts
- [ ] Read model explicit and recoverable; cross-tab sync
- [ ] Preference matrix per type×channel, conservative defaults, granular mute
- [ ] Live arrivals don't reflow; announcements polite
