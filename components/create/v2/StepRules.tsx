/**
 * Step 3 — Strictness, public proof, category. Visual layer; parent owns state.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ShieldAlert, ShieldCheck } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import { Chip } from "@/components/ds";

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

const MODES = [
  {
    id: "standard" as const,
    title: "Standard",
    caption: "Recommended for your first challenge",
    line: "Streak freezes on. Miss a day and you do not reset.",
  },
  {
    id: "hard" as const,
    title: "Hard mode",
    caption: "75 Hard style. No exceptions.",
    line: "No freezes. Miss a day, restart from day 1.",
  },
] as const;

const PUBLIC_PROOF: readonly { id: WizardPhotoProof; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "optional", label: "Optional" },
  { id: "required", label: "Required" },
] as const;

const CATEGORIES: readonly { id: WizardCategory; label: string }[] = [
  { id: "fitness", label: "Fitness" },
  { id: "mind", label: "Mind" },
  { id: "faith", label: "Faith" },
  { id: "discipline", label: "Discipline" },
] as const;

const ICON = DS_V3.space.xs * 6;
const STROKE = (DS_V3.space.xs * 3) / 8;
const PT = DS_V3.space.xs / 4;

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
      <View style={styles.block}>
        <Text style={styles.title}>How strict?</Text>
        <Text style={styles.secondary}>Pick your accountability level.</Text>
      </View>

      <View style={styles.cards}>
        {MODES.map((m) => {
          const on = m.id === difficulty;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={m.title}
              accessibilityState={{ selected: on }}
              onPress={() => onChangeDifficulty(m.id)}
              style={[styles.modeCard, on ? styles.modeOn : styles.modeOff]}
            >
              <View style={styles.modeTitleRow}>
                {m.id === "standard" ? (
                  <ShieldCheck size={ICON} color={DS_V3.color.textPrimary} strokeWidth={2} />
                ) : (
                  <ShieldAlert size={ICON} color={DS_V3.color.textPrimary} strokeWidth={2} />
                )}
                <Text style={styles.bodyStrong}>{m.title}</Text>
              </View>
              <Text style={[styles.caption, styles.muted]}>{m.caption}</Text>
              <Text style={styles.secondary}>{m.line}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Public proof on feed</Text>
        <View style={styles.chipRow}>
          {PUBLIC_PROOF.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              selected={photoProof === p.id}
              onPress={() => onChangePhotoProof(p.id)}
            />
          ))}
        </View>
        <Text style={[styles.caption, styles.muted]}>
          Public accountability lifted goal completion from 43% to 76% (Matthews, 2015).
        </Text>
      </View>

      <View style={styles.catSection}>
        <Text style={styles.heading}>Category</Text>
        <View style={styles.chipWrap}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              selected={category === c.id}
              onPress={() => onChangeCategory(c.id)}
            />
          ))}
        </View>
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
  cards: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  section: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    gap: DS_V3.space.md,
  },
  catSection: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.section,
    paddingBottom: DS_V3.space.gutter,
    gap: DS_V3.space.md,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  heading: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  secondary: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
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
  modeCard: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
    minHeight: DS_V3.size.tap,
  },
  modeOff: {
    borderWidth: PT,
    borderColor: DS_V3.color.border,
  },
  modeOn: {
    borderWidth: STROKE,
    borderColor: DS_V3.color.brand,
  },
  modeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  chipRow: { flexDirection: "row", gap: DS_V3.space.xs },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: DS_V3.space.sm },
});
