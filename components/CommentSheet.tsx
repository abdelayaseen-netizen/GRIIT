import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { X, Send } from "lucide-react-native";
import { DS_COLORS, DS_RADIUS, DS_SPACING, DS_TYPOGRAPHY } from "@/lib/design-system";
import { relativeTime } from "@/lib/utils/relativeTime";

export type FeedComment = {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  display_name: string;
};

type Props = {
  visible: boolean;
  postTitle: string;
  comments: FeedComment[];
  loading: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
};

export default function CommentSheet({
  visible,
  postTitle,
  comments,
  loading,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const [text, setText] = useState("");
  const disabled = submitting || !text.trim();

  const sorted = useMemo(
    () => comments.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [comments]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close comments" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close comments">
              <X size={18} color={DS_COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{postTitle}</Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={DS_COLORS.ACCENT} />
            </View>
          ) : (
            <FlatList
              data={sorted}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.commentName}>{item.display_name}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <Text style={styles.commentTime}>{relativeTime(item.created_at)}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.empty}>No comments yet.</Text>}
            />
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Write a comment..."
              placeholderTextColor={DS_COLORS.TEXT_MUTED}
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.send, disabled && styles.sendDisabled]}
              disabled={disabled}
              onPress={async () => {
                const next = text.trim();
                if (!next) return;
                await onSubmit(next);
                setText("");
              }}
              accessibilityRole="button"
              accessibilityLabel="Send comment"
            >
              <Send size={14} color={DS_COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: DS_COLORS.modalBackdrop },
  sheet: {
    backgroundColor: DS_COLORS.surface,
    borderTopLeftRadius: DS_RADIUS.modal,
    borderTopRightRadius: DS_RADIUS.modal,
    maxHeight: "80%",
    padding: DS_SPACING.lg,
    gap: DS_SPACING.sm,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...DS_TYPOGRAPHY.cardTitle, color: DS_COLORS.TEXT_PRIMARY },
  subtitle: { ...DS_TYPOGRAPHY.secondary, color: DS_COLORS.TEXT_SECONDARY },
  center: { paddingVertical: 24, alignItems: "center" },
  listContent: { paddingVertical: DS_SPACING.sm },
  commentRow: {
    paddingVertical: DS_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.BORDER,
  },
  commentName: { ...DS_TYPOGRAPHY.metadata, color: DS_COLORS.TEXT_PRIMARY },
  commentText: { ...DS_TYPOGRAPHY.bodySmall, color: DS_COLORS.TEXT_PRIMARY },
  commentTime: { ...DS_TYPOGRAPHY.eyebrow, color: DS_COLORS.TEXT_MUTED, marginTop: 2 },
  empty: { ...DS_TYPOGRAPHY.bodySmall, color: DS_COLORS.TEXT_SECONDARY, paddingVertical: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: DS_SPACING.sm, paddingTop: DS_SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: DS_COLORS.BG_PAGE,
    borderRadius: DS_RADIUS.input,
    borderWidth: 1,
    borderColor: DS_COLORS.BORDER,
    paddingHorizontal: DS_SPACING.md,
    paddingVertical: DS_SPACING.sm,
    color: DS_COLORS.TEXT_PRIMARY,
  },
  send: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: DS_COLORS.ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { backgroundColor: DS_COLORS.DISABLED_BG },
});
