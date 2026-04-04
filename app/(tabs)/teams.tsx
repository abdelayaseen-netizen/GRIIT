/**
 * Teams tab placeholder — squad features are not in this build (v2).
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DS_COLORS, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { ROUTES } from "@/lib/routes";

export default function TeamsTabScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.inner}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.body}>
          Accountability squads are coming in a future update. Browse Discover to find challenges you can commit to today.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push(ROUTES.TABS_DISCOVER as never)}
          accessibilityRole="button"
          accessibilityLabel="Go to Discover tab"
        >
          <Text style={styles.btnText}>Go to Discover</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.white },
  inner: { flex: 1, padding: DS_SPACING.lg, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_COLORS.challengeHeaderDark, marginBottom: 12 },
  body: { fontSize: 15, color: DS_COLORS.textSecondary, lineHeight: 22 },
  btn: { marginTop: 24, backgroundColor: DS_COLORS.challengeHeaderDark, paddingVertical: 14, borderRadius: DS_RADIUS.MD, alignItems: "center" },
  btnText: { color: DS_COLORS.white, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, fontSize: 16 },
});
