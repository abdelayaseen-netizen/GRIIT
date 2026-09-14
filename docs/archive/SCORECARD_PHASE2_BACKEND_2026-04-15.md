# GRIIT Phase 2 Backend File Scorecard (2026-04-15)

### `backend/hono.ts` - 181 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'hono'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/hono.ts:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/hono.ts:72 |
| Loading / empty / error UI states | 5 | backend/hono.ts:27 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/hono.ts:1-181 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/hono.ts:30 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/hono.ts:1-181 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'hono' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/hono.ts:9 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/hono.ts:72; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/achievement-definitions.ts` - 52 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'achievement-definitions'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/achievement-definitions.ts:35 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/achievement-definitions.ts:1-52 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/achievement-definitions.ts:1-52 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'achievement-definitions' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/achievements.ts` - 138 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'achievements'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/achievements.ts:31 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/achievements.ts:1-138 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/achievements.ts:13 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/achievements.ts:1-138 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'achievements' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/achievements.ts:1 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/cache.ts` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'cache'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/cache.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/cache.ts:27 |
| Loading / empty / error UI states | 5 | backend/lib/cache.ts:28 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/cache.ts:1-46 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/cache.ts:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'cache' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/cache.ts:11 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/cache.ts:27; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/challenge-tasks.ts` - 373 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenge-tasks'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/challenge-tasks.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/challenge-tasks.ts:1-373 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/challenge-tasks.ts:1-373 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenge-tasks' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/challenge-timer.ts` - 8 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenge-timer'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/challenge-timer.ts:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/challenge-timer.ts:1-8 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/challenge-timer.ts:1-8 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenge-timer' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/checkin-complete-gates.ts` - 120 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'checkin-complete-gates'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/checkin-complete-gates.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/checkin-complete-gates.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/checkin-complete-gates.ts:1-120 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/checkin-complete-gates.ts:1-120 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'checkin-complete-gates' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/content-moderation.ts` - 208 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'content-moderation'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/content-moderation.ts:101 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/content-moderation.ts:1-208 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/content-moderation.ts:1-208 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'content-moderation' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/cron-reminders.ts` - 192 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'cron-reminders'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/cron-reminders.ts:43 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/cron-reminders.ts:110 |
| Loading / empty / error UI states | 5 | backend/lib/cron-reminders.ts:33 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/cron-reminders.ts:1-192 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/cron-reminders.ts:39 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/cron-reminders.ts:1-192 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'cron-reminders' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/cron-reminders.ts:6 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/cron-reminders.ts:110; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/daily-challenge-generator.ts` - 88 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'daily-challenge-generator'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/daily-challenge-generator.ts:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/daily-challenge-generator.ts:18 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/daily-challenge-generator.ts:1-88 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/daily-challenge-generator.ts:36 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/daily-challenge-generator.ts:1-88 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'daily-challenge-generator' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/daily-challenge-generator.ts:7 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/daily-challenge-templates.ts` - 194 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'daily-challenge-templates'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/daily-challenge-templates.ts:137 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/daily-challenge-templates.ts:1-194 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/daily-challenge-templates.ts:1-194 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'daily-challenge-templates' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/daily-reset.ts` - 198 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'daily-reset'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/daily-reset.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/daily-reset.ts:220 |
| Loading / empty / error UI states | 5 | backend/lib/daily-reset.ts:22 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/daily-reset.ts:1-198 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/daily-reset.ts:33 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/daily-reset.ts:1-198 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'daily-reset' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/daily-reset.ts:1 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/daily-reset.ts:220; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/date-utils.ts` - 132 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'date-utils'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/date-utils.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/date-utils.ts:11 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/date-utils.ts:1-132 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/date-utils.ts:60 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/date-utils.ts:1-132 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'date-utils' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/date-utils.ts:5 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/error-reporting.ts` - 27 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'error-reporting'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/error-reporting.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/error-reporting.ts:27 |
| Loading / empty / error UI states | 5 | backend/lib/error-reporting.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/error-reporting.ts:1-27 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/error-reporting.ts:1-27 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'error-reporting' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/error-reporting.ts:21 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/error-reporting.ts:27; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/feed-activity-hydrate.ts` - 180 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'feed-activity-hydrate'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/feed-activity-hydrate.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/feed-activity-hydrate.ts:1-180 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/feed-activity-hydrate.ts:66 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/feed-activity-hydrate.ts:1-180 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'feed-activity-hydrate' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/feed-activity-hydrate.ts:1 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/geo.ts` - 18 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'geo'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/geo.ts:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/geo.ts:1-18 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/geo.ts:1-18 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'geo' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/get-visible-user-ids.ts` - 24 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'get-visible-user-ids'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/get-visible-user-ids.ts:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/get-visible-user-ids.ts:1-24 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/get-visible-user-ids.ts:12 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/get-visible-user-ids.ts:1-24 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'get-visible-user-ids' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/get-visible-user-ids.ts:5 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/join-challenge.ts` - 154 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'join-challenge'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/join-challenge.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/join-challenge.ts:139 |
| Loading / empty / error UI states | 5 | backend/lib/join-challenge.ts:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/join-challenge.ts:1-154 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/join-challenge.ts:21 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/join-challenge.ts:1-154 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'join-challenge' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/join-challenge.ts:5 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/join-challenge.ts:139; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/last-stand.ts` - 17 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'last-stand'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/last-stand.ts:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/last-stand.ts:1-17 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/last-stand.ts:1-17 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'last-stand' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/logger.ts` - 13 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'logger'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/logger.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/logger.ts:1-13 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/logger.ts:1-13 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'logger' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/logger.ts:6 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/progression.test.ts` - 69 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'progression.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | backend/lib/progression.test.ts:23 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/progression.test.ts:1-69 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/progression.test.ts:1-69 |
| Test coverage | 9 | backend/lib/progression.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/progression.ts` - 25 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'progression'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/progression.ts:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/progression.ts:1-25 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/progression.ts:1-25 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'progression' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/push.ts` - 33 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'push'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/push.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/push.ts:33 |
| Loading / empty / error UI states | 5 | backend/lib/push.ts:35 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/push.ts:1-33 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/push.ts:1-33 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'push' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/push.ts:33; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/push-reminder.ts` - 143 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'push-reminder'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/push-reminder.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/push-reminder.ts:1-143 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/push-reminder.ts:1-143 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'push-reminder' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/push-reminder-expo.ts` - 38 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'push-reminder-expo'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/push-reminder-expo.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/push-reminder-expo.ts:38 |
| Loading / empty / error UI states | 5 | backend/lib/push-reminder-expo.ts:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/push-reminder-expo.ts:1-38 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/push-reminder-expo.ts:1-38 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'push-reminder-expo' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/push-reminder-expo.ts:38; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/push-utils.ts` - 7 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'push-utils'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/push-utils.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/push-utils.ts:1-7 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/push-utils.ts:1-7 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'push-utils' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/rate-limit.ts` - 160 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'rate-limit'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/rate-limit.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/rate-limit.ts:1-160 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/rate-limit.ts:1-160 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'rate-limit' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/rate-limit.ts:8 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/sanitize-search.ts` - 32 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'sanitize-search'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/sanitize-search.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/sanitize-search.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/sanitize-search.ts:1-32 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/sanitize-search.ts:1-32 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'sanitize-search' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/sanitize-search.ts:14 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/scoring.ts` - 16 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'scoring'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/scoring.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/scoring.ts:1-16 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/scoring.ts:1-16 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'scoring' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/sendPush.ts` - 38 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'sendPush'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/sendPush.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/sendPush.ts:1-38 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/sendPush.ts:37 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/sendPush.ts:1-38 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'sendPush' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/sendPush.ts:1 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/starter-seed.ts` - 12 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'starter-seed'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/starter-seed.ts:1-12 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/starter-seed.ts:1-12 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'starter-seed' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/strava-callback.ts` - 76 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'strava-callback'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/strava-callback.ts:7 |
| Type safety | 5 | backend/lib/strava-callback.ts:80 |
| Error handling (no silent catches) | 3 | backend/lib/strava-callback.ts:52 |
| Loading / empty / error UI states | 5 | backend/lib/strava-callback.ts:26 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/strava-callback.ts:1-76 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/strava-callback.ts:81 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/strava-callback.ts:1-76 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'strava-callback' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/strava-callback.ts:2 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/strava-callback.ts:52; backend/lib/strava-callback.ts:80; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/strava-config.ts` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'strava-config'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/strava-config.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/strava-config.ts:1-26 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/strava-config.ts:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'strava-config' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/strava-config.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/strava-oauth-state.ts` - 49 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'strava-oauth-state'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/strava-oauth-state.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/strava-oauth-state.ts:18 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/strava-oauth-state.ts:1-49 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/strava-oauth-state.ts:29 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/strava-oauth-state.ts:1-49 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'strava-oauth-state' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/strava-oauth-state.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/strava-service.ts` - 161 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'strava-service'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/strava-service.ts:51 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/strava-service.ts:51 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/strava-service.ts:1-161 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/strava-service.ts:1-161 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'strava-service' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/strava-service.ts:49 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/strava-verifier.ts` - 144 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'strava-verifier'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/lib/strava-verifier.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/lib/strava-verifier.ts:110 |
| Loading / empty / error UI states | 5 | backend/lib/strava-verifier.ts:54 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/strava-verifier.ts:1-144 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/lib/strava-verifier.ts:65 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/strava-verifier.ts:1-144 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'strava-verifier' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/strava-verifier.ts:5 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/lib/strava-verifier.ts:110; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/streak.test.ts` - 45 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'streak.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | backend/lib/streak.test.ts:5 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/streak.test.ts:1-45 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/streak.test.ts:1-45 |
| Test coverage | 9 | backend/lib/streak.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/streak.ts` - 22 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'streak'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/streak.ts:19 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/streak.ts:1-22 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/streak.ts:1-22 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'streak' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/supabase.ts` - 10 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'supabase'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/supabase.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/supabase.ts:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/supabase.ts:1-10 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/supabase.ts:1-10 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'supabase' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/supabase.ts:1 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/supabase-admin.ts` - 15 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'supabase-admin'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/supabase-admin.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/lib/supabase-admin.ts:12 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/supabase-admin.ts:1-15 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/supabase-admin.ts:1-15 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'supabase-admin' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/supabase-admin.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/supabase-server.ts` - 12 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'supabase-server'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/supabase-server.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/supabase-server.ts:1-12 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/supabase-server.ts:1-12 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'supabase-server' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/lib/supabase-server.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/lib/task-config.ts` - 38 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'task-config'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/lib/task-config.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/lib/task-config.ts:1-38 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/lib/task-config.ts:1-38 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'task-config' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/server.ts` - 9 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'server'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/server.ts:1-9 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/server.ts:1-9 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'server' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/server.ts:5 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/app-router.ts` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'app-router'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/app-router.ts:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/app-router.ts:1-46 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/app-router.ts:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'app-router' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/app-router.ts:3 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/create-context.ts` - 115 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-context'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/create-context.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/create-context.ts:38 |
| Loading / empty / error UI states | 5 | backend/trpc/create-context.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/create-context.ts:1-115 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/trpc/create-context.ts:55 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/create-context.ts:1-115 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-context' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/create-context.ts:3 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/create-context.ts:38; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/create-test-caller.ts` - 25 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-test-caller'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/create-test-caller.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/create-test-caller.ts:1-25 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/create-test-caller.ts:1-25 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-test-caller' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/create-test-caller.ts:16 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/errors.ts` - 17 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'errors'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/errors.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/errors.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/errors.ts:1-17 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/errors.ts:1-17 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'errors' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/errors.ts:3 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/guards.ts` - 37 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'guards'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/guards.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/guards.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/guards.ts:1-37 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | backend/trpc/guards.ts:21 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/guards.ts:1-37 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'guards' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/guards.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/accountability.test.ts` - 179 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'accountability.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | backend/trpc/routes/accountability.test.ts:47 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/accountability.test.ts:15 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/accountability.test.ts:1-179 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/accountability.test.ts:1-179 |
| Test coverage | 9 | backend/trpc/routes/accountability.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/accountability.test.ts:9 |

