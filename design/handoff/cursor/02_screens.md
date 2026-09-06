# Screens, in chunk order

Chunk C: Home, Profile, Settings. Chunk D: Discover, Activity Notifications, Activity Leaderboard.
Chunk E: Welcome, Capture, Secured, Self reported, Complete, Share card export. Chunk F: Create step
1, FeedPost variants, Loading, Error.

Every gap is in points and comes from `space`. Every component reference is the component in
`01_components.md`. Copy tables are literal: do not paraphrase, do not add punctuation, do not add an
exclamation mark.

## Home

**Chunk** C

**Tree**
1. RootHeader kicker="Sunday" title={displayName} actions={[IconButton bell]}
2. View gutter 20: Text secondary "Current streak"; Row [DisplayNumber size="home" value={streak}, Text body textSecondary "days"]; Text secondary {streakLine}
3. Card: Row [View [Text heading "Today's proof", Text secondary {challenge} " · Day " {day}], View chip {proofCount}]; Row [circle 24 ground border, Text bodyStrong {taskText}, Text caption "Photo"]; then either Button primary "Post your first proof" or the done row
4. WeekStrip days={week} todayIndex={6}
5. Row: [Row [snowflake 16 brand, Text caption "1 freeze left"], Row [medal 16 brand, Text caption "First badge · 0%"]]
6. Row: [Text heading "Feed", Row [Chip ghost "Friends", Chip ghost "Everyone"]]
7. Text caption {awayLine}
8. FlatList of FeedPost, paddingBottom 120
9. TabBar active="home"

**Vertical rhythm from the status bar down** 8 to the kicker, 16 to the streak block, 20 to the proof card, 20 to the week strip, 4 to the meta row, 32 to the Feed heading, 12 to the away line, 12 to the first post, 12 between posts, 120 to clear the tab bar.

**Display face** yes: the streak number; "Day 1" inside each post meta. no: "Sunday", "days", the proof count chip, "1 freeze left", "First badge · 0%", timestamps.

**States**
- empty: streak 0, streakLine "Post today to start.", proofCount "0 / 1", CTA "Post your first proof", today square empty, no own post in the feed
- after first proof: streak 1, streakLine "Day secured.", proofCount "1 / 1", the CTA is replaced by the done row, today square filled brand, own post first in the feed with the Stamp
- joined a new challenge: {challenge} is the joined title, day resets to 1, proofCount "0 / 1"
- feed scope Friends: only followed accounts, no own post filtering
- loading: three Skeletons in place of the streak block, the proof card and the first post
- error: EmptyState heading "Feed did not load", body "Check your connection and try again.", action "Retry"

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Current streak | secondary |
| days | body textSecondary |
| Post today to start. | secondary |
| Day secured. | secondary |
| Today's proof | heading |
| 0 / 1 | caption brandText on brandTint |
| Drink water and post a photo | bodyStrong |
| Photo | caption |
| Post your first proof | bodyStrong on brand |
| Posted today | bodyStrong brandText on brandTint |
| 1 freeze left | caption |
| First badge · 0% | caption |
| Feed | heading |
| Friends | chip |
| Everyone | chip |
| Three friends posted while you were away. | caption |
| Feed did not load | heading |
| Check your connection and try again. | secondary |
| Retry | bodyStrong on brand |

**Laws most at risk** 6 (one brand fill: the CTA, and it becomes a brandTint row once posted), 21 (the streak block, the week strip, the meta row and the away line are on the canvas), 23 (ghost chips, no segmented control), 25 (the number is the hero).

## Profile, own

**Chunk** C

**Tree**
1. RootHeader title={displayName} actions={[IconButton share-2, IconButton settings]}
2. Row gutter 20: [Avatar 96, View [Text secondary "@"+username, Row [Text caption {followers}+" followers", Text caption {following}+" following"]]]
3. Button tertiary {bioPrompt} aligned left, 44
4. Row gap 12: [Button secondary "Edit profile" flex 1, Button secondary "Invite friends" flex 1]
5. Card: Text label "Current streak" and Text caption "Best "+{best} on one row; Row [DisplayNumber home, Text body textSecondary "days"]; Text secondary {streakLine}
6. Card: Text label "Consistency"; Text title {consistency}; Text secondary {consistencySub}; Button tertiary "See the full record"
7. SegmentedControl items={["Challenges","Proofs","Badges"]}
8. tab content: EmptyState, or a 3 column ProofImage thumb grid, or Badges
9. Text caption "Five marks, each earned by verified days only. Nothing here can be bought or awarded."
10. TabBar active="profile"

