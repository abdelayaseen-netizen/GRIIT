/**
 * Dev harness for v51 Home frames 1304–1308. Route: /dev/build81
 */
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import { HomeV3, type HomeV3Proof } from "@/components/home/HomeV3";
import type { HomeProofRow, HomeProofSection } from "@/lib/home-proof-card";
import { DS_V3 } from "@/lib/design-system";

const noop = () => undefined;

function row(id: string, name: string, caption: string, done: boolean): HomeProofRow {
  return { id, name, type: "simple", caption, done, closed: false, hasCameraProof: false };
}

function section(id: string, challenge: string, day: number, total: number, rows: HomeProofRow[]): HomeProofSection {
  return {
    id,
    challenge,
    challengeId: id,
    day,
    dayTotal: total,
    doneCount: rows.filter((item) => item.done).length,
    totalCount: rows.length,
    rows,
    showCta: false,
    securedToday: rows.every((item) => item.done),
    startDateKey: "2026-10-01",
    photoCount: 0,
  };
}

function card(sections: HomeProofSection[]): HomeV3Proof {
  const rows = sections.flatMap((item) => item.rows);
  return {
    posted: false,
    hasChallenge: true,
    firstProofEver: false,
    doneCount: rows.filter((item) => item.done).length,
    totalCount: rows.length,
    sections,
    showCta: false,
    showShareToday: false,
    shareTodayCaption: "",
    shareTodayChallenges: [],
  };
}

const mid = card([
  section("gym", "Gym once a day", 5, 7, [row("workout", "Workout", "Self-reported", false)]),
  section("read", "Read 30 min before bed", 6, 30, [row("read", "Read", "Camera", false)]),
  section("pray", "5-Minute Morning Prayer", 2, 7, [row("prayer", "5-minute prayer or intention", "Self-reported", true)]),
]);

const allDone = card([
  section("pray", "5-Minute Morning Prayer", 2, 7, [row("prayer", "5-minute prayer or intention", "Self-reported", true)]),
  section("gym", "Gym once a day", 5, 7, [row("workout", "Workout", "Self-reported", true)]),
  section("read", "Read 30 min before bed", 6, 30, [row("read", "Read", "Camera", true)]),
]);

const missed = card([
  section("pray", "5-Minute Morning Prayer", 2, 7, [row("prayer", "5-minute prayer or intention", "Self-reported", false)]),
  section("gym", "Gym once a day", 5, 7, [row("workout", "Workout", "Self-reported", false)]),
  section("read", "Read 30 min before bed", 6, 30, [row("read", "Read", "Camera", false)]),
]);

const dayOne = card([section("read", "Read 30 min before bed", 6, 30, [row("read", "Read", "Camera", false)])]);

type StateId = "mid" | "done" | "freeze" | "day1";

const STATES: { id: StateId; label: string }[] = [
  { id: "mid", label: "Mid-day" },
  { id: "done", label: "All done" },
  { id: "freeze", label: "Freeze" },
  { id: "day1", label: "Day 1" },
];

export default function Build81Harness() {
  const [state, setState] = useState<StateId>("mid");
  const proof = state === "done" ? allDone : state === "freeze" ? missed : state === "day1" ? dayOne : mid;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.switcher}>
          {STATES.map((item) => (
            <Pressable key={item.id} testID={`build81-${item.id}`} onPress={() => setState(item.id)}>
              <Text style={styles.chip}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView testID="build81-home" contentContainerStyle={styles.scroll}>
          <HomeV3
            key={state}
            title={state === "freeze" ? "Good morning" : state === "done" ? "Good evening" : state === "day1" ? "Good morning" : "Good afternoon"}
            dateLine={state === "freeze" ? "Friday, Oct 9" : state === "day1" ? "Wednesday, Sep 30" : "Thursday, Oct 8"}
            streak={state === "done" ? 3 : state === "day1" ? 0 : 2}
            streakLine=""
            bestStreak={state === "freeze" ? 3 : state === "done" ? 3 : 2}
            proof={proof}
            todayIndex={state === "freeze" ? 4 : 3}
            weekLetters={state === "day1" ? ["1", "2", "3", "4", "5", "6", "7"] : ["M", "T", "W", "T", "F", "S", "S"]}
            weekStates={
              state === "day1"
                ? ["na", "na", "na", "na", "na", "na", "na"]
                : state === "freeze"
                  ? ["secured", "secured", "secured", "missed", "missed", "future", "future"]
                  : ["secured", "secured", "future", "future", "future", "future", "future"]
            }
            firstWeekDay={state === "day1" ? 1 : null}
            freezesLeft={1}
            morningAfter={
              state === "freeze"
                ? { cost: "", cushion: "", onDismiss: noop, onUseFreeze: noop }
                : null
            }
            nextTask={
              state === "mid"
                ? { id: "workout", title: "Workout" }
                : state === "day1"
                  ? { id: "read", title: "Read · take a photo" }
                  : null
            }
            daySecured={state === "done"}
            onPressProof={noop}
            onPressTask={noop}
            onPressShareToday={noop}
          />
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DS_V3.color.canvas },
  switcher: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  chip: { ...DS_V3.type.caption, color: DS_V3.color.textPrimary },
  scroll: { paddingBottom: 48 },
});
