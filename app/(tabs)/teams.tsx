/**
 * Teams tab placeholder — squad features are not in this build (v2).
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DS_V3, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system"
import { ROUTES } from "@/lib/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function TeamsTabScreenInner() {
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

export default function TeamsTabScreen() {
  return (
    <ErrorBoundary>
      <TeamsTabScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_V3.color.textPrimary },
  inner: { flex: 1, padding: DS_SPACING.lg, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD, color: DS_V3.color.surface, marginBottom: 12 },
  body: { fontSize: 15, color: DS_V3.color.textSecondary, lineHeight: 22 },
  btn: { marginTop: 24, backgroundColor: DS_V3.color.surface, paddingVertical: 14, borderRadius: DS_RADIUS.MD, alignItems: "center" },
  btnText: { color: DS_V3.color.textPrimary, fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD, fontSize: 16 },
});
