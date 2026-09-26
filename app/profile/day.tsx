import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DayViewer } from "@/components/profile/DayViewer";
import { DS_V3 } from "@/lib/design-system";
import { firstString } from "@/lib/task-helpers";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { itemsFromRecordProofs, proofsDateLabel, type ProofsGridItem } from "@/lib/proofs-grid";
import type { ProfileRecord } from "@/lib/profile-v2-record";

type RecordPayload = ProfileRecord & { timezone: string; todayKey: string };

export default function ProfileDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ dateKey?: string; userId?: string }>();
  const dateKey = firstString(params.dateKey);
  const userId = firstString(params.userId);
  const isOwner = !userId;
  const q = useQuery({
    queryKey: ["profiles", "getRecord", userId ?? "self", "day"],
    queryFn: () =>
      trpcQuery(TRPC.profiles.getRecord, userId ? { userId } : undefined) as Promise<RecordPayload>,
  });
  const all = itemsFromRecordProofs(q.data?.proofs ?? []);
  const visible = isOwner ? all : all.filter((i) => i.shared);
  const [sharedIds, setSharedIds] = useState<string[]>([]);
  const [viewDateKey, setViewDateKey] = useState(dateKey);
  useEffect(() => {
    setViewDateKey(dateKey);
  }, [dateKey]);
  const items: ProofsGridItem[] = visible.map((i) =>
    sharedIds.includes(i.id) ? { ...i, shared: true } : i,
  );

  return (
    <ErrorBoundary>
      <View style={[styles.root, { paddingTop: insets.top + DS_V3.space.sm }]}>
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={styles.side}
          >
            <X size={DS_V3.space.gutter} color={DS_V3.color.textPrimary} />
          </Pressable>
          <Text style={styles.header}>{viewDateKey ? proofsDateLabel(viewDateKey) : "Day"}</Text>
          <View style={styles.side} />
        </View>
        <DayViewer
          items={items}
          initialDateKey={dateKey}
          isOwner={isOwner}
          onDateKeyChange={setViewDateKey}
          onShare={(item) => {
            if (!item.eventId) return;
            void trpcMutate(TRPC.checkins.shareProof, { eventId: item.eventId }).then(() => {
              setSharedIds((ids) => [...ids, item.id]);
            });
          }}
        />
      </View>
    </ErrorBoundary>
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
  header: { flex: 1, textAlign: "center", ...DS_V3.type.label, color: DS_V3.color.textSecondary },
});
