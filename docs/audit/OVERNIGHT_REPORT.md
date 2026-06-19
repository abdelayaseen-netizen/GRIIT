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

---

## Phase 1 — Safe deep clean (mechanical only)

**Net code changes applied this phase: 0.** Every detected item was either already clean or carried behavioral/visual/public-surface risk and was therefore flagged (Rule 2), not executed. This is the honest, safe outcome with builds under App Store review.

### 1.1 Unused imports — ALREADY CLEAN (0)

The lint script is `expo lint && eslint . --ext .ts,.tsx --max-warnings 0`. Probe proving eslint flags unused imports:
```
$ printf "import { useState } from 'react';\nexport const x = 1;\n" > __probe_unused.tsx ; npx eslint ./__probe_unused.tsx
  1:10  warning  'useState' is defined but never used  @typescript-eslint/no-unused-vars
✖ 1 problem (0 errors, 1 warning)
```
Because `npm run lint` passed with exit 0 under `--max-warnings 0` (Phase 0), there are **zero** unused imports/vars across `app/ components/ lib/ store/`. No action needed. ✅

### 1.2 Dead / unreachable code

```
$ rg -n "if \(false\)|if \(true\)" app components lib store -g '*.ts' -g '*.tsx' | wc -l
0
$ rg -n '^\s*//\s*(const |let |function |import |return |export |await |console\.)' app components lib store -g '*.ts' -g '*.tsx' | wc -l
0
```
No dead branches, no commented-out code blocks.

**Unused exports** via `npx ts-prune` (127 entries excluding "used in module") — **FLAGGED, not removed.** The list is dominated by Expo Router screen `default` exports (consumed by the router, not dead) and `types/index.ts` type exports (referenced via `import type`, which ts-prune under-detects). Example false positives: `app/(tabs)/index.tsx:93 - default`, `app/post/[id].tsx:392 - default`, `types/index.ts:204 - Challenge`. Removing module exports changes the public surface (not "mechanical non-behavioral"), so deferred to human. One genuine candidate to review: `lib/prefetch-queries.ts:7 - prefetchActiveChallengeById` (possibly future-use).

### 1.3 Stray debug output — ALREADY CLEAN

```
$ rg -n "console\.(log|debug|warn)" app/ components/ lib/ store/ -g '*.ts' -g '*.tsx'
lib/logger.ts:14:  if (__DEV__) (level === "error" ? console.error : ... console.log)(...)
lib/posthog.ts:18: console.log(...)
lib/analytics.ts:183: if (__DEV__) console.log("[PostHog] Capturing event:", ...)
```
Only **3** occurrences, all in intentional logging wrappers and all `__DEV__`-gated. Additionally `babel-plugin-transform-remove-console` is installed (devDep) → console calls are stripped from production builds. No removal needed. ✅

### 1.4 Emoji in production UI — FLAGGED, not changed

```
$ rg -c "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}]" app/ components/ -g '*.tsx' -g '*.ts' | wc -l
29   (files)
```
Confirmed offenders include the called-out `CommitModal`:
```
$ rg -n "[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}]" components/create/CommitModal.tsx
47: <Text style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🤝</Text>
```
Other notable: `app/challenge/[id].tsx` (`🏆 FEATURED`, `⚡ 24-HOUR CHALLENGE`, `🔥 … active today`, `💀 EXTREME CHALLENGE`), `app/challenge/active/[activeChallengeId].tsx` (same set + `🔥` celebration), `components/onboarding/onboarding-theme.ts` (`💪🧠⚡📖🧊`), `components/create/NewTaskModal.tsx` + `wizard-shared.tsx` (`💪🏃💧📓📖📷📍`), `StepReview.tsx` (`🌐👥🔒`), plus `✓`/`✕` glyphs in `ShareCards.tsx`, `GoalSelection.tsx`, `ProfileSetup.tsx`, `task/run.tsx`, `active challenge`.

**None are like-for-like swaps.** Every occurrence is either an emoji inside a `<Text>` node (sized via `fontSize`, e.g. CommitModal's 48px 🤝) or a string literal passed as an `icon`/label prop or embedded in a returned string template. Swapping any to a Lucide/flame SVG component is a structural change (text glyph → `<Svg>`) that alters metrics/layout. Per Rule 2 (builds under review) **all flagged, none replaced.** See Phase 3 §Design system for grading.

### 1.5 Raw hex in component files — FLAGGED, not changed

```
$ rg -n "#[0-9A-Fa-f]{3,8}\b" components/ app/ -g '*.tsx' -g '*.ts'
components/feed/FeedPostCard.tsx:204:  <Trophy size={14} color="#FFFFFF" strokeWidth={2} />
components/feed/FeedPostCard.tsx:252:  <Check size={11} color="#0F6E56" strokeWidth={2.5} />
components/feed/FeedPostCard.tsx:394:  borderColor: "#F5C4B3",
components/feed/FeedPostCard.tsx:408:  color: "#FFFFFF",
components/feed/FeedPostCard.tsx:427:  color: "#FFFFFF",
```
Only **5** occurrences, all in one file (`FeedPostCard.tsx` — core home-feed, build-under-review).
- `#F5C4B3` has **no** matching token (`rg -i "F5C4B3" lib/design-system.ts` → none) → cannot replace without inventing a token.
- `#FFFFFF` / `#0F6E56` each map to **many** candidate tokens (e.g. `WHITE`, `TEXT_ON_DARK`, `TEXT_ON_ACCENT`, `BG_CARD`… / `CELEB_BONUS_GREEN`, `BADGE_LOC_GREEN`, `FEED_LIVE_LABEL`…). Selecting the semantically-correct token is a judgment call, not an "identical token already exists" mechanical swap. Deferred to human to avoid a semantically-wrong (even if same-value) token on a review build.

### 1.6 Unused dependencies — FLAGGED (do not remove overnight)

```
$ npx depcheck --json
unused dependencies: @hono/node-server, @hono/trpc-server, @upstash/redis, dotenv,
  expo-dev-client, expo-server-sdk, expo-web-browser, hono, pino, zod
unused devDependencies: @babel/core, @sentry/node, @vitest/coverage-v8, depcheck, knip, ts-prune
```
**All false positives.** depcheck only traces the Expo app entry, not `backend/`. Verified actual usage:
```
$ for dep in hono zod pino expo-server-sdk dotenv "@upstash/redis"; do echo "$dep -> $(rg -l "$dep" backend lib app | wc -l) files"; done
hono -> 5 files   zod -> 25 files   pino -> 4 files
expo-server-sdk -> 4 files   dotenv -> 3 files   @upstash/redis -> 4 files
```
The devDeps (`@babel/core`, `@sentry/node`, vitest coverage, depcheck/knip/ts-prune) are build/test/audit tools used via config or CLI. **No dependency removed** (Rule: native/build-config risk). List retained for human sign-off; recommendation: keep all.

### Phase 1 verification gate

```
$ npx tsc --noEmit ; grep -c "error TS"   ->  0   (unchanged from baseline; no code touched)
```

