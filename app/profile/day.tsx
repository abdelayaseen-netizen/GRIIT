import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { ProofScroll } from "@/components/profile/ProofScroll";
import { rememberProofTile } from "@/lib/proof-return";
import { DS_V3 } from "@/lib/design-system";
import { firstString } from "@/lib/task-helpers";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { itemsFromRecordProofs, proofsDateLabel, type ProofsGridItem } from "@/lib/proofs-grid";
import type { ProfileRecord } from "@/lib/profile-v2-record";

type RecordPayload = ProfileRecord & { timezone: string; todayKey: string };

export default function ProfileDayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dateKey?: string; userId?: string; at?: string }>();
  const dateKey = firstString(params.dateKey);
  const at = firstString(params.at);
  const userId = firstString(params.userId);
  const isOwner = !userId;
  const q = useQuery({
    queryKey: ["profiles", "getRecord", userId ?? "self", "day"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord, userId ? { userId } : undefined) as Promise<RecordPayload>,
  });
  const all = itemsFromRecordProofs(q.data?.proofs ?? [], { includeSelf: true });
  const visible = isOwner ? all : all.filter((i) => i.shared);
  const [viewDateKey, setViewDateKey] = useState(dateKey);
  const [countLabel, setCountLabel] = useState("1 of 1");
  const currentId = useRef(at);
  useEffect(() => {
    setViewDateKey(dateKey);
  }, [dateKey]);
  useEffect(() => {
    return () => {
      if (currentId.current) rememberProofTile(currentId.current);
    };
  }, []);
  const items: ProofsGridItem[] = visible;

  return (
    <Screen>
    <ErrorBoundary>
      <View style={[styles.root, { paddingTop: DS_V3.space.sm }]}>
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={styles.side}
          >
            <X size={DS_V3.space.gutter} color={DS_V3.color.textPrimary} />
          </Pressable>
          <View style={styles.headerBlock}>
            <Text style={styles.header}>{viewDateKey ? proofsDateLabel(viewDateKey) : "Day"}</Text>
            <Text style={styles.count} accessibilityLabel={countLabel}>
              {countLabel}
            </Text>
          </View>
          <View style={styles.side} />
        </View>
        <ProofScroll
          items={items}
          initialId={at || items.find((item) => item.dateKey === dateKey)?.id}
          onIndexChange={(item, index) => {
            currentId.current = item.id;
            setViewDateKey(item.dateKey);
            setCountLabel(`${index + 1} of ${items.length || 1}`);
          }}
        />
      </View>
    </ErrorBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS_V3.color.canvas },
  top: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DS_V3.space.gutter,
    minHeight: 44,
  },
  side: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerBlock: { flex: 1, alignItems: "center", gap: 1 },
  header: { textAlign: "center", ...DS_V3.type.label, color: DS_V3.color.textSecondary },
  count: { textAlign: "center", ...DS_V3.type.caption, color: DS_V3.color.textSecondary },
});
