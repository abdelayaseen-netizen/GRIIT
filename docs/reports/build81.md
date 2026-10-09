# Build 81

Shipped to internal TestFlight on Oct 9, 2026.

- Build number: **81** (1.0.0)
- Binary commit: `8c19152d`
- Health: `https://grit-backend-production.up.railway.app/api/health` returned 200 with commit `8c19152`
- Railway deployment: `f8547c68-4a1f-4f8c-b871-b3c56df9b224`
- EAS build: `4b060890-12b8-4ebb-b283-7ccef2036809`
- Submission: `9328ae49-5512-48a0-88b9-d58f240cc33d`
- IPA: `https://expo.dev/artifacts/eas/j1xzMpMz6ZmMsmf19-QX0yFf9HYzbl0iIxuTWdo7Vqc.ipa`
- Group: internal only. The production submit profile does not attach an external TestFlight group.
- This report is docs-only and is not in the binary. Health stays on `8c19152`.

## What shipped

- Type scale matches the iOS text styles. Discover cover titles wrap to three lines.
- Home is a title greeting, a streak card, and flat Today rows, including the five states (mid-day, done, freeze, day 1, done expanded).
- A shared self-reported post is its own card. It never says Verified.
- Profile proofs open a stories viewer at `/profile/proof/[date]`. The old day route redirects there.
- The profile shows the mutual friend count, up to three faces, and one Edit profile button. Zero friends says "Find friends".
- Your data is flat sections with the frame date range, hour line, and legend.
- Saved and Copied show as a toast. The share card has one handle, a day legend, and the invite link from `INVITE_BASE` when a public host is set.
- Orange chrome is the primary button, the flame, the done-check glyph, and the active tab.

## Checks

- Friends at 0 and at 3 passed Maestro (`profile-friends`).
- Share styles A–G saved to Photos (`share-saved-all`).
- Your data 7d, 30d, and All each showed `your-data-loaded`.
- Largest text size (`accessibility-extra-extra-extra-large`): the Home title wraps, the streak row wraps, and nothing is ellipsized. The word "afternoon" breaks across lines because it is wider than the phone. Content size was reset to `large`.
- Full suite before the ship commit: 309 files, 1595 tests. Typecheck was clean.

## Frames

Simulator shots are in `docs/frame-match/build81/`. The design atlas was not captured. Compared with the written spec in `design/handoff/v51/handoff/GRIIT-v51-handoff/cursor/02_screens.md`.

Shot: 1301, 1304–1309, 1311–1312, 1316–1317, 1319, 1324, and the locked feed 1228. Gesture proof for 1311–1315 passed Maestro. Share styles A–G exported even though only the ink preview was screenshotted.

Not shot inside the 30-minute cap: 1302–1303 (they are the same type specimen as 1301), 1310 (the self card is 1309), 1313–1315, 1318, 1320–1323, 1325.

Differences:

- `hourLabel()` returns "8 am" with a space. The frame sentence is "around 8 am". The line reads "Most often around 8 am."
- Date ranges compare UTC calendar days so "Sep 30 – Oct 1" does not shift in America/New_York. The handoff uses local `toDateString()`.
- The self-reported header is "Day n of N · {challenge}". Locked v50 photo posts stay "{challenge} · Day n of N".
- The done check is a raised circle with a Text 1 check. It is not a filled orange disc. The check glyph stays brand orange.
- Proof close shrinks, then goes back. It does not measure the source grid tile.
- The share footer is "@handle" when no public host is set, and "@handle · {base}/i/{code}" when `INVITE_BASE` or an origin is set. `griit.to` in the frames is an example only.
- Share-card artwork still uses the orange export palette on the Orange style. That is the card, not chrome.
- The logged-in Your data hour line was "Shows after 5 proofs." because the hour histogram was empty.
- Home frame shots are the dev harness (`griit://dev/build81`), not the logged-in Home tab. The real Home still has the feed under Today.
- Frames 1228–1230 stay as shipped in build 80.

## Skipped

- Timer Live Activity (frames 1231–1234) and Apple Health. They were not started.
- The task-proofs privacy SQL. It was not run. Run it after build 80 is installed. Build 80 already contains the signed-URL client (`28ba7983`).
