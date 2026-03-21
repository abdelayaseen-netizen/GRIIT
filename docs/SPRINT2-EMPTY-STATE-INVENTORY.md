# Sprint 2 — Empty / loading / error state inventory

Audited 2026-03-21 against current code.

| Screen | Data source | Has empty state? | Has loading state? | Has error state? |
|--------|-------------|------------------|--------------------|------------------|
| `app/(tabs)/index.tsx` (Home) | `useQuery` home bundle | Partial — `GoalCard` handles no active challenge CTA | No full-screen loader; pull-to-refresh only | Partial — `GoalCard` `isError` + retry |
| `app/(tabs)/discover.tsx` | `useInfiniteQuery` getFeatured | No dedicated empty when `filtered.length === 0` | No | No |
| `app/(tabs)/activity.tsx` | leaderboard + feed queries | Partial — sections may be empty | Partial — activity indicator in places | Partial |
| `app/(tabs)/profile.tsx` | `useApp` + `useQuery` lists | Guest + loading text | Yes (loading text) | Yes (error text) |
| `app/(tabs)/create.tsx` | Form / mutation | N/A | N/A | Inline recovery modal |
| `app/(tabs)/teams.tsx` | `useMyTeam` | Yes — no-team UI with CTAs | Yes — skeleton | No full ErrorRetry |
| `app/challenge/[id].tsx` | `useQuery` challenge | N/A single resource | Partial | Partial — empty/error views exist |
| `app/challenge/active/[activeChallengeId].tsx` | Active challenge query | TBD | TBD | TBD |
| `app/settings.tsx` | Local + TRPC loads | N/A | Partial | No |
| `app/accountability.tsx` | `load()` / list | Partial — list UI | Yes | No ErrorRetry |

**Sprint 2 action:** Add `EmptyState` + `ErrorRetry` per Phase 3 where gaps exist, without removing existing good patterns.
