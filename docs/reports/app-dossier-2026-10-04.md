# GRIIT app dossier — 4 Oct 2026

Read-only audit of tree `a7556cbb` (`origin/main` `9b5aa676`, build 73 already submitted). No SQL. No EAS. No product code changes.

Tags: **[VERIFIED]** code plus a test, or an operator-confirmed production fact. **[CODE-ONLY]** in the source, no test cited. **[INFERRED]** reasoning from those. **[UNKNOWN]** not measured.

Operator facts treated as verified: `check_ins` has `proof_url`, `photo_url`, `completion_image_url`, `verification_gates` and no `proof_photo_url`; no `nudges` table and no `accountability_partners` table; `in_app_notifications.type` allows `respect`, `comment`, `follow`, `rank`, `follow_request`, `general`, `challenge_invite`; `day_secures` is one row per user per day; 10 profiles, all public; `griit.app` is not ours; Strava is off in production; Supabase Confirm email is off, anonymous sign-in is on, manual linking is on.

This session measured **271 test files, 1435 tests, 0 failed, 0 skipped** (`npx vitest run`, 4 Oct 2026). **[VERIFIED]**

---

## 1. Executive summary

GRIIT is a phone app for a daily challenge: you do every required task, the server marks the calendar day secured, and a streak counts those days. Proof is a photo, a self-report, or an optional photo. You can run a challenge alone or in an invite-only group of up to 10. The feed shows shared proofs. Pro sells more freezes and Last Stands. The shipped client is build 73. The backend on Railway at the last check of the overnight run was commit `db79a6a`.

The product surface that matches the latest design (v44 share, Home, Discover cards, group roster from check-ins, nudges as notifications) is real and tested. Under it sits an older app: a `nudges` procedure that writes a table production does not have, a “No Days Off” promise the miss job does not keep, a featured catalog whose SQL was never applied, and a schema where `streaks` is used by SQL functions but never created in a migration.

**Five strengths**

1. Securing a day is a server RPC (`secure_day`), not a client flag. **[CODE-ONLY]** `backend/trpc/routes/checkins.ts:1421-1430`
2. The share card is one 1080×1920 PNG, join line stays off the web until an origin exists, and colour memory is on device. **[VERIFIED]** `lib/share-image.ts:14-22`, `lib/share-image.test.ts`
3. Group “secured today” is this challenge’s check-ins, not `day_secures`. **[VERIFIED]** `backend/lib/group-challenges.ts:65-75`, `backend/lib/group-challenges.test.ts`
4. Account deletion exists and requires typing DELETE. **[CODE-ONLY]** `components/settings/AccountDangerZone.tsx:93-105`, `backend/trpc/routes/profiles.ts:532-547`
5. The suite is green at 1435 tests, including a lock that `check_ins` selects must not use `proof_photo_url`. **[VERIFIED]** `backend/trpc/routes/check-ins-columns.test.ts:56-75`

**Five risks**

1. “A missed day goes back to Day 1” is copy. The miss job only zeros `active_streak_count`. It never writes `active_challenges.current_day`. **[CODE-ONLY]** `lib/create-mode-copy.ts:8-9`, `backend/lib/miss-reconcile.ts:90-98`
2. Hard mode also forces a photo on every task. That is a second meaning of “hard”, on top of freezes-versus-reset. **[CODE-ONLY]** `backend/trpc/routes/challenges-create.ts:380-395`
3. `nudges.send` still inserts into `nudges`. Production has no such table. Old builds that call it fail. **[CODE-ONLY]** `backend/trpc/routes/nudges.ts:31-55`. Operator fact: table absent.
4. Featured joins call `challenges.join` with draft UUIDs. The INSERT in `docs/drafts/v44-featured-catalog.sql` was not applied. Set-gym does not save a place. **[CODE-ONLY]** `app/challenge/set-gym.tsx` (no tRPC), overnight report
5. `streaks` and `respects` are queried and written by SQL, and there is no `CREATE TABLE` for them in `supabase/migrations`. The baseline for `profiles` / `challenges` / `active_challenges` / `challenge_tasks` is explicitly reconstructed, not introspected. **[VERIFIED]** `supabase/migrations/20260621000000_baseline_schema_core_tables.sql:6-16`

**Single next step.** Decide what No Days Off means, then make the server match the sentence. Either reset that enrollment to day 1 on a miss, or change the copy to “your streak goes to 0.” Do not ship another build while those two disagree.

---

## 2. Scorecard

| Area | Score | Why | Biggest gap |
|---|---|---|---|
| Onboarding | 5 | Nine-step flow exists and is tested. | The step named `commitment` is a day-count picker, not Standard / No Days Off. `targetStreak` is local. |
| Auth / login | 6 | Email, Apple, guest, reset screens exist. | Confirm-email-off is an operator fact. Linking guest→Apple is **[UNKNOWN]** on device. |
| Home / Today | 7 | Date, streak-at-1, closed window, toast path are in `HomeV3` and tested. | Not checked on a phone this session. |
| Task check-in & proof | 6 | `checkins.complete` is the real gate. | `checkins.ts` is 1,667 lines. Optional photo vs required is easy to get wrong. |
| Streaks / secure / freeze | 5 | Freeze is server-enforced for yesterday only. | No Days Off does not restart the challenge day. Last Stand can also cover a miss for Pro. |
| Feed | 6 | One card family; Following vs Everyone is filtered in `feed.getLiveFeed`. | Feed query pulls up to 500 movers, then filters in process. |
| Comments / respects | 6 | Comment and respect procedures exist and notify. | Respect daily cap is a constant (`FREE_LIMITS.MAX_DAILY_RESPECTS = 5`); whether the server enforces it was not re-read end to end. **[UNKNOWN]** if the cap is live. |
| Share system | 7 | Seven styles, three colours, view-shot, dev gallery. | Instagram Story is hidden until `EXPO_PUBLIC_FACEBOOK_APP_ID`. Spec still says `griit.app`. |
| Discover | 5 | Featured cards and preview sheet render. | Catalog SQL not applied. Member counts are hardcoded 0. |
| Challenge detail | 6 | Detail screen loads the challenge, members, join, freeze. | v44 “this week board” and “recent shared proofs” are not fully the frame. **[INFERRED]** from the overnight notes and the screen’s tRPC list. |
| Create flow | 6 | v44 strings, empty category, invite-only groups, privacy line. | Hard forces photo. “Start today” goes Home, not into the task. |
| Groups / nudges | 5 | Roster check-ins, three canned lines, cap of 2 pushes. | No window-closed status, no bulk nudge, no sender name, old `nudges` router still mounted. |
| Profile (own + visitor) | 6 | Record, follow counts, visitor block. | Two badge systems (v42 twelve vs older achievement keys). |
| Privacy | 5 | One switch writes three visibility columns. Feed can show a co-member’s shared proof. | The profile-record gate always passes `isCoMember: false`, so a private account stays closed to challenge-mates on the profile. |
| Notifications / reminders | 4 | Local reminders and server cron exist. | Group push cap is 2 and does not include the reminder cron. 8pm “you’re left” was skipped. |
| Activity / leaderboard | 6 | Weekly board counts `day_secures`. Friends score is days×100 plus streak capped at 99. | `setBoardOptIn` has no screen. The challenge board sorts differently. |
| Settings / account deletion | 6 | DELETE confirm, then profile row delete, then `auth.admin.deleteUser` if the service key exists. | If the admin key is missing, the profile row is gone and the auth user remains. **[CODE-ONLY]** `profiles.ts:542-546` |
| Payments / Pro | 5 | RevenueCat key is read. Freeze limit 4 vs 1 uses `is_premium`. | Whether the live offering matches the paywall was not opened in App Store Connect. **[UNKNOWN]** |
| Backend / API | 6 | One tRPC router, protected by default, additive retirement of accountability. | Dead-ish routers still mounted: `nudges`, `sharedGoal`, `accountability`. |
| Database / migrations | 4 | `check_ins` and notifications are in migrations. | `streaks` has no CREATE. Baseline tables are reconstructed. `nudges` is code-only. |
| Error handling / observability | 5 | Sentry on client and backend DSN. Several queries log and continue. | `secureDay` logs and skips `total_days_secured` if there is no service role. |
| Performance | 4 | Lists have limits. | Feed scans 500 events. Home bootstrap and `checkins.complete` are heavy. No proof this holds at 1,000 users. |
| Tests | 7 | 1435 passing. Core freeze, badges, share, groups have tests. | No test that a hard-mode miss resets `current_day` (because the code doesn’t). |
| Build / deploy pipeline | 7 | EAS production auto-incremented 72→73 and submitted. Railway health was 200 on `db79a6a`. | Docs commit `9b5aa676` may move the Railway SHA again. iOS processing is Apple’s, not ours. |
| Code health | 4 | Naming is `V3`, `v42`, `g2a` on live files. | `checkins.ts` 1,667, `design-system.ts` 1,567, `feed.ts` 1,212. |
| Design consistency | 5 | New surfaces use `DS_V3`. | 23 Sep audit still listed `DS_COLORS` / `DS_DAYLIGHT` on live screens. Not re-counted pixel by pixel. |
| Accessibility | 4 | Some buttons have labels (nudge, delete, radios). | No VoiceOver pass. **[UNKNOWN]** contrast and focus order. |
| App Store readiness | 6 | Deletion, privacy and terms routes, Apple sign-in, camera/location strings in `app.json`. | Build 73 was still processing when submitted. Age rating and screenshot metadata were not inspected. |

