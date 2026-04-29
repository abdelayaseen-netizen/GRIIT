# A11Y Debt Log

## Contrast Audit (Sprint 5)

Source: `tests/design-system-contrast.test.ts` run on 2026-04-29.

Measured failing pairs:

1. `TEXT_TERTIARY` (`#999999`) on `BG_PAGE` (`#F5F5F5`)
   - ratio: **2.61**
   - target: **>= 3.0** (large/caption minimum)
2. `TEXT_ON_ACCENT` (`#FFFFFF`) on `ACCENT` (`#E8845F`)
   - ratio: **2.66**
   - target: **>= 4.5** (normal text AA)
3. `TEXT_TERTIARY` (`#999999`) on `BG_CARD` (`#FFFFFF`)
   - ratio: **2.85**
   - target: **>= 3.0** (large/caption minimum)

Recommendation: adjust the failing DS token pairs with design approval in a dedicated design-system update sprint. Do not patch ad hoc in feature files.

## Dynamic Type Audit (Sprint 5)

- `allowFontScaling={false}` occurrences found: **2**
- File: `components/ui/GRIITWordmark.tsx`
- Status: **intentional exception**, commented inline (brand lockup text).
- Removed unjustified occurrences: **0**

## Typography Line-Height Review

`DS_TYPOGRAPHY` entries are mostly line-height multipliers >= 1.2 where lineHeight is explicitly set. Entries without explicit lineHeight rely on platform defaults and should be validated manually at max iOS text size during device QA.
