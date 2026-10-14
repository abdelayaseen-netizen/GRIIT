# Blockers

## Seed account

`scripts/seed-build89.ts` is ready and uses the service role. It did not run.

`.env` and `.env.local` on this machine have the public Supabase URL and the anon key. They do not have `SUPABASE_SERVICE_ROLE_KEY`. The existing `SEED_EMAIL` is not a Maestro test address, so it was not used.

No schema change was written. No SQL was run. Railway and Supabase settings were not touched.

Until that key is available locally, the day-6 / freeze / 18-proof account cannot be created, and the Maestro bug flows that need it cannot be proven on the simulator.

## Simulator bundle

Build 89 JavaScript is now what the simulator loads, from Metro on port 8082 in `/Users/yaseenabdela/Developer/GRIIT-build87`. Port 8081 is still the build 88 Metro and was left running.

Settings → About on this dev client still shows commit `e2c7b2e`. That string is baked into the native build. A new EAS build is what puts a newer commit on About.

## Scoreboard and is_test on the phone

The scoreboard and the Maestro `is_test` write live in the API process. This simulator talks to the existing production API. Those server changes are in this branch and are not what that API is running, so bugs 8–12 cannot be proven on the phone until that API is the one serving this code. Railway settings were not changed.
