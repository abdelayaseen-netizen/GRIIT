repo: abdelayaseen-netizen/GRIIT
branch: main

## Last sync

date: 2026-09-22T23:12:10Z

### Updated in this project

- Built Chunk U part A (frames 87-92: profile structure, proofs as days, the day viewer, Consistency rebuilt, badges as rows) and part B (frames 93-96: one feed card family, inline comments, the per-challenge board, the week strip).
- Read `components/feed/FeedEngagementRow.tsx` to confirm the engagement row: it ships Heart, MessageCircle and ArrowUpRight, so share is restored rather than cut.
- Restored the five real badges from `components/ds/Badges.tsx` and frame 21 after an earlier pass invented a new set; the stamp language (no icons, no circles, no cards) holds.
- Logged contradictions 64 to 74, including `FeedEngagementRow` on the daylight palette and its counts hidden at zero.

## Sync history

date: 2026-09-18T22:41:47Z
tree: 9e4f1d5897ae

### Updated in this project

- Applied five v26 fixes: the share choice now rides on whichever of frame 58 / 59 is reached (never both); Proofs tiles are date-sectioned and challenge-labelled; the Discover subtitle binds `FREE_ACTIVE_CHALLENGES_LIMIT = 3` from `lib/free-challenge-limit.ts` instead of the group cap; `ds/ControlPill` is declared in `01_components.md`; `05_diff_from_current_app.md` gained the chunk-Q build order.
- Read `lib/design-system.ts` for the real `DiscoverCTA` hexes (`#1A1410`, `#E8593C`, `#888780`, `#5F5E5A`) — the earlier "blue-grey" description was wrong.
- Added contradiction 45: `checkins.complete` inserts the public `task_completed` row with the photo at completion (`checkins.ts:822-842`), so the share choice needs a `shared` flag written false and flipped on share.

- Built frames 58 to 66 against build 58: the proof moment, Secured with 0/1/3+ photos, the Proofs grid and full view, the manual Run step, control pills, the capture shutter, Edit profile on DS_V3, the Discover row, and one consistency number.
- Found three consistency definitions shipping at once — `lib/profile-consistency.ts` (rolling 7 days), Home's streak-derived percentage, and `profiles-record.ts`'s correct `verifiedClosed / closedDueDays` that neither surface reads.
- Found `app/task/secured.tsx` carries a single `proofUri` param, so a day with several camera proofs cannot be represented; `splitSecuredProof` already computes what is needed.
- Found `TaskCapture`'s shutter fill is `surface` by deliberate comment, which is near-invisible on a dark viewfinder.
- Logged contradictions 33 to 44 and seven open product decisions.

- Built frames 52 to 57 (the morning after, the two zeros, the freeze offer, partial miss in the record, roster yesterday, the evening reminders) from a read of the streak, freeze and Last Stand rules.
- Established from code that Last Stand is automatic, premium/trial-only and retrospective — no grace window or countdown exists, so the brief's grace-window screens were not designed.
- Established that freezes are manual and unreachable: `streaks.useFreeze` is called from no client path and `StreakFreezeModal`'s primary only dismisses the modal.
- Logged contradictions 20 to 32, including two that break the freeze outright (the cron nulls the field `useFreeze` validates against; only one day can ever be frozen) and a free-tier trap where Last Stands are earned but unspendable.
- Recorded a ten-row Decisions table for the rules the code does not have (partial-miss data, group yesterday state, freeze restore semantics, evening notification count).

- Built frames 47 to 51 (multi-challenge day, task-done/day-open, Counter/Timer/Run steps, add-task second pass, comments sheet and respect state).
- Confirmed `ds/Sheet` and `ds/CommentRow` shipped as chunks N and M proposed, and used both as-is.
- Corrected the timer honesty copy against `RunningStep`/`TimerEntryStep`: the timer is wall-clock, so "leaving the app pauses it" is false. `strict_timer_mode` is hardcoded false in `taskStrictAndPhoto()` and asserted by tests, so no screen describes strict timer behaviour.
- Confirmed no `MapView` anywhere under `components/`; the Run step and place screen are designed without a map and say so.
- Logged contradictions 10 to 19, including `FeedPostV3.tsx:132` rendering the respect heart with no `fill`, `SessionStep` using "verified", and `FeedPostCard` importing `DS_DAYLIGHT` inside a dark app.

