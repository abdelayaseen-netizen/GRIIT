import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AccountScreen from "@/components/onboarding/v2/screens/AccountScreen";
import SignInScreen from "@/components/onboarding/v2/screens/SignInScreen";
import { DS_V3 } from "@/lib/design-system";

/**
 * Build 90 06.6: a full-screen Modal has no safe area of its own, so the "Go back"
 * chevron sat under the status bar and nothing else could dismiss the sheet (the
 * starter flag hides the Account screen's own Later link). The sheet now pads the
 * top inset and always offers Later, which closes it and leaves the person on Home.
 */
export function SaveStreakSheet({
  visible,
  onLater,
  onSaved,
}: {
  visible: boolean;
  onLater: () => void;
  onSaved: () => void;
}) {
  const [signIn, setSignIn] = useState(false);
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onLater}>
      <View style={[styles.fill, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {signIn ? (
          <SignInScreen
            onBack={() => setSignIn(false)}
            onSuccess={onSaved}
          />
        ) : (
          <AccountScreen
            onAuthSuccess={onSaved}
            onSkip={onLater}
            onBack={onLater}
            onSignInWithAccount={() => setSignIn(true)}
            alwaysOfferSkip
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: DS_V3.color.canvas },
});
