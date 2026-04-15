# GRIIT Phase 2 Frontend File Scorecard (2026-04-15)

### `app/(tabs)/_layout.tsx` - 155 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/_layout.tsx:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | app/(tabs)/_layout.tsx:12 |
| Loading / empty / error UI states | 6 | app/(tabs)/_layout.tsx:12 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/_layout.tsx:22 |
| Performance | 6 | app/(tabs)/_layout.tsx:1-155 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/(tabs)/_layout.tsx:1-155 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/activity.tsx` - 65 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'activity'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/activity.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/(tabs)/activity.tsx:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/activity.tsx:31 |
| Performance | 6 | app/(tabs)/activity.tsx:1-65 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/(tabs)/activity.tsx:1 |
| Single responsibility / file size | 7 | app/(tabs)/activity.tsx:1-65 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'activity' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/(tabs)/activity.tsx:4 |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/create.tsx` - 16 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/create.tsx:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/(tabs)/create.tsx:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/(tabs)/create.tsx:1-16 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/(tabs)/create.tsx:1-16 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/discover.tsx` - 899 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'discover'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/discover.tsx:73 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/(tabs)/discover.tsx:25 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/discover.tsx:358 |
| Performance | 7 | app/(tabs)/discover.tsx:1-899 |
| Navigation hygiene (ROUTES) | 4 | app/(tabs)/discover.tsx:328 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/(tabs)/discover.tsx:171 |
| Rules of Hooks | 6 | app/(tabs)/discover.tsx:1 |
| Single responsibility / file size | 5 | app/(tabs)/discover.tsx:1-899 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'discover' |
| PostHog instrumentation | 8 | app/(tabs)/discover.tsx:32 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/(tabs)/discover.tsx:21 |

**Composite:** 5.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; app/(tabs)/discover.tsx:328
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/index.tsx` - 951 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 3 | app/(tabs)/index.tsx:27 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/(tabs)/index.tsx:331 |
| Loading / empty / error UI states | 6 | app/(tabs)/index.tsx:14 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/index.tsx:452 |
| Performance | 5 | app/(tabs)/index.tsx:1-951 |
| Navigation hygiene (ROUTES) | 4 | app/(tabs)/index.tsx:351 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/(tabs)/index.tsx:146 |
| Rules of Hooks | 6 | app/(tabs)/index.tsx:1 |
| Single responsibility / file size | 3 | app/(tabs)/index.tsx:1-951 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/(tabs)/index.tsx:22 |

