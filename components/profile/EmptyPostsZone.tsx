import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";

export interface EmptyPostsZoneProps {
  view: "self" | "visitor";
  displayName?: string;
  onPostFirstProof?: () => void;
}

export function EmptyPostsZone(props: EmptyPostsZoneProps) {
  if (props.view === "visitor") {
    return (
      <View style={styles.container}>
        <Camera size={28} color={DS_COLORS.TEXT_MUTED} strokeWidth={1.5} />
        <Text style={styles.title}>No proof posts yet</Text>
        <Text style={styles.subtitle}>{props.displayName ?? "They"} hasn't posted anything yet.</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Camera size={32} color={DS_COLORS.TEXT_MUTED} strokeWidth={1.5} />
      <Text style={styles.title}>Your wall starts here</Text>
      <Text style={styles.subtitle}>Post your first proof to fill it up.</Text>
      <Pressable
        style={styles.cta}
        onPress={props.onPostFirstProof}
        accessibilityRole="button"
        accessibilityLabel="Post your first proof"
      >
        <Text style={styles.ctaText}>Post first proof →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 24, alignItems: "center" },
  title: { fontSize: 13, fontWeight: "500", marginTop: 8, color: DS_COLORS.TEXT_PRIMARY },
  subtitle: { fontSize: 11, color: DS_COLORS.TEXT_MUTED, marginTop: 4, textAlign: "center" },
  cta: { marginTop: 12, backgroundColor: DS_COLORS.PROFILE_STAT_CORAL_ICON, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  ctaText: { color: "#fff", fontSize: 12, fontWeight: "500" },
});
