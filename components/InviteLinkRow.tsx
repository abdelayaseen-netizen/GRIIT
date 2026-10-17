/**
 * Build 90 chunk 08.1: the invite link as text, with Copy and Share.
 * Used on create-success, Day secured (first secured day), the challenge board's
 * "A board needs two" state and the duo waiting room.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { copyChallengeInvite, inviteToChallenge } from "@/lib/share";
import { captureError } from "@/lib/sentry";
import {
  COPIED_LABEL,
  COPIED_RESET_MS,
  COPY_LINK_LABEL,
  INVITE_LINK_LABEL,
  SHARE_LINK_LABEL,
  inviteLinkFor,
} from "@/lib/invite-link";

export default function InviteLinkRow({
  challengeId,
  challengeName,
  refUserId,
  testID,
}: {
  challengeId: string;
  challengeName: string;
  refUserId?: string | null;
  testID?: string;
}) {
  const link = inviteLinkFor(challengeId, refUserId);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = useCallback(() => {
    void copyChallengeInvite({ id: challengeId }, refUserId)
      .then(() => {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      })
      .catch((e: unknown) => captureError(e, "InviteLinkCopy"));
  }, [challengeId, refUserId]);

  const onShare = useCallback(() => {
    void inviteToChallenge({ id: challengeId, name: challengeName }, refUserId).catch((e: unknown) =>
      captureError(e, "InviteLinkShare"),
    );
  }, [challengeId, challengeName, refUserId]);

  return (
    <View style={styles.wrap} testID={testID ?? "invite-link-row"}>
      <Text style={styles.label}>{INVITE_LINK_LABEL}</Text>
      <Text style={styles.link} selectable numberOfLines={2} accessibilityLabel={`${INVITE_LINK_LABEL} ${link}`}>
        {link}
      </Text>
      <View style={styles.actions}>
        <Button
          label={copied ? COPIED_LABEL : COPY_LINK_LABEL}
          variant="secondary"
          size="small"
          onPress={onCopy}
          testID="invite-link-copy"
        />
        <Button label={SHARE_LINK_LABEL} variant="secondary" size="small" onPress={onShare} testID="invite-link-share" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.md,
    gap: DS_V3.space.xs,
  },
  label: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  link: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: DS_V3.space.sm,
    marginTop: DS_V3.space.xs,
  },
});
