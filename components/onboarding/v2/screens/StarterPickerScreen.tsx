/**
 * v53.1 starter. Shown only when STARTER_TASK_ENABLED is on.
 * Writes go through starterTask tRPC. The client never touches the table.
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";
import { chromeStep } from "@/lib/onboarding-v2-routing";

const TITLES = [
  "Drink a glass of water",
  "Write one thing you’re grateful for",
  "Lay out tomorrow’s workout clothes",
  "Set tomorrow’s alarm",
  "Read one page",
  "Make your bed",
] as const;

const GRATEFUL = "Write one thing you’re grateful for";
const WRITE = "Write your own";

type Phase = "pick" | "do" | "secured";

export default function StarterPickerScreen({
  challengeTitle,
  onContinue,
  onBack,
}: {
  challengeTitle: string | null;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("pick");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [freeze, setFreeze] = useState(false);

  const writing = picked === WRITE;
  const title = writing ? custom.trim() : picked ?? "";
  const titleOk = title.length >= 1 && title.length <= 40;
  const gratefulNeedsNote = title === GRATEFUL && note.trim().length < 1;
  const canAct = Boolean(picked) && titleOk && !gratefulNeedsNote && !busy;

  const save = async (mode: "later" | "now") => {
    if (!canAct) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "later") {
        await trpcMutate(TRPC.starterTask.saveLater, { title });
        onContinue();
        return;
      }
      const result = (await trpcMutate(TRPC.starterTask.completeNow, { title })) as {
        freezeGranted?: boolean;
      };
      setFreeze(result.freezeGranted === true);
      setPhase("secured");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the starter.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "secured") {
    const challenge = challengeTitle?.trim() || "your challenge";
    return (
      <OnboardingScreen
        step={chromeStep("first_challenge")}
        onBack={onBack}
        title="Secured."
        subtitle="Every task done today."
        footer={<ChromePrimary label="Continue" onPress={onContinue} />}
      >
        <View style={styles.body}>
          {freeze ? <Text style={styles.line}>+1 freeze. It covers one missed day.</Text> : null}
          <Text style={styles.line}>{`Day 1 of ${challenge} starts tomorrow.`}</Text>
        </View>
      </OnboardingScreen>
    );
  }

  if (phase === "do") {
    return (
      <OnboardingScreen
        step={chromeStep("first_challenge")}
        onBack={() => setPhase("pick")}
        title="Today only"
        subtitle="Starter"
        footer={
          <ChromePrimary
            label={busy ? "Saving" : "Done without photo"}
            onPress={() => void save("now")}
            disabled={!canAct}
          />
        }
      >
        <View style={styles.body}>
          <Text style={styles.line}>{title}</Text>
          {title === GRATEFUL ? (
            <TextInput
              value={note}
              onChangeText={(t) => setNote(t.slice(0, 120))}
              placeholder="One thing you’re grateful for"
              placeholderTextColor={DS_V3.color.textSecondary}
              style={styles.input}
              maxLength={120}
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen
      step={chromeStep("first_challenge")}
      onBack={onBack}
      title="Pick something easy. Do it today."
      subtitle="It secures your first day."
      footer={
        <View style={styles.actions}>
          <ChromePrimary label="Do it now" onPress={() => setPhase("do")} disabled={!canAct} />
          <Pressable
            accessibilityRole="button"
            disabled={!canAct}
            onPress={() => void save("later")}
            style={styles.later}
          >
            <Text style={[styles.laterText, !canAct && styles.laterOff]}>Do it later</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.body}>
        {[...TITLES, WRITE].map((choice) => {
          const on = picked === choice;
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setPicked(choice)}
              style={styles.row}
            >
              <View style={[styles.radio, on && styles.radioOn]} />
              <Text style={styles.line}>{choice}</Text>
            </Pressable>
          );
        })}
        {writing ? (
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="Write a task"
            placeholderTextColor={DS_V3.color.textSecondary}
            style={styles.input}
            maxLength={80}
          />
        ) : null}
        {writing && custom.trim().length > 40 ? (
          <Text style={styles.error}>Keep it to 40 characters.</Text>
        ) : null}
        {writing && picked === WRITE && custom.trim().length === 0 ? (
          <Text style={styles.error}>Write a task first.</Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  body: { gap: DS_V3.space.md },
  row: { flexDirection: "row", alignItems: "center", gap: DS_V3.space.sm, minHeight: DS_V3.size.tap },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: DS_V3.color.textSecondary,
  },
  radioOn: { backgroundColor: DS_V3.color.textPrimary, borderColor: DS_V3.color.textPrimary },
  line: {
    flex: 1,
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
  },
  input: {
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.body.fontSize,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_V3.color.border,
    paddingVertical: DS_V3.space.sm,
  },
  error: { color: DS_V3.color.danger, fontSize: DS_V3.type.caption.fontSize },
  actions: { gap: DS_V3.space.sm },
  later: { minHeight: DS_V3.size.tap, alignItems: "center", justifyContent: "center" },
  laterText: { color: DS_V3.color.textPrimary, fontSize: DS_V3.type.body.fontSize },
  laterOff: { color: DS_V3.color.textSecondary },
});
