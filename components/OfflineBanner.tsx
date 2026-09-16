import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { DS_COLORS } from "@/lib/design-system";
import { OFFLINE_BANNER_PAD, topBannerOffset } from "@/lib/session-expired-banner";

function OfflineBannerInner({ insetTop }: { insetTop?: number }) {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  const top = insetTop ?? insets.top;
  return (
    <View style={[styles.banner, topBannerOffset(top, OFFLINE_BANNER_PAD)]}>
      <WifiOff size={14} color={DS_COLORS.warning} />
      <Text style={styles.text}>You&apos;re offline. Some features may not work.</Text>
    </View>
  );
}

export const OfflineBanner = React.memo(OfflineBannerInner);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: DS_COLORS.warningSoft,
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
