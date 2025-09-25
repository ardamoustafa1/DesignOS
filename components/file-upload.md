# File Upload

Upload is where users hand you their work — treat every byte like luggage at an airline
that intends to keep its customers. Loss, silence, and mystery failures here are trust
felonies (`components/states.md` work-preservation doctrine at maximum).

## The dropzone
```
Surface     dashed 1.5px border (--border-strong) · radius-lg · padding 32–48px ·
            centered: icon (upload/cloud, 24px muted) + "Drag files here or browse"
            (browse = real link/button styling) + constraints line
Constraints VISIBLE UPFRONT: "PNG, JPG or PDF · up to 25MB each · max 10 files" —
            13px muted. Discovering limits via error is hostile design.
Drag state  whole zone tints (--accent-subtle) + border solid accent · page-level drag:
            the dropzone (or a full-page overlay target) announces itself the moment a
            file enters the WINDOW, not the small target
Compact     inline variant for forms: button "Attach files" + list below — dropzones
            need earning; a 200px zone for an optional avatar is spatial theater
```
- The hidden `<input type="file">` remains the real mechanism: label-triggered, correct
  `accept`, `multiple` as designed — keyboard and screen-reader path is the NATIVE path.
- Paste support (screenshots from clipboard) for chat/issue-style products; say so
  ("or paste an image").

## During upload (the trust window)
```
Per-file row   icon/thumb (40px) · name (truncate middle: "quarterly-repo…-final.pdf") ·
               size · progress bar (determinate!) · cancel ✕
Progress       real percentage — uploads know their bytes; NEVER indeterminate spinners
               for uploads · speed/ETA for >10s uploads
Multi-file     individual rows + optional summary ("3 of 7 uploaded") · parallel uploads,
               independent failures
Background     uploads survive navigation within the app (global upload tray, bottom-right)
               or WARN before route change kills them — silent death is a felony
```
- Cancel works instantly and cleans up partials. Pause/resume for >100MB contexts
  (chunked/resumable protocols — a network blip at 94% of 2GB must not restart).

## Validation & failure
- Validate BEFORE upload starts: type, size, count — reject locally with the specific
  rule broken ("video.mov is 340MB — limit is 25MB"), keep valid siblings queued
  (one bad file never fails the batch).
- Server failures: per-file error state + one-click retry (idempotent) · after 2 retries,
  escalate honestly (`components/states.md` error doctrine).
- Content errors (corrupt, malware, wrong dimensions): specific + actionable ("Image is
  400×300 — needs at least 1200×630").
- NEVER lose the rest of the form because uploads failed (`components/forms.md` preserve rule).

## After upload
- Success per file: ✓ + instant preview (image thumb, PDF first page, generic-typed icon
  otherwise) — the preview IS the confirmation that the right file arrived.
- Actions: view/download, replace, remove (confirm only if irreversible), reorder (drag
  with keyboard alternative) when order matters (galleries).
- Image-specific: crop/focal-point step where the display context demands it (avatars:
  circle-crop preview at actual display size).

## Special contexts
- **Avatar upload:** click-the-avatar affordance + compact flow (pick → crop → done),
  optimistic display (`motion/micro-interactions.md`).
- **Import flows (CSV/data):** upload → **preview + column mapping** → validate → report
  ("192 rows imported, 3 skipped: [reasons + row numbers]") — the mapping preview is the
  product (`industries/crm-erp.md` migration doctrine).
- **Bulk/folder upload:** tree preview, per-file dedupe prompts batched into ONE decision
  ("14 duplicates: replace all / skip all / choose").

## Accessibility
- Dropzone reachable and operable by keyboard (it's a button semantically); drag-and-drop
  is an ENHANCEMENT, never the only path.
- Progress announced: `aria-live` milestones ("upload complete", failures) — not every
  percentage tick.
- Focus lands on the uploaded-file row (or error) after completion.

## Anti-patterns
- Limits revealed post-failure · indeterminate upload spinners · batch-failing one bad
  file · uploads dying silently on navigation · fake progress (100% then "processing…"
  for 2 minutes — split the stages honestly) · drop targets that only highlight when
  you're already pixel-perfect over them · replace-without-confirm on the only copy

## Checklist
- [ ] Constraints visible upfront; local validation pre-flight; batch survives bad files
- [ ] Determinate per-file progress + cancel; resumable where sizes demand
- [ ] Navigation-safe (tray or warning); retries idempotent; errors specific
- [ ] Preview-as-confirmation; replace/remove/reorder as needed
- [ ] Keyboard-complete native path; announcements polite; form never collateral damage
