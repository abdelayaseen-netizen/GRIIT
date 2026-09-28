/**
 * Frame 114 finish moment. Status follows the save. Share lives here until Secured.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ListRow from "@/components/ds/ListRow";
import ProofImage from "@/components/ds/ProofImage";
import {
  FINISH_BACK_TODAY,
  FINISH_DONE,
  FINISH_FAILED_BODY,
  FINISH_KEEP,
  FINISH_LEAVE_SAVING,
  FINISH_STATUS,
  FINISH_STORY,
  FINISH_TRY_AGAIN,
  type AlsoTodayRow,
  type SaveState,
  type ShareIntent,
  finishAlsoTodayLabel,
  finishNextLabel,
  finishShareLabel,
} from "@/lib/finish-moment";

export type FinishMomentTask = {
  title: string;
  challengeTitle: string;
  dayN: number;
  durationDays: number;
  gateLine: string;
  proofUri?: string | null;
};

export type FinishMomentV3Props = {
  task: FinishMomentTask;
  save: SaveState;
  share: ShareIntent;
  alsoToday: AlsoTodayRow[];
  onRetry: () => void;
  onShareFeed: () => void;
  onStory?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
  onMore?: () => void;
  onNextTask: (id: string) => void;
  onLeave: () => void;
};

export default function FinishMomentV3({
  task,
  save,
  share,
  alsoToday,
  onRetry,
  onShareFeed,
  onStory,
  onCopy,
  onSave,
  onMore,
  onNextTask,
  onLeave,
}: FinishMomentV3Props) {
  const insets = useSafeAreaInsets();
  const pending = save === "saving" || save === "slow";
  const failed = save === "failed";
  const next = alsoToday[0];
  const shareDisabled = failed;
  const shrinkPhoto = save === "saved" && alsoToday.length > 0;
  const photoH = shrinkPhoto ? 170 : 252;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + DS_V3.space.xs, paddingBottom: insets.bottom + DS_V3.space.section * 5 },
        ]}
      >
        <View style={styles.statusRow}>
          <Text style={[styles.status, failed ? styles.statusDanger : null]}>{FINISH_STATUS[save]}</Text>
          {failed ? (
            <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button" accessibilityLabel={FINISH_TRY_AGAIN}>
              <Text style={styles.retry}>{FINISH_TRY_AGAIN}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.label}>{FINISH_DONE}</Text>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.secondary}>
          {task.challengeTitle} · Day {task.dayN} of {task.durationDays}
        </Text>

        <View style={styles.preview}>
          {task.proofUri ? (
            <View style={[styles.photoFrame, { height: photoH }]}>
              <ProofImage uri={task.proofUri} size="feed" />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>{task.challengeTitle}</Text>
              <View>
                <Text style={styles.cardTitle}>{task.title}</Text>
                <View style={styles.dayRow}>
                  <Text style={styles.dayN}>Day {task.dayN}</Text>
                  <Text style={styles.secondary}>of {task.durationDays}</Text>
                </View>
              </View>
              <Text style={styles.caption}>{task.gateLine}</Text>
            </View>
          )}
        </View>

        <View style={styles.shareRow}>
          <View style={styles.shareBtn}>
            <Button
              label={finishShareLabel(share)}
              variant="secondary"
              disabled={shareDisabled || share === "feed_held"}
              onPress={share === "feed_held" || shareDisabled ? undefined : onShareFeed}
            />
          </View>
          <View style={styles.shareBtn}>
            <Button label={FINISH_STORY} variant="secondary" disabled={shareDisabled} onPress={shareDisabled ? undefined : onStory} />
          </View>
        </View>

        <View style={styles.iconRow}>
          <Pressable style={styles.iconHit} onPress={onCopy} accessibilityRole="button" accessibilityLabel="Copy">
            <Text style={styles.iconLabel}>Copy</Text>
          </Pressable>
          <Pressable style={styles.iconHit} onPress={onSave} accessibilityRole="button" accessibilityLabel="Save">
            <Text style={styles.iconLabel}>Save</Text>
          </Pressable>
          <Pressable style={styles.iconHit} onPress={onMore} accessibilityRole="button" accessibilityLabel="More">
            <Text style={styles.iconLabel}>More</Text>
          </Pressable>
        </View>

        {save === "saved" && alsoToday.length > 0 ? (
          <View style={styles.also}>
            <Text style={styles.label}>{finishAlsoTodayLabel(alsoToday.length)}</Text>
            {alsoToday.map((row) => (
              <ListRow
                key={row.id}
                title={row.title}
                subtitle={row.gate_line}
                onPress={() => onNextTask(row.id)}
              />
            ))}
          </View>
        ) : null}

        {failed ? <Text style={styles.failedBody}>{FINISH_FAILED_BODY}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + DS_V3.space.md }]}>
        {save === "slow" ? (
          <Button label={FINISH_LEAVE_SAVING} variant="secondary" onPress={onLeave} />
        ) : failed ? null : (
          <Button
            label={next && !pending ? finishNextLabel(next.title) : finishNextLabel()}
            disabled={pending || !next}
            onPress={next && !pending ? () => onNextTask(next.id) : undefined}
          />
        )}
        <Button
          label={failed ? FINISH_BACK_TODAY : FINISH_KEEP}
          variant="tertiary"
          ink
          onPress={onLeave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { paddingHorizontal: DS_V3.space.gutter },
  statusRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  status: { ...DS_V3.type.secondary, fontWeight: "500", flex: 1, color: DS_V3.color.textSecondary },
  statusDanger: { color: DS_V3.color.danger },
  retry: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
  label: { ...DS_V3.type.label, color: DS_V3.color.textSecondary, marginTop: DS_V3.space.sm },
  title: { ...DS_V3.type.title, color: DS_V3.color.textPrimary },
  secondary: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  preview: { marginTop: DS_V3.space.md },
  photoFrame: {
    width: "100%",
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
  },
  card: {
    height: 252,
    borderRadius: DS_V3.radius.card,
    backgroundColor: DS_V3.color.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DS_V3.color.border,
    padding: 18,
    justifyContent: "space-between",
  },
  cardEyebrow: { ...DS_V3.type.label, color: DS_V3.color.textSecondary },
  cardTitle: { ...DS_V3.type.title, color: DS_V3.color.textPrimary },
  dayRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  dayN: {
    fontFamily: "BarlowCondensed_600SemiBold",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    color: DS_V3.color.textPrimary,
  },
  caption: { ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
  shareRow: { flexDirection: "row", gap: 8, marginTop: DS_V3.space.md },
  shareBtn: { flex: 1 },
  iconRow: { flexDirection: "row", gap: 8, marginTop: DS_V3.space.sm },
  iconHit: {
    width: 64,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: { fontSize: 11, lineHeight: 14, color: DS_V3.color.textSecondary },
  also: { marginTop: DS_V3.space.md },
  failedBody: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, marginTop: DS_V3.space.md },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DS_V3.color.border,
    backgroundColor: DS_V3.color.canvas,
    gap: DS_V3.space.sm,
  },
});
