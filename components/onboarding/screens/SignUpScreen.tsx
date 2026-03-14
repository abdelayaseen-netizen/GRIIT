import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';
import { supabase } from '@/lib/supabase';

interface SignUpScreenProps {
  onAuthSuccess: (userId: string) => void;
}

export default function SignUpScreen({ onAuthSuccess }: SignUpScreenProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        // If user already exists, try signing in
        if (
          signUpError.message.includes('already registered') ||
          signUpError.message.includes('already been registered') ||
          signUpError.message.includes('User already registered')
        ) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) {
            setError('Account exists but wrong password. Try again.');
            return;
          }
          if (signInData.session?.user) {
            onAuthSuccess(signInData.session.user.id);
            return;
          }
        }
        setError(signUpError.message);
        return;
      }

      // signUp succeeded — now we need a valid session
      // If session exists (email confirmation is OFF), use it directly
      if (signUpData.session?.user) {
        onAuthSuccess(signUpData.session.user.id);
        return;
      }

      // If no session but we have a user (email confirmation might be ON),
      // try to sign in immediately to create a session
      if (signUpData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          // Email confirmation is ON and blocking sign-in
          // Use the user ID directly from the signup response
          onAuthSuccess(signUpData.user.id);
          return;
        }

        if (signInData.session?.user) {
          onAuthSuccess(signInData.session.user.id);
          return;
        }
      }

      setError('Sign up succeeded but could not create session. Try again.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    // Google OAuth in React Native requires extra setup:
    // 1. expo-auth-session or expo-web-browser
    // 2. Google OAuth configured in Supabase dashboard
    // For MVP, show a friendly message and use email
    setError('Google sign in coming soon. Use email for now.');
  };

  const handleAppleSignUp = async () => {
    // Apple Sign In requires:
    // 1. expo-apple-authentication
    // 2. Apple OAuth configured in Supabase dashboard
    // For MVP, show a friendly message and use email
    setError('Apple sign in coming soon. Use email for now.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>ALMOST THERE</Text>
        <Text style={styles.title}>Create your{'\n'}account.</Text>
        <Text style={styles.subtitle}>Save your progress. Track your streaks. Never lose a day.</Text>
      </View>

      <View style={styles.authContainer}>
        {!showEmailForm ? (
          <>
            <Pressable style={styles.socialButton} onPress={handleAppleSignUp} disabled={loading}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </Pressable>

            <Pressable style={styles.socialButton} onPress={handleGoogleSignUp} disabled={loading}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.emailButton} onPress={() => { setShowEmailForm(true); setError(''); }}>
              <Text style={styles.emailButtonText}>Sign up with email</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={C.textTertiary}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={C.textTertiary}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry
            />
            <Pressable style={styles.primaryButton} onPress={handleEmailSignUp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </Pressable>
            <Pressable onPress={() => { setShowEmailForm(false); setError(''); }}>
              <Text style={styles.backToSocial}>← Back to other options</Text>
            </Pressable>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By continuing, you agree to GRIIT's Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 36 },
  stepLabel: { fontSize: T.captionSize, color: C.accent, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, lineHeight: T.headingLineHeight, letterSpacing: T.headingLetterSpacing, marginBottom: 8 },
  subtitle: { fontSize: T.smallSize, color: C.textSecondary, lineHeight: T.smallLineHeight },
  authContainer: { flex: 1, gap: 12 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.textPrimary, height: S.buttonHeight, borderRadius: S.buttonRadius, gap: 10 },
  socialIcon: { fontSize: 20 },
  socialButtonText: { fontSize: T.bodySize, fontWeight: '600', color: C.background },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: T.captionSize, color: C.textTertiary },
  emailButton: { height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emailButtonText: { fontSize: T.bodySize, fontWeight: '600', color: C.textSecondary },
  input: { height: 52, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, fontSize: T.bodySize, color: C.textPrimary, borderWidth: 1, borderColor: C.border },
  primaryButton: { backgroundColor: C.accent, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  backToSocial: { fontSize: T.smallSize, color: C.textTertiary, textAlign: 'center', paddingVertical: 8 },
  errorText: { fontSize: T.captionSize, color: C.accent, textAlign: 'center', marginTop: 8 },
  footer: { paddingTop: 16 },
  termsText: { fontSize: 11, color: C.textTertiary, textAlign: 'center', lineHeight: 16 },
});
