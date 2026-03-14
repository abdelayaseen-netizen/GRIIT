# GRIIT UI Redesign Report — 2025-03-13

## EXECUTIVE SUMMARY

Redesigned **Home**, **Profile**, **Create/Edit Profile**, **Settings**, and **Tab bar** to use only `DS_COLORS` (zero raw hex on touched screens), added accessibility labels/roles to all interactive elements on those screens, and fixed the Settings import typo (`onboardingStorage` → `onboardingStore`). Design direction: cohesive use of the existing design system (light theme with accent, success, danger tokens). Activity and Challenge Detail screens were not fully migrated in this pass; they still use theme/hex in places.

---

## SCREEN-BY-SCREEN BREAKDOWN

### Home Screen (`app/(tabs)/index.tsx`)
- **Sections implemented:** Header (wordmark, score/streak badges), guest hero, motivation card, how it works, popular challenges, first-session banner, recovery banner, main prompt, DailyStatus, ExploreChallengesButton, ActiveChallenges, Today’s Reset, stats summary, discipline week card, welcome back card, suggested challenges, LIVE section, leaderboard/position cards, live feed, modals (milestone, freeze, last stand, streak lost).
- **Data sources:** tRPC `leaderboard.getWeekly`, `feed.list`, `challenges.listMyActive`, `checkins.getTodayCheckinsForUser`, `challenges.getFeatured`; useApp() for active challenge, stats, today checkins.
- **DS_COLORS tokens used:** background, card, surface, textPrimary, textSecondary, textMuted, border, accent, accentSoft, success, successSoft, warning, warningSoft, danger, white, black, overlayDark, modalBackdrop, milestoneGold, chipFill, warningSoft.
- **New DS_COLORS tokens added:** `card`, `modalBackdrop` (in `lib/design-system.ts`).
- **Accessibility:** SyncingBanner dismiss, first-session banner, recovery freeze CTA, guest Explore challenges / See all / challenge cards, retry buttons, Secure Today, Pick challenge, suggested challenge rows, live feed empty, leaderboard retry/Secure Now/View Activity, milestone modal Share/Got it, freeze modal Use freeze/Cancel, last stand Got it, streak lost Close/Continue; header badges (score/streak) and main title with accessibilityRole where appropriate.
- **Empty states:** Guest featured challenges; no activity yet + SuggestedFollows; leaderboard “Be the first”; homeDataError retry card.
- **Loading states:** HomeScreenSkeleton when `!initialFetchDone`; loading activity/leaderboard copy.
- **Screenshot description:** Top: wordmark + pill badges (score, streak). Then either guest hero + motivation + how it works + popular challenges, or (logged in) first-session/recovery if relevant, main prompt, DailyStatus, ExploreChallenges, ActiveChallenges, Today’s Reset, stats row, discipline week or welcome back card, suggested challenges, LIVE + position card + feed/leaderboard. Bottom tagline. All surfaces use DS_COLORS (light background, white/card surfaces, accent CTAs).

### Profile Screen (`app/(tabs)/profile.tsx`)
- **Sections implemented:** Guest identity card (sign in/up), loading skeleton, error card + retry/sign out, main profile (ProfileHeader, DisciplineScoreCard, TierProgressBar, LifetimeStatsCard, DisciplineCalendar, DisciplineGrowthCard, AchievementsSection, CompletedChallengesSection, SocialStatsCard, ProfileCompletionCard, ShareDisciplineCard), IntegrationsSection (Strava), menu (Edit profile, Settings), danger sign out.
- **Data sources:** useApp() (profile, stats), tRPC profiles.getCompletedChallenges, getSecuredDateKeys, leaderboard.getWeekly, accountability.listMine, achievements.getForUser; IntegrationsSection: isStravaEnabled, getStravaConnection, getStravaActivities, getStravaAuthUrl, disconnectStrava.
- **DS_COLORS tokens used:** background, card, surface, textPrimary, textSecondary, textMuted, border, accent, white, chipFill, danger, activityOrange, accentSoft.
- **New DS_COLORS tokens added:** None (activityOrange already present).
- **Accessibility:** Sign in / Sign up, Retry / Sign out (error), Strava Connect/Disconnect and activities toggle, Edit profile, Settings, Sign out (main); ProfileSkeleton and IntegrationsSection use DS_COLORS.
- **Empty states:** Guest view; error state with retry.
- **Loading states:** ProfileSkeleton; reminderLoading in Settings.
- **Screenshot description:** Centered profile header and stats; Integrations (Strava) card; Profile/Settings menu rows; sign out at bottom. All colors from DS_COLORS.

