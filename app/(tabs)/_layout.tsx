import { Tabs, usePathname } from "expo-router";
import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SHADOWS, GRIIT_COLORS, DS_RADIUS, DS_DAYLIGHT } from "@/lib/design-system"

export default function TabLayout() {
  void usePathname();

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
      screenOptions={{
        tabBarActiveTintColor: DS_DAYLIGHT.color.accent,
        tabBarInactiveTintColor: DS_DAYLIGHT.color.tabInactive,
        headerShown: false,
        sceneStyle: { backgroundColor: DS_DAYLIGHT.color.canvas },
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Home — your challenges and feed",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Discover — browse and join challenges",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => (
            <View style={styles.centerButtonWrapper}>
              <View style={styles.centerButton}>
                <Plus color={DS_COLORS.WHITE} size={24} strokeWidth={2.5} />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Create a new challenge",
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Activity — feed, notifications, and leaderboard",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Profile — your stats and settings",
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
  // Daylight: floating translucent-white pill (no blur — expo-blur not installed).
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    height: 64,
    backgroundColor: DS_DAYLIGHT.color.tabGlassBg,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.tabGlassBorder,
    borderRadius: DS_DAYLIGHT.radius.glassBar,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 0,
    ...DS_DAYLIGHT.shadow.glassBar,
  },
  tabBarItem: {
    height: 64,
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    marginTop: 3,
    marginBottom: 0,
  },
  centerButtonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DS_DAYLIGHT.color.centerButton,
    alignItems: "center",
    justifyContent: "center",
    ...DS_SHADOWS.centerButton,
  },
});
