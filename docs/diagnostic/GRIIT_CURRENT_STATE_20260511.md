# GRIIT current-state diagnostic (baseline 20260511)

**Diagnostic anchor date:** 2026-05-11  
**Repo:** `/Users/yaseenabdela/Developer/GRIIT`  
**Git branch:** `chore/current-state-diagnostic-20260511`  
**Parent commit (application code baseline immediately before this diagnostic commit):** `d07f5aea989caef534cbb4b508b760d22f9fd3fa` — verified with `git rev-parse HEAD^` while this branch is checked out.

**Evidence rule:** Below each quantitative claim, the exact shell command and its stdout (trimmed only for irrelevant blank lines) are shown. **UNKNOWN** marks anything not verified here. **HUMAN VERIFY** marks required human or external-dashboard checks.

---

## Gate 1 — Dimensions 1–4 (codebase, product, UX, backend)

---

## Dimension 1 — Codebase size and shape

### TypeScript LOC (`.ts`, excluding `node_modules` and `.expo`)

```bash
find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.expo/*" | xargs wc -l 2>/dev/null | tail -1
```

```
   26783 total
```

### TSX LOC

```bash
find . -name "*.tsx" -not -path "*/node_modules/*" -not -path "*/.expo/*" | xargs wc -l 2>/dev/null | tail -1
```

```
   37912 total
```

### Backend route folder entry count (includes `*.test.ts`)

```bash
ls backend/trpc/routes/ | wc -l
```

```
      27
```

### Backend route folder listing

```bash
ls -1 backend/trpc/routes/
```

```
accountability.test.ts
accountability.ts
achievements.ts
auth.ts
challenges-create.test.ts
challenges-create.ts
challenges-discover.ts
challenges-join.ts
challenges.ts
checkins.ts
feed.ts
integrations.ts
last-stand.test.ts
leaderboard.ts
notifications.ts
nudges.test.ts
nudges.ts
profiles-social.ts
profiles-stats.ts
profiles.ts
referrals.ts
reports.ts
respects.ts
sharedGoal.ts
starters.ts
streaks.ts
user.ts
```

### Component `.tsx` count (`components/`)

```bash
find components -name "*.tsx" -not -path "*/node_modules/*" | wc -l
```

```
     121
```

### App `.tsx` count (`app/`)

```bash
find app -name "*.tsx" -not -path "*/node_modules/*" | wc -l
```

```
      37
```

### SQL migration files

```bash
ls supabase/migrations/*.sql | wc -l
```

```
      72
```

### Total commits on `main`

```bash
git rev-list --count main
```

```
490
```

### First commit date on `main`

```bash
git log --reverse --format=%cd --date=short main | head -1
```

```
2026-02-11
```

(`head` may cause exit code 141 from SIGPIPE; first line is still valid output.)

### Days from first commit (2026-02-11) to diagnostic date (2026-05-11)

```bash
python3 -c "from datetime import date; print((date(2026,5,11)-date(2026,2,11)).days)"
```

```
89
```

### Average commits per day (490 commits over 89 days)

```bash
python3 -c "from decimal import Decimal; print(Decimal(490)/Decimal(89))"
```

```
5.505617977528089887640449438
```

### Ten largest `.ts` / `.tsx` files by line count

```bash
find . \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.expo/*" -exec wc -l {} + 2>/dev/null | sort -n | grep -v ' total$' | tail -10
```

```
    1882 ./components/create/NewTaskModal.tsx
    1746 ./components/TaskEditorModal.tsx
    1606 ./app/challenge/[id].tsx
    1371 ./lib/design-system.ts
    1166 ./components/challenge/challengeDetailScreenStyles.ts
    1059 ./app/(tabs)/index.tsx
    1030 ./app/task/run.tsx
     990 ./app/(tabs)/profile.tsx
     955 ./backend/trpc/routes/feed.ts
     937 ./app/profile/[username].tsx
```

**Largest single file (LOC):** `components/create/NewTaskModal.tsx` — **1882** lines (from listing above).

---

## Dimension 2 — Product surface area

### All `app/**/*.tsx` paths (37 files)

```bash
find app -name "*.tsx" -not -path "*/node_modules/*" | sort
```

