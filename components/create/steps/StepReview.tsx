import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { DS_COLORS, DS_RADIUS, DS_TYPOGRAPHY } from "@/lib/design-system";
import type { ChallengeVisibility } from "@/types";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import { sharePlainMessage } from "@/lib/share";
import { styles } from "@/components/create/wizard-styles";
import { getTaskIcon, getTaskMeta } from "@/components/create/wizard-shared";
import type { StepBasicsProps } from "@/components/create/steps/StepBasics";
type Who = StepBasicsProps["who"];

export interface StepReviewProps {
  title: string;
  who: Who;
  difficultyMode: "standard" | "hard";
  challengeType: import("@/types").ChallengeType;
  duration: number;
  estLabel: string;
  tasks: (TaskEditorTask & { wizardType?: string })[];
  categories: string[];
  visibility: ChallengeVisibility;
  setVisibility: (v: ChallengeVisibility) => void;
  duoInvite: string;
  setDuoInvite: (v: string) => void;
}

export function StepReview({
  title,
  who,
  difficultyMode,
  challengeType,
  duration,
  estLabel,
  tasks,
  categories,
  visibility,
  setVisibility,
  duoInvite,
  setDuoInvite,
}: StepReviewProps) {
  return (
    <>
      <Text style={styles.h1}>Ready to commit?</Text>
      <Text style={styles.sub}>Once you launch, the clock starts.</Text>
      <View
        style={{
          backgroundColor: DS_COLORS.CARD_BG,
          borderRadius: DS_RADIUS.XL,
          padding: 20,
          borderLeftWidth: 4,
          borderLeftColor: DS_COLORS.PRIMARY,
          borderWidth: 1.5,
          borderColor: DS_COLORS.BORDER_LIGHT,
          marginBottom: 20,
        }}
      >
        <View style={styles.rowBetweenStartMb8}>
          <View style={styles.flex1}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: DS_TYPOGRAPHY.WEIGHT_BOLD,
                color: DS_COLORS.TEXT_PRIMARY,
                letterSpacing: -0.3,
              }}
            >
              {title.trim() || "Untitled"}
            </Text>
            <Text style={styles.text14SecondaryMt4}>
              {who === "solo" ? "Solo" : who === "duo" ? "Duo" : "Squad"} ·{" "}
              {difficultyMode === "hard" ? "Hard mode" : "Standard"} ·{" "}
              {challengeType === "one_day" ? 1 : duration} days
            </Text>
          </View>
          <View
            style={{
              backgroundColor: DS_COLORS.ACCENT_TINT,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: DS_RADIUS.MD,
            }}
          >
            <Text style={styles.text13SemiboldPrimary}>{difficultyMode === "hard" ? "Hard" : "Standard"}</Text>
          </View>
        </View>
        <View style={styles.mt12ColGap6}>
          {Array.from({ length: Math.ceil(categories.length / 3) }, (_, rowIdx) => {
            const row = categories.slice(rowIdx * 3, rowIdx * 3 + 3);
            return (
              <View key={row.join("-")} style={styles.rowGap6}>
                {row.map((c) => (
                  <View
                    key={c}
                    style={{
                      flex: 1,
                      backgroundColor: DS_COLORS.WARM_CREAM,
                      paddingHorizontal: 14,
                      paddingVertical: 5,
                      borderRadius: DS_RADIUS.MD,
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.text13MediumSecondary}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </View>
                ))}
                {row.length < 3
                  ? Array.from({ length: 3 - row.length }, (_, i) => <View key={`sp-${i}`} style={styles.flex1} />)
                  : null}
              </View>
            );
          })}
        </View>
        <View style={styles.dividerMv16} />
        <View style={styles.rowBetweenCenter}>
          <View>
            <Text style={styles.text13Hint}>Daily commitment</Text>
            <Text style={styles.text18BoldPrimaryMt2}>{estLabel}</Text>
          </View>
          <View style={styles.itemsEnd}>
            <Text style={styles.text13Hint}>Tasks per day</Text>
            <Text style={styles.text18BoldPrimaryMt2}>{tasks.length}</Text>
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: DS_COLORS.CARD_BG,
          borderRadius: DS_RADIUS.LG,
          borderWidth: 1.5,
          borderColor: DS_COLORS.BORDER_LIGHT,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {tasks.map((task, i) => (
          <View
            key={task.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderBottomWidth: i < tasks.length - 1 ? 1 : 0,
              borderBottomColor: DS_COLORS.DIVIDER,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: DS_RADIUS.MD,
                backgroundColor: DS_COLORS.ACCENT_TINT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.text18}>{getTaskIcon(task.wizardType ?? task.type)}</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.text16SemiboldPrimary}>{task.title}</Text>
              <Text style={styles.text13HintMt2}>{getTaskMeta(task)}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 0 }]}>Who can see this?</Text>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: DS_COLORS.CARD_BG,
          borderWidth: 1.5,
          borderColor: DS_COLORS.BORDER,
          borderRadius: DS_RADIUS.button,
          overflow: "hidden",
        }}
      >
        {(
          [
            { key: "PUBLIC" as const, label: "Everyone", icon: "🌐" },
            { key: "FRIENDS" as const, label: "Friends", icon: "👥" },
            { key: "PRIVATE" as const, label: "Just me", icon: "🔒" },
          ] as const
        ).map((v, i) => (
          <TouchableOpacity
            key={v.key}
            onPress={() => setVisibility(v.key)}
            accessibilityLabel={`Visibility ${v.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected: visibility === v.key }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              paddingVertical: 14,
              backgroundColor: visibility === v.key ? DS_COLORS.ACCENT_TINT : DS_COLORS.TRANSPARENT,
              borderRightWidth: i < 2 ? 1 : 0,
              borderRightColor: DS_COLORS.BORDER_LIGHT,
            }}
          >
            <Text style={styles.text13}>{v.icon}</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: visibility === v.key ? DS_TYPOGRAPHY.WEIGHT_SEMIBOLD : "400",
                color: visibility === v.key ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_SECONDARY,
              }}
            >
              {v.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.text13HintMt8Lh20}>
        {visibility === "PUBLIC" && "Visible on Discover. Anyone can find and join."}
        {visibility === "FRIENDS" && "Only your friends can see and join."}
        {visibility === "PRIVATE" && "Private. No one else sees it."}
      </Text>
      {who === "duo" && (
        <View style={styles.inviteSection}>
          <Text style={styles.fieldLabel}>Invite your partner</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter handle or phone number"
            placeholderTextColor={DS_COLORS.TEXT_MUTED}
            value={duoInvite}
            onChangeText={setDuoInvite}
            accessibilityLabel="Partner handle or phone number"
          />
          <Text style={styles.caption}>Your partner must accept before the challenge begins.</Text>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => void sharePlainMessage("Join me on GRIIT!")}
            accessibilityRole="button"
            accessibilityLabel="Share duo invite link for this challenge"
          >
            <Text style={styles.outlineBtnTxt}>Share invite link</Text>
          </TouchableOpacity>
        </View>
      )}
      {who === "squad" && (
        <View style={styles.inviteSection}>
          <Text style={styles.fieldLabel}>Invite your squad</Text>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => void sharePlainMessage("Join my squad challenge on GRIIT!")}
            accessibilityRole="button"
            accessibilityLabel="Share squad invite link for this challenge"
          >
            <Text style={styles.outlineBtnTxt}>Share invite link</Text>
          </TouchableOpacity>
          <Text style={styles.caption}>Challenge starts immediately. Others can join within the first 24 hours.</Text>
        </View>
      )}
      <Text style={styles.lockHint}>
        {who === "solo"
          ? "Editable until the challenge starts."
          : who === "duo"
            ? "Settings lock once your partner joins. Make sure everything looks right."
            : "Settings lock once someone joins."}
      </Text>
    </>
  );
}
