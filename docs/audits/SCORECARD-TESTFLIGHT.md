# GRIIT TestFlight Readiness Scorecard

**Generated:** 2026-04-05  
**Commit:** c64bbbb220dbf25b4773a8d2e67accad85ccefb8

## Audit methodology

Commands follow the scorecard prompt (PowerShell, `Select-String`, `Test-Path`, `Get-ChildItem`). Recursive searches excluded paths matching `node_modules`, `.expo`, `dist`, and `build` by filtering `FullName`, because `Select-String -Path "**/*.ts" -Recurse` is not reliably supported as written on Windows PowerShell. Evidence was captured to `%TEMP%\scorecard-evidence-20260405144308.txt` via a single audit script, then supplemented with explicit `npx tsc` exit codes and `Select-String` on `lib/config.ts` / `lib/api.ts` where the automated log was empty or incomplete.

## Summary

| #  | Category                         | Score | Weight | Weighted | Status |
|----|----------------------------------|-------|--------|----------|--------|
| 1  | App Config & Build Readiness     | 5/10  | 10%    | 0.50     | F |
| 2  | Backend Architecture             | 8/10  | 8%     | 0.64     | P |
| 3  | Auth & Security                  | 6/10  | 10%    | 0.60     | W |
| 4  | Monetization & RevenueCat        | 5/10  | 10%    | 0.50     | W |
| 5  | Type Safety                      | 10/10 | 6%     | 0.60     | P |
| 6  | Design System Compliance         | 6/10  | 6%     | 0.36     | W |
| 7  | Error Handling & Resilience      | 6/10  | 6%     | 0.36     | W |
| 8  | Analytics & Instrumentation      | 9/10  | 6%     | 0.54     | P |
| 9  | Performance                      | 8/10  | 5%     | 0.40     | P |
| 10 | Accessibility                    | 6/10  | 4%     | 0.24     | W |
| 11 | Test Coverage                    | 7/10  | 4%     | 0.28     | W |
| 12 | Code Hygiene                     | 7/10  | 4%     | 0.28     | W |
| 13 | Database & Migrations            | 9/10  | 6%     | 0.54     | P |
| 14 | Legal & Compliance               | 9/10  | 5%     | 0.45     | P |
| 15 | TestFlight Blockers              | 5/10  | 10%    | 0.50     | W |
|----|----------------------------------|-------|--------|----------|--------|
|    | **WEIGHTED TOTAL**               |       | 100%   | **6.25/10** |      |

Status: P = Pass (8+), W = Warning (5–7), F = Fail (below 5)

### Category justifications (1–2 sentences each)

