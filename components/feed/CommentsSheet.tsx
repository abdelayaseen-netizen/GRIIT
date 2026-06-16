import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import {
  DS_COLORS,
  DS_COLORS_V2,
  DS_RADIUS,
  DS_RADIUS_V2,
  DS_TYPOGRAPHY,
} from "@/lib/design-system";
import { CommentThread } from "./CommentThread";

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onCountChange?: (n: number) => void;
};

export function CommentsSheet({ visible, eventId, onClose, onCountChange }: Props) {
  const [total, setTotal] = useState(0);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss comments"
        />
        <View style={styles.sheet}>
          <Pressable
            onPress={handleClose}
            style={styles.handleHit}
            accessibilityRole="button"
            accessibilityLabel="Drag to dismiss"
          >
            <View style={styles.handle} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Comments {total > 0 ? total : ""}</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close comments"
            >
              <X size={20} color={DS_COLORS_V2.text.secondary} />
            </Pressable>
          </View>

          <CommentThread
            eventId={eventId}
            enabled={visible}
            autoFocus
            onCountChange={onCountChange}
            onTotalChange={setTotal}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: DS_COLORS.OVERLAY_BLACK_40,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: DS_COLORS_V2.surface.card,
    borderTopLeftRadius: DS_RADIUS_V2.xl,
    borderTopRightRadius: DS_RADIUS_V2.xl,
    maxHeight: "85%",
    minHeight: 280,
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
  },
  handleHit: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: DS_RADIUS.PILL,
    backgroundColor: DS_COLORS_V2.surface.divider,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DS_COLORS_V2.surface.divider,
  },
  title: {
    fontSize: 16,
    fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
    color: DS_COLORS_V2.text.primary,
  },
});
