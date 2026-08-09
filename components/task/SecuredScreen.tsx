/**
 * SecuredScreen — task-complete success phase for task-states-v2.
 *
 * Day secure is a separate write. Streak renders only when that write
 * succeeded with an explicit count — never stats fallback, never 0.
 */
import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Check, Flame } from "lucide-react-native";
import {
  DS_COLORS_V2,
  DS_RADIUS_V2,
  DS_SPACING_V2,
} from "@/lib/design-system";
import { StreakPill } from "@/components/task/StreakPill";
import { formatIncompleteProgress } from "@/lib/day-secure-ui";

export type SecuredScreenDaySecure =
  | {
      kind: "secured";
      dayNumber: number;
      streakCount: number;
      onDone: () => void;
    }
  /** Task done; day secure not attempted (more required tasks remain). */
  | {
      kind: "not_attempted";
      onDone: () => void;
    }
  | {
      kind: "incomplete_required";
      done: number;
      total: number;
      remainingTitles: string[];
      onContinue: () => void;
    }
  | {
      kind: "secure_failed";
      onRetry: () => void;
      retrying?: boolean;
      onDone: () => void;
    };

export type SecuredScreenProps = {
  /** Task title. */
  title: string;
  /** Meta line, e.g. "Verified in the window" / "5.2 km · 32 min". */
  meta: string;
  /** Day-secure outcome — drives headline, streak, and CTAs. */
  daySecure: SecuredScreenDaySecure;
};

export function SecuredScreen({ title, meta, daySecure }: SecuredScreenProps) {
  const isDaySecured = daySecure.kind === "secured";
  const statusLabel = isDaySecured
    ? `Day ${daySecure.dayNumber} secured`
    : "Task secured";
  const dayLine =
    daySecure.kind === "incomplete_required"
      ? `Day not secured · ${formatIncompleteProgress(daySecure.done, daySecure.total)}`
      : daySecure.kind === "secure_failed"
        ? "Day not secured · Couldn’t sync. Try again."
        : null;

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
          <Text style={styles.securedLabel}>{statusLabel}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>

        {dayLine ? <Text style={styles.dayLine}>{dayLine}</Text> : null}

        {daySecure.kind === "incomplete_required" &&
        daySecure.remainingTitles.length > 0 ? (
          <View style={styles.remainingBlock}>
            {daySecure.remainingTitles.map((t, i) => (
              <Text key={`${t}-${i}`} style={styles.remainingItem}>
                · {t}
              </Text>
            ))}
          </View>
        ) : null}

        {isDaySecured ? (
          <View style={styles.streakWrap}>
            <StreakPill streakCount={daySecure.streakCount} />
          </View>
        ) : null}
      </View>

      <View style={styles.ctaStack}>
        {daySecure.kind === "secured" || daySecure.kind === "not_attempted" ? (
          <Pressable
            style={styles.doneCta}
            onPress={daySecure.onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.doneCtaText}>Done</Text>
          </Pressable>
        ) : null}

        {daySecure.kind === "incomplete_required" ? (
          <Pressable
            style={styles.doneCta}
            onPress={daySecure.onContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue remaining tasks"
          >
            <Text style={styles.doneCtaText}>Continue remaining tasks</Text>
          </Pressable>
        ) : null}

        {daySecure.kind === "secure_failed" ? (
          <>
            <Pressable
              style={[styles.doneCta, daySecure.retrying ? styles.ctaDisabled : null]}
              onPress={daySecure.onRetry}
              disabled={!!daySecure.retrying}
              accessibilityRole="button"
              accessibilityLabel="Retry securing day"
            >
              {daySecure.retrying ? (
                <ActivityIndicator color={DS_COLORS_V2.brand.primaryText} />
              ) : (
                <Text style={styles.doneCtaText}>Retry</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.secondaryCta}
              onPress={daySecure.onDone}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={styles.secondaryCtaText}>Done</Text>
            </Pressable>
          </>
        ) : null}
      </View>
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
  dayLine: {
    fontSize: 15,
    fontWeight: "500",
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
    marginTop: DS_SPACING_V2.xs,
  },
  remainingBlock: {
    marginTop: DS_SPACING_V2.sm,
    alignItems: "flex-start",
    alignSelf: "center",
    gap: 4,
  },
  remainingItem: {
    fontSize: 14,
    fontWeight: "400",
    color: DS_COLORS_V2.text.secondary,
  },
  streakWrap: {
    marginTop: DS_SPACING_V2.md,
  },
  ctaStack: {
    gap: DS_SPACING_V2.sm,
  },
  doneCta: {
    backgroundColor: DS_COLORS_V2.brand.primary,
    borderRadius: DS_RADIUS_V2.md,
    paddingVertical: 16,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  doneCtaText: {
    fontSize: 17,
    fontWeight: "500",
    color: DS_COLORS_V2.brand.primaryText,
  },
  secondaryCta: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryCtaText: {
    fontSize: 16,
    fontWeight: "500",
    color: DS_COLORS_V2.text.secondary,
  },
});
