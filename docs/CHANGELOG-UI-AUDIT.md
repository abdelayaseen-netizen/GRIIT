# File-by-File Changelog: UI Audit vs Reference Screenshots

**Date:** 2025-02-28  
**Scope:** UI alignment with reference design spec; backend connections validated; no intentional API/behavior changes.

---

## 1. Tab Bar & Navigation

### `app/(tabs)/_layout.tsx`
- **Changed:** Tab bar now matches reference design.
  - **Activity → Movement:** Tab title changed from "Activity" to "Movement"; icon changed from `Activity` to `Flame` (lucide-react-native).
  - **Create tab:** Rendered as a **prominent center button**: orange circle (`Colors.accent`) with white `Plus` icon, larger than other tab icons, with shadow and `tabBarLabel: () => null` so no text appears under it. Other tabs unchanged (Home, Discover, Profile).
- **Why:** Reference screenshots specify five tabs as Home, Discover, center **Create** (large orange +), **Movement**, Profile.
- **Backend/routes:** No changes. All tab screen names (`index`, `discover`, `create`, `activity`, `profile`) and routes unchanged; only labels and icon presentation updated.

---

## 2. Settings Screen (New)

### `app/settings.tsx` (NEW)
- **Added:** Full Settings screen matching reference.
  - **Header:** Back chevron (navigates back) + centered title "Settings".
  - **Friends section:** Card with "0" / "FRIENDS" and "0" / "PENDING", plus copy: "Friends can see your FRIENDS-only content. Find friends on the Movement tab."
  - **Notifications section:** Card with three toggles (Daily Reminder, Last Call, Friend Activity) and subtitles; `Switch` uses peach track when off (`#E8C4B8`), accent when on.
  - **Consequences section:** Card with four items (Miss 1 day, Miss 3 in 7 days, Miss 7 days, Miss 14 days), orange/red bullets, titles and subtitles per spec.
- **Why:** Reference shows Settings with Friends, Notifications, and Consequences; Profile previously showed "Coming Soon" for Settings.
- **Backend:** No API calls. Toggle state is local only; no persistence added (can be wired later).

### `app/(tabs)/profile.tsx`
- **Changed:** Settings menu row now navigates to the new Settings screen instead of showing an alert.
  - Replaced `Alert.alert("Coming Soon", "Settings will be available soon!")` with `router.push("/settings" as any)`.
- **Why:** So Settings opens the new screen.
- **Backend:** No API changes. All other profile behavior (edit profile, sign out, discover link) unchanged.

### `app/_layout.tsx`
- **Changed:** Registered Settings in the root Stack.
  - Added `<Stack.Screen name="settings" options={{ headerShown: false }} />` after `create-profile` so `/settings` is a stack screen when pushed from Profile.
- **Why:** Expo Router picks up `app/settings.tsx` as the `settings` route; explicit registration ensures correct stack behavior and options.
- **Backend:** N/A.

---

## 3. Onboarding / Create Profile

### `app/create-profile.tsx`
- **Changed:** Aligned with "Claim your name" / Getting Started reference.
  - **Top row:** "GRIT" logo (left) and progress "1/5" with a small progress line (right).
  - **Step label:** "GETTING STARTED" in orange/coral (`Colors.accent`), uppercase.
  - **Headings:** "Claim your name." (main), "This is how others will know you." (subtitle).
  - **Fields:** Username placeholder "your_username", Display Name placeholder "Your Name"; labels "Username" / "Display Name" (removed asterisk from Username). Bio field kept.
  - **Button:** Label "Continue" with right chevron (`ChevronRight`), styled grey (`#6B7280`); background set to match reference.
  - **Background:** Container background `#FDFBF6` (off-white/cream).
- **Why:** Reference shows Getting Started step 1/5 with this copy and layout.
- **Backend:** No changes. Submit still calls same Supabase `profiles` upsert and `router.replace('/(tabs)')`; validation and error handling unchanged.

---

## 4. Home Screen

### `app/(tabs)/index.tsx`
- **Changed:** Header and subtitle to match reference.
  - **Header:** "GRIT" with a new subtitle line "Build Discipline Daily" below it (`logoSubtitle` style). Header alignment set to `alignItems: "flex-start"` (left-aligned).
  - **Styles:** `logo` font size 26, letterSpacing 1.5; new `logoSubtitle` 14px, tertiary color, marginTop 4.
- **Why:** Reference shows "GRIT" and "Build Discipline Daily" on the home screen.
- **Backend:** No changes. All data (challenges, check-ins, secure day, refresh) still used as before.