```
app/(tabs)/_layout.tsx
app/(tabs)/activity.tsx
app/(tabs)/create.tsx
app/(tabs)/discover.tsx
app/(tabs)/index.tsx
app/(tabs)/profile.tsx
app/(tabs)/teams.tsx
app/+not-found.tsx
app/_layout.tsx
app/accountability.tsx
app/accountability/add.tsx
app/auth/_layout.tsx
app/auth/forgot-password.tsx
app/auth/login.tsx
app/auth/signup.tsx
app/challenge/[id].tsx
app/challenge/active/[activeChallengeId].tsx
app/challenge/complete.tsx
app/create-challenge.tsx
app/create-profile.tsx
app/create/_layout.tsx
app/create/index.tsx
app/edit-profile.tsx
app/follow-list.tsx
app/invite/[code].tsx
app/legal/_layout.tsx
app/legal/privacy-policy.tsx
app/legal/terms.tsx
app/onboarding/_layout.tsx
app/onboarding/index.tsx
app/paywall.tsx
app/post/[id].tsx
app/profile/[username].tsx
app/settings.tsx
app/task/checkin.tsx
app/task/complete.tsx
app/task/run.tsx
```

### Default-export screen names (ripgrep)

```bash
rg '^export default function \w+' app -g '*.tsx'
```

```
export default function OnboardingLayout() {
export default function OnboardingPage() {
export default function FollowListScreen() {
export default function EditProfileScreen() {
export default function InviteRedirectScreen() {
export default function PaywallScreen() {
export default function ForgotPasswordScreen() {
export default function AddAccountabilityPartnerScreen() {
export default function AccountabilityScreen() {
export default function LegalLayout() {
export default function AuthLayout() {
export default function TeamsTabScreen() {
export default function PostThreadScreen() {
export default function NotFoundScreen() {
export default function CreateModalLayout() {
export default function TaskCompleteScreen() {
export default function PrivacyPolicyScreen() {
export default function RunTaskScreen() {
export default function SignupScreen() {
export default function ChallengeDetailScreen() {
export default function PublicProfileScreen() {
export default function CheckinTaskScreen() {
export default function CreateTabScreen() {
export default function TabLayout() {
export default function CreateModalScreen() {
export default function ChallengeCompleteScreen() {
export default function TermsScreen() {
export default function ActivityScreen() {
export default function LoginScreen() {
export default function CreateProfileScreen() {
export default function HomeScreen() {
export default function DiscoverScreen() {
export default function SettingsScreen() {
export default function CreateChallengeRedirect() {
export default function ActiveChallengeDetailScreen() {
export default function ProfileScreen() {
```

**One-line descriptions:** Derived only where tied to file evidence above — e.g. `RunTaskScreen` / `CheckinTaskScreen` files contain top-of-file `LEGACY` comments in repo (`app/task/run.tsx`, `app/task/checkin.tsx`); `InviteRedirectScreen` file header describes `/invite/[code]` redirect; `PaywallScreen` file header describes RevenueCat offerings. Full prose per path is **UNKNOWN** without reading every body.

### Tabs (names + accessibility strings)

Tab configuration is in `app/(tabs)/_layout.tsx` (titles `Home`, `Discover`, `create` center action, `Activity`, `Profile`; `teams` has `href: null`). **HUMAN VERIFY:** exact runtime UX by installing the app.

### tRPC surface

Top-level routers composed in `backend/trpc/app-router.ts`: `auth`, `user`, `profiles`, `challenges`, `checkins`, `starters`, `streaks`, `leaderboard`, `respects`, `nudges`, `notifications`, `accountability`, `feed`, `achievements`, `integrations`, `sharedGoal`, `referrals`, `reports`.

Procedure declarations (non-test route files):

```bash
rg '^\s+[a-zA-Z0-9_]+:\s*(publicProcedure|protectedProcedure)' backend/trpc/routes/*.ts --glob '!*.test.ts' | wc -l
```

```
     109
```

Domain grouping matches filenames (`feed.ts`, `challenges*.ts`, `profiles*.ts`, etc.). Full procedure name list is long; regenerate with the same `rg` command without `| wc -l`.

### Feature completeness (scores are qualitative; evidence numeric where shown)

