# Deep Clean Baseline — 2026-05-10

Captured at start of `cleanup/2026-05-deep-clean` (commit `e794ff1`).

## Static checks

| Metric | Value | Notes |
|---|---:|---|
| `npx tsc --noEmit` errors | 0 | Clean |
| `npm run lint` errors | 1 | `react/no-unescaped-entities` in `components/home/StreakHeroV2.tsx:251` |
| `npm run lint` warnings | 1 | `react-hooks/exhaustive-deps` in `app/(tabs)/index.tsx:656` |
| `npm test` files | 14 (6 fail / 8 pass) | 5 failures stem from missing `pino` dep |
| `npm test` tests | 64 (1 fail / 53 pass / 10 skip) | Failing test = `tests/design-system-contrast.test.ts` (WCAG) |

## Repo shape

| Metric | Value |
|---|---:|
| Total `.ts`/`.tsx` files (excl. node_modules/dist/coverage/.expo) | 385 |
| Production LOC (`app components lib hooks store contexts backend`) | 65,805 |
| `dependencies` count | 64 |
| `devDependencies` count | 12 |
| Repo size (excl. node_modules / .git / dist / .expo / ios/Pods / android/build) | 11.6 MB |

## Hard-rule grep counts

| Rule | Count | Status |
|---|---:|---|
| `Alert.alert` in production | 0 | OK |
| Raw hex `#xxxxxx` outside `lib/design-system.ts` | 6 | violation |
| `console.log/warn/error` in production | 41 | violation |
| `: any` / `as any` / `<any>` in production | 0 | OK |
| Empty `catch (e) {}` | 0 | OK |

## God files (`>500 LOC` in `app/components/lib/hooks/contexts/store/backend`)

27 files. Top 10:

| LOC | Path |
|---:|---|
| 1882 | `components/create/NewTaskModal.tsx` |
| 1746 | `components/TaskEditorModal.tsx` |
| 1606 | `app/challenge/[id].tsx` |
| 1358 | `lib/design-system.ts` |
| 1166 | `components/challenge/challengeDetailScreenStyles.ts` |
| 1056 | `app/(tabs)/index.tsx` |
| 1030 | `app/task/run.tsx` |
| 983 | `app/(tabs)/profile.tsx` |
| 955 | `backend/trpc/routes/feed.ts` |
| 935 | `app/profile/[username].tsx` |

## Phase-1 deletion targets (per task description)

Every file the task lists for deletion is **already absent** — confirmed by `[ -e ]` check on all 23:

```
ABSENT: Open GRIT App.url
ABSENT: Open GRIT in browser.bat
ABSENT: Start and open GRIT app.bat
ABSENT: griit-code.tar.gz
ABSENT: Procfile
ABSENT: preview-app.html
ABSENT: preview-ui.html
ABSENT: cursorrules
ABSENT: .cursorrules
ABSENT: 20250228000000_accountability_pairs.sql
ABSENT: web-fallback
ABSENT: web-fallback-deploy
ABSENT: src
ABSENT: APP_BREAKDOWN.md
ABSENT: BUTTON_AUDIT.md
ABSENT: CLICKABLE_MAP.md
ABSENT: DEEP-CLEAN-SCORECARD.md
ABSENT: GRIIT_App_Health_Scorecard_Report.md
ABSENT: GRIIT_Auth_Onboarding_Audit_Report.md
ABSENT: GRIIT_Full_Stack_Scorecard_Report.md
ABSENT: GRIIT_PrePush_QA_Report.md
ABSENT: IMPLEMENTATION_REPORT.md
```

Prior PRs (`chore/repo-hygiene-cleanup`, `chore/cleanup-prepush`) already executed Phase 1.
Repo root contains exactly 3 `.md` files (`CHANGELOG.md`, `README.md`, `SETUP.md`) — meets the ≤3 target.
No `src/` directory — top-level layout is the canonical Expo layout already.

**Phase 1 is therefore a no-op** in this sprint. Proceeding to Phase 2 without Gate A approval (nothing to approve).

## Sprint plan deviations from the prompt

1. **Phase 1**: skipped — already complete.
2. **Phase 2 addition**: `pino` is imported in `backend/lib/logger.ts` but missing from `package.json`. This is breaking 5 of 6 failing test files. Adding `pino` as a real dependency is in-scope (it's the prescribed backend logger).
3. **Knip/ts-prune/depcheck** dev-deps will be removed at end of sprint per task §3.1.
