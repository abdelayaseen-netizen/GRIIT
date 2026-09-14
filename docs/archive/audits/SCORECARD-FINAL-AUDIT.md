# GRIIT — Final Full-Stack Audit

## Date: April 9, 2026

## Commit: `00bfcbf2f3973789a61d48dddef41619ee80e509`

---

### Evidence (raw command output)

Commands were run from the repository root on Windows PowerShell 5.x (use `;` instead of `&&` where needed).

#### A. TypeScript health

```
npx tsc --noEmit 2>&1 | Select-String "error" | Measure-Object


Count    : 0
Average  :
Sum      :
Maximum  :
Minimum  :
Property :
```

Full `npx tsc --noEmit` produced no stdout (exit code 0).

#### B. Test suite

```
 RUN  v2.1.9 C:/Users/.../GRIT-1

 ✓ backend/trpc/routes/last-stand.test.ts (10 tests)
 ✓ lib/trpc-errors.test.ts (3 tests)
 ✓ backend/lib/streak.test.ts (5 tests)
 ✓ backend/lib/progression.test.ts (9 tests)
 ✓ lib/api.test.ts (8 tests)
 ✓ lib/time-enforcement.test.ts (8 tests)
 ✓ lib/formatTimeAgo.test.ts (5 tests)
 ✓ backend/trpc/routes/challenges-create.test.ts (7 tests)
 ... (structured logs from tRPC tests)
 ✓ backend/trpc/routes/nudges.test.ts (5 tests)
 ✓ backend/trpc/routes/accountability.test.ts (5 tests)
 ✓ tests/flows/edge-cases.test.ts (4 tests)
 ✓ tests/flows/critical-paths.test.ts (6 tests)

 Test Files  12 passed (12)
      Tests  75 passed (75)
   Duration  ~1.7s
```

#### C. Lint (`expo lint` as specified)

```
npx expo lint 2>&1 | Select-String "warning|error" | Measure-Object


Count    : 0
```

Raw `npx expo lint` only printed env loading (exit 0), with no lines containing `warning` or `error`.

**Supplemental (not in original script; run for real signal):** `npx eslint app components lib contexts hooks store` reported:

```
hooks/useAppChallengeMutations.ts — react-hooks/exhaustive-deps (missing setTodayCheckins)
hooks/useTaskCompleteScreen.tsx:541 — error react-hooks/rules-of-hooks (useCallback called conditionally)
hooks/useTaskCompleteScreen.tsx — 2 warnings (exhaustive-deps)
lib/api.test.ts — import/first
lib/review-prompt.ts — no-unused-vars 'error'
lib/subscription.ts — no-require-imports, unused err
lib/task-helpers.ts — no-unused-expressions

✖ 10 problems (1 error, 9 warnings)
```

#### D. Files over 500 lines (frontend + backend), excluding `node_modules`

PowerShell `Get-ChildItem -Recurse` on `backend` initially traversed `backend/node_modules` when using `-Include` on the parent path; the following list was produced by scanning **app source paths only** (same intent as the audit: oversized first-party files).

**`app`, `components`, `lib`, `contexts`, `store`, `hooks` (lines > 500):**

```
939    app\(tabs)\profile.tsx
881    app\(tabs)\index.tsx
881    app\(tabs)\discover.tsx
880    app\profile\[username].tsx
859    lib\design-system.ts
851    app\task\run.tsx
769    components\share\ShareCards.tsx
722    components\activity\LeaderboardTab.tsx
678    hooks\useTaskCompleteScreen.tsx
667    components\task\TaskCompleteForm.tsx
663    components\LiveFeedSection.tsx
661    lib\notifications.ts
641    app\challenge\active\[activeChallengeId].tsx
625    app\paywall.tsx
568    app\task\checkin.tsx
544    app\task\run-styles.ts
544    app\post\[id].tsx
527    app\auth\signup.tsx
509    components\share\ShareSheetModal.tsx
1586   components\TaskEditorModal.tsx
1481   components\create\NewTaskModal.tsx
1458   app\challenge\[id].tsx
1152   components\challenge\challengeDetailScreenStyles.ts
```

**`backend/trpc/routes` only (lines > 500):**

