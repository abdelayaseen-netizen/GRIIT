import { Stack, useRouter, useSegments, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import React, { useEffect, useState, useCallback, createContext, useContext, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ActivityIndicator, View, StatusBar, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { onSessionExpired } from "@/lib/auth-expiry";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_500Medium, Inter_600SemiBold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { BarlowCondensed_600SemiBold } from "@expo-google-fonts/barlow-condensed";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGateProvider } from "@/contexts/AuthGateContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { DS_COLORS } from "@/lib/design-system";
import CelebrationOverlay from "@/components/shared/CelebrationOverlay";
import ProofShareOverlay from "@/components/shared/ProofShareOverlay";
import { queryClient } from "@/lib/query-client";
import { ROUTES, SEGMENTS } from "@/lib/routes";
import { useOnboardingStore } from "@/store/onboardingStore";
import { cacheOnboardingCompleted } from "@/lib/onboarding-completed-cache";
import { FLAGS } from "@/lib/feature-flags";
import {
  dbCompletedForLaunch,
  clearKnownOnboardingCompleted,
  peekKnownOnboardingCompleted,
  peekOnboardingV2Exit,
  resolveCompletedLeaveHref,
  resolveOnboardingLaunch,
  sessionKindFromUser,
  setKnownOnboardingCompleted,
} from "@/lib/onboarding-v2-routing";
import { resolveAuthRedirect, shouldShowAuthRedirectOverlay } from "@/lib/auth-redirect";
import { checkProfile } from "@/lib/check-profile";
import { readHasLaunched, recordAppOpen } from "@/lib/app-open-tracking";
import { initialiseSentry } from "@/lib/sentry";
import { registerPushTokenIfPermissionGranted } from "@/lib/register-push-token";
import { v2MayPromptNotificationPermission } from "@/lib/onboarding-v2-notifications";
import { trackNotificationOpened, type ReminderType } from "@/lib/analytics";
// Static import: ensures Notifications.setNotificationHandler at the top of
// lib/notifications.ts runs at app boot, before any timer task can schedule a
// lock-screen notification.
import "@/lib/notifications";
import { useScreenTracker } from "@/hooks/useScreenTracker";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "@/lib/posthog";

const COLD_START_AT = Date.now();

initialiseSentry();

// push_token migration: see supabase/migrations/20260429083000_add_push_token_to_profiles.sql

SplashScreen.preventAutoHideAsync();

type SessionExpiredContextValue = { message: string | null; setMessage: (m: string | null) => void };
const SessionExpiredContext = createContext<SessionExpiredContextValue | null>(null);

function useSessionExpired() {
  const ctx = useContext(SessionExpiredContext);
  if (!ctx) return { message: null, setMessage: () => {} };
  return ctx;
}

function PushRegistrationBootstrap() {
  const { user } = useAuth();
  const storeCompleted = useOnboardingStore((s) => s.isComplete || s.hasCompletedOnboarding);
  useEffect(() => {
    if (Platform.OS === "web" || !user) return;
    // v2: RemindersScreen "Turn on reminders" is the only OS prompt.
    // After completion this still must not request — only register if granted.
    // Re-run when storeCompleted flips after Day 1 so a Reminders grant can register.
    void storeCompleted;
    if (!v2MayPromptNotificationPermission("bootstrap")) {
      void registerPushTokenIfPermissionGranted();
    }
  }, [user, storeCompleted]);
  return null;
}

const SPLASH_MAX_MS = 1800;

function AuthRedirectorLoading() {
  return (
    <View style={layoutStyles.authLoadingOverlay}>
      <ActivityIndicator size="large" color={DS_COLORS.accent} />
    </View>
  );
}

function AuthRedirector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { setMessage: setSessionExpiredMessage } = useSessionExpired();
  const onboardingCompleteFromStore = useOnboardingStore((s) => s.isComplete);
  useOnboardingStore((s) => s.currentStep);
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);
  const [profileChecked, setProfileChecked] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [profileCreatedAt, setProfileCreatedAt] = useState<string | null>(null);
  const coldStartTrackedRef = useRef(false);

  useEffect(() => {
    void readHasLaunched().then(setHasLaunched);
  }, []);

  const runCheckProfile = useCallback(async (userId: string) => {
    const outcome = await checkProfile(userId);
    setHasProfile(outcome.hasProfile);
    setOnboardingCompleted(outcome.onboardingCompleted);
    setProfileCreatedAt(outcome.profileCreatedAt);
    if (outcome.cacheCompleted) {
      setKnownOnboardingCompleted(userId, true);
      void cacheOnboardingCompleted();
    }
    setProfileChecked(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) {
      void runCheckProfile(user.id);
    } else {
      clearKnownOnboardingCompleted();
      setProfileChecked(true);
      setHasProfile(false);
      setOnboardingCompleted(null);
      setProfileCreatedAt(null);
    }
  }, [user, loading, runCheckProfile]);

  useEffect(() => {
    if (loading || !user || !profileChecked) return;
    const trackCold = !coldStartTrackedRef.current;
    if (trackCold) coldStartTrackedRef.current = true;
    void recordAppOpen({
      profileCreatedAt,
      coldStartMs: Date.now() - COLD_START_AT,
      trackColdStart: trackCold,
    });
  }, [loading, user, profileChecked, profileCreatedAt]);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setSessionExpiredMessage("Session expired. Please sign in again.");
      router.replace(ROUTES.AUTH as never);
    });
    return unsubscribe;
  }, [router, setSessionExpiredMessage]);

  useEffect(() => {
    if (FLAGS.ONBOARDING_V2) return;
    if (loading || hasLaunched === null) return;
    if (user) {
      return;
    }

    const first = (typeof segments[0] === "string" ? segments[0] : "") as string;
    const inOnboarding = first === SEGMENTS.ONBOARDING;
    const inAuth = first === SEGMENTS.AUTH;

    if (!user) {
      if (!inOnboarding && !inAuth) {
        router.replace(ROUTES.ONBOARDING as never);
      }
      return;
    }
  }, [user, loading, segments, hasLaunched, router]);

  useEffect(() => {
    if (!FLAGS.ONBOARDING_V2) return;
    const first = typeof segments[0] === "string" ? segments[0] : "";
    const decision = resolveAuthRedirect({
      sessionKind: sessionKindFromUser(user),
      onboardingCompleted: user
        ? dbCompletedForLaunch({
            fetched: onboardingCompleted,
            written: peekKnownOnboardingCompleted(user.id),
          })
        : null,
      hasLaunched,
      loading,
      profileChecked,
      inOnboarding: first === SEGMENTS.ONBOARDING,
      inAuth: first === SEGMENTS.AUTH,
      onCreateProfile: first === SEGMENTS.CREATE_PROFILE,
      inTabs: first === SEGMENTS.TABS,
      exitHref: peekOnboardingV2Exit(),
    });
    if (decision.action === "replace") {
      router.replace(decision.href as never);
    }
  }, [user, loading, segments, hasLaunched, profileChecked, onboardingCompleted, router]);

  useEffect(() => {
    if (FLAGS.ONBOARDING_V2) return;
    if (loading || !profileChecked || !user) return;

    const first = typeof segments[0] === "string" ? segments[0] : "";
    const inAuth = first === SEGMENTS.AUTH;
    const onCreateProfile = first === SEGMENTS.CREATE_PROFILE;
    const inOnboarding = first === SEGMENTS.ONBOARDING;
    const inTabs = first === SEGMENTS.TABS;

    const dest = resolveOnboardingLaunch({
      sessionKind: sessionKindFromUser(user),
      dbCompleted: onboardingCompleted,
    });
    if (dest === "home") {
      const href = resolveCompletedLeaveHref({
        inOnboarding,
        inAuth,
        onCreateProfile,
        inTabs,
        exitHref: peekOnboardingV2Exit(),
      });
      if (href) router.replace(href as never);
      return;
    }

    const AUTHENTICATED_SEGMENTS = new Set([
      "(tabs)",
      "challenge",
      "settings",
      "edit-profile",
      "task",
      "paywall",
      "accountability",
      "legal",
      "create",
      "create-team",
      "team-invite",
      "join-team",
      "profile",
      "follow-list",
      "invite",
      "post",
      "discover",
    ]);
    const inAllowedSegment = AUTHENTICATED_SEGMENTS.has(first);

    // 1. No profile yet → send to create-profile (unless already there or in onboarding)
    if (user && !hasProfile && !onCreateProfile && !inOnboarding) {
      router.replace(ROUTES.CREATE_PROFILE as never);
      return;
    }

    // 2. Has profile but stuck on auth or create-profile → send to tabs
    if (user && hasProfile && (onboardingCompleted === true || onboardingCompleted === null) && (inAuth || onCreateProfile)) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    // 3. Onboarding complete in store but still on onboarding screen → send to tabs
    if (user && hasProfile && onboardingCompleteFromStore && inOnboarding) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    // DB says onboarding done but local store not synced — nudge to tabs unless on an allowed screen
    if (
      user &&
      hasProfile &&
      onboardingCompleted === true &&
      !onboardingCompleteFromStore &&
      !inOnboarding &&
      !inAllowedSegment
    ) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    // 4. Onboarding NOT complete and NOT on an allowed authenticated screen
    if (user && hasProfile && onboardingCompleted === false && !inOnboarding && !inAllowedSegment) {
      router.replace(ROUTES.TABS as never);
      return;
    }
  }, [user, loading, segments, hasProfile, profileChecked, onboardingCompleted, onboardingCompleteFromStore, router]);

  if (
    shouldShowAuthRedirectOverlay({
      loading,
      hasSession: !!user,
      profileChecked,
      hasLaunched,
    })
  ) {
    return <AuthRedirectorLoading />;
  }

  return null;
}

