import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { sharedStyles } from "@/src/theme";
import { DS_COLORS } from "@/lib/design-system";
import { trpcQuery, trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { InlineError } from "@/components/InlineError";
import { useInlineError } from "@/hooks/useInlineError";
import { captureError } from "@/lib/sentry";

type SearchHit = { user_id: string; username: string; display_name: string };

const DEBOUNCE_MS = 400;

export default function AddAccountabilityPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const { error, showError, clearError } = useInlineError();
  const [query, setQuery] = useState<string>("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
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
      const data = await trpcQuery(TRPC.profiles.search, { query: t }) as SearchHit[];
      setHits(data ?? []);
    } catch (err) {
      if (__DEV__) console.warn("[accountability/add] search failed", err);
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
        await trpcMutate(TRPC.accountability.invite, { partnerId });
        if (Platform.OS !== "web") {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (params.from === "onboarding" || params.from === "day1") {
          router.replace((params.from === "onboarding" ? ROUTES.ONBOARDING_STEP4 : ROUTES.TABS) as never);
        } else {
          router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
        }
      } catch (e: unknown) {
        captureError(e, "AccountabilityAddInvite");
        showError(e instanceof Error ? e.message : "Could not send invite.");
      } finally {
        setInvitingId(null);
      }
    },
    [params.from, router]
  );

  const handleBack = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (params.from === "onboarding") {
      router.replace(ROUTES.ONBOARDING_STEP4 as never);
    } else if (params.from === "day1") {
      router.replace(ROUTES.TABS as never);
    } else {
      router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never);
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
            accessibilityRole="button"
            accessibilityLabel={`Invite ${item.display_name || item.username} as accountability partner`}
            accessibilityState={{ disabled: isInviting }}
          >
            {isInviting ? (
              <ActivityIndicator size="small" color={DS_COLORS.white} />
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
    <SafeAreaView style={sharedStyles.screenContainer} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Partner</Text>
          <View style={styles.headerSpacer} />
        </View>

        <InlineError message={error} onDismiss={clearError} />

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Search by handle..."
            placeholderTextColor={DS_COLORS.textMuted}
            value={query}
            onChangeText={onQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search by username"
          />
          {searching && (
            <View style={styles.searchingWrap}>
              <ActivityIndicator size="small" color={DS_COLORS.accent} />
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
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  backBtn: {},
  backText: { fontSize: 16, color: DS_COLORS.accent, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: DS_COLORS.textPrimary },
  headerSpacer: { width: 56 },
  inputWrap: { padding: 16, position: "relative" },
  input: {
    backgroundColor: DS_COLORS.surface,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: DS_COLORS.textPrimary,
  },
  searchingWrap: { position: "absolute", right: 28, top: 28 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 15, color: DS_COLORS.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: DS_COLORS.textPrimary },
  rowSub: { fontSize: 13, color: DS_COLORS.textSecondary, marginTop: 2 },
  inviteBtn: {
    backgroundColor: DS_COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  inviteBtnText: { fontSize: 15, fontWeight: "700", color: DS_COLORS.white },
});
