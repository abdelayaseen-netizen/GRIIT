# GRIT Design System (Rork-Aligned)

Single source of truth for look and feel. Screens must use tokens and UI components—no hardcoded colors or font sizes.

## Theme Tokens

| Path | Purpose |
|------|--------|
| `src/theme/colors.ts` | bg, surface, text, accent, success, danger, etc. |
| `src/theme/typography.ts` | h0–h3, body, body2, caption, micro |
| `src/theme/spacing.ts` | xs(6) … xxl(32). Horizontal padding 24 (xl). |
| `src/theme/radius.ts` | sm(12), md(16), lg(22), xl(28), pill |
| `src/theme/shadows.ts` | card, button (soft shadows) |
| `src/theme/index.ts` | Re-exports all |

## Typography Component

`src/components/Typography.tsx`: `<H0>`, `<H1>`, `<H2>`, `<H3>`, `<Body>`, `<Body2>`, `<Caption>`, `<Micro>`.

- Use `tone="primary" | "muted" | "subtle" | "inverse"` for color.
- Inter is loaded in root layout; these components use Inter font families.

## UI Components (`src/components/ui/`)

| Component | Usage |
|-----------|--------|
| **Screen** | SafeArea + optional scroll, header, footer, keyboardAvoiding. Padding horizontal `spacing.xl`. |
| **Card** | White surface, `radius.lg`, soft shadow. `pressable`, `onPress`, `selected`. |
| **PrimaryButton** | Variants: `black`, `accent`, `success`, `ghost`, `outline`. Height 56, `radius.lg`. `disabled`/`loading`. |
| **Input** | Height 54, `radius.md`, `colors.border`, placeholder `textSubtle`. |
| **Chip** | `radius.pill`, variants `accentSoft`, `muted`. Optional `onPress`, `selected`. |
| **ProgressBar** | `progress` 0–1, height 6, accent fill. |
| **ListOptionCard** | Left icon, title/subtitle, right check when selected. |
| **ModalSheet** | Rork-style bottom sheet: title, scroll body, primary + cancel. |

Import from `@/src/components/ui` or `@/src/theme`.

## Refactored Screens

- **create-profile**: Uses `Screen`, `Input`, `PrimaryButton`, `H1`, `Body`, `Caption`, theme tokens. Button disabled until username (≥3, alphanumeric/underscore) and display name (≥2).
- **Tabs layout**: Uses `colors`, `spacing`, `typography` for tab bar and center orange button.

## Next Steps (from Cursor Master Prompt)

1. **Onboarding 2–5**: Add identity select, daily commitments, visibility, summary; wire progress 1/5 → 5/5 and profile creation at end.
2. **Home**: Refactor to use theme + components; “Continue where you left off”, timer, cards, “Secure Day”, LIVE feed; fix “Open Challenge” → challenge detail by id.
3. **Discover**: Theme + components; chips, empty state “Start your first challenge” + Refresh.
4. **Challenge detail**: Hero, stats, missions, rules, “Start” → commit modal; create participation and route to Home.
5. **Create challenge**: Step indicator, basics, daily tasks + packs, review, create in DB.
6. **Movement**: Global/Friends/Team tabs, leaderboard, Respect/Chase.
7. **Profile**: Avatar, identity/rank pills, score card, stats, settings, sign out.
8. **Navigation**: Every pressable does something; “Open Challenge” deep-links by id.
9. **Backend/state**: authStore, challengeStore, feedStore, teamStore; real data for home stats, secure day, discover, movement.

## Rules

- No `fontSize` or `#hex` in screen files; use tokens or Typography/UI components.
- New UI patterns → new component in `src/components/ui/`.
- Only `src/theme/*` may define hex colors.