**Composite:** 1.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/(tabs)/index.tsx:331; none; app/(tabs)/index.tsx:351
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/profile.tsx` - 939 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profile'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 3 | app/(tabs)/profile.tsx:38 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/(tabs)/profile.tsx:216 |
| Loading / empty / error UI states | 6 | app/(tabs)/profile.tsx:38 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/profile.tsx:310 |
| Performance | 5 | app/(tabs)/profile.tsx:1-939 |
| Navigation hygiene (ROUTES) | 4 | app/(tabs)/profile.tsx:312 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/(tabs)/profile.tsx:115 |
| Rules of Hooks | 6 | app/(tabs)/profile.tsx:2 |
| Single responsibility / file size | 3 | app/(tabs)/profile.tsx:1-939 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profile' |
| PostHog instrumentation | 8 | app/(tabs)/profile.tsx:35 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/(tabs)/profile.tsx:30 |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/(tabs)/profile.tsx:216; none; app/(tabs)/profile.tsx:312
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/(tabs)/teams.tsx` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'teams'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/teams.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/(tabs)/teams.tsx:10 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/(tabs)/teams.tsx:24 |
| Performance | 6 | app/(tabs)/teams.tsx:1-46 |
| Navigation hygiene (ROUTES) | 4 | app/(tabs)/teams.tsx:23 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/(tabs)/teams.tsx:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'teams' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; app/(tabs)/teams.tsx:23
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/_layout.tsx` - 428 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/_layout.tsx:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/_layout.tsx:126 |
| Loading / empty / error UI states | 6 | app/_layout.tsx:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/_layout.tsx:298 |
| Performance | 7 | app/_layout.tsx:1-428 |
| Navigation hygiene (ROUTES) | 4 | app/_layout.tsx:153 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/_layout.tsx:100 |
| Rules of Hooks | 6 | app/_layout.tsx:4 |
| Single responsibility / file size | 7 | app/_layout.tsx:1-428 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 8 | app/_layout.tsx:30 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/_layout.tsx:10 |

**Composite:** 4.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/_layout.tsx:126; none; app/_layout.tsx:153
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/+not-found.tsx` - 53 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '+not-found'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/+not-found.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/+not-found.tsx:15 |
| Performance | 6 | app/+not-found.tsx:1-53 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/+not-found.tsx:1-53 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '+not-found' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/accountability.tsx` - 431 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'accountability'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/accountability.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/accountability.tsx:50 |
| Loading / empty / error UI states | 6 | app/accountability.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/accountability.tsx:151 |
| Performance | 7 | app/accountability.tsx:1-431 |
| Navigation hygiene (ROUTES) | 4 | app/accountability.tsx:76 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/accountability.tsx:48 |
| Rules of Hooks | 6 | app/accountability.tsx:1 |
| Single responsibility / file size | 7 | app/accountability.tsx:1-431 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'accountability' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/accountability.tsx:50; none; app/accountability.tsx:76
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/accountability/add.tsx` - 242 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'add'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/accountability/add.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/accountability/add.tsx:51 |
| Loading / empty / error UI states | 6 | app/accountability/add.tsx:9 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/accountability/add.tsx:125 |
| Performance | 7 | app/accountability/add.tsx:1-242 |
| Navigation hygiene (ROUTES) | 4 | app/accountability/add.tsx:79 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/accountability/add.tsx:49 |
| Rules of Hooks | 6 | app/accountability/add.tsx:1 |
| Single responsibility / file size | 7 | app/accountability/add.tsx:1-242 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'add' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/accountability/add.tsx:51; none; app/accountability/add.tsx:79
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/api/health+api.ts` - 12 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'health+api'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/api/health+api.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | app/api/health+api.ts:1-12 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/api/health+api.ts:1-12 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'health+api' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/api/trpc/[trpc]+api.ts` - 51 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[trpc]+api'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | app/api/trpc/[trpc]+api.ts:1-51 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/api/trpc/[trpc]+api.ts:1-51 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[trpc]+api' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/auth/_layout.tsx` - 10 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/auth/_layout.tsx:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/auth/_layout.tsx:1-10 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/auth/_layout.tsx:1-10 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/auth/_layout.tsx:3 |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/auth/forgot-password.tsx` - 188 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'forgot-password'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/auth/forgot-password.tsx:19 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/auth/forgot-password.tsx:54 |
| Loading / empty / error UI states | 6 | app/auth/forgot-password.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/auth/forgot-password.tsx:75 |
| Performance | 6 | app/auth/forgot-password.tsx:1-188 |
| Navigation hygiene (ROUTES) | 4 | app/auth/forgot-password.tsx:73 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/auth/forgot-password.tsx:1 |
| Single responsibility / file size | 7 | app/auth/forgot-password.tsx:1-188 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'forgot-password' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/auth/forgot-password.tsx:16 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/auth/forgot-password.tsx:54; none; app/auth/forgot-password.tsx:73
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/auth/login.tsx` - 438 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'login'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/auth/login.tsx:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/auth/login.tsx:100 |
| Loading / empty / error UI states | 6 | app/auth/login.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/auth/login.tsx:205 |
| Performance | 7 | app/auth/login.tsx:1-438 |
| Navigation hygiene (ROUTES) | 4 | app/auth/login.tsx:91 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/auth/login.tsx:80 |
| Rules of Hooks | 6 | app/auth/login.tsx:1 |
| Single responsibility / file size | 7 | app/auth/login.tsx:1-438 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'login' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/auth/login.tsx:16 |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/auth/login.tsx:100; none; app/auth/login.tsx:91
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/auth/signup.tsx` - 535 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'signup'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/auth/signup.tsx:25 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/auth/signup.tsx:106 |
| Loading / empty / error UI states | 6 | app/auth/signup.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/auth/signup.tsx:266 |
| Performance | 7 | app/auth/signup.tsx:1-535 |
| Navigation hygiene (ROUTES) | 4 | app/auth/signup.tsx:202 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/auth/signup.tsx:181 |
| Rules of Hooks | 6 | app/auth/signup.tsx:1 |
| Single responsibility / file size | 5 | app/auth/signup.tsx:1-535 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'signup' |
| PostHog instrumentation | 8 | app/auth/signup.tsx:18 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/auth/signup.tsx:17 |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/auth/signup.tsx:106; none; app/auth/signup.tsx:202
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/challenge/[id].tsx` - 1462 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[id]'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 3 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 3 | app/challenge/[id].tsx:1-1462 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 2 | app/challenge/[id].tsx:1-1462 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[id]' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 1.1
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/challenge/active/[activeChallengeId].tsx` - 643 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[activeChallengeId]'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/challenge/active/[activeChallengeId].tsx:1-643 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | app/challenge/active/[activeChallengeId].tsx:1-643 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[activeChallengeId]' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.2
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/challenge/complete.tsx` - 314 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'complete'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/challenge/complete.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/challenge/complete.tsx:52 |
| Loading / empty / error UI states | 6 | app/challenge/complete.tsx:22 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/challenge/complete.tsx:142 |
| Performance | 7 | app/challenge/complete.tsx:1-314 |
| Navigation hygiene (ROUTES) | 4 | app/challenge/complete.tsx:79 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/challenge/complete.tsx:1 |
| Single responsibility / file size | 7 | app/challenge/complete.tsx:1-314 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'complete' |
| PostHog instrumentation | 8 | app/challenge/complete.tsx:20 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/challenge/complete.tsx:52; none; app/challenge/complete.tsx:79
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/create/_layout.tsx` - 4 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/create/_layout.tsx:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/create/_layout.tsx:1-4 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/create/_layout.tsx:1-4 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/create/index.tsx` - 5 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/create/index.tsx:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/create/index.tsx:1-5 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/create/index.tsx:1-5 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/create-challenge.tsx` - 13 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-challenge'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/create-challenge.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/create-challenge.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/create-challenge.tsx:1-13 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/create-challenge.tsx:1-13 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-challenge' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/create-profile.tsx` - 314 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-profile'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/create-profile.tsx:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/create-profile.tsx:88 |
| Loading / empty / error UI states | 6 | app/create-profile.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/create-profile.tsx:189 |
| Performance | 7 | app/create-profile.tsx:1-314 |
| Navigation hygiene (ROUTES) | 4 | app/create-profile.tsx:70 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/create-profile.tsx:74 |
| Rules of Hooks | 6 | app/create-profile.tsx:1 |
| Single responsibility / file size | 7 | app/create-profile.tsx:1-314 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-profile' |
| PostHog instrumentation | 8 | app/create-profile.tsx:16 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/create-profile.tsx:13 |

**Composite:** 4.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/create-profile.tsx:88; none; app/create-profile.tsx:70
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/edit-profile.tsx` - 274 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'edit-profile'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/edit-profile.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/edit-profile.tsx:68 |
| Loading / empty / error UI states | 6 | app/edit-profile.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/edit-profile.tsx:88 |
| Performance | 6 | app/edit-profile.tsx:1-274 |
| Navigation hygiene (ROUTES) | 4 | app/edit-profile.tsx:66 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/edit-profile.tsx:55 |
| Rules of Hooks | 6 | app/edit-profile.tsx:1 |
| Single responsibility / file size | 7 | app/edit-profile.tsx:1-274 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'edit-profile' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/edit-profile.tsx:18 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/edit-profile.tsx:68; none; app/edit-profile.tsx:66
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/follow-list.tsx` - 310 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'follow-list'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/follow-list.tsx:34 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/follow-list.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/follow-list.tsx:146 |
| Performance | 7 | app/follow-list.tsx:1-310 |
| Navigation hygiene (ROUTES) | 4 | app/follow-list.tsx:141 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/follow-list.tsx:60 |
| Rules of Hooks | 6 | app/follow-list.tsx:1 |
| Single responsibility / file size | 7 | app/follow-list.tsx:1-310 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'follow-list' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/follow-list.tsx:20 |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; app/follow-list.tsx:141
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/invite/[code].tsx` - 35 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[code]'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/invite/[code].tsx:1-35 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/invite/[code].tsx:1-35 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[code]' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/legal/_layout.tsx` - 9 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/legal/_layout.tsx:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/legal/_layout.tsx:1-9 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/legal/_layout.tsx:1-9 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/legal/privacy-policy.tsx` - 47 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'privacy-policy'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/legal/privacy-policy.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/legal/privacy-policy.tsx:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/legal/privacy-policy.tsx:1-47 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/legal/privacy-policy.tsx:1-47 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'privacy-policy' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/legal/privacy-policy.tsx:10 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/legal/terms.tsx` - 48 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'terms'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/legal/terms.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/legal/terms.tsx:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/legal/terms.tsx:1-48 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/legal/terms.tsx:1-48 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'terms' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/onboarding/_layout.tsx` - 14 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '_layout'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/onboarding/_layout.tsx:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/onboarding/_layout.tsx:1-14 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/onboarding/_layout.tsx:1-14 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '_layout' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/onboarding/index.tsx` - 13 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/onboarding/index.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/onboarding/index.tsx:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/onboarding/index.tsx:1-13 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/onboarding/index.tsx:1-13 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/paywall.tsx` - 625 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'paywall'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/paywall.tsx:35 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/paywall.tsx:11 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/paywall.tsx:195 |
| Performance | 7 | app/paywall.tsx:1-625 |
| Navigation hygiene (ROUTES) | 4 | app/paywall.tsx:115 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/paywall.tsx:4 |
| Single responsibility / file size | 5 | app/paywall.tsx:1-625 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'paywall' |
| PostHog instrumentation | 8 | app/paywall.tsx:22 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; app/paywall.tsx:115
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/post/[id].tsx` - 557 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[id]'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/post/[id].tsx:1-557 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | app/post/[id].tsx:1-557 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[id]' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.2
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/profile/[username].tsx` - 888 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern '[username]'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/profile/[username].tsx:1-888 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | app/profile/[username].tsx:1-888 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern '[username]' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.2
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/settings.tsx` - 360 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'settings'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/settings.tsx:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/settings.tsx:71 |
| Loading / empty / error UI states | 6 | app/settings.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/settings.tsx:157 |
| Performance | 7 | app/settings.tsx:1-360 |
| Navigation hygiene (ROUTES) | 4 | app/settings.tsx:144 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | app/settings.tsx:57 |
| Rules of Hooks | 6 | app/settings.tsx:1 |
| Single responsibility / file size | 7 | app/settings.tsx:1-360 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'settings' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | app/settings.tsx:11 |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/settings.tsx:71; none; app/settings.tsx:144
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/task/checkin.tsx` - 591 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'checkin'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | app/task/checkin.tsx:33 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | app/task/checkin.tsx:210 |
| Loading / empty / error UI states | 6 | app/task/checkin.tsx:31 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/task/checkin.tsx:475 |
| Performance | 6 | app/task/checkin.tsx:1-591 |
| Navigation hygiene (ROUTES) | 4 | app/task/checkin.tsx:422 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/task/checkin.tsx:2 |
| Single responsibility / file size | 5 | app/task/checkin.tsx:1-591 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'checkin' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** app/task/checkin.tsx:210; none; app/task/checkin.tsx:422
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/task/checkin-styles.ts` - 324 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'checkin-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/task/checkin-styles.ts:62 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | app/task/checkin-styles.ts:1-324 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/task/checkin-styles.ts:1-324 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'checkin-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/task/complete.tsx` - 14 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'complete'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/task/complete.tsx:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/task/complete.tsx:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | app/task/complete.tsx:1-14 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | app/task/complete.tsx:1-14 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'complete' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/task/run.tsx` - 899 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'run'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/task/run.tsx:42 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | app/task/run.tsx:37 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | app/task/run.tsx:546 |
| Performance | 7 | app/task/run.tsx:1-899 |
| Navigation hygiene (ROUTES) | 4 | app/task/run.tsx:59 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | app/task/run.tsx:2 |
| Single responsibility / file size | 5 | app/task/run.tsx:1-899 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'run' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; app/task/run.tsx:59
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `app/task/run-styles.ts` - 544 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'run-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | app/task/run-styles.ts:43 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | app/task/run-styles.ts:161 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | app/task/run-styles.ts:1-544 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | app/task/run-styles.ts:1-544 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'run-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/activity/activity-styles.ts` - 446 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'activity-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/activity/activity-styles.ts:39 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | components/activity/activity-styles.ts:360 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/activity/activity-styles.ts:1-446 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/activity/activity-styles.ts:1-446 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'activity-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/activity/LeaderboardTab.tsx` - 722 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'LeaderboardTab'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/activity/LeaderboardTab.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/activity/LeaderboardTab.tsx:21 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/activity/LeaderboardTab.tsx:95 |
| Performance | 7 | components/activity/LeaderboardTab.tsx:1-722 |
| Navigation hygiene (ROUTES) | 4 | components/activity/LeaderboardTab.tsx:219 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/activity/LeaderboardTab.tsx:660 |
| Rules of Hooks | 6 | components/activity/LeaderboardTab.tsx:1 |
| Single responsibility / file size | 5 | components/activity/LeaderboardTab.tsx:1-722 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'LeaderboardTab' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/activity/LeaderboardTab.tsx:219
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/activity/NotificationsTab.tsx` - 317 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'NotificationsTab'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/activity/NotificationsTab.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/activity/NotificationsTab.tsx:79 |
| Loading / empty / error UI states | 6 | components/activity/NotificationsTab.tsx:16 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/activity/NotificationsTab.tsx:152 |
| Performance | 7 | components/activity/NotificationsTab.tsx:1-317 |
| Navigation hygiene (ROUTES) | 4 | components/activity/NotificationsTab.tsx:110 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/activity/NotificationsTab.tsx:77 |
| Rules of Hooks | 6 | components/activity/NotificationsTab.tsx:1 |
| Single responsibility / file size | 7 | components/activity/NotificationsTab.tsx:1-317 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'NotificationsTab' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/activity/NotificationsTab.tsx:79; none; components/activity/NotificationsTab.tsx:110
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/activity/types.ts` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'types'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/activity/types.ts:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/activity/types.ts:1-26 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/activity/types.ts:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'types' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/AnalyticsBootstrap.tsx` - 17 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'AnalyticsBootstrap'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/AnalyticsBootstrap.tsx:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/AnalyticsBootstrap.tsx:1-17 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/AnalyticsBootstrap.tsx:1 |
| Single responsibility / file size | 7 | components/AnalyticsBootstrap.tsx:1-17 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'AnalyticsBootstrap' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/AuthGateModal.tsx` - 171 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'AuthGateModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/AuthGateModal.tsx:49 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/AuthGateModal.tsx:75 |
| Performance | 6 | components/AuthGateModal.tsx:1-171 |
| Navigation hygiene (ROUTES) | 4 | components/AuthGateModal.tsx:41 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/AuthGateModal.tsx:1-171 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'AuthGateModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/AuthGateModal.tsx:24 |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/AuthGateModal.tsx:41
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/Avatar.tsx` - 65 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Avatar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/Avatar.tsx:27 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/Avatar.tsx:1-65 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/Avatar.tsx:1-65 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Avatar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/Celebration.tsx` - 268 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Celebration'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/Celebration.tsx:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/Celebration.tsx:82 |
| Loading / empty / error UI states | 6 | components/Celebration.tsx:11 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/Celebration.tsx:1-268 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/Celebration.tsx:1 |
| Single responsibility / file size | 7 | components/Celebration.tsx:1-268 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Celebration' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/Celebration.tsx:82; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/challengeDetailScreenStyles.ts` - 1152 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challengeDetailScreenStyles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/challenge/challengeDetailScreenStyles.ts:55 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | components/challenge/challengeDetailScreenStyles.ts:17 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 4 | components/challenge/challengeDetailScreenStyles.ts:1-1152 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 3 | components/challenge/challengeDetailScreenStyles.ts:1-1152 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challengeDetailScreenStyles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.3
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/ChallengeHero.tsx` - 139 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeHero'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/ChallengeHero.tsx:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/challenge/ChallengeHero.tsx:63 |
| Performance | 7 | components/challenge/ChallengeHero.tsx:1-139 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/ChallengeHero.tsx:1-139 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeHero' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/challengeInfoChip.tsx` - 19 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challengeInfoChip'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/challengeInfoChip.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/challenge/challengeInfoChip.tsx:1-19 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/challengeInfoChip.tsx:1-19 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challengeInfoChip' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/ChallengeLeaderboard.tsx` - 41 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeLeaderboard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/ChallengeLeaderboard.tsx:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/challenge/ChallengeLeaderboard.tsx:1-41 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/ChallengeLeaderboard.tsx:1-41 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeLeaderboard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/challengeSocialAvatars.tsx` - 23 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challengeSocialAvatars'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/challengeSocialAvatars.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/challenge/challengeSocialAvatars.tsx:1-23 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/challengeSocialAvatars.tsx:1-23 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challengeSocialAvatars' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/ChallengeStats.tsx` - 27 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeStats'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/ChallengeStats.tsx:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/challenge/ChallengeStats.tsx:1-27 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/ChallengeStats.tsx:1-27 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeStats' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/ChallengeTodayGoals.tsx` - 14 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeTodayGoals'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/ChallengeTodayGoals.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/challenge/ChallengeTodayGoals.tsx:1-14 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenge/ChallengeTodayGoals.tsx:1-14 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeTodayGoals' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/LogProgressModal.tsx` - 190 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'LogProgressModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/challenge/LogProgressModal.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/challenge/LogProgressModal.tsx:45 |
| Loading / empty / error UI states | 6 | components/challenge/LogProgressModal.tsx:10 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/challenge/LogProgressModal.tsx:68 |
| Performance | 6 | components/challenge/LogProgressModal.tsx:1-190 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/challenge/LogProgressModal.tsx:1 |
| Single responsibility / file size | 7 | components/challenge/LogProgressModal.tsx:1-190 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'LogProgressModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/challenge/LogProgressModal.tsx:45; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/SharedGoalProgress.tsx` - 292 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SharedGoalProgress'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/SharedGoalProgress.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/challenge/SharedGoalProgress.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/challenge/SharedGoalProgress.tsx:143 |
| Performance | 7 | components/challenge/SharedGoalProgress.tsx:1-292 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/challenge/SharedGoalProgress.tsx:1 |
| Single responsibility / file size | 7 | components/challenge/SharedGoalProgress.tsx:1-292 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SharedGoalProgress' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenge/TeamMemberList.tsx` - 200 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TeamMemberList'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenge/TeamMemberList.tsx:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/challenge/TeamMemberList.tsx:1-200 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/challenge/TeamMemberList.tsx:1 |
| Single responsibility / file size | 7 | components/challenge/TeamMemberList.tsx:1-200 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TeamMemberList' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenges/HeroFeaturedCard.tsx` - 132 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'HeroFeaturedCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/challenges/HeroFeaturedCard.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/challenges/HeroFeaturedCard.tsx:70 |
| Performance | 7 | components/challenges/HeroFeaturedCard.tsx:1-132 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/challenges/HeroFeaturedCard.tsx:1-132 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'HeroFeaturedCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/challenges/JoinCelebrationModal.tsx` - 175 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'JoinCelebrationModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/challenges/JoinCelebrationModal.tsx:37 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/challenges/JoinCelebrationModal.tsx:57 |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/challenges/JoinCelebrationModal.tsx:92 |
| Performance | 7 | components/challenges/JoinCelebrationModal.tsx:1-175 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/challenges/JoinCelebrationModal.tsx:1 |
| Single responsibility / file size | 7 | components/challenges/JoinCelebrationModal.tsx:1-175 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'JoinCelebrationModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/challenges/JoinCelebrationModal.tsx:57; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/CommitModal.tsx` - 155 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CommitModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/CommitModal.tsx:26 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/CommitModal.tsx:106 |
| Performance | 6 | components/create/CommitModal.tsx:1-155 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/create/CommitModal.tsx:1 |
| Single responsibility / file size | 7 | components/create/CommitModal.tsx:1-155 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CommitModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/CreateChallengeWizard.tsx` - 455 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CreateChallengeWizard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/create/CreateChallengeWizard.tsx:25 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/create/CreateChallengeWizard.tsx:160 |
| Loading / empty / error UI states | 6 | components/create/CreateChallengeWizard.tsx:25 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/CreateChallengeWizard.tsx:319 |
| Performance | 7 | components/create/CreateChallengeWizard.tsx:1-455 |
| Navigation hygiene (ROUTES) | 4 | components/create/CreateChallengeWizard.tsx:185 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/create/CreateChallengeWizard.tsx:1 |
| Single responsibility / file size | 7 | components/create/CreateChallengeWizard.tsx:1-455 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CreateChallengeWizard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/create/CreateChallengeWizard.tsx:32 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/create/CreateChallengeWizard.tsx:160; none; components/create/CreateChallengeWizard.tsx:185
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/DraftExitModal.tsx` - 58 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DraftExitModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/DraftExitModal.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/DraftExitModal.tsx:21 |
| Performance | 6 | components/create/DraftExitModal.tsx:1-58 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/DraftExitModal.tsx:1-58 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DraftExitModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/NewTaskModal.tsx` - 1481 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'NewTaskModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 3 | components/create/NewTaskModal.tsx:50 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/create/NewTaskModal.tsx:1439 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/NewTaskModal.tsx:53 |
| Performance | 4 | components/create/NewTaskModal.tsx:1-1481 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/create/NewTaskModal.tsx:1 |
| Single responsibility / file size | 2 | components/create/NewTaskModal.tsx:1-1481 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'NewTaskModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 1.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/steps/StepBasics.tsx` - 184 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StepBasics'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/steps/StepBasics.tsx:43 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/create/steps/StepBasics.tsx:15 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/steps/StepBasics.tsx:54 |
| Performance | 6 | components/create/steps/StepBasics.tsx:1-184 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/steps/StepBasics.tsx:1-184 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StepBasics' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/steps/StepReview.tsx` - 265 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StepReview'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/steps/StepReview.tsx:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/steps/StepReview.tsx:189 |
| Performance | 6 | components/create/steps/StepReview.tsx:1-265 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/create/steps/StepReview.tsx:87 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/steps/StepReview.tsx:1-265 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StepReview' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/steps/StepRules.tsx` - 212 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StepRules'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/steps/StepRules.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/create/steps/StepRules.tsx:23 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/steps/StepRules.tsx:47 |
| Performance | 6 | components/create/steps/StepRules.tsx:1-212 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/steps/StepRules.tsx:1-212 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StepRules' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/steps/StepTasks.tsx` - 124 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StepTasks'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/steps/StepTasks.tsx:35 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/create/steps/StepTasks.tsx:14 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/steps/StepTasks.tsx:66 |
| Performance | 6 | components/create/steps/StepTasks.tsx:1-124 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/create/steps/StepTasks.tsx:41 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/steps/StepTasks.tsx:1-124 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StepTasks' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/wizard-shared.tsx` - 89 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'wizard-shared'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/wizard-shared.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/wizard-shared.tsx:15 |
| Performance | 6 | components/create/wizard-shared.tsx:1-89 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/wizard-shared.tsx:1-89 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'wizard-shared' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/WizardStepFooter.tsx` - 118 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'WizardStepFooter'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/WizardStepFooter.tsx:36 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/create/WizardStepFooter.tsx:42 |
| Performance | 6 | components/create/WizardStepFooter.tsx:1-118 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/WizardStepFooter.tsx:1-118 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'WizardStepFooter' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/create/wizard-styles.ts` - 304 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'wizard-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/create/wizard-styles.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | components/create/wizard-styles.ts:54 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/create/wizard-styles.ts:1-304 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/create/wizard-styles.ts:1-304 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'wizard-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/discover/ActivityTicker.tsx` - 187 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ActivityTicker'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/discover/ActivityTicker.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/discover/ActivityTicker.tsx:43 |
| Performance | 7 | components/discover/ActivityTicker.tsx:1-187 |
| Navigation hygiene (ROUTES) | 4 | components/discover/ActivityTicker.tsx:79 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/discover/ActivityTicker.tsx:73 |
| Rules of Hooks | 6 | components/discover/ActivityTicker.tsx:1 |
| Single responsibility / file size | 7 | components/discover/ActivityTicker.tsx:1-187 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ActivityTicker' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/discover/ActivityTicker.tsx:79
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/discover/CompactChallengeRow.tsx` - 161 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CompactChallengeRow'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/discover/CompactChallengeRow.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/discover/CompactChallengeRow.tsx:94 |
| Performance | 7 | components/discover/CompactChallengeRow.tsx:1-161 |
| Navigation hygiene (ROUTES) | 4 | components/discover/CompactChallengeRow.tsx:85 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/discover/CompactChallengeRow.tsx:1-161 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CompactChallengeRow' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/discover/CompactChallengeRow.tsx:85
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/discover/DiscoverChallengeCards.tsx` - 309 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DiscoverChallengeCards'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/discover/DiscoverChallengeCards.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/discover/DiscoverChallengeCards.tsx:76 |
| Performance | 7 | components/discover/DiscoverChallengeCards.tsx:1-309 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/discover/DiscoverChallengeCards.tsx:1-309 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DiscoverChallengeCards' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/discover/FilterChips.tsx` - 74 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'FilterChips'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/discover/FilterChips.tsx:39 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/discover/FilterChips.tsx:28 |
| Performance | 7 | components/discover/FilterChips.tsx:1-74 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/discover/FilterChips.tsx:1 |
| Single responsibility / file size | 7 | components/discover/FilterChips.tsx:1-74 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'FilterChips' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/discover/PickedForYou.tsx` - 196 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'PickedForYou'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/discover/PickedForYou.tsx:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/discover/PickedForYou.tsx:48 |
| Performance | 7 | components/discover/PickedForYou.tsx:1-196 |
| Navigation hygiene (ROUTES) | 4 | components/discover/PickedForYou.tsx:90 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/discover/PickedForYou.tsx:1 |
| Single responsibility / file size | 7 | components/discover/PickedForYou.tsx:1-196 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'PickedForYou' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/discover/PickedForYou.tsx:90
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ErrorBoundary.tsx` - 95 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ErrorBoundary'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/ErrorBoundary.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/ErrorBoundary.tsx:25 |
| Loading / empty / error UI states | 6 | components/ErrorBoundary.tsx:1 |
| Design system compliance | 4 | components/ErrorBoundary.tsx:46 |
| Accessibility | 6 | components/ErrorBoundary.tsx:54 |
| Performance | 6 | components/ErrorBoundary.tsx:1-95 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ErrorBoundary.tsx:1-95 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ErrorBoundary' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/ErrorBoundary.tsx:25; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ErrorRetry.tsx` - 54 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ErrorRetry'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ErrorRetry.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/ErrorRetry.tsx:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ErrorRetry.tsx:13 |
| Performance | 6 | components/ErrorRetry.tsx:1-54 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ErrorRetry.tsx:1-54 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ErrorRetry' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/FeedCardHeader.tsx` - 175 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'FeedCardHeader'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/FeedCardHeader.tsx:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/feed/FeedCardHeader.tsx:41 |
| Performance | 7 | components/feed/FeedCardHeader.tsx:1-175 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/feed/FeedCardHeader.tsx:1-175 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'FeedCardHeader' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/FeedEngagementRow.tsx` - 119 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'FeedEngagementRow'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/FeedEngagementRow.tsx:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/feed/FeedEngagementRow.tsx:51 |
| Performance | 7 | components/feed/FeedEngagementRow.tsx:1-119 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/feed/FeedEngagementRow.tsx:1-119 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'FeedEngagementRow' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/FeedPostCard.tsx` - 398 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'FeedPostCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/FeedPostCard.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/feed/FeedPostCard.tsx:124 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/feed/FeedPostCard.tsx:135 |
| Performance | 7 | components/feed/FeedPostCard.tsx:1-398 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/feed/FeedPostCard.tsx:54 |
| Single responsibility / file size | 7 | components/feed/FeedPostCard.tsx:1-398 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'FeedPostCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/feedTypes.ts` - 36 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'feedTypes'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/feedTypes.ts:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/feed/feedTypes.ts:1-36 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/feed/feedTypes.ts:1-36 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'feedTypes' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/MilestonePostCard.tsx` - 128 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'MilestonePostCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/MilestonePostCard.tsx:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/feed/MilestonePostCard.tsx:1-128 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/feed/MilestonePostCard.tsx:36 |
| Single responsibility / file size | 7 | components/feed/MilestonePostCard.tsx:1-128 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'MilestonePostCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/feed/WhoRespectedSheet.tsx` - 200 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'WhoRespectedSheet'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/feed/WhoRespectedSheet.tsx:48 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/feed/WhoRespectedSheet.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/feed/WhoRespectedSheet.tsx:67 |
| Performance | 7 | components/feed/WhoRespectedSheet.tsx:1-200 |
| Navigation hygiene (ROUTES) | 4 | components/feed/WhoRespectedSheet.tsx:49 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/feed/WhoRespectedSheet.tsx:40 |
| Rules of Hooks | 6 | components/feed/WhoRespectedSheet.tsx:1 |
| Single responsibility / file size | 7 | components/feed/WhoRespectedSheet.tsx:1-200 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'WhoRespectedSheet' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/feed/WhoRespectedSheet.tsx:19 |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/feed/WhoRespectedSheet.tsx:49
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/ActiveChallenges.tsx` - 183 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ActiveChallenges'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/home/ActiveChallenges.tsx:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/home/ActiveChallenges.tsx:78 |
| Loading / empty / error UI states | 6 | components/home/ActiveChallenges.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/home/ActiveChallenges.tsx:1-183 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/home/ActiveChallenges.tsx:71 |
| Rules of Hooks | 6 | components/home/ActiveChallenges.tsx:1 |
| Single responsibility / file size | 7 | components/home/ActiveChallenges.tsx:1-183 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ActiveChallenges' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/home/ActiveChallenges.tsx:78; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/ActiveTaskCard.tsx` - 131 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ActiveTaskCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/ActiveTaskCard.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/ActiveTaskCard.tsx:83 |
| Performance | 6 | components/home/ActiveTaskCard.tsx:1-131 |
| Navigation hygiene (ROUTES) | 4 | components/home/ActiveTaskCard.tsx:81 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/ActiveTaskCard.tsx:1 |
| Single responsibility / file size | 7 | components/home/ActiveTaskCard.tsx:1-131 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ActiveTaskCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/home/ActiveTaskCard.tsx:81
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/ChallengeCard.tsx` - 207 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/ChallengeCard.tsx:57 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/ChallengeCard.tsx:119 |
| Performance | 7 | components/home/ChallengeCard.tsx:1-207 |
| Navigation hygiene (ROUTES) | 4 | components/home/ChallengeCard.tsx:59 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/ChallengeCard.tsx:1 |
| Single responsibility / file size | 7 | components/home/ChallengeCard.tsx:1-207 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/home/ChallengeCard.tsx:59
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/DailyBonus.tsx` - 102 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DailyBonus'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/DailyBonus.tsx:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/home/DailyBonus.tsx:1-102 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/DailyBonus.tsx:1 |
| Single responsibility / file size | 7 | components/home/DailyBonus.tsx:1-102 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DailyBonus' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/DailyQuote.tsx` - 50 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DailyQuote'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/DailyQuote.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/DailyQuote.tsx:17 |
| Performance | 7 | components/home/DailyQuote.tsx:1-50 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/DailyQuote.tsx:1 |
| Single responsibility / file size | 7 | components/home/DailyQuote.tsx:1-50 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DailyQuote' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/home/DailyQuote.tsx:21 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/DailyStatus.tsx` - 149 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DailyStatus'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/DailyStatus.tsx:25 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/DailyStatus.tsx:70 |
| Performance | 6 | components/home/DailyStatus.tsx:1-149 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/DailyStatus.tsx:1-149 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DailyStatus' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/DiscoverCTA.tsx` - 68 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DiscoverCTA'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/DiscoverCTA.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/DiscoverCTA.tsx:19 |
| Performance | 6 | components/home/DiscoverCTA.tsx:1-68 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/DiscoverCTA.tsx:1-68 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DiscoverCTA' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/EmptyChallengesCard.tsx` - 69 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'EmptyChallengesCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/EmptyChallengesCard.tsx:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/EmptyChallengesCard.tsx:27 |
| Performance | 6 | components/home/EmptyChallengesCard.tsx:1-69 |
| Navigation hygiene (ROUTES) | 4 | components/home/EmptyChallengesCard.tsx:14 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/EmptyChallengesCard.tsx:1-69 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'EmptyChallengesCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/home/EmptyChallengesCard.tsx:14
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/ExploreChallengesButton.tsx` - 47 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ExploreChallengesButton'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/ExploreChallengesButton.tsx:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/ExploreChallengesButton.tsx:23 |
| Performance | 6 | components/home/ExploreChallengesButton.tsx:1-47 |
| Navigation hygiene (ROUTES) | 4 | components/home/ExploreChallengesButton.tsx:14 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/ExploreChallengesButton.tsx:1-47 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ExploreChallengesButton' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; components/home/ExploreChallengesButton.tsx:14
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/GoalCard.tsx` - 359 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'GoalCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/GoalCard.tsx:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/home/GoalCard.tsx:72 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/GoalCard.tsx:106 |
| Performance | 7 | components/home/GoalCard.tsx:1-359 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/GoalCard.tsx:1 |
| Single responsibility / file size | 7 | components/home/GoalCard.tsx:1-359 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'GoalCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/index.ts` - 8 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/home/index.ts:1-8 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/index.ts:1-8 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/NextUnlock.tsx` - 76 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'NextUnlock'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/NextUnlock.tsx:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/home/NextUnlock.tsx:1-76 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/home/NextUnlock.tsx:1-76 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'NextUnlock' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/PointsExplainer.tsx` - 173 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'PointsExplainer'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/PointsExplainer.tsx:32 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/PointsExplainer.tsx:58 |
| Performance | 7 | components/home/PointsExplainer.tsx:1-173 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/PointsExplainer.tsx:1 |
| Single responsibility / file size | 7 | components/home/PointsExplainer.tsx:1-173 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'PointsExplainer' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/StreakHero.tsx` - 145 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StreakHero'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/StreakHero.tsx:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/home/StreakHero.tsx:81 |
| Performance | 7 | components/home/StreakHero.tsx:1-145 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/StreakHero.tsx:1 |
| Single responsibility / file size | 7 | components/home/StreakHero.tsx:1-145 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StreakHero' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/home/WeekStrip.tsx` - 155 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'WeekStrip'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/home/WeekStrip.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/home/WeekStrip.tsx:1-155 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/home/WeekStrip.tsx:1 |
| Single responsibility / file size | 7 | components/home/WeekStrip.tsx:1-155 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'WeekStrip' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/InlineError.tsx` - 78 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'InlineError'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/InlineError.tsx:38 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/InlineError.tsx:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/InlineError.tsx:56 |
| Performance | 7 | components/InlineError.tsx:1-78 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/InlineError.tsx:1 |
| Single responsibility / file size | 7 | components/InlineError.tsx:1-78 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'InlineError' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/LiveFeedSection.tsx` - 663 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'LiveFeedSection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/LiveFeedSection.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/LiveFeedSection.tsx:195 |
| Loading / empty / error UI states | 6 | components/LiveFeedSection.tsx:22 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/LiveFeedSection.tsx:389 |
| Performance | 7 | components/LiveFeedSection.tsx:1-663 |
| Navigation hygiene (ROUTES) | 4 | components/LiveFeedSection.tsx:242 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/LiveFeedSection.tsx:65 |
| Rules of Hooks | 6 | components/LiveFeedSection.tsx:1 |
| Single responsibility / file size | 5 | components/LiveFeedSection.tsx:1-663 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'LiveFeedSection' |
| PostHog instrumentation | 8 | components/LiveFeedSection.tsx:31 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/LiveFeedSection.tsx:20 |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/LiveFeedSection.tsx:195; none; components/LiveFeedSection.tsx:242
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/OfflineBanner.tsx` - 31 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'OfflineBanner'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/OfflineBanner.tsx:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/OfflineBanner.tsx:1-31 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/OfflineBanner.tsx:1-31 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'OfflineBanner' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/OnboardingFlow.tsx` - 148 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'OnboardingFlow'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/onboarding/OnboardingFlow.tsx:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/onboarding/OnboardingFlow.tsx:67 |
| Loading / empty / error UI states | 6 | components/onboarding/OnboardingFlow.tsx:12 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/OnboardingFlow.tsx:106 |
| Performance | 7 | components/onboarding/OnboardingFlow.tsx:1-148 |
| Navigation hygiene (ROUTES) | 4 | components/onboarding/OnboardingFlow.tsx:71 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/onboarding/OnboardingFlow.tsx:1 |
| Single responsibility / file size | 7 | components/onboarding/OnboardingFlow.tsx:1-148 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'OnboardingFlow' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/onboarding/OnboardingFlow.tsx:26 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/onboarding/OnboardingFlow.tsx:67; none; components/onboarding/OnboardingFlow.tsx:71
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/onboarding-theme.ts` - 125 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'onboarding-theme'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/onboarding/onboarding-theme.ts:1-125 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/onboarding/onboarding-theme.ts:1-125 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'onboarding-theme' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/ProgressDots.tsx` - 44 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProgressDots'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/onboarding/ProgressDots.tsx:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/onboarding/ProgressDots.tsx:1-44 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/onboarding/ProgressDots.tsx:14 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/onboarding/ProgressDots.tsx:1-44 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProgressDots' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/screens/AutoSuggestChallengeScreen.tsx` - 313 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'AutoSuggestChallengeScreen'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:105 |
| Loading / empty / error UI states | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:180 |
| Performance | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1-313 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:69 |
| Rules of Hooks | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 |
| Single responsibility / file size | 7 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1-313 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'AutoSuggestChallengeScreen' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:15 |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/onboarding/screens/AutoSuggestChallengeScreen.tsx:105; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/screens/GoalSelection.tsx` - 118 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'GoalSelection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/onboarding/screens/GoalSelection.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/screens/GoalSelection.tsx:40 |
| Performance | 6 | components/onboarding/screens/GoalSelection.tsx:1-118 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/onboarding/screens/GoalSelection.tsx:1-118 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'GoalSelection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/screens/ProfileSetup.tsx` - 298 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProfileSetup'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/onboarding/screens/ProfileSetup.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/onboarding/screens/ProfileSetup.tsx:146 |
| Loading / empty / error UI states | 6 | components/onboarding/screens/ProfileSetup.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/screens/ProfileSetup.tsx:182 |
| Performance | 7 | components/onboarding/screens/ProfileSetup.tsx:1-298 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/onboarding/screens/ProfileSetup.tsx:120 |
| Rules of Hooks | 6 | components/onboarding/screens/ProfileSetup.tsx:1 |
| Single responsibility / file size | 7 | components/onboarding/screens/ProfileSetup.tsx:1-298 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProfileSetup' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/onboarding/screens/ProfileSetup.tsx:19 |

