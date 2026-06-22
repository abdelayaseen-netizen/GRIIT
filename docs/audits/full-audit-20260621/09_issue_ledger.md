# 09 — Issue Ledger

> Phase 9 of 10. Consolidation only (no new searching). Branch `feat/onboarding @ 953bccb`.
> Severity: **Critical** (crash / dead core flow / security / App-Store rejection / money) · **Major** (broken non-core feature, dead button on real path, missing error/funnel) · **Minor** (polish, DS drift, dead code).
> Bucket: `fix-now` · `fix-before-TestFlight` · `fix-before-public` · `debt-shelf` · `intentionally-gated` · `UNVERIFIED-LIVE`.

| ID | Dimension | Finding | file:line | Severity | Bucket | Doc |
|---|---|---|---|---|---|---|
| JRN-01 | Journeys | **No block-abusive-user feature** anywhere (only report + hide-post). App Store UGC Guideline 1.2 risk | feed/post — none found | **Critical** | fix-before-TestFlight | 07 |
| AUTH-02 | Auth | **No email-verify / OTP screen**; signup relies on auto-confirm + `signInWithPassword` fallback — dead-ends if Supabase "Confirm email" is ON | `app/auth/signup.tsx:151-166` | **Critical** (conditional) | UNVERIFIED-LIVE | 03 |
| PAY-01 | Paywall | **Fail-open default** `isPro = true` → premium task-lock disabled by default; latent paywall bypass (live path passes real value) | `app/challenge/[id].tsx:344,364` | Major | fix-before-TestFlight | 03 |
| PAY-02 | Paywall | `FREE_LIMITS.MAX_CREATED_CHALLENGES=1` defined but **no enforcement** (client or server); free users may exceed limit | `lib/feature-flags.ts:47` | Major | fix-before-public | 03 |
| NOTIF-01 | Notifications | **Push-token column inconsistency** — writer vs readers disagree (`profiles.push_token` vs `profiles.expo_push_token` vs `push_tokens` table); pushes may silently no-op | `sendPush.ts:37`, `daily-reset.ts:209-213`, `cron-reminders.ts:40` | Major | fix-before-TestFlight | 06 |
| NAV-01 | Navigation | **Universal links `griit.fit` unconfigured** — no `ios.associatedDomains` / Android `intentFilters`; inbound https links (invites) won't open app | `app.json` (no associatedDomains) | Major | fix-before-public | 01 |
| DB-01 | Supabase | **4 core tables have no tracked CREATE TABLE** (`profiles`, `challenges`, `active_challenges`, `challenge_tasks`) — schema not reproducible from migrations | `supabase/migrations/*` | Major | fix-before-public | 05 |
| CFG-01 | Config/Env | `.env.example` documents 4 of ~30 vars; **missing `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`**, Sentry/PostHog keys, Strava, Upstash | `.env.example` | Major | fix-before-public | 08 |
| NAV-02 | Navigation | Orphan screen `app/challenge/complete.tsx` — declared Stack.Screen, `ROUTES.CHALLENGE_COMPLETE` 0 refs, no nav reaches it | `app/_layout.tsx:422`; `lib/routes.ts:43` | Major | fix-before-public | 01 |
| JRN-02 | Journeys | Streak-**freeze spend** unwired (`streaks.useFreeze` has no caller); freeze is display-only (save path = last-stand) | `backend/trpc/routes/streaks.ts:37` | Major | fix-before-public | 04/07 |
| ANL-01 | Analytics | ~38 candidate **defined-but-never-emitted** events incl. funnel (`paywall_purchase_*`, `purchase_*`, `streak_lost`, `respect_sent`, `invite_shared`) — overcounts via wrapper fns | `lib/analytics.ts` | Major | fix-before-public | 06 |
| TEST-01 | Tests | **Zero UI/screen/flow coverage** for onboarding, paywall, auth, navigation, create wizard, proof flow | `tests/*` | Major | fix-before-public | 08 |
| STATE-01 | Interactive | Home top-level `homeQuery` has no screen-level error branch (delegates to children) | `app/(tabs)/index.tsx:134,321` | Minor | fix-before-public | 02 |
| BTN-01 | Interactive | No-op button `onPress={() => {}}` in a live module (TaskEditorModal imported 7×) | `components/TaskEditorModal.tsx:1437` | Minor | fix-before-public | 02/08 |
| FORM-01 | Interactive | Proof caption cap (120) present but **no live counter** in `TaskPhotoBody` (celebration screen has both) | `components/task/bodies/TaskPhotoBody.tsx:43,158` | Minor | fix-before-public | 02 |
| DS-01 | Design System | **Emoji in live UI** (`🏆 FEATURED`, `🔥 active`, `💀 EXTREME`) | `app/challenge/[id].tsx:1007-1012`; `active/[…].tsx:252-255` | Minor | fix-before-public | 08 |
| DS-02 | Design System | Flat `DS_COLORS.*` (~1033) vs `DS_COLORS_V2` (38) — legacy token drift | codebase-wide | Minor | debt-shelf | 08 |
| DS-03 | Design System | ~807 `fontSize` numeric literals (scale drift) | codebase-wide | Minor | debt-shelf | 08 |
| LINT-01 | Build/Lint | 1 ESLint warning trips `--max-warnings 0` (CI gate fails) | `components/onboarding/v2/screens/CommitmentScreen.tsx:3` | Minor | fix-before-TestFlight | 00 |
| NAV-03 | Navigation | Typed routes (`typedRoutes:true`) defeated by pervasive `... as never` casts | codebase-wide | Minor | debt-shelf | 01 |
| NAV-04 | Navigation | 6 orphan `ROUTES` constants (`TABS_CREATE`, `TABS_ACTIVITY`, `TABS_SETTINGS`, `ACCOUNTABILITY_ADD_DAY1`, `INVITE_CODE`, `CHALLENGE_COMPLETE`) | `lib/routes.ts` | Minor | debt-shelf | 01 |
| NAV-05 | Navigation | Dead `Stack.Screen` decls for missing routes `create-team`/`team-invite`/`join-team` | `app/_layout.tsx:390-392` | Minor | debt-shelf | 01 |
| NAV-06 | Navigation | Dead/hidden `teams` tab (href:null, no nav, placeholder) | `app/(tabs)/teams.tsx`; `_layout.tsx:90` | Minor | debt-shelf | 01 |
| NAV-07 | Navigation | `ROUTES.AUTH="/auth"` ambiguity (no `auth/index.tsx`); used on session-expiry + post-delete | `lib/routes.ts:6`; `app/auth/_layout.tsx` | Minor | UNVERIFIED-LIVE | 01 |
| NAV-08 | Navigation | ~4 `router.push(TABS_HOME)` back-stack hazards (should `replace`) | `challenge/active/[…].tsx:307,314`; `index.tsx:338` | Minor | debt-shelf | 01 |
| BE-01 | tRPC/Backend | ~33 orphan tRPC endpoints (no FE caller) incl. `user.completeOnboarding`, `respects.*`, `nudges.*`, discover variants | `backend/trpc/routes/*` | Minor | debt-shelf | 04 |
| DATA-01 | Data/State | V2 `selectedGoals` feeds nothing downstream (TODO goals→pack) | `components/onboarding/v2/screens/GoalsScreen.tsx:9` | Minor | intentionally-gated | 04 |
| DEAD-01 | Dead Code | 35 unused files (knip) incl. confirmed-dead `StreakHeroV2` (0 imports); 80 unused exports, 74 unused types | knip output | Minor | debt-shelf | 00/08 |
| ERR-01 | Error Monitoring | Swallowed catches (session restore, push reg, recordOpen) lose Sentry signal | `AuthContext.tsx:42`; others | Minor | debt-shelf | 06 |
| GATE-01 | Gated | `goal_type`/`tracking_mode` columns absent → `RUN_GOAL_CONFIG=false` correct; run-goal UI gated | `supabase/migrations` (absent) | n/a | intentionally-gated | 05 |
| GATE-02 | Gated | Strava endpoints/UI gated (`PREMIUM_INTEGRATIONS=false`); 5 Strava tRPC orphans + "coming soon" stubs | `integrations.ts`; `TaskCompleteForm.tsx:473` | n/a | intentionally-gated | 02/04 |
| GATE-03 | Gated | OnboardingFlowV2 (`ONBOARDING_V2=false`) — new flow not live | `app/onboarding/index.tsx` | n/a | intentionally-gated | 04 |
| LIVE-01 | Supabase | RLS matrix is static-only; no `to_regclass`/`pg_policies` run (no creds) | — | n/a | UNVERIFIED-LIVE | 05 |
| LIVE-02 | Paywall | RC entitlement/products + purchase round-trip not device-verified | — | n/a | UNVERIFIED-LIVE | 03 |
| LIVE-03 | Notifications | Cron cadence + push delivery end-to-end not verified | — | n/a | UNVERIFIED-LIVE | 06 |

## Totals

**By severity:** Critical **2** · Major **10** · Minor **16** · (intentionally-gated **3** + UNVERIFIED-LIVE markers **3** not counted as defects).

**By bucket:**
- `fix-before-TestFlight`: 4 (JRN-01, PAY-01, NOTIF-01, LINT-01) + AUTH-02 (conditional)
- `fix-before-public`: 11 (PAY-02, NAV-01, DB-01, CFG-01, NAV-02, JRN-02, ANL-01, TEST-01, STATE-01, BTN-01, FORM-01, DS-01) 
- `debt-shelf`: 11 (DS-02, DS-03, NAV-03/04/05/06/08, BE-01, DEAD-01, ERR-01)
- `intentionally-gated`: 3 (DATA-01, GATE-01/02/03)
- `UNVERIFIED-LIVE`: AUTH-02, NAV-07, LIVE-01/02/03
