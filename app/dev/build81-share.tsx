/**
 * Export every share style to Photos. Route: /dev/build81-share
 */
import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import ViewShot from "react-native-view-shot";
import Screen from "@/components/ds/Screen";
import ShareImage from "@/components/share/ShareImage";
import { saveStickerToPhotos } from "@/lib/share";
import { SHARE_H, SHARE_W, type GridCell, type ShareStyleId } from "@/lib/share-image";
import { DS_V3 } from "@/lib/design-system";

const STYLES: ShareStyleId[] = ["A", "B", "C", "D", "E", "F", "G"];

const card = {
  colour: "ink" as const,
  challenge: "Gym once a day",
  task: "Workout",
  day: 5,
  durationDays: 7,
  secured: 4,
  username: "yaseenabdelaz",
  inviteCode: "demo",
  cells: ["secured", "missed", "secured", "missed", "today", "future", "future"] as GridCell[],
};

export default function Build81Share() {
  const refs = useRef<(ViewShot | null)[]>([]);
  const [saved, setSaved] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const saveAll = async () => {
    setStatus(null);
    for (let i = 0; i < STYLES.length; i++) {
      const uri = await refs.current[i]?.capture?.();
      if (!uri) {
        setStatus("missed");
        return;
      }
      const result = await saveStickerToPhotos(uri);
      if (result !== "saved") {
        setStatus(result);
        return;
      }
      setSaved(i + 1);
    }
    setStatus("saved");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen edges={["top", "left", "right"]}>
        <Pressable testID="share-save-all" onPress={() => void saveAll()} style={styles.hit}>
          <Text style={styles.label}>Save all styles</Text>
        </Pressable>
        <Text testID={saved === STYLES.length ? "share-saved-all" : "share-saved-count"} style={styles.label}>
          {status === "saved" ? "Saved" : status ?? `${saved} saved`}
        </Text>
        <View style={styles.preview}>
          <View style={styles.scale}>
            <ShareImage input={{ ...card, style: "E", colour: "ink" }} />
          </View>
        </View>
        <View style={styles.shotHost} pointerEvents="none">
          {STYLES.map((style, index) => (
            <ViewShot
              key={style}
              ref={(node) => {
                refs.current[index] = node;
              }}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
              style={{ width: SHARE_W, height: SHARE_H }}
            >
              <ShareImage input={{ ...card, style, colour: style === "E" ? "orange" : style === "D" ? "white" : "ink" }} />
            </ViewShot>
          ))}
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hit: { padding: 16 },
  label: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  preview: { height: 420, overflow: "hidden", alignItems: "center" },
  scale: { transform: [{ scale: 0.22 }], transformOrigin: "top" },
  shotHost: { position: "absolute", left: -SHARE_W - 40, top: 0 },
});
