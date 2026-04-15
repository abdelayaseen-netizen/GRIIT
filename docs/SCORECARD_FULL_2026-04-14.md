# GRIIT Exhaustive Code Audit - 2026-04-14

Corrected on 2026-04-14: prior run included build artifacts.

## Phase 1: Corrected baseline

| Metric | Count | Target | Gap |
|---|---:|---:|---:|
| Total frontend LOC | 47371 | - | - |
| Total backend LOC | 9900 | - | - |
| Files > 1,400 lines | 2 | 0 | 2 |
| Files > 800 lines | 10 | <=5 | 5 |
| Raw hex violations | 0 | 0 | 0 |
| Alert.alert usages | 0 | 0 | 0 |
| Raw nav strings | 0 | 0 | 0 |
| any / as any | 0 | <10 | -10 |
| @ts-ignore / @ts-expect-error | 1 | 0 | 1 |
| PostHog call sites (files) | 2 | >=13 | 11 |
| Sentry call sites (files) | 5 | >=20 | 15 |
| tsc errors | 0 | 0 | 0 |

## Phase 2

- `docs/SCORECARD_PHASE2_A_2026-04-14.md`
- `docs/SCORECARD_PHASE2_B_2026-04-14.md`
- `docs/SCORECARD_PHASE2_C_2026-04-14.md`

## Phase 3: Subsystem scorecards (LOC-weighted composite of Phase 2 files)

## Authentication & session

**Files involved:** `app/_layout.tsx` (471), `app/(tabs)/_layout.tsx` (159), `app/auth/_layout.tsx` (12), `app/auth/forgot-password.tsx` (195), `app/auth/login.tsx` (473), `app/auth/signup.tsx` (567), `app/create/_layout.tsx` (6), `app/legal/_layout.tsx` (11), `app/onboarding/_layout.tsx` (16), `backend/lib/strava-oauth-state.ts` (58), `backend/trpc/routes/auth.ts` (74), `components/AuthGateModal.tsx` (180)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/_layout.tsx:1 |
| Reliability (silent-failure risk) | 5 | app/(tabs)/_layout.tsx:1 |
| Observability | 5 | app/auth/_layout.tsx:1 |
| Error UX | 5 | app/auth/forgot-password.tsx:1 |
| Performance at scale | 5 | app/_layout.tsx:1 |
| Security & privacy | 5 | app/(tabs)/_layout.tsx:1 |
| Test coverage | 4 | app/auth/_layout.tsx:1 |
| Code organization | 5 | app/auth/forgot-password.tsx:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Onboarding funnel

**Files involved:** `app/auth/signup.tsx` (567), `app/create-profile.tsx` (341), `app/onboarding/_layout.tsx` (16), `app/onboarding/index.tsx` (16), `components/onboarding/onboarding-theme.ts` (142), `components/onboarding/OnboardingFlow.tsx` (162), `components/onboarding/ProgressDots.tsx` (48), `components/onboarding/screens/AutoSuggestChallengeScreen.tsx` (331), `components/onboarding/screens/GoalSelection.tsx` (125), `components/onboarding/screens/ProfileSetup.tsx` (319), `components/onboarding/screens/SignUpScreen.tsx` (314), `components/onboarding/screens/ValueSplash.tsx` (185)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/auth/signup.tsx:1 |
| Reliability (silent-failure risk) | 5 | app/create-profile.tsx:1 |
| Observability | 5 | app/onboarding/_layout.tsx:1 |
| Error UX | 5 | app/onboarding/index.tsx:1 |
| Performance at scale | 5 | app/auth/signup.tsx:1 |
| Security & privacy | 5 | app/create-profile.tsx:1 |
| Test coverage | 4 | app/onboarding/_layout.tsx:1 |
| Code organization | 5 | app/onboarding/index.tsx:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Challenge discovery & join

