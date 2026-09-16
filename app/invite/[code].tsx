import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { openLinkRoute } from "@/lib/group-ui";
import { captureError } from "@/lib/sentry";
import EmptyState from "@/components/ds/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ScreenState = "loading" | "full" | "ended";

function InviteLinkScreenInner() {
  const { code, ref: refParam } = useLocalSearchParams<{ code: string; ref?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<ScreenState>("loading");

  useEffect(() => {
    if (!code) {
      router.replace(ROUTES.TABS_DISCOVER as never);
      return;
    }
    if (!user) return;
    const challengeId = decodeURIComponent(code);
    let cancelled = false;
    void (async () => {
      try {
        const result = (await trpcMutate(TRPC.groups.openLink, { challengeId })) as {
          state?: "full" | "ended";
          invite?: { id?: string; status?: string };
        };
        if (cancelled) return;
        const route = openLinkRoute(challengeId, result);
        if (route.kind === "full") {
          setState("full");
          return;
        }
        if (route.kind === "ended") {
          setState("ended");
          return;
        }
        const q = new URLSearchParams();
        if (route.inviteId) q.set("inviteId", route.inviteId);
        if (refParam) q.set("ref", typeof refParam === "string" ? refParam : refParam[0] ?? "");
        const suffix = q.toString() ? `?${q.toString()}` : "";
        router.replace(`${ROUTES.CHALLENGE_ID(challengeId)}${suffix}` as never);
      } catch (e) {
        captureError(e, "GroupOpenLink");
        if (!cancelled) setState("ended");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, user, refParam, router]);

  const goDiscover = () => router.replace(ROUTES.TABS_DISCOVER as never);

  if (state === "full") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.wrap}>
          <EmptyState
            heading="This group is full."
            body="Ten is the cap, and someone has to leave before you can join."
            actionLabel="Discover"
            onAction={goDiscover}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (state === "ended") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.wrap}>
          <EmptyState
            heading="This challenge has ended."
            body="It is no longer accepting members."
            actionLabel="Discover"
            onAction={goDiscover}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.wrap}>
        <ActivityIndicator size="large" color={DS_V3.color.brand} />
      </View>
    </SafeAreaView>
  );
}

export default function InviteLinkScreen() {
  return (
    <ErrorBoundary>
      <InviteLinkScreenInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
});
