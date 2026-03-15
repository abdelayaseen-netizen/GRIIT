import { Tabs, usePathname } from "expo-router";
import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { DS_COLORS, DS_MEASURES, DS_SHADOWS } from "@/lib/design-system";

export default function TabLayout() {
  void usePathname();
  const { user } = useAuth();
  const { colors: _colors, colorScheme: _colorScheme } = useTheme();
  const pushRegistrationAttempted = useRef(false);

  useEffect(() => {
    if (!user || pushRegistrationAttempted.current) return;
    pushRegistrationAttempted.current = true;
    registerPushTokenWithBackend();
  }, [user]);
  const tabBorder = DS_COLORS.border;
  const tabActive = DS_COLORS.accent;
  const tabInactive = DS_COLORS.textSecondary;
  const centerBtnBg = DS_COLORS.commitmentButtonBg;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        headerShown: false,
        sceneStyle: { backgroundColor: DS_COLORS.background },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: tabBorder,
          borderTopWidth: 1,
          paddingTop: 8,
          height: DS_MEASURES.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500" as const,
          marginTop: 4,
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Home tab",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Discover tab",
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => (
            <View style={styles.createTabIconWrap}>
              <View style={[styles.centerButton, { backgroundColor: centerBtnBg }]}>
                <Plus color="#FFFFFF" size={24} strokeWidth={2.5} />
              </View>
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
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Movement tab",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size || 24} />,
          tabBarAccessibilityLabel: "Profile tab",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createTabIconWrap: { position: "relative" },
  createProBadge: { position: "absolute", top: -4, right: -4 },
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
