import React from "react";
import { Modal, Pressable, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { CREATE_CHALLENGE_DRAFT_KEY } from "@/hooks/useCreateChallengeWizardPersistence";
import { styles } from "@/components/create/wizard-styles";

type DraftExitModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaveDraft: () => void | Promise<void>;
};

export function DraftExitModal({ visible, onClose, onSaveDraft }: DraftExitModalProps) {
  const router = useRouter();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.draftExitBackdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close save draft dialog"
      >
        <Pressable style={styles.draftExitCard} onPress={(e) => e.stopPropagation()} accessible={false}>
          <Text style={styles.draftExitTitle}>Save as draft?</Text>
          <TouchableOpacity
            style={styles.draftExitPrimary}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Keep editing"
          >
            <Text style={styles.draftExitPrimaryTxt}>Keep editing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.draftExitDanger}
            onPress={() => {
              onClose();
              void AsyncStorage.removeItem(CREATE_CHALLENGE_DRAFT_KEY).then(() => router.back());
            }}
            accessibilityRole="button"
            accessibilityLabel="Discard draft"
          >
            <Text style={styles.draftExitDangerTxt}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.draftExitSecondary}
            onPress={() => {
              onClose();
              void onSaveDraft();
            }}
            accessibilityRole="button"
            accessibilityLabel="Save draft"
          >
            <Text style={styles.draftExitSecondaryTxt}>Save draft</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
