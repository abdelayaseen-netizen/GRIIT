/**
 * Task completion form body (extracted from app/task/complete.tsx).
 */
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Pressable,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, Lock, CheckCircle, XCircle, MapPin, Check, Image as GalleryIcon } from "lucide-react-native";
import { DS_COLORS, GRIIT_COLORS } from "@/lib/design-system";
import { InlineError } from "@/components/InlineError";
import { VerificationGates } from "@/components/task/VerificationGates";
import type { TaskHardVerificationConfig } from "@/lib/task-hard-verification";
import type { TaskCompleteConfig } from "@/lib/task-helpers";
import { firstString, goBackOrHome, WORKOUT_KINDS } from "@/lib/task-helpers";
import { styles } from "@/components/task/task-complete-styles";
import {
  RunPickerColumn,
  parseRunKmParts,
  RUN_WHOLE_KM,
  RUN_DEC_KM,
  RUN_DURATION_ITEMS,
} from "@/components/task/RunPickerColumn";

export interface TaskCompleteFormProps {
  error: string | null;
  clearError: () => void;
  isHardVerificationTask: boolean;
  hardVerificationConfig: TaskHardVerificationConfig;
  onHardGatesResolved: (ok: boolean, loc?: { lat: number; lng: number }) => void;
  onHardTimeWindowFailed: () => void;
  timeWindowFailed: boolean;
  hardGatesPassed: boolean;
  taskName: string;
  headerChallengeName: string;
  headerCurrentDay: number;
  headerDurationDays: number;
  taskTypeRaw: string;
  config: TaskCompleteConfig;
  isPureManual: boolean;
  canSubmit: boolean;
  runManualComplete: () => void;
  isSubmitting: boolean;
  manualScale: Animated.Value;
  journalPrompt: string;
  journalText: string;
  handleJournalChange: (text: string) => void;
  minWords: number;
  wordCount: number;
  showWorkoutTimer: boolean;
  requiredSeconds: number;
  isHardMode: boolean;
  isCountdown: boolean;
  timerDisplay: string;
  progressFrac: number;
  timerSeconds: number;
  timerOk: boolean;
  isTimerRunning: boolean;
  toggleTimer: () => void;
  showWorkoutEntry: boolean;
  workoutDuration: string;
  setWorkoutDuration: (s: string) => void;
  workoutKind: string;
  setWorkoutKind: (s: string) => void;
  workoutNotes: string;
  setWorkoutNotes: (s: string) => void;
  showRunEntry: boolean;
  isRunTimed: boolean;
  runDistance: string;
  setRunDistance: (s: string) => void;
  runDuration: string;
  setRunDuration: (s: string) => void;
  runDistanceKm: React.MutableRefObject<string>;
  runDurationMin: React.MutableRefObject<string>;
  runKm: number;
  runMin: number;
  minDurMinutes: number;
  needsPhotoProof: boolean;
  photoUri: string | null;
  photoUrl: string | null;
  photoUploading: boolean;
  handleTakePhoto: () => Promise<void>;
  handlePickImage: () => Promise<void>;
  clearPhoto: () => void;
  photoCaption: string;
  setPhotoCaption: (s: string) => void;
  handleSubmit: () => void | Promise<void>;
  heartRateData: { avg: number; peak: number } | null;
  setHeartRateData: (v: { avg: number; peak: number } | null) => void;
  heartRateManual: string;
  setHeartRateManual: (s: string) => void;
  threshold: number;
  showError: (msg: string) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (v: { lat: number; lng: number } | null) => void;
  distance: number | null;
  radius: number;
  handleCheckLocation: () => Promise<void>;
}