**Composite:** 3
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/onboarding/screens/ProfileSetup.tsx:146; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/screens/SignUpScreen.tsx` - 293 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SignUpScreen'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/onboarding/screens/SignUpScreen.tsx:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/onboarding/screens/SignUpScreen.tsx:112 |
| Loading / empty / error UI states | 6 | components/onboarding/screens/SignUpScreen.tsx:8 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/screens/SignUpScreen.tsx:193 |
| Performance | 7 | components/onboarding/screens/SignUpScreen.tsx:1-293 |
| Navigation hygiene (ROUTES) | 4 | components/onboarding/screens/SignUpScreen.tsx:248 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/onboarding/screens/SignUpScreen.tsx:1 |
| Single responsibility / file size | 7 | components/onboarding/screens/SignUpScreen.tsx:1-293 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SignUpScreen' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/onboarding/screens/SignUpScreen.tsx:13 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/onboarding/screens/SignUpScreen.tsx:112; none; components/onboarding/screens/SignUpScreen.tsx:248
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/onboarding/screens/ValueSplash.tsx` - 175 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ValueSplash'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/onboarding/screens/ValueSplash.tsx:45 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/onboarding/screens/ValueSplash.tsx:93 |
| Performance | 6 | components/onboarding/screens/ValueSplash.tsx:1-175 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/onboarding/screens/ValueSplash.tsx:1 |
| Single responsibility / file size | 7 | components/onboarding/screens/ValueSplash.tsx:1-175 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ValueSplash' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/PremiumBadge.tsx` - 50 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'PremiumBadge'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/PremiumBadge.tsx:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/PremiumBadge.tsx:1-50 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/PremiumBadge.tsx:1-50 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'PremiumBadge' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/AchievementsSection.tsx` - 155 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'AchievementsSection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/AchievementsSection.tsx:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/profile/AchievementsSection.tsx:22 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/profile/AchievementsSection.tsx:1-155 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/profile/AchievementsSection.tsx:1 |
| Single responsibility / file size | 7 | components/profile/AchievementsSection.tsx:1-155 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'AchievementsSection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/BadgeDetailModal.tsx` - 121 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'BadgeDetailModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/BadgeDetailModal.tsx:29 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/profile/BadgeDetailModal.tsx:33 |
| Performance | 6 | components/profile/BadgeDetailModal.tsx:1-121 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/BadgeDetailModal.tsx:1-121 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'BadgeDetailModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/CompletedChallengesSection.tsx` - 137 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CompletedChallengesSection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/CompletedChallengesSection.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/profile/CompletedChallengesSection.tsx:16 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/profile/CompletedChallengesSection.tsx:1-137 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/CompletedChallengesSection.tsx:1-137 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CompletedChallengesSection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/DisciplineCalendar.tsx` - 178 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DisciplineCalendar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/DisciplineCalendar.tsx:32 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/profile/DisciplineCalendar.tsx:1-178 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/profile/DisciplineCalendar.tsx:1 |
| Single responsibility / file size | 7 | components/profile/DisciplineCalendar.tsx:1-178 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DisciplineCalendar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/DisciplineGrowthCard.tsx` - 138 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DisciplineGrowthCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/DisciplineGrowthCard.tsx:25 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/profile/DisciplineGrowthCard.tsx:1-138 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/DisciplineGrowthCard.tsx:1-138 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DisciplineGrowthCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/DisciplineScoreCard.tsx` - 136 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DisciplineScoreCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/DisciplineScoreCard.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/profile/DisciplineScoreCard.tsx:1-136 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/DisciplineScoreCard.tsx:1-136 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DisciplineScoreCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/index.ts` - 22 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/index.ts:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/profile/index.ts:1-22 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/index.ts:1-22 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/LifetimeStatsCard.tsx` - 99 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'LifetimeStatsCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/LifetimeStatsCard.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/profile/LifetimeStatsCard.tsx:1-99 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/LifetimeStatsCard.tsx:1-99 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'LifetimeStatsCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/ProfileCompletionCard.tsx` - 102 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProfileCompletionCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/ProfileCompletionCard.tsx:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/profile/ProfileCompletionCard.tsx:1-102 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/ProfileCompletionCard.tsx:1-102 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProfileCompletionCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/ProfileHeader.tsx` - 216 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProfileHeader'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/profile/ProfileHeader.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/profile/ProfileHeader.tsx:71 |
| Loading / empty / error UI states | 6 | components/profile/ProfileHeader.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/profile/ProfileHeader.tsx:84 |
| Performance | 7 | components/profile/ProfileHeader.tsx:1-216 |
| Navigation hygiene (ROUTES) | 4 | components/profile/ProfileHeader.tsx:116 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/profile/ProfileHeader.tsx:1 |
| Single responsibility / file size | 7 | components/profile/ProfileHeader.tsx:1-216 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProfileHeader' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/profile/ProfileHeader.tsx:71; none; components/profile/ProfileHeader.tsx:116
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/ShareDisciplineCard.tsx` - 119 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ShareDisciplineCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/profile/ShareDisciplineCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/profile/ShareDisciplineCard.tsx:34 |
| Loading / empty / error UI states | 6 | components/profile/ShareDisciplineCard.tsx:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/profile/ShareDisciplineCard.tsx:58 |
| Performance | 6 | components/profile/ShareDisciplineCard.tsx:1-119 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/ShareDisciplineCard.tsx:1-119 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ShareDisciplineCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/profile/ShareDisciplineCard.tsx:34; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/SocialStatsCard.tsx` - 84 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SocialStatsCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/SocialStatsCard.tsx:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/profile/SocialStatsCard.tsx:1-84 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/SocialStatsCard.tsx:1-84 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SocialStatsCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/profile/TierProgressBar.tsx` - 75 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TierProgressBar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/profile/TierProgressBar.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/profile/TierProgressBar.tsx:1-75 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/profile/TierProgressBar.tsx:1-75 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TierProgressBar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ProofShareCard.tsx` - 239 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProofShareCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/ProofShareCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/ProofShareCard.tsx:56 |
| Loading / empty / error UI states | 6 | components/ProofShareCard.tsx:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ProofShareCard.tsx:85 |
| Performance | 6 | components/ProofShareCard.tsx:1-239 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/ProofShareCard.tsx:1 |
| Single responsibility / file size | 7 | components/ProofShareCard.tsx:1-239 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProofShareCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/ProofShareCard.tsx:56; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/settings/AccountDangerZone.tsx` - 180 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'AccountDangerZone'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/settings/AccountDangerZone.tsx:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/settings/AccountDangerZone.tsx:130 |
| Loading / empty / error UI states | 6 | components/settings/AccountDangerZone.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/settings/AccountDangerZone.tsx:70 |
| Performance | 6 | components/settings/AccountDangerZone.tsx:1-180 |
| Navigation hygiene (ROUTES) | 4 | components/settings/AccountDangerZone.tsx:67 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/settings/AccountDangerZone.tsx:121 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/settings/AccountDangerZone.tsx:1-180 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'AccountDangerZone' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | components/settings/AccountDangerZone.tsx:9 |

**Composite:** 2.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/settings/AccountDangerZone.tsx:130; none; components/settings/AccountDangerZone.tsx:67
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/settings/ReminderSection.tsx` - 292 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ReminderSection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/settings/ReminderSection.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/settings/ReminderSection.tsx:184 |
| Loading / empty / error UI states | 6 | components/settings/ReminderSection.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/settings/ReminderSection.tsx:90 |
| Performance | 6 | components/settings/ReminderSection.tsx:1-292 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/settings/ReminderSection.tsx:183 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/settings/ReminderSection.tsx:1-292 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ReminderSection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/settings/ReminderSection.tsx:184; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/settings/settings-styles.ts` - 202 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'settings-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/settings/settings-styles.ts:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/settings/settings-styles.ts:1-202 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/settings/settings-styles.ts:1-202 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'settings-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/settings/VisibilitySection.tsx` - 100 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'VisibilitySection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/settings/VisibilitySection.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/settings/VisibilitySection.tsx:36 |
| Performance | 6 | components/settings/VisibilitySection.tsx:1-100 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/settings/VisibilitySection.tsx:1-100 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'VisibilitySection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/share/ShareCards.tsx` - 769 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ShareCards'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/share/ShareCards.tsx:30 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/share/ShareCards.tsx:1-769 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | components/share/ShareCards.tsx:1-769 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ShareCards' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.2
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/share/ShareSheetModal.tsx` - 509 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ShareSheetModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/share/ShareSheetModal.tsx:20 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/share/ShareSheetModal.tsx:205 |
| Loading / empty / error UI states | 6 | components/share/ShareSheetModal.tsx:10 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/share/ShareSheetModal.tsx:293 |
| Performance | 7 | components/share/ShareSheetModal.tsx:1-509 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/share/ShareSheetModal.tsx:1 |
| Single responsibility / file size | 5 | components/share/ShareSheetModal.tsx:1-509 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ShareSheetModal' |
| PostHog instrumentation | 8 | components/share/ShareSheetModal.tsx:19 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/share/ShareSheetModal.tsx:205; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ShareCard.tsx` - 165 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ShareCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ShareCard.tsx:35 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/ShareCard.tsx:1-165 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ShareCard.tsx:1-165 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ShareCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/Card.tsx` - 35 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Card'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/Card.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/Card.tsx:9 |
| Performance | 6 | components/shared/Card.tsx:1-35 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/Card.tsx:1-35 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Card' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/CelebrationOverlay.tsx` - 322 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CelebrationOverlay'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/shared/CelebrationOverlay.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/shared/CelebrationOverlay.tsx:69 |
| Loading / empty / error UI states | 6 | components/shared/CelebrationOverlay.tsx:16 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/CelebrationOverlay.tsx:186 |
| Performance | 7 | components/shared/CelebrationOverlay.tsx:1-322 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/shared/CelebrationOverlay.tsx:1 |
| Single responsibility / file size | 7 | components/shared/CelebrationOverlay.tsx:1-322 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CelebrationOverlay' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/shared/CelebrationOverlay.tsx:69; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/ConfirmDialog.tsx` - 126 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ConfirmDialog'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/ConfirmDialog.tsx:26 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/ConfirmDialog.tsx:32 |
| Performance | 6 | components/shared/ConfirmDialog.tsx:1-126 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/ConfirmDialog.tsx:1-126 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ConfirmDialog' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/ErrorState.tsx` - 45 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ErrorState'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/ErrorState.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/shared/ErrorState.tsx:11 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/ErrorState.tsx:13 |
| Performance | 6 | components/shared/ErrorState.tsx:1-45 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/ErrorState.tsx:1-45 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ErrorState' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/FormInput.tsx` - 91 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'FormInput'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/FormInput.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/shared/FormInput.tsx:10 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/FormInput.tsx:11 |
| Performance | 6 | components/shared/FormInput.tsx:1-91 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/FormInput.tsx:1-91 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'FormInput' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/ImageViewerModal.tsx` - 147 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ImageViewerModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/ImageViewerModal.tsx:41 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/ImageViewerModal.tsx:108 |
| Performance | 6 | components/shared/ImageViewerModal.tsx:1-147 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/shared/ImageViewerModal.tsx:40 |
| Single responsibility / file size | 7 | components/shared/ImageViewerModal.tsx:1-147 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ImageViewerModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/LoadingState.tsx` - 29 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'LoadingState'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/LoadingState.tsx:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/shared/LoadingState.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/LoadingState.tsx:13 |
| Performance | 6 | components/shared/LoadingState.tsx:1-29 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/LoadingState.tsx:1-29 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'LoadingState' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/ProofShareOverlay.tsx` - 20 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ProofShareOverlay'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/ProofShareOverlay.tsx:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/shared/ProofShareOverlay.tsx:1-20 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/ProofShareOverlay.tsx:1-20 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ProofShareOverlay' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/ReportChallengeModal.tsx` - 228 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ReportChallengeModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/shared/ReportChallengeModal.tsx:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/shared/ReportChallengeModal.tsx:58 |
| Loading / empty / error UI states | 6 | components/shared/ReportChallengeModal.tsx:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/ReportChallengeModal.tsx:85 |
| Performance | 6 | components/shared/ReportChallengeModal.tsx:1-228 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/shared/ReportChallengeModal.tsx:51 |
| Rules of Hooks | 6 | components/shared/ReportChallengeModal.tsx:1 |
| Single responsibility / file size | 7 | components/shared/ReportChallengeModal.tsx:1-228 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ReportChallengeModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.9
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/shared/ReportChallengeModal.tsx:58; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/shared/SectionHeader.tsx` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SectionHeader'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/shared/SectionHeader.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/shared/SectionHeader.tsx:20 |
| Performance | 7 | components/shared/SectionHeader.tsx:1-46 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/shared/SectionHeader.tsx:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SectionHeader' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/index.ts` - 8 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/skeletons/index.ts:1-8 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/index.ts:1-8 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonBase.tsx` - 87 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonBase'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonBase.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonBase.tsx:1-87 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/skeletons/SkeletonBase.tsx:1 |
| Single responsibility / file size | 7 | components/skeletons/SkeletonBase.tsx:1-87 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonBase' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonChallengeCard.tsx` - 43 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonChallengeCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonChallengeCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonChallengeCard.tsx:1-43 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonChallengeCard.tsx:1-43 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonChallengeCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonChallengeDetail.tsx` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonChallengeDetail'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonChallengeDetail.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1-46 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonChallengeDetail' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonFeedCard.tsx` - 50 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonFeedCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonFeedCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonFeedCard.tsx:1-50 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonFeedCard.tsx:1-50 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonFeedCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonHeroCard.tsx` - 29 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonHeroCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonHeroCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonHeroCard.tsx:1-29 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonHeroCard.tsx:1-29 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonHeroCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonHomeChallengeCard.tsx` - 53 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonHomeChallengeCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonHomeChallengeCard.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1-53 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1-53 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonHomeChallengeCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonLeaderboardRow.tsx` - 34 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonLeaderboardRow'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1-34 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1-34 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonLeaderboardRow' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/skeletons/SkeletonProfile.tsx` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SkeletonProfile'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/skeletons/SkeletonProfile.tsx:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/skeletons/SkeletonProfile.tsx:1-46 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/skeletons/SkeletonProfile.tsx:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SkeletonProfile' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/StreakFreezeModal.tsx` - 125 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'StreakFreezeModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/StreakFreezeModal.tsx:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/StreakFreezeModal.tsx:35 |
| Performance | 6 | components/StreakFreezeModal.tsx:1-125 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/StreakFreezeModal.tsx:1-125 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'StreakFreezeModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/task/RunPickerColumn.tsx` - 78 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'RunPickerColumn'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/task/RunPickerColumn.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/task/RunPickerColumn.tsx:1-78 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | components/task/RunPickerColumn.tsx:8 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/task/RunPickerColumn.tsx:1-78 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'RunPickerColumn' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/task/TaskCompleteCelebration.tsx` - 328 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TaskCompleteCelebration'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | components/task/TaskCompleteCelebration.tsx:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/task/TaskCompleteCelebration.tsx:243 |
| Loading / empty / error UI states | 6 | components/task/TaskCompleteCelebration.tsx:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/task/TaskCompleteCelebration.tsx:151 |
| Performance | 6 | components/task/TaskCompleteCelebration.tsx:1-328 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/task/TaskCompleteCelebration.tsx:1-328 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TaskCompleteCelebration' |
| PostHog instrumentation | 8 | components/task/TaskCompleteCelebration.tsx:20 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/task/TaskCompleteCelebration.tsx:243; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/task/TaskCompleteForm.tsx` - 671 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TaskCompleteForm'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/task/TaskCompleteForm.tsx:19 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/task/TaskCompleteForm.tsx:9 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/task/TaskCompleteForm.tsx:203 |
| Performance | 6 | components/task/TaskCompleteForm.tsx:1-671 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | components/task/TaskCompleteForm.tsx:1-671 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TaskCompleteForm' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/task/task-complete-styles.ts` - 494 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'task-complete-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/task/task-complete-styles.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | components/task/task-complete-styles.ts:455 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/task/task-complete-styles.ts:1-494 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/task/task-complete-styles.ts:1-494 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'task-complete-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/task/VerificationGates.tsx` - 372 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'VerificationGates'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/task/VerificationGates.tsx:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/task/VerificationGates.tsx:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/task/VerificationGates.tsx:239 |
| Performance | 7 | components/task/VerificationGates.tsx:1-372 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/task/VerificationGates.tsx:1 |
| Single responsibility / file size | 7 | components/task/VerificationGates.tsx:1-372 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'VerificationGates' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/TaskEditorModal.tsx` - 1586 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TaskEditorModal'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 2 | components/TaskEditorModal.tsx:58 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | components/TaskEditorModal.tsx:494 |
| Loading / empty / error UI states | 6 | components/TaskEditorModal.tsx:56 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/TaskEditorModal.tsx:754 |
| Performance | 4 | components/TaskEditorModal.tsx:1-1586 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/TaskEditorModal.tsx:1 |
| Single responsibility / file size | 2 | components/TaskEditorModal.tsx:1-1586 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TaskEditorModal' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 1
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** components/TaskEditorModal.tsx:494; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/TimeWindowPrompt.tsx` - 181 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TimeWindowPrompt'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/TimeWindowPrompt.tsx:46 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/TimeWindowPrompt.tsx:67 |
| Performance | 6 | components/TimeWindowPrompt.tsx:1-181 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/TimeWindowPrompt.tsx:1 |
| Single responsibility / file size | 7 | components/TimeWindowPrompt.tsx:1-181 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TimeWindowPrompt' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/Card.tsx` - 48 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Card'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/Card.tsx:28 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/ui/Card.tsx:1-48 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/Card.tsx:1-48 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Card' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/CategoryTag.tsx` - 46 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CategoryTag'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/CategoryTag.tsx:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/CategoryTag.tsx:19 |
| Performance | 7 | components/ui/CategoryTag.tsx:1-46 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/CategoryTag.tsx:1-46 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CategoryTag' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/ChallengeCard24h.tsx` - 169 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeCard24h'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/ChallengeCard24h.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/ChallengeCard24h.tsx:80 |
| Performance | 7 | components/ui/ChallengeCard24h.tsx:1-169 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | components/ui/ChallengeCard24h.tsx:1 |
| Single responsibility / file size | 7 | components/ui/ChallengeCard24h.tsx:1-169 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeCard24h' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/ChallengeCardFeatured.tsx` - 244 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeCardFeatured'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/ChallengeCardFeatured.tsx:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/ChallengeCardFeatured.tsx:79 |
| Performance | 7 | components/ui/ChallengeCardFeatured.tsx:1-244 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/ChallengeCardFeatured.tsx:1-244 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeCardFeatured' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/ChallengeRowCard.tsx` - 165 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'ChallengeRowCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/ChallengeRowCard.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/ChallengeRowCard.tsx:62 |
| Performance | 7 | components/ui/ChallengeRowCard.tsx:1-165 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/ChallengeRowCard.tsx:1-165 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'ChallengeRowCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/Chip.tsx` - 116 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Chip'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/Chip.tsx:35 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/Chip.tsx:23 |
| Performance | 6 | components/ui/Chip.tsx:1-116 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/Chip.tsx:1-116 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Chip' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/CreateFlowCheckbox.tsx` - 58 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CreateFlowCheckbox'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/CreateFlowCheckbox.tsx:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/CreateFlowCheckbox.tsx:14 |
| Performance | 6 | components/ui/CreateFlowCheckbox.tsx:1-58 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/CreateFlowCheckbox.tsx:1-58 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CreateFlowCheckbox' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/CreateFlowHeader.tsx` - 105 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CreateFlowHeader'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/CreateFlowHeader.tsx:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/CreateFlowHeader.tsx:26 |
| Performance | 6 | components/ui/CreateFlowHeader.tsx:1-105 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/CreateFlowHeader.tsx:1-105 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CreateFlowHeader' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/CreateFlowInput.tsx` - 54 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'CreateFlowInput'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/CreateFlowInput.tsx:16 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/CreateFlowInput.tsx:12 |
| Performance | 6 | components/ui/CreateFlowInput.tsx:1-54 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/CreateFlowInput.tsx:1-54 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'CreateFlowInput' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/DurationPill.tsx` - 48 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'DurationPill'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/DurationPill.tsx:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/DurationPill.tsx:20 |
| Performance | 7 | components/ui/DurationPill.tsx:1-48 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/DurationPill.tsx:1-48 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'DurationPill' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/EmptyState.tsx` - 133 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'EmptyState'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/EmptyState.tsx:42 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/ui/EmptyState.tsx:14 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/EmptyState.tsx:56 |
| Performance | 7 | components/ui/EmptyState.tsx:1-133 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/EmptyState.tsx:1-133 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'EmptyState' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/EnforcementBlock.tsx` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'EnforcementBlock'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/EnforcementBlock.tsx:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/ui/EnforcementBlock.tsx:1-26 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/EnforcementBlock.tsx:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'EnforcementBlock' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/GRIITWordmark.tsx` - 61 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'GRIITWordmark'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/GRIITWordmark.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/ui/GRIITWordmark.tsx:1-61 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/GRIITWordmark.tsx:1-61 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'GRIITWordmark' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/index.ts` - 19 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | components/ui/index.ts:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | components/ui/index.ts:1-19 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/index.ts:1-19 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/InitialCircle.tsx` - 36 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'InitialCircle'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/InitialCircle.tsx:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/ui/InitialCircle.tsx:1-36 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/InitialCircle.tsx:1-36 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'InitialCircle' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/Input.tsx` - 37 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Input'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/Input.tsx:17 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/ui/Input.tsx:1-37 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/Input.tsx:1-37 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Input' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/PrimaryButton.tsx` - 150 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'PrimaryButton'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/PrimaryButton.tsx:57 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 6 | components/ui/PrimaryButton.tsx:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/PrimaryButton.tsx:38 |
| Performance | 7 | components/ui/PrimaryButton.tsx:1-150 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/PrimaryButton.tsx:1-150 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'PrimaryButton' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.8
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/Screen.tsx` - 56 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'Screen'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/Screen.tsx:49 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | components/ui/Screen.tsx:1-56 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/Screen.tsx:1-56 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'Screen' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/SearchBar.tsx` - 54 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SearchBar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/SearchBar.tsx:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/SearchBar.tsx:26 |
| Performance | 6 | components/ui/SearchBar.tsx:1-54 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/SearchBar.tsx:1-54 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SearchBar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/SectionHeader.tsx` - 43 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'SectionHeader'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/SectionHeader.tsx:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 7 | components/ui/SectionHeader.tsx:1-43 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/SectionHeader.tsx:1-43 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'SectionHeader' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `components/ui/TaskTypeCard.tsx` - 92 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'TaskTypeCard'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | components/ui/TaskTypeCard.tsx:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | components/ui/TaskTypeCard.tsx:33 |
| Performance | 7 | components/ui/TaskTypeCard.tsx:1-92 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | components/ui/TaskTypeCard.tsx:1-92 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'TaskTypeCard' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useAppChallengeMutations.ts` - 268 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useAppChallengeMutations'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/useAppChallengeMutations.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/useAppChallengeMutations.ts:169 |
| Loading / empty / error UI states | 5 | hooks/useAppChallengeMutations.ts:17 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useAppChallengeMutations.ts:1-268 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | hooks/useAppChallengeMutations.ts:99 |
| Rules of Hooks | 6 | hooks/useAppChallengeMutations.ts:1 |
| Single responsibility / file size | 7 | hooks/useAppChallengeMutations.ts:1-268 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useAppChallengeMutations' |
| PostHog instrumentation | 8 | hooks/useAppChallengeMutations.ts:16 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/useAppChallengeMutations.ts:169; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useCelebration.ts` - 67 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useCelebration'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useCelebration.ts:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | hooks/useCelebration.ts:52 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useCelebration.ts:1-67 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useCelebration.ts:1 |
| Single responsibility / file size | 7 | hooks/useCelebration.ts:1-67 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useCelebration' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useCreateChallengeWizardPersistence.ts` - 336 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useCreateChallengeWizardPersistence'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/useCreateChallengeWizardPersistence.ts:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/useCreateChallengeWizardPersistence.ts:162 |
| Loading / empty / error UI states | 5 | hooks/useCreateChallengeWizardPersistence.ts:9 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useCreateChallengeWizardPersistence.ts:1-336 |
| Navigation hygiene (ROUTES) | 5 | hooks/useCreateChallengeWizardPersistence.ts:272 |
| Data layer hygiene (TRPC paths, invalidation) | 6 | hooks/useCreateChallengeWizardPersistence.ts:263 |
| Rules of Hooks | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 |
| Single responsibility / file size | 7 | hooks/useCreateChallengeWizardPersistence.ts:1-336 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useCreateChallengeWizardPersistence' |
| PostHog instrumentation | 8 | hooks/useCreateChallengeWizardPersistence.ts:10 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | hooks/useCreateChallengeWizardPersistence.ts:24 |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/useCreateChallengeWizardPersistence.ts:162; none; hooks/useCreateChallengeWizardPersistence.ts:272
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useDebounce.ts` - 13 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useDebounce'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useDebounce.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useDebounce.ts:1-13 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useDebounce.ts:1 |
| Single responsibility / file size | 7 | hooks/useDebounce.ts:1-13 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useDebounce' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useInlineError.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useInlineError'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useInlineError.ts:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | hooks/useInlineError.ts:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useInlineError.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useInlineError.ts:1 |
| Single responsibility / file size | 7 | hooks/useInlineError.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useInlineError' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useJournalInput.ts` - 29 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useJournalInput'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useJournalInput.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | hooks/useJournalInput.ts:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useJournalInput.ts:1-29 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useJournalInput.ts:1 |
| Single responsibility / file size | 7 | hooks/useJournalInput.ts:1-29 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useJournalInput' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useJournalSubmit.ts` - 62 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useJournalSubmit'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useJournalSubmit.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | hooks/useJournalSubmit.ts:19 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useJournalSubmit.ts:1-62 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | hooks/useJournalSubmit.ts:1-62 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useJournalSubmit' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useNetworkStatus.ts` - 39 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useNetworkStatus'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/useNetworkStatus.ts:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/useNetworkStatus.ts:32 |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useNetworkStatus.ts:1-39 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useNetworkStatus.ts:1 |
| Single responsibility / file size | 7 | hooks/useNetworkStatus.ts:1-39 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useNetworkStatus' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/useNetworkStatus.ts:32; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useNotificationScheduler.ts` - 173 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useNotificationScheduler'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/useNotificationScheduler.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/useNotificationScheduler.ts:43 |
| Loading / empty / error UI states | 5 | hooks/useNotificationScheduler.ts:44 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useNotificationScheduler.ts:1-173 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | hooks/useNotificationScheduler.ts:58 |
| Rules of Hooks | 6 | hooks/useNotificationScheduler.ts:1 |
| Single responsibility / file size | 7 | hooks/useNotificationScheduler.ts:1-173 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useNotificationScheduler' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/useNotificationScheduler.ts:43; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/usePhotoCapture.ts` - 86 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'usePhotoCapture'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/usePhotoCapture.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/usePhotoCapture.ts:37 |
| Loading / empty / error UI states | 5 | hooks/usePhotoCapture.ts:4 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/usePhotoCapture.ts:1-86 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/usePhotoCapture.ts:1 |
| Single responsibility / file size | 7 | hooks/usePhotoCapture.ts:1-86 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'usePhotoCapture' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/usePhotoCapture.ts:37; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useProStatus.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useProStatus'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useProStatus.ts:12 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | hooks/useProStatus.ts:7 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useProStatus.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | hooks/useProStatus.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useProStatus' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useScreenTracker.ts` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useScreenTracker'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useScreenTracker.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | hooks/useScreenTracker.ts:1-26 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useScreenTracker.ts:1 |
| Single responsibility / file size | 7 | hooks/useScreenTracker.ts:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useScreenTracker' |
| PostHog instrumentation | 8 | hooks/useScreenTracker.ts:3 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useTaskCompleteScreen.tsx` - 794 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useTaskCompleteScreen'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | hooks/useTaskCompleteScreen.tsx:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | hooks/useTaskCompleteScreen.tsx:313 |
| Loading / empty / error UI states | 6 | hooks/useTaskCompleteScreen.tsx:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 6 | hooks/useTaskCompleteScreen.tsx:750 |
| Performance | 7 | hooks/useTaskCompleteScreen.tsx:1-794 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | hooks/useTaskCompleteScreen.tsx:537 |
| Rules of Hooks | 6 | hooks/useTaskCompleteScreen.tsx:4 |
| Single responsibility / file size | 5 | hooks/useTaskCompleteScreen.tsx:1-794 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useTaskCompleteScreen' |
| PostHog instrumentation | 8 | hooks/useTaskCompleteScreen.tsx:19 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** hooks/useTaskCompleteScreen.tsx:313; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useTaskCompleteShareCardProps.ts` - 188 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useTaskCompleteShareCardProps'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useTaskCompleteShareCardProps.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useTaskCompleteShareCardProps.ts:1-188 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useTaskCompleteShareCardProps.ts:1 |
| Single responsibility / file size | 7 | hooks/useTaskCompleteShareCardProps.ts:1-188 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useTaskCompleteShareCardProps' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `hooks/useTaskTimer.ts` - 76 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'useTaskTimer'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | hooks/useTaskTimer.ts:13 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 7 | hooks/useTaskTimer.ts:1-76 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | hooks/useTaskTimer.ts:1 |
| Single responsibility / file size | 7 | hooks/useTaskTimer.ts:1-76 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'useTaskTimer' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/active-task-timer.ts` - 117 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'active-task-timer'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/active-task-timer.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/active-task-timer.ts:33 |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/active-task-timer.ts:1-117 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/active-task-timer.ts:1-117 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'active-task-timer' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/active-task-timer.ts:33; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/analytics.ts` - 150 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'analytics'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/analytics.ts:25 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/analytics.ts:71 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/analytics.ts:1-150 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/analytics.ts:1-150 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'analytics' |
| PostHog instrumentation | 8 | lib/analytics.ts:123 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/analytics.ts:95 |

**Composite:** 5.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/api.test.ts` - 44 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'api.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | lib/api.test.ts:4 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/api.test.ts:4 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/api.test.ts:1-44 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/api.test.ts:1-44 |
| Test coverage | 9 | lib/api.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/api.test.ts:6 |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/api.ts` - 270 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'api'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/api.ts:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/api.ts:94 |
| Loading / empty / error UI states | 5 | lib/api.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/api.ts:1-270 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/api.ts:200 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/api.ts:1-270 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'api' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/api.ts:1 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/api.ts:94; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/auth-expiry.ts` - 16 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'auth-expiry'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/auth-expiry.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/auth-expiry.ts:1-16 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/auth-expiry.ts:1-16 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'auth-expiry' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/auth-expiry.ts:3 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/auth-helpers.ts` - 31 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'auth-helpers'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/auth-helpers.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/auth-helpers.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/auth-helpers.ts:1-31 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/auth-helpers.ts:1-31 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'auth-helpers' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/auth-helpers.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/avatar.ts` - 62 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'avatar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/avatar.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/avatar.ts:67 |
| Loading / empty / error UI states | 5 | lib/avatar.ts:6 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/avatar.ts:1-62 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/avatar.ts:66 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/avatar.ts:1-62 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'avatar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/avatar.ts:67; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/badge-descriptions.ts` - 45 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'badge-descriptions'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/badge-descriptions.ts:24 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/badge-descriptions.ts:1-45 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/badge-descriptions.ts:1-45 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'badge-descriptions' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/build-task-config-param.ts` - 40 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'build-task-config-param'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/build-task-config-param.ts:1 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/build-task-config-param.ts:37 |
| Loading / empty / error UI states | 5 | lib/build-task-config-param.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/build-task-config-param.ts:1-40 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/build-task-config-param.ts:1-40 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'build-task-config-param' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/build-task-config-param.ts:3 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/build-task-config-param.ts:37; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/challenge-packs.ts` - 221 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenge-packs'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/challenge-packs.ts:27 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/challenge-packs.ts:1-221 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/challenge-packs.ts:1-221 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'challenge-packs' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/challenge-timer.ts` - 38 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'challenge-timer'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/challenge-timer.ts:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/challenge-timer.ts:1-38 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/challenge-timer.ts:1-38 |
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

