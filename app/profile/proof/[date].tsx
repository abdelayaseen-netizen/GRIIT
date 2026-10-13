import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { ProofViewer } from "@/components/profile/ProofViewer";
import { rememberProofTile } from "@/lib/proof-return";
import { firstString } from "@/lib/task-helpers";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { itemsFromRecordProofs } from "@/lib/proofs-grid";
import { viewerDays, viewerPosFor, type Pos } from "@/lib/proof-viewer";
import type { ProfileRecord } from "@/lib/profile-v2-record";

type RecordPayload = ProfileRecord & { timezone: string; todayKey: string };

export default function ProfileProofScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; userId?: string; at?: string }>();
  const dateKey = firstString(params.date);
  const at = firstString(params.at);
  const userId = firstString(params.userId);
  const q = useQuery({
    queryKey: ["profiles", "getRecord", userId ?? "self", "proof"],
    queryFn: () => trpcQuery(TRPC.profiles.getRecord, userId ? { userId } : undefined) as Promise<RecordPayload>,
  });
  const days = useMemo(() => {
    const items = itemsFromRecordProofs(q.data?.proofs ?? [], { includeSelf: true });
    const visible = userId ? items.filter((item) => item.shared) : items;
    return viewerDays(visible, { timeZone: q.data?.timezone || "UTC" });
  }, [q.data, userId]);
  const initial = useMemo<Pos>(() => viewerPosFor(days, dateKey, at), [at, dateKey, days]);
  const [pos, setPos] = useState<Pos>(initial);
  useEffect(() => {
    setPos(initial);
  }, [initial]);
  const task = days[pos.day]?.tasks[pos.task];
  const countLabel = task ? `${pos.photo + 1} of ${task.photos.length}` : "1 of 1";

  return (
    <Screen edges={["top", "left", "right"]}>
      <ErrorBoundary>
        <ProofViewer
          days={days}
          pos={pos}
          countLabel={countLabel}
          onPos={(next) => {
            setPos(next);
            const id = days[next.day]?.tasks[next.task]?.id;
            if (id) rememberProofTile(id);
          }}
          onClose={() => router.back()}
        />
      </ErrorBoundary>
    </Screen>
  );
}
