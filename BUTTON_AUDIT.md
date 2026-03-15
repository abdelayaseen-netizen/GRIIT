# BUTTON AUDIT — GRIIT

Post UI overhaul. Verify every button/link has a destination or action.

## Tab Bar

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Home icon | Tab bar | /(tabs) | ✅ |
| Discover icon | Tab bar | /(tabs)/discover | ✅ |
| + FAB | Tab bar center | /(tabs)/create | ✅ |
| Movement icon | Tab bar | /(tabs)/activity | ✅ |
| Profile icon | Tab bar | /(tabs)/profile | ✅ |

## Home Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Score pill | Header right | (display only) | ✅ |
| Streak pill | Header right | (display only) | ✅ |
| Explore Challenges | Hero section | /(tabs)/discover | ✅ |
| Find a challenge | Welcome card | /(tabs)/discover | ✅ |
| Pick a Challenge | Welcome back card | /(tabs)/discover | ✅ |
| Open Challenge > | LIVE CTA card | /challenge/[id] | ✅ |
| Respect X | LIVE feed card | Increment respect (API) | ✅ |
| Chase | LIVE feed card | /profile/[username] | ✅ |
| View Profile > | Rank up card | /profile/[username] | ✅ |
| Secure Now | YOUR POSITION card | /(tabs)/discover | ✅ |
| Task checkboxes | Today's Reset | Toggle task completion (API) | ✅ |
| Suggested challenge row | Suggested section | /challenge/[id] | ✅ |

## Discover Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Search bar | Top | Filter challenges | ✅ |
| Category pills | Below search | Filter by category | ✅ |
| 24h challenge card | 24h section | /challenge/[id] | ✅ |
| Featured challenge card | Featured section | /challenge/[id] | ✅ |
| X active today > | Featured card | /challenge/[id] | ✅ |
| More challenge card | More section | /challenge/[id] | ✅ |

## Challenge Detail Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Back arrow | Header left | navigation.goBack() | ✅ |
| ... menu | Header right | Action sheet (report, share) | ✅ |
| Start > | Mission row | Task execution screen | ✅ |
| Start | Bottom fixed bar | Commitment modal | ✅ |
| Confirm Commitment | Commitment modal | Join challenge (API) → Home | ✅ |
| Cancel | Commitment modal | Dismiss modal | ✅ |

## Movement Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Teams button | Header right | /teams | ✅ |
| Global/Friends/Team tabs | Tab selector | Switch feed | ✅ |
| User avatar/name | Feed row | /profile/[username] | ✅ |
| Respect X | Feed row | Increment respect (API) | ✅ |
| Share arrow | Feed row | Share sheet | ✅ |

## Profile Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Edit button | Below name | /edit-profile | ✅ |
| Share button | Below name | Share sheet | ✅ |
| Edit (visibility) | Visibility row | /settings | ✅ |
| Settings > | Settings row | /settings | ✅ |
| Sign Out | Bottom | Sign out (API) → Auth screen | ✅ |

## Create Challenge Flow

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Step indicators | Top | Navigate between steps | ✅ |
| Duration pills | Step 1 | Set duration state | ✅ |
| Category pills | Step 1 | Set category state | ✅ |
| Next: Add Tasks > | Step 1 bottom | Step 2 | ✅ |
| + Add Task | Step 2 | New Task modal | ✅ |
| Pack cards | Step 2 | Apply pack tasks | ✅ |
| Cancel | New Task modal | Dismiss modal | ✅ |
| Add | New Task modal | Add task to list | ✅ |
| Task type cards | New Task modal | Select type + show settings | ✅ |
| < Back | Step 2/3 | Previous step | ✅ |
| Review > | Step 2 | Step 3 | ✅ |
| Visibility options | Step 3 | Set visibility state | ✅ |
| Create Challenge | Step 3 | Submit (API) → Discover | ✅ |

## Settings Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Back arrow | Header | navigation.goBack() | ✅ |
| Visibility toggles | Privacy section | Update visibility (API) | ✅ |
| Notification toggles | Notifications | Update settings (API) | ✅ |

## Teams Screen

| Button | Location | Destination | Status |
|--------|----------|-------------|--------|
| Back arrow | Header | navigation.goBack() | ✅ |
| + Create a Team | Center | Create team flow | ✅ |
| Join with Code | Below create | Join team modal | ✅ |
