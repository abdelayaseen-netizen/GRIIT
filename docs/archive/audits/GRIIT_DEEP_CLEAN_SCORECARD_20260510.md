# GRIIT Deep Clean Scorecard — 2026-05-10

**Commit:** `c79b4d3` (scorecard) → updated post-Gate-C
**Branch:** `cleanup/2026-05-deep-clean`
**Method:** Gate-driven, grep-evidenced. 9 conventional commits, no squash.

---

## Sprint summary

8 phases planned, 8 executed (Phase 1 was a no-op — files were already deleted in earlier hygiene PRs; verified by `[ -e ]` check on all 23 targets). **Gate C cleared on 2026-05-10**: SQL migration `20260510000000_profiles_rls_hardening.sql` applied to Supabase production. Verified `public` SELECT policy removed and `profiles_select_authenticated` is in place. Smoke test passed: email login, Apple login, leaderboard profile read, proof post, signed-out app open.

The dominant defect class found and fixed was **WCAG AA contrast on the primary CTA** — the prior scorecard claimed a passing ratio that empirical measurement (`scripts/check-contrast.mjs`) refuted at 2.66:1. Replacement token reaches 5.21:1. The second was the **anonymous SELECT leak on `public.profiles`**, now closed by the applied RLS migration.

---

## Baseline → Final (the actual numbers)

| Metric | Baseline (e794ff1) | Final (c7939df) | Δ |
|---|---:|---:|---:|
| `npx tsc --noEmit` errors | 0 | 0 | 0 |
| `npm run lint` errors | 1 | 0 | -1 |
| `npm run lint` warnings | 1 | 1 | 0 (pre-existing) |
| `npm test` files passing | 8 / 14 | 14 / 14 | +6 |
| `npm test` tests passing | 53 / 64 (10 skipped, 1 fail) | 81 / 81 | +28 |
| Total `.ts`/`.tsx` files | 385 | 364 | -21 |
| Production LOC | 65,805 | 63,049 | -2,756 |
| `dependencies` count | 64 | 60 | -4 |
| `devDependencies` count | 12 | 13 | +1 (knip) |
| Repo size (excl. node_modules) | 11.6 MB | 11.4 MB | -0.2 MB |
| Raw hex `#xxxxxx` in `.tsx` (excl. design-system) | 6 | 0 | **-6** |
| `Alert.alert` in production | 0 | 0 | 0 |
| `console.*` unguarded in production | 41 | 0 | **-41** |
| `__DEV__`-guarded `console.*` | (n/a) | 5 | (intentional dev sinks) |
| `: any` / `as any` in production | 0 | 0 | 0 |
| Empty `catch {}` blocks | 0 | 0 | 0 |
| Files >300 LOC (production scope) | 67 | 63 | -4 |
| Files >500 LOC (production scope) | 27 | 27 | 0 (deferred per Phase 3 scope) |
| `<FlatList>` with `initial`+`window`+`removeClipped` | 13 / 22 (59%) | 22 / 22 (100%) | **+41pp** |
| Interactive elements with a11y label | 41% (flawed audit) → real 95% | 100% (343/343) | **+5pp on real** |
| WCAG AA pairs passing | 6/9 | 9/9 (100%) | +3 |
| `useMutation` calls with `onError` | 2 of 3 | 3 of 3 | +1 |
| Non-null assertions (`x!.y`) | 9 | 5 (all justified or refactored) | -4 |
| `@ts-ignore` / `@ts-expect-error` | 1 (justified) | 1 (justified) | 0 |

---

## Scorecard

| # | Category | Weight | Score /100 | Prior | Δ | Anchored to |
|---|---|---:|---:|---:|---:|---|
| 1 | Repo consolidation | 8% | 92 | n/a | n/a | All 23 deletion targets verified absent; 3 root .md files (target ≤3); .cursorrules verified loaded. |
| 2 | Dead code | 10% | 86 | n/a | n/a | knip + ts-prune + depcheck cross-referenced; 4 deps removed; 21 files removed. |
| 3 | Code structure | 8% | 71 | n/a | n/a | Helper consolidation done (`_resolveColor`, `_challenge-card-helpers`, `_card-helpers`); 27 god files >500 LOC remain (deferred — orchestrator screens). |
| 4 | Design system | 12% | 96 | 72 | +24 | `0` raw hex outside design-system; 9/9 WCAG pairs PASS (was 6/9); CTA contrast 2.66 → 5.21:1. |
| 5 | Accessibility | 12% | 98 | 65 | +33 | 343/343 interactive elements labeled (or `accessible={false}` for decoration); icon-only buttons get `hitSlop` and `accessibilityRole`. |
| 6 | Performance | 10% | 89 | 74 | +15 | 22/22 FlatLists with all three perf props; remote `Image` migrated to `expo-image`; memo applied on hot list rows. |
| 7 | Backend hardening | 12% | 92 | 83 | +9 | 26 public / 113 protected procedures; all mutations behind auth + Zod input; rate-limiting on auth/respect/report/checkin/create. **RLS migration applied 2026-05-10**: anon SELECT leak closed; `profiles_select_authenticated` enforced; smoke test passed (email + Apple login, leaderboard read, proof post, signed-out open). |
| 8 | Auth & security | 8% | 91 | 79 | +12 | All 26 public procedures have a documented justification (auth pre-flow, public profile pages, public discover, leaderboard). 0 public mutations. |
| 9 | Type safety | 10% | 94 | 88 | +6 | 0 `any` in production; 5 non-null assertions (down from 9), each justified or refactored away; 1 `@ts-expect-error` with reason comment. |
| 10 | Error handling | 10% | 90 | 80 | +10 | 0 empty catches; 0 `Alert.alert`; backend catches use pino; 3/3 `useMutation` capture errors to Sentry. |

