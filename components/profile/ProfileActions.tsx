import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Settings, ChevronRight, LogOut } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

type Props = {
  onPressSettings: () => void;
  onPressSignOut: () => void;
};

export default function ProfileActions({ onPressSettings, onPressSignOut }: Props) {
  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={s.settingsRow}
        onPress={onPressSettings}
        accessibilityLabel="Open app settings"
        accessibilityRole="button"
      >
        <Settings size={16} color={DS_COLORS.textSecondary} />
        <Text style={s.settingsText}>Settings</Text>
        <ChevronRight size={16} color={DS_COLORS.textMuted} style={s.chevron} />
      </TouchableOpacity>

      <TouchableOpacity
        style={s.signOutRow}
        onPress={onPressSignOut}
        accessibilityLabel="Sign out of GRIIT"
        accessibilityRole="button"
      >
        <LogOut size={16} color={DS_COLORS.errorText} />
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: 20,
    marginHorizontal: 24,
    gap: 0,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: DS_COLORS.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    gap: 10,
  },
  settingsText: {
    flex: 1,
    fontSize: 14,
    color: DS_COLORS.textPrimary,
  },
  chevron: {
    marginLeft: "auto",
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: DS_COLORS.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: DS_COLORS.border,
    gap: 10,
    marginTop: 8,
  },
  signOutText: {
    flex: 1,
    fontSize: 14,
    color: DS_COLORS.errorText,
  },
});