**Vertical rhythm from the status bar down** 8 to the title, 20 to the identity row, 16 to the bio prompt, 8 to the button row, 20 to the streak card, 12 to the Consistency card, 32 to the segmented control, 12 to the tab content, 20 to the footnote, 120 to clear the tab bar.

**Display face** yes: the streak number; the number inside "Best 1 day"; the verified day counts on badge captions. no: follower and following counts, the handle, the footnote.

**States**
- no display name: Avatar shows the person glyph, header title is the username
- streak 0: "Best 0 days", streakLine "Post today to start.", consistency "No due days", consistencySub "Join a challenge and the strip starts filling."
- streak 1: "Best 1 day", streakLine "Day secured.", consistency "1 of 30 days", consistencySub "Post every day. Missed days count."
- Challenges tab, none: heading "No active challenge", body "Start one from Discover. Day 1 begins the morning after you join."
- Challenges tab, joined: heading {challenge}, body "Day 1 of 30. Post today to keep it."
- Proofs tab, none: heading "No proofs yet", body "Join a challenge and every verified day lands here as a photo."
- Proofs tab, populated: 3 column thumb grid, gap 12, newest first
- Badges tab: five marks, first earned after the first proof

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| @user_092d2dad | secondary |
| 0 followers | caption |
| 0 following | caption |
| Add a line about what you are building | bodyStrong brandText |
| Edit profile | bodyStrong |
| Invite friends | bodyStrong |
| Current streak | label |
| Best 0 days | caption |
| Best 1 day | caption |
| No due days | title |
| 1 of 30 days | title |
| Join a challenge and the strip starts filling. | secondary |
| Post every day. Missed days count. | secondary |
| See the full record | bodyStrong brandText |
| No proofs yet | heading |
| Join a challenge and every verified day lands here as a photo. | secondary |
| No active challenge | heading |
| Start one from Discover. Day 1 begins the morning after you join. | secondary |
| Five marks, each earned by verified days only. Nothing here can be bought or awarded. | caption |

**Laws most at risk** 7 (the streak card is surface, not black), 11 ("Best 1 day", no middle dot, Day format), 21 (empty states on the canvas), 22 (the tertiary inside the Consistency card, never an outlined button), 23 (the segmented control sits under the hero).

## Settings

**Chunk** C

**Tree**
1. PushedHeader title="Settings" onBack
2. Card, dividers between rows: ListRow x5 (Account, Notifications, Privacy, Subscription, About), each with a chevron
3. Button secondary "Sign out"
4. Button tertiary destructive "Delete account"
5. Text caption centered "GRIIT 1.0.0"

**Vertical rhythm from the status bar down** 44 header, 20 to the card, 32 to Sign out, 12 to Delete account, 32 to the version.

**Display face** yes: nothing. no: every string on this screen.

**States**
- default: as listed
- a row pushes its own screen with a PushedHeader and the same card recipe
- Delete account opens a confirm sheet, not a toast

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Settings | bodyStrong |
| Account | bodyStrong |
| Signed in with email | secondary |
| Notifications | bodyStrong |
| Daily reminder at 9:00 | secondary |
| Privacy | bodyStrong |
| Profile public · activity public | secondary |
| Subscription | bodyStrong |
| Free plan · 1 streak freeze a month | secondary |
| About | bodyStrong |
| Version, terms, privacy policy, contact | secondary |
| Sign out | bodyStrong |
| Delete account | bodyStrong danger |
| GRIIT 1.0.0 | caption |

**Laws most at risk** 5 (radius 20, not 28), 9 (one card, dividers, no per row card), 11 (no "· —" placeholder).

## Discover

**Chunk** D

**Tree**
1. RootHeader title="Discover"
2. horizontal Chip ghost row: For you, Trending, Body, Mind
3. ChallengeCard featured with Start
4. View [Text heading "Popular with your circle", Text caption "What the people you follow started this week."]
5. two column ChallengeCard grid, gutter 12
6. Text heading "People"; horizontal PersonCard strip
7. View [Text heading "Have your own idea?", Text secondary, Button secondary "Build your own"]
8. TabBar active="discover"

**Vertical rhythm from the status bar down** 8 to the title, 20 to the chip row, 20 to the featured card, 32 to the section heading, 12 to the grid, 32 to People, 12 to the strip, 32 to the idea prompt, 120 to clear the tab bar.

**Display face** yes: nothing on this screen. no: "14 days · Easy", every title, every name.

