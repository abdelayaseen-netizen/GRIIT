import React, { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Deep link: /invite/[code]?ref=userId
 * Redirects to challenge detail with join prompt. Ref is preserved for attribution.
 */
export default function InviteRedirectScreen() {
  const { code, ref: refParam } = useLocalSearchParams<{ code: string; ref?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!code) {
      router.replace("/(tabs)" as any);
      return;
    }
    const challengeId = decodeURIComponent(code);
    const params: Record<string, string> = { id: challengeId, openJoin: "1" };
    if (refParam) params.ref = typeof refParam === "string" ? refParam : refParam[0] ?? "";
    router.replace({
      pathname: "/challenge/[id]",
      params,
    } as any);
  }, [code, refParam, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
