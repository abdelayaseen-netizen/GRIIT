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

# Create wizard. Six surfaces.

Replaces the Create step 1 section above. Source: `src/components/create/`.

## Create, step 1

**Chunk** F

**Tree**
1. WizardHeader step={1} onCancel
2. Text title "Name your challenge"; Text secondary
3. Card with TextInput body, helper caption left, counter caption right
4. Text caption examples line
5. Text heading "How long?"; 6 ghost Chips in a 3 column grid, gutter 12
6. Text heading "Solo or with friends?"; two Cards in a 2 column grid, each glyph 24, title bodyStrong, descriptor caption; selected card 1.5pt brand border
7. HintBox with the lightbulb glyph
8. WizardFooter with primary Continue

**Vertical rhythm from the status bar down** 44 status area, 44 wizard bar, 8 progress bar, 32 title, 20 field, 32 How long, 12 chips, 32 Solo or with friends, 12 cards, 20 HintBox, 140 to clear the pinned footer.

**Display face** yes: nothing. no: the step number, every duration, the character count.

**States**
- name under 3 characters: helper "Min 3 characters" in textSecondary, Continue disabled as surface fill with a textSecondary label
- name valid: helper "Looks good" in brandText, Continue enabled
- over 60 characters: input border 1.5pt danger, helper "60 character limit" in danger
- Custom duration selected: a number field replaces the chip grid
- Group selected: the Group card takes the brand border and Solo loses it

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Name your challenge | title |
| One sentence. Be specific. | secondary |
| Read 30 min before phone | body textSecondary placeholder |
| Min 3 characters | caption |
| Looks good | caption brandText |
| 16/60 | caption |
| Examples: read 30 min before phone · workout 5x weekly · 30 days no alcohol | caption |
| How long? | heading |
| 7 days | chip |
| 14 days | chip |
| 21 days | chip |
| 30 days | chip |
| 75 days | chip |
| Custom | chip |
| Solo or with friends? | heading |
| Solo | bodyStrong |
| Just you | caption |
| Group | bodyStrong |
| Up to 10 | caption |
| 30 days is the sweet spot. Build the habit, prove you can. | secondary brandText |
| Continue | bodyStrong onBrand |

**Laws most at risk** 3 (the descriptor is caption sentence case, never the label style), 6 (Continue is the one fill), 8 (no tab bar, CTA pinned), 23 (chips for duration, cards only where a description is needed), 24 (one HintBox).

## Create, step 2

**Chunk** F

**Tree**
1. WizardHeader step={2} onCancel={back}
2. Text title "What must get done daily?"; Text secondary
3. SegmentedControl items={["Starter packs","Custom"]}
4. Starter packs: five rows on the canvas, glyph 24 with no tile, title bodyStrong, meta caption, 1pt dividers; selected row brandTint at radius 12 with the contents inline beneath at 56pt indent
5. Custom: task rows with a trailing tertiary Edit, then a secondary Button "Add a task"
6. WizardFooter with primary Continue

**Vertical rhythm from the status bar down** 44 status area, 44 wizard bar, 8 progress bar, 32 title, 20 segmented control, 12 first row, 20 per row, 140 to clear the pinned footer.

**Display face** yes: nothing. no: the task counts in the row meta.

**States**
- no pack selected: five rows with dividers, Continue enabled only in Custom mode with at least one task
- pack selected: that row is brandTint, its divider is dropped, and three caption lines appear under it
- Custom with no tasks: EmptyState heading "No tasks yet", body "Add at least one task to continue.", action "Add a task"
- Custom with tasks: rows plus the secondary Add a task

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| What must get done daily? | title |
| Pick a starter pack or build from scratch. | secondary |
| Starter packs | segmented |
| Custom | segmented |
| 75 Hard Classic | bodyStrong |
| 5 strict tasks · original framework | caption |
| Athlete | bodyStrong |
| 3 tasks · run, train, check in | caption |
| Faith | bodyStrong |
| 3 tasks · prayer, read, gratitude | caption |
| Morning routine | bodyStrong |
| 5 tasks · win the morning | caption |
| Entrepreneur | bodyStrong |
| 3 tasks · ship, journal, learn | caption |
| Run 3 km | caption |
| Strength session, 30 min | caption |
| Gym check in | caption |
| Add a task | bodyStrong |
| Edit | bodyStrong brandText |
| No tasks yet | heading |
| Add at least one task to continue. | secondary |

**Laws most at risk** 9 and 22 (rows on the canvas, no card and no icon tile, so no box in a box), 21 (a list is not one unit), 23 (one segmented control and no chips under it), 3 (no uppercase summary label).

## Add task sheet

**Chunk** F

**Tree**
1. dimmed step 2 behind at opacity 0.35
2. sheet on surface, radius 20 top corners, 1pt top border, grabber 36 x 4
3. row: Cancel tertiary, "Add task" bodyStrong, Save tertiary (textSecondary until valid)
4. Text heading "Task name"; TextInput in a canvas box, 1pt border, radius 12
5. Text heading "Proof type"; six ghost Chips in a wrapping row, each with a leading glyph 24
6. Text secondary: the description of the selected type, one full sentence
7. tertiary Button "4 more types"
8. row: glyph 24, "Verified proof" bodyStrong, secondary explanation, trailing switch
9. pinned primary "Add task"

**Vertical rhythm from the status bar down** 44 status area, sheet top at 140, 8 grabber, 44 header row, 20 Task name, 12 field, 32 Proof type, 12 chips, 12 description, 20 Verified proof, footer pinned at 20 with 32 bottom inset.

**Display face** yes: nothing. no: every type name, the task name.

**States**
- name empty: Save and the primary are disabled with a textSecondary label
- name valid: both enabled
- type change: only the description line changes
- "4 more types" tapped: four more chips join the same wrapping row and the button is removed
- verified on: switch ground brand, knob textPrimary

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Add task | bodyStrong |
| Cancel | bodyStrong brandText |
| Save | bodyStrong brandText |
| Task name | heading |
| Morning run, Read 10 pages | body textSecondary placeholder |
| Proof type | heading |
| Check off | chip |
| Photo | chip |
| Timer | chip |
| Text | chip |
| Run | chip |
| Counter | chip |
| Tap to confirm the task is done, with no proof attached. | secondary |
| A photo taken in the app completes the day. | secondary |
| A countdown runs in the app and the day counts when it reaches zero. | secondary |
| A short written note completes the day. | secondary |
| Run records distance and time from the phone, and the day counts only when both are recorded. | secondary |
| Count up to a daily target and the day counts when the target is met. | secondary |
| 4 more types | bodyStrong brandText |
| Verified proof | bodyStrong |
| Requires a photo taken in the app to complete this task each day. | secondary |

**Laws most at risk** 3 (headings in sentence case, no uppercase section labels), 11 (nothing truncates: one full sentence per selected type), 21 (Verified proof is a row on the sheet ground, not a card), 6 (one fill: Add task).

## Create, step 3

**Chunk** F

**Tree**
1. WizardHeader step={3} onCancel={back}
2. Text title "How strict?"; Text secondary
3. two Cards stacked: glyph 24 plus title bodyStrong, caption, one secondary consequence line; selected 1.5pt brand border
4. Text heading "Public proof on feed"; three ghost Chips
5. Text caption research line
6. Text heading "Category"; four ghost Chips in a wrapping row
7. WizardFooter with primary Review

**Vertical rhythm from the status bar down** 44 status area, 44 wizard bar, 8 progress bar, 32 title, 20 first card, 12 between cards, 32 Public proof, 12 chips, 12 research caption, 32 Category, 12 chips, 140 to clear the pinned footer.

**Display face** yes: nothing. no: the percentages and the year in the research line.

**States**
- Standard selected by default
- Hard mode selected: the border moves, nothing else changes
- public proof Off: the research caption stays

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| How strict? | title |
| Pick your accountability level. | secondary |
| Standard | bodyStrong |
| Recommended for your first challenge | caption |
| Streak freezes on. Miss a day and you do not reset. | secondary |
| Hard mode | bodyStrong |
| 75 Hard style. No exceptions. | caption |
| No freezes. Miss a day, restart from day 1. | secondary |
| Public proof on feed | heading |
| Off | chip |
| Optional | chip |
| Required | chip |
| Public accountability lifted goal completion from 43% to 76% (Matthews, 2015). | caption |
| Category | heading |
| Fitness | chip |
| Mind | chip |
| Faith | chip |
| Discipline | chip |
| Review | bodyStrong onBrand |

**Laws most at risk** 23 (one selection language: cards where a description is required, ghost chips elsewhere), 24 (the research line is a caption, not a tinted band), 11 (no em dash), 6 (Review is the one fill).

## Review sheet

**Chunk** F

**Tree**
1. dimmed step 3 behind
2. sheet on surface with the grabber
3. row: "Review and launch" bodyStrong, close glyph in a 44 target
4. five rows on the sheet ground with dividers, each with a trailing tertiary Edit
5. error only: EmptyState in the error variant under the rows
6. pinned primary Launch

**Vertical rhythm from the status bar down** sheet top at 300 in the idle state and 200 in the error state, 8 grabber, 12 title row, 8 first row, 20 per row, footer pinned at 20 with 32 bottom inset.

**Display face** yes: nothing. no: every summary row.

**States**
- idle: rows plus primary "Launch"
- loading: nothing changes except the button, which reads "Launching" with the spinner inside it and is not tappable
- error: the rows stay and the empty state renders inside the sheet's scroll content above the pinned footer, with heading "Could not launch"; the sheet grows to contain it, the primary reads "Retry", and nothing renders below the pinned button
- never a raw error string, never a red banner, never a toast

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Review and launch | bodyStrong |
| Read for 30 min · 30 days | body |
| Solo | body |
| 3 tasks · Standard | body |
| Photo proof optional | body |
| Category fitness | body |
| Edit | bodyStrong brandText |
| Launch | bodyStrong onBrand |
| Launching | bodyStrong onBrand |
| Could not launch | heading |
| Check your connection and try again. | secondary |
| Retry | bodyStrong onBrand |

**Laws most at risk** 11 (no ampersands), 18 (the error reuses the empty state), 21 (rows on the sheet ground, no boxes), 17 (the spinner lives inside the button).

## Launched

**Chunk** F

**Tree**
1. View on canvas
2. Text title "You're in."
3. Text secondary "Day 1 begins tomorrow morning."
4. Text bodyStrong challenge name
5. group only: secondary Button "Invite friends"
6. primary Button "Back to Home"

**Vertical rhythm from the status bar down** 44 status area, then the heading block centered on the screen with 12 between its lines; footer pinned at 20 above the safe area with 8 between buttons.

**Display face** yes: nothing. no: all of it.

**States**
- solo: one primary
- group: one secondary above the primary, and that is the only difference
- no motion, no confetti, no celebration copy

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| You're in. | title |
| Day 1 begins tomorrow morning. | secondary |
| Read for 30 min | bodyStrong |
| Invite friends | bodyStrong |
| Back to Home | bodyStrong onBrand |

**Laws most at risk** 19 (nothing animates here), 6 (one fill), 25 (the line is the hero).

## Law 26 clearance, applied

| screen | scroll view bottom padding | verified |
|---|---|---|
| Home | `size.tabBarClearance` | last feed card clears the bar at the end of the scroll |
| Discover | `size.tabBarClearance` | the idea prompt button clears the bar |
| Activity, both tabs | `size.tabBarClearance` | the last leaderboard row clears the bar |
| Profile, all three tabs | `size.tabBarClearance` | the "Five marks" footnote and the badge grid clear the bar |
| Badges sheet | not applicable | no tab bar on this surface |
| Wizard, Capture, Secured, Complete, sheets | no clearance padding | the tab bar is hidden, so the button is pinned instead |

## Active challenge

**Chunk** G. Component `ActiveChallenge` in `src/components/ActiveChallenge.tsx`. No new tokens.

The screen a user sees inside a challenge they joined. It answers one question: what is left today,
and where am I in the run. It is a working screen. Everything on it is derived from a field: nothing
is shown that the API did not send.

**Data** `title`, `duration_days`, `current_day`, `difficulty`, `tasks[] {title, task_type,
duration_minutes | target_value + unit, require_photo, completed_today, verified, proof_photo_url}`,
`secured_today`, `streak_days`, `week_secured[7]`, `today_index`, `participants_count`,
`description`, `reset_notice`.

`secured_today` is a server field. It comes from `day_secures` via `getSecuredDateKeys` and is passed
in as a prop. It is never derived on the client from `tasks.every(completed_today)`. If the server says
unsecured and every row shows done, the status line still reads "5 of 5 done." and the footer stays the
primary button: the client does not award the day.

`week_secured[7]` comes from the same `getSecuredDateKeys` set, one entry per weekday, Monday first.

The Stamp binds to the completion row, not to the task definition. A done row earns it only when its
completion carries camera proof: `verified` true, or `proof_photo_url` non-null. `require_photo: true`
on the task alone does not earn a stamp, because it states what was asked, not what was returned.

`reset_notice` is not an API field today. It renders only when the backend exposes a reset event, either
a reset row on the challenge participant or `started_at` newer than `joined_at`. It is never inferred
from `current_day === 1`. Until that signal exists, the prop is always false and the card does not render.

**Tree**
1. Nav bar, one only: IconButton chevron-left, Text bodyStrong {title}, IconButton ellipsis
2. Position block, gutter 20: Row baseline [Text secondary "Day", DisplayNumber size="home" value={current_day}, Text body textSecondary "of " {duration_days}]
3. Status line, from the `secured_today` prop only, never from the task rows: secured -> Row [Text secondary brandText "Day secured.", Text secondary "All {n} done."]; otherwise Text secondary "{done} of {n} done. {left} {task|tasks} left." with "Nothing done today." when done is 0, and "{n} of {n} done." with no left clause when every row is done and the server has not secured the day
4. reset_notice only, and only on the real reset signal above: Card [rotate-ccw 24 textPrimary, Text bodyStrong "The run restarted", Text secondary "A day went unsecured. Hard mode has no freezes, so the count went back to Day 1 of 75."]
5. WeekStrip week={week_secured} todayIndex={today_index}: filled brand when secured, 1.5pt brand border on today, 1pt border otherwise
6. Meta row: [shield or shield-off 16 + Text caption difficulty line], [flame 16 + DisplayNumber inline {streak_days} + Text caption "day streak", or Text caption "No streak yet"]
7. Text heading "Today"
8. Task ListRows on the canvas with Dividers. Pending: icon by task_type 24 textSecondary, Text bodyStrong {title}, Text caption {gate}, trailing Text secondary brandText {verb}. Done: check 24 brandText, title textSecondary, Text caption {size only}, trailing Stamp when the completion has camera proof (`verified` or `proof_photo_url`) else Text caption "Self-reported". Read the completion, not `require_photo`: a photo task completed without a returned photo is a self-reported row
9. participants_count > 1 only: Divider then ListRow [users 24, Text bodyStrong "{n} in this challenge", chevron-right]
10. description non empty only: Text heading "About", Text secondary {description}
11. Spacer 140, then pinned footer above the safe area: primary Button "{verb} · {next.title}", or secondary Button "Share today's proof" when secured_today

**Vertical rhythm from the status bar down** 44 nav, 24 to the day number, 8 to the status line, 20 to the reset card when present, 24 to the week strip, 16 to the meta row, 32 to "Today", 16 top and bottom inside each task row, 32 to "About", 4 under each heading, 140 to clear the pinned footer. Footer is 20 above a 32 safe area, border-top 1pt.

**No tab bar on this screen**, so law 26 clearance does not apply and the pinned button is legal.

**Display face** yes: `current_day` at `numberSize.home`; `streak_days` at `numberSize.inline`; the Stamp wordmark. no: "Day", "of 75", the task counts, task titles, gates, verbs, the button label, "day streak".

**Gate strings, built in code, never typed**
| task_type | size part | proof part |
|---|---|---|
| timer, workout | "{duration_minutes} min timer" | "Photo required" or "Self-reported" |
| reading, water, counter | "{target_value} {unit}" | same |
| photo | none | "Photo required" |
| checkin, journal | none | same |

Done rows drop the proof part: the trailing element carries it, so nothing is said twice.

**Action verbs, by task_type** timer "Start timer" · workout "Log workout" · reading "Log pages" · water "Log water" · counter "Log count" · photo "Take photo" · checkin "Check in" · journal "Write entry". There is no generic "Start".

**States**
- Day 1, 0 of 5, standard, participants_count 1, no description: no social row, no About, "No streak yet", week strip empty with today outlined, footer "Start timer · Workout 1"
- Day 12, 3 of 5, participants_count 4, description present: two done rows whose completions returned a photo carry the Stamp, one done row with no photo reads "Self-reported", two pending, social row and About present, footer "Log water · Drink 1 gallon water"
- Day 12, 5 of 5, `secured_today` true from the server: status line brandText, today square filled and outlined, every row done, the Stamp on the three completions that returned a photo and on nothing else, footer is the secondary "Share today's proof" and there is no filled button on the screen
- 5 of 5 done, `secured_today` false: the status line reads "5 of 5 done.", the today square stays unfilled, and the footer stays primary on the last task. The client does not close the day
- Hard mode after a missed day, with a reset event from the backend: current_day back to 1, streak_days 0, week strip cleared, reset card under the status line, difficulty reads "Hard mode. No freezes."
- loading: Skeletons for the day number, the week strip and three task rows. Nav bar and title render immediately
- error: EmptyState heading "Challenge did not load", body "Check your connection and try again.", action "Retry"

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| Day | secondary textSecondary |
| of {duration_days} | body textSecondary |
| Nothing done today. {left} tasks left. | secondary textSecondary |
| {done} of {n} done. {left} tasks left. | secondary textSecondary |
| {n} of {n} done. | secondary textSecondary |
| Day secured. | secondary brandText medium |
| All {n} done. | secondary textSecondary |
| The run restarted | bodyStrong |
| A day went unsecured. Hard mode has no freezes, so the count went back to Day 1 of {duration_days}. | secondary textSecondary |
| Standard mode | caption textSecondary |
| Hard mode. No freezes. | caption textSecondary |
| No streak yet | caption textSecondary |
| day streak | caption textSecondary |
| Today | heading |
| {duration_minutes} min timer · Photo required | caption textSecondary |
| {target_value} {unit} · Self-reported | caption textSecondary |
| Self-reported | caption textSecondary |
| Start timer | secondary brandText medium |
| Log pages | secondary brandText medium |
| Log water | secondary brandText medium |
| Take photo | secondary brandText medium |
| {participants_count} in this challenge | bodyStrong |
| About | heading |
| {verb} · {next.title} | bodyStrong onBrand |
| Share today's proof | bodyStrong on surface |

**Cut from the current screen, and why**
| cut | why |
|---|---|
| green hero block | not in the palette; ten tokens, none of them green |
| duplicated header, title repeated under the nav bar | law 4, one header per screen |
| "0 in this challenge · Be the first to join" with five fake avatars | wrong for a member, and there is no avatar data |
| two 0% tiles | both read 0 on Day 1 and neither is a field |
| "timer · ~? min" | the type was shown and the gate was not |
| generic "Start ›" on every row | the verb now comes from task_type |
| "Continue Today" | it did not name what it continued |
| pill row 75 days / Day 1/75 / hard | duration is in "of 75", difficulty is in the meta row, and the format is "Day 1 of 75" |
| "Day resets at midnight" | not a field, and the week strip says it |

Every string above with a number in it is a template. Nothing in this table is a literal 5, a literal 75
or a literal 45: bind the count, the duration and the target from the fields.

**Laws most at risk** 1 (ink canvas), 2 and the Sept 6 amendment (the day and the streak are the only display numbers), 6 (one fill: the secured state has none), 7 and 9 (rows on the canvas, one card only for the reset notice), 18 (the stamp is camera proof only, read off the completion and never off `require_photo`).

## Challenge detail, not joined

**Chunk** I. Component `ChallengeDetail` in `src/components/ChallengeDetail.tsx`. No new tokens.
393 by 852.

What a user sees when they open a challenge they have not joined. It answers one question: can I
actually do this. The user has earned nothing here, so `displayFace` never appears on this screen and
the Verified stamp never appears on this screen.

**Data** `title`, `description` (may be empty), `duration_days`, `participation_type`
(solo | duo | team), `participants_count`, `tasks[] {title, task_type, gates[], time_window}`,
`state`, `active_count` and `free_limit` (free_limit state only), `ends_on` (ended only),
`starts_on` (not_live only), `is_hard_mode` (from `challenges.is_hard_mode`).

`is_hard_mode` is the creator's setting on the challenge and applies to everyone in it. Joiners do not
choose it, so the screen states it and never offers it. There is no mode prop and no mode handler.

`gates[]` holds only the three the app can enforce: `camera`, `time_window`, `location`. An empty
array is a self-reported task. There is no fourth gate and no derived gate.

**Tree**
1. Nav bar: IconButton chevron-left, IconButton ellipsis. No title, no share button: share arrives on join
2. Text title {title}, gutter 20, 10 below the nav
3. description non empty only: Text secondary {description}. Empty means the row does not exist
4. Facts chip row: "{duration_days} days", "{Solo|Duo|Team}", "{participants_count} people". Three chips, radius 12, surface, 1pt border. No difficulty chip: difficulty is the creator's opinion and the gate list is the truth, and it collided with "Hard" in the picker. No completion rate, no "joined today"
5. Text heading "What you'll post"
6. Task rows on the canvas with Dividers: icon by task_type 22 textSecondary, Text bodyStrong {title}, then the gate labels
7. One mode line directly under the task list, Text caption textSecondary, from `is_hard_mode`. Same line in every state: it is a fact about the challenge, not a join choice
8. Spacer 176, then the pinned footer

**Gate label** 12/16, radius 8, 1pt border, surface ground, 12px Lucide glyph, 3 by 8 padding.
Order is always camera, then time window, then location, whatever order the array arrives in.

| gates | labels |
|---|---|
| ['camera'] | Camera |
| ['time_window'] | Time window {time_window} |
| ['location'] | Location |
| all three | Camera · Time window {time_window} · Location |
| [] | Self-reported, in textSecondary |

The self-reported label sits in textSecondary: it is the absence of a gate, not a fourth one. The
location label prints the word Location and never the place name. Recorded decision, Sept 8 2026.
No label reads "Verified" on this screen: nothing has been submitted yet.

**Footer, by state**
| state | footer |
|---|---|
| default | primary Button "Join", then one caption line |
| free_limit | disabled Button "Join" (surface, 1pt border, textSecondary label), Text caption "You are in {active_count} challenges. Free accounts hold {free_limit} at a time.", then Text secondary brandText "Leave one, or upgrade" |
| ended | Text secondary "This challenge ended on {ends_on}." No Join |
| not_live | Text secondary "This challenge starts on {starts_on}." No Join |

**The caption under Join** is `participation_type` dependent: solo reads "Day 1 is today.", duo and
team read "Join opens the invite step. You need a partner before Day 1." Nothing else on the screen
changes with participation type. Never "begins tomorrow".

**Primary button** is `color.primary #BB471D` with a `textPrimary` label. `brand #DC5401` is accent
only here: the 1.5pt ring and the radio glyph on the selected mode card.

