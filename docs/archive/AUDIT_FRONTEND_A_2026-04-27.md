# GRIIT - Wave 3 Frontend (Auto + rubric - 2026-04-27)

**Method:** Each file was scored using static metrics from \docs\_audit-fe-heuristics.csv\ (per-file \Select-String\ / regex over file text) plus global facts: \
px tsc --noEmit\ exit 0; Wave 2 scan counts.

**Reverse dependency command (run per file, substitute \<NAME>\ and \<PATH>\):**
```powershell
$t = "<NAME>"; Get-ChildItem -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants,.\contexts,.\services,.\types,.\store -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' -and $_.FullName -ne (Resolve-Path '<PATH>').Path } | Select-String -SimpleMatch $t
```


---
### `app\(tabs)\_layout.tsx` - 155 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=True, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: True; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=155 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **5** | Sentry token in file: True | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\activity.tsx` - 65 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\activity.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\activity.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\activity.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=5, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=65 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\create.tsx` - 16 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\create.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\create.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\create.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\discover.tsx` - 899 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=10, pressables=11, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\discover.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\discover.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\discover.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=10, pressable=11 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=899 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\index.tsx` - 1016 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=17, pressables=18, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\index.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\index.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\index.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=17, pressable=18 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=1016 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\profile.tsx` - 939 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=24, pressables=26, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\profile.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\profile.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\profile.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=24, pressable=26 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=939 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\(tabs)\teams.tsx` - 46 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\(tabs)\teams.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\(tabs)\teams.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\(tabs)\teams.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=46 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\_layout.tsx` - 428 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=True, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **5** | Sentry in file: True; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=428 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **5** | Sentry token in file: True | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\+not-found.tsx` - 53 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\+not-found.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\+not-found.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\+not-found.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=53 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\accountability.tsx` - 431 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=4, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=14, pressables=15, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\accountability.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\accountability.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\accountability.tsx' -TotalCount 80

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
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=14, pressable=15 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=431 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\accountability\add.tsx` - 242 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\accountability\add.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\accountability\add.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\accountability\add.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=5, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=242 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\api\health+api.ts` - 12 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\api\health+api.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\api\health+api.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\api\health+api.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=12 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\api\trpc\[trpc]+api.ts` - 51 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\api\trpc\[trpc]+api.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\api\trpc\[trpc]+api.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\api\trpc\[trpc]+api.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=51 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\auth\_layout.tsx` - 10 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\auth\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\auth\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\auth\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=10 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\auth\forgot-password.tsx` - 188 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=7, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\auth\forgot-password.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\auth\forgot-password.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\auth\forgot-password.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=7, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=188 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\auth\login.tsx` - 438 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=16, pressables=15, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\auth\login.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\auth\login.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\auth\login.tsx' -TotalCount 80

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
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=16, pressable=15 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=438 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\auth\signup.tsx` - 535 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=14, pressables=11, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\auth\signup.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\auth\signup.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\auth\signup.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=14, pressable=11 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=535 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\challenge\[id].tsx` - 1505 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=12, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=35, pressables=32, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\challenge\[id].tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\challenge\[id].tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\challenge\[id].tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 12 | Catch count 12 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 12 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=35, pressable=32 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=1505 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\challenge\active\[activeChallengeId].tsx` - 643 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=12, pressables=13, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\challenge\active\[activeChallengeId].tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\challenge\active\[activeChallengeId].tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\challenge\active\[activeChallengeId].tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=12, pressable=13 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=643 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\challenge\complete.tsx` - 314 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\challenge\complete.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\challenge\complete.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\challenge\complete.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=6, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=314 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\create\_layout.tsx` - 4 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\create\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\create\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\create\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=4 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\create\index.tsx` - 5 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\create\index.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\create\index.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\create\index.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=5 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\create-challenge.tsx` - 13 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\create-challenge.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\create-challenge.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\create-challenge.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\create-profile.tsx` - 314 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\create-profile.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\create-profile.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\create-profile.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 2 | Catch count 2 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 2 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=5, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=314 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\edit-profile.tsx` - 274 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\edit-profile.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\edit-profile.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\edit-profile.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=274 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\follow-list.tsx` - 310 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=7, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\follow-list.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\follow-list.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\follow-list.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=7, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=310 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\invite\[code].tsx` - 35 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\invite\[code].tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\invite\[code].tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\invite\[code].tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=35 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\legal\_layout.tsx` - 9 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\legal\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\legal\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\legal\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\legal\privacy-policy.tsx` - 47 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\legal\privacy-policy.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\legal\privacy-policy.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\legal\privacy-policy.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=47 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\legal\terms.tsx` - 48 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\legal\terms.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\legal\terms.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\legal\terms.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\onboarding\_layout.tsx` - 14 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\onboarding\_layout.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\onboarding\_layout.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\onboarding\_layout.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=14 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\onboarding\index.tsx` - 13 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\onboarding\index.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\onboarding\index.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\onboarding\index.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\paywall.tsx` - 626 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=12, pressables=12, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\paywall.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\paywall.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\paywall.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=12, pressable=12 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=626 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\post\[id].tsx` - 557 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=20, pressables=21, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\post\[id].tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\post\[id].tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\post\[id].tsx' -TotalCount 80

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
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=20, pressable=21 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=557 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\profile\[username].tsx` - 888 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=True, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=21, pressables=22, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\profile\[username].tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\profile\[username].tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\profile\[username].tsx' -TotalCount 80

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
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=21, pressable=22 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=888 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\settings.tsx` - 360 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=6, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=14, pressables=15, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\settings.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\settings.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\settings.tsx' -TotalCount 80

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
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=14, pressable=15 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=360 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\task\checkin.tsx` - 594 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\task\checkin.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\task\checkin.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\task\checkin.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 1 | Catch count 1 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **4** | Sentry in file: False; catch: 1 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **5** | a11yTokenLines=6, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=594 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.3**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\task\checkin-styles.ts` - 324 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\task\checkin-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\task\checkin-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\task\checkin-styles.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=324 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\task\complete.tsx` - 14 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\task\complete.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\task\complete.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\task\complete.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
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
| 20 | File organization | **7** | LOC=14 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\task\run.tsx` - 912 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=26, pressables=25, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\task\run.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\task\run.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\task\run.tsx' -TotalCount 80

