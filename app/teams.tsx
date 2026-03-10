import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ChevronLeft, Users, Copy, LogOut, Send, Crown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { designTokens } from "@/lib/design-tokens";
import Colors from "@/constants/colors";

type TeamTab = "roster" | "chat";

const MOCK_TEAM = {
  name: "My Squad",
  memberCount: 3,
  streak: 5,
  securedToday: 2,
  totalMembers: 3,
  userSecuredToday: false,
  inviteCode: "ABC123",
  members: [
    { id: "1", name: "You", isAdmin: true, streak: 5, points: 120, securedToday: false },
    { id: "2", name: "Alex", isAdmin: false, streak: 3, points: 80, securedToday: true },
    { id: "3", name: "Sam", isAdmin: false, streak: 2, points: 45, securedToday: true },
  ],
  systemMessages: [
    { id: "s1", text: "Team 'My Squad' created. Share code: ABC123" },
    { id: "s2", text: "You secured today for the team." },
  ],
};

export default function TeamsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [teamTab, setTeamTab] = useState<TeamTab>("roster");
  const [chatMessage, setChatMessage] = useState("");
  const hasTeam = false;
  const team = hasTeam ? MOCK_TEAM : null;

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCreateTeam = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = () => {
    if (!teamName.trim()) return;
    setCreateModalVisible(false);
    setTeamName("");
  };

  if (hasTeam && team) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Teams</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setInviteModalVisible(true)} style={styles.headerIconBtn} hitSlop={8} accessibilityLabel="Copy invite code" accessibilityRole="button">
                <Copy size={22} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLeaveModalVisible(true)} style={styles.headerIconBtn} hitSlop={8} accessibilityLabel="Leave team" accessibilityRole="button">
                <LogOut size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.teamName, { color: colors.text.primary }]}>{team.name}</Text>
            <Text style={[styles.teamMeta, { color: colors.text.muted }]}>
              👥 {team.memberCount} members · 🔥 {team.streak} day streak
            </Text>

            <View style={[styles.progressCard, { backgroundColor: colors.card }, designTokens.cardShadow]}>
              <View style={styles.progressCardHeader}>
                <Text style={[styles.progressCardTitle, { color: colors.text.primary }]}>Team Progress Today</Text>
                <Text style={[styles.progressCardMeta, { color: colors.text.muted }]}>
                  {team.securedToday}/{team.totalMembers} secured
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${(team.securedToday / team.totalMembers) * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              {team.userSecuredToday ? (
                <Text style={[styles.securedTodayText, { color: colors.success }]}>✅ You secured today</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.secureForTeamBtn, { backgroundColor: colors.accent }]}
                  onPress={() => {}}
                  activeOpacity={0.85}
                  accessibilityLabel="Secure for team"
                  accessibilityRole="button"
                >
                  <Text style={styles.secureForTeamBtnText}>🛡 Secure for Team</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabPill, teamTab === "roster" && { backgroundColor: colors.text.primary }]}
                onPress={() => setTeamTab("roster")}
                activeOpacity={0.8}
                accessibilityLabel="Roster"
                accessibilityRole="button"
              >
                <Text style={[styles.tabPillText, teamTab === "roster" && styles.tabPillTextActive]}>Roster</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabPill, teamTab === "chat" && { backgroundColor: colors.text.primary }]}
                onPress={() => setTeamTab("chat")}
                activeOpacity={0.8}
                accessibilityLabel="Chat"
                accessibilityRole="button"
              >
                <Text style={[styles.tabPillText, teamTab === "chat" && styles.tabPillTextActive]}>Chat</Text>
              </TouchableOpacity>
            </View>

            {teamTab === "roster" && (
              <View style={[styles.rosterCard, { backgroundColor: colors.card }, designTokens.cardShadow]}>
                <FlatList
                  data={team.members}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  ItemSeparatorComponent={() => <View style={[styles.rosterDivider, { backgroundColor: colors.border }]} />}
                  renderItem={({ item: m }) => (
                    <View style={styles.rosterRow}>
                      <View style={[styles.rosterAvatar, { backgroundColor: colors.pill }]}>
                        <Text style={[styles.rosterAvatarText, { color: colors.text.primary }]}>{m.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.rosterInfo}>
                        <View style={styles.rosterNameRow}>
                          <Text style={[styles.rosterName, { color: colors.text.primary }]}>{m.name}</Text>
                          {m.isAdmin && <Crown size={14} color={colors.accent} style={{ marginLeft: 4 }} />}
                        </View>
                        <Text style={[styles.rosterMeta, { color: colors.text.muted }]}>🔥 {m.streak} · {m.points} pts</Text>
                      </View>
                      <View style={[styles.rosterDot, { backgroundColor: m.securedToday ? colors.success : colors.text.muted }]} />
                    </View>
                  )}
                />
              </View>
            )}

            {teamTab === "chat" && (
              <>
                <FlatList
                  data={team.systemMessages}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  style={styles.chatMessages}
                  renderItem={({ item: msg }) => (
                    <View style={[styles.systemMessage, { backgroundColor: colors.pill }]}>
                      <Text style={[styles.systemMessageText, { color: colors.text.muted }]}>{msg.text}</Text>
                    </View>
                  )}
                />
                <View style={[styles.chatInputRow, { borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.chatInput, { backgroundColor: colors.background, color: colors.text.primary }]}
                    placeholder="Message your team..."
                    placeholderTextColor={colors.text.muted}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    onPress={() => setChatMessage("")}
                    style={styles.chatSendBtn}
                    disabled={!chatMessage.trim()}
                  >
                    <Send size={20} color={chatMessage.trim() ? colors.accent : colors.text.muted} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>

        <Modal visible={inviteModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setInviteModalVisible(false)} />
          <View style={styles.modalCenter}>
            <View style={styles.inviteModalCard}>
              <Text style={styles.inviteModalTitle}>Invite Code</Text>
              <Text style={styles.inviteModalCode}>{team.inviteCode}</Text>
              <TouchableOpacity style={styles.inviteModalOk} onPress={() => setInviteModalVisible(false)} activeOpacity={0.85} accessibilityLabel="OK" accessibilityRole="button">
                <Text style={styles.inviteModalOkText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={leaveModalVisible} transparent animationType="fade">
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLeaveModalVisible(false)} />
          <View style={styles.modalCenter}>
            <View style={styles.leaveModalCard}>
              <Text style={styles.leaveModalTitle}>Leave Team</Text>
              <Text style={styles.leaveModalSub}>Leave &apos;{team.name}&apos;?</Text>
              <View style={styles.leaveModalButtons}>
                <TouchableOpacity style={styles.leaveModalCancel} onPress={() => setLeaveModalVisible(false)} activeOpacity={0.85} accessibilityLabel="Cancel" accessibilityRole="button">
                  <Text style={styles.leaveModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.leaveModalLeave} onPress={() => setLeaveModalVisible(false)} activeOpacity={0.85} accessibilityLabel="Leave team" accessibilityRole="button">
                  <Text style={styles.leaveModalLeaveText}>Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={12} accessibilityLabel="Go back" accessibilityRole="button">
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Teams</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.emptyScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}>
            <Users size={64} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Small Groups, Big Results</Text>
          <Text style={[styles.emptySub, { color: colors.text.muted }]}>
            Teams of 5-10 have 3x higher retention. Create or join a squad to hold each other accountable.
          </Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.text.primary }]}
            onPress={handleCreateTeam}
            activeOpacity={0.85}
            accessibilityLabel="Create a team"
            accessibilityRole="button"
          >
            <Text style={styles.createBtnText}>➕ Create a Team</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.joinBtn, { borderColor: colors.border }]}
            onPress={() => {}}
            activeOpacity={0.85}
            accessibilityLabel="Join with code"
            accessibilityRole="button"
          >
            <Text style={[styles.joinBtnText, { color: colors.text.primary }]}>👥 Join with Code</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={createModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setCreateModalVisible(false)} />
        <View style={styles.modalCenter}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Create Team</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text.primary }]}
              placeholder="Team name"
              placeholderTextColor={colors.text.muted}
              value={teamName}
              onChangeText={setTeamName}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.modalSubmit, { backgroundColor: teamName.trim() ? colors.accent : colors.pill }]}
              onPress={handleCreateSubmit}
              disabled={!teamName.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSubmitText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.modalCancel}>
              <Text style={[styles.modalCancelText, { color: colors.text.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerRight: { width: 40 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyScroll: {
    flexGrow: 1,
    paddingTop: "35%",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: 32,
  },
  createBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  createBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  joinBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  joinBtnText: { fontSize: 16, fontWeight: "600" },
  teamName: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  teamMeta: { fontSize: 14, marginBottom: 16 },
  progressCard: {
    borderRadius: designTokens.cardRadius,
    padding: 16,
    marginBottom: 16,
  },
  progressCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  progressCardTitle: { fontSize: 15, fontWeight: "700" },
  progressCardMeta: { fontSize: 13 },
  progressBarTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressBarFill: { height: "100%", borderRadius: 4 },
  securedTodayText: { fontSize: 14, fontWeight: "600" },
  secureForTeamBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secureForTeamBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tabPill: {
    flex: 1,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.pill,
  },
  tabPillText: { fontSize: 14, fontWeight: "600", color: Colors.text.primary },
  tabPillTextActive: { color: "#fff" },
  rosterCard: {
    borderRadius: designTokens.cardRadius,
    padding: 0,
    overflow: "hidden",
  },
  rosterRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  rosterDivider: { height: 1, marginLeft: 14 },
  rosterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rosterAvatarText: { fontSize: 16, fontWeight: "700" },
  rosterInfo: { flex: 1 },
  rosterNameRow: { flexDirection: "row", alignItems: "center" },
  rosterName: { fontSize: 15, fontWeight: "700" },
  rosterMeta: { fontSize: 13, marginTop: 2 },
  rosterDot: { width: 12, height: 12, borderRadius: 6 },
  chatMessages: { marginBottom: 16, gap: 6 },
  systemMessage: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "90%",
  },
  systemMessageText: { fontSize: 13 },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    paddingVertical: 8,
  },
  chatSendBtn: { padding: 8 },
  inviteModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#2D2D2D",
    borderRadius: 16,
    padding: 24,
  },
  inviteModalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 16 },
  inviteModalCode: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 4,
    marginBottom: 16,
  },
  inviteModalOk: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteModalOkText: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  leaveModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#2D2D2D",
    borderRadius: 16,
    padding: 24,
  },
  leaveModalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  leaveModalSub: { fontSize: 14, color: "#fff", marginBottom: 20 },
  leaveModalButtons: { flexDirection: "row", gap: 12 },
  leaveModalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveModalCancelText: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  leaveModalLeave: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  leaveModalLeaveText: { fontSize: 16, fontWeight: "600", color: Colors.danger },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalSubmit: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalSubmitText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  modalCancel: { alignItems: "center" },
  modalCancelText: { fontSize: 15 },
});