function RootLayoutNav() {
  const { message: sessionExpiredMessage, setMessage: setSessionExpiredMessage } = useSessionExpired();

  return (
    <View style={layoutStyles.flex1}>
      {sessionExpiredMessage ? (
        <Pressable
          style={layoutStyles.sessionExpiredBanner}
          onPress={() => setSessionExpiredMessage(null)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss session expired message"
        >
          <Text style={layoutStyles.sessionExpiredText}>{sessionExpiredMessage}</Text>
        </Pressable>
      ) : null}
      <OfflineBanner />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="create-profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen 
        name="challenge/[id]" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen name="invite/[code]" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ headerShown: false }} />
      <Stack.Screen name="create-team" options={{ title: "Create team", presentation: "modal" }} />
      <Stack.Screen name="team-invite" options={{ title: "Invite teammates", presentation: "modal" }} />
      <Stack.Screen name="join-team" options={{ title: "Join team", presentation: "modal" }} />
      <Stack.Screen name="profile/consistency" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[username]" options={{ headerShown: false }} />
      <Stack.Screen name="follow-list" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="post/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="discover/category/[slug]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen 
        name="task/complete" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen
        name="task/secured"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen 
        name="challenge/complete" 
        options={{ 
          headerShown: false,
          presentation: "modal"
        }} 
      />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
      <CelebrationOverlay />
      <ProofShareOverlay />
    </View>
  );
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_800ExtraBold,
    BarlowCondensed_600SemiBold,
  });
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  useScreenTracker();

  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => {
      SplashScreen.hideAsync();
    }, SPLASH_MAX_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data as Record<string, unknown> | undefined;
        const rawReminderType = data?.reminder_type;
        const openedAt = Date.now();
        const sentAtRaw = data?.sent_at_ms;
        const sentAtMs =
          typeof sentAtRaw === "number"
            ? sentAtRaw
            : typeof sentAtRaw === "string"
              ? Number(sentAtRaw)
              : openedAt;
        const reminderType: ReminderType =
          typeof rawReminderType === "string"
            ? (rawReminderType as ReminderType)
            : "daily_streak";
        trackNotificationOpened({
          reminder_type: reminderType,
          time_to_open_ms: Math.max(0, openedAt - (Number.isFinite(sentAtMs) ? sentAtMs : openedAt)),
        });
        if (Platform.OS !== "web" && reminderType === "streak_at_risk") {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        if (data?.type === "active_task_timer" && typeof data.route === "string") {
          const r = data.route;
          // Allow in-app task (/task/complete) and challenge surfaces through.
          // Unified timer tasks (prayer, etc.) deep-link to /challenge/active/{id}.
          const isAllowed =
            r.startsWith("/task/") ||
            r.startsWith("/challenge/") ||
            r.startsWith(ROUTES.TABS_HOME);
          router.push((isAllowed ? r : ROUTES.TABS_HOME) as never);
          return;
        }
        router.push(ROUTES.ACTIVITY as never);
      } catch {
        /* non-fatal */
      }
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const appTree = (
    <GestureHandlerRootView style={layoutStyles.flex1}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <AuthProvider>
            <PushRegistrationBootstrap />
            <SessionExpiredContext.Provider
              value={{ message: sessionExpiredMessage, setMessage: setSessionExpiredMessage }}
            >
              <AuthGateProvider>
                <ApiProvider>
                  <AppProvider>
                    <ThemeAwareStatusBar />
                    <RootLayoutNav />
                    <AuthRedirector />
                  </AppProvider>
                </ApiProvider>
              </AuthGateProvider>
            </SessionExpiredContext.Provider>
          </AuthProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {posthog ? <PostHogProvider client={posthog}>{appTree}</PostHogProvider> : appTree}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);

const layoutStyles = StyleSheet.create({
  authLoadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS_COLORS.background,
    zIndex: 999,
  },
  flex1: { flex: 1 },
  sessionExpiredBanner: {
    backgroundColor: DS_COLORS.errorText,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  sessionExpiredText: { color: DS_COLORS.white, fontSize: 14 },
});

function ThemeAwareStatusBar() {
  return <StatusBar barStyle="dark-content" backgroundColor="transparent" />;
}