```
796    backend\trpc\routes\feed.ts
503    backend\trpc\routes\checkins.ts
```

*Note:* Some paths with `[` `]` failed `Get-Content` in the first automated pass; line counts above use successful reads.

#### E. Files over 300 lines (spot check — `app`, `components`, `lib`, `contexts`, `store`, `hooks`)

Same folders as D (frontend slice); includes all files from D plus mid-size modules, e.g. `CreateChallengeWizard.tsx` (455 lines), `contexts/AppContext.tsx` (435 lines), `app/accountability.tsx` (431 lines), `app/_layout.tsx` (426 lines), `components/feed/FeedPostCard.tsx` (398 lines), through `components/onboarding/screens/AutoSuggestChallengeScreen.tsx` (313 lines), etc. (full shell listed 40+ paths).

#### F. Raw hex colors in component files (script as written)

```
Get-ChildItem ... | Select-String "'#[0-9a-fA-F]{3,8}'" | Where-Object { $_.Line -notmatch "DS_COLORS|GRIIT_COLORS|design-system|theme" } | Measure-Object


Count    : 0
```

**Follow-up:** A separate grep for `#` hex in `*.tsx` found at least one literal outside tokens: `components/shared/ImageViewerModal.tsx` line 137 — `backgroundColor: "#000"` (double-quoted hex; the scripted single-quote pattern did not match).

#### G. Raw route strings (`router.push|replace|navigate` without `ROUTES` on line)

```
Measure-Object Count: 0
```

#### H. Accessibility coverage

```
Touchable opens: 341, Labels: 441, Coverage: 129.3%
```

*Interpretation:* `accessibilityLabel` count exceeds Touchable/Pressable open tags (nested labels, duplicated patterns, or labels on non-counted elements). Use as a rough signal, not strict coverage.

#### I. Console statements in production code (excluding `__DEV__` on line)

```
Measure-Object Count: 4
```

Observed matches include `lib/analytics.ts` (trackEvent), `lib/posthog.ts` (init), `lib/sentry.ts` (console.error wrapper), `lib/logger.ts` (intentional console delegation).

#### J. ErrorBoundary coverage on screen files

```
Screen files: 30, With ErrorBoundary: 18
```

(`Screen files` = `app/**/*.tsx` excluding `_layout.tsx` and `+not-found.tsx`; `With ErrorBoundary` = unique filenames under `app` containing the string `ErrorBoundary`.)

#### K. FlatList `renderItem={(` check

Original pattern `renderItem=\{\\(` caused a PowerShell regex error. With `-Pattern 'renderItem=\{\('`:

```
Measure-Object Count: 0
```

#### L. `useQuery` vs `staleTime`

```
30   (lines matching useQuery\(\{ )
34   (lines matching staleTime)
```

Global defaults in `lib/query-client.ts` lines 18–26 set `staleTime`/`gcTime` for queries without explicit options.

#### M. Backend `.select(`

```
Count: 245   (backend/trpc/routes/**/*.ts)
```

#### N. Test file count and coverage (project tests only, excluding `node_modules`)

```
critical-paths.test.ts     128 lines   tests/flows/critical-paths.test.ts
edge-cases.test.ts          98 lines   tests/flows/edge-cases.test.ts
api.test.ts                 42 lines   lib/api.test.ts
formatTimeAgo.test.ts       44 lines   lib/formatTimeAgo.test.ts
time-enforcement.test.ts    65 lines   lib/time-enforcement.test.ts
trpc-errors.test.ts         31 lines   lib/trpc-errors.test.ts
progression.test.ts         69 lines   backend/lib/progression.test.ts
streak.test.ts              45 lines   backend/lib/streak.test.ts
accountability.test.ts     179 lines   backend/trpc/routes/accountability.test.ts
challenges-create.test.ts   42 lines   backend/trpc/routes/challenges-create.test.ts
last-stand.test.ts          48 lines   backend/trpc/routes/last-stand.test.ts
nudges.test.ts              95 lines   backend/trpc/routes/nudges.test.ts
```

**12 files**, **886 lines** total in listed test files. No coverage % was produced by a dedicated `vitest --coverage` run in this step.

