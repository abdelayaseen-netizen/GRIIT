# GRIIT — catch block reconciliation

**Audit date:** 2026-05-02
**Method:** brace-counting scan of `*.ts` / `*.tsx` files under `app/`, `backend/`, `components/`, `contexts/`, `hooks/`, `lib/`, `store/`, `styles/`, `types/`. Excludes `node_modules/`, `.git/`, `dist/`, `__tests__/`, and any file whose name contains `.test.`. Parser walks balanced braces and tracks string/comment state to avoid false matches inside strings, template literals, or commented-out code.
**Total catch blocks found:** **286**

> Reconciliation note up front: the original full audit reported **130** catches as a Phase 1 gate failure ("silent catches: 0 expected, 130 actual"). That regex (`\}\s*catch\s*\{`) only matches **parameterless** catches (`catch {` with no `(e)`). This scan finds **128** parameterless catches in the same tree (within ~1.5% of the audit's 130 — the small delta is whitespace variance in two files). The full population of 286 catches includes 158 parameterized catches that the original audit's regex didn't see.

## bucket summary

| Bucket | Description | Count | % | Action class |
|--------|-------------|-------|---|--------------|
| A  | strictly empty body                          | 1  | 0.3% | real bug — surface or sentry |
| B1 | comment-only "non-fatal" / "best-effort"     | 58 | 20.3% | intentional — leave |
| B2 | comment-only "handle in UI" / "surface"      | 1  | 0.3% | broken stub — fix |
| B3 | comment-only "swallow / silent / ignore"     | 17 | 5.9% | audit individually |
| B4 | comment-only other                           | 10 | 3.5% | review |
| C  | console-only                                 | 0  | 0.0% | should also sentry |
| D  | sentry-aware (`captureError` / `Sentry.*`)   | 133 | 46.5% | no action |
| E  | re-throw / propagate                         | 17 | 5.9% | no action |
| F  | other / mixed (executable, not console/sentry/throw) | 49 | 17.1% | human review (mostly UI-surface + fallback-return — see breakdown) |
| **Total** | | **286** | 100% | |

## bucket A — strictly empty (real bugs)

**1 catch.** Body contains zero characters between `{` and `}` — no comment, no statement, nothing. Each one masks every error in its `try`.

- `lib/live-activity.ts:96`

## bucket B1 — non-fatal / best-effort (leave alone)

**58 catches.** Comment explicitly tags the catch as deliberate (`/* non-fatal */`, `// best-effort`, etc.). Sample:

- `app/(tabs)/discover.tsx:325`
- `app/(tabs)/index.tsx:358`
- `app/_layout.tsx:202`
- `app/_layout.tsx:482`
- `app/auth/login.tsx:89`
- _+53 more_

## bucket B2 — handle-in-UI broken stubs (fix)

**1 catch.** Comment claims the error is handled in UI but no UI code references it. This is the dev-stub pattern flagged in the original audit.

- `lib/review-prompt.ts:47` — comment: `// error swallowed — handle in UI`

## bucket B3 — swallow / silent / ignore (audit each)

**17 catches.** Body is empty; comment says "ignore" or similar. Some are legitimate (best-effort cleanup), some are bugs in disguise. Concentration: `lib/notifications.ts` (12), `lib/analytics.ts` (2), `app/(tabs)/discover.tsx` (2), one each in `hooks/useCelebration.ts` and `lib/posthog.ts`.

- `app/(tabs)/discover.tsx:298`
- `app/(tabs)/discover.tsx:314`
- `hooks/useCelebration.ts:51`
- `lib/analytics.ts:136`
- `lib/analytics.ts:186`
- `lib/notifications.ts:111`
- `lib/notifications.ts:214`
- `lib/notifications.ts:295`
- `lib/notifications.ts:309`
- `lib/notifications.ts:338`
- `lib/notifications.ts:381`
- `lib/notifications.ts:450`
- `lib/notifications.ts:492`
- `lib/notifications.ts:500`
- `lib/notifications.ts:520`
- `lib/notifications.ts:573`
- `lib/posthog.ts:44`

## bucket B4 — other comment-only catches (review)

**10 catches.** Comment text doesn't fit B1/B2/B3 but does explain intent. Listed verbatim for human review:

- `backend/trpc/routes/profiles.ts:147` — comment: `// active_challenges RLS may block reading other users' rows — degrade gracefully`
- `components/feed/FeedPostCard.tsx:123` — comment: `// Error handled upstream`
- `lib/active-task-timer.ts:54` — comment: `// notifications may not be permitted — fail silently`
- `lib/active-task-timer.ts:85` — comment: `// fail silently`
- `lib/active-task-timer.ts:95` — comment: `// fail silently`
- `lib/api.ts:246` — comment: `/* not valid JSON */`
- `lib/notifications.ts:199` — comment: `// Permissions or platform may not support`
- `lib/notifications.ts:373` — comment: `// Platform may not support`
- `lib/subscription.ts:257` — comment: `// purchaserInfoListener not set or RevenueCat not available (web/Expo Go)`
- `lib/trpc.ts:89` — comment: `// JSON parse failure means non-JSON response; fall through to default handling`

## bucket C — console-only (should sentry)

**0 catches.** No catches in this codebase log only via `console.*` without also calling `captureError` / `Sentry.*` or doing other handling. The audit's suspicion that this bucket would be large turned out to be unfounded — `lib/sentry.ts`'s `captureError` helper has been adopted broadly (133 catches in bucket D).

## bucket D — sentry-aware (good)

**133 catches.** Body invokes `captureError`, `Sentry.captureException`, or `logger.error`. No action. Examples:

- `app/(tabs)/index.tsx:363`
- `app/(tabs)/profile.tsx:216`
- `app/(tabs)/profile.tsx:262`
- _+130 more_

## bucket E — re-throw / propagate (good)

**17 catches.** Body throws (often a `TRPCError`) or returns a structured `{ ok: false, error }`-shaped result. The error is propagated, not swallowed. Examples:

- `app/api/trpc/[trpc]+api.ts:43`
- `backend/lib/strava-callback.ts:52`
- `backend/lib/strava-verifier.ts:110`
- _+14 more_

## bucket F — other / mixed

**49 catches.** Body contains executable code that is neither only-`console.*`, nor `Sentry.*`, nor a `throw`/error-return. Most of these are real handlers — they just don't go through the central observability funnel.

Sub-classification by what the body does:

| Sub-kind | Count | Meaning |
|----------|-------|---------|
| `ui-surface` | 5 | `showError` / `setBannerError` / `setFormError` / `Alert.alert` — surfaces to user, no Sentry |
| `fallback-return` | 26 | returns a default value (e.g. `return raw`, `return null`, `return new Date()...`) — intentional fallback |
| `collect-errors` | 6 | pushes onto an `errors` array (cron / batch jobs) — error is reported in batch summary |
| `state-set` | 2 | sets a state field (e.g. `checks.supabase = "error"`) — health check or context state |
| `other` | 10 | mixed / uncategorized — needs eyeballing |

Top files in bucket F: `lib/subscription.ts` (6), `app/follow-list.tsx` (3), `backend/lib/cron-reminders.ts` (3), `backend/lib/date-utils.ts` (3), `backend/lib/daily-reset.ts` (3), `contexts/ApiContext.tsx` (3), `lib/share.ts` (3), `backend/lib/push-reminder.ts` (2)

> Note: `lib/subscription.ts:97` and `:119` end up here under the "first-match" rule because their catch bodies contain executable code (an `if (__DEV__) { ... }` wrapper), but the inner block contains the comment `// error swallowed — handle in UI` and nothing else. They are functionally **B2-equivalent broken stubs** — flag them alongside `lib/review-prompt.ts:47` if you act on the B2 priority.

Full bucket F list (sorted by file):

- `app/follow-list.tsx:89`
- `app/follow-list.tsx:106`
- `app/follow-list.tsx:110`
- `app/profile/[username].tsx:93`
- `app/task/checkin.tsx:451`
- `app/task/run.tsx:554`
- `backend/hono.ts:81`
- `backend/lib/cron-reminders.ts:110`
- `backend/lib/cron-reminders.ts:202`
- `backend/lib/cron-reminders.ts:210`
- `backend/lib/daily-reset.ts:220`
- `backend/lib/daily-reset.ts:223`
- `backend/lib/daily-reset.ts:228`
- `backend/lib/date-utils.ts:33`
- `backend/lib/date-utils.ts:99`
- `backend/lib/date-utils.ts:157`
- `backend/lib/push-reminder.ts:39`
- `backend/lib/push-reminder.ts:60`
- `backend/lib/rate-limit.ts:87`
- `backend/lib/strava-oauth-state.ts:54`
- `backend/trpc/routes/integrations.ts:66`
- `backend/trpc/routes/notifications.ts:250`
- `components/home/GoalCard.tsx:55`
- `components/onboarding/screens/AutoSuggestChallengeScreen.tsx:83`
- `components/onboarding/screens/SignUpScreen.tsx:112`
- `components/task/VerificationGates.tsx:159`
- `contexts/ApiContext.tsx:66`
- `contexts/ApiContext.tsx:156`
- `contexts/ApiContext.tsx:184`
- `contexts/AppContext.tsx:241`
- _+19 more_

### bucket F — `other` sub-kind (verbatim bodies for human review)

These are the 10 catches in bucket F that didn't match any sub-kind heuristic. Bodies are listed verbatim (truncated to first 5 lines) so they can be classified manually.

- `backend/hono.ts:81` (`catch {`):
  ```ts
  checks.supabase = "error";
  ```
- `backend/lib/date-utils.ts:99` (`catch {`):
  ```ts
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
  ...
  ```
- `components/onboarding/screens/AutoSuggestChallengeScreen.tsx:83` (`catch {`):
  ```ts
  if (!cancelled) setChallenges(FALLBACK_CHALLENGES);
  ```
- `components/task/VerificationGates.tsx:159` (`catch {`):
  ```ts
  if (!cancelled) {
    setVerifiedCoords(null);
    setLocationGate({ status: "failed", detail: "Could not get location" });
  }
  ```
- `lib/api.ts:209` (`catch (tableErr) {`):
  ```ts
  if (isNetworkLikeError(tableErr)) {
    networkErrorCount++;
    continue;
  }
  ```
- `lib/share.ts:25` (`catch (e) {`):
  ```ts
  if ((e as Error)?.name !== "AbortError" && Platform.OS !== "web") {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  ```
- `lib/share.ts:146` (`catch {`):
  ```ts
  await shareOrCopy(message, "GRIIT");
  ```
- `lib/share.ts:174` (`catch {`):
  ```ts
  const available = await Sharing.isAvailableAsync();
  if (available) await Sharing.shareAsync(imageUri, { mimeType: "image/png" });
  ```
- `lib/subscription.ts:97` (`catch {`) — **functionally B2 (broken stub)**:
  ```ts
  if (__DEV__) {
    // error swallowed — handle in UI
  }
  ```
- `lib/subscription.ts:119` (`catch {`) — **functionally B2 (broken stub)**:
  ```ts
  if (__DEV__) {
    // error swallowed — handle in UI
  }
  ```

## priority list (no effort/impact estimates — for Yaseen)

Buckets that need action, ranked by likely cost-of-bugs-they-mask:

1. **Bucket A (strictly empty): 1 catch.** `lib/live-activity.ts:96` — masks every error in its try. Highest priority because it is genuinely silent. (This is the single catch the audit's "130" should have collapsed to under a strict definition.)
2. **Bucket B2 (handle-in-UI stub): 1 catch + 2 functional equivalents in bucket F.** `lib/review-prompt.ts:47` (true B2) plus `lib/subscription.ts:97` and `lib/subscription.ts:119` (F-other but contain the same `// error swallowed — handle in UI` stub inside an `if (__DEV__)` wrapper). All three claim UI handling that does not exist. Either wire it up or rewrite the comment.
3. **Bucket B3 (swallow / silent / ignore): 17 catches.** Most are in `lib/notifications.ts` (12) where ignoring is plausibly intentional (push registration is best-effort) but should be confirmed per call-site. Two in `lib/analytics.ts` and two in `app/(tabs)/discover.tsx` are higher-risk because analytics and discover-feed errors masking silently can hide regressions.
4. **Bucket B4 (other comments): 10 catches.** Each comment explains intent — confirm the explanation is still accurate. Notable: `backend/trpc/routes/profiles.ts:147` ("active_challenges RLS may block reading other users' rows — degrade gracefully") connects directly to the `active_challenges` RLS work just landed.
5. **Bucket F sub-kind `ui-surface` / `state-set` / `other`: ~17 catches.** These surface or store the error somewhere visible but do not call `captureError`. Adding `captureError(e, "<context>")` alongside the existing handler would close the observability gap without changing UX.

**Buckets D (133), E (17), B1 (58), C (0), and Bucket F sub-kind `fallback-return` / `collect-errors` (~32) — no action.** These are doing what they should.

## reconciliation note

The original full audit (`docs/audits/GRIIT_FULL_AUDIT_20260502.md`) reported **130** catch blocks as a Phase 1 gate failure under "silent catches: 0 expected, 130 actual." That count came from a regex (`\}\s*catch\s*\{`) that matched only **parameterless** catches and did not inspect bodies.

Under a strict definition of "silent" (truly empty body, no log, no comment), the actual count is **1** (bucket A).

Under a broader definition that also covers stubbed and ignore-tagged catches (A + B2 + B3), the count is **19**.

Under the broadest definition that also covers real handlers without observability (A + B2 + B3 + bucket-F sub-kinds `ui-surface` + `state-set` + `other`), the count is roughly **19 + 17 = 36**.

Audit action #10 ("130 silent catches") was scoped against the broad regex count. The right number to drive prioritization depends on which definition above matches the original intent — bucket A alone is one bug; A + B2 + B3 is the conservative actionable set.
