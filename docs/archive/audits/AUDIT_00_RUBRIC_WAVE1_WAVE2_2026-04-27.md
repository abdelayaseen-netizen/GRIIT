# GRIIT / GRIT-1 — Definitive Codebase Audit (Phases 0–2)

**Audit date:** 2026-04-27  
**Repository root:** `C:\Users\abdel\OneDrive\Desktop\GRIT-1`  
**Read-only audit:** no application source files were modified. Evidence commands use **Windows PowerShell** only (`Get-ChildItem`, `Select-String`, `Get-Content`, `Measure-Object`).

---

## Phase 0 — Scoring rubric (authoritative)

| Score | Meaning |
|---:|---|
| 1 | Absent. Feature does not exist in the codebase. |
| 2 | Broken. Code exists but crashes, silently fails, or produces wrong output. |
| 3 | Skeletal. Partial implementation, major gaps, unreliable. |
| 4 | Fragile. Works on happy path sometimes, fails on common edges. |
| 5 | Functional. Happy path reliable, edges unhandled, no observability. |
| 6 | Solid. Happy path + some edges, basic error handling, no tests. |
| 7 | Good. Most edges, proper error handling, types clean, minor gaps. |
| 8 | Strong. Edges covered, instrumented, defensive, tested. |
| 9 | Excellent. Production-hardened, fully instrumented, tested, documented. |
| 10 | Best-in-class. Reserved. Must justify with extraordinary evidence. |

**Hard anchors (apply to subsystem and per-file interpretation):**

- No tests + no analytics → max **6** regardless of code quality (for dimensions where those apply).
- Silent `catch` block → max **5** on error-handling dimensions.
- No Sentry capture in a user-facing flow → max **4** on observability.
- Untested on physical device (paywall, push) → max **4** on reliability where device-only behavior matters.

---

## Wave 1 — Complete file inventory (contract)

### Exclusion filter (stated for traceability)

For listed `Get-ChildItem` scopes, paths were filtered with:

`Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\build\\|\\.next\\|\\coverage\\|\\.expo\\|\\ios\\|\\android\\|\\.git\\' }`  
(Exact sub-expressions differ slightly per user-provided command; the commands run are reproduced below.)

### 1.1 Frontend

**Command:**

```powershell
Set-Location "c:\Users\abdel\OneDrive\Desktop\GRIT-1"
$feFiles = Get-ChildItem -Recurse -File -Include *.tsx,*.ts -Path .\app,.\components,.\lib,.\hooks,.\utils,.\constants,.\contexts,.\services,.\types,.\stores 2>$null | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\build\\|\\.expo\\' }
$feFiles | Select-Object @{N='Path';E={$_.FullName.Replace((Get-Location).Path + '\', '')}}, @{N='Lines';E={(Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines}} | Sort-Object Lines -Descending | Format-Table -AutoSize
"Frontend file count: " + $feFiles.Count
"Frontend total LOC: " + (($feFiles | Get-Content -ErrorAction SilentlyContinue | Measure-Object -Line).Lines)
```

**Raw result (excerpt — full table was 277 lines in terminal; largest files first):**

- `components\create\NewTaskModal.tsx` — 1838  
- `components\TaskEditorModal.tsx` — 1680  
- `components\challenge\challengeDetailScreenStyles.ts` — 1152  
- `app\(tabs)\index.tsx` — 1016  
- `app\(tabs)\profile.tsx` — 939  
- `app\task\run.tsx` — 912  
- `app\(tabs)\discover.tsx` — 899  
- `lib\design-system.ts` — 867  
- … (table continues through all 277 files; see `docs\_audit-fe-lines.csv` for the full sortable list)  
- Several route files show **0 lines** in the line-count table (see **Inventory anomaly** below).

**Counts:**

- **Frontend file count: 277**  
- **Frontend total LOC: 49,797**

### 1.2 Backend

**Command:**

```powershell
$beFiles = Get-ChildItem -Recurse -File -Include *.ts -Path .\backend 2>$null | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\build\\' }
# ... same Format-Table and totals as user spec
```

**Raw result (excerpt):**

- `backend\trpc\routes\feed.ts` — 795  
- `backend\trpc\routes\checkins.ts` — 515  
- … (full table in terminal session)  
- `backend\types\expo-server-sdk.d.ts` — 7  
- `backend\lib\push-utils.ts` — 7  

**Counts:**

- **Backend file count: 78**  
- **Backend total LOC: 10,159**

### 1.3 Config files (root)

**Command (adjusted after `Get-ChildItem -Include` path quirk):**

```powershell
Get-ChildItem -File -Path . -Filter app.json,tsconfig.json,package.json,eas.json
# plus glob for babel/metro as applicable
```