#### O. TODO / FIXME / HACK / XXX

```
Measure-Object Count: 190
```

(Excluding lines matching `TEMPLATE`.)

#### P. Unused exports (spot check — `lib/*.ts`)

```
Exports: 2, Imported by: 0 files — config.ts
Exports: 4, Imported by: 0 files — date-utils.ts   (script is heuristic; verify before deleting)
Exports: 4, Imported by: 0 files — deep-links.ts
Exports: 2, Imported by: 0 files — formatTimeAgo.ts
Exports: 8, Imported by: 0 files — notification-copy.ts
Exports: 3, Imported by: 0 files — posthog.ts
Exports: 8, Imported by: 0 files — sanitize.ts
Exports: 4, Imported by: 0 files — trpc-errors.ts
... (remaining lines from script output in full console run)
```

#### Q. Analytics events defined vs called

```
Events defined: 73, Call sites: 63
```

(`name: "` count in `lib/analytics.ts` vs `track({` / `trackEvent(` in app/components/contexts/hooks/store, excluding import/type lines.)

#### R. Git status

```
git status --short

(empty — clean working tree at time of audit)
```

#### S. Total codebase size (first-party TS/TSX, excluding `node_modules`)

```
Files: 350
Total lines: 57128
```

---

### Scorecard

Scores use **7 = good**, **8 = excellent**, **9 = near-perfect**, **10 = no meaningful improvement**.

| # | Category | Score | Evidence | What would make it a 10 | Priority |
|---|----------|-------|----------|-------------------------|----------|
| 1 | TypeScript strictness | 8 | `tsc --noEmit` clean (Evidence A); `tsconfig` strictness in use across app | Eliminate remaining unsafe casts in hot paths; generated DB types everywhere | Medium |
| 2 | Component architecture | 5 | Very large UI modules: e.g. `components/TaskEditorModal.tsx` ~1586 lines, `components/create/NewTaskModal.tsx` ~1481 lines, tab screens ~880–940 lines (Evidence D) | Extract step/modal subcomponents; cap file size with consistent feature folders | High |
| 3 | Design system compliance | 7 | `lib/design-system.ts` ~859 lines; scripted raw single-quote hex count 0 (F); at least one literal `#000` in `components/shared/ImageViewerModal.tsx`:137 | Tokenize remaining literals; optional DS cleanup pass | Medium |
| 4 | Navigation safety | 8 | `ROUTES` used widely; script G count 0 for raw `router.*` lines without `ROUTES` | Narrow remaining dynamic URL builders (e.g. long query strings in `app/(tabs)/index.tsx`) into typed helpers | Low |
| 5 | State management | 6 | `contexts/AppContext.tsx` ~435 lines; multiple concerns in one provider | Split domains (profile vs challenge vs notifications) or more local state | Medium |
| 6 | Data fetching | 7 | `lib/query-client.ts` defaults `staleTime` 5m / `gcTime` 10m (lines 18–26); Evidence L shows explicit `staleTime` lines slightly above `useQuery({` count due to defaults + spread usage | Per-query tuning for hot screens; optimistic paths for check-in/complete | Medium |
| 7 | Accessibility | 7 | Evidence H: 341 touch opens vs 441 labels — labels exist but heuristic is noisy | Audit every interactive control for role/label/hint; fix any missing | Medium |
| 8 | Error handling | 6 | ESLint **error** `react-hooks/rules-of-hooks` in `hooks/useTaskCompleteScreen.tsx`:541 (Evidence C supplemental); 30 screens vs 18 files mentioning `ErrorBoundary` (J) | Fix conditional hook; wrap remaining screens (auth, onboarding, post detail, etc.) | **Critical** (hooks) / High (boundaries) |
| 9 | Performance | 6 | Large components (D); Evidence K: 0 inline `renderItem={` patterns; still risk from huge rerenders in big files | Memoized list rows; profile `FlashList`/image policy where needed | Medium |
| 10 | Offline support | 6 | `hooks/useNetworkStatus.ts` + `components/OfflineBanner.tsx` | Mutation queue + queued reads for core flows | Medium |
| 11 | Analytics coverage | 7 | 73 typed `name` variants in `lib/analytics.ts`; 63 call sites (Q) — gap | Wire missing funnel events; validate PostHog in staging | Medium |
| 12 | Premium / paywall | 7 | `app/paywall.tsx` large but structured; RevenueCat env keys in `package.json` scripts scope | End-to-end purchase/restore QA on device | Medium |
| 13 | Push notifications | 7 | `lib/notifications.ts` ~661 lines; Expo stack | Delivery metrics + failure retries | Medium |
| 14 | Onboarding flow | 7 | Onboarding routes under `app/onboarding/`; events in `analytics.ts` | Edge-case QA (resume, deep link) | Low |
| 15 | Code hygiene | 5 | 190 TODO/FIXME markers (O); 4 console lines (I); ESLint 1 error + 9 warnings (C) | Fix hooks error; drive warnings to 0; TODO triage | High |

