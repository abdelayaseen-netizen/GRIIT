import { Stack, useRouter, useSegments, Redirect, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";
import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StatusBar, Text, Pressable, StyleSheet, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { onSessionExpired } from "@/lib/auth-expiry";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_500Medium, Inter_600SemiBold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
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
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/query-client";
import { ROUTES, SEGMENTS } from "@/lib/routes";
import { useOnboardingStore } from "@/store/onboardingStore";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { captureError, initialiseSentry } from "@/lib/sentry";
import { requestNotificationPermissionAfterFirstJoin } from "@/lib/register-push-token";
import { trackEvent } from "@/lib/analytics";
import { useScreenTracker } from "@/hooks/useScreenTracker";

initialiseSentry();

// MIGRATION NEEDED — run in Supabase SQL editor if not present:
// ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
// (expo_push_token is already used by the backend; registerToken updates both push_tokens table and profiles.expo_push_token.)

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
  useEffect(() => {
    if (Platform.OS === "web" || !user) return;
    void requestNotificationPermissionAfterFirstJoin();
    void import("@/lib/notifications").then(({ requestNotificationPermissions }) => {
      void requestNotificationPermissions();
    });
  }, [user]);
  return null;
}

const PROFILE_CHECK_TIMEOUT_MS = 2500;
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED).then((v) => setHasLaunched(v === "true"));
  }, []);

  const checkProfile = useCallback(async (userId: string, retry = 0) => {
    const maxRetries = 1;
    const done = () => setProfileChecked(true);
    try {
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), PROFILE_CHECK_TIMEOUT_MS)
      );

      const profilePromise = supabase
        .from("profiles")
        .select("user_id, username, onboarding_completed")
        .eq("user_id", userId)
        .single()
        .then(({ data }: { data: { user_id?: string; username?: string | null; onboarding_completed?: boolean } | null }) => data);

      let result = await Promise.race([profilePromise, timeoutPromise]);

      if (result === null && retry < maxRetries) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, username, onboarding_completed")
          .eq("user_id", userId)
          .single();
        result = data;
      }

      if (result === null) {
        setHasProfile(false);
        setOnboardingCompleted(false);
      } else {
        const hasValidProfile = !!result && typeof result.username === "string" && result.username.trim().length > 0;
        setHasProfile(hasValidProfile);
        setOnboardingCompleted(hasValidProfile && result?.onboarding_completed === true);
      }
      done();
    } catch (err) {
      captureError(err, "AuthRedirectorCheckProfile");
      // error swallowed — handle in UI
      if (retry < maxRetries) {
        await checkProfile(userId, retry + 1);
        return;
      }
      setHasProfile(false);
      setOnboardingCompleted(false);
      done();
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (user) {
      checkProfile(user.id);
    } else {
      setProfileChecked(true);
      setHasProfile(false);
      setOnboardingCompleted(null);
    }
  }, [user, loading, checkProfile]);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setSessionExpiredMessage("Session expired. Please sign in again.");
      router.replace(ROUTES.AUTH as never);
    });
    return unsubscribe;
  }, [router, setSessionExpiredMessage]);

  useEffect(() => {
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
    if (loading || !profileChecked || !user) return;

    const first = typeof segments[0] === "string" ? segments[0] : "";
    const inAuth = first === SEGMENTS.AUTH;
    const onCreateProfile = first === SEGMENTS.CREATE_PROFILE;
    const inOnboarding = first === SEGMENTS.ONBOARDING;

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

  if (loading || (user && !profileChecked) || (!user && hasLaunched === null)) {
    return <AuthRedirectorLoading />;
  }

  return null;
}

function RootLayoutNav() {
  const { message: sessionExpiredMessage, setMessage: setSessionExpiredMessage } = useSessionExpired();

  const segments = useSegments();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        setNeedsOnboarding(completed !== "true");
      } catch (e) {
        captureError(e, "RootLayoutAsyncStorageOnboarding");
        setNeedsOnboarding(true);
      }
      setCheckingOnboarding(false);
    };
    check();
  }, []);

  const firstSegment = typeof segments[0] === "string" ? segments[0] : "";
  const ONBOARDING_EXEMPT = new Set([
    "onboarding",
    "challenge",
    "task",
    "settings",
    "edit-profile",
    "legal",
    "post",
    "follow-list",
  ]);
  if (checkingOnboarding) {
    return (
      <View style={layoutStyles.centeredFill}>
        <ActivityIndicator size="large" color={DS_COLORS?.accent ?? DS_COLORS.ACCENT_PRIMARY} />
      </View>
    );
  }
  if (needsOnboarding && !ONBOARDING_EXEMPT.has(firstSegment)) {
    return <Redirect href="/onboarding" />;
  }

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
      <Stack.Screen name="profile/[username]" options={{ headerShown: false }} />
      <Stack.Screen name="follow-list" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="post/[id]" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen 
        name="task/run" 
        options={{ 
          headerShown: true,
          title: "Run Task",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="task/complete" 
        options={{ 
          headerShown: true,
          title: "Complete Task",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="task/checkin" 
        options={{ 
          headerShown: true,
          title: "Location Check-in",
          presentation: "card"
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
        const rawType = data?.type;
        trackEvent("notification_opened", {
          notification_type: typeof rawType === "string" ? rawType : "unknown",
        });
        if (data?.type === "active_task_timer" && typeof data.route === "string") {
          router.push(data.route as never);
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

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={layoutStyles.flex1}>
          <ThemeProvider>
            <AuthProvider>
              <PushRegistrationBootstrap />
              <SessionExpiredContext.Provider value={{ message: sessionExpiredMessage, setMessage: setSessionExpiredMessage }}>
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
        </GestureHandlerRootView>
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
  centeredFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DS_COLORS?.background ?? DS_COLORS.FALLBACK_BG,
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
