repo: abdelayaseen-netizen/GRIIT
branch: main

## Last sync

date: 2026-09-17T11:02:30Z
tree: 9a065f7838c6

### Updated in this project

- Built frames 42 to 46 (add task sheet, preview row, Home card, time gate, discard sheet) on the one-type/zero-to-three-gates model.
- Audited the repo against that model and recorded nine contradictions with paths: ten `WizardTaskType` values vs five types, `require_heart_rate` as a forbidden fourth proof mechanism, timer strictness columns, no time-window columns or server check at all, `routine_anchor` overlap, `verification_method` derived from type, retired types in the starter seed, and `WhoRespectedSheet` still on pre-DS_V3 tokens.
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
| Tokens throughout | `lib/design-system.ts` (DS_V3) |
| Flow order and routing | `components/onboarding/v2/OnboardingFlowV2.tsx`, `app/_layout.tsx` |
