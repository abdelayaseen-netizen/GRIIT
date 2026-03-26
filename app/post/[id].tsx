import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_COLORS, DS_SPACING } from "@/lib/design-system";
import { getFeedAvatarBgFromUserId, getDisplayInitials } from "@/lib/utils";
import { relativeTime } from "@/lib/utils/relativeTime";
import { captureError } from "@/lib/sentry";
import type { LiveFeedPost } from "@/components/feed/feedTypes";

type LiveFeedResponse = { movingCount: number; posts: LiveFeedPost[] };

type CommentRow = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string;
  username: string;
};

export default function PostThreadScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const cachedPost = useMemo(() => {
    if (!id) return null;
    const all = queryClient.getQueriesData<LiveFeedResponse>({ queryKey: ["liveFeed"] });
    for (const [, data] of all) {
      const p = data?.posts?.find((x) => x.id === id);
      if (p) return p;
    }
    return null;
  }, [queryClient, id]);

  const commentsQuery = useQuery({
    queryKey: ["feed", "comments", id],
    queryFn: () => trpcQuery(TRPC.feed.getComments, { eventId: id, limit: 100 }) as Promise<CommentRow[]>,
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => trpcMutate(TRPC.feed.comment, { eventId: id, text }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", id] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", id] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
      setDraft("");
    },
    onError: (e) => {
      captureError(e, "PostThreadComment");
    },
  });

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !id) return;
    commentMutation.mutate(t);
  }, [draft, id, commentMutation]);

  const title = cachedPost?.challengeName ?? "Post";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
            <ChevronLeft size={22} color={DS_COLORS.TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {cachedPost ? (
          <Text style={styles.meta}>
            {cachedPost.displayName || cachedPost.username} · Day {cachedPost.currentDay} of {cachedPost.totalDays}
          </Text>
        ) : (
          <Text style={styles.meta}>Comments on this check-in</Text>
        )}

        {commentsQuery.isPending ? (
          <ActivityIndicator style={styles.loader} color={DS_COLORS.DISCOVER_CORAL} />
        ) : (
          <FlatList
            data={commentsQuery.data ?? []}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No comments yet. Say something kind.</Text>
            }
            renderItem={({ item }) => {
              const bg = getFeedAvatarBgFromUserId(item.user_id);
              const initials = getDisplayInitials(item.display_name || item.username);
              return (
                <View style={styles.commentRow}>
                  <View style={[styles.av, { backgroundColor: bg }]}>
                    <Text style={styles.avText}>{initials}</Text>
                  </View>
                  <View style={styles.commentMain}>
                    <Text style={styles.commentName}>{item.display_name || item.username}</Text>
                    <Text style={styles.commentBody}>{item.text}</Text>
                    <Text style={styles.commentTime}>{relativeTime(item.created_at)}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment…"
            placeholderTextColor={DS_COLORS.INPUT_PLACEHOLDER}
            value={draft}
            onChangeText={setDraft}
            maxLength={200}
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={commentMutation.isPending || !draft.trim()}
            style={[styles.send, (!draft.trim() || commentMutation.isPending) && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color={DS_COLORS.TEXT_ON_DARK} />
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_COLORS.BG_PAGE },
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_SPACING.md,
    paddingBottom: 8,
  },
  back: { padding: 8, marginLeft: -8 },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: DS_COLORS.FEED_USERNAME,
    textAlign: "center",
  },
  meta: {
    paddingHorizontal: DS_SPACING.lg,
    paddingBottom: 12,
    fontSize: 13,
    color: DS_COLORS.FEED_META_MUTED,
  },
  loader: { marginTop: 24 },
  list: { paddingHorizontal: DS_SPACING.lg, paddingBottom: 16 },
  empty: { textAlign: "center", color: DS_COLORS.FEED_META_MUTED, marginTop: 24, fontSize: 14 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  av: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avText: { fontSize: 12, fontWeight: "600", color: DS_COLORS.TEXT_ON_DARK },
  commentMain: { flex: 1 },
  commentName: { fontSize: 14, fontWeight: "600", color: DS_COLORS.FEED_USERNAME },
  commentBody: { fontSize: 14, color: DS_COLORS.TEXT_PRIMARY, marginTop: 2 },
  commentTime: { fontSize: 11, color: DS_COLORS.FEED_META_MUTED, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: DS_SPACING.md,
    borderTopWidth: 0.5,
    borderTopColor: DS_COLORS.FEED_COMMENT_BORDER,
    backgroundColor: DS_COLORS.BG_CARD,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: DS_COLORS.INPUT_BG,
    borderWidth: 1,
    borderColor: DS_COLORS.INPUT_BORDER,
    fontSize: 15,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  send: {
    backgroundColor: DS_COLORS.DISCOVER_CORAL,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: DS_COLORS.TEXT_ON_DARK, fontWeight: "600", fontSize: 15 },
});
