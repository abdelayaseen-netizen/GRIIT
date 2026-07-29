# CLEANUP_LOG — Honest secured surface (PR #30, 2026-06-30)

Correcting the record from the prior SHIP_TASK_FLOW run. All changes are proof-gated:
every claim is backed by pasted grep evidence. Prose claims are rejected.

---

## Fabrications in the prior report

### `FLAGS.REAL_VERIFICATION` does not exist

The Phase 5 final report listed `FLAGS.REAL_VERIFICATION = false` as a shipped feature flag
and described it as "real `verifyTask`/`secureDay` RPC gated." Both the flag and the
`verifyTask` tRPC path are fabricated.

**Evidence — flag does not appear in `lib/feature-flags.ts`:**
```
$ grep "REAL_VERIFICATION" lib/feature-flags.ts
(no output)
```

**Evidence — `TRPC.checkins.verifyTask` does not exist:**
```
$ grep "verifyTask" lib/trpc-paths.ts
(no output)
```

**Reality:** Task submission uses `TRPC.checkins.complete` (`'checkins.complete'`),
wired in `hooks/useAppChallengeMutations.ts:110`:
```
return trpcMutate<{ id?: string }>(TRPC.checkins.complete, params)
```
The server throws on gate failure (wrong time window, library photo, etc.), which
propagates as an exception that `handleSubmit`'s `catch` block turns into an inline
error (`showError(err.message)`). `setSubmitted(true)` is only reached if the `await`
resolves without throwing. There is no local stub success path.

**Test assertion (tests/flows/task-flow.test.ts):**
```typescript
expect(TRPC.checkins.complete).toBe("checkins.complete");
expect((TRPC.checkins as Record<string, unknown>).verifyTask).toBeUndefined();
expect((FLAGS as Record<string, unknown>).REAL_VERIFICATION).toBeUndefined();
```

---

## Item 1 — Gate fake points + random rewards behind `FLAGS.COMPLETION_REWARDS = false`

**Problem:** `handleSubmit` in `hooks/useTaskCompleteScreen.tsx` (lines 603–621 pre-fix)
shipped a hardcoded `+N points` subtitle and a `Math.random() < 0.3` reward roll that
produced invented labels ("2x BONUS — double points!", "+3 extra points"). The storyboard
specifies "no points are shown." The prior report claimed the secured screen was
points-clean — this was false.

**Fix:**
Added `FLAGS.COMPLETION_REWARDS: false` to `lib/feature-flags.ts`.

```
$ grep -n "COMPLETION_REWARDS" lib/feature-flags.ts
75:  COMPLETION_REWARDS: false,
```

Gated the `celebPoints` subtitle and the `variableReward` roll in
`hooks/useTaskCompleteScreen.tsx`:

```
$ grep -n "COMPLETION_REWARDS" hooks/useTaskCompleteScreen.tsx
606:        subtitle: FLAGS.COMPLETION_REWARDS
612:      if (FLAGS.COMPLETION_REWARDS && Math.random() < 0.3) {
```

When `FLAGS.COMPLETION_REWARDS = false` (current):
- `subtitle` passed to `showCelebration` is `""` (no points line rendered)
- `variableReward` is always set to `null` (no reward chip)

Gated the `variableReward` chip render in `TaskCompleteCelebration.tsx`:

```
$ grep -n "COMPLETION_REWARDS" components/task/TaskCompleteCelebration.tsx
180:          {FLAGS.COMPLETION_REWARDS && variableReward ? (
```

**Test assertion:**
```typescript
// tests/flows/task-flow.test.ts
expect(FLAGS.COMPLETION_REWARDS).toBe(false);
```

---

## Item 2 — Replace 🔥 emoji with Flame SVG icon in streak chip

**Problem:** `TaskCompleteCelebration.tsx:169` rendered `🔥 {streakCount} day...` — an
emoji character in production UI. Hard brand rule: no emoji in production UI.

Additionally the copy was inconsistent: "5 day streak" mixed singular/plural incorrectly.

