import React, { useRef, useState } from "react";
import { View, Text, Pressable, Modal, TextInput, Platform, StyleSheet, Linking, KeyboardAvoidingView } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { DS_V3 } from "@/lib/design-system";
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
import Sheet from "@/components/ds/Sheet";
import { useApp } from "@/contexts/AppContext";

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
  const { isPremium } = useApp();
  const [subOpen, setSubOpen] = useState(false);
  const deleteInFlight = useRef(false);
  const typedRef = useRef(deleteConfirmValue);

  const confirmDelete = async (typed: string) => {
    const word = (typed || typedRef.current).trim();
    if (deleteInFlight.current || deleteAccountLoading) return;
    if (word !== "DELETE") {
      showDeleteAccountError("Type DELETE to confirm.");
      return;
    }
    deleteInFlight.current = true;
    setDeleteAccountLoading(true);
    try {
      await trpcMutate(TRPC.profiles.deleteAccount);
      await cancelLapsedUserReminders();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      await supabase.auth.signOut();
      await runClientSignOutCleanup(userId);
      const { clearOnboardingStorage } = await import("@/store/onboardingStore");
      await clearOnboardingStorage();
      setShowDeleteModal(false);
      setDeleteConfirmValue("");
      router.replace(ROUTES.AUTH_LOGIN as never);
    } catch (e) {
      captureError(e, "SettingsDeleteAccount");
      showDeleteAccountError("Failed to delete account. Please try again.");
    } finally {
      deleteInFlight.current = false;
      setDeleteAccountLoading(false);
    }
  };

  return (
    <>
      <View style={v2.wrap}>
        <Button
          label="Sign out"
          variant="secondary"
          onPress={async () => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await cancelLapsedUserReminders();
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            await supabase.auth.signOut();
            await runClientSignOutCleanup(userId);
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
            onPress={() => {
              if (isPremium) setSubOpen(true);
              else setShowDeleteModal(true);
            }}
          />
        )}
      </View>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={v2.modalFill}>
        <View accessibilityViewIsModal style={modalStyles.deleteModalCenter}>
          <View pointerEvents="none" style={modalStyles.deleteModalBackdrop} />
          <View style={[modalStyles.card, modalStyles.deleteModalCard, { backgroundColor: DS_V3.color.surface, borderColor: DS_V3.color.border, zIndex: 2 }]}>
            <InlineError message={deleteAccountError} onDismiss={clearDeleteAccountError} />
            <Text style={[modalStyles.sectionTitle, { color: DS_V3.color.textPrimary, marginBottom: 8 }]}>Type DELETE to confirm</Text>
            <TextInput
              style={[modalStyles.deleteConfirmInput, { color: DS_V3.color.textPrimary, borderColor: DS_V3.color.border }]}
              value={deleteConfirmValue}
              onChangeText={(text) => {
                typedRef.current = text;
                setDeleteConfirmValue(text);
              }}
              onSubmitEditing={(e) => {
                const text = e.nativeEvent.text ?? typedRef.current;
                typedRef.current = text;
                void confirmDelete(text);
              }}
              placeholder="DELETE"
              placeholderTextColor={DS_V3.color.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleteAccountLoading}
              accessibilityLabel="Type DELETE to confirm account deletion"
              testID="delete-confirm"
              returnKeyType="go"
            />
            <Pressable
              testID="delete-submit"
              accessibilityRole="button"
              accessibilityLabel="Permanently delete my account"
              accessibilityState={{ disabled: deleteAccountLoading }}
              disabled={deleteAccountLoading}
              onPress={() => {
                void confirmDelete(typedRef.current);
              }}
              onAccessibilityTap={() => {
                void confirmDelete(typedRef.current);
              }}
              style={[modalStyles.deleteConfirmBtn, { backgroundColor: DS_V3.color.danger, alignItems: "center" }]}
            >
              <Text style={modalStyles.deleteConfirmBtnText}>Permanently delete my account</Text>
            </Pressable>
            <Button
              label="Cancel account deletion"
              variant="tertiary"
              disabled={deleteAccountLoading}
              onPress={() => {
                setShowDeleteModal(false);
                setDeleteConfirmValue("");
                typedRef.current = "";
              }}
            />
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <Sheet
        visible={subOpen}
        onDismiss={() => setSubOpen(false)}
        heading="Cancel GRIIT Pro first"
        footer={
          <>
            <Button
              label="I’ve cancelled, continue"
              variant="secondary"
              onPress={() => {
                setSubOpen(false);
                setShowDeleteModal(true);
              }}
            />
            <Button label="Keep my account" variant="tertiary" onPress={() => setSubOpen(false)} />
          </>
        }
      >
        <Text style={v2.subBody}>
          Your Pro subscription is billed by Apple. Deleting your account doesn’t stop it. Cancel it in your App Store subscriptions, then come back.
        </Text>
        <Button
          label="Manage subscription"
          variant="secondary"
          onPress={() => void Linking.openURL("https://apps.apple.com/account/subscriptions")}
        />
      </Sheet>

    </>
  );
}

const v2 = StyleSheet.create({
  wrap: { marginTop: DS_V3.space.section, gap: DS_V3.space.md },
  modalFill: { flex: 1 },
  subBody: { ...DS_V3.type.body, color: DS_V3.color.textSecondary, marginBottom: 12 },
});