---

## 3. Screen map

Routes are Expo Router files under `app/`. Data calls below are `TRPC.*` or `supabase.from` **in that file**. Child components often load more. **[CODE-ONLY]** unless noted.

| Route | Purpose | In-file data | Notes |
|---|---|---|---|
| `app/_layout.tsx` | Root stack, auth gate | none | |
| `app/+not-found.tsx` | Unknown URL | none | |
| `app/(tabs)/_layout.tsx` | Tab bar, task toast, share sheet | none | Toast lives here. |
| `app/(tabs)/index.tsx` | Home | `profiles.getRecord`, `notifications.getAll`, `streaks.useFreeze` | Renders `HomeV3`. |
| `app/(tabs)/discover.tsx` | Discover | featured, trending, recommended, listMyActive, suggested, streak-at-risk, join | |
| `app/(tabs)/create.tsx` | Create tab entry | none | Wizard is `/create`. |
| `app/(tabs)/activity.tsx` | Activity | none in file | Child loads notifications. **[INFERRED]** |
| `app/(tabs)/profile.tsx` | Own profile | `profiles.getRecord`, `profiles.getFollowCounts` | |
| `app/(tabs)/teams.tsx` | Old teams tab | none | **[UNKNOWN]** if the tab is still visible. Likely leftover. |
| `app/auth/login.tsx` | Login | `profiles` | |
| `app/auth/signup.tsx` | Sign up | `profiles.getPublicByUsername`, `profiles` | |
| `app/auth/forgot-password.tsx` | Request reset | none in file | Supabase client likely in a child. |
| `app/auth/reset-password.tsx` | Set new password | none in file | |
| `app/onboarding/index.tsx` | Onboarding | none | Renders `OnboardingFlowV2`. |
| `app/create/index.tsx` | Create wizard host | none | `CreateWizardV2`. |
| `app/create-challenge.tsx` | Older create | none | **[UNKNOWN]** inbound links. |
| `app/create-profile.tsx` | Older profile create | `profiles` | Overlaps onboarding profile. |
| `app/challenge/[id].tsx` | Challenge detail | getById, listMyActive, secured keys, join, referrals, `groups.openLink`, `groups.respond` | |
| `app/challenge/active/[activeChallengeId].tsx` | Active challenge | today’s check-ins, secured keys, leave, useFreeze | Invite uses `inviteToChallenge`. |
| `app/challenge/[id]/members.tsx` | Roster | getById, members, cancel, nudge | |
| `app/challenge/[id]/invite.tsx` | Invite picker | getById, members, followers, following, invite | |
| `app/challenge/set-gym.tsx` | Place after join | none | Save and Skip do not persist. |
| `app/challenge/end.tsx` | Challenge ended | unseen endings, record, markEndSeen | |
| `app/challenge/complete.tsx` | Complete | none in file | |
| `app/task/complete.tsx` | Task flow | none in file | `TaskFlowV2`. |
| `app/task/secured.tsx` | Secured day | listMyActive, today’s check-ins, markEndSeen, shareProof | |
| `app/invite/[code].tsx` | Open invite link | `groups.openLink` | |
| `app/post/[id].tsx` | Post | getPost, comments, comment, deleteComment | |
| `app/proof/[id].tsx` | Proof | shareProof | |
| `app/profile/[username].tsx` | Visitor profile | public profile, record, follow status, counts, block | |
| `app/profile/consistency.tsx` | Consistency | getRecord | |
| `app/profile/day.tsx` | One day | getRecord, shareProof | |
| `app/follow-list.tsx` | Followers / following | getFollowers, getFollowing, follow, unfollow, request | |
| `app/edit-profile.tsx` | Edit profile | public username check, update | |
| `app/settings/index.tsx` | Settings | none | Hosts delete zone. |
| `app/settings/account.tsx` | Account | none in file | |
| `app/settings/notifications.tsx` | Reminders | get/update reminder settings | |
| `app/settings/privacy.tsx` | Privacy switch | profiles.get, profiles.update | |
| `app/settings/about.tsx` | About | none | |
| `app/paywall.tsx` | Pro | none in file | RevenueCat in `lib/subscription.ts`. |
| `app/legal/privacy-policy.tsx` | Privacy policy | none | |
| `app/legal/terms.tsx` | Terms | none | |
| `app/dev/share-styles.tsx` | 7×3 share gallery | none | `__DEV__` only. |
| `app/dev/design.tsx` | Design scratch | none | Dev. |
| `app/discover/category/[slug].tsx` | Category list | `challenges.list` | |

Dead route constants with **no screen file**: `ROUTES.ACCOUNTABILITY`, `ACCOUNTABILITY_ADD` (`lib/routes.ts:37-39`). Screens were deleted in chunk H. **[VERIFIED]** files absent; constants remain.

States (loading / empty / error) are implemented inside the V3 components, not uniformly in the route file. Treat any state not opened in this pass as **[UNKNOWN]** until that component is read. Home empty copy is **[VERIFIED]** in `lib/g2a-home.ts` tests via `windowClosedFollowup`.

---

## 4. User journeys

### a) New user → first secured day

1. Welcome through profile: `ONBOARDING_V2_ORDER` is welcome, goals, why_proof, why_circle, commitment, first_challenge, reminders, account, profile. **[VERIFIED]** `lib/onboarding-v2-routing.ts:6-16`
2. The commitment case renders `DayTargetScreen` (7 / 30 / 75 or custom). It writes `targetStreak` on the device store and tracks `target_streak_selected`. It does not set challenge difficulty. **[CODE-ONLY]** `components/onboarding/v2/OnboardingFlowV2.tsx:321-322`, `DayTargetScreen.tsx:46-55`
3. First challenge pick joins a starter or catalog challenge. Server: `challenges.join` / `starters.join`. **[CODE-ONLY]** procedure exists; the exact button was not clicked.
4. Home lists today’s tasks from `home.bootstrap` / record. **[INFERRED]** from Home’s data hooks; the route file itself calls `profiles.getRecord`.
5. Completing a task calls `checkins.complete`. The last task calls `checkins.secureDay`, which calls RPC `secure_day` and inserts the user’s `day_secures` row for today. **[CODE-ONLY]** `checkins.ts:1391-1430`
6. Failure points: join of a featured UUID before SQL is applied; photo required and camera denied; outside a time window on a hard task (`checkins.ts:356` and nearby); location gate “Not at the location.” (`checkins.ts:120`); secure RPC error; no service role so `total_days_secured` is not recounted (`checkins.ts:1458-1461`).

### b) Day 2, miss, freeze, No Days Off