**States**
- chip change: the featured card and both grid cards swap; the People strip does not change
- no cover: the ChallengeCard renders the canvas fallback with the title
- loading: featured Skeleton plus two grid Skeletons
- error: EmptyState heading "Challenges did not load", body "Check your connection and try again.", action "Retry"
- already joined: the featured Start reads "Joined" as a secondary and is not tappable

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Discover | display |
| For you | chip |
| Trending | chip |
| Body | chip |
| Mind | chip |
| Start | bodyStrong on brand |
| 7 days · photo proof | caption on scrim |
| Popular with your circle | heading |
| What the people you follow started this week. | caption |
| 14 days · Easy | caption |
| People | heading |
| New here | caption |
| Follow | bodyStrong |
| Have your own idea? | heading |
| Create a custom challenge and invite others to join. | secondary |
| Build your own | bodyStrong |
| Challenges did not load | heading |
| Check your connection and try again. | secondary |
| Retry | bodyStrong on brand |

**Laws most at risk** 6 (exactly one brand fill: the featured Start; Follow is secondary because it repeats), 9 (no placeholder tiles), 13 (every cover 4:5), 21 (the people strip and the idea prompt have no cards), 25 (the featured cover is the hero).

## Activity, Notifications

**Chunk** D

**Tree**
1. RootHeader title="Activity"
2. SegmentedControl items={["Notifications","Leaderboard"]}
3. EmptyState or a list of notification rows
4. TabBar active="activity"

**Vertical rhythm from the status bar down** 8 to the title, 20 to the segmented control, 64 to the empty state, or 12 to the first row.

**Display face** yes: the day number inside a notification string. no: timestamps.

**States**
- empty: EmptyState heading "No notifications yet", body "Join a challenge and updates from your circle land here.", action "Find a challenge" going to Discover
- populated: rows of Avatar 40, bodyStrong line, caption timestamp, no card, dividers

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Activity | display |
| Notifications | segmented |
| Leaderboard | segmented |
| No notifications yet | heading |
| Join a challenge and updates from your circle land here. | secondary |
| Find a challenge | bodyStrong on brand |
| Abdel liked your day 1 proof | bodyStrong |
| now | caption |

**Laws most at risk** 2 (the empty title is 20/500, never 700), 10 (the one empty state), 21 (rows on the canvas).

## Activity, Leaderboard

**Chunk** D

**Tree**
1. RootHeader title="Activity"
2. SegmentedControl items={["Notifications","Leaderboard"]}
3. View [Text heading "This week", Text caption "Rankings reset every Monday. Post daily to climb."]
4. Chip ghost row: Global, Friends, Challenges
5. ListRow list on the canvas with dividers, the viewer row highlighted
6. TabBar active="activity"

**Vertical rhythm from the status bar down** 8 to the title, 20 to the segmented control, 32 to the This week heading, 12 to the chip row, 12 to the first row, 120 to clear the tab bar.

**Display face** yes: rank, check in count, day count, points. no: nothing else.

**States**
- scope change: the list swaps, the heading and caption do not
- viewer in range: their row is brandTint at radius 12
- viewer out of range: their row is pinned at the bottom of the list with a divider above it
- empty: EmptyState heading "No ranking yet", body "Post a verified day to enter the board.", action "Find a challenge"

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| This week | heading |
| Rankings reset every Monday. Post daily to climb. | caption |
| Global | chip |
| Friends | chip |
| Challenges | chip |
| 7 check ins · 7 days | caption |
| pts | caption |
| No ranking yet | heading |
| Post a verified day to enter the board. | secondary |

**Laws most at risk** 6 (no fills at all on this screen), 21 (no card around the list), 23 (chips under a heading, not under the segmented control), 24 (the hint is a caption, not a HintBox).

## Welcome

**Chunk** E

**Tree**
1. View ground canvas
2. two brand bars, 10 x 32 and 10 x 22, radius 4, gap 8, top left at the gutter
3. centered block: Text 44pt Barlow "Discipline,\nwitnessed."; Text secondary textSecondary
4. footer pinned bottom 20: Button primary "Start"; Button tertiary "Log in" with a textPrimary label

**Vertical rhythm from the status bar down** 8 to the logo, the copy block is vertically centered, footer pinned 20 above the safe area.

**Display face** yes: "Discipline, witnessed." is the one non number use of the display face, approved for this screen only. no: the sub line and both buttons.

**States**
- first open only; after the first successful auth the app opens on Home
- "Log in" navigates to /auth/login (Onboarding v2 owns it)

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Discipline, | 44pt Barlow Condensed 600 |
| witnessed. | 44pt Barlow Condensed 600 |
| Photo proof. Daily. No way to fake it. | secondary textSecondary |
| Start | bodyStrong on brand |
| Log in | bodyStrong textPrimary |

