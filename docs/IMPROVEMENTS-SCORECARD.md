# Data Model & Services – Improvements Scorecard

**Date:** 2025-03-05  
**Scope:** Recommendations from the data model and services audit, implemented and scored before/after.

---

## Score scale (1–5)

- **1** – Missing or ad hoc  
- **2** – Partial, inconsistent  
- **3** – Adequate, some gaps  
- **4** – Good, documented and consistent  
- **5** – Strong: single source of truth, type-safe where applicable  

---

## Before (prior to these changes)

| Category | Score | Notes |
|----------|-------|--------|
| **Schema / migration clarity** | 2 | Schema spread across many files; no single run order documented; SETUP only mentioned seed.sql. |
| **Error handling consistency** | 2 | Error codes hardcoded in lib/api.ts; no shared constants; backend and frontend could drift. |
| **API path safety** | 2 | All tRPC calls used string literals; typos only caught at runtime; no single place to find usages. |
| **Procedure visibility** | 1 | No doc or comment on which procedures are public vs protected. |
| **Documentation** | 3 | SETUP.md and audit doc existed; migration order and procedure list were missing. |
| **Overall** | **2.0** | Adequate for small team; risky for onboarding and refactors. |

---

## Recommendations implemented

1. **Shared tRPC error codes** – Added `lib/trpc-errors.ts` with `TRPC_ERROR_CODE`, `TRPC_ERROR_TITLES`, `TRPC_ERROR_USER_MESSAGE`; updated `lib/api.ts` `formatTRPCError()` to use them.
2. **Migration checklist** – Added `docs/MIGRATIONS.md` with ordered list of all migrations and what each does; updated `SETUP.md` to point to it and say “run seed then migrations in order”.
3. **Public vs protected procedures** – Added comment block in `backend/trpc/app-router.ts` listing public procedures (auth, challenges list/getFeatured/getStarterPack/getById, leaderboard.getWeekly, meta, feed) and noting all others are protected.
4. **Typed tRPC path constants** – Added `lib/trpc-paths.ts` with `TRPC` object for all procedure paths; switched `contexts/AppContext.tsx` to use `TRPC.profiles.get`, `TRPC.checkins.secureDay`, etc., instead of string literals.

---

## After (current state)

| Category | Score | Notes |
|----------|-------|--------|
| **Schema / migration clarity** | 4 | Single ordered checklist in MIGRATIONS.md; SETUP references it; new devs know exactly what to run. |
| **Error handling consistency** | 4 | Central error codes and titles in trpc-errors.ts; formatTRPCError uses them; backend can align to same codes. |
| **API path safety** | 3 | Path constants exist and AppContext uses them; other call sites (settings, discover, activity, etc.) can be migrated over time. |
| **Procedure visibility** | 4 | app-router.ts documents public vs protected; easy to audit for accidental exposure. |
| **Documentation** | 4 | MIGRATIONS.md, SETUP update, app-router comment, and audit doc together give a clear picture. |
| **Overall** | **3.8** | Clearly improved; path constants can be rolled out to remaining call sites for a 4+. |

---

## Summary

| Metric | Before | After |
|--------|--------|--------|
| **Overall score** | 2.0 / 5 | 3.8 / 5 |
| **Schema / migrations** | 2 | 4 |
| **Error handling** | 2 | 4 |
| **API path safety** | 2 | 3 |
| **Procedure visibility** | 1 | 4 |
| **Documentation** | 3 | 4 |

**Next steps (optional):** Use `TRPC.*` path constants in the rest of the app (settings, discover, activity, accountability, etc.) to push API path safety to 4; consider a type-safe tRPC client with `AppRouter` for full type inference on inputs/outputs.
