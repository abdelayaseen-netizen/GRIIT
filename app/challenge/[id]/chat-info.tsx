import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Bell,
  BellOff,
  AtSign,
  Shield,
  AlertCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import { DS_COLORS } from "@/lib/design-system";

const MOCK_MEMBER_INITIALS = ["S", "M", "J", "A", "K", "D"];

export default function ChallengeChatInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    challenges,
    getChallengeRoom,
    chatRoomSettings,
    updateChatRoomSettings,
  } = useApp();

  type ChallengeWithChat = { id: string; roomId?: string; title?: string; themeColor?: string; participantsCount?: number; participants_count?: number; activeTodayCount?: number };
  const challenge = (challenges as ChallengeWithChat[]).find((c) => c.id === id);
  const room = getChallengeRoom(id || "") as { roomId?: string } | null;
  const settings = chatRoomSettings[room?.roomId || ""] || {
    muteRoom: false,
    mentionsOnly: false,
  };

  const handleToggleMute = () => {
    if (!room) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateChatRoomSettings(room.roomId!, { muteRoom: !settings.muteRoom });
  };

  const handleToggleMentions = () => {
    if (!room) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateChatRoomSettings(room.roomId!, { mentionsOnly: !settings.mentionsOnly });
  };

  const handleReport = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Report an issue",
      "Describe what’s wrong (e.g. spam, harassment, off-topic). We’ll review it shortly.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: () => {
            Alert.alert("Thanks", "We’ve received your report and will look into it.");
          },
        },
      ]
    );
  };

  if (!challenge || !room) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chat info not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Chat Info",
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={DS_COLORS.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeIcon, { backgroundColor: challenge.themeColor || DS_COLORS.accent }]}>
            <Text style={styles.challengeIconText}>
              {(challenge.title ?? "?").charAt(0)}
            </Text>
          </View>
          <Text style={styles.challengeTitle}>{challenge.title ?? "Challenge"}</Text>
          <Text style={styles.challengeSubtitle}>
            {(challenge.participantsCount ?? challenge.participants_count ?? 0).toLocaleString()} members
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={DS_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Room Rules</Text>
          </View>
          <View style={styles.rulesCard}>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>Be respectful. No harassment.</Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>No spam or self-promo.</Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>Keep it challenge-related.</Text>
            </View>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet} />
              <Text style={styles.ruleText}>Report anything weird.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={18} color={DS_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Members</Text>
            <Text style={styles.sectionCount}>
              {(challenge.participantsCount ?? challenge.participants_count ?? 0).toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.membersCard}>
            <View style={styles.avatarStack}>
              {MOCK_MEMBER_INITIALS.slice(0, 5).map((initial, index) => (
                <View key={index} style={[styles.stackAvatar, { marginLeft: index > 0 ? -10 : 0, zIndex: 5 - index }]}>
                  <InitialCircle username={initial} size={36} />
                </View>
              ))}
              <View style={[styles.stackAvatar, styles.moreAvatar, { marginLeft: -10 }]}>
                <Text style={styles.moreAvatarText}>+{Math.max(0, (challenge.participantsCount ?? challenge.participants_count ?? 0) - 5)}</Text>
              </View>
            </View>
            <View style={styles.membersText}>
              <Text style={styles.membersTitle}>View all members</Text>
              <Text style={styles.membersSubtitle}>
                {challenge.activeTodayCount?.toLocaleString() || 0} active today
              </Text>
            </View>
            <ChevronRight size={20} color={DS_COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={18} color={DS_COLORS.textSecondary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <BellOff size={20} color={DS_COLORS.textSecondary} />
                <View>
                  <Text style={styles.settingTitle}>Mute chat</Text>
                  <Text style={styles.settingSubtitle}>
                    Turn off all notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.muteRoom}
                onValueChange={handleToggleMute}
                trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
                thumbColor={DS_COLORS.white}
              />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <AtSign size={20} color={DS_COLORS.textSecondary} />
                <View>
                  <Text style={styles.settingTitle}>Mentions only</Text>
                  <Text style={styles.settingSubtitle}>
                    Only notify when mentioned
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.mentionsOnly}
                onValueChange={handleToggleMentions}
                trackColor={{ false: DS_COLORS.border, true: DS_COLORS.accent }}
                thumbColor={DS_COLORS.white}
                disabled={settings.muteRoom}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReport} activeOpacity={0.7}>
          <AlertCircle size={18} color={DS_COLORS.warning} />
          <Text style={styles.reportText}>Report an issue</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  content: {
    padding: 20,
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
  headerButton: {
    padding: 8,
  },
  challengeHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  challengeIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeIconText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: DS_COLORS.white,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 4,
  },
  challengeSubtitle: {
    fontSize: 14,
    color: DS_COLORS.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: DS_COLORS.textMuted,
  },
  rulesCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  ruleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DS_COLORS.textMuted,
    marginTop: 6,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: DS_COLORS.textSecondary,
    lineHeight: 20,
  },
  membersCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  avatarStack: {
    flexDirection: "row",
  },
  stackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: DS_COLORS.surface,
  },
  moreAvatar: {
    backgroundColor: DS_COLORS.chipFill,
    justifyContent: "center",
    alignItems: "center",
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: DS_COLORS.textSecondary,
  },
  membersText: {
    flex: 1,
  },
  membersTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: DS_COLORS.textPrimary,
  },
  membersSubtitle: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: DS_COLORS.surface,
    borderRadius: 16,
    padding: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: DS_COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: DS_COLORS.textMuted,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: DS_COLORS.border,
    marginHorizontal: 12,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  reportText: {
    fontSize: 14,
    color: DS_COLORS.warning,
    fontWeight: "500" as const,
  },
});
