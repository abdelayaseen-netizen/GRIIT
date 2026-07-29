/**
 * SecuredScreen — light-bg success phase for task-states-v2.
 *
 * Streak count is read from `useApp().stats.activeStreak` (real stats query),
 * never accepted as a hard-coded prop literal. Rendered via `<StreakPill />`.
 */
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Check, Flame } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { useApp } from "@/contexts/AppContext";
import { StreakPill } from "@/components/task/StreakPill";

export type SecuredScreenProps = {
  /** Challenge day number — rendered as "Day {n} secured". */
  dayNumber: number;
  /** Task title. */
  title: string;
  /** Meta line, e.g. "Verified in the window" / "5.2 km · 32 min". */
  meta: string;
  /** Optional Done CTA — wired by the complete-screen shell. */
  onDone?: () => void;
  doneLabel?: string;
};

export function SecuredScreen({
  dayNumber,
  title,
  meta,
  onDone,
  doneLabel = "Done",
}: SecuredScreenProps) {
  const { stats } = useApp();
  const streakCount =
    typeof stats?.activeStreak === "number" ? stats.activeStreak : 0;

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <View style={styles.checkGlow}>
          <View style={styles.checkCircle}>
            <Check
              size={36}
              color={DS_COLORS_V2.brand.primaryText}
              strokeWidth={2}
            />
          </View>
        </View>

        <View style={styles.securedRow}>
          <Flame
            size={16}
            color={DS_COLORS_V2.brand.primary}
            strokeWidth={2}
          />
          <Text style={styles.securedLabel}>{`Day ${dayNumber} secured`}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>

        <View style={styles.streakWrap}>
          <StreakPill streakCount={streakCount} />
        </View>
      </View>

      {onDone ? (
        <Pressable
          style={styles.doneCta}
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel={doneLabel}
        >
          <Text style={styles.doneCtaText}>{doneLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DS_COLORS_V2.surface.canvas,
    paddingHorizontal: DS_SPACING_V2.lg,
    paddingBottom: DS_SPACING_V2.xl,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_SPACING_V2.sm,
  },
  checkGlow: {
    marginBottom: DS_SPACING_V2.md,
    borderRadius: DS_RADIUS_V2.full,
    shadowColor: DS_COLORS_V2.brand.primary,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    // Soft fill behind the circle using the securedGlow token.
    backgroundColor: DS_COLORS_V2.proof.securedGlow,
    padding: 12,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DS_COLORS_V2.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  securedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  securedLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    marginTop: DS_SPACING_V2.xs,
  },
  meta: {
    fontSize: 15,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
    textAlign: "center",
  },
  streakWrap: {
    marginTop: DS_SPACING_V2.md,
  },
  doneCta: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderRadius: DS_RADIUS_V2.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneCtaText: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
});
