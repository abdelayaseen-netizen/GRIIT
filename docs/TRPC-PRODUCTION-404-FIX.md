# tRPC 404 in Production (Rork/Railway) — Root Cause & Fix

## Root cause

**Wrong base URL in production.** When `EXPO_PUBLIC_API_URL` (or `EXPO_PUBLIC_API_BASE_URL`) is **not set** at build time:

- `getApiBaseUrl()` returns `''`.
- `getTrpcUrl()` returns `'/api/trpc'` (relative URL).
- The app sends requests to **current origin** + `/api/trpc` = the **frontend** host (e.g. Rork web preview).
- The frontend host does not serve tRPC; only the backend (Railway) does. Result: **404 Not Found** for every tRPC call.

So the issue is **wrong base URL** (missing or incorrect env), not wrong path or backend not running. The backend path `/api/trpc` is correct and is mounted in `backend/hono.ts`.

---

## Correct URL values

| What | Value |
|------|--------|
| **Env var (frontend)** | `EXPO_PUBLIC_API_URL` (prefer) or `EXPO_PUBLIC_API_BASE_URL` |
| **baseUrl** | Backend root, no trailing slash, e.g. `https://your-backend.up.railway.app` |
| **trpcUrl** | `{baseUrl}/api/trpc` → e.g. `https://your-backend.up.railway.app/api/trpc` |
| **healthUrl** | `{baseUrl}/api/health` or `{baseUrl}/health` |

Backend serves:

- `GET /` → `{ status, message }`
- `GET /api/health` and `GET /health` → `{ ok, service, version, commitSha, commit, time }`
- `GET/POST /api/trpc/*` → tRPC handler

---

## Files changed

| File | Change |
|------|--------|
| `lib/api.ts` | Doc env vars; dev log of baseUrl + trpcUrl; TRPC_PATH/HEALTH_PATH comment matching backend. |
| `lib/trpc.ts` | (Existing) Uses `getTrpcUrl()` from api.ts. |
| `backend/hono.ts` | Health payload: add `commitSha`; keep `commit` for compatibility. |
| `backend/server.ts` | Log listening port (PORT) on startup for Railway. |
| `.env.example` | Clarify: backend domain only; no localhost in production. |
| `docs/TRPC-PRODUCTION-404-FIX.md` | This file. |

---

## What to set in production

1. **Backend (Railway)**  
   - Deploy `backend/server.ts`. Server listens on `process.env.PORT` (Railway sets this).  
   - Note the public backend URL, e.g. `https://grit-backend.up.railway.app`.

2. **Frontend (Rork / Expo)**  
   - Set **build-time** env: `EXPO_PUBLIC_API_URL=https://your-backend.up.railway.app`  
     (no trailing slash; must be the **backend** URL, not the frontend).  
   - Rebuild/redeploy so the client bundle gets the value.  
   - There is **no localhost default** in production; if the env is unset, requests go to the frontend origin and get 404.

3. **CORS (backend)**  
   - Set `CORS_ORIGIN` on the backend to your frontend origin (e.g. Rork preview URL) so the browser allows requests.

---

## Proof: verify in production

### 1. Health (backend reachable)

```bash
curl -s -o /dev/null -w "%{http_code}" https://YOUR_BACKEND_URL/health
# Expect: 200

curl -s https://YOUR_BACKEND_URL/health
# Expect: {"ok":true,"service":"backend","version":"1.0.0","commitSha":"...","commit":"...","time":"..."}
```

### 2. tRPC (e.g. meta.version or public query)

```bash
curl -s -o /dev/null -w "%{http_code}" "https://YOUR_BACKEND_URL/api/trpc/meta.version"
# Expect: 200 (or 204 depending on tRPC adapter)

curl -s "https://YOUR_BACKEND_URL/api/trpc/challenges.getFeatured"
# Expect: JSON with result (or a tRPC error body), not 404 HTML.
```

### 3. Authenticated query (e.g. profiles.get)

Use a session cookie or `Authorization: Bearer <token>`; expect 200 with a valid session, or 401/403 if not. Important: response must be from the API (JSON), not 404.

---

## Summary

- **Root cause:** Frontend base URL in production was wrong (unset → relative URLs → frontend host → 404).  
- **Fix:** Set `EXPO_PUBLIC_API_URL` to the backend service domain at build time; no code path uses localhost in production.  
- **Proof:** `GET <baseUrl>/health` returns 200 and `POST/GET <baseUrl>/api/trpc/<procedure>` returns 200 (or a tRPC error), not 404.
