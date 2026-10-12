import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import AccountScreen from "@/components/onboarding/v2/screens/AccountScreen";
import SignInScreen from "@/components/onboarding/v2/screens/SignInScreen";
import { DS_V3 } from "@/lib/design-system";

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
  if (!visible) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onLater}>
      <View style={styles.fill}>
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
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: DS_V3.color.canvas },
});
