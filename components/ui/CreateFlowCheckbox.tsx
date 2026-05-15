import { DS_COLORS, DS_RADIUS } from "@/lib/design-system";
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

const BOX_SIZE = 24;

type Props = {
  checked: boolean;
  onPress: () => void;
  label: string;
  /** Override for screen reader (e.g. "Require completion at specific time") */
  accessibilityLabel?: string;
};

export function CreateFlowCheckbox({ checked, onPress, label, accessibilityLabel: a11yLabel }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={a11yLabel ?? label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Check size={14} color={DS_COLORS.white} strokeWidth={2.5} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: DS_RADIUS.featuredBadge,
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1.5,
    borderColor: DS_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: DS_COLORS.success,
    borderColor: DS_COLORS.success,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
});
