/**
 * Dev-only. Route: /dev/build92-posts?mode=new|legacy&start=10
 * Build 92 chunk 07.1: a 25-post profile viewer with a JS frame meter, for the before/after
 * scroll-freeze numbers. `legacy` is the build 91 list (FlashList, full-res images, JS scroll event).
 */
import React, { useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "@/components/ds/Screen";
import { GlassTopBar, TOP_BAR_ROW_HEIGHT } from "@/components/ds/glass";
import { DS_V3 } from "@/lib/design-system";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import { syntheticPosts } from "@/lib/dev-synthetic-posts";
import PostViewer from "@/components/profile/PostViewer";
import { frameSummaryLine, useFrameMeter } from "@/lib/frame-meter";

function param(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : Array.isArray(v) ? (v[0] ?? "") : "";
}

export default function Build92PostsDev() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; start?: string }>();
  const mode = param(params.mode) === "legacy" ? "legacy" : "new";
  const start = Number(param(params.start) || "10");
  const posts = useMemo(() => syntheticPosts(), []);
  const meter = useFrameMeter(10_000);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  if (!__DEV__) return null;

  const meterBar = (
    <View style={styles.meter} testID="frame-meter">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start meter"
        onPress={meter.start}
        style={styles.meterBtn}
      >
        <Text style={styles.meterBtnText}>{meter.running ? "Measuring 10 s…" : `Start meter (${mode})`}</Text>
      </Pressable>
      <Text style={styles.meterText} testID="frame-meter-result" accessibilityLabel={meter.summary ? frameSummaryLine(meter.summary) : "no result"}>
        {meter.summary ? frameSummaryLine(meter.summary) : "—"}
      </Text>
    </View>
  );

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ headerShown: false }} />
      {mode === "legacy" ? (
        <LegacyList posts={posts} startId={`dev-post-${start}`} onBack={() => router.back()} />
      ) : (
        <PostViewer
          title="Posts"
          posts={posts}
          startId={`dev-post-${start}`}
          isOwner
          liked={liked}
          isPending={false}
          refreshing={false}
          onRefresh={() => undefined}
          onBack={() => router.back()}
          onLike={(item, on) => setLiked((prev) => ({ ...prev, [item.id]: !on }))}
          onOpenPost={() => undefined}
        />
      )}
      <View pointerEvents="box-none" style={styles.overlay}>
        {meterBar}
      </View>
    </Screen>
  );
}

/** Build 91 `app/profile/posts.tsx` list, kept here only to measure the "before" number. */
function LegacyList({ posts, startId, onBack }: { posts: LiveFeedPost[]; startId: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }),
    [scrollY],
  );
  const startIndex = Math.max(0, posts.findIndex((p) => p.id === startId));
  return (
    <>
      <GlassTopBar title="Posts (legacy)" scrollY={scrollY} onBack={onBack} />
      <FlashList
        data={posts}
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialScrollIndex={startIndex}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_ROW_HEIGHT, paddingBottom: insets.bottom }}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={(info) => {
          const indexes = info.viewableItems.map((v) => v.index).filter((n): n is number => n != null);
          const next = indexes.length ? Math.max(...indexes) + 1 : 0;
          const urls = posts.slice(next, next + 3).map((p) => p.photoUrl).filter((u): u is string => Boolean(u));
          if (urls.length) void Image.prefetch(urls);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photoUrl ? <Image source={{ uri: item.photoUrl }} style={styles.photo} contentFit="cover" /> : null}
            <Text style={styles.line}>
              {item.challengeName} · Day {item.currentDay} of {item.totalDays}
            </Text>
            {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, right: 0, bottom: 0 },
  meter: {
    margin: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    gap: 6,
  },
  meterBtn: { height: 36, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: DS_V3.color.textPrimary },
  meterBtnText: { color: DS_V3.color.canvas, fontSize: 14, fontWeight: "600" },
  meterText: { fontSize: 13, color: DS_V3.color.textPrimary, fontVariant: ["tabular-nums"] },
  card: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  photo: { width: "100%", aspectRatio: 1, borderRadius: 16, backgroundColor: DS_V3.color.surface },
  line: { fontSize: 16, fontWeight: "600", color: DS_V3.color.textPrimary },
  caption: { fontSize: 15, lineHeight: 21, color: DS_V3.color.textPrimary },
});
