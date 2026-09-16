import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Deep link: /invite/[code]?ref=userId
 * Redirects to challenge detail with join prompt. Ref is preserved for attribution.
 */
function InviteRedirectScreenInner() {
  const { code, ref: refParam } = useLocalSearchParams<{ code: string; ref?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!code) {
      router.replace(ROUTES.TABS as never);
      return;
    }
    const challengeId = decodeURIComponent(code);
    const params: Record<string, string> = { id: challengeId, openJoin: "1" };
    if (refParam) params.ref = typeof refParam === "string" ? refParam : refParam[0] ?? "";
    router.replace({ pathname: ROUTES.CHALLENGE_ID(challengeId), params } as never);
  }, [code, refParam, router]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} edges={["top"]}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}

export default function InviteRedirectScreen() {
  return (
    <ErrorBoundary>
      <InviteRedirectScreenInner />
    </ErrorBoundary>
  );
}
