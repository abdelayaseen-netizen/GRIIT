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

import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";

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
                  ? DS_COLORS_V2.brand.primary
                  : DS_COLORS_V2.text.secondary
              }
              strokeWidth={2}
            />
          }
          iconBg={
            difficulty === "standard"
              ? DS_COLORS_V2.brand.primarySoft
              : DS_COLORS_V2.surface.cardSubtle
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
                  ? DS_COLORS_V2.brand.primary
                  : DS_COLORS_V2.text.secondary
              }
              strokeWidth={2}
            />
          }
          iconBg={
            difficulty === "hard"
              ? DS_COLORS_V2.brand.primarySoft
              : DS_COLORS_V2.surface.cardSubtle
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
          color={DS_COLORS_V2.brand.primary}
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
                  ? DS_COLORS_V2.brand.primary
                  : DS_COLORS_V2.text.secondary,
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
  wrap: { gap: DS_SPACING_V2.sm, paddingTop: DS_SPACING_V2.xs },
  h1: {
    fontSize: 23,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 14,
    color: DS_COLORS_V2.text.tertiary,
    marginTop: -2,
  },

  diffStack: { gap: DS_SPACING_V2.sm, marginTop: DS_SPACING_V2.xxs },
  diffCard: {
    padding: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: DS_SPACING_V2.xs,
  },
  diffCardSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  diffHeader: { flexDirection: "row", alignItems: "center", gap: DS_SPACING_V2.sm },
  diffIconWrap: {
    width: 34,
    height: 34,
    borderRadius: DS_RADIUS_V2.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  diffHeaderBody: { flex: 1, gap: 2 },
  diffTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  diffSubtitle: {
    fontSize: 13,
    color: DS_COLORS_V2.text.tertiary,
  },
  diffDescription: {
    fontSize: 13,
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    marginTop: DS_SPACING_V2.xs,
  },
  pillRow: {
    flexDirection: "row",
    padding: DS_SPACING_V2.xxs,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.surface.cardChipNeutral,
  },
  pill: {
    flex: 1,
    paddingVertical: DS_SPACING_V2.sm,
    alignItems: "center",
    borderRadius: DS_RADIUS_V2.lg,
  },
  pillSelected: { backgroundColor: DS_COLORS_V2.brand.primarySoft },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.tertiary,
  },
  pillTextSelected: {
    color: DS_COLORS_V2.brand.primary,
    fontWeight: "500",
  },

  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.xs,
    paddingHorizontal: DS_SPACING_V2.sm,
    paddingVertical: DS_SPACING_V2.xs,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    alignSelf: "flex-start",
  },
  statChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_SPACING_V2.sm,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_SPACING_V2.xs,
    paddingHorizontal: DS_SPACING_V2.sm,
    paddingVertical: DS_SPACING_V2.sm,
    borderRadius: DS_RADIUS_V2.lg,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    minWidth: "47%",
  },
  catChipSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  catText: {
    fontSize: 14,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
  catTextSelected: {
    color: DS_COLORS_V2.brand.primary,
    fontWeight: "500",
  },
});
