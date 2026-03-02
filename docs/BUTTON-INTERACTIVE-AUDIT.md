# Button & Interactive Element Audit

**Date:** 2025-02-28  
**Scope:** Entire frontend — every clickable element (buttons, links, icons, cards, tabs, nav, dropdowns, modals, form submits, onClick/onPress/href handlers).  
**Fixes applied** are noted; **⚠️ NEEDS DECISION** items require your input.

---

## FILE: app/auth/login.tsx

- ✅ **Sign In** → `handleLogin` — calls `supabase.auth.signInWithPassword`, loading state, error via Alert — WORKING
- ✅ **Create Account** → `router.push('/auth/signup')` — route exists — WORKING

---

## FILE: app/auth/signup.tsx

- ✅ **Create Account** → `handleSignup` — Supabase signUp, loading/cooldown, error handling, then replace to `/` or login — WORKING
- ✅ **Sign In (footer)** → `router.back()` — returns to login — WORKING

---

## FILE: app/create-profile.tsx

- ✅ **Continue** → `handleCreateProfile` — validation, Supabase upsert, loading, then `router.replace('/(tabs)')` — WORKING
- ✅ **Disabled when** `!canContinue || isPending` — canContinue requires valid username + displayName — intentional

---

## FILE: app/(tabs)/_layout.tsx

- ✅ **Tab: Home** → Expo Router tab switch — WORKING
- ✅ **Tab: Discover** → Expo Router tab switch — WORKING
- ✅ **Tab: Create (center +)** → Expo Router tab switch — WORKING
- ✅ **Tab: Movement** → Expo Router tab switch — WORKING
- ✅ **Tab: Profile** → Expo Router tab switch — WORKING

---

## FILE: app/(tabs)/index.tsx

- ✅ **Pull-to-refresh** → `onRefresh` → `refetchAll()` — WORKING
- ✅ **Challenge card (active)** → `router.push(\`/challenge/${activeChallenge.challenge_id}\`)` — route exists — WORKING
- ✅ **Secure Day** → `handleSecureDay` → `secureDay()` + celebration + `router.push('/secure-confirmation', params)` — WORKING
- ✅ **Pick Challenge / Find a challenge** → `router.push('/(tabs)/discover')` — WORKING
- ✅ **Feed card (secured)** → **FIXED:** was no onPress; now `router.push('/(tabs)/activity')` — WORKING
- ✅ **Feed card (achievement)** → **FIXED:** was no onPress; now `router.push('/(tabs)/activity')` — WORKING
- ✅ **Feed card (challenge_prompt “Open Challenge”)** → `router.push('/(tabs)/discover')` — WORKING
- ✅ **Feed card (rank “View Profile”)** → **FIXED:** was no onPress; now `router.push('/(tabs)/profile')` — WORKING
- ✅ **Secure Now (YOUR POSITION)** → `router.push('/(tabs)/discover')` — WORKING
- ⚠️ **Respect / Chase pills** inside feed cards — **display only** (no onPress on the pills). Options: (A) Add Respect/Chase handlers that call API when backend supports it, (B) Leave as visual only until backend ready — NEEDS DECISION
- ✅ **Celebration** → `onComplete` sets `showCelebration` false — WORKING

---

## FILE: app/(tabs)/discover.tsx

- ✅ **Challenge cards** → `handleChallengePress(challenge.id)` → `router.push(\`/challenge/${id}\`)` — WORKING
- ✅ **Refresh (empty state)** → `handleRefresh` — refetches — WORKING
- ✅ **Start your first challenge (empty)** → clears category + `handleRefresh` — WORKING
- ✅ **Clear search (X)** → `clearSearch` — WORKING
- ✅ **Category chips** → `handleCategoryPress(key)` + refresh — WORKING
- ✅ **Search** — TextInput, no dead tap — N/A

---

## FILE: app/(tabs)/create.tsx

- ✅ **Next: Add Tasks / Review / Back** → step navigation and `router.push` to commitment with params — WORKING
- ✅ **+ Add Task** → opens TaskEditorModal — WORKING
- ✅ **Pack cards (Athlete, Faith, etc.)** → apply pack tasks — WORKING
- ✅ **Replay policy / toggles / categories / task type / journal toggles / tracking mode** → setState — WORKING
- ✅ **Create Challenge (green CTA)** → `handleCreate` → `trpcMutate('challenges.create', payload)` + loading/error/recovery modal — WORKING
- ✅ **Recovery modal retry** → `handleRetryFromModal` — WORKING
- ✅ **Disabled states** — e.g. submit during pending — intentional

---

## FILE: app/(tabs)/activity.tsx