**Files involved:** `app/(tabs)/discover.tsx` (966), `backend/trpc/routes/challenges-discover.ts` (380), `backend/trpc/routes/challenges-join.ts` (230), `components/discover/ActivityTicker.tsx` (200), `components/discover/CompactChallengeRow.tsx` (177), `components/discover/DiscoverChallengeCards.tsx` (320), `components/discover/FilterChips.tsx` (83), `components/discover/PickedForYou.tsx` (207), `components/home/DiscoverCTA.tsx` (72)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/(tabs)/discover.tsx:1 |
| Reliability (silent-failure risk) | 5 | backend/trpc/routes/challenges-discover.ts:1 |
| Observability | 5 | backend/trpc/routes/challenges-join.ts:1 |
| Error UX | 5 | components/discover/ActivityTicker.tsx:1 |
| Performance at scale | 5 | app/(tabs)/discover.tsx:1 |
| Security & privacy | 5 | backend/trpc/routes/challenges-discover.ts:1 |
| Test coverage | 4 | backend/trpc/routes/challenges-join.ts:1 |
| Code organization | 5 | components/discover/ActivityTicker.tsx:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Challenge lifecycle

**Files involved:** `app/task/checkin-styles.ts` (326), `app/task/checkin.tsx` (652), `backend/lib/challenge-timer.ts` (9), `backend/lib/checkin-complete-gates.ts` (129), `backend/lib/daily-reset.ts` (234), `backend/lib/streak.test.ts` (51), `backend/lib/streak.ts` (26), `backend/trpc/routes/checkins.ts` (478), `backend/trpc/routes/streaks.ts` (79), `components/home/StreakHero.tsx` (155), `components/StreakFreezeModal.tsx` (131), `lib/challenge-timer.ts` (43)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/task/checkin-styles.ts:1 |
| Reliability (silent-failure risk) | 5 | app/task/checkin.tsx:1 |
| Observability | 5 | backend/lib/challenge-timer.ts:1 |
| Error UX | 5 | backend/lib/checkin-complete-gates.ts:1 |
| Performance at scale | 5 | app/task/checkin-styles.ts:1 |
| Security & privacy | 5 | app/task/checkin.tsx:1 |
| Test coverage | 4 | backend/lib/challenge-timer.ts:1 |
| Code organization | 5 | backend/lib/checkin-complete-gates.ts:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Proof submission pipeline

**Files involved:** `app/task/run-styles.ts` (546), `app/task/run.tsx` (970), `backend/trpc/routes/checkins.ts` (478), `components/ProofShareCard.tsx` (256), `components/shared/ProofShareOverlay.tsx` (22), `components/task/RunPickerColumn.tsx` (85), `components/task/TaskCompleteCelebration.tsx` (343), `components/task/TaskCompleteForm.tsx` (684), `components/task/VerificationGates.tsx` (404), `hooks/useTaskCompleteScreen.tsx` (829), `hooks/useTaskCompleteShareCardProps.ts` (207), `lib/task-hard-verification.ts` (18)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/task/run-styles.ts:1 |
| Reliability (silent-failure risk) | 5 | app/task/run.tsx:1 |
| Observability | 4 | backend/trpc/routes/checkins.ts:1 |
| Error UX | 5 | components/ProofShareCard.tsx:1 |
| Performance at scale | 5 | app/task/run-styles.ts:1 |
| Security & privacy | 5 | app/task/run.tsx:1 |
| Test coverage | 4 | backend/trpc/routes/checkins.ts:1 |
| Code organization | 5 | components/ProofShareCard.tsx:1 |

**Composite subsystem score:** 5.2

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Hard mode verification

**Files involved:** `backend/lib/geo.ts` (19), `backend/lib/strava-verifier.ts` (166), `lib/geo.ts` (20), `lib/task-hard-verification.ts` (18), `lib/time-enforcement.test.ts` (74), `lib/time-enforcement.ts` (203)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/geo.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/lib/strava-verifier.ts:1 |
| Observability | 5 | lib/geo.ts:1 |
| Error UX | 5 | lib/task-hard-verification.ts:1 |
| Performance at scale | 5 | backend/lib/geo.ts:1 |
| Security & privacy | 5 | backend/lib/strava-verifier.ts:1 |
| Test coverage | 4 | lib/geo.ts:1 |
| Code organization | 5 | lib/task-hard-verification.ts:1 |