- Built frames 42 to 46 (add task sheet, preview row, Home card, time gate, discard sheet) on the one-type/zero-to-three-gates model.
- Audited the repo against that model and recorded nine contradictions with paths: ten `WizardTaskType` values vs five types, `require_heart_rate` as a forbidden fourth proof mechanism, timer strictness columns, no time-window columns or server check at all, `routine_anchor` overlap, `verification_method` derived from type, retired types in the starter seed, and `WhoRespectedSheet` still on pre-DS_V3 tokens.
- Read `NewTaskSheet.tsx` in full: it asks "what proves it" twice (a `photo` chip in `PROOF_TYPES` plus a separate "Verified proof" switch), and `requirePhoto: type === "photo" || verified` makes that switch inert on a Photo task.
- Proposed `ds/Sheet` and `ds/Switch`: `components/ds/` has neither, and the three existing sheets disagree with each other.

- Built frames 39 to 41 (post detail with comments, writing task step, consistency record) from a read of `components/ds/{Skeleton, TextField, ProofImage, MemberRow, Stamp, Card, PushedHeader}.tsx`.
- Noted that `ds/MemberRow` now exists (chunk L's withdrawn proposal was built) and that it does not fit comment rows: avatar 40 and a status trailing slot.
- Confirmed there is no `StatCard`, `ProgressBar` or `SectionLabel` in `components/ds/`; the record's stats block is `Card` + a text grid and the month bars are nested views.
- Proposed one component, `ds/CommentRow`, with the reasons it is neither MemberRow nor ListRow.

- Read `components/ds/{ListRow, Button, Card, Avatar, PushedHeader, Chip, DisplayNumber, Divider, EmptyState}.tsx` to ground the group-challenge reuse notes in the real API.
- Withdrew a proposed `ds/MemberRow`: `ListRow` already takes an arbitrary `icon` ReactNode, so an `Avatar` drops in. Chunk L adds no components.
- Corrected the reuse notes to the real variant names (`primary`/`secondary`/`tertiary`, `ghost`/`form`), `ListRow`'s own divider, and `EmptyState` over a Card.
- Recorded two conflicts rather than papering over them: primary fill `#BB471D`+`textPrimary` vs `Button`'s `brand`+`onBrand`, and `ListRow`'s always-`textPrimary` title vs the read state of a notification row.

- Read `claude/onboarding-v2-spec.md` for the locked v2 decisions: screen order, paywall removal, day target vs Standard/Hard, the three identity-gap cases, the greeting fallback.
- Lifted the six real goals and their example lines from `components/onboarding/v2/screens/GoalsScreen.tsx`.
- Lifted the real reminder presets, notification-preview anatomy and skip copy from `RemindersScreen.tsx`, and the field set and "Skip for now" exit from `AccountNameScreen.tsx`.
- Rebuilt onboarding screens 2 to 9 on DS_V3 as frames 31 and 32 plus `src/components/onboarding/`.

### Earlier

- Read `claude/onboarding-v2-spec.md` for the locked v2 decisions: screen order, paywall removal, day target vs Standard/Hard, the three identity-gap cases, the greeting fallback.
- Lifted the six real goals, the reminder presets and the account field set from `components/onboarding/v2/screens/`.

## Screen map

| Screen | Built from |
|---|---|
| 2 Goals | `components/onboarding/v2/screens/GoalsScreen.tsx`, `components/onboarding/onboarding-theme.ts` |
| 3 WhyProof | `components/onboarding/v2/screens/WhyProofScreen.tsx`, `claude/onboarding-v2-spec.md` |
| 4 WhyCircle | `components/onboarding/v2/screens/WhyCircleScreen.tsx` |
| 5 Commitment | `components/onboarding/v2/screens/CommitmentScreen.tsx`, spec section 5 |
| 6 FirstChallenge | `components/onboarding/v2/screens/FirstChallengeScreen.tsx`, `AutoSuggestChallengeScreen.tsx` |
| 7 Reminders | `components/onboarding/v2/screens/RemindersScreen.tsx`, `lib/onboarding-v2-reminders` |
| 8 Account | `components/onboarding/v2/screens/AccountNameScreen.tsx`, spec section 8 |
| 9 Profile | `components/onboarding/screens/ProfileSetup.tsx`, spec section 9 |
| 34 Roster, 35 Invite picker, 36 Invite notification | `components/ds/{ListRow, Avatar, Button, EmptyState, PushedHeader, Divider}.tsx` |
| 37 Challenge detail, invited | `components/ds/{Button, Chip}.tsx`, `components/ds/ListRow.tsx` |
| 38 Group row | `components/ds/ListRow.tsx` |
| 39 Post detail | `components/ds/{ProofImage, Skeleton, TextField, Avatar, Divider, PushedHeader, Stamp}.tsx` |
| 40 Writing step | `components/ds/{PushedHeader, Button}.tsx`, `components/task-v2/steps` |
| 41 Consistency record | `components/ds/{DisplayNumber, Card, Divider, PushedHeader}.tsx` |
| 42 Add task sheet | `components/create/{NewTaskSheet,v2/StepTasks}.tsx`, `components/ds/{Chip, TextField, SegmentedControl, Button, ListRow}.tsx` |
| 43 Preview row, 44 Home card | `components/create/v2/StepTasks.tsx`, `app/(tabs)/index.tsx`, `backend/trpc/routes/today.ts` |
| 45 Time gate | `components/task-v2/`, `backend/trpc/routes/checkins.ts` |
| 46 Discard sheet | `components/task-v2/steps/DiscardPhotoModal.tsx`, `components/feed/WhoRespectedSheet.tsx` |
| Task model audit | `backend/lib/challenge-tasks.ts`, `backend/trpc/routes/challenges.ts`, `backend/lib/starter-seed.ts` |
| 47 Multi-challenge day | `app/(tabs)/index.tsx`, `backend/trpc/routes/today.ts` |
| 48 Task done, day open | `components/task-v2/steps/{ChallengeDoneStep,ConfirmationStep}.tsx`, `components/task-v2/ChallengeDoneScreen.tsx` |
| 49 Counter, Timer, Run | `components/task-v2/steps/{CountStep,TimerEntryStep,RunningStep,SessionStep}.tsx`, `lib/task-flow-state.ts` |
| 50 Add task, second pass | `components/create/NewTaskSheet.tsx`, `components/ds/{Chip,TextField,Sheet}.tsx` |
| 51 Comments and respect | `components/feed/{FeedPostV3,FeedEngagementRow,WhoRespectedSheet}.tsx`, `components/ds/{CommentRow,Sheet}.tsx` |
| 52 The morning after, 53 Two zeros | `backend/trpc/routes/profiles-stats.ts`, `lib/use-reconcile-streak.ts`, `app/(tabs)/index.tsx` |
| 54 The freeze | `backend/trpc/routes/streaks.ts`, `components/StreakFreezeModal.tsx` |
| 55 Partial miss | `backend/lib/{daily-reset,last-stand}.ts`, `app/profile/consistency.tsx` |
| 56 Roster yesterday | `app/challenge/[id]/members.tsx`, `components/ds/MemberRow.tsx` |
| 57 The evening before | `lib/notifications.ts`, `lib/notification-copy.ts` |
| 58 Proof moment | `components/task-v2/{TaskConfirmation,MomentScreenV3}.tsx`, `components/task-v2/useTaskFlowV2.ts` |
| 59 Secured | `app/task/secured.tsx`, `backend/lib/proof-predicate.ts` |
| 60 Proofs grid | `app/(tabs)/profile.tsx`, `backend/trpc/routes/profiles-record.ts` |
| 61 Run manual, 62 Controls | `components/task-v2/steps/{RunningStep,SessionStep,CountStep,TimerEntryStep}.tsx`, `components/task-v2/taskFlowStyles.ts` |
| 63 Capture | `components/task-v2/TaskCapture.tsx` |
| 64 Edit profile | `app/edit-profile.tsx`, `lib/profile-v2-tokens.ts` |
| 65 Discover row | `components/home/DiscoverCTA.tsx` |
| 66 One number | `lib/profile-consistency.ts`, `backend/trpc/routes/profiles-record.ts` |
| 87-92 Profile, proofs, consistency, badges | `app/(tabs)/profile.tsx`, `app/profile/record.tsx`, `components/ds/Badges.tsx` |
| 93-96 Feed cards, comments, board, week strip | `components/feed/{FeedPostV3,FeedEngagementRow,FeedPostCard}.tsx`, `components/ds/WeekStrip.tsx`, `app/(tabs)/index.tsx` |
| Tokens throughout | `lib/design-system.ts` (DS_V3) |
| Flow order and routing | `components/onboarding/v2/OnboardingFlowV2.tsx`, `app/_layout.tsx` |