**Vertical rhythm from the status bar down** 44 status, 44 nav, 10 to the title, 6 to the description,
12 to the chip row, 18 to "What you'll post", 8 top and bottom inside each task row, 12 to the mode
line, 176 spacer.
Footer default and ended 16 above a 28 safe area; free_limit 14 above 24 because it carries three
lines. Measured clearance above the footer: default 40, free_limit 21, ended 310.

**Copy. Do not paraphrase.**

| string | style |
|---|---|
| {title} | title |
| {description} | secondary textSecondary |
| {duration_days} days | caption textPrimary in a chip |
| Solo / Duo / Team | caption textPrimary in a chip |
| {participants_count} people | caption textPrimary in a chip |
| What you'll post | heading |
| Camera | 12/16 textPrimary |
| Time window {time_window} | 12/16 textPrimary |
| Location | 12/16 textPrimary |
| Self-reported | 12/16 textSecondary |
| Hard mode. Gates are enforced; a failed gate fails the day. | caption textSecondary |
| Standard mode. Gates are recorded, not enforced. | caption textSecondary |
| Join | bodyStrong on primary |
| Day 1 is today. | caption textSecondary |
| Join opens the invite step. You need a partner before Day 1. | caption textSecondary |
| You are in {active_count} challenges. Free accounts hold {free_limit} at a time. | caption textSecondary |
| Leave one, or upgrade | secondary brandText medium |
| This challenge ended on {ends_on}. | secondary textSecondary |
| This challenge starts on {starts_on}. | secondary textSecondary |

Every string with a number is a template. No literal 3, no literal 30, no literal 12.

**Cut from the current screen, and why**
| cut | why |
|---|---|
| blue hero band | not in the palette |
| share button before joining | there is nothing to share |
| "9 warriors" | participants are "people", and the count is "{n} people" |
| "0 joined today" | computed from too little data to be honest |
| "about 1 joined today · 0% completion rate" | invented precision, and "about" is not a number the backend has |
| the two 0% tiles | neither is a field, and both read 0 |
| "1 days" | "{n} days", "1 day" |
| "Easy" chip | difficulty is the creator's opinion, and the gate list is the truth |
| "Commit to This Challenge" | the CTA is "Join" |
| "Day resets at midnight" | not a field. The line under Join states Day 1 instead |
| Daily Time "~5 min" | an estimate, not a gate |
| Category "Fitness" | not a decision input on this screen |
| the About row duplicating the description | one description, one row |
| the task row with "Tap to start and log proof" | pre-join, there is nothing to start |
| the Standard / Hard picker | mode is the creator's, set on the challenge and identical for everyone in it. Offering it at join implied a per participant setting that does not exist |

**Laws most at risk** 2 and the Sept 6 amendment (no display face: nothing here is earned), 6 (one
fill, the Join button), 7 and 9 (rows on the canvas, cards only for the two mode options), 18 (no
stamp on an unjoined challenge), 23 (there is no selection language on this screen at all now), 26 (no
tab bar, so the pinned footer is legal, and its clearance is reserved by a 176 spacer).

## Home, today's proof card

**Chunk** I. Component `TodayCard` in `src/components/HomeV3.tsx`. No new tokens. Frames 01 and 30.

The card used to show one task, the next undone one, which made the order the app's decision. It now
lists every required task across every active enrollment for today, one row each, so the user chooses
what to do first.

**Data** `enrollments[] {challenge_id, challenge_name, tasks[] {id, name, gates[], time_window, done}}`,
`day_secured`.

`day_secured` is the same server flag Home already uses. It is not derived in the card from
`tasks.every(done)`: if the server has not secured the day, the card does not say it is secured.

`gates[]` holds only the three gates the app can actually enforce: `camera`, `time_window`,
`location`. An empty array is "Self-reported". The card never shows "Verified".

**Tree**
1. Card: surface, 1pt border, radius.card, padding 20, column gap 16
2. Header row: Text heading "Today" left, count badge right (brandWash pill, radius.input, 6 by 12, caption medium brandText, "{done} / {total}")
3. One group per enrollment, column gap 4: Text caption textSecondary {challenge_name}, then its rows. The label is omitted entirely when there is exactly one enrollment, because it groups nothing
4. Task rows, min-height 44
5. `day_secured` only: Text secondary medium brandText "Day secured." under the last group
6. No per-row button. No primary button under the list

**Row anatomy**
| part | pending | done |
|---|---|---|
| status dot, 20 by 20, radius.pill | 1.5pt textSecondary outline, no fill | filled brand, no border |
| name, bodyStrong | textPrimary | textSecondary, no strike-through |
| gate line, caption textSecondary | "Camera · Time window 6–9am · Location" or "Self-reported" | same |
| trailing | chevron-right 20 textSecondary | nothing |
| tap target | the whole row, opens that task's capture flow | not tappable |

**Order** Undone rows first inside each challenge; challenges in enrollment order. Never re-sort across
challenges: the grouping is the user's mental model of what they joined.

**Gate label strings, built in code**
| gates[] | label |
|---|---|
| [] | Self-reported |
| [camera] | Camera |
| [time_window] | Time window {time_window} |
| [location] | Location |
| [camera, time_window] | Camera · Time window {time_window} |
| [camera, time_window, location] | Camera · Time window {time_window} · Location |

Order is always camera, then time window, then location, joined with " · ".

**States**
- 3 enrollments, 4 tasks, 1 done: badge "1 / 4", three group labels, the done row sits last inside its
  group, no secured line
- all done: badge "4 / 4", every row filled and inert, "Day secured." under the list
- one enrollment, one task: badge "0 / 1", no group label at all, one row. The card must not render an
  empty or dangling label row
- loading: Skeletons for the badge and three rows. The "Today" heading renders immediately
- no active enrollments: the card does not render. Home shows its existing empty state instead

**Display face** none. The badge is a count of today's work, not an earned number, so it stays in the
body face at caption medium. `current_day` still uses the display face elsewhere on Home.

**Copy. Do not paraphrase.**
| string | style |
|---|---|
| Today | heading |
| {done} / {total} | caption medium brandText on brandWash |
| {challenge_name} | caption textSecondary |
| Camera | caption textSecondary |
| Time window {time_window} | caption textSecondary |
| Location | caption textSecondary |
| Self-reported | caption textSecondary |
| Day secured. | secondary medium brandText |

Every string with a number is a template. There is no literal 4, no literal "6–9am".

**Cut, and why**
| cut | why |
|---|---|
| "Today's proof" title and the "{challenge} · Day {n}" subtitle | with every challenge in the list, one challenge name in the header was wrong. The name moved to the group label |
| the single-task row | it made the order the app's choice |
| the primary "Post your first proof" button under the list | with N rows there is no single next action, and a button that names one task would be arbitrary. The rows are the call to action |
| the "Photo" trailing label | replaced by the real gate list from frame 29's vocabulary |

**Interaction** The ChallengeDone interstitial stays: it still appears after the last task of one
challenge is finished while other challenges remain. Its "Next challenge" button now returns to Home,
where this list makes the choice, instead of routing into a specific enrollment. Nothing else about that
screen changes.

**Laws most at risk** 2 and the Sept 6 amendment (the badge is not an earned number, so no display
face), 7 and 9 (rows inside the one card, no box inside a box), 18 (the three real gates only, and no
"Verified" anywhere on Home), 23 (done rows are not tappable and say so by losing the chevron).

# Onboarding v2

**Chunk** J. `src/components/onboarding/`, one component per screen plus `OnboardingChrome.tsx`.
No new tokens. Frames 31 (screens 2 to 9) and 32 (states beyond the happy path), in `GRIIT Onboarding and Auth.dc.html`.

Screen 1, Welcome, is unchanged and does not use the chrome: it has no back target and no position bar.

**Shared chrome, screens 2 to 9** `OnboardingScreen` in `OnboardingChrome.tsx`.
1. Status bar 44
2. Nav row 44: back chevron-left 24 textPrimary at the left, a labelled Skip at the right or nothing.
   There is no bare chevron skip and no unlabelled x
3. `PositionBar`: eight 4pt segments, gap 4, brand for every segment up to and including the current
   one, border for the rest. No "of 9", no step numbers
4. Title block: Text title (28/34, weight 500), 8 gap, Text secondary subtitle
5. Screen body
6. Pinned footer: 1pt border-top, 16 top, 20 sides, 28 bottom, column gap 4. One `PrimaryButton`
   (`color.primary`, textPrimary label) and any text links beneath it

**Display face** none, on any of these eight screens. The user has earned nothing yet, so Barlow
Condensed appears exactly once in the whole flow: the Welcome headline, already built. The streak zero
on WhyProof, the example "Day 12" on WhyCircle and every count in the flow are SF Pro.

**The three gates** `gateLabel(gates, timeWindow)` in `OnboardingChrome.tsx` is the only place a gate
string is built, and it is the same vocabulary as frame 29: Camera, Time window {window}, Location,
joined with " · ", or "Self-reported" for an empty list. Timer is not a gate. The word "Verified" does
not appear anywhere in onboarding.

---

## 2. Goals

`Goals.tsx`. Step 0. No skip: this screen is the input to screen 6, and skipping it makes that screen
arbitrary.

**Data** the six goals as they exist in `components/onboarding/v2/screens/GoalsScreen.tsx`, exported
here as `GOALS`. Selection persists to the profile or anon profile, not only to the store.

**Tree** Title "What are you building?", subtitle, then six `OptionRow`s: label bodyStrong, example
caption. Selected is brandTint with a 1.5pt brand border and a check 20 brandText. At three picked, the
unselected rows drop to 0.5 and stop responding rather than silently dropping an earlier pick.

**Copy**
| string | style |
|---|---|
| What are you building? | title |
| Pick 1 to 3. It filters the challenges we suggest. | secondary textSecondary |
| Physical toughness / Lifting, running, no missed sessions | bodyStrong / caption |
| Mental discipline / Meditation, journaling, focus blocks | bodyStrong / caption |
| Daily habits / Wake times, water, tidy space | bodyStrong / caption |
| Reading and learning / Pages a day, a course, a language | bodyStrong / caption |
| Cold exposure / Cold showers, plunges, breathwork | bodyStrong / caption |
| Sleep and recovery / Phone down, lights out, rest days | bodyStrong / caption |
| Continue | bodyStrong on primary |
| Pick at least one | bodyStrong textSecondary on surface, disabled |

**Cut** "Pick two or three" — the rule is 1 to 3, and the copy contradicted the code.

---

## 3. WhyProof

`WhyProof.tsx`. Step 1. Skip labelled "Skip".

The one argument of the flow, made with real components rather than an illustration: the Home streak
block at zero, then the Today card from frame 30 with three rows, two done.

