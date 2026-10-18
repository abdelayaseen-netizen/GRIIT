# GRIIT build 92 · Part 0 · Liquid Glass foundation

Prototype: `atlas/GRIIT b92 Part 0 Glass.dc.html` (frames P0-01 to P0-14, tokens, states). Revision 2 after the 8/10 review.

## Revision 2
- Create (tab and the shrunk bar's + Create) opens a chooser: "Log today's task" / "Create a challenge". It never opens a post sheet; posts only come from finishing a task.
- Tab icons: the Lucide icons the app ships, as template images in native tabs; SF Symbol mapping as the fallback (below).
- Reduce Motion: no shrink; the bar stays at full size.
- The solid fallback is the default path until native tabs and glass are confirmed on an Expo SDK 54 + iOS 26 build.
- Toast "Share" opens the sticker carousel (Part 1.3).

## What changed and why
- iOS 26 Liquid Glass on floating chrome only: tab bar, top bars on scrolling screens, bottom sheets, the floating action bar, toasts. It makes GRIIT feel native on iOS 26 without touching content.
- Content stays solid ink: proof photos, feed cards, the streak card, text. Photos stay true and glass never sits on glass.
- The orange accent on glass is limited to the active tab icon. Labels on glass are Text 1. The primary button is a solid #BB471D fill, never glass, so its contrast never depends on what's behind it.
- Fallback for iOS < 26 and Reduce Transparency: solid #1A1A1A with a 1 px #2A2A2A hairline.
- Tab bar: native tabs, 5 items (Home, Discover, Create, Activity, Profile), shrinks on scroll down (not with Reduce Motion), and + Create stays reachable while it's shrunk.

## Tab icons
| Tab | Lucide (shipped) | SF Symbol if native tabs can't take images |
|---|---|---|
| Home | house | house |
| Discover | compass | safari |
| Create | circle-plus | plus.circle |
| Activity | flame (GRIIT flame SVG) | flame |
| Profile | user | person |
SF Symbols are used on the tab bar only; every other icon in the app stays Lucide.

## Tokens (src/ds/glass/tokens.ts)
| Token | Used on | Tint over ink | Blur | Saturation | Edge | Shadow |
|---|---|---|---|---|---|---|
| glass.chrome | tab bar, floating action bar, toast | rgba(28,28,30,.62) | 24 | 1.8 | top 0.5 pt white 28%, inner 0.5 pt white 10% | 0 10 30 black 45% |
| glass.dense | bottom sheets | rgba(22,22,24,.80) | 40 | 1.6 | top 0.5 pt white 22%, inner 0.5 pt white 8% | 0 −8 40 black 55% |
| glass.thin | top bars | rgba(28,28,30,.50) | 18 | 1.8 | bottom hairline white 10% | none |
| surface.fallback | all chrome, iOS < 26 / Reduce Transparency | #1A1A1A | – | – | 1 px #2A2A2A | sheets only |
| state.selected | tab pill, segmented | white 14% | | | | |
| state.pressed | glass controls | white 22%, scale 0.98 | | | | |
| state.disabled | any control | content 38% opacity, glass unchanged | | | | |

## Orange on glass (WCAG)
| Element | Colour | Contrast |
|---|---|---|
| Active tab icon | #DC5401 | worst case 3.1:1 (glass over a white photo), 4.3:1 over ink. Passes 3:1 for graphics |
| Active tab label | Text 1 #F2F0EB, 500 | 5.2:1 worst case, 15:1 over ink |
| Primary label | Text 1 on solid #BB471D | 4.6:1 always |
| Never | orange tint in glass, orange text on glass, orange pills | |

## Screens and states
| Frame | Component | Device | State |
|---|---|---|---|
| P0-01 | Tab bar | 16 Pro Max | expanded over the photo feed, Home selected |
| P0-02 | Tab bar | SE | shrunk on scroll down, + Create accessory inline (not shown with Reduce Motion) |
| P0-03 | Tab bar | SE | over the empty ink canvas (empty feed) |
| P0-04 | Top bar | 16 Pro Max | scrolled, glass in, title "Posts" |
| P0-05 | Bottom sheet | SE | post sheet, Friends default, over the feed |
| P0-06 | Bottom sheet | 16 Pro Max | join sheet, over ink |
| P0-07 | Floating action bar | SE | "Start today's task" over the challenge page |
| P0-08 | Floating action bar | 16 Pro Max | disabled + secondary, over ink |
| P0-09 | Toast | SE | success over the feed |
| P0-10 | Toast | 16 Pro Max | error, longest real text, over ink |
| P0-11 | Top bar + toast | SE | longest real text (long challenge name, 3-line toast) |
| P0-12 | Tab bar + toast | SE | fallback |
| P0-13 | Bottom sheet | 16 Pro Max | fallback, Only me selected |
| P0-14 | Create chooser | SE | from the Create tab or + Create |
| States panel | tab item, primary, glass secondary, segmented | – | default, pressed, selected, disabled, loading |

Loading for chrome: the bar is always shown; only the primary shows a spinner + "Posting". Glass components have no empty state of their own; P0-03, P0-06 and P0-08 show them over empty content.

## Copy table
| Where | String |
|---|---|
| Tab labels | Home · Discover · Create · Activity · Profile |
| Shrunk bar accessory | Create |
| Create chooser | Create · Log today's task · {task} · {challenge} · Day n of N · Create a challenge · Pick the tasks, the length and who can join. · (secured) Every task today is done. |
| Top bar | Posts |
| Post sheet title | Post your proof |
| Caption placeholder | Add a caption (optional) |
| Audience label | Who sees this |
| Audience options | Friends · Everyone · Only me |
| Audience lines | Your 12 friends see it in their feed. · Anyone on GRIIT can see it. · Only you can see it. It still counts for today. |
| Post buttons | Post to friends · Post to everyone · Save privately |
| Loading | Posting |
| Join sheet | Faith · 14 days · 512 people · Fajr on time · Pray Fajr before sunrise · Camera · 5:00–6:30 am · Standard · Miss a day and a freeze can hold it. · Join · Day 1 is today |
| Action bar | Start today's task · Join · Not now · Pick a challenge to continue. |
| Toasts | Morning run done. 2 left today. · This task's window closed at 6:30 am. It opens tomorrow. · Share (opens the sticker carousel) |
| Empty feed | Nothing here yet. · Follow people or join a challenge to fill your feed. |

## Engineering notes
- Native tabs: `expo-router/unstable-native-tabs` with `minimizeBehavior="onScrollDown"`; glass surfaces: `expo-glass-effect`. Verify both against the installed Expo SDK. If unavailable, use the fallback surface everywhere and ship the shapes.
- **Default path is the solid fallback.** Ship the #1A1A1A bar and surfaces unless native tabs and the glass effect both work on an Expo SDK 54 build running on iOS 26 (device check, not simulator). Glass is an upgrade switched on after that check.
- + while shrunk: use the tab bar bottom accessory, shown inline only, opening the Create chooser. If it can't be hidden in the expanded placement, keep it in both placements and drop the Create tab (decision for Yaseen).
- Reduce Motion: `minimizeBehavior='never'`.
- Tab icons: Lucide as template images via `Icon src`; if that doesn't render, `Icon sf` with the mapping above.
- DS_V3 `Button` needs a `variant="glass"` (white 8% fill, Text 1, 500). Primary stays as it ships (solid brand fill).
- Token names `DS_COLORS_V2.brand` / `textPrimary` and `DS_V3.type.*` are assumed from the v51 handoff; map them if they differ.

## Acceptance checklist
- [ ] Glass appears only on: tab bar, top bars of scrolling screens, bottom sheets, floating action bar, toasts.
- [ ] No glass on proof photos, feed cards, the streak card or text blocks.
- [ ] No glass sits on top of another glass surface.
- [ ] Tab bar has 5 tabs in order Home, Discover, Create, Activity, Profile, each with an SF Symbol and a label.
- [ ] Tapping Create opens the Create chooser ("Log today's task" / "Create a challenge") and the previously selected tab stays selected.
- [ ] Nothing in the Create path opens the post sheet; the post sheet only opens after Done on a task.
- [ ] "Create a challenge" opens the Create challenge flow; "Log today's task" opens the next open task, and is disabled with "Every task today is done." when today is secured.
- [ ] Scrolling down shrinks the tab bar; scrolling up or tapping it restores it.
- [ ] While the bar is shrunk, "+ Create" is visible and opens the Create chooser in one tap.
- [ ] With Reduce Motion on, the tab bar never shrinks and stays at full size.
- [ ] The Activity tab uses the GRIIT flame icon; its SF Symbol fallback is flame (not bell).
- [ ] Tab icons are the shipped Lucide icons; if SF Symbols are used, they match the mapping table and appear on the tab bar only.
- [ ] The active tab icon is #DC5401; the active tab label is Text 1; no other orange appears on glass.
- [ ] The primary button is a solid #BB471D fill on every glass surface, with a Text 1 label.
- [ ] Selected glass control = white 14% pill; pressed = white 22% + scale 0.98; disabled = 38% opacity.
- [ ] Top bar is transparent at scroll 0 and fully glass by 8 pt of scroll.
- [ ] Top bar titles are human names ("Posts", the challenge name), never a route.
- [ ] Long top bar titles ellipsize on one line; the subtitle sits underneath.
- [ ] Post headers keep the time on the right on one line; it never wraps into the title.
- [ ] The post sheet asks "Who sees this" once, Friends selected by default, and the button names the choice.
- [ ] Sheets dim the screen with black 35% and close on a tap outside or swipe down.
- [ ] A toast "Share" action opens the sticker carousel.
- [ ] Toasts sit 70 pt above the tab bar, last 4 s, wrap up to 3 lines, and are announced to VoiceOver.
- [ ] Error toasts give the real reason and offer no Retry unless a retry can work.
- [ ] Lists under floating chrome have enough bottom inset that the last item scrolls fully clear.
- [ ] On iOS < 26, and with Reduce Transparency on, every glass surface renders #1A1A1A with a 1 px #2A2A2A hairline.
- [ ] If native tabs or the glass effect don't work on the Expo SDK 54 + iOS 26 build, the app ships the solid fallback bar and surfaces, with the same 5 tabs, icons and states.
- [ ] Every interactive element has an accessibility label and role, and is at least 44 pt.
- [ ] Layout holds on iPhone SE (375 pt, no home indicator) and iPhone 16 Pro Max (440 pt).
