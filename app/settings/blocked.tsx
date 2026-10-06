import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ban } from "lucide-react-native";
import Screen from "@/components/ds/Screen";
import { SettingsNav } from "@/components/settings/SettingsNav";
import Sheet from "@/components/ds/Sheet";
import Button from "@/components/ds/Button";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DS_V3 } from "@/lib/design-system";
import { trpcMutate, trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";

type BlockedRow = {
  user_id: string;
  username: string;
  display_name: string;
  created_at: string | null;
};

function blockedOn(iso: string | null): string {
  if (!iso) return "Blocked";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Blocked";
  return `Blocked ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function BlockedUsersInner() {
  const [rows, setRows] = useState<BlockedRow[] | null>(null);
  const [pending, setPending] = useState<BlockedRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await trpcQuery<BlockedRow[]>(TRPC.profiles.blockedUsers);
    setRows(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    void load().catch(() => setRows([]));
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const nameOf = (row: BlockedRow) => row.display_name.trim() || row.username || "them";

  return (
    <Screen style={styles.safe} edges={["top"]}>
      <SettingsNav title="Blocked users" />
      <ScrollView contentContainerStyle={styles.body}>
        {rows && rows.length === 0 ? (
          <View style={styles.empty}>
            <Ban size={26} color={DS_V3.color.textSecondary} />
            <Text style={styles.emptyTitle}>No one blocked</Text>
            <Text style={styles.emptyBody}>Block someone from their profile or a post’s menu.</Text>
          </View>
        ) : null}
        {rows && rows.length > 0 ? (
          <View style={styles.card}>
            {rows.map((row) => (
              <View key={row.user_id} style={styles.row}>
                <View style={styles.copy}>
                  <Text style={styles.name}>{nameOf(row)}</Text>
                  <Text style={styles.meta}>{blockedOn(row.created_at)}</Text>
                </View>
                <Pressable onPress={() => setPending(row)} accessibilityRole="button" accessibilityLabel={`Unblock ${nameOf(row)}`}>
                  <Text style={styles.unblock}>Unblock</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        {rows && rows.length > 0 ? (
          <Text style={styles.note}>
            Blocked people can’t see your profile or proofs, and you don’t see theirs. They aren’t told.
          </Text>
        ) : null}
      </ScrollView>
      <Sheet
        visible={pending != null}
        onDismiss={() => setPending(null)}
        heading={pending ? `Unblock ${nameOf(pending)}?` : "Unblock?"}
        footer={
          <>
            <Button label="Cancel" variant="secondary" onPress={() => setPending(null)} />
            <Button
              label="Unblock"
              variant="secondary"
              onPress={() => {
                const row = pending;
                if (!row) return;
                setPending(null);
                void trpcMutate(TRPC.profiles.unblockUser, { userId: row.user_id })
                  .then(() => {
                    setRows((prev) => (prev ?? []).filter((r) => r.user_id !== row.user_id));
                    setToast(`${nameOf(row)} is unblocked.`);
                  })
                  .catch(() => setToast("Couldn’t unblock. Try again."));
              }}
            />
          </>
        }
      >
        <Text style={styles.sheetBody}>
          {pending ? `${nameOf(pending)} will be able to see your public profile again. You won’t follow each other automatically.` : ""}
        </Text>
      </Sheet>
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

export default function BlockedUsersScreen() {
  return (
    <ErrorBoundary>
      <BlockedUsersInner />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DS_V3.color.canvas },
  body: { paddingHorizontal: DS_V3.space.gutter, paddingTop: DS_V3.space.gutter, paddingBottom: 80 },
  empty: { alignItems: "center", paddingTop: 140, gap: 6 },
  emptyTitle: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  emptyBody: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    paddingHorizontal: 14,
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copy: { flex: 1 },
  name: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  meta: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary },
  unblock: { ...DS_V3.type.headline, color: DS_V3.color.textPrimary },
  note: { ...DS_V3.type.secondary, color: DS_V3.color.textSecondary, marginTop: 12 },
  sheetBody: { ...DS_V3.type.body, color: DS_V3.color.textSecondary },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 46,
    backgroundColor: DS_V3.color.raised,
    borderRadius: 14,
    padding: 14,
  },
  toastText: { ...DS_V3.type.secondary, color: DS_V3.color.textPrimary },
});
