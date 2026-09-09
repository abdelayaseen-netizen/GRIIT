repo: abdelayaseen-netizen/GRIIT
branch: main

## Last sync

date: 2026-09-09T18:30:12Z

### Updated in this project

- Read `claude/onboarding-v2-spec.md` for the locked v2 decisions: screen order, paywall removal, day target vs Standard/Hard, the three identity-gap cases, the greeting fallback.
- Lifted the six real goals and their example lines from `components/onboarding/v2/screens/GoalsScreen.tsx`.
- Lifted the real reminder presets, notification-preview anatomy and skip copy from `RemindersScreen.tsx`, and the field set and "Skip for now" exit from `AccountNameScreen.tsx`.
- Rebuilt onboarding screens 2 to 9 on DS_V3 as frames 31 and 32 plus `src/components/onboarding/`.

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
| Flow order and routing | `components/onboarding/v2/OnboardingFlowV2.tsx`, `app/_layout.tsx` |
