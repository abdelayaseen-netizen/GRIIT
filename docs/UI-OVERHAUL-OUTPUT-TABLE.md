# UI Overhaul — Mandatory Output Table

| Section | Component | File | Status |
|---------|-----------|------|--------|
| 1 | Discover header (no free limit text) | app/(tabs)/discover.tsx | Done |
| 1 | Category chips (filled All, outlined others) | app/(tabs)/discover.tsx, src/components/ui/FilterChip.tsx | Done (existing) |
| 1 | 24-Hour Challenges horizontal carousel | app/(tabs)/discover.tsx | Done (existing FlatList horizontal) |
| 1 | Featured cards (left border, badge, pills, stats) | src/components/ui/ChallengeCardFeatured.tsx, discover.tsx | Done (🔥 FEATURED badge, left accent, active today) |
| 1 | More Challenges compact list | app/(tabs)/discover.tsx | Done (existing) |
| 1 | Starter Pack removed | app/(tabs)/discover.tsx | Done |
| 2 | Challenge detail crash fixed | app/challenge/[id].tsx | Done (tasks array guard in useMemo) |
| 2 | Orange hero banner | app/challenge/[id].tsx | Existing (gradient/theme) |
| 2 | Participant section | app/challenge/[id].tsx | Existing |
| 2 | Stats row (secured/completion) | app/challenge/[id].tsx | Existing |
| 2 | Today's Missions | app/challenge/[id].tsx | Existing |
| 2 | Rules section | app/challenge/[id].tsx | Existing |
| 2 | Bottom Start CTA | app/challenge/[id].tsx | Existing |
| 3 | Commitment modal (sheet) | app/challenge/[id].tsx | Existing (not redesigned this pass) |
| 3 | Challenge info card | app/challenge/[id].tsx | Existing |
| 3 | Commitment check card | app/challenge/[id].tsx | Existing |
| 3 | Warning + checkbox + confirm | app/challenge/[id].tsx | Existing |
| 4 | Premium gate removed from Create | app/(tabs)/create.tsx | Done |
| 4 | PRO badge removed from tab | app/(tabs)/_layout.tsx | Done |
| 4 | Rork server check removed | app/(tabs)/create.tsx | Done (Server unreachable row removed) |
| 5 | Tab bar matches reference | app/(tabs)/_layout.tsx | Done (5 tabs, center +, no PRO badge) |
