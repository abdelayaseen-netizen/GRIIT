# GRIIT v53.1 only

These locked rules override everything older in this file and in every earlier handoff. If an older line conflicts, these win.

Dark theme only, canvas #0F0F0F · orange in exactly 4 places: primary button fill #BB471D, streak flame, done check #DC5401, active tab · any older line saying "#BB471D retired" is wrong · selected chips/segments invert, never orange · v51 type scale (Body 17/22, Secondary 15/20, Caption 13/18) · no exclamation marks · "likes" never "respects" · ignore src/tokens.ts.


## v53 + v53.1 · posting, profile, finishing tasks, lock screen, Liquid Glass (Oct 12, 2026) · `GRIIT v53.dc.html` · frames 1501–1579
Locked: dark theme · orange only on primary fill #BB471D, flame, done check #DC5401, active tab · Body 17/22, Secondary 15/20, Caption 13/18 · no exclamation marks, no motivational lines · "Secured" = every task today done · "Self-reported" = marked yourself · one word for likes: "likes".
"Current app" = build 87, from device feedback.
Extra frames beyond the brief: 1516 Secured before the post · 1527 long name + empty bio · 1528 empty following list · 1535 not liked · 1557 starter picked · 1576 + option B (not chosen) · 1577–1578 profile feed minimised / expanded · 1579 timer controls on glass.
Single tap on a feed photo does nothing (double-tap likes); comments/caption open the post.
Starter rules (v53.1): today is the starter day and the starter alone secures it; the challenge's Day 1 is tomorrow; +1 freeze once per lifetime when the starter is completed.
Liquid Glass (v53.1): native iOS 26 TabView, 4 tabs + Create as a regular 5th (middle) tab that opens a sheet (option A); .tabBarMinimizeBehavior(.onScrollDown); glass only on tab bar, Following/Everyone switch, Saved toast, timer Pause/Finish early, profile feed top bar, photo visibility badge; never orange glass; iOS ≤ 18 solid dark bar.

### 1501 · CountStep · 12 of 30 counted · Done still fills all 30
Route: `task/complete` · Current app: differs · 81 labels it “Complete · 30 pages” and puts +1/+5/+10 first
- **Primary:** “Done · 30 pages”. One tap sets count = target (30), saves, then opens the photo step. Works at any count, 0 to 29.
- **Secondary:** +1, +5, +10 add partial progress and stop at 30. “Type it” opens the number pad with the Done bar (v48.1).
- **Count:** “12 of 30 pages” with a bar. At 30: “30 of 30 pages”, the steps dim, the button stays “Done · 30 pages”.
- **Partial:** Leaving at 12 keeps 12 for today. Home row reads “12 of 30 pages”.
- **Header:** Challenge name as the label, “Day 3 of 14” as the title (rule 1505).

### 1502 · TimerStep · Before starting
Route: `task/complete` · Current app: yes · copy differs (“Start timer”)
- **Primary:** “Start 5:00”. Starts the timer and the Live Activity (1540).
- **Secondary:** “Done, already did it”. Opens the confirm sheet, then saves as Self-reported with no time.
- **Ring:** Empty ring, “5:00”, “Not started”.
- **Copy:** No “Post opens when the timer reaches zero” anywhere.

### 1503 · TimerStep · Running · Finish early always on
Route: `task/complete` · Current app: differs · 81 shows “Post opens when the timer reaches zero.” and no way out
- **Time:** Big time left “1:48”, under it “3:12 of 5:00” (time done so far).
- **Pause:** Secondary. Becomes “Resume”. Paused time doesn’t count.
- **Finish early:** Secondary, never disabled. Saves “3:12 of 5:00”, Self-reported, task done, then the post step.
- **Leaving:** The timer keeps running on the Lock Screen (1540). Coming back reopens this screen.
- **Removed:** “Post opens when the timer reaches zero.”

