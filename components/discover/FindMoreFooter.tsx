import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";

import { ROUTES } from "@/lib/routes";
import {
  DS_COLORS,
  DS_RADIUS,
  DS_SPACING,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { trackEvent } from "@/lib/analytics";

function FindMoreFooterInner() {
  const router = useRouter();

  const handlePress = useCallback(() => {
    trackEvent("discover_find_more_tapped", {});
    router.push(ROUTES.DISCOVER_CATEGORY("focus") as never);
  }, [router]);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Find more challenges"
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <Sparkles size={22} color={DS_COLORS.ACCENT} strokeWidth={2} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>Find more challenges</Text>
          <Text style={styles.subtitle}>Browse the full library</Text>
        </View>
        <ArrowRight size={18} color={DS_COLORS.TEXT_PRIMARY} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

export const FindMoreFooter = React.memo(FindMoreFooterInner);
export default FindMoreFooter;

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_SPACING.lg,
    marginTop: DS_SPACING.xl,
    marginBottom: DS_SPACING.lg,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.md,
    backgroundColor: DS_COLORS.BG_CARD,
    borderRadius: DS_RADIUS.LG,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingVertical: DS_SPACING.md,
    paddingHorizontal: DS_SPACING.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: DS_RADIUS.MD,
    backgroundColor: DS_COLORS.ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 12,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});
