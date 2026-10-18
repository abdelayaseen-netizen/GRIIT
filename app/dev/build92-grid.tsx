/**
 * Dev-only. Route: /dev/build92-grid
 * Build 92 chunk 07: a 25-tile proof grid (the real ProfileProofs) over the 25-post viewer harness,
 * for the "tile 10 → scroll 5 posts → Back lands on tile 10" gate.
 */
import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import Screen from "@/components/ds/Screen";
import PushedHeader from "@/components/ds/PushedHeader";
import ProfileProofs, { type ProfileProofTile } from "@/components/profile/ProfileProofs";
import { EMPTY_SECURED_HEADER } from "@/lib/secured-since";
import { DS_V3 } from "@/lib/design-system";
import { syntheticPosts } from "@/lib/dev-synthetic-posts";

export default function Build92GridDev() {
  const router = useRouter();
  const posts = useMemo(() => syntheticPosts(), []);
  const tiles = useMemo<ProfileProofTile[]>(
    () =>
      posts.map((p, i) => ({
        id: p.id,
        dateKey: `2026-10-${String(i + 1).padStart(2, "0")}`,
        imageUrl: `https://picsum.photos/seed/griit-${i + 1}/400/500`,
        taskName: "Get to the gym",
        shared: true,
        shareState: "shared",
      })),
    [posts],
  );
  if (!__DEV__) return null;
  return (
    <Screen style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PushedHeader title="Proofs (dev)" onBack={() => router.back()} />
      <ScrollView>
        <ProfileProofs
          proofs={tiles}
          isOwner
          monthKey="2026-10"
          days={[]}
          header={EMPTY_SECURED_HEADER}
          securedDays={25}
          proofCount={25}
          onOpenDay={(tile) => {
            const i = tiles.findIndex((t) => t.id === tile.id);
            router.push(`/dev/build92-posts?mode=new&start=${i + 1}` as never);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
});
