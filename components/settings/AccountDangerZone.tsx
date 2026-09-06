import React from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { DS_COLORS, DS_V3 } from "@/lib/design-system";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { supabase } from "@/lib/supabase";
import { cancelLapsedUserReminders } from "@/lib/notifications";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { runClientSignOutCleanup } from "@/lib/signout-cleanup";
import { InlineError } from "@/components/InlineError";
import { styles as modalStyles } from "@/components/settings/settings-styles";
import Button from "@/components/ds/Button";

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
      <View style={v2.wrap}>
        <Button
          label="Sign out"
          variant="secondary"
          onPress={async () => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await cancelLapsedUserReminders();
            await supabase.auth.signOut();
            await runClientSignOutCleanup();
            const { clearOnboardingStorage } = await import("@/store/onboardingStore");
            await clearOnboardingStorage();
            router.replace(ROUTES.AUTH as never);
          }}
        />
        {!isGuest && (
          <Button
            label="Delete account"
            variant="tertiary"
            destructive
            onPress={() => setShowDeleteModal(true)}
          />
        )}
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <TouchableOpacity
          style={modalStyles.deleteModalBackdrop}
          activeOpacity={1}
          onPress={() => !deleteAccountLoading && setShowDeleteModal(false)}
          accessibilityLabel="Dismiss delete account dialog"
          accessibilityRole="button"
        />
        <View style={modalStyles.deleteModalCenter}>
          <View style={[modalStyles.card, modalStyles.deleteModalCard, { backgroundColor: DS_COLORS.card, borderColor: DS_COLORS.border }]}>
            <InlineError message={deleteAccountError} onDismiss={clearDeleteAccountError} />
            <Text style={[modalStyles.sectionTitle, { color: DS_COLORS.textPrimary, marginBottom: 8 }]}>Type DELETE to confirm</Text>
            <TextInput
              style={[modalStyles.deleteConfirmInput, { color: DS_COLORS.textPrimary, borderColor: DS_COLORS.border }]}
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
                modalStyles.deleteConfirmBtn,
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
                <Text style={modalStyles.deleteConfirmBtnText}>Delete my account</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.deleteCancelBtn, { borderColor: DS_COLORS.border }]}
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteConfirmValue("");
              }}
              disabled={deleteAccountLoading}
              accessibilityLabel="Cancel account deletion"
              accessibilityRole="button"
              accessibilityState={{ disabled: deleteAccountLoading }}
            >
              <Text style={[modalStyles.toggleTitle, { color: DS_COLORS.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
  );
}

const v2 = StyleSheet.create({
  wrap: { marginTop: DS_V3.space.section, gap: DS_V3.space.md },
});

