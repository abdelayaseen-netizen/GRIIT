/**
 * Step 3 — Strictness and visibility. Visual layer; parent owns state.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ShieldAlert, ShieldCheck } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import {
  VISIBILITY_INVITE_CAPTION,
  VISIBILITY_INVITE_TITLE,
  VISIBILITY_PUBLIC_CAPTION,
  VISIBILITY_PUBLIC_TITLE,
  type CreateVisibility,
} from "@/backend/lib/create-visibility";
import {
  MODE_HARD_BODY,
  MODE_HARD_TITLE,
  MODE_STANDARD_BODY,
  MODE_STANDARD_TITLE,
} from "@/lib/create-mode-copy";
import type { WizardWho } from "@/components/create/v2/StepBasics";

export type WizardDifficulty = "standard" | "hard";
export type { WizardCategory } from "@/lib/challenge-category";

export type StepRulesProps = {
  difficulty: WizardDifficulty;
  onChangeDifficulty: (v: WizardDifficulty) => void;
  who: WizardWho;
  visibility: CreateVisibility;
  onChangeVisibility: (v: CreateVisibility) => void;
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

const SOLO_VISIBILITY: readonly {
  id: CreateVisibility;
  title: string;
  caption: string;
}[] = [
  { id: "PUBLIC", title: VISIBILITY_PUBLIC_TITLE, caption: VISIBILITY_PUBLIC_CAPTION },
  { id: "PRIVATE", title: VISIBILITY_INVITE_TITLE, caption: VISIBILITY_INVITE_CAPTION },
] as const;

const ICON = DS_V3.space.xs * 6;
const STROKE = (DS_V3.space.xs * 3) / 8;
const PT = DS_V3.space.xs / 4;

export function StepRules({
  difficulty,
  onChangeDifficulty,
  who,
  visibility,
  onChangeVisibility,
}: StepRulesProps) {
  const group = who === "group";
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
        <Text style={styles.heading}>Visibility</Text>
        {group ? (
          <View style={styles.visCopy}>
            <Text style={styles.bodyStrong}>{VISIBILITY_INVITE_TITLE}</Text>
            <Text style={styles.secondary}>{VISIBILITY_INVITE_CAPTION}</Text>
          </View>
        ) : (
          <View style={styles.visList}>
            {SOLO_VISIBILITY.map((row) => {
              const on = visibility === row.id;
              return (
                <Pressable
                  key={row.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${row.title}. ${row.caption}`}
                  onPress={() => onChangeVisibility(row.id)}
                  style={styles.visRow}
                >
                  <View style={[styles.radio, on ? styles.radioOn : null]} />
                  <View style={styles.visCopy}>
                    <Text style={styles.bodyStrong}>{row.title}</Text>
                    <Text style={styles.secondary}>{row.caption}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
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
    flex: 1,
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
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
  visList: { gap: DS_V3.space.sm },
  visRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DS_V3.space.md,
    minHeight: DS_V3.size.tap,
  },
  visCopy: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  radio: {
    width: ICON,
    height: ICON,
    borderRadius: DS_V3.radius.pill,
    borderWidth: STROKE,
    borderColor: DS_V3.color.textSecondary,
    marginTop: DS_V3.space.xs,
  },
  radioOn: {
    backgroundColor: DS_V3.color.brand,
    borderColor: DS_V3.color.brand,
  },
});
