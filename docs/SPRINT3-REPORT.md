# Sprint 3 Report: Design System Long Tail

**Date:** 2025-03-21

## Metrics

| Metric | Before (approx.) | After | Delta |
|--------|------------------|-------|-------|
| Raw hex outside `lib/design-system.ts` | ~18+ files | 0 | −all |
| Theme definition files with inline hex | `onboarding-theme`, `theme-palettes` (dark), styles | DS-only | consolidated |
| DS-OK exceptions | 0 | 0 | — |

## Theme consolidation

| File | Action |
|------|--------|
| `constants/onboarding-theme.ts` | Rewritten to import `DS_COLORS`, `DS_SPACING`, `DS_MEASURES`, `DS_RADIUS`; zero hex |
| `lib/theme-palettes.ts` | `DARK_THEME` uses `DS_COLORS.DARK_*` tokens (no `#` literals) |
| `styles/discover-styles.ts` | All remaining hex replaced with `DS_COLORS` |
| `src/theme/*` | No raw hex found; no change required |

## Accent color resolution

| Role | Token | Hex | Purpose |
|------|--------|-----|---------|
| Primary app accent | `ACCENT` / `ACCENT_PRIMARY` | #E8845F | CTAs, nav, approved reference orange |
| Discover / celebration coral | `DISCOVER_CORAL`, `GRIIT_COLORS.primary` | #E8593C | Discover stack, hero CTAs, brand moments |

## New `DS_COLORS` groups

- Discover / challenge UI: `DISCOVER_INK`, dividers, difficulty tints, team card duo/solo, hero dark bg, etc.
- Onboarding: `ONBOARDING_*` migrated from old `onboarding-theme` literals
- Dark foundation: `DARK_*` for reserved `DARK_THEME` in `theme-palettes.ts`

## Verification

- `npx tsc --noEmit`: pass
- Repo-wide grep: `#[0-9A-Fa-f]{3,8}` only in `lib/design-system.ts`

## Known remaining gaps

- `HeroFeaturedCard` / `DiscoverCTA` still use `rgba(...)` glows; not hex literals, unchanged visually.
- Raw numeric `fontSize` / spacing in some inline styles left where no exact `DS_TYPOGRAPHY` / `DS_SPACING` match without visual drift.
