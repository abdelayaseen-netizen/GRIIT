// Build 92 chunk 07.1 / 07.5 · Post viewer (P2-12, P2-13).
// The build 91 freeze came from full-resolution images decoded per recycled cell, a JS-thread scroll
// event and repeated prefetches. This list has a fixed row layout, recycles decoded images by URL and
// drives the top bar on the native thread.
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react-native";
import { GlassTopBar, TOP_BAR_ROW_HEIGHT } from "@/components/ds/glass";
import { DS_V3 } from "@/lib/design-system";
import { audienceBadge } from "@/lib/post-audience";
import { likedByLine } from "@/lib/post-result";
import { photoPagerLine } from "@/lib/profile-header";
import type { LiveFeedPost } from "@/components/feed/feedTypes";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";

const GUTTER = 20;
/** Text block under the photo: title, date, action row, gaps and vertical padding. */
const BASE_BELOW_H = 22 + 18 + 44 + 8 * 3 + 32;
const CAPTION_H = 42 + 8;
const AUDIENCE_H = 18 + 8;

/** Row height from the data alone, so the list has a fixed layout without blank caption space. */
export function postRowHeight(p: Pick<LiveFeedPost, "caption" | "audience" | "photoUrl" | "proofPhotoUrl">, photoW: number): number {
  const photo = postPhotos(p).length > 0 ? photoW + 8 : 0;
  return photo + BASE_BELOW_H + (p.caption ? CAPTION_H : 0) + (audienceBadge(p.audience) ? AUDIENCE_H : 0);
}

export function postDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** The photos of a post: the shared photo, plus the proof photo when it is a different file. */
export function postPhotos(p: Pick<LiveFeedPost, "photoUrl" | "proofPhotoUrl">): string[] {
  const out: string[] = [];
  if (p.photoUrl) out.push(p.photoUrl);
  if (p.proofPhotoUrl && p.proofPhotoUrl !== p.photoUrl) out.push(p.proofPhotoUrl);
  return out;
}

export type PostViewerProps = {
  title: string;
  posts: LiveFeedPost[];
  startId: string;
  isOwner: boolean;
  liked: Record<string, boolean>;
  isPending: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onLike: (item: LiveFeedPost, on: boolean) => void;
  onOpenPost: (id: string) => void;
  /** Dev harness: measures the scroll meter under the list. */
  footer?: React.ReactNode;
};

export default function PostViewer(p: PostViewerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoW = width - GUTTER * 2;
  // Prefix offsets: getItemLayout stays O(1) per call.
  const offsets = useMemo(() => {
    const out: number[] = [0];
    for (const post of p.posts) out.push((out[out.length - 1] ?? 0) + postRowHeight(post, photoW));
    return out;
  }, [p.posts, photoW]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true }),
    [scrollY],
  );
  const startIndex = useMemo(() => {
    const i = p.posts.findIndex((x) => x.id === p.startId);
    return i >= 0 ? i : 0;
  }, [p.posts, p.startId]);
  // initialScrollIndex does not emit a scroll event; seed the bar's glass with the opening offset.
  useEffect(() => {
    scrollY.setValue(offsets[startIndex] ?? 0);
  }, [offsets, startIndex, scrollY]);
  const getItemLayout = useCallback(
    (_: ArrayLike<LiveFeedPost> | null | undefined, index: number) => ({
      length: (offsets[index + 1] ?? 0) - (offsets[index] ?? 0),
      offset: offsets[index] ?? 0,
      index,
    }),
    [offsets],
  );
  const renderItem = useCallback(
    ({ item }: { item: LiveFeedPost }) => (
      <PostCard
        item={item}
        photoW={photoW}
        isOwner={p.isOwner}
        liked={p.liked[item.id]}
        onLike={p.onLike}
        onOpenPost={p.onOpenPost}
      />
    ),
    [photoW, p.isOwner, p.liked, p.onLike, p.onOpenPost],
  );

  return (
    <>
      <GlassTopBar title={p.title} scrollY={scrollY} onBack={p.onBack} />
      <Animated.FlatList
        testID="post-viewer"
        data={p.posts}
        renderItem={renderItem}
        keyExtractor={keyOf}
        getItemLayout={getItemLayout}
        initialScrollIndex={p.posts.length ? Math.min(startIndex, p.posts.length - 1) : undefined}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews
        onScroll={onScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_ROW_HEIGHT, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={p.isPending ? null : <Text style={[styles.meta, styles.emptyText]}>No posts yet.</Text>}
        ListFooterComponent={p.footer ? <>{p.footer}</> : null}
        onRefresh={p.onRefresh}
        refreshing={p.refreshing}
      />
    </>
  );
}

