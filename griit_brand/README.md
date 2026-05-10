# GRIIT Brand Asset Package

Everything you need to ship the new logo to TestFlight, the App Store, the website, and social.

**Read `BRAND.md` first** for the meaning, color codes, geometry, and usage rules.

---

## Where each file goes

### 1. Expo / iOS (TestFlight Build 3)

Drop these into your repo at `/Users/yaseenabdela/Developer/GRIIT/assets/`:

| File from this package | Destination in repo |
|---|---|
| `ios/icon.png` | `assets/icon.png` |
| `ios/adaptive-icon.png` | `assets/adaptive-icon.png` |
| `ios/splash-icon.png` | `assets/splash-icon.png` |
| `ios/favicon.png` | `assets/favicon.png` |

Verify `app.json` references match (it should already point to these paths). Then:

```bash
cd /Users/yaseenabdela/Developer/GRIIT
eas build --platform ios --profile production
```

When the build completes, submit to TestFlight:

```bash
eas submit --platform ios --latest
```

Build 3 will show the new icon in TestFlight automatically. Existing testers will see the icon update on their next install.

### 2. App Store Connect

When you submit for App Store review:

1. App Store Connect → your app → App Information → App Icon
2. Upload `ios/icon-1024.png`
3. Verify in the preview that no rounded corners or transparency are present (Apple rejects icons with either)

The asset already meets all Apple requirements: 1024×1024, no alpha channel, sRGB, no rounded corners (Apple applies the squircle mask automatically).

### 3. Website / Landing Page

When you build the marketing site, drop these in `/public/`:

| File | Where it goes | HTML reference |
|---|---|---|
| `web/favicon-32.png` | `/public/favicon-32.png` | `<link rel="icon" sizes="32x32" href="/favicon-32.png">` |
| `web/favicon-16.png` | `/public/favicon-16.png` | `<link rel="icon" sizes="16x16" href="/favicon-16.png">` |
| `web/favicon-180.png` | `/public/apple-touch-icon.png` | `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` |
| `web/og-image-1200x630.png` | `/public/og-image.png` | `<meta property="og:image" content="https://griit.app/og-image.png">` |
| `master/griit-logo-orange-on-white.svg` | `/public/logo.svg` | Use in nav bar |

### 4. Social Profile Pictures

For Instagram, TikTok, X, Threads, YouTube, LinkedIn:

- **Default:** `social/profile-1024-white.png` (orange mark on white)
- **High-impact alternative:** `social/profile-1024-black.png` (orange on black — recommended for TikTok/X where dark UIs are common)
- **Inverse for marketing posts:** `social/profile-1024-orange.png` (white on orange)

Reserve handles before posting. Suggested order: Instagram, TikTok, X, Threads, YouTube, LinkedIn. Use the same handle on all platforms (`@griit` if available, otherwise `@griitapp`).

### 5. Press Kit / Media Requests

When journalists or creators ask for assets, send them a zip containing:
- `master/griit-logo-orange-on-white.svg`
- `master/griit-logo-orange-on-black.svg`
- `ios/icon-1024.png`
- `ios/icon-1024-dark.png`
- `BRAND.md` (so they get the colors and the brand story)

---

## Critical reminders

**The SVGs in `master/` are the source of truth.** If you ever need a size, format, or context that isn't already in this package, generate it from the SVG. Never upscale a PNG.

**Apple rejects rounded corners and transparency on the App Store icon.** The provided `ios/icon-1024.png` is correct as-is. Do not pre-round it in Photoshop.

**The Gemini files were JPEGs disguised as PNGs.** All files in this package are true PNGs with no compression artifacts. Use these instead of the original Gemini outputs.

---

## Suggested next steps (in order)

1. **Drop the Expo assets in your repo** and rebuild → TestFlight Build 3
2. **Reserve social handles** (Instagram, TikTok, X, Threads, YouTube — 10 minutes)
3. **Commit `BRAND.md` to your repo** at `docs/brand/BRAND.md` so it's versioned
4. **Resume your launch backlog:** Railway redeploy, WCAG contrast token swap, profiles RLS hardening, three pending verification gates

The logo is locked. Don't iterate further unless you genuinely hate it after a week of seeing it on your phone.