export function TaskCompleteForm(props: TaskCompleteFormProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskDescription?: string }>();
  const {
    error,
    clearError,
    isHardVerificationTask,
    hardVerificationConfig,
    onHardGatesResolved,
    onHardTimeWindowFailed,
    timeWindowFailed,
    hardGatesPassed,
    taskName,
    headerChallengeName,
    headerCurrentDay,
    headerDurationDays,
    taskTypeRaw,
    config,
    isPureManual,
    canSubmit,
    runManualComplete,
    isSubmitting,
    manualScale,
    journalPrompt,
    journalText,
    handleJournalChange,
    minWords,
    wordCount,
    showWorkoutTimer,
    requiredSeconds,
    isHardMode,
    isCountdown,
    timerDisplay,
    progressFrac,
    timerSeconds,
    timerOk,
    isTimerRunning,
    toggleTimer,
    showWorkoutEntry,
    workoutDuration,
    setWorkoutDuration,
    workoutKind,
    setWorkoutKind,
    workoutNotes,
    setWorkoutNotes,
    showRunEntry,
    isRunTimed,
    runDistance,
    setRunDistance,
    runDuration,
    setRunDuration,
    runDistanceKm,
    runDurationMin,
    runKm,
    runMin,
    minDurMinutes,
    needsPhotoProof,
    photoUri,
    photoUrl,
    photoUploading,
    handleTakePhoto,
    handlePickImage,
    clearPhoto,
    photoCaption,
    setPhotoCaption,
    handleSubmit,
    heartRateData,
    setHeartRateData,
    heartRateManual,
    setHeartRateManual,
    threshold,
    showError,
    userLocation,
    setUserLocation,
    distance,
    radius,
    handleCheckLocation,
  } = props;

  return (
  <View>
<InlineError message={error ?? ""} onDismiss={clearError} />

{isHardVerificationTask ? (
  <VerificationGates
    config={hardVerificationConfig}
    photoSatisfied={
      config.require_camera_only !== true || !needsPhotoProof || !!photoUrl
    }
    onGatesResolved={onHardGatesResolved}
    onTimeWindowFailed={onHardTimeWindowFailed}
  />
) : null}

{isHardVerificationTask && timeWindowFailed ? (
  <View accessibilityLabel="Time window closed, task missed">
    <View style={styles.missedWindowCard}>
      <XCircle size={40} color={DS_COLORS.BADGE_HARD_RED} accessibilityLabel="Window closed icon" />
      <Text style={styles.missedWindowTitle}>Missed today</Text>
      <Text style={styles.missedWindowSub}>
        Window closed. Set an alarm and come back stronger tomorrow.
      </Text>
      <TouchableOpacity
        style={styles.missedGoBackBtn}
        onPress={() => goBackOrHome(router)}
        accessibilityRole="button"
        accessibilityLabel="Go back after missed task window"
      >
        <Text style={styles.missedGoBackBtnText}>Go back</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.missedRedirectCard} accessibilityLabel="You still have other tasks">
      <Text style={styles.missedRedirectTitle}>You still have other tasks today.</Text>
      <Text style={styles.missedRedirectSub}>Complete them to keep your streak alive.</Text>
    </View>
  </View>
) : null}