| Area | Score | Evidence |
|------|------:|----------|
| Auth & signup | 8 | `rg -F "z.object" backend/trpc/routes/auth.ts \| wc -l` → **4** |
| Challenges discovery | 8 | Discover tab `DiscoverScreen`; discover logic in `challenges-discover.ts` |
| Challenges creation | 7 | `rg "\blogger\." backend/trpc/routes/challenges-create.ts \| wc -l` → **7** |
| Participation | 8 | `rg "ctx.supabase" backend/trpc/routes/checkins.ts \| wc -l` → **46** |
| Proof submission | 7 | Legacy markers on `run.tsx` / `checkin.tsx`; unified `task/complete.tsx` |
| Feed & social | 8 | `feed.ts` **955** LOC (Dimension 1 file ranking) |
| Streaks | 7 | `streaks.ts` router + home imports (see `app/(tabs)/index.tsx`) |
| Notifications | 7 | `rg -l "scheduleNotificationAsync\|expo-notifications" app lib components -g "*.ts" -g "*.tsx" \| wc -l` → **4** |
| Profile & graph | 8 | Merged `profiles` router; see social/stats files |
| Moderation | 6 | `rg "reports\.create\|TRPC\.reports" app components lib -g "*.{ts,tsx}" \| wc -l` → **2** |
| Onboarding | 7 | `app/onboarding/` + `user` router |

---

## Dimension 3 — UX maturity

### Scope & timeout discipline

Most Dimension 3 searches below use **`components` + `app`** with `-g '*.tsx'` because `--type tsx` returned exit code **2** in this environment when used as in the original prompt.

**`accessibilityLabel`** uses **`app` + `components` + `lib`** (`*.tsx` only) — excludes `backend/` and other packages.

**Repo-wide TSX counts** (entire tree, respecting `.gitignore`, no path restriction): **UNKNOWN** — **HUMAN VERIFY:** run the same `rg` patterns from repo root with `-g '*.tsx'` and a generous timeout. In an earlier Cursor shell attempt, unscoped `rg -l … -g '*.tsx'` for animation/Haptics patterns exceeded the ~30s tool budget and was backgrounded without a reliable total.

Do not interpret scoped counts as full-repo totals.

### Empty states

```bash
rg -l "EmptyState|empty-state" components app -g '*.tsx' | wc -l
```

```
       4
```

```bash
rg -l "EmptyState|empty-state" components app -g '*.tsx'
```

```
app/challenge/active/[activeChallengeId].tsx
app/accountability.tsx
app/(tabs)/index.tsx
components/ui/EmptyState.tsx
```

### Loading patterns

```bash
rg -l "isLoading|isPending|Skeleton" components app -g '*.tsx' | wc -l
```

```
      21
```

### Error patterns

```bash
rg -l "ErrorBoundary|onError|fallback" components app -g '*.tsx' | wc -l
```

```
      36
```

### Animations

```bash
rg -l "useAnimatedStyle|Animated\.|withSpring|withTiming" components app -g '*.tsx' | wc -l
```

```
      15
```

### Haptics

```bash
rg -l "Haptics\." components app -g '*.tsx' | wc -l
```

```
      24
```

### Accessibility labels

```bash
rg "accessibilityLabel" app components lib -g '*.tsx' | wc -l
```

```
     450
```

### Pull to refresh

```bash
rg -l "RefreshControl|onRefresh" components app -g '*.tsx' | wc -l
```

```
       9
```

### Skeleton usage

```bash
rg -l "Skeleton" components app -g '*.tsx' | wc -l
```

```
      14
```

**UX maturity score:** **7 / 10** — reasoning tied strictly to counts above.

---

## Dimension 4 — Backend completeness

### Global rate limit + logging (applies to procedures using exported `publicProcedure` / `protectedProcedure`)

See `backend/trpc/create-context.ts` lines 69–82 (`checkRouteRateLimit`) and 85–109 (`loggingMiddleware` / `reportError`).

```bash
rg "checkRouteRateLimit|checkRateLimit|rate-limit" backend --type ts | wc -l
```

```
       7
```

### Per route file (excluding `*.test.ts`)

```bash
bash --norc --noprofile -c 'for f in backend/trpc/routes/*.ts; do [[ "$f" == *.test.ts ]] && continue; bn=$(basename "$f"); z=$(rg -F "z.object" "$f" | wc -l | tr -d " "); rl=$(rg "rateLimit|rate-limit" "$f" | wc -l | tr -d " "); adm=$(rg "getSupabaseAdmin|hasSupabaseAdmin|SUPABASE_SERVICE_ROLE" "$f" | wc -l | tr -d " "); ctx=$(rg "ctx.supabase" "$f" | wc -l | tr -d " "); tr=$(rg "try\s*\{" "$f" | wc -l | tr -d " "); ct=$(rg "catch\s*\(" "$f" | wc -l | tr -d " "); lg=$(rg "\blogger\." "$f" | wc -l | tr -d " "); printf "%s\tz=%s\trl=%s\tadm=%s\tctx=%s\ttry=%s\tcatch=%s\tlog=%s\n" "$bn" "$z" "$rl" "$adm" "$ctx" "$tr" "$ct" "$lg"; done'
```

