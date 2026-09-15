# Typecheck baseline updated 2026-05-02

The audit and several follow-up prompts referenced "3 baseline `TS2307` errors on `@sentry/node`" as a tolerated state. This is **no longer the baseline.**

As of commit `e34aaab`:

- Root `package.json` includes `@sentry/node: ^10.50.0` as a `devDependency`.
- `npx tsc --noEmit` returns 0 errors.
- Future cursor prompts that gate on "tsc must stay at baseline" should expect **0**, not 3.

If a future prompt fails its tsc gate at 1+ errors, that's a real signal — investigate the change rather than tolerating the count.

The runtime production behavior is unchanged: backend deploys via `cd backend && npm install` per `nixpacks.toml`, which uses `backend/package.json`'s own `@sentry/node` entry.
