# PRE-PUSH CHECKLIST — chore/cleanup-prepush

Run this checklist locally before pushing to GitHub. All items should be green.

---

## 1. Install and static checks

```bash
npm install
npm run lint
npm run typecheck
npm run test
```

| Check | Pass/Fail | Notes |
|-------|-----------|--------|
| Lint passes | ☐ | `npm run lint` (expo lint) |
| Typecheck passes | ☐ | `npm run typecheck` or `npx tsc --noEmit` |
| Tests pass | ☐ | `npm run test` or `npx vitest run` |

---

## 2. App builds and runs

| Check | Pass/Fail | Notes |
|-------|-----------|--------|
| App builds | ☐ | e.g. `npm start` (Expo) |
| Backend starts | ☐ | `npm run backend:start` |
| No 404s on tRPC | ☐ | Health + one tRPC call (e.g. profiles.get) succeed |

---

## 3. Core flows smoke-tested

| Flow | Pass/Fail | Notes |
|------|-----------|--------|
| Sign in or guest browse | ☐ | Can open app and see tabs or auth |
| Onboarding | ☐ | New user can complete profile + onboarding steps |
| Create challenge | ☐ | Create flow submits and succeeds (or shows expected error) |
| Accountability invite/accept | ☐ | User A invites B; B sees invite and accepts; both see partner |
| Last Stand earn/use path | ☐ | Simulate: secure 6/7 days to earn; or miss 1 day with 1 Last Stand and see streak preserved |
| No tRPC 404s | ☐ | Routes used by app (profiles, checkins, accountability, streaks, etc.) resolve |

---

## 4. Cleanup-specific checks

| Check | Pass/Fail | Notes |
|-------|-----------|--------|
| stories.list returns ≤50 items | ☐ | Backend limit in place |
| leaderboard.getWeekly returns ≤100 entries | ☐ | Backend cap in place |
| Migrations present | ☐ | `supabase/migrations/` has accountability + last_stand SQL |
| No console spam in production paths | ☐ | Client logs behind __DEV__; server challenges behind !isProd |

---

## 5. Git

| Check | Pass/Fail | Notes |
|-------|-----------|--------|
| Branch | ☐ | On `chore/cleanup-prepush` |
| No unintended files | ☐ | `git status` shows only expected changes |
| Ready to push | ☐ | All above items passed |

---

**Do not push to GitHub until every item you can verify is green.**  
If npm/lint/typecheck/test cannot be run (e.g. environment issue), document it and ensure at least app build + backend start + one smoke flow work before push.
