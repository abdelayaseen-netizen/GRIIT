/**
 * Build 92 chunk 08.3: the invite sheet (P2-14).
 * Shown after creating a challenge, on an empty leaderboard, in the duo waiting room and from
 * Invite on a challenge you're in. Nowhere else. Share is primary (system share sheet with the
 * preview); Copy link is secondary and toasts "Link copied.". The link is a short code, never
 * a griit:// UUID.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "@/components/ds/Button";
import { DS_V3 } from "@/lib/design-system";
import { copyChallengeInvite, inviteToChallenge } from "@/lib/share";
import { fetchInviteCode } from "@/lib/invite-code-fetch";
import { captureError } from "@/lib/sentry";
import {
  COPIED_RESET_MS,
  COPY_LINK_LABEL,
  INVITE_LINK_FAILED,
  INVITE_SHARE_LINE,
  INVITE_SHEET_TITLE,
  LINK_COPIED_TOAST,
  SHARE_LINK_LABEL,
  inviteDisplayLink,
  inviteSheetBody,
} from "@/lib/invite-link";

export default function InviteSheet({
  challengeId,
  challengeName,
  compact = false,
  testID,
}: {
  challengeId: string;
  challengeName: string;
  /** Empty board / waiting room: no title or body, only the preview and the buttons. */
  compact?: boolean;
  testID?: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    setFailed(false);
    fetchInviteCode(challengeId)
      .then(setCode)
      .catch((e: unknown) => {
        captureError(e, "InviteCode");
        setFailed(true);
      });
  }, [challengeId]);

  useEffect(() => {
    load();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  const onCopy = useCallback(() => {
    if (!code) return;
    void copyChallengeInvite({ id: challengeId, inviteCode: code })
      .then(() => {
        setToast(LINK_COPIED_TOAST);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), COPIED_RESET_MS);
      })
      .catch((e: unknown) => captureError(e, "InviteLinkCopy"));
  }, [challengeId, code]);

  const onShare = useCallback(() => {
    if (!code) return;
    void inviteToChallenge({ id: challengeId, name: challengeName, inviteCode: code }).catch((e: unknown) =>
      captureError(e, "InviteLinkShare"),
    );
  }, [challengeId, challengeName, code]);

  return (
    <View style={styles.wrap} testID={testID ?? "invite-sheet"}>
      {compact ? null : (
        <>
          <Text style={styles.title} accessibilityRole="header">
            {INVITE_SHEET_TITLE}
          </Text>
          <Text style={styles.body}>{inviteSheetBody(challengeName)}</Text>
        </>
      )}
      <View style={styles.preview} accessibilityLabel={`Preview: ${challengeName}. ${INVITE_SHARE_LINE}`}>
        <Text style={styles.previewName} numberOfLines={1}>
          {challengeName}
        </Text>
        <Text style={styles.previewLine}>{INVITE_SHARE_LINE}</Text>
        {code ? (
          <Text style={styles.link} numberOfLines={1} testID="invite-link-text">
            {inviteDisplayLink(code)}
          </Text>
        ) : failed ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={load} hitSlop={8}>
            <Text style={styles.failed}>{INVITE_LINK_FAILED}</Text>
          </Pressable>
        ) : (
          <ActivityIndicator size="small" color={DS_V3.color.textSecondary} />
        )}
      </View>
      <View style={styles.actions}>
        <Button label={SHARE_LINK_LABEL} onPress={onShare} disabled={!code} testID="invite-link-share" />
        <Button
          label={COPY_LINK_LABEL}
          variant="secondary"
          onPress={onCopy}
          disabled={!code}
          testID="invite-link-copy"
        />
      </View>
      {toast ? (
        <Text style={styles.toast} accessibilityLiveRegion="polite" testID="invite-link-toast">
          {toast}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: DS_V3.space.sm,
  },
  title: {
    fontSize: DS_V3.type.title.fontSize,
    lineHeight: DS_V3.type.title.lineHeight,
    fontWeight: DS_V3.type.title.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  body: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  preview: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    padding: DS_V3.space.md,
    gap: DS_V3.space.xs,
    minHeight: 96,
  },
  previewName: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: "700",
    color: DS_V3.color.textPrimary,
  },
  previewLine: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  link: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  failed: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textDecorationLine: "underline",
    minHeight: 44,
  },
  actions: {
    gap: DS_V3.space.sm,
  },
  toast: {
    textAlign: "center",
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
