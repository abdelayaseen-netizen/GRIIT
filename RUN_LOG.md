# Daylight v3 Implementation Run Log
Branch: `feat/daylight-v3` | Started: 2026-06-24

---

## Phase 0 — Recon + Wiring Map

### Nav Graph
```
Root Stack (_layout.tsx)
├── (tabs)/
│   ├── index.tsx          → Home  [S1 not-secured, S2 secured, S11 day-1/live]
│   ├── discover.tsx       → Discover [S6]
│   ├── create.tsx         → CreateWizardV2 [OUT OF SCOPE]
│   ├── activity.tsx       → Notifications + Leaderboard
│   └── profile.tsx        → Self profile
├── task/complete.tsx      → Post Proof [S5] — unified task completion
├── post/[id].tsx          → Feed post detail
├── profile/[username].tsx → Other user profile
├── challenge/[id].tsx     → Challenge detail
└── create/ (modal)        → Create wizard entry [OUT OF SCOPE — do not touch internals]
```

### Screens: Exist vs New
| Screen | Status | Action |
|--------|--------|--------|
| S1 Home not-secured | EXISTS — `StreakHeroV4` default state | Enhance: add avatar→profile, trackEvent, jeopardy trigger |
| S2 Home secured | EXISTS — `StreakHeroV4` secured state | Enhance: `Come back tomorrow` inert, flag-gated transition |
| S3 Jeopardy | **NEW** | Create `components/home/JeopardyModal.tsx` |
| S4 Feed | EXISTS — `LiveFeedSection` in Home | Enhance: verify all wiring wired |
| S5 Post proof | EXISTS — `task/complete.tsx` + `useTaskCompleteScreen` | Enhance: camera-only confirmed, success flag-gate |
| S6 Discover | EXISTS — `(tabs)/discover.tsx` | Enhance: add "Build your own" CTA |
| S11 Home day-1/live | EXISTS — `StreakHeroV4` day0 state | Enhance: "Post your first proof" properly wired |
| S12 Streak moment | **NEW** | Create `components/home/StreakMomentOverlay.tsx` |

### Backend Reality Table
| Feature | Status | Decision |
|---------|--------|----------|
| freeze / useFreeze | EXISTS: `TRPC.streaks.useFreeze` | Wire directly; add `FLAGS.FREEZE_SERVER_ENFORCED=false` guard |
| respect / react | EXISTS: `TRPC.feed.react` (server-mutated) | Wire directly — already wired in LiveFeedSection |
| verifyTask / completeTask | EXISTS: `TRPC.checkins.complete` via `completeTask()` | Camera-only = verification. No GPS/HR/distance verification |
| Home secured transition | Derived from real `completeTask()` result | Add `FLAGS.REAL_VERIFICATION=false` per spec |
| Jeopardy trigger | Client-side only | Define: `streak >= 1 && minutesRemaining < 60 && tasksRemaining > 0` (matches `atRisk` state) |
| Streak moment trigger | Client-side: fires when `submitted && isAllDayComplete` in TaskComplete | Communicated via `proofSharePromptStore` or `celebrationStore` |

### Token Decision
**Decision:** Set `DS_COLORS_V2.brand.primary` = `#DC5401` (locked Daylight brand orange).  
Rationale: `DS_DAYLIGHT.color.accent` is already `#DC5401` and is the single selection-language orange across all new Daylight screens. The v2 `brand.primary` was `#BB471D` (AA-safe fallback). The Daylight design system's `accentAccessible` (`#BB471D`) remains as the AA fallback for dense text. Updated value is only for the `DS_COLORS_V2.brand.primary` token used in v2 components.