const keyOf = (item: LiveFeedPost) => item.id;

const PostCard = memo(function PostCard({
  item,
  photoW,
  isOwner,
  liked,
  onLike,
  onOpenPost,
}: {
  item: LiveFeedPost;
  photoW: number;
  isOwner: boolean;
  liked: boolean | undefined;
  onLike: (item: LiveFeedPost, on: boolean) => void;
  onOpenPost: (id: string) => void;
}) {
  const on = liked ?? item.reactedByMe;
  const extra = on === item.reactedByMe ? 0 : on ? 1 : -1;
  const count = Math.max(0, item.respectCount + extra);
  const photos = postPhotos(item);
  const [page, setPage] = useState(0);
  const onPage = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setPage(Math.round(e.nativeEvent.contentOffset.x / Math.max(1, photoW)));
    },
    [photoW],
  );
  const pager = photoPagerLine(page, photos.length);
  const likedBy = likedByLine(item.lastReactorName, count) ?? (count > 0 ? `${count} ${count === 1 ? "like" : "likes"}` : null);
  return (
    <View style={styles.card} testID={`post-card-${item.id}`}>
      {photos.length > 0 ? (
        <View style={{ width: photoW, height: photoW }}>
          <DoubleTapRespect respected={on} onRespect={() => onLike(item, on)} onOpen={() => undefined}>
            {photos.length === 1 ? (
              <PostPhoto uri={photos[0] ?? ""} photoW={photoW} label={`${item.challengeName} photo`} />
            ) : (
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={photos.length > 1}
              keyExtractor={(uri, i) => `${item.id}:${i}:${uri}`}
              onMomentumScrollEnd={onPage}
              getItemLayout={(_, index) => ({ length: photoW, offset: photoW * index, index })}
              renderItem={({ item: uri }) => (
                <PostPhoto uri={uri} photoW={photoW} label={`${item.challengeName} photo`} />
              )}
            />
            )}
          </DoubleTapRespect>
          {pager ? (
            <View style={styles.pager} pointerEvents="none">
              <Text style={styles.pagerText}>{pager}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.below}>
        <Text style={styles.line} numberOfLines={1}>
          {item.challengeName} · Day {item.currentDay} of {item.totalDays}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>{postDate(item.createdAt)}</Text>
        {item.caption ? <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text> : null}
        {audienceBadge(item.audience) ? (
          <Text style={styles.meta} numberOfLines={1}>{audienceBadge(item.audience)}</Text>
        ) : null}
        <View style={styles.row}>
          {isOwner ? (
            <Text style={styles.meta} numberOfLines={1} testID="post-liked-by">
              {likedBy ?? ""}
            </Text>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={on ? "Liked by you" : "Like"}
              onPress={() => onLike(item, on)}
              style={styles.action}
            >
              <Heart size={18} color={DS_V3.color.textPrimary} fill={on ? DS_V3.color.textPrimary : "transparent"} />
              <Text style={styles.meta}>{count}</Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Comment"
            onPress={() => onOpenPost(item.id)}
            style={styles.action}
          >
            <MessageCircle size={18} color={DS_V3.color.textPrimary} />
            <Text style={styles.meta}>{item.commentCount}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Post actions"
            onPress={() => onOpenPost(item.id)}
            style={styles.action}
          >
            <MoreHorizontal size={18} color={DS_V3.color.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
});

function PostPhoto({ uri, photoW, label }: { uri: string; photoW: number; label: string }) {
  return (
    <Image
      source={{ uri }}
      recyclingKey={uri}
      style={[styles.photo, { width: photoW, height: photoW }]}
      contentFit="cover"
      cachePolicy="memory-disk"
      allowDownscaling
      transition={120}
      accessibilityLabel={label}
    />
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: GUTTER, paddingVertical: 16, gap: 8 },
  below: { gap: 8 },
  photo: { borderRadius: 16, backgroundColor: DS_V3.color.surface },
  pager: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  pagerText: { fontSize: 12, lineHeight: 16, color: "#FFFFFF", fontVariant: ["tabular-nums"] },
  line: { fontSize: 16, lineHeight: 22, fontWeight: "600", color: DS_V3.color.textPrimary },
  caption: { fontSize: 15, lineHeight: 21, height: 42, color: DS_V3.color.textPrimary },
  // Heights above must stay in step with postRowHeight: line 22, meta 18, caption 42, row 44, gap 8.
  meta: { fontSize: 13, lineHeight: 18, color: DS_V3.color.textSecondary },
  emptyText: { paddingHorizontal: GUTTER, paddingTop: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 16, minHeight: 44 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
});
