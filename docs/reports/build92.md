# Build 92 report

Branch `feat/build92` from `origin/feat/build90` (`f217c38f`). Spec: `docs/build92/` and `design/handoff/b92/`.
Artifacts per chunk under `docs/reports/build92/<chunk>/`.

Baselines (chunk 01 start, `ce607336`): `tsc --noEmit` 5 errors (`docs/reports/build92/01/tsc-baseline.txt`);
vitest 4 failing tests in 3 files, all pre-existing (`challenge-detail-mapping` ×2, `featured-catalog-seed`,
`join-challenge-error`; `docs/reports/build92/01/vitest-baseline.txt`).

## Chunk 01 · Glass foundation and Create

Design reference: `design/handoff/b92/part0-liquid-glass/` README + `src/ds/glass/*` + `app/-tabs-/_layout.tsx`;
frames P0-01 … P0-14; top-level README "Part 0" checklist (lines 190–219).

Token mapping (handoff → shipped): `DS_COLORS_V2.brand` → `DS_V3.color.brand` (#DC5401, active tab icon only);
`DS_COLORS_V2.textPrimary` → `DS_V3.color.textPrimary`; primary fill → `DS_V3.color.primary` (#BB471D);
`DS_V3.type.secondary/caption/bodyStrong` exist; `secondaryStrong` → secondary + weight 500;
`Button` is `label`-prop based, so `variant="glass"` was added to `components/ds/Button.tsx`.
Folder: the handoff's `src/ds/glass/` ports to `components/ds/glass/` (the app's DS folder; there is no `src/`),
with pure tokens and the on/off rule in `lib/glass.ts` so vitest can read them.

### 01.1 Glass components
- Design reference: part0 README "Tokens", "Orange on glass", "Engineering notes"; `src/ds/glass/*`.
- Root cause (why new): no glass tokens, sheet, action bar or top bar existed; `Sheet.tsx` uses a 60% canvas scrim.
- Change: `lib/glass.ts` (GLASS, GLASS_FALLBACK, GLASS_STATE, GLASS_ACCENT, radii/insets, `glassEnabled`,
  `topBarGlassOpacity`), `components/ds/glass/{useGlass,GlassSurface,GlassSheet,FloatingActionBar,GlassTopBar,index}`,
  `FLAGS.LIQUID_GLASS = false`, `Button variant="glass"`.
- Fallback rule: flag off, or iOS < 26, or Reduce Transparency → #1A1A1A + 1 px #2A2A2A (`glassEnabled`).
- **Needs Yaseen:** `expo-glass-effect` (the native `GlassView`) is not installed and is a native module (new dev
  client). Flag-on today renders the Part 0 tint without blur. Steps: `npx expo install expo-glass-effect`, rebuild
  the dev client (`npx expo run:ios`), then in `components/ds/glass/GlassSurface.tsx` replace the tinted `View` in the
  flag-on branch with `<GlassView glassEffectStyle="regular" tintColor={GLASS[kind].tint}>` (comment marks the spot).
- Test: `lib/glass.test.ts` (failed before: module missing; passes now).

### 01.2 Tab bar
- Root cause: `components/ds/TabBar.tsx` had 4 tabs + a FAB circle (order Home, Discover, +, Activity, Profile) on
  `DS_V3.color.surface` (#1A1918) / `border` (#2A2928), FAB pushed the wizard tab. No native-tabs path.
- Change (flag off): 5 tabs Home, Discover, Create, Activity, Profile; Lucide `Home, Compass, CirclePlus, Flame, User`;
  pill on `GLASS_FALLBACK`; active icon `GLASS_ACCENT.activeTabIcon` (#DC5401), active label Text 1; pressed state
  white 22% + scale 0.98; `testID`s `tab-*`. Create calls `openCreateChooser()` and never navigates.
- Change (flag on): `components/ds/glass/NativeGlassTabs.tsx` on `expo-router/unstable-native-tabs` (verified present
  in expo-router 6.0.24: `NativeTabs`, `Trigger`, `Icon sf/src`, `Label`, `minimizeBehavior`, `iconColor`,
  `labelStyle`). `minimizeBehavior` is `never` with Reduce Motion, else `onScrollDown`. Icons use the README's SF Symbol
  mapping (house, safari, plus.circle, flame, person) on the tab bar only, because the Lucide-as-template-PNG path needs
  assets the repo does not ship.
- Not available in expo-router 6.0.24: a tab-bar bottom accessory ("+ Create" while shrunk). Flag-on only; recorded
  under "Needs Yaseen".
- Test: `lib/glass.test.ts` "tab bar" (failed before: yes; passes now: yes). Maestro `build92-01-create-chooser.yaml`
  asserts the five `tab-*` ids.

### 01.3 Create chooser (P0-14)
- Root cause: `app/(tabs)/create.tsx` rendered `CreateWizardV2` directly; the FAB pushed `ROUTES.TABS_CREATE`; Home's
  empty-state "Create a challenge" also pushed the tab. No chooser existed.
- Change: `lib/create-chooser.ts` (copy table, rows, open/close store, Home snapshot), `components/create/CreateChooser.tsx`
  (GlassSheet, two rows, 44 pt icons, disabled 38%), `app/(tabs)/create.tsx` (on focus: open chooser, go back to the
  previous tab — used by deep links and the native tab bar), `app/(tabs)/index.tsx` publishes `{ todaySecured, nextTask }`
  from the same `startTask` Home uses, `lib/task-complete-href.ts` (one builder for the task href; Home's `onPressTask`
  uses it too), Home empty-state "Create a challenge" → `ROUTES.CREATE_WIZARD`.
- Decision: with no open task and today not secured (no challenge yet), the log row is disabled with no subtitle
  (the copy table has no line for it; "Create a challenge" is the one thing to do on day one).
- Test: `lib/create-chooser.test.ts` (failed before: module missing; passes now). Maestro
  `.maestro/build92-01-create-chooser.yaml`.

### 01.4 Toasts
- Root cause: `components/task-v2/TaskCompleteToast.tsx` sat at `tabBarContentPad() + 12` (no safe-area inset, so
  108 pt on every phone), solid `surface` card with 1-line title/body, no VoiceOver announcement, "Share" went straight to
  the share sheet through a prop.
- Change: chrome `GlassSurface`, `toastBottomOffset(insets.bottom)` = pill 64 + dock + 70, `TOAST_LIFE_MS` 4000,
  title wraps to 3 lines (2 + body), `accessibilityRole="alert"` + `announceForAccessibility` on publish, horizontal
  inset 12 (SE) / 21. "Share" → `openStickerCarousel(toast)` (`lib/sticker-carousel.ts`, a registry; the tabs layout
  registers the current share sheet until chunk 05 swaps in the carousel). Retry is only offered when a caller sets
  `actionLabel` (unchanged behaviour; no toast offers Retry by default).
- Test: `lib/tab-bar-inset.test.ts` "toast offset" (failed before: yes; passes now: yes); `lib/glass.test.ts` "toast".

### 01.5 Top bars and the "profile/posts" leak
- Root cause: `app/_layout.tsx:297` root `<Stack screenOptions={{ headerBackTitle: "Back" }}>` left native headers on
  by default; `profile/posts` (also `challenge/active/[id]`, `challenge/set-gym`, `create-challenge`, `i/[code]`,
  `dev/*`) had no `Stack.Screen` entry, and the screen's own inline `<Stack.Screen options={{ headerShown: false }}>`
  only applies after first render, so the native header painted the route name over `PushedHeader` for a frame.
- Change: root `screenOptions.headerShown = false` (nested `legal/_layout` keeps its own titled headers).
  `GlassTopBar` ported; `app/profile/posts.tsx` uses it (title "Posts", transparent at 0, in by 8 pt; list padded under it).
- Test: `lib/glass.test.ts` "root stack headers" (failed before: yes; passes now: yes). Maestro walks every tab and opens
  a profile post asserting no route name is visible.

### 01.6 Bottom insets
- Already met: every tab list passes `tabBarContentPad(insets.bottom)` (`lib/tab-bar-inset.test.ts` "is used on…",
  grep: `LiveFeedSection`, `DiscoverV3`, `NotificationsTab`, `LeaderboardTab`, `profile.tsx`, `index.tsx`). Posts list
  pads `insets.bottom`. `ACTION_BAR_CONTENT_INSET = 90` is exported for lists under a `FloatingActionBar` (no screen uses
  the bar yet; Part 1 does).

### Chunk 01 gates and evidence
- Screenshots (`docs/reports/build92/01/se/` and `/16promax/`, from `.maestro/build92-01-frames.yaml`):
  `P0-01-P0-03-tab-bar-home.png` (tab bar, Home), `P0-14-P0-05-create-chooser-sheet.png` (chooser on GlassSheet),
  `P0-09-P0-12-toast-over-home.png` (toast 70 pt above the bar, via `griit://dev/build92-toast`). Compared against
  `design/handoff/b92/part0-liquid-glass/frames/`: fallback (flag off) matches the solid variants; blur variants need
  `expo-glass-effect` (Needs Yaseen).
- Maestro `.maestro/build92-01-create-chooser.yaml` passed on run 9 (`maestro-create-chooser-run9.txt`, iPhone 16):
  fresh guest → chooser (empty: log disabled, no "Who sees this") → "Create a challenge" → wizard Step 1 → Cancel →
  join 7K Steps → chooser shows "Log today's task · Walk 7,000 steps · 7K Steps · Day 1 of 7" → task → Done → post
  → Day secured → chooser shows "Every task today is done." → every tab + `profile/posts` show no route name.
  Runs 1–8 were flow fixes (label regexes, Day secured copy, the build-91 Proof/save prompt after Day secured, no
  proof tile in a fresh grid; the final flow opens Posts by deep link). The SE frames flow also needed a settle wait
  before the first frame and taps through the dev-client "Open in GRIIT?" dialog.
- Full suite after the chunk: vitest 4 failed / 2117 passed (`vitest-final.txt`) = the 4 baseline failures; tsc 5 errors =
  baseline set (`tsc-final.txt`). Three tests moved with the code, not weakened: `origin-tab` now checks
  `taskCompleteHref` + the href builder's `originTab = "home"` default; `share-choice-photo` / `task-complete-toast`
  check `PHOTO_LIFE_MS = TOAST_LIFE_MS` with `TOAST_LIFE_MS === 4000` asserted. `safe-area` caught that
  `app/(tabs)/create.tsx` and `app/dev/build92-toast.tsx` rendered without `<Screen>`; both fixed.
- Self-check diff: no skipped tests, no hard-coded colours outside `lib/glass.ts`, no symptom hidden.

### Chunk 01 decisions made alone
- Glass port lives in `components/ds/glass/` + `lib/glass.ts` (no `src/` in this repo).
- Flag-on tab bar uses SF Symbols from the README mapping; `minimizeBehavior: onScrollDown` kept even without an
  accessory API, so Create is two taps while the bar is shrunk (flag-on only).
- Log row with no open task and nothing secured: disabled, empty subtitle.
- Toast "Share" goes through `lib/sticker-carousel.ts`; the tabs layout registers the current share sheet until chunk 05.
- Home empty-state "Create a challenge" opens the wizard (`/create`) instead of the Create tab.
- Chooser subtitle wraps to 2 lines (SE truncated "Pick the tasks, the length and who can join." at 1 line).

### Chunk 01 not done / Needs Yaseen
- `expo-glass-effect` install + dev client rebuild (steps under 01.1). Until then `FLAGS.LIQUID_GLASS` stays off.
- Tab-bar bottom accessory ("+ Create" while shrunk) has no API in expo-router 6.0.24; revisit on upgrade.
- Seen in build 91 while running the flow (not chunk 01 items; for chunk 02/04): Day secured shows "0 tasks." and an
  odd share-card preview; Done on Day secured goes to a Proof screen and then the guest "Save your challenge." prompt;
  a self-reported check-off post has no tile in the author's own proof grid.
