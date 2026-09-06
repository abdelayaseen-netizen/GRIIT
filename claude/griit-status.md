# GRIIT status

## Task completion v2

In progress on `feat/task-completion-v2`.

- `profiles.distance_unit` (`km` | `mi`, default `mi`) — **must be applied to live Supabase before device testing** (`supabase/migrations/20260906010000_profiles_distance_unit.sql`).
- Timer: `checkins.startSession` writes `proof_payload_json.session`; complete validates wall clock; no cron. Notification: "Come back to post proof."
- Live Activities: timer + run/workout only, on `expo-live-activity` (title / subtitle / native timer / `brand.primary`). **counter +1 Live Activity requires expo-widgets or a native AppIntent target; deferred.**

## Onboarding

v2 is live. `FLAGS.ONBOARDING_V2` defaults to true (`lib/feature-flags.ts`). Set `EXPO_PUBLIC_ONBOARDING_V2=false` to run the old flow in a preview build.

## Profile v2

Phases 1–7 are on `feat/profile-v2-phase-1`. Privacy columns are live. Visitor record is gated in `profiles.getRecord`.

### Open — streak semantics (Q2)

The streak card reads `streaks.active_streak_count` / `longest_streak_count` / `last_completed_date_key` exactly as Home (`profiles.getStats`). Whether a calendar day with no active challenge **pauses** or **breaks** the streak is a backend decision for later. Do not change streak write paths in the profile v2 PR.
