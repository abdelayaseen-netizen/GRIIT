# Build 83

Shipped to internal TestFlight on Oct 10, 2026.

- Build number: **83** (1.0.0)
- Binary commit: `1efe8c06`
- EAS build: `13e5911c-d474-427a-b99f-477118e0e7f9`
- Submission: `b537182f-725d-44da-b25b-a801465fdeca`
- IPA: `https://expo.dev/artifacts/eas/vZH9vOC2Gim0E9JMhEiDuEJwrTnGh3scSMN8wCXqyo8.ipa`
- Railway deployment: `be110700-adb6-428e-af6c-530f8ef9bf17`
- Group: internal only. The production submit profile does not attach an external TestFlight group.
- This report is docs-only and is not in the binary.

The health endpoint still prints commit `5155614`. That value is `RAILWAY_GIT_COMMIT_SHA` from the last GitHub deploy. This backend was uploaded from `1efe8c06` with `railway up`, and the process restarted. The branch was not pushed.

## Causes

1. A finished day was inserted as `share_state = 'shared'` whenever the column was omitted, because the column default was `shared`. New completion inserts now send `unanswered`. `shared` is written only by an explicit share tap (`shareProof`, `shareCompletion`). Joining a challenge and creating a challenge still insert `shared`, because those feed cards are "Started the challenge", not proofs.
2. The camera proof composer stayed open after the save. It now shows a spinner and leaves for Home once the save returns.
3. Discover category chips filtered only part of the page. Featured, the hero, and the grid now use the same category match.
4. At the largest text size, onboarding goal cards were two columns and clipped to a few letters. They are one full-width column, titles wrap, and the button lives in the scroll.
5. Create left the keyboard up over the category chips. Dragging or tapping the heading dismisses it, and focusing the title scrolls the chips up.
6. A journal with no word minimum showed Post while the field was empty. An empty field stays "Write here" until one word is typed.

## Checks

- Unit tests for the share default, Discover filter, and write button: 17 passed.
- Maestro `build83-discover`, `build83-create`, and `build83-proof` passed on the simulator.
- The largest-text onboarding flow was not a green Maestro run. After a scroll, cards that were on screen wrapped in full ("Daily habits", "Wake times, water, tidy space"). The footer button "Pick at least one" was on screen after scrolling. The flow then looked for a card that had already scrolled off.
- The write-task save was not completed on device. One open of Daily Gratitude showed "0 of 150" and "Write 150 more words", with Post absent. The home-row tap did not open that screen again.

The column default change is in `supabase/migrations/20261010120000_share_state_default_unanswered.sql`. It was not applied. It does not rewrite existing rows.
