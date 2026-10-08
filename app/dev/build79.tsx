/**
 * Dev harness for build 79 frames. Route: /dev/build79
 * Renders the six Home top states, the counter complete button, a proof tile, and a double-tap target.
 */
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/ds/Screen";
import { DS_V3 } from "@/lib/design-system";
import { HomeV3, type HomeV3MorningAfter } from "@/components/home/HomeV3";
import { CountStep } from "@/components/task-v2/steps/CountStep";
import DoubleTapRespect from "@/components/feed/DoubleTapRespect";
import ProfileProofs from "@/components/profile/ProfileProofs";
import { EMPTY_SECURED_HEADER } from "@/lib/secured-since";

const noop = () => undefined;

const freeze: HomeV3MorningAfter = {
  cost: "",
  cushion: "",
  onDismiss: noop,
  onUseFreeze: noop,
};

function HomeState({
  label,
  streak,
  best,
  secured,
  freezeOn,
  task,
  letters,
}: {
  label: string;
  streak: number;
  best: number;
  secured?: boolean;
  freezeOn?: boolean;
  task?: string | null;
  letters?: string[];
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.tag}>{label}</Text>
      <View style={styles.home}>
        <HomeV3
          title={label}
          streak={streak}
          streakLine=""
          proof={null}
          todayIndex={0}
          onPressProof={noop}
          freezesLeft={freezeOn ? 1 : 0}
          daySecured={secured}
          bestStreak={best}
          weekLetters={letters}
          nextTask={task ? { id: "read", title: task } : null}
          morningAfter={freezeOn ? freeze : null}
          onPressShareToday={noop}
          onPressTask={noop}
        />
      </View>
    </View>
  );
}

export default function Build79Preview() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(4);
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <HomeState label="Day 1" streak={1} best={1} task="Read" letters={["1", "2", "3", "4", "5", "6", "7"]} />
        <HomeState label="Day 2" streak={2} best={2} task="Read" letters={["1", "2", "3", "4", "5", "6", "7"]} />
        <HomeState label="Day 14" streak={14} best={40} task="Read" />
        <HomeState label="Day 128" streak={128} best={128} task="Read" />
        <HomeState label="One thousand" streak={1000} best={1000} task="Read" />
        <HomeState label="Secured" streak={14} best={20} secured />
        <HomeState label="Missed yesterday" streak={12} best={12} freezeOn task="Read" />
        <View style={styles.count}>
          <CountStep
            count={count}
            counterGoal={30}
            counterUnit="pages"
            taskName="Read"
            headerTitle="Read"
            hasCamera={false}
            keypadOpen={false}
            onTypeCount={setCount}
            onAddOne={() => setCount((n) => Math.min(30, n + 1))}
            onAddAmount={(n) => setCount((c) => Math.min(30, c + n))}
            onOpenKeypad={noop}
            onRemoveOne={() => setCount((n) => Math.max(0, n - 1))}
            onComplete={() => setCount(30)}
            onBack={noop}
          />
        </View>
        <View style={styles.count}>
          <CountStep
            count={0}
            counterGoal={30}
            counterUnit="pages"
            taskName="Read"
            headerTitle="Read"
            hasCamera
            keypadOpen={false}
            onTypeCount={noop}
            onAddOne={noop}
            onOpenKeypad={noop}
            onRemoveOne={noop}
            onComplete={noop}
            onBack={noop}
          />
        </View>
        <ProfileProofs
          proofs={[
            { id: "self-1", dateKey: "2026-10-08", taskName: "Read", shared: false },
            { id: "photo-1", dateKey: "2026-10-07", imageUrl: "https://example.com/proof.jpg", taskName: "Workout" },
          ]}
          isOwner
          monthKey="2026-10"
          days={[]}
          header={EMPTY_SECURED_HEADER}
          onOpenDay={noop}
        />
        <Text style={styles.tag}>{liked ? "Liked" : "Not liked"}</Text>
        <DoubleTapRespect
          respected={liked}
          onRespect={() => setLiked(true)}
          onOpen={noop}
          accessibilityLabel="Double tap photo"
        >
          <View style={styles.photo}>
            <Text style={styles.photoText}>Photo</Text>
          </View>
        </DoubleTapRespect>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 80, gap: DS_V3.space.lg },
  block: { minHeight: 280 },
  count: { height: 640 },
  home: { height: 340 },
  tag: {
    paddingHorizontal: DS_V3.space.gutter,
    color: DS_V3.color.textSecondary,
    fontSize: 13,
  },
  photo: {
    margin: DS_V3.space.gutter,
    height: 180,
    backgroundColor: DS_V3.color.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: { color: DS_V3.color.textPrimary, fontSize: 17 },
});
