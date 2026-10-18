/**
 * Build 90 09.2: a task Strava completed on its own. Opened from the "Strava run logged."
 * notification. Shows the chunk 04 post-or-private choice for the completion the server wrote;
 * either answer ends on Home.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { PostChoiceSheet } from "@/components/task-v2/steps/PostChoiceSheet";
import { DS_V3 } from "@/lib/design-system";
import { firstString } from "@/lib/task-helpers";
import { POST_CHOICE_DEFAULT } from "@/lib/post-choice";
import type { PostAudience } from "@/lib/post-audience";
import { ROUTES } from "@/lib/routes";
import { VERIFIED_BY_STRAVA } from "@/lib/strava-verify";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

function StravaChoiceInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    eventId?: string;
    taskName?: string;
    day?: string;
    challengeName?: string;
    durationDays?: string;
    secured?: string;
    streak?: string;
  }>();
  const eventId = firstString(params.eventId) || null;
  const taskName = firstString(params.taskName) || "Task";
  const challengeName = firstString(params.challengeName) || "";
  const day = Math.max(1, parseInt(firstString(params.day) || "1", 10) || 1);
  const [audience, setAudience] = useState<PostAudience>(POST_CHOICE_DEFAULT);
  const [busy, setBusy] = useState(false);

  const leave = () => {
    void queryClient.invalidateQueries({ queryKey: ["home", "bootstrap"] });
    void queryClient.invalidateQueries({ queryKey: ["feed"] });
    router.replace(ROUTES.TABS_HOME as never);
  };

  const post = () => {
    if (busy) return;
    if (!eventId || audience === "only_me") {
      leave();
      return;
    }
    setBusy(true);
    void trpcMutate(TRPC.checkins.shareProof, { eventId, audience })
      .catch(() => undefined)
      .then(() => {
        setBusy(false);
        leave();
      });
  };

  const keep = () => {
    if (busy) return;
    if (!eventId) {
      leave();
      return;
    }
    setBusy(true);
    void trpcMutate(TRPC.checkins.unshareProof, { eventId })
      .catch(() => undefined)
      .then(() => {
        setBusy(false);
        leave();
      });
  };

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{VERIFIED_BY_STRAVA}</Text>
        <Text style={styles.title}>{taskName}</Text>
        {challengeName ? <Text style={styles.line}>{`${challengeName} · Day ${day}`}</Text> : null}
      </View>
      <PostChoiceSheet
        visible
        taskName={taskName}
        challengeName={challengeName}
        currentDay={day}
        durationDays={Math.max(day, parseInt(firstString(params.durationDays) || "0", 10) || day)}
        audience={audience}
        onAudience={setAudience}
        onPost={audience === "only_me" ? keep : post}
        onClose={keep}
        loading={busy}
      />
    </View>
  );
}

export default function TaskStravaScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <StravaChoiceInner />
      </ErrorBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  copy: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
    gap: DS_V3.space.xs,
  },
  eyebrow: {
    ...DS_V3.type.label,
    color: DS_V3.color.textSecondary,
  },
  title: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  line: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
