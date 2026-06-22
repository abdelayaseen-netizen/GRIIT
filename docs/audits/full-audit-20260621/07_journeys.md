# 07 — Critical User Journeys (end to end)

> Phase 7 of 10. Read-only. Branch `feat/onboarding @ 953bccb`. Each hop cites the nav edge (Phase 1) and/or data call (Phase 4/6). Marked **OK / BROKEN / STUBBED**.

## A. Cold start → auth → onboarding → paywall → Home
| Hop | Evidence | Status |
|---|---|---|
| Cold start / fonts / splash | `app/_layout.tsx:437-503` (`useFonts`, splash timeout) | OK |
| Onboarding gate | `app/_layout.tsx:318-352` AsyncStorage `ONBOARDING_COMPLETED` → `<Redirect/>` | OK |
| No user → onboarding | `AuthRedirector` `:229-231` `replace(/onboarding)` (V1 flow; V2 gated off) | OK |
| Auth (login/signup) | `app/auth/login.tsx`, `signup.tsx` → Supabase → `replace(TABS/CREATE_PROFILE)` | OK |
| **Email-verify / OTP** | **no screen**; signup falls back to `signInWithPassword` (`signup.tsx:151-166`) | **UNVERIFIED-LIVE** (BROKEN if Supabase "Confirm email" is ON) |
| create-profile | `app/create-profile.tsx` → `replace(TABS)` | OK |
| Paywall | **not a hard launch gate** — optional/imperative | OK (non-blocking) |
| Home | `app/(tabs)/index.tsx` | OK |

**Weakest link:** email-verify path (no screen) — `UNVERIFIED-LIVE`.

## B. Create challenge — fast path AND custom wizard → live challenge
| Hop | Evidence | Status |
|---|---|---|
| Fast path: Discover card tap | `ChallengeGridCard.tsx:96`/`ForYouHero.tsx:89` → `router.push(CHALLENGE_ID)` | OK |
| → Challenge detail → Join | `app/challenge/[id].tsx:736` `trpcMutate(TRPC.challenges.join)` → `:813 replace(TABS_HOME)` | OK |
| Custom wizard | `(tabs)/create` → `/create` → `CreateWizardV2` → `challenges.create` → `:292 replace(CHALLENGE_ACTIVE(id))` | OK |
| `challenge_created` fires | `CreateWizardV2.tsx:278` + backend `challenges-create.ts:328` | OK |

- Note: there is **no true one-tap fast-lane** — Discover "Start" routes to the challenge **detail**, where Join happens (consistent with the earlier FIX-1 abort).
**Weakest link:** free `MAX_CREATED_CHALLENGES` unenforced (Phase 3) — a free user may exceed the create limit.

## C. Daily task → proof capture → submit → streak update → Activity/feed
| Hop | Evidence | Status |
|---|---|---|
| Enter task | `app/challenge/active/[…].tsx` / `[id].tsx:893` → `task/complete` | OK |
| Proof capture | `usePhotoCapture.ts:49,73` (camera/library perms) → `uploadProofImageFromBase64` → `task-proofs` bucket | OK |
| Submit check-in | `useAppChallengeMutations.ts:110` `checkins.complete` | OK |
| Secure day | `useAppChallengeMutations.ts:235` `checkins.secureDay` → `day_secures` | OK |
| Streak update | secureDay + nightly `/internal/daily-reset` (`daily-reset.ts`) | OK (cron cadence `UNVERIFIED-LIVE`) |
| Feed post | `useTaskCompleteScreen.tsx:617` `feed.shareCompletion` | OK |
| Streak **freeze** spend | `streaks.useFreeze` has **no caller** (Phase 4); only `getFreezeStatus` read | **STUBBED** (freeze is display-only; save path goes via last-stand) |

**Weakest link:** streak-freeze *spend* unwired; cron cadence `UNVERIFIED-LIVE`.

## D. Feed: respect / comment / block-unblock
| Hop | Evidence | Status |
|---|---|---|
| Respect | `feed.react` (`LiveFeedSection`, `FeedPostCard`) | OK |
| Comment | `feed.comment` / `getComments` (`app/post/[id].tsx`) | OK |
| Report post | `app/post/[id].tsx:235,478` "Report" + "Hide post" | OK |
| **Block / unblock user** | **no `block`/`unblock`/`mute` feature anywhere** (rg → only `TEXT_MUTED` color false-positives) | **BROKEN / MISSING** |

- `ReportChallengeModal` (challenge reporting) is **knip-flagged unused** (Phase 0) — the challenge-report path may be dead, leaving only post-level report + hide.
**Weakest link:** **no block-abusive-user capability** → **App Store Guideline 1.2 (UGC) rejection risk.** Report exists; block does not.

## E. Leaderboard view → profile
| Hop | Evidence | Status |
|---|---|---|
| Leaderboard | `components/activity/LeaderboardTab.tsx` (`leaderboard.getWeekly/getFriendsBoard/getChallengeBoard`) | OK |
| Row → profile | `LeaderboardTab.tsx:460` `router.push(PROFILE_USERNAME)` / `:454 TABS_PROFILE` | OK |

**Fully connected.** ✅

## F. Profile → settings → account deletion (5.1.1(v))
| Hop | Evidence | Status |
|---|---|---|
| Profile → Settings | `app/(tabs)/profile.tsx:482` `router.push(SETTINGS)` | OK |
| Settings → Delete | `components/settings/AccountDangerZone.tsx` (type-"DELETE" confirm, loading/error) | OK |
| Delete mutation | `AccountDangerZone.tsx:121` `trpcMutate(TRPC.profiles.deleteAccount)` → signOut + `runClientSignOutCleanup` + `replace(AUTH)` | OK |

**In-app account deletion present and confirmed.** ✅ (Guideline 5.1.1(v) satisfied — server-side erasure `UNVERIFIED-LIVE`.)

## G. Paywall → purchase → "GRIIT Pro" unlock → premium feature
| Hop | Evidence | Status |
|---|---|---|
| Paywall offering | `app/paywall.tsx:70` `getOfferings()` (no hardcoded prices) | OK |
| Purchase | `purchasePackage` → entitlement `"GRIIT Pro"` (`subscription.ts:159`) | OK (`UNVERIFIED-LIVE`) |
| Entitlement → unlock | `useProStatus` refetch → `isLockedProFeature` (`challenge/[id].tsx:364`) | OK, but **fail-open default `isPro=true`** (`:344`) latent (Phase 3) |
| Restore | `paywall.tsx:137` / `settings.tsx:298` `restorePurchases` | OK |

**Weakest link:** purchase round-trip `UNVERIFIED-LIVE` (RC dashboard/device); latent fail-open default.

## Summary
| Journey | Verdict |
|---|---|
| A. Cold start → Home | OK, except email-verify (`UNVERIFIED-LIVE`) |
| B. Create (fast + wizard) | **Fully connected**; limit-enforcement caveat |
| C. Task → proof → streak → feed | **Connected**; freeze-spend STUBBED |
| D. Feed respect/comment/**block** | **BROKEN** — no block-user (UGC risk) |
| E. Leaderboard → profile | **Fully connected** ✅ |
| F. Profile → settings → delete | **Fully connected** ✅ |
| G. Paywall → purchase → unlock | Connected (`UNVERIFIED-LIVE`); fail-open default |

**Journeys with a BROKEN/STUBBED hop:** D (block — BROKEN), C (freeze-spend — STUBBED). **Fully connected:** B, E, F. **Gated on live verification:** A (email-verify), G (purchase).