### `lib/client-error-reporting.ts` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'client-error-reporting'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/client-error-reporting.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/client-error-reporting.ts:4 |
| Loading / empty / error UI states | 5 | lib/client-error-reporting.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/client-error-reporting.ts:1-26 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/client-error-reporting.ts:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'client-error-reporting' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/client-error-reporting.ts:9 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/client-error-reporting.ts:24; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/config.ts` - 28 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'config'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/config.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/config.ts:1-28 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/config.ts:1-28 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'config' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/config.ts:7 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/constants/storage-keys.ts` - 20 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'storage-keys'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/constants/storage-keys.ts:1-20 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/constants/storage-keys.ts:1-20 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'storage-keys' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/create-challenge-helpers.ts` - 307 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-challenge-helpers'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/create-challenge-helpers.ts:74 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/create-challenge-helpers.ts:126 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/create-challenge-helpers.ts:1-307 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/create-challenge-helpers.ts:1-307 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-challenge-helpers' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/create-selection.ts` - 7 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'create-selection'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/create-selection.ts:1-7 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/create-selection.ts:1-7 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'create-selection' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/date-utils.ts` - 63 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'date-utils'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/date-utils.ts:14 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/date-utils.ts:32 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/date-utils.ts:1-63 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/date-utils.ts:1-63 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'date-utils' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/deep-links.ts` - 28 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'deep-links'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/deep-links.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/deep-links.ts:1-28 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/deep-links.ts:1-28 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'deep-links' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/derive-user-rank.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'derive-user-rank'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/derive-user-rank.ts:5 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/derive-user-rank.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/derive-user-rank.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'derive-user-rank' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/design-system.ts` - 867 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'design-system'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/design-system.ts:103 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/design-system.ts:257 |
| Design system compliance | 4 | lib/design-system.ts:12 |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/design-system.ts:1-867 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | lib/design-system.ts:1-867 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'design-system' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.2
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/estimate-daily-time.ts` - 67 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'estimate-daily-time'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/estimate-daily-time.ts:60 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/estimate-daily-time.ts:1-67 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/estimate-daily-time.ts:1-67 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'estimate-daily-time' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/feature-flags.ts` - 44 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'feature-flags'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/feature-flags.ts:9 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/feature-flags.ts:1-44 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/feature-flags.ts:1-44 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'feature-flags' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/formatTime.ts` - 8 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'formatTime'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/formatTime.ts:7 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/formatTime.ts:1-8 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/formatTime.ts:1-8 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'formatTime' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/formatTimeAgo.test.ts` - 44 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'formatTimeAgo.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | lib/formatTimeAgo.test.ts:14 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/formatTimeAgo.test.ts:1-44 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/formatTimeAgo.test.ts:1-44 |
| Test coverage | 9 | lib/formatTimeAgo.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/formatTimeAgo.ts` - 18 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'formatTimeAgo'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/formatTimeAgo.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/formatTimeAgo.ts:1-18 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/formatTimeAgo.ts:1-18 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'formatTimeAgo' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/geo.ts` - 19 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'geo'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/geo.ts:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/geo.ts:1-19 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/geo.ts:1-19 |
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

### `lib/logger.ts` - 24 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'logger'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/logger.ts:1 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/logger.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/logger.ts:1-24 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/logger.ts:1-24 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'logger' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/mutations.ts` - 20 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'mutations'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/mutations.ts:10 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/mutations.ts:1-20 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/mutations.ts:12 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/mutations.ts:1-20 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'mutations' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/notification-copy.ts` - 211 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'notification-copy'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/notification-copy.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/notification-copy.ts:1-211 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/notification-copy.ts:1-211 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'notification-copy' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/notifications.ts` - 661 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'notifications'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/notifications.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/notifications.ts:617 |
| Loading / empty / error UI states | 5 | lib/notifications.ts:26 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/notifications.ts:1-661 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 5 | lib/notifications.ts:1-661 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'notifications' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/notifications.ts:2 |