1. **App Config & Build Readiness (5/10):** Bundle ID, build number, version, EAS project ID, icons, iOS permission strings, and core plugins are present; the scorecard’s critical rule caps this category at 5 because `react-native-purchases` does not appear in the `app.json` plugins list (see raw evidence).
2. **Backend Architecture (8/10):** `server.ts` / `hono.ts` exist, 27 tRPC route files, strong `TRPCError` usage, `nixpacks.toml` present, and daily-reset grep found no stub/TODO matches; deployment health itself is not provable from grep alone.
3. **Auth & Security (6/10):** Supabase client and extensive RLS/policy counts plus heavy Zod usage support a solid baseline; several `.or(\`...\${...}\`)` filter constructions appear in routes (IDs vs search), which warrants review even when values are server-derived or sanitized.
4. **Monetization & RevenueCat (5/10):** Packages and `lib/subscription.ts` initialization, paywall route, product IDs, and server-side RevenueCat validation are in place; the same plugin gap in `app.json` keeps this at the rubric cap for a non-linked native module in EAS builds.
5. **Type Safety (10/10):** `tsconfig.json` has `"strict": true`, root and backend `npx tsc --noEmit` completed with exit code 0, and the `any` pattern count in app/backend sources (excluding tests and declarations) was 0.
6. **Design System Compliance (6/10):** `lib/design-system.ts` exports tokens and `ROUTES` usage is widespread; one raw hex hit outside allowed paths and `Alert.alert` appears 8 times, so this sits in the “some violations” band.
7. **Error Handling & Resilience (6/10):** ErrorBoundary, InlineError, `captureError`, and backend try/catch show good coverage; Sentry’s `organization` value is still `your-org-slug`, which is a production observability gap.
8. **Analytics & Instrumentation (9/10):** PostHog is wired, 33 `trackEvent(` calls were counted, all ten named funnel strings were found, and screen tracking patterns appear in multiple files.
9. **Performance (8/10):** Substantial `React.memo` / `useMemo` / `useCallback` usage, `expo-image` adoption with no filtered RN `Image` imports, and no `select('*')`-style matches in backend scans indicate thoughtful optimization.
10. **Accessibility (6/10):** `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` are used in many places, but counts remain well below `TouchableOpacity` usage, so coverage is partial.
11. **Test Coverage (7/10):** Twelve test files span backend routes, lib utilities, and flow tests, with `vitest.config.ts` and `tests/MANUAL_TEST_CHECKLIST.md` present; coverage percentage was not measured.
12. **Code Hygiene (7/10):** Non–`__DEV__`-gated `console.log` count was 0; the TODO/FIXME grep picked up false positives (`xxxl`, `ListTodo`, etc.), while LEGACY/DEPRECATED comments are real but mostly documentary.
13. **Database & Migrations (9/10):** 54 SQL migrations, seed files, a large normalized table list from `.from(`, documented indexes, and a PgBouncer-related comment show mature schema practice.
14. **Legal & Compliance (9/10):** Privacy and terms screens, App Store listing and iOS release docs exist, non-exempt encryption is declared false, and App Tracking Transparency copy is present.
15. **TestFlight Blockers (5/10):** One hard failure remains (RevenueCat plugin missing from `app.json`); TypeScript compiles, bundle ID and EAS project ID match checks, and icon file exist; Sentry org is still a placeholder; the prompt’s `lib/config.ts` URL grep matches nothing—API base URL env usage lives in `lib/api.ts` instead.

## TestFlight Verdict: **NOT READY**

RevenueCat is not registered in the Expo config plugins array. Per the scorecard’s own gate, that is treated as a TestFlight/EAS build risk for the purchases native module before you rely on IAP in beta.

## Hard blockers (must fix before `eas build` for reliable IAP)

1. Add `react-native-purchases` (and any required Expo config plugin entry) to the `plugins` array in `app.json` so the native module links in EAS builds—evidence shows no matching line under “RevenueCat in app.json plugins.”

## Warnings (should fix before public beta)

1. Replace Sentry `organization` placeholder `your-org-slug` in `app.json` so release health and symbolication point at a real project.
2. Revisit PostgREST `.or` filters that embed interpolated values; several occurrences are documented in the evidence (accountability, discover, profiles search).
3. Reduce or replace remaining `Alert.alert` usages (8 hits) if product standard is in-app modals only.
4. `Select-String` on `lib/config.ts` for `grit-backend-production|API_BASE_URL|EXPO_PUBLIC_API` returned no lines; API URL is driven by `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_BASE_URL` in `lib/api.ts`—confirm production values are set in EAS env, not only in docs.

## Strengths

1. TypeScript strict mode with clean `tsc` for app and backend.
2. Strong backend shape: many protected procedures, consistent `TRPCError` handling, Railway-oriented config.
3. RLS and policy counts in migrations indicate deliberate Supabase hardening.
4. Monetization logic and server-side RevenueCat validation are implemented beyond a stub paywall.
5. Analytics funnel event names requested by the checklist are all present in source.

## Raw Evidence

### Supplement A — TypeScript compile (explicit exit codes)

```text
PS> Set-Location c:\Users\abdel\OneDrive\Desktop\GRIT-1; npx tsc --noEmit 2>&1 | Select-Object -Last 8; Write-Output "EXIT:$LASTEXITCODE"

EXIT:0

PS> Set-Location c:\Users\abdel\OneDrive\Desktop\GRIT-1\backend; npx tsc --noEmit 2>&1 | Select-Object -Last 8; Write-Output "EXIT:$LASTEXITCODE"

EXIT:0
```

### Supplement B — Blocker 7: API URL patterns (`lib/config.ts` vs `lib/api.ts`)