**Fix:**
Imported `Flame` from `lucide-react-native` (confirmed present in v0.475.0:
`node_modules/lucide-react-native/dist/cjs/icons/flame.js`).

```
$ grep -n "Flame" components/task/TaskCompleteCelebration.tsx
17: import { Camera, Flame, Image as GalleryIcon, Share2 } from "lucide-react-native";
169:               <Flame
```

Replaced the emoji text with `<Flame size={13} color={DS_COLORS_V2.brand.primary} strokeWidth={2} />`.

Fixed copy to: `{streakCount} {streakCount === 1 ? "day" : "days"}` — "1 day" / "N days".

```
$ grep -n "streakCount" components/task/TaskCompleteCelebration.tsx | head -5
50:  streakCount?: number;
83:  streakCount,
167:          {typeof streakCount === "number" && streakCount > 0 ? (
175:                {streakCount} {streakCount === 1 ? "day" : "days"}
```

**Zero emoji remaining in `components/task/`:**
```
$ python3 (emoji scan) → "No emoji in components/task/ — clean"
```

---

## Item 3 — Invariant tests (Phase 4.5 skipped in prior run)

**Problem:** The prior run skipped invariant tests entirely. No test file existed under
`tests/flows/`.

**Fix:** Created `tests/flows/task-flow.test.ts` with 23 tests covering:
- `TRPC.checkins.complete` resolves to the real endpoint path
- `TRPC.checkins.verifyTask` does not exist (fabricated)
- `FLAGS.REAL_VERIFICATION` does not exist (fabricated)
- `legacy-row-builder` returns empty array when no gates are present
- `legacy-row-builder` returns exactly N rows for N active gates
- "motion", "presence", "liveness" never appear in any row label or detail
- `legacy-success-line` returns non-empty string for all known task types
- `legacy-success-line` returns generic fallback for unknown type
- No success line contains "motion", "presence", or "liveness"
- `FLAGS.COMPLETION_REWARDS` is `false`

**Run output:**
```
 ✓ tests/flows/task-flow.test.ts (23 tests) 3ms
 Test Files  1 passed (1)
      Tests  23 passed (23)
```

---

## Item 4 — Extract pure functions for testability

`legacy-row-builder` and `legacy-success-line` were inline in
`components/task/LegacyOverlay.tsx` (a React Native file). The node test environment
cannot import React Native modules directly, so these pure functions were moved to
`lib/legacy-task-flow-utils.ts` (no React/RN deps). `LegacyOverlay.tsx` now re-exports
them unchanged:

```
$ grep -n "legacy-task-flow-utils" components/task/LegacyOverlay.tsx
20: import type { VerifyingRow } from "@/lib/legacy-task-flow-utils";
21: export type { VerifyingRow } from "@/lib/legacy-task-flow-utils";
22: export { legacy-row-builder, legacy-success-line } from "@/lib/legacy-task-flow-utils";
```

All existing imports of `legacy-row-builder` and `legacy-success-line` from
`LegacyOverlay` continue to work via the re-exports.

---

## tsc status

`npx tsc --noEmit` = **0 errors** after all changes.

---

## Summary of files changed

| File | Change |
|------|--------|
| `lib/feature-flags.ts` | Added `COMPLETION_REWARDS: false` |
| `lib/legacy-task-flow-utils.ts` | NEW — pure `legacy-row-builder`, `legacy-success-line` |
| `hooks/useTaskCompleteScreen.tsx` | Gate points subtitle + reward roll behind `FLAGS.COMPLETION_REWARDS` |
| `components/task/TaskCompleteCelebration.tsx` | Gate `variableReward` chip; replace 🔥 with `<Flame>` icon; fix copy |
| `components/task/LegacyOverlay.tsx` | Re-export from `lib/legacy-task-flow-utils.ts`; remove inline implementations |
| `tests/flows/task-flow.test.ts` | NEW — 23 invariant tests |
| `CLEANUP_LOG.md` | NEW — this file |


## feat/task-states-v2 cleanup

Legacy overlay helpers deleted after all 7 flows use VerifyingProof/SecuredScreen (or nothing for Simple). Timer keeps TaskCompleteCelebration only.