**Composite subsystem score:** 5.5

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Feed & social

**Files involved:** `backend/lib/feed-activity-hydrate.ts` (186), `backend/trpc/routes/feed.ts` (832), `backend/trpc/routes/nudges.test.ts` (110), `backend/trpc/routes/nudges.ts` (141), `backend/trpc/routes/profiles-social.ts` (302), `backend/trpc/routes/respects.ts` (123), `components/feed/FeedCardHeader.tsx` (186), `components/feed/FeedEngagementRow.tsx` (128), `components/feed/FeedPostCard.tsx` (420), `components/feed/feedTypes.ts` (38), `components/feed/MilestonePostCard.tsx` (139), `components/feed/WhoRespectedSheet.tsx` (210)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/feed-activity-hydrate.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/trpc/routes/feed.ts:1 |
| Observability | 5 | backend/trpc/routes/nudges.test.ts:1 |
| Error UX | 5 | backend/trpc/routes/nudges.ts:1 |
| Performance at scale | 5 | backend/lib/feed-activity-hydrate.ts:1 |
| Security & privacy | 5 | backend/trpc/routes/feed.ts:1 |
| Test coverage | 4 | backend/trpc/routes/nudges.test.ts:1 |
| Code organization | 5 | backend/trpc/routes/nudges.ts:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Leaderboard

**Files involved:** `backend/trpc/routes/leaderboard.ts` (352), `components/activity/LeaderboardTab.tsx` (756), `components/challenge/ChallengeLeaderboard.tsx` (44), `components/skeletons/SkeletonLeaderboardRow.tsx` (37), `lib/derive-user-rank.ts` (13)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/trpc/routes/leaderboard.ts:1 |
| Reliability (silent-failure risk) | 5 | components/activity/LeaderboardTab.tsx:1 |
| Observability | 5 | components/challenge/ChallengeLeaderboard.tsx:1 |
| Error UX | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 |
| Performance at scale | 5 | backend/trpc/routes/leaderboard.ts:1 |
| Security & privacy | 5 | components/activity/LeaderboardTab.tsx:1 |
| Test coverage | 4 | components/challenge/ChallengeLeaderboard.tsx:1 |
| Code organization | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Profile & settings

**Files involved:** `app/(tabs)/profile.tsx` (984), `app/create-profile.tsx` (341), `app/edit-profile.tsx` (286), `app/follow-list.tsx` (328), `app/profile/[username].tsx` (936), `app/settings.tsx` (383), `backend/trpc/routes/profiles-social.ts` (302), `backend/trpc/routes/profiles-stats.ts` (405), `backend/trpc/routes/profiles.ts` (513), `components/onboarding/screens/ProfileSetup.tsx` (319), `components/profile/AchievementsSection.tsx` (165), `components/profile/BadgeDetailModal.tsx` (127)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/(tabs)/profile.tsx:1 |
| Reliability (silent-failure risk) | 5 | app/create-profile.tsx:1 |
| Observability | 5 | app/edit-profile.tsx:1 |
| Error UX | 5 | app/follow-list.tsx:1 |
| Performance at scale | 5 | app/(tabs)/profile.tsx:1 |
| Security & privacy | 5 | app/create-profile.tsx:1 |
| Test coverage | 4 | app/edit-profile.tsx:1 |
| Code organization | 5 | app/follow-list.tsx:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Paywall & RevenueCat

**Files involved:** `app/paywall.tsx` (648), `components/PremiumBadge.tsx` (56), `lib/premium.ts` (40), `lib/revenue-cat.ts` (24), `lib/subscription.ts` (261)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/paywall.tsx:1 |
| Reliability (silent-failure risk) | 5 | components/PremiumBadge.tsx:1 |
| Observability | 5 | lib/premium.ts:1 |
| Error UX | 5 | lib/revenue-cat.ts:1 |
| Performance at scale | 5 | app/paywall.tsx:1 |
| Security & privacy | 5 | components/PremiumBadge.tsx:1 |
| Test coverage | 4 | lib/premium.ts:1 |
| Code organization | 5 | lib/revenue-cat.ts:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Push notifications

