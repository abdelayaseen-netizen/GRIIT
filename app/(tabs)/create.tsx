import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { DS_COLORS } from "@/lib/design-system";
import { ROUTES } from "@/lib/routes";

/**
 * Create tab opens the full-screen modal wizard (tab bar hidden).
 */
export default function CreateTabEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.CREATE_WIZARD as never);
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator color={DS_COLORS.ACCENT} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: DS_COLORS.background, alignItems: "center", justifyContent: "center" },
});
