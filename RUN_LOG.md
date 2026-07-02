# RUN_LOG — CreateWizardV2 daylight restyle (build 39)

**Branch:** `restyle/create-wizard-daylight`  
**Base:** `main` (PR #32 merged — `app/create/index.tsx` imports `{ CreateWizardV2 }`)  
**Scope:** `CreateWizardV2.tsx`, `components/create/v2/*`

---

## Phase 1 — Recon (read-only audit)

**Gate:** `app/create/index.tsx` line 1 — `import { CreateWizardV2 } from "@/components/create/CreateWizardV2"` ✅

### Summary

| Finding | Count (scoped) | Action |
|---------|----------------|--------|
| `DS_DAYLIGHT` import (wrong token set; accent `#DC5401`) | 4 files | → `DS_COLORS_V2` |
| `DS_COLORS.*` v1 tokens | 0 | — |
| Raw `#hex` in scoped files | 0 | — |
| Raw `rgba(` in scoped StyleSheets | 0 (via DS_DAYLIGHT refs) | → `DS_COLORS_V2.overlay.*` |
| `fontWeight` 600+ (`semibold`) | 38 occurrences | → `'500'` |
| Emoji | 0 | — |
| Lucide icons | all steps | ✅ keep |
| Off-token spacing (9, 14, 15, etc.) | multiple | map to `DS_SPACING_V2` where touched |
| Off-token radius (13–30) | multiple | map to `DS_RADIUS_V2` where touched |

### File:line findings

#### `components/create/CreateWizardV2.tsx`

| Line(s) | Issue |
|---------|-------|
| 29 | `DS_DAYLIGHT` import — must be `DS_COLORS_V2` |
| 334 | `DS_DAYLIGHT.color.ink` → `text.primary` |
| 454 | `DS_DAYLIGHT.color.inkMuted` → `text.tertiary` |
| 501 | `DS_DAYLIGHT.color.canvas` → `surface.canvas` |
| 505,532,541,546,575 | `DS_DAYLIGHT.space.screenH` (24) → `DS_SPACING_V2.lg` |
| 519–520 | cancel link uses `accent` → `brand.primary` |
| 525–526 | step label uses `inkMuted` → `text.secondary` (spec) |
| 536–537 | progress active/inactive `accent` / `dividerStrong` → `brand.primary` / `surface.divider` |
| 552–561 | primary CTA `accent`/`white`/`semibold` → `brand.primary`/`primaryText`/`500` |
| 557 | disabled btn `segmentTrack` → `surface.cardChipNeutral` |
| 569 | modal backdrop `photoGradientStrong` (DS_DAYLIGHT rgba) → `overlay.photoGradientStrong` |
| 572–574 | modal sheet `canvas`/`radius.sheet` → `surface.card`/`DS_RADIUS_V2.xl` |
| 588 | handle `handle` → `surface.divider` |
| 597–598 | modal title `semibold` → `'500'` |
| 604–606 | summary row `fieldNeutral`/`cardBorder` → `cardSubtle`/`divider` |
| 615 | error `accentAccessible` → `semantic.danger` |
| 623–629 | modal CTA `accent`/`white`/`semibold` → `brand.primary`/`primaryText`/`500` |

#### `components/create/v2/StepBasics.tsx`

| Line(s) | Issue |
|---------|-------|
| 17 | `DS_DAYLIGHT` import |
| 70,135 | `placeholder` → `text.tertiary` |
| 155–156,176–177,191 | icon `accent`/`inkSecondary` → `brand.primary`/`text.secondary` |
| 206–207 | h1 `semibold`/`ink` → `'500'`/`text.primary` |
| 211–212 | sub `inkMuted` → `text.tertiary` |
| 216–225 | input card `card`/`cardBorder`/`accent` focus → `surface.card`/`divider`/`brand.primary` |
| 228–229,237–240 | input text `ink`/`inkMuted2`/`accent` → v2 text + `brand.primary` |
| 248–250 | section label `semibold` |
| 261–269 | duration chips selected: `accentTint` border (no primary border) → `primarySoft` + `primary` border |
| 277–278 | selected text `semibold`/`accent` |
| 304–312 | who cards selected `accent`/`accentTint` → `brand.primary`/`primarySoft` |
| 317–318,340–341 | `semibold`/`medium` on titles/hint |

#### `components/create/v2/StepTasks.tsx`

| Line(s) | Issue |
|---------|-------|
| 25 | `DS_DAYLIGHT` import |
| 259,282,323 | icon `accent` → `brand.primary` |
| 309,338 | icon `inkMuted2`/`inkMuted` → `text.tertiary` |
| 358–359,388–389,419,440,464,472,489,509 | `semibold` (600) throughout StyleSheet |
| 371–406 | tabs/packs selected `accentTint`/`accent` → `primarySoft`/`primary` |
| 414,436 | pack icon wrap / empty add `accentTint` → `primarySoft` |
| 451–453,485,497–500 | cards `card`/`cardBorder`/`fieldNeutral` → v2 surface tokens |

#### `components/create/v2/StepRules.tsx`

| Line(s) | Issue |
|---------|-------|
| 19 | `DS_DAYLIGHT` import |
| 71–72,94–95,144,171–172 | dynamic icon colors `accent`/`inkSecondary` |
| 79–80,102–103 | icon bg `accentTint`/`fieldNeutral` |
| 239–240,274–275,289,313,328–329,361 | `semibold` in StyleSheet |
| 252–261 | diff cards selected pattern |
| 305–313 | pill segment selected `accentTint`/`accent` |
| 322–329 | stat chip `accentTint`/`accent` |
| 344–352 | category chips selected pattern |

### Icons / emoji

- All icons: Lucide ✅ (`ChevronLeft`, `X`, `User`, `Users`, `Lightbulb`, pack icons, etc.)
- Emoji: none found in scoped files ✅

### Day formatting

- Duration labels: `"7 days"`, `"30 days"`, etc. ✅ (no zero-pad, no `1/30`)
- Hard mode copy: `"restart from day 1"` ✅ (prose, not a counter)

---

## Phase 2 — Restyle

(pending)

## Phase 3 — Verify

(pending)

## Phase 4 — PR + EAS build

(pending)
