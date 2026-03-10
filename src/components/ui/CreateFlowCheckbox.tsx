import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "@/src/theme/tokens";

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
        {checked && <Check size={14} color={colors.white} strokeWidth={2.5} />}
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
    borderRadius: 6,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: colors.accentGreen,
    borderColor: colors.accentGreen,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
    flex: 1,
  },
});
