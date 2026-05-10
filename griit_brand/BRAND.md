# GRIIT Brand Identity

> Version 1.0 — Locked May 2026

The "ii" mark is the GRIIT logo. This document defines what it means, how to use it, and what not to do with it.

---

## The Mark

Two vertical orange bars with square tittles above. It reads as the lowercase letters "ii" — the double-I in GRIIT made literal.

The spelling **GRIIT** is always with two I's. Never "GRIT." The double-I is the brand's defining typographic detail, and the logo is its purest expression.

## What It Means

**Two i's, the double-I in GRIIT.** The mark is the wordmark's signature detail isolated and elevated. When you see "ii," you see GRIIT.

**Vertical = standing tall.** Verticality reads as posture, columns, pillars, integrity. For a discipline app, the form factor itself signals seriousness.

**Two = partnership, accountability, witness.** A single bar is lonely. Three or more is a crowd. Two is a pair — the social accountability mechanic at the heart of the product, made visible in the mark.

**Weight = decision.** The bars are deliberately heavy (4.86:1 height-to-width ratio). Discipline isn't dainty. The mark holds its own next to bold app icons on a home screen.

**Sharp 90-degree corners, no rounding.** Discipline is not soft. The mark refuses to be friendly in a way that would undermine the brand's seriousness.

## Brand Story (one paragraph)

> The GRIIT logo is two lowercase i's — the double-I in our name made into a mark. They stand vertical because discipline is about standing tall. They stand together because consistency happens with witnesses. They're heavy and squared because we don't pretend the work is easy. The simplest possible shape for the simplest possible promise: show up, stack the day, do it again tomorrow.

Use this verbatim or paraphrased on the website, in App Store copy, in press, and in onboarding.

---

## Colors

| Use | Name | Hex | RGB |
|---|---|---|---|
| Primary brand | GRIIT Orange | `#DC5401` | 220, 84, 1 |
| Background light | White | `#FFFFFF` | 255, 255, 255 |
| Background dark | Black | `#000000` | 0, 0, 0 |

GRIIT Orange is the only brand color. Don't introduce secondary brand colors without a deliberate brand-system update. Functional UI colors (success green, error red, etc.) are separate from brand colors and live in the design system tokens, not here.

The mark always appears in one of three configurations:
1. **Orange on white** — primary, default for light contexts
2. **Orange on black** — primary alternate, default for dark contexts
3. **White on orange** — inverse, for orange backgrounds (social profiles, marketing)

Never use the mark in any color other than `#DC5401`, `#FFFFFF`, or `#000000`.

---

## Geometry (the locked spec)

Proportions on a 1024×1024 canvas:

| Element | Dimension |
|---|---|
| Bar width | 81px (7.91% of canvas) |
| Bar height | 394px (38.48% of canvas) |
| Dot width | 81px (same as bar) |
| Dot height | 80px (7.81% of canvas) |
| Gap between dot and bar | 38px (3.71% of canvas) |
| Gap between the two i's | 74px (7.23% of canvas) |
| Total mark width | 236px (23.05% of canvas) |
| Total mark height | 511px (49.90% of canvas) |
| Bar height-to-width ratio | 4.86:1 |

**The mark is always centered on a square canvas.** Never crop, never offset, never rotate.

---

## Usage Rules

**Do:**
- Use the SVG master files for any new size or context (they are the source of truth)
- Maintain the geometry exactly as specified — never manually redraw the bars
- Pair the mark with a clean geometric sans-serif when a wordmark is needed (Inter Black, Söhne Breit, or General Sans Heavy are all good fits)
- Allow generous whitespace around the mark — minimum clear space equal to one bar width on all sides

**Don't:**
- Stretch, skew, or rotate the mark
- Add gradients, shadows, glows, outlines, or 3D effects
- Round the corners — the squared geometry is the brand
- Place the mark on busy photographic backgrounds without a solid color shape behind it
- Recreate the mark in any color other than GRIIT Orange, white, or black
- Use the previous "ii of unequal heights" or "two-figure" variations — those were rejected iterations
- Combine the mark with other logos in lockup form without a documented co-brand spec

---

## File Index

```
brand/
├── master/                              # SVG sources of truth
│   ├── griit-logo-orange-on-white.svg
│   ├── griit-logo-orange-on-black.svg
│   ├── griit-logo-orange-transparent.svg
│   ├── griit-logo-white-transparent.svg
│   └── griit-logo-black-transparent.svg
│
├── ios/                                 # Expo / App Store assets
│   ├── icon.png                         # Expo: ./assets/icon.png (1024×1024)
│   ├── icon-1024.png                    # App Store Connect upload
│   ├── icon-1024-dark.png               # iOS dark mode variant
│   ├── adaptive-icon.png                # Android adaptive icon (Expo requires)
│   ├── splash-icon.png                  # Splash screen mark, transparent
│   └── favicon.png                      # 48×48 web favicon
│
├── web/                                 # Website + favicons
│   ├── favicon-{16,32,48,64,96,180,192,512}.png
│   ├── og-image-1200x630.png            # Open Graph for link previews
│   └── og-image-1200x630-dark.png       # Dark variant
│
└── social/                              # Social profile pictures
    ├── profile-{400,1024}-white.png     # Orange mark on white
    ├── profile-{400,1024}-black.png     # Orange mark on black
    └── profile-{400,1024}-orange.png    # White mark on orange
```

---

## When You Need Something New

If a new format or context isn't covered here, generate it from `master/griit-logo-orange-transparent.svg` (or whichever color/background variant fits) by exporting at the target resolution. Never start from a PNG — always from the SVG. The SVG is math, the PNG is pixels, and only one of them stays sharp.

---

## Decision Log

The current mark was selected after four iterations:
1. **Equal bars, no dots** — rejected (read as a pause icon)
2. **Unequal-height bars with chunky dots** — rejected (read as two human figures)
3. **Equal-height slim bars with dots** — close, but bars too thin
4. **Equal-height heavier bars (4.86:1) with matched-width dots** — locked

The "two equal i's" form was preferred over asymmetric "growing streak" variations because it reads as a clean wordmark fragment rather than a chart, and because the meaning ("the double-I in GRIIT") is sharper and more defensible than "consistency compounds."
