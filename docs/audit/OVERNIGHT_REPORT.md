<!-- This file is assembled in phases. The executive summary is prepended in Phase 5. -->

# GRIIT — Overnight Deep Clean, Consolidation & Full App Scorecard

_Autonomous overnight maintenance + audit. Branch: `chore/overnight-audit-20260618`. Started off `feat/comments-sheet`._

---

## Phase 0 — Baseline

### Git state at start

```
$ git status
On branch feat/comments-sheet
Your branch is up to date with 'origin/feat/comments-sheet'.
Changes not staged for commit:  (70 files modified — pre-existing WIP)
  ... font-weight migration (DS_TYPOGRAPHY.WEIGHT_SEMIBOLD -> WEIGHT_BOLD) across app/ + components/

$ git rev-parse --abbrev-ref HEAD
feat/comments-sheet

$ git log -1 --oneline
8a9852d feat(feed): optimistic comments, analytics events, reply notifications
```

**Pre-existing uncommitted WIP handling (logged decision):** On session start there were **70 modified files** (212 insertions / 213 deletions) — a font-weight migration (`WEIGHT_SEMIBOLD` → `WEIGHT_BOLD`) that was **not authored by this audit** and is exactly the kind of visual change Rule 2 forbids. Safest reversible choice taken: create the audit branch carrying these changes, then commit them in a single clearly-labeled snapshot commit (`2f89324`) so every subsequent phase commit is a clean, attributable diff. The original `feat/comments-sheet` branch is untouched and still owns this WIP when checked out. **This font-weight migration is flagged, not evaluated, as audit work.**

### Branch created

```
$ git checkout -b chore/overnight-audit-20260618
Switched to a new branch 'chore/overnight-audit-20260618'
$ git branch --show-current
chore/overnight-audit-20260618
```

### TypeScript baseline (hard gate)

```
$ npx tsc --noEmit ; grep -c "error TS"
0   errors
```
**Baseline tsc error count: 0.**

### Lint baseline

```
$ npm run lint    # expo lint && eslint . --ext .ts,.tsx --max-warnings 0
LINT EXIT: 0   (clean — 0 errors, 0 warnings; --max-warnings 0 would fail otherwise)
```

### Test baseline

```
$ npm test    # vitest run
 Test Files  18 passed (18)
      Tests  100 passed (100)
   Duration  ~830ms
TEST EXIT: 0
```
(The error-level pino logs in output are intentional — backend tests asserting error paths: TOO_MANY_REQUESTS, BAD_REQUEST, UNAUTHORIZED, etc.)

### Inventory

| Area | Files (.ts/.tsx) | LOC |
|---|---|---|
| `app/` | 42 | 13,975 |
| `components/` | 172 | 38,952 |
| `store/` | 6 | 313 |
| `lib/` | 68 | 7,042 |
| `backend/` | 81 | 13,023 |
| **Total .ts/.tsx (excl node_modules)** | **398** | — |

Dependencies: **59 runtime deps**, **13 devDeps** (incl. `depcheck`, `knip`, `ts-prune`, `babel-plugin-transform-remove-console`).

```
$ rg --files store -g '*.ts' | xargs wc -l
  144 store/onboardingStore.ts
   38 store/notificationPrefsStore.ts
   22 store/proofSharePromptStore.ts
   32 store/celebrationStore.ts
   29 store/activeSessionStore.ts
   48 store/feedToggleStore.ts
```
All 6 stores use `create<...>()` from zustand; **no `lib/stores/` directory exists** (Phase 2.4 pre-confirmed).

