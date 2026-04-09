import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS_COLORS } from "@/lib/design-system";
import { styles } from "@/components/create/wizard-styles";

type WizardStepFooterProps = {
  step: number;
  insetsBottom: number;
  isValidChallengeName: boolean;
  submitting: boolean;
  title: string;
  onBack: () => void;
  onNext1: () => void;
  onNext2: () => void;
  onNext3: () => void;
  onBackFromReview: () => void;
  onOpenCommit: () => void;
  onSaveDraft: () => void;
};

export function WizardStepFooter({
  step,
  insetsBottom,
  isValidChallengeName,
  submitting,
  title,
  onBack,
  onNext1,
  onNext2,
  onNext3,
  onBackFromReview,
  onOpenCommit,
  onSaveDraft,
}: WizardStepFooterProps) {
  return (
    <View style={[styles.footer, { paddingBottom: insetsBottom + 12 }]}>
      {step > 1 && step < 4 && (
        <TouchableOpacity
          style={styles.backOut}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous step"
        >
          <Text style={styles.backOutTxt}>Back</Text>
        </TouchableOpacity>
      )}
      {step === 1 && (
        <TouchableOpacity
          style={[styles.primary, !isValidChallengeName && styles.primaryDisabled]}
          onPress={onNext1}
          activeOpacity={0.9}
          disabled={!isValidChallengeName}
          accessibilityRole="button"
          accessibilityLabel="Continue to daily tasks step"
          accessibilityState={{ disabled: !isValidChallengeName }}
        >
          <Text style={[styles.primaryTxt, !isValidChallengeName && styles.primaryTxtDisabled]}>Next: daily tasks</Text>
        </TouchableOpacity>
      )}
      {step === 2 && (
        <TouchableOpacity
          style={styles.primary}
          onPress={onNext2}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Continue to challenge rules step"
        >
          <Text style={styles.primaryTxt}>Next: rules</Text>
        </TouchableOpacity>
      )}
      {step === 3 && (
        <TouchableOpacity
          style={styles.primary}
          onPress={onNext3}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Continue to review and launch step"
        >
          <Text style={styles.primaryTxt}>Review & launch</Text>
        </TouchableOpacity>
      )}
      {step === 4 && (
        <>
          <View style={styles.rowFooter}>
            <TouchableOpacity
              style={styles.backOut}
              onPress={onBackFromReview}
              accessibilityRole="button"
              accessibilityLabel="Go back to rules"
            >
              <Text style={styles.backOutTxt}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.launch, submitting && { opacity: 0.6 }]}
              disabled={submitting}
              onPress={onOpenCommit}
              accessibilityRole="button"
              accessibilityLabel={`Launch ${title.trim() || "challenge"}`}
              accessibilityState={{ disabled: submitting }}
            >
              <Text style={styles.launchTxt}>{submitting ? "Launching…" : "Launch challenge"}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onSaveDraft}
            disabled={submitting}
            accessibilityLabel="Save as draft"
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            style={[styles.saveDraftBtn, submitting && styles.saveDraftBtnDisabled]}
          >
            <Ionicons name="bookmark-outline" size={16} color={DS_COLORS.TEXT_SECONDARY} />
            <Text style={styles.saveDraftText}>Save as draft</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
