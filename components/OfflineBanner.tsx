import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { DS_COLORS } from "@/lib/design-system";

function OfflineBannerInner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={14} color={DS_COLORS.warning} />
      <Text style={styles.text}>You&apos;re offline. Some features may not work.</Text>
    </View>
  );
}

export const OfflineBanner = React.memo(OfflineBannerInner);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: DS_COLORS.warningSoft,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: DS_COLORS.textSecondary,
  },
});