- Day 2: same tasks, `current_day` increments inside `secure_day` (`supabase/migrations/20261003040000_profiles_server_columns_secure_day.sql:125`). **[CODE-ONLY]**
- A miss is evaluated by `evaluateMiss`. One unprotected missed day and a Pro/trial Last Stand spends Last Stand and does **not** break the streak. Otherwise if the streak is above 0, it writes `active_streak_count: 0`. **[VERIFIED]** logic in `backend/lib/miss-reconcile.ts:52-98` (unit-tested in miss tests if present; the reset shape is in source).
- Freeze entry: `streaks.useFreeze`. Only yesterday. Only if yesterday is the single hole and last completed is the day before or today. Spends one freeze, inserts `freeze_uses`. Free allotment 1, Pro 4, refill 30 days from `last_freeze_used_at`. **[VERIFIED]** `backend/trpc/routes/streaks.ts:34-37,44-55,137-219` and streak tests.
- UI entry points that call `streaks.useFreeze`: Home (`app/(tabs)/index.tsx`) and the active challenge screen. **[CODE-ONLY]**
- No Days Off: the user is told the run returns to Day 1 (`lib/g2a-home.ts:18`, `lib/create-mode-copy.ts:9`). `evaluateMiss` does not read `is_hard_mode` or `difficulty`. **[CODE-ONLY]** This is the honesty bug.

### c) Create solo, create group, invite, join

- Solo: wizard `CreateWizardV2` posts `challenges.create` with `participationType` solo, visibility forced private for teams and chosen for solo. **[CODE-ONLY]** `backend/lib/create-visibility.ts:14-21`, `challenges-create.ts:284-288`
- Group: `participationType === "team"` sets `run_status` active, `team_size` 10, `isHardMode` from the difficulty chip. **[CODE-ONLY]** `challenges-create.ts:265-288`, `CreateWizardV2.tsx:280-281`
- Task types and photo modes are on the add-task draft (`lib/add-task-draft.ts`). Hard difficulty overwrites every task to `photo_mode: "required"`. **[CODE-ONLY]** `challenges-create.ts:380-395`
- Invite: `groups.invite` inserts `challenge_invites` and an `in_app_notifications` row type `challenge_invite`. Share sheet uses `inviteToChallenge` → `griit://invite/{code}`. **[VERIFIED]** `lib/group-invite-link.test.ts`, `lib/deep-links.ts:28-29`
- Accept: `groups.respond` and `groups.openLink`. **[CODE-ONLY]** `groups.ts:322,413`
- Failure: full group (`GROUP_MAX_MEMBERS` 10), already a member, invitee not found, notification insert failure.

### d) Photo vs self-reported vs optional

- `photo_mode` lives in `challenge_tasks.config`, not a column. `required` adds a camera gate. `optional` and `none` do not. **[CODE-ONLY]** `backend/lib/task-model.ts:99-138`
- Stored image columns on `check_ins`: `proof_url`, `photo_url`, `completion_image_url`. **[VERIFIED]** migrations `20260321150000_check_ins_table_and_rls.sql` and later ALTERs. `proof_photo_url` is not a column. The app still uses that name as a derived field (`backend/lib/proof-predicate.ts:19-26`).
- Feed and profile show the derived URL. Sharing to the feed is a separate action (`checkins.shareProof` / `feed.shareCompletion`). Opening the share sheet does not flip `shared`. **[CODE-ONLY]** design note matches `02_screens.md:6128`; the code path is the shareProof mutation.
- Camera 30 badge counts a check-in if `verified` or any of those URLs is set. It does not check an in-app-camera source. **[CODE-ONLY]** `proof-predicate.ts:12-16`, `profiles-record.ts:591-593`
- `verification_gates` is a production column (operator) and migration `20261004010000_check_ins_verification_gates.sql`. `checkins.complete` writes these top-level keys: `time_gate`, `run_log`, `workout_log`, `journal_log`, `counter_log`, `checkin_log`, `simple_log`, `location_gate`, `photo_gate`, `strava_gate`. **[CODE-ONLY]** `backend/trpc/routes/checkins.ts` around 635–763. Nothing else reads those keys back out of the row.
- `checkins.complete` also writes `clocked_in_at` when the client sends it. **[CODE-ONLY]** `checkins.ts:849`. No migration adds that column. If production does not have it, a completion that includes the field fails the insert.

### e) Share

- Styles A–G, colours Ink / Orange / White, canvas 1080×1920 PNG via view-shot. **[VERIFIED]** `lib/share-image.ts:14-15`, tests.
- Default colour Ink. Last colour per style in AsyncStorage key `griit.shareColour.v1`. **[VERIFIED]** overnight G1 commit; tests in `lib/share-colour.test.ts`.
- Join line is `Find me on GRIIT · @{username}` while `SHARE_JOIN_WEB_ORIGIN` is `""`. **[VERIFIED]** `lib/share-image.ts`, `lib/share-image.test.ts`
- Destinations: feed (separate), Instagram Story only if a Facebook app id is set, Save to Photos, system share. **[CODE-ONLY]** `lib/share-sticker.ts` and the secured screen. Spec’s Messages-with-attachment path was not re-verified this pass. **[UNKNOWN]** if SMS attach is wired.
- Dev screen `/dev/share-styles` renders all 21. **[CODE-ONLY]** `app/dev/share-styles.tsx`

### f) Nudge

- Sender picks one of three lines. Server checks same challenge, not self, recipient not already secured, not already nudged today. Inserts `in_app_notifications` type `general` with `metadata` and `data` `{kind:'nudge', challenge_id, message_key, date_key, pushed}`. Push only if `groupPushSend` allows it. **[VERIFIED]** `lib/group-nudge.ts`, `groups.ts` nudge mutation, `lib/group-nudge.test.ts`
- Recipient sees an Activity row if the notifications reader maps `data`. There is no Today-card banner. Push title is “Nudge”, not “{sender} nudged you”. **[CODE-ONLY]** `groups.ts` insert around the nudge mutation.
- The old `nudges.send` path is a different feature and will error in production. **[CODE-ONLY]**

### g) Sign out, reinstall, guest, reset

- Sign out: `auth.signOut`. **[CODE-ONLY]** `backend/trpc/routes/auth.ts:45`
- Reinstall: session is Supabase; local colour memory and onboarding step cache are lost. Server streak remains. **[INFERRED]**
- Guest: `sessionKindFromUser` treats `is_anonymous` as guest. Completed onboarding sends them Home. **[VERIFIED]** `lib/onboarding-v2-routing.test.ts`
- Guest → Apple / email: manual linking is on in production (operator). The exact screen that calls `linkIdentity` was not opened. **[UNKNOWN]**
- Password reset: forgot-password and reset-password routes exist. Confirm-email is off (operator), so signup does not wait on a mailbox. **[CODE-ONLY]** routes exist.

### h) Delete account

Settings → type DELETE → `profiles.deleteAccount` deletes the `profiles` row with the user JWT, then `auth.admin.deleteUser` if `SUPABASE_SERVICE_ROLE_KEY` is set. **[CODE-ONLY]** `profiles.ts:532-547`. If the key is missing, the function still returns `{ok:true}` after the profile delete. Auth user can remain. Related rows depend on FK `ON DELETE CASCADE` where those FKs exist (`day_secures` cascades from `auth.users`, not from `profiles`). **[INFERRED]** a profile-only delete does not remove `auth.users`, so cascaded tables may remain until the auth user is deleted.

---

## 5. Core rules

**Secured (the day).** One `day_secures` row per user per `date_key`. **[VERIFIED]** `supabase/migrations/20260321143000_day_secures_table_and_rls.sql:4-9`. Written by `secure_day`. The client must not invent it.

**Secured (a group member, today).** All required `challenge_tasks` have a completed `check_ins` row for that member’s today. Empty task list is not secured. **[VERIFIED]** `memberSecuredFromCheckIns` `backend/lib/group-challenges.ts:66-75`.

