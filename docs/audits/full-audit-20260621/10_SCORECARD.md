# 10 — THE SCORECARD

> Full-app audit of GRIIT. Branch `feat/onboarding @ 953bccb`. Read-only; nothing committed. Scores are justified by the Phase 9 issue ledger + weights stated in §2.

## 1. Summary table

| Dimension | Score /100 | Status | Critical | Major | Minor | Evidence |
|---|---|---|---|---|---|---|
| Build / Type / Lint | 82 | OK | 0 | 0 | 1 | 00 (tsc 0; 1 lint warning fails gate) |
| Navigation | 66 | WEAK | 0 | 2 | 6 | 01 (univ. links, orphan screen) |
| Interactive (buttons/forms/states) | 85 | OK | 0 | 0 | 3 | 02 (1 no-op, caption counter, home err) |
| Auth & Session | 62 | WEAK | 1* | 0 | 1 | 03 (no email-verify screen) |
| Paywall & Entitlements | 60 | WEAK | 0 | 2 | 0 | 03 (fail-open default, unenforced limit) |
| Permissions | 92 | PASS | 0 | 0 | 0 | 03 (all requested + plist strings) |
| Data & State | 85 | OK | 0 | 0 | 1 | 04 (stores clean; V2 goals gated) |
| tRPC / Backend | 80 | OK | 0 | 0 | 1 | 04 (~33 orphan endpoints) |
| Supabase / RLS | 64 | WEAK | 0 | 1 | 0 | 05 (RLS ok static; core DDL absent; live unverified) |
| Notifications & Cron | 66 | WEAK | 0 | 1 | 0 | 06 (cron guarded; push-token mismatch) |
| Live Activities | 85 | OK | 0 | 0 | 0 | 06 (wired to task/run state) |
| Analytics | 72 | OK | 0 | 1 | 0 | 06 (no capture bypass; ~38 unemitted) |
| Error Monitoring | 84 | OK | 0 | 0 | 1 | 06 (Sentry FE+BE+boundaries; silent catches) |
| Critical Journeys | 55 | WEAK | 1 | 1 | 0 | 07 (no block-user; freeze stubbed) |
| Design System | 70 | OK | 0 | 0 | 3 | 08 (0 raw hex; flat tokens/emoji/fontSize) |
| Dead Code / Debt | 62 | WEAK | 0 | 0 | 1 | 00/08 (35 dead files) |
| Config / Env | 62 | WEAK | 0 | 1 | 0 | 08 (.env.example incomplete; buildNumber ok) |
| Tests | 58 | WEAK | 0 | 1 | 0 | 08 (85 pass; 0 UI coverage) |

\* AUTH-02 is **conditional** Critical (only if Supabase "Confirm email" is ON) — `UNVERIFIED-LIVE`.

## 2. Overall weighted score

**Weights** (stated for reproducibility): launch-blocking = **×3** {Navigation, Auth, Paywall, Permissions, Supabase/RLS, Critical Journeys}; medium = **×2** {Interactive, Data & State, tRPC/Backend, Notifications & Cron, Live Activities, Analytics, Error Monitoring}; low = **×1** {Build/Lint, Design System, Dead Code, Config/Env, Tests}.

- ×3 group sum = 66+62+60+92+64+55 = 399 → 1197
- ×2 group sum = 85+85+80+66+85+72+84 = 557 → 1114
- ×1 group sum = 82+70+62+62+58 = 334 → 334
- Weight units = 18 + 14 + 5 = **37**
- **Overall = (1197+1114+334) / 37 = 2645/37 ≈ 71/100**

### 🔴 Overall status: **WEAK**
**A single open Critical (JRN-01, no block-user) caps overall status at WEAK regardless of the 71 score.** A second conditional Critical (AUTH-02) is pending live verification.

## 3. Top issues, ranked (Critical → Major)

