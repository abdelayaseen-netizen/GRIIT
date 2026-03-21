# Theme Inventory (Sprint 3)

## Canonical source: `lib/design-system.ts`

All color hex literals live in this file. `GRIIT_COLORS.primary` aliases `DS_COLORS.DISCOVER_CORAL` (#E8593C) for brand-specific imports.

## Other theme files

| File | Defines own colors? | Imports from DS? | Action |
|------|---------------------|------------------|--------|
| `constants/onboarding-theme.ts` | No (re-exports DS) | Yes | Rewritten: `ONBOARDING_COLORS` maps to DS tokens; spacing uses `DS_SPACING` / `DS_MEASURES` / `DS_RADIUS` |
| `lib/theme-palettes.ts` | No | Yes | `LIGHT_THEME` unchanged; `DARK_THEME` hex moved into `DS_COLORS` (`DARK_*` tokens) |
| `src/theme/*` | No raw `#` in `.ts` | Mixed | No hex migration needed in this tree (tokens reference DS or numbers) |
| `styles/discover-styles.ts` | No | Yes | Raw hex replaced with `DS_COLORS` |

## Accent resolution

- **Primary UI accent (tabs, DS “approved” orange):** `DS_COLORS.ACCENT` / `ACCENT_PRIMARY` → `#E8845F`
- **Discover / coral brand moments:** `DS_COLORS.DISCOVER_CORAL` → `#E8593C` (same as `GRIIT_COLORS.primary`)

## Raw hex file list (pre-fix, by grep)

Inventory was taken when offenders included: `app/(tabs)/discover.tsx`, challenge components under `components/challenges/`, profile/community/home components listed in Sprint 3 prompt, `styles/discover-styles.ts`, `src/components/ui/FilterChip.tsx`, `constants/onboarding-theme.ts`, `lib/theme-palettes.ts` (dark theme), and `lib/design-system.ts` (canonical).

**Verification after migration:** `grep` for `#[0-9A-Fa-f]{3,8}` in `*.ts` / `*.tsx` matches **only** `lib/design-system.ts`.
