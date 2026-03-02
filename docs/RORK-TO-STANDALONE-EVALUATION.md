# Rork vs standalone: evaluation and how to get parity

**Purpose:** Explain why the app might feel different from when it ran in Rork, and what was changed so you can get back (or improve on) the same experience.

---

## 1. Why the HTML preview felt limited

The file **`preview-ui.html`** is a **static mockup** only. It is not the real app.

- **Tabs:** It used to show only the Home screen; clicking other tabs only changed the highlighted tab, not the content. That’s now fixed: each tab shows its own screen (Home, Discover, Create, Activity, Profile) so you can click through and see every tab.
- **Capabilities:** The HTML file has no backend, no Supabase, no auth, and no real navigation. It’s for quick visual reference only. To get the full experience (login, challenges, tasks, etc.) you need to run the **real app** with `npm start` or `npm run start:web`.

---

## 2. What Rork provided vs what you have now

| Capability | In Rork | Now (standalone) | How to get parity / improve |
|------------|---------|-------------------|-----------------------------|
| **Dev server** | `bunx rork start -p <id> --tunnel` | `npm start` (Expo) | Same app code; you run Expo instead of Rork’s wrapper. |
| **Tunnel (shareable URL / phone)** | Built into Rork start | Not in default scripts | Use **`npm run start:tunnel`** or **`npm run start:web:tunnel`** (see below). |
| **Web preview** | `rork start … --web --tunnel` | `npm run start:web` | Add **`npm run start:web:tunnel`** for web + tunnel (Rork-like). |
| **Metro bundler** | `withRorkMetro(config)` from `@rork-ai/toolkit-sdk` | Standard Expo Metro | We use default Expo Metro. App code is unchanged; if you see bundling/asset issues, we can tune Metro. |
| **App code (screens, logic)** | Same repo | Same repo | No features removed; all tabs and flows (Home, Discover, Create, Activity, Profile, auth, challenge, tasks) are still in the codebase. |
| **Backend / API** | Your backend (or Rork-hosted) | Your backend (e.g. Railway) + optional local `npm run backend:start` | Backend is independent; point the app at it with `EXPO_PUBLIC_API_BASE_URL`. |

So: the **only** intentional removals were the **Rork CLI** and the **Rork Metro wrapper**. Everything else (screens, navigation, API, Supabase) is still there.

---

## 3. What we changed to get closer to Rork

1. **Tabbed HTML preview**  
   - **`preview-ui.html`** now has five panels (Home, Discover, Create, Activity, Profile). Clicking a tab switches the visible panel so you’re not stuck on the home page.

2. **Tunnel scripts (Rork-like behavior)**  
   - **`npm run start:tunnel`** — Expo dev server with tunnel (QR code / shareable URL for device).  
   - **`npm run start:web:tunnel`** — Web preview with tunnel (shareable web URL).  
   These match the “run and share” flow you had with Rork.

3. **This evaluation doc**  
   - So you have a single place that explains why things look or behave differently and how to restore or improve the experience.

---

## 4. If something still doesn’t “look like Rork”

- **Run the real app:**  
  `npm run start:web` or `npm run start:tunnel` (then open the URL). The HTML preview will never match the real app’s behavior or data.

- **Tunnel:**  
  If you used to open the app on your phone or share a link, use **`npm run start:tunnel`** or **`npm run start:web:tunnel`**. You may need to sign in to Expo (and, for tunnel, have `@expo/ngrok` / tunnel deps installed).

- **Metro / assets:**  
  We removed `@rork-ai/toolkit-sdk` and use standard Expo Metro. If you see different bundling, missing assets, or broken imports, we can add a custom Metro config (e.g. resolver or transformer) to mimic what Rork’s wrapper might have done.

- **Feature checklist:**  
  All of these are still in the repo and work when the app runs with a backend and Supabase:
  - Auth (login, signup, create profile)
  - Home (streak, today’s tasks, secure day, calendar)
  - Discover (search, filters, challenge cards, join)
  - Create (multi-step challenge creation)
  - Activity (feed, leaderboard, stats)
  - Profile (stats, edit profile, settings, log out)
  - Challenge detail and task flows (journal, timer, run, photo, check-in)

---

## 5. Summary

- **Stuck on home in preview:** Fixed by making the HTML preview tab-aware (all five screens).
- **Missing “Rork capabilities”:** The app itself has the same capabilities; the difference was Rork’s tunnel and CLI. We’ve added tunnel scripts and use standard Expo; run the real app and use the new scripts for a Rork-like workflow.
- **Improving further:** Use **`npm run start:tunnel`** or **`npm run start:web:tunnel`** for shareable URLs; run the real app (not just the HTML file) for full behavior and data.