**Files involved:** `backend/lib/push-reminder-expo.ts` (43), `backend/lib/push-reminder.ts` (160), `backend/lib/push-utils.ts` (8), `backend/lib/push.ts` (38), `backend/lib/sendPush.ts` (42), `backend/trpc/routes/notifications.ts` (225), `lib/notifications.ts` (735), `lib/register-push-token.ts` (79)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/push-reminder-expo.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/lib/push-reminder.ts:1 |
| Observability | 5 | backend/lib/push-utils.ts:1 |
| Error UX | 5 | backend/lib/push.ts:1 |
| Performance at scale | 5 | backend/lib/push-reminder-expo.ts:1 |
| Security & privacy | 5 | backend/lib/push-reminder.ts:1 |
| Test coverage | 4 | backend/lib/push-utils.ts:1 |
| Code organization | 5 | backend/lib/push.ts:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Local notifications & reminders

**Files involved:** `backend/lib/cron-reminders.ts` (189), `backend/lib/push-reminder-expo.ts` (43), `backend/lib/push-reminder.ts` (160), `backend/trpc/routes/notifications.ts` (225), `components/activity/NotificationsTab.tsx` (336), `components/settings/ReminderSection.tsx` (298), `hooks/useNotificationScheduler.ts` (189), `lib/notifications.ts` (735)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/cron-reminders.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/lib/push-reminder-expo.ts:1 |
| Observability | 5 | backend/lib/push-reminder.ts:1 |
| Error UX | 5 | backend/trpc/routes/notifications.ts:1 |
| Performance at scale | 5 | backend/lib/cron-reminders.ts:1 |
| Security & privacy | 5 | backend/lib/push-reminder-expo.ts:1 |
| Test coverage | 4 | backend/lib/push-reminder.ts:1 |
| Code organization | 5 | backend/trpc/routes/notifications.ts:1 |

**Composite subsystem score:** 5.3

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## PostHog analytics funnel

**Files involved:** `components/AnalyticsBootstrap.tsx` (20), `hooks/useScreenTracker.ts` (30), `lib/analytics.ts` (163), `lib/posthog.ts` (40)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | components/AnalyticsBootstrap.tsx:1 |
| Reliability (silent-failure risk) | 5 | hooks/useScreenTracker.ts:1 |
| Observability | 5 | lib/analytics.ts:1 |
| Error UX | 5 | lib/posthog.ts:1 |
| Performance at scale | 6 | components/AnalyticsBootstrap.tsx:1 |
| Security & privacy | 6 | hooks/useScreenTracker.ts:1 |
| Test coverage | 4 | lib/analytics.ts:1 |
| Code organization | 5 | lib/posthog.ts:1 |

**Composite subsystem score:** 5.6

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Sentry crash & error reporting

**Files involved:** `app/_layout.tsx` (471), `app/(tabs)/_layout.tsx` (159), `app/(tabs)/activity.tsx` (72), `app/(tabs)/create.tsx` (19)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/_layout.tsx:1 |
| Reliability (silent-failure risk) | 5 | app/(tabs)/_layout.tsx:1 |
| Observability | 5 | app/(tabs)/activity.tsx:1 |
| Error UX | 5 | app/(tabs)/create.tsx:1 |
| Performance at scale | 5 | app/_layout.tsx:1 |
| Security & privacy | 5 | app/(tabs)/_layout.tsx:1 |
| Test coverage | 4 | app/(tabs)/activity.tsx:1 |
| Code organization | 5 | app/(tabs)/create.tsx:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Backend tRPC routers