**Composite:** 2.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/notifications.ts:617; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/onboarding-pending.ts` - 41 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'onboarding-pending'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/onboarding-pending.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/onboarding-pending.ts:1-41 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/onboarding-pending.ts:1-41 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'onboarding-pending' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/posthog.ts` - 33 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'posthog'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/posthog.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/posthog.ts:1-33 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/posthog.ts:1-33 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'posthog' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/posthog.ts:9 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/prefetch-queries.ts` - 38 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'prefetch-queries'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/prefetch-queries.ts:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/prefetch-queries.ts:24 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/prefetch-queries.ts:1-38 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/prefetch-queries.ts:9 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/prefetch-queries.ts:1-38 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'prefetch-queries' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/prefetch-queries.ts:2 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/premium.ts` - 33 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'premium'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/premium.ts:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/premium.ts:1-33 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/premium.ts:1-33 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'premium' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/profile-badges.tsx` - 32 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profile-badges'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/profile-badges.tsx:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 3 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 3 | Select-String no hit |
| Performance | 6 | lib/profile-badges.tsx:1-32 |
| Navigation hygiene (ROUTES) | 6 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/profile-badges.tsx:1-32 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profile-badges' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.4
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/profile-display.ts` - 23 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'profile-display'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/profile-display.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/profile-display.ts:1-23 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/profile-display.ts:1-23 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'profile-display' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/query-client.ts` - 26 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'query-client'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/query-client.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/query-client.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/query-client.ts:1-26 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/query-client.ts:1-26 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'query-client' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/quotes.ts` - 56 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'quotes'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/quotes.ts:41 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/quotes.ts:1-56 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/quotes.ts:1-56 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'quotes' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/quotes.ts:3 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/register-push-token.ts` - 74 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'register-push-token'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/register-push-token.ts:8 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/register-push-token.ts:53 |
| Loading / empty / error UI states | 5 | lib/register-push-token.ts:53 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/register-push-token.ts:1-74 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/register-push-token.ts:48 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/register-push-token.ts:1-74 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'register-push-token' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/register-push-token.ts:3 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/register-push-token.ts:53; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/revenue-cat.ts` - 20 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'revenue-cat'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/revenue-cat.ts:19 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/revenue-cat.ts:1-20 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/revenue-cat.ts:1-20 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'revenue-cat' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/review-prompt.ts` - 55 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'review-prompt'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/review-prompt.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/review-prompt.ts:48 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/review-prompt.ts:1-55 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/review-prompt.ts:1-55 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'review-prompt' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/routes.ts` - 51 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'routes'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/routes.ts:21 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/routes.ts:1-51 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/routes.ts:1-51 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'routes' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/routes.ts:6 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/sanitize.ts` - 45 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'sanitize'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/sanitize.ts:11 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/sanitize.ts:1-45 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/sanitize.ts:1-45 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'sanitize' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/scoring.ts` - 7 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'scoring'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/scoring.ts:6 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/scoring.ts:1-7 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/scoring.ts:1-7 |
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

