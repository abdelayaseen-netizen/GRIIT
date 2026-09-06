# GRIIT status

## Onboarding

v2 is live. `FLAGS.ONBOARDING_V2` defaults to true (`lib/feature-flags.ts`). Set `EXPO_PUBLIC_ONBOARDING_V2=false` to run the old flow in a preview build.

## Profile v2

Phases 1–5 are on `feat/profile-v2-phase-1`. Stopped at the start of Phase 6 — the privacy migration is **not written**.

### Open — streak semantics (Q2)

The streak card reads `streaks.active_streak_count` / `longest_streak_count` / `last_completed_date_key` exactly as Home (`profiles.getStats`). Whether a calendar day with no active challenge **pauses** or **breaks** the streak is a backend decision for later. Do not change streak write paths in the profile v2 PR.

### Privacy columns (Eng 1)

`profiles.challenge_visibility` and `profiles.activity_visibility` land in Phase 6. Write the migration, stop before applying. Until applied, those two Settings controls stay disabled with "Coming with the next update".