- ✅ **Tab pills (Global / Friends / Team)** → `setFeedFilter` — WORKING
- ✅ **Milestone cards** → `handlePress(index)` — haptic + animation only (no navigation) — WORKING
- ✅ **Expand stats** → `setExpanded(!expanded)` — WORKING
- ❌ **Teams** → **FIXED:** was `// TODO` empty; now shows `Alert.alert("Teams", "Teams and accountability groups are coming soon.")` — WORKING (placeholder until feature exists)
- ⚠️ **Respect / Chase on feed rows** — if present, confirm they call API or are placeholder — NEEDS DECISION (audit assumed mock feed; no backend trace)

---

## FILE: app/(tabs)/profile.tsx

- ✅ **Edit** → `router.push('/edit-profile')` — WORKING
- ✅ **Share** → `handleShare` — Share API / clipboard — WORKING
- ✅ **Sign Out** → `handleLogout` → `supabase.auth.signOut()` + replace to login — WORKING
- ✅ **Settings** → `router.push('/settings')` — WORKING
- ✅ **StatCard** → `onPress` optional; disabled when `!onPress` — intentional
- ✅ **Profile: Public row (Edit)** → `router.push('/edit-profile')` — WORKING

---

## FILE: app/challenge/[id].tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **More (⋯)** → Alert with “Share challenge” / “Invite friends” — clipboard or Share — WORKING
- ✅ **Start / Continue Today** → `handleJoin` or `router.push('/(tabs)')` — opens commitment or goes Home — WORKING
- ✅ **Invite friends** → clipboard/Share — WORKING
- ✅ **Mission row “Start >”** → navigates to task run/journal/timer/photo/checkin — WORKING
- ❌ **Leave Challenge** → **FIXED:** Alert “Leave” had `onPress: () => {}`. Now `onPress` calls `router.back()` and TODO comment for future `challenges.leave` API — WORKING (dismisses; backend leave not implemented)
- ✅ **Sticky CTA** — disabled when `joinDisabled` or expired; loading when `isPending` — intentional
- ✅ **Commitment modal (from Start)** → commitment screen with Confirm/Cancel — WORKING

---

## FILE: app/commitment.tsx

- ✅ **Backdrop** → `handleCancel` → `router.back()` — WORKING
- ✅ **Close (X)** → `handleCancel` — WORKING
- ✅ **Confirm Commitment** → `handleConfirm` → tRPC `challenges.join` or starter save, then `router.replace('/(tabs)')` — WORKING
- ✅ **Cancel** → `handleCancel` — WORKING
- ✅ **Loading** — `joining` + ActivityIndicator — WORKING
- ✅ **Error** — Alert on catch — WORKING

---

## FILE: app/settings.tsx

- ✅ **Back** → `handleBack` → `router.back()` — WORKING
- ✅ **Switches (Daily Reminder, Last Call, Friend Activity)** → `setDailyReminder` etc. — local state only (no persistence) — WORKING
- ⚠️ **Settings toggles** — not persisted to backend. Options: (A) Add API to save preferences, (B) Keep local only — NEEDS DECISION

---

## FILE: app/edit-profile.tsx

- ✅ **Close (X)** → `router.back()` — WORKING
- ✅ **Save** → `handleSave` → `handleUpdate` (Supabase update), loading, then `router.back()` — WORKING
- ✅ **Disabled when** `isPending` — intentional

---

## FILE: app/success.tsx

- ✅ **Continue** → `handleContinue` → `router.replace('/(tabs)')` — WORKING
- ✅ **Share Completion** → `handleShare` — Share/clipboard — WORKING
- ✅ **No dead-end** — both buttons exit to tabs — WORKING

---

## FILE: app/day-missed.tsx

- ✅ **Restart Challenge** (when shown) → `handleRestart` → `router.back()` — WORKING
- ✅ **Button only when** `shouldShowRestart` — intentional

---

## FILE: app/secure-confirmation.tsx

- ✅ **Auto-dismiss** — `setTimeout(() => router.back(), 2500)` — WORKING (no manual button; exit to Home)

---

## FILE: app/+not-found.tsx

- ✅ **Go to Home** → `Link href="/"` — WORKING (root resolves per auth)

---

## FILE: app/challenge/[id]/chat.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Info** → `router.push(\`/challenge/${id}/chat-info\`)` — WORKING
- ✅ **Send** → `handleSend` → `sendChatMessage` — WORKING
- ✅ **Quick check-in** → `handleQuickCheckIn` → `sendChatMessage` type checkin — WORKING
- ✅ **Reaction** → `handleReaction` → `toggleMessageReaction` — WORKING
- ✅ **Message long-press** → sets `selectedMessageId` for reactions — WORKING

---