### `lib/sentry.ts` - 59 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'sentry'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/sentry.ts:1 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 7 | lib/sentry.ts:11 |
| Loading / empty / error UI states | 5 | lib/sentry.ts:36 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/sentry.ts:1-59 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/sentry.ts:1-59 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'sentry' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 8 | lib/sentry.ts:45 |
| Security (no secrets, RLS-aware) | 6 | lib/sentry.ts:3 |

**Composite:** 5.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/share.ts` - 182 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'share'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/share.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/share.ts:25 |
| Loading / empty / error UI states | 5 | lib/share.ts:26 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/share.ts:1-182 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/share.ts:1-182 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'share' |
| PostHog instrumentation | 8 | lib/share.ts:10 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 4.5
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/share.ts:25; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/signout-cleanup.ts` - 27 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'signout-cleanup'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/signout-cleanup.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/signout-cleanup.ts:10 |
| Loading / empty / error UI states | 5 | lib/signout-cleanup.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/signout-cleanup.ts:1-27 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/signout-cleanup.ts:1-27 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'signout-cleanup' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/signout-cleanup.ts:6 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/signout-cleanup.ts:10; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/subscription.ts` - 236 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'subscription'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/subscription.ts:27 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/subscription.ts:82 |
| Loading / empty / error UI states | 5 | lib/subscription.ts:60 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/subscription.ts:1-236 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/subscription.ts:82 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/subscription.ts:1-236 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'subscription' |
| PostHog instrumentation | 8 | lib/subscription.ts:13 |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/subscription.ts:2 |

**Composite:** 4.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/subscription.ts:82; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/supabase.ts` - 18 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'supabase'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/supabase.ts:1-18 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/supabase.ts:1-18 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'supabase' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/supabase.ts:3 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/task-hard-verification.ts` - 16 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'task-hard-verification'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/task-hard-verification.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/task-hard-verification.ts:1-16 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/task-hard-verification.ts:1-16 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'task-hard-verification' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/task-helpers.ts` - 98 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'task-helpers'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/task-helpers.ts:1 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/task-helpers.ts:57 |
| Loading / empty / error UI states | 5 | lib/task-helpers.ts:1 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/task-helpers.ts:1-98 |
| Navigation hygiene (ROUTES) | 5 | lib/task-helpers.ts:96 |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/task-helpers.ts:1-98 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'task-helpers' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/task-helpers.ts:57; none; lib/task-helpers.ts:96
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/colors.ts` - 29 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'colors'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/colors.ts:1-29 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/colors.ts:1-29 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'colors' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/createFlowStyles.ts` - 69 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'createFlowStyles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/createFlowStyles.ts:1-69 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/createFlowStyles.ts:1-69 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'createFlowStyles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/index.ts` - 7 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'index'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/index.ts:1-7 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/index.ts:1-7 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'index' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/radius.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'radius'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/radius.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/radius.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'radius' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/shadows.ts` - 21 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'shadows'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/shadows.ts:1-21 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/shadows.ts:1-21 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'shadows' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/shared-styles.ts` - 42 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'shared-styles'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/shared-styles.ts:1-42 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/shared-styles.ts:1-42 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'shared-styles' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/spacing.ts` - 12 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'spacing'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/spacing.ts:1-12 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/spacing.ts:1-12 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'spacing' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/tokens.ts` - 192 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'tokens'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/theme/tokens.ts:22 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/tokens.ts:1-192 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/tokens.ts:1-192 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'tokens' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme/typography.ts` - 16 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'typography'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme/typography.ts:1-16 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme/typography.ts:1-16 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'typography' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/theme-palettes.ts` - 114 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'theme-palettes'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | Select-String no hit |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/theme-palettes.ts:1-114 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/theme-palettes.ts:1-114 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'theme-palettes' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/time-enforcement.test.ts` - 65 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'time-enforcement.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | lib/time-enforcement.test.ts:22 |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/time-enforcement.test.ts:40 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/time-enforcement.test.ts:1-65 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/time-enforcement.test.ts:1-65 |
| Test coverage | 9 | lib/time-enforcement.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/time-enforcement.ts` - 169 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'time-enforcement'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/time-enforcement.ts:23 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/time-enforcement.ts:145 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/time-enforcement.ts:1-169 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/time-enforcement.ts:1-169 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'time-enforcement' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/trpc.ts` - 107 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'trpc'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/trpc.ts:3 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/trpc.ts:71 |
| Loading / empty / error UI states | 5 | lib/trpc.ts:5 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/trpc.ts:1-107 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/trpc.ts:1-107 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'trpc' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/trpc.ts:2 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/trpc.ts:71; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/trpc-errors.test.ts` - 31 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'trpc-errors.test'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 7 | Select-String no hit |
| Type safety | 7 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/trpc-errors.test.ts:3 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/trpc-errors.test.ts:1-31 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/trpc-errors.test.ts:1-31 |
| Test coverage | 9 | lib/trpc-errors.test.ts:1 |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/trpc-errors.test.ts:11 |

**Composite:** 5.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/trpc-errors.ts` - 33 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'trpc-errors'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/trpc-errors.ts:31 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | lib/trpc-errors.ts:2 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/trpc-errors.ts:1-33 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/trpc-errors.ts:1-33 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'trpc-errors' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/trpc-errors.ts:7 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/trpc-paths.ts` - 143 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'trpc-paths'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/trpc-paths.ts:92 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/trpc-paths.ts:1-143 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/trpc-paths.ts:1-143 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'trpc-paths' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/trpc-paths.ts:6 |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/uploadAvatar.ts` - 111 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'uploadAvatar'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/uploadAvatar.ts:18 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/uploadAvatar.ts:59 |
| Loading / empty / error UI states | 5 | lib/uploadAvatar.ts:12 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/uploadAvatar.ts:1-111 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/uploadAvatar.ts:55 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/uploadAvatar.ts:1-111 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'uploadAvatar' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/uploadAvatar.ts:2 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/uploadAvatar.ts:59; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/uploadProofImage.ts` - 136 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'uploadProofImage'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 4 | lib/uploadProofImage.ts:2 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 3 | lib/uploadProofImage.ts:101 |
| Loading / empty / error UI states | 5 | lib/uploadProofImage.ts:39 |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/uploadProofImage.ts:1-136 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 6 | lib/uploadProofImage.ts:80 |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/uploadProofImage.ts:1-136 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'uploadProofImage' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | lib/uploadProofImage.ts:2 |

**Composite:** 2.7
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** lib/uploadProofImage.ts:101; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/utils.ts` - 49 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'utils'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/utils.ts:15 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | lib/utils.ts:3 |
| Performance | 6 | lib/utils.ts:1-49 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/utils.ts:1-49 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'utils' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.

