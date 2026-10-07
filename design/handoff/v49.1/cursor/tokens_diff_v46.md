# tokens.v46.ts vs tokens.dense.ts

| token | tokens.dense.ts (chunk R) | v46 | why |
|---|---|---|---|
| canvas | #0F0F0F | #0F0F0F | unchanged |
| surface | #1A1917 | #1A1918 | D2 |
| raised | — | #242322 | **new**: secondary buttons, done circle |
| border → hairline | #2E2B27 | #2A2928 | D2; renamed. Keep `border` as an alias for one release |
| textPrimary | #F5F3EE | #F2F0EB | D2 |
| textSecondary | #A39E95 | rgba(242,240,235,0.64) ≈ #A09F9C | D2, 7.4:1 on canvas |
| textTertiary | — | rgba(242,240,235,0.44) ≈ #737270 | **new**, 3.9:1: captions and placeholders only, never body |
| brandText | #E8600F | retired | orange is limited to four uses (D2) |
| brandTint | #3A1F10 | retired | selected states invert instead |
| selectedBg / selectedText | — | #F2F0EB / #0F0F0F | **new** |
| type.display | 28/34 500 | **titleL** 28/34 **600** | D1 |
| type.title | 22/28 500 | 20/25 **600** | D1 |
| type.heading | 17/22 500 | retired | Title and Headline cover it |
| type.bodyStrong | 15/20 500 | **headline** 15/20 **600** | D1; renamed |
| type.body | 15/20 400 | unchanged | |
| type.secondary | 13/18 400 | unchanged | |
| type.caption | 12/16 400 | 12/16 **500** | D1 |
| type.label | 11/14 500 | 11/**13** 500 caps | D1 |
| numberSize | inline 15, home 64, moment 96 … | adds L 56 / M 40 / S 28 | D1 Display roles |
| radius.card | 14 | 16 | rounder cards on the darker surface |
| categoryTint | — | 6 tints | **new**, F3 covers |
| avatarTints | 2 (brandTint, border) | 6 pairs | **new**, F2 |

**Grep list for Cursor:** `brandText`, `brandTint`, `#E8600F`, `#3A1F10`, `fontWeight: '500'` on any screen title or name, `type.heading`, `type.bodyStrong`, `DS_COLORS.accent` on chips, segments, pills or leaderboard rows, `"Be the first"`, `"Nothing is secured until the server says so."`, `"friends"` in profile stats.
