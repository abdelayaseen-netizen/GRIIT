# App Preview Updates

**Purpose:** Log of updates applied to the app preview (Discover page and Challenge Card components) and a running list of planned/future updates. Use this for release notes, QA, and design handoff.

---

## Preview the app as released today

To view the app preview **as if it was released today** (static UI, no backend):

1. **Option A — Open file directly:** Double-click **`preview-app.html`** (or **`preview-ui.html`**) in the project root, or drag it into Chrome, Safari, or Firefox. The file works offline.
2. **Option B — Via local server:** From the project root run **`npm run preview`**, then open:
   - **http://localhost:5000/preview-app.html** (full app-style preview with tabs, recovery banner, challenge flow)
   - **http://localhost:5000/preview-ui.html** (UI preview, same content)

Both files are updated to reflect the app as of **Mar 1, 2026, 12:00 PM**, including the recovery banner and “Use streak freeze” CTA. The browser tab title shows **“GRIT — Release Preview (Mar 1, 2026, 12:00 PM)”**.

---

## Updates applied

### 2026-03-01 — Release preview date & time (Mar 1, 2026, 12:00 PM)

**Scope:** Set preview "release" date to Mar 1, 2026 and add time (12:00 PM) so the preview reflects the app as shipped at that moment.

| Change | Detail |
|--------|--------|
| **preview-app.html** | Title and meta set to "GRIT — Release Preview (Mar 1, 2026, 12:00 PM)"; top banner shows date and time. |
| **preview-ui.html** | Same title, meta, and banner with date and time. |
| **Docs** | "Preview the app as released today" section updated to Mar 1, 2026, 12:00 PM. |

**Files:** `preview-app.html`, `preview-ui.html`, `docs/APP-PREVIEW-UPDATES.md`

### 2025-02-28 — Release preview (view app as shipped today)

**Scope:** Treat preview files as the “release” version so you can open them and see the app as shipped today.

| Change | Detail |
|--------|--------|
| **preview-app.html** | Title set to “GRIT — Release Preview (Mar 1, 2026, 12:00 PM)”; meta description added; top banner text explains how to open the file or use `npm run preview` to view as released today. |
| **preview-ui.html** | Same title and release framing; banner updated. |
| **Home panel** | Recovery banner added on both files: “You missed yesterday. Secure today to stay in the game.” + “Use streak freeze” CTA to match the current app. |
| **Docs** | New section in `docs/APP-PREVIEW-UPDATES.md`: “Preview the app as released today” with Option A (open file) and Option B (`npm run preview`). |

**Files:** `preview-app.html`, `preview-ui.html`, `docs/APP-PREVIEW-UPDATES.md`

### 2025-02-28 — Discover page & Challenge cards (reference alignment)

**Scope:** Match Discover and challenge card UI to reference screenshots: layout, hierarchy, data points, spacing, shadows, typography, colors. No breaking backend changes.

#### Challenge card component

| Area | Change |
|------|--------|
| **Featured card** | FEATURED badge uses **Sparkles** (not Flame), label "FEATURED" (uppercase), light theme-colored background. |
| **Difficulty** | Pill top-right; colors: Easy green, Medium amber, Hard `#E87D4F`, Extreme red. |
| **Task chips** | Lucide icons by type (Activity, PenLine, Camera, Timer, CheckSquare, BookOpen fallback). |
| **Bottom row** | Calendar + duration, BookOpen + task count, Users + participants, **"X active today"** in green when `active_today_count > 0`, chevron in circular wrap. |
| **Duration label** | "X days" (e.g. "75 days") for multi-day; "24H" for daily. |
| **24-hour cards** | Left **vertical accent bar** (5px), same shadow/border as reference; removed top gradient. |
| **Compact (More) cards** | Stronger shadow, 5px accent, circular wrap for chevron; border `#E8E6E1`. |

**Files:** `app/(tabs)/discover.tsx`, `styles/discover-styles.ts`

#### Discover page

| Area | Change |
|------|--------|
| **Sections** | 24-Hour (Zap + "New every day"), Featured (TrendingUp), More Challenges (Sparkles); structure and hierarchy aligned with reference. |
| **Data** | All cards use same `StarterChallenge` flow; featured cards show `active_today_count` when present. |

#### Styles (`styles/discover-styles.ts`)

