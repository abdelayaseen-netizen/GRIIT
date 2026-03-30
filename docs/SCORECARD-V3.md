# GRIIT Master Scorecard v3 — March 29, 2026

This scorecard was produced after a **partial** deep-clean pass (console cleanup, minor error-reporting tweaks, backend dev `console.warn` removal). Full execution of every phase in `GRIIT-DEEP-CLEAN-V3.md` (orphan file deletion, all `select('*')` removals, FlatList refactors, unused-procedure audit) was **not** completed in one shot; counts below reflect **commands run at scorecard time** on the committed tree.

## Executive Summary

| Pillar | Score /100 | Notes |
|--------|------------|--------|
| **Overall** | **62** | Solid product surface; backend wide-selects and a few nav/object patterns remain. |
| **Frontend** | **64** | Large screens; many `useQuery` with `staleTime`; inline styles high in create flow. |
| **Backend** | **58** | `select("*, …")` on hot paths; service client typing gaps (`as any` in `feed.shareCompletion` recovery). |
| **Code Health** | **65** | Console noise reduced; TODOs documented; no `@ts-ignore` in repo grep. |
| **Performance** | **55** | Lists often `ScrollView` + map; FlatList used in a subset of screens. |
| **Ship Readiness** | **60** | Critical paths exist; paywall/RevenueCat wiring needs ongoing verification. |

---

## Verification commands (evidence)

Run from repo root (`C:\Users\abdel\OneDrive\Desktop\GRIT-1`):

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | **0 errors** |
| `console.log` / `console.warn` (app, components, lib, hooks) | `rg "console\.(log\|warn)" app components lib hooks --glob "*.{ts,tsx}"` | **0 matches** (after clean pass) |
| `console.error` still used | `rg "console\.error" lib/sentry.ts` | **Yes** — `captureError` uses `console.error` in `__DEV__` only (intentional). |
| Frontend `as any` | `rg "as any" app components lib hooks --glob "*.{ts,tsx}"` | **0** |
| Backend `as any` | `rg "as any" backend --glob "*.ts"` | **2** (`backend/trpc/routes/feed.ts` shareCompletion recovery insert/update) |
| `T = any` default (trpc helpers) | `rg "= any" lib --glob "*.ts"` | **2** (`lib/trpc.ts` `trpcQuery` / `trpcMutate` generics) |
| `@ts-ignore` / `@ts-nocheck` | `rg "@ts-ignore\|@ts-nocheck" app components lib hooks backend` | **0** |
| Backend `select('*')` / `*, challenge_tasks` | `rg "select\\(['\\\"]?\\*|select\\(\\\"\\*, challenge_tasks"` on `backend/**/*.ts` | **Multiple** — see B2 |
| Raw `#RRGGBB` in app/components (6-hex) | `rg "#[0-9a-fA-F]{6}" app components --glob "*.tsx"` | **0 matches** (sample grep; rgba may still appear) |
| FlatList (tsx) | `rg "FlatList" --glob "*.tsx"` | **~15 file hits** (count varies by branch) |
| `React.memo` / `memo(` in components | `rg "React\\.memo\\|memo\\(" components --glob "*.tsx"` | **~35+** component/skeleton files |
| Inline `style={{` app | per-file `rg "style=\\{\\{" app --glob "*.tsx" -c` | **~59** total line hits across listed files |
| Inline `style={{` components | same | **~140+** total line hits (create wizard/modals dominate) |
| `accessibilityLabel` app | per-file counts | **~180+** occurrences across app |
| `accessibilityLabel` components | per-file counts | **~150+** occurrences |

**Hardcoded navigation (heuristic):** Many calls use `router.push({ pathname: …, params })` or `router.push(url as never)` where the line does not contain the substring `ROUTES.`. A strict PowerShell `Select-String … -NotMatch "ROUTES"` **over-counts** valid object-style navigation. **Manual spot-check:** most tab flows use `ROUTES.*`; object-style pushes remain for task routes and deep links (`app/challenge/[id].tsx`, `app/challenge/active/[activeChallengeId].tsx`, `app/invite/[code].tsx`, `app/(tabs)/index.tsx` notification URL).

