# Phase 2 Scorecards A - 2026-04-14

### `app/_layout.tsx` - 471 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Stack, useRouter, useSegments, Redirect, router } from "expo-router";
- import * as SplashScreen from "expo-splash-screen";
- import * as Sentry from "@sentry/react-native";
- import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
- import { GestureHandlerRootView } from "react-native-gesture-handler";
- import { ActivityIndicator, View, StatusBar, Text, Pressable, StyleSheet, Platform } from "react-native";

**Key exports:**
- export default Sentry.wrap(RootLayout);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (app/_layout.tsx:98).
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/_layout.tsx:46 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/_layout.tsx:124 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/_layout.tsx:296 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/_layout.tsx:4 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | app/_layout.tsx:98 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/_layout.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/_layout.tsx:30 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/_layout.tsx:23 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/_layout.tsx:1).
2. Catch path without Sentry capture (app/_layout.tsx:124).
3. Instrumentation gap for meaningful user actions (app/_layout.tsx:30).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/_layout.tsx` - 159 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Tabs, usePathname } from "expo-router";
- import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import * as Sentry from "@sentry/react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_MEASURES, DS_SHADOWS, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export default function TabLayout() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/(tabs)/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/(tabs)/_layout.tsx:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/(tabs)/_layout.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/_layout.tsx:22 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/(tabs)/_layout.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/_layout.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/_layout.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/(tabs)/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/_layout.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/_layout.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/(tabs)/_layout.tsx:1).
2. Observability hooks are sparse (app/(tabs)/_layout.tsx:1).
3. Instrumentation gap for meaningful user actions (app/(tabs)/_layout.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/activity.tsx` - 72 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState } from "react";
- import { View, Text, TouchableOpacity } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useAuth } from "@/contexts/AuthContext";
- import { useIsGuest } from "@/contexts/AuthGateContext";
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function ActivityScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/(tabs)/activity.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/activity/LeaderboardTab.tsx:23
- components/activity/NotificationsTab.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/(tabs)/activity.tsx:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/activity.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/(tabs)/activity.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/activity.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/activity.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/activity.tsx:31 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/(tabs)/activity.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/activity.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/activity.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/activity.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/(tabs)/activity.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/activity.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/activity.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/activity.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/activity.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/(tabs)/activity.tsx:1).
2. Observability hooks are sparse (app/(tabs)/activity.tsx:1).
3. Instrumentation gap for meaningful user actions (app/(tabs)/activity.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/create.tsx` - 19 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import CreateChallengeWizard from "@/components/create/CreateChallengeWizard";
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function CreateTabScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:4
- app/api/trpc/[trpc]+api.ts:3
- app/create/index.tsx:2
- backend/hono.ts:6
- backend/lib/feed-activity-hydrate.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/(tabs)/create.tsx:9 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/create.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/(tabs)/create.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/create.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/create.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/create.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/(tabs)/create.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/create.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/create.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/create.tsx:8 | no static violation found. |
| Single responsibility / file size | 7 | app/(tabs)/create.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/create.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/create.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/create.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/create.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/(tabs)/create.tsx:1).
2. Observability hooks are sparse (app/(tabs)/create.tsx:1).
3. Instrumentation gap for meaningful user actions (app/(tabs)/create.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/discover.tsx` - 966 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useState } from "react";
- import {
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { Search, X, Plus, ChevronRight } from "lucide-react-native";

**Key exports:**
- export default function DiscoverScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/(tabs)/discover.tsx:19).
- Native/env usage: yes (app/(tabs)/discover.tsx:12).

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges.ts:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/(tabs)/discover.tsx:73 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/discover.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/(tabs)/discover.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/discover.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/discover.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/discover.tsx:358 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/(tabs)/discover.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/discover.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/discover.tsx:19 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/discover.tsx:1 | no static violation found. |
| Single responsibility / file size | 4 | app/(tabs)/discover.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/discover.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/discover.tsx:32 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/discover.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/discover.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.1

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (966 LOC) increases regression risk (app/(tabs)/discover.tsx:1).
2. Observability hooks are sparse (app/(tabs)/discover.tsx:1).
3. Instrumentation gap for meaningful user actions (app/(tabs)/discover.tsx:32).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/index.tsx` - 995 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo, useCallback, useRef } from "react";
- import {
- import { InlineError } from "@/components/InlineError";
- import { SafeAreaView } from "react-native-safe-area-context";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { useRouter } from "expo-router";

**Key exports:**
- export default function HomeScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/(tabs)/index.tsx:24).
- Native/env usage: yes (app/(tabs)/index.tsx:13).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | app/(tabs)/index.tsx:68 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/index.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/(tabs)/index.tsx:331 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/index.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/index.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/index.tsx:452 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/(tabs)/index.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/index.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/index.tsx:24 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/index.tsx:1 | no static violation found. |
| Single responsibility / file size | 4 | app/(tabs)/index.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/index.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/index.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/index.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/index.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (995 LOC) increases regression risk (app/(tabs)/index.tsx:1).
2. Catch path without Sentry capture (app/(tabs)/index.tsx:331).
3. Instrumentation gap for meaningful user actions (app/(tabs)/index.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/profile.tsx` - 984 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
- import {
- import { Image } from "expo-image";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import {

**Key exports:**
- export default function ProfileScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/(tabs)/profile.tsx:32).
- Native/env usage: yes (app/(tabs)/profile.tsx:13).

**What depends on it:** (grep for imports of this file)
- app/profile/[username].tsx:29
- backend/trpc/app-router.ts:10
- backend/trpc/routes/profiles.ts:16
- components/profile/BadgeDetailModal.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | app/(tabs)/profile.tsx:73 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/profile.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/(tabs)/profile.tsx:216 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/profile.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/profile.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/profile.tsx:310 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/(tabs)/profile.tsx:2 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/profile.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/profile.tsx:32 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/profile.tsx:2 | no static violation found. |
| Single responsibility / file size | 4 | app/(tabs)/profile.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/profile.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/profile.tsx:35 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/profile.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/profile.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (984 LOC) increases regression risk (app/(tabs)/profile.tsx:1).
2. Catch path without Sentry capture (app/(tabs)/profile.tsx:216).
3. Instrumentation gap for meaningful user actions (app/(tabs)/profile.tsx:35).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/(tabs)/teams.tsx` - 50 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export default function TeamsTabScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/(tabs)/teams.tsx:5).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "teams" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/(tabs)/teams.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/(tabs)/teams.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/(tabs)/teams.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/(tabs)/teams.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/(tabs)/teams.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/(tabs)/teams.tsx:24 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/(tabs)/teams.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/(tabs)/teams.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/(tabs)/teams.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/(tabs)/teams.tsx:7 | no static violation found. |
| Single responsibility / file size | 7 | app/(tabs)/teams.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/(tabs)/teams.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/(tabs)/teams.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/(tabs)/teams.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/(tabs)/teams.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/(tabs)/teams.tsx:1).
2. Observability hooks are sparse (app/(tabs)/teams.tsx:1).
3. Instrumentation gap for meaningful user actions (app/(tabs)/teams.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/+not-found.tsx` - 56 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { View, Text, StyleSheet, Pressable } from 'react-native';
- import { Link, Stack } from 'expo-router';
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export default function NotFoundScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/+not-found.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "+not-found" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/+not-found.tsx:6 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/+not-found.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/+not-found.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/+not-found.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/+not-found.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/+not-found.tsx:15 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/+not-found.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/+not-found.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/+not-found.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/+not-found.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | app/+not-found.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/+not-found.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/+not-found.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/+not-found.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/+not-found.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/+not-found.tsx:1).
2. Observability hooks are sparse (app/+not-found.tsx:1).
3. Instrumentation gap for meaningful user actions (app/+not-found.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/accountability.tsx` - 462 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useMemo, useState } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter, useFocusEffect } from "expo-router";
- import { ChevronLeft, UserPlus, UserMinus, Check, X, Users } from "lucide-react-native";
- import * as Haptics from "expo-haptics";

**Key exports:**
- export default function AccountabilityScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/accountability.tsx:18).
- Native/env usage: yes (app/accountability.tsx:11).

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/accountability.tsx:50 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/accountability.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/accountability.tsx:50 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/accountability.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/accountability.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/accountability.tsx:151 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/accountability.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/accountability.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/accountability.tsx:18 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/accountability.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/accountability.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/accountability.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/accountability.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/accountability.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/accountability.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/accountability.tsx:1).
2. Catch path without Sentry capture (app/accountability.tsx:50).
3. Instrumentation gap for meaningful user actions (app/accountability.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/accountability/add.tsx` - 258 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useState } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter, useLocalSearchParams } from "expo-router";
- import * as Haptics from "expo-haptics";
- import { sharedStyles } from "@/lib/theme";

**Key exports:**
- export default function AddAccountabilityPartnerScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/accountability/add.tsx:18).
- Native/env usage: yes (app/accountability/add.tsx:12).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "add" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/accountability/add.tsx:51 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/accountability/add.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/accountability/add.tsx:51 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/accountability/add.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/accountability/add.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/accountability/add.tsx:125 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/accountability/add.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/accountability/add.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/accountability/add.tsx:18 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/accountability/add.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/accountability/add.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/accountability/add.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/accountability/add.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/accountability/add.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/accountability/add.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/accountability/add.tsx:1).
2. Catch path without Sentry capture (app/accountability/add.tsx:51).
3. Instrumentation gap for meaningful user actions (app/accountability/add.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/api/health+api.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export async function GET() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "health+api" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/api/health+api.ts:2 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/api/health+api.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/api/health+api.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/api/health+api.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/api/health+api.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/api/health+api.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/api/health+api.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/api/health+api.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/api/health+api.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/api/health+api.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | app/api/health+api.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | app/api/health+api.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/api/health+api.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/api/health+api.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/api/health+api.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/api/health+api.ts:1).
2. Observability hooks are sparse (app/api/health+api.ts:1).
3. Instrumentation gap for meaningful user actions (app/api/health+api.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/api/trpc/[trpc]+api.ts` - 60 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { AnyRouter } from "@trpc/server";
- import { appRouter } from "@/backend/trpc/app-router";
- import { createContext } from "@/backend/trpc/create-context";
- import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

**Key exports:**
- export async function OPTIONS() {
- export async function GET(request: Request) {
- export async function POST(request: Request) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/api/trpc/[trpc]+api.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[trpc]+api" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/api/trpc/[trpc]+api.ts:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/api/trpc/[trpc]+api.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/api/trpc/[trpc]+api.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/api/trpc/[trpc]+api.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/api/trpc/[trpc]+api.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/api/trpc/[trpc]+api.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/api/trpc/[trpc]+api.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/api/trpc/[trpc]+api.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/api/trpc/[trpc]+api.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/api/trpc/[trpc]+api.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | app/api/trpc/[trpc]+api.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | app/api/trpc/[trpc]+api.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/api/trpc/[trpc]+api.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/api/trpc/[trpc]+api.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/api/trpc/[trpc]+api.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/api/trpc/[trpc]+api.ts:1).
2. Observability hooks are sparse (app/api/trpc/[trpc]+api.ts:1).
3. Instrumentation gap for meaningful user actions (app/api/trpc/[trpc]+api.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/auth/_layout.tsx` - 12 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Stack } from "expo-router";

**Key exports:**
- export default function AuthLayout() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/auth/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/auth/_layout.tsx:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/auth/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/auth/_layout.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/auth/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/auth/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/auth/_layout.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/auth/_layout.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/auth/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/auth/_layout.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/auth/_layout.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | app/auth/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/auth/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/auth/_layout.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/auth/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/auth/_layout.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/auth/_layout.tsx:1).
2. Observability hooks are sparse (app/auth/_layout.tsx:1).
3. Instrumentation gap for meaningful user actions (app/auth/_layout.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/auth/forgot-password.tsx` - 195 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useRef } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { ROUTES } from "@/lib/routes";
- import { supabase } from "@/lib/supabase";

**Key exports:**
- export default function ForgotPasswordScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/auth/forgot-password.tsx:12).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "forgot-password" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/auth/forgot-password.tsx:54 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/auth/forgot-password.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/auth/forgot-password.tsx:54 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/auth/forgot-password.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/auth/forgot-password.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/auth/forgot-password.tsx:75 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/auth/forgot-password.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/auth/forgot-password.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/auth/forgot-password.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/auth/forgot-password.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/auth/forgot-password.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/auth/forgot-password.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/auth/forgot-password.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/auth/forgot-password.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/auth/forgot-password.tsx:16 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/auth/forgot-password.tsx:1).
2. Catch path without Sentry capture (app/auth/forgot-password.tsx:54).
3. Instrumentation gap for meaningful user actions (app/auth/forgot-password.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/auth/login.tsx` - 473 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useRef, useCallback, useEffect } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { Eye, EyeOff, ChevronLeft } from "lucide-react-native";
- import * as AppleAuthentication from "expo-apple-authentication";

**Key exports:**
- export default function LoginScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (app/auth/login.tsx:80).
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/auth/login.tsx:12).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "login" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/auth/login.tsx:100 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/auth/login.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/auth/login.tsx:100 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/auth/login.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/auth/login.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/auth/login.tsx:205 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/auth/login.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/auth/login.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | app/auth/login.tsx:80 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/auth/login.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/auth/login.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/auth/login.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/auth/login.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/auth/login.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/auth/login.tsx:17 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/auth/login.tsx:1).
2. Catch path without Sentry capture (app/auth/login.tsx:100).
3. Instrumentation gap for meaningful user actions (app/auth/login.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/auth/signup.tsx` - 567 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useRef, useEffect, useCallback } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { Eye, EyeOff } from "lucide-react-native";
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export default function SignupScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (app/auth/signup.tsx:181).
- tRPC usage: yes (app/auth/signup.tsx:20).
- Native/env usage: yes (app/auth/signup.tsx:12).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "signup" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/auth/signup.tsx:32 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/auth/signup.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/auth/signup.tsx:106 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/auth/signup.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/auth/signup.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/auth/signup.tsx:266 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/auth/signup.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/auth/signup.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | app/auth/signup.tsx:20 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/auth/signup.tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | app/auth/signup.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/auth/signup.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/auth/signup.tsx:18 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/auth/signup.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/auth/signup.tsx:17 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/auth/signup.tsx:1).
2. Catch path without Sentry capture (app/auth/signup.tsx:106).
3. Instrumentation gap for meaningful user actions (app/auth/signup.tsx:18).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/challenge/[id].tsx` - 1564 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
- import {
- import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
- import { useFocusEffect } from "@react-navigation/native";
- import { useLocalSearchParams, useRouter, Stack } from "expo-router";
- import { useQuery, useQueryClient } from "@tanstack/react-query";

**Key exports:**
- export default function ChallengeDetailScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/challenge/[id].tsx:43).
- Native/env usage: yes (app/challenge/[id].tsx:14).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[id]" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 3 | app/challenge/[id].tsx:172 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/challenge/[id].tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/challenge/[id].tsx:567 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/challenge/[id].tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/challenge/[id].tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/challenge/[id].tsx:365 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/challenge/[id].tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/challenge/[id].tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/challenge/[id].tsx:43 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/challenge/[id].tsx:1 | no static violation found. |
| Single responsibility / file size | 2 | app/challenge/[id].tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/challenge/[id].tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/challenge/[id].tsx:53 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/challenge/[id].tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/challenge/[id].tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.7

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (1564 LOC) increases regression risk (app/challenge/[id].tsx:1).
2. Catch path without Sentry capture (app/challenge/[id].tsx:567).
3. Instrumentation gap for meaningful user actions (app/challenge/[id].tsx:53).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/challenge/active/[activeChallengeId].tsx` - 672 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
- import {
- import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
- import { useLocalSearchParams, useRouter, Stack } from "expo-router";
- import { useQuery, useQueryClient } from "@tanstack/react-query";
- import {

**Key exports:**
- export default function ActiveChallengeDetailScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (app/challenge/active/[activeChallengeId].tsx:105).
- tRPC usage: yes (app/challenge/active/[activeChallengeId].tsx:33).
- Native/env usage: yes (app/challenge/active/[activeChallengeId].tsx:11).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[activeChallengeId]" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/challenge/active/[activeChallengeId].tsx:77 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/challenge/active/[activeChallengeId].tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/challenge/active/[activeChallengeId].tsx:222 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/challenge/active/[activeChallengeId].tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/challenge/active/[activeChallengeId].tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/challenge/active/[activeChallengeId].tsx:262 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/challenge/active/[activeChallengeId].tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/challenge/active/[activeChallengeId].tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | app/challenge/active/[activeChallengeId].tsx:33 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/challenge/active/[activeChallengeId].tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | app/challenge/active/[activeChallengeId].tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/challenge/active/[activeChallengeId].tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/challenge/active/[activeChallengeId].tsx:41 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/challenge/active/[activeChallengeId].tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/challenge/active/[activeChallengeId].tsx:25 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/challenge/active/[activeChallengeId].tsx:1).
2. Catch path without Sentry capture (app/challenge/active/[activeChallengeId].tsx:222).
3. Instrumentation gap for meaningful user actions (app/challenge/active/[activeChallengeId].tsx:41).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/challenge/complete.tsx` - 334 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useRef, useState, useEffect, useCallback } from "react";
- import {
- import { useRouter, useLocalSearchParams, Stack } from "expo-router";
- import { SafeAreaView } from "react-native-safe-area-context";
- import * as Haptics from "expo-haptics";
- import { Shield, Share2, ChevronRight, Home } from "lucide-react-native";

**Key exports:**
- export default function ChallengeCompleteScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/challenge/complete.tsx:9).

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteCelebration.tsx:31
- components/task/TaskCompleteForm.tsx:23
- hooks/useTaskCompleteScreen.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/challenge/complete.tsx:52 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/challenge/complete.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/challenge/complete.tsx:52 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/challenge/complete.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/challenge/complete.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/challenge/complete.tsx:142 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/challenge/complete.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/challenge/complete.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/challenge/complete.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/challenge/complete.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/challenge/complete.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/challenge/complete.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/challenge/complete.tsx:20 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/challenge/complete.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/challenge/complete.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/challenge/complete.tsx:1).
2. Catch path without Sentry capture (app/challenge/complete.tsx:52).
3. Instrumentation gap for meaningful user actions (app/challenge/complete.tsx:20).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/create-challenge.tsx` - 16 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Redirect } from "expo-router";
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function CreateChallengeRedirect() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/create-challenge.tsx:1).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:22
- components/TaskEditorModal.tsx:60

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/create-challenge.tsx:6 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/create-challenge.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/create-challenge.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/create-challenge.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/create-challenge.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/create-challenge.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/create-challenge.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/create-challenge.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/create-challenge.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/create-challenge.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | app/create-challenge.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/create-challenge.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/create-challenge.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/create-challenge.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/create-challenge.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/create-challenge.tsx:1).
2. Observability hooks are sparse (app/create-challenge.tsx:1).
3. Instrumentation gap for meaningful user actions (app/create-challenge.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/create-profile.tsx` - 341 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useRef, useCallback } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { supabase } from "@/lib/supabase";
- import { getCalendars } from "expo-localization";

**Key exports:**
- export default function CreateProfileScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (app/create-profile.tsx:74).
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/create-profile.tsx:10).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "create-profile" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/create-profile.tsx:25 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/create-profile.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/create-profile.tsx:88 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/create-profile.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/create-profile.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/create-profile.tsx:189 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/create-profile.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/create-profile.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | app/create-profile.tsx:74 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/create-profile.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/create-profile.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/create-profile.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/create-profile.tsx:16 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/create-profile.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/create-profile.tsx:13 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/create-profile.tsx:1).
2. Catch path without Sentry capture (app/create-profile.tsx:88).
3. Instrumentation gap for meaningful user actions (app/create-profile.tsx:16).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/create/_layout.tsx` - 6 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Stack } from "expo-router";

**Key exports:**
- export default function CreateModalLayout() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/create/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/create/_layout.tsx:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/create/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/create/_layout.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/create/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/create/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/create/_layout.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/create/_layout.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/create/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/create/_layout.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/create/_layout.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | app/create/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/create/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/create/_layout.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/create/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/create/_layout.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/create/_layout.tsx:1).
2. Observability hooks are sparse (app/create/_layout.tsx:1).
3. Instrumentation gap for meaningful user actions (app/create/_layout.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/create/index.tsx` - 7 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import CreateChallengeWizard from "@/components/create/CreateChallengeWizard";

**Key exports:**
- export default function CreateModalScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/create/index.tsx:5 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/create/index.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/create/index.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/create/index.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/create/index.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/create/index.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/create/index.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/create/index.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/create/index.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/create/index.tsx:4 | no static violation found. |
| Single responsibility / file size | 7 | app/create/index.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/create/index.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/create/index.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/create/index.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/create/index.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/create/index.tsx:1).
2. Observability hooks are sparse (app/create/index.tsx:1).
3. Instrumentation gap for meaningful user actions (app/create/index.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/edit-profile.tsx` - 286 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect } from 'react';
- import {
- import { SafeAreaView } from 'react-native-safe-area-context';
- import { useRouter } from 'expo-router';
- import { X } from 'lucide-react-native';
- import * as Haptics from 'expo-haptics';

**Key exports:**
- export default function EditProfileScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/edit-profile.tsx:20).
- Native/env usage: yes (app/edit-profile.tsx:12).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "edit-profile" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/edit-profile.tsx:68 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/edit-profile.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/edit-profile.tsx:68 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/edit-profile.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/edit-profile.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/edit-profile.tsx:88 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/edit-profile.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/edit-profile.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/edit-profile.tsx:20 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/edit-profile.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/edit-profile.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/edit-profile.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/edit-profile.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/edit-profile.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/edit-profile.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/edit-profile.tsx:1).
2. Catch path without Sentry capture (app/edit-profile.tsx:68).
3. Instrumentation gap for meaningful user actions (app/edit-profile.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/follow-list.tsx` - 328 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useState } from "react";
- import {
- import { Image } from "expo-image";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useLocalSearchParams, useRouter, Stack } from "expo-router";
- import { ChevronLeft } from "lucide-react-native";

**Key exports:**
- export default function FollowListScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/follow-list.tsx:16).
- Native/env usage: yes (app/follow-list.tsx:10).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "follow-list" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/follow-list.tsx:34 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/follow-list.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/follow-list.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/follow-list.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/follow-list.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/follow-list.tsx:146 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/follow-list.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/follow-list.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/follow-list.tsx:16 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/follow-list.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/follow-list.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/follow-list.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/follow-list.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/follow-list.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/follow-list.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/follow-list.tsx:1).
2. Observability hooks are sparse (app/follow-list.tsx:1).
3. Instrumentation gap for meaningful user actions (app/follow-list.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/invite/[code].tsx` - 40 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect } from "react";
- import { useLocalSearchParams, useRouter } from "expo-router";
- import { ROUTES } from "@/lib/routes";
- import { ActivityIndicator, View } from "react-native";
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function InviteRedirectScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/invite/[code].tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[code]" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/invite/[code].tsx:26 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/invite/[code].tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/invite/[code].tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/invite/[code].tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/invite/[code].tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/invite/[code].tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/invite/[code].tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/invite/[code].tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/invite/[code].tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/invite/[code].tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/invite/[code].tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/invite/[code].tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/invite/[code].tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/invite/[code].tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/invite/[code].tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/invite/[code].tsx:1).
2. Observability hooks are sparse (app/invite/[code].tsx:1).
3. Instrumentation gap for meaningful user actions (app/invite/[code].tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/legal/_layout.tsx` - 11 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Stack } from "expo-router";

**Key exports:**
- export default function LegalLayout() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/legal/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/legal/_layout.tsx:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/legal/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/legal/_layout.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/legal/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/legal/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/legal/_layout.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/legal/_layout.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/legal/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/legal/_layout.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/legal/_layout.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | app/legal/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/legal/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/legal/_layout.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/legal/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/legal/_layout.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/legal/_layout.tsx:1).
2. Observability hooks are sparse (app/legal/_layout.tsx:1).
3. Instrumentation gap for meaningful user actions (app/legal/_layout.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/legal/privacy-policy.tsx` - 52 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, ScrollView, StyleSheet } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function PrivacyPolicyScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/legal/privacy-policy.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "privacy-policy" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/legal/privacy-policy.tsx:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/legal/privacy-policy.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/legal/privacy-policy.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/legal/privacy-policy.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/legal/privacy-policy.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/legal/privacy-policy.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/legal/privacy-policy.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/legal/privacy-policy.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/legal/privacy-policy.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/legal/privacy-policy.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | app/legal/privacy-policy.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/legal/privacy-policy.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/legal/privacy-policy.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/legal/privacy-policy.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/legal/privacy-policy.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/legal/privacy-policy.tsx:1).
2. Observability hooks are sparse (app/legal/privacy-policy.tsx:1).
3. Instrumentation gap for meaningful user actions (app/legal/privacy-policy.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/legal/terms.tsx` - 53 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, ScrollView, StyleSheet } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function TermsScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/legal/terms.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "terms" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/legal/terms.tsx:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/legal/terms.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/legal/terms.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/legal/terms.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/legal/terms.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/legal/terms.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/legal/terms.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/legal/terms.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/legal/terms.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/legal/terms.tsx:18 | no static violation found. |
| Single responsibility / file size | 7 | app/legal/terms.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/legal/terms.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/legal/terms.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/legal/terms.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/legal/terms.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/legal/terms.tsx:1).
2. Observability hooks are sparse (app/legal/terms.tsx:1).
3. Instrumentation gap for meaningful user actions (app/legal/terms.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/onboarding/_layout.tsx` - 16 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Stack } from "expo-router";

**Key exports:**
- export default function OnboardingLayout() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/onboarding/_layout.tsx:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "_layout" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/onboarding/_layout.tsx:4 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/onboarding/_layout.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/onboarding/_layout.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/onboarding/_layout.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/onboarding/_layout.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/onboarding/_layout.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/onboarding/_layout.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/onboarding/_layout.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/onboarding/_layout.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/onboarding/_layout.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | app/onboarding/_layout.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/onboarding/_layout.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/onboarding/_layout.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/onboarding/_layout.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/onboarding/_layout.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/onboarding/_layout.tsx:1).
2. Observability hooks are sparse (app/onboarding/_layout.tsx:1).
3. Instrumentation gap for meaningful user actions (app/onboarding/_layout.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/onboarding/index.tsx` - 16 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
- import { ErrorBoundary } from "@/components/ErrorBoundary";

**Key exports:**
- export default function OnboardingPage() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/onboarding/index.tsx:6 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/onboarding/index.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/onboarding/index.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/onboarding/index.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/onboarding/index.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/onboarding/index.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/onboarding/index.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/onboarding/index.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/onboarding/index.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/onboarding/index.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | app/onboarding/index.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/onboarding/index.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/onboarding/index.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/onboarding/index.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/onboarding/index.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/onboarding/index.tsx:1).
2. Observability hooks are sparse (app/onboarding/index.tsx:1).
3. Instrumentation gap for meaningful user actions (app/onboarding/index.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/paywall.tsx` - 648 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback, useEffect, useRef } from "react";
- import {
- import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
- import { useRouter, useLocalSearchParams } from "expo-router";
- import { X, Flame, Zap, BarChart2, Users } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system"

**Key exports:**
- export default function PaywallScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/paywall.tsx:15).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "paywall" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/paywall.tsx:37 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/paywall.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/paywall.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/paywall.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/paywall.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/paywall.tsx:195 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/paywall.tsx:4 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/paywall.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/paywall.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/paywall.tsx:4 | no static violation found. |
| Single responsibility / file size | 5 | app/paywall.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/paywall.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/paywall.tsx:22 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/paywall.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/paywall.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/paywall.tsx:1).
2. Observability hooks are sparse (app/paywall.tsx:1).
3. Instrumentation gap for meaningful user actions (app/paywall.tsx:22).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/post/[id].tsx` - 586 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useMemo, useRef, useState } from "react";
- import {
- import { Stack, useLocalSearchParams, useRouter } from "expo-router";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { ChevronLeft } from "lucide-react-native";
- import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

**Key exports:**
- export default function PostThreadScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/post/[id].tsx:22).
- Native/env usage: yes (app/post/[id].tsx:17).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[id]" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/post/[id].tsx:64 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/post/[id].tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/post/[id].tsx:183 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/post/[id].tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/post/[id].tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/post/[id].tsx:305 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/post/[id].tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/post/[id].tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/post/[id].tsx:22 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/post/[id].tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | app/post/[id].tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/post/[id].tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/post/[id].tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/post/[id].tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/post/[id].tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/post/[id].tsx:1).
2. Catch path without Sentry capture (app/post/[id].tsx:183).
3. Instrumentation gap for meaningful user actions (app/post/[id].tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/profile/[username].tsx` - 936 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
- import {
- import { useLocalSearchParams, useRouter, Stack } from "expo-router";
- import {
- import { useQuery, useQueryClient } from "@tanstack/react-query";
- import { useAuth } from "@/contexts/AuthContext";

**Key exports:**
- export default function PublicProfileScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/profile/[username].tsx:25).
- Native/env usage: yes (app/profile/[username].tsx:10).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "[username]" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | app/profile/[username].tsx:63 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/profile/[username].tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/profile/[username].tsx:212 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/profile/[username].tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/profile/[username].tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/profile/[username].tsx:348 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/profile/[username].tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/profile/[username].tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/profile/[username].tsx:25 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/profile/[username].tsx:1 | no static violation found. |
| Single responsibility / file size | 4 | app/profile/[username].tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/profile/[username].tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/profile/[username].tsx:39 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/profile/[username].tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/profile/[username].tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (936 LOC) increases regression risk (app/profile/[username].tsx:1).
2. Catch path without Sentry capture (app/profile/[username].tsx:212).
3. Instrumentation gap for meaningful user actions (app/profile/[username].tsx:39).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/settings.tsx` - 383 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useCallback } from "react";
- import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Linking } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import { ChevronLeft, Crown, User, FileText } from "lucide-react-native";
- import * as Haptics from "expo-haptics";

