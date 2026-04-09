import React from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { supabase } from "@/lib/supabase";
import { cancelLapsedUserReminders } from "@/lib/notifications";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { runClientSignOutCleanup } from "@/lib/signout-cleanup";
import { InlineError } from "@/components/InlineError";
import { styles } from "@/components/settings/settings-styles";

export const CONSEQUENCES = [
  { bulletColor: DS_COLORS.warning, title: "Miss 1 day", sub: "Streak breaks (unless grace used)" },
  { bulletColor: DS_COLORS.accent, title: "Miss 3 in 7 days", sub: "On Thin Ice warning state" },
  { bulletColor: DS_COLORS.danger, title: "Miss 7 days", sub: "Challenge auto-paused, tier drops" },
  { bulletColor: DS_COLORS.danger, title: "Miss 14 days", sub: "Full reset, must rebuild 7 days" },
] as const;

export interface AccountDangerZoneProps {
  isGuest: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: (v: boolean) => void;
  deleteConfirmValue: string;
  setDeleteConfirmValue: (v: string) => void;
  deleteAccountLoading: boolean;
  setDeleteAccountLoading: (v: boolean) => void;
  deleteAccountError: string | null;
  showDeleteAccountError: (msg: string) => void;
  clearDeleteAccountError: () => void;
}

export function AccountDangerZone({
  isGuest,
  showDeleteModal,
  setShowDeleteModal,
  deleteConfirmValue,
  setDeleteConfirmValue,
  deleteAccountLoading,
  setDeleteAccountLoading,
  deleteAccountError,
  showDeleteAccountError,
  clearDeleteAccountError,
}: AccountDangerZoneProps) {
  const router = useRouter();

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LogOut size={18} color={DS_COLORS.textPrimary} />
          <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary }]}>Account</Text>
        </View>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}
          onPress={async () => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await cancelLapsedUserReminders();
            await supabase.auth.signOut();
            await runClientSignOutCleanup();
            const { clearOnboardingStorage } = await import("@/store/onboardingStore");
            await clearOnboardingStorage();
            router.replace(ROUTES.AUTH as never);
          }}
          activeOpacity={0.9}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Text style={[styles.toggleTitle, { color: DS_COLORS.dangerDark }]}>Sign Out</Text>
        </TouchableOpacity>
        {!isGuest && (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border, marginTop: 10 }]}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.9}
            accessibilityLabel="Delete account"
            accessibilityRole="button"
          >
            <Text style={[styles.toggleTitle, { color: DS_COLORS.dangerDark, fontSize: 14 }]}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.deleteModalBackdrop}
          activeOpacity={1}
          onPress={() => !deleteAccountLoading && setShowDeleteModal(false)}
          accessibilityLabel="Dismiss delete account dialog"
          accessibilityRole="button"
        />
        <View style={styles.deleteModalCenter}>
          <View style={[styles.card, styles.deleteModalCard, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
            <InlineError message={deleteAccountError} onDismiss={clearDeleteAccountError} />
            <Text style={[styles.sectionTitle, { color: DS_COLORS.textPrimary, marginBottom: 8 }]}>Type DELETE to confirm</Text>
            <TextInput
              style={[styles.deleteConfirmInput, { color: DS_COLORS.textPrimary, borderColor: DS_COLORS.border }]}
              value={deleteConfirmValue}
              onChangeText={setDeleteConfirmValue}
              placeholder="DELETE"
              placeholderTextColor={DS_COLORS.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleteAccountLoading}
              accessibilityLabel="Type DELETE to confirm account deletion"
              accessibilityRole="text"
            />
            <TouchableOpacity
              style={[
                styles.deleteConfirmBtn,
                { backgroundColor: deleteConfirmValue === "DELETE" ? DS_COLORS.dangerDark : DS_COLORS.border },
              ]}
              onPress={async () => {
                if (deleteConfirmValue !== "DELETE" || deleteAccountLoading) return;
                setDeleteAccountLoading(true);
                try {
                  await trpcMutate(TRPC.profiles.deleteAccount);
                  await cancelLapsedUserReminders();
                  await supabase.auth.signOut();
                  await runClientSignOutCleanup();
                  const { clearOnboardingStorage } = await import("@/store/onboardingStore");
                  await clearOnboardingStorage();
                  setShowDeleteModal(false);
                  setDeleteConfirmValue("");
                  router.replace(ROUTES.AUTH_LOGIN as never);
                } catch (e) {
                  captureError(e, "SettingsDeleteAccount");
                  showDeleteAccountError("Failed to delete account. Please try again.");
                } finally {
                  setDeleteAccountLoading(false);
                }
              }}
              disabled={deleteConfirmValue !== "DELETE" || deleteAccountLoading}
              activeOpacity={0.85}
              accessibilityLabel="Permanently delete my account"
              accessibilityRole="button"
              accessibilityState={{ disabled: deleteConfirmValue !== "DELETE" || deleteAccountLoading }}
            >
              {deleteAccountLoading ? (
                <ActivityIndicator size="small" color={DS_COLORS.white} />
              ) : (
                <Text style={styles.deleteConfirmBtnText}>Delete my account</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteCancelBtn, { borderColor: DS_COLORS.border }]}
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteConfirmValue("");
              }}
              disabled={deleteAccountLoading}
              accessibilityLabel="Cancel account deletion"
              accessibilityRole="button"
              accessibilityState={{ disabled: deleteAccountLoading }}
            >
              <Text style={[styles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
  );
}

export function ConsequencesSection() {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitleFriends, { color: DS_COLORS.textPrimary }]}>⏱ Consequences</Text>
      <View style={[styles.card, styles.consequenceCard, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
        {CONSEQUENCES.map((item, i) => (
          <View key={i} style={styles.consequenceRow}>
            <View style={[styles.bullet, { backgroundColor: item.bulletColor }]} />
            <View style={styles.consequenceTextWrap}>
              <Text style={[styles.consequenceTitle, { color: DS_COLORS.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.consequenceSub, { color: DS_COLORS.textMuted }]}>{item.sub}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
