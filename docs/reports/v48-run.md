# v48 run

Branch stack starts at `feat/v48-a-foundations` from main `3b8e9af5`.

## A1 Tokens

Commit `36f2c242`. tsc 0. Tests 281 files / 1482 after A5 (A1 was 279 files / 1475).

Ported `tokens.v46.ts` into `lib/design-system.ts` (`DS_V3`): surface `#1A1918`, raised, hairline, text roles, selected invert colours, `categoryTint` (flag 199), six avatar tints. Title L, Title, and Headline are weight 600. Display numerals stay SF Pro weight 800 (`fontFamily` unset so iOS uses the system face). `dynamicType` maps titleL → title1, title → title3, headline → subheadline, number → null. Old names `display`, `heading`, and `bodyStrong` alias the new roles.

Grep:

- Raw 6-digit hex in `components/` and `app/`: none.
- `fontSize` / `fontWeight` literals outside `lib/design-system.ts`: 162 files in `components/`, `app/`, and `lib/`. BLOCKED: rewriting every stylesheet is the screen work in C–F. The token values those screens already spread from `DS_V3.type` did change.
- Orange still in use: `DS_V3.color.brand` (`#DC5401`) and `primary` (`#BB471D`) are the token roles. Retired `brandText` / `brandTint` are still referenced from 74 files (onboarding, share stickers, profile tokens, theme palettes, create steps). Those stay listed until the screen phases invert selection and drop orange text.

## A2 Safe areas

Commit `bb774608`. tsc 0. Tests 280 files / 1478 at that commit; suite is 1482 at the phase tip.

`lib/safe-area.ts` ports the v48 floors (top 59, bottom 34, tab total 83). `components/ds/Screen.tsx` applies `max(inset, floor)` for the requested edges. `lib/safe-area.test.ts` fails if an `app/` route (not a layout, not `+api`) renders without `<Screen`.

Files changed: every previous `SafeAreaView` route under `app/`, plus `app/create/index.tsx`, `app/(tabs)/create.tsx`, `app/create-challenge.tsx`, `app/onboarding/index.tsx`, `app/paywall.tsx`, `app/+not-found.tsx`, `app/proof/[id].tsx`, `app/profile/day.tsx`, `app/task/complete.tsx`, `app/task/secured.tsx`, `app/challenge/complete.tsx`, `app/challenge/end.tsx`. Inner flows that already padded the same inset (`TaskFlowV2`, `CreateWizardV2`, `OnboardingFlowV2`, paywall bodies, `MomentScreenV3`, `SecuredDayScreen`, `ChallengeEnd`) no longer add a second top inset. `components/ds/Sheet.tsx` uses `max(inset.bottom, 34)`.

## A3 Copy

Commit `8e6e24dd`. tsc 0. Suite green.

`lib/copy.ts` is the port of `v48/copy.ts`, including `FREEZE`. Home recovery, the morning-after fact and button, FreezeSheet, StreakSheet, and the challenge-detail freeze row read `FREEZE`.

Grep: no `"Verified"` or `VERIFIED` string literals in `app/` or `components/`. Other freeze sentences remain and are not the shared offer line: hard-mode "No freezes." on challenge detail, paywall "4 streak freezes…", JeopardyModal (Phase C deletes it), consistency explanation, settings "1 streak freeze a month".

## A4 Routing

Commit `12ebdca0`. tsc 0. Suite 1480 tests at that commit.

`originTabHref("home")` is `/(tabs)`, the file `app/(tabs)/index.tsx`. `/(tabs)/index` was the build 75 not-found. A test checks every origin tab href exists on disk and does not contain `/index`. `+not-found` is canvas, `headerShown: false` on the screen and in the root stack, label "Go to Home", and that link uses `originTabHref("home")`.

## A5 Config

Commit `05d20f40`. tsc 0. Tests 281 files / 1482 passed.

`INVITE_BASE` lives in `lib/config.ts` (the deep-link env, otherwise null). `inviteDeepLink` builds `{INVITE_BASE}/i/{code}`, or `griit://i/{code}` when the base is unset. Never `griit.app`. `app/i/[code].tsx` redirects onto `/invite/[code]`.

`GET /api/config` returns `{ min_supported_build }` from `MIN_SUPPORTED_BUILD`. Launch calls `readMinSupportedBuild()`. The force-update screen is Phase F. **needs Railway deploy.**

## Phase A tip

`feat/v48-a-foundations` @ `05d20f40`. tsc 0. 281 files, 1482 tests.
