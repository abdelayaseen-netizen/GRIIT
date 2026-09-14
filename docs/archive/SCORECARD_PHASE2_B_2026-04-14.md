# Phase 2 Scorecards B - 2026-04-14

### `hooks/useAppChallengeMutations.ts` - 278 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useCallback, type Dispatch, type SetStateAction } from "react";
- import { Platform } from "react-native";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import * as Haptics from "expo-haptics";
- import type { QueryClient } from "@tanstack/react-query";
- import { trpcMutate } from "@/lib/trpc";

**Key exports:**
- export function useAppChallengeMutations({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (hooks/useAppChallengeMutations.ts:6).
- Native/env usage: yes (hooks/useAppChallengeMutations.ts:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "useAppChallengeMutations" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | hooks/useAppChallengeMutations.ts:99 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useAppChallengeMutations.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/useAppChallengeMutations.ts:169 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useAppChallengeMutations.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useAppChallengeMutations.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useAppChallengeMutations.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useAppChallengeMutations.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useAppChallengeMutations.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useAppChallengeMutations.ts:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useAppChallengeMutations.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useAppChallengeMutations.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useAppChallengeMutations.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useAppChallengeMutations.ts:16 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useAppChallengeMutations.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useAppChallengeMutations.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useAppChallengeMutations.ts:1).
2. Catch path without Sentry capture (hooks/useAppChallengeMutations.ts:169).
3. Instrumentation gap for meaningful user actions (hooks/useAppChallengeMutations.ts:16).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useCelebration.ts` - 76 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useCallback, useRef } from "react";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { getTodayDateKey } from "@/lib/date-utils";

**Key exports:**
- export function useCelebration(timezone?: string | null): UseCelebrationReturn {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/useCelebration.ts:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:46
- app/task/checkin.tsx:29
- app/task/run.tsx:36
- components/create/CreateChallengeWizard.tsx:30
- components/shared/CelebrationOverlay.tsx:15

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useCelebration.ts:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useCelebration.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useCelebration.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useCelebration.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useCelebration.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useCelebration.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useCelebration.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useCelebration.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useCelebration.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useCelebration.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useCelebration.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useCelebration.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useCelebration.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useCelebration.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useCelebration.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useCelebration.ts:1).
2. Observability hooks are sparse (hooks/useCelebration.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useCelebration.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useCreateChallengeWizardPersistence.ts` - 349 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
- import { Platform } from "react-native";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import * as Haptics from "expo-haptics";
- import type { Router } from "expo-router";
- import { trpcMutate } from "@/lib/trpc";

**Key exports:**
- export const CREATE_CHALLENGE_DRAFT_KEY = "griit_challenge_draft";
- export function useCreateChallengeWizardPersistence(a: WizardPersistenceArgs) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (hooks/useCreateChallengeWizardPersistence.ts:6).
- Native/env usage: yes (hooks/useCreateChallengeWizardPersistence.ts:2).

**What depends on it:** (grep for imports of this file)
- components/create/DraftExitModal.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | hooks/useCreateChallengeWizardPersistence.ts:162 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useCreateChallengeWizardPersistence.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/useCreateChallengeWizardPersistence.ts:162 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useCreateChallengeWizardPersistence.ts:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useCreateChallengeWizardPersistence.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useCreateChallengeWizardPersistence.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useCreateChallengeWizardPersistence.ts:10 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useCreateChallengeWizardPersistence.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useCreateChallengeWizardPersistence.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useCreateChallengeWizardPersistence.ts:1).
2. Catch path without Sentry capture (hooks/useCreateChallengeWizardPersistence.ts:162).
3. Instrumentation gap for meaningful user actions (hooks/useCreateChallengeWizardPersistence.ts:10).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useDebounce.ts` - 15 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useEffect } from "react";

**Key exports:**
- export function useDebounce<T>(value: T, delay: number): T {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:30

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useDebounce.ts:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useDebounce.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useDebounce.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useDebounce.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useDebounce.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useDebounce.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useDebounce.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useDebounce.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useDebounce.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useDebounce.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useDebounce.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useDebounce.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useDebounce.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useDebounce.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useDebounce.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useDebounce.ts:1).
2. Observability hooks are sparse (hooks/useDebounce.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useDebounce.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useInlineError.ts` - 16 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useCallback } from "react";