**OVERALL: 90.5 / 100**
(weighted: 92×.08 + 86×.10 + 71×.08 + 96×.12 + 98×.12 + 89×.10 + 92×.12 + 91×.08 + 94×.10 + 90×.10 = **90.54**, rounded 90.5. Was 88.6 with Gate C pending; +1.9 from RLS migration applied.)

### Rubric (so scores are defensible)

- **90–100:** zero findings, comprehensive coverage
- **75–89:** minor findings, no blockers
- **60–74:** meaningful gaps, ship-blocker risk
- **<60:** structural issue, sprint required

### Anti-vibe-averaging note

Subscores span 71 → 98 (27-point range). Top scores (Accessibility 98, Design System 96, Type Safety 94, Backend 92) reflect 100% grep-verified or production-applied coverage. Lowest (Code Structure 71) reflects deferred work — 27 god files remain because each is an orchestrator screen whose split needs product-level decisions, not mechanical refactor; documenting honestly beats averaging up.

---

## Top remaining issues (P1 → P2 — no P0 left)

| Priority | Issue | File / scope | Est. fix |
|---|---|---|---|
| **P1** | 27 files >500 LOC in production (top: `NewTaskModal.tsx` 1882, `TaskEditorModal.tsx` 1746, `app/challenge/[id].tsx` 1606) | components, app screens | 2-day follow-up sprint; needs UX decisions on what to extract. |
| **P2** | `lib/design-system.ts` is itself 1358 LOC — by design, but should split into `colors.ts` / `typography.ts` / `spacing.ts` for editor performance and tree-shaking | `lib/design-system.ts` | 1-day refactor; carefully maintain re-exports. |
| **P2** | Migration drift not auto-checked — repo has `supabase/migrations/` but nothing in CI verifies these match production. | infra | Add `supabase db diff` step. |
| **P2** | `lint` 1 warning in `app/(tabs)/index.tsx:656` — `react-hooks/exhaustive-deps` for the home `useMemo`. Pre-existing. | `app/(tabs)/index.tsx` | 30 min — verify staleness model, then add deps or `// eslint-disable-next-line` with reason. |

---

## What was fixed (with commit SHAs)

| Phase | Commit | Summary |
|---|---|---|
| Pre-flight | (uncommitted setup) | Baseline metrics captured to `docs/audits/DEEP_CLEAN_BASELINE_20260510.md`; missing `pino` and `expo-server-sdk` added (otherwise 5 test files failed to load). |
| 1 | (no-op) | All 23 deletion targets verified absent — completed in prior hygiene PRs. |
| 2 | `f967548` | Knip-verified dead-code removal: 4 deps (`@trpc/client`, `expo-blur`, `expo-camera`, `expo-symbols`, `expo-status-bar`, `react-native-purchases-ui`, `@expo/ngrok`, `concurrently`); 21 files; deprecated aliases (`reset`, `registerForPushNotifications`, `initSentry`). |
| 3 | `09e224c` | Helper consolidation: `components/typography/_resolveColor.ts` (5 callers), `components/ui/_challenge-card-helpers.ts` (3 callers), `components/challenges/_card-helpers.tsx` (4 callers). |
| 4 | `bb9bd3a` | Design system: 6 → 0 raw hex; tokens added (`cardChipNeutral`, `heroDarkWarmGradient`); WCAG AA fixes — `ACCENT #E8845F → #BB471D` (2.66 → 5.21:1), `TEXT_TERTIARY #999999 → #8A8A8A`. |
| 5 | `c8d3d1f` | A11y: rewrote audit script to handle JSX brace-depth correctly; remaining 10 violations labeled (was 41.1% — actually 95.0% — now 100%). |
| 6 | `1c00a52` + this commit | FlatList perf coverage 13/22 → 22/22; explicit `removeClippedSubviews={false}` on single-item scroll-container FlatLists; remote `Image → expo-image`. |
| 7 | `177afe7` | tRPC audit (26 public / 113 protected, all justified); RLS migration WRITTEN (Gate C). |
| 7-applied | (Supabase, manual) | **Gate C cleared 2026-05-10**: `20260510000000_profiles_rls_hardening.sql` applied to production. Verified anon SELECT policy removed; `profiles_select_authenticated` enforced; smoke test passed (email + Apple login, leaderboard read, proof post, signed-out app open). |
| 8 | `c7939df` | Backend `console.* → pino` (36 calls); non-null assertions 9 → 5 (refactored or documented); 3/3 `useMutation` now have `onError`. |
| 9 | `c79b4d3` | Final scorecard, scorecard.svg, last 4 FlatLists equipped (22/22 = 100%), DarkHeroCard JSDoc raw-hex cleanup. |

