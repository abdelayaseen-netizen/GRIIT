# 01 — Navigation & Routing Graph

> Phase 1 of 10. Read-only. Branch `feat/onboarding @ 953bccb`.

## 1. Navigator tree

```
RootLayout (app/_layout.tsx) — Sentry.wrap
└─ Providers: GestureHandlerRootView → BottomSheetModalProvider → ThemeProvider
   → AuthProvider → SessionExpiredContext → AuthGateProvider → ApiProvider → AppProvider
   ├─ RootLayoutNav()  ……… renders the root <Stack>           (app/_layout.tsx:311-435)
   └─ AuthRedirector()  …… imperative redirect engine          (app/_layout.tsx:85-309)

Root <Stack> (app/_layout.tsx:367-430)
├─ auth                       (headerShown:false)  → app/auth/_layout.tsx (login/signup/forgot)
├─ create-profile             → app/create-profile.tsx
├─ settings                   → app/settings.tsx
├─ (tabs)                     → app/(tabs)/_layout.tsx
│   ├─ index (Home)           app/(tabs)/index.tsx
│   ├─ discover               app/(tabs)/discover.tsx
│   ├─ create                 app/(tabs)/create.tsx
│   ├─ activity               app/(tabs)/activity.tsx
│   ├─ profile                app/(tabs)/profile.tsx
│   └─ teams  [href:null]     app/(tabs)/teams.tsx   ← hidden tab
├─ create  (fullScreenModal)  → app/create/_layout.tsx + index.tsx
├─ edit-profile (modal)       → app/edit-profile.tsx
├─ challenge/[id] (card)      → app/challenge/[id].tsx
├─ invite/[code]              → app/invite/[code].tsx
├─ paywall                    → app/paywall.tsx
├─ create-team (modal)        → ⚠ NO FILE
├─ team-invite (modal)        → ⚠ NO FILE
├─ join-team (modal)          → ⚠ NO FILE
├─ profile/[username]         → app/profile/[username].tsx
├─ follow-list (card)         → app/follow-list.tsx
├─ post/[id] (card)           → app/post/[id].tsx
├─ discover/category/[slug]   → app/discover/category/[slug].tsx
├─ task/run / task/complete / task/checkin (card)  → app/task/*.tsx
├─ challenge/complete (modal) → app/challenge/complete.tsx   ← unreachable (see §4)
├─ onboarding                 → app/onboarding/_layout.tsx + index.tsx
└─ +not-found                 → app/+not-found.tsx

Not declared in root Stack but present as routes:
  app/accountability.tsx, app/accountability/add.tsx, app/create-challenge.tsx (alias→/create),
  app/legal/_layout.tsx (+ privacy-policy, terms)
```

### Gating chain (the real flow)
1. **Onboarding gate** — `RootLayoutNav` reads `AsyncStorage[ONBOARDING_COMPLETED]`; if not `"true"` and first segment ∉ `{onboarding, challenge, task, settings, edit-profile, legal, post, follow-list}` → `<Redirect href="/onboarding" />` (`app/_layout.tsx:318-352`).
2. **Auth/profile gate** — `AuthRedirector` (`app/_layout.tsx:219-302`): no user → `replace(/onboarding)`; user w/o profile → `replace(/create-profile)`; user w/ profile stuck on auth/create-profile → `replace(/(tabs))`.
3. **Paywall gate** — **There is NO hard paywall gate at the root.** The paywall is reached *imperatively* from features (`app/challenge/[id].tsx:730,782`, `app/settings.tsx:274`, `OnboardingFlowV2:71`). → carried to Phase 3 (app is not hard-paywalled at launch).

## 2. ROUTES table (`lib/routes.ts`, 35 entries)

All static + dynamic ROUTES resolve to a real file **except** the ambiguity below. Usage counts from `rg ROUTES.<X>` (excluding routes.ts):

