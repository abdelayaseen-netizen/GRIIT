# Test Coverage – After Improvements

**Date:** 2025-03-05

## What was done

1. **Fixed all failing tests**
   - Set test env in `vitest.config.ts` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) so backend modules load without real Supabase.
   - Replaced `beforeEach` + `require("../../lib/push")` with `vi.mock("../../lib/push")` in accountability and nudges tests so the push module is mocked and the path resolves.

2. **Enabled coverage**
   - Added `@vitest/coverage-v8` and configured coverage in `vitest.config.ts` (v8, text + text-summary + html).
   - Added `npm run test:coverage` script.

3. **New unit tests**
   - `backend/lib/progression.test.ts` – 9 tests for `getTierForDays`, `getPointsToNextTier`, `getNextTierName`, `TIER_THRESHOLDS`.
   - `lib/trpc-errors.test.ts` – 3 tests for `TRPC_ERROR_CODE`, `TRPC_ERROR_TITLES`, `TRPC_ERROR_USER_MESSAGE`.

## Test results (after)

| Metric        | Before | After  |
|---------------|--------|--------|
| Test files    | 8 (5 pass, 3 fail) | **10 pass** |
| Tests         | 36 pass, 7 fail   | **65 pass** |
| Coverage      | Not run           | **~27% statements, ~73% branches, ~52% functions** |

### Coverage summary (v8)

- **Statements:** 26.66%
- **Branches:** 72.61%
- **Functions:** 51.85%
- **Lines:** 26.66%

Fully covered (100% stmts/lines where measured): `progression.ts`, `last-stand.ts`, `streak.ts`, `starter-seed.ts`, `formatTimeAgo.ts`, `trpc-errors.ts`, `app-router.ts`. Routes and `lib/api.ts` are partially covered; `lib/trpc.ts`, `lib/supabase.ts`, and app-only code are excluded or 0% (expected).

## How to run

```bash
npm run test           # run tests
npm run test:coverage  # run tests + coverage (output in terminal and coverage/index.html)
```

## Verdict

Tests are in good shape: all 65 pass, coverage runs, and critical pure logic (progression, streak, last-stand, formatError/formatTRPCError, trpc-errors, challenge helpers, accountability/nudges with mocks) is covered. Statement/line coverage is low because most of the codebase is tRPC handlers and app code that would need more route-level or E2E tests to cover meaningfully. For a small team or solo project, this is a solid baseline to build on.