- Featured: shadow, 5px accent, `activeTodayText` (green), `featuredArrowWrap`, bottom row flex.
- Compact: shadow, `compactArrowWrap`, spacing.
- Daily: `dailyColorBar` (left accent), card shadow/border; removed top gradient.

#### Backend / data

- **`active_today_count`:** Mapped in Discover with `// TODO: backend needs to support active_today_count`; same TODO in `backend/trpc/routes/challenges.ts` for `getFeatured`. UI shows 0 until API returns it; fallback/mock data already has values.

### 2025-02-28 — Static preview (preview-ui.html) and view online

**Scope:** Align the static HTML preview with the app’s Discover UI and make it easy to view in a browser.

| Area | Change |
|------|--------|
| **Discover panel** | Rebuilt to match the app: “Discover” title + “Find challenges worth committing to” subtitle, search “Search challenges…”, filter pills (All = black when active, Fitness/Mind/Discipline). |
| **24-Hour Challenges** | Section with red lightning, “New every day” caption, horizontal scroll of daily cards (left accent, countdown, difficulty, title, description, task chips, participants, arrow). |
| **Featured** | Section with orange icon, vertical list of featured cards: left accent, FEATURED badge, difficulty pill, title, short hook, task chips, stats row (days, tasks, participants, **“X active today”** in green), arrow in circle. |
| **More Challenges** | Section with compact cards (accent bar, title, description, meta, arrow in circle). |
| **View online** | Added **`npm run preview`** to serve the project at http://localhost:5000; open **http://localhost:5000/preview-ui.html** to see the preview in the browser. |

**Files:** `preview-ui.html`, `package.json`, `docs/APP-PREVIEW-UPDATES.md`

### 2025-02-28 — Challenge card click-through in static preview

**Scope:** In the HTML preview, tapping a challenge card in Discover now opens the challenge detail view (challenge “card” screen).

| Area | Change |
|------|--------|
| **Challenge detail panel** | New panel `#panel-challenge-detail` with nav bar (back, “Challenge”, menu), orange hero (title, tagline, days + mode pills), participants + progress card, Today’s Missions (with Start ›), Rules, About, and Start button with “Day resets at midnight”. |
| **Discover cards** | All discover cards (24h, Featured, More) have class `js-open-challenge` and `data-challenge-title`, `data-challenge-tagline`, `data-challenge-days`, `data-challenge-mode`. Clicking any card shows the detail panel and fills title/tagline/days/mode from that card. |
| **Navigation** | Tab bar hides when the challenge detail is visible; back button returns to Discover and shows the tab bar again. |
| **Start button & commitment** | Tapping **Start** opens a commitment modal (challenge name, duration, mode) with **Confirm Commitment** and **Cancel**. On Confirm, the challenge is stored in `localStorage` as “joined”, the button becomes **Continue Today** (green), and the preview navigates to Home. If the user reopens the same challenge, the button shows **Continue Today** and tapping it goes to Home. State persists across refreshes. |

**Files:** `preview-ui.html`

---

## Future updates (template)

Use the blocks below to record **planned** or **next** preview updates. Move items to "Updates applied" when done.

### Planned

| Date added | Area | Description | Notes |
|------------|------|-------------|--------|
| — | Backend | Add `active_today_count` to challenges API (e.g. `getFeatured` / list) | See TODOs in `discover.tsx` and `backend/trpc/routes/challenges.ts` |
| — | — | *(add rows as needed)* | |

### Ideas / backlog

- Optional "What's new" or in-app changelog surfaced from this doc.
- Search/filter persistence (e.g. last selected category).
- Skeleton or loading state for individual cards while navigating to challenge detail.

---

## View the static preview online

To see the HTML preview (including the Discover tab) in your browser:

1. From the project root run: **`npm run preview`**
2. Open: **http://localhost:5000/preview-ui.html**

The preview is a static mockup (no backend). For the full app with real data, use **`npm run start:web`** or **`npm run start:web:tunnel`** for a shareable web URL.

---

## How to use this doc

1. **When you change the app preview:** Add a dated subsection under **Updates applied** and list file/behavior changes.
2. **When you plan a change:** Add a row under **Planned** (and optionally under **Ideas / backlog**).
3. **When backend adds support:** Remove or resolve the related TODO in code and note it under **Updates applied**.
