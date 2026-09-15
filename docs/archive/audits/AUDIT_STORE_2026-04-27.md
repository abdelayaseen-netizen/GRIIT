# `store\` directory — addendum (outside Wave 1.1 path list)

Wave 1.1 used `.\stores` (plural). This repository uses `.\store\` (singular) with **5** TypeScript files.

**Proof (PowerShell):**

```powershell
Get-ChildItem -Recurse -File -Path .\store -Filter *.ts | Select-Object FullName, @{N='Lines';E={(Get-Content $_.FullName | Measure-Object -Line).Lines}}
```

**Files and Zustand import (rg / Select-String):**

| File | Role |
|------|------|
| `store/activeSessionStore.ts` | `import { create } from "zustand"` — session slice |
| `store/celebrationStore.ts` | `import { create } from "zustand"` — celebration UI state |
| `store/notificationPrefsStore.ts` | `import { create } from "zustand"` — notification preferences |
| `store/onboardingStore.ts` | `import { create } from "zustand"` — onboarding state |
| `store/proofSharePromptStore.ts` | `import { create } from "zustand"` — proof share prompt |

**Who imports `@/store/...` (evidence — workspace search `pattern: @/store/`, glob `*.ts` / `*.tsx`):**

| Importing file | Store module |
|----------------|--------------|
| `components/create/CreateChallengeWizard.tsx` | `@/store/celebrationStore` |
| `app/(tabs)/index.tsx` | `@/store/celebrationStore` |
| `hooks/useTaskCompleteScreen.tsx` | `@/store/celebrationStore`, `@/store/activeSessionStore` |
| `app/task/checkin.tsx` | `@/store/activeSessionStore` |
| `app/task/run.tsx` | `@/store/activeSessionStore` |
| `lib/live-activity.ts` | `@/store/notificationPrefsStore` |
| `app/_layout.tsx` | `@/store/onboardingStore` |
| `lib/active-task-timer.ts` | `@/store/notificationPrefsStore` |
| `hooks/useAppChallengeMutations.ts` | `@/store/celebrationStore`, `@/store/proofSharePromptStore` |
| `components/settings/ReminderSection.tsx` | `@/store/notificationPrefsStore` |
| `components/home/ActiveTaskCard.tsx` | `@/store/activeSessionStore`, `@/store/notificationPrefsStore` |
| `hooks/useCreateChallengeWizardPersistence.ts` | `@/store/celebrationStore` |
| `components/shared/CelebrationOverlay.tsx` | `@/store/celebrationStore` |
| `components/onboarding/OnboardingFlow.tsx` | `@/store/onboardingStore` |
| `components/onboarding/screens/AutoSuggestChallengeScreen.tsx` | `@/store/onboardingStore` |
| `components/settings/AccountDangerZone.tsx` | dynamic `import("@/store/onboardingStore")` |
| `components/onboarding/screens/SignUpScreen.tsx` | `@/store/onboardingStore` |
| `components/onboarding/screens/ProfileSetup.tsx` | `@/store/onboardingStore` |
| `components/onboarding/screens/GoalSelection.tsx` | `@/store/onboardingStore` |
| `lib/trpc.ts` | dynamic `import("@/store/onboardingStore")` |
| `components/shared/ProofShareOverlay.tsx` | `@/store/proofSharePromptStore` |

**Contract adjustment:** If these 5 files are part of the “auditable app,” the file count is **355 + 5 = 360** (277 + 78 + 5), not 355.
