/**
 * Review — own screen (104–105). Not a modal.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import EmptyState from "@/components/ds/EmptyState";
import { WizardFooter, WizardHeader } from "@/components/create/v2/WizardChrome";
import {
  REVIEW_EACH_DAY,
  REVIEW_SETTINGS,
  START_THE_CHALLENGE,
  reviewSettingsRows,
  reviewTaskLine,
  reviewTitleLine,
} from "@/lib/create-review";
import type { WizardTask } from "@/components/create/v2/StepTasks";
import type { WizardWho } from "@/components/create/v2/StepBasics";
import type { WizardDifficulty } from "@/components/create/v2/StepRules";

const PT = DS_V3.space.xs / 4;

export function StepReview({
  title,
  category,
  days,
  who,
  difficulty,
  visibility,
  starts,
  tasks,
  launchState,
  onBack,
  onLaunch,
  onEditStep,
}: {
  title: string;
  category: string | null;
  days: number;
  who: WizardWho;
  difficulty: WizardDifficulty;
  visibility: string;
  starts: string;
  tasks: WizardTask[];
  launchState: "idle" | "loading" | "error";
  onBack: () => void;
  onLaunch: () => void;
  onEditStep: (step: 1 | 2 | 3) => void;
}) {
  const meta = reviewTitleLine({ category, days, who, difficulty });
  const rows = tasks.map(reviewTaskLine);
  const settings = reviewSettingsRows({ visibility, starts });
  return (
    <View style={styles.flex}>
      <WizardHeader step={3} total={3} onCancel={onBack} cancelLabel="Back" center="Review" />
      <View style={styles.body}>
        <Text style={styles.title}>{title.trim()}</Text>
        <Pressable onPress={() => onEditStep(1)} accessibilityRole="button" accessibilityLabel="Edit basics">
          <Text style={styles.meta}>{meta}</Text>
        </Pressable>
        <Text style={styles.heading}>{REVIEW_EACH_DAY}</Text>
        {rows.map((row) => (
          <Pressable
            key={row.name}
            onPress={() => onEditStep(2)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${row.name}`}
            style={styles.taskRow}
          >
            <Text style={styles.bodyStrong}>{row.name}</Text>
            <Text style={styles.caption}>{row.proof}</Text>
          </Pressable>
        ))}
        <Text style={styles.heading}>{REVIEW_SETTINGS}</Text>
        {settings.map((row) => (
          <View key={row.label} style={styles.settingRow}>
            <Text style={styles.caption}>{row.label}</Text>
            <Text style={styles.secondary}>{row.value}</Text>
          </View>
        ))}
        {launchState === "error" ? (
          <EmptyState
            heading="Could not launch"
            body="Check your connection and try again."
            actionLabel="Retry"
            variant="error"
            onAction={onLaunch}
          />
        ) : null}
      </View>
      <WizardFooter>
        <Button
          label={launchState === "loading" ? "Starting" : START_THE_CHALLENGE}
          submitting={launchState === "loading"}
          onPress={onLaunch}
        />
      </WizardFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  meta: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  heading: {
    marginTop: DS_V3.space.md,
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  taskRow: {
    minHeight: DS_V3.size.tap,
    paddingVertical: DS_V3.space.sm,
    borderBottomWidth: PT,
    borderBottomColor: DS_V3.color.border,
    gap: DS_V3.space.xs,
  },
  settingRow: {
    minHeight: DS_V3.size.tap,
    justifyContent: "center",
    gap: DS_V3.space.xs,
  },
  bodyStrong: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
