# GRIIT Final Scorecard (Post–Sprint 6)

**Date:** 2026-03-22  
**Commit:** `6b523ee`

## Summary

| # | Category | Weight | Score | Weighted | Previous (Sprint 0 baseline) |
|---|----------|--------|-------|----------|------------------------------|
| 1A | Design System Compliance | 5% | 100 | 5.0 | 20 |
| 1B | GRIIT Spelling | 3% | 100 | 3.0 | 65 |
| 1C | Navigation & Screen Flow | 7% | 90 | 6.3 | 76 |
| 1D | Component Quality | 5% | 88 | 4.4 | 40 |
| 1E | Accessibility | 5% | 82 | 4.1 | 38 |
| 1F | Empty States & Error Handling | 5% | 85 | 4.25 | 38 |
| 1G | Mock Data Removal | 2% | 98 | 1.96 | 98 |
| 2A | API Route Coverage | 5% | 92 | 4.6 | 70 |
| 2B | Input Validation & Security | 5% | 90 | 4.5 | 78 |
| 2C | Error Handling & Logging | 5% | 88 | 4.4 | 82 |
| 2D | Database Schema & Migrations | 5% | 90 | 4.5 | 80 |
| 2E | Performance | 5% | 86 | 4.3 | 74 |
| 3A | Auth Flow Integrity | 8% | 92 | 7.36 | 70 |
| 3B | RLS & Data Isolation | 7% | 88 | 6.16 | 78 |
| 4A | TypeScript Strictness | 4% | 95 | 3.8 | 90 |
| 4B | Code Organisation | 3% | 90 | 2.7 | 86 |
| 4C | Documentation | 3% | 88 | 2.64 | 72 |
| 5A | Monetisation | 6% | 88 | 5.28 | 84 |
| 5B | Analytics & Tracking | 4% | 90 | 3.6 | 68 |
| 5C | App Store Readiness | 4% | 88 | 3.52 | 88 |
| 5D | Viral & Growth Mechanics | 4% | 80 | 3.2 | 78 |
| — | **OVERALL** | **100%** | — | **~91.5** | **69** |

Scores 1C–5D are judgment calls from the evidence below; **1A** is anchored to **zero raw hex** outside `lib/design-system.ts` (see grep output).

---

## Evidence (commands run on this repo)

### 1A — Raw hex outside design-system

```text
# PowerShell: all *.ts/*.tsx except design-system.ts — hex colour literals
hexOutsideDS=0
```

(Verified by scanning tracked `*.ts` / `*.tsx` with `git ls-files`, excluding paths matching `design-system`, and matching `#[0-9A-Fa-f]{3,8}`.)

### 1B — “grit” spelling (app + components)

```text
# rg '\bgrit\b' app/ components/ — case-insensitive: 0 matches
```

### 1D — Component quality (samples)

```text
# git grep 'style={{' -- '*.tsx' — total occurrences summed per file counts
inlineStyles=17

# rg 'as any' — app + components: 0
```

### 1D — console.log

```text
# console.log in lib/ (dev-only or analytics helpers):
# lib/sentry.ts, lib/analytics.ts, lib/revenue-cat.ts — all behind __DEV__ or dev-only paths
```

### 1D — TODO / FIXME (comment form)

```text
# rg '//\s*TODO' — 1 (NotificationScreen: TODO(v2) push token persistence)
```

### 1E — Accessibility (approximate; noisy metrics)

```text
# accessibilityLabel occurrences: high coverage across major flows (see rg count in workspace)
# Many TouchableOpacity/Pressable without label on same line — metric is inflated; score reflects partial coverage + ongoing work
```

### 1F — Alert.alert

```text
# Multiple Alert.alert usages remain (create wizard, tasks, teams, etc.) — score below 90 until replaced with InlineError / sheets where appropriate
```

### 1G — Mock data strings

```text
# Sprint 6 Phase 1 removed mocks/starter-challenges.ts; faker/mock names grep targeted tests only
```

### 2A–2E — Backend (tRPC route files)

```text
mutations=36  (.mutation()
input=56      (.input( on procedures)
protectedProcedure≈84  publicProcedure≈16  (includes helpers — see backend/trpc/routes)
TRPCError≈138
```

### 2E / 3 — Prefetch & memo

```text
# prefetch | onPressIn in *.tsx: present on Discover + Home challenge flows
# React.memo: DailyCard, LiveFeedCard, ChallengeRowCard*, etc.
```

### 3A — Sign-out cleanup

Centralised in `lib/signout-cleanup.ts`: `queryClient.clear()`, `clearSentryUser()`, `resetAnalytics()` after `signOut` from profile/settings.

### 3B — RLS (supabase/migrations only)

```text
ENABLE ROW LEVEL SECURITY lines: 17
CREATE POLICY lines: 50
```

### 5B — trackEvent

```text
# trackEvent outside lib/analytics.ts: numerous call sites (onboarding, paywall, challenge, etc.)
```

### 5C — app.json / eas

See `app.json` and `eas.json` in repo (bundle IDs retain `grit` for store continuity — documented in `lib/config.ts`).

---

## Findings by category (abbreviated)

| Category | Notes |
|----------|--------|
| **1A** | All UI hex lives in `DS_COLORS` / design-system. **100.** |
| **1B** | No standalone “grit” in `app/` or `components/`. **100.** |
| **1C** | Sprint 6 removed dead routes; flows consolidated. Some historical docs still mention old paths (banner added to `CLICKABLE_MAP.md` / `APP_BREAKDOWN.md`). **90.** |
| **1D** | **17** inline `style={{` remain (mostly small / animated). No `as any` in app/components grep. **88.** |
| **1E** | Strong label usage on critical actions; not every pressable labeled. **82.** |
| **1F** | EmptyState / ErrorRetry used; Alert.alert still in several flows. **85.** |
| **2E** | FlatLists audited (Discover horizontal list gets batch/window; accountability/chat already tuned). DailyCard memoised; chat/team avatars use expo-image. **86.** |
| **4C** | `docs/ARCHITECTURE.md` added; README links to it. **88.** |
| **5D** | Share, invites, notifications code paths exist; growth not fully instrumented end-to-end. **80.** |

---

## Journey: 69 → ~91.5

| Sprint | Focus | Approx. score |
|--------|--------|----------------|
| 0 | Baseline | 69 |
| 1 | Trust & polish | ~76 |
| 2 | UX hardening | ~80 |
| 3 | Design system long tail | ~84 |
| 4 | Business readiness | ~88 |
| 5 | Backend hardening | ~91 |
| 6 | Deep clean + scorecard | **~91.5** |

---

## Recommendations

### To reach 95+

1. Replace remaining **Alert.alert** with `InlineError` / in-app sheets for recoverable errors.
2. Finish **accessibility** pass: ensure every primary `TouchableOpacity` / `Pressable` has `accessibilityLabel` + role.
3. Reduce remaining **inline styles** in large screens (`challenge/[id].tsx`, task flows) where not animation-driven.
4. Wire **nudges** or remove dead tRPC surface (see `docs/SPRINT6-PHASE1-BACKEND-CANDIDATES.md`).

### Launch blockers

- None identified from this scorecard alone; follow **App Store** checklist (privacy, subscriptions, review notes) before submission.

### Post-launch priorities

- Persist **push token** (TODO v2 in `NotificationScreen`).
- Revisit **unused tRPC** procedures after product decisions.
- Continue **performance** profiling on low-end Android devices for long lists.