```
accountability.ts	z=3	rl=0	adm=0	ctx=20	try=2	catch=2	log=2
achievements.ts	z=0	rl=0	adm=0	ctx=1	try=0	catch=0	log=0
auth.ts	z=4	rl=0	adm=3	ctx=4	try=0	catch=0	log=0
challenges-create.ts	z=2	rl=0	adm=0	ctx=9	try=1	catch=1	log=7
challenges-discover.ts	z=4	rl=0	adm=0	ctx=8	try=0	catch=0	log=0
challenges-join.ts	z=2	rl=0	adm=0	ctx=22	try=1	catch=1	log=6
challenges.ts	z=5	rl=0	adm=0	ctx=16	try=1	catch=1	log=4
checkins.ts	z=6	rl=0	adm=0	ctx=46	try=1	catch=0	log=9
feed.ts	z=12	rl=0	adm=0	ctx=42	try=3	catch=2	log=10
integrations.ts	z=2	rl=0	adm=0	ctx=9	try=1	catch=0	log=0
leaderboard.ts	z=1	rl=0	adm=0	ctx=8	try=0	catch=0	log=0
notifications.ts	z=3	rl=0	adm=0	ctx=8	try=1	catch=0	log=0
nudges.ts	z=1	rl=0	adm=0	ctx=7	try=1	catch=1	log=1
profiles-social.ts	z=7	rl=0	adm=0	ctx=21	try=3	catch=3	log=5
profiles-stats.ts	z=2	rl=0	adm=1	ctx=25	try=1	catch=1	log=2
profiles.ts	z=10	rl=0	adm=3	ctx=18	try=2	catch=1	log=6
referrals.ts	z=2	rl=0	adm=0	ctx=2	try=0	catch=0	log=0
reports.ts	z=1	rl=0	adm=0	ctx=3	try=1	catch=1	log=2
respects.ts	z=2	rl=0	adm=0	ctx=5	try=2	catch=2	log=3
sharedGoal.ts	z=3	rl=0	adm=0	ctx=12	try=0	catch=0	log=0
starters.ts	z=2	rl=0	adm=0	ctx=7	try=0	catch=0	log=1
streaks.ts	z=1	rl=0	adm=0	ctx=7	try=0	catch=0	log=0
user.ts	z=1	rl=0	adm=0	ctx=2	try=1	catch=1	log=1
```

**Notes**

- **Rate limit:** substring hits **0** per file; middleware still applies (see `create-context.ts`).
- **`try`/`catch`:** grep-based only; asymmetry example `checkins.ts` **try=1 catch=0** — **HUMAN VERIFY** real control flow.

**Backend score:** **7 / 10** — global protections plus widespread Zod + `ctx.supabase`; per-file error hygiene uneven by grep.

---

## Gate 2 — Dimensions 5–8 (database, performance, monetization, analytics)

Evidence for Dimensions **5** through **8** follows.

---

## Dimension 5 — Database state vs drift

### Repo migrations

```bash
ls supabase/migrations/*.sql | wc -l
```

```
      72
```

### Production migration rows / RLS / policy counts

**UNKNOWN — HUMAN VERIFY:** run listed SQL on Supabase (`schema_migrations`, `information_schema.tables`, RLS metadata).

### Tables referenced in backend `.from('…')` / `.from("…")` (unique)

```bash
(rg "\.from\(\s*'([^']+)'" backend/ -g '*.ts' -o -r '$1' --no-filename; rg '\.from\(\s*"([^"]+)"' backend/ -g '*.ts' -o -r '$1' --no-filename) | sort -u | wc -l
```

```
      24
```

```bash
(rg "\.from\(\s*'([^']+)'" backend/ -g '*.ts' -o -r '$1' --no-filename; rg '\.from\(\s*"([^"]+)"' backend/ -g '*.ts' -o -r '$1' --no-filename) | sort -u
```

```
accountability_pairs
active_challenges
activity_events
challenge_members
challenge_reports
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
streak_freezes
streaks
user_achievements
user_follows
```

### Migrations “applied tonight” list from conversation

**UNKNOWN — HUMAN VERIFY:** no transcript-bound migration IDs verified via command in this run.

### Schema drift risk score

