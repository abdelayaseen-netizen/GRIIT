/**
 * Frame 142 finish actions. Feed idle / held / shared; Story is Meta-id gated.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, Copy, Download, Ellipsis, Instagram } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import {
  FINISH_SHARE,
  FINISH_SHARE_HELD,
  FINISH_SHARED,
  FINISH_STORY,
  type ShareFeedState,
  finishKeepLabel,
} from "@/lib/finish-moment";

const AUX_H = 40;

export type ShareActionsProps = {
  feed: ShareFeedState;
  storyAvailable: boolean;
  disabled?: boolean;
  onFeed: () => void;
  onStory: () => void;
  onCopy: () => void;
  onSave: () => void;
  onMore: () => void;
  onKeep: () => void;
  onDone: () => void;
};

function Aux({
  Icon,
  label,
  onPress,
  disabled,
}: {
  Icon: typeof Copy;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.aux,
        disabled ? styles.auxOff : null,
        !disabled && pressed ? styles.pressed : null,
      ]}
    >
      <Icon size={18} color={DS_V3.color.textPrimary} />
      <Text style={styles.auxLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ShareActions({
  feed,
  storyAvailable,
  disabled = false,
  onFeed,
  onStory,
  onCopy,
  onSave,
  onMore,
  onKeep,
  onDone,
}: ShareActionsProps) {
  const held = feed === "held";
  const shared = feed === "shared";
  const keep = finishKeepLabel(feed);

  return (
    <View style={styles.col}>
      {shared ? (
        <View
          accessibilityRole="text"
          accessibilityState={{ disabled: true }}
          style={styles.shared}
        >
          <Check size={18} color={DS_V3.color.textPrimary} />
          <Text style={styles.sharedLabel}>{FINISH_SHARED}</Text>
        </View>
      ) : (
        <Button
          label={held ? FINISH_SHARE_HELD : FINISH_SHARE}
          fill
          singleLine
          disabled={disabled || held}
          onPress={disabled || held ? undefined : onFeed}
        />
      )}
      {storyAvailable ? (
        <Button
          label={FINISH_STORY}
          variant="secondary"
          fill
          singleLine
          disabled={disabled}
          onPress={disabled ? undefined : onStory}
          icon={<Instagram size={18} color={DS_V3.color.textPrimary} />}
        />
      ) : null}
      <View style={styles.auxRow}>
        <Aux Icon={Copy} label="Copy" onPress={onCopy} disabled={disabled} />
        <Aux Icon={Download} label="Save" onPress={onSave} disabled={disabled} />
        <Aux Icon={Ellipsis} label="More" onPress={onMore} disabled={disabled} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={keep}
        onPress={shared ? onDone : onKeep}
        style={({ pressed }) => [styles.keep, pressed ? styles.pressed : null]}
      >
        <Text style={styles.keepLabel}>{keep}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 8 },
  shared: {
    height: DS_V3.size.button,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sharedLabel: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textPrimary },
  auxRow: { flexDirection: "row", gap: 8 },
  aux: {
    flex: 1,
    height: AUX_H,
    borderRadius: DS_V3.radius.pill,
    backgroundColor: DS_V3.color.surface,
    borderWidth: 1,
    borderColor: DS_V3.color.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  auxOff: { opacity: 0.5 },
  auxLabel: { ...DS_V3.type.secondary, fontWeight: "500", color: DS_V3.color.textPrimary },
  keep: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  keepLabel: { ...DS_V3.type.bodyStrong, color: DS_V3.color.textSecondary },
  pressed: { opacity: 0.8 },
});