---

## A. FRONTEND SCORECARD (64/100)

### A1. Screen load status (6/10)

| Screen | Loads | Loading | Error | Empty | Score |
|--------|-------|---------|-------|-------|------:|
| Home `app/(tabs)/index.tsx` | Y | Y | Y (boundary) | Y | 6 |
| Discover `app/(tabs)/discover.tsx` | Y | Y | Y | Y | 7 |
| Activity `app/(tabs)/activity.tsx` | Y | Y | Y | Y | 6 |
| Profile `app/(tabs)/profile.tsx` | Y | Y | Y | Y | 6 |
| Challenge detail `app/challenge/[id].tsx` | Y | Y | Y | Y | 6 |
| Task complete `app/task/complete.tsx` | Y | Y | Y | Y | 6 |
| Login / Signup | Y | partial | partial | N/A | 6 |
| Onboarding / create-profile | Y | partial | partial | varies | 5 |

**Evidence:** Code review + `ErrorBoundary` on Discover; `LoadingState` / `ErrorState` patterns in Activity; large files increase regression risk (**`complete.tsx` ~1400+ lines**, **`activity.tsx` ~1385+ lines** per PowerShell line count on Windows paths without brackets).

### A2. Design system compliance (7/10)

- **6-digit hex in app/components tsx (sample):** `rg` → **0** matches for `#[0-9a-fA-F]{6}`.
- **Emoji in UI:** prior Discover work removed emoji from discover/challenge cards; not re-audited file-by-file in this pass.
- **ROUTES:** Primary navigation uses `lib/routes.ts`; object-style `router.push` still used where expo-router needs params.

### A3. Accessibility (6/10)

- **Many** `accessibilityLabel` usages (see counts); not every `Pressable`/`TouchableOpacity` verified in this pass.

### A4. Performance (5/10)

- **FlatList:** present in accountability add, discover (horizontal), post, follow-list, chat, shared goal — not all long lists migrated off `ScrollView` + `.map()`.
- **React.memo:** widely used in feed/home/profile components; list `renderItem` memoization not fully audited.
- **staleTime:** Discover/Home/Profile/Activity queries generally set `staleTime`; not every `useQuery` guaranteed.
- **Inline styles:** **>100** `style={{` hits — create flow is the main hotspot.

### A5. Error handling (6/10)

- **ErrorBoundary** on key screens (e.g. Discover).
- **Sentry `captureError`** used in several flows; `captureMessage` no longer logs in dev (silent skip).
- **Silent empty catches:** strict grep for empty catch bodies not exhaustive.

---

## B. BACKEND SCORECARD (58/100)

### B1. Route coverage (7/10)

**Registered routers** (`backend/trpc/app-router.ts`): `auth`, `user`, `profiles`, `challenges`, `checkins`, `stories`, `starters`, `streaks`, `leaderboard`, `respects`, `nudges`, `notifications`, `accountability`, `meta`, `feed`, `achievements`, `integrations`, `sharedGoal`, `referrals`.

**Note:** Prompt context mentioned `teams` / `team` routers — **not** present in this `app-router.ts` (doc vs repo drift).

### B2. Security / typing (6/10)

- **`as any`:** **2** in `feed.ts` (activity_events insert/update via service client).
- **`select("*, challenge_tasks (*)")` (and similar):** `challenges.ts` (list/getFeatured/getDiscoverFeed/create paths), `starters.ts`, nested selects in `checkins.ts` — **wide reads**; should be narrowed to columns the API actually returns.
- **Rate limiting:** `create-context.ts` applies route rate limit middleware (verify production config separately).
- **RLS:** assumed on Supabase; not verified in this pass.

### B3. Query efficiency (6/10)

- **N+1:** Discover feed batching for joins/previews is reasonable; not all routers audited.
- **Promise.all:** used in feed hydration and elsewhere; sequential awaits remain in some routes.