**Streak (user).** `streaks.active_streak_count`, updated by `secure_day` and by miss reconcile. Client badge math in `longestSecuredRun` is a display copy: secured days add, freeze and Last Stand days hold the run and do not add. **[VERIFIED]** `lib/v42-badges.ts:75-104`, `lib/v42-badges.test.ts`. Server miss path can zero the column without deleting `day_secures`. **[CODE-ONLY]**

**Freezes.** Earn: the window resets the allotment to the limit when never used or when 30 days have passed (`effectiveFreezesRemaining`). Spend: yesterday only, one hole, remaining > 0, inserts `freeze_uses`, decrements remaining. Limits: 1 free, 4 if `profiles.is_premium`. **[VERIFIED]** `streaks.ts:33-102`. The offer helper refuses hard mode. **[VERIFIED]** `canOfferYesterdayFreeze` returns false when `hardMode` is true (`lib/freeze-recovery.ts:47`, `lib/freeze-recovery.test.ts`). The server `useFreeze` procedure still does not read `is_hard_mode`. **[CODE-ONLY]** A client that skips the helper can still spend a freeze on a No Days Off account.

**Last Stand.** Max 2. Earn after 6 of last 7 for premium or trial. Spend automatically on exactly one missed day. **[CODE-ONLY]** `backend/lib/last-stand.ts:1-19`, `miss-reconcile.ts:64-80`. This can protect a No Days Off user who is also Pro. **[INFERRED]**

**Day boundary.** `getTodayDateKey` formats now in the profile IANA timezone, else UTC. **[CODE-ONLY]** `backend/lib/date-utils.ts:44-46,34-41`. Check-ins prefer the task `schedule_timezone`, then profile, then UTC. **[CODE-ONLY]** `resolveCheckInTimeZone` lines 53-61.

**Time windows.** Gate mode `by` or `between` on the task. Hard-mode tasks reject completion outside the window in `checkins.complete`. **[CODE-ONLY]** `checkins.ts:356` region. Closed-window Home copy: `TODAY_WINDOW_CLOSED` and the follow-up in `lib/g2a-home.ts:17-30`.

**Place.** Location gate uses lat/lng/radius. Default radius constant 200 m in check-ins; the set-gym screen offers 100 / 250 / 1000 and does not write them. **[CODE-ONLY]** `checkins.ts:117`, set-gym has no TRPC.

**Photo mode.** `required` | `optional` | `none` in config. Legacy `require_photo` maps to required. **[CODE-ONLY]** `task-model.ts:99-104`.

**Challenge end.** `challenges.finalizeEnded`, `listUnseenEndings`, `markEndSeen`. 24h challenges refuse secure after `ends_at`. **[CODE-ONLY]** `checkins.ts:1415-1417`.

**Privacy.** Private if any of `profile_visibility`, `challenge_visibility`, `activity_visibility` is `private` or `friends`. The pure helper allows the owner, a mutual follow, or a co-member. **[VERIFIED]** `lib/profile-privacy.ts:29-49`, `lib/profile-privacy.test.ts`. The settings switch writes all three to the same value. **[CODE-ONLY]** `visibilitiesForPrivateSwitch` lines 52-64. The account-content gate used by the profile record always passes `isCoMember: false`. **[CODE-ONLY]** `backend/lib/account-privacy.ts:20`. A person in your challenge does not get your private profile through that path. The live feed does pass co-member challenge ids into `canSeeContent` for a shared event. **[CODE-ONLY]** `backend/lib/is-friend.ts` via `feed.ts:88-93`. So a shared proof can show in the feed while the profile stays locked.

**Feed.** `following`: author is you or someone you follow (accepted). `everyone`: also drops private accounts unless mutual or co-member, and drops anonymous users. Shared flag and challenge visibility still apply. **[CODE-ONLY]** `feed.ts:62-108`.

**Leaderboard.** `leaderboard.getWeekly` is public and ranks by count of `day_secures` in a rolling 7 days. **[CODE-ONLY]** `backend/trpc/routes/leaderboard.ts`. Friends board uses `consistencyScore`: weekly secured days × 100, plus streak capped at 99. **[CODE-ONLY]** `backend/lib/scoring.ts:14-15`. No unit test for that function. The challenge board sorts by check-ins this week, then display name, and does not use `consistencyScore`. Opt-in is `setBoardOptIn` and has no app caller found. **[CODE-ONLY]**

**Badges (the 12).** Defined in `lib/v42-badges.ts:25-38`. Evaluated in `evaluateV42Badges`. Facts come from `profiles.getRecord` (`profiles-record.ts:573-637`).

| Id | Rule in code | Source of the number |
|---|---|---|
| streak_3/7/14/30/75 | Longest secured run; holds don’t add | `day_secures` dates plus freeze and last-stand dates |
| secured_100 | Count of secured date keys | `day_secures` |
| finish_1 / finish_3 | Completed enrollments | `active_challenges.status === completed` |
| comeback | Secured the day after a due day that was not secured and not held | date math |
| full_house | `fullHouseAt` set by the record query | group completion; not re-audited line by line |
| early_10 | Secured days that include a check-in on a time-gated task | `gate_time_*` |
| camera_30 | Days with a camera-ish check-in | any proof URL or `verified`, not capture source |

Older `ACHIEVEMENTS` in `backend/lib/achievement-definitions.ts` is a second set of 27 keys. Battle Buddy is defined and never awarded. **[VERIFIED]** the accountability test. `streak_100` and `consistency` are also never pushed onto the unlock list. **[CODE-ONLY]** `backend/lib/achievements.ts`. Awards run from `secureDay` and, for hard-mode-first, from `checkins.complete`.

**Push budget.** Group pushes: max 2 per recipient per local day. A join push leaves one slot until a nudge has used one. Counted only when `metadata.pushed` is true. **[VERIFIED]** `lib/group-nudge.ts` `GROUP_PUSH_CAP` and `groupPushSend`, tests. Reminder cron is separate and not in that cap. **[CODE-ONLY]** `backend/hono.ts:109-112`, `backend/lib/cron-reminders.ts`.

---

## 6. Data model

Grouped by what the app uses. “NOT IN MIGRATIONS” means no `CREATE TABLE` was found by search. Columns added later are cited when read.

**Identity.** `profiles` — CREATE in the reconstructed baseline `20260621000000_baseline_schema_core_tables.sql:39`. RLS: **[UNKNOWN]** without re-reading every policy. Code reads timezone, visibility, premium, freezes, push token, username. `auth.users` is Supabase-owned.

**Challenges.** `challenges`, `challenge_tasks`, `active_challenges` — same baseline file, lines 99, 209, 162. Comment in that file says the CREATE was reconstructed and must not be trusted as live introspection. **[VERIFIED]** lines 6-16. `challenge_members`, `challenge_invites` have their own migrations (invites used by groups). `is_hard_mode` added in `20260908090000_challenges_is_hard_mode.sql`.

**Proof.** `check_ins` CREATE `20260321150000_check_ins_table_and_rls.sql` with `proof_url`. Later: `photo_url`, `completion_image_url`, `verification_status`, location, timer, `verification_gates` (`20261004010000`). RLS in that migration is own-row. **[CODE-ONLY]** groups therefore read other members’ check-ins with the service role. `day_secures` own-row RLS `20260321143000`.

**Streak protection.** `freeze_uses`, `last_stand_uses` appear as CREATE names in the migration scan. `streaks`: **NOT IN MIGRATIONS** as CREATE. Inserted by `secure_day` SQL (`20261003040000` line 200 and older RPCs). Code selects `user_id`, `active_streak_count`, `longest_streak_count`, `last_completed_date_key`, `last_stands_available`, `last_stands_used_total`.

**Social.** `user_follows`, `in_app_notifications` (`20260325100000`, title/body/data in `20260328140000`, type check including `general` and `challenge_invite` in `20260916230000`). `feed_comments`, `feed_reactions`, `activity_events`. `blocked_users`. `respects`: **NOT IN MIGRATIONS** as CREATE; `achievements.ts` still selects it. **[CODE-ONLY]**

**Groups leftover.** `teams`, `team_members`, `team_invites` are created in migrations. The teams tab still exists. Whether those tables are read on the live group path: group code uses `challenge_members`, not `teams`. **[CODE-ONLY]**

