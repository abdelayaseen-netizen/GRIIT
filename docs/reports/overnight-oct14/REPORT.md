# Overnight report, 14 Oct 2026

Commit on the server: `e061ecd`. Branch `feat/build89`. Deployment `da8951e2-e4ff-4980-98ac-81620f5dacc4`.

TestFlight: not submitted. Build number: none. EAS was not started.

Spend: $0.83 of $40.

## Funnel

38 sessions. Item 22 is three accounts, so the numbered list of 36 produced 38 runs.

| Step | Count | Percent |
| --- | --- | --- |
| Opened | 38 | 100% |
| Home | 38 | 100% |
| Discover | 23 | 61% |
| Joined | 17 | 45% |
| Finished a task | 5 | 13% |
| Photo | 4 | 11% |
| Share | 4 | 11% |

Where they stopped: 26 gave up on a repeated screen, 1 hit the 60-step cap (Nina, the feed reader), and the rest stopped on their own. The usual dead end is Home or Discover.

## By persona type

| Type | Sessions | Gave up on a repeat | Average steps |
| --- | --- | --- | --- |
| First-timers | 6 | 4 | 17 |
| Faith | 6 | 4 | 10 |
| Fitness | 6 | 4 | 9 |
| Social | 8 | 6 | 14 |
| Edge | 6 | 4 | 12 |
| Returning | 6 | 4 | 7 |

The app gets a tired nurse and a skeptical quitter as far as Home. It does not get a runner to a distance, a trainer to an 8-person group, or the two friends to Alex's invite. Alex did copy a share link. Blake and Casey never saw it, because one simulator cannot hold three live sessions.

## Concept test

Secured, freeze, and self-reported were not asked. The session ended when the person gave up or stopped. 12 Oct was 0 of 24. This run does not add a new quiz score.

## Top problems

1. Photo post stays disabled. Jordan, Kai, and Grace reached Take proof photo. Post to friends did not complete the post. Jordan's note: the photo failed because the account is still private. Size M. `components` photo composer. Screenshot `agents/oct14/p01/shots/022.png`.
2. Home and Discover loop. 26 sessions. The same tab comes back and the person quits. Size M. Home empty-state and Discover cards.
3. First task is easy to miss after Join. Several people joined and then went looking for Home again. Size S.
4. checkins.complete 429 on the timer smoke. Not retried. Size S. Server rate limit.
5. Friend invite does not meet the other two people on one device. Size L for the test, S if the link itself works. Alex copied a link.
6. Create title fights emoji and blank input. Hugo double-tapped and the title field fought him. Size S.
7. Settings has no Home tab, so a flow that saves an email then looks for Home is stuck. Seen in the likes smoke. Size S.
8. About and the dev client are fine. The photo and timer failures are the ones that blocked ship.

## Bugs

New rows in BUGS.md: 17 photo post, 18 Home/Discover loop, 19 check-in 429. Status open. The original 16 stay "fixed – awaiting Yaseen".

## Build 89 verification

The 16 fixes held on the seeded account. Details are in `docs/reports/build89.md`. The agents did not reproduce Best 3, 12 am, Hard, or a clipped share card.

## Design gap

Compared with what the phone showed, not a frame-by-frame atlas.

Home: greeting, streak, Best 6, and today tasks are there. The feed hint is there when Everyone is selected. The empty next-action is "Find a challenge", and people loop on it.

Profile: Proofs, Your data, Challenges, Badges. Your data shows the scoreboard in one scroll. The grid opens Posts.

Post: the composer has Friends, Everyone, Only me, and Post to friends. The button can sit there disabled.

Share card: full card, flame, days in a row, challenge, handle, three colors. griit.app is absent.

Create: Step 1 of 3, category, length, Day 1 sentence, Strict on the later step, tasks listed on success.

## Speed

Cold start on a release build was not measured. The dev client on Metro was already warm. The slowest repeated action was the model deciding, not the screen. No screen in the logs was singled out as a multi-second hang.

## Quotes

- Jordan: "just tap Start to get going. Friend said this app was quick."
- Jordan: "Skipping the text dump. Just need to tap Continue."
- Jordan: "The photo failed to share because the account is still private."
- Amina: "I'm tired and just want to get through onboarding quickly."
- Amina: "I'm exhausted and need to finish this task."
- Robert read the freezes line and tapped Continue.
- Sam saved an email after bouncing off the photo.
- Nina stayed for 60 steps in the feed.
- Alex copied a share link for the group.
- Hugo typed a laughing emoji into the challenge title and double-tapped Continue.

## Recommendations

### Next build

1. Make Post to friends work when a photo is attached, and say why it is disabled when it is not.
2. After Join, land on the task, not back on Discover.
3. Give Find a challenge one obvious challenge, so Home does not bounce.
4. Raise or isolate the check-in limit so a real timer finish is not a 429.
5. Put Home back under Settings, or finish the email-save flow on that screen.

### Build after that

1. Let a group invite be opened by the other account without a second simulator.
2. Show distance on the run task Lina was hunting.
3. Put the leaderboard where Chris expected it on the first tap.
4. Keep Only me obvious for Owen and Diane.
5. Ask secured, freeze, and self-reported in the product, in one sentence each, on the first day.

### Build after that

1. Ship the internal TestFlight from this commit once the photo button and the 429 are fixed.
2. Re-run the 12 smoke flows on that build.
3. Re-ask the concept questions.
4. Measure cold start on the release binary.
5. Keep the scoreboard tests, they held.

## Data

`agents/oct14/summary/all-steps.csv` and `all-interviews.csv`. The interview file says "not asked" for the three definitions. Account files with passwords were not committed.
