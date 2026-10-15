# Build 89

Shipped to internal TestFlight on Oct 14, 2026.

- Build number: **89** (1.0.0)
- Binary commit: `a375b25ac3e41c10f18f5d0d86b3f8a50bcf3714`
- EAS build: `2625f8b4-8e7c-4f40-bd9d-4ef9366e57e0`
- Submission: `ac0d5d93-c6d9-4f51-87a1-99b17b1bc4d3` finished. Group Team (Expo), internal only.
- IPA: `https://expo.dev/artifacts/eas/e74yCQBcWPhqXrf51Isr6X5E5hT4HgoZ9kGRYZSgSl4.ipa`
- API health commit: `a9c8873`. Deployment `abe2e7d3-cf9b-42c5-9a71-a09aa40940a4`. The journal writer fix is in the client only, so this binary does not need a new server deploy.
- About on this binary shows the EAS commit `a375b25`.

The local `ios/` directory is gitignored, so it was not in the upload.

## Smoke

All 11 flows passed, and the timer check-in passed after the per-user limit.

The likes flow's scroll treated a heart under the tab bar as missing. On that same post, a short swipe and a tap turned the heart into "Liked by you", and a later tap cleared it. Logs: `docs/reports/oct15/after/smoke/build88-likes.txt`, `build88-likes-heart.txt`, `build88-likes-unlike.txt`.

## Seeded checks

Like, profile grid, Discover, the share card, and Strict on Discover passed on the seeded account. A test viewer still sees b88 handles. The signed-in account does not show the guest banner. Home still reads Best 6. Your data shows the Best label and the number 6 as separate text. The "6 of 7" line sits on the seven-day card, which had scrolled off when the thirty-day card was on screen.

## What this binary contains

Guest and signed-in photo posts reach Back to today. Join lands on Home and the first task opens. A journal opened from Home uses the writer. Check-ins use a per-person limit and the client retries a 429 once.
