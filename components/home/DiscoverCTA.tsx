import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";

export default function DiscoverCTA({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.86} onPress={onPress}>
      <View style={s.icon}><Search size={18} color="#E8593C" /></View>
      <View style={s.mid}>
        <Text style={s.title}>Ready for more?</Text>
        <Text style={s.sub}>Discover your next challenge.</Text>
      </View>
      <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { marginTop: 12, marginHorizontal: 24, borderRadius: 16, backgroundColor: "#1A1410", padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(232,89,60,0.15)", alignItems: "center", justifyContent: "center" },
  mid: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700", color: "#fff" },
  sub: { marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.45)" },
});
