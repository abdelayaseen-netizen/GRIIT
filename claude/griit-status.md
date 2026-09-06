# GRIIT status

## Onboarding

v2 is live. `FLAGS.ONBOARDING_V2` defaults to true (`lib/feature-flags.ts`). Set `EXPO_PUBLIC_ONBOARDING_V2=false` to run the old flow in a preview build.

## Profile v2

Phases 1–7 are on `feat/profile-v2-phase-1`. Privacy columns are live. Visitor record is gated in `profiles.getRecord`.

### Open — streak semantics (Q2)

The streak card reads `streaks.active_streak_count` / `longest_streak_count` / `last_completed_date_key` exactly as Home (`profiles.getStats`). Whether a calendar day with no active challenge **pauses** or **breaks** the streak is a backend decision for later. Do not change streak write paths in the profile v2 PR.
