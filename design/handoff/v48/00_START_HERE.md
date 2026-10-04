# GRIIT v48 · Engineering handoff

The design atlas is complete and approved (Oct 4, 2026). Batch scores: 1R 9.0 · 2 9.0 · 3 9.1 · 4 9.0.

## Open first
1. `atlas/GRIIT v48 Atlas · Complete (offline).html`: double-click; works offline. Opens on the full index of every frame (route · component · state · source · built in 75). Every frame number links to its frame.
2. `cursor/02_screens.md`: copy tables per batch (search "v48 · Batch").
3. `cursor/05_diff_from_current_app.md`: what to change in the app, per batch (search "v48 · Batch").

## What's in here
| folder | contents |
|---|---|
| `atlas/` | Offline atlas (one file). `source/`: the 22 editable atlas pages + `support.js` + `assets/proofs/` (open any `.dc.html` from a local server) |
| `cursor/` | Engineer specs: laws, components, screens, media, diff, token diff |
| `src/tokens.v46.ts` | Locked tokens. `categoryTint` updated per flag 199 |
| `src/components/v46`, `v47`, `v48` | Current component source (React Native). v48: `SafeArea.ts`, `copy.ts` (single-source strings incl. FREEZE), `FeedPost.tsx`, `ProofDayFeed.tsx`, `Cover.tsx` |
| `src/components/` (root, v41, v42, create, onboarding, share) | Earlier rounds, kept for reference; superseded where v46–v48 cover the same component |
| `src/atlas/` | Generators that produce the atlas pages (not app code) |

## Rules that must not drift
- Orange in four places only: the one filled primary, the streak flame, the done check, the active tab icon. No orange text.
- Never "Verified". Camera proofs carry the camera seal; everything else reads "Self-reported".
- Safe areas: top 59, bottom 34, tab bar 83. Nothing in those zones (`v48/SafeArea.ts`).
- Freeze copy is one string, imported from `v48/copy.ts`, on Home and challenge detail.
- Links: `{INVITE_BASE}/i/{code}` until the domain is decided. Contact: griit.health@gmail.com.
- Paywall prices, trial and period come from RevenueCat offerings. Never hard-coded.
- Seeded owner in every frame: Yaseen Abdelaziz (@yaseen).

## Decisions taken during the atlas (summary)
Strict (not "No Days Off") for the mode · Leave takes effect at midnight · a member's freeze holds the group streak · creator ownership passes to the longest-standing member · Delete removes a post from the feed only, the proof stays private · no map on Set your gym · no Global board · reports email the founder · Google sign-in only if it already works · "I'm 13 or older" on the Account step · force update via remote config `min_supported_build`.

## Still open for engineering
- **194** Offline posting: is there a queue? Home H assumes not.
- **213** Guest proofs must merge into the account on sign-up.
- **Built in 75**: the build 75 screenshots never reached the design project, so that index column reads "pending" where it couldn't be checked. One comparison pass fills it.
- Items marked **(not built)** in the index are new work: report flows, blocked users, permissions screen, Health import, force update, the Instagram return toast, and others listed there.
- Proof photos in the atlas are Unsplash stock stand-ins, not user content.
