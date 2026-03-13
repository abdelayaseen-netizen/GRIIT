import { Tabs } from "expo-router";
import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { DS_COLORS, DS_TYPOGRAPHY, DS_MEASURES, DS_SHADOWS } from "@/lib/design-system";

export default function TabLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const pushRegistrationAttempted = useRef(false);

  useEffect(() => {
    if (!user || pushRegistrationAttempted.current) return;
    pushRegistrationAttempted.current = true;
    registerPushTokenWithBackend();
  }, [user]);
  const tabBg = colors.card ?? DS_COLORS.surface;
  const tabBorder = colors.border ?? DS_COLORS.border;
  const tabActive = colors.accent ?? DS_COLORS.accent;
  const tabInactive = colors.text?.muted ?? DS_COLORS.textMuted;
  const centerBtnBg = DS_COLORS.centerButtonBg;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: tabBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          height: DS_MEASURES.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: DS_TYPOGRAPHY.tabLabel.fontSize,
          fontWeight: DS_TYPOGRAPHY.tabLabel.fontWeight,
          marginTop: 4,
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarAccessibilityLabel: "Home tab",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
          tabBarAccessibilityLabel: "Discover tab",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => (
            <View style={[styles.centerButton, { backgroundColor: centerBtnBg }]}>
              <Plus color="#FFFFFF" size={25} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Create tab",
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Movement",
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size} />,
          tabBarAccessibilityLabel: "Movement tab",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: "Profile tab",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: DS_MEASURES.centerNavButtonSize,
    height: DS_MEASURES.centerNavButtonSize,
    borderRadius: DS_MEASURES.centerNavButtonSize / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...DS_SHADOWS.centerButton,
  },
});