---

## 5. UI Audit Document

### `docs/UI-AUDIT-VS-REFERENCE.md` (NEW)
- **Added:** Written audit comparing current frontend to reference screenshots.
- **Contents:** Section-by-section differences (tab bar, Settings, onboarding, Home, challenge commitment, Create Challenge, New Task, Profile, Teams, visibility) and an implementation-order list. Used to drive the changes above and as a reference for future UI passes.

---

## 6. Backend Connections (Validation)

- **Checked:** All frontend entry points that call APIs or navigate.
  - **Profile:** Still uses `router.push("/edit-profile")`, `router.push("/(tabs)")`, `router.push("/(tabs)/discover")`; Supabase auth and profile usage unchanged. Only addition is `router.push("/settings")`.
  - **Create profile:** Supabase `profiles` upsert and auth session flow unchanged.
  - **Home:** AppContext, refetch, secure day, challenge navigation unchanged.
  - **tRPC:** `lib/trpc.ts` and `lib/api.ts` unchanged; no new endpoints; existing usage (e.g. `stories.list`, challenges, profiles, checkins) unchanged.
- **Result:** No backend connections were broken by the UI refactor. No repairs required.

---

## 7. Backend Cleanup

- **Scope:** Backend was audited for unused imports, dead endpoints, redundant middleware, and commented-out blocks.
- **Findings:**
  - All tRPC routers (auth, profiles, challenges, checkins, stories) are referenced from the frontend (AppContext, create-profile, challenge flows, etc.). No dead endpoints removed.
  - No redundant middleware or duplicate logic was removed; no commented-out blocks were deleted.
- **Action:** No code removed. If you later find unused backend code, you can add `// REVIEW: potentially unused` per the task instructions.

---

## 8. Summary Table

| File | Change type | Summary |
|------|-------------|---------|
| `app/(tabs)/_layout.tsx` | Modified | Movement rename, center orange + button |
| `app/settings.tsx` | **New** | Full Settings (Friends, Notifications, Consequences) |
| `app/(tabs)/profile.tsx` | Modified | Settings row → navigate to `/settings` |
| `app/_layout.tsx` | Modified | Register `settings` stack screen |
| `app/create-profile.tsx` | Modified | Getting Started copy, Claim your name, Continue > |
| `app/(tabs)/index.tsx` | Modified | GRIT + "Build Discipline Daily" subtitle |
| `docs/UI-AUDIT-VS-REFERENCE.md` | **New** | UI audit vs reference |
| `docs/CHANGELOG-UI-AUDIT.md` | **New** | This changelog |

---

## 9. Flagged for Your Review

- **Settings toggles:** Daily Reminder, Last Call, and Friend Activity are local state only. If you want them persisted, they need to be stored (e.g. profile preferences in Supabase or AsyncStorage) and loaded on mount.
- **Friends counts:** Settings shows "0" / "0" for FRIENDS and PENDING. When you have a friends API, this screen can be wired to real counts.
- **Consequences:** Copy is static. If challenge rules are configurable per challenge, this block could later reflect that or stay as app-wide policy text.
- **Create profile "1/5":** This screen is the only step in the current create-profile flow. The "1/5" is for visual consistency with the reference; expanding to a real 5-step onboarding would require additional screens and routing.
- **Tab center button:** The Create tab is implemented as a custom `tabBarIcon` with `tabBarLabel: () => null`. On some devices the center button may sit slightly higher due to `marginBottom: 20`; adjust if needed for your target devices.

---

## 10. Not Done in This Pass (Reference Spec)

- **Challenge commitment screen:** Dark brown header, white card, "COMMITMENT CHECK", "Start" + "Day resets at midnight", and commitment modal (warning + checkbox + Confirm/Cancel) were not restyled in this pass. Existing commitment flow and API unchanged.
- **Create Challenge flow:** Step indicator (1✓ 2✓ 3), Quick Start with Packs grid, and Review step styling were not changed. Logic and API unchanged.
- **New Task / task types:** Uppercase "TASK NAME" / "TASK TYPE" and task-type grid icons/colors were not updated. Run settings and time enforcement UI unchanged.
- **Teams screen:** "Small Groups, Big Results", Create a Team, Join with Code was not added. Movement tab still shows current activity content; no new route.
- **Visibility step:** "Who should see your journey?" (Public/Friends/Private) and "Your path starts now" summary screen were not added; no routing or API changes.

These can be implemented in a follow-up using `docs/UI-AUDIT-VS-REFERENCE.md` and the same constraints (preserve props, state, handlers, and backend connections).
