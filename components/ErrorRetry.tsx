import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { DS_V3, DS_SPACING, DS_TYPOGRAPHY, DS_RADIUS } from "@/lib/design-system";

interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorRetry({ message = "Something went wrong", onRetry }: ErrorRetryProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AlertTriangle size={36} color={DS_V3.color.textSecondary} strokeWidth={1.5} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityLabel="Retry loading"
        accessibilityRole="button"
      >
        <RefreshCw size={16} color={DS_V3.color.brand} />
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: DS_SPACING.lg,
    gap: DS_SPACING.md,
  },
  message: {
    fontSize: DS_TYPOGRAPHY.SIZE_MD,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING.xs,
    paddingVertical: DS_SPACING.sm,
    paddingHorizontal: DS_SPACING.md,
    borderRadius: DS_RADIUS.MD,
    borderWidth: 1,
    borderColor: DS_V3.color.brand,
  },
  retryText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_V3.color.brand,
  },
});