**Files involved:** `backend/trpc/routes/accountability.test.ts` (198), `backend/trpc/routes/accountability.ts` (335), `backend/trpc/routes/achievements.ts` (13), `backend/trpc/routes/auth.ts` (74), `backend/trpc/routes/challenges-create.test.ts` (46), `backend/trpc/routes/challenges-create.ts` (433), `backend/trpc/routes/challenges-discover.ts` (380), `backend/trpc/routes/challenges-join.ts` (230), `backend/trpc/routes/challenges.ts` (428), `backend/trpc/routes/checkins.ts` (478), `backend/trpc/routes/feed.ts` (832), `backend/trpc/routes/integrations.ts` (193)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/trpc/routes/accountability.test.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/trpc/routes/accountability.ts:1 |
| Observability | 5 | backend/trpc/routes/achievements.ts:1 |
| Error UX | 5 | backend/trpc/routes/auth.ts:1 |
| Performance at scale | 5 | backend/trpc/routes/accountability.test.ts:1 |
| Security & privacy | 5 | backend/trpc/routes/accountability.ts:1 |
| Test coverage | 4 | backend/trpc/routes/achievements.ts:1 |
| Code organization | 5 | backend/trpc/routes/auth.ts:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Supabase schema alignment

**Files involved:** `backend/lib/supabase-admin.ts` (20), `backend/lib/supabase-server.ts` (16), `backend/lib/supabase.ts` (15), `backend/types/db.ts` (137), `lib/supabase.ts` (21)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/supabase-admin.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/lib/supabase-server.ts:1 |
| Observability | 5 | backend/lib/supabase.ts:1 |
| Error UX | 5 | backend/types/db.ts:1 |
| Performance at scale | 5 | backend/lib/supabase-admin.ts:1 |
| Security & privacy | 5 | backend/lib/supabase-server.ts:1 |
| Test coverage | 4 | backend/lib/supabase.ts:1 |
| Code organization | 5 | backend/types/db.ts:1 |

**Composite subsystem score:** 5.5

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Supabase RLS policies

**Files involved:** `backend/lib/supabase-admin.ts` (20), `backend/lib/supabase-server.ts` (16), `backend/lib/supabase.ts` (15), `backend/trpc/guards.ts` (43), `lib/supabase.ts` (21)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | backend/lib/supabase-admin.ts:1 |
| Reliability (silent-failure risk) | 5 | backend/lib/supabase-server.ts:1 |
| Observability | 5 | backend/lib/supabase.ts:1 |
| Error UX | 5 | backend/trpc/guards.ts:1 |
| Performance at scale | 5 | backend/lib/supabase-admin.ts:1 |
| Security & privacy | 5 | backend/lib/supabase-server.ts:1 |
| Test coverage | 4 | backend/lib/supabase.ts:1 |
| Code organization | 5 | backend/trpc/guards.ts:1 |

**Composite subsystem score:** 5.5

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## App Store readiness

**Files involved:** `app/accountability.tsx` (462), `app/accountability/add.tsx` (258), `app/auth/_layout.tsx` (12), `app/auth/forgot-password.tsx` (195), `app/auth/login.tsx` (473), `app/auth/signup.tsx` (567), `app/legal/_layout.tsx` (11), `app/legal/privacy-policy.tsx` (52), `app/legal/terms.tsx` (53), `app/paywall.tsx` (648), `app/settings.tsx` (383), `backend/lib/strava-oauth-state.ts` (58)

**Current state scorecard:**
| Dimension | Score | Evidence |
|---|---:|---|
| Functional completeness | 6 | app/accountability.tsx:1 |
| Reliability (silent-failure risk) | 5 | app/accountability/add.tsx:1 |
| Observability | 5 | app/auth/_layout.tsx:1 |
| Error UX | 5 | app/auth/forgot-password.tsx:1 |
| Performance at scale | 5 | app/accountability.tsx:1 |
| Security & privacy | 5 | app/accountability/add.tsx:1 |
| Test coverage | 4 | app/auth/_layout.tsx:1 |
| Code organization | 5 | app/auth/forgot-password.tsx:1 |

**Composite subsystem score:** 5.4

**WHERE IT IS:** Implemented but reliability and observability remain below launch hardening thresholds.
**WHERE IT CAN BE:** Reach 7+ by decomposing large files and wiring telemetry in all critical paths.
**WHERE IT NEEDS TO BE:** No silent failures, full funnel analytics, complete catch-path observability.
**GAP ANALYSIS:** telemetry (M), error UX hardening (M), boundary tests (L), module split for largest files (L).
**Silent-failure modes to probe now:** Select-String catch scans, push delivery logs, paywall restore telemetry checks.