### 1504 · TimerStep · At 0:00
Route: `task/complete` · Current app: differs · 81 jumps straight to the post step
- **Ring:** Full ring, orange done check (one of the 4 uses), “Done”, “5:00 of 5:00”.
- **Primary:** “Continue”. Opens the post step (1510). If the task has no photo, saves and goes back to Home.
- **Haptic:** Success haptic + the Live Activity switches to 1542.

### 1505 · TaskHeader · Long challenge name, wraps
Route: `task/*` · Current app: differs · 81 shows “5-Minute Morning Prayer · Day 6…” truncated
- **Label:** Challenge name. Wraps to 2 lines. Never truncated.
- **Title:** “Day n of N”. n = enrollment.day_index for the local date.
- **Body title:** The task (“Pray for 5 minutes”), never the challenge name again.
- **Left:** X closes. Back chevron only inside a multi-step flow.

### 1506 · TaskRow · check-off · One tap · done state + Undo
Route: `(tabs)/index` · Current app: yes
- **Tap:** One tap on the circle finishes a self-reported task. No step screen.
- **Done row:** Orange done check, title in Text 2, “Done 6:10 am · Self-reported”. No chevron.
- **Undo:** Toast “Make your bed done.” + “Undo”, 5 s, a bar shows the time left. Undo removes the completion.
- **After:** The row offers “Add a photo” (1514).

### 1510 · ReviewStep · Friends (default)
Route: `task/review` · Current app: differs · 81 has no visibility choice; posts drop to Home with “Saved.”
- **Photo:** The live photo, 4:5, camera seal. Tap opens it full size.
- **Caption:** Optional, 120 characters.
- **Who sees this:** Always visible above the button: Friends (default) · Everyone · Only me. Selected = inverted, no orange.
- **Line:** Friends: “Your 12 friends see it in their feed.” Everyone: “Anyone on GRIIT can see it, in the feed and on the challenge board.” Only me: “Only you can see it. It still counts for today.”
- **Default:** Friends. The last choice is remembered per challenge.

### 1511 · ReviewStep · Only me · button matches
Route: `task/review` · Current app: not built
- **Button:** Matches the choice: “Post to friends”, “Post to everyone”, “Save privately”.
- **Only me:** Saves to your record. The day still counts. Nothing in the feed.
- **Everyone:** Also shown on the challenge board.

### 1512 · PostView · just posted · Lands on the post
Route: `post/[id]` · Current app: differs · 81 shows a “Saved.” toast on Home
- **Lands on:** The post as it looks in the feed: photo, “Read 10 pages a day · Day 6 of 30”, caption, visibility badge.
- **Badge:** Lock = Only me, people = Friends, globe = Everyone. Tap opens 1513.
- **Actions:** “Share outside GRIIT” opens the share sheet (story card, sticker, link). “Back to today” returns to Home.
- **Secured:** If this post secured the day, the Secured moment (1516) shows first, then this.

### 1513 · VisibilitySheet · From “…” → Change who sees this
Route: `post/[id]` · Current app: not built
- **“…” menu:** Change who sees this · Share outside GRIIT · Edit caption · Delete post.
- **Sheet:** Same three options with their lines. Current choice checked. “Save” / “Cancel”.
- **Effect:** Friends → Only me removes it from feeds right away. Likes stay; comments hide.
- **Delete:** Removes it from the feed only. The proof stays in your record and the day stays secured (204).

### 1514 · TaskRow · self-reported done · No post step · “Add a photo”
Route: `(tabs)/index` · Current app: differs · 81 opens a post step with no photo
- **No post step:** Self-reported Done with no photo just checks the row.
- **Add a photo:** Text action on the done row until midnight. Opens the camera, then 1510. Adding a photo doesn’t change the completion time.
- **Feed:** Nothing is posted unless a photo is added, or the user shares the day.

