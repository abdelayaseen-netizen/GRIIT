import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
/**
 * Teams screen — Coming soon.
 * Full teams backend (create, join by code, roster, secure for team) not yet implemented.
 */
export default function TeamsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Teams</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
            <Users size={64} color={colors.accent} />
          </View>
          <Text style={[styles.title, { color: colors.text.primary }]}>Coming soon</Text>
          <Text style={[styles.sub, { color: colors.text.muted }]}>
            Teams and accountability groups are in the works. You&apos;ll be able to create or join a squad and hold each other accountable.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerRight: { width: 40 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: "30%",
    alignItems: "center",
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 22,
  },
});
