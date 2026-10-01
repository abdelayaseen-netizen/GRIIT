/**
 * Frame 114 finish moment. Status follows the save. Share lives here until Secured.
 */
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ListRow from "@/components/ds/ListRow";
import ProofImage from "@/components/ds/ProofImage";
import ScreenChrome from "@/components/ds/ScreenChrome";
import FinishTextCard from "@/components/share/FinishTextCard";
import ShareStickerSheet from "@/components/share/ShareStickerSheet";
import { facebookAppId, showStoryAction } from "@/lib/share-sticker";
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
  finishPrimaryCta,
  finishShareLabel,
} from "@/lib/finish-moment";

export type FinishMomentTask = {
  title: string;
  challengeTitle: string;
  dayN: number;
  durationDays: number;
  gateLine: string;
  proofUri?: string | null;
  proofKind?: "camera" | "camera_place" | "self";
};

export type FinishMomentV3Props = {
  task: FinishMomentTask;
  save: SaveState;
  share: ShareIntent;
  alsoToday: AlsoTodayRow[];
  photoShared?: boolean;
  onRetry: () => void;
  onShareFeed: () => void;
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
  photoShared = false,
  onRetry,
  onShareFeed,
  onCopy,
  onSave,
  onMore,
  onNextTask,
  onLeave,
}: FinishMomentV3Props) {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const pending = save === "saving" || save === "slow";
  const failed = save === "failed";
  const next = alsoToday[0];
  const shareDisabled = failed;
  const shrinkPhoto = save === "saved" && alsoToday.length > 0;
  const photoH = shrinkPhoto ? 170 : 252;
  const camera = Boolean(task.proofUri);
  const showStory = showStoryAction(facebookAppId());
  const openSheet = () => {
    if (shareDisabled) return;
    setSheetOpen(true);
  };

  return (
    <ScreenChrome>
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
            <View style={styles.cardWrap}>
              <FinishTextCard
                challengeTitle={task.challengeTitle}
                title={task.title}
                dayN={task.dayN}
                durationDays={task.durationDays}
                gateLine={task.gateLine}
              />
            </View>
          )}
        </View>

        <View style={styles.shareCol}>
          <Button
            label={finishShareLabel(share)}
            variant="secondary"
            fill
            singleLine
            disabled={shareDisabled || share === "feed_held"}
            onPress={share === "feed_held" || shareDisabled ? undefined : onShareFeed}
          />
          {showStory ? (
            <Button
              label={FINISH_STORY}
              variant="secondary"
              fill
              disabled={shareDisabled}
              onPress={shareDisabled ? undefined : openSheet}
            />
          ) : null}
        </View>

        <View style={styles.auxRow}>
          <View style={styles.auxBtn}>
            <Button
              label="Copy"
              variant="secondary"
              size="small"
              fill
              labelType="secondary"
              disabled={shareDisabled}
              onPress={shareDisabled ? undefined : () => { setSheetOpen(true); onCopy?.(); }}
            />
          </View>
          <View style={styles.auxBtn}>
            <Button
              label="Save"
              variant="secondary"
              size="small"
              fill
              labelType="secondary"
              disabled={shareDisabled}
              onPress={shareDisabled ? undefined : () => { setSheetOpen(true); onSave?.(); }}
            />
          </View>
          <View style={styles.auxBtn}>
            <Button
              label="More"
              variant="secondary"
              size="small"
              fill
              labelType="secondary"
              disabled={shareDisabled}
              onPress={shareDisabled ? undefined : () => { setSheetOpen(true); onMore?.(); }}
            />
          </View>
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
            label={pending ? finishNextLabel() : finishPrimaryCta(next?.title)}
            disabled={pending}
            onPress={
              pending ? undefined : next ? () => onNextTask(next.id) : onLeave
            }
          />
        )}
        <Button
          label={failed ? FINISH_BACK_TODAY : FINISH_KEEP}
          variant="tertiary"
          ink
          onPress={onLeave}
        />
      </View>
      <ShareStickerSheet
        visible={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        variant={camera ? "day" : "text"}
        day={
          camera
            ? {
                challenge: task.challengeTitle,
                day: task.dayN,
                durationDays: task.durationDays,
                proof: task.proofKind === "camera_place" ? "camera_place" : "camera",
                photoUri: task.proofUri,
                photoShared,
              }
            : undefined
        }
        text={
          camera
            ? undefined
            : {
                challengeTitle: task.challengeTitle,
                title: task.title,
                dayN: task.dayN,
                durationDays: task.durationDays,
                gateLine: task.gateLine,
              }
        }
      />
    </View>
    </ScreenChrome>
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
  cardWrap: { width: "100%" },
  shareCol: { gap: 8, marginTop: DS_V3.space.md },
  auxRow: { flexDirection: "row", gap: 8, marginTop: DS_V3.space.sm },
  auxBtn: { flex: 1 },
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
