/**
 * Set your gym after joining a place-gated challenge. Skip writes no place.
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { SET_GYM_SKIP } from "@/lib/featured-catalog";
import { ROUTES } from "@/lib/routes";

const RADII = [100, 250, 1000] as const;

export default function SetGymScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; challengeId?: string }>();
  const title = typeof params.title === "string" ? params.title : "Show Up 7";
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState<number>(250);
  const [place, setPlace] = useState("");

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Text style={styles.title}>Set your gym</Text>
      <Text style={styles.body}>{title} only counts when your photo is taken here.</Text>
      <TextInput
        accessibilityLabel="Search a gym or address"
        placeholder="Search a gym or address"
        placeholderTextColor={DS_V3.color.textSecondary}
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setPlace(place || "Current location")}
        style={styles.row}
      >
        <Text style={styles.rowTitle}>Use my current location</Text>
      </Pressable>
      {place ? <Text style={styles.picked}>{place}</Text> : null}
      <View style={styles.radii}>
        {RADII.map((m) => (
          <Pressable key={m} accessibilityRole="button" onPress={() => setRadius(m)} style={[styles.chip, radius === m ? styles.chipOn : null]}>
            <Text style={styles.chipTxt}>{m === 1000 ? "1 km" : `${m} m`}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.caption}>250 m covers the car park and the building. Bigger is easier to pass.</Text>
      <Button
        label={place ? `Save · ${place}` : "Save"}
        disabled={!place}
        onPress={() => router.replace(ROUTES.TABS_HOME as never)}
      />
      <Button
        label={SET_GYM_SKIP}
        variant="tertiary"
        onPress={() => router.replace(ROUTES.TABS_HOME as never)}
      />
      <Text style={styles.caption}>Skipping means it counts anywhere. You can set it later in the challenge.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas, padding: 20, gap: 12 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "500", color: DS_V3.color.textPrimary },
  body: { fontSize: 15, lineHeight: 20, color: DS_V3.color.textSecondary },
  search: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    paddingHorizontal: 12,
    color: DS_V3.color.textPrimary,
    backgroundColor: DS_V3.color.surface,
  },
  row: { minHeight: 56, justifyContent: "center" },
  rowTitle: { fontSize: 17, fontWeight: "500", color: DS_V3.color.textPrimary },
  picked: { color: DS_V3.color.brandText },
  radii: { flexDirection: "row", gap: 8 },
  chip: { height: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: DS_V3.color.border, justifyContent: "center" },
  chipOn: { borderColor: DS_V3.color.brand },
  chipTxt: { color: DS_V3.color.textPrimary },
  caption: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textSecondary },
});
