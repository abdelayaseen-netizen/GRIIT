import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

function AuthRedirector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const checkProfile = useCallback(async (userId: string) => {
    try {
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 4000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            console.log('[AuthRedirector] Profile check error:', error.message);
          }
          return data;
        });

      const result = await Promise.race([profilePromise, timeoutPromise]);

      if (result === null) {
        console.log('[AuthRedirector] Profile check timed out, assuming has profile');
        setHasProfile(true);
      } else {
        setHasProfile(!!result);
      }
    } catch {
      console.log('[AuthRedirector] Profile check failed (network?), assuming has profile');
      setHasProfile(true);
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
    }
  }, [user, loading, checkProfile]);

  useEffect(() => {
    if (loading || !profileChecked) return;

    const first = segments[0];
    const inAuth = (first as any) === "auth";
    const onCreateProfile = (first as any) === "create-profile";

    if (!user && !inAuth) {
      router.replace("/auth/login" as any);
      return;
    }

    if (user && !hasProfile && !onCreateProfile) {
      router.replace("/create-profile" as any);
      return;
    }

    if (user && hasProfile && (inAuth || onCreateProfile)) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, hasProfile, profileChecked, router]);

  if (loading || (user && !profileChecked)) {
    return (
      <View style={{
        position: "absolute",
        inset: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        zIndex: 999,
      }}>
        <ActivityIndicator size="large" color="#E87D4F" />
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
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ApiProvider>
          <AppProvider>
            <RootLayoutNav />
            <AuthRedirector />
          </AppProvider>
        </ApiProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