**Laws most at risk** 2 (the display face on a headline is permitted here and nowhere else, record it in the PR), 6 (one fill), 25 (the line is the hero).

## Capture

**Chunk** E

**Tree**
1. View ground canvas, status bar light
2. Row: Button tertiary "Cancel" textPrimary at 44; flip glyph 44
3. View gutter: Text bodyStrong {challenge}; Text secondary textSecondary {task}
4. CameraView 4:5, radius 20, gutters 20
5. shutter 72 circle textPrimary, centered

**Vertical rhythm from the status bar down** 44 status area, 44 control row, 20 to the challenge block, 20 to the viewfinder, 20 to the shutter.

**Display face** yes: the day number inside the task line. no: the challenge title, "Cancel".

**States**
- permission not granted: EmptyState heading "Camera access is off", body "Turn it on in Settings to post proof.", action "Open Settings"
- shutter pressed: the button shows nothing, the app navigates to Secured and starts the count up
- upload failure: stay on Secured, show EmptyState heading "Proof did not upload"

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Cancel | bodyStrong textPrimary |
| Drink Water Today | bodyStrong |
| Drink water and post a photo. Day 23. | secondary textSecondary |
| Camera access is off | heading |
| Turn it on in Settings to post proof. | secondary |
| Open Settings | bodyStrong on brand |

**Laws most at risk** 7 (full bleed canvas is this screen and the other moments only), 20 (44 on Cancel and flip, 72 on the shutter), 24 (nothing else on the screen).

## Secured and Self reported

**Chunk** E

**Tree**
1. View ground canvas
2. DisplayNumber moment 96 counting
3. Text bodyStrong {copy}
4. ProofImage feed with the Stamp on the scrim (secured only)
5. footer pinned bottom 20: WeekStrip; Button primary "Share" (secured only); Button tertiary "Done" textPrimary

**Vertical rhythm from the status bar down** 44 status area, 12 to the number, 4 to the copy, 20 to the proof, footer pinned 20 above the safe area with 8 between its children.

**Display face** yes: the streak number; the day number in the copy line. no: "Share", "Done".

**States**
- secured: number counts streak to streak + 1 over 400ms, the Stamp mounts at 400ms, today square fills brand over the same 400ms, one success haptic
- self reported: no count, no Stamp, today square stays outlined, only Done
- Reduce Motion: final number, filled square, Stamp present, no haptic

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Day 23. Verified. | bodyStrong |
| Day 23. Self reported. | bodyStrong |
| Share | bodyStrong on brand |
| Done | bodyStrong textPrimary |

**Laws most at risk** 6 (Share is the one fill), 19 (this is the only 400ms moment), 11 (a period, never an exclamation mark).

## Complete

**Chunk** E

**Tree**
1. View ground canvas
2. DisplayNumber moment 96 value={target}
3. Text bodyStrong "30 days. Every one witnessed."
4. ContactSheet proofs={all} revealedRows={n}
5. Stamp label="Complete" centered
6. footer pinned bottom 20: Button primary "Start the next one"; Row [Button secondary "Share" flex 1, Button tertiary "Done" flex 1]

**Vertical rhythm from the status bar down** 44 status area, 12 to the number, 4 to the copy, 20 to the grid, 20 to the stamp, footer pinned 20 above the safe area.

**Display face** yes: the target number. no: the copy line, all three buttons, the stamp.

**States**
- entry: rows 1 to 5 reveal at 120ms intervals, stamp at 640ms, one success haptic
- self reported days inside the grid render at opacity 0.4
- a challenge with fewer than 30 days renders the same 6 column grid with the rows it has, no filler cells
- "Start the next one" navigates to Discover and clears the active challenge

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| 30 days. Every one witnessed. | bodyStrong |
| Complete | stamp |
| Start the next one | bodyStrong on brand |
| Share | bodyStrong |
| Done | bodyStrong brandText |

**Laws most at risk** 19 (the second and last moment), 25 (the grid is the hero), 6 (one fill: the next challenge).

## Share card export

**Chunk** E

**Tree**
1. offscreen View 360 x 640, ground canvas
2. DisplayNumber share 220
3. Text 44/56 bodyStrong {copy}
4. ProofImage or ContactSheet
5. Stamp at export scale
6. logo row

**Vertical rhythm from the status bar down** story: 250 inset, number, 16 to the copy, 24 to the proof, 24 to the stamp, flex spacer, logo, 250 inset. feed: 60 inset instead of 250.

