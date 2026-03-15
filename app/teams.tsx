import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { DS_COLORS, DS_SPACING, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";

/**
 * Teams screen — Design DNA empty state.
 * Full teams backend (create, join by code, roster) not yet implemented.
 */
export default function TeamsScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: DS_COLORS.background }]} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: DS_COLORS.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: DS_COLORS.textPrimary }]}>Teams</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: DS_COLORS.accentSoft }]}>
            <Users size={48} color={DS_COLORS.accent} />
          </View>
          <Text style={[styles.title, { color: DS_COLORS.textPrimary }]}>Small Groups, Big Results</Text>
          <Text style={[styles.sub, { color: DS_COLORS.textSecondary }]}>
            Teams of 5–10 have 3x higher retention. Create or join a squad to hold each other accountable.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: DS_COLORS.commitmentButtonBg }]}
            onPress={() => {}}
            activeOpacity={0.85}
            accessibilityLabel="Create a team"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>+ Create a Team</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: DS_COLORS.border, backgroundColor: DS_COLORS.surface }]}
            onPress={() => {}}
            activeOpacity={0.85}
            accessibilityLabel="Join with code"
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryBtnIcon, { color: DS_COLORS.textSecondary }]}>👥</Text>
            <Text style={[styles.secondaryBtnText, { color: DS_COLORS.textPrimary }]}>Join with Code</Text>
          </TouchableOpacity>
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
    paddingHorizontal: DS_SPACING.xxl,
    paddingTop: "25%",
    alignItems: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.xl,
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
    marginBottom: DS_SPACING.xxl,
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: DS_RADIUS.ctaButton,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DS_SPACING.md,
  },
  primaryBtnText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "700",
    color: DS_COLORS.white,
  },
  secondaryBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: DS_RADIUS.ctaButton,
    borderWidth: 1,
  },
  secondaryBtnIcon: { fontSize: 18 },
  secondaryBtnText: {
    fontSize: DS_TYPOGRAPHY.button.fontSize,
    fontWeight: "600",
  },
});
