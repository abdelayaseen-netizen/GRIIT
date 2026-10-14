# GRIIT overnight, 14 Oct 2026

Nothing went to TestFlight. The commit on `feat/build89` is `e457e85a`. The smoke test the ship step requires did not pass, so the build was not uploaded.

What did land in the app code: creating a challenge now keeps the category you picked, keeps a starter pack and a task you add yourself, and the success screen lists every task. The word on Create and Discover is Strict. A guest sees the word guest. The line "Everyone is on until you follow 3 people" stays off when Following is selected.

What broke, or never got proven: there is no service-role key on this machine, so the practice account with a day-6 streak, a freeze, and 18 photos was not created. Likes, the profile grid, the share card, and the scoreboard numbers were not checked on a phone that has that history. The scoreboard math lives on the server, and the server this phone talks to is still the old one. Thirty-six people were not run through the app. That test needs each account marked as a test account by the server at creation, and that write needs the same missing key.

The five biggest problems:

1. The practice account could not be created, so the streak, proof count, and like bugs were not shown fixed on a phone.
2. The phone still asks the old server for Your data, so the new streak and proof math is not what a person sees yet.
3. The Add task button sat below the sheet until the sheet was shortened. That is fixed in this commit. A person could not save a custom task before it.
4. Settings → About on the simulator still shows commit `e2c7b2e`, because that line is baked into the installed app, not the JavaScript.
5. The 36-person test did not run, so there is no new score for whether a real person would come back tomorrow.

The five best things:

1. Review showed Discipline, not Fitness, after an Athlete pack was picked.
2. Evening journal and the three Athlete tasks all appeared on Review and on the success screen.
3. Invite said "Only people you invite."
4. A guest account says guest, and it does not say "Signed in with email."
5. Discover no longer shows the word Hard.

What to do next: put the service-role key where the seed script can read it, create the practice account, prove likes and the scoreboard on that account, deploy the API that contains this commit, then run the 36 people. Ship to internal TestFlight only after that smoke is green.
