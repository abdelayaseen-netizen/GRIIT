# GRIT — End-to-End QA Checklist

**Branch:** `starter-packs-e2e-qa`  
**Date:** 2025-02-28  
**Purpose:** Verify every primary button and flow works; document fixes.

---

## Routes / screens involved

| Route | Screen | Purpose |
|-------|--------|--------|
| `/(tabs)` | Tab navigator | Home, Discover, Create, Activity, Profile |
| `/(tabs)/index` | Home | Secure day, challenge card, recovery, leaderboard position |
| `/(tabs)/discover` | Discover | Starter Pack, 24H, Featured, More Challenges; search/filter |
| `/(tabs)/create` | Create | Create challenge (gated for guest) |
| `/(tabs)/activity` | Activity | Leaderboard, respects, daily stats |
| `/(tabs)/profile` | Profile | Tier, stats, edit, share, settings |
| `/challenge/[id]` | Challenge detail | Join/Commit, tasks, share |
| `/commitment` | Commitment | Confirm join (challenges.join or starter local) |
| `/create-profile` | Create profile | Username, display name (post-signup) |
| `/edit-profile` | Edit profile | Update profile |
| `/onboarding` | Onboarding | Goal, time budget, starter pick |
| `/day1-quick-win` | Day 1 quick win | First task + Secure Day |
| `/secure-confirmation` | Secure confirmation | Post-secure celebration |
| `/task/journal`, `/task/timer`, etc. | Task screens | Complete task |
| Auth gate modal | — | Guest → signup; post-signup return to pending action |

---

## A) Guest journey

| Screen | Button/CTA | Expected | Actual | Fix |
|--------|------------|----------|--------|-----|
| Discover | Tap Starter Pack card | Navigate to `/challenge/[id]` | — | Implemented: `handleChallengePress(c.id)` |
| Challenge detail | Tap "Commit" / "Join" | Auth gate modal appears | — | `requireAuth("join", handleJoin)` |
| Auth gate | Sign up → create profile → onboarding (if enabled) | After signup, return to intended action | — | Implemented: `pendingActionRef` in AuthGateContext; after signup `user` set → effect runs pending action (navigate to commitment) |
| Commitment | Tap "I'm in" | `challenges.join` or starter save → replace to Home | — | commitment.tsx uses `challenges.join` when `isStarter === "0"` |

---

## B) Signed-in activation journey

| Screen | Button/CTA | Expected | Actual | Fix |
|--------|------------|----------|--------|-----|
| Discover | Starter Pack → tap card | Challenge detail by real `id` | — | getStarterPack returns real UUIDs |
| Challenge detail | "Commit" | Navigate to /commitment | — | handleJoin pushes to commitment |
| Commitment | "I'm in" | challenges.join → Home; active challenge on Home | — | refetchAll after join |
| Home | Challenge card "Continue Today" | Navigate to challenge or task | — | Existing |
| Home / task | Complete task | checkins.complete | — | Existing |
| Home | Secure Day | checkins.secureDay; streak + milestone at 7/30 | — | Existing |
| Home | Progression / YOUR POSITION | Real tier, pointsToNextTier, rank | — | Real data wired |

---

## C) Social / competition journey

| Screen | Button/CTA | Expected | Actual | Fix |
|--------|------------|----------|--------|-----|
| Activity | Leaderboard | Real entries or "Be the first this week" | — | leaderboard.getWeekly |
| Activity | Respect button on entry | respects.give → refetch; count updates | — | handleGiveRespect |
| Activity | Top This Week / Weekly Leaderboard | Same real data; no dead taps | — | Same entries |

---

## D) Profile journey

| Screen | Button/CTA | Expected | Actual | Fix |
|--------|------------|----------|--------|-----|
| Profile | Tier / points to next | Real tier, pointsToNextTier, nextTierName | — | getStats |
| Profile | Edit | Navigate to /edit-profile | — | Existing |
| Profile | Settings (if present) | Screen or coming soon | — | — |
| Profile | preferred_secure_time | Editable if UI present | — | profiles.update accepts preferred_secure_time |

---

## E) Create tab journey

| Screen | Button/CTA | Expected | Actual | Fix |
|--------|------------|----------|--------|-----|
| Create (guest) | Any CTA | Auth gate | — | requireAuth where needed |
| Create (signed in) | Primary CTA | Create flow or honest "Coming soon" | — | No fake actions |

---

## Fixes applied (summary)

1. **Starter Pack** — Backend `challenges.getStarterPack()`; Discover section at top; cards open `/challenge/[id]` (real UUID); Join → commitment → challenges.join.
2. **Post-signup return** — AuthGateContext stores `pendingActionRef` when guest taps gated action; on `user` truthy, effect runs action and clears ref; close gate clears ref so dismiss doesn’t run action.
3. **No mocks in Starter Pack** — Section only renders when `starterPack.length > 0` (real API); empty state is no section.
4. **Challenge detail for Starter Pack** — UUIDs use getById + commitment with isStarter=0 so backend join is used.

---

## Empty / error behavior

- Leaderboard empty: "Be the first this week."
- Starter Pack empty: Section hidden (no fake cards).
- Challenge not found: "Challenge not found" + Go Back.
- API errors: Retry or honest message; no placeholder numbers.

---

## Deep-link / back behavior

- Commitment: Backdrop and X call `closeGate` / back; no trap.
- Challenge detail: Back returns to Discover or previous screen.
- After join: replace to Home so stack is clean.
