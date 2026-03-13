import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <WifiOff size={14} color="#F5A623" />
      <Text style={styles.text}>You&apos;re offline. Some features may not work.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF8E1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: "#8A8A8A",
  },
});