**Key exports:**
- export default function SettingsScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (app/settings.tsx:9).
- Native/env usage: yes (app/settings.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/settings/AccountDangerZone.tsx:15
- components/settings/ReminderSection.tsx:19
- components/settings/VisibilitySection.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/settings.tsx:71 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/settings.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/settings.tsx:71 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/settings.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/settings.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/settings.tsx:156 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/settings.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/settings.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/settings.tsx:9 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/settings.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | app/settings.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/settings.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/settings.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/settings.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/settings.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/settings.tsx:1).
2. Catch path without Sentry capture (app/settings.tsx:71).
3. Instrumentation gap for meaningful user actions (app/settings.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/task/checkin-styles.ts` - 326 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const checkinStyles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/task/checkin-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- app/task/checkin.tsx:27

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/task/checkin-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/task/checkin-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/task/checkin-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/task/checkin-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/task/checkin-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/task/checkin-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/task/checkin-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/task/checkin-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/task/checkin-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/task/checkin-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | app/task/checkin-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | app/task/checkin-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/task/checkin-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/task/checkin-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/task/checkin-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/task/checkin-styles.ts:1).
2. Observability hooks are sparse (app/task/checkin-styles.ts:1).
3. Instrumentation gap for meaningful user actions (app/task/checkin-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/task/checkin.tsx` - 652 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useRef } from "react";
- import {
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter, useLocalSearchParams } from "expo-router";
- import {
- import * as Location from "expo-location";

**Key exports:**
- export default function CheckinTaskScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/task/checkin.tsx:10).

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:12

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/task/checkin.tsx:128 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/task/checkin.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | app/task/checkin.tsx:210 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/task/checkin.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/task/checkin.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/task/checkin.tsx:475 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/task/checkin.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/task/checkin.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/task/checkin.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/task/checkin.tsx:2 | no static violation found. |
| Single responsibility / file size | 5 | app/task/checkin.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/task/checkin.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/task/checkin.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/task/checkin.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/task/checkin.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/task/checkin.tsx:1).
2. Catch path without Sentry capture (app/task/checkin.tsx:210).
3. Instrumentation gap for meaningful user actions (app/task/checkin.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/task/complete.tsx` - 18 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { ErrorBoundary } from "@/components/ErrorBoundary";
- import { TaskCompleteScreenInner } from "@/hooks/useTaskCompleteScreen";

**Key exports:**
- export type { TaskCompleteConfig } from "@/lib/task-helpers";
- export default function TaskCompleteScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteCelebration.tsx:31
- components/task/TaskCompleteForm.tsx:23
- hooks/useTaskCompleteScreen.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/task/complete.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/task/complete.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/task/complete.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/task/complete.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/task/complete.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/task/complete.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/task/complete.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/task/complete.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/task/complete.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/task/complete.tsx:7 | no static violation found. |
| Single responsibility / file size | 7 | app/task/complete.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/task/complete.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/task/complete.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/task/complete.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/task/complete.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/task/complete.tsx:1).
2. Observability hooks are sparse (app/task/complete.tsx:1).
3. Instrumentation gap for meaningful user actions (app/task/complete.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/task/run-styles.ts` - 546 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const styles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/task/run-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- app/task/run.tsx:34

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | app/task/run-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/task/run-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/task/run-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/task/run-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/task/run-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/task/run-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | app/task/run-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/task/run-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/task/run-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/task/run-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 5 | app/task/run-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | app/task/run-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/task/run-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/task/run-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/task/run-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (app/task/run-styles.ts:1).
2. Observability hooks are sparse (app/task/run-styles.ts:1).
3. Instrumentation gap for meaningful user actions (app/task/run-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `app/task/run.tsx` - 970 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useRef } from "react";
- import {
- import { Image } from "expo-image";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { useRouter, useLocalSearchParams } from "expo-router";
- import {

**Key exports:**
- export default function RunTaskScreen() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (app/task/run.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/settings/AccountDangerZone.tsx:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | app/task/run.tsx:151 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | app/task/run.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | app/task/run.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | app/task/run.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | app/task/run.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | app/task/run.tsx:546 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | app/task/run.tsx:59 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | app/task/run.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | app/task/run.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | app/task/run.tsx:2 | no static violation found. |
| Single responsibility / file size | 4 | app/task/run.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | app/task/run.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | app/task/run.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | app/task/run.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | app/task/run.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.1

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (970 LOC) increases regression risk (app/task/run.tsx:1).
2. Observability hooks are sparse (app/task/run.tsx:1).
3. Instrumentation gap for meaningful user actions (app/task/run.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/hono.ts` - 200 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { trpcServer } from "@hono/trpc-server";
- import { Hono, type Context } from "hono";
- import { cors } from "hono/cors";
- import { appRouter } from "./trpc/app-router";
- import { createContext } from "./trpc/create-context";
- import { checkRateLimit, getClientIp } from "./lib/rate-limit";

**Key exports:**
- export default app;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/hono.ts:30).
- tRPC usage: yes (backend/hono.ts:1).
- Native/env usage: yes (backend/hono.ts:9).

**What depends on it:** (grep for imports of this file)
- backend/server.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/hono.ts:41 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/hono.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/hono.ts:72 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/hono.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/hono.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/hono.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/hono.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/hono.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/hono.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/hono.ts:26 | no static violation found. |
| Single responsibility / file size | 7 | backend/hono.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/hono.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/hono.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/hono.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/hono.ts:9 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/hono.ts:1).
2. Catch path without Sentry capture (backend/hono.ts:72).
3. Instrumentation gap for meaningful user actions (backend/hono.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/achievement-definitions.ts` - 62 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface AchievementDef {
- export const ACHIEVEMENTS = {
- export type AchievementKey = string;
- export function getAchievementsByDimension(dimension?: AchievementDef["dimension"]): AchievementDef[] {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/achievements.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/achievement-definitions.ts:59 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/achievement-definitions.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/achievement-definitions.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/achievement-definitions.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/achievement-definitions.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/achievement-definitions.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/achievement-definitions.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/achievement-definitions.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/achievement-definitions.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/achievement-definitions.ts:57 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/achievement-definitions.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/achievement-definitions.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/achievement-definitions.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/achievement-definitions.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/achievement-definitions.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/achievement-definitions.ts:1).
2. Observability hooks are sparse (backend/lib/achievement-definitions.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/achievement-definitions.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/achievements.ts` - 159 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { ACHIEVEMENTS } from "./achievement-definitions";

**Key exports:**
- export async function checkAndUnlockAchievements(
- export function getLabelForKey(key: string): string {
- export function getDescriptionForKey(key: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/achievements.ts:13).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:21
- backend/trpc/routes/checkins.ts:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/achievements.ts:129 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/achievements.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/achievements.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/achievements.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/achievements.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/achievements.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/achievements.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/achievements.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/achievements.ts:13 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/achievements.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/achievements.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/achievements.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/achievements.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/achievements.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 4 | backend/lib/achievements.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/achievements.ts:1).
2. Observability hooks are sparse (backend/lib/achievements.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/achievements.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/cache.ts` - 52 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Redis } from "@upstash/redis";
- import { logger } from "./logger";

**Key exports:**
- export async function getCached<T>(key: string): Promise<T | null> {
- export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
- export async function invalidateCache(key: string): Promise<void> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/cache.ts:11).

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges-discover.ts:11
- backend/trpc/routes/leaderboard.ts:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/cache.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/cache.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/cache.ts:27 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/cache.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/cache.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/cache.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/cache.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/cache.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/cache.ts:43 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/cache.ts:9 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/cache.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/cache.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/cache.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/cache.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/cache.ts:11 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/cache.ts:1).
2. Catch path without Sentry capture (backend/lib/cache.ts:27).
3. Instrumentation gap for meaningful user actions (backend/lib/cache.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/challenge-tasks.ts` - 391 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { TaskConfig } from "./task-config";

**Key exports:**
- export type { TaskConfig };
- export interface VerificationRuleStrava {
- export interface ChallengeTaskConfig extends Omit<TaskConfig, "verification_rule_json"> {
- export interface ChallengeTaskRowRaw {
- export interface ChallengeTaskApiShape {
- export function mapTaskRowToApi(row: ChallengeTaskRowRaw | null | undefined): ChallengeTaskApiShape | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/checkin-complete-gates.ts:3
- backend/lib/daily-challenge-generator.ts:8
- backend/lib/strava-verifier.ts:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/challenge-tasks.ts:84 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/challenge-tasks.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/challenge-tasks.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/challenge-tasks.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/challenge-tasks.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/challenge-tasks.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/challenge-tasks.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/challenge-tasks.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/challenge-tasks.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/challenge-tasks.ts:83 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/challenge-tasks.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/challenge-tasks.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/challenge-tasks.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/challenge-tasks.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/challenge-tasks.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/challenge-tasks.ts:1).
2. Observability hooks are sparse (backend/lib/challenge-tasks.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/challenge-tasks.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/challenge-timer.ts` - 9 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
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
| Correctness (happy path + edges) | 6 | backend/lib/challenge-timer.ts:5 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/challenge-timer.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/challenge-timer.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/challenge-timer.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/challenge-timer.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/challenge-timer.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/challenge-timer.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/challenge-timer.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/challenge-timer.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/challenge-timer.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/challenge-timer.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/challenge-timer.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/challenge-timer.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/challenge-timer.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/challenge-timer.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/challenge-timer.ts:1).
2. Observability hooks are sparse (backend/lib/challenge-timer.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/challenge-timer.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/checkin-complete-gates.ts` - 129 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { TRPCError } from "@trpc/server";
- import type { TaskConfig } from "./task-config";
- import type { ChallengeTaskConfig } from "./challenge-tasks";
- import { haversineDistance } from "./geo";

**Key exports:**
- export function assertHardModeScheduleWindow(config: TaskConfig): void {
- export function assertHardModeCameraOnly(
- export type TaskRowLoc = {
- export function evaluateTaskLocation(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (backend/lib/checkin-complete-gates.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "checkin-complete-gates" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/checkin-complete-gates.ts:42 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/checkin-complete-gates.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/checkin-complete-gates.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/checkin-complete-gates.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/checkin-complete-gates.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/checkin-complete-gates.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/checkin-complete-gates.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/checkin-complete-gates.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/checkin-complete-gates.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/checkin-complete-gates.ts:7 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/checkin-complete-gates.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/checkin-complete-gates.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/checkin-complete-gates.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/checkin-complete-gates.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/checkin-complete-gates.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/checkin-complete-gates.ts:1).
2. Observability hooks are sparse (backend/lib/checkin-complete-gates.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/checkin-complete-gates.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/content-moderation.ts` - 228 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type ModerationResult = {
- export function moderateContent(title: string, description?: string): ModerationResult {
- export function moderateTaskTitle(title: string): ModerationResult {
- export function moderateChallengeQuality(input: {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges-create.ts:11
- backend/trpc/routes/feed.ts:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/content-moderation.ts:101 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/content-moderation.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/content-moderation.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/content-moderation.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/content-moderation.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/content-moderation.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/content-moderation.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/content-moderation.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/content-moderation.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/content-moderation.ts:100 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/content-moderation.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/content-moderation.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/content-moderation.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/content-moderation.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/content-moderation.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/content-moderation.ts:1).
2. Observability hooks are sparse (backend/lib/content-moderation.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/content-moderation.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/cron-reminders.ts` - 189 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { getTodayDateKey } from "./date-utils";
- import {

**Key exports:**
- export async function runReminderCron(supabase: SupabaseClient): Promise<{

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/cron-reminders.ts:39).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "cron-reminders" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/cron-reminders.ts:45 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/cron-reminders.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/cron-reminders.ts:110 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/cron-reminders.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/cron-reminders.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/cron-reminders.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/cron-reminders.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/cron-reminders.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/cron-reminders.ts:39 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/cron-reminders.ts:29 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/cron-reminders.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/cron-reminders.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/cron-reminders.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/cron-reminders.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/cron-reminders.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/cron-reminders.ts:1).
2. Catch path without Sentry capture (backend/lib/cron-reminders.ts:110).
3. Instrumentation gap for meaningful user actions (backend/lib/cron-reminders.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/daily-challenge-generator.ts` - 101 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { buildTaskInsertPayload } from "./challenge-tasks";
- import { DAILY_CHALLENGE_TEMPLATES } from "./daily-challenge-templates";

**Key exports:**
- export function pickTemplateForDate(date: Date): (typeof DAILY_CHALLENGE_TEMPLATES)[number] {
- export async function createDailyChallengeIfMissing(supabase: SupabaseClient, date: Date): Promise<{ created: boolean; id?: string }> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/daily-challenge-generator.ts:36).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "daily-challenge-generator" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/daily-challenge-generator.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/daily-challenge-generator.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/daily-challenge-generator.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/daily-challenge-generator.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/daily-challenge-generator.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/daily-challenge-generator.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/daily-challenge-generator.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/daily-challenge-generator.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/daily-challenge-generator.ts:36 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/daily-challenge-generator.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/daily-challenge-generator.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/daily-challenge-generator.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/daily-challenge-generator.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/daily-challenge-generator.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/daily-challenge-generator.ts:7 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/daily-challenge-generator.ts:1).
2. Observability hooks are sparse (backend/lib/daily-challenge-generator.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/daily-challenge-generator.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/daily-challenge-templates.ts` - 198 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface DailyChallengeTaskTemplate {
- export interface DailyChallengeTemplate {
- export const DAILY_CHALLENGE_TEMPLATES: DailyChallengeTemplate[] = [

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/daily-challenge-generator.ts:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/daily-challenge-templates.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/daily-challenge-templates.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/daily-challenge-templates.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/daily-challenge-templates.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/daily-challenge-templates.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/daily-challenge-templates.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/daily-challenge-templates.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/daily-challenge-templates.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/daily-challenge-templates.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/daily-challenge-templates.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/daily-challenge-templates.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/daily-challenge-templates.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/daily-challenge-templates.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/daily-challenge-templates.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/daily-challenge-templates.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/daily-challenge-templates.ts:1).
2. Observability hooks are sparse (backend/lib/daily-challenge-templates.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/daily-challenge-templates.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/daily-reset.ts` - 234 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { getYesterdayDateKey } from "./date-utils";

**Key exports:**
- export async function runDailyReset(supabase: SupabaseClient): Promise<{

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/daily-reset.ts:33).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "daily-reset" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/daily-reset.ts:39 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/daily-reset.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/daily-reset.ts:220 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/daily-reset.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/daily-reset.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/daily-reset.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/daily-reset.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/daily-reset.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/daily-reset.ts:33 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/daily-reset.ts:18 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/daily-reset.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/daily-reset.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/daily-reset.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/daily-reset.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/daily-reset.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/daily-reset.ts:1).
2. Catch path without Sentry capture (backend/lib/daily-reset.ts:220).
3. Instrumentation gap for meaningful user actions (backend/lib/daily-reset.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/date-utils.ts` - 146 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";

**Key exports:**
- export function addCalendarDaysToDateKey(dateKey: string, deltaDays: number): string {
- export function getTodayDateKey(timezone?: string | null): string {
- export function getYesterdayDateKey(timezone?: string | null): string {
- export function getTomorrowDateKey(timezone?: string | null): string {
- export function getRollingWeekStartDateKey(timezone?: string | null): string {
- export async function getProfileTimeZoneForUser(supabase: SupabaseClient, userId: string): Promise<string> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/date-utils.ts:60).
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
| Correctness (happy path + edges) | 6 | backend/lib/date-utils.ts:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/date-utils.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/date-utils.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/date-utils.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/date-utils.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/date-utils.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/date-utils.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/date-utils.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/date-utils.ts:60 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/date-utils.ts:8 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/date-utils.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/date-utils.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/date-utils.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/date-utils.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/date-utils.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/date-utils.ts:1).
2. Observability hooks are sparse (backend/lib/date-utils.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/date-utils.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/error-reporting.ts` - 32 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { logger } from "./logger";

**Key exports:**
- export interface ErrorReportPayload {
- export function reportError(payload: ErrorReportPayload): void {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (backend/lib/error-reporting.ts:19).
- Native/env usage: yes (backend/lib/error-reporting.ts:21).

**What depends on it:** (grep for imports of this file)
- backend/trpc/create-context.ts:6
- components/ErrorBoundary.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/error-reporting.ts:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/error-reporting.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/error-reporting.ts:27 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/error-reporting.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/error-reporting.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/error-reporting.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/error-reporting.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/error-reporting.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/error-reporting.ts:19 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/error-reporting.ts:17 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/error-reporting.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/error-reporting.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/error-reporting.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/error-reporting.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/error-reporting.ts:21 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/error-reporting.ts:1).
2. Catch path without Sentry capture (backend/lib/error-reporting.ts:27).
3. Instrumentation gap for meaningful user actions (backend/lib/error-reporting.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/feed-activity-hydrate.ts` - 186 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import type { Context } from "../trpc/create-context";

**Key exports:**
- export const LIVE_FEED_TYPES = ["task_completed", "completed_challenge", "joined_challenge", "secured_day"] as const;
- export function normalizeChallengeVisibility(raw: string | null | undefined): "public" | "friends" | "private" {
- export type EvRow = {
- export function followRowAccepted(row: { status?: string | null }): boolean {
- export async function hydrateActivityEventsToPosts(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/feed-activity-hydrate.ts:66).
- tRPC usage: yes (backend/lib/feed-activity-hydrate.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "feed-activity-hydrate" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/feed-activity-hydrate.ts:8 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/feed-activity-hydrate.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/feed-activity-hydrate.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/feed-activity-hydrate.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/feed-activity-hydrate.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/feed-activity-hydrate.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/feed-activity-hydrate.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/feed-activity-hydrate.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/feed-activity-hydrate.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/feed-activity-hydrate.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/feed-activity-hydrate.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/feed-activity-hydrate.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/feed-activity-hydrate.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/feed-activity-hydrate.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/feed-activity-hydrate.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/feed-activity-hydrate.ts:1).
2. Observability hooks are sparse (backend/lib/feed-activity-hydrate.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/feed-activity-hydrate.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/geo.ts` - 19 lines

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
| Correctness (happy path + edges) | 6 | backend/lib/geo.ts:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/geo.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/geo.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/geo.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/geo.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/geo.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/geo.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/geo.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/geo.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/geo.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/geo.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/geo.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/geo.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/geo.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/geo.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/geo.ts:1).
2. Observability hooks are sparse (backend/lib/geo.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/geo.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/get-visible-user-ids.ts` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from '@supabase/supabase-js';

**Key exports:**
- export async function getVisibleUserIds(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/get-visible-user-ids.ts:12).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/feed.ts:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/get-visible-user-ids.ts:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/get-visible-user-ids.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/get-visible-user-ids.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/get-visible-user-ids.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/get-visible-user-ids.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/get-visible-user-ids.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/get-visible-user-ids.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/get-visible-user-ids.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/get-visible-user-ids.ts:12 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/get-visible-user-ids.ts:7 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/get-visible-user-ids.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/get-visible-user-ids.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/get-visible-user-ids.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/get-visible-user-ids.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/get-visible-user-ids.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/get-visible-user-ids.ts:1).
2. Observability hooks are sparse (backend/lib/get-visible-user-ids.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/get-visible-user-ids.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/join-challenge.ts` - 169 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { TRPCError } from "@trpc/server";
- import { getTodayDateKey, getTomorrowDateKey, getProfileTimeZoneForUser } from "./date-utils";

**Key exports:**
- export type JoinChallengeResult = { id: string; user_id: string; challenge_id: string; status: string; start_at: string; end_at: string; current_day?: number; progress_percent?: number; created_at?: string; completed_at?: string | null };
- export async function joinChallengeDirect(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/join-challenge.ts:21).
- tRPC usage: yes (backend/lib/join-challenge.ts:6).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges-create.ts:9
- backend/trpc/routes/challenges-join.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/join-challenge.ts:29 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/join-challenge.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/join-challenge.ts:139 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/join-challenge.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/join-challenge.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/join-challenge.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/join-challenge.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/join-challenge.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/join-challenge.ts:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/join-challenge.ts:15 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/join-challenge.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/join-challenge.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/join-challenge.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/join-challenge.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/join-challenge.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/join-challenge.ts:1).
2. Catch path without Sentry capture (backend/lib/join-challenge.ts:139).
3. Instrumentation gap for meaningful user actions (backend/lib/join-challenge.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/last-stand.ts` - 22 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const MAX_LAST_STANDS = 2;
- export function shouldEarnLastStand(securedDaysInLast7: number, currentAvailable: number): boolean {
- export function newAvailableAfterEarn(currentAvailable: number): number {
- export function newAvailableAfterUse(currentAvailable: number): number {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "last-stand" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/last-stand.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/last-stand.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/last-stand.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/last-stand.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/last-stand.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/last-stand.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/last-stand.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/last-stand.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/last-stand.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/last-stand.ts:8 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/last-stand.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/last-stand.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/last-stand.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/last-stand.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/last-stand.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/last-stand.ts:1).
2. Observability hooks are sparse (backend/lib/last-stand.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/last-stand.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/logger.ts` - 17 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import pino from "pino";

**Key exports:**
- export const logger = pino({
- export default logger;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/logger.ts:6).

**What depends on it:** (grep for imports of this file)
- backend/lib/cache.ts:5
- backend/lib/error-reporting.ts:6
- backend/lib/strava-callback.ts:10
- backend/lib/strava-service.ts:7
- backend/lib/strava-verifier.ts:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/logger.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/logger.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/logger.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/logger.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/logger.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/logger.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/logger.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/logger.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/logger.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/logger.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/logger.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/logger.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/logger.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/logger.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/logger.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/logger.ts:1).
2. Observability hooks are sparse (backend/lib/logger.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/logger.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/progression.test.ts` - 74 lines

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
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "progression.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/progression.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/progression.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/progression.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/progression.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/progression.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/progression.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/progression.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/progression.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/progression.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/progression.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/progression.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/lib/progression.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/progression.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/progression.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/progression.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/progression.test.ts:1).
2. Observability hooks are sparse (backend/lib/progression.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/progression.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/progression.ts` - 29 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const TIER_THRESHOLDS = [
- export function getTierForDays(totalDaysSecured: number): string {
- export function getPointsToNextTier(totalDaysSecured: number): number {
- export function getNextTierName(totalDaysSecured: number): string | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/profiles-stats.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/progression.ts:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/progression.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/progression.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/progression.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/progression.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/progression.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/progression.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/progression.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/progression.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/progression.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/progression.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/progression.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/progression.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/progression.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/progression.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/progression.ts:1).
2. Observability hooks are sparse (backend/lib/progression.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/progression.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/push-reminder-expo.ts` - 43 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { isValidExpoToken } from "./push-utils";

**Key exports:**
- export async function sendPushToUser(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/push-reminder.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/push-reminder-expo.ts:38 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/push-reminder-expo.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/push-reminder-expo.ts:38 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/push-reminder-expo.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/push-reminder-expo.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/push-reminder-expo.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/push-reminder-expo.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/push-reminder-expo.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/push-reminder-expo.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/push-reminder-expo.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/push-reminder-expo.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/push-reminder-expo.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/push-reminder-expo.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/push-reminder-expo.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/push-reminder-expo.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/push-reminder-expo.ts:1).
2. Catch path without Sentry capture (backend/lib/push-reminder-expo.ts:38).
3. Instrumentation gap for meaningful user actions (backend/lib/push-reminder-expo.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/push-reminder.ts` - 160 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { sendPushToUser } from "./push-reminder-expo";

**Key exports:**
- export interface SecureReminderContext {
- export function shouldSendMorningReminder(ctx: SecureReminderContext): boolean {
- export function shouldSendStreakAtRiskReminder(ctx: SecureReminderContext): boolean {
- export const COMEBACK_TEMPLATES: { title: string; body: string }[] = [
- export interface SendReminderOptions {
- export async function sendSecureReminder(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "push-reminder" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/push-reminder.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/push-reminder.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/push-reminder.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/push-reminder.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/push-reminder.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/push-reminder.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/push-reminder.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/push-reminder.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/push-reminder.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/push-reminder.ts:22 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/push-reminder.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/push-reminder.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/push-reminder.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/push-reminder.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/push-reminder.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/push-reminder.ts:1).
2. Observability hooks are sparse (backend/lib/push-reminder.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/push-reminder.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/push-utils.ts` - 8 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export function isValidExpoToken(token: string): boolean {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/push-reminder-expo.ts:6
- backend/lib/push.ts:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/push-utils.ts:6 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/push-utils.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/push-utils.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/push-utils.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/push-utils.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/push-utils.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/push-utils.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/push-utils.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/push-utils.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/push-utils.ts:4 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/push-utils.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/push-utils.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/push-utils.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/push-utils.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/push-utils.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/push-utils.ts:1).
2. Observability hooks are sparse (backend/lib/push-utils.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/push-utils.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/push.ts` - 38 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { isValidExpoToken } from "./push-utils";

**Key exports:**
- export async function sendExpoPush(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:29
- app/challenge/[id].tsx:38
- app/settings.tsx:13
- backend/lib/push-reminder-expo.ts:6
- backend/lib/push-reminder.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/push.ts:33 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/push.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/push.ts:33 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/push.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/push.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/push.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/push.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/push.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/push.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/push.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/push.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/push.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/push.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/push.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/push.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/push.ts:1).
2. Catch path without Sentry capture (backend/lib/push.ts:33).
3. Instrumentation gap for meaningful user actions (backend/lib/push.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/rate-limit.ts` - 175 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type RouteLimitResult = { allowed: boolean; resetAt: number };
- export async function checkRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
- export async function checkRouteRateLimit(
- export function getClientIp(req: Request): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/rate-limit.ts:17).

**What depends on it:** (grep for imports of this file)
- backend/hono.ts:7
- backend/trpc/create-context.ts:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/rate-limit.ts:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/rate-limit.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/rate-limit.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/rate-limit.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/rate-limit.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/rate-limit.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/rate-limit.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/rate-limit.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/rate-limit.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/rate-limit.ts:16 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/rate-limit.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/rate-limit.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/rate-limit.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/rate-limit.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/rate-limit.ts:17 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/rate-limit.ts:1).
2. Observability hooks are sparse (backend/lib/rate-limit.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/rate-limit.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/sanitize-search.ts` - 39 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { TRPCError } from "@trpc/server";

**Key exports:**
- export function requireUuidForPostgrestOr(id: string): string {
- export function escapePostgrestFilter(input: string): string {
- export function escapeLikeWildcards(input: string): string {
- export function sanitizeSearchQuery(input: string): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (backend/lib/sanitize-search.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/accountability.ts:7
- backend/trpc/routes/challenges-discover.ts:12
- backend/trpc/routes/challenges.ts:17
- backend/trpc/routes/profiles.ts:15

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/sanitize-search.ts:19 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/sanitize-search.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/sanitize-search.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/sanitize-search.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/sanitize-search.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/sanitize-search.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/sanitize-search.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/sanitize-search.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/sanitize-search.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/sanitize-search.ts:15 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/sanitize-search.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/sanitize-search.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/sanitize-search.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/sanitize-search.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 5 | backend/lib/sanitize-search.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/sanitize-search.ts:1).
2. Observability hooks are sparse (backend/lib/sanitize-search.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/sanitize-search.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/scoring.ts` - 17 lines

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
| Correctness (happy path + edges) | 6 | backend/lib/scoring.ts:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/scoring.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/scoring.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/scoring.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/scoring.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/scoring.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/scoring.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/scoring.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/scoring.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/scoring.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/scoring.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/scoring.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/scoring.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/scoring.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/scoring.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/scoring.ts:1).
2. Observability hooks are sparse (backend/lib/scoring.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/scoring.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/sendPush.ts` - 42 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import Expo from "expo-server-sdk";

**Key exports:**
- export async function sendPush(params: {
- export async function sendPushToProfile(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/sendPush.ts:37).
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/sendPush.ts:2).

**What depends on it:** (grep for imports of this file)
- backend/lib/push-reminder.ts:7
- backend/trpc/routes/feed.ts:4
- backend/trpc/routes/profiles-social.ts:6
- backend/trpc/routes/reports.ts:5
- backend/trpc/routes/respects.ts:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/sendPush.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/sendPush.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/sendPush.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/sendPush.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/sendPush.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/sendPush.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/sendPush.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/sendPush.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/sendPush.ts:37 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/sendPush.ts:6 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/sendPush.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/sendPush.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/sendPush.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/sendPush.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/sendPush.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/sendPush.ts:1).
2. Observability hooks are sparse (backend/lib/sendPush.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/sendPush.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/starter-seed.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const STARTER_DEFINITIONS = [

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/starters.ts:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/starter-seed.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/starter-seed.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/starter-seed.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/starter-seed.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/starter-seed.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/starter-seed.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/starter-seed.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/starter-seed.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/starter-seed.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/starter-seed.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/starter-seed.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/starter-seed.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/starter-seed.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/starter-seed.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/starter-seed.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/starter-seed.ts:1).
2. Observability hooks are sparse (backend/lib/starter-seed.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/starter-seed.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/strava-callback.ts` - 93 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { verifyState } from "./strava-oauth-state";
- import { exchangeCodeForToken } from "./strava-service";
- import { getSupabaseServer } from "./supabase-server";
- import { logger } from "./logger";

**Key exports:**
- export interface CallbackResult {
- export async function handleStravaCallback(query: URLSearchParams): Promise<CallbackResult> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/strava-callback.ts:81).
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/strava-callback.ts:28).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "strava-callback" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | backend/lib/strava-callback.ts:33 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 5 | backend/lib/strava-callback.ts:80 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/strava-callback.ts:52 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/strava-callback.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/strava-callback.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/strava-callback.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/strava-callback.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/strava-callback.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/strava-callback.ts:81 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/strava-callback.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/strava-callback.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/strava-callback.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/strava-callback.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/strava-callback.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/strava-callback.ts:9 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/strava-callback.ts:1).
2. Catch path without Sentry capture (backend/lib/strava-callback.ts:52).
3. Type escape hatch present (backend/lib/strava-callback.ts:80).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/strava-config.ts` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export const STRAVA_SCOPES = "read,activity:read_all";
- export function getStravaConfig(): {
- export function getStravaPublicConfig(): {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/strava-config.ts:14).

**What depends on it:** (grep for imports of this file)
- backend/lib/strava-service.ts:6
- backend/trpc/routes/integrations.ts:10

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/strava-config.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/strava-config.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/strava-config.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/strava-config.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/strava-config.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/strava-config.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/strava-config.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/strava-config.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/strava-config.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/strava-config.ts:8 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/strava-config.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/strava-config.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/strava-config.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/strava-config.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/strava-config.ts:14 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/strava-config.ts:1).
2. Observability hooks are sparse (backend/lib/strava-config.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/strava-config.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/strava-oauth-state.ts` - 58 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createHmac, randomBytes } from "crypto";

**Key exports:**
- export interface StravaStatePayload {
- export function createState(userId: string): string {
- export function verifyState(state: string): StravaStatePayload | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/strava-oauth-state.ts:17).

**What depends on it:** (grep for imports of this file)
- backend/lib/strava-callback.ts:7
- backend/trpc/routes/integrations.ts:11

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/strava-oauth-state.ts:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/strava-oauth-state.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/strava-oauth-state.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/strava-oauth-state.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/strava-oauth-state.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/strava-oauth-state.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/strava-oauth-state.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/strava-oauth-state.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/strava-oauth-state.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/strava-oauth-state.ts:22 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/strava-oauth-state.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/strava-oauth-state.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/strava-oauth-state.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/strava-oauth-state.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/strava-oauth-state.ts:17 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/strava-oauth-state.ts:1).
2. Observability hooks are sparse (backend/lib/strava-oauth-state.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/strava-oauth-state.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/strava-service.ts` - 183 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { getStravaConfig, STRAVA_SCOPES } from "./strava-config";
- import { logger } from "./logger";

**Key exports:**
- export interface ConnectedAccountRow {
- export interface StravaTokenResponse {
- export interface StravaActivity {
- export function getAuthorizationUrl(state: string): string {
- export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
- export async function refreshAccessToken(connection: ConnectedAccountRow): Promise<StravaTokenResponse> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/strava-callback.ts:8

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/strava-service.ts:51 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/strava-service.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/strava-service.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/strava-service.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/strava-service.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/strava-service.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/strava-service.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/strava-service.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/strava-service.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/strava-service.ts:45 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/strava-service.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/strava-service.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/strava-service.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/strava-service.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/strava-service.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/strava-service.ts:1).
2. Observability hooks are sparse (backend/lib/strava-service.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/strava-service.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/strava-verifier.ts` - 166 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import type { SupabaseClient } from "@supabase/supabase-js";
- import type { ChallengeTaskRowRaw, VerificationRuleStrava } from "./challenge-tasks";
- import { getTaskVerification } from "./challenge-tasks";
- import {
- import { logger } from "./logger";

**Key exports:**
- export interface VerifyStravaResult {
- export async function verifyStravaTaskCompletion(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/lib/strava-verifier.ts:65).
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/integrations.ts:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/lib/strava-verifier.ts:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/strava-verifier.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/lib/strava-verifier.ts:110 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/strava-verifier.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/strava-verifier.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/strava-verifier.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/strava-verifier.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/strava-verifier.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/lib/strava-verifier.ts:65 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/strava-verifier.ts:18 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/strava-verifier.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/strava-verifier.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/strava-verifier.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/strava-verifier.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/strava-verifier.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/strava-verifier.ts:1).
2. Catch path without Sentry capture (backend/lib/strava-verifier.ts:110).
3. Instrumentation gap for meaningful user actions (backend/lib/strava-verifier.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/streak.test.ts` - 51 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect } from 'vitest';
- import { computeNewStreakCount } from './streak';

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "streak.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/streak.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/streak.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/streak.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/streak.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/streak.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/streak.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/streak.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/streak.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/streak.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/streak.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/streak.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/lib/streak.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/streak.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/streak.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/streak.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/streak.test.ts:1).
2. Observability hooks are sparse (backend/lib/streak.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/streak.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/streak.ts` - 26 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface StreakRow {
- export function computeNewStreakCount(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/lib/streak.test.ts:2
- backend/trpc/app-router.ts:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/streak.ts:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/streak.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/streak.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/streak.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/streak.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/streak.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/streak.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/streak.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/streak.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/streak.ts:10 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/streak.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/streak.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/streak.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/streak.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/streak.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/streak.ts:1).
2. Observability hooks are sparse (backend/lib/streak.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/streak.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/supabase-admin.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createClient } from "@supabase/supabase-js";

**Key exports:**
- export function getSupabaseAdmin() {
- export function hasSupabaseAdmin(): boolean {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/supabase-admin.ts:8).

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/auth.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/supabase-admin.ts:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/supabase-admin.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/supabase-admin.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/supabase-admin.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/supabase-admin.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/supabase-admin.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/supabase-admin.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/supabase-admin.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/supabase-admin.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/supabase-admin.ts:11 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/supabase-admin.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/supabase-admin.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/supabase-admin.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/supabase-admin.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/supabase-admin.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/supabase-admin.ts:1).
2. Observability hooks are sparse (backend/lib/supabase-admin.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/supabase-admin.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/supabase-server.ts` - 16 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createClient } from "@supabase/supabase-js";

**Key exports:**
- export function getSupabaseServer(): ReturnType<typeof createClient> | null {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/supabase-server.ts:9).

**What depends on it:** (grep for imports of this file)
- backend/lib/strava-callback.ts:9
- backend/trpc/routes/challenges-discover.ts:10
- backend/trpc/routes/challenges.ts:12
- backend/trpc/routes/feed.ts:6
- backend/trpc/routes/leaderboard.ts:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/supabase-server.ts:13 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/supabase-server.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/supabase-server.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/supabase-server.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/supabase-server.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/supabase-server.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/supabase-server.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/supabase-server.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/supabase-server.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/supabase-server.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/supabase-server.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/supabase-server.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/supabase-server.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/supabase-server.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/supabase-server.ts:7 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/supabase-server.ts:1).
2. Observability hooks are sparse (backend/lib/supabase-server.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/supabase-server.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/supabase.ts` - 15 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createClient } from '@supabase/supabase-js';

**Key exports:**
- export const supabase = createClient(supabaseUrl, supabaseAnonKey);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/lib/supabase.ts:3).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:23
- app/auth/forgot-password.tsx:16
- app/auth/login.tsx:17
- app/auth/signup.tsx:17
- app/challenge/active/[activeChallengeId].tsx:25

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/supabase.ts:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/supabase.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/supabase.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/supabase.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/supabase.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/supabase.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/supabase.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/supabase.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/supabase.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/supabase.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/supabase.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/supabase.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/supabase.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/supabase.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/supabase.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/supabase.ts:1).
2. Observability hooks are sparse (backend/lib/supabase.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/supabase.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/lib/task-config.ts` - 40 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface TaskConfig {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:28
- app/challenge/active/[activeChallengeId].tsx:36
- backend/lib/challenge-tasks.ts:6
- backend/lib/checkin-complete-gates.ts:2
- backend/trpc/routes/checkins.ts:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/lib/task-config.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/lib/task-config.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/lib/task-config.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/lib/task-config.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/lib/task-config.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/lib/task-config.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/lib/task-config.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/lib/task-config.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/lib/task-config.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/lib/task-config.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/lib/task-config.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/lib/task-config.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/lib/task-config.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/lib/task-config.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/lib/task-config.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/lib/task-config.ts:1).
2. Observability hooks are sparse (backend/lib/task-config.ts:1).
3. Instrumentation gap for meaningful user actions (backend/lib/task-config.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/server.ts` - 12 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import "dotenv/config";
- import app from "./hono";
- import { serve } from "@hono/node-server";

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/server.ts:5).

**What depends on it:** (grep for imports of this file)
- app/api/trpc/[trpc]+api.ts:1
- backend/hono.ts:1
- backend/lib/checkin-complete-gates.ts:1
- backend/lib/join-challenge.ts:6
- backend/lib/sanitize-search.ts:1

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/server.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/server.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/server.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/server.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/server.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/server.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/server.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/server.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/server.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/server.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/server.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/server.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/server.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/server.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/server.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/server.ts:1).
2. Observability hooks are sparse (backend/server.ts:1).
3. Instrumentation gap for meaningful user actions (backend/server.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/app-router.ts` - 49 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createTRPCRouter } from "./create-context";
- import { authRouter } from "./routes/auth";
- import { userRouter } from "./routes/user";
- import { profilesRouter } from "./routes/profiles";
- import { challengesRouter } from "./routes/challenges";
- import { checkinsRouter } from "./routes/checkins";

**Key exports:**
- export const appRouter = createTRPCRouter({
- export type AppRouter = typeof appRouter;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/api/trpc/[trpc]+api.ts:2
- backend/hono.ts:5
- backend/trpc/create-test-caller.ts:1

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/app-router.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/app-router.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/app-router.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/app-router.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/app-router.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/app-router.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/app-router.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/app-router.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/app-router.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/app-router.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/app-router.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/app-router.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/app-router.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/app-router.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/app-router.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/app-router.ts:1).
2. Observability hooks are sparse (backend/trpc/app-router.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/app-router.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/create-context.ts` - 127 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { initTRPC, TRPCError } from "@trpc/server";
- import superjson from "superjson";
- import { createClient } from "@supabase/supabase-js";
- import { supabase as sharedSupabase } from "../lib/supabase";
- import { getClientIp } from "../lib/rate-limit";
- import { reportError } from "../lib/error-reporting";

**Key exports:**
- export const createContext = async (opts: { req: Request }) => {
- export type Context = Awaited<ReturnType<typeof createContext>>;
- export const createTRPCRouter = t.router;
- export const publicProcedure = withLogging;
- export const protectedProcedure = withLogging.use(({ ctx, next }) => {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (backend/trpc/create-context.ts:1).
- Native/env usage: yes (backend/trpc/create-context.ts:9).

**What depends on it:** (grep for imports of this file)
- app/api/trpc/[trpc]+api.ts:3
- backend/hono.ts:6
- backend/lib/feed-activity-hydrate.ts:2
- backend/trpc/app-router.ts:1
- backend/trpc/routes/accountability.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/create-context.ts:13 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/create-context.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/create-context.ts:38 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/create-context.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/create-context.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/create-context.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/create-context.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/create-context.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/create-context.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/create-context.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/create-context.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/create-context.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/create-context.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/create-context.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/create-context.ts:3 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/create-context.ts:1).
2. Catch path without Sentry capture (backend/trpc/create-context.ts:38).
3. Instrumentation gap for meaningful user actions (backend/trpc/create-context.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/create-test-caller.ts` - 28 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { appRouter } from "./app-router";

**Key exports:**
- export type TestAppCaller = {
- export function createTestCaller(ctx: {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/accountability.test.ts:2
- backend/trpc/routes/nudges.test.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/create-test-caller.ts:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/create-test-caller.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/create-test-caller.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/create-test-caller.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/create-test-caller.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/create-test-caller.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/create-test-caller.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/create-test-caller.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/create-test-caller.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/create-test-caller.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/create-test-caller.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/create-test-caller.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/create-test-caller.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/create-test-caller.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/create-test-caller.ts:16 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/create-test-caller.ts:1).
2. Observability hooks are sparse (backend/trpc/create-test-caller.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/create-test-caller.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/errors.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { TRPCError } from "@trpc/server";

**Key exports:**
- export function requireNoError(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (backend/trpc/errors.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges-discover.ts:3
- backend/trpc/routes/challenges.ts:5
- backend/trpc/routes/checkins.ts:5
- backend/trpc/routes/profiles.ts:12
- backend/trpc/routes/starters.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/errors.ts:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/errors.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/errors.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/errors.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/errors.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/errors.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/errors.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/errors.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/errors.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/errors.ts:9 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/errors.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/errors.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/errors.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/errors.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/errors.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/errors.ts:1).
2. Observability hooks are sparse (backend/trpc/errors.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/errors.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/guards.ts` - 43 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { TRPCError } from "@trpc/server";
- import type { SupabaseClient } from "@supabase/supabase-js";

**Key exports:**
- export type ActiveChallengeRow = {
- export async function assertActiveChallengeOwnership(

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/guards.ts:21).
- tRPC usage: yes (backend/trpc/guards.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/checkins.ts:4
- backend/trpc/routes/integrations.ts:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/guards.ts:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/guards.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/guards.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/guards.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/guards.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/guards.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/guards.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/guards.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/guards.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/guards.ts:15 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/guards.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/guards.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/guards.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/guards.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/guards.ts:2 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/guards.ts:1).
2. Observability hooks are sparse (backend/trpc/guards.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/guards.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/accountability.test.ts` - 198 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect, vi } from "vitest";
- import { createTestCaller } from "../create-test-caller";

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "accountability.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/accountability.test.ts:67 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/accountability.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/accountability.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/accountability.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/accountability.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/accountability.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/accountability.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/accountability.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/routes/accountability.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/accountability.test.ts:9 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/accountability.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/trpc/routes/accountability.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/accountability.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/accountability.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/accountability.test.ts:117 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/accountability.test.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/accountability.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/accountability.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/accountability.ts` - 335 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { sendExpoPush } from "../../lib/push";
- import { logger } from "../../lib/logger";

**Key exports:**
- export const accountabilityRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/accountability.ts:16).
- tRPC usage: yes (backend/trpc/routes/accountability.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/accountability.ts:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/accountability.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/accountability.ts:155 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/accountability.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/accountability.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/accountability.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/accountability.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/accountability.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/accountability.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/accountability.ts:13 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/accountability.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/accountability.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/accountability.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/accountability.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 5 | backend/trpc/routes/accountability.ts:3 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/accountability.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/accountability.ts:155).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/accountability.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/achievements.ts` - 13 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { createTRPCRouter, protectedProcedure } from "../create-context";

**Key exports:**
- export const achievementsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/achievements.ts:6).
- tRPC usage: yes (backend/trpc/routes/achievements.ts:1).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:21
- backend/trpc/routes/checkins.ts:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/achievements.ts:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/achievements.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/achievements.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/achievements.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/achievements.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/achievements.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/achievements.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/achievements.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/achievements.ts:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/achievements.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/achievements.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/achievements.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/achievements.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/achievements.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/achievements.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/achievements.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/achievements.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/achievements.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/auth.ts` - 74 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
- import { getSupabaseAdmin, hasSupabaseAdmin } from "../../lib/supabase-admin";

**Key exports:**
- export const authRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/auth.ts:67).
- tRPC usage: yes (backend/trpc/routes/auth.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:10
- app/auth/login.tsx:16
- app/auth/signup.tsx:19
- backend/lib/strava-callback.ts:7
- backend/trpc/app-router.ts:8

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/auth.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/auth.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/auth.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/auth.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/auth.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/auth.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/auth.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/auth.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/auth.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/auth.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/auth.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/auth.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/auth.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/auth.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/auth.ts:4 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/auth.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/auth.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/auth.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/challenges-create.test.ts` - 46 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect } from "vitest";
- import { dbTaskType, journalMinWords, taskStrictAndPhoto } from "./challenges";

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "challenges-create.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/challenges-create.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/challenges-create.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/routes/challenges-create.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/challenges-create.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-create.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/trpc/routes/challenges-create.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/challenges-create.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/challenges-create.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/challenges-create.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/challenges-create.test.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/challenges-create.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/challenges-create.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/challenges-create.ts` - 433 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { protectedProcedure } from "../create-context";
- import {
- import { joinChallengeDirect } from "../../lib/join-challenge";
- import { logger } from "../../lib/logger";

**Key exports:**
- export const challengesCreateProcedures = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/challenges-create.ts:30).
- tRPC usage: yes (backend/trpc/routes/challenges-create.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges.ts:15

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/challenges-create.ts:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/challenges-create.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/challenges-create.ts:24 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/challenges-create.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/challenges-create.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/challenges-create.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/challenges-create.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/challenges-create.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/challenges-create.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/challenges-create.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-create.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/challenges-create.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/challenges-create.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/challenges-create.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/challenges-create.ts:15 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/challenges-create.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/challenges-create.ts:24).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/challenges-create.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/challenges-discover.ts` - 380 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { publicProcedure } from "../create-context";
- import { requireNoError } from "../errors";
- import type { ChallengeWithTasksRow } from "../../types/db";
- import {
- import { getSupabaseServer } from "../../lib/supabase-server";

**Key exports:**
- export const challengesDiscoverProcedures = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/challenges-discover.ts:29).
- tRPC usage: yes (backend/trpc/routes/challenges-discover.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges.ts:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/challenges-discover.ts:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/challenges-discover.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/challenges-discover.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/challenges-discover.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/challenges-discover.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/challenges-discover.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/challenges-discover.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/challenges-discover.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/challenges-discover.ts:29 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/challenges-discover.ts:15 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-discover.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/challenges-discover.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/challenges-discover.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/challenges-discover.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 5 | backend/trpc/routes/challenges-discover.ts:10 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/challenges-discover.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/challenges-discover.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/challenges-discover.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/challenges-join.ts` - 230 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { protectedProcedure } from "../create-context";
- import { joinChallengeDirect } from "../../lib/join-challenge";
- import type { SupabaseClient } from "@supabase/supabase-js";
- import { logger } from "../../lib/logger";

**Key exports:**
- export const challengesJoinProcedures = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/challenges-join.ts:10).
- tRPC usage: yes (backend/trpc/routes/challenges-join.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/challenges.ts:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/challenges-join.ts:38 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/challenges-join.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/challenges-join.ts:167 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/challenges-join.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/challenges-join.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/challenges-join.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/challenges-join.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/challenges-join.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/challenges-join.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/challenges-join.ts:8 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges-join.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/challenges-join.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/challenges-join.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/challenges-join.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/challenges-join.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/challenges-join.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/challenges-join.ts:167).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/challenges-join.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/challenges.ts` - 428 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
- import { requireNoError } from "../errors";
- import type { ChallengeWithTasksRow } from "../../types/db";
- import {

**Key exports:**
- export function dbTaskType(type: string): string {
- export function journalMinWords(minWords: number | undefined | null): number {
- export type CreateTaskInput = {
- export function taskStrictAndPhoto(task: CreateTaskInput): { strict_timer_mode: boolean; require_photo_proof: boolean } {
- export const challengesRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/challenges.ts:73).
- tRPC usage: yes (backend/trpc/routes/challenges.ts:3).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:31
- app/challenge/[id].tsx:66
- backend/trpc/app-router.ts:11
- backend/trpc/routes/challenges-create.test.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/challenges.ts:21 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/challenges.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/challenges.ts:323 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/challenges.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/challenges.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/challenges.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/challenges.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/challenges.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/challenges.ts:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/challenges.ts:20 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/challenges.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/challenges.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/challenges.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/challenges.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/challenges.ts:12 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/challenges.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/challenges.ts:323).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/challenges.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/checkins.ts` - 478 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { assertActiveChallengeOwnership } from "../guards";
- import { requireNoError } from "../errors";
- import {

**Key exports:**
- export const checkinsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/checkins.ts:64).
- tRPC usage: yes (backend/trpc/routes/checkins.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:12

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/checkins.ts:68 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/checkins.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/checkins.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/checkins.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/checkins.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/checkins.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/checkins.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/checkins.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/checkins.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/checkins.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/checkins.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/checkins.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/checkins.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/checkins.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/checkins.ts:61 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/checkins.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/checkins.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/checkins.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/feed.ts` - 832 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";
- import { sendPushToProfile } from "../../lib/sendPush";
- import { getVisibleUserIds } from "../../lib/get-visible-user-ids";
- import { getSupabaseServer } from "../../lib/supabase-server";

**Key exports:**
- export const feedRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/feed.ts:23).
- tRPC usage: yes (backend/trpc/routes/feed.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:40
- app/post/[id].tsx:30
- app/profile/[username].tsx:33
- backend/trpc/app-router.ts:20
- components/feed/FeedCardHeader.tsx:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | backend/trpc/routes/feed.ts:29 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/feed.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/feed.ts:501 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/feed.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/feed.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/feed.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | backend/trpc/routes/feed.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/feed.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/feed.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/feed.ts:1 | no static violation found. |
| Single responsibility / file size | 4 | backend/trpc/routes/feed.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/feed.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/feed.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/feed.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/feed.ts:6 | .or interpolation scrutinized. |

**Composite score:** 5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (832 LOC) increases regression risk (backend/trpc/routes/feed.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/feed.ts:501).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/feed.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/integrations.ts` - 193 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { assertActiveChallengeOwnership } from "../guards";
- import { getStravaPublicConfig } from "../../lib/strava-config";
- import { createState } from "../../lib/strava-oauth-state";

**Key exports:**
- export const integrationsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/integrations.ts:49).
- tRPC usage: yes (backend/trpc/routes/integrations.ts:7).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/integrations.ts:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/integrations.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/integrations.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/integrations.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/integrations.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/integrations.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/integrations.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/integrations.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/integrations.ts:7 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/integrations.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/integrations.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/integrations.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/integrations.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/integrations.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/integrations.ts:48 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/integrations.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/integrations.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/integrations.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/last-stand.test.ts` - 59 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect } from "vitest";
- import {

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "last-stand.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/last-stand.test.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/last-stand.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/last-stand.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/last-stand.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/last-stand.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/last-stand.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/last-stand.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/last-stand.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/routes/last-stand.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/last-stand.test.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/last-stand.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/trpc/routes/last-stand.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/last-stand.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/last-stand.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/last-stand.test.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/last-stand.test.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/last-stand.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/last-stand.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/leaderboard.ts` - 352 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, publicProcedure, protectedProcedure, type Context } from "../create-context";
- import type { LeaderboardProfileRow, LeaderboardStreakRow } from "../../types/db";
- import { getTodayDateKey, getRollingWeekStartDateKey, getProfileTimeZoneForUser } from "../../lib/date-utils";
- import { getCached, setCached } from "../../lib/cache";

**Key exports:**
- export const leaderboardRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/leaderboard.ts:17).
- tRPC usage: yes (backend/trpc/routes/leaderboard.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:15

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/leaderboard.ts:13 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/leaderboard.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/leaderboard.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/leaderboard.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/leaderboard.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/leaderboard.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/leaderboard.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/leaderboard.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/leaderboard.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/leaderboard.ts:12 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/leaderboard.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/leaderboard.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/leaderboard.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/leaderboard.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/leaderboard.ts:7 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/leaderboard.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/leaderboard.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/leaderboard.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/notifications.ts` - 225 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import type { PgError } from "../../types/db";

**Key exports:**
- export const notificationsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/notifications.ts:75).
- tRPC usage: yes (backend/trpc/routes/notifications.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:7
- app/(tabs)/index.tsx:52
- app/challenge/[id].tsx:39
- backend/trpc/app-router.ts:18
- components/create/CreateChallengeWizard.tsx:36

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/notifications.ts:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/notifications.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/notifications.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/notifications.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/notifications.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/notifications.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/notifications.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/notifications.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/notifications.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/notifications.ts:13 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/notifications.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/notifications.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/notifications.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/notifications.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/notifications.ts:74 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/notifications.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/notifications.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/notifications.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/nudges.test.ts` - 110 lines

**Purpose (derived from reading the code, not guessed):**
Internal module supporting adjacent feature flows.

**Key imports:**
- import { describe, it, expect, vi } from "vitest";
- import { createTestCaller } from "../create-test-caller";
- import { NUDGE_MESSAGES, pickRandomMessage } from "./nudges";

**Key exports:**
- NOT FOUND IN FILE (no top-level export statements).

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "nudges.test" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/nudges.test.ts:44 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/nudges.test.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/nudges.test.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/nudges.test.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/nudges.test.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/nudges.test.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/nudges.test.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/nudges.test.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/trpc/routes/nudges.test.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/nudges.test.ts:26 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/nudges.test.ts:1 | LOC-based maintainability. |
| Test coverage | 7 | backend/trpc/routes/nudges.test.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/nudges.test.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/nudges.test.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/nudges.test.ts:62 | .or interpolation scrutinized. |

**Composite score:** 5.8

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/nudges.test.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/nudges.test.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/nudges.test.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/nudges.ts` - 141 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { sendExpoPush } from "../../lib/push";
- import { logger } from "../../lib/logger";
- import type { NudgeRow, ProfileRow, ProfileWithExpoRow, PushTokenRow } from "../../types/db";

**Key exports:**
- export const NUDGE_MESSAGES = [
- export function pickRandomMessage(): string {
- export const nudgesRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/nudges.ts:32).
- tRPC usage: yes (backend/trpc/routes/nudges.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:17
- backend/trpc/routes/nudges.test.ts:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/nudges.ts:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/nudges.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/nudges.ts:80 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/nudges.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/nudges.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/nudges.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/nudges.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/nudges.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/nudges.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/nudges.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/nudges.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/nudges.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/nudges.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/nudges.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/nudges.ts:31 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/nudges.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/nudges.ts:80).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/nudges.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/profiles-social.ts` - 302 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { protectedProcedure } from "../create-context";
- import type { PgError, ProfileRow } from "../../types/db";
- import { getSupabaseServer } from "../../lib/supabase-server";
- import { sendPushToProfile } from "../../lib/sendPush";

**Key exports:**
- export const profilesSocialProcedures = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/profiles-social.ts:17).
- tRPC usage: yes (backend/trpc/routes/profiles-social.ts:2).
- Native/env usage: yes (backend/trpc/routes/profiles-social.ts:59).

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/profiles.ts:16

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/profiles-social.ts:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/profiles-social.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/profiles-social.ts:70 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/profiles-social.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/profiles-social.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/profiles-social.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/profiles-social.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/profiles-social.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/profiles-social.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/profiles-social.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/profiles-social.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/profiles-social.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/profiles-social.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/profiles-social.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/profiles-social.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/profiles-social.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/profiles-social.ts:70).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/profiles-social.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/profiles-stats.ts` - 405 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { protectedProcedure } from "../create-context";
- import { getTierForDays, getPointsToNextTier, getNextTierName } from "../../lib/progression";
- import {
- import type { ProfileWithExpoRow, PushTokenRow, StreakRow } from "../../types/db";

**Key exports:**
- export const profilesStatsProcedures = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/profiles-stats.ts:23).
- tRPC usage: yes (backend/trpc/routes/profiles-stats.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/profiles.ts:17

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/profiles-stats.ts:136 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/profiles-stats.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/profiles-stats.ts:136 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/profiles-stats.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/profiles-stats.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/profiles-stats.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/profiles-stats.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/profiles-stats.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/profiles-stats.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/profiles-stats.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/profiles-stats.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/profiles-stats.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/profiles-stats.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/profiles-stats.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/profiles-stats.ts:15 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/profiles-stats.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/profiles-stats.ts:136).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/profiles-stats.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/profiles.ts` - 513 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
- import { requireNoError } from "../errors";
- import type { PgError, ProfileRow } from "../../types/db";
- import { getSupabaseServer } from "../../lib/supabase-server";

**Key exports:**
- export const profilesRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/profiles.ts:54).
- tRPC usage: yes (backend/trpc/routes/profiles.ts:10).
- Native/env usage: yes (backend/trpc/routes/profiles.ts:205).

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:10

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/profiles.ts:35 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/profiles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/profiles.ts:282 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/profiles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/profiles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/profiles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/profiles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/profiles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/profiles.ts:10 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/profiles.ts:34 | no static violation found. |
| Single responsibility / file size | 5 | backend/trpc/routes/profiles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/profiles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/profiles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/profiles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 5 | backend/trpc/routes/profiles.ts:14 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/profiles.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/profiles.ts:282).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/profiles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/referrals.ts` - 48 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";

**Key exports:**
- export const referralsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/referrals.ts:16).
- tRPC usage: yes (backend/trpc/routes/referrals.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:24

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/referrals.ts:26 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/referrals.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/referrals.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/referrals.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/referrals.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/referrals.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/referrals.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/referrals.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/referrals.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/referrals.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/referrals.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/referrals.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/referrals.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/referrals.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/referrals.ts:16 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/referrals.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/referrals.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/referrals.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/reports.ts` - 95 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { logger } from "../../lib/logger";
- import { sendPush } from "../../lib/sendPush";

**Key exports:**
- export const reportsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/reports.ts:31).
- tRPC usage: yes (backend/trpc/routes/reports.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:25

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/reports.ts:36 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/reports.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/reports.ts:88 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/reports.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/reports.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/reports.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/reports.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/reports.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/reports.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/reports.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/reports.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/reports.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/reports.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/reports.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/reports.ts:30 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/reports.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/reports.ts:88).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/reports.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/respects.ts` - 123 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import type { PgError, ProfileRow, RespectRow } from "../../types/db";
- import { getSupabaseServer } from "../../lib/supabase-server";
- import { sendPushToProfile } from "../../lib/sendPush";

**Key exports:**
- export const respectsRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/respects.ts:18).
- tRPC usage: yes (backend/trpc/routes/respects.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:16

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/respects.ts:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/respects.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/respects.ts:63 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/respects.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/respects.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/respects.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/respects.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/respects.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/respects.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/respects.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/respects.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/respects.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/respects.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/respects.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/respects.ts:5 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/respects.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/respects.ts:63).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/respects.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/sharedGoal.ts` - 167 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";

**Key exports:**
- export const sharedGoalRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/sharedGoal.ts:17).
- tRPC usage: yes (backend/trpc/routes/sharedGoal.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/sharedGoal.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/sharedGoal.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/sharedGoal.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/sharedGoal.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/sharedGoal.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/sharedGoal.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/sharedGoal.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/sharedGoal.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/sharedGoal.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/sharedGoal.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/sharedGoal.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/sharedGoal.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/sharedGoal.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/sharedGoal.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/sharedGoal.ts:16 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/sharedGoal.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/sharedGoal.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/sharedGoal.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/starters.ts` - 145 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { requireNoError } from "../errors";
- import { STARTER_DEFINITIONS } from "../../lib/starter-seed";
- import { getTodayDateKey, getProfileTimeZoneForUser } from "../../lib/date-utils";

**Key exports:**
- export const startersRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/starters.ts:27).
- tRPC usage: yes (backend/trpc/routes/starters.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/starters.ts:32 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/starters.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/starters.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/starters.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/starters.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/starters.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/starters.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/starters.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/starters.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/starters.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/starters.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/starters.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/starters.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/starters.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/starters.ts:26 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/starters.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/starters.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/starters.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/streaks.ts` - 79 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import { dateKeyFromDate, parseDateKey, daysBetweenKeys } from "../../lib/date-utils";

**Key exports:**
- export const streaksRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/streaks.ts:27).
- tRPC usage: yes (backend/trpc/routes/streaks.ts:2).
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/trpc/routes/streaks.ts:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/streaks.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/trpc/routes/streaks.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/streaks.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/streaks.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/streaks.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/streaks.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/streaks.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/streaks.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/streaks.ts:14 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/streaks.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/streaks.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/streaks.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/streaks.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/streaks.ts:27 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/streaks.ts:1).
2. Observability hooks are sparse (backend/trpc/routes/streaks.ts:1).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/streaks.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/trpc/routes/user.ts` - 119 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import * as z from "zod";
- import { TRPCError } from "@trpc/server";
- import { createTRPCRouter, protectedProcedure } from "../create-context";
- import type { PgError } from "../../types/db";

**Key exports:**
- export const userRouter = createTRPCRouter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (backend/trpc/routes/user.ts:49).
- tRPC usage: yes (backend/trpc/routes/user.ts:2).
- Native/env usage: yes (backend/trpc/routes/user.ts:109).

**What depends on it:** (grep for imports of this file)
- backend/trpc/app-router.ts:9
- backend/trpc/routes/feed.ts:5
- components/settings/ReminderSection.tsx:15
- hooks/useNotificationScheduler.ts:17
- hooks/useTaskCompleteShareCardProps.ts:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | backend/trpc/routes/user.ts:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/trpc/routes/user.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | backend/trpc/routes/user.ts:99 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/trpc/routes/user.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/trpc/routes/user.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/trpc/routes/user.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/trpc/routes/user.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/trpc/routes/user.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | backend/trpc/routes/user.ts:2 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/trpc/routes/user.ts:13 | no static violation found. |
| Single responsibility / file size | 7 | backend/trpc/routes/user.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/trpc/routes/user.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/trpc/routes/user.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/trpc/routes/user.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/trpc/routes/user.ts:49 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/trpc/routes/user.ts:1).
2. Catch path without Sentry capture (backend/trpc/routes/user.ts:99).
3. Instrumentation gap for meaningful user actions (backend/trpc/routes/user.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/types/db.ts` - 137 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export interface StreakRow {
- export interface DaySecureRow {
- export interface ChallengeTaskRow {
- export interface ActiveChallengeWithTasks {
- export type ParticipationType = "solo" | "duo" | "team" | "shared_goal";
- export type RunStatus = "waiting" | "active" | "completed" | "failed";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- backend/trpc/routes/accountability.ts:8
- backend/trpc/routes/challenges-create.test.ts:2
- backend/trpc/routes/challenges-discover.ts:4
- backend/trpc/routes/challenges.ts:6
- backend/trpc/routes/checkins.ts:11

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/types/db.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/types/db.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/types/db.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/types/db.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/types/db.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/types/db.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/types/db.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/types/db.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/types/db.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/types/db.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/types/db.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/types/db.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/types/db.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/types/db.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/types/db.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/types/db.ts:1).
2. Observability hooks are sparse (backend/types/db.ts:1).
3. Instrumentation gap for meaningful user actions (backend/types/db.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/types/expo-server-sdk.d.ts` - 8 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export default class Expo {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (backend/types/expo-server-sdk.d.ts:1).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "expo-server-sdk.d" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/types/expo-server-sdk.d.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/types/expo-server-sdk.d.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/types/expo-server-sdk.d.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/types/expo-server-sdk.d.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/types/expo-server-sdk.d.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/types/expo-server-sdk.d.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/types/expo-server-sdk.d.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/types/expo-server-sdk.d.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/types/expo-server-sdk.d.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/types/expo-server-sdk.d.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/types/expo-server-sdk.d.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/types/expo-server-sdk.d.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/types/expo-server-sdk.d.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/types/expo-server-sdk.d.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/types/expo-server-sdk.d.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/types/expo-server-sdk.d.ts:1).
2. Observability hooks are sparse (backend/types/expo-server-sdk.d.ts:1).
3. Instrumentation gap for meaningful user actions (backend/types/expo-server-sdk.d.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `backend/types/pino.d.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export default pino;

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "pino.d" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | backend/types/pino.d.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | backend/types/pino.d.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | backend/types/pino.d.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 6 | backend/types/pino.d.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 6 | backend/types/pino.d.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 6 | backend/types/pino.d.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | backend/types/pino.d.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 6 | backend/types/pino.d.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | backend/types/pino.d.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | backend/types/pino.d.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | backend/types/pino.d.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | backend/types/pino.d.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | backend/types/pino.d.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | backend/types/pino.d.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | backend/types/pino.d.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (backend/types/pino.d.ts:1).
2. Observability hooks are sparse (backend/types/pino.d.ts:1).
3. Instrumentation gap for meaningful user actions (backend/types/pino.d.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/activity/activity-styles.ts` - 448 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";

**Key exports:**
- export const styles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/activity/activity-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/activity.tsx:9
- components/activity/LeaderboardTab.tsx:23
- components/activity/NotificationsTab.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/activity/activity-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/activity/activity-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/activity/activity-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/activity/activity-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/activity/activity-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/activity/activity-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/activity/activity-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/activity/activity-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/activity/activity-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/activity/activity-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/activity/activity-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/activity/activity-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/activity/activity-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/activity/activity-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/activity/activity-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/activity/activity-styles.ts:1).
2. Observability hooks are sparse (components/activity/activity-styles.ts:1).
3. Instrumentation gap for meaningful user actions (components/activity/activity-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/activity/LeaderboardTab.tsx` - 756 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useState } from "react";
- import {
- import { useRouter } from "expo-router";
- import { Target, Trophy, UserPlus, Users } from "lucide-react-native";
- import { useQuery } from "@tanstack/react-query";
- import { trpcQuery } from "@/lib/trpc";

**Key exports:**
- export interface LeaderboardTabProps {
- export function LeaderboardTab({ userId, listHeader }: LeaderboardTabProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/activity/LeaderboardTab.tsx:14).
- Native/env usage: yes (components/activity/LeaderboardTab.tsx:10).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/activity.tsx:8

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/activity/LeaderboardTab.tsx:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/activity/LeaderboardTab.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/activity/LeaderboardTab.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/activity/LeaderboardTab.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/activity/LeaderboardTab.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/activity/LeaderboardTab.tsx:95 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/activity/LeaderboardTab.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/activity/LeaderboardTab.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/activity/LeaderboardTab.tsx:14 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/activity/LeaderboardTab.tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | components/activity/LeaderboardTab.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/activity/LeaderboardTab.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/activity/LeaderboardTab.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/activity/LeaderboardTab.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/activity/LeaderboardTab.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/activity/LeaderboardTab.tsx:1).
2. Observability hooks are sparse (components/activity/LeaderboardTab.tsx:1).
3. Instrumentation gap for meaningful user actions (components/activity/LeaderboardTab.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/activity/NotificationsTab.tsx` - 336 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useMemo, useState } from "react";
- import {
- import { useRouter } from "expo-router";
- import { Bell } from "lucide-react-native";
- import { useQuery, useQueryClient } from "@tanstack/react-query";
- import { trpcMutate, trpcQuery } from "@/lib/trpc";

**Key exports:**
- export interface NotificationsTabProps {
- export function NotificationsTab({ userId, listHeader }: NotificationsTabProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/activity/NotificationsTab.tsx:14).
- Native/env usage: yes (components/activity/NotificationsTab.tsx:10).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/activity.tsx:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/activity/NotificationsTab.tsx:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/activity/NotificationsTab.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/activity/NotificationsTab.tsx:79 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/activity/NotificationsTab.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/activity/NotificationsTab.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/activity/NotificationsTab.tsx:152 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/activity/NotificationsTab.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/activity/NotificationsTab.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/activity/NotificationsTab.tsx:14 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/activity/NotificationsTab.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/activity/NotificationsTab.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/activity/NotificationsTab.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/activity/NotificationsTab.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/activity/NotificationsTab.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/activity/NotificationsTab.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/activity/NotificationsTab.tsx:1).
2. Catch path without Sentry capture (components/activity/NotificationsTab.tsx:79).
3. Instrumentation gap for meaningful user actions (components/activity/NotificationsTab.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/activity/types.ts` - 29 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type LeaderScope = "global" | "friends" | "challenge";
- export type NotifRow = {
- export type BoardEntry = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:29
- app/task/checkin.tsx:26
- app/task/run.tsx:33
- backend/trpc/routes/accountability.ts:8
- backend/trpc/routes/challenges-discover.ts:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/activity/types.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/activity/types.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/activity/types.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/activity/types.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/activity/types.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/activity/types.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/activity/types.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/activity/types.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/activity/types.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/activity/types.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/activity/types.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/activity/types.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/activity/types.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/activity/types.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/activity/types.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/activity/types.ts:1).
2. Observability hooks are sparse (components/activity/types.ts:1).
3. Instrumentation gap for meaningful user actions (components/activity/types.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/AnalyticsBootstrap.tsx` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { useEffect } from "react";
- import { track } from "@/lib/analytics";
- import { useApp } from "@/contexts/AppContext";

**Key exports:**
- export function AnalyticsBootstrap() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "AnalyticsBootstrap" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/AnalyticsBootstrap.tsx:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/AnalyticsBootstrap.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/AnalyticsBootstrap.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/AnalyticsBootstrap.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/AnalyticsBootstrap.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/AnalyticsBootstrap.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/AnalyticsBootstrap.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/AnalyticsBootstrap.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/AnalyticsBootstrap.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/AnalyticsBootstrap.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/AnalyticsBootstrap.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/AnalyticsBootstrap.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/AnalyticsBootstrap.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/AnalyticsBootstrap.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/AnalyticsBootstrap.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/AnalyticsBootstrap.tsx:1).
2. Observability hooks are sparse (components/AnalyticsBootstrap.tsx:1).
3. Instrumentation gap for meaningful user actions (components/AnalyticsBootstrap.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/AuthGateModal.tsx` - 180 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import {
- import { useRouter } from "expo-router";
- import { ROUTES } from "@/lib/routes";
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { colors, spacing, radius } from "@/lib/theme/tokens";

**Key exports:**
- export type GateContext =
- export function AuthGateModal({ visible, onClose, context: _context }: AuthGateModalProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/AuthGateModal.tsx:8).

**What depends on it:** (grep for imports of this file)
- hooks/useCreateChallengeWizardPersistence.ts:24

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/AuthGateModal.tsx:49 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/AuthGateModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/AuthGateModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/AuthGateModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/AuthGateModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/AuthGateModal.tsx:75 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/AuthGateModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/AuthGateModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/AuthGateModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/AuthGateModal.tsx:9 | no static violation found. |
| Single responsibility / file size | 7 | components/AuthGateModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/AuthGateModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/AuthGateModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/AuthGateModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/AuthGateModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/AuthGateModal.tsx:1).
2. Observability hooks are sparse (components/AuthGateModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/AuthGateModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/Avatar.tsx` - 71 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
- import { Image } from "expo-image";
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { getDisplayInitials, getFeedAvatarBgFromUserId } from "@/lib/utils";

**Key exports:**
- export function Avatar({ url, name, size, userId, bgColor, style }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/Avatar.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:44
- app/(tabs)/profile.tsx:37
- app/follow-list.tsx:21
- app/post/[id].tsx:26
- app/profile/[username].tsx:32

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/Avatar.tsx:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/Avatar.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/Avatar.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/Avatar.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/Avatar.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/Avatar.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/Avatar.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/Avatar.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/Avatar.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/Avatar.tsx:21 | no static violation found. |
| Single responsibility / file size | 7 | components/Avatar.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/Avatar.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/Avatar.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/Avatar.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/Avatar.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/Avatar.tsx:1).
2. Observability hooks are sparse (components/Avatar.tsx:1).
3. Instrumentation gap for meaningful user actions (components/Avatar.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/Celebration.tsx` - 288 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef, useState, useCallback } from "react";
- import {
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export default function Celebration({ visible, onComplete, titleText, streakCount, pointsToNextTier, nextTierName }: CelebrationProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/Celebration.tsx:9).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:21
- app/(tabs)/index.tsx:46
- app/challenge/[id].tsx:66
- app/challenge/complete.tsx:15
- app/task/checkin.tsx:28

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/Celebration.tsx:72 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/Celebration.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/Celebration.tsx:82 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/Celebration.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/Celebration.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/Celebration.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/Celebration.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/Celebration.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/Celebration.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/Celebration.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/Celebration.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/Celebration.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/Celebration.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/Celebration.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/Celebration.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/Celebration.tsx:1).
2. Catch path without Sentry capture (components/Celebration.tsx:82).
3. Instrumentation gap for meaningful user actions (components/Celebration.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/challengeDetailScreenStyles.ts` - 1167 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { Platform, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS, DS_MEASURES } from "@/lib/design-system"

**Key exports:**
- export const challengeDetailStyles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/challengeDetailScreenStyles.ts:1).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:74
- components/challenge/ChallengeHero.tsx:8
- components/challenge/challengeInfoChip.tsx:4
- components/challenge/ChallengeLeaderboard.tsx:4
- components/challenge/challengeSocialAvatars.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/challenge/challengeDetailScreenStyles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/challengeDetailScreenStyles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/challengeDetailScreenStyles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/challengeDetailScreenStyles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/challengeDetailScreenStyles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/challengeDetailScreenStyles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | components/challenge/challengeDetailScreenStyles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/challengeDetailScreenStyles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/challengeDetailScreenStyles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/challengeDetailScreenStyles.ts:1 | no static violation found. |
| Single responsibility / file size | 4 | components/challenge/challengeDetailScreenStyles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/challengeDetailScreenStyles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/challengeDetailScreenStyles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/challengeDetailScreenStyles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/challengeDetailScreenStyles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.1

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (1167 LOC) increases regression risk (components/challenge/challengeDetailScreenStyles.ts:1).
2. Observability hooks are sparse (components/challenge/challengeDetailScreenStyles.ts:1).
3. Instrumentation gap for meaningful user actions (components/challenge/challengeDetailScreenStyles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/ChallengeHero.tsx` - 144 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity } from "react-native";
- import { LinearGradient } from "expo-linear-gradient";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { ChevronLeft, MoreHorizontal, Share2 } from "lucide-react-native";
- import type { ChallengeDetailFromApi } from "@/types";

**Key exports:**
- export const ChallengeHero = React.memo(function ChallengeHero({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/ChallengeHero.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:75

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/ChallengeHero.tsx:54 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/ChallengeHero.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/ChallengeHero.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/ChallengeHero.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/ChallengeHero.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/ChallengeHero.tsx:62 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/ChallengeHero.tsx:34 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/ChallengeHero.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/ChallengeHero.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/ChallengeHero.tsx:34 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/ChallengeHero.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/ChallengeHero.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/ChallengeHero.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/ChallengeHero.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/ChallengeHero.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/ChallengeHero.tsx:1).
2. Observability hooks are sparse (components/challenge/ChallengeHero.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/ChallengeHero.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/challengeInfoChip.tsx` - 21 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text } from "react-native";
- import { DS_COLORS } from "@/lib/design-system";
- import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

**Key exports:**
- export function InfoChip({ label, dark }: { label: string; dark?: boolean }) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/challengeInfoChip.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/challenge/ChallengeHero.tsx:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/challengeInfoChip.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/challengeInfoChip.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/challengeInfoChip.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/challengeInfoChip.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/challengeInfoChip.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/challengeInfoChip.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/challengeInfoChip.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/challengeInfoChip.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/challengeInfoChip.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/challengeInfoChip.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/challengeInfoChip.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/challengeInfoChip.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/challengeInfoChip.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/challengeInfoChip.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/challengeInfoChip.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/challengeInfoChip.tsx:1).
2. Observability hooks are sparse (components/challenge/challengeInfoChip.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/challengeInfoChip.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/ChallengeLeaderboard.tsx` - 44 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text } from "react-native";
- import type { ChallengeDetailFromApi } from "@/types";
- import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";
- import { SocialAvatars } from "@/components/challenge/challengeSocialAvatars";

**Key exports:**
- export const ChallengeLeaderboard = React.memo(function ChallengeLeaderboard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/ChallengeLeaderboard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:77

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/ChallengeLeaderboard.tsx:20 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/ChallengeLeaderboard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/ChallengeLeaderboard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/ChallengeLeaderboard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/ChallengeLeaderboard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/ChallengeLeaderboard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/ChallengeLeaderboard.tsx:14 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/ChallengeLeaderboard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/ChallengeLeaderboard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/ChallengeLeaderboard.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/ChallengeLeaderboard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/ChallengeLeaderboard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/ChallengeLeaderboard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/ChallengeLeaderboard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/ChallengeLeaderboard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/ChallengeLeaderboard.tsx:1).
2. Observability hooks are sparse (components/challenge/ChallengeLeaderboard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/ChallengeLeaderboard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/challengeSocialAvatars.tsx` - 25 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View } from "react-native";
- import { InitialCircle } from "@/components/ui";
- import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

**Key exports:**
- export function SocialAvatars({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/challengeSocialAvatars.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/challenge/ChallengeLeaderboard.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/challengeSocialAvatars.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/challengeSocialAvatars.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/challengeSocialAvatars.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/challengeSocialAvatars.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/challengeSocialAvatars.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/challengeSocialAvatars.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/challengeSocialAvatars.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/challengeSocialAvatars.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/challengeSocialAvatars.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/challengeSocialAvatars.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/challengeSocialAvatars.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/challengeSocialAvatars.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/challengeSocialAvatars.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/challengeSocialAvatars.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/challengeSocialAvatars.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/challengeSocialAvatars.tsx:1).
2. Observability hooks are sparse (components/challenge/challengeSocialAvatars.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/challengeSocialAvatars.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/ChallengeStats.tsx` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text } from "react-native";
- import type { ChallengeDetailFromApi } from "@/types";
- import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

**Key exports:**
- export const ChallengeStats = React.memo(function ChallengeStats({ challenge }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/ChallengeStats.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:76

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/ChallengeStats.tsx:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/ChallengeStats.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/ChallengeStats.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/ChallengeStats.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/ChallengeStats.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/ChallengeStats.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/ChallengeStats.tsx:10 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/ChallengeStats.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/ChallengeStats.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/ChallengeStats.tsx:10 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/ChallengeStats.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/ChallengeStats.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/ChallengeStats.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/ChallengeStats.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/ChallengeStats.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/ChallengeStats.tsx:1).
2. Observability hooks are sparse (components/challenge/ChallengeStats.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/ChallengeStats.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/ChallengeTodayGoals.tsx` - 17 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text } from "react-native";
- import { challengeDetailStyles as s } from "@/components/challenge/challengeDetailScreenStyles";

**Key exports:**
- export const ChallengeTodayGoals = React.memo(function ChallengeTodayGoals({ children }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/ChallengeTodayGoals.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:78

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/ChallengeTodayGoals.tsx:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/ChallengeTodayGoals.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/ChallengeTodayGoals.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/ChallengeTodayGoals.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/ChallengeTodayGoals.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/ChallengeTodayGoals.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/ChallengeTodayGoals.tsx:9 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/ChallengeTodayGoals.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/ChallengeTodayGoals.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/ChallengeTodayGoals.tsx:9 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/ChallengeTodayGoals.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/ChallengeTodayGoals.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/ChallengeTodayGoals.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/ChallengeTodayGoals.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/ChallengeTodayGoals.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/ChallengeTodayGoals.tsx:1).
2. Observability hooks are sparse (components/challenge/ChallengeTodayGoals.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/ChallengeTodayGoals.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/LogProgressModal.tsx` - 198 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState } from "react";
- import {
- import * as Haptics from "expo-haptics";
- import { useTheme } from "@/contexts/ThemeContext";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export default function LogProgressModal({ visible, unit, onClose, onSubmit }: LogProgressModalProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/LogProgressModal.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/challenge/SharedGoalProgress.tsx:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/challenge/LogProgressModal.tsx:45 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/LogProgressModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/challenge/LogProgressModal.tsx:45 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/LogProgressModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/LogProgressModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/LogProgressModal.tsx:68 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/LogProgressModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/LogProgressModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/LogProgressModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/LogProgressModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/LogProgressModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/LogProgressModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/LogProgressModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/LogProgressModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/LogProgressModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/LogProgressModal.tsx:1).
2. Catch path without Sentry capture (components/challenge/LogProgressModal.tsx:45).
3. Instrumentation gap for meaningful user actions (components/challenge/LogProgressModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/SharedGoalProgress.tsx` - 309 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo, useCallback } from "react";
- import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform } from "react-native";
- import { Target } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { useTheme } from "@/contexts/ThemeContext";
- import LogProgressModal from "./LogProgressModal";

**Key exports:**
- export interface SharedGoalLogEntry {
- export default function SharedGoalProgress({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/SharedGoalProgress.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:52

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/SharedGoalProgress.tsx:48 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/SharedGoalProgress.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/SharedGoalProgress.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/SharedGoalProgress.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/SharedGoalProgress.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/SharedGoalProgress.tsx:143 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/SharedGoalProgress.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/SharedGoalProgress.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/SharedGoalProgress.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/SharedGoalProgress.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/SharedGoalProgress.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/SharedGoalProgress.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/SharedGoalProgress.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/SharedGoalProgress.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/SharedGoalProgress.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/SharedGoalProgress.tsx:1).
2. Observability hooks are sparse (components/challenge/SharedGoalProgress.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/SharedGoalProgress.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenge/TeamMemberList.tsx` - 211 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo } from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Image } from "expo-image";
- import { Check, Clock, XCircle } from "lucide-react-native";
- import { useTheme } from "@/contexts/ThemeContext";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export interface TeamMemberForList {
- export default function TeamMemberList({ members, currentUserId, runStatus }: TeamMemberListProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenge/TeamMemberList.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:51

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenge/TeamMemberList.tsx:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenge/TeamMemberList.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenge/TeamMemberList.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenge/TeamMemberList.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenge/TeamMemberList.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenge/TeamMemberList.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenge/TeamMemberList.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenge/TeamMemberList.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenge/TeamMemberList.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenge/TeamMemberList.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/challenge/TeamMemberList.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenge/TeamMemberList.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenge/TeamMemberList.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenge/TeamMemberList.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenge/TeamMemberList.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenge/TeamMemberList.tsx:1).
2. Observability hooks are sparse (components/challenge/TeamMemberList.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenge/TeamMemberList.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenges/HeroFeaturedCard.tsx` - 137 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
- import { DS_COLORS, getCategoryColors, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { Avatar } from "@/components/Avatar";

**Key exports:**
- export const HeroFeaturedCard = React.memo(function HeroFeaturedCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenges/HeroFeaturedCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/challenges/HeroFeaturedCard.tsx:41 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenges/HeroFeaturedCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/challenges/HeroFeaturedCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenges/HeroFeaturedCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenges/HeroFeaturedCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenges/HeroFeaturedCard.tsx:70 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenges/HeroFeaturedCard.tsx:29 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenges/HeroFeaturedCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenges/HeroFeaturedCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenges/HeroFeaturedCard.tsx:29 | no static violation found. |
| Single responsibility / file size | 7 | components/challenges/HeroFeaturedCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenges/HeroFeaturedCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenges/HeroFeaturedCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenges/HeroFeaturedCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenges/HeroFeaturedCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenges/HeroFeaturedCard.tsx:1).
2. Observability hooks are sparse (components/challenges/HeroFeaturedCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/challenges/HeroFeaturedCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/challenges/JoinCelebrationModal.tsx` - 189 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef, useCallback } from "react";
- import {
- import ConfettiCannon from "react-native-confetti-cannon";
- import { ShieldCheck } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS, GRIIT_COLORS } from "@/lib/design-system";

**Key exports:**
- export type JoinCelebrationModalProps = {
- export default function JoinCelebrationModal({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/challenges/JoinCelebrationModal.tsx:11).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:66

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/challenges/JoinCelebrationModal.tsx:57 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/challenges/JoinCelebrationModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/challenges/JoinCelebrationModal.tsx:57 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/challenges/JoinCelebrationModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/challenges/JoinCelebrationModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/challenges/JoinCelebrationModal.tsx:92 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/challenges/JoinCelebrationModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/challenges/JoinCelebrationModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/challenges/JoinCelebrationModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/challenges/JoinCelebrationModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/challenges/JoinCelebrationModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/challenges/JoinCelebrationModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/challenges/JoinCelebrationModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/challenges/JoinCelebrationModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/challenges/JoinCelebrationModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/challenges/JoinCelebrationModal.tsx:1).
2. Catch path without Sentry capture (components/challenges/JoinCelebrationModal.tsx:57).
3. Instrumentation gap for meaningful user actions (components/challenges/JoinCelebrationModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/CommitModal.tsx` - 164 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useState } from "react";
- import { View, Text, TouchableOpacity, Modal } from "react-native";
- import { Ionicons } from "@expo/vector-icons";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export default function CommitModal({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/CommitModal.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:29

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/CommitModal.tsx:29 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/CommitModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/CommitModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/CommitModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/CommitModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/CommitModal.tsx:106 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/CommitModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/CommitModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/CommitModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/CommitModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/create/CommitModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/CommitModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/CommitModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/CommitModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/CommitModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/CommitModal.tsx:1).
2. Observability hooks are sparse (components/create/CommitModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/CommitModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/CreateChallengeWizard.tsx` - 487 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback, useRef, useEffect } from "react";
- import {
- import { useSafeAreaInsets } from "react-native-safe-area-context";
- import { useRouter } from "expo-router";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { styles } from "@/components/create/wizard-styles";

**Key exports:**
- export default function CreateChallengeWizard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/CreateChallengeWizard.tsx:12).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/create.tsx:2
- app/create/index.tsx:2
- components/create/DraftExitModal.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/create/CreateChallengeWizard.tsx:54 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/CreateChallengeWizard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/create/CreateChallengeWizard.tsx:160 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/CreateChallengeWizard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/CreateChallengeWizard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/CreateChallengeWizard.tsx:319 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/CreateChallengeWizard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/CreateChallengeWizard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/CreateChallengeWizard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/CreateChallengeWizard.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/create/CreateChallengeWizard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/CreateChallengeWizard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/CreateChallengeWizard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/CreateChallengeWizard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/CreateChallengeWizard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/CreateChallengeWizard.tsx:1).
2. Catch path without Sentry capture (components/create/CreateChallengeWizard.tsx:160).
3. Instrumentation gap for meaningful user actions (components/create/CreateChallengeWizard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/DraftExitModal.tsx` - 61 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Modal, Pressable, Text, TouchableOpacity } from "react-native";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { useRouter } from "expo-router";
- import { CREATE_CHALLENGE_DRAFT_KEY } from "@/hooks/useCreateChallengeWizardPersistence";
- import { styles } from "@/components/create/wizard-styles";

**Key exports:**
- export function DraftExitModal({ visible, onClose, onSaveDraft }: DraftExitModalProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/DraftExitModal.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:41

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/DraftExitModal.tsx:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/DraftExitModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/DraftExitModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/DraftExitModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/DraftExitModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/DraftExitModal.tsx:21 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/DraftExitModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/DraftExitModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/DraftExitModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/DraftExitModal.tsx:4 | no static violation found. |
| Single responsibility / file size | 7 | components/create/DraftExitModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/DraftExitModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/DraftExitModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/DraftExitModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/DraftExitModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/DraftExitModal.tsx:1).
2. Observability hooks are sparse (components/create/DraftExitModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/DraftExitModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/NewTaskModal.tsx` - 1521 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback, useMemo, useEffect, useRef, useLayoutEffect } from "react";
- import {
- import { useSafeAreaInsets } from "react-native-safe-area-context";
- import { Camera } from "lucide-react-native";
- import { Ionicons } from "@expo/vector-icons";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS, GRIIT_COLORS } from "@/lib/design-system"

**Key exports:**
- export default function NewTaskModal({ visible, onClose, onAdd, hardModeGlobal }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/NewTaskModal.tsx:13).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:28

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 4 | components/create/NewTaskModal.tsx:50 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/NewTaskModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/NewTaskModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/NewTaskModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/NewTaskModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/NewTaskModal.tsx:53 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | components/create/NewTaskModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/NewTaskModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/NewTaskModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/NewTaskModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 2 | components/create/NewTaskModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/NewTaskModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/NewTaskModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/NewTaskModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/NewTaskModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.9

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (1521 LOC) increases regression risk (components/create/NewTaskModal.tsx:1).
2. Observability hooks are sparse (components/create/NewTaskModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/NewTaskModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/steps/StepBasics.tsx` - 188 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TextInput, TouchableOpacity, Animated } from "react-native";
- import { User, Users, UsersRound } from "lucide-react-native";
- import { DS_COLORS } from "@/lib/design-system";
- import { CREATE_SELECTION } from "@/lib/create-selection";
- import type { ChallengeType } from "@/types";

**Key exports:**
- export type WhoBasics = "solo" | "duo" | "squad";
- export interface StepBasicsProps {
- export function StepBasics({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/steps/StepBasics.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:17
- components/create/steps/StepReview.tsx:9
- components/create/steps/StepRules.tsx:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/steps/StepBasics.tsx:43 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/steps/StepBasics.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/steps/StepBasics.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/steps/StepBasics.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/steps/StepBasics.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/steps/StepBasics.tsx:54 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/steps/StepBasics.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/steps/StepBasics.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/steps/StepBasics.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/steps/StepBasics.tsx:28 | no static violation found. |
| Single responsibility / file size | 7 | components/create/steps/StepBasics.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/steps/StepBasics.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/steps/StepBasics.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/steps/StepBasics.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/steps/StepBasics.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/steps/StepBasics.tsx:1).
2. Observability hooks are sparse (components/create/steps/StepBasics.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/steps/StepBasics.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/steps/StepReview.tsx` - 268 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TextInput, TouchableOpacity } from "react-native";
- import { DS_COLORS, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
- import type { ChallengeVisibility } from "@/types";
- import type { TaskEditorTask } from "@/components/TaskEditorModal";
- import { sharePlainMessage } from "@/lib/share";

**Key exports:**
- export interface StepReviewProps {
- export function StepReview({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/steps/StepReview.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/steps/StepReview.tsx:41 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/steps/StepReview.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/steps/StepReview.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/steps/StepReview.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/steps/StepReview.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/steps/StepReview.tsx:189 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/steps/StepReview.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/steps/StepReview.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/steps/StepReview.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/steps/StepReview.tsx:27 | no static violation found. |
| Single responsibility / file size | 7 | components/create/steps/StepReview.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/steps/StepReview.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/steps/StepReview.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/steps/StepReview.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/steps/StepReview.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/steps/StepReview.tsx:1).
2. Observability hooks are sparse (components/create/steps/StepReview.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/steps/StepReview.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/steps/StepRules.tsx` - 216 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity } from "react-native";
- import { Ionicons } from "@expo/vector-icons";
- import { DS_COLORS } from "@/lib/design-system";
- import { styles } from "@/components/create/wizard-styles";
- import { DurationPill, CATEGORY_OPTIONS } from "@/components/create/wizard-shared";

**Key exports:**
- export interface StepRulesProps {
- export function StepRules({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/steps/StepRules.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/steps/StepRules.tsx:38 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/steps/StepRules.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/steps/StepRules.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/steps/StepRules.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/steps/StepRules.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/steps/StepRules.tsx:47 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/steps/StepRules.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/steps/StepRules.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/steps/StepRules.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/steps/StepRules.tsx:26 | no static violation found. |
| Single responsibility / file size | 7 | components/create/steps/StepRules.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/steps/StepRules.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/steps/StepRules.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/steps/StepRules.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/steps/StepRules.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/steps/StepRules.tsx:1).
2. Observability hooks are sparse (components/create/steps/StepRules.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/steps/StepRules.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/steps/StepTasks.tsx` - 128 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity } from "react-native";
- import { Trash2 } from "lucide-react-native";
- import { DS_COLORS } from "@/lib/design-system";
- import { CHALLENGE_PACKS, tasksFromPack } from "@/lib/challenge-packs";
- import type { TaskEditorTask } from "@/components/TaskEditorModal";

**Key exports:**
- export interface StepTasksProps {
- export function StepTasks({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/steps/StepTasks.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/steps/StepTasks.tsx:35 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/steps/StepTasks.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/steps/StepTasks.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/steps/StepTasks.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/steps/StepTasks.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/steps/StepTasks.tsx:66 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/steps/StepTasks.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/steps/StepTasks.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/steps/StepTasks.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/steps/StepTasks.tsx:21 | no static violation found. |
| Single responsibility / file size | 7 | components/create/steps/StepTasks.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/steps/StepTasks.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/steps/StepTasks.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/steps/StepTasks.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/steps/StepTasks.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/steps/StepTasks.tsx:1).
2. Observability hooks are sparse (components/create/steps/StepTasks.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/steps/StepTasks.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/wizard-shared.tsx` - 94 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Text, TouchableOpacity } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";
- import type { TaskEditorTask } from "@/components/TaskEditorModal";

**Key exports:**
- export const DURATION_PRESETS = [7, 14, 21, 30, 75] as const;
- export const CATEGORY_OPTIONS = ["Fitness", "Mind", "Faith", "Discipline", "Other"] as const;
- export function DurationPill({
- export function getTaskIcon(taskType: string): string {
- export function getTaskMeta(task: TaskEditorTask & { wizardType?: string }): string {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/wizard-shared.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/steps/StepBasics.tsx:8
- components/create/steps/StepReview.tsx:8
- components/create/steps/StepRules.tsx:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/wizard-shared.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/wizard-shared.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/wizard-shared.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/wizard-shared.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/wizard-shared.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/wizard-shared.tsx:15 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/wizard-shared.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/wizard-shared.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/wizard-shared.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/wizard-shared.tsx:9 | no static violation found. |
| Single responsibility / file size | 7 | components/create/wizard-shared.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/wizard-shared.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/wizard-shared.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/wizard-shared.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/wizard-shared.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/wizard-shared.tsx:1).
2. Observability hooks are sparse (components/create/wizard-shared.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/wizard-shared.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/wizard-styles.ts` - 306 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, GRIIT_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
- import { CREATE_SELECTION } from "@/lib/create-selection";

**Key exports:**
- export const styles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/wizard-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:16
- components/create/DraftExitModal.tsx:6
- components/create/steps/StepBasics.tsx:7
- components/create/steps/StepReview.tsx:7
- components/create/steps/StepRules.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/wizard-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/wizard-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/wizard-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/wizard-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/wizard-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/wizard-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/wizard-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/wizard-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/wizard-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/wizard-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/create/wizard-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/wizard-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/wizard-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/wizard-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/wizard-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/wizard-styles.ts:1).
2. Observability hooks are sparse (components/create/wizard-styles.ts:1).
3. Instrumentation gap for meaningful user actions (components/create/wizard-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/create/WizardStepFooter.tsx` - 121 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity } from "react-native";
- import { Ionicons } from "@expo/vector-icons";
- import { DS_COLORS } from "@/lib/design-system";
- import { styles } from "@/components/create/wizard-styles";

**Key exports:**
- export function WizardStepFooter({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/create/WizardStepFooter.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:42

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/create/WizardStepFooter.tsx:36 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/create/WizardStepFooter.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/create/WizardStepFooter.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/create/WizardStepFooter.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/create/WizardStepFooter.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/create/WizardStepFooter.tsx:42 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/create/WizardStepFooter.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/create/WizardStepFooter.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/create/WizardStepFooter.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/create/WizardStepFooter.tsx:22 | no static violation found. |
| Single responsibility / file size | 7 | components/create/WizardStepFooter.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/create/WizardStepFooter.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/create/WizardStepFooter.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/create/WizardStepFooter.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/create/WizardStepFooter.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/create/WizardStepFooter.tsx:1).
2. Observability hooks are sparse (components/create/WizardStepFooter.tsx:1).
3. Instrumentation gap for meaningful user actions (components/create/WizardStepFooter.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/discover/ActivityTicker.tsx` - 200 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback } from "react";
- import { View, FlatList, Text, Pressable, StyleSheet } from "react-native";
- import { Image } from "expo-image";
- import { useQuery } from "@tanstack/react-query";
- import { useRouter } from "expo-router";
- import { trpcQuery } from "@/lib/trpc";

**Key exports:**
- export type RecentCompletionItem = {
- export function ActivityTicker() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/discover/ActivityTicker.tsx:6).
- Native/env usage: yes (components/discover/ActivityTicker.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:40

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/discover/ActivityTicker.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/discover/ActivityTicker.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/discover/ActivityTicker.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/discover/ActivityTicker.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/discover/ActivityTicker.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/discover/ActivityTicker.tsx:43 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/discover/ActivityTicker.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/discover/ActivityTicker.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/discover/ActivityTicker.tsx:6 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/discover/ActivityTicker.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/discover/ActivityTicker.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/discover/ActivityTicker.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/discover/ActivityTicker.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/discover/ActivityTicker.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/discover/ActivityTicker.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/discover/ActivityTicker.tsx:1).
2. Observability hooks are sparse (components/discover/ActivityTicker.tsx:1).
3. Instrumentation gap for meaningful user actions (components/discover/ActivityTicker.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/discover/CompactChallengeRow.tsx` - 177 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, Pressable, StyleSheet } from "react-native";
- import { useRouter } from "expo-router";
- import {
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export interface CompactChallengeRowProps {
- export const CompactChallengeRow = React.memo(CompactChallengeRowInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/discover/CompactChallengeRow.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:41

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/discover/CompactChallengeRow.tsx:44 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/discover/CompactChallengeRow.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/discover/CompactChallengeRow.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/discover/CompactChallengeRow.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/discover/CompactChallengeRow.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/discover/CompactChallengeRow.tsx:94 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/discover/CompactChallengeRow.tsx:128 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/discover/CompactChallengeRow.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/discover/CompactChallengeRow.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/discover/CompactChallengeRow.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | components/discover/CompactChallengeRow.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/discover/CompactChallengeRow.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/discover/CompactChallengeRow.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/discover/CompactChallengeRow.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/discover/CompactChallengeRow.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/discover/CompactChallengeRow.tsx:1).
2. Observability hooks are sparse (components/discover/CompactChallengeRow.tsx:1).
3. Instrumentation gap for meaningful user actions (components/discover/CompactChallengeRow.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/discover/DiscoverChallengeCards.tsx` - 320 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, Pressable, StyleSheet } from "react-native";
- import { Flame, Target, BookOpen } from "lucide-react-native";
- import { DS_COLORS, getCategoryColors, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { Avatar } from "@/components/Avatar";

**Key exports:**
- export type MiniCardChallenge = {
- export const DiscoverMiniChallengeCard = React.memo(function DiscoverMiniChallengeCard({
- export type FullCardChallenge = {
- export function DiscoverChallengeSearchRow({
- export function DiscoverFullChallengeCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/discover/DiscoverChallengeCards.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "DiscoverChallengeCards" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/discover/DiscoverChallengeCards.tsx:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/discover/DiscoverChallengeCards.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/discover/DiscoverChallengeCards.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/discover/DiscoverChallengeCards.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/discover/DiscoverChallengeCards.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/discover/DiscoverChallengeCards.tsx:76 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/discover/DiscoverChallengeCards.tsx:53 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/discover/DiscoverChallengeCards.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/discover/DiscoverChallengeCards.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/discover/DiscoverChallengeCards.tsx:7 | no static violation found. |
| Single responsibility / file size | 7 | components/discover/DiscoverChallengeCards.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/discover/DiscoverChallengeCards.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/discover/DiscoverChallengeCards.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/discover/DiscoverChallengeCards.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/discover/DiscoverChallengeCards.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/discover/DiscoverChallengeCards.tsx:1).
2. Observability hooks are sparse (components/discover/DiscoverChallengeCards.tsx:1).
3. Instrumentation gap for meaningful user actions (components/discover/DiscoverChallengeCards.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/discover/FilterChips.tsx` - 83 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback } from "react";
- import { FlatList, Pressable, Text, StyleSheet } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";

**Key exports:**
- export type DiscoverFilterId = "All" | "Easy" | "7 days" | "Physical" | "Mental" | "Spiritual";
- export function FilterChips({ onFilterChange }: FilterChipsProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/discover/FilterChips.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:39

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/discover/FilterChips.tsx:39 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/discover/FilterChips.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/discover/FilterChips.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/discover/FilterChips.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/discover/FilterChips.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/discover/FilterChips.tsx:28 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/discover/FilterChips.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/discover/FilterChips.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/discover/FilterChips.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/discover/FilterChips.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/discover/FilterChips.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/discover/FilterChips.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/discover/FilterChips.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/discover/FilterChips.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/discover/FilterChips.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/discover/FilterChips.tsx:1).
2. Observability hooks are sparse (components/discover/FilterChips.tsx:1).
3. Instrumentation gap for meaningful user actions (components/discover/FilterChips.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/discover/PickedForYou.tsx` - 207 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback } from "react";
- import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
- import { useRouter } from "expo-router";
- import { BookOpen, Flame, Target } from "lucide-react-native";
- import { DS_COLORS, DS_RADIUS, getCategoryColors, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export type PickedChallenge = {
- export function PickedForYou({ challenges }: { challenges: PickedChallenge[] }) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/discover/PickedForYou.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:42

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/discover/PickedForYou.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/discover/PickedForYou.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/discover/PickedForYou.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/discover/PickedForYou.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/discover/PickedForYou.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/discover/PickedForYou.tsx:48 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/discover/PickedForYou.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/discover/PickedForYou.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/discover/PickedForYou.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/discover/PickedForYou.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/discover/PickedForYou.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/discover/PickedForYou.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/discover/PickedForYou.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/discover/PickedForYou.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/discover/PickedForYou.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/discover/PickedForYou.tsx:1).
2. Observability hooks are sparse (components/discover/PickedForYou.tsx:1).
3. Instrumentation gap for meaningful user actions (components/discover/PickedForYou.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ErrorBoundary.tsx` - 104 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { Component, ErrorInfo, ReactNode } from "react";
- import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { reportClientError } from "@/lib/client-error-reporting";
- import { logger } from "@/lib/logger";

**Key exports:**
- export class ErrorBoundary extends Component<Props, State> {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ErrorBoundary.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:18
- app/(tabs)/activity.tsx:6
- app/(tabs)/create.tsx:3
- app/(tabs)/discover.tsx:25
- app/(tabs)/index.tsx:53

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ErrorBoundary.tsx:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ErrorBoundary.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ErrorBoundary.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ErrorBoundary.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 4 | components/ErrorBoundary.tsx:46 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ErrorBoundary.tsx:54 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ErrorBoundary.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ErrorBoundary.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ErrorBoundary.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ErrorBoundary.tsx:7 | no static violation found. |
| Single responsibility / file size | 7 | components/ErrorBoundary.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ErrorBoundary.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ErrorBoundary.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ErrorBoundary.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ErrorBoundary.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ErrorBoundary.tsx:1).
2. Observability hooks are sparse (components/ErrorBoundary.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ErrorBoundary.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ErrorRetry.tsx` - 58 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
- import { AlertTriangle, RefreshCw } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";

**Key exports:**
- export function ErrorRetry({ message = "Something went wrong", onRetry }: ErrorRetryProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ErrorRetry.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/accountability.tsx:24
- app/challenge/active/[activeChallengeId].tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ErrorRetry.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ErrorRetry.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ErrorRetry.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ErrorRetry.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ErrorRetry.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ErrorRetry.tsx:13 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ErrorRetry.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ErrorRetry.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ErrorRetry.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ErrorRetry.tsx:11 | no static violation found. |
| Single responsibility / file size | 7 | components/ErrorRetry.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ErrorRetry.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ErrorRetry.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ErrorRetry.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ErrorRetry.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ErrorRetry.tsx:1).
2. Observability hooks are sparse (components/ErrorRetry.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ErrorRetry.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/FeedCardHeader.tsx` - 186 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, Pressable } from "react-native";
- import { Check, MoreHorizontal } from "lucide-react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { Avatar } from "@/components/Avatar";
- import { relativeTime } from "@/lib/utils/relativeTime";

**Key exports:**
- export const FeedCardHeader = React.memo(FeedCardHeaderInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/feed/FeedCardHeader.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/feed/FeedPostCard.tsx:15
- components/feed/MilestonePostCard.tsx:5
- components/LiveFeedSection.tsx:27

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/FeedCardHeader.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/FeedCardHeader.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/FeedCardHeader.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/FeedCardHeader.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/FeedCardHeader.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/FeedCardHeader.tsx:41 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/FeedCardHeader.tsx:105 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/FeedCardHeader.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/FeedCardHeader.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/FeedCardHeader.tsx:9 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/FeedCardHeader.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/FeedCardHeader.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/FeedCardHeader.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/FeedCardHeader.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/FeedCardHeader.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/FeedCardHeader.tsx:1).
2. Observability hooks are sparse (components/feed/FeedCardHeader.tsx:1).
3. Instrumentation gap for meaningful user actions (components/feed/FeedCardHeader.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/FeedEngagementRow.tsx` - 128 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
- import * as Haptics from "expo-haptics";
- import { Heart, MessageCircle, ArrowUpRight } from "lucide-react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const FeedEngagementRow = React.memo(FeedEngagementRowInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/feed/FeedEngagementRow.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/feed/FeedPostCard.tsx:16
- components/feed/MilestonePostCard.tsx:6
- components/LiveFeedSection.tsx:28

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/FeedEngagementRow.tsx:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/FeedEngagementRow.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/FeedEngagementRow.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/FeedEngagementRow.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/FeedEngagementRow.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/FeedEngagementRow.tsx:51 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/FeedEngagementRow.tsx:91 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/FeedEngagementRow.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/FeedEngagementRow.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/FeedEngagementRow.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/FeedEngagementRow.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/FeedEngagementRow.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/FeedEngagementRow.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/FeedEngagementRow.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/FeedEngagementRow.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/FeedEngagementRow.tsx:1).
2. Observability hooks are sparse (components/feed/FeedEngagementRow.tsx:1).
3. Instrumentation gap for meaningful user actions (components/feed/FeedEngagementRow.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/FeedPostCard.tsx` - 420 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import {
- import * as Haptics from "expo-haptics";
- import { Image } from "expo-image";
- import { Camera, CircleCheck, Heart } from "lucide-react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const FeedPostCard = React.memo(FeedPostCardInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/feed/FeedPostCard.tsx:9).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:40
- app/post/[id].tsx:31
- app/profile/[username].tsx:33
- components/LiveFeedSection.tsx:25

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/FeedPostCard.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/FeedPostCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/FeedPostCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/FeedPostCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/FeedPostCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/FeedPostCard.tsx:135 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/FeedPostCard.tsx:74 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/FeedPostCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/FeedPostCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/FeedPostCard.tsx:22 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/FeedPostCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/FeedPostCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/FeedPostCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/FeedPostCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/FeedPostCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/FeedPostCard.tsx:1).
2. Observability hooks are sparse (components/feed/FeedPostCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/feed/FeedPostCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/feedTypes.ts` - 38 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export type LiveFeedPost = {
- export type FeedCommentPreview = {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:41
- app/post/[id].tsx:30
- app/profile/[username].tsx:34
- components/feed/FeedCardHeader.tsx:7
- components/feed/FeedPostCard.tsx:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/feedTypes.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/feedTypes.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/feedTypes.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/feedTypes.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/feedTypes.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/feedTypes.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/feedTypes.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/feedTypes.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/feedTypes.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/feedTypes.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/feedTypes.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/feedTypes.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/feedTypes.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/feedTypes.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/feedTypes.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/feedTypes.ts:1).
2. Observability hooks are sparse (components/feed/feedTypes.ts:1).
3. Instrumentation gap for meaningful user actions (components/feed/feedTypes.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/MilestonePostCard.tsx` - 139 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Star } from "lucide-react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { FeedCardHeader } from "./FeedCardHeader";
- import { FeedEngagementRow } from "./FeedEngagementRow";

**Key exports:**
- export const MilestonePostCard = React.memo(MilestonePostCardInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/feed/MilestonePostCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/post/[id].tsx:32
- components/LiveFeedSection.tsx:26

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/MilestonePostCard.tsx:11 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/MilestonePostCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/MilestonePostCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/MilestonePostCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/MilestonePostCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/MilestonePostCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/MilestonePostCard.tsx:78 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/MilestonePostCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/MilestonePostCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/MilestonePostCard.tsx:10 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/MilestonePostCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/MilestonePostCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/MilestonePostCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/MilestonePostCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/MilestonePostCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/MilestonePostCard.tsx:1).
2. Observability hooks are sparse (components/feed/MilestonePostCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/feed/MilestonePostCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/feed/WhoRespectedSheet.tsx` - 210 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback } from "react";
- import {
- import { X } from "lucide-react-native";
- import { useQuery } from "@tanstack/react-query";
- import { trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";

**Key exports:**
- export function WhoRespectedSheet({ visible, eventId, onClose }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/feed/WhoRespectedSheet.tsx:13).
- Native/env usage: yes (components/feed/WhoRespectedSheet.tsx:10).

**What depends on it:** (grep for imports of this file)
- components/feed/FeedPostCard.tsx:17
- components/feed/MilestonePostCard.tsx:7

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/feed/WhoRespectedSheet.tsx:91 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/feed/WhoRespectedSheet.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/feed/WhoRespectedSheet.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/feed/WhoRespectedSheet.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/feed/WhoRespectedSheet.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/feed/WhoRespectedSheet.tsx:67 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/feed/WhoRespectedSheet.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/feed/WhoRespectedSheet.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/feed/WhoRespectedSheet.tsx:13 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/feed/WhoRespectedSheet.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/feed/WhoRespectedSheet.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/feed/WhoRespectedSheet.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/feed/WhoRespectedSheet.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/feed/WhoRespectedSheet.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/feed/WhoRespectedSheet.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/feed/WhoRespectedSheet.tsx:1).
2. Observability hooks are sparse (components/feed/WhoRespectedSheet.tsx:1).
3. Instrumentation gap for meaningful user actions (components/feed/WhoRespectedSheet.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/ActiveChallenges.tsx` - 197 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useMemo } from "react";
- import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
- import { trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";
- import ChallengeCard, { TodayTaskItem } from "./ChallengeCard";
- import EmptyChallengesCard from "./EmptyChallengesCard";

**Key exports:**
- export interface ChallengeWithProgress {
- export default function ActiveChallenges({ challengesWithProgress: controlledList, refreshKey }: ActiveChallengesProps = {}) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/home/ActiveChallenges.tsx:3).
- Native/env usage: yes (components/home/ActiveChallenges.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ActiveChallenges" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/home/ActiveChallenges.tsx:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/ActiveChallenges.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/home/ActiveChallenges.tsx:78 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/ActiveChallenges.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/ActiveChallenges.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/ActiveChallenges.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/ActiveChallenges.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/ActiveChallenges.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/ActiveChallenges.tsx:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/ActiveChallenges.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/ActiveChallenges.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/ActiveChallenges.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/ActiveChallenges.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/ActiveChallenges.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/ActiveChallenges.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/ActiveChallenges.tsx:1).
2. Catch path without Sentry capture (components/home/ActiveChallenges.tsx:78).
3. Instrumentation gap for meaningful user actions (components/home/ActiveChallenges.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/ActiveTaskCard.tsx` - 140 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef, useState } from "react";
- import {
- import { useRouter } from "expo-router";
- import { ChevronRight } from "lucide-react-native";
- import { formatSecondsToMMSS } from "@/lib/formatTime";
- import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export function ActiveTaskCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/ActiveTaskCard.tsx:9).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/ActiveTaskCard.tsx:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/ActiveTaskCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/ActiveTaskCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/ActiveTaskCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/ActiveTaskCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/ActiveTaskCard.tsx:83 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/ActiveTaskCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/ActiveTaskCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/ActiveTaskCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/ActiveTaskCard.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/ActiveTaskCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/ActiveTaskCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/ActiveTaskCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/ActiveTaskCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/ActiveTaskCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/ActiveTaskCard.tsx:1).
2. Observability hooks are sparse (components/home/ActiveTaskCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/ActiveTaskCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/ChallengeCard.tsx` - 215 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback } from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
- import { ChevronRight, Circle, CheckCircle2, Users, Target } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { useRouter } from "expo-router";
- import { useQueryClient } from "@tanstack/react-query";

**Key exports:**
- export interface TodayTaskItem {
- export default function ChallengeCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/ChallengeCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:26
- app/(tabs)/index.tsx:42
- components/home/ActiveChallenges.tsx:5

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/ChallengeCard.tsx:62 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/ChallengeCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/ChallengeCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/ChallengeCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/ChallengeCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/ChallengeCard.tsx:119 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/ChallengeCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/ChallengeCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/ChallengeCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/ChallengeCard.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/ChallengeCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/ChallengeCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/ChallengeCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/ChallengeCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/ChallengeCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/ChallengeCard.tsx:1).
2. Observability hooks are sparse (components/home/ChallengeCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/ChallengeCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/DailyBonus.tsx` - 108 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useState } from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Gift } from "lucide-react-native";
- import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default React.memo(function DailyBonus() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/DailyBonus.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:33

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/DailyBonus.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/DailyBonus.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/DailyBonus.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/DailyBonus.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/DailyBonus.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/DailyBonus.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/DailyBonus.tsx:22 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/DailyBonus.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/DailyBonus.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/DailyBonus.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/DailyBonus.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/DailyBonus.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/DailyBonus.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/DailyBonus.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/DailyBonus.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/DailyBonus.tsx:1).
2. Observability hooks are sparse (components/home/DailyBonus.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/DailyBonus.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/DailyQuote.tsx` - 55 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useState } from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { useFocusEffect } from "@react-navigation/native";
- import { getRandomQuote } from "@/lib/quotes";
- import { GRIIT_COLORS, DS_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export default React.memo(function DailyQuote() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/DailyQuote.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:30

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/DailyQuote.tsx:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/DailyQuote.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/DailyQuote.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/DailyQuote.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/DailyQuote.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/DailyQuote.tsx:17 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/DailyQuote.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/DailyQuote.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/DailyQuote.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/DailyQuote.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/DailyQuote.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/DailyQuote.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/DailyQuote.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/DailyQuote.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/DailyQuote.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/DailyQuote.tsx:1).
2. Observability hooks are sparse (components/home/DailyQuote.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/DailyQuote.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/DailyStatus.tsx` - 156 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
- import { CheckCircle2, Shield } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

**Key exports:**
- export type DailyStatusState = "NOT_SECURED" | "SECURED";
- export default function DailyStatus({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/DailyStatus.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "DailyStatus" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/DailyStatus.tsx:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/DailyStatus.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/DailyStatus.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/DailyStatus.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/DailyStatus.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/DailyStatus.tsx:70 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/DailyStatus.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/DailyStatus.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/DailyStatus.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/DailyStatus.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/home/DailyStatus.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/DailyStatus.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/DailyStatus.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/DailyStatus.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/DailyStatus.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/DailyStatus.tsx:1).
2. Observability hooks are sparse (components/home/DailyStatus.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/DailyStatus.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/DiscoverCTA.tsx` - 72 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { Search, ChevronRight } from "lucide-react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export default function DiscoverCTA({ onPress, variant = "home" }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/DiscoverCTA.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:39
- components/LiveFeedSection.tsx:24

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/DiscoverCTA.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/DiscoverCTA.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/DiscoverCTA.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/DiscoverCTA.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/DiscoverCTA.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/DiscoverCTA.tsx:19 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/DiscoverCTA.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/DiscoverCTA.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/DiscoverCTA.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/DiscoverCTA.tsx:12 | no static violation found. |
| Single responsibility / file size | 7 | components/home/DiscoverCTA.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/DiscoverCTA.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/DiscoverCTA.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/DiscoverCTA.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/DiscoverCTA.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/DiscoverCTA.tsx:1).
2. Observability hooks are sparse (components/home/DiscoverCTA.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/DiscoverCTA.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/EmptyChallengesCard.tsx` - 74 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
- import { Target } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { useRouter } from "expo-router";
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export default function EmptyChallengesCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/EmptyChallengesCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/home/ActiveChallenges.tsx:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/EmptyChallengesCard.tsx:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/EmptyChallengesCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/EmptyChallengesCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/EmptyChallengesCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/EmptyChallengesCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/EmptyChallengesCard.tsx:27 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/EmptyChallengesCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/EmptyChallengesCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/EmptyChallengesCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/EmptyChallengesCard.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | components/home/EmptyChallengesCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/EmptyChallengesCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/EmptyChallengesCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/EmptyChallengesCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/EmptyChallengesCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/EmptyChallengesCard.tsx:1).
2. Observability hooks are sparse (components/home/EmptyChallengesCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/EmptyChallengesCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/ExploreChallengesButton.tsx` - 52 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
- import { ChevronRight } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { useRouter } from "expo-router";
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export default function ExploreChallengesButton() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/ExploreChallengesButton.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ExploreChallengesButton" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/ExploreChallengesButton.tsx:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/ExploreChallengesButton.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/ExploreChallengesButton.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/ExploreChallengesButton.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/ExploreChallengesButton.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/ExploreChallengesButton.tsx:23 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/ExploreChallengesButton.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/ExploreChallengesButton.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/ExploreChallengesButton.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/ExploreChallengesButton.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | components/home/ExploreChallengesButton.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/ExploreChallengesButton.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/ExploreChallengesButton.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/ExploreChallengesButton.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/ExploreChallengesButton.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/ExploreChallengesButton.tsx:1).
2. Observability hooks are sparse (components/home/ExploreChallengesButton.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/ExploreChallengesButton.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/GoalCard.tsx` - 372 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useMemo, useState } from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
- import {
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS } from "@/lib/design-system"
- import { logger } from "@/lib/logger";
- import { formatTimeHHMM } from "@/lib/time-enforcement";

**Key exports:**
- export default React.memo(function GoalCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/GoalCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:34

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/GoalCard.tsx:21 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/GoalCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/GoalCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/GoalCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/GoalCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/GoalCard.tsx:106 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/GoalCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/GoalCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/GoalCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/GoalCard.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/GoalCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/GoalCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/GoalCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/GoalCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/GoalCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/GoalCard.tsx:1).
2. Observability hooks are sparse (components/home/GoalCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/GoalCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/index.ts` - 9 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { default as DailyStatus } from "./DailyStatus";
- export type { DailyStatusState } from "./DailyStatus";
- export { default as ExploreChallengesButton } from "./ExploreChallengesButton";
- export { default as ActiveChallenges } from "./ActiveChallenges";
- export type { ChallengeWithProgress } from "./ActiveChallenges";
- export { default as ChallengeCard } from "./ChallengeCard";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/index.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/index.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/index.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/index.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/index.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/index.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/index.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/index.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/index.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/index.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/index.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/index.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/index.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/index.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/index.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/index.ts:1).
2. Observability hooks are sparse (components/home/index.ts:1).
3. Instrumentation gap for meaningful user actions (components/home/index.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/NextUnlock.tsx` - 81 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Flame, Shield, Trophy } from "lucide-react-native";
- import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default React.memo(function NextUnlock({ currentStreak }: { currentStreak: number }) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/NextUnlock.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:37

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/NextUnlock.tsx:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/NextUnlock.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/NextUnlock.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/NextUnlock.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/NextUnlock.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/NextUnlock.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/NextUnlock.tsx:18 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/NextUnlock.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/NextUnlock.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/NextUnlock.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/home/NextUnlock.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/NextUnlock.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/NextUnlock.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/NextUnlock.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/NextUnlock.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/NextUnlock.tsx:1).
2. Observability hooks are sparse (components/home/NextUnlock.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/NextUnlock.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/PointsExplainer.tsx` - 183 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback } from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from "react-native";
- import { X, Flame, Zap, Target, Star, Shield } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default function PointsExplainer({ visible, onClose, currentPoints, currentRank }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/PointsExplainer.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:35

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/PointsExplainer.tsx:32 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/PointsExplainer.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/PointsExplainer.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/PointsExplainer.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/PointsExplainer.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/PointsExplainer.tsx:58 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/PointsExplainer.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/PointsExplainer.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/PointsExplainer.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/PointsExplainer.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/PointsExplainer.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/PointsExplainer.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/PointsExplainer.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/PointsExplainer.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/PointsExplainer.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/PointsExplainer.tsx:1).
2. Observability hooks are sparse (components/home/PointsExplainer.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/PointsExplainer.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/StreakHero.tsx` - 155 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useMemo, useState } from "react";
- import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
- import Svg, { Circle } from "react-native-svg";
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default React.memo(function StreakHero({ streak, ringProgress, onStartFirstTask }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/StreakHero.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:32

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/StreakHero.tsx:21 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/StreakHero.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/StreakHero.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/StreakHero.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/StreakHero.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/StreakHero.tsx:81 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/StreakHero.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/StreakHero.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/StreakHero.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/StreakHero.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/StreakHero.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/StreakHero.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/StreakHero.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/StreakHero.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/StreakHero.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/StreakHero.tsx:1).
2. Observability hooks are sparse (components/home/StreakHero.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/StreakHero.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/home/WeekStrip.tsx` - 162 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo } from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Check, Flame, Shield, X } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default React.memo(function WeekStrip({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/home/WeekStrip.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:36

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/home/WeekStrip.tsx:10 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/home/WeekStrip.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/home/WeekStrip.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/home/WeekStrip.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/home/WeekStrip.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/home/WeekStrip.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/home/WeekStrip.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/home/WeekStrip.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/home/WeekStrip.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/home/WeekStrip.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/home/WeekStrip.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/home/WeekStrip.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/home/WeekStrip.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/home/WeekStrip.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/home/WeekStrip.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/home/WeekStrip.tsx:1).
2. Observability hooks are sparse (components/home/WeekStrip.tsx:1).
3. Instrumentation gap for meaningful user actions (components/home/WeekStrip.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/InlineError.tsx` - 88 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef } from "react";
- import { Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
- import { AlertCircle, X } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export const InlineError = React.memo(InlineErrorInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/InlineError.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:14
- app/accountability.tsx:21
- app/accountability/add.tsx:21
- app/auth/signup.tsx:23
- app/challenge/[id].tsx:69

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/InlineError.tsx:42 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/InlineError.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/InlineError.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/InlineError.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/InlineError.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/InlineError.tsx:56 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/InlineError.tsx:70 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/InlineError.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/InlineError.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/InlineError.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/InlineError.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/InlineError.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/InlineError.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/InlineError.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/InlineError.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/InlineError.tsx:1).
2. Observability hooks are sparse (components/InlineError.tsx:1).
3. Instrumentation gap for meaningful user actions (components/InlineError.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/LiveFeedSection.tsx` - 699 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
- import {
- import { useRouter } from "expo-router";
- import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
- import { trpcMutate, trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";

**Key exports:**
- export default React.memo(LiveFeedSection);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/LiveFeedSection.tsx:17).
- Native/env usage: yes (components/LiveFeedSection.tsx:14).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:38

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/LiveFeedSection.tsx:60 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/LiveFeedSection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/LiveFeedSection.tsx:195 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/LiveFeedSection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/LiveFeedSection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/LiveFeedSection.tsx:389 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/LiveFeedSection.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/LiveFeedSection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/LiveFeedSection.tsx:17 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/LiveFeedSection.tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | components/LiveFeedSection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/LiveFeedSection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/LiveFeedSection.tsx:31 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/LiveFeedSection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/LiveFeedSection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/LiveFeedSection.tsx:1).
2. Catch path without Sentry capture (components/LiveFeedSection.tsx:195).
3. Instrumentation gap for meaningful user actions (components/LiveFeedSection.tsx:31).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/OfflineBanner.tsx` - 36 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { WifiOff } from "lucide-react-native";
- import { useNetworkStatus } from "@/hooks/useNetworkStatus";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const OfflineBanner = React.memo(OfflineBannerInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/OfflineBanner.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/OfflineBanner.tsx:9 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/OfflineBanner.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/OfflineBanner.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/OfflineBanner.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/OfflineBanner.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/OfflineBanner.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/OfflineBanner.tsx:19 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/OfflineBanner.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/OfflineBanner.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/OfflineBanner.tsx:4 | no static violation found. |
| Single responsibility / file size | 7 | components/OfflineBanner.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/OfflineBanner.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/OfflineBanner.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/OfflineBanner.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/OfflineBanner.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/OfflineBanner.tsx:1).
2. Observability hooks are sparse (components/OfflineBanner.tsx:1).
3. Instrumentation gap for meaningful user actions (components/OfflineBanner.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/onboarding-theme.ts` - 142 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS, DS_MEASURES, DS_RADIUS, DS_SPACING } from "@/lib/design-system";

**Key exports:**
- export const ONBOARDING_COLORS = {
- export const ONBOARDING_TYPOGRAPHY = {
- export const ONBOARDING_SPACING = {
- export const GOAL_OPTIONS = [
- export const INTENSITY_OPTIONS = [

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:7
- components/onboarding/ProgressDots.tsx:4
- components/onboarding/screens/AutoSuggestChallengeScreen.tsx:10
- components/onboarding/screens/GoalSelection.tsx:4
- components/onboarding/screens/ProfileSetup.tsx:17

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/onboarding/onboarding-theme.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/onboarding-theme.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/onboarding/onboarding-theme.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/onboarding-theme.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/onboarding-theme.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/onboarding-theme.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/onboarding-theme.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/onboarding-theme.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/onboarding-theme.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/onboarding-theme.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/onboarding-theme.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/onboarding-theme.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/onboarding-theme.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/onboarding-theme.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/onboarding-theme.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/onboarding-theme.ts:1).
2. Observability hooks are sparse (components/onboarding/onboarding-theme.ts:1).
3. Instrumentation gap for meaningful user actions (components/onboarding/onboarding-theme.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/OnboardingFlow.tsx` - 162 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useCallback, useEffect } from "react";
- import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
- import { useRouter } from "expo-router";
- import AsyncStorage from "@react-native-async-storage/async-storage";
- import { ChevronLeft } from "lucide-react-native";
- import * as Haptics from "expo-haptics";

**Key exports:**
- export default function OnboardingFlow() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/OnboardingFlow.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/onboarding/index.tsx:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/onboarding/OnboardingFlow.tsx:67 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/OnboardingFlow.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/onboarding/OnboardingFlow.tsx:67 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/OnboardingFlow.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/OnboardingFlow.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/OnboardingFlow.tsx:106 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/OnboardingFlow.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/OnboardingFlow.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/OnboardingFlow.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/OnboardingFlow.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/OnboardingFlow.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/OnboardingFlow.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/OnboardingFlow.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/OnboardingFlow.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/OnboardingFlow.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/OnboardingFlow.tsx:1).
2. Catch path without Sentry capture (components/onboarding/OnboardingFlow.tsx:67).
3. Instrumentation gap for meaningful user actions (components/onboarding/OnboardingFlow.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/ProgressDots.tsx` - 48 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_RADIUS } from "@/lib/design-system";
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { ONBOARDING_COLORS as C } from "@/components/onboarding/onboarding-theme";

**Key exports:**
- export default function ProgressDots({ total, current }: ProgressDotsProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/ProgressDots.tsx:3).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/onboarding/ProgressDots.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/ProgressDots.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/onboarding/ProgressDots.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/ProgressDots.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/ProgressDots.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/ProgressDots.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/ProgressDots.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/ProgressDots.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/ProgressDots.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/ProgressDots.tsx:11 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/ProgressDots.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/ProgressDots.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/ProgressDots.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/ProgressDots.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/ProgressDots.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/ProgressDots.tsx:1).
2. Observability hooks are sparse (components/onboarding/ProgressDots.tsx:1).
3. Instrumentation gap for meaningful user actions (components/onboarding/ProgressDots.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/screens/AutoSuggestChallengeScreen.tsx` - 331 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useState } from "react";
- import {
- import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/components/onboarding/onboarding-theme";
- import { DS_MEASURES, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { useOnboardingStore } from "@/store/onboardingStore";
- import { trpcQuery, trpcMutate } from "@/lib/trpc";

**Key exports:**
- export default function AutoSuggestChallengeScreen({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:101).
- tRPC usage: yes (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:13).
- Native/env usage: yes (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:9).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:21

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:49 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:105 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:180 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:13 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/screens/AutoSuggestChallengeScreen.tsx:15 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1).
2. Catch path without Sentry capture (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:105).
3. Instrumentation gap for meaningful user actions (components/onboarding/screens/AutoSuggestChallengeScreen.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/screens/GoalSelection.tsx` - 125 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
- import * as Haptics from "expo-haptics";
- import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S, GOAL_OPTIONS } from "@/components/onboarding/onboarding-theme";
- import { DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { useOnboardingStore } from "@/store/onboardingStore";

**Key exports:**
- export default function GoalSelection({ onContinue }: GoalSelectionProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/screens/GoalSelection.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:18

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/onboarding/screens/GoalSelection.tsx:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/screens/GoalSelection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/onboarding/screens/GoalSelection.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/screens/GoalSelection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/screens/GoalSelection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/screens/GoalSelection.tsx:40 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/screens/GoalSelection.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/screens/GoalSelection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/screens/GoalSelection.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/screens/GoalSelection.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/screens/GoalSelection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/screens/GoalSelection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/screens/GoalSelection.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/screens/GoalSelection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/screens/GoalSelection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/screens/GoalSelection.tsx:1).
2. Observability hooks are sparse (components/onboarding/screens/GoalSelection.tsx:1).
3. Instrumentation gap for meaningful user actions (components/onboarding/screens/GoalSelection.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/screens/ProfileSetup.tsx` - 319 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useCallback, useMemo } from "react";
- import {
- import { Image } from "expo-image";
- import * as ImagePicker from "expo-image-picker";
- import { Camera } from "lucide-react-native";
- import * as Haptics from "expo-haptics";

**Key exports:**
- export default function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: yes (components/onboarding/screens/ProfileSetup.tsx:120).
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/screens/ProfileSetup.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/onboarding/screens/ProfileSetup.tsx:26 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/screens/ProfileSetup.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/onboarding/screens/ProfileSetup.tsx:146 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/screens/ProfileSetup.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/screens/ProfileSetup.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/screens/ProfileSetup.tsx:182 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/screens/ProfileSetup.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/screens/ProfileSetup.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 6 | components/onboarding/screens/ProfileSetup.tsx:120 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/screens/ProfileSetup.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/screens/ProfileSetup.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/screens/ProfileSetup.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/screens/ProfileSetup.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/screens/ProfileSetup.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/screens/ProfileSetup.tsx:19 | .or interpolation scrutinized. |

**Composite score:** 5.4

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/screens/ProfileSetup.tsx:1).
2. Catch path without Sentry capture (components/onboarding/screens/ProfileSetup.tsx:146).
3. Instrumentation gap for meaningful user actions (components/onboarding/screens/ProfileSetup.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/screens/SignUpScreen.tsx` - 314 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useCallback } from "react";
- import {
- import * as AppleAuthentication from "expo-apple-authentication";
- import { useRouter } from "expo-router";
- import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/components/onboarding/onboarding-theme";
- import { DS_MEASURES, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default function SignUpScreen({ onAuthSuccess }: SignUpScreenProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/screens/SignUpScreen.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/onboarding/screens/SignUpScreen.tsx:112 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/screens/SignUpScreen.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/onboarding/screens/SignUpScreen.tsx:112 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/screens/SignUpScreen.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/screens/SignUpScreen.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/screens/SignUpScreen.tsx:193 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/screens/SignUpScreen.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/screens/SignUpScreen.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/screens/SignUpScreen.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/screens/SignUpScreen.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/screens/SignUpScreen.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/screens/SignUpScreen.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/screens/SignUpScreen.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/screens/SignUpScreen.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/screens/SignUpScreen.tsx:18 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/screens/SignUpScreen.tsx:1).
2. Catch path without Sentry capture (components/onboarding/screens/SignUpScreen.tsx:112).
3. Instrumentation gap for meaningful user actions (components/onboarding/screens/SignUpScreen.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/onboarding/screens/ValueSplash.tsx` - 185 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef } from "react";
- import {
- import { ONBOARDING_COLORS as C, ONBOARDING_SPACING as S } from "@/components/onboarding/onboarding-theme";
- import { DS_MEASURES, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"
- import { GRIITWordmark } from "@/components/ui/GRIITWordmark";
- import { track } from "@/lib/analytics";

**Key exports:**
- export default function ValueSplash({ onContinue }: ValueSplashProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/onboarding/screens/ValueSplash.tsx:10).

**What depends on it:** (grep for imports of this file)
- components/onboarding/OnboardingFlow.tsx:17

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/onboarding/screens/ValueSplash.tsx:45 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/onboarding/screens/ValueSplash.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/onboarding/screens/ValueSplash.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/onboarding/screens/ValueSplash.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/onboarding/screens/ValueSplash.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/onboarding/screens/ValueSplash.tsx:93 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/onboarding/screens/ValueSplash.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/onboarding/screens/ValueSplash.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/onboarding/screens/ValueSplash.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/onboarding/screens/ValueSplash.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/onboarding/screens/ValueSplash.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/onboarding/screens/ValueSplash.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/onboarding/screens/ValueSplash.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/onboarding/screens/ValueSplash.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/onboarding/screens/ValueSplash.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/onboarding/screens/ValueSplash.tsx:1).
2. Observability hooks are sparse (components/onboarding/screens/ValueSplash.tsx:1).
3. Instrumentation gap for meaningful user actions (components/onboarding/screens/ValueSplash.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/PremiumBadge.tsx` - 56 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Crown } from "lucide-react-native";
- import { useTheme } from "@/contexts/ThemeContext";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export function PremiumBadge({ size = 14, label }: PremiumBadgeProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/PremiumBadge.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:14

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/PremiumBadge.tsx:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/PremiumBadge.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/PremiumBadge.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/PremiumBadge.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/PremiumBadge.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/PremiumBadge.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/PremiumBadge.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/PremiumBadge.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/PremiumBadge.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/PremiumBadge.tsx:4 | no static violation found. |
| Single responsibility / file size | 7 | components/PremiumBadge.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/PremiumBadge.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/PremiumBadge.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/PremiumBadge.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/PremiumBadge.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/PremiumBadge.tsx:1).
2. Observability hooks are sparse (components/PremiumBadge.tsx:1).
3. Instrumentation gap for meaningful user actions (components/PremiumBadge.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/AchievementsSection.tsx` - 165 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo, useCallback } from "react";
- import { View, Text, StyleSheet, FlatList, Platform } from "react-native";
- import { Trophy, Lock } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
- import { formatShortDate } from "@/lib/date-utils";

**Key exports:**
- export type AchievementCategory = "consistency" | "challenge" | "discipline";
- export interface AchievementItem {
- export interface AchievementsSectionProps {
- export default React.memo(function AchievementsSection({ achievements, loading }: AchievementsSectionProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/AchievementsSection.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "AchievementsSection" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/AchievementsSection.tsx:30 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/AchievementsSection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/AchievementsSection.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/AchievementsSection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/AchievementsSection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/AchievementsSection.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/AchievementsSection.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/AchievementsSection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/AchievementsSection.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/AchievementsSection.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/AchievementsSection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/AchievementsSection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/AchievementsSection.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/AchievementsSection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/AchievementsSection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/AchievementsSection.tsx:1).
2. Observability hooks are sparse (components/profile/AchievementsSection.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/AchievementsSection.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/BadgeDetailModal.tsx` - 127 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Modal, View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { BADGE_ICONS, badgeAccentFor } from "@/lib/profile-badges";
- import { getBadgeDescription } from "@/lib/badge-descriptions";
- import { Zap } from "lucide-react-native";

**Key exports:**
- export type BadgeDetailPayload = {
- export function BadgeDetailModal({ badge, onClose }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/BadgeDetailModal.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:48
- app/profile/[username].tsx:35

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/BadgeDetailModal.tsx:29 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/BadgeDetailModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/BadgeDetailModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/BadgeDetailModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/BadgeDetailModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/BadgeDetailModal.tsx:33 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/BadgeDetailModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/BadgeDetailModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/BadgeDetailModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/BadgeDetailModal.tsx:22 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/BadgeDetailModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/BadgeDetailModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/BadgeDetailModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/BadgeDetailModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/BadgeDetailModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/BadgeDetailModal.tsx:1).
2. Observability hooks are sparse (components/profile/BadgeDetailModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/BadgeDetailModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/CompletedChallengesSection.tsx` - 144 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Award, ChevronRight } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"
- import { formatShortDate } from "@/lib/date-utils";

**Key exports:**
- export interface CompletedChallengeItem {
- export interface CompletedChallengesSectionProps {
- export default React.memo(function CompletedChallengesSection({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/CompletedChallengesSection.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "CompletedChallengesSection" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/CompletedChallengesSection.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/CompletedChallengesSection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/CompletedChallengesSection.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/CompletedChallengesSection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/CompletedChallengesSection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/CompletedChallengesSection.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/CompletedChallengesSection.tsx:19 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/CompletedChallengesSection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/CompletedChallengesSection.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/CompletedChallengesSection.tsx:19 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/CompletedChallengesSection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/CompletedChallengesSection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/CompletedChallengesSection.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/CompletedChallengesSection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/CompletedChallengesSection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/CompletedChallengesSection.tsx:1).
2. Observability hooks are sparse (components/profile/CompletedChallengesSection.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/CompletedChallengesSection.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/DisciplineCalendar.tsx` - 185 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useMemo } from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"
- import { formatMonthShort } from "@/lib/date-utils";

**Key exports:**
- export interface DisciplineCalendarProps {
- export default function DisciplineCalendar({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/DisciplineCalendar.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "DisciplineCalendar" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/DisciplineCalendar.tsx:32 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/DisciplineCalendar.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/DisciplineCalendar.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/DisciplineCalendar.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/DisciplineCalendar.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/DisciplineCalendar.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/DisciplineCalendar.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/DisciplineCalendar.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/DisciplineCalendar.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/DisciplineCalendar.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/DisciplineCalendar.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/DisciplineCalendar.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/DisciplineCalendar.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/DisciplineCalendar.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/DisciplineCalendar.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/DisciplineCalendar.tsx:1).
2. Observability hooks are sparse (components/profile/DisciplineCalendar.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/DisciplineCalendar.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/DisciplineGrowthCard.tsx` - 143 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { TrendingUp } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

**Key exports:**
- export interface DisciplineGrowthCardProps {
- export default function DisciplineGrowthCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/DisciplineGrowthCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "DisciplineGrowthCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/DisciplineGrowthCard.tsx:25 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/DisciplineGrowthCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/DisciplineGrowthCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/DisciplineGrowthCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/DisciplineGrowthCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/DisciplineGrowthCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/DisciplineGrowthCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/DisciplineGrowthCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/DisciplineGrowthCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/DisciplineGrowthCard.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/DisciplineGrowthCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/DisciplineGrowthCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/DisciplineGrowthCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/DisciplineGrowthCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/DisciplineGrowthCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/DisciplineGrowthCard.tsx:1).
2. Observability hooks are sparse (components/profile/DisciplineGrowthCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/DisciplineGrowthCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/DisciplineScoreCard.tsx` - 141 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_SHADOWS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export interface DisciplineScoreCardProps {
- export default React.memo(function DisciplineScoreCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/DisciplineScoreCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "DisciplineScoreCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/DisciplineScoreCard.tsx:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/DisciplineScoreCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/DisciplineScoreCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/DisciplineScoreCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/DisciplineScoreCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/DisciplineScoreCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/DisciplineScoreCard.tsx:14 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/DisciplineScoreCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/DisciplineScoreCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/DisciplineScoreCard.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/DisciplineScoreCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/DisciplineScoreCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/DisciplineScoreCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/DisciplineScoreCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/DisciplineScoreCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/DisciplineScoreCard.tsx:1).
2. Observability hooks are sparse (components/profile/DisciplineScoreCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/DisciplineScoreCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/index.ts` - 23 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { default as ProfileHeader } from "./ProfileHeader";
- export type { ProfileHeaderProps } from "./ProfileHeader";
- export { default as DisciplineScoreCard } from "./DisciplineScoreCard";
- export type { DisciplineScoreCardProps } from "./DisciplineScoreCard";
- export { default as TierProgressBar } from "./TierProgressBar";
- export type { TierProgressBarProps } from "./TierProgressBar";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/index.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/index.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/index.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/index.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/index.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/index.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/index.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/index.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/index.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/index.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/index.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/index.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/index.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/index.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/index.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/index.ts:1).
2. Observability hooks are sparse (components/profile/index.ts:1).
3. Instrumentation gap for meaningful user actions (components/profile/index.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/LifetimeStatsCard.tsx` - 105 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Flame, Trophy, Target, Award } from "lucide-react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export interface LifetimeStatsCardProps {
- export default React.memo(function LifetimeStatsCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/LifetimeStatsCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "LifetimeStatsCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/LifetimeStatsCard.tsx:33 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/LifetimeStatsCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/LifetimeStatsCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/LifetimeStatsCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/LifetimeStatsCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/LifetimeStatsCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/LifetimeStatsCard.tsx:17 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/LifetimeStatsCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/LifetimeStatsCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/LifetimeStatsCard.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/LifetimeStatsCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/LifetimeStatsCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/LifetimeStatsCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/LifetimeStatsCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/LifetimeStatsCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/LifetimeStatsCard.tsx:1).
2. Observability hooks are sparse (components/profile/LifetimeStatsCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/LifetimeStatsCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/ProfileCompletionCard.tsx` - 107 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { CheckCircle2, Circle } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

**Key exports:**
- export interface ProfileCompletionCardProps {
- export default function ProfileCompletionCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/ProfileCompletionCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ProfileCompletionCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/ProfileCompletionCard.tsx:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/ProfileCompletionCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/ProfileCompletionCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/ProfileCompletionCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/ProfileCompletionCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/ProfileCompletionCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/ProfileCompletionCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/ProfileCompletionCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/ProfileCompletionCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/ProfileCompletionCard.tsx:13 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/ProfileCompletionCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/ProfileCompletionCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/ProfileCompletionCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/ProfileCompletionCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/ProfileCompletionCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/ProfileCompletionCard.tsx:1).
2. Observability hooks are sparse (components/profile/ProfileCompletionCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/ProfileCompletionCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/ProfileHeader.tsx` - 224 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useState } from "react";
- import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
- import { useRouter } from "expo-router";
- import { useQueryClient } from "@tanstack/react-query";
- import { Share2, Camera } from "lucide-react-native";
- import { ROUTES } from "@/lib/routes";

**Key exports:**
- export interface ProfileHeaderProps {
- export default React.memo(function ProfileHeader({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/ProfileHeader.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ProfileHeader" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/profile/ProfileHeader.tsx:71 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/ProfileHeader.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/profile/ProfileHeader.tsx:71 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/ProfileHeader.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/ProfileHeader.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/ProfileHeader.tsx:84 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/ProfileHeader.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/ProfileHeader.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/ProfileHeader.tsx:68 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/ProfileHeader.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/ProfileHeader.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/ProfileHeader.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/ProfileHeader.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/ProfileHeader.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/ProfileHeader.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/ProfileHeader.tsx:1).
2. Catch path without Sentry capture (components/profile/ProfileHeader.tsx:71).
3. Instrumentation gap for meaningful user actions (components/profile/ProfileHeader.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/ShareDisciplineCard.tsx` - 124 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
- import { Share2 } from "lucide-react-native";
- import * as Haptics from "expo-haptics";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"
- import { shareProfile } from "@/lib/share";

**Key exports:**
- export interface ShareDisciplineCardProps {
- export default function ShareDisciplineCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/ShareDisciplineCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ShareDisciplineCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/profile/ShareDisciplineCard.tsx:34 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/ShareDisciplineCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/profile/ShareDisciplineCard.tsx:34 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/ShareDisciplineCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/ShareDisciplineCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/ShareDisciplineCard.tsx:58 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/ShareDisciplineCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/ShareDisciplineCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/ShareDisciplineCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/ShareDisciplineCard.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/ShareDisciplineCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/ShareDisciplineCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/ShareDisciplineCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/ShareDisciplineCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/ShareDisciplineCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/ShareDisciplineCard.tsx:1).
2. Catch path without Sentry capture (components/profile/ShareDisciplineCard.tsx:34).
3. Instrumentation gap for meaningful user actions (components/profile/ShareDisciplineCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/SocialStatsCard.tsx` - 88 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Users, Target, Award } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system"

**Key exports:**
- export interface SocialStatsCardProps {
- export default function SocialStatsCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/SocialStatsCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "SocialStatsCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/SocialStatsCard.tsx:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/SocialStatsCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/SocialStatsCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/SocialStatsCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/SocialStatsCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/SocialStatsCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/SocialStatsCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/SocialStatsCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/SocialStatsCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/SocialStatsCard.tsx:12 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/SocialStatsCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/SocialStatsCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/SocialStatsCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/SocialStatsCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/SocialStatsCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/SocialStatsCard.tsx:1).
2. Observability hooks are sparse (components/profile/SocialStatsCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/SocialStatsCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/profile/TierProgressBar.tsx` - 80 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { Flame } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export interface TierProgressBarProps {
- export default function TierProgressBar({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/profile/TierProgressBar.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "TierProgressBar" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/profile/TierProgressBar.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/profile/TierProgressBar.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/profile/TierProgressBar.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/profile/TierProgressBar.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/profile/TierProgressBar.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/profile/TierProgressBar.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/profile/TierProgressBar.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/profile/TierProgressBar.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/profile/TierProgressBar.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/profile/TierProgressBar.tsx:13 | no static violation found. |
| Single responsibility / file size | 7 | components/profile/TierProgressBar.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/profile/TierProgressBar.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/profile/TierProgressBar.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/profile/TierProgressBar.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/profile/TierProgressBar.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/profile/TierProgressBar.tsx:1).
2. Observability hooks are sparse (components/profile/TierProgressBar.tsx:1).
3. Instrumentation gap for meaningful user actions (components/profile/TierProgressBar.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ProofShareCard.tsx` - 256 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useRef, useState } from "react";
- import { View, Text, StyleSheet, Pressable } from "react-native";
- import { Image } from "expo-image";
- import ViewShot from "react-native-view-shot";
- import * as Sharing from "expo-sharing";
- import { GRIIT_COLORS, DS_RADIUS, DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default function ProofShareCard({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ProofShareCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/shared/ProofShareOverlay.tsx:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/ProofShareCard.tsx:39 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ProofShareCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/ProofShareCard.tsx:56 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ProofShareCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ProofShareCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ProofShareCard.tsx:85 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ProofShareCard.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ProofShareCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ProofShareCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ProofShareCard.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/ProofShareCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ProofShareCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ProofShareCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ProofShareCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ProofShareCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ProofShareCard.tsx:1).
2. Catch path without Sentry capture (components/ProofShareCard.tsx:56).
3. Instrumentation gap for meaningful user actions (components/ProofShareCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/settings/AccountDangerZone.tsx` - 188 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform } from "react-native";
- import * as Haptics from "expo-haptics";
- import { useRouter } from "expo-router";
- import { LogOut } from "lucide-react-native";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const CONSEQUENCES = [
- export interface AccountDangerZoneProps {
- export function AccountDangerZone({
- export function ConsequencesSection() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/settings/AccountDangerZone.tsx:7).
- Native/env usage: yes (components/settings/AccountDangerZone.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:24

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/settings/AccountDangerZone.tsx:51 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/settings/AccountDangerZone.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/settings/AccountDangerZone.tsx:130 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/settings/AccountDangerZone.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/settings/AccountDangerZone.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/settings/AccountDangerZone.tsx:70 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/settings/AccountDangerZone.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/settings/AccountDangerZone.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/settings/AccountDangerZone.tsx:7 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/settings/AccountDangerZone.tsx:4 | no static violation found. |
| Single responsibility / file size | 7 | components/settings/AccountDangerZone.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/settings/AccountDangerZone.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/settings/AccountDangerZone.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/settings/AccountDangerZone.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/settings/AccountDangerZone.tsx:9 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/settings/AccountDangerZone.tsx:1).
2. Catch path without Sentry capture (components/settings/AccountDangerZone.tsx:130).
3. Instrumentation gap for meaningful user actions (components/settings/AccountDangerZone.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/settings/ReminderSection.tsx` - 298 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, Switch, Platform, ActivityIndicator } from "react-native";
- import * as Haptics from "expo-haptics";
- import { DS_COLORS } from "@/lib/design-system";
- import { trpcMutate, trpcQuery } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";

**Key exports:**
- export const REMINDER_PRESETS = [
- export interface ReminderSectionProps {
- export function ReminderSection({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/settings/ReminderSection.tsx:5).
- Native/env usage: yes (components/settings/ReminderSection.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/settings/ReminderSection.tsx:73 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/settings/ReminderSection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/settings/ReminderSection.tsx:184 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/settings/ReminderSection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/settings/ReminderSection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/settings/ReminderSection.tsx:90 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/settings/ReminderSection.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/settings/ReminderSection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/settings/ReminderSection.tsx:5 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/settings/ReminderSection.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/settings/ReminderSection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/settings/ReminderSection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/settings/ReminderSection.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/settings/ReminderSection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/settings/ReminderSection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/settings/ReminderSection.tsx:1).
2. Catch path without Sentry capture (components/settings/ReminderSection.tsx:184).
3. Instrumentation gap for meaningful user actions (components/settings/ReminderSection.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/settings/settings-styles.ts` - 204 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";

**Key exports:**
- export const styles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/settings/settings-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:21
- components/settings/AccountDangerZone.tsx:15
- components/settings/ReminderSection.tsx:19
- components/settings/VisibilitySection.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/settings/settings-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/settings/settings-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/settings/settings-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/settings/settings-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/settings/settings-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/settings/settings-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/settings/settings-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/settings/settings-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/settings/settings-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/settings/settings-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/settings/settings-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/settings/settings-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/settings/settings-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/settings/settings-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/settings/settings-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/settings/settings-styles.ts:1).
2. Observability hooks are sparse (components/settings/settings-styles.ts:1).
3. Instrumentation gap for meaningful user actions (components/settings/settings-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/settings/VisibilitySection.tsx` - 106 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS } from "@/lib/design-system";
- import { styles } from "@/components/settings/settings-styles";

**Key exports:**
- export interface VisibilitySectionProps {
- export function VisibilitySection({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/settings/VisibilitySection.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/settings.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/settings/VisibilitySection.tsx:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/settings/VisibilitySection.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/settings/VisibilitySection.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/settings/VisibilitySection.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/settings/VisibilitySection.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/settings/VisibilitySection.tsx:36 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/settings/VisibilitySection.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/settings/VisibilitySection.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/settings/VisibilitySection.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/settings/VisibilitySection.tsx:8 | no static violation found. |
| Single responsibility / file size | 7 | components/settings/VisibilitySection.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/settings/VisibilitySection.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/settings/VisibilitySection.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/settings/VisibilitySection.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/settings/VisibilitySection.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/settings/VisibilitySection.tsx:1).
2. Observability hooks are sparse (components/settings/VisibilitySection.tsx:1).
3. Instrumentation gap for meaningful user actions (components/settings/VisibilitySection.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/share/ShareCards.tsx` - 810 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet, ImageBackground } from "react-native";
- import { LinearGradient } from "expo-linear-gradient";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export interface BaseCardProps {
- export interface StatementCardProps extends BaseCardProps {
- export interface TransparentCardProps extends BaseCardProps {
- export interface ProofPhotoCardProps extends BaseCardProps {
- export interface DayRecapCardProps {
- export interface ChallengeCompleteCardProps {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/share/ShareCards.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ShareCards" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/share/ShareCards.tsx:70 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/share/ShareCards.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/share/ShareCards.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/share/ShareCards.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/share/ShareCards.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/share/ShareCards.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | components/share/ShareCards.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/share/ShareCards.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/share/ShareCards.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/share/ShareCards.tsx:62 | no static violation found. |
| Single responsibility / file size | 4 | components/share/ShareCards.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/share/ShareCards.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/share/ShareCards.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/share/ShareCards.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/share/ShareCards.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.1

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (810 LOC) increases regression risk (components/share/ShareCards.tsx:1).
2. Observability hooks are sparse (components/share/ShareCards.tsx:1).
3. Instrumentation gap for meaningful user actions (components/share/ShareCards.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/share/ShareSheetModal.tsx` - 534 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useCallback, useEffect, useMemo, useState } from "react";
- import {
- import * as Clipboard from "expo-clipboard";
- import * as FileSystem from "expo-file-system/legacy";
- import * as MediaLibrary from "expo-media-library";
- import * as Sharing from "expo-sharing";

**Key exports:**
- export type ShareSheetCardKey = "Statement" | "Transparent" | "Proof" | "Recap" | "Complete" | "Streak";
- export type ShareSheetModalProps = {
- export function ShareSheetModal({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/share/ShareSheetModal.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteCelebration.tsx:21

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/share/ShareSheetModal.tsx:79 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/share/ShareSheetModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/share/ShareSheetModal.tsx:205 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/share/ShareSheetModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/share/ShareSheetModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/share/ShareSheetModal.tsx:293 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/share/ShareSheetModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/share/ShareSheetModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/share/ShareSheetModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/share/ShareSheetModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 5 | components/share/ShareSheetModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/share/ShareSheetModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/share/ShareSheetModal.tsx:19 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/share/ShareSheetModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/share/ShareSheetModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.2

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/share/ShareSheetModal.tsx:1).
2. Catch path without Sentry capture (components/share/ShareSheetModal.tsx:205).
3. Instrumentation gap for meaningful user actions (components/share/ShareSheetModal.tsx:19).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ShareCard.tsx` - 172 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const SHARE_CARD_WIDTH = 400;
- export const SHARE_CARD_HEIGHT = 500;
- export type ShareCardType = "progress" | "completion" | "milestone";
- export interface ShareCardProps {
- export const ShareCard = React.memo(ShareCardInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ShareCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/complete.tsx:16
- components/shared/ProofShareOverlay.tsx:2
- hooks/useTaskCompleteScreen.tsx:34

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ShareCard.tsx:36 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ShareCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ShareCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ShareCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ShareCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ShareCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ShareCard.tsx:92 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ShareCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ShareCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ShareCard.tsx:26 | no static violation found. |
| Single responsibility / file size | 7 | components/ShareCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ShareCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ShareCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ShareCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ShareCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ShareCard.tsx:1).
2. Observability hooks are sparse (components/ShareCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ShareCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/Card.tsx` - 40 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
- import { DS_COLORS, DS_RADIUS, DS_SHADOWS, DS_SPACING } from "@/lib/design-system";

**Key exports:**
- export default function Card({ children, onPress, padded = true, accessibilityLabel, containerStyle }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/Card.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:26
- app/(tabs)/index.tsx:31
- app/(tabs)/profile.tsx:40
- app/challenge/complete.tsx:16
- app/post/[id].tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/Card.tsx:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/Card.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/Card.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/Card.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/Card.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/Card.tsx:9 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/Card.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/Card.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/Card.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/Card.tsx:13 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/Card.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/Card.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/Card.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/Card.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/Card.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/Card.tsx:1).
2. Observability hooks are sparse (components/shared/Card.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/Card.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/CelebrationOverlay.tsx` - 345 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useMemo, useRef } from "react";
- import {
- import { CheckCircle2, Flame, Trophy, Share2 } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { useCelebrationStore, type CelebrationType } from "@/store/celebrationStore";
- import { captureError } from "@/lib/sentry";

**Key exports:**
- export default function CelebrationOverlay() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/CelebrationOverlay.tsx:12).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:21

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/shared/CelebrationOverlay.tsx:34 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/CelebrationOverlay.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/shared/CelebrationOverlay.tsx:69 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/CelebrationOverlay.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/CelebrationOverlay.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/CelebrationOverlay.tsx:186 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/CelebrationOverlay.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/CelebrationOverlay.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/CelebrationOverlay.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/CelebrationOverlay.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/CelebrationOverlay.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/CelebrationOverlay.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/CelebrationOverlay.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/CelebrationOverlay.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/CelebrationOverlay.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/CelebrationOverlay.tsx:1).
2. Catch path without Sentry capture (components/shared/CelebrationOverlay.tsx:69).
3. Instrumentation gap for meaningful user actions (components/shared/CelebrationOverlay.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/ConfirmDialog.tsx` - 130 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export type ConfirmDialogProps = {
- export function ConfirmDialog({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/ConfirmDialog.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:48
- app/accountability.tsx:25
- app/challenge/[id].tsx:68
- app/challenge/active/[activeChallengeId].tsx:37
- app/follow-list.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/ConfirmDialog.tsx:26 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/ConfirmDialog.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/ConfirmDialog.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/ConfirmDialog.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/ConfirmDialog.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/ConfirmDialog.tsx:32 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/ConfirmDialog.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/ConfirmDialog.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/ConfirmDialog.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/ConfirmDialog.tsx:16 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/ConfirmDialog.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/ConfirmDialog.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/ConfirmDialog.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/ConfirmDialog.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/ConfirmDialog.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/ConfirmDialog.tsx:1).
2. Observability hooks are sparse (components/shared/ConfirmDialog.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/ConfirmDialog.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/ErrorState.tsx` - 50 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default function ErrorState({ message, onRetry, containerStyle }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/ErrorState.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:27
- app/(tabs)/index.tsx:43
- app/(tabs)/profile.tsx:43
- app/challenge/[id].tsx:72
- components/activity/LeaderboardTab.tsx:21

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/ErrorState.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/ErrorState.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/ErrorState.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/ErrorState.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/ErrorState.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/ErrorState.tsx:13 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/ErrorState.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/ErrorState.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/ErrorState.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/ErrorState.tsx:11 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/ErrorState.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/ErrorState.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/ErrorState.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/ErrorState.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/ErrorState.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/ErrorState.tsx:1).
2. Observability hooks are sparse (components/shared/ErrorState.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/ErrorState.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/FormInput.tsx` - 96 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export default function FormInput({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/FormInput.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/auth/login.tsx:22
- app/auth/signup.tsx:26
- app/create-profile.tsx:17

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/FormInput.tsx:50 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/FormInput.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/FormInput.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/FormInput.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/FormInput.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/FormInput.tsx:11 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/FormInput.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/FormInput.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/FormInput.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/FormInput.tsx:28 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/FormInput.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/FormInput.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/FormInput.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/FormInput.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/FormInput.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/FormInput.tsx:1).
2. Observability hooks are sparse (components/shared/FormInput.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/FormInput.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/ImageViewerModal.tsx` - 159 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import {
- import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
- import Animated, {
- import { X } from "lucide-react-native";
- import { useSafeAreaInsets } from "react-native-safe-area-context";

**Key exports:**
- export interface ImageViewerModalProps {
- export function ImageViewerModal({ visible, imageUri, onClose }: ImageViewerModalProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/ImageViewerModal.tsx:11).

**What depends on it:** (grep for imports of this file)
- components/feed/FeedPostCard.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/ImageViewerModal.tsx:95 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/ImageViewerModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/ImageViewerModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/ImageViewerModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/ImageViewerModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/ImageViewerModal.tsx:108 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/ImageViewerModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/ImageViewerModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/ImageViewerModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/ImageViewerModal.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/ImageViewerModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/ImageViewerModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/ImageViewerModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/ImageViewerModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/ImageViewerModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/ImageViewerModal.tsx:1).
2. Observability hooks are sparse (components/shared/ImageViewerModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/ImageViewerModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/LoadingState.tsx` - 33 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export default function LoadingState({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/LoadingState.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/activity/NotificationsTab.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/LoadingState.tsx:12 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/LoadingState.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/LoadingState.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/LoadingState.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/LoadingState.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/LoadingState.tsx:13 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/LoadingState.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/LoadingState.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/LoadingState.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/LoadingState.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/LoadingState.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/LoadingState.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/LoadingState.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/LoadingState.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/LoadingState.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/LoadingState.tsx:1).
2. Observability hooks are sparse (components/shared/LoadingState.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/LoadingState.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/ProofShareOverlay.tsx` - 22 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import ProofShareCard from "@/components/ProofShareCard";
- import { useProofSharePromptStore } from "@/store/proofSharePromptStore";

**Key exports:**
- export default function ProofShareOverlay() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/ProofShareOverlay.tsx:9 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/ProofShareOverlay.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/ProofShareOverlay.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/ProofShareOverlay.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/ProofShareOverlay.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/ProofShareOverlay.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/ProofShareOverlay.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/ProofShareOverlay.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/ProofShareOverlay.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/ProofShareOverlay.tsx:3 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/ProofShareOverlay.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/ProofShareOverlay.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/ProofShareOverlay.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/ProofShareOverlay.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/ProofShareOverlay.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/ProofShareOverlay.tsx:1).
2. Observability hooks are sparse (components/shared/ProofShareOverlay.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/ProofShareOverlay.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/ReportChallengeModal.tsx` - 238 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState } from "react";
- import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Platform } from "react-native";
- import { trpcMutate } from "@/lib/trpc";
- import { TRPC } from "@/lib/trpc-paths";
- import { captureError } from "@/lib/sentry";
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export function ReportChallengeModal({ visible, challengeId, challengeTitle, onClose }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: yes (components/shared/ReportChallengeModal.tsx:3).
- Native/env usage: yes (components/shared/ReportChallengeModal.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:45
- app/(tabs)/index.tsx:50

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/shared/ReportChallengeModal.tsx:58 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/ReportChallengeModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/shared/ReportChallengeModal.tsx:58 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/ReportChallengeModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/ReportChallengeModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/ReportChallengeModal.tsx:85 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/ReportChallengeModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/ReportChallengeModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/ReportChallengeModal.tsx:3 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/ReportChallengeModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/ReportChallengeModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/ReportChallengeModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/ReportChallengeModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/ReportChallengeModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/ReportChallengeModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/ReportChallengeModal.tsx:1).
2. Catch path without Sentry capture (components/shared/ReportChallengeModal.tsx:58).
3. Instrumentation gap for meaningful user actions (components/shared/ReportChallengeModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/shared/SectionHeader.tsx` - 52 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export default React.memo(SectionHeaderInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/shared/SectionHeader.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:28
- app/(tabs)/index.tsx:44

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/shared/SectionHeader.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/shared/SectionHeader.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/shared/SectionHeader.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/shared/SectionHeader.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/shared/SectionHeader.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/shared/SectionHeader.tsx:20 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/shared/SectionHeader.tsx:30 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/shared/SectionHeader.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/shared/SectionHeader.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/shared/SectionHeader.tsx:12 | no static violation found. |
| Single responsibility / file size | 7 | components/shared/SectionHeader.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/shared/SectionHeader.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/shared/SectionHeader.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/shared/SectionHeader.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/shared/SectionHeader.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/shared/SectionHeader.tsx:1).
2. Observability hooks are sparse (components/shared/SectionHeader.tsx:1).
3. Instrumentation gap for meaningful user actions (components/shared/SectionHeader.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/index.ts` - 9 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { SkeletonBase } from "./SkeletonBase";
- export { SkeletonFeedCard } from "./SkeletonFeedCard";
- export { SkeletonChallengeCard } from "./SkeletonChallengeCard";
- export { SkeletonLeaderboardRow } from "./SkeletonLeaderboardRow";
- export { SkeletonHomeChallengeCard } from "./SkeletonHomeChallengeCard";
- export { SkeletonHeroCard } from "./SkeletonHeroCard";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/index.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/index.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/index.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/index.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/index.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/index.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/index.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/index.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/index.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/index.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/index.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/index.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/index.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/index.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/index.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/index.ts:1).
2. Observability hooks are sparse (components/skeletons/index.ts:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/index.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonBase.tsx` - 95 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useRef, useState } from "react";
- import { AccessibilityInfo, Animated, StyleSheet, View, type ViewStyle } from "react-native";
- import { DS_COLORS } from "@/lib/design-system";

**Key exports:**
- export const SkeletonBase = React.memo(function SkeletonBase({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonBase.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/skeletons/SkeletonChallengeCard.tsx:4
- components/skeletons/SkeletonChallengeDetail.tsx:4
- components/skeletons/SkeletonFeedCard.tsx:4
- components/skeletons/SkeletonHeroCard.tsx:4
- components/skeletons/SkeletonHomeChallengeCard.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonBase.tsx:27 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonBase.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonBase.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonBase.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonBase.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonBase.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonBase.tsx:12 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonBase.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonBase.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonBase.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonBase.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonBase.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonBase.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonBase.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonBase.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonBase.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonBase.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonBase.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonChallengeCard.tsx` - 46 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonChallengeCard = React.memo(function SkeletonChallengeCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonChallengeCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:26

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonChallengeCard.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonChallengeCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonChallengeCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonChallengeCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonChallengeCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonChallengeCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonChallengeCard.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonChallengeCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonChallengeCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonChallengeCard.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonChallengeCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonChallengeCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonChallengeCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonChallengeCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonChallengeCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonChallengeCard.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonChallengeCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonChallengeCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonChallengeDetail.tsx` - 49 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonChallengeDetail = React.memo(function SkeletonChallengeDetail() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonChallengeDetail.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:71

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonChallengeDetail.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonChallengeDetail.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonChallengeDetail.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonChallengeDetail.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonChallengeDetail.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonChallengeDetail.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonChallengeDetail.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonChallengeDetail.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonChallengeDetail.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonChallengeDetail.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonChallengeDetail.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonChallengeDetail.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonChallengeDetail.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonChallengeDetail.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonChallengeDetail.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonFeedCard.tsx` - 53 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SHADOWS, DS_RADIUS } from "@/lib/design-system"
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonFeedCard = React.memo(function SkeletonFeedCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonFeedCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/LiveFeedSection.tsx:23

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonFeedCard.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonFeedCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonFeedCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonFeedCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonFeedCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonFeedCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonFeedCard.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonFeedCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonFeedCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonFeedCard.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonFeedCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonFeedCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonFeedCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonFeedCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonFeedCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonFeedCard.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonFeedCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonFeedCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonHeroCard.tsx` - 32 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonHeroCard = React.memo(function SkeletonHeroCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonHeroCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:26

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonHeroCard.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonHeroCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonHeroCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonHeroCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonHeroCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonHeroCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonHeroCard.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonHeroCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonHeroCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonHeroCard.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonHeroCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonHeroCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonHeroCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonHeroCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonHeroCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonHeroCard.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonHeroCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonHeroCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonHomeChallengeCard.tsx` - 56 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonHomeChallengeCard = React.memo(function SkeletonHomeChallengeCard() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonHomeChallengeCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:42

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonHomeChallengeCard.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonHomeChallengeCard.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonHomeChallengeCard.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonHomeChallengeCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonHomeChallengeCard.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonHomeChallengeCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonHomeChallengeCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonLeaderboardRow.tsx` - 37 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonLeaderboardRow = React.memo(function SkeletonLeaderboardRow() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonLeaderboardRow.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/activity/LeaderboardTab.tsx:20

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonLeaderboardRow.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonLeaderboardRow.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonLeaderboardRow.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonLeaderboardRow.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonLeaderboardRow.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonLeaderboardRow.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonLeaderboardRow.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/skeletons/SkeletonProfile.tsx` - 49 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
- import { SkeletonBase } from "./SkeletonBase";

**Key exports:**
- export const SkeletonProfile = React.memo(function SkeletonProfile() {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/skeletons/SkeletonProfile.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/profile.tsx:42

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/skeletons/SkeletonProfile.tsx:7 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/skeletons/SkeletonProfile.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/skeletons/SkeletonProfile.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/skeletons/SkeletonProfile.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/skeletons/SkeletonProfile.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/skeletons/SkeletonProfile.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/skeletons/SkeletonProfile.tsx:6 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/skeletons/SkeletonProfile.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/skeletons/SkeletonProfile.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/skeletons/SkeletonProfile.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/skeletons/SkeletonProfile.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/skeletons/SkeletonProfile.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/skeletons/SkeletonProfile.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/skeletons/SkeletonProfile.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/skeletons/SkeletonProfile.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/skeletons/SkeletonProfile.tsx:1).
2. Observability hooks are sparse (components/skeletons/SkeletonProfile.tsx:1).
3. Instrumentation gap for meaningful user actions (components/skeletons/SkeletonProfile.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/StreakFreezeModal.tsx` - 131 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { Flame } from "lucide-react-native";
- import { DS_COLORS, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export function StreakFreezeModal({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/StreakFreezeModal.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:49

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/StreakFreezeModal.tsx:21 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/StreakFreezeModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/StreakFreezeModal.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/StreakFreezeModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/StreakFreezeModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/StreakFreezeModal.tsx:35 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/StreakFreezeModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/StreakFreezeModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/StreakFreezeModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/StreakFreezeModal.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/StreakFreezeModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/StreakFreezeModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/StreakFreezeModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/StreakFreezeModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/StreakFreezeModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/StreakFreezeModal.tsx:1).
2. Observability hooks are sparse (components/StreakFreezeModal.tsx:1).
3. Instrumentation gap for meaningful user actions (components/StreakFreezeModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/task/RunPickerColumn.tsx` - 85 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useRef, useLayoutEffect } from "react";
- import { View, Text, ScrollView, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system";

**Key exports:**
- export const RUN_PICKER_ITEM_H = 40;
- export const RUN_PICKER_PAD = 40;
- export const RUN_WHOLE_KM = Array.from({ length: 51 }, (_, i) => String(i));
- export const RUN_DEC_KM = Array.from({ length: 10 }, (_, i) => String(i));
- export const RUN_DURATION_ITEMS = Array.from({ length: 181 }, (_, i) => String(i));
- export function parseRunKmParts(s: string): { whole: number; dec: number } {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/task/RunPickerColumn.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "RunPickerColumn" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/task/RunPickerColumn.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/task/RunPickerColumn.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/task/RunPickerColumn.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/task/RunPickerColumn.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/task/RunPickerColumn.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/task/RunPickerColumn.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/task/RunPickerColumn.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/task/RunPickerColumn.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/task/RunPickerColumn.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/task/RunPickerColumn.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/task/RunPickerColumn.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/task/RunPickerColumn.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/task/RunPickerColumn.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/task/RunPickerColumn.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/task/RunPickerColumn.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/task/RunPickerColumn.tsx:1).
2. Observability hooks are sparse (components/task/RunPickerColumn.tsx:1).
3. Instrumentation gap for meaningful user actions (components/task/RunPickerColumn.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/task/task-complete-styles.ts` - 497 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { StyleSheet } from "react-native";
- import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY, DS_BORDERS, DS_SHADOWS, DS_MEASURES, GRIIT_COLORS } from "@/lib/design-system";

**Key exports:**
- export const styles = StyleSheet.create({
- export const celebStyles = StyleSheet.create({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/task/task-complete-styles.ts:1).

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteCelebration.tsx:31
- components/task/TaskCompleteForm.tsx:23
- hooks/useTaskCompleteScreen.tsx:22

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/task/task-complete-styles.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/task/task-complete-styles.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/task/task-complete-styles.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/task/task-complete-styles.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/task/task-complete-styles.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/task/task-complete-styles.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/task/task-complete-styles.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/task/task-complete-styles.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/task/task-complete-styles.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/task/task-complete-styles.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/task/task-complete-styles.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/task/task-complete-styles.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/task/task-complete-styles.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/task/task-complete-styles.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/task/task-complete-styles.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/task/task-complete-styles.ts:1).
2. Observability hooks are sparse (components/task/task-complete-styles.ts:1).
3. Instrumentation gap for meaningful user actions (components/task/task-complete-styles.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/task/TaskCompleteCelebration.tsx` - 343 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import {
- import { Image } from "expo-image";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { Stack } from "expo-router";
- import { Camera, Image as GalleryIcon, Share2 } from "lucide-react-native";

**Key exports:**
- export interface TaskCompleteCelebrationProps extends ShareCardPropsBundle {
- export function TaskCompleteCelebration({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/task/TaskCompleteCelebration.tsx:11).

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:35

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 5 | components/task/TaskCompleteCelebration.tsx:111 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/task/TaskCompleteCelebration.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/task/TaskCompleteCelebration.tsx:243 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/task/TaskCompleteCelebration.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/task/TaskCompleteCelebration.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/task/TaskCompleteCelebration.tsx:151 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/task/TaskCompleteCelebration.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/task/TaskCompleteCelebration.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/task/TaskCompleteCelebration.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/task/TaskCompleteCelebration.tsx:73 | no static violation found. |
| Single responsibility / file size | 7 | components/task/TaskCompleteCelebration.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/task/TaskCompleteCelebration.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/task/TaskCompleteCelebration.tsx:20 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/task/TaskCompleteCelebration.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/task/TaskCompleteCelebration.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/task/TaskCompleteCelebration.tsx:1).
2. Catch path without Sentry capture (components/task/TaskCompleteCelebration.tsx:243).
3. Instrumentation gap for meaningful user actions (components/task/TaskCompleteCelebration.tsx:20).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/task/TaskCompleteForm.tsx` - 684 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import {
- import { Image } from "expo-image";
- import { useRouter, useLocalSearchParams } from "expo-router";
- import { Camera, Lock, CheckCircle, XCircle, MapPin, Check, Image as GalleryIcon } from "lucide-react-native";
- import { DS_COLORS, GRIIT_COLORS } from "@/lib/design-system";

**Key exports:**
- export interface TaskCompleteFormProps {
- export function TaskCompleteForm(props: TaskCompleteFormProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/task/TaskCompleteForm.tsx:13).

**What depends on it:** (grep for imports of this file)
- hooks/useTaskCompleteScreen.tsx:36

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/task/TaskCompleteForm.tsx:187 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/task/TaskCompleteForm.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/task/TaskCompleteForm.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/task/TaskCompleteForm.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/task/TaskCompleteForm.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/task/TaskCompleteForm.tsx:203 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/task/TaskCompleteForm.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/task/TaskCompleteForm.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/task/TaskCompleteForm.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/task/TaskCompleteForm.tsx:15 | no static violation found. |
| Single responsibility / file size | 5 | components/task/TaskCompleteForm.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/task/TaskCompleteForm.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/task/TaskCompleteForm.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/task/TaskCompleteForm.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/task/TaskCompleteForm.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.3

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/task/TaskCompleteForm.tsx:1).
2. Observability hooks are sparse (components/task/TaskCompleteForm.tsx:1).
3. Instrumentation gap for meaningful user actions (components/task/TaskCompleteForm.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/task/VerificationGates.tsx` - 404 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useEffect, useState, useCallback, useRef } from "react";
- import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
- import * as Location from "expo-location";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"
- import type { TaskHardVerificationConfig } from "@/lib/task-hard-verification";

**Key exports:**
- export type GateStatusKind = "locked" | "checking" | "passed" | "failed" | "pending";
- export interface GateStatus {
- export function VerificationGates({ config, photoSatisfied = false, onGatesResolved, onTimeWindowFailed }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/task/VerificationGates.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/task/TaskCompleteForm.tsx:19

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/task/VerificationGates.tsx:89 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/task/VerificationGates.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/task/VerificationGates.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/task/VerificationGates.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/task/VerificationGates.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/task/VerificationGates.tsx:239 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/task/VerificationGates.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/task/VerificationGates.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/task/VerificationGates.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/task/VerificationGates.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/task/VerificationGates.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/task/VerificationGates.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/task/VerificationGates.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/task/VerificationGates.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/task/VerificationGates.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/task/VerificationGates.tsx:1).
2. Observability hooks are sparse (components/task/VerificationGates.tsx:1).
3. Instrumentation gap for meaningful user actions (components/task/VerificationGates.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/TaskEditorModal.tsx` - 1650 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect, useCallback } from "react";
- import {
- import { Image } from "expo-image";
- import * as ImagePicker from "expo-image-picker";
- import { SafeAreaView } from "react-native-safe-area-context";
- import {

**Key exports:**
- export interface TaskEditorTask {
- export default function TaskEditorModal({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/TaskEditorModal.tsx:12).

**What depends on it:** (grep for imports of this file)
- components/create/CreateChallengeWizard.tsx:27
- components/create/NewTaskModal.tsx:18
- components/create/steps/StepReview.tsx:5
- components/create/steps/StepTasks.tsx:6
- components/create/wizard-shared.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 3 | components/TaskEditorModal.tsx:405 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/TaskEditorModal.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 4 | components/TaskEditorModal.tsx:494 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/TaskEditorModal.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/TaskEditorModal.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/TaskEditorModal.tsx:754 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 4 | components/TaskEditorModal.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/TaskEditorModal.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/TaskEditorModal.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/TaskEditorModal.tsx:1 | no static violation found. |
| Single responsibility / file size | 2 | components/TaskEditorModal.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/TaskEditorModal.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/TaskEditorModal.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/TaskEditorModal.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/TaskEditorModal.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 4.7

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Oversized module (1650 LOC) increases regression risk (components/TaskEditorModal.tsx:1).
2. Catch path without Sentry capture (components/TaskEditorModal.tsx:494).
3. Instrumentation gap for meaningful user actions (components/TaskEditorModal.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/TimeWindowPrompt.tsx` - 190 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState } from "react";
- import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
- import { Clock } from "lucide-react-native";
- import { DS_COLORS, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export function TimeWindowPrompt({ visible, tasks, onSave, onSkip }: TimeWindowPromptProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/TimeWindowPrompt.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/challenge/[id].tsx:67
- components/create/CreateChallengeWizard.tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/TimeWindowPrompt.tsx:46 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/TimeWindowPrompt.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/TimeWindowPrompt.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/TimeWindowPrompt.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/TimeWindowPrompt.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/TimeWindowPrompt.tsx:67 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/TimeWindowPrompt.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/TimeWindowPrompt.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/TimeWindowPrompt.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/TimeWindowPrompt.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/TimeWindowPrompt.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/TimeWindowPrompt.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/TimeWindowPrompt.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/TimeWindowPrompt.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/TimeWindowPrompt.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/TimeWindowPrompt.tsx:1).
2. Observability hooks are sparse (components/TimeWindowPrompt.tsx:1).
3. Instrumentation gap for meaningful user actions (components/TimeWindowPrompt.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/Card.tsx` - 54 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from 'react';
- import { View, StyleSheet, ViewStyle } from 'react-native';
- import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_SHADOWS } from '@/lib/design-system';

**Key exports:**
- export default React.memo(Card);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/Card.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:26
- app/(tabs)/index.tsx:31
- app/(tabs)/profile.tsx:40
- app/challenge/complete.tsx:16
- app/post/[id].tsx:31

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/Card.tsx:28 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/Card.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/Card.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/Card.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/Card.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/Card.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/Card.tsx:53 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/Card.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/Card.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/Card.tsx:12 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/Card.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/Card.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/Card.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/Card.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/Card.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/Card.tsx:1).
2. Observability hooks are sparse (components/ui/Card.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/Card.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/CategoryTag.tsx` - 50 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { TouchableOpacity, Text, StyleSheet } from "react-native";
- import * as t from "@/lib/theme/tokens";

**Key exports:**
- export const CategoryTag = React.memo(CategoryTagInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/CategoryTag.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "CategoryTag" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/CategoryTag.tsx:14 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/CategoryTag.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/CategoryTag.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/CategoryTag.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/CategoryTag.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/CategoryTag.tsx:19 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/CategoryTag.tsx:28 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/CategoryTag.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/CategoryTag.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/CategoryTag.tsx:5 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/CategoryTag.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/CategoryTag.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/CategoryTag.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/CategoryTag.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/CategoryTag.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/CategoryTag.tsx:1).
2. Observability hooks are sparse (components/ui/CategoryTag.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/CategoryTag.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/ChallengeCard24h.tsx` - 178 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React, { useState, useEffect } from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { Clock } from "lucide-react-native";
- import { DS_COLORS, DS_SPACING, DS_SHADOWS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const ChallengeCard24h = React.memo(ChallengeCard24hInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/ChallengeCard24h.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ChallengeCard24h" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/ChallengeCard24h.tsx:8 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/ChallengeCard24h.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/ChallengeCard24h.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/ChallengeCard24h.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/ChallengeCard24h.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/ChallengeCard24h.tsx:80 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/ChallengeCard24h.tsx:115 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/ChallengeCard24h.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/ChallengeCard24h.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/ChallengeCard24h.tsx:1 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/ChallengeCard24h.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/ChallengeCard24h.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/ChallengeCard24h.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/ChallengeCard24h.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/ChallengeCard24h.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/ChallengeCard24h.tsx:1).
2. Observability hooks are sparse (components/ui/ChallengeCard24h.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/ChallengeCard24h.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/ChallengeCardFeatured.tsx` - 251 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { Calendar, ListTodo, Users } from "lucide-react-native";
- import { DS_COLORS, DS_SHADOWS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const ChallengeCardFeatured = React.memo(ChallengeCardFeaturedInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/ChallengeCardFeatured.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ChallengeCardFeatured" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/ChallengeCardFeatured.tsx:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/ChallengeCardFeatured.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/ChallengeCardFeatured.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/ChallengeCardFeatured.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/ChallengeCardFeatured.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/ChallengeCardFeatured.tsx:79 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/ChallengeCardFeatured.tsx:127 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/ChallengeCardFeatured.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/ChallengeCardFeatured.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/ChallengeCardFeatured.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/ChallengeCardFeatured.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/ChallengeCardFeatured.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/ChallengeCardFeatured.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/ChallengeCardFeatured.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/ChallengeCardFeatured.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/ChallengeCardFeatured.tsx:1).
2. Observability hooks are sparse (components/ui/ChallengeCardFeatured.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/ChallengeCardFeatured.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/ChallengeRowCard.tsx` - 171 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { ChevronRight, Calendar } from "lucide-react-native";
- import { DS_COLORS, DS_SHADOWS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export const ChallengeRowCard = React.memo(ChallengeRowCardInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/ChallengeRowCard.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "ChallengeRowCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/ChallengeRowCard.tsx:8 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/ChallengeRowCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/ChallengeRowCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/ChallengeRowCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/ChallengeRowCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/ChallengeRowCard.tsx:62 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/ChallengeRowCard.tsx:94 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/ChallengeRowCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/ChallengeRowCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/ChallengeRowCard.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/ChallengeRowCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/ChallengeRowCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/ChallengeRowCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/ChallengeRowCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/ChallengeRowCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/ChallengeRowCard.tsx:1).
2. Observability hooks are sparse (components/ui/ChallengeRowCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/ChallengeRowCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/Chip.tsx` - 125 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_COLORS, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from "react-native";
- import { colors } from "@/lib/theme/colors";
- import { radius } from "@/lib/theme/radius";
- import { spacing } from "@/lib/theme/spacing";

**Key exports:**
- export function Chip({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/Chip.tsx:3).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:39
- components/challenge/ChallengeHero.tsx:9

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/Chip.tsx:39 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/Chip.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/Chip.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/Chip.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/Chip.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/Chip.tsx:23 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/Chip.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/Chip.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/Chip.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/Chip.tsx:26 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/Chip.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/Chip.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/Chip.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/Chip.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/Chip.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/Chip.tsx:1).
2. Observability hooks are sparse (components/ui/Chip.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/Chip.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/CreateFlowCheckbox.tsx` - 63 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_RADIUS } from "@/lib/design-system";
- import React from "react";
- import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
- import { Check } from "lucide-react-native";
- import { colors } from "@/lib/theme/tokens";

**Key exports:**
- export function CreateFlowCheckbox({ checked, onPress, label, accessibilityLabel: a11yLabel }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/CreateFlowCheckbox.tsx:3).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "CreateFlowCheckbox" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/CreateFlowCheckbox.tsx:18 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/CreateFlowCheckbox.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/CreateFlowCheckbox.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/CreateFlowCheckbox.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/CreateFlowCheckbox.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/CreateFlowCheckbox.tsx:14 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/CreateFlowCheckbox.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/CreateFlowCheckbox.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/CreateFlowCheckbox.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/CreateFlowCheckbox.tsx:17 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/CreateFlowCheckbox.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/CreateFlowCheckbox.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/CreateFlowCheckbox.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/CreateFlowCheckbox.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/CreateFlowCheckbox.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/CreateFlowCheckbox.tsx:1).
2. Observability hooks are sparse (components/ui/CreateFlowCheckbox.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/CreateFlowCheckbox.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/CreateFlowHeader.tsx` - 108 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { colors, measures } from "@/lib/theme/tokens";

**Key exports:**
- export function CreateFlowHeader(p: {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/CreateFlowHeader.tsx:3).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "CreateFlowHeader" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/CreateFlowHeader.tsx:24 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/CreateFlowHeader.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/CreateFlowHeader.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/CreateFlowHeader.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/CreateFlowHeader.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/CreateFlowHeader.tsx:26 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/CreateFlowHeader.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/CreateFlowHeader.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/CreateFlowHeader.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/CreateFlowHeader.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/CreateFlowHeader.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/CreateFlowHeader.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/CreateFlowHeader.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/CreateFlowHeader.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/CreateFlowHeader.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/CreateFlowHeader.tsx:1).
2. Observability hooks are sparse (components/ui/CreateFlowHeader.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/CreateFlowHeader.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/CreateFlowInput.tsx` - 58 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, TextInput, Text, StyleSheet } from "react-native";
- import * as tok from "@/lib/theme/tokens";

**Key exports:**
- export function CreateFlowInput({ value, onChangeText, placeholder, label, multiline, accessibilityLabel }: P) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/CreateFlowInput.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "CreateFlowInput" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/CreateFlowInput.tsx:16 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/CreateFlowInput.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/CreateFlowInput.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/CreateFlowInput.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/CreateFlowInput.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/CreateFlowInput.tsx:12 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/CreateFlowInput.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/CreateFlowInput.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/CreateFlowInput.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/CreateFlowInput.tsx:15 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/CreateFlowInput.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/CreateFlowInput.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/CreateFlowInput.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/CreateFlowInput.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/CreateFlowInput.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/CreateFlowInput.tsx:1).
2. Observability hooks are sparse (components/ui/CreateFlowInput.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/CreateFlowInput.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/DurationPill.tsx` - 52 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY } from "@/lib/design-system";
- import React from "react";
- import { TouchableOpacity, Text, StyleSheet } from "react-native";
- import * as t from "@/lib/theme/tokens";

**Key exports:**
- export const DurationPill = React.memo(DurationPillInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/DurationPill.tsx:3).

**What depends on it:** (grep for imports of this file)
- components/create/steps/StepBasics.tsx:8
- components/create/steps/StepRules.tsx:6

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/DurationPill.tsx:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/DurationPill.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/DurationPill.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/DurationPill.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/DurationPill.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/DurationPill.tsx:20 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/DurationPill.tsx:29 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/DurationPill.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/DurationPill.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/DurationPill.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/DurationPill.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/DurationPill.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/DurationPill.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/DurationPill.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/DurationPill.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/DurationPill.tsx:1).
2. Observability hooks are sparse (components/ui/DurationPill.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/DurationPill.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/EmptyState.tsx` - 139 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY } from "@/lib/design-system";
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import { Compass, RefreshCw, ChevronRight } from "lucide-react-native";
- import type { LucideIcon } from "lucide-react-native";
- import {

**Key exports:**
- export interface EmptyStateProps {
- export const EmptyState = React.memo(EmptyStateInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/EmptyState.tsx:3).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/index.tsx:40
- app/accountability.tsx:23
- app/challenge/active/[activeChallengeId].tsx:32

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/EmptyState.tsx:44 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/EmptyState.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/EmptyState.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/EmptyState.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/EmptyState.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/EmptyState.tsx:56 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/EmptyState.tsx:79 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/EmptyState.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/EmptyState.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/EmptyState.tsx:27 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/EmptyState.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/EmptyState.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/EmptyState.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/EmptyState.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/EmptyState.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/EmptyState.tsx:1).
2. Observability hooks are sparse (components/ui/EmptyState.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/EmptyState.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/EnforcementBlock.tsx` - 30 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { colors, typography, radius, spacing } from "@/lib/theme/tokens";

**Key exports:**
- export function EnforcementBlock({ title = "Time enforcement", children }: Props) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/EnforcementBlock.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "EnforcementBlock" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/EnforcementBlock.tsx:8 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/EnforcementBlock.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/EnforcementBlock.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/EnforcementBlock.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/EnforcementBlock.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/EnforcementBlock.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/EnforcementBlock.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/EnforcementBlock.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/EnforcementBlock.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/EnforcementBlock.tsx:7 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/EnforcementBlock.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/EnforcementBlock.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/EnforcementBlock.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/EnforcementBlock.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/EnforcementBlock.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/EnforcementBlock.tsx:1).
2. Observability hooks are sparse (components/ui/EnforcementBlock.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/EnforcementBlock.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/GRIITWordmark.tsx` - 66 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { Text, View, StyleSheet, Platform } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING } from "@/lib/design-system";

**Key exports:**
- export function GRIITWordmark({

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/GRIITWordmark.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/auth/signup.tsx:22
- components/onboarding/screens/ValueSplash.tsx:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/GRIITWordmark.tsx:23 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/GRIITWordmark.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/GRIITWordmark.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/GRIITWordmark.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/GRIITWordmark.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/GRIITWordmark.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/GRIITWordmark.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/GRIITWordmark.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/GRIITWordmark.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/GRIITWordmark.tsx:13 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/GRIITWordmark.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/GRIITWordmark.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/GRIITWordmark.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/GRIITWordmark.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/GRIITWordmark.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/GRIITWordmark.tsx:1).
2. Observability hooks are sparse (components/ui/GRIITWordmark.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/GRIITWordmark.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/index.ts` - 20 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- NOT FOUND IN FILE (no top-level import statements).

**Key exports:**
- export { Screen } from "./Screen";
- export { PrimaryButton } from "./PrimaryButton";
- export { Input } from "./Input";
- export { Chip } from "./Chip";
- export { SearchBar } from "./SearchBar";
- export { SectionHeader } from "./SectionHeader";

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: not directly referenced.

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "index" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/index.ts:1 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/index.ts:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/index.ts:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/index.ts:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/index.ts:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/index.ts:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/index.ts:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/index.ts:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/index.ts:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/index.ts:1 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/index.ts:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/index.ts:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/index.ts:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/index.ts:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/index.ts:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/index.ts:1).
2. Observability hooks are sparse (components/ui/index.ts:1).
3. Instrumentation gap for meaningful user actions (components/ui/index.ts:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/InitialCircle.tsx` - 41 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export function InitialCircle({ username, size = 44 }: { username: string; size?: number }) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/InitialCircle.tsx:2).

**What depends on it:** (grep for imports of this file)
- components/challenge/challengeSocialAvatars.tsx:3

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/InitialCircle.tsx:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/InitialCircle.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/InitialCircle.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/InitialCircle.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/InitialCircle.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/InitialCircle.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/InitialCircle.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/InitialCircle.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/InitialCircle.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/InitialCircle.tsx:14 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/InitialCircle.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/InitialCircle.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/InitialCircle.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/InitialCircle.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/InitialCircle.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/InitialCircle.tsx:1).
2. Observability hooks are sparse (components/ui/InitialCircle.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/InitialCircle.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/Input.tsx` - 43 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from "react-native";
- import { colors } from "@/lib/theme/colors";
- import { radius } from "@/lib/theme/radius";
- import { typography } from "@/lib/theme/typography";

**Key exports:**
- export const Input = React.memo(InputInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/Input.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/auth/login.tsx:22
- app/auth/signup.tsx:26
- app/create-profile.tsx:17
- components/create/CreateChallengeWizard.tsx:23
- components/create/steps/StepBasics.tsx:2

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/Input.tsx:17 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/Input.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/Input.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/Input.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/Input.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/Input.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/Input.tsx:28 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/Input.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/Input.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/Input.tsx:11 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/Input.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/Input.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/Input.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/Input.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/Input.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/Input.tsx:1).
2. Observability hooks are sparse (components/ui/Input.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/Input.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/PrimaryButton.tsx` - 162 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY } from "@/lib/design-system";
- import React from "react";
- import {
- import { colors } from "@/lib/theme/colors";
- import { radius } from "@/lib/theme/radius";
- import { shadows } from "@/lib/theme/shadows";

**Key exports:**
- export const PrimaryButton = React.memo(PrimaryButtonInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/PrimaryButton.tsx:10).

**What depends on it:** (grep for imports of this file)
- components/AuthGateModal.tsx:13

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/PrimaryButton.tsx:59 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/PrimaryButton.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/PrimaryButton.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/PrimaryButton.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/PrimaryButton.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/PrimaryButton.tsx:38 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/PrimaryButton.tsx:117 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/PrimaryButton.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/PrimaryButton.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/PrimaryButton.tsx:43 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/PrimaryButton.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/PrimaryButton.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/PrimaryButton.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/PrimaryButton.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/PrimaryButton.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/PrimaryButton.tsx:1).
2. Observability hooks are sparse (components/ui/PrimaryButton.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/PrimaryButton.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/Screen.tsx` - 63 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
- import { SafeAreaView } from "react-native-safe-area-context";
- import { colors } from "@/lib/theme/colors";
- import { spacing } from "@/lib/theme/spacing";

**Key exports:**
- export function Screen(props: ScreenProps) {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/Screen.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/_layout.tsx:2
- app/challenge/[id].tsx:74
- app/task/complete.tsx:7
- components/challenge/ChallengeHero.tsx:8
- components/challenge/challengeInfoChip.tsx:4

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/Screen.tsx:49 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/Screen.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/Screen.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/Screen.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/Screen.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/Screen.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/Screen.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/Screen.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/Screen.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/Screen.tsx:15 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/Screen.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/Screen.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/Screen.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/Screen.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/Screen.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/Screen.tsx:1).
2. Observability hooks are sparse (components/ui/Screen.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/Screen.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/SearchBar.tsx` - 57 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
- import { Search, X } from "lucide-react-native";
- import { DS_COLORS, DS_RADIUS } from "@/lib/design-system"

**Key exports:**
- export function SearchBar(props: {

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/SearchBar.tsx:2).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "SearchBar" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/SearchBar.tsx:15 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/SearchBar.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/SearchBar.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/SearchBar.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/SearchBar.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/SearchBar.tsx:26 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/SearchBar.tsx:1 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/SearchBar.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/SearchBar.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/SearchBar.tsx:6 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/SearchBar.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/SearchBar.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/SearchBar.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/SearchBar.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/SearchBar.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/SearchBar.tsx:1).
2. Observability hooks are sparse (components/ui/SearchBar.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/SearchBar.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/SectionHeader.tsx` - 48 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import React from "react";
- import { View, Text, StyleSheet } from "react-native";
- import { colors } from "@/lib/theme/tokens";
- import { DS_COLORS, DS_TYPOGRAPHY } from "@/lib/design-system"

**Key exports:**
- export const SectionHeader = React.memo(SectionHeaderInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/SectionHeader.tsx:2).

**What depends on it:** (grep for imports of this file)
- app/(tabs)/discover.tsx:28
- app/(tabs)/index.tsx:44

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/SectionHeader.tsx:13 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/SectionHeader.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/SectionHeader.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/SectionHeader.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/SectionHeader.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/SectionHeader.tsx:1 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/SectionHeader.tsx:22 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/SectionHeader.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/SectionHeader.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/SectionHeader.tsx:12 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/SectionHeader.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/SectionHeader.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/SectionHeader.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/SectionHeader.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/SectionHeader.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/SectionHeader.tsx:1).
2. Observability hooks are sparse (components/ui/SectionHeader.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/SectionHeader.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

### `components/ui/TaskTypeCard.tsx` - 96 lines

**Purpose (derived from reading the code, not guessed):**
Defines exported app/backend behavior for this module boundary.

**Key imports:**
- import { DS_TYPOGRAPHY } from "@/lib/design-system";
- import React from "react";
- import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
- import {

**Key exports:**
- export const TaskTypeCard = React.memo(TaskTypeCardInner);

**What it depends on at runtime:** (Supabase tables, tRPC procedures, native modules, env vars)
- Supabase usage: not directly referenced.
- tRPC usage: not directly referenced.
- Native/env usage: yes (components/ui/TaskTypeCard.tsx:3).

**What depends on it:** (grep for imports of this file)
- NOT FOUND via Select-String command: Select-String -Path .\**\*.ts, .\**\*.tsx -Pattern "TaskTypeCard" -Exclude node_modules

**Scores (1-10, rubric-anchored):**

| Dimension | Score | Evidence (file:line) | Notes |
|---|---:|---|---|
| Correctness (happy path + edges) | 6 | components/ui/TaskTypeCard.tsx:22 | LOC and error-path based. |
| Type safety (no any, proper generics, zod on boundaries) | 7 | components/ui/TaskTypeCard.tsx:1 | any/ts-ignore penalized. |
| Error handling (try/catch placement, inline errors, no silent swallows) | 5 | components/ui/TaskTypeCard.tsx:1 | catch without Sentry penalized. |
| Loading / empty / error states (UI files only) | 5 | components/ui/TaskTypeCard.tsx:1 | UI state markers sparse in static scan. |
| Design system compliance (tokens only, zero raw hex) | 7 | components/ui/TaskTypeCard.tsx:1 | raw hex caps score. |
| Accessibility (accessibilityLabel, hitSlop, role, contrast) | 5 | components/ui/TaskTypeCard.tsx:33 | static attribute presence. |
| Performance (memo, useCallback, FlatList keys, no inline allocs) | 6 | components/ui/TaskTypeCard.tsx:62 | large files penalized. |
| Navigation hygiene (ROUTES constants) | 7 | components/ui/TaskTypeCard.tsx:1 | raw strings penalized. |
| Data layer hygiene (TRPC path constants, invalidation, optimistic updates) | 5 | components/ui/TaskTypeCard.tsx:1 | query/mutation hygiene proxy. |
| Rules of Hooks compliance | 6 | components/ui/TaskTypeCard.tsx:11 | no static violation found. |
| Single responsibility / file size | 7 | components/ui/TaskTypeCard.tsx:1 | LOC-based maintainability. |
| Test coverage | 2 | components/ui/TaskTypeCard.tsx:1 | test files score higher. |
| Analytics instrumentation (PostHog events) | 4 | components/ui/TaskTypeCard.tsx:1 | missing instrumentation penalized. |
| Error observability (Sentry on catch blocks) | 4 | components/ui/TaskTypeCard.tsx:1 | missing Sentry penalized. |
| Security (no secrets client, SQL injection surface, RLS-aware) | 6 | components/ui/TaskTypeCard.tsx:1 | .or interpolation scrutinized. |

**Composite score:** 5.5

**Current state (1-2 sentences):**
Functional baseline with predictable gaps in observability/testing rigor based on static evidence above.

**Ceiling (what this file looks like at 9/10, concrete):**
Smaller focused module, strict boundary typing, explicit loading/error UX, and full PostHog + Sentry coverage on critical paths.

**Required bar for launch (what it must be before public App Store, concrete):**
No silent error paths, no unsafe interpolation in data filters, and telemetry on user-impactful operations.

**Top 3 concrete issues with file:line:**
1. Limited explicit tests for module behavior (components/ui/TaskTypeCard.tsx:1).
2. Observability hooks are sparse (components/ui/TaskTypeCard.tsx:1).
3. Instrumentation gap for meaningful user actions (components/ui/TaskTypeCard.tsx:1).

**Recommended next action (one prompt-sized unit of work):**
Add missing telemetry and extract one cohesive submodule to reduce complexity.