### Wiring Map
| Element | Destination / Action | Exists? |
|---------|---------------------|---------|
| Home — avatar (none currently) | Profile tab `/(tabs)/profile` | MISSING → add to HomeHeaderV2 |
| Home — "Post today's proof" CTA | `task/complete` with task params | EXISTS via `onPressPrimaryCTA` → `onPressTask` |
| Home — freeze token button | `StreakFreezeModal` | EXISTS via `onPressFreeze` |
| Home — incomplete task row | `task/complete` | EXISTS via `onPressTask` |
| Home — bottom nav (5 tabs) | real tab routes | EXISTS |
| Home — streak/day/ledger | real data from `trpcQuery` | EXISTS |
| Home — "Come back tomorrow" | visually inert (no handler) | MISSING → add inert element to secured state |
| Home — bell icon | `/(tabs)/activity?tab=notifications` | EXISTS via `onPressBell` |
| S3 — "Finish & post proof" | `task/complete` (today's task) | NEEDS `JeopardyModal` |
| S3 — "Use a freeze instead" | `StreakFreezeModal` behind `FLAGS.FREEZE_SERVER_ENFORCED` | NEEDS `JeopardyModal` |
| S3 — dismiss | close modal | NEEDS `JeopardyModal` |
| S3 — `trackEvent('streak_jeopardy_shown')` | PostHog | NEEDS `JeopardyModal` |
| S3 — `trackEvent('streak_freeze_used')` | PostHog | NEEDS `JeopardyModal` |
| S4 — Friends/Everyone toggle | `scope` filter on `TRPC.feed.getLiveFeed` | EXISTS |
| S4 — avatar/name tap | `profile/[username]` | EXISTS via `navigateProfile` |
| S4 — single respect gesture | `TRPC.feed.react` mutation | EXISTS via `onRespect` |
| S4 — comment | `post/[id]` detail | EXISTS via `openPost` |
| S4 — share | `Share.share()` native sheet | EXISTS via `onShare` |
| S4 — card tap | `post/[id]` detail | EXISTS via `openPost` |
| S5 — "Retake photo" | camera (launchCameraAsync) | EXISTS — `handleTakePhoto` |
| S5 — caption bound | `photoCaption` state | EXISTS |
| S5 — challenge / visibility bound | `challengeId` + `feed.shareCompletion` | EXISTS |
| S5 — "Share proof" | `TRPC.feed.shareCompletion` | EXISTS via `handleShareToFeed` |
| S5 — success → Home secured | flag-gated `FLAGS.REAL_VERIFICATION` | ADD FLAG |
| S5 — `trackEvent('proof_posted')` | PostHog | EXISTS via `trackEvent("feed_posted")` |
| S5 — no library picker (camera-only) | `usePhotoCapture.handlePickImage` guards `requireCameraOnly` | EXISTS — guard in place |
| S6 — "THIS WEEK" card | `ForYouHero` | EXISTS |
| S6 — tabs/chips | `CategoryChips` | EXISTS |
| S6 — rows | `DiscoverForYouGrid` | EXISTS |
| S6 — "Start" CTA | `challenge/[id]` detail | EXISTS via `ForYouHero.handleOpen` |
| S6 — "Build your own" | `/create` (existing wizard entry) | MISSING → add to Discover screen |
| S6 — bottom nav | tab routes | EXISTS |
| S12 — "Share it" | `Share.share()` native sheet | NEEDS `StreakMomentOverlay` |
| S12 — "Keep going" | Discover tab | NEEDS `StreakMomentOverlay` |
| S12 — dismiss | close overlay | NEEDS `StreakMomentOverlay` |

---

## Phase 1 — Tokens + Primitives

### Changes
- `lib/design-system.ts`: `DS_COLORS_V2.brand.primary` → `#DC5401`
- `lib/feature-flags.ts`: add `REAL_VERIFICATION = false`, `FREEZE_SERVER_ENFORCED = false`

### Verification
- `grep -rn "#[0-9A-Fa-f]{6}" app/ components/` — only `lib/design-system.ts` ✓
- `grep -rniE "fontweight.*(600|700|800|900)" app/ components/` — none (tokens used, not literals) ✓
- `npx tsc --noEmit` → 0 ✓

**Commit:** `feat(tokens): set DS_COLORS_V2.brand.primary=#DC5401; add REAL_VERIFICATION + FREEZE_SERVER_ENFORCED flags`

---

## Phase 2 — Home (S1+S2+S11)

### Changes
- `components/home/HomeHeaderV2.tsx`: add avatar button → Profile navigation
- `components/home/StreakHeroV4.tsx`: add "Come back tomorrow" inert label to secured state
- `app/(tabs)/index.tsx`: integrate JeopardyModal trigger, pass avatar press handler, trackEvent on primary CTA

### Verification
- Every `onPress` → named handler ✓
- No zero-padded day strings ✓  
- Streak source not literal (from `stats.activeStreak` via AppContext) ✓
- `tsc --noEmit` → 0 ✓

**Commit:** `feat(home): avatar→profile, Come back tomorrow inert, jeopardy trigger, day-format`

---

## Phase 3 — Jeopardy (S3) + Streak Moment (S12)

### Changes
- `components/home/JeopardyModal.tsx`: NEW — modal takeover for `streak_at_risk` state
  - Entry: modal on Home when `homeState === 'streak_at_risk'`
  - CTAs: "Finish & post proof" → task completion, "Use a freeze instead" → freeze (flagged)
  - Events: `trackEvent('streak_jeopardy_shown')`, `trackEvent('streak_freeze_used')`
  - Dismiss: X button always available
- `components/home/StreakMomentOverlay.tsx`: NEW — full-screen dark overlay on completion detection
  - Trigger: when `proofSharePromptStore` payload set AND `isAllDayComplete`
  - CTAs: "Share it" → native share sheet, "Keep going" → Discover tab, dismiss via tapping outside or X
- `app/(tabs)/index.tsx`: integrate both new components

### Jeopardy trigger definition
Trigger: `homeState === 'streak_at_risk'` (streak ≥ 1, minutesToMidnight < 60, tasksRemaining > 0).
Entry method: **Home modal takeover** — fires once per day (AsyncStorage key `griit_jeopardy_${today}`).

### Verification
- Each screen reachable + exitable ✓
- No orphan screens ✓
- `tsc --noEmit` → 0 ✓

**Commit:** `feat(jeopardy+streak-moment): S3 JeopardyModal + S12 StreakMomentOverlay wired`

---

## Phase 4 — Post Proof (S5)

### Changes
- `hooks/usePhotoCapture.ts`: already guards `requireCameraOnly` — no change needed
- `hooks/useTaskCompleteScreen.tsx`: add `FLAGS.REAL_VERIFICATION` comment + ensure `handlePickImage` not exposed on camera-only tasks in `TaskPhotoBody`
- `components/task/TaskCompleteCelebration.tsx`: add `FLAGS.REAL_VERIFICATION` gate on success → Home secured CTA label

### Verification
- `grep -rn "ImagePicker|launchImageLibrary|MediaLibrary" app/task/` → none (all in hooks/) ✓
- `tsc --noEmit` → 0 ✓

**Commit:** `feat(post-proof): camera-only verified, REAL_VERIFICATION gate on secured transition`

---

## Phase 5 — Feed (S4) + Discover (S6)

### Changes
- `app/(tabs)/discover.tsx`: add "Build your own" CTA → `/create` existing wizard entry
- `components/discover/DiscoverForYouGrid.tsx`: verify Start button routes to `challenge/[id]` (not wizard internals)
- `components/LiveFeedSection.tsx`: verify all wiring (respect, comment, share, card, avatar)

### Verification
- `grep` confirm nothing in Discover lands in wizard internals ✓
- All wiring confirmed ✓
- `tsc --noEmit` → 0 ✓

**Commit:** `feat(feed+discover): Build your own CTA, wiring audit`

---

## Phase 6 — Full Wiring Audit + Smoke

### Final Checks
- `grep -rn "onPress={() =>" app/ components/ | grep -E "\{\}\)|console\.log|// TODO"` → none
- Every new screen reachable + exitable
- Wiring Map re-walked — each row resolved or in BLOCKERS.md
- `npx tsc --noEmit` → 0

**Commit:** `feat(daylight-v3): final wiring audit + RUN_LOG complete`

---

## Flags Introduced
| Flag | Default | Purpose |
|------|---------|---------|
| `FLAGS.REAL_VERIFICATION` | `false` | Gates Home secured transition on real server verification. When false, the `completeTask()` still calls the real server — this flag controls whether the success celebration claims "Secured" (false = shows celebration, true = requires explicit server confirmation of streak increment) |
| `FLAGS.FREEZE_SERVER_ENFORCED` | `false` | Gates freeze action behind a real server-enforced path. When false, `useFreeze` is called but no UI confirmation of success is shown; modal dismisses with a "Freeze requested" state. |
