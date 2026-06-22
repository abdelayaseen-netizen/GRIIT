# 08 — Design System, Dead Code, Config, Tests

> Phase 8 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Design-system conformance (magnitude)

| Violation | Count | Verdict |
|---|---|---|
| **Raw hex in components** (`#rrggbb`, excl. design-system/theme-palettes) | **0** | ✅ clean |
| **Flat `DS_COLORS.UPPERCASE`** refs | **~1033** | pervasive legacy flat-token usage |
| **`DS_COLORS_V2`** refs | **38** (38 files) | V2 adoption minimal (mostly onboarding-v2) |
| **Emoji in UI** | **~77** | confirmed real (see below) |
| **`fontSize:` numeric literals** | **~807** | off-scale drift (many may match scale) |

- **Flat vs V2:** the app is overwhelmingly on the **flat `DS_COLORS`** system (~1033) with only ~38 `DS_COLORS_V2` references. The "V2 nested paths only" convention is honored in **new** (onboarding-v2) code but the broader codebase predates it. Large but cosmetic. **Minor (high volume).**
- **Emoji — confirmed in LIVE UI:**
  - `app/challenge/[id].tsx:1007-1012` → `"🏆 FEATURED"`, `` `🔥 … active today` ``, `"💀 EXTREME CHALLENGE"`
  - `app/challenge/active/[activeChallengeId].tsx:252-255,569` → same badges + `🔥` celebration
  - `components/create/NewTaskModal.tsx:1425-1499` → task icons `💪 🏃 💧 📓 📖`
  - **Minor**, but violates the "no emoji" guardrail and is reachable on the live challenge-detail screen.
- **`fontSize` literals (~807):** scale drift; representative across `components/*`. **Minor.**
- **Day-formatting** ("Day 1 / 1 day / 23 days"): not exhaustively enumerated; no obvious zero-pad pattern surfaced. (low priority)
- **`archivo`/font-weight migration:** **NOT present on this branch** — `app/_layout.tsx:13-14` uses `@expo-google-fonts/inter`. The known App-Store-disqualifying archivo migration lives on the create-flow-foundation branch, not `feat/onboarding`. ✅ (already-known, not applicable here).

## 2. Dead code / debt (knip + cross-ref)

From Phase 0 knip: **35 unused files · 80 unused exports · 74 unused types · 29 duplicate exports.**

Debt-shelf cross-reference (import counts):
| Module | Imports | Verdict |
|---|---|---|
| `components/home/StreakHeroV2.tsx` | **0** | **confirmed DEAD** |
| `components/home/HomeHeader.tsx` | 1 (knip: unused file) | likely dead (self/barrel ref) — verify |
| `components/home/HomeHeaderV2.tsx` | 1 (knip: default unused) | likely dead — verify |
| `components/create/CreateChallengeWizard.tsx` | 2 | semi-live; possibly dead chain |
| `hooks/useCreateChallengeWizardPersistence.ts` | 1 | imported by the wizard chain |
| `components/create/NewTaskModal.tsx` | 1 (knip: default unused) | likely superseded by `NewTaskSheet` |
| `components/TaskEditorModal.tsx` | **7** | **LIVE** (revises Phase 2: the no-op button at `:1437` is on a reachable module, not dead) |

- **Confirmed dead:** `StreakHeroV2` (0 imports) + the bulk of the 35 knip files (typography barrel, `lib/prefetch-queries.ts`, `lib/quotes.ts`, discover/home variants). **Debt-shelf bucket.**
- **Duplicate exports (29):** the `Name|default` pattern (e.g. `StreakFlame|default`) — source of the lone lint warning (Phase 0). **Minor.**

## 3. Config / env

- **`buildNumber`:** **absent** in `app.json` ✅; `eas.json:4` `"appVersionSource": "remote"` ✅ — consistent (matches the requirement). `app.json:40` android `versionCode:1` (separate, fine).
- **`.env.example` is severely incomplete** — documents **4** vars (`EXPO_PUBLIC_SUPABASE_URL/ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS/ANDROID_KEY`) but the code reads **~30+**, including **critical undocumented ones**:
  - Client: `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_API_URL`/`API_BASE_URL`, `EXPO_PUBLIC_ERROR_REPORT_URL`, `EXPO_PUBLIC_REVENUECAT_*_API_KEY` (legacy).
  - Backend: **`CRON_SECRET`**, **`SUPABASE_SERVICE_ROLE_KEY`**, `SENTRY_DSN_BACKEND`, `UPSTASH_REDIS_REST_URL/TOKEN`, `STRAVA_CLIENT_ID/SECRET/REDIRECT_URI`, `STRAVA_OAUTH_STATE_SECRET`, `CORS_ORIGIN`, `RATE_LIMIT_MAX_PER_MIN`, `REVENUECAT_API_KEY`.
  - **Major** for ops/onboarding/deploy reproducibility (a fresh deploy can miss `CRON_SECRET`/`SERVICE_ROLE_KEY`). bucket `fix-before-public`.
- **FLAGS consistency:** 13 flags + 4 `FREE_LIMITS`; gated-off (`RUN_GOAL_CONFIG`, `ONBOARDING_V2`, `LOCATION_CHECKIN_ENABLED`, `PREMIUM_INTEGRATIONS`) all intentional. No contradictory flag wiring found.
- **`eas.json`:** `appVersionSource: remote` ✅ (full sanity-check of profiles `UNVERIFIED` beyond version source).

## 4. Tests

- **Result (Phase 0):** `vitest run` → **15 files / 85 tests pass**, exit 0.
- **What's covered:** backend lib (progression, streak, date), tRPC routes (last-stand, challenges-create, accountability, nudges), 2 flow tests (`tests/flows/critical-paths`, `edge-cases`), lib utils (api, time-enforcement, formatTimeAgo, trpc-errors), DS contrast.
- **Zero-coverage critical paths:** **no UI/component/screen tests** — onboarding (V1 or V2), paywall, navigation/AuthRedirector, auth screens, create wizard, proof/photo flow have **no automated coverage**. All tests are unit/flow-level on backend+lib.
- **`pino` failures:** **did not surface** this run (pre-existing/environmental per known-state). 

## Counts (Phase 8)
| Metric | Count |
|---|---|
| Raw hex in components | **0** ✅ |
| Flat `DS_COLORS` refs (vs V2) | **~1033** vs 38 |
| Emoji in UI (confirmed) | **~77** (live: challenge screens) |
| `fontSize` literals | **~807** |
| Unused files (knip) | **35** (confirmed dead incl. `StreakHeroV2`) |
| Undocumented env vars | **~26** (incl. `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) |
| `buildNumber` present | **No** ✅ (correct) |
| Tests | **85 pass / 0 fail**; **0 UI-path coverage** |
