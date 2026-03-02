import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_500Medium, Inter_600SemiBold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthGateProvider } from "@/contexts/AuthGateContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { supabase } from "@/lib/supabase";
import { colors } from "@/src/theme/colors";

SplashScreen.preventAutoHideAsync();

const PROFILE_CHECK_TIMEOUT_MS = 2500;
const SPLASH_MAX_MS = 1800;

function AuthRedirector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const checkProfile = useCallback(async (userId: string) => {
    try {
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), PROFILE_CHECK_TIMEOUT_MS)
      );

      const profilePromise = supabase
        .from("profiles")
        .select("user_id, onboarding_completed")
        .eq("user_id", userId)
        .single()
        .then(({ data }: { data: any }) => data);

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (result === null) {
        setHasProfile(true);
        setOnboardingCompleted(true);
      } else {
        setHasProfile(!!result);
        setOnboardingCompleted(result?.onboarding_completed === true);
      }
    } catch {
      setHasProfile(true);
      setOnboardingCompleted(true);
    } finally {
      setProfileChecked(true);
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
    if (loading || !profileChecked) return;

    const first = segments[0];
    const inAuth = (first as any) === "auth";
    const onCreateProfile = (first as any) === "create-profile";
    const inOnboarding = (first as any) === "onboarding";
    const inDay1QuickWin = (first as any) === "day1-quick-win";

    if (!user) {
      if (inAuth) return;
      return;
    }

    if (user && !hasProfile && !onCreateProfile && !inOnboarding) {
      router.replace("/create-profile" as any);
      return;
    }

    if (user && hasProfile && onboardingCompleted === false && !inOnboarding && !inDay1QuickWin) {
      router.replace("/onboarding" as any);
      return;
    }

    if (user && hasProfile && (onboardingCompleted === true || onboardingCompleted === null) && (inAuth || onCreateProfile || inOnboarding)) {
      router.replace("/(tabs)" as any);
    }
  }, [user, loading, segments, hasProfile, profileChecked, onboardingCompleted, router]);

  if (loading || (user && !profileChecked)) {
    return (
      <View style={{
        position: "absolute",
        inset: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.bg,
        zIndex: 999,
      }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
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
      <Stack.Screen name="day1-quick-win" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_800ExtraBold,
  });

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthGateProvider>
          <ApiProvider>
            <AppProvider>
              <RootLayoutNav />
              <AuthRedirector />
            </AppProvider>
          </ApiProvider>
        </AuthGateProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