### 1515 · SavedToast · Saved privately · Share tappable 4 s
Route: `(tabs)/index` · Current app: differs · 81 puts the thumbnail over the Share button
- **When:** Only after “Save privately”. Posts to friends or everyone land on 1512 instead.
- **Copy:** “Saved privately. It counts for today.”
- **Share:** Full 44pt button, tappable for the whole 4 s. Opens 1513 preset to Friends.
- **Removed:** The thumbnail. Nothing overlaps the button.

### 1516 · SecuredMoment · First secured day · shown once
Route: `task/secured` · Current app: differs · 81 skips it after a post
- **When:** The post or check-off that secures the day shows this first, then the post (1512) or Home.
- **First time:** “Secured. Every task done today.” shown once, on the first secured day. After that: “Day secured.”
- **Content:** Flame + streak, week strip with today filled, today’s tasks with done checks.
- **Button:** “Continue”.

### 1520 · ProfileHeader · Own profile
Route: `(tabs)/profile` · Current app: differs · spacing; “Find friends” floats as a text line
- **Order:** Avatar 80 · name (Title 20, wraps) · @handle · bio · Followers · Following · Friends · two buttons · stats.
- **Counts:** Followers 128 · Following 96 · Friends 12. Each opens 1525 on that tab. Friends = follow each other.
- **Buttons:** “Edit profile” and “Find friends”, equal width, both secondary.
- **Stats:** Streak (flame) · Best · Days secured, one card, hairline dividers. Fields: user_stats.current_streak, best_streak, secured_days.
- **Spacing:** 16pt between blocks, 12pt bio, 4pt name to handle.

### 1521 · ProfileTabs · Scrolled · tabs pinned
Route: `(tabs)/profile` · Current app: yes
- **Tabs:** Proofs · Your data · Challenges · Badges. Selected = Text 1 + 2pt underline. No orange.
- **Pinned:** Tabs pin under the top bar while the grid scrolls.

### 1522 · ProofGrid · Loading · shimmer
Route: `(tabs)/profile` · Current app: differs · 81 shows grey boxes and the upload date
- **Grid:** 3 columns, 4:5 tiles, 2pt gaps, newest first. One tile per proof.
- **Date:** The day the proof was taken, in the user’s time zone: proofs.taken_at → local date. Photo tiles bottom-left, self-reported tiles top-left.
- **Loading:** Blurhash from proofs.blurhash, else a shimmer. Never flat grey.
- **Tap:** Opens 1523 at that post.

### 1523 · MyPostsFeed · Opens at the tapped Oct 9 post
Route: `profile/posts?at={proof_id}` · Current app: differs · 81 opens the stories viewer
- **Opens:** At the tapped post. Scroll up for newer, down for older. Newest first. Not the stories viewer.
- **Each post:** Photo · “{challenge} · Day n of N” · date · caption · visibility badge · likes · comments · “…”.
- **Top bar:** “Posts” + back. Back returns to the grid at that tile.
- **Self-reported:** Shown as the v51 self-reported card in the same list.

### 1524 · PostHeader · day label · Date taken + Day n of N for that date
Route: `profile/posts` · Current app: differs · 81 shows “11 October · Day 7” for a 9 October photo
- **Rule:** Date = proofs.taken_at in the user’s time zone. Day n = taken date − enrollment.started_on + 1. N = challenges.duration_days.
- **Format:** Within 7 days: “Today”, “Yesterday”, weekday (“Fri”). Older: “Oct 9”. Other years: “Oct 9, 2025”.
- **Same everywhere:** Grid tile, post header, story card, share card and the Activity list use one formatter (v53/dates.ts).
- **Example:** Started Oct 7, taken Oct 9 → “Oct 9 · Day 3 of 30”.

### 1525 · ConnectionsList · Followers · 128
Route: `profile/connections?tab=followers` · Current app: differs · 81 has Friends only
- **Tabs:** Followers · Following · Friends, opened on the tapped count.
- **Rows:** Avatar · name · @handle · button. “Follow back” if they follow you, “Following” if you both do. All secondary (one orange per screen).
- **Search:** Filters by name or @handle, local first, then server.
- **Unfollow:** Tap “Following” → confirm sheet “Unfollow Omar?”.