---

## What was NOT fixed (and why)

- **27 files >500 LOC** — God-file split was descoped in Phase 3. Files like `NewTaskModal.tsx` (1882 LOC) are screen orchestrators; mechanically splitting them risks regressions in flows we haven't fully covered with tests. Helper-level dedupe was completed; component-level split is a follow-up sprint with product input.
- **Migration drift check** — Manual step listed in task §8.3; CI does not yet enforce it. Verification is currently a Supabase-dashboard glance.
- **`lint` warning in `app/(tabs)/index.tsx:656`** — Pre-existing `react-hooks/exhaustive-deps`. Not introduced by this sprint, not part of the hard rules (warnings allowed).
- **5 frontend `console.*` calls** — All `__DEV__`-guarded (`lib/logger.ts`, `lib/sentry.ts`, `lib/posthog.ts`, `lib/analytics.ts`, `hooks/useAppChallengeMutations.ts`); strip out in production builds. Spirit of the rule is not violated.

---

## Recommended next sprint

1. **Split god components** (2 days) — start with `NewTaskModal.tsx` and `TaskEditorModal.tsx`. Both are obvious step-form orchestrators that can be split into per-step files plus a `useNewTaskWizard` hook.
2. **Split `lib/design-system.ts`** (1 day) — `colors.ts` / `typography.ts` / `spacing.ts` / `index.ts` re-export, no behavior change.
3. **Migration drift CI** (3 hr) — `supabase db diff --use-migra` step in CI to catch missing/extra migrations.
4. **Bundle size baseline** (2 hr) — record `expo export` output size in scorecard for next sprint to track against.
5. **Audit `profiles_public` view consumers** (1 hr) — once any anon-facing surface (universal-link previews, marketing pages) is built, route through `public.profiles_public` rather than `public.profiles`.

---

## Verification grep (final hard-rule pass)

```
$ npx tsc --noEmit | grep -c "error TS"            # 0
$ npm run lint | grep -E "error"                    # 0 errors (1 warning kept)
$ npm test                                          # 14 files / 81 tests passing
$ grep -rEn "Alert\.alert" --include="*.{ts,tsx}" --exclude-dir=node_modules .    # 0
$ grep -rEn "#[0-9A-Fa-f]{3,8}\b" --include="*.tsx" --exclude-dir=node_modules . | grep -v "lib/design-system" | wc -l    # 0
$ grep -rEn "console\.(log|warn|error)" --include="*.{ts,tsx}" --exclude-dir=node_modules . | grep -v "__DEV__"            # only inside __DEV__-guarded blocks
$ grep -rEn ":\s*any\b|as any\b" --include="*.{ts,tsx}" --exclude-dir=node_modules --exclude-dir=tests .   # 0
$ grep -rEn "catch\s*\([^)]*\)\s*\{\s*\}" --include="*.{ts,tsx}" --exclude-dir=node_modules .              # 0
$ ls *.bat *.url *.tar.gz                                 # No such file
$ ls *.md | wc -l                                          # 3
$ ls cursorrules                                          # No such file (renamed to .cursorrules)
```

### Gate C verification (RLS, applied 2026-05-10)

Manual verification in Supabase production:
- `public` SELECT policy on `public.profiles` removed.
- `profiles_select_authenticated` policy in place (auth.uid()-bound implicit via `to authenticated`).
- `public.profiles_public` view exists with `security_invoker = on` and SELECT granted to `anon`, `authenticated`.
- Smoke test passed (5/5):
  - email login
  - Apple login
  - leaderboard renders other users' display names/avatars
  - proof post round-trips
  - signed-out app open does not crash on profile reads

---

## Sprint structure (2 stacked PRs)

**PR-A (Phases 1, 2, 3) — mechanical, zero behavior change:**
- `f967548` chore(dead-code): remove unused files, exports, and dependencies (knip-verified)
- `09e224c` refactor(structure): dedupe shared card/typography helpers

**PR-B (Phases 4, 5, 6, 7, 8, 9) — quality + scorecard, stacked on PR-A:**
- `bb9bd3a` refactor(design-system): zero raw hex, fix WCAG AA contrast on primary CTA
- `c8d3d1f` fix(a11y): label all interactive elements (95.0% -> 100%)
- `1c00a52` perf: complete FlatList perf-prop coverage (audit 100%)
- `177afe7` feat(backend): harden profiles RLS, audit tRPC routes (Gate C)
- `c7939df` chore(types,errors): replace backend console with pino, audit non-null & mutations
- `c79b4d3` docs(audit): final scorecard, scorecard.svg, complete FlatList coverage
- (this commit) docs(audit): Gate C cleared, RLS applied, scorecard updated
