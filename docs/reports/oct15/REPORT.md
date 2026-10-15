# Overnight report, 15 Oct 2026

Build 89 is on internal TestFlight. Number 89, version 1.0.0, commit `a375b25ac3e41c10f18f5d0d86b3f8a50bcf3714`. EAS `2625f8b4-8e7c-4f40-bd9d-4ef9366e57e0`. Submission `ac0d5d93-c6d9-4f51-87a1-99b17b1bc4d3` finished. Group Team (Expo). API health `a9c8873`, deployment `abe2e7d3-cf9b-42c5-9a71-a09aa40940a4`.

Spend: $1.41 of $40. Sessions live in `agents/oct15`. Steps and interviews: `all-steps.csv`, `all-interviews.csv`.

## Funnel

38 sessions. Item 22 is Alex, Blake, and Casey.

| Step | Count | Percent | Where the rest stopped |
| --- | --- | --- | --- |
| Opened Home | 38 | 100% | |
| Joined a challenge | 20 | 53% | The other 18 never got an enrollment row. |
| Finished a check-in | 10 | 26% | The Home ring labeled Done plus the task name does not open a photo task. |
| Photo posted | 7 | 18% | Post to friends worked for the people who reached the composer. |
| A like or follow | 2 | 5% | Maya and Nina. Nobody else tapped the heart. |
| Said they would return | 35 | 92% | Casey, Elena, and Jonah said no. This is what they said, not a later open. |

Drops, one line each:

- Jordan, Amina, Priya, Sam finished enough to say they would return. Casey (p04) reached a like-word on screen and scored 4.
- Robert and Casey (p04) tapped Done on the Home ring and the screen stayed.
- Yusuf, Helen, Diane, Leo, Maya joined. Noah finished a task. Helen's spoken score was 8.
- Marcus built in Create and never joined. Lina and Chris looked. Andre looked for an invite. Elena and Kai posted.
- Sasha, Owen, Nina, Alex, Blake, Casey (p22c), Rae, and Jonah did not finish a check-in. Nina was one of the two social actions. Jonah said he would not open it tomorrow.
- Tara, Victor, Imani, Felix, Grace, and Hugo mostly joined. Victor and Imani posted.
- Build, Guest, Reed, Sofia, and Tom are returning accounts. Reed found Delete account and the account went away. The reviewer spent the session on the password field, then walked onboarding again.

## By group

| Group | Sessions | Average steps | Joined | Finished a check-in | Photo |
| --- | --- | --- | --- | --- | --- |
| First-timers | 6 | 21 | 5 | 3 | 2 |
| Faith | 6 | 17 | 6 | 2 | 1 |
| Fitness | 6 | 18 | 2 | 2 | 2 |
| Social | 8 | 11 | 1 | 0 | 0 |
| Edge | 6 | 20 | 5 | 2 | 2 |
| Returning | 6 | 19 | 1 | 1 | 0 |

The friend group ran one after another on the same simulator. Alex did not leave a `griit://i/` link on screen, so Blake and Casey had no link to open.

## Concept test

Asked at the end, in character, for all 38. These lines are copied from `all-interviews.csv`.

Secured. 14 of 38 described privacy, encryption, or a hacker. 23 described a finished day, a task, or a proof. The product meaning is every task for the day is done.

Wrong:

- Priya: "I think it means your data and personal info is protected and safe on the app."
- Diane: "I think it means my data is private and encrypted."
- Lina: "I think it means my data is protected and private, like my run records are safely stored and encrypted."
- Rae: "I think it means my personal information and account are protected and safe from hackers or unauthorized access."
- Sofia: "I think it means my personal information and profile data are protected with encryption."

Closer:

- Chris: "It's when you complete all your tasks for the day - you 'secure' that day so it counts toward your streak."
- Amina: "I think it means I locked in my day - like I did what I needed to do today."

Freeze. 32 of 38 guessed a pause that saves the streak. 5 thought it paused the account. The product meaning is a missed day that does not reset the streak.

Wrong:

- Rae: "I'm guessing it means temporarily pausing or deactivating your account if you need a break without deleting everything."
- Reed: "Probably means I can temporarily pause or suspend my account without deleting it completely."

Closer:

- Tara: "A freeze is a safety net for when you miss a day. It lets you skip one missed day without breaking your streak."

Self-reported. 35 of 38 said you tell the app yourself. Two were wrong.

- Casey (p04): "That's the photo part, right? You're telling the app you did it instead of it tracking automatically."
- Rae: "That's when you report your own content or behavior - like if you posted something and realized it was inappropriate, you could report yourself."

## Top problems

Ranked by sessions touched, then how badly it blocks the day. Screenshots are under `agents/oct15`.