**Tree** Title, subtitle, streak block ("Current streak", 44pt SF Pro zero, "days", "Post today to
start."), the Today card (header "Today" + "2 / 3" badge, three rows with real gate labels), then one
caption line under the card.

**Copy**
| string | style |
|---|---|
| Streaks are easy to fake. | title, kept verbatim |
| Everywhere else you tap a box. Here the server secures the day, and only when every task in every challenge you joined is done. | secondary textSecondary |
| Current streak | secondary textSecondary |
| 0 | 44/48 weight 500 textPrimary, tabular. NOT the display face |
| days | body textSecondary |
| Post today to start. | secondary textSecondary |
| Today | heading |
| {done} / {total} | caption medium brandText on brandTint |
| Run 5km / Camera · Time window 6–9am | bodyStrong / caption |
| Read 10 pages / Self-reported | textSecondary / caption |
| Cold shower / Camera · Location | textSecondary / caption |
| {done} of {total}. The day is not secured, and nothing you tap changes that. | caption textSecondary |

**Cut** "The day doesn't count until it's verified" — false for self-reported tasks, and it uses the
banned word. The true claim is the subtitle: every task, every challenge, and the server decides.

---

## 4. WhyCircle

`WhyCircle.tsx`. Step 2. Skip labelled "Skip".

What a witness actually sees: one real feed row. The photo is a placeholder because this user has not
taken one. No invented people, no borrowed faces, no counts of who is watching.

**Tree** Title, subtitle, feed card (avatar 40 with a user glyph, "your username", "{challenge} · Day
{n}" in caption, a 200pt canvas block with a camera glyph and "Your proof photo", then the secured line
and the task summary), then the visibility line.

The proof block is capped at 200pt, not the true 4:5 of `proofAspect`. A real 4:5 crop at 351 wide is
439pt tall and pushes the secured line and the visibility sentence under the pinned footer, and those
two lines are the screen. The feed itself still uses true 4:5; this is a preview.

**Copy**
| string | style |
|---|---|
| Discipline, witnessed. | title, kept verbatim |
| This is your row in the feed once you post. | secondary textSecondary |
| your username | bodyStrong |
| {challenge_name} · Day {n} | caption textSecondary, SF Pro |
| Your proof photo | caption textSecondary |
| Day secured. | secondary medium brandText |
| {task summary} | caption textSecondary |
| Everyone in the challenge sees your proofs. Outside it, they go to the feed you post to: Friends, or Everyone. | secondary textSecondary |

**Cut** "Nothing is public, ever" — the feed has an Everyone tab, so the line was false. "Your circle is
watching" — cheerleading, and it implies an audience the user does not have yet. The invented avatars
and names went with them.

**Open** confirm the visibility sentence against the real privacy model before build. If posting scope
is per-challenge rather than per-post, the line changes; it must not ship as written unless it is true.

---

## 5. Commitment

`Commitment.tsx`. Step 3. No skip: Custom is the escape.

Day target only. Standard vs Hard is not here — it is the creator's per-challenge setting, stated on the
challenge screen (see the Challenge detail entry).

**Tree** Title, subtitle, four `OptionRow`s, then a caption line naming what the pick drives.

**Copy**
| string | style |
|---|---|
| Set your line. | title |
| How many days are you committing to. You can change it later, but you have to change it on purpose. | secondary textSecondary |
| 7 days / Enough to find out whether the tasks fit your day. | bodyStrong / caption |
| 30 days / Long enough that a bad week lands inside it. | bodyStrong / caption |
| 75 days / Two and a half months with no gap. | bodyStrong / caption |
| Custom / Any number from 3 to 365. | bodyStrong / caption |
| Home counts against this: Day 1 of {target}. | caption textSecondary |
| Lock it in | bodyStrong on primary |

**Cut** "Starting", "Serious", "All in" — adjectives that rank the user before they have done anything.
Each option now says what the number means in days.

---

## 6. FirstChallenge

`FirstChallenge.tsx`. Step 4. No top skip; "Set this up later" in the footer is the exit.

**Tree** Title, subtitle, three suggestion cards filtered by the goals from screen 2. Card: title
bodyStrong, "{duration_days} days · {participation}" caption, one line per task with its gate label,
then the mode line. Radio: check 20 brandText when selected, a 1.5pt textSecondary ring when not.
Footer: Join, "Day 1 is today." centred caption, then "Browse all" and "Set this up later" side by side
in one 44pt row.

Three cards must fit above the footer, because the subtitle says three. That is why each task is one
line with its gate right-aligned rather than two, the card padding is 12 by 14, and the two footer links
share a row instead of stacking. Stacked links cost 48pt and put the third card behind the footer.

**Copy**
| string | style |
|---|---|
| Start here. | title |
| Three that match your goals. | secondary textSecondary |
| {duration_days} days · {participation} | caption textSecondary |
| {task name} / {gate label} | secondary / caption |
| Hard mode. Gates are enforced; a failed gate fails the day. | caption textSecondary |
| Standard mode. Gates are recorded, not enforced. | caption textSecondary |
| Join | bodyStrong on primary |
| Day 1 is today. | caption textSecondary, centred |
| Browse all | secondary medium textSecondary |
| Set this up later | secondary medium textSecondary |

**No-match state** subtitle becomes "Nothing in the catalogue matches {goals} yet.", the list is
replaced by one card ("No suggestions for those goals" / "Browse the full catalogue, or start without
one and join later from Discover."), and the footer primary becomes Browse all. The list is never padded
with challenges that do not match: that would make screen 2 a lie.

**Cut** "Day 1 begins tomorrow morning" — joining starts the day. The hardcoded "30-day reset" scaffold.

---

## 7. Reminders

`Reminders.tsx`. Step 5. The only OS permission prompt in the flow.

**Tree** Title, subtitle, a real notification preview (40 icon tile in brandTint, "GRIIT", the real body
string, the time on the right), the "Send it at" label, four presets, "Pick a custom time".

**Copy**
| string | style |
|---|---|
| One reminder a day. | title |
| It tells you what is still open. Turn it off in Settings whenever you want. | secondary textSecondary |
| GRIIT | secondary medium |
| {challenge}: {left} of {total} tasks left today. | caption textSecondary |
| Send it at | label textSecondary |
| 6:00 / AM, 8:00 / AM, 6:00 / PM, 9:00 / PM | secondary medium / 12pt |
| Pick a custom time | secondary medium brandText |
| Turn on reminders | bodyStrong on primary |
| No reminders for now | secondary medium textSecondary |

**Permission denied** the preview is replaced by a card ("Notifications are off for GRIIT" / "iOS is
blocking them, so nothing can be sent. Turn them on in Settings and the time you pick here will be
used."), the presets drop to 0.5 and stop responding, the primary becomes "Open Settings" and the link
becomes "Continue without reminders". The screen never re-prompts: iOS will not show the sheet twice.

**Cut** "We'll nudge you. Never nag." — a promise about tone rather than a statement of what the app
does, and it was the title of a screen whose real content is a time picker.

---

## 8. Account

`Account.tsx`. Step 6. The guest is already in; this is the upgrade.

**Tree** Title, subtitle, Continue with Apple, Continue with email, "Have an account? Log in", then the
"Saved and waiting for you" list, then the footer.

**Copy**
| string | style |
|---|---|
| Save your streak. | title |
| You are in already. An account is what makes your proof, streak and challenges survive this phone. | secondary textSecondary |
| Continue with Apple | bodyStrong on surface |
| Continue with email | bodyStrong on surface |
| Have an account? Log in | secondary medium brandText |
| Saved and waiting for you | label textSecondary |
| {challenge}, joined · {target} day target · Reminder at {time} · {goals} | secondary textSecondary, each with a check 16 brandText |
| Continue | bodyStrong on primary |
| Skip — I'll risk losing my progress | secondary medium textSecondary, kept verbatim |

**Identity states**
| state | body | exit |
|---|---|---|
| email_taken | Field with the email, notice "That email already has a GRIIT account. Log in and today's progress comes with you." | primary "Log in and bring my progress". Merge the anon session's joins and proofs. If merge is deferred, still log them in and say on screen that guest progress stays on this device. Never a bare error string |
| confirm_email | Field with the typed address, notice "We'll confirm at {email} — correct?" | two half-width buttons, Edit on surface and Send it on primary |
| malformed | Field with a 1.5pt danger border, circle-alert 16 + "That is not a complete email address." caption danger | primary Continue, disabled. Validation fires on blur |

In all three the "Saved and waiting for you" list stays visible: it is the argument, and it is the thing
the skip costs.

---

## 9. Profile

`Profile.tsx`. Step 7. Skip labelled "Skip" at the top and "Skip for now" in the footer; both finish
onboarding.

**Tree** Title, subtitle, 88pt photo circle with a camera glyph and "Photo optional", then Display name,
Username and Bio fields.

**Copy**
| string | style |
|---|---|
| What should we call you? | title |
| All of this is optional. The feed shows your display name, or your username if you leave it blank. | secondary textSecondary |
| Photo optional | caption textSecondary |
| Display name / Username / Bio | label textSecondary |
| Your name / username / One line, optional | secondary textSecondary, placeholders |
| Continue | bodyStrong on primary |
| Skip for now | secondary medium textSecondary |

**Greeting fallback** `greetingName()`: display_name, then username, then first_name, then null. Home
renders the date line alone when it is null. The literal string "User" never appears.

**Exit** continue and skip both set `onboarding_completed = true` and land on Home with the joined
challenge in the Today card.

---

**Cut across the flow, and why**
| cut | why |
|---|---|
| "Day 1 begins tomorrow morning" | joining starts the day. Every reference is now "Day 1 is today." |
| "The day doesn't count until it's verified" | false for self-reported tasks, and "Verified" is not a word this app uses outside a camera-proof stamp |
| "Nothing is public, ever" | the feed has an Everyone tab |
| GPS and TIMER shown as gates | a timer is a task type, not a gate. Camera, time window and location are the only three the server can enforce |
| "Pick two or three" | the rule is 1 to 3 |
| "We'll nudge you. Never nag." | a promise about tone, on a screen whose content is a time picker |
| "Your circle is watching." | cheerleading, and an audience the user does not have on day zero |
| "warriors" | not how anyone in this audience talks |
| the paywall between challenge and account | asking for money before the app has delivered a single day |
| Standard / Hard as an onboarding step | it is a per-challenge setting owned by the creator |
| invented avatars, names and testimonials | there is no such data, and this audience reads it instantly as filler |

**Laws most at risk** 1 (ink on all nine), 2 and the Sept 6 amendment (no display face anywhere in the
flow), 6 (one filled button per screen, everything else surface or a text link), 9 (surface cards on
canvas, no card inside a card), 18 (three gates, no "Verified"), 23 (no segmented control in the flow at
all).

# Dark conversion: auth, self-report, secured

**Chunk** K. Frame 33, in `GRIIT Onboarding and Auth.dc.html`. Five screens that were still light theme inside an otherwise dark app.
No new tokens and no new components: everything below is DS_V3 plus `components/ds/`.

Nothing was dropped in the conversion. Every field, link and button that existed on the light screens
exists here, and the only copy that changed is copy that was wrong.

**Barlow Condensed appears once in this set**: the streak number on the secured screen. It is the one
number in the five screens the user earned. The "60s" resend countdown, "Day 1" in the self-report
header and the day label are all SF Pro.

---

## 1. Login — `app/auth/login.tsx`

**Tokens** `color.canvas` ground · `color.surface` + `border` inputs and the two OAuth buttons ·
`color.primary` Sign in fill with `color.textPrimary` label · `color.brandText` for Show/Hide and
"Sign up" · `color.textSecondary` for "Forgot password?", the "or" rule and the disabled hint ·
`type.title` / `type.secondary` / `type.label` / `type.caption` · `radius.input` 12 on fields,
`radius.pill` on buttons · `buttonHeight.regular` 52 · `hit` 44 on Show/Hide and every link ·
`space.gutter` 20 sides, `space.md` 12 between fields.

**Reuse** `ds/TextField` (label above, 52 min-height, trailing slot for Show/Hide), `ds/Button`
variant primary and variant surface, `ds/Divider` for the "or" rule, `ds/TextLink`. Do not build a new
OAuth button: it is `ds/Button` variant surface with a 20pt leading Lucide icon.

**Disabled state** Sign in is `color.surface` with a 1pt border and a `color.textSecondary` label
until both fields are non-empty. It is never hidden and never grey-on-grey: the label still clears 6.6:1.
One caption under it says what would enable it — "Enter your email and password to continue." That
caption disappears the moment the button is live.

**Copy**
| string | style |
|---|---|
| Sign in | title |
| Your proof, streaks and challenges are on the account, not the phone. | secondary textSecondary |
| Email / Password | label textSecondary |
| you@email.com / Your password | secondary textSecondary, placeholders |
| Show / Hide | secondary medium brandText |
| Forgot password? | secondary medium textSecondary |
| Sign in | bodyStrong, textPrimary on primary |
| Enter your email and password to continue. | caption textSecondary, disabled state only |
| or | caption textSecondary |
| Sign in with Apple | bodyStrong on surface, apple 20 |
| Sign in with Google | bodyStrong on surface, chrome 20 |
| Don't have an account? / Sign up | secondary textSecondary / secondary medium brandText |

---

## 2. Forgot password, sent — `app/auth/forgot-password.tsx`

The light version was a heading, a line and a button floating in a void. The address the link went to is
the one fact the user needs, so it is now a surface card with a `color.brandTint` icon tile.

**Tokens** `color.surface` + `border` card · `color.brandTint` icon tile with `color.brandText`
mail 20 · `radius.card` 20 on the card, `radius.input` 12 on the tile · `color.primary` for Back to
sign in · `type.title` / `type.bodyStrong` for the address / `type.label` "Sent to" / `type.caption`.

**Reuse** `ds/Card`, `ds/Button` primary, `ds/TextLink` for Resend. The countdown needs no component:
it is the same TextLink at 0.6 opacity with an inert label.

**Resend** `color.brandText` TextLink when available. During the 60s lock it is
`color.textSecondary` at 0.6 opacity, inert, reading "Didn't get it? Resend in {n}s" and counting down
by the second. The countdown is SF Pro, not the display face: a cooldown is not an earned number.

**Copy**
| string | style |
|---|---|
| Check your email | title |
| A reset link is on its way. It expires in 60 minutes. | secondary textSecondary |
| Sent to | label textSecondary |
| {email} | bodyStrong |
| Wrong address? Go back and send it again. | caption textSecondary |
| Back to sign in | bodyStrong on primary |
| Didn't get it? Resend | secondary medium brandText |
| Didn't get it? Resend in {n}s | secondary medium textSecondary, 0.6 opacity, inert |

---

## 3. Self-report step — `components/task-v2/steps`

**Tokens** `color.canvas` · `color.surface` + `border` for the "what this records" card ·
`color.primary` for "I did it" · surface for "Not yet" · `type.title` task name · `type.secondary`
for the honesty line · `space.section` 32 above the title.

**Reuse** `ds/NavBar` (back chevron + title), `ds/Card`, `ds/Button` primary and surface, `ds/Icon`.

The header is "Day {n} · Self-report" in `type.bodyStrong` beside the back chevron. "Self-reported.
Nothing is checked." sits directly under the task title, unchanged, as `type.secondary`
`color.textSecondary` — not in a pill, not in a warning colour. It is a fact, not an alert.

The card under it spells out what the tap actually does, three rows with 20pt Lucide icons: today is
marked done, the challenge sees it as self-reported, and none of the three gates applied. That card is
the only thing added to this screen, and it exists because "nothing is checked" raises exactly that
question.

**Copy**
| string | style |
|---|---|
| Day {n} · Self-report | bodyStrong |
| {task title} | title |
| Self-reported. Nothing is checked. | secondary textSecondary, kept exactly |
| What this records | label textSecondary |
| Today is marked done for this task | secondary textSecondary, check 20 |
| Your challenge sees it as self-reported | secondary textSecondary, users 20 |
| No camera, no time window, no location | secondary textSecondary, shield-off 20 |
| I did it | bodyStrong on primary |
| Nothing is secured until the server says so. | caption textSecondary, centred |
| Not yet | bodyStrong on surface |

---

## 4. Secured — `app/task/secured.tsx`

The light build had the number, the line, the pill, then a screen of black with the week strip pinned to
the bottom. The middle is now composed: the number, the line, the pill and the strip are one block, and
Done is a full-width primary in the footer.

**Tokens** `numberSize.mid` 160 in `displayFace` at `color.textPrimary` — the only display number on
these five screens · `color.brand` for secured week squares and the today outline
(`selectedBorder` 1.5pt) · `color.surface` + `border` for the verification pill and the photo frame ·
`radius.pill` on the pill, `radius.input` 12 on week squares, `radius.card` 20 on the photo ·
`color.primary` Done · `motion.daySecuredMs` 400 for the count-up.

The photo frame is 176pt, not 240. At 240 the composed middle ends 4pt above the pinned Done button, which is inside measurement error on a 393 wide phone; 176 leaves 65.

**Reuse** `ds/DisplayNumber` size mid, `ds/WeekStrip` (the Home component, unchanged),
`ds/Button` primary. The verification pill is `ds/Chip` variant surface with a leading 16pt icon — not
a new component, and not the Stamp: the Stamp is camera-proof only and this screen must show both cases.

**Two variants, one layout**
- camera proof: pill reads "Camera proof. Checked on the server." with a camera 16, and the real photo
  fills a `radius.card` frame under the week strip at 240pt
- self-reported: pill reads "Self-reported. Nothing was checked." with a shield-off 16, and there is no
  photo frame at all. One caption takes its place. A grey placeholder box would be a picture of a proof
  that does not exist

Law 19 holds: the count-up and the square fill are the one animated moment, 400ms, one haptic.

**Copy**
| string | style |
|---|---|
| Current streak | label textSecondary |
| {streak} | numberSize.mid, displayFace, textPrimary |
| day / days | body textSecondary |
| Day {n}. Self reported. | bodyStrong |
| Day {n}. Camera proof. | bodyStrong |
| Self-reported. Nothing was checked. | caption textSecondary in a surface pill |
| Camera proof. Checked on the server. | caption textSecondary in a surface pill |
| Today's proof | caption textSecondary, photo frame placeholder only |
| {n} more days this week to keep the count. | caption textSecondary, self-reported variant |
| Done | bodyStrong on primary |

---

## 5. Saving — in the button, then a takeover

The sentence stays; it moves. "Nothing is secured until the server says so." is now a
`type.caption` `color.textSecondary` line under the button, where it reads as the rule rather than an
interruption.

**Under ~800ms, in place**: "I did it" keeps its `color.primary` fill, its label becomes "Saving…" and
a 20pt spinner takes the leading slot. The button keeps its 52pt height and full width, so nothing below
it moves. "Not yet" drops to inert. The caption does not change.

**Over ~800ms, takeover**: a `color.canvas` full-screen layer, 44pt spinner, `type.heading` "Saving
your day", and the same sentence in `type.secondary` under it. No progress bar, no percentage: the
client does not know how long the server will take.

**Tokens** `color.primary` fill held through the saving state · `color.textPrimary` at 0.35 alpha for
the spinner track, `color.textPrimary` for its head · `buttonHeight.regular` 52 ·
`type.caption` / `type.heading` / `type.secondary`.

**Reuse** `ds/Button` with a `loading` prop (it already renders a leading slot — pass the spinner
there rather than swapping in a new component), `ds/Spinner` at 20 and 44.

**Copy**
| string | style |
|---|---|
| Saving… | bodyStrong, textPrimary on primary |
| Nothing is secured until the server says so. | caption textSecondary under the button, kept |
| Saving your day | heading, takeover only |

---

**Cut in the conversion, and why**
| cut | why |
|---|---|
| the white grounds on all five | law 1: the canvas is ink on every screen |
| the full-screen saving takeover as the default | it interrupted a 300ms round trip. It now only appears past ~800ms |
| the grey placeholder box on a self-reported secured screen | it is a picture of a proof that does not exist |
| the week strip pinned to the bottom of the secured screen | it belongs to the number, not to the footer. Pinned, it left a screen of empty black between them |
| the grey pill's neutral grey | not a DS_V3 colour. It is now surface with a 1pt border |
| a hidden Sign in button while the form is incomplete | a button that vanishes cannot explain itself. Disabled plus one caption does |

**Laws most at risk** 1 (five light screens, now ink), 2 and the Sept 6 amendment (one display number in
the set, on the secured streak, and the resend countdown stays SF Pro), 6 (one primary fill per screen),
9 (surface cards on canvas, no card inside a card), 18 (the Stamp does not appear on the self-reported
secured screen), 19 (the count-up is still the one moment).

# Group challenges

**Chunk** L. Frames 34 to 38, in `GRIIT Group Challenges.dc.html`. No new tokens, **no new
components**.

Individual streaks stay individual. The group is a shared room with a fixed cap of ten, and the cap is
stated wherever a seat count is actionable.

**Grounded against the repo** at `abdelayaseen-netizen/GRIIT@main`, tree `e1d9232f932e`. Every
component named below was read: `components/ds/{ListRow, Button, Card, Avatar, PushedHeader, Chip,
DisplayNumber, Divider, EmptyState}.tsx`. Three corrections to the first draft of this chunk came out
of that read, recorded at the end.

**The ds/ API, as it actually is** — bind to these names, not to prose:

| component | the props these screens use |
|---|---|
| `ListRow` | `icon?: ReactNode` (arbitrary leading slot), `title`, `subtitle?`, `trailing?: ReactNode`, `rank?`, `highlight?`, `divider?` (**default true**), `onPress?` |
| `Button` | `label`, `variant?: "primary" \| "secondary" \| "tertiary"` (default primary), `size?: "regular" \| "small"`, `icon?`, `loading?`/`submitting?`, `disabled?`, `flush?`, `ink?`, `destructive?` |
| `Avatar` | `size?: 32 \| 40 \| 56 \| 96`, `uri?`, `displayName?`, `ring?` |
| `PushedHeader` | `title`, `onBack`, `trailing?` |
| `Card` | `tint?` plus ViewProps |
| `Chip` | `label`, `selected?`, `variant?: "ghost" \| "form"`, `disabled?`, `icon?`, `onPress?` |
| `DisplayNumber` | `value`, `size?: "inline" \| "home" \| "moment" \| "mid" \| "share"`, `animateFrom?`, `haptic?`, `onSettled?` |
| `EmptyState` | `icon?`, `heading`, `body`, `actionLabel`, `onAction?`, `variant?: "empty" \| "error"` |

Four things follow from that and are binding on every screen below.

1. **`ListRow` carries an avatar.** Its `icon` prop is an untyped `ReactNode` in a slot with a 24pt
   *minimum*, so `icon={<Avatar size={40} …/>}` works with no change to the component. The roster and
   the invite picker are `ListRow` + `Avatar`, not a new row component.
2. **`ListRow` draws its own divider** (`divider` defaults true). Do not wrap rows in `Divider`;
   pass `divider={false}` on the last row of a section instead.
3. **`Button variant="primary"` fills `DS_V3.color.brand` with an `onBrand` label**, and its header
   comment cites law 7: never `textPrimary` on brand. The frames draw the primary as `#BB471D` with a
   `#F5F3EE` label because brief 16 locked that pair. **Those two disagree**, and this chunk does not
   resolve it: use `<Button variant="primary">` as it ships, and if `#BB471D` is the intended
   primary, change `DS_V3.color.brand`/`onBrand` once, centrally, rather than overriding per screen.
4. **`PushedHeader` centres its title** between two 44pt sides. The frames were corrected to match.

---

## 34. Roster — `app/challenge/[id]/members`

Opens from the social row on the active challenge screen.

**Reuse** `PushedHeader` (`title={challenge.title}`, `onBack`) · `DisplayNumber`
`size="home"` for the group streak · `ListRow` with `icon={<Avatar size={40} displayName={…} uri={…}/>}`,
`title={display_name}`, `subtitle` for their streak, `trailing` for the secured status ·
`Button variant="primary"` with a `user-plus` icon for Invite · `Button variant="tertiary"`
`size="small"` `flush` for each Cancel · `EmptyState` for the fresh group.

**Tokens** `DS_V3.color.canvas` ground · `color.brandText` "Secured today" ·
`color.textSecondary` "Not yet today", member streaks, section labels · `numberSize.home` ·
`type.label` / `type.bodyStrong` / `type.caption` · `space.gutter` · `size.tap` 44 ·
`size.avatar.md` 40.

**Group streak** the only `DisplayNumber` on the screen. Each member's own streak is a `subtitle` in
the body face — a teammate's streak is their earned number, not the viewer's. The number carries one
caption, "Counts only days every member secured", because a group streak nobody can define is a vanity
metric. If the backend computes it differently, change the caption to match the query; do not ship the
number without a definition beside it.

**Order** creator first, then by streak descending. Not alphabetical: the list is a standings board.
The creator's row takes `rank` = nothing and a "Creator" label beside the name; do not use
`highlight`, which is `brandTint` and reads as a selection.

**Copy**
| string | style |
|---|---|
| Group streak | label textSecondary |
| {group_streak} | DisplayNumber size home |
| days / day | body textSecondary |
| {secured_today} of {member_count} secured today | secondary textSecondary |
| Counts only days every member secured. | caption textSecondary |
| In this group · {n} of 10 | label textSecondary |
| Creator | label textSecondary, beside the name |
| {n} day streak | ListRow subtitle |
| No streak yet | ListRow subtitle |
| Secured today | caption brandText, trailing |
| Not yet today | caption textSecondary, trailing |
| Invited | label textSecondary, section |
| Cancel | Button tertiary small flush, creator only |
| Invited | caption textSecondary, member's view of a pending row |
| Invite | Button primary, user-plus icon |
| Just you so far. | EmptyState heading |
| Up to nine more can join. The group streak starts on the first day all of you secure. | EmptyState body |

The Invited section does not render when there are no pending invites. Members see "Invited" as an inert
caption where the creator sees Cancel.

**Empty roster** `EmptyState` sits on the canvas, never inside a `Card` (its header cites law 21),
and it owns its own single `Button` — so the pinned footer is absent in that state and Invite is the
EmptyState action. One primary on screen, law 6 intact.

---

## 35. Invite picker — pushed from Invite

**Reuse** `PushedHeader` · `ListRow` + `Avatar size={40}` (`subtitle={"@"+username}`) ·
`Button variant="tertiary"` `size="small"` `flush` as the row `trailing` for a live Invite ·
a plain `type.caption` `Text` as `trailing` for the inert states · `Divider` above the pinned
Share button · `Button variant="secondary"` with a `link` icon for Share a link · `Card` for the
full-group notice · `EmptyState` for no mutuals.

**Tokens** `color.brandText` (the tertiary Button's default label colour) for Invite ·
`color.textSecondary` "Invited" and "In" · `color.surface` + `color.border` on the secondary
Button and the Card · `radius.pill` · `radius.card` 20.

The trailing element is a *state*, not always a control: a tertiary `Button` when actionable, then an
inert caption after the tap. "In" is an inert caption at full row opacity — someone already enrolled is
not an error.

"Share a link" is pinned above a `Divider` and survives every state including the empty one, because it
is the only path that reaches someone you do not follow.

**Copy**
| string | style |
|---|---|
| Invite to {challenge} | PushedHeader title |
| People you follow, and people who follow you. {n} of 10 in the group. | caption textSecondary |
| {display_name} / @{username} | ListRow title / subtitle |
| Invite | Button tertiary small flush |
| Invited | caption textSecondary, inert |
| In | caption textSecondary, inert |
| Share a link | Button secondary, link icon |
| Follow people to invite them here. | EmptyState heading |
| A link works on anyone, follower or not. | EmptyState body |
| This group is full. Ten is the cap, and someone has to leave before you can invite again. | Card, secondary textSecondary |

**Full state** rows go inert at 0.4, which is `Chip`'s disabled opacity and the value to match; the
Invite affordance becomes a `disabled` Button, whose label the component already renders in
`textSecondary`. Share a link stays live: the server refuses an over-cap join, and hiding the link
would imply the group can be grown another way.

---

## 36. Invite notification — one row in Activity

**There is no `NotificationRow` in `components/ds/`** — the directory holds 24 files and none of them
is a notification row. This is `ListRow` with `icon={<Avatar size={40} displayName={inviter}/>}`,
`title` carrying the sentence, `subtitle` the relative time, and `onPress` set (which makes
`ListRow` render its own `ChevronRight` when `trailing` is undefined).

**Unread** pass `trailing={<UnreadDot/>}` — an 8pt `color.brand` circle — and the row's own chevron
is suppressed, because `ListRow` only falls back to the chevron when `trailing` is undefined. Ground
the unread row in `color.surface` via the `style` passthrough on the wrapping `View`; `ListRow`
itself takes no style prop, so wrap it.

**Read** drop `trailing` entirely and let the chevron come back. Both states are the same height, so
marking read does not reflow the list, and the row stays tappable: a pending invite is still pending.

**Copy**
| string | style |
|---|---|
| {inviter} invited you to {challenge} | ListRow title (bodyStrong) unread; textSecondary when read |
| {relative time} | ListRow subtitle |

Note `ListRow`'s `title` is always `type.bodyStrong` in `textPrimary`. The read treatment needs
either a `read` prop on `ListRow` or a local `Text` in place of `title` — that is the one place in
this chunk where the shipped component does not cover the design. Prefer adding the prop to `ListRow`
over building a second row component.

---

## 37. Challenge detail, invited — `ChallengeDetailV3`

Same layout as the not-joined state. Two changes.

**Footer** Join is replaced by `Button variant="primary"` "Accept" and `Button variant="tertiary"`
"Not now". Above them, one centred caption: "{inviter} invited you. Day 1 is the day you accept." That
sentence does the work "Day 1 is today." did, and it names who is asking.

**Facts row** the member chip reads "{n} of 10" instead of "{n} people". In a group the cap is the fact
that matters: it tells the viewer whether there is room before they tap Accept.

The facts row is **not** `ds/Chip`. `Chip` is a `Pressable` with `ghost` (transparent) and
`form` (Create wizard only) variants; the facts are not tappable and must not look it. They stay the
plain surface pills specified in the Challenge detail entry — `color.surface`, 1pt `color.border`,
`radius.input`, `type.caption`.

**Reuse** the existing `ChallengeDetail` with an `invite` prop `{inviter_name, member_count, cap}`.
Do not fork the screen.

**Copy**
| string | style |
|---|---|
| {n} of 10 | caption textSecondary, surface pill |
| {inviter} invited you. Day 1 is the day you accept. | caption textSecondary, centred |
| Accept | Button primary |
| Not now | Button tertiary |

"Not now" dismisses without declining: the invite stays in Activity. A destructive decline belongs in the
overflow menu, not beside Accept — and `Button` has a `destructive` flag for it there.

---

## 38. Active challenge, the social row

The existing row, new copy: "{n} in this challenge" becomes "{n} of 10 in this group". Same `ListRow`,
same `users` 24 icon, same `onPress` chevron, same 44pt minimum. It names the cap because it is the
entry point to the roster, and someone deciding whether to invite needs to know how many seats are left.

Solo challenges keep the row hidden when `participants_count` is 1 — unchanged.

| string | style |
|---|---|
| {n} of 10 in this group | ListRow title |

---

**Corrected after reading the repo**
| first draft said | the source says |
|---|---|
| add `ds/MemberRow`, because "`ds/ListRow` cannot carry an avatar" | `ListRow.tsx` takes `icon?: React.ReactNode` in a min-24 slot. An `Avatar size={40}` drops straight in. **The proposal is withdrawn: this chunk adds no components.** |
| "`ds/Button` variant surface" | the variants are `primary`, `secondary`, `tertiary`. Surface-with-border is `secondary` |
| "`ds/NotificationRow` if it exists" | it does not. The row is `ListRow` + `Avatar`, and the only real gap is a read/dimmed title, which should be a prop on `ListRow` |
| `Divider` between roster rows | `ListRow` draws its own; pass `divider={false}` to suppress |
| the fresh-group state as a `Card` | `EmptyState` exists, owns its own button, and its header cites law 21: on canvas, never inside a Card. Frame corrected |
| `PushedHeader` with a left-aligned title | it centres the title between two 44pt sides. Frames corrected |
| the facts row as `ds/Chip` | `Chip` is pressable, ghost or form only. The facts row stays a plain surface pill |

**Laws most at risk** 2 (the group streak is the only `DisplayNumber` on the roster; member streaks are
subtitles in the body face), 6 (one primary per screen — and the empty roster hands its single primary to
`EmptyState` rather than showing two), 7 (the `#BB471D` / `onBrand` conflict above — resolve it in
`lib/design-system.ts`, not per screen), 21 (rows on canvas, `EmptyState` never inside a Card),
23 (trailing states are captions or flush tertiary Buttons, so nothing looks tappable that is not).

# Post detail, writing step, consistency record

**Chunk** M. Frames 39 to 41, in `GRIIT Post Writing Record.dc.html`. No new tokens.

The last three light-theme screens. Grounded against `abdelayaseen-netizen/GRIIT@main`, tree
`2d9cb6d709d1`: `components/ds/` holds 25 files and every component named below was read.

**Two things the repo settled**

1. **`ds/MemberRow` exists.** Chunk L proposed it, then withdrew the proposal; it has since been
   built, with the roster/picker/notification behaviour in its header comment. The comment rows on
   frame 39 are *not* MemberRow — it hardcodes `size.avatar.sm` (40) and a single-line caption, and a
   comment needs avatar 32 with the name and time on one baseline above wrapping body text.
2. **There is no `StatCard`, `ProgressBar` or `SectionLabel`.** The stats block is `Card` with a
   two-column grid of plain `Text` pairs; the month bars are two nested `View`s.

**One new component, justified**: `ds/CommentRow` — `Avatar size={32}`, a name + time baseline row,
and `type.body` text below. It is not MemberRow (wrong avatar size, wrong text hierarchy, and its
trailing slot is a status, not a timestamp) and not `ListRow` (title is single-line `bodyStrong`,
and comment text wraps). Frame 39 uses it three times and the notification list does not use it at all,
so it is the one place in this chunk where nothing shipped fits.

---

## 39. Post detail — `app/post/[id].tsx`

**Reuse** `PushedHeader` `title="Proof"` · `ProofImage size="feed"` with `stamp` — the component
already places the Stamp bottom-right inside the frame on its own scrim, so do not add one outside it ·
`Avatar size={DS_V3.size.avatar.md}` (40) for the author · `Divider` between comments ·
`TextField` for the composer · `Skeleton` for loading · `ds/CommentRow` (new).

**Tokens** `color.canvas` · `color.surface` + `color.border` on the TextField and the Send button ·
`color.primary` on Send once there is text · `type.bodyStrong` author, `type.secondary` the
completion line and comment author, `type.body` comment text, `type.caption` times ·
`radius.card` 20 on the proof, `radius.input` 12 on the field, `radius.pill` on Send ·
`size.button` 52 field min-height · `size.tap` 44 Send.

**Stamp** only when the completion carried camera proof. `ProofImage`'s `stamp` prop takes
`"Verified" | "Complete"`; pass nothing on a self-reported post. `Stamp.tsx`'s own header says never
on self-reported content.

**Send** `color.surface` with a 1pt border and a `textSecondary` `arrow-up` while the field is
empty, `color.primary` with a `textPrimary` glyph once there is text. It is a 44pt circle, not a
text button: the field is the affordance and the glyph is the commit.

**Scroll** the screen scrolls under the pinned composer. The frames clip the content region at 667pt
(852 − 44 status − 44 header − 97 composer), which is the real viewport.

Frame 39A is shown **mid-scroll**, with the proof running off the top of the clip, because that is the
reading state: a 4:5 proof at 353pt wide is 441pt tall and takes 66% of the viewport, so at scroll-top
only one comment is reachable. Anyone reading comments has already scrolled the photo up. 39B (empty)
and 39C (loading) are shown at scroll-top, where the proof is the content.

**Loading** `Skeleton variant="proof"` for the 4:5 block, then `Skeleton lines={2}` twice. Both are
`color.border` bars on `Card`, static — `Skeleton.tsx` cites law 19 and does not pulse. No spinner:
a spinner says "wait", the recipe says "a proof and two comments are coming".

**Copy**
| string | style |
|---|---|
| Proof | PushedHeader title |
| {author} | bodyStrong |
| {relative time} | caption textSecondary |
| {name} completed {task} · {challenge} | secondary textSecondary |
| {n} comments | label textSecondary |
| {commenter} | secondary medium textPrimary |
| {comment text} | body textPrimary |
| Add a comment | TextField placeholder, textSecondary |
| No comments yet. | secondary textSecondary |

The empty state is one line on the canvas. No `EmptyState`, no button: the composer below it is the
action, and an EmptyState here would put two calls to action on one screen.

---

## 40. Writing task step — `components/task-v2/steps`

**Reuse** `PushedHeader` `title={`Day ${n} · Write`}` · `Button variant="primary"` with
`disabled` until the count is met. Nothing else: the writing surface is a bare `TextInput` on the
canvas.

**Tokens** `color.canvas` · `type.title` task name · `type.caption` the honesty line, the counter
and the footer caption · `type.body` the typed text and the placeholder · `color.brand` the 2pt
progress rule · `color.brandText` the counter once the target is met · `space.gutter` 20.

**The writing area fills the space** between the counter rule and the pinned footer — flex it, never a
fixed pixel height. On a 393×852 phone that is about 515pt, which holds roughly 150 words at 22pt lines.
A larger target scrolls, which is fine in the app but cannot be shown complete in a frame, so the sample
target is 150 rather than 250.

**No TextField.** `TextField` is a 52pt surface box with a border — right for an email, wrong for 250
words. The writing area is `color.canvas` with no chrome at all, so the words sit on the ground the way
they do in a notes app, and the only thing between the title and the text is the counter.

**Counter** `type.caption`, "{written} of {n}", on a 2pt `color.border` rule that fills with
`color.brand`. Words typed are not an earned number, so this is **not** `DisplayNumber` and not the
display face. It turns `color.brandText` when the target is met — the one colour change on the screen. It keeps
counting past the target ("155 of 150"): clamping at the target would hide the fact that the entry is
already long enough, and nobody stops mid-sentence on the 150th word.

**CTA** "Write {remaining} more words" while short, disabled (`color.surface`, 1pt border,
`textSecondary` label — `Button`'s own disabled treatment). Becomes an enabled "Post" at the target.
The label states the remaining work rather than the rule, so the user never taps to find out why it
will not go.

**Copy**
| string | style |
|---|---|
| Day {n} · Write | PushedHeader title |
| {task title} | title |
| {target} words. Counted, not read. | caption textSecondary, kept exactly |
| Words | label textSecondary |
| {written} of {n} | caption textSecondary, brandText at target |
| Write here | body textSecondary, placeholder |
| Write {remaining} more words | Button primary, disabled |
| Post | Button primary |
| Nothing is secured until the server says so. | caption textSecondary, centred |

Pluralise the CTA at one word remaining: "Write 1 more word".

---

## 41. Consistency record — `app/profile/record`

**Reuse** `PushedHeader` `title="Consistency"` · `DisplayNumber size="home"` for the secured count ·
`Card` for the stats block · `Divider` inside the card and between rows.

**Tokens** `numberSize.home` 64 for the hero, `numberSize.inline` for the two display cells ·
`color.brand` the month bars · `color.surface` + `color.border` the card and the bar troughs ·
`type.label` cell labels and section labels · `type.caption` ratios and the footer.

**Hero** secured days over days elapsed — "9 of 12", with "Day 12 of 75." under it. One
`DisplayNumber`; "of 12" is `type.body` in `textSecondary`. A single ratio in the display face
would read as two earned numbers.

**The verification split, as the brief requires.** Longest streak, Total secured and Completion all
include self-reported days. Immediately under the four cells, inside the same `Card` and below a
`Divider`, two rows break the secured total apart: "Camera proof {n} days" with a `camera` 16, and
"Self-reported {n} days" with a `shield-off` 16. Same card, because the split is a reading of the
number above it, not a separate fact — law 22 holds, no card inside a card.

**No Stamp on this screen, in any state.** The Stamp is a per-completion claim; a stamp beside an
aggregate that includes self-reported days would be exactly the implication the brief forbids.

**Rows** "By month" is a 44pt row: month in `type.secondary`, a 6pt `radius.pill` bar, then
"{x} of {y}" in `type.caption` right-aligned at a fixed 56pt so the bars end on one line. A month with
no days does not render a row — an empty month is not a fact worth 44pt. "By challenge" rows carry the
challenge name, its own camera/self-reported breakdown as a caption, and its ratio.

**Copy**
| string | style |
|---|---|
| Consistency | PushedHeader title |
| Days secured | label textSecondary |
| {secured} | DisplayNumber size home |
| of {elapsed} | body textSecondary |
| Day {n} of {N}. | secondary textSecondary |
| Longest streak / Total secured | label textSecondary, value DisplayNumber inline + "days" caption |
| Completion / First proof | label textSecondary, value heading in the body face |
| Camera proof / Self-reported | secondary textSecondary, value bodyStrong |
| {n} days | bodyStrong |
| By month / By challenge | label textSecondary |
| {x} of {y} | caption textSecondary |
| {n} camera proof, {n} self-reported | caption textSecondary |
| A day counts as secured when every task in it was done. Self-reported days count toward the streak and are listed separately above. Nothing here is a claim that they were checked. | caption textSecondary |

Completion is a percentage of days elapsed, not of `duration_days` — a 75 day challenge on Day 12 is
not 12% complete, it is 75% consistent. If the backend computes it the other way, change the label, not
the number.

---

**Laws most at risk** 2 (three display numbers across the three screens: the record hero and its two
inline cells. The word counter and the comment count are body face), 6 (one primary per screen, and the
comment empty state adds none), 9 and 22 (the verification split lives inside the stats Card, not in a
second card), 13 (the proof is `ProofImage size="feed"`, 4:5, unchanged), 18 (no Stamp on a
self-reported post and none anywhere on the record), 19 (`Skeleton` is static; no pulsing, no spinner),
21 (`EmptyState` is not used for "No comments yet." — one line on canvas, because the composer is the
action).

# Task model, Home task list, discard sheet

**Chunk** N. Frames 42 to 46, in `GRIIT Task Model.dc.html`. No new tokens.

Grounded against `abdelayaseen-netizen/GRIIT@main`, tree `9a065f7838c6`. Read:
`components/create/v2/StepTasks.tsx`, `components/create/NewTaskSheet.tsx`,
`components/task-v2/steps/DiscardPhotoModal.tsx`, `components/feed/WhoRespectedSheet.tsx`,
`lib/group-ui.ts`, plus a repo-wide search for `task_type` / `require_photo` / `TaskType`.

## The model

A task has **one type** (what you do) and **zero to three gates** (what proves it).

| types | what it means |
|---|---|
| `check_off` | Tap it when it is done. |
| `timer` | Runs in the app. It has to reach the time. |
| `counter` | Hit a number each day, with a unit. |
| `text` | Write a number of words. Counted, not read. |
| `run` | Distance and time come from GPS. |

| gates | what it enforces | copy on the sheet |
|---|---|---|
| `camera` | a photo taken in the app, not the library | A photo taken in the app. |
| `time` | `by HH:MM`, or `between HH:MM and HH:MM`, in the user's timezone | Only counts inside the window. |
| `location` | within a radius of a place they set | Only counts at this place. |

There is no fourth gate. "Photo" is not a type and "verified proof" is not a toggle: both are the Camera
gate. `require_photo`, `require_photo_proof` and `photo_required` all collapse into `gates: ["camera"]`.

**One gate-line function, one order** — camera, then time, then location, joined with " · ", and
"Self-reported" for an empty list. Put it in `lib/task-ui.ts` beside `lib/group-ui.ts` and let every
screen call it. The frames show: "Self-reported" · "Between 9:30 and 10:30 am" · "Camera · By 7:00 am" ·
"Camera · By 7:00 am · Location".

**Two new components, justified**

| component | why nothing shipped fits |
|---|---|
| `ds/Sheet` | there is no sheet in `components/ds/`. The three that exist are each hand-rolled and inconsistent: `WhoRespectedSheet` uses the **legacy** `DS_COLORS`/`DS_RADIUS`/`DS_TYPOGRAPHY` (pre-DS_V3, with `WEIGHT_SEMIBOLD` — a weight law 3 forbids), `DiscardPhotoModal` pulls `taskFlowStyles`, and `AuthGateModal`/`StreakFreezeModal` are separate again. Props: `visible`, `onDismiss`, `heading`, `children`, `footer`; 60% ink scrim, `color.surface` ground, `radius.card × 1.2` top corners, 34pt bottom inset |
| `ds/Switch` | the gate rows need one, and there is none. It must be 51×31 with a `color.brand` on-track and a `color.border` off-track, because RN's platform default is iOS green — a colour in no GRIIT palette |

---

## 42. Add task sheet — `components/create/AddTaskSheet`

**Order is the design**: task name, then *what you do*, then *what proves it*.

The shipped sheet, `components/create/NewTaskSheet.tsx`, asks one question twice. Its section is headed
"Proof type" and holds ten `PROOF_TYPES` chips — one of which is `photo`, "A photo taken in the app
completes the day" — and then a **separate** "Verified proof" switch below the config, described as
"Requires a photo taken in the app to complete this task each day." Two controls, one meaning.

Three consequences, all in that file:

1. **The switch lies on a Photo task.** `requirePhoto: state.type === "photo" || state.verified`
   (line ~215) means a Photo task always requires a photo, while the switch beside it sits visibly off.
   The user is shown a control that does not control anything.
2. **`checkin` is a type whose whole content is a gate.** Its description is "The day counts when you
   are at the saved place", and its config collects location name and radius. Under the model it is
   `check_off` plus the Location gate — which is exactly why the sheet's own `handleSave` has to
   special-case it with "Location is required" / "Radius is required" validation.
3. **`verifiedLocked` encodes a rule the model makes unnecessary.** Verified and manual Run tracking are
   mutually exclusive, with the hint "Manual runs can't be verified." Once camera is a gate and Run's
   tracking mode is type config, the two stop interacting and both the lock and the hint go.

Also in that file and worth carrying over rather than re-deciding: it already renders RN `Switch` with
`trackColor={{ false: color.border, true: color.brand }}` and `thumbColor={color.textPrimary}` — so
`ds/Switch` is an extraction of behaviour already written, not a new decision. Two things should *not*
carry over: the word "Verified" as a user-facing control label (the gate is "Camera"), and the
`nameCard` / `configInput` treatment, which puts `color.canvas` fields inside a `color.surface`
sheet — inverted from every other field in the system.

**Reuse** `ds/TextField` for the name · `ds/Chip` for the five types (`variant="form"`, which is
what that variant is for) · `ds/SegmentedControl` for By / Between · `ds/ListRow` for Set place ·
`ds/Divider` between gate rows · `ds/Button variant="primary"` for Add task · `ds/Sheet` and
`ds/Switch` (new).

**Tokens** `color.surface` + `color.border` fields and chips · `color.brandTint` +
`color.selectedBorder` 1.5pt on the selected chip, label `color.brandText` · `color.brand` switch
on-track · `color.primary` Add task · `type.label` section labels · `type.caption` the type line and
all three gate lines · `radius.input` 12 on fields and chips · `size.button` 52 · `size.tap` 44.

**One caption, not five.** The type row shows a single `type.caption` line describing the *selected*
type. Five permanent explanations is five things to read on a sheet whose job is two decisions.

**The type's own field** appears directly under that caption and only for types that have one: Timer →
duration chips 5/10/15/30 + custom; Counter → target + unit; Text → min words; Run → distance + unit;
Check off → nothing. Check off having no field is the reason it is the default.

**Gate reveals** are indented to the gate's text column (38pt) so they read as belonging to the switch
above them. Time reveals a By/Between segmented control and one or two time pickers; Location reveals a
Set place row. Camera reveals nothing — there is nothing to configure about a photo.

**No-gate note.** With all three off, one caption under the rows reads: "No gates. The row will read
\"Self-reported\"." The sheet tells the truth before the task is added, not after.

**Copy**
| string | style |
|---|---|
| New task | Sheet heading / bodyStrong |
| Task name | label textSecondary |
| Name it | TextField placeholder |
| What you do | label textSecondary |
| Check off · Timer · Counter · Text · Run | Chip variant form |
| Tap it when it is done. | caption textSecondary |
| Runs in the app. It has to reach the time. | caption textSecondary |
| Hit a number each day. | caption textSecondary |
| Write a number of words. Counted, not read. | caption textSecondary |
| Distance and time come from GPS. | caption textSecondary |
| What proves it | label textSecondary |
| Camera / A photo taken in the app. | bodyStrong / caption |
| Time / Only counts inside the window. | bodyStrong / caption |
| Location / Only counts at this place. | bodyStrong / caption |
| By / Between | SegmentedControl |
| By / From / To | label textSecondary, time pickers |
| Set place | body textPrimary, ListRow with chevron |
| No gates. The row will read "Self-reported". | caption textSecondary |
| Add task | Button primary |

**Scroll** the sheet content scrolls under the pinned footer. The frames clip at 664pt
(808 sheet − 44 header − 100 footer); B and D are shown mid-scroll so every gate row and its revealed
fields are visible at once, which is also how a user configuring gates has the sheet positioned.

---

## 43. Task preview row

One row shape everywhere a task is read back — the wizard list and the Home card. Title
`type.bodyStrong`, gate line `type.caption` from the one function. `ds/ListRow` with
`title`/`subtitle` covers it; the wizard list adds a flush tertiary "Edit" as `trailing`.

**The type is not in the row.** What you do is already the title ("Run 5km", "Read 10 pages"); what
proves it is the only thing a reader cannot infer. The current `StepTasks` renders `{t.type}` as the
caption — a raw enum value, user-facing. That line is what this row replaces.

---

## 44. Home, today's proof card — amends the "Home, today's proof card" entry

Two changes to that spec.

**Gate line** the task row caption is now the gate line from the shared function, replacing the earlier
`gateLabel` sketch. Same order, same "Self-reported".

**Window closed** a pending row whose time window has passed reads
"Window closed · 6:00–9:00 am" in `type.caption`, goes inert (no chevron, no `onPress`), and takes a
`color.border` status ring instead of the `textSecondary` one. It is not done and it is not pending:
it is over.

**Do not dim the row.** `textSecondary` on `surface` is 6.59:1; the same colours under an
`opacity: 0.55` wrapper measure 2.89:1 and fail the 4.5:1 floor at body scale. The missing ring colour
and the missing chevron carry "inert" on their own — alpha-muting body type is never the way to say it. The day cannot be secured, and the row says why without an
alert.

**The CTA is conditional.** With more than one task there is no single next action, so the card has no
button and the rows are the call to action. With exactly one task the button stays — then it is not a
guess. Six tasks is the real case: the "Iron man" challenge has six.

| string | style |
|---|---|
| Window closed · {from}–{to} | caption textSecondary |
| {done} / {total} | caption medium brandText on brandTint |
| Post your proof | Button primary, single-task card only |

---

## 45. Time gate in the flow

**Header** `PushedHeader` title is "Day {n} · By 7:00 am" or "Day {n} · Between 9:30 and 10:30 am". The
window is in the chrome so it is never a surprise at the moment of posting.

**Three states**
| state | treatment |
|---|---|
| inside | normal flow. Caption under the button is the usual "Nothing is secured until the server says so." |
| under 15 minutes | the same caption position turns `color.brandText` and reads "{n} minutes left in the window." It is a caption, not a banner: the action has not changed, only the urgency |
| closed | a `Card` with a `clock` 24: "Window closed at 7:00 am. Today is not secured." and one line naming who set the window. The footer holds **only** a tertiary "Back" |

No override, no "post anyway", no appeal. A gate the user can talk past is not a gate, and the whole
product rests on that.

| string | style |
|---|---|
| Day {n} · By {time} | PushedHeader title |
| {n} minutes left in the window. | caption brandText, centred |
| Window closed at {time}. Today is not secured. | bodyStrong |
| The window is set by the challenge. Tomorrow opens at midnight. | secondary textSecondary |
| Back | Button tertiary |

---

## 46. Discard challenge

`ds/Sheet` (new) replacing `Alert.alert`. 60% ink scrim, `color.surface` sheet, heading
`type.heading`, one `type.secondary` line, then `Button variant="primary" destructive` and
`Button variant="tertiary"`.

`color.danger` is the destructive fill — the only place in the system a button is not
`color.primary`. `Button` already has a `destructive` flag; use it rather than passing a colour.

**The label is `color.canvas`, not `color.textPrimary`.** `#F5F3EE` on `color.danger` measures
3.36:1 and fails; `#0F0F0F` on the same fill is 5.14:1. The primary's light-on-brand pairing does not
carry over — `#F5F3EE` on `#BB471D` is 4.7:1 and passes, which is why the difference is easy to miss.
If `Button`'s `destructive` branch inherits the primary label colour, that is a bug in the component.

| string | style |
|---|---|
| Discard challenge? | heading |
| You'll lose what you've entered so far. | secondary textSecondary |
| Discard | Button primary destructive, `color.danger` fill with a **`color.canvas` label** |
| Keep editing | Button tertiary |

`DiscardPhotoModal` should move to the same component and inherit this shape: same sheet, heading
"Discard photo?", the same two buttons. It currently has no body line and no scrim treatment from DS_V3.

---

## Contradictions in the repo, for the migration plan

Cite these by path. Every one of them is a place the shipped code cannot express the model.

**1. `WizardTaskType` has ten values, the model has five.**
`components/create/v2/StepTasks.tsx:26` —
`simple | photo | timer | journal | run | counter | workout | reading | checkin | water`.

| current | maps to | gates |
|---|---|---|
| `simple`, `checkin` | `check_off` | none added |
| `photo` | `check_off` | **+ camera** |
| `timer` | `timer` | none added |
| `workout` | `timer` if it has a duration, else `check_off` | none added |
| `journal` | `text` | none added |
| `counter`, `water`, `reading` | `counter` | none added; `water` and `reading` become a **unit**, not a type |
| `run` | `run` | none added |

`water` and `reading` are the clearest case: they are a counter with a unit ("oz", "pages"), and
`claude/design/task-completion-v2/src/taskTypes.js:98` already admits it —
`TASK_TYPES.water = { ...TASK_TYPES.counter }`.

**2. The DB already collapses two of them, which helps.**
`backend/trpc/routes/challenges.ts:21` `dbTaskType()` and
`backend/lib/challenge-tasks.ts:191` `toTaskType()` both map `simple` and `photo` → `"manual"`,
so photo-ness already lives in config, not in the type. `challenges.ts:42` sets
`require_photo_proof: task.type === "photo" ? true : (task.requirePhotoProof ?? false)` — that line
*is* the type-to-gate migration, already written. It becomes `gates: ["camera"]`.

**3. There is a fourth proof mechanism in the schema that the model forbids.**
`backend/trpc/routes/challenges-create.ts:417` selects `require_heart_rate, heart_rate_threshold`,
and `checkins.ts:131` reads them. Heart rate is not one of the three gates and cannot be enforced
honestly (no wearable integration is named anywhere in the code paths read). Decide explicitly: drop the
columns, or keep them dormant and never render them. Do not let them become a fourth gate by accident.

**4. Timer strictness is not a gate, and three columns imply it is.**
`timer_direction`, `timer_hard_mode` (`challenges-create.ts:417`) and `strict_timer_mode`
(`challenges.ts:39`) describe how the Timer *type* behaves, not what proves it. They stay on the type,
under `config`, and never appear in the "What proves it" section.

**5. Location maps cleanly. Time does not exist at all.**
`require_location, location_name, location_latitude, location_longitude, location_radius_meters`
(`challenges-create.ts:417`) → `gates: ["location"]` with its config, no schema change needed.

There are **no time-window columns anywhere in the repo**. The Time gate is net-new: it needs
`gate_time_mode ("by" | "between")`, `gate_time_start`, `gate_time_end` and the challenge's
timezone, plus a server-side check in `backend/trpc/routes/checkins.ts` that rejects a check-in outside
the window. Until that check exists the gate must not ship — an unenforced gate shown as a gate is the
one thing this product cannot do.

**6. `routine_anchor` / `routine_anchor_custom` overlap the Time gate.**
Also `challenges-create.ts:417`. A soft "morning / evening" anchor and a hard window are two answers to
one question. Pick the gate and migrate anchors to it (morning → "By 12:00 pm" or similar), or keep
anchors purely as copy with no enforcement and no gate-line presence.

**7. `verification_method` is derived from the type.**
`checkins.ts:825` — `taskType === "photo" || requirePhoto ? "photo" : taskType === "timer" ? "timer"
: "manual"`. Under the model it derives from the **gates**: camera → "photo", no gates → "self_reported".
The string "manual" is doing two jobs today, "self-reported" and "unknown".

**8. The starter seed uses retired types.**
`backend/lib/starter-seed.ts:6-11` seeds `checkin`, `timer` and `journal`. The `checkin` and
`journal` rows need remapping in the same migration, or the onboarding starters arrive as types that no
longer exist.

**9. `WhoRespectedSheet` is on the pre-DS_V3 token set.**
It imports `DS_COLORS, DS_RADIUS, DS_TYPOGRAPHY` and uses `WEIGHT_SEMIBOLD` (600 body text, which law
3 forbids) and hardcoded 16/14/12pt sizes. When `ds/Sheet` lands, that file should be the first thing
moved onto it.

**Laws most at risk** 2 (no display face anywhere in chunk N — no number here is earned), 3 (the legacy
semibold in `WhoRespectedSheet`), 6 (one filled button per sheet or screen, and the multi-task Home card
has none), 9 and 22 (gate reveals are indented rows inside the sheet, not cards), 18 (the camera gate is
the only thing that can produce a Stamp, and "Verified" appears nowhere in chunk N), 23 (a
window-closed row loses its chevron and its handler together).

# Closing the task-completion loop

**Chunk** O. Frames 47 to 51, in `GRIIT Completion Loop.dc.html`. No new tokens, **no new components**.

Grounded against `abdelayaseen-netizen/GRIIT@main`, tree `f9a5ec94160a`. Read:
`components/task-v2/steps/{CountStep, TimerEntryStep, RunningStep, SessionStep, ChallengeDoneStep}.tsx`,
`components/ds/CommentRow.tsx`, `components/feed/{FeedPostV3, FeedEngagementRow, WhoRespectedSheet}.tsx`,
plus repo-wide searches for `timer_hard_mode` / `AppState` and for `MapView`.

**Two things the repo settled before this chunk starts**

1. **`ds/Sheet` shipped.** `WhoRespectedSheet` now renders
   `<Sheet visible onDismiss heading="Respects">` — chunk N's proposal was built and the legacy
   `DS_COLORS` import is gone from it. The comments sheet in frame 51 uses that component as-is.
2. **`ds/CommentRow` shipped**, exactly as specified in chunk M: `Avatar size={COMMENT_AVATAR_SIZE}`,
   name and time on one baseline, `type.body` below. Frame 51 uses it unchanged.

**The timer honesty line was wrong in the brief, and the repo says so.** `RunningStep.tsx` reads
"Runs on the clock. Lock your phone, put it down — we'll tell you when it's done", and
`TimerEntryStep.tsx` agrees: "Runs on the clock — lock your phone if you want". The timer is
wall-clock, computed from `startedAtIso` plus `requiredSeconds`, with a notification at the end.
So **"Leaving the app pauses it" must not ship** — it is false. The line on frame 49 is
"Runs on the clock. Lock the phone if you want." and, in the running state, "Leaving the app does not
stop it."

`timer_hard_mode` is **not** an app-backgrounding rule. It is a column read in
`backend/lib/challenge-tasks.ts:125` and `backend/trpc/routes/checkins.ts:89`, defaulting from
`strict_timer_mode`, and `challenges.ts:42` `taskStrictAndPhoto()` hardcodes `strict_timer_mode:
false` for every input — the tests at `challenges-create.test.ts:33-36` assert exactly that. **Nothing
sets it true.** Until a code path does, no screen may describe strict timer behaviour, because there is
none.

**There is no map.** A search for `MapView` across `components/` returns nothing, and no map library
appears in the paths read. Both the Run step and the place screen therefore show numbers and say so, in
one `type.secondary` line, rather than a grey rectangle standing in for a map.

---

## 47. Home, a multi-challenge day — amends frame 44

**One card, one section per challenge, `Divider` between.** Not one card per challenge.

The justification against laws 21 and 22: law 22 forbids a card inside a card, and three sibling cards
reach the same crowding by another route — three headers, three chips, three borders, stacked under the
streak block that already sits above them. The card **is** the day. The challenge is a section inside
it, which is what a `type.label`-scale header and a `Divider` are for. Law 21 keeps rows on the
canvas of their container; sections do not change that.

**Section head** challenge title `type.bodyStrong`, "Day {n} of {N}" `type.caption`, and that
challenge's own done/total chip right-aligned. The card keeps its own total chip in the header, so the
day and each challenge are both countable without arithmetic.

**One leading slot, three states.** A status ring, 20×20, `radius.pill`:

| state | ring | title | trailing | tappable |
|---|---|---|---|---|
| done | `color.brand` fill + `check` 12 in `color.canvas` | textSecondary | nothing | no |
| pending | 1.5pt `color.textSecondary` ring, no fill | textPrimary | `chevron-right` 20 | yes |
| window closed | 1.5pt `color.border` ring, no fill | textSecondary | nothing | no |

**No type icon in the row and no COMPLETE chip.** The type is already the title; a second glyph competes
with the only column that carries state. The chip duplicated the ring it sat beside.

**Do not dim the closed row** — the border ring and the missing chevron carry inert on their own. Same
finding as chunk N: `textSecondary` on `surface` is 6.59:1, and an `opacity: 0.55` wrapper drops it
to 2.89:1.

| string | style |
|---|---|
| Today | heading |
| {done} / {total} | caption medium brandText on brandTint |
| {challenge_title} | bodyStrong |
| Day {n} of {N} | caption textSecondary |
| Window closed · {from}–{to} | caption textSecondary |

---

## 48. Task done, day still open — the missing state

**This replaces both ad-hoc screens.** Build 57 showed a giant "2" with "3 tasks left." after one task
of six, and `ChallengeDoneScreen` ("{challenge} done. {n} challenge left today.") after another.
Neither is the Secured screen, because the day was not secured.

**No streak number on this screen, at any size, in any face.** The streak has not changed: one task of
six moves nothing. Showing "2" there is precisely the claim this product exists to refuse, and it is why
the ad-hoc screen was worse than no screen.

**Tree** no `PushedHeader` (there is nothing to go back to mid-flow — the footer owns both exits), a
44pt spacer, then:
1. `type.title` "{task} done."
2. `type.secondary` "{n} left to secure today." — counts every remaining required task across every
   active challenge, because that is what securing the day needs
3. `type.label` "{challenge} · Day {n} of {N}"
4. the same challenge's remaining tasks as status-ring rows; pending ones tap into their flow
5. `Divider`, then `type.label` "Also today" and one collapsed row per other challenge with
   remaining work: `circle-dashed` 20, "{challenge} · {n} left", chevron
6. footer: `Button variant="primary"` "Next task" (opens the first pending row, in the same challenge
   first) and `Button variant="tertiary"` "Done"

Sections 5 and its label do not render when nothing else is open.

**The two screens are never both shown.** Completing the **last** required task of the day does not land
here: it goes straight to the Secured screen (chunk K frame 4), which is the one screen that shows the
streak, because at that moment the streak has actually moved. The flow router must branch on the
server's `secured_today` after the check-in resolves — not on a client count of rows. If the server
says the day is not secured, this screen shows even when every row looks done; that is the same rule as
the Active challenge spec.

| string | style |
|---|---|
| {task} done. | title |
| {n} left to secure today. | secondary textSecondary |
| {challenge} · Day {n} of {N} | label textSecondary |
| Also today | label textSecondary |
| {challenge} · {n} left | bodyStrong |
| Next task | Button primary |
| Done | Button tertiary |

**Retire** `ChallengeDoneScreen` and `ChallengeDoneStep`. Its "{n} challenge left today" framing
counted challenges when the unit that secures a day is tasks, and its "Next challenge" button routed
into a specific enrollment — the decision the Home list now makes.

---

## 49. Counter, Timer and Run steps

All three on one chrome: `PushedHeader`, `type.title` task name, one `type.caption` honesty line,
a pinned `Button variant="primary"`, and the standing caption "Nothing is secured until the server says
so."

**The header names the gate when there is one, the type when there is not** — "Day 12 · Camera" over
"Day 12 · Timer". What the user has to satisfy outranks what they are doing.

**No display face on any of the three.** A count you typed, a timer counting down and a distance in
progress are work in flight. The numbers are large in the body face: 44/48 for the counter and the run
figures, 76pt for the timer, all `fontVariantNumeric: tabular-nums` so they do not jitter.

### Counter
Count as "{n} of {target} {unit}" — the number 44pt `color.textPrimary`, the rest `type.heading`
`color.textSecondary`. Then a 132pt `color.primary` circle "Add one" (the existing
`CountStep` press-and-hold-to-type gesture carries over, but it must not be the only route), and
"Remove one" / "Type it" as flush tertiary buttons.

CTA "Log {n} of {target}", disabled, becoming "Post" at target. The shipped label is
"{count} of {goal} logged", which reads as a receipt for something already recorded; "Log …" names the
action that has not happened yet.

Honesty line: "Self-entered count. Nothing is checked." — the shipped string is
"Self-entered count · nothing is checked.", and the only change is sentence case and a full stop, to
match every other honesty line in the system.

### Timer
Before start: `type.label` "Timer", the duration at 76pt, `type.secondary` "It has to reach zero.",
CTA "Start {mm:ss}". Running: the label becomes "Ends {clock}", the figure counts down,
`type.secondary` reads "Leaving the app does not stop it.", and "Pause" / "Reset" are flush tertiaries.
CTA is a disabled "Post" with the caption "Post opens when the timer reaches zero."

Keep the existing "Sound when it ends" switch from `TimerEntryStep` — with `ds/Switch` now, not RN's.

### Run
Distance and elapsed side by side, split by a 1pt `color.border` rule; distance carries
"of {target} {unit}" and elapsed carries pace. A `Card` states GPS status and, in one
`type.secondary` line, that there is no map. CTA "Start", then "Post" once the target distance is met,
with "Stop" as a flush tertiary while running.

### The Camera gate comes last
With Camera on a Counter, Timer or Run task, the capture step follows the work and never precedes it:
the count, the timer or the run resolves first, the step shows a `check` 20 `color.brandText` with
"{duration} done", and then the 4:5 capture frame. Otherwise the app can be handed a photo for a timer
that never ran, which is a gate in name only.

| string | style |
|---|---|
| Day {n} · {Counter\|Timer\|Run} | PushedHeader title, no gate |
| Day {n} · Camera | PushedHeader title, gate present |
| Self-entered count. Nothing is checked. | caption textSecondary |
| Runs on the clock. Lock the phone if you want. | caption textSecondary |
| It has to reach zero. | secondary textSecondary |
| Ends {clock} | label textSecondary |
| Leaving the app does not stop it. | secondary textSecondary |
| Distance and time come from GPS. | caption textSecondary |
| Waiting for GPS / GPS locked | bodyStrong |
| There is no map in the design system, so the run shows numbers only. | secondary textSecondary |
| Add one | secondary medium, on the primary circle |
| Remove one | Button tertiary flush |
| Type it | Button tertiary flush, brandText |
| Log {n} of {target} | Button primary, disabled |
| Post | Button primary |
| Post opens when the timer reaches zero. | caption textSecondary |
| The photo comes after the timer | caption textSecondary |
| {duration} done | secondary textSecondary with check 20 brandText |

---

## 50. Add task sheet, second pass

Frame 42's order and copy stand. Three additions and one retirement.

**The sheet is taller than the phone.** At 393×852 the content runs about 830pt against a 664pt clip
(852 − 44 status − 44 header − 100 footer), so it scrolls. Frame 50 shows it at two positions: A at
scroll-top with the starters, the name field and the type grid, B scrolled to the live preview and the
three gate rows. Do not read that as two screens.

**(a) Live preview row**, at the head of "What proves it": the exact `ListRow` the task will produce,
with its status ring, title and gate line, on `color.canvas` inside the `color.surface` sheet so it
reads as a specimen rather than a control. It updates as the switches move. **It retires the "No gates"
caption** from frame 42 — with all three off the preview renders "Self-reported", which shows the
outcome instead of describing it.

**(b) Type chips in a 3 × 2 grid.** Five chips in a wrapping row leaves "Run" alone on line two. A grid
of equal columns gives every type the same weight; the sixth cell stays empty rather than stretching
four chips to fill it. A horizontal scroller was the alternative and is worse here: five is few enough to
show at once, and hiding two behind a scroll edge makes the set feel longer than it is.

**(c) "Common tasks"**, above "What you do": a horizontal chip row — Pray, Run, Read, Water, Journal,
Workout — that prefills name, type and gates in one tap. Everything stays editable afterwards; the chip
does not lock or highlight persistently, because it is a shortcut and not a category. This is where
`water` and `reading` go once they stop being task types (chunk N contradiction 1): a starter that
prefills `counter` with a unit.

**(d) Time reveal and Set place.** The By/Between segmented control and its pickers are as frame 42.
"Set place" opens a pushed screen: a search field, a "Use my current location" row showing the live
accuracy, recent places, then radius chips 100 m / 250 m / 1 km, and one caption saying bigger is easier
to pass. Save is disabled until a place is chosen. **No map** — see above — so the radius is a number,
stated, not a circle nobody can see.

| string | style |
|---|---|
| Common tasks | label textSecondary |
| Pray · Run · Read · Water · Journal · Workout | Chip variant form |
| Set place | PushedHeader title |
| Search an address | TextField placeholder |
| Use my current location | bodyStrong, locate-fixed 24 brandText |
| Accurate to about {n} m right now | caption textSecondary |
| How close you have to be | label textSecondary |
| 100 m · 250 m · 1 km | Chip variant form |
| Bigger radius, easier to pass. There is no map in the design system, so the radius is a number, not a circle on a map. | caption textSecondary |
| Save place | Button primary, disabled until a place is set |

---

## 51. Comments inline, and the respect state

**Comments open in `ds/Sheet`, not a route.** `onCommentPress` presents the sheet over the feed:
heading "Comments", the `CommentRow` list, and the composer pinned above the keyboard — the same
composer and the same copy table as frame 39. The post stays behind the 60% scrim and the feed's scroll
position survives, which pushing `/post/[id]` destroys. The route **stays** for deep links and
notification taps; it is the same list in a screen instead of a sheet.

Inside the sheet the composer field is `color.canvas` on the `color.surface` sheet — inverted from
the route version, where the field is surface on canvas. Same 1pt border either way; the field stays one
step from its ground.

**The heart.** `components/feed/FeedPostV3.tsx:132` renders
`<Heart size={ICON} color={liked ? DS_V3.color.brandText : DS_V3.color.textPrimary} />` — **no
`fill`**. It recolours an outline, which is why respect never reads as landing. The fix is the pattern
already written in `FeedEngagementRow.tsx`: pass `fill` with the colour.

| state | icon | count |
|---|---|---|
| not respected | `Heart` outline, `color.textSecondary`, no fill | `type.secondary` medium textSecondary |
| respected | `Heart` `color.brand` with `fill={color.brand}` | `type.secondary` medium brandText |

Two more things in that file to reconcile, not to redesign: the un-respected outline should be
`textSecondary` (it is `textPrimary` today, which makes an untouched heart the brightest thing in the
row), and `FeedEngagementRow`'s spring bounce is the one animation here — law 19 allows it, one
gesture, one spring.

---

## Contradictions in the repo, for the migration plan

Numbered from chunk N's list, which ended at 9.

**10. `ChallengeDoneScreen` counts the wrong unit.** `ChallengeDoneStep.tsx` passes
`remainingChallenges` and the screen renders "{challenge} done. {n} challenge left today." A day is
secured by finishing **tasks**, across every challenge; challenges remaining is not a number that
appears in that rule. Replace with frame 48, which counts remaining required tasks.

**11. There is no "task done, day open" state in the flow at all.** The steps directory holds
`ConfirmationStep`, `ReviewStep`, `VerifyingStep`, `FailedStep`, `WindowClosedStep` and
`ChallengeDoneStep` — and nothing between "this task is recorded" and "the day is secured". That gap
is why two screens grew into it. Frame 48 is the state; the router branches on the server's
`secured_today`.

**12. `SessionStep` uses the forbidden word, and misstates what is checked.**
"Stopping fills the duration field for you — the photo is still what gets verified." Two problems:
"verified" is reserved for a camera-proof stamp and never appears in flow copy, and a photo is not
*verified* by anything — it is *required*. Rewrite as "Stopping fills in the duration. The photo is
still required."

**13. `CountStep` special-cases a task type that the model deletes.**
`taskType === "reading" ? <Attach a page photo> : null` — under the one-type/three-gate model,
`reading` is `counter` with unit "pages", and an optional page photo is either the Camera gate (then
it is not optional) or nothing. Remove the branch; the starter chip in frame 50 covers the intent.

**14. `CountStep`'s CTA claims the log already happened.** "{count} of {goal} logged" is the label on
a **disabled submit button** — nothing has been logged. "Log {n} of {target}" names the pending action.

**15. Press-and-hold is the only discoverable route to typing a count.**
`CountStep` has a visible "Type the number" tertiary *and* a 450ms hold on "Add one", explained by a
`styles.tiny` line. Keep the visible button, keep the hold as an accelerator, and drop the instruction
line — a gesture that needs a caption is not carrying its weight.

**16. `strict_timer_mode` is dead in the write path but live in the read path.**
`challenges.ts:42` `taskStrictAndPhoto()` returns `strict_timer_mode: false` unconditionally
(asserted by `challenges-create.test.ts:33-36`), while `challenge-tasks.ts:125` and
`checkins.ts:89` still read `timer_hard_mode` / `strict_timer_mode` and hand them to the client.
A flag no writer sets and three readers respect is a trap. Either implement it with a stated rule and
copy, or delete both columns with the chunk N migration.

**17. `FeedPostV3` heart has no `fill`** — `FeedPostV3.tsx:132`. See above. Note that
`FeedPostCard`/`FeedEngagementRow` do it correctly, so the two feed cards disagree with each other
about what respect looks like.

**18. `FeedPostCard` is on the daylight palette inside a dark app.** It imports
`DS_DAYLIGHT.color.accent` for the double-tap heart overlay and `DS_DAYLIGHT.color.textOnPhoto` for
the kudos chip (lines ~181-187). Whatever the migration does with that card, those two references are
not DS_V3.

**19. No map library.** `MapView` appears nowhere under `components/`. Frames 49 and 50 are designed
without one and say so on screen. If a map is added later, the Run step and the place screen are the two
places it belongs — and the copy lines that mention its absence come out in the same change.

**Laws most at risk** 2 and the Sept 6 amendment (no display face anywhere in chunk O — the counter, the
timer, the run figures and the respect count are all body face, and frame 48 shows no streak at all),
6 (one filled button per screen; the multi-challenge card has none), 19 (the heart spring is the one
animation), 21 and 22 (one card per day with sections, not three sibling cards), 18 ("verified" appears
nowhere, and `SessionStep`'s use of it is logged above), 23 (done and closed rows lose their chevron
and their handler together).

# The miss

**Chunk** P. Frames 52 to 57, in `GRIIT The Miss.dc.html`. No new tokens, **no new components**.

Grounded against `abdelayaseen-netizen/GRIIT@main`, tree `f9a5ec94160a`. Read in full:
`backend/lib/{daily-reset, last-stand, streak}.ts`,
`backend/trpc/routes/{profiles-stats, streaks}.ts`, `lib/{notifications, use-reconcile-streak}.ts`,
`components/StreakFreezeModal.tsx`.

## The rules, as the code has them

**a. What happens when a day ends unsecured.** Two independent paths, and they do not agree.

| path | trigger | what it writes |
|---|---|---|
| `runDailyReset` — `backend/lib/daily-reset.ts:19` | cron ~00:30 UTC hitting `/internal/daily-reset` (stated in the file header) | `active_streak_count: 0` **and** `last_completed_date_key: null` (`daily-reset.ts:148-151`) |
| `profiles.reconcileStreak` — `backend/trpc/routes/profiles-stats.ts:32` | client, from `useReconcileStreakIfNeeded` at `app/(tabs)/index.tsx:102`, once per user per JS session (`lib/use-reconcile-streak.ts:18`) | `active_streak_count: 0` **only** (`profiles-stats.ts:158-161`) |

"Missed" is per-user timezone in both: `getYesterdayDateKey(tz)` with `profiles.timezone`, falling back
to `reminder_timezone` then `"UTC"` (`profiles-stats.ts:76-77`, `daily-reset.ts:63`). A day counts as
secured iff a `day_secures` row exists for that date key (`daily-reset.ts:78-84`) — binary, no partial.

**`reconcileStreak` already returns everything frame 52 needs**:
`{ streak_broken, previous_streak, lastStandUsedThisSession, lastStandsAvailable }`
(`profiles-stats.ts:165-170`). The client receives it and renders none of it — `previous_streak` goes
into `trackEvent("streak_broken")` and is discarded (`use-reconcile-streak.ts:28-34`). **The morning-after
block needs no new endpoint.**

**b. Freezes are manual, and unreachable.** `streaks.useFreeze` (`backend/trpc/routes/streaks.ts:66`)
validates: the date must be yesterday (`:73`), exactly one missed day (`:119-121`), an active streak
(`:122`), and remaining > 0 (`:125`). Limits are `STREAK_FREEZE_PER_MONTH_FREE = 1` /
`_PRO = 4` (`streaks.ts:7-8`) with a 30-day refill from `last_freeze_used_at`
(`FREEZE_RESET_DAYS = 30`, `:11`; `effectiveFreezesRemaining` `:22`).

**No client code calls it.** `StreakFreezeModal`'s `onUseFreeze` is wired at
`app/(tabs)/index.tsx:474` to `() => setShowFreezeModal(false)` — the button offering
"Use streak freeze (1 remaining)" only dismisses the modal. So: **manual, offered, and does nothing.**

**c. Last Stand is automatic, enforced, and real.** `backend/lib/last-stand.ts`:
`MAX_LAST_STANDS = 2`; earned when `securedDaysInLast7 >= 6` and available < 2
(`shouldEarnLastStand`, `:8`). Consumed automatically on a miss by **both** reset paths —
`daily-reset.ts:137` and `profiles-stats.ts:107` — gated on `subscription_status` being
`premium` or `trial`, inserting a `last_stand_uses` row and keeping the streak.

Both paths then exclude `last_stand_uses` date keys from `effectiveMissedDays`
(`profiles-stats.ts:88-91`), which is how the streak survives.

**There is no grace window and no countdown.** Nothing is granted, nothing expires, and the user does
nothing: it is applied retrospectively and announced by push. Brief item 4's "grace window on Home, the
countdown, what completing it means" **describes a rule the code does not have** — so there are no frames
for it. What exists is a receipt, which is frame 52B, plus a row in the record (frame 55).

**d. Partial miss is not distinguished anywhere.** `day_secures` is binary. Nothing in the paths read
compares completed tasks against required tasks for a past day. The raw material exists —
`check_ins` rows are per task per `date_key`, counted by `getCheckinHeatmap`
(`profiles-stats.ts:~400`) — but no endpoint aggregates them against a required count, so "4 of 6"
needs a new query. Decision below.

**e. Groups.** I did not find a yesterday-state field on the roster payload in the routes read. Frame 56
assumes one derived from each member's `day_secures` row for the group's yesterday key. Decision below.

**f. Notifications before a day ends.** `SECURE_REMINDER_TIME = "20:00"` is a **constant, not a user
setting** — `lib/notifications.ts:21`, with the comment "Production has no
profiles.preferred_secure_time". Four things can fire in one evening:

| id | time | source |
|---|---|---|
| `secure-day-reminder` | 20:00 | `scheduleNextSecureReminder`, `notifications.ts:~118` |
| `secure-two-hours-left` | 22:00 (trigger + 2h) | same fn, `ENABLE_TWO_HOURS_LEFT` `:83` |
| `streak-at-risk-45min` | 23:15 | same fn, `:178` |
| `streak-reminder-10pm` | 22:00 daily | `scheduleStreakReminder`, `:~560` |

Two of those are at 22:00. And the body can never name the count: `vars` is built as
`{ streak: streakCount ?? 0, tasks: 0 }` — **`tasks` is hardcoded 0** (`notifications.ts:~130`).

---

## Decisions for Yaseen

| # | question | code today | recommendation | why |
|---|---|---|---|---|
| 1 | Freeze automatic or manual? | manual, and unreachable | **manual, wired** | An automatic freeze spends a scarce thing without asking, and the user finds out afterwards. A freeze is the one place the product should ask. Frame 54 is the offer. |
| 2 | Should `useFreeze` restore the streak directly? | it only decrements the counter and stamps `last_freeze_used_at`; the streak survives because both readers exclude that date key | **make it explicit** — have `useFreeze` return the restored streak, and set `active_streak_count` back | Today the restore is a side effect of a filter. Frame 54 promises "your 12-day streak comes back"; that promise needs a write, not an inference. |
| 3 | More than one freeze inside 30 days? | impossible — `frozenDateKeys` is derived from the single `last_freeze_used_at` timestamp (`profiles-stats.ts:79-81`), so a second freeze overwrites the first | **add a `freeze_uses` table**, mirroring `last_stand_uses` | A Pro tier that advertises four a month cannot deliver two. This is a data-model bug, not a design choice. |
| 4 | Can a free user ever spend a Last Stand? | no — both paths require premium/trial, but `shouldEarnLastStand` has no tier check, and `getStats` returns `lastStandRequiresPremium` for exactly this case (`profiles-stats.ts:270`) | **do not let free users earn them** | Earning a cushion you can never spend, then being told at the moment of loss that it needed Pro, is the worst possible time to sell. Either gate the earn or gate nothing. |
| 5 | Partial miss: does 4 of 6 earn anything? | nothing distinguishes it | **no, and show the 4** | Your lean, and it is right: a day is secured or it is not. But the record showing only "missed" is shorter than the truth. Frame 55 shows the count and earns nothing from it. |
| 6 | Does a Last Stand day appear as secured? | it is excluded from missed days, so it reads as secured everywhere | **its own third state** | It is not camera proof and not self-reported. Frame 55 gives it a line in the split and a row label, "Held by a Last Stand". |
| 7 | Which field distinguishes the two zeros? | `total_days_secured` (`getStats.totalDaysSecured`) and `longest_streak_count` both work | **`total_days_secured > 0`** | `longest_streak_count` is 0 for a user whose only secured days were never consecutive. Days secured is the honest test of "have you ever done this". |
| 8 | Group roster yesterday state | not found in the routes read | **derive per member from `day_secures` at the group's yesterday key** | The roster already reads `getSecuredDateKeys`-shaped data for today; yesterday is the same query one key back. |
| 9 | Four evening notifications? | yes, two of them at 22:00 | **two: 20:00 and 22:00** | Frame 57. Delete `streak-at-risk-45min` (23:15 is not an honest moment, it is a panic) and collapse the duplicate 22:00 pair. |
| 10 | Dismissal of the morning-after block | no such state exists | **once read, per date key** — persist `miss_ack_date_key` locally | It is a receipt, not a nag. It should not greet them twice. |

---

## 52. The morning after

One block, between the streak hero and the Today card, dismissible with an `x` in a 44pt slot. Order is
fixed: **fact, cost, cushion.**

**Tokens** `color.surface` + `border`, `radius.card` 20 · `type.bodyStrong` the fact ·
`type.secondary` the cost and cushion lines · `color.primary` for the freeze action when there is one ·
`type.caption` for its cost line. **No `color.danger` anywhere** — a miss is a fact, not an error, and
the one red in this system is destructive confirmation.

**Reuse** `ds/Card`, `ds/Button variant="primary"`, `ds/Icon`. Nothing new.

**Data** all of it from `reconcileStreak`'s existing return plus the day's task rows:
`streak_broken`, `previous_streak`, `lastStandUsedThisSession`, `lastStandsAvailable`, and
`streaks.getFreezeStatus` for `{ remaining, limit }`.

| variant | lines |
|---|---|
| reset | "Yesterday wasn't secured." / "{done} of {total} tasks. {missed task names}." / "Your streak reset to 0. Your longest was {longest} days." |
| Last Stand | … / … / "A Last Stand covered it, so the streak continues. {n} left." |
| freeze available | … / … / "Your streak reset to 0. A freeze can undo that for yesterday." + primary "Use a freeze for yesterday" + caption "{n} left. It refills 30 days after you use it." |

**Copy**
| string | style |
|---|---|
| Yesterday wasn't secured. | bodyStrong |
| {done} of {total} tasks. {missed}. | secondary textSecondary |
| Your streak reset to 0. Your longest was {n} days. | secondary textSecondary |
| A Last Stand covered it, so the streak continues. {n} left. | secondary textSecondary |
| Your streak reset to 0. A freeze can undo that for yesterday. | secondary textSecondary |
| Use a freeze for yesterday | Button primary |
| {n} left. It refills 30 days after you use it. | caption textSecondary, centred |

The Last Stand variant is a **receipt, not a celebration**: same card, same weight, no icon, no colour
change, and the streak hero above it is unchanged because the streak genuinely did not move.

Name the missed tasks. "4 of 6" without them makes the user go looking, and the two they missed is the
only actionable thing on the screen.

---

## 53. The streak hero at zero

Two zeros, one line apart.

| condition | line |
|---|---|
| `totalDaysSecured === 0` | "Post today to start." |
| `totalDaysSecured > 0` | "Streak reset. Post today to start again." |

Both at `type.secondary` `color.textSecondary` under the `DisplayNumber`. The number itself is
unchanged — 0 in the display face, because a reset zero is still the true earned number.

---

## 54. The freeze offer, and the refusal

`ds/Sheet` over Home. Heading `type.heading`, one `type.secondary` line stating the trade and its
cost, then `Button variant="primary"` and `Button variant="tertiary"`.

| state | copy |
|---|---|
| one or more left | "Use a freeze for yesterday?" / "Your {n}-day streak comes back. {m} left, and it refills 30 days after you use it." / "Use the freeze" / "No, let it reset" |
| none left | "No freezes left" / "Yours refills on {date}. Pro carries four a month instead of one." / "See Pro" / "Close" |

**"No, let it reset" is a real answer** at ordinary tertiary weight. The shipped modal's equivalent is
"Let it reset" in `DS_COLORS.textMuted` at 13pt — quieter than the body text above it, which makes
refusal look like a mistake.

**Nothing celebrates.** No flame, no colour, no animation. A freeze is a thing you spend, and the sheet
names what it costs before you spend it. The shipped modal opens with a `Flame` in
`GRIIT_COLORS.primary` — that is the treatment for a milestone, not for a loss.

**Where it appears** from the morning-after block's primary. Not on launch unprompted: an interstitial
before the user has seen the fact is asking for money before stating the price.

---

## 55. Consistency, with the partial admitted — amends frame 41

Two additions to that entry.

**A third line in the split.** Under Camera proof and Self-reported, inside the same `Card`: "Held by a
Last Stand — {n} days" with a `shield` 16. A Last Stand day is none of the other two things, and
folding it into either would be the exact claim the record must not make.

**A day-by-day section** under "By month", one 44pt row per day of the selected month:

| label | detail | style |
|---|---|---|
| Secured | "{n} of {n} · {m} camera proof" | label `bodyStrong`-weight secondary in textPrimary |
| Not secured | "{done} of {total} · {missed task names}" | label secondary in textSecondary |
| Held by a Last Stand | "{done} of {total} · nothing was checked" | same |

**No total on the screen moves for a partial day.** Days secured, Completion, Longest streak and Total
secured are all unchanged by a 4 of 6. The footer caption says so: "A day is secured or it is not. A
part-done day counts for nothing, and the count is here so the record is not shorter than the truth."

This needs a new query: completed `check_ins` per `date_key` against the required task count for that
day. See decision 5.

---

## 56. Group roster, yesterday — amends frame 34

The trailing caption gains one value. Same slot, same `type.caption`, same
`color.textSecondary`:

| value | when |
|---|---|
| Secured today | `day_secures` row for today |
| Not yet today | no row today, and they secured yesterday |
| Missed yesterday | no `day_secures` row for the group's yesterday key |

**No colour, no icon, no red.** The words are enough, and a shaming treatment turns the roster into a
place people stop opening. "Secured today" keeps its `color.brandText`; "Missed yesterday" does not get
an opposite.

**The group streak line names who.** "Broke yesterday, when {name} missed." A group number that drops
without a reason is the same honesty gap as a personal one, and in a group of four everyone knows anyway
— saying it is less pointed than making them work it out.

---

## 57. The evening before

**Two notifications, not four.** Delete `streak-at-risk-45min` (23:15) and collapse the duplicate
22:00 pair — `secure-two-hours-left` and `streak-reminder-10pm` fire at the same minute with different
copy. 23:15 is not an honest last moment; it is a panic with 45 minutes of runway.

**The count is the message.** `vars.tasks` must carry the real remaining count — it is hardcoded 0
today, which is why the shipped copy falls back to streak language.

| time | state | title | body |
|---|---|---|---|
| 20:00 | nothing done | GRIIT | {challenge}: {total} tasks left today. Four hours to secure. |
| 20:00 | partial | GRIIT | {challenge}: {n} of {total} left today. Four hours to secure. |
| 20:00 | only camera tasks left | GRIIT | {challenge}: {n} left, both need a photo. Four hours to secure. |
| 22:00 | streak at stake | GRIIT | {n} left. A {streak}-day streak ends at midnight. |
| 22:00 | no streak yet | GRIIT | {n} left. Two hours to secure today. |

Singular/plural: "{n} left, and it needs a photo" at one.

**No exclamation marks.** The shipped strings break this repeatedly:
"Don't break your ${streakCount}-day streak!" (`notifications.ts:~155`), "One more day!" and
"Tomorrow is Day ${nextDay}!" (`:~330`). "Complete your tasks to keep the streak alive"
(`:~570`) is also outside this voice — it is a slogan, not a count.

The camera-tasks variant matters because it is the one case where a late reminder changes the outcome: a
self-reported task can be logged at 23:58, a photo cannot be taken of a workout that did not happen.

---

## Contradictions in the repo, for the migration plan

Numbered from 20; chunk O ended at 19.

**20. Two reset paths write different things.** `daily-reset.ts:148-151` nulls
`last_completed_date_key`; `profiles-stats.ts:158-161` leaves it. Whichever runs second sees a
different world, and `useFreeze` depends on `last_completed_date_key` to compute `missedDays`
(`streaks.ts:119`) — so **after the cron has run, a freeze can never validate**, because the key is
null and `missedDays` is `[]`. The freeze is unusable by 00:30 UTC regardless of the user's timezone.

**21. `StreakFreezeModal`'s primary button does nothing.**
`app/(tabs)/index.tsx:474` — `onUseFreeze={() => setShowFreezeModal(false)}`. It offers "Use streak
freeze (1 remaining)" and dismisses. `streaks.useFreeze` is called from no client path.

**22. `useFreeze` never restores the streak.** `streaks.ts:127-131` updates
`streak_freezes_remaining` and `last_freeze_used_at` and nothing else. The streak survives only
because two readers exclude that date key. See decision 2.

**23. Only one day can ever be frozen.** `frozenDateKeys` is a `Set` built from the single
`last_freeze_used_at` timestamp (`profiles-stats.ts:79-81`, and identically at `:238-240`). A Pro
user's second freeze in 30 days silently un-freezes the first. See decision 3.

**24. Free users earn Last Stands they can never spend.** `shouldEarnLastStand`
(`last-stand.ts:8`) has no tier check; both consumption paths require premium/trial
(`daily-reset.ts:137`, `profiles-stats.ts:109`). `getStats` has a field for the resulting dead end,
`lastStandRequiresPremium` (`:270`).

**25. Two different push copies for one event.** `daily-reset.ts:~210` sends "Last Stand activated /
Your {n}-day streak was saved. {n} Last Stands remaining."; `profiles-stats.ts:~140` sends "Last Stand
used / Your streak continues." Same event, whichever path got there first.

**26. `reconcileStreak`'s return value is computed and discarded.**
`use-reconcile-streak.ts:28-34` uses `previous_streak` for analytics and invalidates the query.
`streak_broken` and `lastStandUsedThisSession` are never rendered. Frame 52 needs no new endpoint.

**27. `getStats` returns two fields hardcoded false.** `lastStandUsedThisSession: false` and
`streakLostNoLastStand: false` (`profiles-stats.ts:287-288`) — placeholders the real values for which
exist on `reconcileStreak`. A consumer trusting `getStats` for either gets a wrong answer.

**28. `vars.tasks` is hardcoded 0 in the secure reminder.** `notifications.ts:~130`. The 8pm
reminder cannot name the count it exists to name.

**29. Four evening notifications, two at the same minute.** See the table above.

**30. Notification copy breaks the voice in at least four places.** Exclamation marks at
`notifications.ts:~155`, `:~330` (twice), and slogan copy at `:~570`. Also
`getStreakAtRiskCopy` from `@/constants/identity-copy` is unread here and should be audited in the
same pass.

**31. `StreakFreezeModal` is on the pre-DS_V3 palette.** It imports `DS_COLORS`, `GRIIT_COLORS`
and `DS_RADIUS`, uses `DS_COLORS.white` on `GRIIT_COLORS.primary`, and hardcodes 18/14/13pt. When
`ds/Sheet` takes it over (frame 54), all of that goes.

**32. The modal says "week", the code says 30 days.** "No freezes left this week — upgrade to Premium
for more" and `accessibilityLabel` "…{n} remaining this week" (`StreakFreezeModal.tsx:38,46`), against
`FREEZE_RESET_DAYS = 30` (`streaks.ts:11`). It also calls the freeze a "last stand" in that same
accessibility label, conflating the two mechanics.

**Laws most at risk** 2 (the streak hero and the record hero are the only display numbers in the chunk;
the notification counts, the task counts and the freeze counts are all body face), 6 (one filled button
per screen — the morning-after block's freeze action is the screen's only primary, and the Last Stand and
reset variants have none), 9 and 22 (the morning-after block is one card above the Today card, not a card
inside it; the Last Stand line lives inside the existing stats card), 18 (a Last Stand day is explicitly
not camera proof and carries no Stamp), 21 (roster rows stay on the canvas with their caption slot
unchanged).

# The proof moment, the proof grid, and the last light screens

**Chunk** Q. Frames 58 to 66, in `GRIIT Proof Moment.dc.html`. No new tokens, **one new component**:
`ds/ControlPill`, declared in `cursor/01_components.md` and justified at frame 62.

Grounded against `abdelayaseen-netizen/GRIIT@main`, tree `9e4f1d5897ae`, build 58 on device. Read:
`app/task/secured.tsx`, `app/edit-profile.tsx`, `components/task-v2/{TaskCapture, TaskConfirmation,
MomentScreenV3}.tsx`, `components/home/DiscoverCTA.tsx`, `lib/profile-consistency.ts`,
`backend/lib/proof-predicate.ts`, `backend/trpc/routes/profiles-record.ts`.

Source for this chunk: `src/components/{ProofMoment, SecuredDay, ProofsGrid, ControlPill}.tsx` and
`src/lib/consistency.ts`.

---

## 58. The proof moment — after a task, day still open

Amends frame 48. Same rule about the Secured screen: **these two are never both shown.** Branch on the
server's `secured_today` after the check-in resolves.

**The photo leads.** A camera task that ends on a text list throws away the one artefact the user just
made, three seconds after making it. It renders at 300pt, `objectFit: cover`, `radius.card` — not
full 4:5, because the sentence and the two buttons have to clear the fold underneath it.

**The share choice is two buttons, both one tap, both advancing.** "Share to the feed" is the primary;
"Keep it to the record" is a secondary at the same height. Neither is a default and neither is a
dismissal: a photo stays private until this screen is answered. No switch, no "post anyway", no
ceremony.

**A self-reported task gets no share choice** and no photo — there is nothing to show. It keeps the
frame 48 shape: the remaining rows of the same challenge, then "Next task" and "Done".

**Copy**
| string | style |
|---|---|
| {task} done. | title |
| Camera proof, recorded. {n} left to secure today. | secondary textSecondary |
| Self-reported, recorded. {n} left to secure today. | secondary textSecondary |
| Camera proof, recorded. {challenge} is done for today. {n} left to secure today. | secondary textSecondary |
| {challenge} · Day {n} of {N} | label textSecondary |
| Share to the feed | Button primary, arrow-up-right 20 |
| Keep it to the record | Button secondary |
| Next task | Button primary |
| Done | Button tertiary |

`{n} left to secure today` counts required tasks across **every** active challenge, not the current
one — that is the number the day turns on.

**The rule: exactly one of frame 58 and frame 59 is ever shown, and the share choice rides on whichever
one it is.**

```
on check-in resolved:
  if server says secured_today  -> frame 59 (Secured)
  else                          -> frame 58 (proof moment)

the footer of whichever screen is shown:
  if the completion that closed it carried an unshared photo
                                -> Share to the feed / Keep it to the record
  else                          -> Done  (59)  |  Next task / Done  (58)
```

The last camera task of the day is the case this fixes: it secures the day, so frame 58 is skipped, and
in v25 the photo went straight to the record with no choice ever offered. Frame 59 now carries the same
two buttons in the same order with the same labels. **Never 58 then 59** — two receipts for one tap, and
the user would answer the same question twice.

With several unshared photos in the day (frame 59C), "Share to the feed" shares **the day** as one post,
not the closing photo alone: the screen the user is answering is a day, and posting one of four photos
they cannot see selected is a choice they did not make. "Keep it to the record" dismisses the screen —
it is the Done button, renamed to say what dismissing means.

**States**: camera / self-reported / last task of one challenge with others open / last task of the day,
unshared photo (frame 59 with the share footer) / last task of the day, no photo (frame 59 with Done) /
share failed (the row stays, one caption "Not shared. It is in your record." — the proof is recorded
either way, and sharing is not part of securing).

---

## 59. Secured, for a day that holds several proofs

**"Day 2." is gone.** A day number belongs to a challenge; with three running there are three of them,
and an unqualified one is unanswerable. The hero is the **streak**, which is the number the day itself
owns. Day numbers appear only with a challenge name attached — in the caption under a single photo, or
in the rows of the zero-photo state.

**The image area, by count**

| proofs | treatment |
|---|---|
| 0 | **no image area at all** — a `Card` listing each challenge with `shield-off` 16 and "Self-reported" |
| 1 | the photo, full width, 240pt, with "{challenge} · Day {n} of {N}" under it |
| 2+ | three square tiles at 112pt, the third carrying a `+n` on a 62% ink scrim; the caption names the challenges |

Never an empty card. Build 58 renders the image frame whether or not `proofUri` is set, which is the
grey box in the screenshot — `secured.tsx` passes `proofUri` as a single optional param, so the
component has no way to know a day held four photos.

**Copy**
| string | style |
|---|---|
| Current streak | label textSecondary |
| {streak} | numberSize.moment, displayFace |
| days / day | body textSecondary |
| Today is secured. | bodyStrong |
| {n} tasks across {m} challenges. {k} camera proofs. | caption textSecondary |
| {n} tasks, all self-reported. Nothing was checked. | caption textSecondary |
| {challenge} · Day {n} of {N} | secondary textSecondary (rows) / caption textSecondary (photo caption) |
| Self-reported | caption textSecondary |
| +{n} | bodyStrong on a 62% ink scrim |
| Done | Button primary |

"across {m} challenges" only when m > 1.

---

## 60. Profile → Proofs

**Sectioned by date, labelled by challenge.** "Day 13" on a tile is the ambiguity frame 59 removed: a
single day can hold a Day 13 of Iron man and a Day 2 of Quick Steps, and with several proofs per day the
grid would show the same number twice meaning different things, or different numbers on adjacent tiles
from the same afternoon.

- **Section header** per date, `type.label` `color.textSecondary`: "17 September · 2 proofs". The
  date is said once, not on every tile, and it is the axis the grid is already ordered by.
- **Tile label** the challenge name, burned into the bottom-left at 12/16 medium
  `color.textPrimary` with a `0 1px 3px rgba(0,0,0,0.8)` shadow, `nowrap` with ellipsis at
  `calc(100% - 16px)`. Inside the tile, not captioned below it — the grid is photographs, and a caption
  row per tile turns it into a list.
- The day number is **not** on the tile. At 114pt "Daily Gratitude · Day 8" cannot be read, and the
  number is the part the user can reconstruct from the date; the challenge is the part they cannot.

**Tile** square, `radius.input` 12, 3-up, 6pt gutters, `objectFit: cover` from the 4:5 original,
newest first within each date section.

**Full-view header is the date**, "17 September", for the same reason. The challenge and its day number
go in the body line underneath — "{challenge} · Day {n} of {N} · {date}, {time}" — where there is room
to say both and neither is ambiguous.

**Self-reported days do not appear.** There is no photo. A placeholder tile is a picture of a proof that
does not exist, which is the rule this whole system runs on. The count under the grid names them so the
grid is never read as the whole record: "9 camera proofs. 4 more days were secured self-reported and
have no photo."

**Two different empty states**, and they must not share copy:

| condition | heading | body |
|---|---|---|
| no camera proofs, no secured days | No camera proofs yet | A proof lands here when a task with the Camera gate is done. Nothing can be added from your library. |
| no camera proofs, but secured days exist | No camera proofs yet | Your {n} secured days were all self-reported. A task with the Camera gate puts a photo here. |

A user who has secured eleven days self-reported has not failed at anything, and must not read the
new-user message.

**Full view** `x` / "Day {n}" / overflow, the photo at its true 4:5, then task name, "{challenge} ·
Day {n} of {N} · {date}, {time}", and a surface pill listing the gates it passed: "Camera · By 7:00 am ·
Taken in the app". One secondary "Share". No Stamp on this screen — the pill says more than the stamp
does, and it says it in words.

Data: `profiles.getRecord` already returns `proofs: [{ id, day, thumbUrl, capturedAt }]`
(`profiles-record.ts:350`) and `splitSecuredProof` already computes `cameraDays` /
`selfReportedDays` (`proof-predicate.ts:59`). The grid needs the gate list added to each proof row;
everything else exists.

---

## 61. Run step, typed values

Same chrome as Counter and Timer (frame 49). The shipped copy asserts GPS for numbers the user typed,
and carries a sentence about the design system that belongs in a handoff, not on a phone.

| variant | honesty line |
|---|---|
| typed (today) | You type the distance and time. The photo is what is checked. |
| GPS (when it exists) | Distance and time from GPS. The photo is still required. |
| typed, no Camera gate | You type the distance and time. Nothing is checked. |

Distance and Duration are two 52pt fields side by side with their units as trailing captions, then a
derived pace line ("5:19 per km. Target met."), then the capture frame. **The photo comes after the
numbers**, same rule as Timer + Camera: the app must not be handed a photo for a run that was never
entered.

The header names the gate: "Day {n} · Camera" when the Camera gate applies, "Day {n} · Run" when it does
not.

| string | style |
|---|---|
| Distance / Duration | label textSecondary |
| km / mi / mm:ss | caption textSecondary, trailing |
| {pace} per {unit}. Target met. | caption textSecondary |
| {pace} per {unit}. {n} {unit} short. | caption textSecondary |
| The photo comes after the numbers | caption textSecondary |
| Take photo | Button primary, camera 20 |

---

## 62. Secondary controls

Pause, Reset, Remove one and Type it were bare `brandText` labels, left-aligned in a column with large
gaps. Three problems: they read as an unstyled link list, they spend the accent colour on the least
important control on the screen, and their tap target is the text bounds.

**They become pills**: `minHeight: 44`, `0 16px`, `radius.pill`, `color.surface`, 1pt border,
`type.secondary` medium in `color.textPrimary`, with an 18pt `color.textSecondary` leading glyph.
Centred in a row under the element they act on, never a left stack.

`src/components/ControlPill.tsx`, declared in `cursor/01_components.md`. Applies to Timer (Pause,
Reset), Counter (Remove one, Type it), Run (Stop), and the Edit profile "Change photo".

**Why not `Button variant="secondary"`.** Secondary is `buttonHeight.regular` 52 and full width by
default — it is a second *commitment* on the screen, and two of them side by side under a timer read as
two ways to finish. ControlPill is 44pt, hugs its label, and never spans the column; it is the rank
below secondary, which the system did not have. `Chip` is the other near-miss and is wrong for the
opposite reason: a Chip is a **selection** with a persistent on state, and Pause is not a state you are
in.

---

## 63. Capture

**The shutter.** `TaskCapture.tsx:3` has a comment — "Shutter fill is surface (frame 14:983), not
textPrimary" — and that is the bug: `color.surface` is `#1A1917`, one step off black, on a dark
viewfinder. It becomes the standard camera shutter: 78pt, a 4pt `color.textPrimary` ring, a 5pt gap,
and a `color.textPrimary` fill. That earlier frame reference was read as a rule; it was a mistake.

**Top controls** each get a `rgba(15,15,15,0.55)` scrim pill so they survive a bright frame. The middle
pill names the task and its window — "Workout, outdoors · By 7:00 am" — so the user is never guessing
what they are shooting, and a time gate is visible at the moment it matters.

One caption above the shutter: "Taken in the app. The library is not an option." That is the product's
whole claim about photos, stated where the photo is taken.

---

## 64. Edit profile

The last light screen. `app/edit-profile.tsx` runs on `PROFILE_V2_COLOR` — cream canvas, 2pt
borders, `radius 16`, a 96pt `shared/Avatar`, and a bordered "Change photo" button.

Everything functional stays: display-name and username fields, the debounced availability check with its
Available / Taken / 3 characters min states, the 150-character bio counter, the discard confirm. What
changes is only the surface: `color.canvas` ground, `color.surface` fields with 1pt `color.border`,
`radius.input` 12, `type.label` field labels, the DS_V3 avatar treatment, and Change photo as a
ControlPill. Save is `color.brandText` text in the nav, disabled to `color.textSecondary`.

| string | style |
|---|---|
| Cancel | body textSecondary |
| Edit profile | bodyStrong |
| Save | secondary medium brandText, textSecondary when blocked |
| Change photo | ControlPill |
| Display name / Username / Bio | label textSecondary |
| Available / Taken / 3 characters min | caption brandText / danger / danger |
| Lowercase letters, numbers and underscores. Changing it breaks old links. | caption textSecondary |
| Shown to anyone who can see your profile. | caption textSecondary |
| {n}/150 | caption textSecondary, danger past 140 |

---

## 65. "Ready for more?" becomes a row

`DiscoverCTA.tsx` imports `DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS` and uses
`DISCOVER_HERO_DARK_BG`, `DISCOVER_CORAL`, `FEED_CTA_ICON_BG`, `FEED_ENGAGEMENT_MUTED` and
`WEIGHT_BOLD` at 13pt. Resolved in `lib/design-system.ts`: a `#1A1410` ground that is neither
`canvas` nor `surface`, an `#E8593C` coral four points off `brandText`, and a weight law 3
forbids.

It is a navigation affordance at the bottom of a list, so it is a `ListRow`: `search` 24
`textSecondary`, "Find another challenge", a subtitle carrying a real number, and the row's own
chevron. The question mark goes — the app knows how many challenges are running, so it says so.

| string | style |
|---|---|
| Find another challenge | ListRow title |
| {n} of {limit}. Free accounts hold {limit} at a time. | ListRow subtitle, free tier |
| {n} running. | ListRow subtitle, Pro |
| Nothing running. | ListRow subtitle, when n is 0 |

The cap is `FREE_ACTIVE_CHALLENGES_LIMIT = 3` from `lib/free-challenge-limit.ts` — **active
enrollments, created or joined**, not lifetime creates. Bind `{limit}` to the constant; do not type 3.
Pro has no constant and no cap in that file, so the Pro subtitle states the count and nothing else: a
limit sentence with no limit behind it is the kind of thing this pass exists to remove.

v25 said "Ten is the cap", which is the **group member cap** from chunk L and has nothing to do with how
many challenges a person may run. Two different tens would have shipped meaning two different things.

---

## 66. One consistency number

Home showed "3 days · 67%" and Profile showed "2 of 7" for the same user on the same evening.

**Why they disagreed.** `lib/profile-consistency.ts` counts secured keys inside `weekDateKeys` — a
rolling 7-day window. Home's hero counts the current streak. Two windows, two units, and a percentage
derived from a third thing.

**One definition.** Days secured ÷ due days that have **closed**, since the user's first due day. Today
is excluded from the ratio and reported separately: a day still open is not a miss. This is the same
definition `profiles-record.ts` already uses for `consistency.verifiedClosed / closedDueDays`, so
Home should read that field rather than compute its own.

**One phrasing.** "{secured} of {due} days". Everywhere.

**No percentage.** It is a second way of saying a number already on the screen, and at 13 due days one
miss moves it eight points — which reads as volatility, not information. It also invites a rounding
question the record cannot answer honestly ("67%" of what window?).

| surface | headline | sub-line |
|---|---|---|
| Home, streak hero | {streak} days | {secured} of {due} days secured. |
| Profile, consistency card | {secured} of {due} days | Since {date}. 1 due today. |
| Consistency detail hero | {secured} of {due} | Day {n} of {N}. |
| no due days yet | No due days yet. | Join a challenge to start the count. |
| first day is today | First day is today. | Today is the first day due. |

`src/lib/consistency.ts` holds the three string builders. Nothing else may phrase this.

---

## Decisions — answered 18 September, binding

| # | question | **answer** |
|---|---|---|
| 1 | "Keep it to the record" — never shareable, or shareable later? | **Shareable later**, from the proof's full view |
| 2 | Backgrounded on frame 58 without choosing? | **Unanswered is private** |
| 3 | Share scope? | **Existing default scope, no picker** |
| 4 | Secured with 5+ proofs? | **Three tiles and +n** |
| 5 | Visitor-profile proof grid? | **Out of scope** |
| 6 | GPS run path? | **Hold the GPS line** until a GPS value reaches the field |
| 7 | Consistency window? | **All-time**, since the first due day |

Original framing, for the reasoning behind each:

| # | question | my recommendation |
|---|---|---|
| 1 | Does "Keep it to the record" mean never shareable, or shareable later from the proof's full view? | **Shareable later.** The full view has a Share button. Otherwise the choice is irreversible at the worst moment to ask. |
| 2 | If the user backgrounds the app on frame 58 without choosing, is the proof shared? | **No.** Unanswered means private. Sharing is an action, not a default. |
| 3 | Does sharing to the feed also post to Everyone, or only the user's Friends scope? | **Their existing default scope**, unchanged, and the button does not ask — a scope picker here is a second decision at a moment that should cost one tap. |
| 4 | Secured screen with 5+ proofs: three tiles and +2, or a scrollable strip? | **Three and a +n.** The full set is one tap away in Proofs, and this screen is a receipt. |
| 5 | Should the Proofs grid include other people's proofs on a visitor profile? | Out of scope here; the visitor grid already exists at 6 tiles. Flagging that it uses a different tile size than this one. |
| 6 | Is a GPS run path planned? | Copy for it is written and held. Do not ship the GPS line until a GPS value reaches the field. |
| 7 | Consistency window: all-time since first due day, or last 30 days? | **All-time.** A 30-day window silently forgives an old miss, and this product does not forgive silently. If you want 30 days, it needs a visible control and a stated window. |

---

## Contradictions in the repo, for the migration plan

Numbered from 33; chunk P ended at 32.

**33. `secured.tsx` can only carry one proof.** It reads a single `proofUri` route param
(`app/task/secured.tsx`, params block) and passes it to `TaskConfirmation`. A day with four camera
proofs across three challenges arrives as one photo with no way to know the others exist. Frame 59 needs
the day's proof list, which `splitSecuredProof` can already produce.

**34. The Secured image area renders with no image.** `TaskConfirmation` → `MomentScreenV3` draws
the proof frame whether or not `proofUri` is set — the empty card in the build 58 screenshot. Zero
proofs must render no image area.

**35. "Day {n}" on Secured is unqualified.** `result.challengeDay` comes from one challenge's params
while the screen represents the whole day. With three challenges the number is arbitrary.

**36. `TaskCapture`'s shutter fill is `surface`, deliberately.** The file header cites a frame
reference as the reason. It is nearly invisible on a dark viewfinder; the reference was wrong.

**37. `DiscoverCTA` is on the legacy palette and uses `WEIGHT_BOLD`.** Resolved against
`lib/design-system.ts`: `DISCOVER_HERO_DARK_BG` `#1A1410` (:346), `DISCOVER_CORAL` `#E8593C`
(:334), `FEED_CTA_ICON_BG` `rgba(232,89,60,0.12)` (:644), `FEED_ENGAGEMENT_MUTED` `#888780`
(:627), `FEED_SHARE_CHEVRON` `#5F5E5A` (:648), `FEED_TAB_ACTIVE_TEXT` `#F9F6F1` (:637), plus
`WEIGHT_BOLD` at 13pt.

Three problems, none of them "it looks dated": `#1A1410` is a warm near-ink that sits between
`canvas` `#0F0F0F` and `surface` `#1A1917` without being either, so the card reads as a surface
the system does not have; `#E8593C` is a second orange four points off `brandText` `#E8600F`, close
enough to look like a mistake and far enough to be one; and the 700 weight is forbidden by law 3.
`DISCOVER_CORAL` is also `DS_COLORS.primary` (:713) and the Android notification light
(`notifications.ts:626`), so retiring it is wider than this card — flag, do not bulk-replace.

**38. Two consistency definitions ship simultaneously.** `lib/profile-consistency.ts` (rolling 7 days)
against Home's streak-derived percentage, with `profiles-record.ts`'s
`verifiedClosed / closedDueDays` as a third, correct one that neither surface reads.

**39. `edit-profile.tsx` is the last `PROFILE_V2_COLOR` screen.** Cream canvas, 2pt borders,
`radius 16`, and a `shared/Avatar` that differs from the DS_V3 `Avatar` used everywhere else.

**40. The Run step claims GPS for typed values.** Chunk O wrote "Distance and time come from GPS." on
the strength of `RunningStep`; build 58 shows users typing both. The line is false for the manual path
and must be conditional.

**41. A design-system note is rendered on a phone.** "There is no map in the design system, so the run
shows numbers only" was written for the handoff and reached the screen. Nothing on a device should refer
to the design system.

**42. `MomentScreenV3` uses the word "Verified" as a share label** (`:155`,
`shareLabel = "Verified"`). Reserved for the camera-proof Stamp; on a share card over a self-reported
day it is false.

**43. `FailedStep` and `SessionStep` style link-like controls with `taskFlowStyles.shareText`**
(`taskFlowStyles.ts:52`) — 15pt `DS_COLORS_V2.text.body`, a legacy token, for "Keep it for later" and
"Cancel, I'll type it". Both become ControlPills.

**44. Two share paths exist for the same act.** `useTaskFlowV2.ts:810` and `secured.tsx`'s
`onShare` both call `shareProgressImage` with the same template string. Frame 58's "Share to the
feed" is a feed post, not an OS share sheet — confirm which one the button should be, because today only
the OS sheet exists.

**45. The public feed row is written at completion, before any choice exists.**
`backend/trpc/routes/checkins.ts:822-842` inserts the `task_completed` activity row — carrying the
photo URL — inside `checkins.complete`. So on main, every camera proof is public the instant it is
recorded, and frame 58's "a photo stays private until this screen is answered" is a design claim the
server contradicts.

**The behaviour to build: write the row unshared, flip it on share.**

| | |
|---|---|
| at completion | insert the row as today, plus `shared: false` (or `visibility: 'record'`). The row exists, so nothing is lost if the app dies between the capture and the choice |
| "Share to the feed" | flips `shared` to true and stamps `shared_at`. One write, no insert |
| "Keep it to the record", or dismissal, or a crash | the row stays unshared, forever, until something flips it |
| "Share" from the proof's full view (your decision 1) | the same flip, from the same row. That is the whole reason to write the row up front rather than on share — the proof already has an identity to share later |
| unshare | out of scope for chunk Q, but the column makes it a one-line mutation when you want it |

**Write-on-share was the alternative and is worse**: the completion and the post become two
transactions, a proof captured offline has no row to attach to, and the full-view Share has to
reconstruct a post from a check-in, which is where drift between the record and the feed starts.

**What the feed shows for a day secured with unshared proofs: nothing.** No "secured a day" row, no
photo-less placeholder, no count. An unshared proof is not a quieter post; it is not a post. The record
holds it, the roster's "Secured today" still shows it (that is the group's own surface, not the feed),
and the feed stays a list of things people chose to show.

Consequence worth stating plainly: the feed gets quieter, and it should. Today it is a log of
everything anyone completed, which is why respect on it means very little. A feed where every row was
chosen is a feed where a row means something.

Queries reading `task_completed` for the feed must add `where shared = true`. Queries reading it for
the record, the roster, the Proofs grid and the consistency count must **not** — they are counting what
happened, not what was published.

**Laws most at risk** 2 (the Secured streak is the only display number in the chunk; the counter, the
run figures, the consistency ratio and the proof count are all body face), 6 (one primary per screen —
frame 58's two buttons are a primary and a secondary, not two primaries), 9 and 22 (the zero-proof
challenge list is one card, and the proofs grid is tiles on the canvas), 13 (the full view keeps 4:5;
the grid crops to square deliberately and says so), 18 (no Stamp on the proofs grid or the full view; the
gate pill carries it in words), 21 (the two Proofs empty states are on the canvas, never in a card).

# The density pass

**Chunk** R. Frames 67 to 74, in `GRIIT Density.dc.html`. No new components, no colour changes.

Every pair in that file is **the same markup rendered through two token objects**. The only variable is
the scale, so what you are judging is the scale and not a redesign.

Values: `src/tokens.dense.ts`. Nothing is renamed, so applying them to `src/tokens.ts` propagates
through every component that already reads tokens. The manual edits are in
`cursor/05_diff_from_current_app.md`.

## What does not move

`type.number`, every `numberSize`, `displayFace`. The Barlow Condensed numerals are the signature,
and they are the one place GRIIT should be **larger** than the apps it is measured against. Bringing
everything around them down 2pt makes them read bigger at no cost — frame 73 is the proof: the 140pt
streak is identical in both columns and looks larger on the right.

`hit` stays 44. `buttonHeight.small` stays 44, already on the floor. `shutter` stays 72 — a shutter
is sized by the thumb, not by the type scale.

## The scale

| token | v27 | v28 |
|---|---|---|
| display | 34 / 41 | 28 / 34 |
| title | 28 / 34 | 22 / 28 |
| heading | 20 / 25 | 17 / 22 |
| body | 17 / 22 | **15 / 20** |
| bodyStrong | 17 / 22 | **15 / 20** |
| secondary | 15 / 20 | 13 / 18 |
| caption | 13 / 18 | 12 / 16 |
| label | 12 / 16 | 11 / 14 |
| space.md | 12 | 10 |
| space.lg | 16 | 12 |
| space.gutter | 20 | 16 |
| space.section | 32 | 24 |
| radius.input | 12 | 10 |
| radius.card | 20 | 14 |
| buttonHeight.regular | 52 | 46 |
| avatarSize xs/sm/md/lg | 32/40/56/96 | 28/32/44/80 |
| tabBarClearance | 96 | 80 |
| numberSize.inline | 17 | 15 |
| stamp.fontSize | 12 | 11 |

`space.xs` 4 and `space.sm` 8 do not move: they are the grid, and shrinking them turns gaps into
touching edges.

## Component sizes tokens cannot reach

| thing | v27 | v28 | note |
|---|---|---|---|
| ListRow padding Y | 16 | 10 | `minHeight: 44` still governs, so a one-line row does not shrink below the floor |
| ListRow icon | 24 | 22 | leading and trailing |
| status ring (task row) | 20 | 18 | with a 11pt check inside |
| Card padding | 20 | 14 | the single biggest space win on Home and Consistency |
| TabBar height | 64 | 56 | icons 26 → 22, labels stay 11 |
| Feed post header padding Y | 14 | 8 | with avatar 40 → 32 this is the change that reads loudest |
| Week strip square radius / gap | 12 / 8 | 8 / 6 | squares themselves are `1fr`, so they grow as the gutter comes in |
| Chip padding | 14 × 8 | 12 × 7 | any chip that is a control keeps `minHeight: 44` |
| Counter Add one | 132 | 116 | still the largest target on its screen |
| Progress bar height | 6 | 5 | |

**Every touch target stays 44.** The pattern throughout: shrink the *padding* and let `minHeight: 44`
do the work. A row with one line of text is 44 either way; a row with a title and a subtitle goes
68 → 54.

## What each frame gains

Measured off the frames in `GRIIT Density.dc.html`, not estimated. Home, Feed and Profile are clipped
at the tab bar, and each clip derives its height from that bar rather than from a constant — Home's
content region starts at y=44 and Feed's and Profile's at y=88, so a shared constant puts the latter
two 38pt under the bar. Law 26 is the rule these frames are the reference for; the others are full-height screens where the gain is
reclaimed space rather than a fit-or-not.

| frame | v27 | v28 | gain |
|---|---|---|---|
| 68 Home | 6 of 8 task rows, Discover row clipped away | all 8 rows and the Discover row | +2 rows, +1 row of chrome |
| 69 Feed | third post not reached | third post reaches 50pt | avatar and name become visible |
| 70 Profile | third date section clipped at ~two thirds | all three sections whole | +1 section, tiles 113 → 116 |
| 71 Consistency | footer caption ends at 772 | ends at 651 | **121pt back**, the largest in the set |
| 72 Counter | footer at 737 | footer at 747 | 10pt; step screens were never the problem |
| 73 Secured | numeral 140 | numeral 140 | unchanged by design |
| 74 Login | Google button ends 648 | ends 576 | 72pt back |

**Login does not clear the keyboard at either scale.** A 336pt keyboard puts its top edge at 516, and
the new layout still ends at 576. That is a layout problem, not a density one: fix it by scrolling the
form or moving the OAuth buttons above the fold, not by shrinking type further. Logged as breakage 9.

## What breaks, and the fix

| # | breaks | fix |
|---|---|---|
| 1 | **The morning-after block** (frame 52) is three stacked `secondary` lines. At 13/18 with `space.lg` 12 it goes from a block you read to a block you skim past — it is the one place in the app where less prominence is wrong | keep the fact line at `bodyStrong` (15/500, as now) and hold the block's internal gap at `space.lg` **16**, not 12. One documented exception, written into the component |
| 2 | **"Window closed · 6:00–9:00 am"** at caption 12 next to a 15pt title is a 3pt gap and reads as noise on a row that is making an important statement | the closed row's gate line goes to `secondary` 13, not `caption` 12. Only that state |
| 3 | **Challenge names on proof tiles** (frame 60) at label 11 with a text shadow, on a ~115pt tile: "Daily Gratitude" truncates | already ellipsised at `calc(100% - 12px)`. Accept the truncation — the date section header above carries the context, and a two-line tile label would turn the grid into a list |
| 4 | **"3 of 3. Free accounts hold 3 at a time."** at caption 12 in a ListRow subtitle wraps to two lines at 393pt | shorten to "3 of 3 running. Free holds 3." — same fact, one line |
| 5 | **Gate lines with all three gates** — "Camera · Time window 6–9am · Location" — wrap at caption 12 in a task row with a 22pt icon and a chevron | the long form only appears on the challenge detail and the add-task preview, both of which are full-width rows with no trailing glyph. On the Home task row the gate line is already the short form. No change, but do not let the long form leak into a Home row |
| 6 | **The four stat cells** (frame 71) at heading 17 for the value: "First proof / 5 Sep" is fine, but a 4-digit "Total secured" value plus its "days" suffix is tight in a half-column at gutter 16 | values stay `heading`; if a cell overflows, the suffix drops (`9` not `9 days`) before the value shrinks |
| 7 | **Dynamic Type.** `dynamicType` maps `body` to Apple's `body` (17). At 15 that mapping is a lie and the app will scale wrong for anyone who has touched the accessibility slider | remap: `body`/`bodyStrong` → `subheadline`, `secondary` → `footnote`, `caption` → `caption1`, `label` → `caption2`, `heading` → `headline`, `title` → `title3`, `display` → `title1`. **This is not optional** — it ships in the same commit as the scale |
| 9 | **Login still sits under the keyboard** at the new scale — the Google button ends at 576 against a keyboard top of 516 | out of scope for this pass. Scroll the form, or move Apple and Google above the divider so the primary path clears. Do not solve it with type size |
| 8 | **Contrast is unaffected** but worth stating: every pair still passes at the new sizes because no colour changed. `textSecondary` at 12pt on surface is still 6.6:1. The 4.5:1 floor applies at every size, and nothing here is under it |

## Decisions I need

| # | question | recommendation |
|---|---|---|
| 1 | **body 15 or 14?** | **15.** 14 is the reference body size exactly and buys about one more row, but it costs the row title its authority: at 14/500 a title sits 2pt from its 12pt gate line and the row loses its hierarchy. It also pushes secondary to 12 and caption to 11, where caption and label collide. If you want 14, take it on `body`/`bodyStrong` **only** and hold `secondary` at 13 — do not shift the whole ladder |
| 2 | **Tab bar labels: keep or drop?** | **Keep.** Dropping them saves 14pt on a 56pt bar and the bar is already the smallest thing being cut. The reference apps drop labels because their five destinations are universally understood icons; GRIIT's Discover and Feed are not — a compass and a group of people are the same idea to a new user. Revisit after the icons have been in front of people |
| 3 | Does `display` (34 → 28) still earn its step above `title` (28 → 22)? | **Yes, but check usage.** At v27 they were 34 and 28; at v28 they are 28 and 22. If `display` is only used on one screen, fold it into `title` and delete the token rather than carry two steps that differ by 6pt |
| 4 | Apply to the marketing/share card sizes? | **No.** `shareProofWidth` and the share card type are composed for export at 720/560, not for a phone screen. Out of scope, and they should stay large |

---

## Contradictions in the repo, for the migration plan

Numbered from 46; chunk Q ended at 45.

**46. `dynamicType` will be wrong the moment the scale lands.** `tokens.ts` maps `body` →
`'body'` (17pt) and `secondary` → `'subheadline'` (15pt). At body 15 / secondary 13 those mappings
scale the app to the wrong sizes for any user with Dynamic Type set away from default. Remap in the same
commit — table above.

**47. Hardcoded font sizes bypass the token file.** `StreakFreezeModal` (18/14/13),
`WhoRespectedSheet` (16/14/12 via `DS_TYPOGRAPHY`), `DiscoverCTA` (13 bold / 11),
`edit-profile.tsx` (`PROFILE_V2_COLOR` sizes), and `taskFlowStyles.ts` (15). None of these move
when tokens move. Grep before shipping — see the migration note.

**48. Two avatar components with independent sizes.** `components/ds/Avatar.tsx` takes
`32 | 40 | 56 | 96` as a literal union; `components/shared/Avatar` (used by `edit-profile`) has
its own. Changing `avatarSize` does not change either — the ds one has the sizes in its **type
signature**, so this is a type error at build, which is the good outcome: it will not compile until
someone looks at it.

**49. `size.tabBarClearance` is a derived number stated as a constant.** Its comment says
"bar height 64 + bottom offset 12 + gutter 20" but 64 and 20 live in other places. At the new scale it
is 56 + 12 + 16 = 84, and 80 is right once the bar's own internal padding is counted. Derive it or
re-comment it; do not leave a stale arithmetic comment.

**50. `contactSheet` sizing is independent of everything.** `{ cols: 6, rows: 5, gap: 4, radius: 4 }`
— a 6 × 5 grid of 4pt-radius tiles does not scale with `radius` or `space`. Fine as-is, but note it
is the one grid that will not move, so it may look loose next to the new proof grid.

**51. `buttonHeight.regular` 52 is hardcoded in at least one place.** The pinned footers in the
task-v2 steps use `52` directly in `taskFlowStyles.ts` rather than reading the token. Grep `52`
alongside `height`.

---

## Migration note for Cursor

**One file changes for most of it:** `lib/design-system.ts` (the DS_V3 export) — or
`src/tokens.ts` in this handoff's naming. Apply the values from `src/tokens.dense.ts`. Nothing is
renamed, so this is a value-only diff.

**Then the manual edits**, none of which read tokens today:

| file | what |
|---|---|
| `components/ds/Avatar.tsx` | the size union `32 \| 40 \| 56 \| 96` → `28 \| 32 \| 44 \| 80`. Will not compile until done |
| `components/ds/ListRow.tsx` | paddingVertical 16 → 10, icon slot 24 → 22, gap 12 → 10. Keep `minHeight: 44` |
| `components/ds/Card.tsx` | padding 20 → 14 |
| `components/ds/Chip.tsx` | padding 14 × 8 → 12 × 7 |
| `components/ds/TabBar.tsx` | height 64 → 56, icons 26 → 22 |
| `components/ds/WeekStrip.tsx` | square radius 12 → 8, gap 8 → 6 |
| `components/feed/FeedPostV3.tsx` | header paddingVertical 14 → 8 |
| `components/task-v2/taskFlowStyles.ts` | hardcoded 15pt and 52pt |
| `app/edit-profile.tsx` | its own scale entirely (chunk Q already rewrites this file) |
| `components/{StreakFreezeModal,feed/WhoRespectedSheet,home/DiscoverCTA}.tsx` | legacy `DS_*` tokens; chunks N, O and Q already replace all three |
| `src/tokens.ts` `dynamicType` | the remap — contradiction 46 |

**What to grep**, in order:

```
fontSize:\s*(1[2-9]|2[0-9]|3[0-4])      # every literal font size outside the token file
DS_TYPOGRAPHY|DS_COLORS|DS_RADIUS|GRIIT_COLORS|PROFILE_V2_COLOR|DS_DAYLIGHT
WEIGHT_SEMIBOLD|WEIGHT_BOLD             # law 3: nothing above 500
padding(Vertical|Horizontal)?:\s*(16|20|32)
height:\s*(52|64|96)                    # buttons, tab bar, clearance
size=\{?(32|40|56|96)\}?                # avatars
borderRadius:\s*(12|20)
```

**How to check it landed.** Three measurable claims, all on a 393 × 852 device:
Home shows 7 task rows without scrolling; Consistency ends above the fold; Login clears a 336pt
keyboard with both OAuth buttons visible. If any of the three fails, the pass is not applied.

**Ship order.** The token diff and the `dynamicType` remap are one commit — splitting them ships a
scale that misbehaves under accessibility settings. The component edits are a second commit and can
land file by file; a component still on the old paddings looks slightly loose, not broken.

# v28.1 — the states nobody designed

**Patch, not a chunk.** Frames 75 to 78, in `GRIIT Patch v28-1.dc.html`, at the v28 dense scale.
No new tokens, no new components. Five gaps found by walking the Chunk Q simulator.

---

## 1. Morning-after block: "missed yesterday, secured today"

The block is about **yesterday**, so it survives today being secured. Its last line cannot: at v28 it
reads "Your streak reset to 0." under a hero showing 1 day, and the two contradict each other on the
same screen.

**One conditional line, not a second block.**

| condition | third line |
|---|---|
| streak still 0 (nothing secured today) | Your streak reset to 0. Your longest was {longest} days. |
| **streak now ≥ 1 (today secured)** | **Your {previous_streak}-day streak ended. Today starts the count at 1.** |
| a freeze is available | Your streak reset to 0. A freeze can undo that for yesterday. |
| a Last Stand covered it | A Last Stand covered it, so the streak continues. {n} left. |

The hero's sub-line changes with it: "Day 1 of the next streak." replaces "Streak reset. Post today to
start again." once the day is secured.

**Why this wording.** It states the loss first and the restart second, in that order, so the sentence
cannot be read as a reward for one day. "Today starts the count at 1" is arithmetic — it names what the
hero already shows. It is not "back on track", not "good start", not "nice work": one secured day after
breaking twelve is the count beginning again, and the copy says only that.

**Do not** add a second line when today is secured. Do not change "Yesterday wasn't secured." — it is
still true, and it is the whole point of the block.

**When the block goes away.** Three exits, any of which is enough:
1. the user dismisses it (the `x`), persisted as `miss_ack_date_key` — chunk P decision 10;
2. **local midnight.** The block describes yesterday. It never survives into a second morning, whether
   it was read or not, and there is no "you missed two days ago" state;
3. a freeze or Last Stand resolves the miss — then the reason for the block is gone and it goes with it.

Securing today is **not** an exit. The user should be able to open the app at 11pm, having fixed today,
and still see what yesterday cost.

---

## 2. Secured footer: the day, not the closing task

**Decision: (b), the day's unshared photos as a set.** R3 is replaced.

R3 tied the footer to the closing completion. A day that ended on a self-report therefore offered
nothing, even holding three unshared camera proofs — which sent them to the record with no choice ever
presented. That is exactly the defect frames 58 and 59 exist to prevent, reappearing through a
different door.

| state | footer |
|---|---|
| ≥1 unshared camera proof in the day | primary "Share {n} proof{s} to the feed", secondary "Keep {them\|it} to the record" |
| exactly 1 unshared | "Share this proof to the feed" / "Keep it to the record" |
| 0 unshared (all shared already, or all self-reported) | a single primary "Done" |

(c) was the alternative — offer the most recent unshared photo — and it is wrong for the same reason R3
was: it makes an arbitrary choice on the user's behalf about which of their photos represents the day,
and it strands the rest.

**Sharing the set posts one row, not n rows.** The screen the user is answering is a day. This is the
same behaviour the multi-proof button already had on frame 59C.

**Dismissing is never a decision (R7).** The `x` at the top leaves everything unshared, exactly as
"Keep them to the record" does, and the photos stay in the record and reachable from the Proofs grid.
The difference between the two is only that one is an answer and one is a deferral — neither publishes.

| string | style |
|---|---|
| Share {n} proofs to the feed | Button primary, arrow-up-right 18 |
| Share this proof to the feed | Button primary, arrow-up-right 18 |
| Keep them to the record / Keep it to the record | Button secondary |
| Done | Button primary, zero-unshared state only |
| {n} tasks across {m} challenges. All self-reported. | caption textSecondary |

---

## 3. Accessibility labels, and the empty-title fallback

Add to every copy table. These are `accessibilityLabel`, not visible strings.

| element | label | notes |
|---|---|---|
| section header, expanded | Collapse section | followed by the section name: "Collapse section, Iron man" |
| section header, collapsed | Expand section | same |
| challenge row (Home, roster, Profile) | Open {challenge} challenge | not "Open challenge" — the name is the only thing distinguishing five identical rows |
| sheet and modal dismiss | Close | on the `x`. Never "Dismiss", never "Cancel" unless it cancels something |
| proof tile | {challenge}, {date} | the tile's visible label is the challenge; VoiceOver needs the date too, since the section header is a separate element |
| status ring, done | Done | |
| status ring, pending | Not done | not "Empty" |
| status ring, window closed | Window closed | |

**Empty task title.** The current fallback is the literal string "Task", which tells the user nothing
and appears identically on every untitled row. **Replace it with the task's own type and gate**, which
is data the row already has:

| case | shown |
|---|---|
| title empty, type known | the type name — "Timer", "Counter", "Run", "Check off", "Write" |
| title empty, type and target known | "45 min timer", "10 pages", "5 km" — the gate line's size half, promoted |
| title empty, nothing else known | "Untitled task", not "Task" |

Promoting the size half means the gate line drops it and shows only the proof half, so nothing is said
twice. Better still: **stop the empty title at the source** — the Add task sheet's primary should be
disabled until the name field is non-empty. A task with no name is a data-entry bug, and the fallback
is a safety net, not a feature.

---

## 4. "Day {n} of {N}" — N defined

**N is `challenges.duration_days`** for the challenge that owns the row. Not the user's commitment
target from onboarding (that is a separate number, and it drives the Home hero, not this line), and not
the number of days the user has been enrolled.

`n` is the challenge's `current_day` for this user: days elapsed since their `started_at`,
inclusive, in the user's timezone. After a hard-mode reset `n` returns to 1 and `N` is unchanged.

**n can never exceed N in a valid state** — the challenge ends when `n > N` (see item 5). If it does
anyway, from clock skew, a stale cache, or a timezone change moving the boundary:

> **Clamp to N.** Render "Day {N} of {N}". Never render "Day 76 of 75", and never hide the line.

A clamped row is indistinguishable from a legitimate last day, which is correct: the user is on or past
the last day either way, and the end-of-challenge screen resolves it on next launch. Log the clamp
server-side; do not surface it.

---

## 5. The end of a challenge

Today a challenge whose last day passes is simply gone from Home. Seventy-five days of work, removed
without a sentence.

### The moment — frame 77

On first open after `current_day > duration_days`, one screen, before Home. Same screen for both
outcomes; only the number and the sheet differ.

1. `DisplayNumber` at 100pt: days secured, with "of {duration_days}" in `type.heading`
   `textSecondary`. **This is the earned number** — the signature face, correctly used
2. "{challenge} is over." in `type.bodyStrong`
3. one `type.caption` line of fact: "75 days, none missed. 52 camera proof, 23 self-reported." or
   "Seven days went unsecured. 48 camera proof, 20 self-reported."
4. **the contact sheet**, 10 across at 3pt gaps, one square per day of the run, on the **same encoding
   as `ds/WeekStrip`**: `color.brand` fill for a camera-proof day, a solid `color.border` fill for
   a self-reported day, transparent with a 1pt `color.border` outline for a day that went unsecured.
   A run with seven holes shows seven holes

   **Encode this on value, never on opacity.** `surface` is 1.09:1 against `canvas`, so a
   surface-filled tile and an empty one are the same square at 33pt, and dimming one to 0.45 makes it
   worse. Brand measures 4.85:1 against the canvas and 3.56:1 against the self-reported fill, and the
   third state differs in form as well as value — a solid block against a hairline ring. No glyph: at
   33pt a 9pt camera icon is doing work the fill should do, and it was the only thing making the first
   state visible
5. a three-item legend, `type.caption`
6. a `Card`: Longest streak, Started, Ended
7. footer: primary "Done", secondary "Start it again"

**No congratulation, in either outcome.** No trophy, no confetti, no "you did it", and no consolation
for the run with holes. The record is the thing; a product whose claim is that the number is true does
not decorate the number. The 75-of-75 screen and the 68-of-75 screen differ only in what they report.

**"Start it again"** enrols the user fresh at Day 1. It is secondary, never primary — the end of a
seventy-five-day run is not the moment to push another one.

### Where it lives afterwards — frame 78

Profile → Challenges gains two sections, **Running** and **Finished**. A challenge that ends moves
between them rather than disappearing. Finished is newest-ended first.

**Three status words, and no fourth:**

| status | when | row detail |
|---|---|---|
| Day {n} of {N} | running | today's state: "1 of 1 secured today" or "Not yet today" |
| {secured} of {N} | ran to its last day | "{start} to {end}" |
| Left on day {n} | the user quit before the last day | "{start} to {end}" |

Quitting is neither hidden nor punished. It is the third true thing that can happen, it is stated in
the same type and the same colour as the other two, and "Left on day 9" is a fact about a run, not a
verdict on a person.

**Nothing on this screen is coloured by outcome.** A 75-of-75 row and a 41-of-75 row are the same
`textSecondary`. Ranking the user's history with colour would be the app having an opinion, which is
not its job.

| string | style |
|---|---|
| {secured} | DisplayNumber, 100pt |
| of {duration_days} | heading textSecondary |
| {challenge} is over. | bodyStrong |
| {n} days, none missed. {c} camera proof, {s} self-reported. | caption textSecondary |
| {m} days went unsecured. {c} camera proof, {s} self-reported. | caption textSecondary |
| Camera proof · Self-reported · Not secured | caption textSecondary, legend |
| Longest streak / Started / Ended | secondary textSecondary, values bodyStrong |
| Done | Button primary |
| Start it again | Button secondary |
| Running / Finished | label textSecondary |
| Day {n} of {N} · {secured} of {N} · Left on day {n} | caption textSecondary |

**Server.** Ending needs a state the schema does not have: `challenge_participants.ended_at` and
`ended_reason ('completed' | 'left')`, plus an `end_seen_at` so the moment shows once. Without
`end_seen_at` the screen either never appears or appears every launch. **No new design tokens** — the
100pt numeral sits between `numberSize.moment` 96 and `numberSize.mid` 160 and should simply use
`moment` 96 in the build; 100 in the frame is an artefact of fitting the sheet and the card on one
screen, and 96 fits once the real photos replace the placeholder glyphs.

---

## Contradictions, continued

Numbered from 52; chunk R ended at 51.

**52. The morning-after block contradicts the streak hero.** Its third line is unconditional, so after
securing a day it reads "Your streak reset to 0." under a hero showing 1. Item 1 above.

**53. R3 strands unshared photos.** The Secured footer keys off the closing completion, so a day ending
on a self-report offers no share choice for camera proofs taken earlier the same day. Item 2.

**54. "Task" is a user-facing fallback string.** Every untitled task renders identically and
uninformatively. Item 3. The deeper fix is validation in the Add task sheet.

**55. `N` in "Day {n} of {N}" was never bound in the spec.** Two sections of `02_screens.md` used
it without defining it; it is `duration_days`, and the overflow case needs clamping. Item 4.

**56. A finished challenge has no end state and no home.** It leaves Home silently when
`current_day > duration_days`, and Profile → Challenges has no Finished section to receive it. Needs
`ended_at`, `ended_reason` and `end_seen_at`. Item 5.

**57. Leaving a challenge has no recorded outcome either.** Same columns cover it —
`ended_reason = 'left'` — but today quitting removes the row entirely, so a user's history silently
omits every run they abandoned. That is the record being shorter than the truth, which is the one thing
this system does not permit.

# v28.2 — item 2 reissued

**Item 2 is withdrawn as drawn in v28.1. R3 stands.** The premise was wrong: every camera proof is
already answered on its own frame 58, with Share and Keep. A day-wide offer on the Secured screen
re-asks a question the user has already answered, and for a photo they answered "Keep" it asks them to
reverse a decision they made deliberately. **Re-offering a photo the user kept private is not allowed.**

**The rule, unchanged:** the Secured footer offers the closing completion's photo, and nothing else.

| closing completion | footer |
|---|---|
| carried a photo, not yet answered | primary "Share this proof to the feed", secondary "Keep it to the record" |
| carried a photo, already shared from frame 58 | single primary "Done" |
| was a self-report | single primary "Done", plus the pointer caption below |

**The zero-photo close.** Rather than a bare Done under an empty space, the screen names the task that
closed the day and where the rest of the day's proofs are:

> **Drink 64 oz closed the day** / Self-reported, so there is no photo to share here.
>
> *(footer)* Done
> Today's other proofs are in Profile, Proofs. Any you kept private can be shared from there.

That is a **pointer, not an offer**. It states a location; it does not put a photo in front of the user
again. A proof kept private stays private until the user goes and changes their mind, which the full
view in frame 60 already supports.

| string | style |
|---|---|
| {task} closed the day | bodyStrong |
| Self-reported, so there is no photo to share here. | secondary textSecondary |
| The proof that closed the day | caption textSecondary, placeholder label |
| {task} · {challenge} | caption textSecondary |
| Share this proof to the feed | Button primary, arrow-up-right 18 |
| Keep it to the record | Button secondary |
| Done | Button primary |
| Today's other proofs are in Profile, Proofs. Any you kept private can be shared from there. | caption textSecondary, centred |

**A whole-day post, if you want one, is a separate feature** and not this footer. Spec: it composes
only proofs answered "Share", never one answered "Keep" and never one left unanswered; if fewer than
two qualify it does not appear; and it posts one row carrying the day, not the challenge. It belongs on
the Proofs grid as a multi-select, where the user is choosing, not on a screen that appears
unprompted.

---

## Item 4 reissued — two numbers, two meanings

**"Day {n} of {N}" is calendar position.** `n` = days from `started_at` to today inclusive, in the
user's timezone. `N` = `challenges.duration_days`. It advances every day whether or not the day was
secured, and it is clamped to `N`.

**"{secured} of {N}" is the secured count.** It advances only on a secured day.

**Never mix them**, and never show one where the other is meant:

| surface | which | why |
|---|---|---|
| Home task-card section header | Day {n} of {N} | the user is asking where they are in the run |
| Feed post header | Day {n} of {N} | the viewer is placing the proof in someone else's run |
| Active challenge screen | Day {n} of {N} | same |
| Profile → Running row | Day {n} of {N} | position |
| Profile → Finished row | {secured} of {N} | the run is over; position is meaningless |
| End screen hero | {secured} of {N} | the record |
| Consistency hero | {secured} of {due} | a third thing again — due days across all challenges, not one run |

**A hard-mode reset** restarts the run: `started_at` is rewritten to today, so `n` returns to 1 and
`secured` returns to 0. Both reset, together, because it is a new run inside the same enrollment.
`N` never changes.

**A freeze or a Last Stand changes neither.** They protect the personal streak, which is a third number
again and belongs to the user, not the challenge. `n` advances as it always does, and `secured`
does not — the day was not secured, and the end screen's sheet shows it as held rather than as done.

---

# Chunk T — the end of a challenge

Frames 79 to 82, in `GRIIT Chunk T.dc.html`. No new tokens, no new components.
Source: `src/components/ChallengeEnd.tsx`, `src/components/ProfileChallenges.tsx`.

## What ends a challenge, and when

**The end date passing, not the day counter.** `active_challenges` ends when the challenge's end date
is past in the **user's timezone**, and the last day runs to the end of that local day — 23:59:59 —
never to the clock time they joined. A user who joined at 4pm on day 1 has the whole of the last day,
not until 4pm.

The end screen fires on the first launch after that boundary, gated on `end_seen_at`.

## The four statuses

`active_challenges.status` already carries them. One line each, no fourth word invented:

| status | Profile row | when |
|---|---|---|
| `active` | Day {n} of {N} | running |
| `completed` | {secured} of {N} | ran to its end date |
| `abandoned` | Left on day {n} | the user quit. The row is **not** deleted |
| `failed` | Failed on day {n} | hard mode's unsecured day, or a team challenge the team lost |

**"Failed" is the blunt word on purpose.** Hard mode's entire contract is that one unsecured day ends
the run; softening it afterwards would be the app apologising for a rule the user chose when they
picked hard mode. It is stated in the same type and the same colour as every other status — nothing on
that screen is coloured by outcome, because ranking a person's history is not the app's job.

## The sheet, five states

Same encoding as `ds/WeekStrip`. **Value and form, never opacity** — `surface` is 1.09:1 against
`canvas`, so a surface-filled tile and an empty one are the same square at tile scale.

| state | tile |
|---|---|
| camera proof | `color.brand` fill |
| self-reported | solid `color.border` fill |
| not secured | transparent, 1pt `color.border` outline |
| frozen | transparent, 1pt `color.border` outline, centred 9pt `color.border` square |
| Last Stand | transparent, 1.5pt `color.brand` outline, centred 9pt `color.brand` square |

**12 columns**, not 10: 75 days at 10 across is 8 rows and 285pt, which does not leave room for a
five-item legend and the stats card. At 12 it is 7 rows and 213pt with 27pt tiles, which still carries
five states.

**How frozen and Last Stand days count.** They are **unsecured**. The day was not secured — the streak
survived it, which is a different fact about a different number. So:

- the hero `{secured} of {N}` excludes them
- "{m} days went unsecured" **includes** them
- and the next sentence says which: "Seven days went unsecured. Two of them were held, by a freeze and
  a Last Stand."

Counting a held day as secured would be the app claiming work that did not happen, which is the one
thing this system does not do.

## The screen

1. `DisplayNumber` 96: `{secured}`, with "of {N}" in `type.heading` `textSecondary`
2. "{challenge} is over." — or "{challenge} ended on day {n}." for `failed`
3. one `type.caption` line of fact
4. the sheet, 12 across
5. the legend, only the states present in this run
6. a `Card`: Longest streak, Started, Ended
7. footer: primary "Done", secondary "Start it again"

**No congratulation in any outcome**, and no consolation in the failed one. The 75-of-75 screen and the
68-of-75 screen differ only in what they report.

**"Start it again" at the free cap.** The button stays and stays enabled, with one caption under it:
"You are running 3 of 3. Starting this again means leaving one." Tapping opens the enrollment flow,
which already handles the limit. Hiding or disabling the button would leave the user guessing why a
thing they just did is no longer offered; the caption tells them the price before they pay it.

**A one-day challenge** holds: a single 27pt tile, centred, a one-item legend, and "One day, secured.
Camera proof." The hero reads "1 of 1". Nothing about the layout assumes a grid.

## Two or more ending on the same day

**One combined screen**, not one each in sequence. Two full-screen interruptions on a single launch is
the app taking the user's morning; one screen says the same thing and ends.

- title "Two challenges ended." / "{n} challenges ended."
- one block per challenge: name, its own `{secured} of {N}` at 34pt, its own sheet at 15 across, one
  line of fact
- one legend for the screen
- footer: a single "Done" and the caption "Both are in Profile, Finished. Start either again from
  there."

**No "Start it again" here.** With two endings the button has to pick one, and there is no honest basis
for the pick. Profile is one tap away and lists both.

At four or more the blocks scroll; the title counts them and the shape does not change.

## Existing enrollments

**No retroactive end screens.** Anything already `completed`, `abandoned` or `failed` when this
ships appears in Finished with its status and its dates, and never triggers the moment. Backfill
`end_seen_at = ended_at` for every existing non-active row in the same migration — without it, every
old enrollment fires an end screen on first launch.

One `type.caption` line at the foot of the Finished list says so: "Runs that ended before this version
shipped are here too, without an end screen."

## Copy

| string | style |
|---|---|
| {secured} | DisplayNumber 96 |
| of {N} | heading textSecondary |
| {challenge} is over. | bodyStrong |
| {challenge} ended on day {n}. | bodyStrong, failed |
| {n} days, none missed. {c} camera proof, {s} self-reported. | caption textSecondary |
| {m} days went unsecured. {h} of them were held, by {list}. | caption textSecondary |
| Hard mode has no freezes, so one unsecured day ends the run. | caption textSecondary, failed |
| One day, secured. Camera proof. | caption textSecondary, one-day |
| Camera proof · Self-reported · Not secured · Frozen · Last Stand | caption textSecondary, legend |
| Longest streak / Started / Ended | secondary textSecondary, values bodyStrong |
| Done | Button primary |
| Start it again | Button secondary |
| You are running {n} of {limit}. Starting this again means leaving one. | caption textSecondary |
| {n} challenges ended. | title |
| Both finished today, {date}. | secondary textSecondary |
| Both are in Profile, Finished. Start either again from there. | caption textSecondary |
| Running / Finished | label textSecondary |
| Day {n} of {N} · {secured} of {N} · Left on day {n} · Failed on day {n} | caption textSecondary |
| Runs that ended before this version shipped are here too, without an end screen. | caption textSecondary |

## Schema

`active_challenges` has `status`. It needs two columns:

| column | why |
|---|---|
| `ended_at timestamptz` | the dates on the Finished row and the stats card |
| `end_seen_at timestamptz` | without it the moment either never fires or fires every launch. Backfill `= ended_at` for existing rows |

`ended_reason` is **not** needed — `status` already distinguishes completed, abandoned and failed.

## Contradictions

**Contradiction 57 is withdrawn.** Leaving writes `status = 'abandoned'` and the row survives; the
history is not shortened. The v28.1 claim was wrong.

**58. The end fires on a day counter, not a date.** Any implementation keyed to `current_day >
duration_days` ends the run at the clock time the user joined rather than at the end of their local
day, which costs a user who joined at 4pm eight hours of their last day. Key it to the end date in the
user's timezone, at 23:59:59 local.

**59. `end_seen_at` does not exist, so every historical enrollment would fire an end screen.** Backfill
it in the same migration that adds it.
