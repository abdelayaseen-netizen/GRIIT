/**
 * Launched — "You're in." plus first-task card (104–105 / 116).
 */
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import ListRow from "@/components/ds/ListRow";
import Switch from "@/components/ds/Switch";
import { StatusRing } from "@/components/home/HomeV3";
import type { HomeProofRow } from "@/lib/home-proof-card";
import { launchedFirstCard } from "@/lib/create-launched";
import { gateLabel } from "@/lib/task-ui";
import { fmt12 } from "@/lib/time-gate-picker";
import {
  LAUNCHED_BACK_HOME,
  LAUNCHED_BACK_TODAY,
  LAUNCHED_REMINDER_CAPTION,
  LAUNCHED_TODAY_TITLE,
  LAUNCHED_TOMORROW_TITLE,
  launchedReminderLabel,
  launchedTodayLine,
  launchedTomorrowBody,
} from "@/lib/late-join-copy";
import type { WizardTask } from "@/components/create/v2/StepTasks";

export function LaunchedScreen({
  title,
  days,
  group,
  tomorrow,
  tasks,
  timeZone,
  onHome,
  onInvite,
  onNext,
}: {
  title: string;
  days: number;
  group: boolean;
  tomorrow: boolean;
  tasks: WizardTask[];
  timeZone: string;
  onHome: () => void;
  onInvite?: () => void;
  onNext?: () => void;
}) {
  const card = launchedFirstCard({ tasks, timeZone });
  const first = card.first;
  const [remind, setRemind] = useState(true);
  const previewRow: HomeProofRow | null = first
    ? {
        id: "first",
        name: first.name,
        type: "check_off",
        caption: gateLabel(first),
        done: false,
        closed: false,
        hasCameraProof: false,
      }
    : null;
  const window =
    first?.gateTime?.mode === "between" && first.gateTime.start && first.gateTime.end
      ? { a: fmt12(first.gateTime.start), b: fmt12(first.gateTime.end) }
      : first?.gateTime?.mode === "by" && first.gateTime.start
        ? { a: fmt12("00:00"), b: fmt12(first.gateTime.start) }
        : null;
  const reminderTime =
    first?.gateTime?.start != null
      ? fmt12(minusMinutes(first.gateTime.start, 15))
      : null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
      <View style={styles.body}>
        <Text style={styles.title}>{tomorrow ? LAUNCHED_TOMORROW_TITLE : LAUNCHED_TODAY_TITLE}</Text>
        <Text style={styles.secondary}>
          {tomorrow && first && window
            ? launchedTomorrowBody(first.name, window.a, window.b)
            : launchedTodayLine(title, days)}
        </Text>
        {previewRow ? (
          <View style={styles.card}>
            <ListRow
              icon={<StatusRing row={previewRow} />}
              title={previewRow.name}
              subtitle={card.opensAt ?? previewRow.caption}
              divider={false}
            />
          </View>
        ) : null}
        {tomorrow && reminderTime ? (
          <View style={styles.remind}>
            <View style={styles.remindCopy}>
              <Text style={styles.bodyStrong}>{launchedReminderLabel(reminderTime)}</Text>
              <Text style={styles.caption}>{LAUNCHED_REMINDER_CAPTION}</Text>
            </View>
            <Switch value={remind} onValueChange={setRemind} accessibilityLabel="Remind me" />
          </View>
        ) : null}
      </View>
      <View style={styles.footer}>
        {group && onInvite ? (
          <Button label="Invite friends" variant="secondary" onPress={onInvite} />
        ) : null}
        {!tomorrow && card.nextLabel && onNext ? (
          <Button label={card.nextLabel} onPress={onNext} />
        ) : null}
        <Button
          label={tomorrow ? LAUNCHED_BACK_TODAY : LAUNCHED_BACK_HOME}
          variant={tomorrow || !card.nextLabel ? "primary" : "tertiary"}
          onPress={onHome}
        />
      </View>
    </SafeAreaView>
  );
}

function minusMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = Math.max(0, (h ?? 0) * 60 + (m ?? 0) - minutes);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.xs * 16,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  card: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    marginHorizontal: -DS_V3.space.gutter,
  },
  remind: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.lg,
    minHeight: DS_V3.size.tap,
  },
  remindCopy: { flex: 1, gap: DS_V3.space.xs },
  bodyStrong: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  footer: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
});
