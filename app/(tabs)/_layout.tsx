import { Tabs, usePathname } from "expo-router";
import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { registerPushTokenWithBackend } from "@/lib/register-push-token";
import { DS_COLORS, DS_TYPOGRAPHY, DS_SPACING, DS_MEASURES, DS_SHADOWS } from "@/lib/design-system";

export default function TabLayout() {
  void usePathname();
  const { user } = useAuth();
  const pushRegistrationAttempted = useRef(false);

  useEffect(() => {
    if (!user || pushRegistrationAttempted.current) return;
    pushRegistrationAttempted.current = true;
    registerPushTokenWithBackend();
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DS_COLORS.TAB_ACTIVE,
        tabBarInactiveTintColor: DS_COLORS.TAB_INACTIVE,
        headerShown: false,
        sceneStyle: { backgroundColor: DS_COLORS.BG_PRIMARY },
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
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
            <View style={styles.centerButtonWrapper}>
              <View style={styles.centerButton}>
                <Plus color={DS_COLORS.WHITE} size={24} strokeWidth={2.5} />
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
  tabBar: {
    backgroundColor: DS_COLORS.TAB_BG,
    borderTopColor: DS_COLORS.BORDER_DEFAULT,
    borderTopWidth: 1,
    height: DS_MEASURES.TAB_BAR_HEIGHT,
    paddingTop: DS_SPACING.SM,
    paddingBottom: DS_SPACING.SM,
  },
  tabBarLabel: {
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_MEDIUM,
    marginTop: DS_SPACING.XS,
    marginBottom: DS_SPACING.SM,
  },
  centerButtonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: DS_MEASURES.CENTER_BUTTON_SIZE,
    height: DS_MEASURES.CENTER_BUTTON_SIZE,
    borderRadius: DS_MEASURES.CENTER_BUTTON_SIZE / 2,
    backgroundColor: DS_COLORS.BLACK,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...DS_SHADOWS.centerButton,
  },
});
