import React, { useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Screen from "@/components/ds/Screen";

/** Photo zoom. Swipe down past 120pt to dismiss. */
export default function PostPhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; uri?: string; name?: string; context?: string }>();
  const uri = typeof params.uri === "string" ? params.uri : "";
  const name = typeof params.name === "string" ? params.name : "";
  const context = typeof params.context === "string" ? params.context : "";
  const dragging = useRef(false);
  const [release, setRelease] = React.useState(false);
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        dragging.current = true;
        setRelease(g.dy > 120);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 1.1) router.back();
        else setRelease(false);
      },
    }),
  ).current;

  return (
    <Screen edges={[]} style={styles.root}>
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}
        style={[styles.close, { top: insets.top + 8 }]}
      >
        <X size={22} color={DS_V3.color.textPrimary} />
      </Pressable>
      {release ? <Text style={styles.release}>Release to close</Text> : null}
      <View style={[styles.fade, { paddingBottom: insets.bottom + 16 }]}>
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {context ? <Text style={styles.context}>{context}</Text> : null}
      </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  close: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  release: {
    position: "absolute",
    top: "46%",
    alignSelf: "center",
    color: DS_V3.color.textPrimary,
    fontSize: 15,
  },
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 4,
  },
  name: { color: DS_V3.color.textPrimary, fontSize: 17, fontWeight: "600" },
  context: { color: DS_V3.color.textSecondary, fontSize: 15 },
});