**6 / 10** — compares **24** coded tables vs **72** migration files; production parity UNKNOWN.

---

## Dimension 6 — Performance & scale readiness

```bash
rg -l "expo-image|contentFit" app components lib -g '*.tsx' | wc -l
```

```
      13
```

```bash
rg -l "FlashList\b" app components lib -g '*.tsx' | wc -l
```

```
       2
```

```bash
rg -l "FlatList\b" app components lib -g '*.tsx' | wc -l
```

```
      12
```

```bash
rg -l "React\.memo|useMemo|useCallback" app components lib -g '*.tsx' | wc -l
```

```
      77
```

```bash
rg "useQuery" app components lib -g '*.tsx' | wc -l
```

```
      61
```

```bash
rg -l "retry|onError" app components lib -g '*.tsx' | wc -l
```

```
      11
```

```bash
rg -l "NetInfo|isConnected" app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
       1
```

### Bundle / export size

**UNKNOWN — HUMAN VERIFY:** run `npx expo export` and measure output directory (not executed here).

**Performance score:** **5 / 10** — grounded in grep counts above.

---

## Dimension 7 — Monetization infrastructure

```bash
rg -l "Purchases\.|react-native-purchases|RevenueCat" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**' | wc -l
```

```
       8
```

```bash
rg -l "Purchases\.|react-native-purchases|RevenueCat" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**'
```

```
./lib/subscription.ts
./types/react-native-purchases.d.ts
./lib/revenue-cat.ts
./app/legal/privacy-policy.tsx
./app/legal/terms.tsx
./app/paywall.tsx
./backend/trpc/routes/profiles.ts
./components/paywall/types.ts
```

```bash
rg -l "Paywall|paywall" components app -g '*.tsx' | wc -l
```

```
       4
```

```bash
rg "isPro|isPremium|entitlement" app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
      50
```

```bash
rg -l "restorePurchases|restore\.purchases" app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
       4
```

```bash
rg -l "validateReceipt|verify\.receipt" backend/ -g '*.ts' | wc -l
```

```
       0
```

### Paywall smoke doc

```bash
wc -l docs/PAYWALL-SMOKE-TEST.md && sed -n '1,22p' docs/PAYWALL-SMOKE-TEST.md
```

```
      24 docs/PAYWALL-SMOKE-TEST.md
# Paywall Smoke Test — Physical iPhone

## Prerequisites
- TestFlight build installed on a real iPhone (not simulator)
- Sandbox tester Apple ID created in App Store Connect → Users → Sandbox
- Sign out of personal Apple ID in Settings → App Store → Sandbox Account, sign in as sandbox tester

## Test Matrix
1. Cold install → reach paywall → cancel → confirm `paywall_view` and back-out events fire
2. Cold install → reach paywall → start trial → confirm `paywall_purchase_completed` event + entitlement granted
3. Force-close app, reopen → confirm Pro features stay unlocked (RevenueCat cache)
4. Settings → Restore Purchases → confirm entitlement restored after fresh install
5. Cancel sandbox subscription in iOS Settings → wait for renewal cycle → confirm entitlement revoked
6. Variant flag check: toggle `paywall_variant` in PostHog → reopen paywall → confirm correct variant renders and `paywall_variant_assigned` fires

## Pass Criteria
- All 6 scenarios pass
```

Pass/fail not recorded in file → **UNKNOWN — HUMAN VERIFY:** execute matrix & PostHog/RevenueCat dashboards.

**Monetization score:** **6 / 10**.

---

## Dimension 8 — Analytics instrumentation

### Direct `posthog.capture(` string

```bash
rg "posthog\.capture\(" lib app components -g '*.ts' -g '*.tsx' --glob '!node_modules/**' | wc -l
```

```
       0
```

### Generic `.capture(` calls (wrapper)

```bash
rg '\.capture\(' lib app components -g '*.ts' -g '*.tsx' --glob '!node_modules/**' | wc -l
```

```
       2
```

### Typed analytics event names (`lib/analytics.ts`)

```bash
python3 << 'PY'
import re
t = open("lib/analytics.ts", encoding="utf-8").read()
names = sorted(set(re.findall(r'name:\s*"([^"]+)"', t)))
print("COUNT", len(names))
print("\n".join(names))
PY
```

