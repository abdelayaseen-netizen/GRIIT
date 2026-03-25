import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { DS_COLORS } from '@/lib/design-system';
import { captureError } from '@/lib/sentry';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useApp();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const [displayName, setDisplayName] = useState<string>(profile?.display_name || '');
  const [bio, setBio] = useState<string>(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || '');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleUpdate = async (data: { display_name: string; bio: string; avatar_url: string }) => {
    if (!user?.id) {
      setFormError('Not authenticated');
      return;
    }
    setFormError('');
    setIsPending(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name,
          bio: data.bio,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) {
        setFormError(error.message);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.canGoBack() ? router.back() : router.replace("/(tabs)/home" as never);
    } catch (err: unknown) {
      captureError(err, 'EditProfileUpdate');
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  const handleSave = () => {
    handleUpdate({
      display_name: displayName.trim() || profile?.username || '',
      bio: bio.trim(),
      avatar_url: avatarUrl.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home" as never))} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close and go back" accessibilityRole="button">
          <X size={22} color={DS_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isPending}
          style={[styles.saveBtn, isPending && { opacity: 0.5 }]}
          activeOpacity={0.7}
          accessibilityLabel="Save profile"
          accessibilityRole="button"
          accessibilityState={{ disabled: isPending }}
        >
          {isPending ? (
            <ActivityIndicator size="small" color={DS_COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(displayName || profile?.username || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.usernameLabel}>@{profile?.username}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your display name"
                placeholderTextColor={DS_COLORS.textMuted}
                autoCapitalize="words"
                editable={!isPending}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people about yourself..."
                placeholderTextColor={DS_COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={150}
                editable={!isPending}
              />
              <Text style={styles.counter}>{`${bio.length}/150`}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Avatar URL</Text>
              <TextInput
                style={styles.input}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
                placeholder="https://example.com/photo.jpg"
                placeholderTextColor={DS_COLORS.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                editable={!isPending}
              />
            </View>
            {formError ? (
              <Text style={styles.formError} accessibilityLiveRegion="polite">
                {formError}
              </Text>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS_COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DS_COLORS.border,
    backgroundColor: DS_COLORS.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DS_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: DS_COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: DS_COLORS.black,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnText: {
    color: DS_COLORS.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DS_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: DS_COLORS.white,
  },
  usernameLabel: {
    fontSize: 15,
    color: DS_COLORS.textSecondary,
    fontWeight: '500' as const,
  },
  form: {
    gap: 20,
  },
  inputGroup: {},
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: DS_COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: DS_COLORS.white,
    borderWidth: 1,
    borderColor: DS_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: DS_COLORS.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  formError: {
    color: DS_COLORS.errorText,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  counter: {
    marginTop: 6,
    fontSize: 11,
    color: DS_COLORS.textMuted,
    textAlign: 'right',
  },
});
