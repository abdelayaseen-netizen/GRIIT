import { Stack, useRouter, useSegments, Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback, createContext, useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View, StatusBar, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClientProvider } from "@tanstack/react-query";
import { onSessionExpired } from "@/lib/auth-expiry";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_500Medium, Inter_600SemiBold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGateProvider } from "@/contexts/AuthGateContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { DS_COLORS } from "@/lib/design-system";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/query-client";
import { ROUTES, SEGMENTS } from "@/lib/routes";
import { useOnboardingStore } from "@/store/onboardingStore";

const HAS_LAUNCHED_KEY = "griit_has_launched";

SplashScreen.preventAutoHideAsync();

type SessionExpiredContextValue = { message: string | null; setMessage: (m: string | null) => void };
const SessionExpiredContext = createContext<SessionExpiredContextValue | null>(null);

function useSessionExpired() {
  const ctx = useContext(SessionExpiredContext);
  if (!ctx) return { message: null, setMessage: () => {} };
  return ctx;
}

const PROFILE_CHECK_TIMEOUT_MS = 2500;
const SPLASH_MAX_MS = 1800;

function AuthRedirectorLoading() {
  const { colors } = useTheme();
  return (
    <View style={{
      position: "absolute",
      inset: 0,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      zIndex: 999,
    }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function AuthRedirector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { setMessage: setSessionExpiredMessage } = useSessionExpired();
  const onboardingCompleteFromStore = useOnboardingStore((s) => s.isComplete);
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const [hasLaunched, setHasLaunched] = useState<boolean | null>(null);
  const [profileChecked, setProfileChecked] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(HAS_LAUNCHED_KEY).then((v) => setHasLaunched(v === "true"));
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
      console.error('[AUTH] checkProfile failed:', err);
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
    const inWelcome = first === SEGMENTS.WELCOME;
    const inAuth = first === SEGMENTS.AUTH;

    if (!user) {
      if (!inOnboarding && !inWelcome && !inAuth) {
        router.replace(ROUTES.ONBOARDING as never);
      }
      return;
    }
  }, [user, loading, segments, hasLaunched, router]);

  useEffect(() => {
    if (loading || !profileChecked || !user) return;

    const first = typeof segments[0] === "string" ? segments[0] : "";
    const second = typeof segments[1] === "string" ? segments[1] : "";
    const inAuth = first === SEGMENTS.AUTH;
    const onCreateProfile = first === SEGMENTS.CREATE_PROFILE;
    const inOnboarding = first === SEGMENTS.ONBOARDING;
    const inDay1QuickWin = first === SEGMENTS.DAY1_QUICK_WIN;

    if (user && !hasProfile && !onCreateProfile && !inOnboarding) {
      router.replace(ROUTES.CREATE_PROFILE as never);
      return;
    }

    if (user && hasProfile && onboardingCompleted === false && !inOnboarding && !inDay1QuickWin) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    if (user && hasProfile && onboardingCompleted === true && !onboardingCompleteFromStore && !inOnboarding) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    if (user && hasProfile && onboardingCompleteFromStore && inOnboarding) {
      router.replace(ROUTES.TABS as never);
      return;
    }

    if (user && hasProfile && (onboardingCompleted === true || onboardingCompleted === null) && (inAuth || onCreateProfile)) {
      router.replace(ROUTES.TABS as never);
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
        const completed = await AsyncStorage.getItem("onboarding_completed");
        setNeedsOnboarding(completed !== "true");
      } catch {
        setNeedsOnboarding(true);
      }
      setCheckingOnboarding(false);
    };
    check();
  }, []);

  const inOnboarding = (typeof segments[0] === "string" ? segments[0] : "") === "onboarding";
  if (checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: DS_COLORS?.background ?? "#0A0A0A" }}>
        <ActivityIndicator size="large" color={DS_COLORS?.accent ?? "#E8593C"} />
      </View>
    );
  }
  if (needsOnboarding && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {sessionExpiredMessage ? (
        <Pressable
          style={{ backgroundColor: DS_COLORS.errorText, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" }}
          onPress={() => setSessionExpiredMessage(null)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss session expired message"
        >
          <Text style={{ color: DS_COLORS.white, fontSize: 14 }}>{sessionExpiredMessage}</Text>
        </Pressable>
      ) : null}
      <OfflineBanner />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="create-profile" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="success" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen 
        name="challenge/[id]" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen name="invite/[code]" options={{ headerShown: false }} />
      <Stack.Screen name="teams" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[username]" options={{ headerShown: false }} />
      <Stack.Screen 
        name="task/run" 
        options={{ 
          headerShown: true,
          title: "Run Task",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/journal" 
        options={{ 
          headerShown: true,
          title: "Journal Entry",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/timer" 
        options={{ 
          headerShown: true,
          title: "Timer Task",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/photo" 
        options={{ 
          headerShown: true,
          title: "Photo Verification",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/manual" 
        options={{ 
          headerShown: true,
          title: "Complete Task",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/complete" 
        options={{ 
          headerShown: true,
          title: "Complete Task",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task/checkin" 
        options={{ 
          headerShown: true,
          title: "Location Check-in",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="commitment" 
        options={{ 
          headerShown: false,
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="secure-confirmation" 
        options={{ 
          headerShown: false,
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="day-missed" 
        options={{ 
          headerShown: false,
          presentation: "modal"
        }} 
      />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding-questions" options={{ headerShown: false }} />
      <Stack.Screen name="day1-quick-win" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_800ExtraBold,
  });
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => {
      SplashScreen.hideAsync();
    }, SPLASH_MAX_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <AuthProvider>
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

function ThemeAwareStatusBar() {
  return <StatusBar barStyle="dark-content" backgroundColor="transparent" />;
}
