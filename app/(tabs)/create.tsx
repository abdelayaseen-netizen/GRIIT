/**
 * Build 92 01.3: the Create tab is a chooser, not a screen. When this route gains focus
 * (deep link, or the native tab bar where a trigger can't be intercepted), it opens the
 * Create chooser and returns to the tab that was selected before, so Create never stays
 * selected. The JS tab bar opens the chooser directly and never navigates here.
 * The Create challenge wizard lives at ROUTES.CREATE_WIZARD ("/create").
 */
import React, { useCallback } from "react";
import { useFocusEffect, useNavigation } from "expo-router";
import Screen from "@/components/ds/Screen";
import { openCreateChooser } from "@/lib/create-chooser";

export default function CreateTabScreen() {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      openCreateChooser();
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate("index" as never);
    }, [navigation]),
  );
  return <Screen edges={[]} />;
}
