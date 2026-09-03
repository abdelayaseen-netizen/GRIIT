import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { shareInvite } from "@/lib/share";
import { captureError } from "@/lib/sentry";
import { OBV2_COLOR } from "../theme";
import { PrimaryButton, TextLink } from "../ui";

/**
 * TODO(contacts): handoff contact rows are not built.
 * Spec: 40px initials avatar, name 15/500, note 12 mutedWarm
 * ("Already on GRIIT · Day N" vs "From your contacts"), 36px Invite/Invited
 * toggle, border #D2540A when invited. Production source is contact-permission
 * matching plus a server-side "already on GRIIT" flag. Do not invent rows.
 */
export default function InviteScreen({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const handleShare = useCallback(async () => {
    try {
      await shareInvite();
    } catch (e) {
      captureError(e, "OnboardingV2InviteShare");
    }
  }, []);

  return (
    <View style={styles.content}>
      <View style={styles.head}>
        <Text style={styles.h1}>Bring three people</Text>
        <Text style={styles.sub}>
          Members with a circle of three or more are far likelier to finish. Invite the ones who
          will actually say something.
        </Text>
      </View>

      <View style={styles.body}>
        <Pressable
          onPress={() => {
            void handleShare();
          }}
          style={styles.share}
          accessibilityRole="button"
          accessibilityLabel="Share an invite link instead"
        >
          <Text style={styles.shareText}>Share an invite link instead</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={onContinue} />
        <TextLink label="I'll build my circle later" onPress={onSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 28 },
  head: { marginTop: 6 },
  h1: { fontSize: 36, fontWeight: "500", lineHeight: 37, letterSpacing: -1.3, color: OBV2_COLOR.ink },
  sub: { fontSize: 16, fontWeight: "400", lineHeight: 24, color: OBV2_COLOR.ink2, marginTop: 12 },
  body: { flex: 1, justifyContent: "center", paddingVertical: 16 },
  share: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: OBV2_COLOR.borderDashed,
    alignItems: "center",
    justifyContent: "center",
  },
  shareText: { fontSize: 14, fontWeight: "500", color: OBV2_COLOR.ink2 },
  footer: { paddingTop: 14, paddingBottom: 32, gap: 2 },
});
