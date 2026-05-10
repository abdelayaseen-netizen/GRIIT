# Phase 8 — Type Safety & Error Handling

**Branch:** `cleanup/2026-05-deep-clean`

## Baseline → Final

| Metric | Baseline | Final | Δ |
|---|---|---|---|
| `any` / `as any` in production | 0 | 0 | — |
| Empty catches | 0 | 0 | — |
| `Alert.alert` | 0 | 0 | — |
| `console.*` in production code | 41 | 5 (all `__DEV__`-guarded) | -36 |
| `@ts-ignore` / `@ts-expect-error` | 1 | 1 (justified) | — |
| Non-null assertions (`x!.y`) | 9 | 5 (refactored or documented) | -4 |
| `useMutation` w/o `onError` | 1 of 3 | 0 of 3 | -1 |

---

## 1. `console.*` cleanup

### Backend (was 36, now 0)

`backend/server.ts` and `backend/trpc/app-router.ts` were the two
remaining unguarded `console.log`/`console.error` sites — Railway boot
diagnostics. Both converted to the project's `pino` logger.

```bash
$ grep -rEn "console\.(log|warn|error)" backend/
# (empty)
```

`app-router.ts` uses `logger.debug` so the noisy import-step trace
stays available under `LOG_LEVEL=debug` without spamming production.

### Frontend (5 remaining, all `__DEV__`-guarded)

| File | Why kept |
|---|---|
| `lib/logger.ts:14` | The frontend logger itself; explicitly the dev sink. |
| `lib/sentry.ts:37` | DEV fallback when Sentry DSN is absent; inside `if (__DEV__) {…}`. Cleaned up redundant inner `if (__DEV__)`. |
| `lib/posthog.ts:18` | DEV-only init confirmation, inside `if (__DEV__) {…}`. |
| `lib/analytics.ts:169` | Inline `if (__DEV__) console.log(...)` — dev capture trace. |
| `hooks/useAppChallengeMutations.ts:227` | `if (__DEV__) { console.log("[secureDay] called", …); }` — dev breakpoint trace; helps debug the most-frequent user-facing mutation. |

`__DEV__` is the React Native compile-time flag that's stripped to
`false` in production builds, so these calls dead-code-eliminate to
nothing in shipped JS. They are not "in production code" by the
spirit of the rule.

---

## 2. Non-null assertions

5 remaining (down from 9):

| File:line | Status |
|---|---|
| `app/(tabs)/profile.tsx:124,131,138` | `user!.id` inside `useQuery({ enabled: !!user?.id, queryFn })`. Documented with adjacent comment explaining the gate. |
| `backend/trpc/routes/challenges.ts:195` | `Map.get(...)!.add(...)` — line above is `Map.set(...)`. Already has `// guaranteed non-null: just set in previous line` comment. |

4 removed by refactor:
- `app/(tabs)/profile.tsx:276–278` → IIFE returning a single derived boolean.
- `app/profile/[username].tsx:385` → IIFE pattern, hoisted local `dn`/`un` variables.
- `app/challenge/active/[activeChallengeId].tsx:549` → hoisted local `rules` inside an IIFE so `length` reads from the same narrowed binding.

---

## 3. `useMutation` error handling

```bash
$ grep -rEn "useMutation\(" app/ lib/ hooks/
app/post/[id].tsx:104   commentMutation        → onError: captureError(e, "PostThreadComment") ✓
app/post/[id].tsx:118   deleteCommentMutation  → onError: captureError(e, "PostThreadDeleteComment") ✓
lib/mutations.ts:10     useLeaveChallenge      → onError: captureError(err, "useLeaveChallenge") ✓ (added this sprint)
```

Inline error UI is left to callers (`mutation.isError` / `mutation.error`),
which is the React Query idiom; the hook layer's responsibility is
guaranteed Sentry capture.

---

## 4. `@ts-expect-error`

```ts
// backend/lib/strava-callback.ts:80
// @ts-expect-error - table type not in generated types
```

Justified inline. Supabase generated types lag behind the actual
schema for the `strava_credentials` table. Comment is required for
`@ts-expect-error` to compile, and the comment names the cause.

---

## Gates

| Gate | Status |
|---|---|
| `npx tsc --noEmit` | 0 errors ✓ |
| `npm run lint` | 0 errors, 1 pre-existing warning ✓ |
| `npm test` | 14 files / 81 tests passing ✓ |
| Hard rule: no Alert.alert | 0 ✓ |
| Hard rule: no console.* in (true) production | 0 unguarded ✓ |
| Hard rule: no `any` in production | 0 ✓ |
| Hard rule: no empty catches | 0 ✓ |
