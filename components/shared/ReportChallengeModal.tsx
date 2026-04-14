import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Platform } from "react-native";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { captureError } from "@/lib/sentry";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or low quality" },
  { value: "harassment", label: "Harassment or hate" },
  { value: "dangerous", label: "Dangerous or harmful" },
  { value: "off_topic", label: "Not about discipline" },
  { value: "other", label: "Other" },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]["value"];

type Props = {
  visible: boolean;
  challengeId: string | null;
  challengeTitle?: string;
  onClose: () => void;
};

export function ReportChallengeModal({ visible, challengeId, challengeTitle, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setReason(null);
    setDetails("");
    setError(null);
    setSubmitted(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!challengeId || !reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await trpcMutate(TRPC.reports.create, {
        challengeId,
        reason,
        details: details.trim() || undefined,
      });
      setSubmitted(true);
      setTimeout(handleClose, 1500);
    } catch (err) {
      captureError(err, "ReportChallengeModal.submit");
      const msg = err instanceof Error ? err.message : "Could not submit your report.";
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.backdrop}>
        <View style={s.sheet}>
          {submitted ? (
            <>
              <Text style={s.title}>Report submitted</Text>
              <Text style={s.body}>Thanks for flagging this. Our team will review it.</Text>
            </>
          ) : (
            <>
              <Text style={s.title}>Report this challenge</Text>
              {challengeTitle ? <Text style={s.subtitle}>"{challengeTitle}"</Text> : null}
              <Text style={s.label}>Why are you reporting it?</Text>
              {REPORT_REASONS.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[s.reasonRow, reason === r.value && s.reasonRowSelected]}
                  onPress={() => setReason(r.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: reason === r.value }}
                  accessibilityLabel={r.label}
                >
                  <View style={[s.radio, reason === r.value && s.radioSelected]} />
                  <Text style={s.reasonText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={s.label}>Additional details (optional)</Text>
              <TextInput
                style={s.input}
                value={details}
                onChangeText={setDetails}
                placeholder="Tell us more..."
                placeholderTextColor={DS_COLORS.TEXT_MUTED}
                maxLength={500}
                multiline
                numberOfLines={3}
              />
              {error ? <Text style={s.error}>{error}</Text> : null}
              <View style={s.buttons}>
                <TouchableOpacity style={s.cancelBtn} onPress={handleClose} disabled={submitting} accessibilityRole="button">
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.submitBtn, (!reason || submitting) && s.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!reason || submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Submit report"
                >
                  <Text style={s.submitBtnText}>{submitting ? "Sending..." : "Submit report"}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.MODAL_BACKDROP,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS.WHITE,
    borderTopLeftRadius: DS_RADIUS.LG,
    borderTopRightRadius: DS_RADIUS.LG,
    padding: DS_SPACING.xl,
    paddingBottom: Platform.OS === "ios" ? DS_SPACING.xl + 20 : DS_SPACING.xl,
  },
  title: {
    fontSize: DS_TYPOGRAPHY.SIZE_LG,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_MUTED,
    marginBottom: DS_SPACING.md,
    fontStyle: "italic",
  },
  body: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_SECONDARY,
    marginTop: DS_SPACING.sm,
  },
  label: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
    color: DS_COLORS.TEXT_PRIMARY,
    marginTop: DS_SPACING.md,
    marginBottom: DS_SPACING.sm,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: DS_SPACING.sm,
    borderRadius: DS_RADIUS.SM,
  },
  reasonRowSelected: {
    backgroundColor: DS_COLORS.ACCENT_TINT,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: DS_COLORS.BORDER,
    marginRight: DS_SPACING.sm,
  },
  radioSelected: {
    borderColor: DS_COLORS.ACCENT,
    backgroundColor: DS_COLORS.ACCENT,
  },
  reasonText: {
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  input: {
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    borderRadius: DS_RADIUS.SM,
    padding: DS_SPACING.sm,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    color: DS_COLORS.TEXT_PRIMARY,
    minHeight: 70,
    textAlignVertical: "top",
  },
  error: {
    color: DS_COLORS.DISCOVER_CORAL,
    fontSize: DS_TYPOGRAPHY.SIZE_XS,
    marginTop: DS_SPACING.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: DS_SPACING.sm,
    marginTop: DS_SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    backgroundColor: DS_COLORS.BG_PAGE,
  },
  cancelBtnText: {
    color: DS_COLORS.TEXT_PRIMARY,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_SEMIBOLD,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: DS_RADIUS.button,
    alignItems: "center",
    backgroundColor: DS_COLORS.ACCENT,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: DS_COLORS.WHITE,
    fontSize: DS_TYPOGRAPHY.SIZE_SM,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
  },
});