### 1526 · ProfileScreen · someone else · Following · Message
Route: `u/[handle]` · Current app: differs · spacing
- **Same layout:** As 1520. Tabs: Proofs · Challenges · Badges (no Your data).
- **Buttons:** “Follow” (inverted, not orange) / “Following” (secondary) and “Message” (optional, hidden until DMs ship).
- **Proofs:** Only what they shared to you: Friends or Everyone.

### 1527 · ProfileHeader · Long name · empty bio
Route: `(tabs)/profile` · Current app: pending
- **Long name:** Wraps to 2 lines next to the avatar, never truncated. Over 2 lines, the size steps to Headline 17.
- **Empty bio:** No placeholder and no gap. The counts row moves up.
- **Zero:** “0 Followers” etc. still shown and tappable.

### 1528 · ConnectionsList · Empty
Route: `profile/connections?tab=following` · Current app: not built
- **Copy:** Followers: “No followers yet.” Following: “You’re not following anyone yet.” Friends: “Friends are people you follow who follow you back.”
- **Action:** “Find friends” (contacts, @handle search, invite link).

### 1530 · FeedPost · like · Double-tap · burst + liked
Route: `(tabs)/index` · Current app: differs · 81 heart likes but doesn’t unlike
- **Heart:** Tap toggles like / unlike. Liked = filled Text 1 heart. Never orange.
- **Double-tap:** Likes (never unlikes) and shows the white burst at the photo centre, 600 ms.
- **Single tap:** Does nothing on the photo, so a double-tap never misfires. Comments and caption open the post.
- **Count:** “Liked by Omar and 3 others”. 1: “Liked by Omar”. You first when you liked it: “Liked by you and 4 others”.

### 1531 · FinishedPost · Challenge complete card
Route: `(tabs)/index` · Current app: differs · 81 reads “Finished Drink Water Today · 11d”
- **Title:** “Finished Drink Water Today”. Under it: “Omar Siddiqui · Sep 30” (the finish date). Never “· 11d”.
- **Card:** Done check (orange, allowed) · “Challenge finished” · “13 of 13 days secured” · Longest streak · Freezes used · “Sep 18 – Sep 30” · 4 best proofs.
- **Best proofs:** Up to 4 of the user’s shared proofs with the most likes in that challenge. None shared: the strip hides.
- **Time:** Posts older than 7 days show the date (“Sep 30”), not “11d”.
- **Actions:** Like, comment, share, like any post.

### 1532 · ActivityLine · started · Recent + older than 7 days
Route: `(tabs)/index` · Current app: yes · dates differ
- **Line:** Secondary 15, Text 2, 24pt faces. Grouped per challenge per hour.
- **Not likeable:** No heart, no comments. Tap opens the challenge preview with Join.
- **Copy:** “Omar and 2 others started Up by 5” · “Bilal started Read 10 pages a day”.
- **Time:** Within 7 days: “2h”, “Fri”. Older: “Sep 28”.

### 1533 · FeedScreen · sparse · Following fewer than 3
Route: `(tabs)/index` · Current app: yes
- **Banner:** “Everyone is on until you follow 3 people.” Text 2, no box.
- **Row:** “Find friends” row with icon + chevron. Opens contacts / search.
- **Then:** Everyone’s public posts, newest first. Turns off at 3 follows.

### 1534 · HomeTop · streak card · Today secured · current = best
Route: `(tabs)/index` · Current app: differs · 81 leaves today empty after “Day secured.” and reads “4 days in a row · Your best”
- **Today:** Once secured, today’s circle fills (Text 1 + check) right away, before refresh.
- **Count:** “4 days in a row”. Pluralised through count().
- **Best:** Small “Best” badge only when current streak = best and > 1. Otherwise no badge; the best number lives on Profile.
- **Line:** “Day secured. See you tomorrow.” + quiet “Share today”.

