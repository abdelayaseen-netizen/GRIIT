# UI Audit: Current Frontend vs Reference Screenshots

**Reference:** User-provided screenshots (Rork/design spec).  
**Scope:** Layout, spacing, colors, typography, buttons, navigation.

---

## 1. Tab Bar / Navigation

| Spec (reference) | Current | Action |
|------------------|---------|--------|
| Tabs: Home, Discover, **Create (center)**, **Movement**, Profile | Home, Discover, Create, **Activity**, Profile | Rename Activity → Movement; use Flame icon for Movement |
| Center tab = **large orange circular + button** (elevated) | Create uses PlusCircle icon like others | Style Create tab as prominent orange circle with + |
| Tab labels: Home, Discover, Movement, Profile (no "Activity") | "Activity" | Change label to "Movement" |

---

## 2. Settings Screen

| Spec | Current | Action |
|------|---------|--------|
| **Settings** screen with back, title "Settings" | Profile has Settings row → "Coming Soon" alert | Add dedicated Settings screen; navigate from Profile |
| **Friends** section: two big "0" with FRIENDS / PENDING, description re Movement tab | Missing | Add Friends card (0/0 + copy) |
| **Notifications** section: bell icon; Daily Reminder, Last Call, Friend Activity toggles (peach when off) | Missing | Add Notifications card with three toggles |
| **Consequences** section: shield icon; Miss 1 day, Miss 3 in 7 days, Miss 7 days, Miss 14 days with orange/red bullets | Missing | Add Consequences card with list |
| Cards: white, rounded, light border; section headers with icon + bold title | N/A | Use consistent card style |

---

## 3. Onboarding / Create Profile

| Spec ("Claim your name") | Current create-profile | Action |
|--------------------------|------------------------|--------|
| "GETTING STARTED" in orange/coral uppercase | No step label | Add step label; optional progress 1/5 |
| Heading: "Claim your name." | Title/layout differs | Align heading and subtitle |
| Subtitle: "This is how others will know you." | Different copy | Use spec copy |
| Username + Display Name fields, placeholder "your_username", "Your Name" | Same fields, different placeholders/labels | Align labels and placeholders |
| Button: "Continue >" (grey/black, white text, rounded) | "Create Profile" or similar | Use "Continue >" and style |

---

## 4. Home Screen

| Spec | Current | Action |
|------|---------|--------|
| Subtitle under GRIT: "Build Discipline Daily" | No subtitle | Add subtitle |
| "39 pts to Builder" / "Keep pushing." style block | Different progress framing | Align progress/points copy if we have equivalent |
| "Explore Challenges" button (blue in one ref) | CTA may differ | Ensure primary CTA matches |
| Bottom summary card: Streak, Score, Starter Rank with icons | Current has streak/stat cards | Align labels (e.g. "Score", "Starter Rank") and layout |
| "Streak lost" modal: white card, flame icon, "Start again today", Continue button | day-missed or similar may exist | Align modal copy and styling |

---

## 5. Challenge Commitment

| Spec | Current | Action |
|------|---------|--------|
| **Header:** dark brown, back + "Challenge" + menu | commitment.tsx or challenge detail | Apply dark brown header, white title |
| **Card:** white, rounded top; shield icon; "You are committing to this challenge." | Commitment screen | Match layout and copy |
| Rows: Challenge, Duration, Mode (Hard in orange) | Same data | Style Mode (Hard) in accent/orange |
| **COMMITMENT CHECK:** Time per day, Best for, Daily tasks with clock icons | Same | Use list + icons |
| "Start" button (dark brown), "Day resets at midnight" below | Same | Match button and disclaimer style |
| **Modal:** warning banner "One missed day resets...", checkbox "I understand...", Confirm Commitment (peach) / Cancel | If present | Add or style modal to match |

---

## 6. Create Challenge

| Spec | Current | Action |
|------|---------|--------|
| Progress: Step 1 ✓, Step 2 ✓, Step 3 (current) with green/orange/grey | create.tsx multi-step | Style step indicator (checkmarks, orange current) |
| "QUICK START WITH PACKS" + grid (Athlete, Faith, Entrepreneur, HYROX, Morning Routine) | May use different task source | Add or align Quick Start packs grid |
| **Review** step: "Everything look good?", challenge card with tags (75 days, Fitness, Mind), Daily Tasks (3) list | Review step exists | Align labels and card layout |
| Bottom: Back (text), Create Challenge (green button) | Same | Match button colors (green primary) |
| Tab bar: center **orange +** button | See Tab Bar | Same as global tab bar |

---

## 7. New Task / Task Types

| Spec | Current | Action |
|------|---------|--------|
| "New Task" title; TASK NAME, TASK TYPE labels (uppercase) | TaskEditorModal or create flow | Align section labels (uppercase) |
| Task type grid: Journal (purple book), Timer (orange), Photo (pink), Run (teal), Simple (check), Check-in (pin) | Task types exist | Use spec icons/colors per type |
| Run settings: Distance/Time toggle (orange when active), Target, miles/km/meters, Time enforcement section | create.tsx / TaskEditorModal | Align Run block and time enforcement UI |

---

## 8. Profile

| Spec | Current | Action |
|------|---------|--------|
| Settings row opens **Settings** (Friends, Notifications, Consequences) | Settings → Coming Soon | Navigate to new Settings screen |
| Rest of profile (stats, edit, log out) | Exists | Keep; ensure Settings is only behavior change |

---

## 9. Teams / Movement

| Spec | Current | Action |
|------|---------|--------|
| **Teams** screen: "Small Groups, Big Results", icon, Create a Team (black), Join with Code (grey) | No Teams screen in tabs | Add Teams as sub-screen under Movement or separate; or link from Movement |
| **Movement** tab (replaces Activity) | Activity tab | Rename to Movement, Flame icon |

---

## 10. Visibility / Onboarding Steps

| Spec | Current | Action |
|------|---------|--------|
| "Who should see your journey?" Public / Friends / Private with radio buttons and icons | May be in create challenge or onboarding | Add or align visibility step to spec (globe, people, lock) |
| "Your path starts now" summary (Identity, Daily Commitments, Visibility, Duration), @username, "Start Day 1" | May be post-onboarding or challenge start | Align summary screen and CTA if present |

---

## Implementation Order

1. **Tab bar:** Movement rename + center orange + button (all screens benefit).
2. **Settings:** New screen + Profile link (Friends, Notifications, Consequences).
3. **Create profile:** GETTING STARTED label, "Claim your name.", "Continue >".
4. **Home:** Subtitle "Build Discipline Daily", any Explore Challenges / summary card.
5. **Challenge commitment:** Dark brown header, card, Commitment Check, Start + disclaimer.
6. **Create Challenge:** Step indicator, Review step, Back / Create Challenge buttons.
7. **New Task:** Uppercase labels, task type grid icons/colors, Run + time enforcement.
8. **Profile:** Settings navigation only (screen content in step 2).
9. **Teams:** Add screen or entry from Movement if in scope.
10. **Visibility / path summary:** Add or align if flows exist.

---

## Backend / Logic (do not change)

- All API calls, auth, and data flows remain unchanged.
- New UI only: new screens (Settings, optionally Teams), styling, labels, and navigation targets.
