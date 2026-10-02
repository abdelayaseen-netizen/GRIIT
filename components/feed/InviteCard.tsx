import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import { inviteCardCopy } from "@/lib/g2b-home";

export default function InviteCard({
  challenge,
  onInvite,
}: {
  challenge: string;
  onInvite: () => void;
}) {
  const copy = inviteCardCopy(challenge);
  return (
    <View style={styles.card} accessibilityLabel={copy.heading}>
      <Text style={styles.heading}>{copy.heading}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      <Button label={copy.cta} variant="secondary" onPress={onInvite} />
    </View>
  );
}

const PT = DS_V3.space.xs / 4;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: DS_V3.space.gutter,
    marginTop: DS_V3.space.lg,
    padding: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
    borderWidth: PT,
    borderColor: DS_V3.color.border,
    borderRadius: DS_V3.radius.card,
  },
  heading: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  body: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.secondary.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
