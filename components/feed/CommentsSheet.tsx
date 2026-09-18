import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react-native";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { DS_V3 } from "@/lib/design-system";
import Sheet from "@/components/ds/Sheet";
import CommentRow from "@/components/ds/CommentRow";
import Divider from "@/components/ds/Divider";
import Spinner from "@/components/ds/Spinner";
import TextField from "@/components/ds/TextField";
import { relativeTime } from "@/lib/utils/relativeTime";
import { commentRowParts } from "@/lib/comment-row";
import { captureError } from "@/lib/sentry";
import {
  COMMENT_PLACEHOLDER,
  COMMENTS_EMPTY,
  COMMENTS_HEADING,
  commentsSectionKind,
  composerFieldGround,
  sendComposerArmed,
} from "@/lib/post-detail";

type CommentItem = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
};

const PT = DS_V3.space.xs / 4;
const ICON = DS_V3.space.xs * 5;

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
};

export function CommentsSheet({ visible, eventId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const query = useQuery({
    queryKey: ["feed", "comments", eventId],
    queryFn: () =>
      trpcQuery(TRPC.feed.getComments, { eventId, limit: 100 }) as Promise<CommentItem[]>,
    enabled: visible && !!eventId,
  });

  const rows = query.data ?? [];
  const section = commentsSectionKind(query.isPending, rows.length);
  const sendArmed = sendComposerArmed(draft);
  const fieldGround = composerFieldGround("sheet");

  const commentMutation = useMutation({
    mutationFn: (text: string) => trpcMutate(TRPC.feed.comment, { eventId, text }),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["feed", "comments", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["feedCommentPreview", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["liveFeed"] });
    },
    onError: (e) => {
      captureError(e, "CommentsSheetSend");
    },
  });

  const onSend = useCallback(() => {
    const t = draft.trim();
    if (!t || !eventId) return;
    commentMutation.mutate(t);
  }, [draft, eventId, commentMutation]);

  return (
    <Sheet
      visible={visible}
      onDismiss={onClose}
      heading={COMMENTS_HEADING}
      footer={
        <View style={styles.composer}>
          <View style={styles.field}>
            <TextField
              value={draft}
              onChangeText={setDraft}
              placeholder={COMMENT_PLACEHOLDER}
              accessibilityLabel={COMMENT_PLACEHOLDER}
              ground={fieldGround}
              maxLength={200}
              multiline
            />
          </View>
          <Pressable
            onPress={onSend}
            disabled={commentMutation.isPending || !sendArmed}
            style={[styles.send, sendArmed ? styles.sendArmed : styles.sendIdle]}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
            accessibilityState={{ disabled: !sendArmed }}
          >
            <ArrowUp
              size={ICON}
              color={sendArmed ? DS_V3.color.textPrimary : DS_V3.color.textSecondary}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      }
    >
      {section === "loading" ? (
        <View style={styles.center}>
          <Spinner size={44} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <Text style={styles.meta}>{"Couldn't load comments"}</Text>
        </View>
      ) : section === "empty" ? (
        <View style={styles.center}>
          <Text style={styles.meta}>{COMMENTS_EMPTY}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={rows}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => {
            const parts = commentRowParts({
              displayName: item.display_name,
              username: item.username,
              createdAt: item.created_at,
              text: item.text,
              formatTime: relativeTime,
            });
            return (
              <View>
                <CommentRow
                  displayName={parts.name}
                  time={parts.time}
                  body={parts.body}
                  avatarUri={item.avatar_url}
                />
                {index < rows.length - 1 ? <Divider /> : null}
              </View>
            );
          }}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    maxHeight: DS_V3.space.xs * 90,
    marginHorizontal: -DS_V3.space.gutter,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DS_V3.space.section,
  },
  meta: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.sm,
  },
  field: { flex: 1 },
  send: {
    width: DS_V3.size.tap,
    height: DS_V3.size.tap,
    borderRadius: DS_V3.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIdle: {
    backgroundColor: DS_V3.color.canvas,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  sendArmed: {
    backgroundColor: DS_V3.color.primary,
  },
});