| ROUTES entry | Target | Resolves? | Ext. refs |
|---|---|---|---|
| AUTH `/auth` | app/auth/* (no `index.tsx`) | ⚠ ambiguous | 2 |
| AUTH_LOGIN/SIGNUP/FORGOT | app/auth/* | ✅ | 9 / 2 / 1 |
| CREATE_PROFILE | app/create-profile.tsx | ✅ | 3 |
| ONBOARDING | app/onboarding | ✅ | 1 |
| ONBOARDING_STEP4 `/onboarding?step=4` | app/onboarding (+query) | ✅ route, ⚠ param | 2 |
| TABS / TABS_HOME | app/(tabs) | ✅ | 15 / 30 |
| TABS_DISCOVER / DISCOVER_CATEGORY | app/(tabs)/discover, discover/category/[slug] | ✅ | 9 / 2 |
| TABS_CREATE | app/(tabs)/create | ✅ route | **0 (orphan const)** |
| CREATE_WIZARD `/create` | app/create | ✅ | 3 |
| TABS_PROFILE / PROFILE_USERNAME | app/(tabs)/profile, profile/[username] | ✅ | 11 / 15 |
| TABS_ACTIVITY / ACTIVITY | app/(tabs)/activity | ✅ | **0** / 2 |
| TABS_SETTINGS / SETTINGS | app/settings.tsx | ✅ | **0** / 1 |
| EDIT_PROFILE | app/edit-profile.tsx | ✅ | 2 |
| ACCOUNTABILITY / ACCOUNTABILITY_ADD | app/accountability* | ✅ | 1 / 2 |
| ACCOUNTABILITY_ADD_DAY1 | app/accountability/add?from=day1 | ✅ route | **0 (orphan const)** |
| CHALLENGE_ID / CHALLENGE_ACTIVE | app/challenge/[id], challenge/active/[…] | ✅ | 12 / 6 |
| FOLLOW_LIST | app/follow-list.tsx | ✅ | 4 |
| POST_ID | app/post/[id].tsx | ✅ | 6 |
| INVITE_CODE | app/invite/[code].tsx | ✅ route | **0 (orphan const)** |
| TASK_COMPLETE / TASK_CHECKIN / TASK_RUN | app/task/* | ✅ | 4 / 1 / 3 |
| CHALLENGE_COMPLETE | app/challenge/complete.tsx | ✅ route | **0 (orphan const)** |
| PAYWALL | app/paywall.tsx | ✅ | 4 |
| LEGAL_PRIVACY / LEGAL_TERMS | app/legal/* | ✅ | 3 / 3 |

**Orphan ROUTES constants (defined, never referenced):** `TABS_CREATE`, `TABS_ACTIVITY`, `TABS_SETTINGS`, `ACCOUNTABILITY_ADD_DAY1`, `INVITE_CODE`, `CHALLENGE_COMPLETE` — 6 dead constants (Minor; the underlying routes exist).

## 3. Nav-edge list
Full edge list captured (~95 edges). Mechanisms used: `router.push`/`replace`/`back`, `<Redirect>`, `<Link>`, `Linking.openURL`. No `navigation.navigate` usage. Representative edges by area:

- **Home** `app/(tabs)/index.tsx:329-380` → discover, `${ACTIVITY}?tab=notifications`, `${TABS_PROFILE}?tab=badges`.
- **Discover cards** → `CHALLENGE_ID` (`ChallengeGridCard.tsx:96`, `ForYouHero.tsx:89`, `HeroFeaturedCard.tsx:103`), `POST_ID`, `PROFILE_USERNAME`, `DISCOVER_CATEGORY` (`CategoryRail.tsx:136`, `FindMoreFooter.tsx:20`).
- **Challenge detail** `app/challenge/[id].tsx` → `PAYWALL` (:730,:782), `TASK_COMPLETE` (:893), back-fallback `replace(TABS_HOME)`.
- **Create wizard** `CreateWizardV2.tsx:292` → `replace(CHALLENGE_ACTIVE(id))` on success.
- **Auth** `login.tsx` → `replace(CREATE_PROFILE)` / `replace(TABS)`; `signup.tsx:206` → `replace(TABS)`.
- **Paywall** `paywall.tsx:110,141` → `replace(TABS)` on success; `:93` back-fallback.
- **Notification tap** `app/_layout.tsx:479-493` → routes `active_task_timer` data.route (allow-listed) or `ACTIVITY`.
- **External** `Linking.openURL` → App Store/Play subscriptions (`settings.tsx:271-272`), griit.app/terms|privacy (`PaywallControl.tsx:118-122`, `PaywallSocialProof.tsx:131-135`).

## 4. Problem lists

### Broken links (destination resolves to no route)
- **0 active** broken nav edges — every `router.push/replace` target maps to a real route file.
- **Dead Stack.Screen declarations** (config, not reachable): `create-team`, `team-invite`, `join-team` at `app/_layout.tsx:390-392` have **no route files** (confirmed `rg --files` → NO FILE). Harmless (nothing navigates to them) but dead config. **Minor.**

### Orphan screens (reachable by nothing — excl. tab defaults / flag-gated)
- **`app/challenge/complete.tsx`** — declared `Stack.Screen` (`app/_layout.tsx:422`) but `ROUTES.CHALLENGE_COMPLETE` has **0 refs** and no string-literal nav to `/challenge/complete` exists. Unreachable. **Major** (a built completion screen no flow can reach). *Note: this is the screen reskinned on `feat/daylight-redesign`; on this branch it's orphaned.*
- **`app/(tabs)/teams.tsx`** — hidden tab (`href:null`, `_layout.tsx:90`); no nav edge targets it; renders a "go to Discover" placeholder. Effectively dead. **Minor.**

### Dead ends (enter, can't leave)
- **0 confirmed.** Spot-checks show consistent back affordance: the `router.canGoBack() ? back() : replace(TABS_HOME)` pattern is used widely (challenge, task, edit-profile, follow-list, profile). `UNVERIFIED-LIVE` caveat: legal screens (`app/legal/*`) rely on the native stack header back — not re-verified on device.

### Back-stack hazards
- **`router.push(ROUTES.TABS_HOME)`** used as a "go home" (instead of `replace`) at `app/challenge/active/[activeChallengeId].tsx:307,314`, `app/(tabs)/index.tsx:338`, `app/_layout.tsx:490-493`. Pushing a tab-group route onto the current stack can stack a second tabs instance / leave the detail screen underneath rather than resetting. **Minor** (cosmetic back-stack bloat, not a hard break).
- Auth/onboarding/paywall transitions correctly use `replace` (good — no back into auth).

### Deep / universal links
- **Custom scheme `griit://`** configured (`app.json:8`). Expo Router typed routes resolve scheme deep links to file routes. ✅
- **iOS Universal Links (`griit.fit`) are NOT configured** — there is **no `ios.associatedDomains`** entry in `app.json`. The `"origin": "https://griit.fit"` under the `expo-router` plugin (`app.json:53`) and `extra.router` (`:77`) is the **web origin**, not Apple Associated Domains. Inbound `https://griit.fit/...` links (e.g. invite links to `app/invite/[code].tsx`) will **not** open the app on iOS. **Major** (advertised universal links unhandled). `UNVERIFIED-LIVE` for the AASA file on griit.fit.
- **No Android `intentFilters`** for `griit.fit` app links either. **Major** (same, Android).

### Systemic: typed routes are bypassed
- `experiments.typedRoutes: true` (`app.json:72`) is **defeated in practice** — nearly every nav uses `... as never` casts (e.g. `ROUTES.X as never`, see entire edge list). The cast erases the `Href` type, so a bad route string would **not** be caught at compile time. The compile-time safety net exists but is opted out everywhere. **Minor→Major** (loss of a guardrail; explains why broken-link risk falls on runtime).

## Counts (Phase 1)
| Metric | Count |
|---|---|
| Broken links (active edges) | **0** (+3 dead Stack.Screen decls) |
| Orphan screens | **2** (`challenge/complete`, `teams`) |
| Orphan ROUTES constants | **6** |
| Dead ends | **0 confirmed** (legal = UNVERIFIED-LIVE) |
| Back-stack hazards | **~4** push-to-tab sites |
| Unhandled deep links | **Universal links griit.fit unconfigured (iOS + Android)**; custom scheme OK |
