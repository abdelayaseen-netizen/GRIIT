/**
 * PersonCard — 01_components.md "PersonCard", frame 02.
 * Screen component. ds primitives only. No card chrome.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Button from "@/components/ds/Button";

export type SuggestedPerson = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  current_streak: number;
  is_private: boolean;
  mutuals_count?: number | null;
};

export type PersonCardProps = {
  name: string;
  uri?: string | null;
  status: string;
  followLabel: string;
  followDisabled?: boolean;
  followPending?: boolean;
  onFollow?: () => void;
  onPress?: () => void;
};

const CELL = DS_V3.space.gutter * 7;

export default function PersonCard({
  name,
  uri,
  status,
  followLabel,
  followDisabled,
  followPending,
  onFollow,
  onPress,
}: PersonCardProps) {
  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        onPress={onPress}
        style={styles.body}
      >
        <Avatar size={DS_V3.size.avatar.md} uri={uri} displayName={name} />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.status}>{status}</Text>
      </Pressable>
      <Button
        label={followLabel}
        variant="secondary"
        size="small"
        disabled={followDisabled}
        submitting={followPending}
        onPress={onFollow}
        accessibilityLabel={`${followLabel} ${name}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL,
    gap: DS_V3.space.sm,
    alignItems: "center",
  },
  body: {
    width: "100%",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  name: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  status: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    textAlign: "center",
  },
});
