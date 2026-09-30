/**
 * Step 3 — Strictness and public proof. Visual layer; parent owns state.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ShieldAlert, ShieldCheck } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Chip from "@/components/ds/Chip";
import { HARD_MODE_PROOF_CAPTION, effectivePhotoProof } from "@/lib/create-wizard-hard-proof";
import {
  MODE_HARD_BODY,
  MODE_HARD_TITLE,
  MODE_STANDARD_BODY,
  MODE_STANDARD_TITLE,
} from "@/lib/create-mode-copy";

export type WizardDifficulty = "standard" | "hard";
export type WizardPhotoProof = "off" | "optional" | "required";
export type { WizardCategory } from "@/lib/challenge-category";

export type StepRulesProps = {
  difficulty: WizardDifficulty;
  onChangeDifficulty: (v: WizardDifficulty) => void;
  photoProof: WizardPhotoProof;
  onChangePhotoProof: (v: WizardPhotoProof) => void;
};

const MODES = [
  {
    id: "standard" as const,
    title: MODE_STANDARD_TITLE,
    line: MODE_STANDARD_BODY,
  },
  {
    id: "hard" as const,
    title: MODE_HARD_TITLE,
    line: MODE_HARD_BODY,
  },
] as const;

const PUBLIC_PROOF: readonly { id: WizardPhotoProof; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "optional", label: "Optional" },
  { id: "required", label: "Required" },
] as const;

const ICON = DS_V3.space.xs * 6;
const STROKE = (DS_V3.space.xs * 3) / 8;
const PT = DS_V3.space.xs / 4;

export function StepRules({
  difficulty,
  onChangeDifficulty,
  photoProof,
  onChangePhotoProof,
}: StepRulesProps) {
  const hard = difficulty === "hard";
  const shownProof = effectivePhotoProof(difficulty, photoProof);
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
              selected={shownProof === p.id}
              disabled={hard && p.id !== "required"}
              onPress={() => {
                if (hard) return;
                onChangePhotoProof(p.id);
              }}
            />
          ))}
        </View>
        <Text style={[styles.caption, styles.muted]}>
          {hard
            ? HARD_MODE_PROOF_CAPTION
            : "Public accountability on the feed."}
        </Text>
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
});
