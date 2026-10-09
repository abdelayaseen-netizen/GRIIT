/**
 * Your data ranges. Route: /dev/build81-data
 */
import React from "react";
import { ScrollView } from "react-native";
import { Stack } from "expo-router";
import Screen from "@/components/ds/Screen";
import { YourDataTab } from "@/components/profile/YourDataTab";

export default function Build81Data() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen edges={["top", "left", "right"]}>
        <ScrollView>
          <YourDataTab />
        </ScrollView>
      </Screen>
    </>
  );
}
