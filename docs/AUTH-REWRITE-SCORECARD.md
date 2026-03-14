# GRIIT Auth Rewrite — Full Scorecard Audit

## Category Scores (0–10 each, strict)

| Category | Score /10 | Top issue |
|----------|-----------|-----------|
| **Type Safety** | 8 | `app/api/trpc/[trpc]+api.ts` line 34: `router: appRouter as any`. Production app code has 1× `any`. Test files (nudges.test.ts, accountability.test.ts) use `any` — acceptable. |
| **Error Handling** | 7 | Many async paths use `Alert.alert()` for errors instead of inline (e.g. app/task/timer.tsx, app/(tabs)/index.tsx, app/edit-profile.tsx). Auth screens (signup, login, create-profile) use inline only. Loading not always reset in `finally` outside rewritten screens. |
| **Code Cleanliness** | 9 | No dead code or commented blocks in rewritten auth files. Some `console.log`/`console.warn` in app (e.g. [AUTH] kept intentionally). Minor: string literals for tRPC paths in several files. |
| **Design System** | 10 | No raw hex in app screens; all use DS_COLORS. Spacing/typography consistent in auth screens. |
| **Accessibility** | 8 | Rewritten auth screens have accessibilityLabel, accessibilityRole, accessibilityLiveRegion on errors. Other screens (e.g. task/timer, discover) have mixed coverage; some TouchableOpacity without accessibilityLabel. |
| **Performance** | 7 | FlatLists use keyExtractor (discover, activity, chat, accountability/add). Few use getItemLayout. Inline functions in JSX in some list renderItem. Auth screens use useCallback for handlers. |
| **Auth Reliability** | 9 | Signup creates user + profile (Supabase upsert) + completeOnboarding (non-fatal). Signin routes by profile (tabs vs create-profile). Session persists (Supabase client). Email confirmation bypassed via signInWithPassword after signUp. |
| **Backend Sync** | 7 | completeOnboarding uses TRPC.user.completeOnboarding. Many other calls use string literals (e.g. "leaderboard.getWeekly", "profiles.getPublicByUsername", "challenges.create") instead of TRPC constants. Railway deploy done. |
| **TOTAL** | **65 / 80** | |

---

## Top 5 Highest Priority Fixes

1. **Replace `Alert.alert` with inline errors (auth-related and high-traffic)**  
   **Files:** `app/auth/forgot-password.tsx` (lines 33, 37, 47, 53), `app/edit-profile.tsx` (43, 61, 67), `app/_layout.tsx` (121 session expired).  
   **Change:** Add local error state and render error text below form / in banner; remove Alert.alert for validation and API errors so all errors are inline.

2. **Type safety: remove `as any` in app API route**  
   **File:** `app/api/trpc/[trpc]+api.ts` line 34.  
   **Change:** Use proper type assertion from backend export, e.g. `router: appRouter as AppRouter` or cast via `createCaller` types so no `any`.

3. **Use tRPC path constants everywhere**  
   **Files:** `app/(tabs)/index.tsx` ("leaderboard.getWeekly", "challenges.getFeatured"), `app/(tabs)/create.tsx` ("challenges.create"), `app/profile/[username].tsx` ("profiles.getPublicByUsername"), `app/(tabs)/activity.tsx` ("leaderboard.getWeekly", "respects.give", "nudges.send"), `app/accountability/add.tsx` ("profiles.search", "accountability.invite"), `app/(tabs)/discover.tsx` ("challenges.getStarterPack", "challenges.getFeatured", "challenges.getById").  
   **Change:** Replace string literals with `TRPC.*` constants from `lib/trpc-paths.ts`; add any missing paths to TRPC and use them.

4. **Accessibility: add accessibilityLabel and accessibilityRole to all touchables**  
   **Files:** Audit `app/task/timer.tsx`, `app/task/photo.tsx`, `app/task/run.tsx`, `app/(tabs)/discover.tsx`, `app/challenge/[id].tsx` for TouchableOpacity/Pressable without accessibilityLabel or accessibilityRole.  
   **Change:** Add accessibilityRole="button" and a short accessibilityLabel for every interactive element.

5. **Error handling: ensure loading state reset in `finally`**  
   **Files:** Any async handler that sets loading true but has multiple early returns (e.g. some flows in `app/challenge/[id].tsx`, `app/commitment.tsx`).  
   **Change:** Use a single `try { ... } catch { setError(...) } finally { setLoading(false) }` so loading is always cleared.
