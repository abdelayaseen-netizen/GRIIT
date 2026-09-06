import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { PROFILE_V2_COLOR } from "@/lib/profile-v2-tokens";

export function ProofsTab({
  proofs,
  hasRun,
  onPostProof,
  onDiscover,
  onSelect,
}: {
  proofs: { dateKey: string; day: number; imageUrl?: string | null }[];
  hasRun: boolean;
  onPostProof: () => void;
  onDiscover: () => void;
  onSelect: (dateKey: string) => void;
}) {
  if (proofs.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.frames}>
          <View style={[styles.frame, styles.frame1]} />
          <View style={[styles.frame, styles.frame2]} />
          <View style={[styles.frame, styles.frame3]} />
        </View>
        <Text style={styles.title}>
          {hasRun ? "Day 1 proof is due today" : "No proofs yet"}
        </Text>
        <Text style={styles.body}>
          {hasRun
            ? "Proofs land here the moment the camera verifies one. Nothing can be uploaded from your library."
            : "Join a challenge and every verified day lands here as a photo."}
        </Text>
        <Pressable
          onPress={hasRun ? onPostProof : onDiscover}
          accessibilityRole="button"
          accessibilityLabel={hasRun ? "Post today’s proof" : "Go to Discover"}
          style={styles.cta}
        >
          <Text style={styles.ctaTxt}>{hasRun ? "Post today’s proof" : "Go to Discover"}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.grid}>
        {proofs.map((p) => (
          <Pressable
            key={p.dateKey}
            onPress={() => onSelect(p.dateKey)}
            accessibilityRole="button"
            accessibilityLabel={`Day ${p.day} proof`}
            style={styles.tile}
          >
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.img} contentFit="cover" />
            ) : (
              <View style={styles.ph} />
            )}
            <View style={styles.chip}>
              <Text style={styles.chipTxt}>Day {p.day}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>Every tile is a live-camera capture.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: PROFILE_V2_COLOR.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  frames: { flexDirection: "row", gap: 8 },
  frame: { width: 56, height: 56, borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed" },
  frame1: { borderColor: PROFILE_V2_COLOR.borderStrong },
  frame2: { borderColor: PROFILE_V2_COLOR.border },
  frame3: { borderColor: PROFILE_V2_COLOR.sunken },
  title: { marginTop: 16, fontSize: 16, fontWeight: "400", color: PROFILE_V2_COLOR.ink, textAlign: "center" },
  body: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: PROFILE_V2_COLOR.muted,
    textAlign: "center",
  },
  cta: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: PROFILE_V2_COLOR.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTxt: { fontSize: 15, fontWeight: "500", color: PROFILE_V2_COLOR.surface },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: PROFILE_V2_COLOR.sunken,
  },
  img: { width: "100%", height: "100%" },
  ph: { flex: 1, backgroundColor: PROFILE_V2_COLOR.sunken },
  chip: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  chipTxt: { fontSize: 10, fontWeight: "400", color: PROFILE_V2_COLOR.ink },
  hint: { marginTop: 10, fontSize: 12, fontWeight: "400", color: PROFILE_V2_COLOR.mutedLight },
});
