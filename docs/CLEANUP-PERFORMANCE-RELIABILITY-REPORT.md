# Cleanup + Performance + Reliability Refactor Report

**Date:** 2025-02-28  
**Scope:** React Native/Expo frontend + tRPC backend. Safe refactor: no product behavior change unless broken.

---

## Phase 0 — Baseline

### A) Health checks

| Check | How to run | Result in this environment |
|-------|------------|----------------------------|
| **Typecheck** | `npm run typecheck` or `npx tsc --noEmit` | **Not run** — Node/npx were not in PATH. Script added: `"typecheck": "tsc --noEmit"` in package.json. |
| **Lint** | `npm run lint` (expo lint) | **Not run** — same env. Run locally. |
| **Tests** | `npm run test` (vitest run) | **Not run** — same env. Run locally. |
| **Create Challenge script** | `npm run test:create-challenge` | **Not run** — requires Node. |

**Critical flows to protect (unchanged by this refactor):**

1. App launch → auth/onboarding → tabs  
2. Discover browse → challenge detail → join  
3. Create Challenge → submit → success  
4. Home → Secure Day / check-in  

---

## 1) Dead code removed

### Files deleted

**None in this session.** Previous cleanup already removed:

- `src/components/ui/ProgressBar.tsx`
- `src/components/ui/ListOptionCard.tsx`
- `src/components/ui/ModalSheet.tsx`
- `mocks/data.ts`

(Reported in `docs/CLEANUP-DEAD-CODE-AND-CONSOLIDATION-REPORT.md`.)

### Exports removed

**None in this session.** UI index no longer exports ProgressBar, ListOptionCard, ModalSheet.

### Dependencies removed

**None.** All package.json dependencies are in use (Expo, tRPC, Supabase, etc.). No unused dependency was removed.

### Verification

- `challenges.list` is **not** called from app code (only getFeatured and getStarterPack are). Left in place as public API; added `.limit(50)` for safety.
- No navigation files, context providers, tRPC router registration, or migrations were removed or altered except as below.

---

## 2) Consolidations made

**None in this session.** Previous work already:

- Centralized relative-time formatting in `lib/formatTimeAgo.ts` (used by Activity and Chat).
- Centralized error formatting in `lib/api.ts` (`formatTRPCError`, `formatError`); Create Challenge and ApiContext use it.
- Removed duplicate inline “time ago” logic.

No further consolidation was done to avoid unnecessary behavior risk. Error handling and date utilities remain in single shared modules.

---

## 3) Performance improvements

| Change | Where | Expected effect |
|--------|--------|------------------|
| **Limit challenge list size** | `backend/trpc/routes/challenges.ts` | `list` and `getFeatured` now use `.limit(50)`. Reduces payload size and DB load when many challenges exist; Discover and any future list consumers stay fast. |
| **No refetch loops** | N/A | Confirmed: Discover fetches on mount/refresh with stable `fetchFeatured`/`fetchStarterPack`; no redundant polling. |
| **Create Challenge** | Already guarded | `createMutationPendingRef` and `submitStatus === 'submitting'` prevent double-submit; button disabled while submitting. |

Pagination or “load more” was **not** added: 50 items is sufficient for current scope; cursor-based pagination can be added later if needed.

---

## 4) Reliability fixes

### Buttons

- **No new fixes in this session.** Prior work fixed chat-info “View all members” and “Report an issue” with onPress handlers.
- **Audit:** Primary CTAs on Home (Secure Day, Discover, View Activity, freeze, milestone) have onPress; Create submit uses `handleCreate` with loading/disabled; Discover uses retry and category chips; Profile uses Edit, Share, Sign out, Retry. No dead buttons identified.

### Create Challenge

- **Verified in code:** Backend maps `simple` → `manual`, defaults journal `minWords` to 20, returns TRPCError codes; frontend shows loading, then success navigation or Alert on error; double-submit is guarded.
- **Regression tests:** `backend/trpc/routes/challenges-create.test.ts` (dbTaskType, journalMinWords); `scripts/verify-create-challenge.js` for local run.

### Error visibility

- Create flow uses `formatTRPCError` and `Alert.alert(errorInfo.title, errorInfo.message)`.
- Backend uses `TRPCError` with UNAUTHORIZED, BAD_REQUEST, INTERNAL_SERVER_ERROR where applicable.

---

## 5) Proof of correctness

### Typecheck

- **Script added:** `package.json` → `"typecheck": "tsc --noEmit"`.
- **Run locally:** `npm run typecheck`. Not run in this environment (Node unavailable).

### Tests

- **Existing:** `lib/api.test.ts`, `lib/time-enforcement.test.ts`, `lib/formatTimeAgo.test.ts`, `backend/trpc/routes/challenges-create.test.ts`, `backend/lib/streak.test.ts`.
- **Run locally:** `npm run test`. Not run in this environment.

### Manual smoke test (to be run by you)

1. **Launch app** — Splash → auth or tabs.
2. **Navigate tabs** — Home, Discover, Create, Activity, Profile; no crash.
3. **Tap primary buttons** — Secure Day, Discover CTA, Create Challenge submit, Join, Edit profile, etc.; each performs the expected action.
4. **Create Challenge** — Minimal valid challenge (title, description, one task) → submit → success screen; no hang, no silent failure.
5. **Discover → Join** — Open a challenge → Join → commitment → confirm; challenge appears in Home/state.

### Regression test

- **Present:** `challenges-create.test.ts` covers create-challenge helpers; `verify-create-challenge.js` runs the same logic without Vitest.
- **No new test added** — Create flow is already covered by unit tests and prior verification.

---

## Summary of file changes (this session)

| File | Change |
|------|--------|
| `backend/trpc/routes/challenges.ts` | Added `.limit(50)` to `list` and `getFeatured`; short JSDoc comments. |
| `package.json` | Added `"typecheck": "tsc --noEmit"`. |

---

## Checklist

- [x] No core flows broken (code review; no changes to auth, navigation, or Create submit logic).
- [x] Create Challenge remains correct (guards, backend limits, error handling unchanged).
- [x] Discover/List performance improved (bounded query size).
- [x] Buttons audited; no dead CTAs identified.
- [x] typecheck script added for CI/local.
- [ ] **You must run locally:** `npm run typecheck`, `npm run test`, and the manual smoke steps above.

---

**Conclusion:** This refactor adds safe backend limits and a typecheck script. Dead code and duplication were already addressed in the earlier cleanup. The app remains maintainable, and Create Challenge plus primary flows are unchanged and protected by existing tests and guards.