```
COUNT 89
app_opened
challenge_abandoned
challenge_completed
challenge_created
challenge_joined
challenge_left
challenge_viewed
cold_start
cold_start_bucket
comeback_day_secured
comeback_mode_started
day1_secured
day1_task_completed
day_30_task_completed
day_3_retained
day_7_retained
day_secured
discover_challenge_tapped
feed_posted
first_challenge_joined
first_task_completed
follow_suggested_click
gate_modal_shown
guest_view_screen
identity_line_shown
invite_shared
lapsed_notification_scheduled
last_stand_earned
last_stand_used
login_completed
milestone_approaching_notification_scheduled
milestone_unlocked
minimum_day_completed
notification_opened
notification_permission_deferred_to_post_first_day
notification_permission_denied
notification_permission_granted
notification_scheduled
notification_sent
nudge_sent
onboarding_challenge_auto_suggested
onboarding_challenge_joined
onboarding_challenge_skipped
onboarding_completed
onboarding_dropped
onboarding_goals_selected
onboarding_profile_created
onboarding_signup_completed
onboarding_started
onboarding_step_completed
paywall_dismissed
paywall_offering_selected
paywall_purchase_cancelled
paywall_purchase_completed
paywall_purchase_failed
paywall_purchase_started
paywall_restore_failed
paywall_restore_tapped
paywall_shown
paywall_variant_assigned
paywall_viewed
purchase_completed
purchase_failed
purchase_started
push_permission_denied
push_permission_granted
respect_sent
restore_attempted
restore_succeeded
review_prompted
screen_viewed
share_completed
share_tapped
signup_completed
signup_started
starter_challenge_selected
streak_freeze_used
streak_lost
streak_lost_no_last_stand
streak_milestone
streak_saved_last_stand
subscription_cancelled
subscription_started
task_completed
task_skipped
trial_started
user_returned_after_lapse
weekly_goal_changed
weekly_summary_shown
```

### Sentry capture usage count

```bash
rg "Sentry\.captureException|Sentry\.captureMessage" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**' | wc -l
```

```
      10
```

### `posthog.identify` string hits

```bash
rg -l "posthog\.identify|posthog\.setPersonProperties" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**' | wc -l
```

```
       0
```

SDK identify path instead:

```bash
rg "\bph\.identify\(" lib/analytics.ts
```

```
        ph.identify(userId, { $set: props });
        ph.identify(userId);
```

### Prompt checklist vs actual names

| Prompt event | Match |
|--------------|-------|
| app_opened | yes |
| signup_started / signup_completed | yes |
| onboarding_step_viewed | **no** (`onboarding_step_completed` exists) |
| onboarding_completed | yes |
| challenge_started | **no exact** (`first_challenge_joined`, etc.) |
| proof_submitted / proof_failed | **no** (`task_completed`, failures not named `proof_failed`) |
| streak_milestone_reached | **no** (`streak_milestone`) |
| paywall_purchased | **no** (`paywall_purchase_completed`) |
| app_backgrounded / app_crashed | **no** |

**Analytics score:** **8 / 10**.

---

## Gate 3 — Dimensions 9–12 (retention, onboarding, distribution, risk)

Evidence for Dimensions **9** through **12** follows.

---

## Dimension 9 — Retention & habit loop

```bash
rg -l "scheduleNotificationAsync|expo-notifications" app lib components -g '*.ts' -g '*.tsx' | wc -l
```

```
       4
```

```bash
rg "streak|current_streak|longest_streak" app components lib backend -g '*.ts' -g '*.tsx' | wc -l
```

```
     579
```

```bash
rg -l "streak_freeze|streakFreeze" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**' | wc -l
```

```
       6
```

```bash
rg -l "milestone|achievement|unlock" app components lib backend -g '*.ts' -g '*.tsx' | wc -l
```

```
      26
```

```bash
rg -l "reminder|ReminderSection|dailyReminder" app components lib -g '*.tsx' -g '*.ts' | wc -l
```

```
       8
```

```bash
rg -l "LiveFeedSection|LeaderboardTab|leaderboard" app components -g '*.tsx' | wc -l
```

```
       7
```

```bash
rg -l "streak_lost|missed.*day|last_stand" app components lib backend -g '*.ts' -g '*.tsx' | wc -l
```

```
      14
```

**Habit-loop score:** **7 / 10**.

---

## Dimension 10 — Onboarding & activation

```bash
sed -n '1,35p' docs/qa/QA_F1_ONBOARDING_BACKBUTTON_20260502.md
```

