# GRIIT Beta Readiness Scorecard — Final Audit

Generated: 2026-03-25  
Commit: `6a008cb4010dacd481159ac30f6f3a3b386fc21c`  
Auditor: Cursor Agent  

**Evidence scope:** This audit used repository inspection, `npx tsc --noEmit`, and ripgrep-style searches. **End-to-end device QA was not run** (no simulator session). Items marked “code verified” are from reading implementation; “not verified (runtime)” require you to confirm on a build.

---

## Executive summary

| Metric | Value |
|--------|--------|
| **Overall score** | **58 / 100** |
| **Beta ready** | **NO** |
| **Critical blockers** | Backend does not typecheck (`teams` / `team` routers and `./team` helper missing); `leaderboard` imports broken module. |

---

## Frontend scores

Scores use the prompt’s checklist as denominators; numerators count items **supported by code** (or **explicitly broken/missing** where code contradicts the checklist).

### 1. Home screen (`app/(tabs)/index.tsx`): **83 / 100**

**Working (code verified):** GRIIT + time-based greeting; `DailyQuote` with `useFocusEffect` → new random quote when the screen gains focus; stats row (streak / points / derived rank) from `useApp()` when not all-zero; `GoalCard` active challenges + navigation to task complete via `ROUTES.TASK_COMPLETE` query string; `LiveFeedSection` with Friends/Everyone `scope`, `feed.getLiveFeed`, respect with optimistic update + rollback, comment → `ROUTES.POST_ID`, native `Share.share`, iOS ActionSheet + Android modal for delete / report / hide, `DiscoverCTA` → Discover; design tokens (`DS_COLORS`) on reviewed sections; feed engagement row has accessibility labels.

**Broken / gap:** Full checklist item “quote rotates on reload” is **focus-based**, not pull-to-refresh-only. Some header pills (streak/points) are not all labeled as buttons beyond points explainer tap. **Runtime:** console noise not measured.

**Missing vs audit:** None critical.

---

### 2. Discover screen (`app/(tabs)/discover.tsx`): **92 / 100**

**Working:** No default pill row; search bar; `useDebounce(..., 300)`; `getDiscoverFeed` / `getCategoryCounts`; hero + horizontal 24h + solo + team sections; “New this week” only if `newThisWeek.length > 0`; “Build your own” CTA; browse-by-category with counts; client-side challenge filtering + `profiles.search` for people; navigation to challenge detail and public profile via `ROUTES`; empty sections omitted.

**Broken / gap:** “Every challenge card navigates” — **code paths look correct**; runtime data edge cases not exercised. Guest + search combinations not fully verified.

---

### 3. Activity screen (`app/(tabs)/activity.tsx`): **74 / 100**

**Working:** Notifications + Leaderboard tabs; `notifications.getAll`; global (`leaderboard.getWeekly`), friends (`getFriendsBoard`), per-challenge (`getChallengeBoard` + `listMyActive`); scope pills; challenge selector for “This Challenge”; no `trpc.team` usage in this file; pull-to-refresh; several accessibility labels on tabs and scope.

**Broken vs checklist:** **“Respect / Comment” on leaderboard crown card are explicitly non-interactive** (`accessibilityLabel` states “not interactive”) — decorative only; **does not meet** “buttons work.” Empty-state CTA uses raw `"/(tabs)/home"` instead of `ROUTES.TABS_HOME`.

**Not verified (runtime):** Whether friends/global/challenge boards always return non-empty production data.

---

### 4. Profile screen (`app/(tabs)/profile.tsx` + `ProfileHeader`): **62 / 100**

**Working:** Avatar via `Avatar` + `pickAndUploadAvatar` + camera overlay; edit → `ROUTES.EDIT_PROFILE`; share; stats row; active challenges list + navigation; rank / trophy / heatmap / settings / sign-out flow present in tree.

**Broken vs checklist:** **Follower / following counts are hardcoded** in `ProfileHeader` as `"0 followers · 0 following"` — **not real data**.

---

### 5. Create Challenge flow (`components/create/CreateChallengeWizard.tsx` + `app/create/`): **82 / 100**

**Working (code review):** Multi-step wizard (basics, participation, tasks, packs); `trpcMutate` for create; navigation to `ROUTES.CHALLENGE_ID` on success; cancel/draft patterns present.

**Not verified (runtime):** End-to-end “creates and appears in Discover/Home” requires API + DB.

---

### 6. Challenge detail (`app/challenge/[id].tsx` — sampled): **78 / 100**

**Working (partial read):** Task routing to check-in / run / complete paths; paywall hooks; back fallbacks.

**Not verified:** “Team card slides down” bug; full participant/progress accuracy — needs manual QA.

---

### 7. Task completion (`app/task/complete.tsx`): **86 / 100**