**Not in production, still in code or migrations.** `nudges`: no CREATE, but `nudges.ts` inserts. `accountability_pairs`: CREATE `20250228000000_accountability_pairs.sql`. Operator said there is no `accountability_partners` table (different name). The retired router does not query `accountability_pairs`. **[VERIFIED]** `backend/trpc/routes/accountability.test.ts`.

**JSON used as schema.**

- `challenge_tasks.config`: `photo_mode`, `require_photo_proof`, `photo_required`, `hard_mode`, `require_location`, and others. **[CODE-ONLY]** `task-model.ts`
- `in_app_notifications.metadata` and `.data`: `kind` (`nudge` | `joined`), `challenge_id`, `message_key`, `date_key`, `pushed`, plus invite ids. **[CODE-ONLY]** `groups.ts` insert payloads
- `check_ins.verification_gates`: keys listed in section 4d. `clocked_in_at` is written by `checkins.complete` and is **NOT IN MIGRATIONS**.

**Tables in migrations with little or no app use found this pass:** `stories`, `story_views`, `shared_goal_logs` (router exists), `invite_tracking`, `connected_accounts` (Strava). **[INFERRED]** from names plus a router existing for shared goal and Strava. A full unused-table proof was not run.

---

## 7. API surface

Mounted in `backend/trpc/app-router.ts:63-85`. Public procedures called out in the file header (lines 6-8) are not a complete list; discover procedures are also `publicProcedure`. **[CODE-ONLY]**

| Router | Procedures | Auth | Live? |
|---|---|---|---|
| auth | signUp, signIn, signOut, getSession, getEmailForUsername | mixed | Live. Old builds call these. |
| user | completeOnboarding | protected | Live. |
| profiles | get, ensure, create, update, search, deleteAccount, push token, subscription, follows, blocks, stats, record, badges | mixed | Live. `deleteAccount` is the current app. |
| challenges | list, getById, getActive, listMyActive, listMyQueued, create, join, leave, discover*, featured, starter pack, team, endings | mixed | Live. Featured UUIDs fail until SQL. |
| checkins | complete, secureDay, today, sessions, share proof, milestones | protected | Live. Core of 69–73. |
| starters | getChallengeIdByStarterId, join | protected | Live if onboarding still joins starters. |
| streaks | getFreezeStatus, useFreeze | protected | Live. |
| leaderboard | getWeekly, getFriendsBoard, getChallengeBoard, setBoardOptIn | mixed | Live. |
| respects | give, getForUser, getCountForUser | protected | Live. `getCountForUser` is not in `lib/trpc-paths.ts`. **[CODE-ONLY]** |
| nudges | send, getForUser | protected | **Broken in prod.** Writes `nudges`. Old builds that call it get an error. Do not delete without a version plan; do not leave it failing silently. |
| notifications | getAll, markAllRead, registerToken, reminder get/update, previewTaskReminderBody | protected | Live. Preview may be unused by the client. **[UNKNOWN]** caller. |
| accountability | listMine, invite, respond, remove | protected | Mounted. Every call throws “Accountability partners are now groups.” No DB, no push. **[VERIFIED]** `accountability.test.ts`. Old builds get a clean error instead of a missing route. |
| feed | list, listMine, getLiveFeed, post, comments, reactions, trending, streak at risk, shareCompletion | mixed | Live. |
| achievements | getForUser | protected | Live for old keys. |
| integrations | Strava URL, enabled, connection, activities, athlete, disconnect, verify | protected | Off when Strava env is empty. Operator: off in prod. |
| sharedGoal | logProgress, getRecentLogs, getContributions | protected | **[UNKNOWN]** if any current screen calls it. Paths are in `trpc-paths.ts`. |
| referrals | recordOpen, markJoinedChallenge | protected | Called from `app/challenge/[id].tsx`. |
| reports | create | protected | Report content. Caller not re-found in `app/`. **[UNKNOWN]** |
| today | get | protected | Home/today state. |
| home | bootstrap | protected | Home. |
| groups | invite, respond, cancel, openLink, members, nudge | protected | Live. New in chunk H for nudge. Older builds ignore unknown procedures; they do not need `groups.nudge`. Invite/respond existed before. **[INFERRED]** |

Direct client Supabase (from the route scan): `app/auth/login.tsx`, `signup.tsx`, `create-profile.tsx` use `profiles`. `app/challenge/[id].tsx` and the active screen read `active_challenges`. Onboarding uses the Supabase client for the session profile (`OnboardingFlowV2.tsx` imports `supabase`). **[CODE-ONLY]**

---

## 8. Notifications

**Group, server.**

- Invite: in-app type `challenge_invite`, title “Group invite”, body “{name} invited you to {title}”. Push the same body if under the cap. Data includes challenge and invite ids. **[CODE-ONLY]** `groups.ts` `insertInviteNotification`
- Nudge: in-app type `general`, title “Nudge”, body “{challenge}: {line}”. Push only when `pushed`. **[CODE-ONLY]**
- Cap: 2/day, nudge ahead of joined. **[VERIFIED]** tests.

**Not built.** 8pm “you’re left”. Morning-after “finished”. Spec priority list of 3. **[CODE-ONLY]** absence; overnight report records the skip.

**Partner pushes.** Removed with the accountability router. **[VERIFIED]**

**Last Stand push.** Title “Last Stand used”. Body includes the streak and remaining stands. **[CODE-ONLY]** `miss-reconcile.ts:11-16`

**Reminders.** `GET /api/cron/send-reminders` with `CRON_SECRET`. Copy lives in `lib/notification-copy.ts` (the 23 Sep audit quoted a fire emoji and “Last chance”). **[CODE-ONLY]** those strings may still be there; not re-opened line by line. Local scheduling: `notifications.updateReminderSettings` and `lib/notifications.ts` (725 lines). Identifiers were not listed one by one. **[UNKNOWN]** the full identifier set.

**Respect / follow / comment.** Inserts into `in_app_notifications` from the social and feed routers. Types `respect`, `comment`, `follow`, `follow_request` are allowed by the check constraint. **[VERIFIED]** migration `20260916230000` plus operator type list.

Deep links: invite opens `/invite/{code}`. Other notification taps were not traced to a router. **[UNKNOWN]**

---

## 9. Integrations and config

| System | Wired? | Env | If missing |
|---|---|---|---|
| Supabase | Yes | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Server refuses to boot those as required (`backend/server.ts:29-30`). |
| Service role | Yes | `SUPABASE_SERVICE_ROLE_KEY` | Boot check lists it missing. Group roster and account auth-delete degrade. |
| Railway | Yes | `PORT`, health `/api/health` | Process listens on 8080 by default. |
| Sentry | Yes | `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_DSN_BACKEND` | Empty DSN: no crash reporting (`lib/sentry.ts:3`, `backend/server.ts:6-8`). |
| PostHog | Yes | `EXPO_PUBLIC_POSTHOG_API_KEY`, optional `EXPO_PUBLIC_POSTHOG_ENABLE_DEV` | Missing key: no tracking, no crash (`lib/posthog.ts:4-9`). |
| RevenueCat | Yes | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (and android / legacy names), server `REVENUECAT_API_KEY` | Purchases fail. Freeze Pro check uses `is_premium` on the profile, not the store directly. |
| Strava | Code yes, prod off | `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI` | `enabled` is false unless all three are set (`strava-config.ts:17`). |
| Apple sign-in | Plugin in `app.json` | Apple team `WZT43QXHZB` | |
| Push | Expo | token columns, `notifications.registerToken` | No token: in-app still inserts, push send no-ops or errors into a log. |
| Camera, location, photos | `app.json` usage strings | | OS prompt. Set-gym “current location” does not save. |
| View-shot | Share PNG | | Share image fails. |
| Instagram Stories | Hidden without `EXPO_PUBLIC_FACEBOOK_APP_ID` | | Story button hidden. **[VERIFIED]** `lib/share-sticker.test.ts` |
| Upstash | Optional cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Cache off. **[CODE-ONLY]** `backend/lib/cache.ts:11-12` |
| Cron | GitHub Action hits Railway | `CRON_SECRET` | Reminders and daily reset reject. |

