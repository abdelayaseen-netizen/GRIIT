import { Tabs, useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { DS_COLORS, DS_DAYLIGHT, DS_V3, GRIIT_COLORS, DS_RADIUS } from "@/lib/design-system";
import TabBar, { type TabBarTab } from "@/components/ds/TabBar";
import { ROUTES } from "@/lib/routes";

function routeToTab(name: string | undefined): TabBarTab {
  if (name === "discover") return "discover";
  if (name === "activity") return "activity";
  if (name === "profile") return "profile";
  return "home";
}

function GritTabBar({ state }: BottomTabBarProps) {
  const router = useRouter();
  const current = state.routes[state.index]?.name;
  return (
    <TabBar
      active={routeToTab(current)}
      onTab={(tab) => {
        if (tab === "home") router.push(ROUTES.TABS_HOME as never);
        else if (tab === "discover") router.push(ROUTES.TABS_DISCOVER as never);
        else if (tab === "activity") router.push(ROUTES.TABS_ACTIVITY as never);
        else router.push(ROUTES.TABS_PROFILE as never);
      }}
      onFab={() => router.push(ROUTES.TABS_CREATE as never)}
    />
  );
}

export default function TabLayout() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <View style={styles.errorBoundaryRoot}>
          <Text style={styles.errorBoundaryTitle}>Something went wrong</Text>
          <Text style={styles.errorBoundaryMessage}>
            {__DEV__ ? String(error) : "Please restart the app"}
          </Text>
          <TouchableOpacity
            onPress={resetError}
            style={styles.errorBoundaryButton}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={styles.errorBoundaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}
    >
    <Tabs
      tabBar={(props) => <GritTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DS_DAYLIGHT.color.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home, your challenges and feed",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarAccessibilityLabel: "Discover, browse and join challenges",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Create a new challenge",
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarAccessibilityLabel: "Activity, feed, notifications, and leaderboard",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile, your stats and settings",
          sceneStyle: { backgroundColor: DS_V3.color.canvas },
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </Sentry.ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorBoundaryRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: DS_COLORS.BG_PRIMARY,
  },
  errorBoundaryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
    color: DS_COLORS.TEXT_PRIMARY,
  },
  errorBoundaryMessage: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
    color: DS_COLORS.TEXT_SECONDARY,
  },
  errorBoundaryButton: {
    backgroundColor: GRIIT_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: DS_RADIUS.joinCta,
  },
  errorBoundaryButtonText: {
    color: DS_COLORS.WHITE,
    fontWeight: "500",
  },
});