{!(isHardVerificationTask && timeWindowFailed) ? (
  <>
<View
  pointerEvents={isHardVerificationTask && !hardGatesPassed ? "none" : "auto"}
  style={isHardVerificationTask && !hardGatesPassed ? styles.hardGatesDimmed : undefined}
>
<Text style={styles.screenTitle}>{taskName}</Text>
<View style={styles.taskMetaRow}>
  <View style={styles.pillDay}>
    <Text style={styles.pillDayText}>
      {headerChallengeName} · Day {headerCurrentDay} of {headerDurationDays}
    </Text>
  </View>
  {headerDurationDays > 1 && headerCurrentDay > 1 ? (
    <View style={styles.pillStreak}>
      <Text style={styles.pillStreakText}>
        {headerCurrentDay - 1} day streak
      </Text>
    </View>
  ) : null}
</View>
{firstString(params.taskDescription) ? <Text style={styles.muted}>{firstString(params.taskDescription)}</Text> : null}

{/* Manual / simple — honor tap */}
{(taskTypeRaw === "manual" || taskTypeRaw === "simple") && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Mark as done</Text>
    <Pressable
      onPress={() => {
        if (!isPureManual || !canSubmit) return;
        runManualComplete();
      }}
      disabled={!isPureManual || !canSubmit || isSubmitting}
      style={styles.manualPress}
      accessibilityRole="button"
      accessibilityLabel={
        isHardVerificationTask && !hardGatesPassed
          ? "Verification gates must pass first"
          : "Mark task complete"
      }
      accessibilityState={{ disabled: !isPureManual || !canSubmit || isSubmitting }}
    >
      <Animated.View style={[styles.manualCircle, { transform: [{ scale: manualScale }] }]}>
        <Check
          size={56}
          color={DS_COLORS.DISCOVER_GREEN}
          strokeWidth={2.5}
          style={{ opacity: isSubmitting ? 0.4 : 1 }}
        />
      </Animated.View>
      <Text style={styles.manualHint}>Tap to mark complete</Text>
      <Text style={styles.hintSmall}>Your word is your proof.</Text>
    </Pressable>
  </View>
)}

{/* Journal */}
{taskTypeRaw === "journal" && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Journal entry</Text>
    <Text style={styles.journalPromptText}>{journalPrompt}</Text>
    <TextInput
      style={styles.journalInput}
      placeholder="Start writing..."
      placeholderTextColor={DS_COLORS.inputPlaceholder}
      value={journalText}
      onChangeText={handleJournalChange}
      multiline
      numberOfLines={10}
      contextMenuHidden
      autoCorrect
      spellCheck
    />
    {minWords > 0 && (
      <View style={styles.wordCountRow}>
        <View style={styles.wordRing}>
          <View
            style={[
              styles.wordRingFill,
              {
                width: `${Math.min(100, (wordCount / minWords) * 100)}%`,
                backgroundColor: wordCount >= minWords ? DS_COLORS.GREEN : GRIIT_COLORS.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.wordCountText, wordCount >= minWords && { color: DS_COLORS.GREEN }]}>
          {wordCount} / {minWords} words
        </Text>
      </View>
    )}
  </View>
)}

{/* Timer (timer tasks, or timed run/workout with strict on-screen mode) */}
{showWorkoutTimer && requiredSeconds > 0 && (
  <View style={styles.card}>
    {taskTypeRaw === "workout" && (
      <Text style={styles.sectionLabel}>
        {config.require_heart_rate ? "Workout — heart rate verified" : "Workout — timed"}
      </Text>
    )}
    {isHardMode && (
      <View style={styles.hardModeBadge}>
        <Lock size={14} color={GRIIT_COLORS.primary} />
        <Text style={styles.hardModeText}>Hard mode — stay on this screen</Text>
      </View>
    )}
    <Text style={styles.timerDisplay}>{timerDisplay}</Text>
    <View style={styles.progressBar}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${progressFrac * 100}%`,
            backgroundColor: timerSeconds >= requiredSeconds ? DS_COLORS.GREEN : GRIIT_COLORS.primary,
          },
        ]}
      />
    </View>
    <Text style={styles.hintSmall}>
      {isCountdown ? "Counting down" : "Counting up"} · {config.min_duration_minutes ?? 0} min required
    </Text>
    <View style={styles.timerRow}>
      <TouchableOpacity
        style={styles.secondaryBtnSmall}
        onPress={toggleTimer}
        accessibilityRole="button"
        accessibilityLabel={isTimerRunning ? "Pause timer" : "Resume timer"}
      >
        <Text style={styles.secondaryBtnText}>{isTimerRunning ? "Pause" : "Resume"}</Text>
      </TouchableOpacity>
    </View>
    {isHardMode && isTimerRunning && (
      <Text style={styles.warnSmall}>Leaving this screen will pause your timer.</Text>
    )}
  </View>
)}

{/* Workout — duration + kind (no distance) */}
{showWorkoutEntry && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Log your workout</Text>
    <Text style={styles.hintSmall}>Duration required. Add type and notes if you want.</Text>
    <TextInput
      style={styles.textField}
      placeholder="Duration (minutes)"
      placeholderTextColor={DS_COLORS.inputPlaceholder}
      keyboardType="number-pad"
      value={workoutDuration}
      onChangeText={setWorkoutDuration}
    />
    <Text style={[styles.hintSmall, { marginBottom: 8 }]}>Type of workout</Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
      {WORKOUT_KINDS.map((k) => (
        <TouchableOpacity
          key={k}
          style={[
            styles.kindChip,
            workoutKind === k && styles.kindChipOn,
          ]}
          onPress={() => setWorkoutKind(k)}
          accessibilityRole="button"
          accessibilityLabel={k}
        >
          <Text style={[styles.kindChipText, workoutKind === k && styles.kindChipTextOn]}>{k}</Text>
        </TouchableOpacity>
      ))}
    </View>
    <TextInput
      style={[styles.textField, { minHeight: 72 }]}
      placeholder="Notes (optional)"
      placeholderTextColor={DS_COLORS.inputPlaceholder}
      value={workoutNotes}
      onChangeText={setWorkoutNotes}
      multiline
    />
  </View>
)}

{/* Run — manual entry + Strava placeholder */}
{showRunEntry && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Log your run</Text>
    <Text style={styles.hintSmall}>
      {isRunTimed && isHardMode
        ? "Optional: add distance below. Duration is tracked by the timer above."
        : isRunTimed && !isHardMode
          ? `Log at least ${minDurMinutes} minutes (duration required). Distance optional unless your challenge expects it.`
          : "Distance and duration are required. Photo proof if your challenge requires it."}
    </Text>
    <Text style={styles.pickerLabel}>Distance (km)</Text>
    <View style={styles.runPickerContainer}>
      <View style={styles.runPickerHighlightBand} pointerEvents="none" />
      <View style={styles.runPickerColumns}>
        <RunPickerColumn
          data={RUN_WHOLE_KM}
          selectedIndex={parseRunKmParts(runDistance || "0.0").whole}
          onSelectIndex={(i) => {
            const d = parseRunKmParts(runDistance || "0.0").dec;
            const next = `${i}.${d}`;
            setRunDistance(next);
            runDistanceKm.current = next;
          }}
        />
        <RunPickerColumn
          data={RUN_DEC_KM}
          selectedIndex={parseRunKmParts(runDistance || "0.0").dec}
          onSelectIndex={(i) => {
            const w = parseRunKmParts(runDistance || "0.0").whole;
            const next = `${w}.${i}`;
            setRunDistance(next);
            runDistanceKm.current = next;
          }}
        />
      </View>
    </View>

    <Text style={styles.pickerLabel}>Duration (minutes)</Text>
    <View style={styles.runPickerContainer}>
      <View style={styles.runPickerHighlightBand} pointerEvents="none" />
      <View style={styles.runPickerColumnsSingle}>
        <RunPickerColumn
          data={RUN_DURATION_ITEMS}
          selectedIndex={(() => {
            const n = parseInt((runDuration || "0").trim(), 10);
            return Number.isFinite(n) ? Math.min(180, Math.max(0, n)) : 0;
          })()}
          onSelectIndex={(i) => {
            const next = String(i);
            setRunDuration(next);
            runDurationMin.current = next;
          }}
        />
      </View>
    </View>
    {!Number.isNaN(runKm) && runKm > 0 && !Number.isNaN(runMin) && runMin > 0 ? (
      <Text style={styles.paceHint}>
        Pace: {(runMin / runKm).toFixed(2)} min/km
      </Text>
    ) : null}
    <View style={styles.stravaNote} accessibilityLabel="Strava integration coming soon">
      <Text style={styles.stravaNoteText}>Strava auto-import coming soon</Text>
    </View>
  </View>
)}

{/* Heart rate */}
{config.require_heart_rate && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Heart rate</Text>
    <Text style={styles.hintSmall}>Minimum {threshold} BPM average</Text>
    {heartRateData ? (
      <View style={styles.hrBox}>
        <View style={styles.hrRow}>
          <View>
            <Text style={[styles.hrValue, { color: heartRateData.avg >= threshold ? DS_COLORS.GREEN : DS_COLORS.danger }]}>
              {heartRateData.avg}
            </Text>
            <Text style={styles.hintSmall}>avg BPM</Text>
          </View>
          <View>
            <Text style={[styles.hrValue, { color: GRIIT_COLORS.primary }]}>{heartRateData.peak}</Text>
            <Text style={styles.hintSmall}>peak BPM</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setHeartRateData(null)}
          accessibilityRole="button"
          accessibilityLabel="Change heart rate"
        >
          <Text style={styles.link}>Change</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <>
        <TextInput
          style={styles.textField}
          placeholder="Average BPM (e.g. 120)"
          placeholderTextColor={DS_COLORS.inputPlaceholder}
          value={heartRateManual}
          onChangeText={setHeartRateManual}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            const avg = parseInt(heartRateManual.trim(), 10);
            if (Number.isNaN(avg) || avg < 0) {
              showError("Enter a valid heart rate.");
              return;
            }
            setHeartRateData({ avg, peak: avg + Math.floor(avg * 0.1) });
            setHeartRateManual("");
          }}
          accessibilityRole="button"
          accessibilityLabel="Save heart rate"
        >
          <Text style={styles.primaryBtnText}>Save heart rate</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
)}

{/* Location */}
{config.require_location && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>Location</Text>
    <Text style={styles.hintSmall}>Must be at: {config.location_name ?? "the pinned location"}</Text>
    {userLocation ? (
      <View style={styles.locBox}>
        {distance !== null && distance <= radius ? (
          <>
            <CheckCircle size={28} color={DS_COLORS.GREEN} />
            <Text style={[styles.locStatus, { color: DS_COLORS.GREEN }]}>Verified</Text>
          </>
        ) : (
          <>
            <XCircle size={28} color={DS_COLORS.danger} />
            <Text style={[styles.locStatus, { color: DS_COLORS.danger }]}>
              Too far ({distance != null ? Math.round(distance) : "?"}m / {radius}m)
            </Text>
          </>
        )}
        <TouchableOpacity
          onPress={() => setUserLocation(null)}
          accessibilityRole="button"
          accessibilityLabel="Verify location again"
        >
          <Text style={styles.link}>Check again</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        style={styles.locCta}
        onPress={handleCheckLocation}
        accessibilityRole="button"
        accessibilityLabel="Verify my location"
      >
        <MapPin size={24} color={GRIIT_COLORS.primary} />
        <Text style={styles.locCtaText}>Verify my location</Text>
      </TouchableOpacity>
    )}
  </View>
)}

{/* Photo proof (required add-on or photo task) */}
{needsPhotoProof && (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>{taskTypeRaw === "photo" ? "Submit proof" : "Photo proof"}</Text>
    {photoUri ? (
      <View>
        <Image
          source={{ uri: photoUri }}
          style={styles.photoPreview}
          contentFit="cover"
          cachePolicy="memory-disk"
          accessibilityLabel="Photo proof preview"
        />
        <TouchableOpacity
          onPress={() => {
            clearPhoto();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retake photo"
        >
          <Text style={styles.link}>Retake</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View>
        <View style={styles.photoGrid}>
          <TouchableOpacity
            style={styles.photoGridBtn}
            onPress={handleTakePhoto}
            disabled={photoUploading}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityState={{ disabled: photoUploading }}
          >
            {photoUploading ? (
              <ActivityIndicator color={GRIIT_COLORS.primary} />
            ) : (
              <>
                <Camera size={22} color={DS_COLORS.TEXT_SECONDARY} />
                <Text style={styles.photoGridLabel}>Take photo</Text>
              </>
            )}
          </TouchableOpacity>
          {config.require_camera_only !== true ? (
            <TouchableOpacity
              style={styles.photoGridBtn}
              onPress={handlePickImage}
              disabled={photoUploading}
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
              accessibilityState={{ disabled: photoUploading }}
            >
              <GalleryIcon size={22} color={DS_COLORS.TEXT_SECONDARY} />
              <Text style={styles.photoGridLabel}>Gallery</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {config.require_camera_only === true ? (
          <Text style={styles.hintSmall}>Camera only — gallery uploads are disabled for this task.</Text>
        ) : null}
      </View>
    )}
    {photoUrl ? <Text style={styles.hintSmall}>Uploaded ✓</Text> : null}
    {taskTypeRaw === "photo" ? (
      <TextInput
        style={[styles.textField, { marginTop: 12 }]}
        placeholder="Caption (optional)"
        placeholderTextColor={DS_COLORS.inputPlaceholder}
        value={photoCaption}
        onChangeText={setPhotoCaption}
        maxLength={200}
      />
    ) : null}
  </View>
)}
</View>

{/* Submit — hidden for pure manual/simple when ready (circle tap submits) */}
{!(isPureManual && canSubmit) && (
  <View style={styles.submitSection}>
    <TouchableOpacity
      style={[styles.primaryBtn, (!canSubmit || isSubmitting) && styles.primaryBtnDisabled]}
      onPress={() => void handleSubmit()}
      disabled={!canSubmit || isSubmitting}
      accessibilityRole="button"
      accessibilityLabel={
        isHardVerificationTask && !hardGatesPassed
          ? "Verification gates must pass first"
          : "Complete task"
      }
      accessibilityState={{ disabled: !canSubmit || isSubmitting }}
    >
      {isSubmitting ? (
        <ActivityIndicator color={DS_COLORS.WHITE} size="small" />
      ) : (
        <Text style={styles.primaryBtnText}>
          {isHardVerificationTask && !hardGatesPassed
            ? "Gates must pass"
            : showWorkoutTimer && requiredSeconds > 0 && !timerOk
              ? `${Math.floor(Math.max(0, requiredSeconds - timerSeconds) / 60)}:${String(Math.max(0, requiredSeconds - timerSeconds) % 60).padStart(2, "0")} remaining`
              : "Complete task"}
        </Text>
      )}
    </TouchableOpacity>
  </View>
)}
  </>
) : null}
  </View>
  );
}