1. **JRN-01 · Critical · no block-abusive-user feature.** Users can report/hide posts but cannot block a user. **App Store Guideline 1.2 (UGC) rejection risk.** `components/feed/*`, `app/post/[id].tsx` (block absent). *Fix: add block/unblock (user-level) + surface in post/profile menus; persist + filter feed/leaderboard by block list.*
2. **AUTH-02 · Critical (conditional) · no email-verify/OTP screen.** Signup mints a session via `signInWithPassword` fallback (`app/auth/signup.tsx:151-166`); if Supabase "Confirm email" is ON, signup dead-ends with no verify UI. *Fix: confirm the Supabase setting; if confirmation required, add an email-verify/OTP screen + resend.* **UNVERIFIED-LIVE.**
3. **PAY-01 · Major · fail-open `isPro = true` default** (`app/challenge/[id].tsx:344`). Premium task-lock is disabled by default; latent paywall bypass. *Fix: default `isPro = false`.*
4. **PAY-02 · Major · free `MAX_CREATED_CHALLENGES` unenforced** (`lib/feature-flags.ts:47`). *Fix: enforce server-side in `challenges.create` against entitlement.*
5. **NOTIF-01 · Major · push-token column mismatch** (`sendPush.ts:37` reads `push_token`; `cron-reminders.ts:40`/`daily-reset.ts:210` read `expo_push_token`/`push_tokens`). Pushes may silently fail. *Fix: unify on one column/table for write + all readers.*
6. **NAV-01 · Major · universal links `griit.fit` unconfigured** (no `ios.associatedDomains`). Invite/web links won't open the app. *Fix: add associatedDomains + AASA, Android intentFilters + assetlinks.*
7. **DB-01 · Major · 4 core tables have no tracked CREATE TABLE** (`profiles`, `challenges`, `active_challenges`, `challenge_tasks`). Schema not reproducible. *Fix: add a baseline migration capturing current prod DDL.*
8. **CFG-01 · Major · `.env.example` missing ~26 vars** incl. `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. *Fix: document all required env.*
9. **NAV-02 · Major · `challenge/complete.tsx` orphan** — built completion screen unreachable (`ROUTES.CHALLENGE_COMPLETE` unused). *Fix: wire it into completion or remove.*
10. **JRN-02 · Major · streak-freeze spend unwired** (`streaks.useFreeze` no caller). Freeze is display-only. *Fix: wire the spend action or remove the freeze UI.*
11. **ANL-01 · Major · ~38 candidate-unemitted events** incl. paywall/purchase/streak-loss funnel. *Fix: emit (or remove) — reconcile wrapper-fn emissions first.*
12. **TEST-01 · Major · zero UI/flow test coverage** for onboarding/paywall/auth/nav/create. *Fix: add smoke tests for the 7 critical journeys.*

(Full Minor list — DS drift, emoji, dead code, back-stack hazards, orphan constants — in `09_issue_ledger.md`.)

## 4. Launch-readiness verdict

- **Ship to TestFlight? — NO, not yet.** Must-fix first (`fix-before-TestFlight`): **JRN-01 (block-user)**, **resolve AUTH-02** (verify Supabase confirm-email; add verify screen if ON), **PAY-01 (fail-open default)**, **NOTIF-01 (push-token mismatch)**, **LINT-01 (green the lint gate)**. JRN-01 alone is a probable App Store rejection.
- **Ship to public? — NO.** Beyond the TestFlight set, clear `fix-before-public`: **PAY-02** (enforce create limit), **NAV-01** (universal links), **DB-01** (baseline schema migration), **CFG-01** (env docs), **NAV-02** (orphan completion screen), **JRN-02** (freeze spend), **ANL-01** (funnel events), **TEST-01** (journey smoke tests), plus DS-01 emoji + the state/form minors. Then run the full `UNVERIFIED-LIVE` set on a device + live services.
- **State of the app (one paragraph):** GRIIT is **structurally sound but launch-incomplete.** The skeleton is strong — type-clean build, 85 passing unit/flow tests, complete static RLS coverage, correctly-wired RevenueCat entitlement (`"GRIIT Pro"`) with offering-driven pricing, working Live Activities, Sentry on both tiers, no PostHog bypass, no raw hex in components, in-app account deletion (5.1.1(v)), and the core journeys (create fast-path + wizard, leaderboard→profile, profile→settings→delete, task→proof→streak→feed) are connected end to end. What holds it back is a small set of high-leverage gaps: **no block-user** (a likely UGC rejection), an **unverified/absent email-verify path**, a **fail-open premium default** and **unenforced free-create limit**, a **push-token column mismatch** that can silently kill notifications, **universal links never configured**, and **core DB schema that isn't reproducible from migrations**. The rest is debt — pervasive legacy `DS_COLORS`, ~43 orphan tRPC endpoints, ~35 dead files, an incomplete `.env.example`, and zero UI test coverage. None of those are blockers, but the six-or-so Major/Critical items are, and they sit squarely on the paths Apple review and real users will hit first.

## 5. Verified vs. UNVERIFIED-LIVE

Greens that are **static-only** and still need a device / live service to confirm:
- **LIVE-01** — Supabase RLS/policies are static-evidence only; no `to_regclass`/`pg_policies` run (no creds). The whole RLS matrix is unconfirmed against prod.
- **LIVE-02** — RevenueCat entitlement `"GRIIT Pro"` + products `griit_pro_monthly`/`griit_premium_annual` exist in dashboard; purchase/restore round-trip on device.
- **LIVE-03** — Cron cadence (`/internal/daily-reset`, `/api/cron/*`) actually fires; push delivery end-to-end (compounded by NOTIF-01).
- **AUTH-02** — Supabase "Confirm email" setting (determines if signup works without a verify screen).
- **NAV-01 / NAV-07** — AASA/assetlinks at `griit.fit`; `/auth` route resolution on device.
- **DB-01** — column-completeness of the 4 untracked core tables in the live DB.
- **PAY-02** — runtime free-limit behavior on a real account.
- Permission-denied UX (camera/library/notifications) on device.

---
*Deliverable complete. 11 docs under `docs/audits/full-audit-20260621/` (`00`–`10`). Nothing committed — this is the map and the verdict.*