### Create/Edit Profile Screen (`app/create-profile.tsx`)
- **Sections implemented:** Top row (wordmark, progress), “Claim your identity” header, form (Username, Display Name, Bio), Continue CTA.
- **Data sources:** Supabase auth (prefill), Supabase profiles upsert, tRPC profiles.update, challenges.join (pending).
- **DS_COLORS tokens used:** textPrimary, textSecondary, accent, surface, border, inputPlaceholder (already in use).
- **Accessibility:** Bio TextInput `accessibilityLabel="Bio"`; main title `accessibilityRole="header"`.
- **Screenshot description:** Single form screen with three fields and black Continue button; all colors from design system.

### Settings Screen (`app/settings.tsx`)
- **Sections implemented:** Header (back, “Settings”), Privacy & Visibility (VisibilitySubsection x3), Profile (email / edit), Appearance (dark mode switch, system/light/dark pills), Friends (accountability card), Notifications (daily reminder, reminder time, last call, friend activity), Premium card, Restore purchases, Account (sign out), About (version), Consequences list.
- **Data sources:** tRPC notifications.getReminderSettings, updateReminderSettings, accountability.listMine, profiles.get, profiles.update.
- **DS_COLORS tokens used:** settingsPageBg, settingsBackCircle, border, textPrimary, textSecondary, textMuted, card, accent, white, dangerDark, toggleTrackOn, switchThumbInactive, chipFill.
- **New DS_COLORS tokens added:** None.
- **Accessibility:** Back, visibility pills (already had labels/role/state), Edit profile, theme pills (label + role + state), Friends card, Sign out; switches have accessibilityLabel/accessibilityRole.
- **Screenshot description:** List of grouped cards (Privacy, Profile, Appearance, Friends, Notifications, Premium, Account, About, Consequences). Background and cards use DS_COLORS; fixed `onboardingStorage` → `onboardingStore` import.

### Activity Screen (`app/(tabs)/activity.tsx`)
- **Status:** Not fully redesigned this pass. Still uses `ThemeColors` and some hex (e.g. rank gold, filter pills). Recommended: replace `createActivityStyles(colors)` with DS_COLORS and add a11y to all touchables.

### Tab Bar (`app/(tabs)/_layout.tsx`)
- **Sections implemented:** Tab bar style (background, border, active/inactive tint), Home, Discover, Create (center button), Movement, Profile tabs.
- **DS_COLORS tokens used:** card, border, accent, tabInactive, centerButtonBg, white, MEASURES.tabBarHeight, SHADOWS.centerButton.
- **Accessibility:** Each tab has `tabBarAccessibilityLabel` and `tabBarAccessibilityRole: "tab"` (expo-router). Theme removed; active/inactive use DS_COLORS.
- **Screenshot description:** Bottom tab bar with five tabs; center Create button uses DS_COLORS; no raw hex.

### Challenge Detail (`app/challenge/[id].tsx`)
- **Status:** Not fully polished this pass. Already uses DS_COLORS in many places; some hex/rgba remain (e.g. difficulty themes, inline colors). Recommended: replace remaining hex with DS tokens and add a11y to all interactive elements.

---

## DESIGN SYSTEM CHANGES

### New DS_COLORS Tokens Added
| Token Name    | Value             | Semantic Meaning   | Used In                    |
|---------------|-------------------|--------------------|----------------------------|
| card          | #FFFFFF           | Card/surface same as surface | Home, Profile, Settings, Tab bar |
| modalBackdrop | rgba(0,0,0,0.5)   | Modal overlay      | Home (modals)              |

