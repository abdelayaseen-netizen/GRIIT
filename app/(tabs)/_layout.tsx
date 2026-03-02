import { Tabs } from "expo-router";
import { Home, Compass, Plus, Flame, User } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  colors,
  spacing,
  typography,
  shadows,
  measures,
} from "@/src/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accentOrangeCreate,
        tabBarInactiveTintColor: colors.tabInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          paddingTop: spacing.sm,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: typography.tabLabel.fontSize,
          fontWeight: typography.tabLabel.fontWeight,
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
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <Plus color={colors.white} size={25} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Movement",
          tabBarIcon: ({ color, size }) => <Flame color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: measures.centerButtonSize,
    height: measures.centerButtonSize,
    borderRadius: measures.centerButtonSize / 2,
    backgroundColor: colors.accentOrangeCreate,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...shadows.centerButton,
  },
});