### `lib/utils/relativeTime.ts` - 11 lines

**Purpose:** Module-level responsibility aligned with path role.
**Key imports:**
**Key exports:**
**Runtime dependencies:** Supabase/trpc/native modules where referenced.
**Reverse dependencies:** Select-String -Path .\**\*.ts,.\**\*.tsx -Pattern 'relativeTime'

**Scores (1-10, rubric-anchored):**
| Dimension | Score | Evidence (file:line) |
|---|---:|---|
| Correctness (happy path + edges) | 5 | lib/utils/relativeTime.ts:4 |
| Type safety | 6 | Select-String no hit |
| Error handling (no silent catches) | 5 | Select-String no hit |
| Loading / empty / error UI states | 5 | Select-String no hit |
| Design system compliance | 7 | Select-String no hit |
| Accessibility | 5 | Select-String no hit |
| Performance | 6 | lib/utils/relativeTime.ts:1-11 |
| Navigation hygiene (ROUTES) | 5 | Select-String no hit |
| Data layer hygiene (TRPC paths, invalidation) | 5 | Select-String no hit |
| Rules of Hooks | 6 | Select-String no hit |
| Single responsibility / file size | 7 | lib/utils/relativeTime.ts:1-11 |
| Test coverage | 3 | Select-String -Path tests/**,backend/** -Pattern 'relativeTime' |
| PostHog instrumentation | 3 | Select-String no hit |
| Sentry observability | 2 | Select-String no hit |
| Security (no secrets, RLS-aware) | 6 | Select-String no hit |

**Composite:** 3.6
**Current state (1-2 sentences):** Happy-path functional with uneven reliability and observability quality.
**Realistic ceiling:** 7-8 with module split, telemetry, and tests.
**Launch bar:** No silent catches, clear error UX, and one critical-path automated test.
**Top 3 issues with file:line:** none; none; none
**Recommended next action (one Cursor-prompt-sized unit):** Split responsibilities and add instrumented error handling around async branches.


