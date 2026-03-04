import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { trpcQuery, trpcMutate } from "@/lib/trpc";

type SearchHit = { user_id: string; username: string; display_name: string };

const DEBOUNCE_MS = 400;

export default function AddAccountabilityPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const t = q.trim();
    if (!t || t.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const data = await trpcQuery("profiles.search", { query: t }) as SearchHit[];
      setHits(data ?? []);
    } catch {
      setHits([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const onQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer) clearTimeout(debounceTimer);
      const id = setTimeout(() => runSearch(text), DEBOUNCE_MS);
      setDebounceTimer(id);
    },
    [debounceTimer, runSearch]
  );

  const handleInvite = useCallback(
    async (partnerId: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInvitingId(partnerId);
      try {
        await trpcMutate("accountability.invite", { partnerId });
        Alert.alert("Invite sent", "They'll see your request in their Accountability Circle.");
        if (params.from === "onboarding" || params.from === "day1") {
          router.replace(params.from === "onboarding" ? "/onboarding?step=4" : "/(tabs)" as any);
        } else {
          router.back();
        }
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Could not send invite.");
      } finally {
        setInvitingId(null);
      }
    },
    [params.from, router]
  );

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (params.from === "onboarding") {
      router.replace("/onboarding?step=4" as any);
    } else if (params.from === "day1") {
      router.replace("/(tabs)" as any);
    } else {
      router.back();
    }
  }, [params.from, router]);

  const renderItem = useCallback(
    ({ item }: { item: SearchHit }) => {
      const isInviting = invitingId === item.user_id;
      return (
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{item.display_name || item.username || "User"}</Text>
            <Text style={styles.rowSub}>@{item.username}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleInvite(item.user_id)}
            disabled={isInviting}
            style={styles.inviteBtn}
          >
            {isInviting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.inviteBtnText}>Invite</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [handleInvite, invitingId]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Partner</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Search by username..."
            placeholderTextColor={Colors.text.tertiary}
            value={query}
            onChangeText={onQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searching && (
            <View style={styles.searchingWrap}>
              <ActivityIndicator size="small" color={Colors.accent} />
            </View>
          )}
        </View>

        {query.trim().length >= 2 && !searching && hits.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No users found. Try another search.</Text>
          </View>
        )}

        <FlatList
          data={hits}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {},
  backText: { fontSize: 16, color: Colors.accent, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text.primary },
  headerSpacer: { width: 56 },
  inputWrap: { padding: 16, position: "relative" },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  searchingWrap: { position: "absolute", right: 28, top: 28 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 15, color: Colors.text.secondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  rowSub: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  inviteBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  inviteBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
