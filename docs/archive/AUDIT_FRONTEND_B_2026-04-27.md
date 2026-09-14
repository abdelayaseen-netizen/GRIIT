# GRIIT - Wave 3 Frontend (Auto + rubric - 2026-04-27)

**Method:** Each file was scored using static metrics from \docs\_audit-fe-heuristics.csv\ (per-file \Select-String\ / regex over file text) plus global facts: \
px tsc --noEmit\ exit 0; Wave 2 scan counts.

**Reverse dependency command (run per file, substitute \<NAME>\ and \<PATH>\):**
```powershell
$t = "<NAME>"; Get-ChildItem -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants,.\contexts,.\services,.\types,.\store -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -ne (Resolve-Path '<PATH>').Path } | Select-String -SimpleMatch $t
```


---
### `components\home\ExploreChallengesButton.tsx` - 47 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\ExploreChallengesButton.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\ExploreChallengesButton.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\ExploreChallengesButton.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=47 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\GoalCard.tsx` - 359 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=10, pressables=12, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\GoalCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\GoalCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\GoalCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=10, pressable=12 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=359 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\index.ts` - 8 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\index.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=8 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\NextUnlock.tsx` - 76 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\NextUnlock.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\NextUnlock.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\NextUnlock.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=76 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\PointsExplainer.tsx` - 173 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\PointsExplainer.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\PointsExplainer.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\PointsExplainer.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=173 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\StreakHero.tsx` - 170 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\StreakHero.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\StreakHero.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\StreakHero.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=170 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\WeekStrip.tsx` - 155 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\WeekStrip.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\WeekStrip.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\WeekStrip.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=155 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\InlineError.tsx` - 78 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\InlineError.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\InlineError.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\InlineError.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=4, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=78 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\LiveFeedSection.tsx` - 663 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=21, pressables=21, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\LiveFeedSection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\LiveFeedSection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\LiveFeedSection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 4 | Catch count 4 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 4 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=21, pressable=21 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=663 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\OfflineBanner.tsx` - 31 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\OfflineBanner.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\OfflineBanner.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\OfflineBanner.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=31 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\OnboardingFlow.tsx` - 148 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\OnboardingFlow.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\OnboardingFlow.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\OnboardingFlow.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=148 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\onboarding-theme.ts` - 125 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\onboarding-theme.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\onboarding-theme.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\onboarding-theme.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=125 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\ProgressDots.tsx` - 44 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\ProgressDots.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\ProgressDots.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\ProgressDots.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=44 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\screens\AutoSuggestChallengeScreen.tsx` - 313 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=10, pressables=11, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\screens\AutoSuggestChallengeScreen.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\screens\AutoSuggestChallengeScreen.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\screens\AutoSuggestChallengeScreen.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=10, pressable=11 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=313 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\screens\GoalSelection.tsx` - 118 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\screens\GoalSelection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\screens\GoalSelection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\screens\GoalSelection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=118 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\screens\ProfileSetup.tsx` - 298 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=9, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\screens\ProfileSetup.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\screens\ProfileSetup.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\screens\ProfileSetup.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=9, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=298 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\screens\SignUpScreen.tsx` - 293 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\screens\SignUpScreen.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\screens\SignUpScreen.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\screens\SignUpScreen.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=8, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=293 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\onboarding\screens\ValueSplash.tsx` - 175 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\onboarding\screens\ValueSplash.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\onboarding\screens\ValueSplash.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\onboarding\screens\ValueSplash.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=175 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\PremiumBadge.tsx` - 50 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\PremiumBadge.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\PremiumBadge.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\PremiumBadge.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=50 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\AchievementsSection.tsx` - 155 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\AchievementsSection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\AchievementsSection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\AchievementsSection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=155 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\BadgeDetailModal.tsx` - 121 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=3, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\BadgeDetailModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\BadgeDetailModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\BadgeDetailModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=3, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=121 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\CompletedChallengesSection.tsx` - 137 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\CompletedChallengesSection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\CompletedChallengesSection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\CompletedChallengesSection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=137 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\DisciplineCalendar.tsx` - 178 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\DisciplineCalendar.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\DisciplineCalendar.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\DisciplineCalendar.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=178 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\DisciplineGrowthCard.tsx` - 138 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\DisciplineGrowthCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\DisciplineGrowthCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\DisciplineGrowthCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=138 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\DisciplineScoreCard.tsx` - 136 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\DisciplineScoreCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\DisciplineScoreCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\DisciplineScoreCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=136 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\index.ts` - 22 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\index.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=22 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\LifetimeStatsCard.tsx` - 99 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\LifetimeStatsCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\LifetimeStatsCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\LifetimeStatsCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=99 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\ProfileCompletionCard.tsx` - 102 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\ProfileCompletionCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\ProfileCompletionCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\ProfileCompletionCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=102 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\ProfileHeader.tsx` - 216 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\ProfileHeader.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\ProfileHeader.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\ProfileHeader.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=8, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=216 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\ShareDisciplineCard.tsx` - 119 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\ShareDisciplineCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\ShareDisciplineCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\ShareDisciplineCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=119 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\SocialStatsCard.tsx` - 84 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\SocialStatsCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\SocialStatsCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\SocialStatsCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=84 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\profile\TierProgressBar.tsx` - 75 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\profile\TierProgressBar.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\profile\TierProgressBar.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\profile\TierProgressBar.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=75 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ProofShareCard.tsx` - 239 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ProofShareCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ProofShareCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ProofShareCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=6, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=239 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\settings\AccountDangerZone.tsx` - 180 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=12, pressables=10, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\settings\AccountDangerZone.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\settings\AccountDangerZone.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\settings\AccountDangerZone.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=12, pressable=10 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=180 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\settings\ReminderSection.tsx` - 292 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=5, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=16, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\settings\ReminderSection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\settings\ReminderSection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\settings\ReminderSection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 5 | Catch count 5 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 5 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=16, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=292 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\settings\settings-styles.ts` - 202 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\settings\settings-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\settings\settings-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\settings\settings-styles.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **6** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=202 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\settings\VisibilitySection.tsx` - 100 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\settings\VisibilitySection.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\settings\VisibilitySection.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\settings\VisibilitySection.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=100 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\share\ShareCards.tsx` - 769 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\share\ShareCards.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\share\ShareCards.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\share\ShareCards.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=769 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\share\ShareSheetModal.tsx` - 509 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=9, pressables=13, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\share\ShareSheetModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\share\ShareSheetModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\share\ShareSheetModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 4 | Catch count 4 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 4 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=9, pressable=13 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=509 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ShareCard.tsx` - 165 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ShareCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ShareCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ShareCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=165 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\Card.tsx` - 35 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\Card.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\Card.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\Card.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=5, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=35 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\CelebrationOverlay.tsx` - 322 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=9, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\CelebrationOverlay.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\CelebrationOverlay.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\CelebrationOverlay.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=8, pressable=9 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=322 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\ConfirmDialog.tsx` - 126 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=7, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\ConfirmDialog.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\ConfirmDialog.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\ConfirmDialog.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=7, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=126 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\ErrorState.tsx` - 45 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=3, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\ErrorState.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\ErrorState.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\ErrorState.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=3, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=45 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\FormInput.tsx` - 91 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\FormInput.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\FormInput.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\FormInput.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=4, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=91 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\ImageViewerModal.tsx` - 147 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\ImageViewerModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\ImageViewerModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\ImageViewerModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=4, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=147 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\LoadingState.tsx` - 29 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=1, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\LoadingState.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\LoadingState.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\LoadingState.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=1, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=29 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\ProofShareOverlay.tsx` - 20 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\ProofShareOverlay.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\ProofShareOverlay.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\ProofShareOverlay.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=20 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\ReportChallengeModal.tsx` - 228 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\ReportChallengeModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\ReportChallengeModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\ReportChallengeModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=5, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=228 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\shared\SectionHeader.tsx` - 46 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\shared\SectionHeader.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\shared\SectionHeader.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\shared\SectionHeader.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=46 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\index.ts` - 8 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\index.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=8 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonBase.tsx` - 87 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonBase.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonBase.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonBase.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=87 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonChallengeCard.tsx` - 43 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonChallengeCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonChallengeCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonChallengeCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=43 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonChallengeDetail.tsx` - 46 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonChallengeDetail.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonChallengeDetail.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonChallengeDetail.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=46 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonFeedCard.tsx` - 50 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonFeedCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonFeedCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonFeedCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=50 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonHeroCard.tsx` - 29 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonHeroCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonHeroCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonHeroCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=29 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonHomeChallengeCard.tsx` - 53 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonHomeChallengeCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonHomeChallengeCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonHomeChallengeCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=53 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonLeaderboardRow.tsx` - 34 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonLeaderboardRow.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonLeaderboardRow.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonLeaderboardRow.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=34 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\skeletons\SkeletonProfile.tsx` - 46 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\skeletons\SkeletonProfile.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\skeletons\SkeletonProfile.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\skeletons\SkeletonProfile.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=46 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\StreakFreezeModal.tsx` - 125 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\StreakFreezeModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\StreakFreezeModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\StreakFreezeModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=125 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\task\RunPickerColumn.tsx` - 78 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\task\RunPickerColumn.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\task\RunPickerColumn.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\task\RunPickerColumn.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=78 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\task\TaskCompleteCelebration.tsx` - 328 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=15, pressables=15, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\task\TaskCompleteCelebration.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\task\TaskCompleteCelebration.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\task\TaskCompleteCelebration.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=15, pressable=15 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=328 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\task\TaskCompleteForm.tsx` - 671 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=29, pressables=26, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\task\TaskCompleteForm.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\task\TaskCompleteForm.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\task\TaskCompleteForm.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=29, pressable=26 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=671 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\task\task-complete-styles.ts` - 494 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\task\task-complete-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\task\task-complete-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\task\task-complete-styles.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **6** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=494 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\task\VerificationGates.tsx` - 372 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\task\VerificationGates.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\task\VerificationGates.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\task\VerificationGates.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=4, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=372 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\TaskEditorModal.tsx` - 1680 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=20, pressables=17, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\TaskEditorModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\TaskEditorModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\TaskEditorModal.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=20, pressable=17 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=1680 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\TimeWindowPrompt.tsx` - 181 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\TimeWindowPrompt.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\TimeWindowPrompt.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\TimeWindowPrompt.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=6, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=181 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\Card.tsx` - 48 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\Card.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\Card.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\Card.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=48 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\CategoryTag.tsx` - 46 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\CategoryTag.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\CategoryTag.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\CategoryTag.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=46 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\ChallengeCard24h.tsx` - 169 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\ChallengeCard24h.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\ChallengeCard24h.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\ChallengeCard24h.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=169 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\ChallengeCardFeatured.tsx` - 244 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\ChallengeCardFeatured.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\ChallengeCardFeatured.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\ChallengeCardFeatured.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=244 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\ChallengeRowCard.tsx` - 165 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\ChallengeRowCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\ChallengeRowCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\ChallengeRowCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=165 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\Chip.tsx` - 116 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=9, pressables=4, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\Chip.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\Chip.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\Chip.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=9, pressable=4 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=116 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\CreateFlowCheckbox.tsx` - 58 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\CreateFlowCheckbox.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\CreateFlowCheckbox.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\CreateFlowCheckbox.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=4, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=58 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\CreateFlowHeader.tsx` - 105 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\CreateFlowHeader.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\CreateFlowHeader.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\CreateFlowHeader.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=105 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\CreateFlowInput.tsx` - 54 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\CreateFlowInput.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\CreateFlowInput.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\CreateFlowInput.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=4, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=54 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\DurationPill.tsx` - 48 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\DurationPill.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\DurationPill.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\DurationPill.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=48 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\EmptyState.tsx` - 133 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\EmptyState.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\EmptyState.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\EmptyState.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=133 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\EnforcementBlock.tsx` - 26 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\EnforcementBlock.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\EnforcementBlock.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\EnforcementBlock.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=26 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\GRIITWordmark.tsx` - 61 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\GRIITWordmark.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\GRIITWordmark.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\GRIITWordmark.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=61 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\index.ts` - 19 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\index.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=19 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\InitialCircle.tsx` - 36 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\InitialCircle.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\InitialCircle.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\InitialCircle.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=36 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\Input.tsx` - 37 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\Input.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\Input.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\Input.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=37 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\PrimaryButton.tsx` - 150 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=9, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\PrimaryButton.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\PrimaryButton.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\PrimaryButton.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=9, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=150 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\Screen.tsx` - 56 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\Screen.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\Screen.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\Screen.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=56 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\SearchBar.tsx` - 54 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\SearchBar.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\SearchBar.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\SearchBar.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=4, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=54 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\SectionHeader.tsx` - 43 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\SectionHeader.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\SectionHeader.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\SectionHeader.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=43 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ui\TaskTypeCard.tsx` - 92 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ui\TaskTypeCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ui\TaskTypeCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ui\TaskTypeCard.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=92 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `contexts\ApiContext.tsx` - 216 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'contexts\ApiContext.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### contexts\ApiContext.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'contexts\ApiContext.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=216 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `contexts\AppContext.tsx` - 441 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=7, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'contexts\AppContext.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### contexts\AppContext.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'contexts\AppContext.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 7 | Catch count 7 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 7 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=441 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `contexts\AuthContext.tsx` - 78 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'contexts\AuthContext.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### contexts\AuthContext.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'contexts\AuthContext.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=78 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `contexts\AuthGateContext.tsx` - 72 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'contexts\AuthGateContext.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### contexts\AuthGateContext.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'contexts\AuthGateContext.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=72 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `contexts\ThemeContext.tsx` - 22 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'contexts\ThemeContext.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### contexts\ThemeContext.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'contexts\ThemeContext.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=22 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.