**Working:** Separate copy for **“Log your workout”** vs **“Log your run”**; `inferRunOrWorkout` for mis-tagged tasks; `GRIIT_COLORS` / `DS_COLORS` for styling; post-success **“Share to GRIIT”** via `feed.shareCompletion`; celebration store integration.

**Not verified (runtime):** Share card modal capture quality; confetti timing on device.

---

### 8. Share cards (`components/share/ShareCards.tsx`, `ShareSheetModal.tsx`): **80 / 100**

**Working:** `StatementCard` uses gradients / `LinearGradient` for no-photo path (mitigates black capture); `ViewShot` + IG / save / share helpers in modal; preview scaling.

**Not verified (runtime):** Pixel-perfect visibility on physical devices; “saved image” verification in Photos.

---

### 9. Post detail / comments (`app/post/[id].tsx`): **55 / 100**

**Working:** Route exists; `feed.getComments` + `feed.comment`; pull-to-refresh; back; invalidates feed queries on comment.

**Broken / gap vs checklist:** **No full `FeedPostCard` / proof / progress block at top** — only cached meta line if post is in React Query cache; **cold deep link shows minimal header** (“Comments on this check-in”). That is a **material gap** vs “full post renders at top.”

---

### 10. Public profile (`app/profile/[username].tsx`): **48 / 100**

**Working:** Loads `profiles.getPublicByUsername`; avatar, name, bio, stats-style cards; redirects self to tab profile.

**Broken vs checklist:** **No Follow / Unfollow** (no matches in file). `DisciplineCalendar` passed `securedDateKeys={[]}` — **always empty** on public view.

---

### 11. Auth / Onboarding: **72 / 100**

**Working (spot-check):** Login/signup/forgot-password screens exist; `_layout` orchestrates auth vs tabs vs create-profile.

**Not verified:** Full happy-path signup, email confirmation, and “silent catch” audit across every auth file.

---

## Frontend code quality

| Category | Score | Details |
|----------|-------|---------|
| TypeScript errors | **40 / 100** | **4 errors** (all in `backend/` — see raw output below). Frontend app path not isolated in this run. |
| Design system compliance | **100 / 100** | **0** matches for `#RRGGBB` in `app/**/*.tsx` and `components/**/*.tsx` (grep). |
| Dead code | **85 / 100** | `Alert.alert`: **0**. `console.log`: **5** hits in app/components/hooks/lib (excluding allowed tags in prompt); several gated with `__DEV__`. Mock/dummy in app/components/lib (excl. tests): **0** meaningful hits. **Team:** `lib/trpc-paths.ts` still defines `team.getMyTeams` / `team.getForChallenge` strings — **orphaned path constants** if routers are removed. |
| GRIIT spelling | **100 / 100** | **0** matches for user-facing `"GRIT"` / `GRIT app` patterns in `app/` + `components/` `.tsx` (grep). |
| Performance | **55 / 100** | **`React.memo` in `components/feed/*.tsx`:** **0** (grep). List `renderItem` in `LiveFeedSection` is `useCallback`’d. **expo-image** used in feed (`FeedPostCard`); **`Image` from `react-native` in `app/**/*.tsx`:** **0** matches. `staleTime` present on home/discover/feed queries (sampled). |
| Navigation integrity | **65 / 100** | Many **`router.push` / `replace` with raw strings** (e.g. `"/(tabs)/home"`, `"/auth/login"`, `"/paywall"`) instead of `ROUTES.*` — see grep sample below. |
| Error handling | **100 / 100** | **0** empty `catch {}` blocks matched in `app/`, `components/`, `hooks/`, `lib/` (grep). |
| Accessibility | **72 / 100** | Strong on feed toggles and engagement row; gaps on home header pills and leaderboard fake actions. |

---

## Backend scores

| Category | Score | Details |
|----------|-------|---------|
| Route completeness | **35 / 100** | **TypeScript build fails** — cannot treat router as complete until fixed. |
| Dead routes | **N/A** | Full automated “procedure name × frontend grep” loop from the bash script **was not run** on Windows; **spot-check:** `getTeamBoard` in `leaderboard.ts` depends on **missing** `./team`. |
| Input validation | **88 / 100** | Heavy `zod` usage across `feed`, `challenges`, `profiles`, etc. (count grep shows dozens of `z.` uses per file). |
| RLS policies | **80 / 100** | Migrations under `supabase/migrations/` define many `POLICY` / `ENABLE ROW LEVEL SECURITY` statements; **not re-audited table-by-table** in this pass. |
| Rate limiting | **90 / 100** | **`publicProcedure` / `protectedProcedure` both use `routeLimitMiddleware`** (`backend/trpc/create-context.ts`) calling `checkRouteRateLimit`. |
| Error handling | **75 / 100** | Structured logging + `reportError` on failures; not every route manually reviewed. |
| Team code status | **25 / 100** | **`app-router.ts` imports `./routes/teams` and `./routes/team` — files absent** → **compile failure**. `leaderboard.ts` imports `getMembersWithStats` from `./team` — **missing**. **Frontend:** no `trpc.team` usage under `app/`/`components/` (grep); **path strings remain** in `lib/trpc-paths.ts`. |