**EXPO_PUBLIC_ seen in code:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `API_URL`, `API_BASE_URL`, `SENTRY_DSN`, `POSTHOG_API_KEY`, `POSTHOG_ENABLE_DEV`, `REVENUECAT_IOS_KEY`, `REVENUECAT_IOS_API_KEY`, `REVENUECAT_ANDROID_KEY`, `REVENUECAT_ANDROID_API_KEY`, `FACEBOOK_APP_ID`, `DEEP_LINK_BASE_URL`, `ERROR_REPORT_URL`.

**Backend env:** `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN_BACKEND`, `REVENUECAT_API_KEY`, `CRON_SECRET`, `STRAVA_*`, `LOG_LEVEL`, `PORT`, `NODE_ENV`, `ERROR_REPORT_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RAILWAY_GIT_COMMIT_SHA` (health commit).

Which of these are set in the EAS production environment: the build log loaded `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`. Others **[UNKNOWN]**.

**Analytics event names** in `lib/analytics.ts:18-80` (type, not proof each fires): `app_opened`, `guest_view_screen`, `gate_modal_shown`, `signup_started`, `signup_completed`, `login_completed`, `onboarding_started`, `onboarding_step_completed`, `onboarding_completed`, `onboarding_dropped`, `starter_challenge_selected`, `first_challenge_joined`, `first_task_completed`, `day1_task_completed`, `day1_secured`, `challenge_viewed`, `challenge_joined`, `challenge_left`, `task_completed`, `day_secured`, `day_3_retained`, `day_7_retained`, `day_30_task_completed`, `screen_viewed`, paywall_* , `trial_started`, `subscription_started`, `subscription_cancelled`, `task_skipped`, `challenge_abandoned`, `challenge_created`, `feed_posted`, `proof_posted`, `discover_challenge_tapped`, `share_completed`, notification_*, `nudge_sent`, `respect_sent`, `streak_lost`, `streak_milestone`, push and notification permission events, `onboarding_goals_selected`, `commitment_selected`, `target_streak_selected`, `account_created`. `commitment_selected` is in the type and was not found at any call site. **[CODE-ONLY]**

---

## 10. Feature flags

Source `lib/feature-flags.ts`.

| Flag | Value | What the comment says it gates | Live? |
|---|---|---|---|
| IS_BETA | true | unlabeled | **[UNKNOWN]** readers |
| LOCATION_CHECKIN_ENABLED | true | location task “coming soon” when false | Likely read by the task flow. Not re-grepped. |
| PREMIUM_ENABLED | true | premium | |
| PREMIUM_CHALLENGE_PACKS | true | packs | |
| PREMIUM_ANALYTICS | true | analytics | |
| PREMIUM_PROFILE_FEATURES | true | profile | |
| PREMIUM_INTEGRATIONS | false | Strava/Health/WHOOP in settings | 23 Sep audit: no readers. Still false. |
| PR3_IMAGE_VIEWER | true | fullscreen proof | |
| PR3_FEED_DEDUPE | true | feed header | |
| PR3_ZERO_STATE_GATES | true | hide week strip at 0 | May fight v44, which hid the streak chip another way. **[INFERRED]** |
| PR3_HOME_STATE_ANALYTICS | true | home_state_viewed | |
| RUN_GOAL_CONFIG | false | run goals | Still false. Comment says schema not landed. |
| REAL_VERIFICATION | false | wait for server verified | Celebration does not wait. |
| FREEZE_SERVER_ENFORCED | false | extra freeze confirmation | Server already enforces useFreeze. Flag comment is stale. |
| JOURNAL_TAGS | false | mood chips | Off. |
| TASK_START_ARMING | true | start step | |
| WORKOUT_STRUCTURED | false | sets and reps | Off. |

`FREE_LIMITS`: 3 active challenges, 1 created, 5 respects/day, 3 nudges/day. **[CODE-ONLY]** `feature-flags.ts:73-78`. The group nudge limit in the server is once per pair per day, not this constant. Two nudge budgets. **[INFERRED]**

---

## 11. Error handling

- tRPC errors become toasts or inline errors where the screen catches them. Many `catch` blocks call `captureError` (Sentry wrapper). A full count of swallowed errors was not produced. The 23 Sep audit and `docs/archive/audits/GRIIT_CATCH_BLOCK_RECONCILIATION_20260502.md` are the older lists.
- `checkins.secureDay` logs and continues when the service role is missing, so the streak RPC can succeed while `total_days_secured` stays stale. The user still sees the secured screen. **[CODE-ONLY]** `checkins.ts:1458-1461`
- `groups.nudge` push failures are logged, not thrown. The in-app row remains. **[CODE-ONLY]**
- `nudges.send` throws INTERNAL_SERVER_ERROR when the insert fails. In production that is the missing table. The user of an old build sees a failed nudge. **[INFERRED]** from the throw at `nudges.ts` after insert error.
- Home and Discover have explicit error copy in the v44 spec. Whether every query surfaces it: Discover featured failure path was not clicked. **[UNKNOWN]**

---

## 12. Performance

- `feed.getLiveFeed` selects up to 500 `activity_events` from the last day, then filters in memory, with a page size capped at 30. **[CODE-ONLY]** `feed.ts:65-75`. At 1,000 active users this is the first query to watch.
- `streaks.useFreeze` loads up to 400 `day_secures` and 365 freeze and last-stand rows. Fine for one user. **[CODE-ONLY]** `streaks.ts:159-161`
- `checkins.ts` is one 1,667-line mutation with many sequential reads. Latency is the RPC plus those reads. **[INFERRED]**
- Images: share PNG is 1080×1920. Feed asks for a 4:5 frame. Whether uploads are resized before storage was not measured. **[UNKNOWN]** byte sizes.
- FlatList virtualization: not re-audited. The May 2026 flat-list audit is stale.

---

## 13. Tests

**271 files, 1435 tests, 0 failed, 0 pending.** Measured 4 Oct 2026. **[VERIFIED]**

Well covered: share join line and colours, v42 badges, freeze math, group nudge block and push cap, group secured-from-check-ins, onboarding routing, create copy, check-ins column lock, accountability retirement.

**Critical logic with no test found:**

- No Days Off miss does not reset `current_day` (no test expects a reset, and the code doesn’t do it).
- `nudges.send` against a missing table.
- Set-gym persistence (there is nothing to persist).
- Featured catalog join against a real row.
- `profiles.deleteAccount` when the service role is absent.
- Feed visibility matrix beyond `feed-friends-visibility.test.ts` (that file exists; depth not re-read).
- Instagram Story bytes on device.
- Hard mode forcing photo, versus a task the user set to optional.

No `it.skip` count was taken. Runtime was about 5 seconds locally. Not flaky in this run. **[VERIFIED]** one run only.

---

## 14. Code health

Largest non-test files (wc): `checkins.ts` 1667, `design-system.ts` 1567, `feed.ts` 1212, `useTaskFlowV2.ts` 1104, `LiveFeedSection.tsx` 1032, `challenges-discover.ts` 955, `app/(tabs)/index.tsx` 917, `groups.ts` 859, `HomeV3.tsx` 846, `StreakHeroV4.tsx` 779, `lib/notifications.ts` 725.

TODOs found: `components/task-v2/TaskConfirmation.tsx:33` “completion trigger”; `MomentScreenV3.tsx:244` “proofs for contact sheet”.

Naming: `HomeV3`, `g2a-home`, `v42-badges`, `StreakHeroV4`, `OnboardingFlowV2` are all live. `lib/routes.ts` still exports accountability paths.

**Since the 23 Sep 2026 audit** (`docs/audits/2026-09-23.md`, 983 tests, build 61):

- Tests grew from 983 to 1435.
- Accountability screens that audit listed as palette leaks are deleted.
- Share, Home today card, featured Discover, and group nudges landed.
- `FREEZE_SERVER_ENFORCED` is still false. The server procedure is the enforcement.
- `commitment_selected` is still in the analytics type; the screen is now a day target.
- Emoji copy in `lib/notification-copy.ts` was not re-checked. Assume it is still there until opened. **[UNKNOWN]**
- `expo-live-activity` “unmaintained” from expo-doctor was not re-run.

