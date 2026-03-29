# GRIIT Master Scorecard — 2026-03-29 (Phase 2C / 4 / 5 pass)

This update covers **Phase 2C** (date utils), **Phase 5** (backend `any`, catch documentation, route TODOs), and a **partial Phase 4** accessibility sweep plus small shared-component fixes. **Phase 3 mega-file splits were not executed** in this pass (screen files remain large).

---

## Verification evidence (commands run)

### 1–2. TypeScript

```text
PS> cd C:\Users\abdel\OneDrive\Desktop\GRIT-1; npx tsc --noEmit
(exit 0, no output)

PS> cd backend; npx tsc --noEmit
(exit 0, no output)
```

### 3. Raw `#hex` in `app/`, `components/`, `contexts/` (6-digit pattern, workspace search)

- `app/**`: **0** matches  
- `components/**`: **0** matches  
- `contexts/**`: **0** matches  

### 4. `Alert.alert`

- Workspace search `Alert.alert` in `app/`, `components/`: **0** matches  

### 5. `console.log` (non–`__DEV__` paths)

- Only hits are `if (__DEV__) console.log(...)` in `app/(tabs)/index.tsx`, `app/challenge/[id].tsx`, `components/create/CreateChallengeWizard.tsx` — **0** unguarded prod `console.log` in those trees.  

### 6. Dead import paths

- `from … @/src/`, `@/constants/`, `@/styles/` in `app/`, `components/`, `lib/`: **0**  

### 7. `date-format`

- Import path `date-format` in code: **0** (only a comment in `lib/date-utils.ts` references the old name).  

### 8. `feature-gates`

- **0** matches in `app/`, `components/`, `lib/`, `hooks/`.  

### 9. Backend `: any` / `as any` (excluding tests / node_modules)

- Workspace search: **0** matches in `backend/**/*.ts`.  

### 10. Doc file count

```text
PS> (Get-ChildItem docs\*.md).Count
9
```

### 11. Files over 500 lines (`app/`, `components/`, `lib/` — `Get-Content -LiteralPath`)

**24 files** still exceed 500 lines (largest first):  
`TaskEditorModal.tsx` (1581), `app/challenge/[id].tsx` (1395), `activity.tsx` (1386), `task/complete.tsx` (1382), `CreateChallengeWizard.tsx` (1329), `challengeDetailScreenStyles.ts` (1150), `task/journal.tsx` (1040), `NewTaskModal.tsx` (1037), `settings.tsx` (946), `profile/[username].tsx` (856), `(tabs)/index.tsx` (810), `lib/design-system.ts` (791), `task/run.tsx` (785), `(tabs)/profile.tsx` (776), `challenge/[id]/chat.tsx` (672), `lib/notifications.ts` (648), `(tabs)/discover.tsx` (643), `challenge/active/[activeChallengeId].tsx` (623), `LiveFeedSection.tsx` (588), `task/run-styles.ts` (544), `paywall.tsx` (535), `task/checkin.tsx` (532), `auth/signup.tsx` (532), `post/[id].tsx` (528).

**Target from prompt (under 8 files >500): not met.**

### 12. Accessibility gap (heuristic — same as prompt intent)

```text
PS> $t = (Get-ChildItem app,components -Recurse -Filter *.tsx | ForEach-Object {
  Select-String -Path $_.FullName -Pattern 'TouchableOpacity|<Pressable'
} | Where-Object { $_.Line -notmatch '^\s*import' }).Count
PS> $a = (Get-ChildItem app,components -Recurse -Filter *.tsx | ForEach-Object {
  Select-String -Path $_.FullName -Pattern 'accessibilityLabel'
}).Count
PS> "Touchables: $t Labels: $a Gap: $($t - $a)"
Touchables: 582 Labels: 369 Gap: 213
```

**Target gap &lt; 20: not met** (improved from an earlier ~249 gap in the same measurement). Further work: `LiveFeedSection`, `TaskEditorModal`, remaining `components/ui` cards, and nested touchables.

### 13. `React.memo` / `memo(` in `components/**/*.tsx`

```text
PS> (Get-ChildItem components -Recurse -Filter *.tsx | Select-String -Pattern 'React\.memo\(|memo\(').Count
55
```

(Prompt baseline was ~34; count is now **55** line matches — methodology differs from `rg | Measure-Object`.)

### 14. Frontend file / line count (approx.)

```text
PS> # files under app,components,lib,hooks,contexts,store
Files: 259  Lines: 44495
```

---

## Before / after (this pass)

| Metric | Before (start of this prompt) | After |
|--------|------------------------------|--------|
| `lib/date-format.ts` | Present | **Removed** (merged into `lib/date-utils.ts`) |
| Backend `any` (feed/leaderboard) | 3 | **0** |
| Intentional empty catches | 7 undocumented | **7 documented** per spec (+ `lib/trpc.ts` JSON parse; `client-error-reporting` non-throwing fetch) |
| Large backend routes | 4 × &gt;500 lines | Same size; **TODO split** comment at top of each |
| Files &gt;500 (app/components/lib) | ~24 | **~24** (no mega-split) |
| a11y gap (heuristic) | ~249 | **213** |
| `React.memo` lines (`components/`) | ~34 | **55** |

---

## Sub-scores (honest)

| Area | Score | Notes |
|------|------:|-------|
| **Structure / clean** | 78/100 | Date utils unified; backend types cleaner; route split TODOs added. |
| **Frontend quality** | 72/100 | Large files remain; a11y gap still large despite targeted fixes. |
| **Backend** | 86/100 | `any` removed; no route split; known large procedures unchanged. |
| **Performance / maintainability** | 58/100 | No Phase 3 extractions; memo count up slightly. |
| **Overall** | **~72/100** | Meaningful but incomplete vs full Phase 3–4 prompt. |

---

## What shipped in code (summary)

- **`lib/date-utils.ts`:** absorbs all former `date-format` exports; **`lib/date-format.ts`** deleted.  
- **`backend/trpc/routes/feed.ts`:** `Context` + `SupabaseClient` types on `hydrateActivityEventsToPosts`.  
- **`backend/trpc/routes/leaderboard.ts`:** `mutualFriendUserIds(ctx: Context, …)`.  
- **`challenges.ts` / `profiles.ts` / `feed.ts` / `checkins.ts`:** top-of-file **TODO** to split sub-routers.  
- **Documented catches:** `challenge/complete.tsx`, `JoinCelebrationModal.tsx`, `notifications.ts` (×2), `client-error-reporting.ts`, `trpc.ts`.  
- **a11y:** `chat-info.tsx`, home rank control, subagent passes on task/create/discover/active/accountability/post/home/challenge modals; **`PrimaryButton`** `accessibilityLabel={title}`; **`Chip`** labels when pressable.  

---

## Top 5 remaining priorities

1. **Phase 3:** Split `TaskEditorModal`, `challenge/[id].tsx`, `activity.tsx`, `task/complete.tsx`, `CreateChallengeWizard` (largest maintainability win).  
2. **Phase 4:** Drive a11y heuristic gap from **213** toward **&lt;20** (systematic pass on `LiveFeedSection`, `TaskEditorModal`, remaining `components/ui` cards).  
3. **Backend:** Execute the new **TODO** splits when router boundaries are clear.  
4. **`AppContext` / other `.catch(() => {})`:** Either document or narrow (out of the original 7, but still present elsewhere).  
5. **Phase 5D:** Unused-export pass on `backend/lib/` when time allows.  

---

*GRIIT spelling, design-system hex policy, and no-`Alert.alert` rules remain as before.*