**Composite:** 5.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/accountability.ts` - 299 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'accountability'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/accountability.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/accountability.ts:155 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/accountability.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/accountability.ts:1-299 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/accountability.ts:4 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/accountability.ts:1-299 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'accountability' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/accountability.ts:3 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/accountability.ts:155; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/achievements.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'achievements'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/achievements.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/achievements.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/achievements.ts:1 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/achievements.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'achievements' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/achievements.ts:5 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/auth.ts` - 65 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'auth'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/auth.ts:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/auth.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/auth.ts:1-65 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/auth.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/auth.ts:1-65 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'auth' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/auth.ts:4 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/challenges.ts` - 400 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenges'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/challenges.ts:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/challenges.ts:323 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/challenges.ts:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/challenges.ts:1-400 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/challenges.ts:4 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges.ts:1-400 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenges' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/challenges.ts:12 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/challenges.ts:323; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/challenges-create.test.ts` - 42 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenges-create.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | backend/trpc/routes/challenges-create.test.ts:25 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/challenges-create.test.ts:1-42 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-create.test.ts:1-42 |
| Test coverage | 9 | backend/trpc/routes/challenges-create.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/challenges-create.ts` - 412 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenges-create'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/challenges-create.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/challenges-create.ts:24 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/challenges-create.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/challenges-create.ts:1-412 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/challenges-create.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-create.ts:1-412 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenges-create' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/challenges-create.ts:15 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/challenges-create.ts:24; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/challenges-discover.ts` - 344 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenges-discover'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/challenges-discover.ts:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/challenges-discover.ts:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/challenges-discover.ts:1-344 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/challenges-discover.ts:2 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-discover.ts:1-344 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenges-discover' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/challenges-discover.ts:10 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/challenges-join.ts` - 209 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenges-join'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/challenges-join.ts:31 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/challenges-join.ts:167 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/challenges-join.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/challenges-join.ts:1-209 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/challenges-join.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-join.ts:1-209 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenges-join' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/challenges-join.ts:5 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/challenges-join.ts:167; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/checkins.ts` - 446 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'checkins'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/checkins.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/checkins.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/checkins.ts:1-446 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/checkins.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/checkins.ts:1-446 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'checkins' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/checkins.ts:61 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/feed.ts` - 795 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'feed'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/feed.ts:27 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/feed.ts:501 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/feed.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/feed.ts:1-795 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/feed.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | backend/trpc/routes/feed.ts:1-795 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'feed' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/feed.ts:6 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/feed.ts:501; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/integrations.ts` - 175 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'integrations'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/integrations.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/integrations.ts:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/integrations.ts:1-175 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/integrations.ts:8 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/integrations.ts:1-175 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'integrations' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/integrations.ts:11 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/last-stand.test.ts` - 48 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'last-stand.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | Select-String no hit |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/last-stand.test.ts:1-48 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/last-stand.test.ts:1-48 |
| Test coverage | 9 | backend/trpc/routes/last-stand.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/leaderboard.ts` - 314 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'leaderboard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/leaderboard.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/leaderboard.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/leaderboard.ts:1-314 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/leaderboard.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/leaderboard.ts:1-314 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'leaderboard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/leaderboard.ts:7 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/notifications.ts` - 198 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'notifications'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/notifications.ts:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/notifications.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/notifications.ts:1-198 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/notifications.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/notifications.ts:1-198 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'notifications' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/notifications.ts:74 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/nudges.test.ts` - 95 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'nudges.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | backend/trpc/routes/nudges.test.ts:18 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/nudges.test.ts:28 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/nudges.test.ts:1-95 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/nudges.test.ts:1-95 |
| Test coverage | 9 | backend/trpc/routes/nudges.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/nudges.test.ts:26 |

