/**
 * Build 92 04.1 / 04.2: what a post shows for its result, with its one badge.
 * Handoff `src/finish/PostResult.tsx`; token mapping in docs/reports/build92.md (Chunk 04).
 * Solid surface, never glass.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { resultLine, type PostBadge, type PostResult } from "@/lib/post-result";

export function PostResultRow({
  result,
  badge,
  title,
  compact,
}: {
  result: PostResult | null | undefined;
  badge: PostBadge;
  /** Shown above the result when the post has no photo (the task name). */
  title?: string | null;
  compact?: boolean;
}) {
  const r = resultLine(result);
  const a11y = [title, r?.kind, r?.big, r?.sub, badge].filter(Boolean).join(", ");
  return (
    <View
      testID="post-result"
      style={[styles.box, compact ? styles.boxCompact : null]}
      accessible
      accessibilityLabel={a11y}
    >
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
      {r ? (
        <>
          <Text style={styles.kind}>{r.kind}</Text>
          <Text style={styles.big} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {r.big}
          </Text>
          {r.sub ? <Text style={styles.sub}>{r.sub}</Text> : null}
        </>
      ) : null}
      <Text style={styles.badge} testID="post-badge">{badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: DS_V3.color.surface,
    padding: 16,
    gap: 4,
  },
  boxCompact: { padding: 12 },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  kind: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  // Handoff `earnedNumber` → headline with tabular figures (Barlow is not loaded in the app).
  big: {
    fontSize: DS_V3.type.headline.fontSize,
    lineHeight: DS_V3.type.headline.lineHeight,
    fontWeight: DS_V3.type.headline.fontWeight,
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  sub: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  // Handoff `captionStrong` → caption at 600 (the label token is uppercase; badges are sentence case).
  badge: { ...DS_V3.type.caption, fontWeight: "600", color: DS_V3.color.textSecondary, paddingTop: 4 },
});
