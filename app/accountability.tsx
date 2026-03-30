import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { ChevronLeft, UserPlus, UserMinus, Check, X, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { sharedStyles } from "@/lib/theme";
import { DS_COLORS } from "@/lib/design-system";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";
import { EmptyState } from "@/components/EmptyState";
import { ErrorRetry } from "@/components/ErrorRetry";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { captureError } from "@/lib/sentry";

type ListData = {
  accepted: { id: string; partner_id: string; partner_username: string; partner_display_name: string }[];
  incomingPending: { id: string; user_id: string; username: string; display_name: string }[];
  outgoingPending: { id: string; partner_id: string; username: string; display_name: string }[];
};

export default function AccountabilityScreen() {
  const router = useRouter();
  const { error, showError, clearError } = useInlineError();
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [removePartnerId, setRemovePartnerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(false);
      const result = await trpcQuery(TRPC.accountability.listMine) as ListData;
      setData(result ?? { accepted: [], incomingPending: [], outgoingPending: [] });
    } catch (e) {
      captureError(e, "AccountabilityLoad");
      if (__DEV__) console.error("[accountability] load failed:", e);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
  };

  const handleRemove = useCallback((partnerId: string) => {
    setRemovePartnerId(partnerId);
  }, []);

  const confirmRemovePartner = useCallback(async () => {
    const partnerId = removePartnerId;
    setRemovePartnerId(null);
    if (!partnerId) return;
    setActingId(partnerId);
    try {
      await trpcMutate(TRPC.accountability.remove, { partnerId });
      await load();
    } catch (e: unknown) {
      captureError(e, "AccountabilityRemovePartner");
      showError(e instanceof Error ? e.message : "Could not remove.");
    } finally {
      setActingId(null);
    }
  }, [removePartnerId, load, showError]);

  const handleRespond = useCallback(
    async (inviteId: string, action: "accept" | "decline") => {
      setActingId(inviteId);
      try {
        await trpcMutate(TRPC.accountability.respond, { inviteId, action });
        await load();
      } catch (e: unknown) {
        captureError(e, "AccountabilityRespondInvite");
        showError(e instanceof Error ? e.message : "Could not update invite.");
      } finally {
        setActingId(null);
      }
    },
    [load, showError]
  );

  const handleCancelOutgoing = useCallback(
    async (partnerId: string) => {
      setActingId(partnerId);
      try {
        await trpcMutate(TRPC.accountability.remove, { partnerId });
        await load();
      } catch (e: unknown) {
        captureError(e, "AccountabilityCancelOutgoing");
        showError(e instanceof Error ? e.message : "Could not cancel invite.");
      } finally {
        setActingId(null);
      }
    },
    [load, showError]
  );

  if (loading && !data) {
    return (
      <SafeAreaView style={sharedStyles.screenContainer} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accountability Circle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={DS_COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const list = data ?? { accepted: [], incomingPending: [], outgoingPending: [] };
  const acceptedCount = list.accepted.length;

  return (
    <SafeAreaView style={sharedStyles.screenContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
          <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accountability Circle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={[{ key: "accountability-root" }]}
        keyExtractor={(item) => item.key}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={() => (
          <View>
        <InlineError message={error} onDismiss={clearError} />
        <View style={styles.countRow}>
          <Text style={styles.countText}>{acceptedCount}/3 partners</Text>
        </View>

        {loadError ? (
          <ErrorRetry message="Couldn't load partners" onRetry={() => void load()} />
        ) : null}

        {list.accepted.length === 0 &&
        list.incomingPending.length === 0 &&
        list.outgoingPending.length === 0 &&
        !loadError ? (
          <EmptyState
            icon={Users}
            title="No accountability partners"
            subtitle="Pair up with someone to stay on track"
            action={{
              label: "Find a partner",
              onPress: () => router.push(ROUTES.ACCOUNTABILITY_ADD as never),
            }}
          />
        ) : null}

        {list.accepted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partners</Text>
            <View style={styles.card}>
              <FlatList
                data={list.accepted}
                keyExtractor={(p) => p.id}
                scrollEnabled={false}
                nestedScrollEnabled
                renderItem={({ item: p }) => (
                  <View style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{p.partner_display_name || p.partner_username || "Partner"}</Text>
                      <Text style={styles.rowSub}>@{p.partner_username}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemove(p.partner_id)}
                      disabled={actingId === p.partner_id}
                      style={styles.removeBtn}
                      accessibilityLabel={`Remove ${p.partner_display_name || p.partner_username || "partner"}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: actingId === p.partner_id }}
                    >
                      {actingId === p.partner_id ? (
                        <ActivityIndicator size="small" color={DS_COLORS.textSecondary} />
                      ) : (
                        <UserMinus size={20} color={DS_COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={8}
                removeClippedSubviews={Platform.OS === "android"}
              />
            </View>
          </View>
        )}

        {list.incomingPending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming invites</Text>
            <View style={styles.card}>
              <FlatList
                data={list.incomingPending}
                keyExtractor={(inv) => inv.id}
                scrollEnabled={false}
                nestedScrollEnabled
                renderItem={({ item: inv }) => (
                  <View style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{inv.display_name || inv.username || "User"}</Text>
                      <Text style={styles.rowSub}>@{inv.username}</Text>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => handleRespond(inv.id, "accept")}
                        disabled={actingId === inv.id}
                        style={[styles.iconBtn, styles.acceptBtn]}
                        accessibilityLabel={`Accept invite from ${inv.display_name || inv.username}`}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: actingId === inv.id }}
                      >
                        {actingId === inv.id ? (
                          <ActivityIndicator size="small" color={DS_COLORS.white} />
                        ) : (
                          <Check size={20} color={DS_COLORS.white} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRespond(inv.id, "decline")}
                        disabled={actingId === inv.id}
                        style={[styles.iconBtn, styles.declineBtn]}
                        accessibilityLabel={`Decline invite from ${inv.display_name || inv.username}`}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: actingId === inv.id }}
                      >
                        <X size={20} color={DS_COLORS.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={8}
                removeClippedSubviews={Platform.OS === "android"}
              />
            </View>
          </View>
        )}

        {list.outgoingPending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outgoing invites</Text>
            <View style={styles.card}>
              <FlatList
                data={list.outgoingPending}
                keyExtractor={(inv) => inv.id}
                scrollEnabled={false}
                nestedScrollEnabled
                renderItem={({ item: inv }) => (
                  <View style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{inv.display_name || inv.username || "User"}</Text>
                      <Text style={styles.rowSub}>@{inv.username} · Pending</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCancelOutgoing(inv.partner_id)}
                      disabled={actingId === inv.partner_id}
                      style={styles.cancelBtn}
                      accessibilityLabel={`Cancel invite to ${inv.display_name || inv.username}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: actingId === inv.partner_id }}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={8}
                removeClippedSubviews={Platform.OS === "android"}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push(ROUTES.ACCOUNTABILITY_ADD as never)}
          activeOpacity={0.85}
          accessibilityLabel="Add partner"
          accessibilityRole="button"
        >
          <UserPlus size={22} color={DS_COLORS.white} />
          <Text style={styles.addBtnText}>Add Partner</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <ConfirmDialog
        visible={removePartnerId !== null}
        title="Remove partner"
        message="Remove this person from your Accountability Circle?"
        confirmLabel="Remove"
        destructive
        onCancel={() => setRemovePartnerId(null)}
        onConfirm={() => void confirmRemovePartner()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: DS_COLORS.textPrimary },
  headerSpacer: { width: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  countRow: { marginBottom: 16 },
  countText: { fontSize: 15, color: DS_COLORS.textSecondary, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: DS_COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  card: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },
  rowSub: { fontSize: 13, color: DS_COLORS.textSecondary, marginTop: 2 },
  removeBtn: { padding: 8 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  acceptBtn: { backgroundColor: DS_COLORS.acceptGreen },
  declineBtn: { backgroundColor: DS_COLORS.border },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: DS_COLORS.border },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: DS_COLORS.textPrimary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: DS_COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addBtnText: { fontSize: 17, fontWeight: "700", color: DS_COLORS.white },
  bottomSpacer: { height: 32 },
});