**Runtime dependencies (tables / tRPC / env):** Scan this file text for trpc, EXPO_PUBLIC, supabase, from(

**What depends on this file:** Use Select-String across app, components, lib, hooks, store for the module name or @/ import path of this file.

**DETAILED SCORE TABLE:**

| # | Dimension | Score | Evidence | Quoted code (file:line) |
|---|---|---:|---|---|
| 1 | Correctness - happy path | **6** | Default screen or lib tier; global tsc | npx tsc --noEmit exit 0 (wave 2.1 session) |
| 2 | Correctness - edge cases | **5** | catch count = 0 | Catch count 0 from column Catch in docs\_audit-fe-heuristics.csv (same regex as generator: catch\s*\() |
| 3 | Type safety - escape hatches | **8** | typeEscape flag = False | Column Escape in docs\_audit-fe-heuristics.csv |
| 4 | Type safety - explicit params/returns | **6** | Default 6 without per-export proof | tsconfig strictness not expanded per symbol in this run |
| 5 | Error handling - try/catch and Sentry | **6** | Sentry in file: False; catch: 0 | If catch gt 0 and Sentry false, rubric caps handling at 5 |
| 6 | Error handling - network | **5** | Not isolated per file | TRPC client in lib/trpc and contexts |
| 7 | Loading states | **5** | isScreen=True | Not counted by static flag |
| 8 | Empty states | **5** | isScreen=True | Not counted by static flag |
| 9 | Error states | **5** | isScreen=True | Not counted by static flag |
| 10 | Design system - colors/spacing | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 11 | DS - font weights, raw hex | **7** | rawHexCount=0 | No #rrggbb pattern match in file text |
| 12 | Accessibility - labels | **7** | a11yTokenLines=26, pressable=25 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=912 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `app\task\run-styles.ts` - 544 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'app\task\run-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### app\task\run-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'app\task\run-styles.ts' -TotalCount 80

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
| 20 | File organization | **5** | LOC=544 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\activity\activity-styles.ts` - 446 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\activity\activity-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\activity\activity-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\activity\activity-styles.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=446 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\activity\LeaderboardTab.tsx` - 722 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=22, pressables=24, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\activity\LeaderboardTab.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\activity\LeaderboardTab.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\activity\LeaderboardTab.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=22, pressable=24 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **5** | LOC=722 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\activity\NotificationsTab.tsx` - 317 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=3, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=10, pressables=12, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\activity\NotificationsTab.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\activity\NotificationsTab.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\activity\NotificationsTab.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=10, pressable=12 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=317 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\activity\types.ts` - 26 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\activity\types.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\activity\types.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\activity\types.ts' -TotalCount 80

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
### `components\AnalyticsBootstrap.tsx` - 17 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=True, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\AnalyticsBootstrap.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\AnalyticsBootstrap.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\AnalyticsBootstrap.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=17 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **6** | PostHog/Analytics in file: True | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.8**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\AuthGateModal.tsx` - 171 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=6, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\AuthGateModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\AuthGateModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\AuthGateModal.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=5, pressable=6 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=171 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\Avatar.tsx` - 65 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\Avatar.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\Avatar.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\Avatar.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=65 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\Celebration.tsx` - 268 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\Celebration.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\Celebration.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\Celebration.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=268 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\challengeDetailScreenStyles.ts` - 1152 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\challengeDetailScreenStyles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\challengeDetailScreenStyles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\challengeDetailScreenStyles.ts' -TotalCount 80

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
| 20 | File organization | **4** | LOC=1152 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\ChallengeHero.tsx` - 139 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\ChallengeHero.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\ChallengeHero.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\ChallengeHero.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=139 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\challengeInfoChip.tsx` - 19 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\challengeInfoChip.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\challengeInfoChip.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\challengeInfoChip.tsx' -TotalCount 80

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
### `components\challenge\ChallengeLeaderboard.tsx` - 41 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\ChallengeLeaderboard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\ChallengeLeaderboard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\ChallengeLeaderboard.tsx' -TotalCount 80

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
### `components\challenge\challengeSocialAvatars.tsx` - 23 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\challengeSocialAvatars.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\challengeSocialAvatars.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\challengeSocialAvatars.tsx' -TotalCount 80

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
### `components\challenge\ChallengeStats.tsx` - 27 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\ChallengeStats.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\ChallengeStats.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\ChallengeStats.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=27 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\ChallengeTodayGoals.tsx` - 14 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\ChallengeTodayGoals.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\ChallengeTodayGoals.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\ChallengeTodayGoals.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=14 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\LogProgressModal.tsx` - 190 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=9, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\LogProgressModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\LogProgressModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\LogProgressModal.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=190 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\SharedGoalProgress.tsx` - 292 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\SharedGoalProgress.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\SharedGoalProgress.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\SharedGoalProgress.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=292 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenge\TeamMemberList.tsx` - 200 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenge\TeamMemberList.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenge\TeamMemberList.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenge\TeamMemberList.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=200 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenges\HeroFeaturedCard.tsx` - 132 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenges\HeroFeaturedCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenges\HeroFeaturedCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenges\HeroFeaturedCard.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=132 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\challenges\JoinCelebrationModal.tsx` - 175 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=2, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=5, pressables=8, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\challenges\JoinCelebrationModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\challenges\JoinCelebrationModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\challenges\JoinCelebrationModal.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=5, pressable=8 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=175 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\CommitModal.tsx` - 155 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\CommitModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\CommitModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\CommitModal.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=155 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\CreateChallengeWizard.tsx` - 456 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\CreateChallengeWizard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\CreateChallengeWizard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\CreateChallengeWizard.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=4, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=456 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\DraftExitModal.tsx` - 58 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=12, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\DraftExitModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\DraftExitModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\DraftExitModal.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=8, pressable=12 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **4** | routerUse=True, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=58 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\NewTaskModal.tsx` - 1838 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=58, pressables=23, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\NewTaskModal.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\NewTaskModal.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\NewTaskModal.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **7** | a11yTokenLines=58, pressable=23 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **4** | LOC=1838 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.5**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\steps\StepBasics.tsx` - 184 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=11, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\steps\StepBasics.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\steps\StepBasics.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\steps\StepBasics.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **7** | a11yTokenLines=11, pressable=7 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=184 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\steps\StepReview.tsx` - 265 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=7, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\steps\StepReview.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\steps\StepReview.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\steps\StepReview.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=265 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\steps\StepRules.tsx` - 215 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=11, pressables=9, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\steps\StepRules.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\steps\StepRules.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\steps\StepRules.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **7** | a11yTokenLines=11, pressable=9 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=215 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\steps\StepTasks.tsx` - 124 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=7, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\steps\StepTasks.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\steps\StepTasks.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\steps\StepTasks.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=124 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\wizard-shared.tsx` - 89 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=4, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\wizard-shared.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\wizard-shared.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\wizard-shared.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=89 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\WizardStepFooter.tsx` - 118 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=14, pressables=15, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\WizardStepFooter.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\WizardStepFooter.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\WizardStepFooter.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=14, pressable=15 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=118 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\create\wizard-styles.ts` - 304 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\create\wizard-styles.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\create\wizard-styles.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\create\wizard-styles.ts' -TotalCount 80

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
| 20 | File organization | **7** | LOC=304 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\discover\ActivityTicker.tsx` - 187 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\discover\ActivityTicker.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\discover\ActivityTicker.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\discover\ActivityTicker.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=187 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\discover\CompactChallengeRow.tsx` - 161 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\discover\CompactChallengeRow.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\discover\CompactChallengeRow.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\discover\CompactChallengeRow.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=161 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\discover\DiscoverChallengeCards.tsx` - 309 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\discover\DiscoverChallengeCards.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\discover\DiscoverChallengeCards.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\discover\DiscoverChallengeCards.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=309 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\discover\FilterChips.tsx` - 74 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\discover\FilterChips.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\discover\FilterChips.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\discover\FilterChips.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=74 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\discover\PickedForYou.tsx` - 196 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\discover\PickedForYou.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\discover\PickedForYou.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\discover\PickedForYou.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=196 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ErrorBoundary.tsx` - 95 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=True, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=1

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ErrorBoundary.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ErrorBoundary.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ErrorBoundary.tsx' -TotalCount 80

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
| 10 | Design system - colors/spacing | **4** | rawHexCount=1 | components\ErrorBoundary.tsx has raw hex per file regex count=1 |
| 11 | DS - font weights, raw hex | **4** | rawHexCount=1 | components\ErrorBoundary.tsx has raw hex per file regex count=1 |
| 12 | Accessibility - labels | **5** | a11yTokenLines=2, pressable=3 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=95 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **5** | Sentry token in file: True | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.4**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\ErrorRetry.tsx` - 54 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=3, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\ErrorRetry.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\ErrorRetry.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\ErrorRetry.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=54 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\feed\FeedCardHeader.tsx` - 175 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=7, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\FeedCardHeader.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\FeedCardHeader.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\FeedCardHeader.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=175 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\feed\FeedEngagementRow.tsx` - 119 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=8, pressables=9, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\FeedEngagementRow.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\FeedEngagementRow.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\FeedEngagementRow.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **5** | a11yTokenLines=8, pressable=9 | Token count from same regex as wave 2.18 |
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

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\feed\FeedPostCard.tsx` - 398 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=5, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\FeedPostCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\FeedPostCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\FeedPostCard.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **7** | a11yTokenLines=6, pressable=5 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **6** | routerUse=False, ROUTES=False | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=398 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\feed\feedTypes.ts` - 36 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\feedTypes.ts' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\feedTypes.ts

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\feedTypes.ts' -TotalCount 80

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
### `components\feed\MilestonePostCard.tsx` - 128 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\MilestonePostCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\MilestonePostCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\MilestonePostCard.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=128 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\feed\WhoRespectedSheet.tsx` - 200 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=6, pressables=6, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\feed\WhoRespectedSheet.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\feed\WhoRespectedSheet.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\feed\WhoRespectedSheet.tsx' -TotalCount 80

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
| 12 | Accessibility - labels | **7** | a11yTokenLines=6, pressable=6 | Token count from same regex as wave 2.18 |
| 13 | Accessibility - hitSlop | **5** | Not in heuristics CSV | No wave-2 count |
| 14 | Performance - memo and callback | **5** | Not in heuristics | n/a |
| 15 | Performance - lists | **5** | Not in heuristics | n/a |
| 16 | Navigation - ROUTES | **7** | routerUse=True, ROUTES=True | 150 router calls repo-wide (wave 2.8); this file flags only |
| 17 | Data - tRPC and cache | **5** | Filename pattern only in this generator | lib\trpc-paths.ts and ApiContext for callers |
| 18 | Optimistic updates | **4** | Default 4 | Not detected in heuristics |
| 19 | Hooks rules | **6** | Default 6 | ESLint react-hooks not run in this audit |
| 20 | File organization | **7** | LOC=200 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\ActiveChallenges.tsx` - 183 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=1, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\ActiveChallenges.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\ActiveChallenges.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\ActiveChallenges.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=183 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\ActiveTaskCard.tsx` - 131 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\ActiveTaskCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\ActiveTaskCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\ActiveTaskCard.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=131 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\ChallengeCard.tsx` - 207 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\ChallengeCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\ChallengeCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\ChallengeCard.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=207 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\DailyBonus.tsx` - 102 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=0, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\DailyBonus.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\DailyBonus.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\DailyBonus.tsx' -TotalCount 80

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
### `components\home\DailyQuote.tsx` - 50 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=1, pressables=0, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\DailyQuote.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\DailyQuote.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\DailyQuote.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=50 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.7**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\DailyStatus.tsx` - 149 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\DailyStatus.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\DailyStatus.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\DailyStatus.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=149 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\DiscoverCTA.tsx` - 68 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=False, ROUTES=False, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\DiscoverCTA.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\DiscoverCTA.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\DiscoverCTA.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=68 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.


---
### `components\home\EmptyChallengesCard.tsx` - 69 lines

**Heuristic key (from docs\_audit-fe-heuristics.csv):** catch=0, Sentry=False, PostHog/Analytics=False, routerUse=True, ROUTES=True, typeEscape=False, console=False, Alert=False, a11yTokenLines=2, pressables=3, rawHexCount=0

**What this file does (2-3 sentences):** Full prose requires reading the file body; default export name appears in docs\_audit-fe-exports.txt for this path.

**Every export from this file:** Run: Select-String -LiteralPath 'components\home\EmptyChallengesCard.tsx' -Pattern '^\s*export'. Excerpt block: docs\_audit-fe-exports.txt under heading ### components\home\EmptyChallengesCard.tsx

**Every import (grouped):** Run: Get-Content -LiteralPath 'components\home\EmptyChallengesCard.tsx' -TotalCount 80

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
| 20 | File organization | **7** | LOC=69 | 800+ = extract candidate |
| 21 | Tests | **3** | if test file | else no test |
| 22 | Analytics | **4** | PostHog/Analytics in file: False | Rubric: no events in file => max 6 |
| 23 | Observability | **3** | Sentry token in file: False | User screens often use helpers |
| 24 | Security | **7** | No secret literals in heuristics | Search EXPO_PUBLIC in this file manually |

**Composite score (avg of 24):** **5.6**

**Every issue with fix (minimum):** If \awHexCount\>0, replace inline \#rrggbb\ with \DS_COLORS\ token from \lib/design-system.ts\ (see \ErrorBoundary\). If \outerUse\ and not \ROUTES\, replace string paths with \lib/routes.ts\.

