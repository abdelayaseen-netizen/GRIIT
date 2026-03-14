# UI Redesign + Nav Fix — Output Table

## Phase 1: Tab Navigation

| Tab | Route | Status |
|-----|-------|--------|
| Home | `/(tabs)` / `/(tabs)/index` | Fixed |
| Discover | `/(tabs)/discover` | Fixed |
| + (Create) | `/(tabs)/create` | Fixed |
| Movement | `/(tabs)/activity` | Fixed |
| Profile | `/(tabs)/profile` | Fixed |

**Root cause:** `AuthRedirector` in `app/_layout.tsx` was calling `router.replace(ROUTES.TABS)` when the user was already inside the (tabs) group. That reset the stack to the default tab (Home), so switching to Discover/Movement/Profile appeared to do nothing.

**Fix:** Only redirect to `ROUTES.TABS` when `!inTabs` (i.e. when the first segment is not `"(tabs)"`). So we never replace while the user is already on any tab.

---

## Phase 2: Theme Constants

| Item | Status |
|------|--------|
| `constants/theme.ts` | Created — COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY (cream #F5F1EB, green #2D3A2E, orange #D2734A) |
| Existing `lib/design-system.ts` | Unchanged — screens continue to use DS_COLORS, DS_SPACING, etc. (already cream/orange/green aligned) |

---

## Final Output Table (Mandatory)

| Screen | File Path | Changes Made | Status |
|--------|-----------|-------------|--------|
| Tab Navigation | `app/_layout.tsx` | AuthRedirector: only redirect to TABS when `!inTabs` so tab switches are not overwritten | Fixed |
| Home | `app/(tabs)/index.tsx` | No change — already uses DS design system | Already OK |
| Discover | `app/(tabs)/discover.tsx` | No change — uses DS_COLORS.background, discover-styles | Already OK |
| Profile | `app/(tabs)/profile.tsx` | No change — uses DS_COLORS.background, card styles | Already OK |
| Movement | `app/(tabs)/activity.tsx` | No change — uses ThemeContext (theme-palettes → DS) | Already OK |
| Create (+) | `app/(tabs)/create.tsx` | No change — uses DS + create-styles | Already OK |
| Settings | `app/settings.tsx` | No change — uses design system | Already OK |
| Tab Bar | `app/(tabs)/_layout.tsx` | No change — already uses DS_COLORS (accent, tabInactive, centerButtonBg) | Already OK |
| Theme Constants | `constants/theme.ts` | New file — cream/orange/green tokens for reference and future use | Created |
| Shared Components | `components/home/*`, `src/components/ui/*` | No change — ChallengeCard, EmptyState, ChallengeCard24h, etc. already use DS | Already OK |
