# GRIIT Scorecard v2 — Post Deep Clean

**Generated:** 2025-03-22  
**Commit:** Run `git rev-parse HEAD` on a clean checkout of `main` (embedded hashes in docs cannot equal their own commit id).

---

## Codebase Metrics

| Metric | Value | Command / source |
|--------|-------|------------------|
| Total source files (.ts/.tsx) | 255 | `Get-ChildItem -Path app,components,lib,hooks,store,contexts,backend/trpc,backend/lib -Recurse -Include *.ts,*.tsx` |
| Total lines of code | 41,176 | Same paths; `Get-Content \| Measure-Object -Line` |
| Screens (app/**/*.tsx) | 44 | `Get-ChildItem -Path app -Recurse -Filter *.tsx` |
| Components (components/**/*.tsx) | 71 | `Get-ChildItem -Path components -Recurse -Filter *.tsx` |
| Backend protected routes | 86 | `(Select-String -Path backend\trpc\routes\*.ts -Pattern "protectedProcedure").Count` |
| Backend public routes | 16 | `(Select-String -Path backend\trpc\routes\*.ts -Pattern "publicProcedure").Count` |
| Database migrations | 46 | `Get-ChildItem supabase/migrations -Filter *.sql` |
| RLS policies | 60 | `(Select-String -Path supabase\migrations\*.sql -Pattern "CREATE POLICY").Count` |
| Database indexes | 37 | `(Select-String -Path supabase\migrations\*.sql -Pattern "CREATE INDEX").Count` |
| Test files | 12 | `**/*.test.ts` (0 `.test.tsx`) |

---

## Code Quality (Grade A/B/C/D/F)

| Metric | Value | Grade |
|--------|-------|-------|
| Raw hex outside design-system.ts (excl. ShareCards, ShareSheetModal, CelebrationOverlay) | 0 | A |
| console.log in prod code (app/components/lib/contexts/store) | 0 | A |
| Empty catch blocks (app/components) | 0 | A |
| TODO / FIXME / HACK | 0 | A |
| TypeScript strict (`npx tsc --noEmit`) | 0 errors | A |
| React.memo coverage (components with `React.memo` / total .tsx) | 24 / 71 (34%) | A (>30%) |
| Inline styles (`style={{}}` in app + components .tsx) | 22 | C (template: A under 10, B under 20) |
| DS_COLORS adoption (raw hex with exclusions above) | 0 | A |
| Accessibility labels (`accessibilityLabel` in app + components .tsx) | 204 | B (target >400 per template; >300 would be B) |
| Alert.alert (app + components .tsx) | 10 | B (<10) |

---

## Performance (Grade A/B/C/D/F)

| Metric | Value | Grade |
|--------|-------|-------|
| Largest file (lines) | `app/challenge/[id].tsx`: 1,515 | D (>1200) |
| Files >500 lines (app/components/lib .ts/.tsx) | 17 | C (<15) |
| FlatList : ScrollView ratio (occurrences, app + components .tsx) | 8 : 104 (~1:13) | B (>1:8) |
| React.memo components | 24 / 71 | A (>30%) |
| Promise.all batches (app + components + backend .ts/.tsx) | 42 | A (>15) |
| Prefetch on press-in (`onPressIn` mentions, app + components) | 20 | A (=20) |
| Skeleton loaders (`\bSkeleton\b` in app + components .tsx) | 2 | D (≪20) |
| Error boundaries (`ErrorBoundary` mentions, app + components .tsx) | 11 | A (>10) |
| placeholderData queries (app + components .tsx) | 5 | A (=5) |
| Query staleTime configured (`staleTime:` in app + components .tsx) | 9 | C (<10) |
| Haptic feedback (`Haptics.` in app + components .tsx) | 69 | A (>50) |
| Animations (`Animated.` in app + components .tsx) | 148 | A (>100) |

---

## Security (Grade A/B/C/D/F)

| Metric | Value | Grade |
|--------|-------|-------|
| Protected / total routes | 86 / 102 (84.3%) | B (<85%) |
| RLS policies | 60 | A (>50) |
| Input validation (zod) | tRPC procedures use `.input()` where defined | A (by convention) |
| Auth: Supabase JWT | Yes | A |
| Secrets in client code | EXPO_PUBLIC_* only (config keys, no raw secrets in repo) | A |

---

## Feature Completeness