Dead code: `nudges` router, `sharedGoal` router, `teams` tables vs `challenge_members`, `ROUTES.ACCOUNTABILITY`, `create-challenge.tsx` / `create-profile.tsx` beside the v2 flows. Duplicate streak math: SQL `secure_day`, `evaluateMiss`, and `longestSecuredRun`.

---

## 15. Design vs build

Anything not opened on a phone is **Built (unverified on device)** even when tests exist. Tests are not a screenshot.

### v43 / v43.1 (`02_screens.md` from line 5884 and 5977)

| Item | Status |
|---|---|
| Privacy as one switch on three columns | Built (unverified on device). `lib/profile-privacy.ts:52-64` |
| Sparse Discover under 5 public challenges | **[UNKNOWN]** whether DiscoverV3 still merges Popular and Community. Spec `02_screens.md:5999` |
| Home week strip removed, streak line in the Today card | Partial. v44 then hid the chip at 0. `lib/g2a-home.ts:33-35` |
| Find friends when friends = 0 | **[UNKNOWN]** on the profile header without reading that component this pass |

### v44 (`02_screens.md:6036`)

| Frame | Status |
|---|---|
| 164 Feed one family, inset 16, radius 20, counts hidden at 0 | Built (unverified on device). Tests in `lib/chunk-u-feed.test.ts` / feed card family |
| 165 Home header, streak chip ≥ 1, closed window, empty state | Built (unverified on device). `HomeV3`, `g2a-home.ts` |
| 166 Detail order, freeze row, board, proofs | Partial. Freeze can be called from Home and active challenge. Board and “recent shared proofs” not confirmed complete |
| 167 Featured 8, “Be the first” | Partial. UI yes. Counts are 0 in code, not live joins. SQL not applied |
| 168 Preview sheet 780 tall with full rules | Partial. Sheet exists (`ChallengePreviewSheet`). Height and every limit line not measured |
| 169 Create copy, no category preselected, review lock, launched | Built (unverified on device). Start today goes Home, not into the first task. **Changed** |
| 170 Profile stats and kept proofs | Partial. Kept-proofs empty body was added. Mutual-friend count not re-verified |
| 171 Toast then one secured screen | Built (unverified on device). `task-complete-toast`, `SecuredDayScreen` |

### v44.1 (`02_screens.md:6117`)

| Frame | Status |
|---|---|
| 173 One PNG to every target, Story hidden without Meta id | Built (unverified on device) |
| 174 Styles A–G | Built (unverified on device). Join line **Changed** to `Find me on GRIIT · @user` until `SHARE_JOIN_WEB_ORIGIN` is set. Spec line 6143 still says `griit.app` |
| 175 Photos match | **Missing on device.** No Photos export was saved this session |
| 176 Moments and default styles | Built (unverified on device) |
| 177 Set your gym, 250 m default, skip clears the gate | **Partial / broken.** Screen is UI only. Skip does not write “gate off” because nothing is saved. Spec says skip means it counts anywhere |
| 178 Be the first, lengths 7 | Built in `lib/featured-catalog.ts`. DB rows missing |

### v45 (`02_screens.md:6176`)

| Frame | Status |
|---|---|
| 179 Roster from `day_secures` | **Changed.** Uses check-ins. Statuses “Window closed” and “Joined today · Day 1” not built. Order you-then-name is built (`lib/group-ui.ts`) |
| 180 Nudge sheet, three lines, no free text, once a day | Partial. Three lines and once-a-day yes. No “2 hours left” deadline gate, no bulk nudge, no “Nudged” inert state confirmed, push title is “Nudge” |
| 181 Budgets and 8pm / finished | **Missing** the timed pushes. Cap is 2, not 3. **Changed** on purpose |
| 182 Solo → group conversion | **Missing.** No “Make it a group” flow found in this pass |
| 183 Remove accountability, migration card | Screens removed. Router left as a rejecting stub. **Changed:** no migration card, by the overnight override |
| H4 privacy sentence | Built on the group rules step. `lib/create-mode-copy.ts` `GROUP_TASK_PRIVACY` |
| H6 invite link | Built. `inviteToChallenge` / `griit://` |

---

## 16. Copy inventory

Not every string in the app. These are the ones that promise a rule.

**Onboarding.** “How many days are you committing to. You can change it later, but you have to change it on purpose.” `DayTargetScreen.tsx:55`. Nothing in that sentence is enforced later. **[CODE-ONLY]**

**Create.** Standard: “Every gate blocks. A freeze can cover a missed day: 1 every 30 days, 4 on Pro.” No Days Off: “Every gate blocks. No freezes. A missed day goes back to Day 1.” `lib/create-mode-copy.ts:6-9`. The second sentence is false on the server. Photo line: “Photos stay private until each person shares them, whichever you pick.” Group extra: “People in a challenge with you see how many of today's tasks you've done.”

**Home.** “Today's window closed. Back tomorrow.” “Tomorrow your run goes back to Day 1.” Freeze line with “{n} left.” `lib/g2a-home.ts:17-23`. “Day secured.” vs “Done for today” vs task “done” / “saved” in the toast. Three verbs for one idea.

**Secured screen.** “Day {n} secured.” or “Day secured.” **[CODE-ONLY]** from the G2 implementation notes and `lib` secured copy. Not re-quoted from the component this pass.

**Roster.** “Secured” or “Not yet · {n} of {m}”. Not “Window closed”.

**Nudge lines.** “2 hours left.” “Don't break the chain.” “We're waiting on you.” The first is offered even when the window is not two hours out. The words over-promise.

**Accountability stub.** “Accountability partners are now groups.”

**Delete.** User must type DELETE. `AccountDangerZone.tsx:93`

**Flags that still say Coming soon** when location check-in is off. Flag is currently true, so that string should be hidden. **[INFERRED]**

**Jargon.** “No Days Off”, “secure”, “freeze”, “Last Stand”, “self-reported”, “gate”. Fine if consistent. They are not: code also says completed, done, finished, hard mode, and “Hard Mode.” in `lib/share-copy.ts:34`.

**Placeholder.** Create name “e.g. Gym before work”. Set-gym search placeholder exists on the screen. Featured “Be the first” is honest only because counts are stuck at 0.

---

## 17. App Store readiness

| Check | Status |
|---|---|
| Account deletion in the app | Present. Depends on the service role to delete the auth user. |
| Privacy policy and terms | Routes `app/legal/privacy-policy.tsx`, `app/legal/terms.tsx`. Whether Settings links them was not re-opened. **[UNKNOWN]** the link, **[CODE-ONLY]** the pages |
| Permission strings | Camera, location when in use, tracking, in `app.json` ios.infoPlist. Photos library string for saving shares was not re-read. **[UNKNOWN]** if `NSPhotoLibraryAddUsageDescription` is set |
| Sign in with Apple | `usesAppleSignIn: true`, plugin `expo-apple-authentication` in `app.json` |
| IAP | RevenueCat iOS key is in the EAS production env. Offerings and review notes **[UNKNOWN]** |
| Reporting and blocking | `reports.create`, `profiles.blockUser`. Block is on the visitor profile. Report button location **[UNKNOWN]** |
| Age rating | Not inspected. User-generated photos and text mean this cannot be “made for kids”. **[INFERRED]** |
| Crash risk | `checkins.complete` and `secure_day` are the crash-and-corrupt paths. Sentry is optional on DSN. |
| Metadata | Build 73 submitted 3 Oct 2026, still processing at submit time. Screenshots for v44 were not attached by this audit |
| Encryption | `ITSAppUsesNonExemptEncryption: false` in `app.json` |
| Beta vs internal | Submit config has no external group. Internal testers only, as shipped |

---

## 18. Known bugs and risks

Ranked by what a person hits.