1. Find a challenge bounces Home and Discover. 20 sessions. Severity high. `components/home/HomeV3.tsx` empty state. Screenshot `agents/oct15/p03/shots/008.png`.
2. Secured is read as privacy. 14 of 38 interviews. Severity high. The word is on the secured day screen and is not defined there.
3. Home ring "Done {task}" does not open a photo task. 6 sessions. Severity high. `components/home/HomeV3.tsx:290`. Screenshot `agents/oct15/p04/shots/012.png`.
4. Social group finished nothing. 8 sessions, 0 check-ins. Severity high. They never got a first task.
5. Friend invite never appeared. Alex, Blake, Casey. Severity high. No `griit://i/` on screen.
6. Create sits under a Cancel title and people stall. Marcus, Owen, Alex. Severity medium. Create step 1.
7. Photo composer is reachable and Post to friends works, then the share sheet is unclear. 7 reached Post to friends. Jordan: "The whole share thing was confusing." Severity medium.
8. A running timer's Done does not finish the timer. Yusuf and Helen tapped Done over and over on 5-Minute Morning Prayer. Severity medium.
9. Password label does not focus the field. The reviewer, and the earlier seed login. `app/auth/login.tsx:219`. Severity medium. Screenshot `agents/oct15/p36/shots/008.png`.
10. Guest save loops Account and Go back. Guest (p32). Severity medium.
11. Delete account removes the person, which is what Reed wanted, and the next is_test check used to halt the batch. Severity medium for the harness, low for the product. The harness now lets the next person run.
12. Reviewer login did not stay on the review account. The screen went back to Start. Severity medium.
13. Some people stopped before 15 steps because a goal word was already on screen. Chris 9, Sasha 4, Jonah 4, Tara 6, Build 5, Reed 4. Severity medium for the test, not the product.
14. Likes are rare. Two social actions, no heart tap in the step log. Severity medium.
15. Screen titles collapse to the challenge name twice, or to Cancel. Hard to tell where you are. Severity low.
16. Your data shows Best and the number 6 as separate texts. Home still says Best 6. Severity low. Seeded account.
17. A test viewer still sees b88 handles. That is the rule for is_test. Severity low.
18. Double-tap on a photo opens the viewer in Maestro. The heart like and unlike did pass. Severity low.
19. Release cold start was not timed. Severity low for this night.
20. Analytics were not read. Severity low for this night.

## Bugs

Added to BUGS.md: 21 Home Done ring, 22 Password label. Bug 18 stays open. Bugs 17, 19, and 20 stay fixed, awaiting Yaseen.

## Fifteen quotes

1. Amina, on the best moment: "Seeing that checkmark pop up for day 1. Even at 3 AM when I'm running on nothing, knowing I did one thing right."
2. Amina, on freeze: "Like pausing your streak? Maybe if you need a break without losing your progress?"
3. Jordan, worst: "The whole share thing was confusing ngl, didn't really get why I needed to pick friends or whatever."
4. Jordan, tell a friend: "I'd be like 'yo there's this app where you prove you're doing something for a week'."
5. Chris, secured: "It's when you complete all your tasks for the day - you 'secure' that day so it counts toward your streak."
6. Priya, secured: "I think it means your data and personal info is protected and safe on the app."
7. Diane, secured: "I think it means my data is private and encrypted. That's why I chose this app over telling people in my life."
8. Tara, freeze: "A freeze is a safety net for when you miss a day."
9. Rae, self-reported: "That's when you report your own content or behavior."
10. Casey (p04), self-reported: "That's the photo part, right?"
11. Kai, secured: "Making sure nobody can say you didn't actually do it. That's why the photo proof is fire."
12. Helen, score 8, secured: "I think it means my progress is saved and protected, so I don't lose track of where I am in the 7-day prayer series."
13. Maya: "It means I've locked in my commitment for today - I completed my task and it's confirmed."
14. Sofia, score 8, freeze: "I'm guessing this means I can temporarily pause or deactivate my account without deleting it."
15. Tom, secured: "Secured means I've verified that I completed the challenge for that day—like I did something to prove it, not just claimed I did it."

## Next three builds

Build 90

1. Make the Home ring open the same task the name opens.
2. After Join, show the first undone task as the next tap, not Find a challenge.
3. Define secured, freeze, and self-reported on the day-secured screen in one sentence each.
4. Focus the password field when the label Password is tapped.
5. Put the invite link on the create-success screen as text, not only a share sheet.

Build 91

1. Let Done on a running timer mean "I finished early" or say why it is waiting.
2. After Post to friends, one line that says who can see it.
3. Stop the Account / Go back loop on the guest save screen.
4. Keep the reviewer on the review account when the app opens.
5. Show the friend invite to the next account on the same phone.

Build 92

1. A heart on your own Following post that is not under the tab bar.
2. Screen titles that are the page name once, not the challenge name twice.
3. Time a release cold start.
4. Read analytics for first secured day.
5. Re-test Best, day-of-duration, and proof count on the seeded account after a new check-in.