```
# QA: P0 F1 onboarding back-button persistence

## scenario A — happy path (regression check)
1. Launch app fresh. Clear AsyncStorage if needed: `npx expo start --clear`.
2. Walk through onboarding: ValueSplash → Goals → SignUp → ProfileSetup → AutoSuggest.
3. Confirm: each step renders, back button works on steps 2+, profile saves.
- expected: completes onboarding, lands on `(tabs)` index.
- pass / fail: ___

## scenario B — force-quit on ProfileSetup (the bug)
1. Walk to ProfileSetup (step 3).
2. Force-quit the app from the iOS app switcher.
3. Relaunch.
- expected: app reopens at ProfileSetup with the same authenticated user; saving the profile works.
- (because the session is preserved by Supabase, this is the most common case.)
- pass / fail: ___

## scenario C — force-quit AND session lost
1. Walk to ProfileSetup (step 3).
2. In Settings → Apps → GRIIT, clear app data (or sign out via supabase debug menu, or delete app and reinstall preserving onboarding store — easier: temporarily call `supabase.auth.signOut()` from a debug button).
3. Relaunch.
- expected: app opens at SignUpScreen (step 2), not stuck on ProfileSetup.
- pass / fail: ___

## scenario D — back arrow from ProfileSetup
1. Walk to ProfileSetup.
2. Tap the back arrow.
- expected: returns to SignUpScreen. (Note: SignUpScreen will show its form to an authed user — this is a known follow-up, not in scope for this fix.)
- pass / fail: ___
```

Blank pass/fail → scenario status **UNKNOWN**.

```bash
rg -l "confetti|Celebration|celebration" app components -g '*.tsx' | wc -l
```

```
      12
```

```bash
rg -n "requestForegroundPermissionsAsync|requestCameraPermissionsAsync|requestPermissionsAsync|registerForPushNotificationsAsync" app lib -g '*.ts' -g '*.tsx' | head -40
```

```
lib/register-push-token.ts:12:import { registerForPushNotificationsAsync } from "@/lib/notifications";
lib/register-push-token.ts:19:    const token = await registerForPushNotificationsAsync();
app/task/run.tsx:128:    const { status } = await Location.requestForegroundPermissionsAsync();
app/task/run.tsx:451:    const { status } = await ImagePicker.requestCameraPermissionsAsync();
app/task/checkin.tsx:183:    const { status } = await Location.requestForegroundPermissionsAsync();
lib/notifications.ts:38:// Foreground: banner/alert + sound (also set in registerForPushNotificationsAsync)
lib/notifications.ts:226:    const { status } = await Notifications.requestPermissionsAsync();
lib/notifications.ts:586:export async function registerForPushNotificationsAsync(): Promise<string | null> {
lib/notifications.ts:606:      const { status } = await Notifications.requestPermissionsAsync();
lib/notifications.ts:618:      captureError(new Error("Missing EAS projectId for push token"), "registerForPushNotificationsAsync");
lib/notifications.ts:633:    captureError(error, "registerForPushNotificationsAsync");
```

Time from cold open to first challenge start: **UNKNOWN** (needs instrumentation).

**Activation score:** **7 / 10**.

---

## Dimension 11 — Distribution & social growth

```bash
rg -l "shareAsync|Sharing\." app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
       3
```

```bash
rg -l "invite|referral|deep\.link" app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
      14
```

```bash
rg -l "Linking\.|expo-linking|prefixes" app components lib -g '*.ts' -g '*.tsx' | wc -l
```

```
       5
```

```bash
find . \( -name "AppClip*" -o -name "app-clip*" \) -not -path "*/node_modules/*" | wc -l
```

```
       0
```

Share payload image-vs-text: **UNKNOWN — HUMAN VERIFY:** audit `lib/share.ts` consumers.

App Store creative performance: **UNKNOWN — HUMAN VERIFY.**

**Distribution score:** **5 / 10**.

---

## Dimension 12 — Risk register

```bash
rg -l "deleteAccount|account\.deletion" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**' | wc -l
```

```
       5
```

```bash
rg -l "deleteAccount|account\.deletion" -g '*.ts' -g '*.tsx' . --glob '!node_modules/**'
```

```
./lib/trpc-paths.ts
./components/settings/AccountDangerZone.tsx
./backend/lib/rate-limit.ts
./backend/trpc/routes/profiles.ts
./app/settings.tsx
```

### CI workflows for migration drift

```bash
find . -path "*github*" -name "*.yml" -not -path "*/node_modules/*"
```

*(Stdout empty; exit code 0 when run from repo root during diagnostic generation.)*