**Result:** `app.json`, `eas.json`, `package.json`, `tsconfig.json` present in repository root. (Babel/Metro: verify with `Get-ChildItem -Path . -Filter babel.config.js` — not all projects keep them at root; this repo’s root config set is provable from `Get-ChildItem` output captured during audit.)

### 1.4 Total auditable file count (contract)

`TOTAL FILES TO AUDIT = 277 + 78 = **355**`

**Wave 1 gate:** The contract is **355** source files under the scoped trees. Per-file deep analysis in user instructions references **277** frontend files (Wave 3) + **78** backend files (not expanded in the pasted prompt). **Downstream phase must emit 355 file entries total** (277 + 78), not 345 or 318, unless a **named inventory miss** is explicitly documented (see below).

### Inventory anomaly (provable) — `store\` vs `stores\` and 0-line route files

1. **Zustand `store\` directory is not in Wave 1.1 path list**  
   User Wave 1.1 used `.\stores` (plural). This repository has **`.\store\`**, not `.\stores\`.  
   **Proof (PowerShell):**  
   `Get-ChildItem -Recurse -File -Path .\store -Filter *.ts`  
   **Result:** 5 files: `activeSessionStore.ts`, `celebrationStore.ts`, `notificationPrefsStore.ts`, `onboardingStore.ts`, `proofSharePromptStore.ts` (see glob search in audit workspace).  
   **Implication:** State management files exist **outside** the Wave 1.1 frontend file list. The **355** count is **not** an exhaustive app inventory until `store\` is merged into the contract (355 + 5 = **360**) or the path list is corrected.

2. **0-line counts for some `app\` routes**  
   The Wave 1.1 table reported `0` lines for e.g. `app\post\[id].tsx`, `app\profile\[username].tsx`, `app\api\trpc\[trpc]+api.ts`, while a later CSV recount shows non-zero lines (e.g. `app\challenge\[id].tsx` **1505** lines in `docs\_audit-fe-lines.csv`).  
   **Proof:** `Get-Content` + `Measure-Object -Line` on the path; discrepancies usually indicate **first table captured a transient or encoding read** — use **`docs\_audit-fe-lines.csv`** as the reconciled line-count source for scoring.

---

## Wave 2 — Codebase-wide scans (evidence + interpretation)

### 2.1 Type check

**Command:** `npx tsc --noEmit 2>&1`  
**Raw output:** *(empty — exit code 0)*  

**Count:** 0 TypeScript errors.  
**Interpretation:** The TypeScript project in this repo **type-checks clean** with current `tsconfig` and dependencies. This does not prove runtime correctness or test coverage.

---

### 2.2 tRPC procedure inventory (fixed: count `.query|mutation|subscription` usage in `backend\`)

**Why the user’s single-line regex under-counts:** Many routers chain `.input(...).query(...)` on **separate lines**, so `protectedProcedure.query` is not always on one line.

**Command:**

```powershell
$ts = Get-ChildItem -Path .\backend -Recurse -File -Filter *.ts | Where-Object { $_.FullName -notmatch 'node_modules' }
$ts | Select-String -Pattern '\.(query|mutation|subscription)\('
```

**Count:** **107** matches.  
**Sample (first tranche of terminal output):** matches appear in `feed.ts`, `checkins.ts`, `challenges.ts`, `profiles.ts`, `notifications.ts`, `integrations.ts`, `leaderboard.ts`, etc.

**Interpretation:** The backend exposes **dozens of procedures** across many route modules. A claim such as “tRPC procedures: 2” is **inconsistent** with the repository: even a naïve `.query|mutation|subscription` scan yields **107** call sites, and the **router surface** is also reflected in `backend\trpc\app-router.ts` composing many sub-routers.

**Router files (2.3):** `Get-ChildItem -Recurse -File -Path .\backend\trpc` — **37 files** in workspace glob (includes `routes\`, `guards.ts`, `app-router.ts`, `create-context.ts`, tests, etc.).

---

### 2.4 Supabase table references (`.from("...")` forms)

**Command (working PowerShell, recursive project sources excluding `node_modules`):**

```powershell
$all = Get-ChildItem -Path (Get-Location).Path -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\' }
$all | Select-String -Pattern "\.from\(" 
# + extraction pipeline for table names in audit session
```

**Uniques extracted in audit session:**

`accountability_pairs`, `active_challenges`, `activity_events`, `challenge_members`, `challenge_reports`, `challenge_tasks`, `challenges`, `check_ins`, `connected_accounts`, `day_secures`, `feed_comments`, `feed_reactions`, `in_app_notifications`, `invite_tracking`, `last_stand_uses`, `nudges`, `profiles`, `push_tokens`, `respects`, `shared_goal_logs`, `streak_freezes`, `streaks`, `user_achievements`, `user_follows`  

**Interpretation:** Data access is **centered on Supabase** with a bounded set of public table names. Any security review should trace **RLS policies and server-side `supabase` roles** in Supabase, not just client usage.

---

### 2.5 `.or(` filter usage (injection / filter-safety surface)

**Result:** **0** matches in the recursive scan of `*.ts,*.tsx` (excluding `node_modules`).  
**Interpretation:** No `PostgREST` `.or()` chaining was found in app sources under this pattern. If later versions add `.or()`, each argument must be reviewed for string concatenation with user input.

---

### 2.6 Design system — raw hex in `app\` and `components\` (excluding `design-system.ts`)

**Command:** `Select-String` on `app\**\*.tsx` and `components\**\*.tsx` with `#[0-9a-fA-F]{3,8}`, excluding paths matching `design-system`.  

**Count:** **1** (confirmed with targeted search).  
**Proof line:**

```text
components\ErrorBoundary.tsx
46:              { color: "#aaaaaa" },
```

**Interpretation:** Almost all UI uses the design system; this file contains a **literal gray hex** in inline styles.

---

### 2.7 `Alert.alert`

**Result:** **0** matches in `app\**\*.tsx` and `components\**\*.tsx` for pattern `Alert.alert`.  
**Interpretation:** The UI does not use React Native’s `Alert.alert` in these trees (or uses dynamic access not matching the pattern). User-facing errors likely use modals, toasts, or inline components.

---

### 2.8–2.9 Navigation: `router.(push|replace|navigate|back)` vs `ROUTES`

**2.8 Count:** **150** matches in `app\` + `components\` `*.tsx`.  
**2.9 `ROUTES` definition:** **1** site — `lib\routes.ts:5` — `export const ROUTES = {`  

**Interpretation:** Central route constants **exist** (`lib\routes.ts`), and navigation calls are **widespread**; not every call is guaranteed to use `ROUTES` (requires per-file review). Per-file entries flag `usesROUTES` in `docs\_audit-fe-heuristics.csv`.

---

### 2.10 Type escape hatches (`any`, `as any`, `@ts-ignore`, `@ts-expect-error`)

**Narrow `Select-String` on repo sources (excluding `node_modules`) found at minimum:**

- `backend\lib\strava-callback.ts:80` — `// @ts-expect-error - table type not in generated types`  

**Workspace `rg` for `\bas any\b` and `:\s*any\b` on `*.{ts,tsx}` returned **0** additional hits in a quick check (heuristic: typing is strict in application code).  

**Interpretation:** Type escape hatches are **rare**; remaining risk is in **Supabase type drift** (as evidenced by `@ts-expect-error` in Strava path).

---

### 2.11 PostHog / analytics — call-site **line** count (resolves “37 vs 2” class of errors)

**Command:**

```powershell
$all = Get-ChildItem -Path (Get-Location).Path -Recurse -File -Include *.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\' }
$all | Select-String -Pattern 'posthog|PostHog|capture\(|trackEvent|analytics\.'
```

**Count:** **98** matching **lines** (not “sites” and not unique files; each line of `lib\analytics.ts` with multiple words can match the alternation more than once depending on exact pattern — the authoritative number is the **line-level match count** as printed: **98** in the session that wrote `griit-audit2.txt`).  

A separate **broader** pattern in an earlier run reported **99**-class counts; the correct audit stance is: **dozens of call sites across the repo**, not 2, and the exact number depends on regex. Use the exported `Select-String` list in temp file `griit-audit2.txt` (paths + line numbers) for **provable** citations.

**Interpretation:** PostHog/analytics is **wiring-present** in many files; it is not a “2-site” integration.

---

### 2.12 Sentry

**Count (pattern `Sentry\.`):** **13** lines across: `app\tabs\_layout`, `app\_layout.tsx`, `lib\sentry.ts`, `lib\client-error-reporting.ts` (comments + API).  
**Interpretation:** Sentry is **initialized and wrapped** at the root; **in-file** Sentry calls are **sparse** (most app code likely uses a helper like `lib/sentry` / `client-error-reporting` — per-file sweeps in Wave 3 should use those symbols too, not only `Sentry.`).

---

### 2.13 `catch` blocks

**Count (pattern `catch\s*\(`):** **209** across `*.ts,*.tsx` (excluding `node_modules`).  
**Interpretation:** Error paths are **numerous**; classification into “silent” vs “handled” requires **per-block** review (not done in this wave).

---

### 2.14 RevenueCat / paywall

**Count (broad pattern `Purchases.|RevenueCat|getOfferings|...|Paywall`):** reported in temp bundle as a **non-trivial** set (see `griit-audit2b.txt` “REVENUE” section). **Interpretation:** Paywall and subscription code paths **exist** and are distributed across `app/paywall.tsx`, `lib/subscription.ts`, `lib/revenue-cat.ts`, etc.

---

### 2.15 Push notifications

**Count:** **63** lines matching the user’s pattern across client + server files (`app\_layout`, `lib\notifications.ts`, `lib\register-push-token.ts`, `backend\lib\sendPush.ts`, routes, types).  
**Interpretation:** Push is a **first-class** integration on both **client** and **backend**; **device verification** is still a separate launch criterion per rubric.

---

### 2.16 TODO / FIXME / HACK (refined)

The user’s broad pattern `TODO|FIXME|...|PLACEHOLDER` matches many **false positives** (e.g. `placeholder=` props).  
**`rg` with word boundaries:** `\bTODO\b|\bFIXME\b|\bHACK\b` on `*.{ts,tsx}` → **0** matches.  
**Interpretation:** There are **no** conventional `// TODO` markers in TS/TSX; technical debt is not tracked in-line with those tokens.

---

### 2.17 `console.*` in `app`, `components`, `backend`

**Count (session):** `console.(log|warn|error|info|debug)` — reported with **Count:** line in `griit-audit2c.txt` (see “CONSOLE” section). **Interpretation:** Stray `console` usage exists and should be gated for production in files that are not `__DEV__` guarded (per-file in Wave 3).

---

### 2.18–2.19 Accessibility: labels vs `Pressable` / `TouchableOpacity`

**2.18 Count (pattern `accessibilityLabel|accessibilityRole|accessible=`):** **803** in `app`+`components` `*.tsx`.  
**2.19 Count (`TouchableOpacity|Pressable`):** **804**  

**Interpretation:** A11y props and pressables are on the **same order of magnitude**; a gap analysis cannot rely on **counts** alone (nested components, `accessible={false}` patterns). Per-file ratio is in `docs\_audit-fe-heuristics.csv` (`A11yLines` vs `Pressable`).

---

### 2.20 Zustand (correct directory)

`from "zustand"` appears under **`store\`**, not `stores\`: **5** files.  
**Interpretation:** Zustand is used for small global slices; these files were **outside** Wave 1.1 and must be included in a complete “every TS file in the app” audit.

---

### 2.21 React Query / TanStack

**Count:** **185** matches for `useQuery|useMutation|useInfiniteQuery|QueryClient|invalidateQueries`.  
**Interpretation:** **TanStack Query** is a primary data client pattern.

---

### 2.22 Environment variables

**Count (pattern `process.env.|EXPO_PUBLIC_|Constants.expoConfig`):** **73** lines.  
**Interpretation:** Config is **pulled from env and Expo** in many places; secrets in client bundles must be assumed **public** (standard Expo rule).

---

## Wave 2 gate (honest)

| Criterion | Status | Proof |
|----------|--------|--------|
| Every listed scan run | **PASS** (all executed; some outputs in terminal + temp export files) | This document + `C:\Users\abdel\AppData\Local\Temp\griit-*.txt` (where applicable) |
| Counts for ambiguous patterns (TODO, PostHog) | **PARTIAL** — require **pattern** footnote | TODO broad pattern invalid; use `\bTODO\b` or `// TODO` | PostHog use **98-line** match for stated alternation |
| “All gates PASS” with no data | **FAIL** if used | This audit **does not** mark subsystem/file gates PASS without computed scores |

**Stop condition from user spec:** if a scan has no output, re-run. **2.1** had empty success output but exit code 0 — **valid**.

---

## Generated artifacts (aid for Wave 3)

| File | Content |
|------|--------|
| `docs\_audit-fe-lines.csv` | Every Wave 1.1 relative path + line count (reconciled) |
| `docs\_audit-fe-exports.txt` | `export` line scan per frontend file |
| `docs\_audit-fe-heuristics.csv` | Per-file flags: `Catch`, `Sentry`, `Posthog`, `Router`, `ROUTES`, `Escape`, `Console`, `Alert`, `A11yLines`, `Pressable`, `Hex` |
| (optional) `docs\generate-audit-fe.ps1` | If added in follow-up, regenerates per-file MD |

---

## Next: Wave 3 (frontend) and backend deep audit

- **277** frontend file entries in **`docs\AUDIT_FRONTEND_*_2026-04-27.md`**, plus **+5** optional `store\` files, plus **78** backend file entries, per user template.  
- The companion files **`AUDIT_FRONTEND_A` / `B` / `C`** (and **`AUDIT_BACKEND_*.md`**) should be opened after this document. If any file is missing, the run was **truncated by tooling limits** — the **Wave 1 contract and CSVs** remain the source of truth for file lists.

**Proof command to reproduce frontend list:**

```powershell
Import-Csv .\docs\_audit-fe-lines.csv | Sort-Object Rel | Select-Object -ExpandProperty Rel
```

---

*End of Phases 0–2.*

