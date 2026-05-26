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

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

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
          placeholderTextColor={DS_COLORS_V2.text.tertiary}
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
            placeholderTextColor={DS_COLORS_V2.text.tertiary}
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
                ? DS_COLORS_V2.brand.primary
                : DS_COLORS_V2.text.primary
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
                ? DS_COLORS_V2.brand.primary
                : DS_COLORS_V2.text.primary
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
          color={DS_COLORS_V2.brand.primary}
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
  wrap: { gap: 12, paddingTop: DS_SPACING_V2.sm },
  h1: {
    fontSize: 22,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    marginTop: -6,
  },
  inputCard: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderRadius: DS_RADIUS_V2.md,
    padding: 12,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 8,
    marginTop: 4,
  },
  inputCardFocused: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 2,
  },
  input: {
    fontSize: 15,
    color: DS_COLORS_V2.text.primary,
    paddingVertical: 4,
  },
  inputFootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputFootText: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  inputFootOk: { color: DS_COLORS_V2.semantic.success },
  exampleText: {
    fontSize: 11,
    color: DS_COLORS_V2.text.tertiary,
    marginTop: -2,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    marginTop: 12,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  durationChipRecommended: {
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  durationChipSelected: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderColor: DS_COLORS_V2.brand.primary,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  durationTextSelected: { color: DS_COLORS_V2.brand.primaryText },
  durationCustomCell: {
    minWidth: 100,
    flexShrink: 0,
  },
  durationCustomInput: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    minWidth: 100,
  },

  whoRow: { flexDirection: "row", gap: 10 },
  whoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  whoCardSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
  },
  whoBody: { gap: 2 },
  whoTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  whoSub: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.text.secondary,
    textTransform: "uppercase",
  },

  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    marginTop: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
});

export default StepBasics;
