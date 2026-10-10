# Build 82

Shipped to internal TestFlight on Oct 10, 2026. Build 81 (`8c19152d`) was already submitted before these Oct 9–10 device fixes, so this binary is build 82.

- Build number: **82** (1.0.0)
- Binary commit: `5155614e`
- Health: `https://grit-backend-production.up.railway.app/api/health` returned 200 with commit `5155614`
- Railway deployment: `40048927-e7a4-4e2e-930b-1171f7039519`
- EAS build: `bff4063d-f58a-4a68-9b16-d15539035554`
- Submission: `d32544a1-ef78-4759-871c-1dfd53887cae`
- IPA: `https://expo.dev/artifacts/eas/HqlWtyL1Ku1MB24oZCGPeEaqyXl0AxZdeyHz8cTS868.ipa`
- Group: internal only. The production submit profile does not attach an external TestFlight group.
- This report is docs-only and is not in the binary.

## Causes

1. Timer Post. The running screen never received the saving flag, so Post drew no spinner. After the save succeeded, navigation waited on another today-list request before leaving the timer. Home later showed the task done because the save had already landed.
2. Optimistic feed card. The share toast built the card with an empty challenge name and day 1 of 1. The server row is the enrollment and task from the save (`Gym once a day · Day 6 of 7 · Workout`). A card is inserted only when that same data is present.

The Gym photo card with day 1 of 1 is created only after the share request returns. The anon key could not read that row. The toast kept the unanswered line until the request finished, and it now stays one line (`Saved.` plus the task name) and the photo pill for 4 seconds.

## Checks

- Full suite: 310 files, 1601 tests. Typecheck was clean.
- Maestro `build81-timer`: timer reaches Time's up, Pause and Reset hide, Post lands on Home with the toast.
