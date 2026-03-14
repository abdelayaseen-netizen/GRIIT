import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Lock } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumFeatureProps {
  children: React.ReactNode;
  /** Source param for pricing screen (e.g. 'streak_freeze', 'create_challenge'). */
  source: string;
  /** Custom fallback when not premium (e.g. locked placeholder). */
  fallback?: React.ReactNode;
}

/**
 * Wraps content that requires premium. If not premium, shows lock overlay and navigates to pricing on press.
 */
export function PremiumFeature({ children, source, fallback }: PremiumFeatureProps) {
  const { isPremium, requirePremium } = useSubscription();

  if (isPremium) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <TouchableOpacity
      onPress={() => requirePremium(source)}
      activeOpacity={0.8}
      style={styles.wrap}
      accessibilityLabel="Premium feature — tap to upgrade"
      accessibilityRole="button"
    >
      {children}
      <View style={styles.lockOverlay}>
        <Lock size={16} color={DS_COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  lockOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 4,
  },
});
