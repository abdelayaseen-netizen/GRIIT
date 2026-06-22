# 02 — Interactive Surface (buttons, forms, states)

> Phase 2 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Buttons

Scanned `onPress|onClick|onLongPress|Pressable|TouchableOpacity|Button` + gesture handlers across `app/` + `components/`. The interactive surface is **overwhelmingly REAL** — Phase 1's ~95-edge nav list plus mutation handlers (Phase 4) confirms most buttons navigate or mutate. Only the items below deviate.

### DEAD / STUB / MISSING (pulled to top)

| Type | Location | Detail |
|---|---|---|
| **NO-OP** | `components/TaskEditorModal.tsx:1437` | `onPress={() => {}}` — empty handler. *Module is knip-flagged unused (`TaskEditorModal.tsx:258`), likely dead code.* |
| STUB (gated) | `components/task/TaskCompleteForm.tsx:473-474` | "Strava auto-import coming soon" — non-interactive note. `PREMIUM_INTEGRATIONS=false`. → **intentionally-gated** |
| STUB (gated) | `components/task/VerificationGates.tsx:47` | "Link Strava in Settings (coming soon)" gate status. → **intentionally-gated** |
| STUB (gated) | `components/task/bodies/TaskJournalBody.tsx:131` | a11y label "(coming soon)" on a journal affordance. → verify |
| STUB (gated) | `components/onboarding/v2/screens/GoalsScreen.tsx:9` | `TODO goals→pack mapping pending` — onboarding-v2, `ONBOARDING_V2=false`. → **intentionally-gated** |
| STUB (gated) | `components/create/CreateWizardV2.tsx:234-240` | `TODO(run-backend)` run-goal config dropped. → **intentionally-gated** (`RUN_GOAL_CONFIG=false`) |
| STUB (dead) | `components/home/StreakHeroV3.tsx:208,286` | lost/frozen/atRisk layouts "stubbed". *StreakHeroV3 is knip-flagged unused.* → debt-shelf |

- **MISSING handlers:** none found (no `onPress` referencing an undefined/out-of-scope function).
- **Verdict:** 1 true no-op button (in a likely-dead module). All "coming soon" stubs map to gated-off flags. Live interactive surface is clean.

## 2. Forms & inputs

31 files contain `TextInput` (auth, create-profile, edit-profile, onboarding, create-flow, task bodies, feed, settings). Coverage of the protective patterns:

- **`maxLength` caps present** on essentially every free-text field: title `TITLE_MAX` (`create/v2/StepBasics.tsx:75`), bio `150` (`edit-profile.tsx:148`, `ProfileSetup.tsx:236`), comments `200` (`post/[id].tsx:442`, `FeedPostCard.tsx:251`), report `500` (`ReportChallengeModal.tsx:102`).
- **Keyboard handling:** `KeyboardAvoidingView` / `Keyboard.dismiss` used in **24 files** including all auth screens, create-profile, create wizard, task complete, comments. Good coverage.
- **Validation + submit + failure path:** present on the auth screens (`login.tsx`, `signup.tsx`, `forgot-password.tsx`) and `create-profile.tsx` (validation + error surfacing via `useInlineError`/inline messages). Create-flow inputs validated in `StepBasics`.

### Proof caption (spec: 120-char hard cap + live counter)
| Surface | Cap | Live counter |
|---|---|---|
| `components/task/TaskCompleteCelebration.tsx:201,214` | `maxLength={120}` ✅ | `{postCaption.length} / 120` ✅ |
| `components/task/bodies/TaskPhotoBody.tsx:43,158` | `MAX_CAPTION=120` ✅ | **no visible counter** ⚠ |

→ The primary completion-celebration surface is compliant (cap + counter). `TaskPhotoBody` enforces the cap but renders **no live counter**. **Minor.**

## 3. Loading / error / empty states

Magnitude (rg across `app/` + `components/`):

| Signal | Count |
|---|---|
| `ActivityIndicator` / `Skeleton` (loading) | **218 refs** |
| `isError` handling | **30 refs across 15 files** |
| `EmptyState` / `ErrorState` components | **23 refs** |

**Loading: strong.** Dedicated skeletons (`components/skeletons/*`) + 218 indicator refs.

**Error: handled on the data-heavy screens** — `app/challenge/[id].tsx`, `app/profile/[username].tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/discover.tsx`, `app/post/[id].tsx`, `app/discover/category/[slug].tsx`, and the feed/leaderboard/notification components (`LiveFeedSection.tsx`, `LeaderboardTab.tsx`, `NotificationsTab.tsx`, `DiscoverForYouGrid.tsx`, `TrendingPostsSection.tsx`).

**Empty: handled** via `EmptyState` components (23 refs) on discover/profile/feed/leaderboard.

### States matrix (representative — key screens)
| Screen | Loading | Error | Empty |
|---|---|---|---|
| Home `app/(tabs)/index.tsx` | ✅ (children skeletons + RefreshControl) | ⚠ no screen-level `isError` branch — delegates to `LiveFeedSection` (which handles `isError`) | ✅ (zero-state gates) |
| Discover `app/(tabs)/discover.tsx` | ✅ | ✅ `isError` | ✅ |
| Activity `app/(tabs)/activity.tsx` | ✅ | ✅ (via `NotificationsTab`/`LeaderboardTab`/`LiveFeedSection`) | ✅ |
| Profile `app/(tabs)/profile.tsx` | ✅ | ✅ | ✅ |
| Challenge detail `app/challenge/[id].tsx` | ✅ | ✅ | ✅ |
| Post thread `app/post/[id].tsx` | ✅ | ✅ | ✅ |
| Paywall `app/paywall.tsx` | ✅ (loadingPlans) | → Phase 3 (offering fetch failure) | n/a |

- **Gap (verify):** Home's top-level `homeQuery` (`app/(tabs)/index.tsx:134,321`) has no explicit error branch at the screen level — if it errors, the screen relies on child components / a refetch-on-focus rather than showing a screen-level error. Low risk (feed handles its own error) but worth confirming the streak/stats area degrades gracefully. **Minor.**

## Counts (Phase 2)
| Metric | Count |
|---|---|
| Dead (no-op) buttons | **1** (`TaskEditorModal.tsx:1437`, likely-dead module) |
| Stub buttons | **0 on live paths** (all "coming soon" = gated-off flags; 1 in dead `StreakHeroV3`) |
| Missing handlers | **0** |
| Forms missing validation/failure-handling | **0 critical** (auth/create/profile all validated) |
| Proof-caption counter gap | **1** (`TaskPhotoBody`, cap-only) |
| Screens missing error state | **0 hard** (Home screen-level error branch = verify, Minor) |
| Screens missing empty state | **0** |
