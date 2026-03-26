import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

export default function CreateTeamScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.inner}>
        <Text style={styles.title}>Create a team</Text>
        <Text style={styles.body}>
          Creating squads for challenges is not available in this build. Commit to challenges solo from Discover.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace(ROUTES.TABS_DISCOVER as never)} accessibilityRole="button">
          <Text style={styles.btnText}>Go to Discover</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS_COLORS.white },
  inner: { flex: 1, padding: DS_SPACING.lg, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: DS_COLORS.challengeHeaderDark, marginBottom: 12 },
  body: { fontSize: 15, color: DS_COLORS.textSecondary, lineHeight: 22 },
  btn: { marginTop: 24, backgroundColor: DS_COLORS.challengeHeaderDark, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: DS_COLORS.white, fontWeight: "600", fontSize: 16 },
});
