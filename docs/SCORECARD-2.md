# GRIIT Scorecard Audit — Round 2

**Date:** 2025-03-13  
**Baseline:** Previous scores (Type Safety 8, Error Handling 7, Code Cleanliness 9, Design System 10, Accessibility 8, Performance 7, Auth Reliability 9, Backend Sync 7. Total 65/80.)

**Scope:** Full codebase audit after scorecard top-5 fixes and cleanup pass.

---

## Summary Table

| Category       | Old | New | Delta   | Top remaining issue |
|----------------|-----|-----|---------|----------------------|
| Type Safety    | 8   | 9   | +1      | `app/(tabs)/create.tsx` line 381: `task as unknown as TaskTemplate` — type assertion could be replaced with proper typing. |
| Error Handling | 7   | 7   | same    | `app/(tabs)/index.tsx` line 479: `Alert.alert("Error", "Couldn't secure day. Try again.")` — should use inline error state. |
| Code Cleanliness | 9 | 9 | same  | `app/welcome.tsx` line 220: `console.error(err)` not prefixed with [AUTH] or [DEBUG]. |
| Design System  | 10  | 10  | same    | None. No raw hex in app; DS_COLORS used consistently. |
| Accessibility  | 8   | 8   | same    | `app/welcome.tsx` line 325: `TouchableOpacity` (back button) missing `accessibilityLabel` / `accessibilityRole`. |
| Performance    | 7   | 7   | same    | No `getItemLayout` on any FlatList (e.g. `app/(tabs)/discover.tsx`, `app/(tabs)/activity.tsx`) — scroll performance not optimized. |
| Auth Reliability | 9 | 9 | same  | Session expiry already handled via banner + redirect in `_layout.tsx`; no material issue. |
| Backend Sync   | 7   | 8   | +1      | `app/challenge/[id].tsx` line 455: `trpcQuery("challenges.getById", { id: id! })` — string literal; should use `TRPC.challenges.getById`. |
| **TOTAL**      | **65** | **67** | **+2** | |

---

## Category Notes

### Type Safety (8 → 9)
- **Improved:** `app/api/trpc/[trpc]+api.ts` no longer uses `as any`; uses `appRouter as AnyRouter`.
- **Remaining:** App code still has `as unknown as` in `app/(tabs)/create.tsx` (line 381) and `app/challenge/[id].tsx` (line 493). Backend tests and some routes use `any` or `as unknown as` (acceptable in tests/backend). Top issue: create.tsx type assertion.

### Error Handling (7 → 7)
- **Same:** Forgot-password, edit-profile, and session-expired in _layout now use inline errors / banner. Many screens still use `Alert.alert()` for errors: index (secure day, freeze), create, activity, task/*, challenge, commitment, accountability, welcome, etc. Top issue: index.tsx secure-day error.

### Code Cleanliness (9 → 9)
- **Same:** tRPC path constants added in index, create, activity, discover, profile/[username], accountability/add. Console.warn with [challenge]/[commitment] removed. Explicit state types and DS_COLORS for error text applied. Remaining: welcome.tsx has `console.error(err)` without [AUTH]/[DEBUG]; tRPC string literals remain in settings, commitment, challenge/[id], activity, accountability. Top issue: welcome.tsx console.

### Design System (10 → 10)
- **Same:** No raw hex colors in app; all use DS_COLORS. No change needed.

### Accessibility (8 → 8)
- **Same:** Task screens (timer, photo, run), discover, and challenge/[id] have accessibilityLabel/accessibilityRole on touchables. welcome.tsx and other screens still have TouchableOpacity without a11y (e.g. welcome back button at 325, Continue at 358, toggle password at 456). Top issue: welcome.tsx line 325.

### Performance (7 → 7)
- **Same:** FlatLists use keyExtractor; no `getItemLayout` in codebase. Inline functions in list renderItem in some places. Top issue: missing getItemLayout for long lists.

### Auth Reliability (9 → 9)
- **Same:** Session expired uses banner + redirect; auth flows unchanged. No regression.

### Backend Sync (7 → 8)
- **Improved:** Six app files now use TRPC constants (index, create, activity, discover, profile/[username], accountability/add). Remaining string literals: challenge/[id].tsx (getById, recordOpen, join, markJoinedChallenge), commitment.tsx (challenges.join, referrals.markJoinedChallenge), settings.tsx (notifications, accountability, profiles), activity.tsx (respects.getForUser, respects.give), accountability.tsx (listMine, remove, respond). Top issue: challenge/[id].tsx line 455.

---

## Next 5 Highest Priority Fixes

1. **Replace Alert.alert with inline errors (home screen)**  
   **File:** `app/(tabs)/index.tsx`  
   **Lines:** 479, 517, 1217  
   **Change:** Add formError state and render inline error for "Couldn't secure day" and freeze error; remove Alert.alert for these user-facing errors.

2. **Use tRPC path constants in challenge detail and related screens**  
   **Files and lines:**  
   - `app/challenge/[id].tsx`: 455 (`challenges.getById`), 474 (`referrals.recordOpen`), 583 (`challenges.join`), 585 (`referrals.markJoinedChallenge`)  
   **Change:** Import TRPC from `@/lib/trpc-paths` and replace string literals with TRPC.challenges.getById, TRPC.referrals.recordOpen, TRPC.challenges.join, TRPC.referrals.markJoinedChallenge. Add any missing keys to lib/trpc-paths.ts.

3. **Use tRPC path constants in settings, commitment, activity, accountability**  
   **Files and lines:**  
   - `app/settings.tsx`: 135, 148, 158, 183, 195, 247  
   - `app/commitment.tsx`: 65, 70  
   - `app/(tabs)/activity.tsx`: 725, 773  
   - `app/accountability.tsx`: 37, 77, 96, 111  
   **Change:** Replace all trpcQuery/trpcMutate string literals with TRPC.* constants.

4. **Accessibility: add accessibilityLabel/accessibilityRole to welcome and settings touchables**  
   **Files and lines:**  
   - `app/welcome.tsx`: 325 (back button), 358 (Continue), 456 (toggle password), 469 (primary submit)  
   - Audit `app/settings.tsx` for TouchableOpacity/Switch without a11y.  
   **Change:** Add accessibilityRole="button" and a short accessibilityLabel to every interactive element.

5. **Code cleanliness: prefix or remove console in welcome**  
   **File:** `app/welcome.tsx`  
   **Line:** 220  
   **Change:** Replace `console.error(err)` with `console.error("[AUTH] Signup error:", err)` or remove if redundant with Alert.

---

## Audit Method

- Grep for `as any`, `Alert.alert`, `console.log/warn/error`, raw hex, tRPC string literals, TouchableOpacity/Pressable vs accessibilityLabel/accessibilityRole, getItemLayout.
- Compared file state to previous scorecard (AUTH-REWRITE-SCORECARD.md) and fix/cleanup commits.
- Scores are 0–10 per category; total 80. Deltas vs previous: +1 Type Safety, +1 Backend Sync; others unchanged.