```bash
ls -la .github 2>&1
```

```
ls: .github: No such file or directory
```

### Risk table (likelihood L & impact I are judgment — not computed)

| Risk | L | I | Evidence | Next step |
|------|---|---|----------|-----------|
| App Store rejection | 4 | 5 | delete-account grep hits **5** files | **HUMAN VERIFY:** moderation + privacy labels |
| Solo burnout | 3 | 5 | bus factor **1** (organizational) | ops planning |
| Schema drift | 4 | 4 | **0** GitHub workflow YAML files found | add CI |
| LLM fabrication regressions | 3 | 4 | mitigations **UNKNOWN** | enforce review/tests |
| Audience concentration | 3 | 4 | **UNKNOWN** | measure acquisition |
| Low paywall conversion | 3 | 4 | **UNKNOWN** | run pricing tests |
| Weak D7 retention | 4 | 5 | **UNKNOWN** | dashboards |
| ASO invisibility | 3 | 3 | **UNKNOWN** | keyword research |
| Infra cost overrun | 2 | 4 | **UNKNOWN — HUMAN VERIFY:** Railway billing |
| Trademark “GRIIT” | 2 | 4 | **UNKNOWN — HUMAN VERIFY:** USPTO |

---

## Gate 4 — Pricing analysis (strategy inputs)

Comparable-app pricing uses web-search citations; confirm at live storefronts before relying on numbers.

---

## Pricing analysis (strategy inputs only)

**Demographic note:** Diagnostic brief cites ~18–30 men / self-improvement focus — **HUMAN VERIFY** with real user interviews.

### Comparable public pricing (secondary sources — confirm at purchase UI)

| App | Monthly | Annual | Evidence |
|-----|---------|--------|----------|
| Strava | $11.99 | $79.99 | Web search summary pointing to `https://www.strava.com/pricing` (May 2026 snapshot) |
| Strides Plus | $4.99 | $39.99 | Web search / App Store aggregator summaries (verify IAP) |
| Habitica | $4.99 | $47.99 | Web search citing App Store listing |
| HabitKit | ~$1.99–$2.99 | ~$5.99–$14.99 / lifetime offers | Web search citing App Store regional pricing |
| Fabulous Premium | UNKNOWN | UNKNOWN | Help docs describe tiers without verified USD MSRP in snippets retrieved |
| Habit Pixel | UNKNOWN | UNKNOWN | **HUMAN VERIFY:** primary pricing source |

### Paying subscribers required for **$5,000** MRR at pure monthly ARPU (exact division)

```bash
python3 - << 'PY'
from decimal import Decimal
for p in [Decimal('4.99'), Decimal('9.99'), Decimal('14.99')]:
    print(p, Decimal('5000') / p)
PY
```

```
4.99 1002.004008016032064128256513
9.99 500.5005005005005005005005005
14.99 333.5557038025350233488992662
```

Free-to-paid **percentage** requires measured free MAU → **UNKNOWN**.

Illustration only (algebraic, **not** measured): if free MAU were **50,000** and price **$9.99**, conversion \(= 500.5005 / 50000 = 0.01001001\) (**1.001001%**).

Annual SKU illustration using **$79.99/year** (Strava-like):

```bash
python3 -c "from decimal import Decimal; print(Decimal('5000')/(Decimal('79.99')/Decimal('12')))"
```

```
750.0937617202150268783597950
```

### Feature parity snapshot (evidence-based)

- Social + challenges backend breadth: **109** procedures (Dimension 2).
- Streak / freeze / last-stand language appears across analytics + **579** streak-keyword hits (Dimension 9).
- Accountability table present (`accountability_pairs` in Dimension 5 list).

---

## Gate 5 — Compile, save, commit

This file is the compiled diagnostic artifact path: `docs/diagnostic/GRIIT_CURRENT_STATE_20260511.md`. Committed on `chore/current-state-diagnostic-20260511` with message `chore(diagnostic): current state baseline 20260511`. **Not pushed.**

---

## Document provenance

- Generated by automated ripgrep/find/git/python commands on 2026-05-11.
- **Gates 2–5 pass:** Gate headings added; Dimension 3 scope/timeout note expanded; duplicate backend-summary block removed; key counts for Dimensions 5–8 and 9–12 re-checked against live commands in this session before amend.
- **Did not run:** `npx tsc`, `npx eslint`, `npx expo export` (per operator constraints or UNKNOWN sections).
- **Not pushed:** branch stays local until human review.
