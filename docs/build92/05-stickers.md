# Chunk 05: Share stickers

**Spec:** `part1-finish-loop/` frames P1-12 to P1-18 and the styles grid. Checklist: the Part 1 lines from "The sticker carousel swipes…" through "Stickers export as…".

**Why:** the build 91 share sticker was a mostly empty black card. It's what people post to Instagram, so it's free marketing.

## Items
- **05.1 Carousel:**
  - 4 styles (Photo, Week strip, Streak glow, Progress ring) with dots.
  - Each comes in Ink, White and Orange themes, following the orange rule.
  - The whole card is visible on an iPhone SE.
- **05.2 No stock photos:** with no proof photo, the Photo style becomes a plain card in the theme colour.
- **05.3 Pro lock:**
  - Streak glow and Progress ring show a lock and "GRIIT Pro", and tapping opens the upgrade sheet.
  - Prices come from RevenueCat offerings, never hard-coded.
  - Entitlement: "GRIIT Pro".
- **05.4 Verified mark** only for camera or Strava proof.
- **05.5 Export:**
  - a 1080×1920 story image and a transparent PNG sticker
  - Instagram Story, Save, Messages and More
  - Wire the toast "Share" action from chunk 01 here.

**Areas:** `components/share/`, the share sheet, the RevenueCat paywall hook. If the transparent export needs a new native module, STOP and ask.

## Gates
- [ ] vitest: the theme rules (no orange on White except the flame; the ring is never orange); the plain card when there's no photo.
- [ ] Exported files checked: 1080×1920 size; the PNG has an alpha channel.
- [ ] A Pro sticker tap opens the paywall with live offering prices (or the sandbox offering).
- [ ] Screenshots next to P1-12 to P1-18.
- [ ] Chunk 01–05 tests pass; tsc has no new errors. PROGRESS updated, committed, pushed.
