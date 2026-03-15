import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboarding-store';
import { trpcQuery, trpcMutate } from '@/lib/trpc';
import { TRPC } from '@/lib/trpc-paths';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';

interface AutoSuggestChallengeScreenProps {
  onJoinComplete: () => void;
  onBrowseMore: () => void;
}

type ChallengeItem = { id: string; title?: string; short_hook?: string; duration_days?: number };

export default function AutoSuggestChallengeScreen({ onJoinComplete, onBrowseMore }: AutoSuggestChallengeScreenProps) {
  useOnboardingStore();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await trpcQuery(TRPC.challenges.getStarterPack)) as unknown;
        const list = Array.isArray(data) ? data : [];
        const items = (list as ChallengeItem[]).slice(0, 2);
        if (!cancelled) {
          setChallenges(items);
          if (items.length > 0) {
            track({
              name: 'onboarding_challenge_auto_suggested',
              challenge_id: items[0].id,
              challenge_name: items[0].title ?? '',
            });
          }
        }
      } catch {
        if (!cancelled) setChallenges([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setOnboardingCompleteAndContinue = async (next: () => void) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('profiles').update({ onboarding_completed: true, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      }
    } catch {
      // ignore
    }
    next();
  };

  const handleJoin = async (challengeId: string) => {
    setJoiningId(challengeId);
    setError('');
    try {
      await trpcMutate(TRPC.challenges.join, { challengeId });
      track({ name: 'onboarding_challenge_joined', challenge_id: challengeId });
      await setOnboardingCompleteAndContinue(onJoinComplete);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join. Try again.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleBrowseMore = () => {
    track({ name: 'onboarding_challenge_skipped' });
    setOnboardingCompleteAndContinue(onBrowseMore);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Finding challenges for you...</Text>
      </View>
    );
  }

  const suggested = challenges[0];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 4 OF 4</Text>
        <Text style={styles.title}>We picked a challenge{'\n'}for you.</Text>
        <Text style={styles.subtitle}>
          Based on your goals. Join to start your first day, or browse more.
        </Text>
      </View>

      {suggested ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{suggested.title ?? 'Challenge'}</Text>
          {suggested.short_hook ? <Text style={styles.cardHook}>{suggested.short_hook}</Text> : null}
          {suggested.duration_days ? <Text style={styles.cardMeta}>{suggested.duration_days} days</Text> : null}
          <Pressable
            style={[styles.primaryButton, joiningId !== null && styles.primaryButtonDisabled]}
            onPress={() => handleJoin(suggested.id)}
            disabled={joiningId !== null}
          >
            {joiningId === suggested.id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Join challenge</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No starter challenges right now.</Text>
          <Pressable style={styles.secondaryButton} onPress={handleBrowseMore}>
            <Text style={styles.secondaryButtonText}>Browse challenges</Text>
          </Pressable>
        </View>
      )}

      {suggested && (
        <Pressable style={styles.browseLink} onPress={handleBrowseMore}>
          <Text style={styles.browseLinkText}>Browse more challenges →</Text>
        </Pressable>
      )}

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.skipButton} onPress={handleBrowseMore}>
            <Text style={styles.skipButtonText}>Continue anyway</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background, gap: 16 },
  loadingText: { fontSize: T.smallSize, color: C.textSecondary },
  header: { marginBottom: 28 },
  stepLabel: { fontSize: T.captionSize, color: C.accent, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, lineHeight: T.headingLineHeight, letterSpacing: T.headingLetterSpacing, marginBottom: 8 },
  subtitle: { fontSize: T.smallSize, color: C.textSecondary, lineHeight: T.smallLineHeight },
  card: { backgroundColor: C.surface, borderRadius: S.cardRadius, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: C.border },
  cardTitle: { fontSize: T.subheadingSize, fontWeight: T.subheadingWeight, color: C.textPrimary, marginBottom: 6 },
  cardHook: { fontSize: T.bodySize, color: C.textSecondary, marginBottom: 8 },
  cardMeta: { fontSize: T.captionSize, color: C.textTertiary, marginBottom: 20 },
  primaryButton: { backgroundColor: C.commitmentButtonBg, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  secondaryButton: { height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  secondaryButtonText: { fontSize: T.bodySize, fontWeight: '600', color: C.textSecondary },
  empty: { marginBottom: 24, gap: 16 },
  emptyText: { fontSize: T.bodySize, color: C.textSecondary, textAlign: 'center' },
  browseLink: { paddingVertical: 12, alignItems: 'center' },
  browseLinkText: { fontSize: T.bodySize, fontWeight: '600', color: C.accent },
  errorText: { fontSize: T.captionSize, color: C.accent, textAlign: 'center', marginTop: 12 },
  errorBlock: { marginTop: 16, alignItems: 'center', gap: 12 },
  skipButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: S.buttonRadius, borderWidth: 1, borderColor: C.border },
  skipButtonText: { fontSize: T.bodySize, fontWeight: '600', color: C.textSecondary },
});
