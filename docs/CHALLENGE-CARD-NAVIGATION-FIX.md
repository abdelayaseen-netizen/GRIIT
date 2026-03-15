# Challenge Card Navigation — Diagnosis & Fix

**Completed:** 2025-03-15

## Phase 1 — Diagnosis Report

```
┌──────────────────────────────────────────────────────────────────┐
│ DIAGNOSIS REPORT                                                 │
├──────────────────────────────────────────────────────────────────┤
│ Route file exists?          YES at app/challenge/[id].tsx        │
│ Route file location?         outside (tabs) — correct            │
│ ROUTES.CHALLENGE_ID value?  (id: string) => `/challenge/${id}`   │
│ Challenge ID at tap time?    defined (c.id / challengeId passed)  │
│ API returns field named?     id (Supabase .select("*") → id)      │
│ Card component expects?      id (Discover), challengeId (Home)    │
│ Field name mismatch?         NO                                   │
│ Layout redirect intercepting? YES — ROOT CAUSE                    │
│ TypeScript errors?           NO (activity.tsx push cast added)   │
│                                                                  │
│ ROOT CAUSE: AuthRedirector and RootLayoutNav redirected users    │
│ off /challenge/[id]: (1) When onboarding incomplete,             │
│ AuthRedirector did router.replace(ROUTES.TABS), sending user     │
│ to Home. (2) When needsOnboarding, RootLayoutNav did             │
│ <Redirect href="/onboarding" />, so challenge never showed.       │
└──────────────────────────────────────────────────────────────────┘
```

## Phase 2 — Fix Applied

- **app/_layout.tsx**
  - **AuthRedirector:** Added `inChallenge = (first === "challenge")`. When user is on `/challenge/[id]`, do not redirect to TABS for incomplete onboarding. Applied to both conditions that replace with ROUTES.TABS (onboardingCompleted === false and onboardingCompleted === true && !onboardingCompleteFromStore).
  - **RootLayoutNav:** Added `firstSegment` and `inChallenge`. When user is on challenge, do not redirect to `/onboarding` when `needsOnboarding` is true; allow challenge detail to render.

- **app/(tabs)/activity.tsx**
  - Added `as never` to `router.push(ROUTES.CHALLENGE_ID(e.challenge_id))` for type consistency.

## Verification

| Check | Result |
|-------|--------|
| Route file exists | YES app/challenge/[id].tsx |
| ROUTES.CHALLENGE_ID | `/challenge/${id}` |
| Challenge ID at tap | Passed from API/cards (id / challengeId) |
| Layout redirect | Fixed — challenge segment allowed |
| Discover → card tap | Should open Challenge Detail |
| Home → card tap | Should open Challenge Detail |
| Home → feed "View Challenge" | Should open Challenge Detail |
| Detail shows correct data | Yes (getById(id) loads by same id) |
