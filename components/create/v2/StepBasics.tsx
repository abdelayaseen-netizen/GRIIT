/**
 * StepBasics — Step 1 of CreateWizardV2.
 *
 * Captures: title, duration, solo/group.
 * Pure controlled component. Parent owns state.
 */
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Lightbulb, User, Users } from "lucide-react-native";

import { DS_DAYLIGHT } from "@/lib/design-system";

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

const PRESET_DURATIONS: readonly { days: number; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 21, label: "21 days" },
  { days: 30, label: "30 days" },
  { days: 75, label: "75 days" },
] as const;
const TITLE_MAX = 60;

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
  const titleLen = title.length;
  const titleOk = title.trim().length >= 3;

  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>Name your challenge</Text>
      <Text style={styles.sub}>One sentence. Be specific.</Text>

      <View
        style={[
          styles.inputCard,
          titleOk ? styles.inputCardFocused : null,
        ]}
      >
        <TextInput
          accessibilityLabel="Challenge title"
          value={title}
          onChangeText={(t) => onChangeTitle(t.slice(0, TITLE_MAX))}
          placeholder="e.g. Read 30 min before phone"
          placeholderTextColor={DS_DAYLIGHT.color.placeholder}
          maxLength={TITLE_MAX}
          style={styles.input}
        />
        <View style={styles.inputFootRow}>
          <Text
            style={[
              styles.inputFootText,
              titleOk ? styles.inputFootOk : null,
            ]}
          >
            {titleOk ? "Looks good" : "Min 3 characters"}
          </Text>
          <Text style={styles.inputFootText}>{`${titleLen}/${TITLE_MAX}`}</Text>
        </View>
      </View>

      <Text style={styles.exampleText}>
        Examples: &apos;Read 30 min before phone&apos; · &apos;Workout 5x weekly&apos; · &apos;30 days no alcohol&apos;
      </Text>

      <Text style={styles.sectionLabel}>How long?</Text>
      <View style={styles.durationGrid}>
        {PRESET_DURATIONS.map((d) => {
          const selected = durationDays === d.days;
          const recommended = d.days === 30;
          return (
            <Pressable
              key={d.days}
              accessibilityRole="button"
              accessibilityLabel={`${d.label}${recommended ? " — recommended" : ""}`}
              accessibilityState={{ selected }}
              onPress={() => onChangeDuration(d.days)}
              style={[
                styles.durationChip,
                recommended ? styles.durationChipRecommended : null,
                selected ? styles.durationChipSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  selected ? styles.durationTextSelected : null,
                ]}
              >
                {d.label}
              </Text>
            </Pressable>
          );
        })}
        <View style={styles.durationCustomCell}>
          <TextInput
            accessibilityLabel="Custom duration in days"
            value={customDuration}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9]/g, "");
              onChangeCustomDuration(cleaned);
              const n = parseInt(cleaned, 10);
              if (!Number.isNaN(n) && n >= 8 && n <= 365) {
                onChangeDuration(n);
              } else if (cleaned === "") {
                onChangeDuration(null);
              }
            }}
            placeholder="Custom"
            placeholderTextColor={DS_DAYLIGHT.color.placeholder}
            keyboardType="number-pad"
            style={styles.durationCustomInput}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Solo or with friends?</Text>
      <View style={styles.whoRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Solo challenge"
          accessibilityState={{ selected: who === "solo" }}
          onPress={() => onChangeWho("solo")}
          style={[styles.whoCard, who === "solo" ? styles.whoCardSelected : null]}
        >
          <User
            size={18}
            color={
              who === "solo"
                ? DS_DAYLIGHT.color.accent
                : DS_DAYLIGHT.color.inkSecondary
            }
            strokeWidth={2}
          />
          <View style={styles.whoBody}>
            <Text style={styles.whoTitle}>Solo</Text>
            <Text style={styles.whoSub}>Just you</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Group challenge"
          accessibilityState={{ selected: who === "group" }}
          onPress={() => onChangeWho("group")}
          style={[styles.whoCard, who === "group" ? styles.whoCardSelected : null]}
        >
          <Users
            size={18}
            color={
              who === "group"
                ? DS_DAYLIGHT.color.accent
                : DS_DAYLIGHT.color.inkSecondary
            }
            strokeWidth={2}
          />
          <View style={styles.whoBody}>
            <Text style={styles.whoTitle}>Group</Text>
            <Text style={styles.whoSub}>Up to 10</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.hintCard}>
        <Lightbulb
          size={14}
          color={DS_DAYLIGHT.color.accent}
          strokeWidth={2}
        />
        <Text style={styles.hintText}>
          30 days is the sweet spot. Build the habit, prove you can.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingTop: 8 },
  h1: {
    fontSize: 23,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: DS_DAYLIGHT.size.eyebrow,
    color: DS_DAYLIGHT.color.inkMuted,
    marginTop: -2,
  },
  inputCard: {
    backgroundColor: DS_DAYLIGHT.color.card,
    borderRadius: DS_DAYLIGHT.radius.field,
    padding: 14,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    gap: 8,
    marginTop: 4,
  },
  inputCardFocused: {
    borderColor: DS_DAYLIGHT.color.accent,
  },
  input: {
    fontSize: DS_DAYLIGHT.size.title,
    color: DS_DAYLIGHT.color.ink,
    paddingVertical: 4,
  },
  inputFootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputFootText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted2,
  },
  inputFootOk: { color: DS_DAYLIGHT.color.accent },
  exampleText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted2,
    marginTop: -2,
  },

  sectionLabel: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    marginTop: 12,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  durationChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  durationChipRecommended: {},
  durationChipSelected: {
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    borderColor: DS_DAYLIGHT.color.accentTint,
  },
  durationText: {
    fontSize: 14,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  durationTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },
  durationCustomCell: {
    minWidth: 100,
    flexShrink: 0,
  },
  durationCustomInput: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: DS_DAYLIGHT.radius.chip,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    fontSize: 14,
    fontWeight: DS_DAYLIGHT.weight.regular,
    color: DS_DAYLIGHT.color.ink,
    minWidth: 100,
  },

  whoRow: { flexDirection: "row", gap: 10 },
  whoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: DS_DAYLIGHT.radius.cardMd,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
  },
  whoCardSelected: {
    borderColor: DS_DAYLIGHT.color.accent,
    borderWidth: 1.5,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  whoBody: { gap: 2 },
  whoTitle: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  whoSub: {
    fontSize: 10,
    fontWeight: DS_DAYLIGHT.weight.medium,
    letterSpacing: 0.5,
    color: DS_DAYLIGHT.color.inkMuted,
    textTransform: "uppercase",
  },

  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: DS_DAYLIGHT.radius.cardMd,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.accent,
  },
});

export default StepBasics;
