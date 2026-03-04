import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, AppState, AppStateStatus } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Play, Pause, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";

export default function TimerTaskScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { activeChallenge, completeTask } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [strictResetMessage, setStrictResetMessage] = useState<string | null>(null);
  const resetInProgressRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tasks = (activeChallenge as any)?.challenges?.challenge_tasks ?? [];
  const task = taskId ? tasks.find((t: any) => t.id === taskId) : null;
  const strictTimerMode = task?.strict_timer_mode === true;

  const resetTimer = useCallback(() => {
    if (resetInProgressRef.current) return;
    resetInProgressRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIntervalId(null);
    setSeconds(0);
    setIsRunning(false);
    setStrictResetMessage("Timer reset: Strict Mode requires staying on this screen.");
    resetInProgressRef.current = false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (strictTimerMode && isRunning) {
          resetTimer();
        }
      };
    }, [strictTimerMode, isRunning, resetTimer])
  );

  useEffect(() => {
    if (!strictTimerMode) return;
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        if (isRunning) resetTimer();
      }
    });
    return () => sub.remove();
  }, [strictTimerMode, isRunning, resetTimer]);

  const handleStartPause = () => {
    setStrictResetMessage(null);
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
      setIsRunning(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const id = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
      intervalRef.current = id;
      setIntervalId(id);
      setIsRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSubmit = async () => {
    if (seconds < 60) {
      Alert.alert('Timer Too Short', 'Please run the timer for at least 1 minute');
      return;
    }

    if (!activeChallenge) {
      Alert.alert('Error', 'No active challenge found');
      return;
    }

    if (!taskId) {
      Alert.alert('Error', 'Task not found');
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    setLoading(true);
    try {
      completeTask({
        activeChallengeId: activeChallenge.id,
        taskId,
        value: Math.floor(seconds / 60),
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', `Timer completed: ${Math.floor(seconds / 60)} minutes`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <Text style={styles.timerLabel}>{isRunning ? 'Running...' : 'Paused'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.controlButton, isRunning && styles.pauseButton]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          {isRunning ? (
            <>
              <Pause size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Pause</Text>
            </>
          ) : (
            <>
              <Play size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Start Timer</Text>
            </>
          )}
        </TouchableOpacity>

        {seconds >= 60 && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Complete Task</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums' as any],
  },
  timerLabel: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  strictBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  strictBannerText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
});