### 1535 · FeedPost · like · Not liked
Route: `(tabs)/index` · Current app: pending
- **Heart:** Outline heart, count “4”.
- **Line:** “Liked by Omar and 3 others”.

### 1540 · TimerLiveActivity · Lock Screen · Running
Route: `Live Activity` · Current app: differs · 81 is plain text and a thin bar
- **Size:** ~160pt tall, dark card (system tints the background). SwiftUI; no custom animation.
- **Top:** G mark · challenge name (“5-Minute Morning Prayer”) · flame + streak “5”.
- **Middle:** Task “Pray for 5 minutes” · “Day 6 of 7” · big countdown Text(timerInterval:) “4:32” · progress ring (ProgressView(timerInterval:)).
- **Buttons:** “Pause” and “Done” (App Intents, iOS 17+). Done = finish early, self-reported, then opens the post step.
- **Orange:** Flame only.

### 1541 · TimerLiveActivity · Lock Screen · Paused
Route: `Live Activity` · Current app: not built
- **Time:** Frozen “3:10”, Text 2. Ring holds. Pause icon in the ring.
- **Line:** “Paused · 1:50 of 5:00”.
- **Buttons:** “Resume” and “Done”.
- **Stale:** After 30 min paused, the activity ends with “Paused timer ended. Open GRIIT to finish.”

### 1542 · TimerLiveActivity · Lock Screen · At 0:00
Route: `Live Activity` · Current app: differs · copy
- **Copy:** “Done. Tap to post.” · “Pray for 5 minutes · Day 6 of 7”.
- **Secures:** If this is the last task today: “Secures today” line.
- **Check:** The orange done check (allowed use) + streak number.
- **Tap:** Opens the post step (1510). Ends after 1 hour.

### 1543 · Dynamic Island · compact · Flame + countdown
Route: `Live Activity` · Current app: differs · 81 shows the G mark
- **Leading:** Flame (orange, allowed).
- **Trailing:** Countdown “4:32”, tabular, Text 1.
- **Tap:** Opens the timer screen. Long-press expands (1545).

### 1544 · Dynamic Island · minimal · Shared with another activity
Route: `Live Activity` · Current app: yes
- **Minimal:** Progress ring around a small flame. Shown when another app’s activity is also live.

### 1545 · Dynamic Island · expanded · Same content as 1540
Route: `Live Activity` · Current app: differs
- **Content:** Challenge · flame + streak · task · “Day 6 of 7” · countdown · ring · Pause / Done.
- **Size:** System expanded height (~160pt). Buttons 40pt.

### 1546 · TimerLiveActivity · Lock Screen · Day secured · ~5 min then ends
Route: `Live Activity` · Current app: not built
- **Copy:** “Day secured · 5 days in a row”. Under it: “Every task done today.”
- **Visual:** Orange done check + flame + streak. No buttons.
- **End:** dismissalPolicy .after(now + 5 min).

### 1550 · StarterPicker · Nothing picked · buttons wait
Route: `onboarding/starter` · Current app: not built
- **Title:** “Pick something easy. Do it today.” Sub: “It secures your first day.”
- **Options:** Drink a glass of water · Write one thing you’re grateful for · Lay out tomorrow’s workout clothes · Set tomorrow’s alarm · Read one page · Make your bed · Write your own.
- **Buttons:** “Do it now” (primary) and “Do it later” (text). Both disabled until something is picked.
- **Later:** Puts it on Home as “Today only” (1556).

### 1551 · StarterPicker · write your own · Over 40 characters · error
Route: `onboarding/starter` · Current app: not built
- **Field:** Opens under “Write your own”, keyboard up, “47 / 40”.
- **Error:** “Keep it to 40 characters.” Buttons disabled until it fits. Empty: “Write a task first.”
- **Rule:** 1–40 characters, trimmed.