**Key exports:**
- export function useInlineError() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/accountability.tsx:22
- app/accountability/add.tsx:22
- app/auth/signup.tsx:24
- app/challenge/[id].tsx:69
- app/challenge/active/[activeChallengeId].tsx:39

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useInlineError.ts:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useInlineError.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useInlineError.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useInlineError.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useInlineError.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useInlineError.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useInlineError.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useInlineError.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useInlineError.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useInlineError.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useInlineError.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useInlineError.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useInlineError.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useInlineError.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useInlineError.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useInlineError.ts:1).
2. Observability hooks are sparse (hooks/useInlineError.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useInlineError.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useJournalInput.ts` - 36 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useCallback, useMemo, useRef } from "react";

**Key exports:**
- export function useJournalInput({ minWords, onError }: UseJournalInputOptions): UseJournalInputReturn {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:33

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useJournalInput.ts:34 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useJournalInput.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useJournalInput.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useJournalInput.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useJournalInput.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useJournalInput.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useJournalInput.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useJournalInput.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useJournalInput.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useJournalInput.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useJournalInput.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useJournalInput.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useJournalInput.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useJournalInput.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useJournalInput.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useJournalInput.ts:1).
2. Observability hooks are sparse (hooks/useJournalInput.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useJournalInput.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useJournalSubmit.ts` - 68 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";

**Key exports:**
- export type JournalSubmitParams = {
- export async function submitJournalEntry(params: JournalSubmitParams): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/useJournalSubmit.ts:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "useJournalSubmit" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useJournalSubmit.ts:44 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useJournalSubmit.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useJournalSubmit.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useJournalSubmit.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useJournalSubmit.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useJournalSubmit.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useJournalSubmit.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useJournalSubmit.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useJournalSubmit.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useJournalSubmit.ts:23 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useJournalSubmit.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useJournalSubmit.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useJournalSubmit.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useJournalSubmit.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useJournalSubmit.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useJournalSubmit.ts:1).
2. Observability hooks are sparse (hooks/useJournalSubmit.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useJournalSubmit.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useNetworkStatus.ts` - 43 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useEffect, useState, useRef } from "react";
- import { Platform } from "react-native";

**Key exports:**
- export function useNetworkStatus(): boolean {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/useNetworkStatus.ts:2).

**What depends on it:** (grep for imports of this file)
- components/OfflineBanner.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | hooks/useNetworkStatus.ts:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useNetworkStatus.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/useNetworkStatus.ts:32 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useNetworkStatus.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useNetworkStatus.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useNetworkStatus.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useNetworkStatus.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useNetworkStatus.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useNetworkStatus.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useNetworkStatus.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useNetworkStatus.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useNetworkStatus.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useNetworkStatus.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useNetworkStatus.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useNetworkStatus.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useNetworkStatus.ts:1).
2. Catch path without Sentry capture (hooks/useNetworkStatus.ts:32).
3. Instrumentation gap for meaningful user actions (hooks/useNetworkStatus.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useNotificationScheduler.ts` - 189 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useEffect } from "react";
- import { Platform } from "react-native";
- import { trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";
- import {
- import { getTodayDateKey, countSecuredLast7Days } from "@/lib/date-utils";

**Key exports:**
- export interface UseNotificationSchedulerOptions {
- export function useNotificationScheduler({ user, stats, activeChallenge, timezone }: UseNotificationSchedulerOptions): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (hooks/useNotificationScheduler.ts:3).
- Native/env usage: yes (hooks/useNotificationScheduler.ts:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "useNotificationScheduler" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | hooks/useNotificationScheduler.ts:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useNotificationScheduler.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/useNotificationScheduler.ts:43 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useNotificationScheduler.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useNotificationScheduler.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useNotificationScheduler.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useNotificationScheduler.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useNotificationScheduler.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useNotificationScheduler.ts:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useNotificationScheduler.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useNotificationScheduler.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useNotificationScheduler.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useNotificationScheduler.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useNotificationScheduler.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useNotificationScheduler.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useNotificationScheduler.ts:1).
2. Catch path without Sentry capture (hooks/useNotificationScheduler.ts:43).
3. Instrumentation gap for meaningful user actions (hooks/useNotificationScheduler.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/usePhotoCapture.ts` - 95 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useCallback } from "react";
- import * as ImagePicker from "expo-image-picker";
- import { uploadProofImageFromBase64 } from "@/lib/uploadProofImage";
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export function usePhotoCapture({ requireCameraOnly, onError }: UsePhotoCaptureOptions): UsePhotoCaptureReturn {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/usePhotoCapture.ts:2).

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | hooks/usePhotoCapture.ts:37 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/usePhotoCapture.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/usePhotoCapture.ts:37 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/usePhotoCapture.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/usePhotoCapture.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/usePhotoCapture.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/usePhotoCapture.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/usePhotoCapture.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/usePhotoCapture.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/usePhotoCapture.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/usePhotoCapture.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/usePhotoCapture.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/usePhotoCapture.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/usePhotoCapture.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/usePhotoCapture.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/usePhotoCapture.ts:1).
2. Catch path without Sentry capture (hooks/usePhotoCapture.ts:37).
3. Instrumentation gap for meaningful user actions (hooks/usePhotoCapture.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useProStatus.ts` - 14 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useQuery } from "@tanstack/react-query";
- import { isProUser } from "@/lib/revenue-cat";

**Key exports:**
- export function useProStatus() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:47
- app/paywall.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useProStatus.ts:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useProStatus.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useProStatus.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useProStatus.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useProStatus.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useProStatus.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useProStatus.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useProStatus.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useProStatus.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useProStatus.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useProStatus.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useProStatus.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useProStatus.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useProStatus.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useProStatus.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useProStatus.ts:1).
2. Observability hooks are sparse (hooks/useProStatus.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useProStatus.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useScreenTracker.ts` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useEffect, useRef } from "react";
- import { usePathname } from "expo-router";
- import { trackEvent } from "@/lib/analytics";

**Key exports:**
- export function useScreenTracker() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/useScreenTracker.ts:2).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useScreenTracker.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useScreenTracker.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useScreenTracker.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useScreenTracker.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useScreenTracker.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useScreenTracker.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useScreenTracker.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useScreenTracker.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useScreenTracker.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useScreenTracker.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useScreenTracker.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useScreenTracker.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useScreenTracker.ts:3 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useScreenTracker.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useScreenTracker.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useScreenTracker.ts:1).
2. Observability hooks are sparse (hooks/useScreenTracker.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useScreenTracker.ts:3).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useTaskCompleteScreen.tsx` - 829 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
- import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Platform, Animated } from "react-native";
- import { useCelebrationStore } from "@/store/celebrationStore";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter, useLocalSearchParams, Stack } from "expo-router";
- import * as Location from "expo-location";

**Key exports:**
- export function TaskCompleteScreenInner() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (hooks/useTaskCompleteScreen.tsx:16).
- Native/env usage: yes (hooks/useTaskCompleteScreen.tsx:5).

**What depends on it:** (grep for imports of this file)
- app/task/complete.tsx:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | hooks/useTaskCompleteScreen.tsx:123 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useTaskCompleteScreen.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | hooks/useTaskCompleteScreen.tsx:313 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useTaskCompleteScreen.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useTaskCompleteScreen.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useTaskCompleteScreen.tsx:750 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | hooks/useTaskCompleteScreen.tsx:4 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useTaskCompleteScreen.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useTaskCompleteScreen.tsx:16 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useTaskCompleteScreen.tsx:4 | no static violation found. |
| Single responsibility / file size | 4 | hooks/useTaskCompleteScreen.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useTaskCompleteScreen.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useTaskCompleteScreen.tsx:19 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useTaskCompleteScreen.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useTaskCompleteScreen.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (829 LOC) increases regression risk (hooks/useTaskCompleteScreen.tsx:1).
2. Catch path without Sentry capture (hooks/useTaskCompleteScreen.tsx:313).
3. Instrumentation gap for meaningful user actions (hooks/useTaskCompleteScreen.tsx:19).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useTaskCompleteShareCardProps.ts` - 207 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useMemo } from "react";
- import { deriveUserRank } from "@/lib/derive-user-rank";
- import { formatCheckinTime } from "@/lib/task-helpers";
- import type { ChallengeTaskFromApi, StatsFromApi, TodayCheckinForUser } from "@/types";

**Key exports:**
- export interface UseTaskCompleteShareCardPropsInput {
- export function useTaskCompleteShareCardProps({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:34

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useTaskCompleteShareCardProps.ts:68 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useTaskCompleteShareCardProps.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useTaskCompleteShareCardProps.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useTaskCompleteShareCardProps.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useTaskCompleteShareCardProps.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useTaskCompleteShareCardProps.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useTaskCompleteShareCardProps.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useTaskCompleteShareCardProps.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useTaskCompleteShareCardProps.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useTaskCompleteShareCardProps.ts:1).
2. Observability hooks are sparse (hooks/useTaskCompleteShareCardProps.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useTaskCompleteShareCardProps.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `hooks/useTaskTimer.ts` - 87 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useState, useEffect, useRef, useCallback } from "react";
- import type { MutableRefObject } from "react";
- import { AppState, AppStateStatus, Platform } from "react-native";
- import * as Haptics from "expo-haptics";

**Key exports:**
- export function useTaskTimer({ requiredSeconds, isCountdown, isHardMode, autoStart }: UseTaskTimerOptions): UseTaskTimerReturn {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (hooks/useTaskTimer.ts:3).

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:24

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | hooks/useTaskTimer.ts:47 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | hooks/useTaskTimer.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | hooks/useTaskTimer.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | hooks/useTaskTimer.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | hooks/useTaskTimer.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | hooks/useTaskTimer.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | hooks/useTaskTimer.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | hooks/useTaskTimer.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | hooks/useTaskTimer.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | hooks/useTaskTimer.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | hooks/useTaskTimer.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | hooks/useTaskTimer.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | hooks/useTaskTimer.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | hooks/useTaskTimer.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | hooks/useTaskTimer.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (hooks/useTaskTimer.ts:1).
2. Observability hooks are sparse (hooks/useTaskTimer.ts:1).
3. Instrumentation gap for meaningful user actions (hooks/useTaskTimer.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/active-task-timer.ts` - 128 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as Notifications from "expo-notifications";
- import { formatSecondsToMMSS } from "@/lib/formatTime";
- import { useNotificationPrefsStore } from "@/store/notificationPrefsStore";

**Key exports:**
- export type ActiveTaskTimerType = "checkin" | "run_gps" | "run_treadmill";
- export interface ActiveTaskTimerPayload {
- export async function startActiveTaskNotification(
- export async function updateActiveTaskNotification(
- export async function clearActiveTaskNotification(): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/active-task-timer.ts:3).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "active-task-timer" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/active-task-timer.ts:33 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/active-task-timer.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/active-task-timer.ts:33 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/active-task-timer.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/active-task-timer.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/active-task-timer.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/active-task-timer.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/active-task-timer.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/active-task-timer.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/active-task-timer.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | lib/active-task-timer.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/active-task-timer.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/active-task-timer.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/active-task-timer.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/active-task-timer.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/active-task-timer.ts:1).
2. Catch path without Sentry capture (lib/active-task-timer.ts:33).
3. Instrumentation gap for meaningful user actions (lib/active-task-timer.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/analytics.ts` - 163 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { getPostHog, resetPostHog } from "./posthog";

**Key exports:**
- export function identify(userId: string, props?: UserProperties) {
- export function reset() {
- export const resetAnalytics = reset;
- export function trackEvent(event: string, properties?: FunnelProps): void {
- export function track(event: AnalyticsEvent) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/analytics.ts:95).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:30
- app/(tabs)/discover.tsx:32
- app/(tabs)/index.tsx:54
- app/(tabs)/profile.tsx:35
- app/auth/login.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/analytics.ts:94 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/analytics.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/analytics.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/analytics.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/analytics.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/analytics.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/analytics.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/analytics.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/analytics.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/analytics.ts:93 | no static violation found. |
| Single responsibility / file size | 7 | lib/analytics.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/analytics.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 7 | lib/analytics.ts:4 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/analytics.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/analytics.ts:95 | .or interpolation scrutinized. |

**Composite score:** 5.7

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/analytics.ts:1).
2. Observability hooks are sparse (lib/analytics.ts:1).
3. Instrumentation gap for meaningful user actions (lib/analytics.ts:4).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/api.test.ts` - 55 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect, vi } from 'vitest';
- import { formatError, formatTRPCError } from './api';

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/api.test.ts:7).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "api.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/api.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/api.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/api.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/api.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/api.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/api.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/api.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/api.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/api.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/api.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/api.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | lib/api.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/api.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/api.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/api.test.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/api.test.ts:1).
2. Observability hooks are sparse (lib/api.test.ts:1).
3. Instrumentation gap for meaningful user actions (lib/api.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/api.ts` - 306 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { supabase } from '@/lib/supabase';
- import { TRPC_ERROR_CODE, TRPC_ERROR_TITLES, TRPC_ERROR_USER_MESSAGE } from '@/lib/trpc-errors';
- import { captureError } from '@/lib/sentry';

**Key exports:**
- export function getApiBaseUrl(): string {
- export function getTrpcUrl(): string {
- export async function fetchWithTimeout(
- export async function fetchWithRetry(
- export interface HealthCheckResult {
- export async function checkHealth(): Promise<HealthCheckResult> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/api.ts:2).
- Native/env usage: yes (lib/api.ts:24).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:55
- lib/api.test.ts:9
- lib/trpc.ts:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/api.ts:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/api.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/api.ts:94 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/api.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/api.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/api.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/api.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/api.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/api.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/api.ts:21 | no static violation found. |
| Single responsibility / file size | 7 | lib/api.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/api.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/api.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/api.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/api.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/api.ts:1).
2. Catch path without Sentry capture (lib/api.ts:94).
3. Instrumentation gap for meaningful user actions (lib/api.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/auth-expiry.ts` - 21 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type SessionExpiredListener = () => void;
- export function onSessionExpired(listener: SessionExpiredListener): () => void {
- export function notifySessionExpired(): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:10
- lib/trpc.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/auth-expiry.ts:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/auth-expiry.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/auth-expiry.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/auth-expiry.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/auth-expiry.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/auth-expiry.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/auth-expiry.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/auth-expiry.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/auth-expiry.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/auth-expiry.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | lib/auth-expiry.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/auth-expiry.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/auth-expiry.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/auth-expiry.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/auth-expiry.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/auth-expiry.ts:1).
2. Observability hooks are sparse (lib/auth-expiry.ts:1).
3. Instrumentation gap for meaningful user actions (lib/auth-expiry.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/auth-helpers.ts` - 32 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function mapAuthError(error: { message: string }): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/auth/signup.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/auth-helpers.ts:9 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/auth-helpers.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/auth-helpers.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/auth-helpers.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/auth-helpers.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/auth-helpers.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/auth-helpers.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/auth-helpers.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/auth-helpers.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/auth-helpers.ts:5 | no static violation found. |
| Single responsibility / file size | 7 | lib/auth-helpers.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/auth-helpers.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/auth-helpers.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/auth-helpers.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/auth-helpers.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/auth-helpers.ts:1).
2. Observability hooks are sparse (lib/auth-helpers.ts:1).
3. Instrumentation gap for meaningful user actions (lib/auth-helpers.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/avatar.ts` - 75 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as ImagePicker from "expo-image-picker";
- import { DS_COLORS } from "@/lib/design-system";
- import { trpcMutate } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";
- import { uploadAvatarFromUri } from "@/lib/uploadAvatar";
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export const AVATAR_COLORS = [
- export function getAvatarColor(userId: string): { bg: string; letter: string } {
- export type PickAvatarOutcome =
- export async function pickAndUploadAvatar(userId: string): Promise<PickAvatarOutcome> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/avatar.ts:3).
- Native/env usage: yes (lib/avatar.ts:1).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:37
- components/activity/LeaderboardTab.tsx:17
- components/activity/NotificationsTab.tsx:18
- components/profile/ProfileHeader.tsx:8

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/avatar.ts:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/avatar.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/avatar.ts:67 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/avatar.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/avatar.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/avatar.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/avatar.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/avatar.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/avatar.ts:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/avatar.ts:17 | no static violation found. |
| Single responsibility / file size | 7 | lib/avatar.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/avatar.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/avatar.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/avatar.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/avatar.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/avatar.ts:1).
2. Catch path without Sentry capture (lib/avatar.ts:67).
3. Instrumentation gap for meaningful user actions (lib/avatar.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/badge-descriptions.ts` - 47 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const BADGE_DESCRIPTIONS: Record<string, string> = {
- export function getBadgeDescription(id: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/profile/BadgeDetailModal.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/badge-descriptions.ts:45 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/badge-descriptions.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/badge-descriptions.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/badge-descriptions.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/badge-descriptions.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/badge-descriptions.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/badge-descriptions.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/badge-descriptions.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/badge-descriptions.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/badge-descriptions.ts:44 | no static violation found. |
| Single responsibility / file size | 7 | lib/badge-descriptions.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/badge-descriptions.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/badge-descriptions.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/badge-descriptions.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/badge-descriptions.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/badge-descriptions.ts:1).
2. Observability hooks are sparse (lib/badge-descriptions.ts:1).
3. Instrumentation gap for meaningful user actions (lib/badge-descriptions.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/build-task-config-param.ts` - 42 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export function buildTaskConfigParam(task: Record<string, unknown> | undefined | null): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:28
- app/challenge/active/[activeChallengeId].tsx:36

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/build-task-config-param.ts:5 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/build-task-config-param.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/build-task-config-param.ts:37 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/build-task-config-param.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/build-task-config-param.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/build-task-config-param.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/build-task-config-param.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/build-task-config-param.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/build-task-config-param.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/build-task-config-param.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | lib/build-task-config-param.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/build-task-config-param.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/build-task-config-param.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/build-task-config-param.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/build-task-config-param.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/build-task-config-param.ts:1).
2. Catch path without Sentry capture (lib/build-task-config-param.ts:37).
3. Instrumentation gap for meaningful user actions (lib/build-task-config-param.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/challenge-packs.ts` - 233 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { JournalCategory } from "@/types";

**Key exports:**
- export type PackTaskPhoto = "none" | "optional" | "required";
- export type PackTaskDef = {
- export type ChallengePackDef = {
- export function tasksFromPack(pack: ChallengePackDef): Record<string, unknown>[] {
- export const CHALLENGE_PACKS: ChallengePackDef[] = [

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/create/steps/StepTasks.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/challenge-packs.ts:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/challenge-packs.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/challenge-packs.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/challenge-packs.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/challenge-packs.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/challenge-packs.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/challenge-packs.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/challenge-packs.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/challenge-packs.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/challenge-packs.ts:26 | no static violation found. |
| Single responsibility / file size | 7 | lib/challenge-packs.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/challenge-packs.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/challenge-packs.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/challenge-packs.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/challenge-packs.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/challenge-packs.ts:1).
2. Observability hooks are sparse (lib/challenge-packs.ts:1).
3. Instrumentation gap for meaningful user actions (lib/challenge-packs.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/challenge-timer.ts` - 43 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function getChallengeTimeRemaining(endsAt: string): {
- export function formatTimeRemaining(endsAt: string): string {
- export function formatTimeRemainingHMS(endsAt: string): string {
- export function isChallengeExpired(endsAt: string | null | undefined): boolean {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:41
- backend/trpc/routes/checkins.ts:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/challenge-timer.ts:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/challenge-timer.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/challenge-timer.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/challenge-timer.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/challenge-timer.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/challenge-timer.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/challenge-timer.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/challenge-timer.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/challenge-timer.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/challenge-timer.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | lib/challenge-timer.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/challenge-timer.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/challenge-timer.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/challenge-timer.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/challenge-timer.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/challenge-timer.ts:1).
2. Observability hooks are sparse (lib/challenge-timer.ts:1).
3. Instrumentation gap for meaningful user actions (lib/challenge-timer.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/client-error-reporting.ts` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export function reportClientError(error: Error, componentStack?: string | null): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/client-error-reporting.ts:9).

**What depends on it:** (grep for imports of this file)
- components/ErrorBoundary.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/client-error-reporting.ts:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/client-error-reporting.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/client-error-reporting.ts:24 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/client-error-reporting.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/client-error-reporting.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/client-error-reporting.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/client-error-reporting.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/client-error-reporting.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/client-error-reporting.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/client-error-reporting.ts:11 | no static violation found. |
| Single responsibility / file size | 7 | lib/client-error-reporting.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/client-error-reporting.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/client-error-reporting.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/client-error-reporting.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/client-error-reporting.ts:9 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/client-error-reporting.ts:1).
2. Catch path without Sentry capture (lib/client-error-reporting.ts:24).
3. Instrumentation gap for meaningful user actions (lib/client-error-reporting.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/config.ts` - 34 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { DEEP_LINK_BASE_URL };
- export const APP_STORE_URLS = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/config.ts:7).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:28
- app/challenge/active/[activeChallengeId].tsx:36
- backend/lib/challenge-tasks.ts:6
- backend/lib/checkin-complete-gates.ts:2
- backend/lib/strava-service.ts:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/config.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/config.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/config.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/config.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/config.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/config.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/config.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/config.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/config.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/config.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/config.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/config.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/config.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/config.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/config.ts:7 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/config.ts:1).
2. Observability hooks are sparse (lib/config.ts:1).
3. Instrumentation gap for meaningful user actions (lib/config.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/constants/storage-keys.ts` - 23 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const STORAGE_KEYS = {
- export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:27
- app/challenge/[id].tsx:37
- components/onboarding/OnboardingFlow.tsx:10
- hooks/useCreateChallengeWizardPersistence.ts:12
- lib/register-push-token.ts:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/constants/storage-keys.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/constants/storage-keys.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/constants/storage-keys.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/constants/storage-keys.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/constants/storage-keys.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/constants/storage-keys.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/constants/storage-keys.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/constants/storage-keys.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/constants/storage-keys.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/constants/storage-keys.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/constants/storage-keys.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/constants/storage-keys.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/constants/storage-keys.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/constants/storage-keys.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/constants/storage-keys.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/constants/storage-keys.ts:1).
2. Observability hooks are sparse (lib/constants/storage-keys.ts:1).
3. Instrumentation gap for meaningful user actions (lib/constants/storage-keys.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/create-challenge-helpers.ts` - 317 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { sanitizeChallengeTitle, sanitizeChallengeDescription } from "@/lib/sanitize";
- import type {

**Key exports:**
- export interface TaskWizardHardConfig {
- export interface CreateTaskDraft {
- export type ParticipationTypeUI = "solo" | "duo" | "team" | "shared_goal";
- export type DeadlineTypeUI = "none" | "soft" | "hard";
- export interface CreateChallengeDraft {
- export function getDurationFromDraft(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:22
- components/TaskEditorModal.tsx:60

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/create-challenge-helpers.ts:120 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/create-challenge-helpers.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/create-challenge-helpers.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/create-challenge-helpers.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/create-challenge-helpers.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/create-challenge-helpers.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/create-challenge-helpers.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/create-challenge-helpers.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/create-challenge-helpers.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/create-challenge-helpers.ts:115 | no static violation found. |
| Single responsibility / file size | 7 | lib/create-challenge-helpers.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/create-challenge-helpers.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/create-challenge-helpers.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/create-challenge-helpers.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/create-challenge-helpers.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/create-challenge-helpers.ts:1).
2. Observability hooks are sparse (lib/create-challenge-helpers.ts:1).
3. Instrumentation gap for meaningful user actions (lib/create-challenge-helpers.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/create-selection.ts` - 9 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS, GRIIT_COLORS } from "@/lib/design-system";

**Key exports:**
- export const CREATE_SELECTION = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/create/steps/StepBasics.tsx:5
- components/create/wizard-styles.ts:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/create-selection.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/create-selection.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/create-selection.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/create-selection.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/create-selection.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/create-selection.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/create-selection.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/create-selection.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/create-selection.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/create-selection.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/create-selection.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/create-selection.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/create-selection.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/create-selection.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/create-selection.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/create-selection.ts:1).
2. Observability hooks are sparse (lib/create-selection.ts:1).
3. Instrumentation gap for meaningful user actions (lib/create-selection.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/date-utils.ts` - 72 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function getTodayDateKey(timezone?: string | null): string {
- export function getYesterdayDateKey(timezone?: string | null): string {
- export function countSecuredLast7Days(securedDateKeys: string[], timezone?: string | null): number {
- export function formatShortDate(date: Date | string): string {
- export function formatMonthShort(date: Date | string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:51
- app/challenge/active/[activeChallengeId].tsx:26
- backend/lib/cron-reminders.ts:7
- backend/lib/daily-reset.ts:3
- backend/lib/join-challenge.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/date-utils.ts:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/date-utils.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/date-utils.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/date-utils.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/date-utils.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/date-utils.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/date-utils.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/date-utils.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/date-utils.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/date-utils.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | lib/date-utils.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/date-utils.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/date-utils.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/date-utils.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/date-utils.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/date-utils.ts:1).
2. Observability hooks are sparse (lib/date-utils.ts:1).
3. Instrumentation gap for meaningful user actions (lib/date-utils.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/deep-links.ts` - 34 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DEEP_LINK_BASE_URL } from "@/lib/config";

**Key exports:**
- export function challengeDeepLink(challengeId: string, refUserId?: string | null): string {
- export function inviteDeepLink(inviteCode: string, refUserId?: string | null): string {
- export function profileDeepLink(username: string): string {
- export function getRefFromUrl(url: string): string | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "deep-links" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/deep-links.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/deep-links.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/deep-links.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/deep-links.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/deep-links.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/deep-links.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/deep-links.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/deep-links.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/deep-links.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/deep-links.ts:8 | no static violation found. |
| Single responsibility / file size | 7 | lib/deep-links.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/deep-links.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/deep-links.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/deep-links.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/deep-links.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/deep-links.ts:1).
2. Observability hooks are sparse (lib/deep-links.ts:1).
3. Instrumentation gap for meaningful user actions (lib/deep-links.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/derive-user-rank.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { StatsFromApi } from "@/types";

**Key exports:**
- export function deriveUserRank(stats: StatsFromApi | null | undefined): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/settings/ReminderSection.tsx:15
- hooks/useNotificationScheduler.ts:17
- hooks/useTaskCompleteShareCardProps.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/derive-user-rank.ts:5 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/derive-user-rank.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/derive-user-rank.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/derive-user-rank.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/derive-user-rank.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/derive-user-rank.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/derive-user-rank.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/derive-user-rank.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/derive-user-rank.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/derive-user-rank.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | lib/derive-user-rank.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/derive-user-rank.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/derive-user-rank.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/derive-user-rank.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/derive-user-rank.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/derive-user-rank.ts:1).
2. Observability hooks are sparse (lib/derive-user-rank.ts:1).
3. Instrumentation gap for meaningful user actions (lib/derive-user-rank.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/design-system.ts` - 934 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const DS_COLORS = {
- export const GRIIT_COLORS = {
- export const DS_TYPOGRAPHY = {
- export const DS_SPACING = {
- export const DS_RADIUS = {
- export const DS_SHADOWS = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:20
- app/(tabs)/_layout.tsx:6
- app/(tabs)/discover.tsx:24
- app/(tabs)/index.tsx:45
- app/(tabs)/profile.tsx:45

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/design-system.ts:924 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/design-system.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/design-system.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/design-system.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 4 | lib/design-system.ts:12 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/design-system.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | lib/design-system.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/design-system.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/design-system.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/design-system.ts:922 | no static violation found. |
| Single responsibility / file size | 4 | lib/design-system.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/design-system.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/design-system.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/design-system.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/design-system.ts:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (934 LOC) increases regression risk (lib/design-system.ts:1).
2. Observability hooks are sparse (lib/design-system.ts:1).
3. Instrumentation gap for meaningful user actions (lib/design-system.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/estimate-daily-time.ts` - 71 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type EstimateTaskInput = {
- export function estimateDailyMinutes(tasks: EstimateTaskInput[]): number {
- export function formatEstimatedDailyLabel(mins: number): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/estimate-daily-time.ts:60 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/estimate-daily-time.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/estimate-daily-time.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/estimate-daily-time.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/estimate-daily-time.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/estimate-daily-time.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/estimate-daily-time.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/estimate-daily-time.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/estimate-daily-time.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/estimate-daily-time.ts:17 | no static violation found. |
| Single responsibility / file size | 7 | lib/estimate-daily-time.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/estimate-daily-time.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/estimate-daily-time.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/estimate-daily-time.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/estimate-daily-time.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/estimate-daily-time.ts:1).
2. Observability hooks are sparse (lib/estimate-daily-time.ts:1).
3. Instrumentation gap for meaningful user actions (lib/estimate-daily-time.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/feature-flags.ts` - 48 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const FLAGS = {
- export const FREE_LIMITS = {
- export const PREMIUM_FEATURES = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:49
- lib/premium.ts:1

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/feature-flags.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/feature-flags.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/feature-flags.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/feature-flags.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/feature-flags.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/feature-flags.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/feature-flags.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/feature-flags.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/feature-flags.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/feature-flags.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/feature-flags.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/feature-flags.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/feature-flags.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/feature-flags.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/feature-flags.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/feature-flags.ts:1).
2. Observability hooks are sparse (lib/feature-flags.ts:1).
3. Instrumentation gap for meaningful user actions (lib/feature-flags.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/formatTime.ts` - 9 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function formatSecondsToMMSS(totalSeconds: number): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:40
- app/task/checkin.tsx:30
- app/task/run.tsx:31
- components/home/ActiveTaskCard.tsx:12
- components/home/GoalCard.tsx:16

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/formatTime.ts:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/formatTime.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/formatTime.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/formatTime.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/formatTime.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/formatTime.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/formatTime.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/formatTime.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/formatTime.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/formatTime.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | lib/formatTime.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/formatTime.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/formatTime.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/formatTime.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/formatTime.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/formatTime.ts:1).
2. Observability hooks are sparse (lib/formatTime.ts:1).
3. Instrumentation gap for meaningful user actions (lib/formatTime.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/formatTimeAgo.test.ts` - 54 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
- import { formatTimeAgo, formatTimeAgoCompact } from "./formatTimeAgo";

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "formatTimeAgo.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/formatTimeAgo.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/formatTimeAgo.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/formatTimeAgo.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/formatTimeAgo.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/formatTimeAgo.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/formatTimeAgo.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/formatTimeAgo.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/formatTimeAgo.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/formatTimeAgo.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/formatTimeAgo.test.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | lib/formatTimeAgo.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | lib/formatTimeAgo.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/formatTimeAgo.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/formatTimeAgo.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/formatTimeAgo.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/formatTimeAgo.test.ts:1).
2. Observability hooks are sparse (lib/formatTimeAgo.test.ts:1).
3. Instrumentation gap for meaningful user actions (lib/formatTimeAgo.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/formatTimeAgo.ts` - 21 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function formatTimeAgo(dateString: string): { text: string; isDayOrMore: boolean } {
- export function formatTimeAgoCompact(dateString: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- lib/formatTimeAgo.test.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/formatTimeAgo.ts:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/formatTimeAgo.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/formatTimeAgo.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/formatTimeAgo.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/formatTimeAgo.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/formatTimeAgo.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/formatTimeAgo.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/formatTimeAgo.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/formatTimeAgo.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/formatTimeAgo.ts:5 | no static violation found. |
| Single responsibility / file size | 7 | lib/formatTimeAgo.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/formatTimeAgo.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/formatTimeAgo.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/formatTimeAgo.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/formatTimeAgo.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/formatTimeAgo.ts:1).
2. Observability hooks are sparse (lib/formatTimeAgo.ts:1).
3. Instrumentation gap for meaningful user actions (lib/formatTimeAgo.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/geo.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function haversineDistance(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/checkin-complete-gates.ts:4
- hooks/useTaskCompleteScreen.tsx:12

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/geo.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/geo.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/geo.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/geo.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/geo.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/geo.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/geo.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/geo.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/geo.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/geo.ts:5 | no static violation found. |
| Single responsibility / file size | 7 | lib/geo.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/geo.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/geo.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/geo.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/geo.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/geo.ts:1).
2. Observability hooks are sparse (lib/geo.ts:1).
3. Instrumentation gap for meaningful user actions (lib/geo.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/logger.ts` - 28 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { captureError, captureMessage } from "@/lib/sentry";

**Key exports:**
- export const logger = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/cache.ts:5
- backend/lib/error-reporting.ts:6
- backend/lib/strava-callback.ts:10
- backend/lib/strava-service.ts:7
- backend/lib/strava-verifier.ts:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/logger.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/logger.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/logger.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/logger.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/logger.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/logger.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/logger.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/logger.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/logger.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/logger.ts:5 | no static violation found. |
| Single responsibility / file size | 7 | lib/logger.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/logger.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/logger.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/logger.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/logger.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/logger.ts:1).
2. Observability hooks are sparse (lib/logger.ts:1).
3. Instrumentation gap for meaningful user actions (lib/logger.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/mutations.ts` - 22 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useMutation, useQueryClient } from "@tanstack/react-query";
- import { trpcMutate } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";

**Key exports:**
- export function useLeaveChallenge() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/mutations.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:54

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/mutations.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/mutations.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/mutations.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/mutations.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/mutations.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/mutations.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/mutations.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/mutations.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/mutations.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/mutations.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/mutations.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/mutations.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/mutations.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/mutations.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/mutations.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/mutations.ts:1).
2. Observability hooks are sparse (lib/mutations.ts:1).
3. Instrumentation gap for meaningful user actions (lib/mutations.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/notification-copy.ts` - 231 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type NotifCategory =
- export type NotifVars = {
- export const TASK_PREP_LEAD_MINUTES: Record<string, number> = {
- export const TASK_PREP_COPY: Record<string, { title: string; body: string }[]> = {
- export function pickTaskPrepTemplate(
- export function normalizeTaskTypeForPrep(raw: string | undefined): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "notification-copy" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/notification-copy.ts:77 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/notification-copy.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/notification-copy.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/notification-copy.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/notification-copy.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/notification-copy.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/notification-copy.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/notification-copy.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/notification-copy.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/notification-copy.ts:162 | no static violation found. |
| Single responsibility / file size | 7 | lib/notification-copy.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/notification-copy.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/notification-copy.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/notification-copy.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/notification-copy.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/notification-copy.ts:1).
2. Observability hooks are sparse (lib/notification-copy.ts:1).
3. Instrumentation gap for meaningful user actions (lib/notification-copy.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/notifications.ts` - 735 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as Notifications from "expo-notifications";
- import { SchedulableTriggerInputTypes } from "expo-notifications";
- import * as Device from "expo-device";
- import Constants from "expo-constants";
- import { captureError } from "@/lib/sentry";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const SOCIAL_TRIGGER_ID = "social-trigger";
- export const ENABLE_TWO_HOURS_LEFT = true;
- export function formatTimeForNotification(hour: number, minute: number): string {
- export async function cancelSecureReminders(): Promise<void> {
- export async function scheduleNextSecureReminder(
- export async function setupNotificationChannel(): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/notifications.ts:22).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:7
- app/(tabs)/index.tsx:52
- app/challenge/[id].tsx:39
- backend/trpc/app-router.ts:18
- components/create/CreateChallengeWizard.tsx:36

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/notifications.ts:72 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/notifications.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/notifications.ts:617 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/notifications.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/notifications.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/notifications.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/notifications.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/notifications.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/notifications.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/notifications.ts:68 | no static violation found. |
| Single responsibility / file size | 5 | lib/notifications.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/notifications.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/notifications.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/notifications.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/notifications.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/notifications.ts:1).
2. Catch path without Sentry capture (lib/notifications.ts:617).
3. Instrumentation gap for meaningful user actions (lib/notifications.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/onboarding-pending.ts` - 50 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import AsyncStorage from "@react-native-async-storage/async-storage";

**Key exports:**
- export type OnboardingAnswers = {
- export async function getPendingChallengeId(): Promise<string | null> {
- export async function setPendingChallengeId(challengeId: string | null): Promise<void> {
- export async function getOnboardingAnswers(): Promise<OnboardingAnswers | null> {
- export async function setOnboardingAnswers(answers: OnboardingAnswers | null): Promise<void> {
- export async function clearOnboardingPending(): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/onboarding-pending.ts:5).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:58

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/onboarding-pending.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/onboarding-pending.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/onboarding-pending.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/onboarding-pending.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/onboarding-pending.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/onboarding-pending.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/onboarding-pending.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/onboarding-pending.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/onboarding-pending.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/onboarding-pending.ts:17 | no static violation found. |
| Single responsibility / file size | 7 | lib/onboarding-pending.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/onboarding-pending.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/onboarding-pending.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/onboarding-pending.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/onboarding-pending.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/onboarding-pending.ts:1).
2. Observability hooks are sparse (lib/onboarding-pending.ts:1).
3. Instrumentation gap for meaningful user actions (lib/onboarding-pending.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/posthog.ts` - 40 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import PostHog from "posthog-react-native";

**Key exports:**
- export function getPostHog(): PostHog | null {
- export function isPostHogEnabled(): boolean {
- export function resetPostHog(): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/posthog.ts:7).

**What depends on it:** (grep for imports of this file)
- lib/analytics.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/posthog.ts:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/posthog.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/posthog.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/posthog.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/posthog.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/posthog.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/posthog.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/posthog.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/posthog.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/posthog.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | lib/posthog.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/posthog.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/posthog.ts:7 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/posthog.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/posthog.ts:9 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/posthog.ts:1).
2. Observability hooks are sparse (lib/posthog.ts:1).
3. Instrumentation gap for meaningful user actions (lib/posthog.ts:7).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/prefetch-queries.ts` - 42 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { QueryClient } from "@tanstack/react-query";
- import { supabase } from "@/lib/supabase";
- import { trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";

**Key exports:**
- export function prefetchChallengeById(queryClient: QueryClient, id: string) {
- export function prefetchActiveChallengeById(queryClient: QueryClient, activeChallengeId: string) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (lib/prefetch-queries.ts:25).
- tRPC usage: yes (lib/prefetch-queries.ts:3).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:43
- app/(tabs)/index.tsx:47
- components/home/ChallengeCard.tsx:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/prefetch-queries.ts:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/prefetch-queries.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/prefetch-queries.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/prefetch-queries.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/prefetch-queries.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/prefetch-queries.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/prefetch-queries.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/prefetch-queries.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | lib/prefetch-queries.ts:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/prefetch-queries.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | lib/prefetch-queries.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/prefetch-queries.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/prefetch-queries.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/prefetch-queries.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/prefetch-queries.ts:2 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/prefetch-queries.ts:1).
2. Observability hooks are sparse (lib/prefetch-queries.ts:1).
3. Instrumentation gap for meaningful user actions (lib/prefetch-queries.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/premium.ts` - 40 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { FREE_LIMITS } from "./feature-flags";

**Key exports:**
- export function setSubscriptionState(
- export function isPremium(): boolean {
- export function canJoinChallenge(currentActiveCount: number): { allowed: boolean; limit: number } {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:48
- lib/subscription.ts:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/premium.ts:25 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/premium.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/premium.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/premium.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/premium.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/premium.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/premium.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/premium.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/premium.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/premium.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | lib/premium.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/premium.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/premium.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/premium.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/premium.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/premium.ts:1).
2. Observability hooks are sparse (lib/premium.ts:1).
3. Instrumentation gap for meaningful user actions (lib/premium.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/profile-badges.tsx` - 36 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { ComponentType } from "react";
- import { Zap, Star, Trophy, Target, Check, Users, Heart, MessageCircle, Hammer, Flag } from "lucide-react-native";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export type BadgeLucideProps = { size?: number; color?: string; strokeWidth?: number };
- export const BADGE_ICONS: Record<string, ComponentType<BadgeLucideProps>> = {
- export function badgeAccentFor(color: string): { bg: string; stroke: string } {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/profile-badges.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:47
- app/profile/[username].tsx:30
- components/profile/BadgeDetailModal.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/profile-badges.tsx:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/profile-badges.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/profile-badges.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/profile-badges.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/profile-badges.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/profile-badges.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/profile-badges.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/profile-badges.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/profile-badges.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/profile-badges.tsx:20 | no static violation found. |
| Single responsibility / file size | 7 | lib/profile-badges.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/profile-badges.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/profile-badges.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/profile-badges.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/profile-badges.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/profile-badges.tsx:1).
2. Observability hooks are sparse (lib/profile-badges.tsx:1).
3. Instrumentation gap for meaningful user actions (lib/profile-badges.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/profile-display.ts` - 27 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function isAutoGeneratedUsername(u: string | null | undefined): boolean {
- export function profilePrimaryName(
- export function profileHandleAt(p: { username?: string | null }): string | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:46
- app/profile/[username].tsx:29

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/profile-display.ts:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/profile-display.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/profile-display.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/profile-display.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/profile-display.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/profile-display.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/profile-display.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/profile-display.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/profile-display.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/profile-display.ts:3 | no static violation found. |
| Single responsibility / file size | 7 | lib/profile-display.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/profile-display.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/profile-display.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/profile-display.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/profile-display.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/profile-display.ts:1).
2. Observability hooks are sparse (lib/profile-display.ts:1).
3. Instrumentation gap for meaningful user actions (lib/profile-display.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/query-client.ts` - 29 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export const queryClient = new QueryClient({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:24
- lib/signout-cleanup.ts:1

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/query-client.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/query-client.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/query-client.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/query-client.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/query-client.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/query-client.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/query-client.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/query-client.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/query-client.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/query-client.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/query-client.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/query-client.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/query-client.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/query-client.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/query-client.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/query-client.ts:1).
2. Observability hooks are sparse (lib/query-client.ts:1).
3. Instrumentation gap for meaningful user actions (lib/query-client.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/quotes.ts` - 62 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const GRIIT_QUOTES = [
- export const DISCIPLINE_QUOTES = GRIIT_QUOTES.map((q) => q.text);
- export type QuoteWithAuthor = { text: string; author: string };
- export function getDailyQuoteObject(): QuoteWithAuthor {
- export function getRandomQuote(): QuoteWithAuthor {
- export function getDailyQuote(): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/home/DailyQuote.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/quotes.ts:48 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/quotes.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/quotes.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/quotes.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/quotes.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/quotes.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/quotes.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/quotes.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/quotes.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/quotes.ts:44 | no static violation found. |
| Single responsibility / file size | 7 | lib/quotes.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/quotes.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/quotes.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/quotes.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/quotes.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/quotes.ts:1).
2. Observability hooks are sparse (lib/quotes.ts:1).
3. Instrumentation gap for meaningful user actions (lib/quotes.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/register-push-token.ts` - 79 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Platform } from "react-native";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import * as Notifications from "expo-notifications";
- import { trpcMutate } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";
- import { track } from "@/lib/analytics";

**Key exports:**
- export async function registerPushTokenWithBackend(): Promise<boolean> {
- export async function requestNotificationPermissionAfterFirstJoin(): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/register-push-token.ts:9).
- Native/env usage: yes (lib/register-push-token.ts:6).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:29
- app/challenge/[id].tsx:38
- app/settings.tsx:13
- hooks/useCreateChallengeWizardPersistence.ts:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/register-push-token.ts:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/register-push-token.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/register-push-token.ts:53 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/register-push-token.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/register-push-token.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/register-push-token.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/register-push-token.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/register-push-token.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/register-push-token.ts:9 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/register-push-token.ts:16 | no static violation found. |
| Single responsibility / file size | 7 | lib/register-push-token.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/register-push-token.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/register-push-token.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/register-push-token.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/register-push-token.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/register-push-token.ts:1).
2. Catch path without Sentry capture (lib/register-push-token.ts:53).
3. Instrumentation gap for meaningful user actions (lib/register-push-token.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/revenue-cat.ts` - 24 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import Constants from "expo-constants";

**Key exports:**
- export {
- export const isExpoGo = Constants.appOwnership === "expo";
- export async function checkEntitlement(_entitlementId?: string): Promise<boolean> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/revenue-cat.ts:5).

**What depends on it:** (grep for imports of this file)
- app/paywall.tsx:20
- hooks/useProStatus.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/revenue-cat.ts:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/revenue-cat.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/revenue-cat.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/revenue-cat.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/revenue-cat.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/revenue-cat.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/revenue-cat.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/revenue-cat.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/revenue-cat.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/revenue-cat.ts:20 | no static violation found. |
| Single responsibility / file size | 7 | lib/revenue-cat.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/revenue-cat.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/revenue-cat.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/revenue-cat.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/revenue-cat.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/revenue-cat.ts:1).
2. Observability hooks are sparse (lib/revenue-cat.ts:1).
3. Instrumentation gap for meaningful user actions (lib/revenue-cat.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/review-prompt.ts` - 65 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as StoreReview from "expo-store-review";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { Platform } from "react-native";
- import { track } from "@/lib/analytics";

**Key exports:**
- export type ReviewTrigger = "day_secured" | "challenge_completed" | "milestone";
- export async function maybePromptForReview(
- export function shouldPromptOnMilestone(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/review-prompt.ts:6).

**What depends on it:** (grep for imports of this file)
- app/challenge/complete.tsx:21

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/review-prompt.ts:60 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/review-prompt.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/review-prompt.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/review-prompt.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/review-prompt.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/review-prompt.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/review-prompt.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/review-prompt.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/review-prompt.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/review-prompt.ts:26 | no static violation found. |
| Single responsibility / file size | 7 | lib/review-prompt.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/review-prompt.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/review-prompt.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/review-prompt.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/review-prompt.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/review-prompt.ts:1).
2. Observability hooks are sparse (lib/review-prompt.ts:1).
3. Instrumentation gap for meaningful user actions (lib/review-prompt.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/routes.ts` - 53 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const ROUTES = {
- export const SEGMENTS = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/routes.ts:3).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:25
- app/(tabs)/discover.tsx:29
- app/(tabs)/index.tsx:26
- app/(tabs)/profile.tsx:34
- app/(tabs)/teams.tsx:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/routes.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/routes.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/routes.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/routes.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/routes.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/routes.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/routes.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/routes.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/routes.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/routes.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/routes.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/routes.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/routes.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/routes.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/routes.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/routes.ts:1).
2. Observability hooks are sparse (lib/routes.ts:1).
3. Instrumentation gap for meaningful user actions (lib/routes.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/sanitize.ts` - 55 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function stripHtml(input: string): string {
- export const MAX_LENGTHS = {
- export function sanitizeText(
- export function sanitizeChallengeTitle(input: string): string {
- export function sanitizeChallengeDescription(input: string): string {
- export function sanitizeUsername(input: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/accountability.ts:7
- backend/trpc/routes/challenges-discover.ts:12
- backend/trpc/routes/challenges.ts:17
- backend/trpc/routes/profiles.ts:15
- lib/create-challenge-helpers.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/sanitize.ts:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/sanitize.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/sanitize.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/sanitize.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/sanitize.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/sanitize.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/sanitize.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/sanitize.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/sanitize.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/sanitize.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | lib/sanitize.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/sanitize.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/sanitize.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/sanitize.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/sanitize.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/sanitize.ts:1).
2. Observability hooks are sparse (lib/sanitize.ts:1).
3. Instrumentation gap for meaningful user actions (lib/sanitize.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/scoring.ts` - 8 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function consistencyScore(weeklySecuredDays: number, currentStreak: number): number {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/leaderboard.ts:8
- components/activity/LeaderboardTab.tsx:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/scoring.ts:6 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/scoring.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/scoring.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/scoring.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/scoring.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/scoring.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/scoring.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/scoring.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/scoring.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/scoring.ts:5 | no static violation found. |
| Single responsibility / file size | 7 | lib/scoring.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/scoring.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/scoring.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/scoring.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/scoring.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/scoring.ts:1).
2. Observability hooks are sparse (lib/scoring.ts:1).
3. Instrumentation gap for meaningful user actions (lib/scoring.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/sentry.ts` - 69 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as Sentry from "@sentry/react-native";

**Key exports:**
- export function initialiseSentry(): void {
- export const initSentry = initialiseSentry;
- export function setSentryUser(userId: string, email?: string): void {
- export function clearSentryUser(): void {
- export function captureError(error: unknown, context?: string | Record<string, unknown>): void {
- export function captureMessage(message: string, level: Sentry.SeverityLevel = "info"): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/sentry.ts:1).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:3
- app/(tabs)/_layout.tsx:5
- app/(tabs)/index.tsx:27
- app/(tabs)/profile.tsx:38
- app/accountability.tsx:26

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/sentry.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/sentry.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/sentry.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/sentry.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/sentry.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/sentry.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/sentry.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/sentry.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/sentry.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/sentry.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | lib/sentry.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/sentry.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/sentry.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 7 | lib/sentry.ts:45 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/sentry.ts:3 | .or interpolation scrutinized. |

**Composite score:** 5.7

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/sentry.ts:1).
2. Observability hooks are sparse (lib/sentry.ts:45).
3. Instrumentation gap for meaningful user actions (lib/sentry.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/share.ts` - 196 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Share, Platform, Linking } from "react-native";
- import * as Haptics from "expo-haptics";
- import * as Sharing from "expo-sharing";
- import {
- import { DEEP_LINK_BASE_URL, APP_STORE_URLS } from "@/lib/config";
- import { trackEvent } from "@/lib/analytics";

**Key exports:**
- export async function shareInvite(message?: string, title?: string): Promise<void> {
- export async function sharePlainMessage(message: string, title?: string): Promise<void> {
- export async function shareChallenge(
- export async function inviteToChallenge(
- export async function shareProfile(
- export async function shareDaySecured(data: {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/share.ts:1).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:21
- app/(tabs)/discover.tsx:27
- app/(tabs)/index.tsx:41
- app/(tabs)/profile.tsx:36
- app/accountability.tsx:16

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/share.ts:25 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/share.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/share.ts:25 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/share.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/share.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/share.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/share.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/share.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/share.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/share.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | lib/share.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/share.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/share.ts:10 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/share.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/share.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/share.ts:1).
2. Catch path without Sentry capture (lib/share.ts:25).
3. Instrumentation gap for meaningful user actions (lib/share.ts:10).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/signout-cleanup.ts` - 29 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { queryClient } from "@/lib/query-client";
- import { captureError, clearSentryUser } from "@/lib/sentry";
- import { resetAnalytics } from "@/lib/analytics";
- import { cancelAllNotifications } from "@/lib/notifications";

**Key exports:**
- export async function runClientSignOutCleanup(): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/settings/AccountDangerZone.tsx:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/signout-cleanup.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/signout-cleanup.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/signout-cleanup.ts:10 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/signout-cleanup.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/signout-cleanup.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/signout-cleanup.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/signout-cleanup.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/signout-cleanup.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/signout-cleanup.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/signout-cleanup.ts:7 | no static violation found. |
| Single responsibility / file size | 7 | lib/signout-cleanup.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/signout-cleanup.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/signout-cleanup.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/signout-cleanup.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/signout-cleanup.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/signout-cleanup.ts:1).
2. Catch path without Sentry capture (lib/signout-cleanup.ts:10).
3. Instrumentation gap for meaningful user actions (lib/signout-cleanup.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/subscription.ts` - 261 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Platform } from "react-native";
- import Constants from "expo-constants";
- import { setSubscriptionState } from "./premium";
- import { supabase } from "./supabase";
- import { trpcMutate } from "./trpc";
- import { TRPC } from "./trpc-paths";

**Key exports:**
- export type CustomerInfo = {
- export type PurchasesPackage = {
- export type PurchasesOffering = {
- export async function initializeRevenueCat(userId: string): Promise<void> {
- export async function syncSubscriptionToSupabase(userId: string, customerInfo: CustomerInfo | null): Promise<void> {
- export async function checkPremiumStatus(): Promise<boolean> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (lib/subscription.ts:112).
- tRPC usage: yes (lib/subscription.ts:11).
- Native/env usage: yes (lib/subscription.ts:7).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:15

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/subscription.ts:37 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/subscription.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/subscription.ts:82 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/subscription.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/subscription.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/subscription.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/subscription.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/subscription.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | lib/subscription.ts:11 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/subscription.ts:17 | no static violation found. |
| Single responsibility / file size | 7 | lib/subscription.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/subscription.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/subscription.ts:13 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/subscription.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/subscription.ts:10 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/subscription.ts:1).
2. Catch path without Sentry capture (lib/subscription.ts:82).
3. Instrumentation gap for meaningful user actions (lib/subscription.ts:13).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/supabase.ts` - 21 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import 'react-native-url-polyfill/auto';
- import AsyncStorage from '@react-native-async-storage/async-storage';
- import { createClient } from '@supabase/supabase-js';
- import { Platform } from 'react-native';

**Key exports:**
- export const supabase = createClient(supabaseUrl, supabaseAnonKey, {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/supabase.ts:1).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:23
- app/auth/forgot-password.tsx:16
- app/auth/login.tsx:17
- app/auth/signup.tsx:17
- app/challenge/active/[activeChallengeId].tsx:25

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/supabase.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/supabase.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/supabase.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/supabase.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/supabase.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/supabase.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/supabase.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/supabase.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/supabase.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/supabase.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/supabase.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/supabase.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/supabase.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/supabase.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/supabase.ts:3 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/supabase.ts:1).
2. Observability hooks are sparse (lib/supabase.ts:1).
3. Instrumentation gap for meaningful user actions (lib/supabase.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/task-hard-verification.ts` - 18 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface TaskHardVerificationConfig {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteForm.tsx:20
- components/task/VerificationGates.tsx:5
- hooks/useTaskCompleteScreen.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/task-hard-verification.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/task-hard-verification.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/task-hard-verification.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/task-hard-verification.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/task-hard-verification.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/task-hard-verification.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/task-hard-verification.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/task-hard-verification.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/task-hard-verification.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/task-hard-verification.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/task-hard-verification.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/task-hard-verification.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/task-hard-verification.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/task-hard-verification.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/task-hard-verification.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/task-hard-verification.ts:1).
2. Observability hooks are sparse (lib/task-hard-verification.ts:1).
3. Instrumentation gap for meaningful user actions (lib/task-hard-verification.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/task-helpers.ts` - 109 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { captureError } from "@/lib/sentry";
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export const JOURNAL_PROMPTS = [
- export function getDailyPrompt(taskId: string, journalPrompt?: string): string {
- export type TaskCompleteConfig = {
- export function parseConfig(taskConfigStr: string | undefined): TaskCompleteConfig {
- export function firstString(v: string | string[] | undefined): string {
- export function inferRunOrWorkout(taskType: string, taskName: string): "run" | "workout" {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteForm.tsx:21
- hooks/useTaskCompleteShareCardProps.ts:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/task-helpers.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/task-helpers.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/task-helpers.ts:57 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/task-helpers.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/task-helpers.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/task-helpers.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/task-helpers.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/task-helpers.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/task-helpers.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/task-helpers.ts:22 | no static violation found. |
| Single responsibility / file size | 7 | lib/task-helpers.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/task-helpers.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/task-helpers.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/task-helpers.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/task-helpers.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/task-helpers.ts:1).
2. Catch path without Sentry capture (lib/task-helpers.ts:57).
3. Instrumentation gap for meaningful user actions (lib/task-helpers.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme-palettes.ts` - 118 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export type ThemeColors = {
- export const LIGHT_THEME: ThemeColors = {
- export const DARK_THEME: ThemeColors = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "theme-palettes" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme-palettes.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme-palettes.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme-palettes.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme-palettes.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme-palettes.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme-palettes.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme-palettes.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme-palettes.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme-palettes.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme-palettes.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme-palettes.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme-palettes.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme-palettes.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme-palettes.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme-palettes.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme-palettes.ts:1).
2. Observability hooks are sparse (lib/theme-palettes.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme-palettes.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/colors.ts` - 35 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const colors = {
- export type Colors = typeof colors;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/AuthGateModal.tsx:12
- components/TaskEditorModal.tsx:42
- components/ui/Chip.tsx:4
- components/ui/CreateFlowCheckbox.tsx:5
- components/ui/CreateFlowHeader.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/colors.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/colors.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/colors.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/colors.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/colors.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/colors.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/colors.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/colors.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/colors.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/colors.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/colors.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/colors.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/colors.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/colors.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/colors.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/colors.ts:1).
2. Observability hooks are sparse (lib/theme/colors.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/colors.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/createFlowStyles.ts` - 72 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";
- import { StyleSheet } from "react-native";
- import { colors, radius, spacing } from "./tokens";

**Key exports:**
- export const createFlowStyles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/theme/createFlowStyles.ts:7).

**What depends on it:** (grep for imports of this file)
- components/TaskEditorModal.tsx:43

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/createFlowStyles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/createFlowStyles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/createFlowStyles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/createFlowStyles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/createFlowStyles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/createFlowStyles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/createFlowStyles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/createFlowStyles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/createFlowStyles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/createFlowStyles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/createFlowStyles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/createFlowStyles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/createFlowStyles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/createFlowStyles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/createFlowStyles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/createFlowStyles.ts:1).
2. Observability hooks are sparse (lib/theme/createFlowStyles.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/createFlowStyles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/index.ts` - 8 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { colors } from "./colors";
- export { typography } from "./typography";
- export { spacing } from "./spacing";
- export { radius } from "./radius";
- export { shadows } from "./shadows";
- export { borders, iconSizes, measures } from "./tokens";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/index.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/index.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/index.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/index.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/index.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/index.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/index.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/index.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/index.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/index.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/index.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/index.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/index.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/index.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/index.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/index.ts:1).
2. Observability hooks are sparse (lib/theme/index.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/index.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/radius.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const radius = {
- export type Radius = typeof radius;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/AuthGateModal.tsx:12
- components/ui/Chip.tsx:5
- components/ui/EnforcementBlock.tsx:3
- components/ui/Input.tsx:4
- components/ui/PrimaryButton.tsx:12

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/radius.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/radius.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/radius.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/radius.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/radius.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/radius.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/radius.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/radius.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/radius.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/radius.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/radius.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/radius.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/radius.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/radius.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/radius.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/radius.ts:1).
2. Observability hooks are sparse (lib/theme/radius.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/radius.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/shadows.ts` - 24 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const shadows = {
- export type Shadows = typeof shadows;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/ui/PrimaryButton.tsx:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/shadows.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/shadows.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/shadows.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/shadows.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/shadows.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/shadows.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/shadows.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/shadows.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/shadows.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/shadows.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/shadows.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/shadows.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/shadows.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/shadows.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/shadows.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/shadows.ts:1).
2. Observability hooks are sparse (lib/theme/shadows.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/shadows.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/shared-styles.ts` - 44 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_SHADOWS } from "@/lib/design-system"

**Key exports:**
- export const sharedStyles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/theme/shared-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "shared-styles" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/shared-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/shared-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/shared-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/shared-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/shared-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/shared-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/shared-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/shared-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/shared-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/shared-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/shared-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/shared-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/shared-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/shared-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/shared-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/shared-styles.ts:1).
2. Observability hooks are sparse (lib/theme/shared-styles.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/shared-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/spacing.ts` - 14 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const spacing = {
- export type Spacing = typeof spacing;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/AuthGateModal.tsx:12
- components/ui/Chip.tsx:6
- components/ui/EnforcementBlock.tsx:3
- components/ui/Screen.tsx:5
- lib/theme/createFlowStyles.ts:8

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/spacing.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/spacing.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/spacing.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/spacing.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/spacing.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/spacing.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/spacing.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/spacing.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/spacing.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/spacing.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/spacing.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/spacing.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/spacing.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/spacing.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/spacing.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/spacing.ts:1).
2. Observability hooks are sparse (lib/theme/spacing.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/spacing.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/tokens.ts` - 205 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export const colors = {
- export const typography = {
- export const spacing = {
- export const radius = {
- export const shadows = {
- export const borders = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/AuthGateModal.tsx:12
- components/TaskEditorModal.tsx:42
- components/ui/CategoryTag.tsx:3
- components/ui/CreateFlowCheckbox.tsx:5
- components/ui/CreateFlowHeader.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/tokens.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/tokens.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/tokens.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/tokens.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/tokens.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/tokens.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/tokens.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/tokens.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/tokens.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/tokens.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/tokens.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/tokens.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/tokens.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/tokens.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/tokens.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/tokens.ts:1).
2. Observability hooks are sparse (lib/theme/tokens.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/tokens.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/theme/typography.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export const typography = {
- export type Typography = typeof typography;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/ui/Chip.tsx:7
- components/ui/EnforcementBlock.tsx:3
- components/ui/Input.tsx:5
- components/ui/PrimaryButton.tsx:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/theme/typography.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/theme/typography.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/theme/typography.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/theme/typography.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/theme/typography.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/theme/typography.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/theme/typography.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/theme/typography.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/theme/typography.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/theme/typography.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/theme/typography.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/theme/typography.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/theme/typography.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/theme/typography.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/theme/typography.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/theme/typography.ts:1).
2. Observability hooks are sparse (lib/theme/typography.ts:1).
3. Instrumentation gap for meaningful user actions (lib/theme/typography.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/time-enforcement.test.ts` - 74 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect } from 'vitest';
- import {

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "time-enforcement.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/time-enforcement.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/time-enforcement.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/time-enforcement.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/time-enforcement.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/time-enforcement.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/time-enforcement.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/time-enforcement.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/time-enforcement.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/time-enforcement.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/time-enforcement.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/time-enforcement.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | lib/time-enforcement.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/time-enforcement.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/time-enforcement.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/time-enforcement.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/time-enforcement.test.ts:1).
2. Observability hooks are sparse (lib/time-enforcement.test.ts:1).
3. Instrumentation gap for meaningful user actions (lib/time-enforcement.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/time-enforcement.ts` - 203 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { TimeEnforcementConfig } from "@/types";

**Key exports:**
- export interface TimeWindow {
- export type TimeWindowStatus = "before" | "active" | "missed";
- export interface TimeWindowState {
- export function formatTimeHHMM(time: string): string {
- export function computeTimeWindow(
- export function getTimeWindowState(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:40
- components/home/GoalCard.tsx:16

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/time-enforcement.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/time-enforcement.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/time-enforcement.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/time-enforcement.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/time-enforcement.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/time-enforcement.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/time-enforcement.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/time-enforcement.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/time-enforcement.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/time-enforcement.ts:19 | no static violation found. |
| Single responsibility / file size | 7 | lib/time-enforcement.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/time-enforcement.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/time-enforcement.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/time-enforcement.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/time-enforcement.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/time-enforcement.ts:1).
2. Observability hooks are sparse (lib/time-enforcement.ts:1).
3. Instrumentation gap for meaningful user actions (lib/time-enforcement.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/trpc-errors.test.ts` - 35 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect } from 'vitest';
- import {

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/trpc-errors.test.ts:6).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "trpc-errors.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/trpc-errors.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/trpc-errors.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/trpc-errors.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/trpc-errors.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/trpc-errors.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/trpc-errors.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/trpc-errors.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/trpc-errors.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/trpc-errors.test.ts:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/trpc-errors.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/trpc-errors.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | lib/trpc-errors.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/trpc-errors.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/trpc-errors.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/trpc-errors.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/trpc-errors.test.ts:1).
2. Observability hooks are sparse (lib/trpc-errors.test.ts:1).
3. Instrumentation gap for meaningful user actions (lib/trpc-errors.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/trpc-errors.ts` - 37 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const TRPC_ERROR_CODE = {
- export type TrpcErrorCode = (typeof TRPC_ERROR_CODE)[keyof typeof TRPC_ERROR_CODE];
- export const TRPC_ERROR_TITLES: Record<TrpcErrorCode, string> = {
- export const TRPC_ERROR_USER_MESSAGE: Partial<Record<TrpcErrorCode, string>> = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/trpc-errors.ts:3).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- lib/api.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/trpc-errors.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/trpc-errors.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/trpc-errors.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/trpc-errors.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/trpc-errors.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/trpc-errors.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/trpc-errors.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/trpc-errors.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/trpc-errors.ts:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/trpc-errors.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/trpc-errors.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/trpc-errors.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/trpc-errors.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/trpc-errors.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/trpc-errors.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/trpc-errors.ts:1).
2. Observability hooks are sparse (lib/trpc-errors.ts:1).
3. Instrumentation gap for meaningful user actions (lib/trpc-errors.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/trpc-paths.ts` - 144 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const TRPC = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:20
- app/(tabs)/index.tsx:25
- app/(tabs)/profile.tsx:33
- app/accountability.tsx:19
- app/accountability/add.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/trpc-paths.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/trpc-paths.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/trpc-paths.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/trpc-paths.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/trpc-paths.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/trpc-paths.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/trpc-paths.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/trpc-paths.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/trpc-paths.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/trpc-paths.ts:77 | no static violation found. |
| Single responsibility / file size | 7 | lib/trpc-paths.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/trpc-paths.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/trpc-paths.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/trpc-paths.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/trpc-paths.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/trpc-paths.ts:1).
2. Observability hooks are sparse (lib/trpc-paths.ts:1).
3. Instrumentation gap for meaningful user actions (lib/trpc-paths.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/trpc.ts` - 122 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { serialize, deserialize } from "superjson";
- import { supabase } from "./supabase";
- import { getTrpcUrl, fetchWithRetry } from "./api";
- import { notifySessionExpired } from "./auth-expiry";
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export async function trpcQuery<T = unknown>(
- export async function trpcMutate<T = unknown>(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (lib/trpc.ts:13).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:19
- app/(tabs)/index.tsx:24
- app/(tabs)/profile.tsx:32
- app/accountability.tsx:18
- app/accountability/add.tsx:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/trpc.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/trpc.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/trpc.ts:71 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/trpc.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/trpc.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/trpc.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/trpc.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/trpc.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/trpc.ts:13 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/trpc.ts:7 | no static violation found. |
| Single responsibility / file size | 7 | lib/trpc.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/trpc.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/trpc.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/trpc.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/trpc.ts:2 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/trpc.ts:1).
2. Catch path without Sentry capture (lib/trpc.ts:71).
3. Instrumentation gap for meaningful user actions (lib/trpc.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/uploadAvatar.ts` - 127 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Platform } from "react-native";
- import { supabase } from "@/lib/supabase";

**Key exports:**
- export type UploadAvatarResult = { url: string } | { error: string };
- export async function uploadAvatarFromUri(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (lib/uploadAvatar.ts:6).

**What depends on it:** (grep for imports of this file)
- components/onboarding/screens/ProfileSetup.tsx:21
- lib/avatar.ts:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/uploadAvatar.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/uploadAvatar.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/uploadAvatar.ts:59 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/uploadAvatar.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/uploadAvatar.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/uploadAvatar.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/uploadAvatar.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/uploadAvatar.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/uploadAvatar.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/uploadAvatar.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | lib/uploadAvatar.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/uploadAvatar.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/uploadAvatar.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/uploadAvatar.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/uploadAvatar.ts:4 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/uploadAvatar.ts:1).
2. Catch path without Sentry capture (lib/uploadAvatar.ts:59).
3. Instrumentation gap for meaningful user actions (lib/uploadAvatar.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/uploadProofImage.ts` - 157 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { supabase } from "@/lib/supabase";

**Key exports:**
- export type UploadProofResult = { url: string } | { error: string };
- export async function uploadProofImageFromBase64(
- export async function uploadProofImageFromUri(uri: string): Promise<UploadProofResult> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/TaskEditorModal.tsx:59
- hooks/useJournalSubmit.ts:2
- hooks/usePhotoCapture.ts:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | lib/uploadProofImage.ts:2 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/uploadProofImage.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | lib/uploadProofImage.ts:101 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/uploadProofImage.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/uploadProofImage.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/uploadProofImage.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/uploadProofImage.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/uploadProofImage.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/uploadProofImage.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/uploadProofImage.ts:18 | no static violation found. |
| Single responsibility / file size | 7 | lib/uploadProofImage.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/uploadProofImage.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/uploadProofImage.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/uploadProofImage.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/uploadProofImage.ts:9 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/uploadProofImage.ts:1).
2. Catch path without Sentry capture (lib/uploadProofImage.ts:101).
3. Instrumentation gap for meaningful user actions (lib/uploadProofImage.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/utils.ts` - 55 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export function getAvatarColor(username: string): string {
- export function getFeedAvatarBgFromUserId(userId: string): string {
- export function getDisplayInitials(displayName: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:51
- app/challenge/active/[activeChallengeId].tsx:26
- app/follow-list.tsx:21
- app/post/[id].tsx:27
- backend/lib/cron-reminders.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/utils.ts:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/utils.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/utils.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/utils.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/utils.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/utils.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/utils.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/utils.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/utils.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/utils.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | lib/utils.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/utils.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/utils.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/utils.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/utils.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/utils.ts:1).
2. Observability hooks are sparse (lib/utils.ts:1).
3. Instrumentation gap for meaningful user actions (lib/utils.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `lib/utils/relativeTime.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function relativeTime(dateStr: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/post/[id].tsx:27
- components/activity/NotificationsTab.tsx:19
- components/feed/FeedCardHeader.tsx:6
- components/feed/FeedPostCard.tsx:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | lib/utils/relativeTime.ts:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | lib/utils/relativeTime.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | lib/utils/relativeTime.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | lib/utils/relativeTime.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | lib/utils/relativeTime.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | lib/utils/relativeTime.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | lib/utils/relativeTime.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | lib/utils/relativeTime.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | lib/utils/relativeTime.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | lib/utils/relativeTime.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | lib/utils/relativeTime.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | lib/utils/relativeTime.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | lib/utils/relativeTime.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | lib/utils/relativeTime.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | lib/utils/relativeTime.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (lib/utils/relativeTime.ts:1).
2. Observability hooks are sparse (lib/utils/relativeTime.ts:1).
3. Instrumentation gap for meaningful user actions (lib/utils/relativeTime.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

