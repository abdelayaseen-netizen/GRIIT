# Nudge Feature & Chase Removal (Rork AI Plan)

## Root cause: why "Chase" previously did nothing

- **Chase was never implemented in the app.** It appeared only as:
  - A **display-only pill** in the static preview HTML files (`preview-app.html`, `preview-ui.html`): e.g. `<span class="feed-pill">👥 Chase</span>`.
  - Mentions in **docs** (e.g. DESIGN-SYSTEM.md, GRIT-SUCCESS-SCORECARD.md, BUTTON-INTERACTIVE-AUDIT.md) as a planned or placeholder feature.
- The **React Native app** (Activity/Movement tab) never had a "Chase" button or handler. It already had **Respect** (wired to `respects.give`) and **Nudge** (wired to `nudges.send`).
- So the "Chase" 404 / doing nothing was simply because **no backend route or frontend handler existed for Chase** — it was a UI label only in the previews.

## What was implemented (Nudge)

- **Backend:** `nudges` router with `send` and `getForUser`; anti-spam (1 nudge per sender→recipient per 24h); self-nudge rejected; random message from 3 options; push notification via Expo when recipient has `expo_push_token`.
- **Frontend:** Activity (Movement) tab shows Nudge button for other users only; auth gate for "nudge"; success "Nudged!"; rate-limit message "You already nudged them today."; activity feed shows "{senderName} nudged you: {message}".
- **Chase removed:** Replaced with "Nudge" in preview HTML; no Chase backend or app UI remains.

---

## Files changed

| Area | File | Change |
|------|------|--------|
| **Preview** | `preview-app.html` | Replaced "👥 Chase" pill with "✊ Nudge". |
| **Preview** | `preview-ui.html` | Replaced "👥 Chase" pill with "✊ Nudge". |
| **Frontend** | `app/(tabs)/activity.tsx` | Success message: Alert title "Nudged!" with empty body (lightweight). |
| **Backend** | `backend/trpc/routes/nudges.ts` | Fetch recipient `expo_push_token`; call `sendPushToUser(token, "Nudge", body)`; await push. |
| **Backend** | `backend/lib/push-reminder.ts` | `sendPushToUser(pushToken, title, body)`: if token present, POST to Expo Push API; no-op if missing. |
| **Migration** | `backend/migration-profiles-push-token.sql` | **New:** Add `profiles.expo_push_token` (TEXT). |
| **Tests** | `backend/trpc/routes/nudges.test.ts` | Mock `sendPushToUser` as async. |
| **Docs** | `docs/NUDGE-FEATURE-AND-CHASE-REMOVAL.md` | **New:** This file. |

Existing (unchanged) but used by Nudge:

- `backend/trpc/routes/nudges.ts` – already had send/getForUser, anti-spam, 3 messages.
- `backend/migration-nudges.sql` – `nudges` table + indexes.
- `app/(tabs)/activity.tsx` – Nudge button, `nudges.send`, activity feed nudge entries.
- `backend/trpc/app-router.ts` – `nudges: nudgesRouter`.

---

## Migration details

1. **`nudges` table** (already in `backend/migration-nudges.sql`):
   - `id` (UUID, PK), `from_user_id`, `to_user_id`, `message` (TEXT), `created_at` (TIMESTAMPTZ).
   - Indexes: `idx_nudges_to_user_created`, `idx_nudges_from_to_created`.
   - RLS: select all; insert with `auth.uid() = from_user_id`.

2. **`profiles.expo_push_token`** (new, `backend/migration-profiles-push-token.sql`):
   - `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;`
   - Used so the backend can send Expo push notifications (e.g. "{senderName} nudged you: {message}") when the recipient has a token stored.

Run both in Supabase SQL Editor if not already applied.

---

## Proof that Nudge works

- **Backend tests:** `backend/trpc/routes/nudges.test.ts`:
  - Nudge messages: exactly 3; `pickRandomMessage` returns one of them.
  - `nudges.send`: rejects self-nudge (BAD_REQUEST); rejects second nudge within 24h (TOO_MANY_REQUESTS); inserts and returns success when no recent nudge.
- **Manual smoke:**
  - Activity tab → find another user in THIS WEEK → tap Nudge → expect "Nudged!"; tap again same day → "You already nudged them today."
  - If recipient has `expo_push_token` in profiles, they get a push: "{senderName} nudged you: {message}."
  - Activity feed (Recent) shows "{senderName} nudged you: {message}".

---

## Confirmation: Chase is fully removed

- **App (React Native):** No "Chase" button, handler, or route. Movement feed has only Respect and Nudge.
- **Preview HTML:** "Chase" pill replaced with "Nudge" in `preview-app.html` and `preview-ui.html`.
- **Backend:** No Chase router, procedure, or table. Nudges are the only replacement.
- **Docs:** This file records the removal; other docs (e.g. DESIGN-SYSTEM, SCORECARD) may still mention "Chase" historically — update those to "Nudge" where they describe the current feature set.
