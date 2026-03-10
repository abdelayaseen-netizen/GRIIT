import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { ChevronLeft, UserPlus, UserMinus, Check, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { ROUTES } from "@/lib/routes";

type ListData = {
  accepted: { id: string; partner_id: string; partner_username: string; partner_display_name: string }[];
  incomingPending: { id: string; user_id: string; username: string; display_name: string }[];
  outgoingPending: { id: string; partner_id: string; username: string; display_name: string }[];
};

export default function AccountabilityScreen() {
  const router = useRouter();
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await trpcQuery("accountability.listMine") as ListData;
      setData(result ?? { accepted: [], incomingPending: [], outgoingPending: [] });
    } catch {
      setData({ accepted: [], incomingPending: [], outgoingPending: [] });
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
    router.back();
  };

  const handleRemove = useCallback(
    async (partnerId: string) => {
      Alert.alert(
        "Remove partner",
        "Remove this person from your Accountability Circle?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              setActingId(partnerId);
              try {
                await trpcMutate("accountability.remove", { partnerId });
                await load();
              } catch (e: unknown) {
                Alert.alert("Error", e instanceof Error ? e.message : "Could not remove.");
              } finally {
                setActingId(null);
              }
            },
          },
        ]
      );
    },
    [load]
  );

  const handleRespond = useCallback(
    async (inviteId: string, action: "accept" | "decline") => {
      setActingId(inviteId);
      try {
        await trpcMutate("accountability.respond", { inviteId, action });
        await load();
      } catch (e: unknown) {
        Alert.alert("Error", e instanceof Error ? e.message : "Could not update invite.");
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  const handleCancelOutgoing = useCallback(
    async (partnerId: string) => {
      setActingId(partnerId);
      try {
        await trpcMutate("accountability.remove", { partnerId });
        await load();
      } catch (e: unknown) {
        Alert.alert("Error", e instanceof Error ? e.message : "Could not cancel invite.");
      } finally {
        setActingId(null);
      }
    },
    [load]
  );

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accountability Circle</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const list = data ?? { accepted: [], incomingPending: [], outgoingPending: [] };
  const acceptedCount = list.accepted.length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accountability Circle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>{acceptedCount}/3 partners</Text>
        </View>

        {list.accepted.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partners</Text>
            <View style={styles.card}>
              {list.accepted.map((p) => (
                <View key={p.id} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{p.partner_display_name || p.partner_username || "Partner"}</Text>
                    <Text style={styles.rowSub}>@{p.partner_username}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(p.partner_id)}
                    disabled={actingId === p.partner_id}
                    style={styles.removeBtn}
                  >
                    {actingId === p.partner_id ? (
                      <ActivityIndicator size="small" color={Colors.text.secondary} />
                    ) : (
                      <UserMinus size={20} color={Colors.text.secondary} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {list.incomingPending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incoming invites</Text>
            <View style={styles.card}>
              {list.incomingPending.map((inv) => (
                <View key={inv.id} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{inv.display_name || inv.username || "User"}</Text>
                    <Text style={styles.rowSub}>@{inv.username}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => handleRespond(inv.id, "accept")}
                      disabled={actingId === inv.id}
                      style={[styles.iconBtn, styles.acceptBtn]}
                    >
                      {actingId === inv.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Check size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRespond(inv.id, "decline")}
                      disabled={actingId === inv.id}
                      style={[styles.iconBtn, styles.declineBtn]}
                    >
                      <X size={20} color={Colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {list.outgoingPending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outgoing invites</Text>
            <View style={styles.card}>
              {list.outgoingPending.map((inv) => (
                <View key={inv.id} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{inv.display_name || inv.username || "User"}</Text>
                    <Text style={styles.rowSub}>@{inv.username} · Pending</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCancelOutgoing(inv.partner_id)}
                    disabled={actingId === inv.partner_id}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push(ROUTES.ACCOUNTABILITY_ADD as never)}
          activeOpacity={0.85}
        >
          <UserPlus size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Partner</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text.primary },
  headerSpacer: { width: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  countRow: { marginBottom: 16 },
  countText: { fontSize: 15, color: Colors.text.secondary, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.text.secondary, marginBottom: 8, letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  rowSub: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  removeBtn: { padding: 8 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  acceptBtn: { backgroundColor: "#22c55e" },
  declineBtn: { backgroundColor: Colors.border },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: Colors.border },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: Colors.text.primary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addBtnText: { fontSize: 17, fontWeight: "700", color: "#fff" },
  bottomSpacer: { height: 32 },
});
