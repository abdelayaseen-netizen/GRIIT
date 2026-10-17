# GRIIT — Status of Record

**Last verified:** 2026-10-17 — build 90 shipped (chunk 10 of `docs/build90/`)
**Current branch:** `feat/build90` (from `feat/build89` at `a375b25a`)
**Build on TestFlight:** EAS iOS production, App Store Connect **build number 91**, commit `5d3de5bd`, submitted 2026-10-17 19:16 UTC to the internal group "Team (Expo)". The project calls it build 90; the counter reads 91 because a first `eas build` attempt bumped it and then failed on a local-workflow check (see the chunk 10 report).
**Backend:** Railway `grit-backend`, `/api/health` → `0d36821`
**Harness:** `feat/agent-testers` at `c616bc72` (agents/src, build 90 fixes)

## Build 90 (Oct 17) in one paragraph

Ten chunks, all PASSED in `docs/build90/PROGRESS.md`, evidence in `docs/reports/build90.md`. Speed: a task finish is on screen in under 300 ms and the server confirm went from 3.6 s / 2.9 s to 626 ms / 533 ms (photo / self-reported medians); request bursts after a finish and in sign-up and join were cut (0 × 429). First day: Join sticks, finish opens the first task, an empty Home shows a starter card, onboarding ends on a task, timers have a length and a "Finished early?". Task inputs: workout chips and duration, pace and speed sanity checks with Save anyway, journal word rule client and server, counters cannot finish below target. Posting: a post-or-private sheet after every task, your own post in both feeds, correct share card data, four sticker cards. Links and numbers: every person and challenge name opens the right page; Home, Profile and the challenge page count from one bootstrap payload; is_test accounts hidden from real users. Words: definitions at the moment they happen, "Self-reported" once per screen, greeting never `@user_xxx`. Safety: every public text field moderated server-side with a dodge-proof normalizer; report a comment; journal entries private. Friend loop: visible invite link with Copy and Share, `griit://i/<id>` opens the challenge for another account or a brand-new guest, Discover search by name or code. Strava auto-detect behind `FLAGS.STRAVA_AUTO_VERIFY` (off). SQL for chunks 03, 06, 08, 09 in `docs/sql/build90.sql`, all run by Yaseen Oct 17.

