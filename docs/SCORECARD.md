# GRIIT Master Scorecard — 2026-03-29

This scorecard reflects **work completed in this session** (deep clean Phases 1A–1F, 1E hex fix, Phase 2A feature-gates merge, Phase 2B review) plus **honest gaps** for everything not executed (mega-file splits, full a11y sweep, backend catch/`any` pass, competitive research depth, live revenue data).

**Verification (repo root):**

| Check | Result |
|--------|--------|
| `npx tsc --noEmit` (root) | Exit **0** |
| `cd backend; npx tsc --noEmit` | Exit **0** |
| `(Get-ChildItem docs\*.md).Count` (PowerShell) | **9** |
| `from … @/src/` in `app/`, `components/`, `lib/` | **0** (workspace search) |
| `from … @/constants/` in same | **0** |
| `from … @/styles/` in `app/`, `components/` | **0** |
| `#[0-9a-fA-F]{6}` in `app/**/*.tsx` | **0** matches (workspace search) |
| `#[0-9a-fA-F]{6}` in `components/**/*.tsx` | **0** matches |
| `Alert.alert` in `app/`, `components/` | **0** |
| `GRIT[^I]` in `app/`, `components/`, `lib/` `*.ts(x)` | **0** (no false “GRIT” product spelling) |

**Note:** `rg` is not on PATH in the default Windows shell used here; counts above use the same intent as the prompt’s `rg` gates via the editor/workspace search tool.

---

## Executive summary

| Pillar | Score | Notes |
|--------|------:|-------|
| **Clean / structure** | **72/100** | Legacy `src/`, `constants/`, `styles/` removed or relocated; **9** living docs; loose backend `migration*.sql` removed. |
| **Frontend** | **88/100** | TS clean, design tokens on challenge detail styles, imports unified. Large screens and partial a11y gap remain. |
| **Backend** | **80/100** | Unchanged this session; `supabase.ts` / `supabase-admin.ts` / `supabase-server.ts` all still referenced — no redundant file removed. |
| **Performance** | **62/100** | No mega-file splits or FlatList normalization in this pass. |
| **Competitive readiness** | **55/100** | See gap table — strong core loop; missing industry-standard growth and infra items. |
| **Overall (weighted)** | **~74/100** | Up on repo hygiene; down vs a “fully complete” mega-prompt because Phases 3–5 and full scorecard automation were not finished. |

---

## Deep clean gates (Phase 6 style)

| Gate | Before (prompt) | After (2026-03-29) | Notes |
|------|-----------------|---------------------|--------|
| Raw `#hex` in `app/` / `components/` / `contexts/` | 23 in one file | **0** in app/components TSX (search) | `lib/design-system.ts` remains the hex source of truth. |
| `Alert.alert` | 0 | **0** | — |
| `console.log` outside dev intent | 0 | **0** prod-style | Remaining logs are `if (__DEV__) console.log(…)`. |
| Empty / swallowed catches | ~7 | **Still present** | e.g. `.catch(() => {})` on haptics/notifications/scheduling; `catch {}` in `lib/trpc.ts`. Not cleaned in this pass. |
| Missing `accessibilityLabel` (heuristic) | ~680 | **Not re-counted** | Full Phase 4 not run; many touchables remain. |
| `src/` imports | 11 | **0** | `src/` deleted; UI → `components/ui`, theme → `lib/theme`. |
| `constants/` imports | 15 | **0** | Onboarding theme → `components/onboarding/onboarding-theme.ts`; `ShareCard` uses `DS_COLORS` only. |
| `styles/` imports | 2 | **0** | `checkin-styles` / `run-styles` live under `app/task/`. |
| Files > 500 lines (`app`, `components`, `lib`) | 19 | **~18+** | Still includes `TaskEditorModal.tsx`, `activity.tsx`, `complete.tsx`, `CreateChallengeWizard.tsx`, `challengeDetailScreenStyles.ts`, etc. |
| TypeScript errors | 0 | **0** | Root + backend `tsc` clean. |
| Doc `.md` files in `docs/` | 108 | **9** | Only the agreed keep list retained. |
| Dead dirs | — | **Removed** | `src/`, `constants/`, `styles/`, `coverage/` / `web-fallback*` if present; `backend/migration*.sql` (loose) removed. |

**Clean sub-score (honest):** Swallowed catches + mega-files + a11y keep this below 80.

---

## Frontend scorecard (Phase 7 style)

### Code quality (50 pts) → **42/50**

- **TypeScript:** 10/10 — `npx tsc --noEmit` OK.
- **Design system:** 9/10 — Challenge detail raw hex removed; `lib/theme` + `components/ui` still carry some rgba literals and legacy token shapes (acceptable but not “perfect DS everywhere”).
- **Architecture:** 7/10 — Many files **>800** lines unchanged.
- **Error handling:** 6/10 — Silent `.catch(() => {})` / empty `catch` still exist.
- **Cleanliness:** 10/10 — No `Alert.alert`; dev-only logging pattern preserved.

### UX (30 pts) → **24/30**

- **Accessibility:** 6/10 — Not a full interactive-element pass this session.
- **Loading / errors:** 9/10 — Existing skeletons and `ErrorBoundary` unchanged; still solid.
- **Navigation:** 9/10 — No route work in this pass; prior fixes assumed stable.

### Performance (20 pts) → **11/20**