**Composite:** 5.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/nudges.ts` - 125 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'nudges'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/nudges.ts:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/nudges.ts:80 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/nudges.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/nudges.ts:1-125 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/nudges.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/nudges.ts:1-125 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'nudges' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/nudges.ts:31 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/nudges.ts:80; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/profiles.ts` - 479 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profiles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/profiles.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/profiles.ts:282 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/profiles.ts:10 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/profiles.ts:1-479 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/profiles.ts:11 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/profiles.ts:1-479 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profiles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/profiles.ts:14 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/profiles.ts:282; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/profiles-social.ts` - 285 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profiles-social'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/profiles-social.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/profiles-social.ts:70 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/profiles-social.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/profiles-social.ts:1-285 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/profiles-social.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/profiles-social.ts:1-285 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profiles-social' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/profiles-social.ts:5 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/profiles-social.ts:70; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/profiles-stats.ts` - 377 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profiles-stats'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/profiles-stats.ts:64 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/profiles-stats.ts:136 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/profiles-stats.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/profiles-stats.ts:1-377 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/profiles-stats.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/profiles-stats.ts:1-377 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profiles-stats' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/profiles-stats.ts:15 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/profiles-stats.ts:136; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/referrals.ts` - 45 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'referrals'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/referrals.ts:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/referrals.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/referrals.ts:1-45 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/referrals.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/referrals.ts:1-45 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'referrals' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/referrals.ts:16 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/reports.ts` - 87 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'reports'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/reports.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/reports.ts:88 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/reports.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/reports.ts:1-87 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/reports.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/reports.ts:1-87 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'reports' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/reports.ts:30 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/reports.ts:88; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/respects.ts` - 111 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'respects'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/respects.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/respects.ts:63 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/respects.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/respects.ts:1-111 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/respects.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/respects.ts:1-111 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'respects' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/respects.ts:5 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/respects.ts:63; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/sharedGoal.ts` - 151 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'sharedGoal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/sharedGoal.ts:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/sharedGoal.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/sharedGoal.ts:1-151 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/sharedGoal.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/sharedGoal.ts:1-151 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'sharedGoal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/sharedGoal.ts:16 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/starters.ts` - 129 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'starters'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/starters.ts:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/starters.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/starters.ts:1-129 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/starters.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/starters.ts:1-129 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'starters' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/starters.ts:26 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/streaks.ts` - 66 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'streaks'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/streaks.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/trpc/routes/streaks.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/streaks.ts:1-66 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/streaks.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/streaks.ts:1-66 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'streaks' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/streaks.ts:17 |

**Composite:** 3.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/trpc/routes/user.ts` - 110 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'user'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/user.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | backend/trpc/routes/user.ts:99 |
| Loading / empty / error UI states | 5 | backend/trpc/routes/user.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/trpc/routes/user.ts:1-110 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 7 | backend/trpc/routes/user.ts:3 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/trpc/routes/user.ts:1-110 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'user' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/trpc/routes/user.ts:49 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** backend/trpc/routes/user.ts:99; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/types/db.ts` - 118 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'db'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/types/db.ts:69 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/types/db.ts:127 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/types/db.ts:1-118 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/types/db.ts:1-118 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'db' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | backend/types/db.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/types/expo-server-sdk.d.ts` - 7 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'expo-server-sdk.d'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | backend/types/expo-server-sdk.d.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/types/expo-server-sdk.d.ts:1-7 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/types/expo-server-sdk.d.ts:1-7 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'expo-server-sdk.d' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `backend/types/pino.d.ts` - 19 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'pino.d'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | backend/types/pino.d.ts:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | backend/types/pino.d.ts:1-19 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | backend/types/pino.d.ts:1-19 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'pino.d' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.