### 1552 · StarterStep · Grateful · text + photo or no photo
Route: `task/complete` · Current app: not built
- **Header:** Label “Starter”, title “Today only”.
- **Grateful:** Text field, 1–120 characters.
- **Buttons:** “Take photo” (primary) or “Done without photo” (Self-reported).
- **Other starters:** Same screen without the field.

### 1553 · SecuredMoment · starter · +1 freeze
Route: `task/secured` · Current app: not built
- **Copy:** “Secured.” · “Every task done today.” · freeze row “+1 freeze. It covers one missed day.”
- **Freeze:** +1 freeze, granted once per lifetime, when the starter is completed. Counts toward the cap (2 Free / 4 Pro).
- **Day 1:** “Day 1 of Read 10 pages a day starts tomorrow.” The starter alone secures today.
- **Button:** “Continue” → Account (1554).

### 1554 · SaveAccount · Starter done
Route: `onboarding/account` · Current app: differs · copy
- **Title:** “Save your streak and your freeze.” Sub: “Your first day is secured. Sign in so it’s still here tomorrow.”
- **Rows:** Streak “1 day”, Freezes “1”, “Read 10 pages a day · Starts tomorrow”.
- **Buttons:** Sign in with Apple (first) · Continue with email · “Have an account? Log in”. No skip.

### 1555 · SaveAccount · Starter not done
Route: `onboarding/account` · Current app: differs · copy
- **Title:** “Save your challenge.” Sub: “Sign in so your challenge and today’s starter are kept.”
- **Rows:** “Read 10 pages a day · Starts tomorrow”, “Drink a glass of water · Today only”.
- **Buttons:** Same as 1554. No skip.

### 1556 · HomeScreen · starter waiting · Starter on top · “Today only”
Route: `(tabs)/index` · Current app: not built
- **Top task:** The starter is today’s only task, tag “Today only”. One tap if self-reported, else opens 1552.
- **Secures:** “Today is secured when the starter is done. Day 1 of Read 10 pages a day starts tomorrow.”
- **Tomorrow:** A quiet line under Today: “Tomorrow · Read 10 pages · Day 1 of 30”. Not tappable.
- **Midnight:** Unfinished starter disappears at midnight. It never comes back.

### 1557 · StarterPicker · Picked · buttons on
Route: `onboarding/starter` · Current app: not built
- **Picked:** Radio fills Text 1. Buttons enable.

### 1560 · DiscoverScreen · Faith · no popular this week · section hidden
Route: `(tabs)/discover` · Current app: differs · 81 leaves an empty “Popular this week” gap
- **Rule:** If a category has no challenge with joins this week, “Popular this week” is not rendered. No header, no gap.
- **Then:** “All Faith challenges” starts right under the chips.

### 1561 · ChallengeRow · category label · Labels match the challenge
Route: `(tabs)/discover` · Current app: differs · 81 labels 5-Minute Morning Prayer as Health
- **Label:** “{category} · {length} · {n} doing it” from challenges.category. Never inferred from the cover.
- **Examples:** 5-Minute Morning Prayer = Faith · Drink Water Today = Health · Gym once a day = Fitness · Read 10 pages a day = Reading · Up by 5 = Mornings.

### 1570 · NativeTabs · Liquid Glass · Home · bar over the dark feed
Route: `(tabs)/index` · Current app: solid tab bar
- **Bar:** iOS 26 system tab bar (native TabView). Floating glass capsule, 21pt from the edges. The system draws the glass from what’s behind it.
- **Tabs:** Home · Discover · Create · Activity · Profile (Create = option A, 1571). SF Symbols house, safari, plus, bell, person + labels.
- **Selected:** Home: icon + label in orange (the active-tab use, one of the 4), on the system’s neutral selection pill. Never an orange pill.
- **Behind:** Keep content behind the bar dark (ink ground, dark feed) so the glass reads dark. Content scrolls under it; last item gets bottom inset.