| # | Category | Score | Evidence | What would make it a 10 | Priority |
|---|----------|-------|----------|-------------------------|----------|
| 16 | API design | 7 | `backend/trpc/routes/feed.ts` ~796 lines; Zod + tRPC patterns elsewhere | Split `feed` router; consistent pagination contracts | Medium |
| 17 | Auth & authorization | 8 | `protectedProcedure` / context in `backend/trpc`; tests exercise unauthorized paths (`tests/flows/edge-cases.test.ts` logs) | Session rotation + periodic pen test | Low |
| 18 | Database schema | 8 | Migrations under `supabase/migrations`; prior duplicate SQL cleanup noted in older scorecard | Index review for feed/join queries | Medium |
| 19 | Rate limiting | 8 | `backend/lib/rate-limit.ts` + `routeLimitMiddleware` in `backend/trpc/create-context.ts` (lines 69–83) | Alerting when Redis limiters unavailable | Low |
| 20 | Cron / background tasks | 6 | `backend/hono.ts` `/internal/daily-reset` and cron-style routes with `CRON_SECRET` | Full idempotent job graph + monitoring | Medium |
| 21 | Push delivery | 7 | Server helpers + client registration | Retry queue + provider metrics | Medium |
| 22 | Content moderation | 7 | `backend` content moderation utilities (existing) | Expand to media if user-generated images scale | Low |
| 23 | Logging & monitoring | 8 | Pino structured logs in tests; `logStructured` / `reportError` in tRPC middleware (`create-context.ts` lines 85–108) | Dashboards for error rate and latency | Medium |
| 24 | Security | 8 | Env-based secrets; cron routes gated; RLS assumed on Supabase | Periodic dependency audit; SAST in CI | Medium |
| 25 | Test coverage | 6 | 75 tests, 12 files (B, N); no coverage report in this audit | Add integration tests for payments/feed; `vitest --coverage` gate | High |

### Summary

- **Frontend average (1–15):** **6.5 / 10**
- **Backend average (16–25):** **7.3 / 10**
- **Overall weighted (60% / 40%):** **6.8 / 10**

---

### Prioritized action list