Open after build 90: the overnight agent run on this build (`docs/reports/oct-build90/`, chunk 10.4) and whatever it finds; `BUGS.md` rows 1–29 are "fixed – awaiting Yaseen"; Strava webhook registration (curl in the chunk 09 report) when the flag turns on; is_test boards decision (05.3 kept as is: test personas never appear on real users' boards, test personas may share a board with each other).

Everything below this line is the August 30 audit, kept as history.

---

## One-paragraph state

GRIIT is a working React Native / Expo app on a Supabase backend. The core loop runs end to end: challenge → proof → `secure_day` → streak → feed. Typecheck clean, 261 tests green, working tree clean. What's unfinished is the launch layer: a second onboarding flow exists as a scaffold and is switched off, Teams is a dead stub, several product flags are `false`, six Expo packages are a patch behind, and Apple Sign-In is broken in production for a reason outside the codebase.

## What August was actually about

One theme dominates the last month, and it's worth naming: **stop lying to the user about whether the day is secured.**

- **Streak / day-secured truthfulness (Aug 9–30, the bulk).** Home, the week strip, streak count and the Secured screen were showing success before the server had actually locked the day. Fixed at the database level first — `secure_day` as `SECURITY DEFINER`, unique `streaks.user_id` so upserts work, own-row RLS so Home can read the count — then the UI was gated on a real server secure plus fresh stats. Most recent: streak reconciliation writes moved off `getStats`, because a read shouldn't mutate.
- **Verification / check-in honesty (Aug 5–21).** Location rules apply to check-in tasks only. No "checking" overlay unless the task has a real gate. Verification rows are facts, not decorative pass marks. If securing the day fails, the UI says so.
- **Anonymous → real account (Aug 21–30).** Start without signing up, upgrade to email later keeping the same user id.
- **Timezone (Aug 30, not on main).** Device IANA written on every profile-create path, so "today" is the user's day rather than UTC by accident.

Worth sitting with: a month of work on verification honesty, and `REAL_VERIFICATION` is still `false`. Whatever that flag gates, it's the payoff for all of the above.

## Recent commits

| Date | Hash | |
|---|---|---|
| 08-30 | `9f3fef9` | fix(stats): move streak reconciliation writes off getStats |
| 08-30 | `3357fd6` | fix(timezone): write device IANA on all profile create paths |
| 08-30 | `edcb23e` | test(anon-auth): cover typo email and identity_taken upgrade paths |
| 08-21 | `6666cb8` | Feat/anon session upgrade (#51) |
| 08-21 | `97eef9e` | feat(feed): open challenge when tapping challenge name (#50) |
| 08-21 | `95adab9` | fix(streaks): own-row RLS so Home can read the count (#49) |

`edcb23e` **resolves the identity-gap question** that stalled work on Aug 21 — the typo-email and identity-taken cases now have committed tests. That was the open decision; it's answered.

## Branches

- **`fix/streak-integrity`** — current, clean, 2 ahead of main (timezone + stats reconciliation)
- **`fix/launch-blockers`** — Aug 18, **open PR #39**, the only recent branch that still looks unfinished. Decide: finish or close.
- ~12 leftover Aug 21 branches, all merged as PRs #40–#51 — safe to delete locally
- Stale open leftovers: PR #38 (May diagnostic), #26 (comments sheet), draft #15 (profile redesign)

**Merge `fix/streak-integrity` into main before starting onboarding work.** The timezone fix touches every profile-create path, and onboarding creates profiles — branching off a main without it risks writing a new profile-create path that reintroduces the bug.

## Onboarding — settled

Two flows exist. **The old one is live**, confirmed in code and on device.

`app/onboarding/index.tsx:8` — `FLAGS.ONBOARDING_V2 ? <OnboardingFlowV2 /> : <OnboardingFlow />`
`lib/feature-flags.ts:39` — `ONBOARDING_V2: false`, hardcoded boolean, no env or remote override.

V2 is a **mockup shell**, not a finished flow: no join, no goal filtering, no back handlers, no step persistence, no Profile screen. One real integration (Account → anon upgrade). Flipping the flag today would ship broken onboarding.

Full build plan, locked decisions and screen-by-screen copy: **`claude/onboarding-v2-spec.md`**.

## Confirmed on device (build 47)

1. **Apple Sign-In fails visibly** — `Provider (issuer "https://appleid.apple.com") is not enabled`. Fix is a **Supabase dashboard toggle** (Authentication → Providers → Apple), not code. Separately `app.json` lacks `ios.usesAppleSignIn` (plugin present at `:73`), which breaks SIWA on a clean EAS prebuild.
2. **Goal selection doesn't influence the suggested challenge.** Picking *Mental discipline* + *Daily habits* returned "Drink Water Today" and "Quick Steps." This is the **old** flow (`GoalSelection` → `AutoSuggestChallengeScreen`), distinct from the v2 `GoalsScreen` TODO. Two separate mapping gaps.
3. **Home greets "Welcome, User"** — profile skipped, no fallback to username.
4. Notification permission prompt fires mid-form on the profile step.

## Ranked blockers to a TestFlight build

1. **Apple Sign-In** — enable the provider in Supabase; add `ios.usesAppleSignIn: true`; retest on device
2. **Merge `fix/streak-integrity` to main** — then branch onboarding work off it
3. **Cut a fresh build** — device is 9 commits behind; today's testing tests stale code
4. **Onboarding** — follow `claude/onboarding-v2-spec.md`, Chunk A first
5. **Confirm migrations applied in production** — anon RLS + `handle_new_user` anon-safe
6. **`npx expo install --check`** — six patch mismatches
7. **Resolve or close PR #39**
8. **Store checklist** — ASC keywords/trademark scrub, account-deletion service role, Teams stub reachability
9. **RevenueCat sandbox** — offerings + `GRIIT Pro` entitlement on a real device build
10. **Product honesty flags** — `REAL_VERIFICATION`, `COMPLETION_REWARDS` still `false`

*Resolved since the first audit: dirty working tree (tests committed in `edcb23e`), identity-gap decision (answered in the same commit).*

## Integration status

| Integration | Verdict | Note |
|---|---|---|
| Supabase auth | Fully wired | email/password + session |
| Apple Sign-In | **Broken in prod** | provider disabled in dashboard; `usesAppleSignIn` missing from `app.json` |
| Anon → permanent upgrade | Built, unreachable | library + `AccountScreen` shipped, gated behind `ONBOARDING_V2` |
| RevenueCat | Mostly wired | needs prod keys + offerings |
| PostHog | Mostly wired | prod-gated unless `EXPO_PUBLIC_POSTHOG_ENABLE_DEV` |
| Sentry | Wired | client + backend |

## Hot files, last 30 days

`hooks/useTaskCompleteScreen.tsx` (8) · `app/(tabs)/index.tsx` (7) · `contexts/AppContext.tsx` (4) · `backend/trpc/routes/profiles-stats.ts` (4) · `backend/trpc/routes/checkins.ts` (4) · `hooks/useAppChallengeMutations.ts` (3) · `components/home/StreakHeroV4.tsx` (3)

## How a change reaches the phone

Nothing is automatic. Editing a file does nothing to the device.

edit → commit → push → `eas build --platform ios --profile production` (20–40 min) → EAS submits to App Store Connect → Apple processes (5 min–hours) → TestFlight notifies → tap Update

## Open TODOs

- `components/onboarding/v2/screens/GoalsScreen.tsx:9` — goals→pack mapping (v2)
- Old-flow equivalent: `GoalSelection` → `AutoSuggestChallengeScreen`, confirmed broken on device
- `components/create/NewTaskSheet.tsx:148` — user's distance unit
- `components/create/CreateWizardV2.tsx:234–244` — Run goal config **not persisted**
- `backend/lib/strava-callback.ts:80` — `@ts-expect-error`, table type missing

## Watch items

- `expo-live-activity` flagged **unmaintained**. Natural fit for a streak app; a future migration if load-bearing.
- Debug logging from PRs #47/#48 was merged with "revert later" noted. Check it's gone before shipping.

---

*Update this doc rather than starting a new one. Each session begins with no memory of the last — this file is the continuity.*
