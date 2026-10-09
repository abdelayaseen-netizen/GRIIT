/**
 * Dev harness for the stories proof viewer. Route: /dev/build81-proof
 */
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import { ProofViewer } from "@/components/profile/ProofViewer";
import type { Pos, ViewerDay } from "@/lib/proof-viewer";

const photo = Image.resolveAssetSource(
  require("../../design/handoff/v51/handoff/GRIIT-v51-handoff/atlas/assets/proofs/sunrise1.jpg"),
).uri;

const days: ViewerDay[] = [
  {
    dateKey: "2026-10-08",
    tasks: [
      {
        id: "workout",
        name: "Workout",
        challenge: "Gym once a day",
        dayLine: "Day 5 of 7",
        shared: true,
        respectCount: 4,
        commentCount: 1,
        capturedAt: "2026-10-08T08:58:00.000Z",
        photos: [{ uri: photo }, { uri: photo }],
      },
      {
        id: "read",
        name: "Read",
        challenge: "Read 30",
        dayLine: "Day 6 of 30",
        shared: false,
        respectCount: 0,
        commentCount: 0,
        capturedAt: null,
        photos: [{ uri: null }],
      },
    ],
  },
  {
    dateKey: "2026-10-07",
    tasks: [
      {
        id: "prayer",
        name: "Prayer",
        challenge: "5-Minute Morning Prayer",
        dayLine: "Day 2 of 7",
        shared: true,
        respectCount: 2,
        commentCount: 0,
        capturedAt: null,
        photos: [{ uri: null }],
      },
    ],
  },
];

export default function Build81ProofHarness() {
  const [pos, setPos] = useState<Pos>({ day: 0, task: 0, photo: 0 });
  const [closed, setClosed] = useState(false);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen edges={["top", "left", "right"]}>
        {closed ? (
          <View testID="proof-closed">
            <Text>Closed</Text>
          </View>
        ) : (
          <ProofViewer days={days} pos={pos} onPos={setPos} onClose={() => setClosed(true)} />
        )}
      </Screen>
    </>
  );
}