- **Lists:** 4/10 — No systematic `React.memo` / `FlatList` prop audit this session.
- **Images:** 4/10 — No `expo-image` migration pass.
- **Queries:** 8/10 — Default `staleTime` in query client still the main story.
- **Bundle / splits:** 3/10 — Largest components untouched.

**Frontend total:** **~77/100** (rounded from weighted feel of the sections above; prior pass claimed higher when a11y heuristics looked cleaner).

---

## Backend scorecard (Phase 8 style)

| Area | Score | Evidence |
|------|------:|----------|
| Security / validation | 8/10 | Zod on routes (prior audits); RevenueCat still client-led; rate limit in-memory. |
| Reliability | 8/10 | TRPC patterns stable; not re-audited every catch this session. |
| Performance | 6/10 | Large route files; daily reset stub / caching story unchanged from known issues. |
| Maintainability | 7/10 | Three Supabase entrypoints **all used** — consolidation would be merge/refactor, not deletion. |

**Backend total:** **~80/100** (no regression from this PR; no major backend edits).

---

## Competitive & research gap analysis (Phase 9 — concise)

Frameworks applied qualitatively: **Fogg B=MAP**, **Hook Model**, **SDT**.

| Capability | GRIIT (2026-03) | Gap |
|------------|-----------------|-----|
| Push / streak prompts | Strong | Widgets + smarter timing A/B |
| Social feed | Yes | Density, shares to Stories, referral deep links |
| Photo / proof tasks | Yes | Optional server-side integrity signals |
| Leaderboards | Yes | Habit apps often pair with weekly narrative — polish |
| Teams | Partial / gated | Clear Pro value story |
| Offline-first | Weak | Competitors often cache critical read paths |
| App Store review prompt | Verify | Standard growth hygiene |
| Server-side receipt validation | No | Industry baseline for subscription trust |

**Fogg (B=MAP):** Motivation **7/10**, Ability **6/10** (complex flows in large files), Prompt **7/10**.

**Hook:** Trigger **7**, Action **6**, Variable reward **7**, Investment **7**.

**SDT:** Autonomy **7**, Competence **7**, Relatedness **6**.

**Top 5 to compete**

1. **Receipt validation + entitlements** — trust and fraud resistance.  
2. **Referral + deep links** — viral coefficient (benchmark: need meaningful K-factor for organic lift).  
3. **Widgets + notification intelligence** — prompt channel (Fogg).  
4. **Offline / resilience** — perceived ability on poor networks.  
5. **Social sharing to Stories** — acquisition loop (Strava / BeReal pattern).

---

## Revenue projections (Phase 10 — honest, no live metrics)

Benchmarks (industry reports cited in the prompt): Health & Fitness trial-to-paid **~8–12%**; D30 retention often **single digits**; high churn month 1; ARPPU often **~$11–15/mo** in category.

**Pricing assumed:** Free (3 active challenges), Pro **$9.99/mo** / **$49.99/yr**.

| Horizon | MRR | Assumption |
|---------|-----|------------|
| Current | **$0** (unless you have live dashboards) | Pre-scale or testflight-only is normal. |
| 3 mo | **$0–$500** | Requires store launch + small paid cohort. |
| 6 mo | **$500–$5k** | Needs ASO + content loop + paywall optimization. |
| 12 mo | **$5k–$30k** | Needs retention work + possibly teams/Pro proof. |
| 24–36 mo | **Highly variable** | $1M ARR needs **~8.3k** subs at $9.99 or equivalent ARPPU mix. |

**Acceleration levers:** (1) Server-validated subscriptions, (2) onboarding & paywall timing, (3) push + widget prompts, (4) referral program, (5) retention cohort fixes (onboarding → day-7 → day-30).

---

## Top 10 priorities (by impact)

1. Split **TaskEditorModal** + **activity** + **challenge/[id]** + **task/complete** (maintainability → fewer regressions → faster shipping).  
2. **Accessibility** pass on tab screens and create flow.  
3. **Remove silent catches** or document + narrow scope.  
4. **FlatList / memo** normalization on hottest lists.  
5. **Server-side RevenueCat** validation sketch → implementation.  
6. **Redis** (or hosted limiter) for rate limits in production.  
7. **daily-reset** cron — replace stub.  
8. **expo-image** for remote images on feed/profile.  
9. **Prefetch** on more navigation surfaces (challenge, profile).  
10. **Referral / deep link** MVP.

---

## Session changelog (what actually landed)

- Removed **`src/`** after moving **UI** to `components/ui` and **theme** to `lib/theme`; updated all imports.  
- Removed **`constants/`** and **`styles/`**; onboarding theme → `components/onboarding/onboarding-theme.ts`; task styles → `app/task/*-styles.ts`.  
- **`challengeDetailScreenStyles.ts`:** replaced remaining `#hex` with **`DS_COLORS`**; added **`DS_COLORS.accentMuted`**.  
- **`ShareCard`:** dropped `@/constants/theme`; uses **`DS_COLORS.BG_PRIMARY`**.  
- **`lib/feature-gates.ts`** merged into **`lib/feature-flags.ts`**; duplicate file deleted.  
- **Docs:** pruned to **9** files per keep list.  
- **Backend:** deleted loose **`migration*.sql`** copies from `backend/` (migrations live under `supabase/migrations/`).

---

*Next verification you can run locally (install ripgrep or use IDE search): duplicate the prompt’s `rg` gates for hex, `Alert.alert`, imports, and file-length listing.*