### 1571 · NativeTabs · + as a tab · Option A · chosen
Route: `(tabs)/index` · Current app: no create entry in the bar
- **Option A:** + is the middle tab (“Create”). Tapping it opens Create as a sheet; the selected tab doesn’t change.
- **Why A:** Fully native: one system bar, minimises with it, VoiceOver reads it as a tab, no custom drawing. Same pattern as Instagram.
- **Never:** A raised or orange centre button.

### 1572 · NativeTabs · minimised · Home · scrolling down
Route: `(tabs)/index` · Current app: n/a
- **Behaviour:** .tabBarMinimizeBehavior(.onScrollDown). Scrolling down shrinks the bar to the selected tab; scrolling up restores 1570.
- **Minimised:** Small glass capsule, bottom-left, the selected tab’s icon in orange. Tap restores the bar.

### 1573 · Glass surfaces · Switch · badge · toast
Route: `(tabs)/index` · Current app: n/a
- **Switch:** Following / Everyone floats as a glass capsule over the feed. Selected = lighter glass, Text 1. No orange.
- **Badge:** Visibility badge on photos: small glass capsule, bottom-right.
- **Toast:** Saved toast (1515) on glass above the bar. Share is a lighter glass button, tappable for 4 s.
- **Timer:** Pause / Finish early on glass (1579).
- **Top bar:** Profile feed top bar on glass (1577).
- **Never:** Glass is never orange, never on the primary button, never stacked glass on glass.

