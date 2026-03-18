import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/store/onboardingStore';

interface UsernameScreenProps {
  onComplete: (username: string) => void;
}

export default function UsernameScreen({ onComplete }: UsernameScreenProps) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sanitizeUsername = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  };

  const handleContinue = async () => {
    const cleanUsername = sanitizeUsername(username);
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    let userId: string | null = null;

    // Get userId directly from Supabase - most reliable method
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    } catch {
      // ignore
    }

    if (!userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          userId = user.id;
        }
      } catch {
        // ignore
      }
    }

    if (!userId) {
      setError('No active session. Go back and sign up again.');
      setLoading(false);
      return;
    }

    try {
      const { selectedGoals, intensityLevel } = useOnboardingStore.getState();

      // Try the upsert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: userId,
            username: cleanUsername,
            display_name: displayName.trim(),
            goals: selectedGoals,
            intensity_level: intensityLevel,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (profileError) {
        if (profileError.message?.includes('unique') || profileError.message?.includes('duplicate')) {
          if (profileError.message?.includes('username')) {
            setError('Username taken. Try another one.');
            return;
          }
        }

        // If RLS is blocking the insert because there's no session
        if (profileError.message?.includes('row-level security') || profileError.code === '42501') {
          setError('Permission denied. Make sure you are signed in.');
          return;
        }

        if (profileError.message?.includes('foreign key')) {
          setError('Account not found in database. Go back and sign up again.');
          return;
        }

        setError('Could not save profile: ' + (profileError.message || 'Unknown error'));
        return;
      }

      onComplete(cleanUsername);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>LAST STEP</Text>
        <Text style={styles.title}>Pick your{'\n'}call sign.</Text>
        <Text style={styles.subtitle}>This is how others see you on the leaderboard.</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>USERNAME</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.inputWithPrefix}
              placeholder="your_username"
              placeholderTextColor={C.textTertiary}
              value={username}
              onChangeText={(t) => { setUsername(sanitizeUsername(t)); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
          <Text style={styles.inputHint}>Letters, numbers, underscores only</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={C.textTertiary}
            value={displayName}
            onChangeText={(t) => { setDisplayName(t); setError(''); }}
            maxLength={30}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.ctaContainer}>
        <Pressable
          style={[styles.primaryButton, (username.length < 3 || !displayName.trim()) && styles.primaryButtonDisabled]}
          onPress={handleContinue}
          disabled={username.length < 3 || !displayName.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={C.WHITE} />
          ) : (
            <Text style={[styles.primaryButtonText, (username.length < 3 || !displayName.trim()) && styles.primaryButtonTextDisabled]}>
              Let&apos;s go
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 36 },
  stepLabel: { fontSize: T.captionSize, color: C.accent, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, lineHeight: T.headingLineHeight, letterSpacing: T.headingLetterSpacing, marginBottom: 8 },
  subtitle: { fontSize: T.smallSize, color: C.textSecondary },
  formContainer: { flex: 1, gap: 24 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  inputPrefix: { fontSize: T.bodySize, color: C.textTertiary, paddingLeft: 16, paddingRight: 2 },
  inputWithPrefix: { flex: 1, height: 52, fontSize: T.bodySize, color: C.textPrimary, paddingRight: 16 },
  input: { height: 52, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 16, fontSize: T.bodySize, color: C.textPrimary, borderWidth: 1, borderColor: C.border },
  inputHint: { fontSize: 11, color: C.textTertiary },
  errorText: { fontSize: T.captionSize, color: C.accent, textAlign: 'center' },
  ctaContainer: { paddingTop: 16 },
  primaryButton: { backgroundColor: C.accent, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonDisabled: { backgroundColor: C.surfaceElevated },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  primaryButtonTextDisabled: { color: C.textTertiary },
});