```text
PS> Select-String -Path "lib/config.ts" -Pattern "grit-backend-production|API_BASE_URL|EXPO_PUBLIC_API"
(no output)

PS> Select-String -Path "lib/api.ts" -Pattern "grit-backend-production|API_BASE_URL|EXPO_PUBLIC_API" | Select-Object -First 15

lib\api.ts:17: * Env: EXPO_PUBLIC_API_URL (prefer) or EXPO_PUBLIC_API_BASE_URL.
lib\api.ts:24:    process.env.EXPO_PUBLIC_API_URL ??
lib\api.ts:25:    process.env.EXPO_PUBLIC_API_BASE_URL;
```

### Full automated log (categories 1–15)

```text

=== CAT 1: BUILD READINESS ===

--- app.json exists and has required fields ---
True
      "bundleIdentifier": "app.griit.challenge-tracker",
      "buildNumber": "1",
    "slug": "griit-challenge-tracker",
          "organization": "your-org-slug"
    "version": "1.0.0",
      "versionCode": 1,

--- eas.json exists with all profiles ---
True
    "development": {
      "developmentClient": true,
    "development-simulator": {
      "developmentClient": true,
    "preview": {
        "NODE_ENV": "production"
    "production": {
        "NODE_ENV": "production"
    "production": {
        "appleTeamId": "WZT43QXHZB"

--- App icons exist ---
True
True
True

--- iOS permissions configured ---
        "NSCameraUsageDescription": "GRIIT needs camera access to take photos as proof of challenge completion.",
        "NSPhotoLibraryUsageDescription": "GRIIT needs photo library access to select proof photos for challenge tasks.",
        "NSLocationWhenInUseUsageDescription": "GRIIT uses your location to verify outdoor activities like runs and walks.",

--- Plugins registered in app.json ---
        "expo-router",
        "expo-notifications",
        "@sentry/react-native/expo",
          "url": "https://sentry.io/",
      "expo-apple-authentication",

--- EAS project ID ---
        "projectId": "7399b54a-e0d6-47b9-80f4-862d585fb1ca"

=== CAT 2: BACKEND ===

--- Backend entry point ---
True
True

--- tRPC route count ---
27

--- Protected vs public procedures ---
Protected:
111
Public:
24

--- Backend env vars referenced (first 20 unique lines) ---
const REQUEST_BODY_MAX_BYTES = Number(process.env.REQUEST_BODY_MAX_BYTES) || 1_000_000; // 1MB
const isProd = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN ?? (isProd ? "" : "*");
    process.env.RAILWAY_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GIT_COMMIT_SHA ??
      environment: process.env.NODE_ENV ?? "development",
  const cronSecret = process.env.CRON_SECRET;
const port = Number(process.env.PORT ?? 8080);
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (process.env.NODE_ENV !== "production") console.error("[Cache] get failed:", e);
    if (process.env.NODE_ENV !== "production") console.error("[Cache] set failed:", e);
    if (process.env.NODE_ENV !== "production") console.error("[Cache] invalidate failed:", e);
  const url = process.env.ERROR_REPORT_URL?.trim();
const level = process.env.LOG_LEVEL ?? "info";
  const env = process.env.RATE_LIMIT_MAX_PER_MIN;
  const successRedirect = process.env.STRAVA_SUCCESS_REDIRECT_URI || "https://griit.app/profile?strava=connected";
  const errorRedirect = process.env.STRAVA_ERROR_REDIRECT_URI || "https://griit.app/profile?strava=error";
  const clientId = process.env.STRAVA_CLIENT_ID ?? "";

--- Railway config ---
True

--- Daily reset status ---

--- Error handling TRPCError count ---
204

=== CAT 3: AUTH & SECURITY ===

--- Supabase auth configured ---
True
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {

--- Apple auth plugin ---
      "expo-apple-authentication",

--- RLS policies in migrations ---
Tables with RLS enabled:
26
Total CREATE POLICY:
84

--- Input validation (zod) count ---
222

--- SQL injection risk (.or with interpolation) ---
accountability.ts:16:     .or(`and(user_id.eq.${userId},status.eq.accepted),and(partner_id.eq.${userId},status.eq.accepted)`);
accountability.ts:162:       .or(`user_id.eq.${ctx.userId},partner_id.eq.${ctx.userId}`)
challenges-discover.ts:39:       q = q.or(`visibility.eq.PUBLIC,creator_id.eq.${ctx.userId}`);
challenges-discover.ts:289:         query = query.or(`visibility.eq.PUBLIC,creator_id.eq.${ctx.userId}`);
profiles.ts:340:         .or(`username.ilike.%${safe}%,display_name.ilike.%${safe}%`)

--- Auth context usage ctx.userId count ---
211

--- Sensitive data exposure (filtered) ---
forgot-password.tsx:21: export default function ForgotPasswordScreen() {
forgot-password.tsx:45:       const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
forgot-password.tsx:54:       captureError(e, "AuthForgotPassword");
forgot-password.tsx:68:             We sent a link to {email.trim()}. Use it to reset your password.
forgot-password.tsx:89:             <Text style={[styles.title, { color: themeColors.text.primary }]}>Reset password</Text>
forgot-password.tsx:91:               Enter your email and we{"'"}ll send you a link to reset your password.
forgot-password.tsx:116:               accessibilityLabel="Send password reset link"
login.tsx:29:   const [password, setPassword] = useState<string>("");
login.tsx:31:   const [showPassword, setShowPassword] = useState<boolean>(false);
login.tsx:36:   const passwordRef = useRef<TextInput>(null);
login.tsx:44:   const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;
login.tsx:57:     if (!normalizedEmail || !password) {
login.tsx:58:       setFormError("Please enter your email and password.");
login.tsx:64:       const { data, error } = await supabase.auth.signInWithPassword({
login.tsx:66:         password,
login.tsx:96:   }, [loading, email, password, router]);
login.tsx:98:   const handleForgotPassword = useCallback(() => {
login.tsx:99:     router.push(ROUTES.AUTH_FORGOT_PASSWORD as never);
login.tsx:204:             onSubmitEditing={() => passwordRef.current?.focus()}
login.tsx:213:           <View style={[styles.passwordWrap, { borderColor: inputBorder("password") }]}>
login.tsx:215:               ref={passwordRef}
login.tsx:216:               style={styles.passwordInput}
login.tsx:219:               value={password}
login.tsx:220:               onChangeText={(t) => { setPassword(t); setFormError(""); }}
login.tsx:221:               onFocus={() => setFocusedField("password")}
login.tsx:223:               secureTextEntry={!showPassword}
login.tsx:227:               accessibilityLabel="Password"
login.tsx:230:               onPress={() => setShowPassword((p) => !p)}
login.tsx:233:               accessibilityLabel={showPassword ? "Hide password" : "Show password"}
login.tsx:235:               {showPassword ? (

=== CAT 4: MONETIZATION ===

--- RevenueCat package installed ---
    "react-native-purchases": "^9.12.0",
    "react-native-purchases-ui": "^9.12.0",

--- RevenueCat in app.json plugins ---

--- RevenueCat initialization ---
2:  * RevenueCat subscription: init, purchase, restore, sync to Supabase.
3:  * API keys (public): EXPO_PUBLIC_REVENUECAT_IOS_KEY first, then legacy *_API_KEY fallbacks (see initializeRevenueCat).
17: /** Remove function for RevenueCat customer info listener; null when RC not available (web/Expo Go). */
20: /** Minimal types for RevenueCat (avoid importing full SDK in Expo Go). */
47:  * Initialize RevenueCat. Call once after auth. Pass Supabase user ID as appUserID.
49: export async function initializeRevenueCat(userId: string): Promise<void> {
50:   const apiKey =
52:       ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? "").trim() ||
53:         (process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "").trim()
54:       : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? "").trim() ||
55:         (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "").trim();
57:   if (!apiKey) {
74:     await RC.configure({ apiKey, appUserID: userId });
103: /** Sync RevenueCat status to Supabase profile (user_id). */
233: /** Register a callback when RevenueCat customer info updates (e.g. after purchase). */
246:   await initializeRevenueCat(userId);
257:     // purchaserInfoListener not set or RevenueCat not available (web/Expo Go)

--- Paywall screen exists ---
True

--- Entitlement checks count ---
17

--- Premium gating files (unique) ---
discover.tsx
paywall.tsx
settings.tsx
challenges-join.ts
challenges.ts
profiles-stats.ts
profiles.ts
hono.ts
PremiumBadge.tsx
StreakFreezeModal.tsx
AppContext.tsx
useProStatus.ts
analytics.ts
feature-flags.ts
premium.ts
revenue-cat.ts
subscription.ts
index.ts

--- Product IDs referenced ---
subscription.ts:224:   monthly: "griit_pro_monthly",
subscription.ts:225:   annual: "griit_premium_annual",

--- Backend receipt validation ---
profiles.ts:3:  *   REVENUECAT_API_KEY — RevenueCat secret API key (starts with sk_).
profiles.ts:4:  *   Get from: app.revenuecat.com → Project Settings → API Keys → Secret API key
profiles.ts:19: /** Must match the entitlement identifier in RevenueCat dashboard exactly. */
profiles.ts:22: /** Subscription fields are written only by profiles.validateSubscription (server-side RevenueCat validation). */
profiles.ts:184:   /** Validates subscription with RevenueCat and writes to profiles. Client must not write subscription fields. */
profiles.ts:188:       const apiKey = process.env.REVENUECAT_API_KEY?.trim();
profiles.ts:209:           logger.warn("[profiles.validateSubscription] REVENUECAT_API_KEY not set; skipping validation, returning current DB values.");
profiles.ts:215:         const url = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`;
profiles.ts:228:             logger.warn({ status: res.status, text: text?.slice(0, 200) }, "[profiles.validateSubscription] RevenueCat API error");

