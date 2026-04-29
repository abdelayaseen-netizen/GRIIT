# Dead code and dependency follow-up (Phase 7)

Generated from automated scans. **No code was deleted in this phase.**

## Unused exports (ts-prune)

`ts-prune` reported **363** non-empty output lines. Sample rows (file → export; “In src?” is always **No** — this repo has no `src/` tree):

| File | Export | In src? |
| --- | --- | --- |
| `vitest.config.ts` | `default` | No |
| `app/_layout.tsx` | `default` | No |
| `contexts/ApiContext.tsx` | `useApi` | No |
| `hooks/useJournalSubmit.ts` | `submitJournalEntry` | No |
| `lib/api.ts` | `fetchWithTimeout` | No |
| `lib/avatar.ts` | `AVATAR_COLORS` | No |
| `lib/challenge-timer.ts` | `formatTimeRemaining` | No |
| `lib/deep-links.ts` | `getRefFromUrl` | No |
| `lib/posthog.ts` | `isPostHogEnabled` | No |
| `lib/sentry.ts` | `initSentry` | No |

> Full machine-readable list: run `npx ts-prune` locally (or inspect the phase run’s `ts-prune-report.txt` if retained).

## Remaining `Alert.alert` calls

`Select-String` for `Alert.alert` under `app/**/*.tsx` and `components/**/*.tsx`: **no matches** in this snapshot.

| File:Line | Current code |
| --- | --- |
| — | (none found) |

## `console.log` / `console.info` in `app` + `components`**

`Select-String` for `console.(log\|info)` in those trees: **no matches** in this snapshot (other paths e.g. `lib/` may still log in `__DEV__`).

## depcheck unused / missing

**Unused dependencies** (treat with care — some are used at runtime in ways `depcheck` does not see):

| Package | Confidence (high/medium) | Notes |
| --- | --- | --- |
| @hono/node-server | medium | May be used by `backend/server.ts` or deploy |
| @hono/trpc-server | medium | tRPC on Hono |
| @trpc/client | high | Client imports may be indirect |
| @upstash/ratelimit | high | Server-side only |
| @upstash/redis | high | Server-side only |
| dotenv | high | `backend` / scripts |
| expo-blur, expo-camera, expo-dev-client, expo-status-bar, expo-symbols, expo-system-ui, expo-web-browser | medium | Often used; verify before removal |
| hono | high | API server |
| react-native-purchases-ui | medium | Paywall / RevenueCat UI |
| zod | high | Widespread; likely false positive |

**Unused devDependencies:** `@babel/core`, `@expo/ngrok`, `@vitest/coverage-v8`, `concurrently` (review before removal).

**Missing dependencies:** `@react-navigation/native` reported in `components/home/DailyQuote.tsx` — may be a transitive dep; verify if lint/types complain.

---

*Phase 7 commit — report only, no deletions.*
