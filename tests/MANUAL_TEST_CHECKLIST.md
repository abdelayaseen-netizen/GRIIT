# GRIIT Beta — Manual Test Checklist

**Date:** ___________  
**Tester:** ___________  
**Device:** ___________  
**OS Version:** ___________

---

## First Launch (signed out)

- [ ] App opens without crash
- [ ] Onboarding questions load (4 steps)
- [ ] Can complete all 4 steps
- [ ] Redirected to signup after step 4
- [ ] Signup with email/password works
- [ ] Redirected to create-profile
- [ ] Can set username and bio
- [ ] Redirected to onboarding walkthrough
- [ ] Can complete onboarding
- [ ] Lands on Home tab

---

## Home Tab

- [ ] Active challenges load (or empty state shows)
- [ ] Streak counter displays correctly
- [ ] "Secure day" button appears for active challenge
- [ ] Tapping tasks marks them complete
- [ ] After all tasks done, "Secure day" is tappable
- [ ] Secure day shows confirmation screen
- [ ] Confirmation shows variable message (not always the same)
- [ ] Returning to Home shows updated streak
- [ ] Pull-to-refresh works
- [ ] Leaderboard section loads (or shows "Couldn't load" + Retry)

---

## Discover Tab

- [ ] Challenges load with skeleton while loading
- [ ] Daily challenges section visible (horizontal scroll)
- [ ] Featured / More Challenges section visible
- [ ] Scrolling loads more (infinite scroll / pagination)
- [ ] Tapping a challenge opens detail
- [ ] Search works (filters challenges)
- [ ] Category filter works
- [ ] Empty state shows when no results
- [ ] Pull-to-refresh works

---

## Challenge Detail

- [ ] Challenge info loads (title, description, tasks, duration)
- [ ] "Join" button visible for challenges not yet joined
- [ ] Tapping "Join" goes to commitment screen
- [ ] Commitment screen → confirm → joined
- [ ] After joining, challenge appears on Home
- [ ] Share button works → generates correct link
- [ ] Back button returns to previous screen
- [ ] Leave button works (if implemented)
- [ ] Error state shows if challenge doesn't exist

---

## Create Tab

- [ ] Create form loads
- [ ] Can fill title, description, tasks
- [ ] Validation catches empty title
- [ ] Validation catches no tasks
- [ ] Submit creates challenge successfully
- [ ] Error shows as Alert if creation fails
- [ ] Soft paywall triggers after 3rd create (if applicable)
- [ ] Haptic feedback on submit

---

## Profile Tab

- [ ] Own profile loads (username, bio, stats)
- [ ] Streak, challenges completed, days secured display
- [ ] Achievement milestones visible (3, 7, 14, 30, 60, 100 days)
- [ ] Pull-to-refresh works
- [ ] Share profile button works
- [ ] Can view another user's profile from leaderboard

---

## Daily Challenges (24hr)

- [ ] Daily challenge appears on Discover (if auto-generated)
- [ ] Daily challenge has 24hr duration indicator
- [ ] Timer/countdown visible showing time remaining
- [ ] Can join a daily challenge
- [ ] Tasks track correctly within 24hr window
- [ ] Challenge auto-completes or locks after 24hrs
- [ ] Can create a custom 24hr challenge

---

## Auth & Session

- [ ] Logout works → returns to auth screen
- [ ] Login with existing account works
- [ ] Session persists after app close + reopen
- [ ] Invalid password shows clear error
- [ ] Rate limit on auth shows "Slow down" message

---

## Push Notifications

- [ ] Permission prompt appears on first launch (or at appropriate time)
- [ ] Morning reminder received (if set)
- [ ] Evening "streak at risk" reminder received (if day not secured)
- [ ] Tapping notification opens correct screen

---

## Deep Links

- [ ] Challenge share link opens correct challenge
- [ ] Profile share link opens correct profile
- [ ] Invite link works
- [ ] Link works when app is not installed (App Store fallback)

---

## Error Handling

- [ ] Turn off WiFi → app shows offline/error state, not blank screen
- [ ] Turn WiFi back on → pull-to-refresh recovers
- [ ] Force a network timeout → error message shown (not blank)
- [ ] No white screen of death at any point

---

## Edge Cases

- [ ] Double-tap "Secure day" doesn't create duplicate check-in
- [ ] Double-tap "Join" doesn't create duplicate enrollment
- [ ] Very long challenge title/description doesn't break layout
- [ ] Back button from every screen returns to expected place
- [ ] Kill app mid-action (creating challenge) → reopen → no corrupt state
