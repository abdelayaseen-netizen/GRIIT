# Dead Code Kill List — 2026-05-10

Cross-reference of `knip` (24 unused files, 6 unused deps) and `depcheck` (intersected on UI deps).
Single-tool flags hand-verified with `grep -rEn "from ['\"]<path>['\"]" --include='*.{ts,tsx}' --exclude-dir=node_modules`.

## Files (24, all knip-flagged + grep-confirmed 0 import sites)

| Path | Cross-checked refs | Action |
|---|---:|---|
| `components/home/ActiveChallenges.tsx` | 0 (only intra-dead-pile barrel) | DELETE |
| `components/home/ChallengeCard.tsx` | 0 (only intra-dead-pile) | DELETE |
| `components/home/DailyBonus.tsx` | 0 | DELETE |
| `components/home/DailyStatus.tsx` | 0 (only intra-dead-pile) | DELETE |
| `components/home/EmptyChallengesCard.tsx` | 0 (only intra-dead-pile) | DELETE |
| `components/home/ExploreChallengesButton.tsx` | 0 | DELETE |
| `components/home/StreakHero.tsx` | 0 (replaced by `StreakHeroV2`) | DELETE |
| `components/home/index.ts` | barrel for above | DELETE |
| `components/profile/AchievementsSection.tsx` | 0 | DELETE |
| `components/profile/CompletedChallengesSection.tsx` | 0 | DELETE |
| `components/profile/DisciplineCalendar.tsx` | 0 | DELETE |
| `components/profile/DisciplineGrowthCard.tsx` | 0 | DELETE |
| `components/profile/DisciplineScoreCard.tsx` | 0 | DELETE |
| `components/profile/LifetimeStatsCard.tsx` | 0 | DELETE |
| `components/profile/ProfileCompletionCard.tsx` | 0 | DELETE |
| `components/profile/ProfileHeader.tsx` | 0 | DELETE |
| `components/profile/ShareDisciplineCard.tsx` | 0 | DELETE |
| `components/profile/SocialStatsCard.tsx` | 0 | DELETE |
| `components/profile/TierProgressBar.tsx` | 0 | DELETE |
| `components/profile/index.ts` | barrel for above | DELETE |
| `components/ui/Card.tsx` | 0 (other `*Card` imports are different files) | DELETE |
| `hooks/useDebounce.ts` | 0 | DELETE |
| `hooks/useJournalSubmit.ts` | 0 | DELETE |
| `styles/discover-styles.ts` | 0 | DELETE (and remove empty `styles/` dir) |

## Dependencies (6, knip + depcheck + grep-confirmed)

| Package | Why unused | Action |
|---|---|---|
| `@trpc/client` | App uses hand-rolled tRPC client in `lib/trpc.ts` (fetch + superjson) | REMOVE |
| `expo-blur` | No JS imports anywhere | REMOVE |
| `expo-camera` | No JS imports; proof flow uses `expo-image-picker` (its own camera UI) | REMOVE |
| `expo-symbols` | No JS imports; using `lucide-react-native` icons | REMOVE |
| `expo-status-bar` | No JS imports; using inline `StatusBar` from `react-native` | REMOVE |
| `react-native-purchases-ui` | No JS imports; paywall uses custom `app/paywall.tsx` not RC's UI | REMOVE |

## DevDependencies (2, depcheck-only but verified)

| Package | Why unused | Action |
|---|---|---|
| `@expo/ngrok` | No script references; `expo start --tunnel` handles ngrok itself | REMOVE |
| `concurrently` | No script in `package.json` references it | REMOVE |

## Missing dependencies (added in this phase)

| Package | Why added | Action |
|---|---|---|
| `pino` | Imported by `backend/lib/logger.ts`; broke 5 test files | ADDED `^9.14` |
| `expo-server-sdk` | Imported by `backend/lib/sendPush.ts`; broke 2 test files | ADDED `^3` |

## Duplicate exports (4, knip-flagged)

| File | Export pair | Action |
|---|---|---|
| `backend/lib/logger.ts` | `logger` + `default` (same value) | DROP `default` (no consumers) |
| `lib/analytics.ts` | `reset` + `resetAnalytics` (alias) | DROP unused alias |
| `lib/notifications.ts` | `registerForPushNotificationsAsync` + `registerForPushNotifications` | DROP unused alias |
| `lib/sentry.ts` | `initialiseSentry` + `initSentry` (alias) | DROP unused alias |

## Single-tool flags deferred (high false-positive risk)

- `expo-updates` (knip "unlisted" warning) — listed in `app.json` plugins implicitly via Expo SDK; KEEP
- `expo-web-browser` (depcheck) — used as Expo config plugin for OAuth (`app.json`); KEEP
- `expo-system-ui`, `expo-dev-client` (depcheck) — Expo SDK auto-loaded; KEEP
- 125 unused exports + 103 unused types — most are public API surface (e.g. `types/index.ts`) intentionally exposed. Kept; re-evaluate post-sprint.
