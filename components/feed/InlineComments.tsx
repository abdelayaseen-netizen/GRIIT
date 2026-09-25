import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { inlineCommentsState, NO_COMMENTS_YET, viewAllComments } from "@/lib/feed-card-family";
import type { FeedCommentPreview } from "@/components/feed/feedTypes";

export function InlineComments({
  comments,
  total,
  viewerUserId,
  onOpen,
}: {
  comments: FeedCommentPreview[];
  total: number;
  viewerUserId?: string | null;
  onOpen: () => void;
}) {
  const state = inlineCommentsState(total);
  if (state === "none") {
    return <Text style={styles.caption}>{NO_COMMENTS_YET}</Text>;
  }
  const shown = comments.slice(0, 2);
  return (
    <View style={styles.wrap}>
      {shown.map((c, i) => {
        const name = (c.displayName || c.username).trim();
        const mine = viewerUserId && c.userId === viewerUserId;
        return (
          <Text key={`${c.userId}-${c.createdAt}-${i}`} style={styles.line}>
            <Text style={[styles.name, mine ? styles.mine : null]}>{name}</Text>
            {" "}
            <Text style={styles.text}>{c.text}</Text>
          </Text>
        );
      })}
      {state === "more" ? (
        <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={viewAllComments(total)}>
          <Text style={styles.caption}>{viewAllComments(total)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, paddingTop: DS_V3.space.sm },
  line: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  name: { ...DS_V3.type.caption, fontWeight: "500", color: DS_V3.color.textPrimary },
  mine: { color: DS_V3.color.brandText },
  text: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
