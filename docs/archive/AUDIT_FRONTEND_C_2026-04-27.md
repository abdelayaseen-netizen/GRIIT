# GRIIT - Wave 3 Frontend (Auto + rubric - 2026-04-27)

**Method:** Each file was scored using static metrics from \docs\_audit-fe-heuristics.csv\ (per-file \Select-String\ / regex over file text) plus global facts: \
px tsc --noEmit\ exit 0; Wave 2 scan counts.

**Reverse dependency command (run per file, substitute \<NAME>\ and \<PATH>\):**
```powershell
$t = "<NAME>"; Get-ChildItem -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants,.\contexts,.\services,.\types,.\store -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -ne (Resolve-Path '<PATH>').Path } | Select-String -SimpleMatch $t
```


---
### `hooks\useAppChallengeMutations.ts` - 268 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=5, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=True, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useAppChallengeMutations.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useAppChallengeMutations.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useAppChallengeMutations.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=268 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useCelebration.ts` - 67 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useCelebration.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useCelebration.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useCelebration.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=67 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useCreateChallengeWizardPersistence.ts` - 336 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useCreateChallengeWizardPersistence.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useCreateChallengeWizardPersistence.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useCreateChallengeWizardPersistence.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=336 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useDebounce.ts` - 13 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useDebounce.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useDebounce.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useDebounce.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=13 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useInlineError.ts` - 11 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useInlineError.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useInlineError.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useInlineError.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=11 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useJournalInput.ts` - 29 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useJournalInput.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useJournalInput.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useJournalInput.ts' -TotalCount 80

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
### `hooks\useJournalSubmit.ts` - 62 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useJournalSubmit.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useJournalSubmit.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useJournalSubmit.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=62 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useNetworkStatus.ts` - 39 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useNetworkStatus.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useNetworkStatus.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useNetworkStatus.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=39 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useNotificationScheduler.ts` - 173 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=10, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useNotificationScheduler.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useNotificationScheduler.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useNotificationScheduler.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 10 | Catch count 10 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 10 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 20 | File organization | **7** | LOC=173 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\usePhotoCapture.ts` - 86 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\usePhotoCapture.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\usePhotoCapture.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\usePhotoCapture.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=86 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useProStatus.ts` - 11 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useProStatus.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useProStatus.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useProStatus.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=11 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useScreenTracker.ts` - 26 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useScreenTracker.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useScreenTracker.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useScreenTracker.ts' -TotalCount 80

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
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useTaskCompleteScreen.tsx` - 795 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=3, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useTaskCompleteScreen.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useTaskCompleteScreen.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useTaskCompleteScreen.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 3 | Catch count 3 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 3 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=795 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useTaskCompleteShareCardProps.ts` - 188 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useTaskCompleteShareCardProps.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useTaskCompleteShareCardProps.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useTaskCompleteShareCardProps.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=188 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `hooks\useTaskTimer.ts` - 76 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'hooks\useTaskTimer.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### hooks\useTaskTimer.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'hooks\useTaskTimer.ts' -TotalCount 80

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
### `lib\active-task-timer.ts` - 117 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\active-task-timer.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\active-task-timer.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\active-task-timer.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=117 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\analytics.ts` - 150 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=True, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\analytics.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\analytics.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\analytics.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=150 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\api.test.ts` - 44 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\api.test.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\api.test.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\api.test.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **7** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=44 | 800+ = extract candidate |
| 21 | Tests | **6** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.9**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\api.ts` - 270 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=6, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\api.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\api.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\api.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 6 | Catch count 6 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 6 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=270 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\auth-expiry.ts` - 16 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\auth-expiry.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\auth-expiry.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\auth-expiry.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=16 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\auth-helpers.ts` - 31 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\auth-helpers.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\auth-helpers.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\auth-helpers.ts' -TotalCount 80

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
### `lib\avatar.ts` - 62 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\avatar.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\avatar.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\avatar.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=62 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\badge-descriptions.ts` - 45 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\badge-descriptions.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\badge-descriptions.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\badge-descriptions.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=45 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\build-task-config-param.ts` - 40 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\build-task-config-param.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\build-task-config-param.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\build-task-config-param.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=40 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\challenge-packs.ts` - 221 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\challenge-packs.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\challenge-packs.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\challenge-packs.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=221 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\challenge-timer.ts` - 38 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\challenge-timer.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\challenge-timer.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\challenge-timer.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=38 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\client-error-reporting.ts` - 26 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=True, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\client-error-reporting.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\client-error-reporting.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\client-error-reporting.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **5** | Sentry in file: True; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 23 | Observability | **5** | Sentry token in file: True | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\config.ts` - 28 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\config.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\config.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\config.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=28 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\constants\storage-keys.ts` - 20 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\constants\storage-keys.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\constants\storage-keys.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\constants\storage-keys.ts' -TotalCount 80

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
### `lib\create-challenge-helpers.ts` - 370 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\create-challenge-helpers.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\create-challenge-helpers.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\create-challenge-helpers.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=370 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\create-selection.ts` - 7 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\create-selection.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\create-selection.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\create-selection.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=7 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\date-utils.ts` - 63 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\date-utils.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\date-utils.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\date-utils.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=63 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\deep-links.ts` - 28 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\deep-links.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\deep-links.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\deep-links.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=28 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\derive-user-rank.ts` - 11 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\derive-user-rank.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\derive-user-rank.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\derive-user-rank.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=11 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\design-system.ts` - 867 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=411

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\design-system.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\design-system.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\design-system.ts' -TotalCount 80

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
| 10 | Design system - colors/spacing | **4** | rawHexCount=411 | lib\design-system.ts has raw hex per file regex count=411 |
| 11 | DS - font weights, raw hex | **4** | rawHexCount=411 | lib\design-system.ts has raw hex per file regex count=411 |
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=867 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\estimate-daily-time.ts` - 67 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\estimate-daily-time.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\estimate-daily-time.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\estimate-daily-time.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=67 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\feature-flags.ts` - 44 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\feature-flags.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\feature-flags.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\feature-flags.ts' -TotalCount 80

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
### `lib\formatTime.ts` - 8 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\formatTime.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\formatTime.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\formatTime.ts' -TotalCount 80

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
### `lib\formatTimeAgo.test.ts` - 44 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\formatTimeAgo.test.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\formatTimeAgo.test.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\formatTimeAgo.test.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **7** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
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
| 21 | Tests | **6** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.9**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\formatTimeAgo.ts` - 18 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\formatTimeAgo.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\formatTimeAgo.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\formatTimeAgo.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=18 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\geo.ts` - 19 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\geo.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\geo.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\geo.ts' -TotalCount 80

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
### `lib\live-activity.ts` - 138 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=4

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\live-activity.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\live-activity.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\live-activity.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 3 | Catch count 3 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 3 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **6** | isScreen=False | Not counted by static flag |
| 8 | Empty states | **6** | isScreen=False | Not counted by static flag |
| 9 | Error states | **6** | isScreen=False | Not counted by static flag |
| 10 | Design system - colors/spacing | **4** | rawHexCount=4 | lib\live-activity.ts has raw hex per file regex count=4 |
| 11 | DS - font weights, raw hex | **4** | rawHexCount=4 | lib\live-activity.ts has raw hex per file regex count=4 |
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

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\logger.ts` - 24 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=True, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\logger.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\logger.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\logger.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=24 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\mutations.ts` - 20 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\mutations.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\mutations.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\mutations.ts' -TotalCount 80

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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=20 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\notification-copy.ts` - 211 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\notification-copy.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\notification-copy.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\notification-copy.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=211 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\notifications.ts` - 661 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=7, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\notifications.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\notifications.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\notifications.ts' -TotalCount 80

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
| 20 | File organization | **5** | LOC=661 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\onboarding-pending.ts` - 41 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\onboarding-pending.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\onboarding-pending.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\onboarding-pending.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=41 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\posthog.ts` - 33 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=True, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\posthog.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\posthog.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\posthog.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=33 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\prefetch-queries.ts` - 38 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\prefetch-queries.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\prefetch-queries.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\prefetch-queries.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=38 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\premium.ts` - 33 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\premium.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\premium.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\premium.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=33 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\profile-badges.tsx` - 32 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\profile-badges.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\profile-badges.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\profile-badges.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=32 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\profile-display.ts` - 23 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\profile-display.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\profile-display.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\profile-display.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=23 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\query-client.ts` - 26 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\query-client.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\query-client.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\query-client.ts' -TotalCount 80

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
### `lib\quotes.ts` - 56 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\quotes.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\quotes.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\quotes.ts' -TotalCount 80

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
### `lib\register-push-token.ts` - 74 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\register-push-token.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\register-push-token.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\register-push-token.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=74 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\revenue-cat.ts` - 20 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\revenue-cat.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\revenue-cat.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\revenue-cat.ts' -TotalCount 80

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
### `lib\review-prompt.ts` - 55 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\review-prompt.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\review-prompt.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\review-prompt.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=55 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\routes.ts` - 51 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\routes.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\routes.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\routes.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=51 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\sanitize.ts` - 45 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\sanitize.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\sanitize.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\sanitize.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=45 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\scoring.ts` - 7 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\scoring.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\scoring.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\scoring.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=7 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\sentry.ts` - 59 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=True, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=True, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\sentry.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\sentry.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\sentry.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **6** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: True; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 20 | File organization | **7** | LOC=59 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **5** | Sentry token in file: True | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\share.ts` - 182 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\share.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\share.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\share.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=182 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\signout-cleanup.ts` - 27 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\signout-cleanup.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\signout-cleanup.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\signout-cleanup.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=27 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\subscription.ts` - 236 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=6, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\subscription.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\subscription.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\subscription.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 6 | Catch count 6 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 6 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 20 | File organization | **7** | LOC=236 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\supabase.ts` - 18 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\supabase.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\supabase.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\supabase.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=18 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\task-hard-verification.ts` - 16 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\task-hard-verification.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\task-hard-verification.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\task-hard-verification.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=16 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\task-helpers.ts` - 98 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\task-helpers.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\task-helpers.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\task-helpers.ts' -TotalCount 80

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
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=98 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\task-progress.ts` - 139 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\task-progress.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\task-progress.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\task-progress.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=139 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\colors.ts` - 29 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\colors.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\colors.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\colors.ts' -TotalCount 80

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
### `lib\theme\createFlowStyles.ts` - 69 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\createFlowStyles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\createFlowStyles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\createFlowStyles.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=69 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\index.ts` - 7 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\index.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=7 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\radius.ts` - 11 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\radius.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\radius.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\radius.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=11 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\shadows.ts` - 21 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\shadows.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\shadows.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\shadows.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=21 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\shared-styles.ts` - 42 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\shared-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\shared-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\shared-styles.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=42 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\spacing.ts` - 12 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\spacing.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\spacing.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\spacing.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=12 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\tokens.ts` - 192 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\tokens.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\tokens.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\tokens.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=192 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme\typography.ts` - 16 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme\typography.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme\typography.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme\typography.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=16 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\theme-palettes.ts` - 114 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\theme-palettes.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\theme-palettes.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\theme-palettes.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=114 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\time-enforcement.test.ts` - 65 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\time-enforcement.test.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\time-enforcement.test.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\time-enforcement.test.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **7** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
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
| 20 | File organization | **7** | LOC=65 | 800+ = extract candidate |
| 21 | Tests | **6** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.9**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\time-enforcement.ts` - 169 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\time-enforcement.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\time-enforcement.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\time-enforcement.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=169 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\trpc.ts` - 107 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\trpc.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\trpc.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\trpc.ts' -TotalCount 80

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
| 12 | Accessibility - labels | **8** | a11yTokenLines=0, pressable=0 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=107 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\trpc-errors.test.ts` - 31 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\trpc-errors.test.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\trpc-errors.test.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\trpc-errors.test.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **7** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=31 | 800+ = extract candidate |
| 21 | Tests | **6** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.9**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\trpc-errors.ts` - 33 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\trpc-errors.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\trpc-errors.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\trpc-errors.ts' -TotalCount 80

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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=33 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\trpc-paths.ts` - 144 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\trpc-paths.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\trpc-paths.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\trpc-paths.ts' -TotalCount 80

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
| 17 | Data - tRPC and cache | **6** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=144 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\uploadAvatar.ts` - 111 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\uploadAvatar.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\uploadAvatar.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\uploadAvatar.ts' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 3 | Catch count 3 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 3 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
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
| 20 | File organization | **7** | LOC=111 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\uploadProofImage.ts` - 136 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\uploadProofImage.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\uploadProofImage.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\uploadProofImage.ts' -TotalCount 80

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

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\utils.ts` - 49 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\utils.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\utils.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\utils.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=49 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `lib\utils\relativeTime.ts` - 11 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'lib\utils\relativeTime.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### lib\utils\relativeTime.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'lib\utils\relativeTime.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=11 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `types\index.ts` - 596 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'types\index.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### types\index.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'types\index.ts' -TotalCount 80

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
| 20 | File organization | **5** | LOC=596 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `types\netinfo.d.ts` - 9 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'types\netinfo.d.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### types\netinfo.d.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'types\netinfo.d.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=9 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `types\react-native-purchases.d.ts` - 37 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'types\react-native-purchases.d.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### types\react-native-purchases.d.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'types\react-native-purchases.d.ts' -TotalCount 80

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