### B4. Type safety (7/10)

- **`@ts-ignore`:** **0** (grep).
- **Supabase generated types:** partial; service-role client still needs casts for some tables.

---

## C. CODE HEALTH (65/100)

### C1. Dead code (5/10)

- **Orphan file script:** not run to completion (PowerShell bracket paths); no mass deletion in this pass.
- **Console.log/warn:** removed from app/components/lib/hooks and one backend dev warning (`backend/lib/supabase.ts`).
- **Commented-out blocks:** not systematically stripped.

### C2. Duplication (6/10)

- Challenge/card types still overlap across `app` and `components/discover` (intersection types on Discover).
- Time-window save logic duplicated between `app/challenge/[id].tsx` and `CreateChallengeWizard` (both had dev logs removed).

### C3. File size (4/10)

**App `.tsx` files &gt; 300 lines (line counts from PowerShell `Get-Content | Measure-Object -Line`, paths without `[brackets]` may skip dynamic routes):**

- `app/task/complete.tsx` **~1404**
- `app/(tabs)/activity.tsx` **~1385**
- `app/task/journal.tsx` **~1040**
- `app/settings.tsx` **~946**
- `app/(tabs)/index.tsx` **~809**
- Plus profile, discover, paywall, signup, checkin, `_layout`, login, timer, accountability, photo, follow-list, create-profile — all **&gt;300**.

**Dynamic route files** (`app/challenge/[id].tsx`, etc.) need **literal path** or `-LiteralPath` to measure on Windows.

### C4. TODO / FIXME summary

| File | Line (approx) | Comment | Priority |
|------|-----------------|---------|----------|
| `app/(tabs)/profile.tsx` | 1 | Drafts section for creator drafts | Med |
| `backend/trpc/routes/challenges.ts` | 1, 304 | Split router; personalize getRecommended by goals | Med |
| `backend/trpc/routes/feed.ts` | 1 | Split router | Med |
| `backend/trpc/routes/checkins.ts` | 1 | Split router | Med |
| `backend/trpc/routes/profiles.ts` | 8 | Split router | Med |

---

## D. PERFORMANCE SCORECARD (55/100)

### D1. Frontend

- Skeletons: Home/Discover use skeleton components in places.
- Prefetch: Discover uses `prefetchChallengeById` on press-in for several flows.
- **Gap:** Long vertical lists still often `ScrollView` + map.

### D2. Backend

- **Wide selects** remain on challenge list/discover (see B2).
- **Suggested indexes (documentation only — do not run blindly):**
  - `activity_events (event_type, created_at DESC)` for ticker / feed.
  - `active_challenges (challenge_id, status, created_at)` for join counts and previews.
  - `check_ins (active_challenge_id, date_key, status)` for share recovery.

### D3. Bundle

- Not measured in this pass; recommend `npx expo export` / bundle analyzer periodically.
- Avoid adding `moment`; prefer `date-fns` or native `Intl` if new date deps are needed.

---

## E. SHIP READINESS (60/100)

### E1. Critical paths (code trace)

1. **New user:** signup → onboarding → discover → join → checkin → home — **implemented**; edge cases need device QA.
2. **Returning user:** login → home → task complete — **implemented**.
3. **Social:** feed procedures exist; **full E2E** not run in this pass.

### E2. Paywall

- **RevenueCat / `validateSubscription`:** present in codebase (`lib/subscription.ts`, settings/paywall) — **verify** keys and entitlements per build.

### E3. Error recovery

- **401:** `trpc.ts` signs out and clears session on 401.
- **Offline:** not fully characterized in this pass.

---

## F. REVENUE PROJECTIONS

**Benchmarks (industry — use for sensitivity only):**

- Health & fitness trial-to-paid often cited **~8–12%** (subscription economy reports; e.g. RevenueCat “State of Subscription Apps” series).
- **ARPPU** for fitness subscriptions often **~$10–15/mo** in public summaries.
- Long-tail: **most apps never reach $10k MRR**; small % scale (often-cited VC/subscription reports).