### Shared Components Created or Modified
| Component     | What Changed                    | Used In   |
|---------------|----------------------------------|-----------|
| (none new)    | Home, Profile, Settings use DS only | —         |

---

## VALIDATION RESULTS

| Check                    | Result |
|--------------------------|--------|
| Hex grep (app/ tabs screens touched) | 0 in index, profile, settings, create-profile, _layout |
| Raw hex elsewhere (app/) | Yes — activity, challenge/[id], task/*, auth, onboarding, etc. still have hex |
| `npx tsc --noEmit`       | Pass   |
| `npx expo lint`          | Pass   |
| Interactive elements (app/*.tsx) | ~400+ TouchableOpacity/Pressable across app |
| Accessibility labels (app/*.tsx) | 80+ accessibilityLabel usages; redesigned screens have full coverage on interactive elements |

---

## UPDATED SCORECARD

### FRONTEND
| Category                  | Previous | New | Delta | Justification |
|---------------------------|----------|-----|-------|-------------------------------|
| Style Consistency         | 7/10     | 8/10 | +1   | Home, Profile, Settings, Tab bar use only DS_COLORS |
| Accessibility             | 6/10     | 8/10 | +2   | All touchables on redesigned screens have accessibilityLabel/accessibilityRole |
| **FRONTEND TOTAL**        | **76/100** | **78/100** | +2 | Same as prior where not re-scored |

### CHANGE SUMMARY
| Metric                         | Value |
|--------------------------------|-------|
| Screens redesigned             | 5 (Home, Profile, Create Profile, Settings, Tab bar) |
| Files modified                 | 7 (design-system.ts, index.tsx, profile.tsx, create-profile.tsx, settings.tsx, _layout.tsx; CONSEQUENCES in settings already used DS) |
| New DS_COLORS tokens added     | 2 (card, modalBackdrop) |
| Accessibility attributes added| 40+ on Home, 15+ on Profile, 2 on Create Profile, 12+ on Settings; tab bar labels + role |
| Raw hex removed (redesigned screens) | All in index, profile, settings, create-profile, _layout |

---

## REMAINING GAPS TO REACH 90+

1. **Activity screen:** Migrate `createActivityStyles` and all inline colors to DS_COLORS; add accessibilityLabel/accessibilityRole to every TouchableOpacity/Pressable.
2. **Challenge Detail:** Replace remaining hex/rgba (e.g. in DIFFICULTY_THEMES, inline icon colors) with DS_COLORS; full a11y pass.
3. **App-wide hex:** Remove raw hex from task flows (timer, photo, journal, run, checkin, manual), auth (login, signup, forgot-password), onboarding, accountability, commitment, edit-profile, etc., and use DS_COLORS or theme tokens.
4. **Consistency:** Ensure all new screens and components use StyleSheet.create() and DS_COLORS only.

---

## FILES CHANGED (FULL LIST)

- `lib/design-system.ts` — Added `card`, `modalBackdrop`.
- `app/(tabs)/index.tsx` — Replaced theme/hex with DS_COLORS; added a11y; removed useTheme from SyncingBanner, TaskRow, AnimatedProgressBar and from main component where possible.
- `app/(tabs)/profile.tsx` — createProfileStyles() now uses DS_COLORS only; removed useTheme from ProfileScreen and IntegrationsSection; ProfileSkeleton uses DS_COLORS.card; all touchables given accessibilityLabel/accessibilityRole.
- `app/create-profile.tsx` — accessibilityLabel on Bio, accessibilityRole="header" on title.
- `app/settings.tsx` — Replaced all themeColors with DS_COLORS; VisibilitySubsection no longer takes themeColors; fixed import `onboardingStorage` → `onboardingStore`; added a11y to back, edit profile, theme pills, friends, sign out.
- `app/(tabs)/_layout.tsx` — Removed useTheme; tab colors use DS_COLORS; added tabBarAccessibilityRole: "tab" for each tab.
