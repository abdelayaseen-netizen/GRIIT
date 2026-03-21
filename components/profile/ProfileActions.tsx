import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Settings, ChevronRight, LogOut } from "lucide-react-native";

type Props = {
  onPressSettings: () => void;
  onPressSignOut: () => void;
};

export default function ProfileActions({ onPressSettings, onPressSignOut }: Props) {
  return (
    <View style={s.card}>
      <Pressable
        style={[s.row, s.rowBorder]}
        onPress={onPressSettings}
        accessibilityLabel="Open settings"
        accessibilityRole="button"
      >
        <View style={s.left}>
          <Settings size={16} color="#888" />
          <Text style={s.label}>Settings</Text>
        </View>
        <ChevronRight size={14} color="#CCC" />
      </Pressable>
      <Pressable
        style={s.row}
        onPress={onPressSignOut}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <View style={s.left}>
          <LogOut size={16} color="#888" />
          <Text style={s.signOut}>Sign out</Text>
        </View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginTop: 20, marginHorizontal: 24, backgroundColor: "#fff", borderRadius: 14, overflow: "hidden" },
  row: { padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: "#F5F2EB" },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 14, fontWeight: "500", color: "#444" },
  signOut: { fontSize: 14, fontWeight: "500", color: "#E8593C" },
});