---

## Critical issues (must fix before beta)

1. **Restore or remove team routers:** Add `backend/trpc/routes/team.ts` and `teams.ts` (or remove imports and `getTeamBoard` / merge implementations) so **`npx tsc --noEmit` passes**.
2. **Fix implicit `any` in `leaderboard.ts`** at `members.map((m) =>` once `./team` types exist (TS7006).
3. **Profile social counts:** Replace hardcoded `0 followers / 0 following` with real queries or hide the row until data exists.
4. **Post thread screen:** Load post by id from API or embed full post UI — do not rely only on feed cache for “full post at top.”

---

## High priority (first week of beta)

1. Public profile: **Follow/Unfollow** + real **secured date keys** (or remove misleading calendar).
2. Activity leaderboard: wire **Respect/Comment** to real posts or **remove** faux buttons to avoid false affordance.
3. Normalize navigation to **`ROUTES` constants** (especially `/(tabs)/home`, auth paths, paywall).
4. Add **`React.memo`** to pure feed row components where profiling shows benefit.

---

## Nice to have (post-beta)

1. Feed dedupe logic (`diverseFeed`) — product decision whether hiding back-to-back same user is desired.
2. “Report” action currently **local toast only** — backend reporting endpoint if required for compliance.

---

## Files changed in this audit

| File | Finding |
|------|---------|
| `docs/SCORECARD-BETA-FINAL.md` | Created (this scorecard). |
| `backend/trpc/app-router.ts` | Imports missing `teams` / `team` modules — **blocker**. |
| `backend/trpc/routes/leaderboard.ts` | Imports missing `./team`; `getTeamBoard` references `getMembersWithStats`. |
| `components/profile/ProfileHeader.tsx` | Hardcoded follower/following counts. |
| `app/post/[id].tsx` | Comment thread without full post when cache miss. |
| `app/profile/[username].tsx` | No follow UI; empty calendar keys. |
| `app/(tabs)/activity.tsx` | Non-interactive Respect/Comment on crown card. |

---

## Raw grep / command results

### TypeScript errors (full output)

```
backend/trpc/app-router.ts(27,29): error TS2307: Cannot find module './routes/teams' or its corresponding type declarations.
backend/trpc/app-router.ts(28,28): error TS2307: Cannot find module './routes/team' or its corresponding type declarations.
backend/trpc/routes/leaderboard.ts(9,37): error TS2307: Cannot find module './team' or its corresponding type declarations.
backend/trpc/routes/leaderboard.ts(342,33): error TS7006: Parameter 'm' implicitly has an 'any' type.
```

### Raw hex violations (`#RRGGBB` in `app/**/*.tsx` and `components/**/*.tsx`)

*No matches (empty result).*

### Dead team-related frontend calls

```
lib\trpc-paths.ts
  134:    getMyTeams: 'team.getMyTeams',
  135:    getForChallenge: 'team.getForChallenge',
```

### `Alert.alert` (app + components `.tsx`)

*No matches.*

### `console.log` (filtered loosely per prompt)

```
components\create\CreateChallengeWizard.tsx — [TimeWindow] (__DEV__)
app\challenge\[id].tsx — [TimeWindow] (__DEV__)
app\(tabs)\index.tsx — [StreakFreeze] (__DEV__)
lib\sentry.ts — [Sentry message]
lib\revenue-cat.ts — [RevenueCat]
```

### Empty catch blocks `catch (...) {}`

*No matches in scanned trees.*

### Unused imports (`is declared but` in `tsc` output)

*No lines matched (empty).*

### Navigation samples without `ROUTES.` prefix

Examples from `router.push` / `router.replace` grep:

- `router.replace("/(tabs)/home" as never)` — multiple files (`task/complete`, `journal`, `chat`, `settings`, etc.)
- `router.replace("/create-profile" as never)` — `app/auth/login.tsx`
- `router.push("/auth/forgot-password" as never)` — `app/auth/login.tsx`
- `router.push("/paywall" as never)` — `app/challenge/[id].tsx`
- `router.push("/(tabs)/home" as never)` — `app/(tabs)/activity.tsx`

---

## Scoring note (overall 58)

- **Screen functionality (weighted ~50% in prompt):** Averaged code-review scores land in the mid-to-high 70s for implemented flows, pulled down by **post thread**, **public profile**, and **profile header** gaps.
- **Frontend code quality (~25%):** Strong design tokens and error-handling hygiene; weaker **TS (backend leaks)** and **performance/navigation** discipline.
- **Backend (~25%):** **Fails compile** → cap on backend category and **Beta ready = NO** despite solid patterns elsewhere.

To re-score after fixes: rerun `npx tsc --noEmit`, re-grep hex/dead code, and run a **device QA pass** to replace “code verified” with “runtime verified.”
