/**
 * Witness preview. FeedPostV3 photo rows use DisplayNumber (SF Pro Display Heavy) for Day.
 * This screen must stay SF Pro, so the row uses the same Avatar + Card kit
 * with a 200pt proof block and no action row.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Camera } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Avatar from "@/components/ds/Avatar";
import Card from "@/components/ds/Card";
import { WHY_CIRCLE_SUB, WHY_CIRCLE_TITLE } from "@/lib/onboarding-v42-copy";
import { ChromePrimary, OnboardingScreen } from "../OnboardingChrome";

const PROOF = DS_V3.space.gutter * 10;
const CAM = DS_V3.space.xs * 7;
const CARD_PAD = DS_V3.space.md + DS_V3.space.xs / 2;

export default function WhyCircleScreen({
  onContinue,
  onSkip,
  onBack,
}: {
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <OnboardingScreen
      step={2}
      onBack={onBack}
      skipLabel="Skip"
      onSkip={onSkip}
      title={WHY_CIRCLE_TITLE}
      subtitle={WHY_CIRCLE_SUB}
      footer={<ChromePrimary label="Continue" onPress={onContinue} />}
    >
      <View style={styles.wrap}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Avatar size={32} />
            <View style={styles.who}>
              <Text style={styles.name}>your username</Text>
              <Text style={styles.meta}>First challenge · Day 12</Text>
            </View>
          </View>
          <View style={styles.proof}>
            <Camera size={CAM} color={DS_V3.color.textSecondary} />
            <Text style={styles.proofLabel}>Your proof photo</Text>
          </View>
          <View style={styles.securedRow}>
            <Text style={styles.secured}>Day secured.</Text>
            <Text style={styles.summary}>2 of 3 tasks.</Text>
          </View>
        </Card>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingTop: DS_V3.space.gutter,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  header: {
    paddingVertical: CARD_PAD,
    paddingHorizontal: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.md,
  },
  who: {
    flex: 1,
    gap: DS_V3.space.xs / 2,
  },
  name: {
    fontSize: DS_V3.type.bodyStrong.fontSize,
    lineHeight: DS_V3.type.bodyStrong.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  meta: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  proof: {
    height: PROOF,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    justifyContent: "center",
    gap: DS_V3.space.sm,
  },
  proofLabel: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  securedRow: {
    paddingVertical: CARD_PAD,
    paddingHorizontal: DS_V3.space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: DS_V3.space.sm,
  },
  secured: {
    fontSize: DS_V3.type.secondary.fontSize,
    lineHeight: DS_V3.type.secondary.lineHeight,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  summary: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
});
