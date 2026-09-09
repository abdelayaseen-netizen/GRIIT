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
No new tokens. Frames 31 (screens 2 to 9) and 32 (states beyond the happy path).

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
