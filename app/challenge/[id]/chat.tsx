import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  Send,
  Check,
  Info,
  ChevronLeft,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { FLAGS } from "@/lib/feature-flags";
import { ROUTES } from "@/lib/routes";
import { DS_COLORS } from "@/lib/design-system";
import { ChatMessage } from "@/types";

const REACTION_EMOJIS = ["🔥", "⚡", "🙌", "💯", "❤️"];

export default function ChallengeChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    challenges,
    getChallengeRoom,
    getChatMessages,
    sendChatMessage,
    toggleMessageReaction,
    isChallengeMember,
    currentUser,
    activeUserChallenge,
  } = useApp();

  type ChallengeWithChat = { id: string; roomId?: string; title?: string; participantsCount?: number };
  const challenge = (challenges as ChallengeWithChat[]).find((c) => c.id === id);
  const room = getChallengeRoom(id || "") as { roomId?: string } | null;
  const messages = getChatMessages(room?.roomId || "") as import("@/types").ChatMessage[];
  const canSend = isChallengeMember(id || "");

  const [composerText, setComposerText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!FLAGS.CHAT_ENABLED && id) {
      router.replace(ROUTES.CHALLENGE_ID(id) as never);
      return;
    }
  }, [id, router]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!composerText.trim() || !room || !canSend) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendChatMessage({
      roomId: room.roomId,
      challengeId: id || "",
      type: "text",
      text: composerText.trim(),
    });
    setComposerText("");
  }, [composerText, room, canSend, id, sendChatMessage]);

  const handleQuickCheckIn = useCallback(() => {
    if (!room || !canSend || !activeUserChallenge) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    sendChatMessage({
      roomId: room.roomId,
      challengeId: id || "",
      type: "checkin",
      dayIndex: activeUserChallenge.currentDayIndex,
    });
  }, [room, canSend, id, activeUserChallenge, sendChatMessage]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleMessageReaction(messageId, emoji);
    setSelectedMessageId(null);
  }, [toggleMessageReaction]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  }, []);

  const formatRelativeTime = useCallback(
    (dateString: string) => {
      const { text, isDayOrMore } = formatTimeAgo(dateString);
      if (isDayOrMore) return formatTime(dateString);
      return text === "now" ? "now" : `${text} ago`;
    },
    [formatTime]
  );

  const renderMessage = useCallback(({ item: msg }: { item: ChatMessage }) => {
    const isOwnMessage = msg.senderId === currentUser.id;
    const isSystem = msg.type === "system";
    const isCheckin = msg.type === "checkin";
    const isProof = msg.type === "proof";
    const showReactions = selectedMessageId === msg.id;

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{msg.text}</Text>
        </View>
      );
    }

    if (isCheckin) {
      return (
        <TouchableOpacity
          style={styles.checkinPill}
          onLongPress={() => setSelectedMessageId(msg.id)}
          accessibilityRole="button"
          accessibilityLabel={`${msg.senderName} check-in, day ${msg.dayIndex}. Long press for reactions.`}
        >
          <Check size={14} color={DS_COLORS.success} />
          <Text style={styles.checkinText}>
            {msg.senderName} checked in (Day {msg.dayIndex})
          </Text>
          <Text style={styles.checkinTime}>{formatRelativeTime(msg.createdAt)}</Text>
          {Object.keys(msg.reactions).length > 0 && (
            <View style={styles.reactionBadge}>
              {Object.entries(msg.reactions).map(([emoji, count]) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionItem}
                  onPress={() => handleReaction(msg.id, emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`React with ${emoji}`}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.messageRow, isOwnMessage && styles.messageRowOwn]}>
        {!isOwnMessage && (
          msg.senderAvatarUrl ? (
            <Image
              source={{ uri: msg.senderAvatarUrl }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>{msg.senderName?.charAt(0)?.toUpperCase() ?? "?"}</Text>
            </View>
          )
        )}
        <View style={[styles.messageBubble, isOwnMessage && styles.messageBubbleOwn]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{msg.senderName}</Text>
          )}

          {isProof && msg.mediaUrl && (
            <Image
              source={{ uri: msg.mediaUrl }}
              style={styles.proofImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          )}

          {msg.text && (
            <Text style={[styles.messageText, isOwnMessage && styles.messageTextOwn]}>
              {msg.text}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwnMessage && styles.messageTimeOwn]}>
              {formatRelativeTime(msg.createdAt)}
            </Text>
          </View>

          {Object.keys(msg.reactions).length > 0 && (
            <View style={styles.reactionsRow}>
              {Object.entries(msg.reactions).map(([emoji, count]) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionChip}
                  onPress={() => handleReaction(msg.id, emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`React with ${emoji}`}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.messageOverlay}
            onLongPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              setSelectedMessageId(msg.id);
            }}
            accessibilityRole="button"
            accessibilityLabel="Message options. Long press to add a reaction."
          />

          {showReactions && (
            <View style={styles.reactionPicker}>
              {REACTION_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionPickerItem}
                  onPress={() => handleReaction(msg.id, emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add reaction ${emoji}`}
                >
                  <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [currentUser, selectedMessageId, handleReaction, formatRelativeTime]);

  if (!FLAGS.CHAT_ENABLED) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.chatDisabledWrap}>
          <TouchableOpacity
            style={styles.chatDisabledBack}
            onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
            <Text style={styles.chatDisabledBackText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.chatDisabledTitle}>Chat not available</Text>
          <Text style={styles.chatDisabledSub}>
            Challenge chat is coming soon. Use the challenge to track tasks and progress.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!challenge || !room) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chat not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText} numberOfLines={1}>
                {challenge?.title ?? "Chat"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {(challenge?.participantsCount ?? 0).toLocaleString()} members
              </Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push(ROUTES.CHAT_INFO(id) as never)}
              accessibilityLabel="Chat info"
              accessibilityRole="button"
            >
              <Info size={22} color={DS_COLORS.textPrimary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_HOME as never))}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableOpacity
          style={styles.dismissOverlay}
          activeOpacity={1}
          onPress={() => setSelectedMessageId(null)}
          accessibilityLabel="Dismiss reaction picker"
          accessibilityRole="button"
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </TouchableOpacity>

        <View style={styles.composerContainer}>
          {!canSend ? (
            <View style={styles.disabledComposer}>
              <Text style={styles.disabledText}>Join the challenge to chat</Text>
            </View>
          ) : (
            <>
              <View style={styles.composerActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleQuickCheckIn} accessibilityLabel="Quick check-in" accessibilityRole="button">
                  <Check size={20} color={DS_COLORS.success} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.composerInput}
                value={composerText}
                onChangeText={setComposerText}
                placeholder="Encourage someone..."
                placeholderTextColor={DS_COLORS.textMuted}
                multiline
                maxLength={500}
                accessibilityLabel="Chat message"
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !composerText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!composerText.trim()}
                accessibilityLabel="Send message"
                accessibilityRole="button"
                accessibilityState={{ disabled: !composerText.trim() }}
              >
                <Send
                  size={20}
                  color={composerText.trim() ? DS_COLORS.white : DS_COLORS.textMuted}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  chatDisabledWrap: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  chatDisabledBack: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 32,
    gap: 4,
  },
  chatDisabledBackText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  chatDisabledTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 12,
  },
  chatDisabledSub: {
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 15,
    color: DS_COLORS.textMuted,
  },
  headerTitle: {
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
  },
  headerButton: {
    padding: 8,
  },
  dismissOverlay: {
    flex: 1,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateHeaderText: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    backgroundColor: DS_COLORS.chipFill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowOwn: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: DS_COLORS.chipFill,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: DS_COLORS.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: DS_COLORS.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    position: "relative",
  },
  messageBubbleOwn: {
    backgroundColor: DS_COLORS.accent,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: DS_COLORS.white,
  },
  proofImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: DS_COLORS.textMuted,
  },
  messageTimeOwn: {
    color: "rgba(255,255,255,0.7)",
  },
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  reactionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    color: DS_COLORS.textSecondary,
  },
  reactionPicker: {
    position: "absolute",
    top: -44,
    left: 0,
    flexDirection: "row",
    backgroundColor: DS_COLORS.surface,
    borderRadius: 20,
    padding: 6,
    gap: 2,
    shadowColor: DS_COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  reactionPickerItem: {
    padding: 6,
  },
  reactionPickerEmoji: {
    fontSize: 20,
  },
  systemMessage: {
    alignItems: "center",
    marginVertical: 12,
  },
  systemMessageText: {
    fontSize: 13,
    color: DS_COLORS.textMuted,
    backgroundColor: DS_COLORS.chipFill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
  },
  checkinPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: DS_COLORS.successSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginVertical: 8,
    flexWrap: "wrap",
  },
  checkinText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: DS_COLORS.success,
  },
  checkinTime: {
    fontSize: 11,
    color: DS_COLORS.textMuted,
  },
  reactionBadge: {
    flexDirection: "row",
    gap: 4,
    marginLeft: 4,
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: DS_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: DS_COLORS.border,
    gap: 8,
  },
  composerActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS_COLORS.successSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  composerInput: {
    flex: 1,
    backgroundColor: DS_COLORS.chipFill,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DS_COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: DS_COLORS.chipFill,
  },
  disabledComposer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  disabledText: {
    fontSize: 14,
    color: DS_COLORS.textMuted,
  },
});
