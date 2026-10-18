import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button } from '@/components/ds';
import { DS_V3 } from '@/ds';

// One screen: Apple first, email one-time code, "Not now" for guests. No password field.
export function AccountStep({ onApple, sendCode, verify, onNotNow }: any) {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [code, setCode] = useState('');
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={DS_V3.type.title} accessibilityRole="header">Save your streak</Text>
      <Text style={DS_V3.type.secondary}>So your challenge and Day 1 are kept if you change phones.</Text>
      <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE} cornerRadius={25} style={{ height: 50 }} onPress={onApple} />
      {!sent ? (<>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" autoComplete="email" accessibilityLabel="Email" style={{ minHeight: 52 }} />
        <Button variant="glass" disabled={!email.includes('@')} onPress={async () => { await sendCode(email); setSent(true); }}>Send code</Button>
      </>) : (
        <TextInput value={code} onChangeText={(v) => { setCode(v); if (v.length === 6) verify(email, v); }} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} accessibilityLabel="6-digit code" style={{ minHeight: 56 }} />
      )}
      <Button variant="text" onPress={onNotNow}>Not now</Button>
    </View>
  );
}
// Wrap in KeyboardAvoidingView (padding) + scroll the focused field 24 pt above the keyboard; iOS shows the code in the keyboard bar.
// Engineering: email one-time code needs Supabase Auth email OTP enabled (signInWithOtp, shouldCreateUser) and the "Magic Link / OTP" email template configured to send the 6-digit {{ .Token }}, not a link.
