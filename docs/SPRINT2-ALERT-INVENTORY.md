# Sprint 2 — Alert.alert inventory

Generated from full codebase grep (2026-03-21). Command equivalent:

`grep -rn 'Alert\.alert' --include='*.tsx' --include='*.ts' | grep -v node_modules | sort`

## Full grep output (deduplicated paths)

```
app/accountability.tsx:67      Alert.alert(  "Remove partner" ...
app/accountability.tsx:81      Alert.alert("Error", ...
app/accountability.tsx:100     Alert.alert("Error", ...
app/accountability.tsx:115     Alert.alert("Error", ...
app/accountability/add.tsx:70  Alert.alert("Invite sent", ...
app/accountability/add.tsx:77  Alert.alert("Error", ...
app/auth/signup.tsx:143–200    Signup Failed / Something went wrong (multiple)
app/challenge/[id].tsx:787     "Leave Challenge" (destructive confirm)
app/challenge/[id].tsx:996     "Challenge" action sheet
app/challenge/[id]/chat-info.tsx:79   "Report an issue" ...
app/challenge/[id]/chat-info.tsx:87   "Thanks" ...
app/(tabs)/create.tsx:473      "Create succeeded" ...
app/(tabs)/create.tsx:500      "Challenge Created! 🎉" ...
app/(tabs)/profile.tsx:94      "Sign Out" ...
app/(tabs)/teams.tsx:68        "Leave team?" ...
app/settings.tsx:530           "Delete Account" ...
app/settings.tsx:588           "Error", delete failed
app/task/checkin.tsx:106,244,315,162,375  various
app/task/journal.tsx:257       "Great start!" ...
app/task/journal.tsx:325       "Save draft?" ...
app/task/manual.tsx:41         "Great start!" ...
app/task/photo.tsx:107,111     Great start / Success
app/task/run.tsx:153           "Switch Mode" ...
app/task/timer.tsx:99          "Focus lock on" ...
app/task/timer.tsx:199,203     Great start / Success
app/teams.tsx:45,59            Coming Soon
app/welcome.tsx:163–218        Signup errors (multiple)
components/home/LiveFeedCard.tsx:18  Coming Soon
components/TaskEditorModal.tsx:425   Missing Info
lib/share.ts:19,23             Copied!
```

## Classification table

| File | Line (approx) | First arg (title) | Button array? | Classification |
|------|---------------|-------------------|---------------|------------------|
| app/task/run.tsx | 153 | Switch Mode | yes (Cancel+Switch) | CONFIRM → keep |
| app/task/timer.tsx | 99 | Focus lock on | yes | CONFIRM → keep |
| app/task/timer.tsx | 199 | Great start! | yes (OK) | SUCCESS → convert |
| app/task/timer.tsx | 203 | Success! | yes (OK) | SUCCESS → convert |
| app/(tabs)/teams.tsx | 68 | Leave team? | yes | CONFIRM → keep |
| components/home/LiveFeedCard.tsx | 18 | Coming Soon | no | INFO → convert (inline) |
| app/(tabs)/create.tsx | 473 | Create succeeded | yes | SUCCESS → convert |
| app/(tabs)/create.tsx | 500 | Challenge Created! 🎉 | yes | SUCCESS → convert |
| app/auth/signup.tsx | 143+ | Signup Failed / Something went wrong | no | ERROR → convert |
| app/accountability.tsx | 67 | Remove partner | yes | CONFIRM → keep |
| app/accountability.tsx | 81,100,115 | Error | no | ERROR → convert |
| app/task/journal.tsx | 257 | Great start! | no | SUCCESS → convert |
| app/task/journal.tsx | 325 | Save draft? | yes | CONFIRM → keep |
| app/welcome.tsx | 163+ | Signup Failed / errors | no | ERROR → convert |
| app/challenge/[id].tsx | 787 | Leave Challenge | yes | CONFIRM → keep |
| app/challenge/[id].tsx | 996 | Challenge | yes | CONFIRM → keep |
| app/task/photo.tsx | 107,111 | Great start / Success | yes | SUCCESS → convert |
| app/(tabs)/profile.tsx | 94 | Sign Out | yes | CONFIRM → keep |
| app/settings.tsx | 530 | Delete Account | yes | CONFIRM → keep |
| app/settings.tsx | 588 | Error | no | ERROR → convert |
| app/task/manual.tsx | 41 | Great start! | yes | SUCCESS → convert |
| components/TaskEditorModal.tsx | 425 | Missing Info | no | ERROR/validation → convert |
| lib/share.ts | 19,23 | Copied! | no | SUCCESS → convert |
| app/challenge/[id]/chat-info.tsx | 79 | Report an issue | yes | CONFIRM → keep |
| app/challenge/[id]/chat-info.tsx | 87 | Thanks | no | SUCCESS → convert |
| app/accountability/add.tsx | 70 | Invite sent | no | SUCCESS → convert |
| app/accountability/add.tsx | 77 | Error | no | ERROR → convert |
| app/teams.tsx | 45,59 | Coming Soon | no | INFO → convert |
| app/task/checkin.tsx | 106 | Check-in Failed | yes (OK) | ERROR → convert |
| app/task/checkin.tsx | 162 | Location Required | no | ERROR/permission → convert |
| app/task/checkin.tsx | 244 | Check-in Failed | yes (OK) | ERROR → convert |
| app/task/checkin.tsx | 315 | Session Too Short | no | ERROR/validation → convert |
| app/task/checkin.tsx | 375 | Verification Failed | no | ERROR → convert |

**Note:** Paths may appear twice on Windows (`app\foo` vs `app/foo`); same logical lines.