### 1574 · Tab bar · iOS 18 and older · Solid dark bar
Route: `(tabs)/index` · Current app: this bar
- **Fallback:** iOS 18 and older: the solid dark bar, same 5 tabs and SF Symbols (Create opens the sheet), active tab orange.
- **Surfaces:** Glass surfaces fall back to Surface (#1C1B1A) fills.

### 1575 · NativeTabs · selection · Switched to Discover
Route: `(tabs)/discover` · Current app: n/a
- **Selected:** Discover icon + label orange; the system selection pill (neutral glass) slides to it. Home goes back to Text 1.
- **Orange:** The active tab is the only orange in the bar. If the screen already shows an orange primary, that’s fine: they’re different allowed uses (button fill vs active tab).
- **State:** Each tab keeps its own scroll position and navigation stack.

### 1576 · NativeTabs · detached + · Option B · not chosen
Route: `(tabs)/index` · Current app: n/a
- **Option B:** A separate round glass + next to the bar.
- **Why not:** iOS only detaches a tab with the search role. Using it for Create means VoiceOver announces “Search”, or drawing a custom overlay that doesn’t minimise or morph with the bar.

### 1577 · MyPostsFeed · glass · Scrolling down · bar minimised
Route: `profile/posts` · Current app: n/a
- **Top bar:** Glass capsule with back + “Posts”, floating over the photos (scrollEdgeEffect). Stays while scrolling.
- **Tab bar:** Minimised to the Profile icon.
- **Badge:** Visibility badge on the photo is glass (1573).

### 1578 · MyPostsFeed · glass · Scrolling up · bar back
Route: `profile/posts` · Current app: n/a
- **Scroll up:** The full bar returns with Profile selected.

### 1579 · TimerStep · glass controls · Running · Pause / Finish early on glass
Route: `task/complete` · Current app: n/a
- **Buttons:** Two glass capsules (.glassEffect, interactive), equal width, 52pt. Pause becomes Resume.
- **Why glass:** They float over the ring area; no orange because neither is the primary action.

## src/components/v53/copy.ts

```ts
// v53 · copy and constants
export const VISIBILITY = {
  friends: { icon: 'users', label: 'Friends', line: 'Your {n} friends see it in their feed.', button: 'Post to friends' },
  everyone: { icon: 'globe', label: 'Everyone', line: 'Anyone on GRIIT can see it, in the feed and on the challenge board.', button: 'Post to everyone' },
  me: { icon: 'lock', label: 'Only me', line: 'Only you can see it. It still counts for today.', button: 'Save privately' },
} as const;
export const DEFAULT_VISIBILITY = 'friends';
export const COPY = {
  countDone: (target: number, unit: string) => `Done · ${target} ${unit}`,
  timerStart: (mmss: string) => `Start ${mmss}`,
  timerAlready: 'Done, already did it',
  timerFinishEarly: 'Finish early',
  timerElapsed: (done: string, total: string) => `${done} of ${total}`,
  securedFirst: 'Secured. Every task done today.',
  secured: 'Day secured.',
  savedToast: 'Saved privately. It counts for today.',
  shareOutside: 'Share outside GRIIT',
  backToToday: 'Back to today',
  addPhoto: 'Add a photo',
  changeVisibility: 'Change who sees this',
  sparseFeed: 'Everyone is on until you follow 3 people.',
  finishedTitle: (c: string) => `Finished ${c}`,
  likedBy: (first: string, others: number) => others ? `Liked by ${first} and ${others} ${others === 1 ? 'other' : 'others'}` : `Liked by ${first}`,
  laZero: 'Done. Tap to post.',
  laSecures: 'Secures today',
  laSecured: (n: number) => `Day secured · ${n} ${n === 1 ? 'day' : 'days'} in a row`,
  starterTitle: 'Pick something easy. Do it today.',
  starterFreeze: '+1 freeze. It covers one missed day.',
  accountDone: 'Save your streak and your freeze.',
  accountNotDone: 'Save your challenge.',
  todayOnly: 'Today only',
};
export const STARTERS = ['Drink a glass of water', 'Write one thing you’re grateful for', 'Lay out tomorrow’s workout clothes', 'Set tomorrow’s alarm', 'Read one page', 'Make your bed'];
export const STARTER_MAX = 40;
export const SAVED_TOAST_MS = 4000;
export const UNDO_MS = 5000;
export const LA_SECURED_DISMISS_MIN = 5;
export const showBestBadge = (current: number, best: number) => current > 1 && current >= best;

// v53.1
export const STARTER_RULES = { securesTodayAlone: true, challengeDay1: 'tomorrow', freezeOncePerLifetime: true };
export const STARTER_COPY = {
  homeLine: (challenge: string) => `Today is secured when the starter is done. Day 1 of ${challenge} starts tomorrow.`,
  startsTomorrow: (challenge: string) => `${challenge} · Starts tomorrow`,
  tomorrowLine: (task: string, n: number) => `Tomorrow · ${task} · Day 1 of ${n}`,
};
export const TABS = [
  { key: 'home', label: 'Home', sf: 'house' },
  { key: 'discover', label: 'Discover', sf: 'safari' },
  { key: 'create', label: 'Create', sf: 'plus', opensSheet: true },
  { key: 'activity', label: 'Activity', sf: 'bell' },
  { key: 'profile', label: 'Profile', sf: 'person' },
] as const;
export const GLASS_SURFACES = ['tabBar', 'feedSwitch', 'savedToast', 'timerControls', 'profileFeedTopBar', 'visibilityBadge'] as const;
```

## src/components/v53/dates.ts

```ts
// v53 · one formatter for every day label (grid, post header, cards, activity)
export function dayLabel(takenAtISO: string, tz: string, now = new Date()): string {
  const d = new Date(new Date(takenAtISO).toLocaleString('en-US', { timeZone: tz }));
  const n = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const days = Math.floor((+new Date(n.toDateString()) - +new Date(d.toDateString())) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== n.getFullYear()) o.year = 'numeric';
  return d.toLocaleDateString('en-US', o);
}
// Day n for the date the proof was taken, not today
export const dayOfChallenge = (takenLocalDate: string, startedOn: string, durationDays: number) => {
  const n = Math.round((Date.parse(takenLocalDate) - Date.parse(startedOn)) / 86400000) + 1;
  return `Day ${Math.min(Math.max(n, 1), durationDays)} of ${durationDays}`;
};
```