1. **No Days Off does not restart the challenge.** Repro: create a hard challenge, miss a day, open Home the next day. Streak may be 0. `current_day` is unchanged. Copy says Day 1. `lib/create-mode-copy.ts:9`, `backend/lib/miss-reconcile.ts:90-98`.
2. **Hard mode forces a photo on every task** even if the add-task sheet said optional. `challenges-create.ts:380-395`. Combined with (1), “hard” means two different things.
3. **Featured join fails** until someone runs the draft SQL. The app still shows the cards and calls join. `lib/featured-catalog.ts`, `docs/drafts/v44-featured-catalog.sql`.
4. **Set your gym does nothing.** User thinks 250 m is saved. The next check-in has no place. `app/challenge/set-gym.tsx` has no mutation.
5. **`nudges.send` hits a missing table** for any old client. `backend/trpc/routes/nudges.ts:47-55`.
6. **Delete account can leave the login alive** if `SUPABASE_SERVICE_ROLE_KEY` is unset. `profiles.ts:542-546`.
7. **Group roster lies when the service role is missing** (everyone looks unsecured) because check-in RLS is own-row. `day_secures` policy `20260321143000` lines 20-22; check-ins similarly own-row.
8. **“2 hours left.” is always offered.** `lib/group-nudge.ts` message 0. Spec hid it outside a window.
9. **Camera 30 counts any photo URL**, including a roll photo if one can be stored. `proof-predicate.ts:12-16`.
10. **Two streak systems** (SQL column vs badge run vs group streak from `day_secures`) will disagree on screen if a freeze was used. Group streak still uses `day_secures`, which a freeze does not write. **[INFERRED]** from `memberYesterdayState` using secure keys and freeze living in `freeze_uses`.
11. **Accountability routes in `lib/routes.ts` point at deleted files.** A deep link to `/accountability` 404s. The API returns a message. Fine, but the constant is a trap.
12. **`total_days_secured` can lag** without the service role. Profile stat and badge “100 days” use different inputs (column vs `day_secures` count). They can diverge. **[INFERRED]**
13. **`clocked_in_at` is not in any migration** and is still assigned on the check-in upsert. Repro: complete a task that sends `clocked_in_at`. If the column is absent in production, the insert errors. `checkins.ts:849`.
14. **Profile privacy ignores co-membership.** `canViewerSeeAccountContent` hardcodes `isCoMember: false` (`account-privacy.ts:20`). The copy says people in a challenge with you see today’s task count. That is the roster, not the profile. A private profile stays private to those people.
15. **Dead screens still registered.** Root layout lists `create-team`, `team-invite`, and `join-team` with no files (`app/_layout.tsx`). `/proof/[id]` has no in-app navigation. `/discover/category/[slug]` has no caller. `/(tabs)/teams` is `href: null`. Settings export says “Coming with the next update” (`app/settings/account.tsx`). `checkins.saveProgress`, `respects.give`, and the Strava procedures have no current screen caller. Auth `signUp` / `signIn` on tRPC are unused; the app calls Supabase Auth directly.

---

## 19. What to do next

### Quick wins (under an hour each)

- Change the No Days Off sentence to match `evaluateMiss`, or hide `streaks.useFreeze` when `is_hard_mode` is true. Why: users are being told a rule that is false. Risk: low if you only change copy.
- Stop rendering “2 hours left.” unless you also compute the window. Why: the line is a lie at 9am. Risk: low.
- Remove or short-circuit `nudges.send` so it returns the same retired message as accountability, without touching `nudges`. Why: old apps get a clear error instead of a database exception. Risk: low. Do not add a table.
- Delete `ROUTES.ACCOUNTABILITY*` or point them at Home. Why: dead links. Risk: low.
- Put “featured catalog not in the database” in the Discover empty/error state if join returns not found. Why: the cards look real. Risk: low.

### Next chunk (one to two days)

- Implement No Days Off for real: on a miss, set that enrollment’s `current_day` back to 1 and do not offer a freeze. Add a test. Why: it is the product sentence. Risk: medium. Touches streaks people already have. Needs a decision first.
- Either persist set-gym (place + radius on the member’s task or enrollment) or remove the screen until you can. Why: it teaches a false gate. Risk: medium if you add columns. Prefer existing location columns on `challenge_tasks` only if they are per member. They look per challenge today. **[INFERRED]** So this may need a decision, not a sneaky column.
- Apply the featured SQL yourself (not in CI) and replace the hardcoded 0 counts with `participants_count` or a real count. Why: Discover is a poster. Risk: the SQL must be reviewed against live columns first.
- Finish roster statuses that are cheap: “Joined today” from `joined_at`, and stop offering a nudge when the window is closed if you already know the window on the server. Why: the nudge button currently trusts “not all tasks done”. Risk: medium.

### Strategic (Yaseen decides)

- What “hard” is: freezes versus reset, or forced camera, or both. The code has both. Pick one.
- Whether groups replace accountability only in the new app (current stub) or old builds must keep working partners. Production has no `accountability_partners` table. The pairs table is in migrations. Confirm it exists in prod before anyone writes a migration card.
- A web origin. Until then every share says “Find me on GRIIT”. `griit.app` must not be turned on by habit.
- Strava and Health. Flags and env say off. Don’t put them in the App Store description.
- Schema truth. Introspect production and replace the reconstructed baseline, and add `CREATE TABLE` for `streaks` and `respects` only if they exist. Do not invent them.
- Push budget: reminders plus group events are two systems. v45 wanted one cap of 3. You chose 2 for group events only. Say which one is the rule.
- Solo-to-group conversion (frame 182). It changes privacy of a private challenge. Don’t build it as a side effect.

---

## 20. Open questions

1. Should a missed No Days Off day reset `current_day` to 1, reset only the streak, or both?
2. Should hard mode force a camera on every task?
3. Do you want the featured INSERT applied to production, and who runs it?
4. Is set-gym a real gate (per member place) or should the screen go away until then?
5. Does `accountability_pairs` exist in production? The operator fact was `accountability_partners`, a different name.
6. Should `nudges.send` stay as a failing old route or return the retired message?
7. Is the service role set on Railway? Group roster and account deletion depend on it.
8. What is the App Store age rating and the support URL you want on the listing?
9. Do guest accounts need to merge into Apple, and is that UI actually finished?
10. Is “10 profiles, all public” still true after build 73, or only as of the last check?

---

## Appendix A — routes

See section 3. Constants: `lib/routes.ts:5-61`. Extra files with no `ROUTES` entry: `app/(tabs)/teams.tsx`, `app/create-challenge.tsx`, `app/dev/design.tsx`, `app/dev/share-styles.tsx`, `app/challenge/set-gym.tsx`, `app/+not-found.tsx`.

## Appendix B — procedures

See section 7. Path constants: `lib/trpc-paths.ts:5-179`. Procedures in routers but missing from that file include `respects.getCountForUser`, `notifications.previewTaskReminderBody`, and `challenges.listMyQueued` (queued is in the file at the challenges router; confirm before deleting). `auth.getEmailForUsername` is not in `TRPC`. **[CODE-ONLY]**

## Appendix C — tables touched

From migration CREATE names found by search, plus code-only:

In migrations: `profiles`, `challenges`, `active_challenges`, `challenge_tasks`, `challenge_members`, `challenge_invites`, `check_ins`, `day_secures`, `freeze_uses`, `last_stand_uses`, `in_app_notifications`, `user_follows`, `push_tokens`, `activity_events`, `feed_comments`, `feed_reactions`, `blocked_users`, `accountability_pairs`, `connected_accounts`, `user_achievements`, `teams`, `team_members`, `team_invites`, `shared_goal_logs`, `stories`, `story_views`, `invite_tracking`, `challenge_reports`.

Used by SQL or TS with **no CREATE found**: `streaks`, `respects`, `nudges`.

## Appendix D — env vars

Listed in section 9. EAS production build 73 injected four `EXPO_PUBLIC_` values (API URL, RevenueCat iOS key, Supabase URL, Supabase anon key). Everything else on the server is **[UNKNOWN]** from this repo alone.

---

Audit limits. No device. No production SQL. No App Store Connect click-through. Line numbers refer to the tree above and will drift on the next edit.
