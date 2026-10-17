/**
 * Home row for an unfinished starter. Shown only when STARTER_TASK_ENABLED is on.
 * Completing it goes through starterTask.completeNow. The client never writes the table.
 */
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DS_V3 } from "@/lib/design-system";
import { FLAGS } from "@/lib/feature-flags";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

const GRATEFUL = "Write one thing you’re grateful for";
export const STARTER_TODAY_QUERY_KEY = ["starterTask", "row"] as const;

export type StarterRow = {
  title: string;
  status: "pending" | "done_now" | "later" | "expired";
};

export async function loadStarterTodayRow(): Promise<StarterRow | null> {
  await trpcMutate(TRPC.starterTask.expire, {});
  return trpcQuery<StarterRow | null>(TRPC.starterTask.get);
}

export function StarterTodayRow({
  challengeTitle,
  durationDays,
  onChanged,
}: {
  challengeTitle: string | null;
  durationDays: number | null;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rowQuery = useQuery({
    queryKey: [...STARTER_TODAY_QUERY_KEY],
    queryFn: loadStarterTodayRow,
    enabled: FLAGS.STARTER_TASK_ENABLED,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const row = rowQuery.data ?? null;

  if (!FLAGS.STARTER_TASK_ENABLED || !row || row.status === "done_now" || row.status === "expired") return null;

  const grateful = row.title === GRATEFUL;
  const noteOk = !grateful || note.trim().length >= 1;
  const tomorrow = challengeTitle?.trim();
  const dayCount = durationDays && durationDays > 0 ? ` of ${durationDays}` : "";

  const done = async () => {
    if (!noteOk || busy) return;
    setBusy(true);
    setError("");
    try {
      await trpcMutate(TRPC.starterTask.completeNow, { title: row.title });
      queryClient.setQueryData([...STARTER_TODAY_QUERY_KEY], { ...row, status: "done_now" });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the starter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Today only</Text>
      <Text style={styles.title}>{row.title}</Text>
      <Text style={styles.line}>Today is secured when the starter is done.</Text>
      {tomorrow ? (
        <Text style={styles.line}>{`Tomorrow · ${tomorrow} · Day 1${dayCount}`}</Text>
      ) : null}
      {grateful ? (
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Done"
        disabled={!noteOk || busy}
        onPress={() => void done()}
        style={[styles.done, (!noteOk || busy) && styles.doneOff]}
      >
        <Text style={styles.doneText}>{busy ? "Saving" : "Done"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: DS_V3.space.lg,
    marginBottom: DS_V3.space.md,
    gap: DS_V3.space.xs,
  },
  kicker: {
    color: DS_V3.color.textSecondary,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
  },
  title: {
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
  },
  line: {
    color: DS_V3.color.textSecondary,
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
  },
  input: {
    color: DS_V3.color.textPrimary,
    fontSize: DS_V3.type.body.fontSize,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_V3.color.border,
    paddingVertical: DS_V3.space.sm,
  },
  error: { color: DS_V3.color.danger, fontSize: DS_V3.type.caption.fontSize },
  done: {
    minHeight: DS_V3.size.tap,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DS_V3.color.textPrimary,
    borderRadius: DS_V3.radius.card,
  },
  doneOff: { opacity: 0.4 },
  doneText: { color: DS_V3.color.canvas, fontSize: DS_V3.type.body.fontSize },
});