=== CAT 5: TYPE SAFETY ===

--- TypeScript strict mode ---
    "strict": true,

--- Frontend typecheck (last 5 lines) ---

--- Backend typecheck (last 5 lines) ---

--- Any type usage count ---
0

--- Type definition files ---
True
3

=== CAT 6: DESIGN SYSTEM ===

--- Design system file exists ---
True

--- Design system token exports (lines) ---
export const DS_COLORS = {
export const GRIIT_COLORS = {
export const DS_TYPOGRAPHY = {
export const DS_SPACING = {
export const DS_RADIUS = {
export const DS_SHADOWS = {
export const DS_MEASURES = {
export const DS_BORDERS = {
export const CHALLENGE_CATEGORY_COLORS = {
export const DEFAULT_CATEGORY_COLOR = CHALLENGE_CATEGORY_COLORS.discipline;

--- Raw hex outside design system (violations) ---
Count: 1
ShareSheetModal.tsx:73

--- ROUTES constants usage count ---
True
112

--- Alert.alert count ---
8

=== CAT 7: ERROR HANDLING ===

ErrorBoundary count:
62
InlineError count:
76
captureError count:
142
try/catch in backend count:
62

--- Sentry org placeholder ---
          "organization": "your-org-slug"

=== CAT 8: ANALYTICS ===

--- PostHog ---
True
import PostHog from "posthog-react-native";

Total trackEvent calls: 33
        trackEvent("discover_challenge_tapped", { challenge_id: id });
    trackEvent("share_tapped", { content_type: "profile" });
    trackEvent("signup_started");
    trackEvent("challenge_completed", { challenge_id: challengeIdParam, days: totalDays });
        trackEvent("feed_posted", {
                    trackEvent("share_completed", { content_type: "instagram_story_celebration" });
        trackEvent("proof_uploaded", { challenge_id: challengeId });
      trackEvent("profile_created");
      trackEvent("paywall_viewed", { source });
          trackEvent("purchase_completed", {
          trackEvent("purchase_failed", { error: result.error ?? "unknown" });
        trackEvent("purchase_completed", { source: "restore" });
        trackEvent("purchase_failed", { error: "restore" });
              trackEvent("paywall_plan_selected", { plan: pkg.identifier });
        trackEvent("notification_opened", {
            trackEvent("challenge_created", {
        trackEvent("share_completed", { content_type: "instagram_story", share_card: selected, completion_id: completionId });
        trackEvent("share_completed", { content_type: "clipboard_image", share_card: selected, completion_id: completionId });
        trackEvent("share_completed", { content_type: "save_photo", share_card: selected, completion_id: completionId });
          trackEvent("share_completed", { content_type: "system_share", share_card: selected, completion_id: completionId });

--- Key funnel events ---
onboarding_completed : FOUND
trial_started : FOUND
subscription_cancelled : FOUND
task_completed : FOUND
day_secured : FOUND
challenge_joined : FOUND
feed_posted : FOUND
paywall_viewed : FOUND
purchase_started : FOUND
purchase_completed : FOUND

useScreenTracker|screen_view count:
6

=== CAT 9: PERFORMANCE ===

React.memo: 48
useMemo: 95
useCallback: 184
expo-image imports: 21
RN Image imports (filtered): 0
FlatList: 55
ScrollView: 72
select star bad count: 0
select calls total: 270
select non-star count: 270

=== CAT 10: ACCESSIBILITY ===

TouchableOpacity: 569
accessibilityLabel: 425
accessibilityRole: 350
accessibilityState: 95

=== CAT 11: TESTING ===

--- Test files ---
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\lib\progression.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\lib\streak.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\trpc\routes\accountability.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\trpc\routes\challenges-create.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\trpc\routes\last-stand.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\backend\trpc\routes\nudges.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\lib\api.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\lib\formatTimeAgo.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\lib\time-enforcement.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\lib\trpc-errors.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\tests\flows\critical-paths.test.ts
C:\Users\abdel\OneDrive\Desktop\GRIT-1\tests\flows\edge-cases.test.ts

Test file count: 12

True
True

=== CAT 12: CODE HYGIENE ===

--- TODO/FIXME/HACK (sample) ---
signup.tsx:462:   logoArea: { alignItems: "center", marginBottom: DS_SPACING.xxxl },
signup.tsx:467:     marginTop: DS_SPACING.xxxl,
complete.tsx:201:     paddingBottom: DS_SPACING.xxxl,
privacy-policy.tsx:36:   content: { padding: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.xxxl },
terms.tsx:37:   content: { padding: DS_SPACING.screenHorizontal, paddingBottom: DS_SPACING.xxxl },
manual.tsx:120:     marginBottom: DS_SPACING.xxxl,
settings.tsx:975:   bottomSpacer: { height: DS_SPACING.xxxl },
challengeDetailScreenStyles.ts:57:     paddingHorizontal: DS_SPACING.xxxl,
EmptyChallengesCard.tsx:62:     paddingHorizontal: DS_SPACING.xxxl,
GoalCard.tsx:177:               <TaskTodoRow
GoalCard.tsx:190: function TaskTodoRow({
GoalCard.tsx:206:       style={({ pressed }) => [s.todoRow, pressed && s.todoRowPressed]}
GoalCard.tsx:212:       <View style={s.todoCircle}>{taskTypeIcon(goal.taskType)}</View>
GoalCard.tsx:213:       <View style={s.todoTextCol}>
GoalCard.tsx:214:         <Text style={s.todoText}>{goal.title}</Text>
GoalCard.tsx:287:   todoRow: {
GoalCard.tsx:296:   todoRowPressed: { backgroundColor: DS_COLORS.ACCENT_TINT },
GoalCard.tsx:297:   todoTextCol: { flex: 1, minWidth: 0 },
GoalCard.tsx:306:   todoCircle: {
GoalCard.tsx:322:   todoText: { fontSize: DS_TYPOGRAPHY.SIZE_SM, color: DS_COLORS.grayDarker },
ChallengeCardFeatured.tsx:3: import { Calendar, ListTodo, Users } from "lucide-react-native";
ChallengeCardFeatured.tsx:110:             <ListTodo size={14} color={DS_COLORS.TEXT_MUTED} />
design-system.ts:724:   xxxl: 32,
profile-display.ts:21: /** `@handle` only for real usernames (not `user_xxxxxxxx`). */

console.log (non-gated) count: 0

--- Legacy markers (sample) ---
terms.tsx:7:   { heading: "Acceptance of Terms", body: "By using GRIIT you agree to these Terms of Service. If you do not agree, do not use the app." },
checkin.tsx:1: // LEGACY: consider migrating to task/complete.tsx
journal.tsx:1: // LEGACY: consider migrating to task/complete.tsx
manual.tsx:1: // LEGACY: consider migrating to task/complete.tsx
photo.tsx:1: // LEGACY: consider migrating to task/complete.tsx
run.tsx:1: // LEGACY: consider migrating to task/complete.tsx
timer.tsx:1: // LEGACY: consider migrating to task/complete.tsx
challenges-create.test.ts:38:     it("stores require_photo_proof for any type with requirePhotoProof or legacy photo type", () => {
db.ts:21:   /** Present on legacy rows; `required` may live in config JSONB only. */
ShareSheetModal.tsx:15: import * as FileSystem from "expo-file-system/legacy";
EmptyState.tsx:19:   /** Single primary action (legacy API). */
colors.ts:28:   // Legacy compatibility (map to new names where used)
analytics.ts:114: /** @deprecated Prefer `resetAnalytics` (Sprint 4 naming). */
design-system.ts:17:   // Legacy uppercase aliases
design-system.ts:29:   // Legacy uppercase
design-system.ts:40:   // Legacy uppercase
design-system.ts:54:   // Legacy
design-system.ts:66:   // Legacy
design-system.ts:525:   // camelCase / legacy aliases (TypeScript cleanup — match references across app)
quotes.ts:35: /** Legacy one-line list (kept for any code still expecting plain strings). */
quotes.ts:58: /** @deprecated Prefer getDailyQuoteObject / getRandomQuote for author attribution */
routes.ts:36:   // DEPRECATED — all tasks now route through TASK_COMPLETE
sentry.ts:23: /** @deprecated Use `initialiseSentry` — kept for existing imports. */
subscription.ts:3:  * API keys (public): EXPO_PUBLIC_REVENUECAT_IOS_KEY first, then legacy *_API_KEY fallbacks (see initializeRevenueCat).
subscription.ts:243: /** Legacy alias for AppContext. */

--- Mock/fake data (sample) ---

=== CAT 13: DATABASE ===

Migration count: 54
True
True

--- Tables from .from( in backend ---
accountability_pairs
active_challenges
activity_events
challenge_members
challenge_tasks
challenges
check_ins
connected_accounts
day_secures
feed_comments
feed_reactions
in_app_notifications
invite_tracking
last_stand_uses
nudges
profiles
push_tokens
respects
shared_goal_logs
stories
story_views
streak_freezes
streaks
user_achievements
user_follows

True

--- Pooler mentions ---
feed-social.ts:25:       // Count before toggle, then ±1 — avoids stale post-delete COUNT under PgBouncer pool

=== CAT 14: LEGAL & COMPLIANCE ===
True
True
True
True
        "ITSAppUsesNonExemptEncryption": false
        "NSUserTrackingUsageDescription": "GRIIT uses anonymized usage data to improve your experience.",

=== CAT 15: TESTFLIGHT BLOCKERS ===
FAIL: RevenueCat NOT in app.json plugins

--- TypeScript root (last 3 lines) ---

      "bundleIdentifier": "app.griit.challenge-tracker",

        "projectId": "7399b54a-e0d6-47b9-80f4-862d585fb1ca"

PASS: icon.png exists (92679 bytes)

WARN: Sentry org is still placeholder

```

**Note:** In the automated CAT 15 section above, the lines under “TypeScript root (last 3 lines)” are **not** `tsc` output—they are `Select-String` matches written after an empty `tsc` stream. Use **Supplement A** for authoritative compile evidence.

### Shell metadata (audit script completion)

```text
Evidence written to C:\Users\abdel\AppData\Local\Temp\scorecard-evidence-20260405144308.txt
exit_code: 0
```

## Completion checklist

- [x] All 15 categories have PowerShell-oriented output pasted (automated log plus supplements where the log was ambiguous).
- [x] All 15 categories have scores with short justification.
- [x] Summary table filled with weighted scores.
- [x] TestFlight verdict stated.
- [x] Blockers and warnings listed.
- [x] File saved to `docs/SCORECARD-TESTFLIGHT.md`.