| Priority | File | Line | Issue | Fix |
|----------|------|------|-------|-----|
| Critical | `hooks/useTaskCompleteScreen.tsx` | 541 | `useCallback` for `renderTaskCompleteFormItem` is declared **after** an early `if (submitted) return (...)` — violates Rules of Hooks (ESLint error). | Move the `useCallback` (and any hooks that must run each render) **above** the `submitted` early return, or split into a child component so hooks are unconditional. |
| High | `lib/analytics.ts` | 144 | `console.log` in `trackEvent` runs when PostHog is enabled (not gated by `__DEV__`). | Remove or wrap with `if (__DEV__)`. |
| High | `lib/posthog.ts` | 19 | Logs partial API key and host on client init. | Log only in `__DEV__` or remove. |
| High | `hooks/useTaskCompleteScreen.tsx` | 255, 356, 541 | `react-hooks/exhaustive-deps` warnings plus hooks error. | Fix dependency arrays; follow fix for conditional hook. |
| High | Multiple | — | Only **18** of **30** screen files reference `ErrorBoundary` (Evidence J). | Add `ErrorBoundary` to auth (`app/auth/*`), onboarding (`app/onboarding/*`), `app/post/[id].tsx`, `app/profile/[username].tsx`, `app/invite/[code].tsx`, `app/create-challenge.tsx`, `app/accountability/add.tsx`, `app/legal/*`, etc., or rely on documented root boundary if intentional (then align count methodology). |
| Medium | `components/TaskEditorModal.tsx` | — | ~1586 lines — maintenance and test burden. | Extract steps, hooks, and styles into focused modules. |
| Medium | `components/create/NewTaskModal.tsx` | — | ~1481 lines. | Same as above. |
| Medium | `backend/trpc/routes/feed.ts` | — | ~796 lines — harder to review and test. | Split into query vs mutation modules or domain slices. |
| Medium | `lib/task-helpers.ts` | 94 | ESLint `no-unused-expressions`. | Replace stray expression with explicit call or remove. |
| Medium | Spot check P | — | Heuristic suggests low import usage for some `lib/*` exports (`deep-links.ts`, `sanitize.ts`, etc.). | Confirm with `ts-prune` or IDE; delete or wire up. |
| Medium | `lib/analytics.ts` / call sites | — | 73 event `name` types vs 63 tracking call sites (Q). | Implement or remove unused event names. |
| Low | `components/shared/ImageViewerModal.tsx` | 137 | Raw `#000` background. | Use `DS_COLORS` / theme token. |
| Low | `hooks/useAppChallengeMutations.ts` | 175 | `exhaustive-deps` for `setTodayCheckins`. | Add dependency or stabilize callback in parent. |
| Low | `lib/subscription.ts` | 40, 96, 118 | `no-require-imports` and unused `err`. | Dynamic import with ESLint allowlist or refactor; use or remove catch variables. |
| Low | `lib/api.test.ts` | 8 | `import/first` warning. | Move imports to top. |

---

### What changed since last scorecard

Compared to `docs/SCORECARD-POST-OPTIMIZATION.md` (April 8, 2026):

- **Task completion refactor:** `app/task/complete.tsx` is now a thin shell (**14 lines**) delegating to `TaskCompleteScreenInner` in `hooks/useTaskCompleteScreen.tsx` (**678 lines**) — the previous ~2000+ line monolith is no longer in `complete.tsx`.
- **Activity tab:** `app/(tabs)/activity.tsx` is now **65 lines** (previously cited ~1509 lines), indicating the UI was split into separate components/tabs.
- **Create challenge wizard:** `components/create/CreateChallengeWizard.tsx` is **455 lines** (previously ~1695), a major reduction.
- **Remaining “god files”:** Large surfaces moved to **`TaskEditorModal`**, **`NewTaskModal`**, tab roots (`profile`/`index`/`discover` ~880–939 lines), and **`app/challenge/[id].tsx`** (~1458 lines) — still architectural debt, but different shape than the April 8 list.
- **Quality regression:** Direct **ESLint error** (conditional hook) in `useTaskCompleteScreen.tsx` was not called out in the prior scorecard; it should be treated as release-blocking for any build that enforces ESLint on CI.
- **Tests:** Still **75 tests / 12 files** — same order of magnitude as the prior report.
- **`npx tsc`:** Still **0** error lines matched.

---

### Recommendation

Ship **no production build** that gates on ESLint until **`hooks/useTaskCompleteScreen.tsx`** is fixed: conditional hooks can cause runtime crashes and inconsistent state, not just lint noise. Immediately after, strip **client-side logging of analytics and PostHog keys** (`lib/analytics.ts`, `lib/posthog.ts`) or gate it behind **`__DEV__`**. In parallel, continue the **component splitting** work now focused on **`TaskEditorModal`** and **`NewTaskModal`**, and thin **`backend/trpc/routes/feed.ts`** for maintainability. **Error boundaries** should cover auth and content-heavy screens that still lack them, or the team should document that **`app/_layout.tsx`** provides a single root boundary and adjust the metric. Finally, add **`vitest --coverage`** with a modest threshold on critical `lib/` and `backend/trpc` modules so test quantity (75) is backed by breadth.

---

*Audit generated from automated commands plus targeted file reads; scores are qualitative judgments from that evidence.*
