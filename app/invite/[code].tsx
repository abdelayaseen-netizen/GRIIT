import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Screen from "@/components/ds/Screen";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { isShortInviteCode, inviteQueryFor, type ResolvedInviteLink } from "@/lib/invite-resolve";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { DS_V3 } from "@/lib/design-system";
import { openLinkRoute } from "@/lib/group-ui";
import { captureError } from "@/lib/sentry";
import EmptyState from "@/components/ds/EmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type ScreenState = "loading" | "full" | "ended" | "gone";

function InviteLinkScreenInner() {
  const { code, ref: refParam } = useLocalSearchParams<{ code: string; ref?: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<ScreenState>("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!code) {
      router.replace(ROUTES.TABS_DISCOVER as never);
      return;
    }
    const raw = decodeURIComponent(code);
    const ref = refParam ? (typeof refParam === "string" ? refParam : refParam[0] ?? "") : null;
    let cancelled = false;

    // Build 92 08.1: a short code → challenge + inviter through `invites.resolve`.
    // A UUID is an older link and still opens the challenge directly.
    const openChallenge = async (challengeId: string, extra: Record<string, string>) => {
      if (!user) {
        // No session yet (a brand-new guest opened the link). The challenge page is public and
        // its Join creates the guest session; openLink needs a user, so skip it.
        router.replace(`${ROUTES.CHALLENGE_ID(challengeId)}?${inviteQueryFor({ ...extra, ref })}` as never);
        return;
      }
      const result = (await trpcMutate(TRPC.groups.openLink, { challengeId })) as {
        state?: "full" | "ended" | "open";
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
      router.replace(
        `${ROUTES.CHALLENGE_ID(challengeId)}?${inviteQueryFor({ ...extra, inviteId: route.inviteId ?? null, ref })}` as never,
      );
    };

    void (async () => {
      try {
        if (!isShortInviteCode(raw)) {
          await openChallenge(raw, {});
          return;
        }
        const resolved = (await trpcQuery(TRPC.invites.resolve, { code: raw })) as ResolvedInviteLink;
        if (cancelled) return;
        if (!resolved.found) {
          setState("gone");
          return;
        }
        if (resolved.outcome === "full") {
          setState("full");
          return;
        }
        if (resolved.outcome === "ended") {
          setState("ended");
          return;
        }
        if (resolved.outcome === "self" || resolved.outcome === "member") {
          // Your own link, or a challenge you are already in: the plain challenge page.
          router.replace(ROUTES.CHALLENGE_ID(resolved.challengeId) as never);
          return;
        }
        await openChallenge(resolved.challengeId, { inviter: resolved.inviterName, code: resolved.code });
      } catch (e) {
        captureError(e, "GroupOpenLink");
        if (!cancelled) setState("ended");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, user, authLoading, refParam, router]);

  const goDiscover = () => router.replace(ROUTES.TABS_DISCOVER as never);

  if (state === "full") {
    return (
      <Screen style={styles.safe} edges={["top"]}>
        <View style={styles.wrap}>
          <EmptyState
            heading="This group is full."
            body="Ten is the cap, and someone has to leave before you can join."
            actionLabel="Discover"
            onAction={goDiscover}
          />
        </View>
      </Screen>
    );
  }

  if (state === "gone") {
    return (
      <Screen style={styles.safe} edges={["top"]}>
        <View style={styles.wrap}>
          <EmptyState
            heading="This invite link doesn't work any more."
            body="Ask your friend for a new one, or find a challenge."
            actionLabel="Discover"
            onAction={goDiscover}
          />
        </View>
      </Screen>
    );
  }

  if (state === "ended") {
    return (
      <Screen style={styles.safe} edges={["top"]}>
        <View style={styles.wrap}>
          <EmptyState
            heading="This challenge has ended."
            body="It is no longer accepting members."
            actionLabel="Discover"
            onAction={goDiscover}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.safe} edges={["top"]}>
      <View style={styles.wrap}>
        <ActivityIndicator size="large" color={DS_V3.color.textSecondary} />
      </View>
    </Screen>
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
