/**
 * StepRules — Step 3 of CreateWizardV2.
 *
 * Captures: difficulty, photo-proof policy, category.
 * Pure controlled component.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Brain,
  Dumbbell,
  Feather,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react-native";

import { DS_DAYLIGHT } from "@/lib/design-system";

export type WizardDifficulty = "standard" | "hard";
export type WizardPhotoProof = "off" | "optional" | "required";
export type WizardCategory = "fitness" | "mind" | "faith" | "discipline";

export type StepRulesProps = {
  difficulty: WizardDifficulty;
  onChangeDifficulty: (v: WizardDifficulty) => void;
  photoProof: WizardPhotoProof;
  onChangePhotoProof: (v: WizardPhotoProof) => void;
  category: WizardCategory | null;
  onChangeCategory: (v: WizardCategory) => void;
};

const PHOTO_OPTIONS: readonly { id: WizardPhotoProof; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "optional", label: "Optional" },
  { id: "required", label: "Required" },
] as const;

const CATEGORIES: readonly {
  id: WizardCategory;
  label: string;
  icon: (props: { size: number; color: string; strokeWidth: number }) => React.ReactNode;
}[] = [
  { id: "fitness", label: "Fitness", icon: (p) => <Dumbbell {...p} /> },
  { id: "mind", label: "Mind", icon: (p) => <Brain {...p} /> },
  { id: "faith", label: "Faith", icon: (p) => <Feather {...p} /> },
  { id: "discipline", label: "Discipline", icon: (p) => <Zap {...p} /> },
] as const;

export function StepRules({
  difficulty,
  onChangeDifficulty,
  photoProof,
  onChangePhotoProof,
  category,
  onChangeCategory,
}: StepRulesProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.h1}>How strict?</Text>
      <Text style={styles.sub}>Pick your accountability level.</Text>

      <View style={styles.diffStack}>
        <DifficultyCard
          icon={
            <ShieldCheck
              size={18}
              color={
                difficulty === "standard"
                  ? DS_DAYLIGHT.color.accent
                  : DS_DAYLIGHT.color.inkSecondary
              }
              strokeWidth={2}
            />
          }
          iconBg={
            difficulty === "standard"
              ? DS_DAYLIGHT.color.accentTint
              : DS_DAYLIGHT.color.fieldNeutral
          }
          title="Standard"
          subtitle="Recommended for first challenge"
          description="Streak freezes on. Miss a day and you don't reset."
          selected={difficulty === "standard"}
          onPress={() => onChangeDifficulty("standard")}
        />
        <DifficultyCard
          icon={
            <ShieldAlert
              size={18}
              color={
                difficulty === "hard"
                  ? DS_DAYLIGHT.color.accent
                  : DS_DAYLIGHT.color.inkSecondary
              }
              strokeWidth={2}
            />
          }
          iconBg={
            difficulty === "hard"
              ? DS_DAYLIGHT.color.accentTint
              : DS_DAYLIGHT.color.fieldNeutral
          }
          title="Hard mode"
          subtitle="75 Hard style — no exceptions"
          description="No freezes. Miss a day, restart from day 1."
          selected={difficulty === "hard"}
          onPress={() => onChangeDifficulty("hard")}
        />
      </View>

      <Text style={styles.sectionLabel}>Public proof on feed</Text>
      <View style={styles.pillRow}>
        {PHOTO_OPTIONS.map((opt) => {
          const selected = photoProof === opt.id;
          return (
            <Pressable
              key={opt.id}
              accessibilityRole="button"
              accessibilityLabel={`Photo proof ${opt.label}`}
              accessibilityState={{ selected }}
              onPress={() => onChangePhotoProof(opt.id)}
              style={[
                styles.pill,
                selected ? styles.pillSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  selected ? styles.pillTextSelected : null,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.statChip}>
        <TrendingUp
          size={12}
          color={DS_DAYLIGHT.color.accent}
          strokeWidth={2}
        />
        <Text style={styles.statChipText}>
          Public accountability lifted goal completion from 43% to 76% (Matthews, 2015).
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.catGrid}>
        {CATEGORIES.map((c) => {
          const selected = category === c.id;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.label} category`}
              accessibilityState={{ selected }}
              onPress={() => onChangeCategory(c.id)}
              style={[
                styles.catChip,
                selected ? styles.catChipSelected : null,
              ]}
            >
              {c.icon({
                size: 16,
                color: selected
                  ? DS_DAYLIGHT.color.accent
                  : DS_DAYLIGHT.color.inkSecondary,
                strokeWidth: 2,
              })}
              <Text
                style={[
                  styles.catText,
                  selected ? styles.catTextSelected : null,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DifficultyCard({
  icon,
  iconBg,
  title,
  subtitle,
  description,
  selected,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} difficulty — ${subtitle}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.diffCard,
        selected ? styles.diffCardSelected : null,
      ]}
    >
      <View style={styles.diffHeader}>
        <View style={[styles.diffIconWrap, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={styles.diffHeaderBody}>
          <Text style={styles.diffTitle}>{title}</Text>
          <Text style={styles.diffSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text style={styles.diffDescription}>{description}</Text>
    </Pressable>
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

  diffStack: { gap: 10, marginTop: 4 },
  diffCard: {
    padding: 14,
    borderRadius: DS_DAYLIGHT.radius.cardSm,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    gap: 8,
  },
  diffCardSelected: {
    borderColor: DS_DAYLIGHT.color.accent,
    borderWidth: 1.5,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  diffHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  diffIconWrap: {
    width: 34,
    height: 34,
    borderRadius: DS_DAYLIGHT.radius.field,
    alignItems: "center",
    justifyContent: "center",
  },
  diffHeaderBody: { flex: 1, gap: 2 },
  diffTitle: {
    fontSize: DS_DAYLIGHT.size.bodyLg,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
  },
  diffSubtitle: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  diffDescription: {
    fontSize: DS_DAYLIGHT.size.meta,
    color: DS_DAYLIGHT.color.inkSecondary,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: DS_DAYLIGHT.size.body,
    fontWeight: DS_DAYLIGHT.weight.semibold,
    color: DS_DAYLIGHT.color.ink,
    marginTop: 8,
  },
  pillRow: {
    flexDirection: "row",
    padding: 3,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.segmentTrack,
  },
  pill: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: DS_DAYLIGHT.radius.chip,
  },
  pillSelected: { backgroundColor: DS_DAYLIGHT.color.accentTint },
  pillText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkMuted,
  },
  pillTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },

  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: DS_DAYLIGHT.radius.pill,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
    alignSelf: "flex-start",
  },
  statChipText: {
    fontSize: DS_DAYLIGHT.size.metaSm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.accent,
  },

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: DS_DAYLIGHT.radius.field,
    backgroundColor: DS_DAYLIGHT.color.card,
    borderWidth: 1,
    borderColor: DS_DAYLIGHT.color.cardBorder,
    minWidth: "47%",
  },
  catChipSelected: {
    borderColor: DS_DAYLIGHT.color.accent,
    borderWidth: 1.5,
    backgroundColor: DS_DAYLIGHT.color.accentTint,
  },
  catText: {
    fontSize: DS_DAYLIGHT.size.bodySm,
    fontWeight: DS_DAYLIGHT.weight.medium,
    color: DS_DAYLIGHT.color.inkSecondary,
  },
  catTextSelected: {
    color: DS_DAYLIGHT.color.accent,
    fontWeight: DS_DAYLIGHT.weight.semibold,
  },
});

export default StepRules;