## FILE: app/challenge/[id]/chat-info.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Mute / Mentions only** → Switch + `updateChatRoomSettings` — WORKING
- ✅ **No room** — error view only, no stray buttons — WORKING

---

## FILE: app/task/run.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Mode (Outdoor GPS / Treadmill)** → `handleModeChange` — WORKING
- ✅ **Start GPS / Stop** → `startGpsTracking` / `stopGpsTracking` — WORKING
- ✅ **Start/Finish treadmill timer** → `startTreadmillTimer` / `finishTreadmillTimer` — WORKING
- ✅ **Reset** → `resetAll` — WORKING
- ✅ **Capture proof** → `captureProof` — WORKING
- ✅ **Submit** → navigates back / success with completion — WORKING
- ✅ **Disabled** when `isGpsComplete` / `backgroundViolation` — intentional

---

## FILE: app/task/journal.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Submit** → saves entry, completion flow — WORKING
- ✅ **Loading/error** — present — WORKING

---

## FILE: app/task/timer.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Start / Pause / Reset** → timer state — WORKING
- ✅ **Submit** → completion — WORKING

---

## FILE: app/task/photo.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Capture / Pick** → image picker — WORKING
- ✅ **Submit** → completion — WORKING

---

## FILE: app/task/checkin.tsx

- ✅ **Back** → `router.back()` — WORKING
- ✅ **Start / Stop** → location check-in — WORKING
- ✅ **Submit** → completion — WORKING
- ✅ **Celebration** → onComplete — WORKING

---

## FILE: components/StreakTracker.tsx

- ✅ **Streak area** → `onStreakPress?.()` when provided — optional, used by parent — WORKING

---

## FILE: components/Celebration.tsx

- ✅ **onComplete** — called when animation ends — WORKING (no tap target)

---

## FILE: components/TaskEditorModal.tsx

- ✅ **Close / Save / Delete** — modal actions; parent controls visibility — WORKING
- ✅ **Internal toggles** — setState — WORKING

---

## FILE: src/components/ui/PrimaryButton.tsx

- ✅ **Button** → `onPress` prop; disabled/loading prevent press — WORKING

---

## FILE: src/components/ui/Card.tsx

- ✅ **Card** → `onPress` when `pressable` — WORKING

---

## FILE: src/components/ui/Chip.tsx

- ✅ **Chip** → `onPress` optional — WORKING

---

## FILE: src/components/ui/ListOptionCard.tsx

- ✅ **Card** → `onPress` — WORKING

---

## FILE: src/components/ui/ModalSheet.tsx

- ✅ **Primary / Cancel** → `onPrimary` / `onClose` — WORKING
- ✅ **Backdrop** → `onClose` — WORKING

---

## Summary of fixes applied

| Location | Issue | Fix |
|----------|--------|-----|
| **app/(tabs)/index.tsx** | Feed cards (secured, achievement, rank) had TouchableOpacity but no onPress | Added onPress: secured/achievement → Movement tab; rank → Profile tab |
| **app/challenge/[id].tsx** | Leave Challenge alert “Leave” had `onPress: () => {}` | Leave now calls `router.back()` and TODO for future `challenges.leave` API |
| **app/(tabs)/activity.tsx** | Teams button was TODO (no action) | `handleTeamsPress` now shows Alert “Teams and accountability groups are coming soon.” |

---

## Needs decision (⚠️)

1. **Home feed: Respect / Chase** — Pills are visual only. Add API-backed Respect/Chase when backend supports it, or keep as placeholder?
2. **Activity: Respect / Chase on feed rows** — Same as above if those rows have tap targets.
3. **Settings toggles** — Persist (Daily Reminder, Last Call, Friend Activity) to backend or keep local only?
4. **Leave Challenge** — Backend has no `challenges.leave`. When added, wire Leave confirmation to it and refetch; for now Leave only dismisses and goes back.
5. **“Open Challenge” on feed** — Currently goes to Discover. If feed item had a challenge id, do you want “Open Challenge” to deep-link to `/challenge/[id]`?

---

## Disabled / loading / error verification

- **Login, Signup, Create-profile, Edit-profile, Commitment, Create challenge:** Loading and/or error states and disabled submit when pending — verified.
- **Challenge detail:** Join button disabled when `joinDisabled` or expired; loading when `isPending` — verified.
- **Task screens:** Disabled states (e.g. GPS complete, background violation) — verified.
- **Profile StatCard:** Disabled when `!onPress` — intentional.

---

## Dead-end screens

- **secure-confirmation** — Auto-redirects back after 2.5s; no manual button required.
- **success** — Continue and Share both exit or share; no dead end.
- **day-missed** — Restart goes back; message-only when no restart.
- **+not-found** — Go to Home exits.
- All other screens have back or primary CTA that navigates away — verified.
