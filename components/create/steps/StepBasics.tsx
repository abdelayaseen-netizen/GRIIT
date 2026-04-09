import React from "react";
import { View, Text, TextInput, TouchableOpacity, Animated } from "react-native";
import { User, Users, UsersRound } from "lucide-react-native";
import { DS_COLORS } from "@/lib/design-system";
import { CREATE_SELECTION } from "@/lib/create-selection";
import type { ChallengeType } from "@/types";
import { styles } from "@/components/create/wizard-styles";
import { DurationPill, DURATION_PRESETS } from "@/components/create/wizard-shared";

export type WhoBasics = "solo" | "duo" | "squad";

export interface StepBasicsProps {
  title: string;
  setTitle: (v: string) => void;
  nameError: boolean;
  setNameError: (v: boolean) => void;
  shake: Animated.Value;
  who: WhoBasics;
  setWho: (v: WhoBasics) => void;
  durationDays: number | null;
  setDurationDays: (v: number | null) => void;
  customDur: string;
  setCustomDur: (v: string) => void;
  challengeType: ChallengeType;
  setChallengeType: (v: ChallengeType) => void;
}

export function StepBasics({
  title,
  setTitle,
  nameError,
  setNameError,
  shake,
  who,
  setWho,
  durationDays,
  setDurationDays,
  customDur,
  setCustomDur,
  challengeType,
  setChallengeType,
}: StepBasicsProps) {
  return (
    <>
      <Text style={styles.h1}>What are you building?</Text>
      <Text style={styles.sub}>Most people finish in under 90 seconds.</Text>
      <Text style={styles.fieldLabel}>Challenge name</Text>
      <Animated.View style={[styles.shakeWrap, { transform: [{ translateX: shake }] }]}>
        <TextInput
          style={[styles.input, nameError && styles.inputErr]}
          placeholder="e.g. 75 Day Hard, Iron Mind..."
          placeholderTextColor={DS_COLORS.TEXT_MUTED}
          value={title}
          accessibilityLabel="Challenge name"
          onChangeText={(text) => {
            setTitle(text);
            if (nameError) {
              const candidate = text.trim();
              const ok =
                candidate.length >= 3 &&
                candidate.toLowerCase() !== "challenge" &&
                candidate.toLowerCase() !== "untitled";
              if (ok) setNameError(false);
            }
          }}
        />
      </Animated.View>
      <Text style={styles.charCount}>{title.length}/60</Text>
      {nameError ? <Text style={styles.errText}>Give your challenge a name</Text> : null}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Who&apos;s in?</Text>
      <View style={styles.whoRow}>
        {(
          [
            { id: "solo" as const, Icon: User, t: "Solo", d: "Just you." },
            { id: "duo" as const, Icon: Users, t: "Duo", d: "You + 1 partner." },
            { id: "squad" as const, Icon: UsersRound, t: "Squad", d: "2-10 people." },
          ] as const
        ).map((row) => {
          const sel = who === row.id;
          const Icon = row.Icon;
          return (
            <TouchableOpacity
              key={row.id}
              style={[styles.whoCard, sel && styles.whoCardSel]}
              onPress={() => setWho(row.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                row.id === "solo"
                  ? "Solo challenge — just you — tap to select"
                  : row.id === "duo"
                    ? "Duo challenge — you and one partner — tap to select"
                    : "Squad challenge — two to ten people — tap to select"
              }
              accessibilityState={{ selected: sel }}
            >
              <Icon size={24} color={sel ? CREATE_SELECTION.text : DS_COLORS.TEXT_SECONDARY} />
              <Text style={[styles.whoTitle, sel && { color: CREATE_SELECTION.text }]}>{row.t}</Text>
              <Text style={styles.whoSub}>{row.d}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>How long?</Text>
      <View style={styles.colGapSm}>
        <View style={styles.rowGapSm}>
          {DURATION_PRESETS.slice(0, 3).map((d) => (
            <DurationPill
              key={d}
              label={`${d} days`}
              selected={durationDays === d}
              onPress={() => {
                setDurationDays(d);
                setCustomDur("");
              }}
              accessibilityLabel={`${d} day challenge — ${durationDays === d ? "selected" : "tap to select"}`}
              style={styles.flex1}
            />
          ))}
        </View>
        <View style={styles.rowGapSm}>
          {DURATION_PRESETS.slice(3, 5).map((d) => (
            <DurationPill
              key={d}
              label={`${d} days`}
              selected={durationDays === d}
              onPress={() => {
                setDurationDays(d);
                setCustomDur("");
              }}
              accessibilityLabel={`${d} day challenge — ${durationDays === d ? "selected" : "tap to select"}`}
              style={styles.flex1}
            />
          ))}
          <DurationPill
            label="Custom"
            selected={durationDays === null}
            onPress={() => setDurationDays(null)}
            accessibilityLabel={`Custom duration — ${durationDays === null ? "selected" : "tap to select"}`}
            style={styles.flex1}
          />
        </View>
      </View>
      {durationDays === null && (
        <View style={styles.customRow}>
          <TextInput
            style={[styles.input, { width: 64 }]}
            keyboardType="number-pad"
            value={customDur}
            accessibilityLabel="Custom challenge duration in days"
            onChangeText={(v) => {
              setCustomDur(v);
              setDurationDays(null);
            }}
          />
          <Text style={styles.daysLabel}>days</Text>
        </View>
      )}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Challenge type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeCard, challengeType === "standard" && styles.typeCardSel]}
          onPress={() => setChallengeType("standard")}
          accessibilityRole="button"
          accessibilityLabel={`Standard — Multi-day, daily tasks — ${challengeType === "standard" ? "selected" : "tap to select"}`}
          accessibilityState={{ selected: challengeType === "standard" }}
        >
          <Text style={styles.typeCardTitle}>Standard</Text>
          <Text style={styles.typeCardSub}>Multi-day, daily tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeCard, challengeType === "one_day" && styles.typeCardSel]}
          onPress={() => {
            setChallengeType("one_day");
            setDurationDays(1);
          }}
          accessibilityRole="button"
          accessibilityLabel={`24-Hour — One-day sprint — ${challengeType === "one_day" ? "selected" : "tap to select"}`}
          accessibilityState={{ selected: challengeType === "one_day" }}
        >
          <Text style={styles.typeCardTitle}>24-Hour</Text>
          <Text style={styles.typeCardSub}>One-day sprint</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
