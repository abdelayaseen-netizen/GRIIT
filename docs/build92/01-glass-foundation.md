# Chunk 01: Glass foundation and Create

**Spec:** `design/handoff/b92/part0-liquid-glass/` (README, `src/ds/glass/`, frames P0-01 to P0-14). Checklist: the "Part 0" section of the top-level README.

**Why:** every later part uses these sheets, toasts, bars and the Create chooser. Build them once, and make them right, first.

## Items
- **01.1 Glass components:**
  - Port `src/ds/glass/` (tokens, sheet, toast, floating action bar, top bar) into the DS.
  - Behind `FLAGS.LIQUID_GLASS` (default off), use the glass material. Otherwise, and on iOS < 26 and with Reduce Transparency on, use the solid #1A1A1A fallback with a 1 px #2A2A2A hairline.
- **01.2 Tab bar:**
  - 5 tabs in this order: Home, Discover, Create, Activity (flame), Profile, using the shipped Lucide icons.
  - With the flag off, use the existing JS tab bar restyled to the fallback.
  - With the flag on, use native tabs (`expo-router/unstable-native-tabs`): they shrink on scroll and show the "+ Create" accessory. With Reduce Motion on, they never shrink.
  - Before writing native-tab code, verify the library works on Expo SDK 54. If it doesn't, keep the flag-on path as the fallback and report it.
- **01.3 Create chooser (P0-14):**
  - The Create tab and "+ Create" open a chooser with "Log today's task" and "Create a challenge".
  - "Log today's task" opens the next open task. When today is secured, it's disabled with "Every task today is done."
  - The chooser never opens a post sheet.
- **01.4 Toasts:**
  - One toast system, 70 pt above the tab bar, lasting 4 s, wrapping up to 3 lines, announced to VoiceOver.
  - An optional action, where "Share" opens the sticker carousel. Wire it now with a stub until chunk 05.
  - Error toasts never offer Retry unless a retry can work.
- **01.5 Top bars:**
  - Transparent at scroll 0, glass (or fallback) by 8 pt of scroll.
  - Titles are human names, never a route.
  - **Find and fix the "profile/posts" title leak** from the build 91 phone test (a native header showing the route name over the app's own header).
- **01.6 Bottom insets:** every list under floating chrome scrolls its last item fully clear.

**Areas:** `components/ds/`, `src/ds/glass/` (new), `app/(tabs)/_layout.tsx`, `lib/feature-flags.ts`, header and navigation config.

## Gates
- [ ] Every Part 0 checklist line has evidence (test, screenshot or grep), or is marked "flag-on only, not verifiable without device" for the native-glass lines.
- [ ] Simulator screenshots on SE and 16 Pro Max next to P0-01, P0-03, P0-05, P0-09, P0-12 and P0-14.
- [ ] Maestro: Create → chooser → "Create a challenge" opens Create; "Log today's task" opens the task, and is disabled after the day is secured.
- [ ] No header anywhere shows a route name (Maestro walks every tab and opens a profile post).
- [ ] Chunk 01 tests pass; vitest has no new failures; tsc has no new errors.
- [ ] PROGRESS updated, committed, pushed.
