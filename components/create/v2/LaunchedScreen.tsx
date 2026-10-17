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
} from "@/lib/late-join-copy";
import type { WizardTask } from "@/components/create/v2/StepTasks";
import InviteLinkRow from "@/components/InviteLinkRow";

export function LaunchedScreen({
  title,
  challengeId,
  group,
  tomorrow,
  tasks,
  timeZone,
  day1Line,
  onHome,
  onInvite,
  onStartToday,
}: {
  title: string;
  /** Build 90 08.1: the invite link (griit://i/<id>) is shown as text with Copy and Share. */
  challengeId?: string;
  days: number;
  group: boolean;
  tomorrow: boolean;
  tasks: WizardTask[];
  timeZone: string;
  day1Line: string;
  onHome: () => void;
  onInvite?: () => void;
  onStartToday?: () => void;
}) {
  const card = launchedFirstCard({ tasks, timeZone });
  const first = card.first;
  const [remind, setRemind] = useState(true);
  const reminderTime =
    first?.gateTime?.start != null
      ? fmt12(minusMinutes(first.gateTime.start, 15))
      : null;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.flex}>
      <View style={styles.body}>
        <Text style={styles.title}>{tomorrow ? LAUNCHED_TOMORROW_TITLE : LAUNCHED_TODAY_TITLE}</Text>
        <Text style={styles.secondary}>{day1Line}</Text>
        {tasks.map((task, index) => (
          <View key={`${task.name}-${index}`} style={styles.card}>
            <ListRow
              icon={
                <StatusRing
                  row={{
                    id: task.name,
                    name: task.name,
                    type: "check_off",
                    caption: gateLabel(task),
                    done: false,
                    closed: false,
                    hasCameraProof: false,
                  }}
                />
              }
              title={task.name}
              subtitle={index === 0 ? card.opensAt ?? gateLabel(task) : gateLabel(task)}
              divider={false}
            />
          </View>
        ))}
        {challengeId ? <InviteLinkRow challengeId={challengeId} challengeName={title} /> : null}
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
        {!tomorrow && first && onStartToday ? (
          <Button label={`Start today: ${first.name}`} onPress={onStartToday} />
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
