/**
 * Step 1 — Name, duration, solo/group. Visual layer; parent owns state.
 */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { User, Users } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { Card, Chip, HintBox } from "@/components/ds";

export type WizardWho = "solo" | "group";

export type StepBasicsProps = {
  title: string;
  onChangeTitle: (v: string) => void;
  durationDays: number | null;
  onChangeDuration: (days: number | null) => void;
  customDuration: string;
  onChangeCustomDuration: (v: string) => void;
  who: WizardWho;
  onChangeWho: (who: WizardWho) => void;
};

const PRESETS: readonly { days: number; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 21, label: "21 days" },
  { days: 30, label: "30 days" },
  { days: 75, label: "75 days" },
] as const;

const TITLE_LIMIT = 60;
const ICON = DS_V3.space.xs * 6;
const STROKE = (DS_V3.space.xs * 3) / 8;
const PT = DS_V3.space.xs / 4;

export function StepBasics({
  title,
  onChangeTitle,
  durationDays,
  onChangeDuration,
  customDuration,
  onChangeCustomDuration,
  who,
  onChangeWho,
}: StepBasicsProps) {
  const customOpen =
    durationDays == null || !PRESETS.some((p) => p.days === durationDays);
  const overLimit = title.length > TITLE_LIMIT;
  const valid = title.trim().length >= 3 && !overLimit;
  const helper = overLimit
    ? "60 character limit"
    : valid
      ? "Looks good"
      : "Min 3 characters";

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={styles.title}>Name your challenge</Text>
        <Text style={styles.secondary}>One sentence. Be specific.</Text>
      </View>

      <View style={styles.fieldBlock}>
        <Card
          style={overLimit ? styles.inputDanger : undefined}
        >
          <TextInput
            accessibilityLabel="Challenge title"
            value={title}
            onChangeText={onChangeTitle}
            placeholder="Read 30 min before phone"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.input}
          />
          <View style={styles.inputFoot}>
            <Text
              style={[
                styles.caption,
                overLimit
                  ? styles.danger
                  : valid
                    ? styles.brandText
                    : styles.muted,
              ]}
            >
              {helper}
            </Text>
            <Text style={[styles.caption, styles.muted]}>{`${title.length}/60`}</Text>
          </View>
        </Card>
        <Text style={[styles.caption, styles.muted]}>
          Examples: read 30 min before phone · workout 5x weekly · 30 days no alcohol
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>How long?</Text>
        {customOpen ? (
          <TextInput
            accessibilityLabel="Custom duration in days"
            value={customDuration}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              onChangeCustomDuration(cleaned);
              const n = parseInt(cleaned, 10);
              if (!Number.isNaN(n) && n >= 1 && n <= 365) onChangeDuration(n);
              else onChangeDuration(null);
            }}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.customField}
          />
        ) : (
          <View style={styles.chipGrid}>
            {PRESETS.map((d) => (
              <View key={d.days} style={styles.chipCell}>
                <Chip
                  label={d.label}
                  selected={durationDays === d.days}
                  onPress={() => onChangeDuration(d.days)}
                />
              </View>
            ))}
            <View style={styles.chipCell}>
              <Chip
                label="Custom"
                selected={false}
                onPress={() => {
                  onChangeDuration(null);
                  onChangeCustomDuration("");
                }}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Solo or with friends?</Text>
        <View style={styles.whoRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Solo"
            accessibilityState={{ selected: who === "solo" }}
            onPress={() => onChangeWho("solo")}
            style={[styles.whoCard, who === "solo" ? styles.whoOn : styles.whoOff]}
          >
            <User size={ICON} color={DS_V3.color.textPrimary} strokeWidth={2} />
            <Text style={styles.bodyStrong}>Solo</Text>
            <Text style={[styles.caption, styles.muted]}>Just you</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Group"
            accessibilityState={{ selected: who === "group" }}
            onPress={() => onChangeWho("group")}
            style={[styles.whoCard, who === "group" ? styles.whoOn : styles.whoOff]}
          >
            <Users size={ICON} color={DS_V3.color.textPrimary} strokeWidth={2} />
            <Text style={styles.bodyStrong}>Group</Text>
            <Text style={[styles.caption, styles.muted]}>Up to 10</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.hintWrap}>
        <HintBox>30 days is the sweet spot. Build the habit, prove you can.</HintBox>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: DS_V3.space.xs * 35 },
  block: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.xs,
  },
  fieldBlock: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  section: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  hintWrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
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
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
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
  },
  muted: { color: DS_V3.color.textSecondary },
  brandText: { color: DS_V3.color.brandText },
  danger: { color: DS_V3.color.danger },
  input: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
    paddingVertical: 0,
  },
  inputFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: DS_V3.space.md,
  },
  inputDanger: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.danger,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
  },
  chipCell: {
    width: "31%",
    flexGrow: 0,
  },
  customField: {
    minHeight: DS_V3.size.tap,
    backgroundColor: DS_V3.color.surface,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.input,
    paddingHorizontal: DS_V3.space.lg,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    color: DS_V3.color.textPrimary,
  },
  whoRow: { flexDirection: "row", gap: DS_V3.space.md },
  whoCard: {
    flex: 1,
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
    minHeight: DS_V3.size.tap,
  },
  whoOff: {
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  whoOn: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
});
