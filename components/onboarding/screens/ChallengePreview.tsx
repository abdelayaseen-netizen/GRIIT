import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { ONBOARDING_COLORS as C, ONBOARDING_TYPOGRAPHY as T, ONBOARDING_SPACING as S } from '@/constants/onboarding-theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { getApiBaseUrl } from '@/lib/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  difficulty: string;
  participants_count: number;
  category: string;
  daily_tasks: string[];
}

const FALLBACK_CHALLENGES: Challenge[] = [
  {
    id: 'fb-75-hard',
    title: '75 Hard',
    description: 'The ultimate mental toughness program. Two workouts, a diet, reading, water, and a progress photo — every single day for 75 days.',
    duration_days: 75,
    difficulty: 'extreme',
    participants_count: 2847,
    category: 'physical_toughness',
    daily_tasks: ['2 workouts (one outdoor)', '1 gallon of water', 'Read 10 pages', 'Follow a diet', 'Progress photo'],
  },
  {
    id: 'fb-cold-30',
    title: '30 Day Cold Shower',
    description: 'Start every morning with a cold shower. Build discipline one freezing minute at a time.',
    duration_days: 30,
    difficulty: 'intermediate',
    participants_count: 1203,
    category: 'cold_exposure',
    daily_tasks: ['Cold shower (min 2 min)', 'Rate your discomfort 1-10', 'Log your time'],
  },
  {
    id: 'fb-read-30',
    title: '30 Pages a Day',
    description: 'Read 30 pages every day for 30 days. No audiobooks. No excuses.',
    duration_days: 30,
    difficulty: 'beginner',
    participants_count: 3412,
    category: 'reading_learning',
    daily_tasks: ['Read 30 pages', 'Write 1 takeaway', 'Log your book'],
  },
  {
    id: 'fb-wake-up',
    title: '5AM Club — 21 Days',
    description: 'Wake up at 5AM for 21 days straight. Own your morning, own your life.',
    duration_days: 21,
    difficulty: 'intermediate',
    participants_count: 1876,
    category: 'daily_habits',
    daily_tasks: ['Wake up at 5AM', 'Screenshot alarm', 'Morning routine logged'],
  },
];

interface ChallengePreviewProps {
  onContinue: () => void;
}

export default function ChallengePreview({ onContinue }: ChallengePreviewProps) {
  const { selectedGoals, intensityLevel } = useOnboardingStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const url = baseUrl ? `${baseUrl}/api/challenges` : '';
      if (url) {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data?.challenges?.length > 0) {
            setChallenges(data.challenges.slice(0, 4));
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // Fall through to FALLBACK_CHALLENGES
    }

    const filtered = FALLBACK_CHALLENGES.filter((c) => {
      const goalMatch = selectedGoals.some((g) => c.category.includes(g));
      const intensityMatch = !intensityLevel || c.difficulty === intensityLevel || intensityLevel === 'extreme';
      return goalMatch || intensityMatch;
    });
    setChallenges(filtered.length > 0 ? filtered : FALLBACK_CHALLENGES.slice(0, 3));
    setLoading(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return { bg: C.successMuted, text: C.success };
      case 'intermediate': return { bg: 'rgba(245, 158, 11, 0.15)', text: C.warning };
      case 'extreme': return { bg: C.accentMuted, text: C.accent };
      default: return { bg: C.accentMuted, text: C.accent };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 3 OF 4</Text>
        <Text style={styles.title}>Your challenges{'\n'}are waiting.</Text>
        <Text style={styles.subtitle}>Based on your goals. Tap any to see details.</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={styles.loadingText}>Finding your challenges...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {challenges.map((challenge) => {
            const diffColor = getDifficultyColor(challenge.difficulty);
            const isSelected = selectedChallenge === challenge.id;
            return (
              <Pressable
                key={challenge.id}
                style={[styles.challengeCard, isSelected && styles.challengeCardSelected]}
                onPress={() => setSelectedChallenge(isSelected ? null : challenge.id)}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <View style={[styles.difficultyPill, { backgroundColor: diffColor.bg }]}>
                      <Text style={[styles.difficultyText, { color: diffColor.text }]}>{challenge.difficulty}</Text>
                    </View>
                  </View>
                  <Text style={styles.challengeDuration}>
                    {challenge.duration_days} days · {challenge.participants_count.toLocaleString()} active
                  </Text>
                </View>
                <Text style={styles.challengeDescription} numberOfLines={isSelected ? undefined : 2}>
                  {challenge.description}
                </Text>
                {isSelected && challenge.daily_tasks && (
                  <View style={styles.tasksContainer}>
                    <Text style={styles.tasksLabel}>DAILY REQUIREMENTS</Text>
                    {challenge.daily_tasks.map((task, i) => (
                      <View key={i} style={styles.taskRow}>
                        <View style={styles.taskDot} />
                        <Text style={styles.taskText}>{task}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.ctaContainer}>
        <Pressable style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>
            {selectedChallenge ? 'Join this challenge' : 'Sign up to start'}
          </Text>
        </Pressable>
        <Text style={styles.footerHint}>Create a free account to track your progress</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background, paddingHorizontal: S.screenPadding, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  stepLabel: { fontSize: T.captionSize, color: C.accent, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: T.headingSize, fontWeight: T.headingWeight, color: C.textPrimary, lineHeight: T.headingLineHeight, letterSpacing: T.headingLetterSpacing, marginBottom: 8 },
  subtitle: { fontSize: T.smallSize, color: C.textSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: T.smallSize, color: C.textTertiary },
  scrollView: { flex: 1 },
  scrollContent: { gap: S.cardGap, paddingBottom: 8 },
  challengeCard: { backgroundColor: C.surface, borderRadius: S.cardRadius, padding: 18, borderWidth: 1, borderColor: C.border, gap: 10 },
  challengeCardSelected: { borderColor: C.accent, backgroundColor: C.accentMuted },
  challengeHeader: { gap: 6 },
  challengeTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeTitle: { fontSize: T.subheadingSize, fontWeight: '700', color: C.textPrimary, flex: 1 },
  difficultyPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  difficultyText: { fontSize: T.captionSize, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  challengeDuration: { fontSize: T.captionSize, color: C.textTertiary },
  challengeDescription: { fontSize: T.smallSize, color: C.textSecondary, lineHeight: 20 },
  tasksContainer: { marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, gap: 8 },
  tasksLabel: { fontSize: 11, fontWeight: '700', color: C.textTertiary, letterSpacing: 1.5, marginBottom: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  taskText: { fontSize: T.smallSize, color: C.textSecondary },
  ctaContainer: { paddingTop: 16, gap: 10 },
  primaryButton: { backgroundColor: C.accent, height: S.buttonHeight, borderRadius: S.buttonRadius, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { fontSize: T.bodySize, fontWeight: '700', color: C.textOnAccent },
  footerHint: { fontSize: T.captionSize, color: C.textTertiary, textAlign: 'center' },
});