**Display face** yes: the number. no: the copy line.

**States**
- daily: single proof, label "Verified"
- complete: contact sheet, label "Complete", copy "30 days. Every one witnessed."

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Day 23. Verified. | 44/56 bodyStrong |
| 30 days. Every one witnessed. | 44/56 bodyStrong |
| GRIIT | 56/64 500 |

**Laws most at risk** 13 (the proof stays 4:5, so the width flexes to 720 story and 560 feed), 5 (radius 60 and 24 are 20 and 12 at export scale).

## Create step 1

**Chunk** F

**Tree**
1. WizardHeader step={1}
2. Text title "Name your challenge"; Text secondary "One sentence. Be specific."
3. TextInput in a 12 radius surface box, 1pt border, padding 16, with a caption row "Min 3 characters" and a right aligned "0/60"
4. Text caption examples line
5. Text heading "How long?"; 3 x 2 form Chip grid, gutter 12
6. Text heading "Solo or with friends?"; two form Chips with a glyph, title and caption
7. HintBox
8. footer pinned: Button primary "Continue"

**Vertical rhythm from the status bar down** 44 status area, 44 wizard bar, 8 to the progress bar, 32 to the title, 20 to the input, 32 to How long, 12 to the chips, 32 to Solo or with friends, 12 to the chips, 20 to the HintBox, footer pinned above the home indicator.

**Display face** yes: nothing: the step number, the durations and the character count are not earned. no: everything.

**States**
- name under 3 characters: Continue disabled at opacity 0.4, caption "Min 3 characters" in textSecondary
- over 60: input border 1.5pt danger, caption "60 character limit" in danger
- Custom selected: a number field appears in place of the chip grid

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Step 1 of 3 | bodyStrong |
| Cancel | bodyStrong brandText |
| Name your challenge | title |
| One sentence. Be specific. | secondary |
| Read 30 min before phone | body textSecondary as the placeholder |
| Min 3 characters | caption |
| 0/60 | caption |
| Examples: read 30 min before phone · workout 5x weekly · 30 days no alcohol | caption |
| How long? | heading |
| 7 days | chip |
| 14 days | chip |
| 21 days | chip |
| 30 days | chip |
| 75 days | chip |
| Custom | chip |
| Solo or with friends? | heading |
| Solo | bodyStrong brandText when selected |
| Just you | caption |
| Group | bodyStrong |
| Up to 10 | caption |
| 30 days is the sweet spot. Build the habit, prove you can. | secondary brandText |
| Continue | bodyStrong on brand |

**Laws most at risk** 8 (no tab bar, CTA pinned), 5 (chips at 12), 24 (HintBox is allowed here and only here), 6 (Continue is the one fill).

## FeedPost variants

**Chunk** F

**Tree**
1. photo: Card [header, ProofImage feed with scrim, title and caption over it, Stamp when verified, action row]
2. noPhoto: Card [Avatar 40, bodyStrong summary line, caption meta]
3. finished: Card tint [header, body summary, action row]

**Vertical rhythm from the status bar down** inside a card: 12 between the header, the media and the action row.

**Display face** yes: the day number in the meta and in the summary. no: the author name, the timestamp, the challenge title.

**States**
- liked: heart glyph brandText, count not shown
- self reported: no Stamp on any variant
- missing proof: canvas fallback with the title, never a gray tile

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| 10h · Day 1 · Drink Water Today | caption |
| Yaseen secured day 4 | bodyStrong |
| 14h · Read Something | caption |
| Finished. 7 of 7 days verified. | body |

**Laws most at risk** 7 (noPhoto is surface, not black), 14 (scrim under any text on an image), 20 (44 per action glyph).

## Loading and error

**Chunk** F

**Tree**
1. loading: Skeleton in place of each block, in the card recipe
2. error: EmptyState with a retry

**Vertical rhythm from the status bar down** same rhythm as the populated screen: skeletons occupy the same slots.

**Display face** yes: nothing. no: everything.

**States**
- Home loading: three skeletons, plus a blurhash frame for the first post media
- Discover loading: one featured skeleton and two grid skeletons
- any error: EmptyState, heading names what failed, body says what to do, one primary "Retry"
- never a spinner over content, never a red banner, never a toast for anything that needs action

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Feed did not load | heading |
| Challenges did not load | heading |
| Proof did not upload | heading |
| Check your connection and try again. | secondary |
| Retry | bodyStrong on brand |

**Laws most at risk** 17 (skeletons in the card recipe, spinners only inside a submitting button), 18 (errors reuse the empty state).
