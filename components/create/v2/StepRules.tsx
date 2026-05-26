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
              color={DS_COLORS_V2.semantic.success}
              strokeWidth={2}
            />
          }
          iconBg={DS_COLORS_V2.semantic.successSoft}
          title="Standard"
          subtitle="Recommended for first challenge"
          description="Self-reported or photo proof. 2 streak freezes per week. Miss a day? Use a freeze or restart."
          selected={difficulty === "standard"}
          onPress={() => onChangeDifficulty("standard")}
        />
        <DifficultyCard
          icon={
            <ShieldAlert
              size={18}
              color={DS_COLORS_V2.proof.hardFg}
              strokeWidth={2}
            />
          }
          iconBg={DS_COLORS_V2.proof.hardBg}
          title="Hard mode"
          subtitle="75 Hard style — no exceptions"
          description="Camera-only photos. Time windows enforced. No freezes. Miss a day → restart from Day 1."
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
          Public proof boosts completion 43% → 76%.
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
                  : DS_COLORS_V2.text.primary,
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
        {selected ? (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Selected</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.diffDescription}>{description}</Text>
    </Pressable>
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

  diffStack: { gap: 10, marginTop: 4 },
  diffCard: {
    padding: 14,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    gap: 8,
  },
  diffCardSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
  },
  diffHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  diffIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  diffHeaderBody: { flex: 1, gap: 2 },
  diffTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  diffSubtitle: {
    fontSize: 11,
    color: DS_COLORS_V2.text.secondary,
  },
  selectedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: DS_RADIUS_V2.sm,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "500",
    letterSpacing: 0.5,
    color: DS_COLORS_V2.brand.primary,
    textTransform: "uppercase",
  },
  diffDescription: {
    fontSize: 12,
    color: DS_COLORS_V2.text.secondary,
    lineHeight: 17,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    marginTop: 8,
  },
  pillRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.surface.cardSubtle,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: DS_RADIUS_V2.full,
  },
  pillSelected: { backgroundColor: DS_COLORS_V2.surface.heroDark },
  pillText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  pillTextSelected: { color: DS_COLORS_V2.text.onDark },

  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: DS_RADIUS_V2.full,
    backgroundColor: DS_COLORS_V2.brand.primarySoft,
    alignSelf: "flex-start",
  },
  statChipText: {
    fontSize: 10,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: DS_RADIUS_V2.md,
    backgroundColor: DS_COLORS_V2.surface.card,
    borderWidth: 1,
    borderColor: DS_COLORS_V2.surface.divider,
    minWidth: "47%",
  },
  catChipSelected: {
    borderColor: DS_COLORS_V2.brand.primary,
    borderWidth: 1.5,
  },
  catText: {
    fontSize: 12,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
  },
  catTextSelected: { color: DS_COLORS_V2.brand.primary },
});

export default StepRules;