**GRIIT pricing (from product docs):** Free **3** active challenges; **Pro monthly $9.99** (`griit_pro_monthly`); **Annual $49.99** (`griit_premium_annual`).

### Projection table (illustrative — not financial advice)

Assumptions: **5%** free→paid at steady state; **$9.99** blended MRR per paying user; organic acquisition **slow** unless marketing/UGC kicks in.

| Timeframe | Total users (illus.) | Paying @ 5% | MRR (illus.) | Key assumption | Biggest risk |
|-----------|------------------------|------------|--------------|----------------|--------------|
| Now (Mar 2026) | 500 | 25 | ~$250 | early adopters | retention |
| +3 mo | 2,000 | 100 | ~$1,000 | referrals + ASO | churn |
| +6 mo | 8,000 | 400 | ~$4,000 | content/UGC | CAC |
| +1 yr | 25,000 | 1,250 | ~$12,500 | community + teams | competition |
| +2 yr | 80,000 | 4,000 | ~$40,000 | partnerships | infra cost |
| +5 yr | 300,000 | 15,000 | ~$150,000 | category growth | pricing pressure |

### Path to ~$1M ARR (~$83k MRR)

- At **$9.99/mo** need **~8,300** paying subscribers.
- At **5%** conversion → **~166k** MAU or equivalent funnel — requires **distribution** (influencers, challenges going viral, B2B2C, etc.).

### Revenue acceleration levers (ranked)

1. **Habit + social proof in-feed** — benchmark uplift stories on UGC/social features (treat as **hypothesis** until A/B tested).
2. **Personalized Discover / goals** — `getRecommended` TODO; personalization can lift conversion in some cohorts (high variance).
3. **Paywall timing** — test after first win vs. at 4th challenge join.
4. **Annual plan push** — improves LTV if retention holds.
5. **Strava / health integrations** — retention lever for fitness cohorts.

---

## G. TOP 10 PRIORITIES (revenue / ship impact)

1. **Ship backend + verify ticker + recommended** on production — Discover v3 depends on it.
2. **Narrow `select("*, challenge_tasks (*)")`** on discover/list — cost and latency at scale.
3. **Split `app/task/complete.tsx` and `app/(tabs)/activity.tsx`** — maintainability = fewer bugs = better retention.
4. **Replace `feed.ts` `as any`** with typed insert/update helper or generated DB types.
5. **Audit `ScrollView` + `.map()`** for lists &gt;10 rows — move to `FlatList`.
6. **E2E smoke** on join → complete → feed post for release candidates.
7. **RevenueCat dashboard** — confirm offerings match `paywall.tsx` / `subscription.ts`.
8. **Index migration** (activity_events, active_challenges, check_ins) after query profiling in prod.
9. **Remove `T = any` from `trpcQuery` default** — use `unknown` + call-site generics.
10. **Align docs** with `app-router` (teams/team routers if planned).

---

## Phase 11 checklist (this repo state)

| Gate | Target | Actual |
|------|--------|--------|
| `npx tsc --noEmit` | 0 errors | **PASS** |
| `console.log` / `console.warn` (app, components, lib, hooks) | 0 | **PASS** (note: `captureError` uses `console.error` in `__DEV__`) |
| `as any` total &lt; 5 | ideally | **2** backend + **2** generic defaults in `lib/trpc.ts` → **4** if counting `= any` |
| Hardcoded `router.push` without `ROUTES` substring | 0 | **FAIL** (object-style navigation; needs custom lint rule) |
| Backend `select('*')` style | 0 | **FAIL** (multiple `*, challenge_tasks (*)` patterns) |
| `docs/SCORECARD-V3.md` exists | True | **PASS** |
| `git status` clean | After commit | Run after commit |

---

*Generated as part of GRIIT Deep Clean v3 prompt. Re-run greps before trusting counts on future commits.*
