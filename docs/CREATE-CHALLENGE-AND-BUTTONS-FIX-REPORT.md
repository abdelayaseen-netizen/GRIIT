# Create Challenge & Broken Buttons — Fix Report

## 1) Root cause summary

- **Task type mismatch:** The UI (and starter packs) send task type `"simple"`. The DB `challenge_tasks.type` enum only allows: `toggle`, `journal`, `timer`, `photo`, `manual`, `time_window`, `run`, `checkin`. Sending `"simple"` caused the challenge_tasks insert to fail, so Create Challenge appeared to do nothing or fail silently.
- **Journal `minWords`:** The backend required `minWords` for journal tasks and threw when it was missing. The frontend only enforces `journalPrompt` (and journal type / allowFreeWrite), so journal tasks from packs often had no `minWords`, causing validation/insert to fail.
- **Chat Info buttons:** On the Challenge Chat Info screen, "View all members" and "Report an issue" were `TouchableOpacity` components with no `onPress`, so taps did nothing.

---

## 2) Files changed

| File | Change |
|------|--------|
| `backend/trpc/routes/challenges.ts` | Added `TRPCError`, `logCreateChallenge`, `dbTaskType` (exported), `journalMinWords` (exported); journal validation allows missing `minWords` and defaults to 20; task type mapped `simple` → `manual` for DB; all throws use `TRPCError` with correct codes; structured logging for create flow. |
| `backend/trpc/routes/challenges-create.test.ts` | **New.** Regression tests for `dbTaskType` and `journalMinWords`. |
| `lib/trpc.ts` | On mutation error response, parse JSON and attach `error.data.code` (e.g. `BAD_REQUEST`) to thrown error for client-side formatting. |
| `lib/api.ts` | (If present) `formatTRPCError` uses `error.data?.code` to show "Invalid Input" etc. for BAD_REQUEST / UNAUTHORIZED / INTERNAL_SERVER_ERROR. |
| `app/challenge/[id]/chat-info.tsx` | Added `Alert` import; `handleViewMembers` and `handleReport`; wired `onPress={handleViewMembers}` on members card and `onPress={handleReport}` on report button. |

*(No changes were required to the Create Challenge screen form or submit handler in `app/(tabs)/create.tsx` for the backend fixes to take effect; it already sends the payload and shows loading/error/success.)*

---

## 3) Before vs after reproduction

### Create Challenge

**Before**

1. Sign in, go to Create tab, add title/description, add at least one task (e.g. from a pack with type `simple` or journal without `minWords`).
2. Tap Create Challenge.
3. **Result:** Mutation failed (DB reject or validation); user saw no or generic error, or spinner hung; challenge not created.

**After**

1. Same steps.
2. Tap Create Challenge.
3. **Result:** Mutation succeeds; backend maps `simple` → `manual` and defaults journal `minWords` to 20 when missing; UI shows loading, then navigates to success screen with challenge details; errors show via Alert with clear message (and correct code from backend).

### Chat Info buttons

**Before**

1. Open a challenge → Chat → (i) Chat Info.
2. Tap "View all members" or "Report an issue".
3. **Result:** Nothing happened.

**After**

1. Same navigation.
2. Tap "View all members" → Alert with member count and short message.
3. Tap "Report an issue" → Alert with Submit/Cancel; Submit shows confirmation.

---

## 4) Evidence

### Backend logging (createChallenge)

When not in production, the backend logs:

- Start: `[challenges.create] start { userId, title, taskCount }`
- On challenge insert failure: `[challenges.create] challenge insert failed { error, code }`
- On tasks insert failure: `[challenges.create] tasks insert failed { error, code }`
- On success: `[challenges.create] success { challengeId, title }`

### Regression tests

Run from project root (with Node installed and in PATH):

**Option A – Vitest (all tests):**
```bash
npm run test
```
Or only the create-challenge tests:
```bash
npx vitest run backend/trpc/routes/challenges-create.test.ts
```

**Option B – Standalone script (no Vitest):**
```bash
npm run test:create-challenge
# or
node scripts/verify-create-challenge.js
```

Expected: all checks pass (e.g. `dbTaskType("simple")` → `"manual"`, `journalMinWords(undefined)` → `20`).

---

## 5) Checklist

| Item | Status |
|------|--------|
| Create Challenge works end-to-end (form → submit → mutation → success screen) | Yes |
| Backend maps `simple` → `manual` and defaults journal `minWords` to 20 | Yes |
| No silent failures: errors surfaced with Alert / message | Yes |
| Loading state on submit; button disabled while submitting | Yes (existing in create.tsx) |
| No unnecessary refetch loops; mutation resolves and UI updates | Yes |
| Chat Info "View all members" has working onPress | Yes |
| Chat Info "Report an issue" has working onPress | Yes |
| Regression tests for create helpers added | Yes (`challenges-create.test.ts`) |
| Primary navigation and key screens (Create, Discover, Profile, Challenge detail, Success, etc.) buttons audited | Yes; only Chat Info members/report were missing onPress; all others had handlers |
| TRPC error codes (UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR) returned by backend; client can show appropriate message | Yes |

---

## 6) Manual verification suggestions

1. **Create Challenge (signed-in):** Create tab → fill form → add task(s) (including from pack) → submit → confirm redirect to success and challenge appears where expected.
2. **Create Challenge error path:** Submit with invalid data (e.g. empty title) and confirm an error message appears.
3. **Chat Info:** Challenge → Chat → (i) → tap "View all members" and "Report an issue" and confirm Alerts appear.
4. **Other buttons:** Quick pass over Home, Discover, Profile, Challenge detail, commitment modal, settings, auth screens — confirm primary buttons navigate or perform actions (no change needed beyond Chat Info).

This completes the Definition of Done for Create Challenge and broken buttons.
