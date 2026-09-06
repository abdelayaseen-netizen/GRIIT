import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { DS_COLORS_V2 } from "@/lib/design-system";
import type { SubmitResult } from "@/lib/task-completion-result";
import { pickConfirmationCopy, pickConfirmationVariant } from "@/lib/task-completion-result";

export function TaskConfirmation({
  result,
  taskName,
  verifyLine,
  honest,
  optional,
  onDone,
  onShare,
}: {
  result: SubmitResult;
  taskName: string;
  verifyLine: string;
  honest: boolean;
  optional?: boolean;
  onDone: () => void;
  onShare?: () => void;
}) {
  const variant = pickConfirmationVariant(result);
  const { headline, footnote } = pickConfirmationCopy({
    daySecured: result.daySecured,
    daySecuredEarlier: result.daySecuredEarlier,
    requiredRemaining: result.requiredRemaining,
    optional,
  });
  const streakMoved = result.streakDays !== result.streakDaysBefore;
  const canShare = !optional && variant === "A" && honest && !!onShare;
  const orange = DS_COLORS_V2.brand.primary;

  return (
    <View style={styles.root} accessibilityRole="summary">
      <View style={styles.center}>
        <View
          style={[
            styles.mark,
            honest
              ? { backgroundColor: orange }
              : { backgroundColor: "transparent", borderWidth: 1.5, borderColor: DS_COLORS_V2.text.mutedDark },
          ]}
        >
          <Check size={28} color={honest ? "#FFFFFF" : DS_COLORS_V2.text.primary} strokeWidth={2.5} />
        </View>
        <Text style={[styles.eyebrow, { color: honest ? orange : DS_COLORS_V2.text.mutedWarm }]}>
          {honest ? "PROOF POSTED" : "LOGGED · SELF-REPORTED"}
        </Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.task}>{taskName}</Text>
        <Text style={styles.verify}>{verifyLine}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, !streakMoved && { color: DS_COLORS_V2.text.mutedDark }]}>
              {result.streakDays} days
            </Text>
            <Text style={styles.statLabel}>{streakMoved ? "STREAK" : "STREAK · UNCHANGED"}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              Day {result.challengeDay} of {result.challengeLength}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              {result.challengeName.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.footnote}>{footnote}</Text>
      </View>
      <Pressable
        onPress={onDone}
        accessibilityRole="button"
        accessibilityLabel="Done"
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: honest ? orange : DS_COLORS_V2.text.primary },
          pressed && { backgroundColor: honest ? DS_COLORS_V2.brand.primaryPress : DS_COLORS_V2.text.secondary },
        ]}
      >
        <Text style={styles.btnText}>Done</Text>
      </Pressable>
      {canShare ? (
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share to my circle"
          style={styles.share}
        >
          <Text style={styles.shareText}>Share to my circle</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_COLORS_V2.surface.canvas, paddingHorizontal: 24, paddingTop: 90, paddingBottom: 34 },
  center: { flex: 1, alignItems: "center" },
  mark: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center" },
  eyebrow: { marginTop: 16, fontSize: 11, fontWeight: "400", letterSpacing: 1.6 },
  headline: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "500",
    letterSpacing: -1.4,
    color: DS_COLORS_V2.text.primary,
    textAlign: "center",
  },
  task: { marginTop: 8, fontSize: 16, color: DS_COLORS_V2.text.body, textAlign: "center" },
  verify: { marginTop: 8, fontSize: 13, color: DS_COLORS_V2.text.mutedWarm, textAlign: "center", maxWidth: 280 },
  stats: {
    marginTop: 24,
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DS_COLORS_V2.surface.borderWarm,
    paddingVertical: 18,
    flexDirection: "row",
  },
  stat: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  statValue: { fontSize: 24, fontWeight: "500", color: DS_COLORS_V2.text.primary },
  statLabel: { marginTop: 4, fontSize: 11, letterSpacing: 0.7, color: DS_COLORS_V2.text.mutedWarm },
  footnote: { marginTop: 16, fontSize: 12, color: DS_COLORS_V2.text.mutedDark, textAlign: "center" },
  btn: { height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  share: { height: 48, alignItems: "center", justifyContent: "center" },
  shareText: { fontSize: 15, color: DS_COLORS_V2.text.body },
});
