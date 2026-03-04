# tRPC 404 in Production (Rork/Railway) — Fix

## Root cause

**Frontend was calling the wrong host.** When `EXPO_PUBLIC_API_URL` (or `EXPO_PUBLIC_API_BASE_URL`) is **not set** in production:

- `getApiBaseUrl()` returns `''`.
- `getTrpcUrl()` returns `'/api/trpc'` (relative).
- Requests go to **current origin** + `/api/trpc` = the **frontend** host (e.g. Rork preview URL).
- The frontend host does not serve tRPC (only the backend does), so every query returns **404 Not Found**.

So the issue is **wrong base URL** in production (missing or incorrect env), not wrong path or backend down. The backend path `/api/trpc` is correct and served by both the standalone backend (Hono) and the Expo API route when running in dev.

---

## Files changed

| File | Change |
|------|--------|
| `lib/api.ts` | Support `EXPO_PUBLIC_API_URL` (prefer) and `EXPO_PUBLIC_API_BASE_URL`; add `TRPC_PATH`, `HEALTH_PATH`; `__DEV__` log of baseUrl/trpcUrl. |
| `lib/trpc.ts` | `__DEV__` log of first query URL. |
| `contexts/ApiContext.tsx` | Add `trpcUrl`, `healthUrl`, `lastStatusCode` to diagnostics; expose `lastStatusCode`, `getTrpcUrl` from context. |
| `app/(tabs)/create.tsx` | Server status card: show tRPC URL and last status code; Copy diagnostics includes them. |
| `backend/hono.ts` | Health: `{ ok, service, commit, time }`; commit from `RAILWAY_GIT_COMMIT_SHA` / `VERCEL_GIT_COMMIT_SHA` / `GIT_COMMIT_SHA`. |
| `.env.example` | Document `EXPO_PUBLIC_API_URL` as preferred. |
| `SETUP.md` | Table: prefer `EXPO_PUBLIC_API_URL`, both supported; note required in production. |
| `docs/TRPC-PRODUCTION-FIX.md` | This file. |

---

## Correct production URLs

- **Base URL (env):** Set to your **backend** root with no trailing slash, e.g.  
  `https://your-app.up.railway.app`
- **Health:** `{baseUrl}/api/health` → e.g. `https://your-app.up.railway.app/api/health`
- **tRPC:** `{baseUrl}/api/trpc` → e.g. `https://your-app.up.railway.app/api/trpc`

Backend serves:
- `GET /` → `{ status, message }`
- `GET /api/health` and `GET /health` → `{ ok, service, version, time, commit }`
- `GET /api/trpc/*` and `POST /api/trpc/*` → tRPC handler

---

## What to set in Rork / production

1. **Backend (Railway):**
   - Deploy the backend (e.g. `backend/server.ts` with `PORT` from Railway).
   - Note the public URL, e.g. `https://grit-backend.up.railway.app`.

2. **Frontend (Rork / Expo):**
   - Set **build-time** env (or Rork env):
     - `EXPO_PUBLIC_API_URL=https://grit-backend.up.railway.app`  
       (or `EXPO_PUBLIC_API_BASE_URL=...` if you use that name).
   - No trailing slash. Rebuild/redeploy the app so the client picks up the new value.

3. **CORS (backend):**
   - Set `CORS_ORIGIN` to your frontend origin (e.g. Rork preview URL) so the browser allows requests.

---

## Verification

### 1. Health

```bash
curl -s https://YOUR_BACKEND_URL/api/health
```

Expected: `{"ok":true,"service":"backend","version":"1.0.0","time":"...","commit":"..."}` and HTTP 200.

### 2. tRPC (e.g. challenges.getFeatured)

```bash
curl -s "https://YOUR_BACKEND_URL/api/trpc/challenges.getFeatured"
```

Expected: JSON with `result.data` (or a TRPC error), and HTTP 200 for success.

### 3. From Rork preview

- Open Create tab → scroll to **Server status** (debug).
- **Base URL** and **tRPC URL** must show your Railway backend URL (not empty, not the Rork domain).
- **Last status** should be **200** after health check.
- **Copy diagnostics** should include `baseUrl`, `trpcUrl`, `lastStatusCode`.

### 4. Create Challenge E2E

- Sign in → Create tab → minimal challenge → submit.
- Should succeed and navigate to success (no 404).

---

## Proof (what you should see)

- **GET /health 200:**  
  `curl -s https://YOUR_BACKEND/api/health` → `{"ok":true,"service":"backend",...}`

- **tRPC 200:**  
  `curl -s "https://YOUR_BACKEND/api/trpc/challenges.getFeatured"` → JSON with `result` or `error`, status 200 for successful query.

- **App:** Server status card shows correct baseUrl and trpcUrl; last status 200; Create Challenge completes.