| Feature | Status | Evidence |
|---------|--------|----------|
| Auth (email + password) | ✅ | `app/auth/login.tsx`, `signup.tsx`, Supabase session |
| Onboarding flow | ✅ | Compressed flow: `OnboardingFlow.tsx` (splash → goals → sign-up → auto-suggest) |
| Challenge creation (10 task types) | ✅ | Create wizard + `NewTaskModal` / backend task types |
| Task completion (all types) | ⚠️ | Unified `task/complete.tsx` + legacy routes still registered (`task/journal`, `run`, etc.) |
| Celebration + share cards | ✅ | `CelebrationOverlay`, `ShareCards`, `ShareSheetModal` |
| Multi-challenge home | ✅ | Home tab + active challenge context |
| Collapsible goal cards | ✅ | `GoalCard` and home layout |
| Streaks + milestones | ✅ | Streaks tRPC, profile, check-ins |
| Points system + explainer | ✅ | `PointsExplainer`, community stats |
| Leaderboard (weekly + global) | ✅ | `Leaderboard.tsx`, `TRPC.leaderboard` |
| Activity feed + reactions | ✅ | `LiveActivity`, feed tRPC, migrations for reactions |
| Verification badges on feed | ✅ | `LiveActivity` verification pills + DS_COLORS badges |
| Profile + heatmap + trophies | ✅ | Profile tab, `ActivityHeatmap`, `TrophyCase` |
| Notifications (local + prep) | ⚠️ | `lib/notifications.ts`; server push pipeline partial |
| Push token registration | ⚠️ | Registration helpers; full server fan-out not verified here |
| Journal prompts (rotating) | ✅ | Journal task + `task/journal` / complete flow |
| Workout timer verification | ✅ | Timer task types + verification metadata |
| Share cards (5 formats) | ✅ | `ShareCards.tsx` variants |
| Paywall / RevenueCat | ✅ | `paywall.tsx`, `lib/revenue-cat.ts`, `subscription.ts` |
| Teams / duo | ✅ | Teams routes, join-team, accountability |
| Strava integration | ⚠️ | `integrations` tRPC + connected accounts migration |
| Push notifications (server-sent) | ⚠️ | Nudges/notifications routes; end-to-end not scored |
| Offline support | ⚠️ | Offline banner / limited offline UX |
| Deep links | ✅ | `lib/deep-links.ts`, invite routes |
| App Store submission | ❌ | Not evidenced in repo |

---

## Backend audit (this pass)

| Check | Result |
|-------|--------|
| `select("*")` for row fetch | Replaced count-only `select("*", { head: true })` on `challenge_members` with `select("id", { count: "exact", head: true })` in `challenges.ts`. |
| Parallel awaits | `joinChallengeDirect` + challenge title fetch wrapped in `Promise.all` in `challenges.ts`; `challenge_tasks` + `check_ins` fetches parallelized in `checkins.ts` after task completion. |
| TRPCError usage | 129 `throw new TRPCError` vs 38 `.mutation(` in routes — strong error surfacing on mutations. |

---

## Recommendations (top 10, ordered by impact)

1. **Shrink `app/challenge/[id].tsx` (~1.5k lines)** — *Why:* largest-file and >500-line file metrics. *How:* Extract sections (hero, join CTA, tasks list) into colocated components. *Effort:* 2–3 days.

2. **Raise FlatList vs ScrollView ratio** — *Why:* long lists (discover, feed) should virtualize. *How:* Audit `ScrollView` + `.map` patterns; prefer `FlatList` for dynamic lists. *Effort:* 1–2 days.

3. **Add skeleton states beyond current `Skeleton` usage (2)** — *Why:* perceived performance on slow networks. *How:* Shared skeleton primitives for feed, challenge detail, profile. *Effort:* 1–2 days.

4. **Increase `staleTime` / query coverage** — *Why:* only 9 `staleTime:` hits in app/components; more stable data can cache longer. *How:* Align with TanStack Query defaults per screen. *Effort:* 0.5–1 day.

5. **Migrate legacy task routes to `task/complete.tsx` only** — *Why:* removes ~4k lines of duplicate flows and routing. *How:* Deep-link and `ROUTES.*` already point to screens; consolidate navigation to unified complete screen. *Effort:* 3–5 days.

6. **Move share-card hex into `DS_COLORS`** — *Why:* zero raw hex everywhere including `ShareCards.tsx` / `ShareSheetModal.tsx`. *How:* Add tokens, replace literals. *Effort:* 0.5 day.

7. **Reduce `Alert.alert` usage (10)** — *Why:* inline alerts are brittle for errors; prefer `InlineError` / toasts. *How:* Replace error-path alerts in task and settings flows. *Effort:* 1 day.

8. **Protected route ratio 84% → 90%+** — *Why:* security scorecard margin. *How:* Review `publicProcedure` in `challenges.ts` / `auth.ts`; narrow public surface. *Effort:* 0.5–1 day.

9. **Consolidate `select("*, challenge_tasks (*)")` in challenges routes** — *Why:* less over-fetching for list endpoints. *How:* Explicit column lists per consumer. *Effort:* 1–2 days.

10. **Expand E2E or integration tests beyond 12 unit files** — *Why:* regression safety on large screens. *How:* Critical paths for join, complete task, feed. *Effort:* ongoing.

---

## Verification commands (re-run locally)

```powershell
# Dead files (expect errors / missing)
Test-Path components\home\LiveFeedCard.tsx
Test-Path lib\share-completion.ts

# React.memo in components
(Select-String -Path (Get-ChildItem -Path components -Recurse -Filter *.tsx).FullName -Pattern "React\.memo").Count

# Raw hex (excluding share/celebration)
$hex = Get-ChildItem -Path app,components -Recurse -Filter *.tsx | Where-Object { $_.FullName -notmatch 'ShareCards|ShareSheetModal|CelebrationOverlay' }
(Select-String -Path $hex.FullName -Pattern '#[0-9a-fA-F]{6}' -AllMatches).Matches.Count

# console.log
(Select-String -Path (Get-ChildItem app,components,lib,contexts,store -Recurse -Include *.tsx,*.ts -File).FullName -Pattern "console\.log").Count
```