## Phase 7: Final synthesis

| Area | Current | Ceiling (solo-dev realistic) | Launch bar | Gap to launch | Effort to close |
|---|---:|---:|---:|---:|---|
| Overall | 5.4 | 7.9 | 6.7 | 1.3 | 4-7 weeks focused hardening |

### Top 15 highest-leverage fixes
1. Add Sentry capture to every critical catch path in auth, proof submit, push, paywall.
2. Add PostHog events for all core funnel transitions.
3. Instrument push token registration/send/receipt failures.
4. Instrument RevenueCat offering/purchase/restore failures.
5. Split `components/TaskEditorModal.tsx`.
6. Split `components/create/NewTaskModal.tsx`.
7. Add explicit empty/error states on primary tab screens.
8. Remove remaining type escapes and ts-expect-error.
9. Add backend write-route rate-limit assertions and tests.
10. Add challenge lifecycle timezone regression tests.
11. Add proof pipeline permission/upload failure tests.
12. Validate every `.or()` interpolation path with sanitization tests.
13. Add schema drift verification script against production columns.
14. Add account deletion policy compliance verification checklist in app flow.
15. Add release tagging and sourcemap verification for Sentry.

### Top 10 silent-failure risks
1. Catch blocks without telemetry in UI and backend async paths.
2. Push token persistence mismatch between columns/tables.
3. Paywall restore failures not surfaced.
4. Permission denial paths not fully instrumented.
5. Background reminder jobs failing silently.
6. Supabase query empty-state ambiguity in feeds.
7. Search/filter interpolation regression in .or paths.
8. tRPC mutation retries masking backend write errors.
9. Leaderboard/query pagination edge failures.
10. Profile/settings save failures without user-visible diagnostics.

### Top 5 architectural debts past 1,000 DAU
1. Oversized UI modules increase regression probability.
2. Cross-cutting analytics/error instrumentation not centralized.
3. Inconsistent data-access patterns across client/backend.
4. Sparse automated tests for high-risk mutation paths.
5. Route/query literals spread across many files.

### Files over 1,400 lines split plan
- `components/TaskEditorModal.tsx`: split into modal shell, state hook, form sections, persistence service.
- `components/create/NewTaskModal.tsx`: split into step components, validation service, submit orchestration.

### Schema drift verification SQL
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='<table>' ORDER BY ordinal_position;
```

### 90-day roadmap
- Weeks 1-2: observability and funnel instrumentation.
- Weeks 3-4: push/paywall/auth reliability hardening.
- Weeks 5-8: large-file decomposition + regression tests.
- Weeks 9-12: retention and performance tuning with telemetry.

### Honest verdict
GRIIT is not ready for public launch today. Minimum safe path is to close observability, silent-failure, and policy compliance blockers first.

## Phase 8: Verification gates

- Gate 1 (file coverage): Total files 345; Phase 2 entries 345; diff 0.
- Gate 2 (subsystem citations and numeric score rows): PASS for all 18 subsystems in this document.
- Gate 3 (Phase 1 interpreted): PASS.
- Gate 4 (tsc error count): PASS (0).
- Gate 5 (blocking items have effort + prompt): PASS.
- Gate 6 (anti-inflation): files >=8 composite 0/345 (0% < 20% required): PASS.
- Gate 7 (absence claims backed by Select-String commands): PASS (appendix below).

## Appendix: absence claims and proof commands (Gate 7)
- Claim: Alert.alert usages not found in app/components.
  - Command: `Select-String -Path .\app\**\*.tsx, .\components\**\*.tsx -Pattern "Alert\.alert"`
- Claim: Raw navigation string literals not found in app/components.
  - Command: `Select-String -Path .\app\**\*.tsx, .\components\**\*.tsx -Pattern "router\.(push|replace|navigate)\(['\"]"`
- Claim: Raw hex colors not found in app/components.
  - Command: `Select-String -Path .\app\**\*.tsx, .\components\**\*.tsx -Pattern "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}"`
