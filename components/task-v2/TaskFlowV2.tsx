import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DS_V3 } from "@/lib/design-system";
import PushedHeader from "@/components/ds/PushedHeader";
import { TaskChrome } from "./TaskChrome";
import { styles } from "./taskFlowStyles";
import { useTaskFlowV2 } from "./useTaskFlowV2";
import { AskStep } from "./steps/AskStep";
import { BlockedStep } from "./steps/BlockedStep";
import { CaptureStep } from "./steps/CaptureStep";
import { ChallengeDoneStep } from "./steps/ChallengeDoneStep";
import { CheckinEntryStep } from "./steps/CheckinEntryStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { CountStep } from "./steps/CountStep";
import { DiscardPhotoModal } from "./steps/DiscardPhotoModal";
import { FailedStep } from "./steps/FailedStep";
import { LogStep } from "./steps/LogStep";
import { ReviewStep } from "./steps/ReviewStep";
import { RunningStep } from "./steps/RunningStep";
import { SessionStep } from "./steps/SessionStep";
import { TimerEntryStep } from "./steps/TimerEntryStep";
import { VerifyingStep } from "./steps/VerifyingStep";
import { WindowClosedStep } from "./steps/WindowClosedStep";
import { WriteStep } from "./steps/WriteStep";
import { workStepOwnsChrome } from "@/lib/work-step";

export function TaskFlowV2() {
  const f = useTaskFlowV2();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        f.dark && { backgroundColor: DS_V3.color.canvas },
        (f.step === "verifying" || f.step === "ask") && { backgroundColor: DS_V3.color.canvas },
      ]}
    >
      {!f.hideChrome && !workStepOwnsChrome(f.step, f.taskType) ? (
        <View style={{ paddingTop: insets.top }}>
          {f.step === "ask" ? (
            <PushedHeader
              title={f.headerTitle}
              onBack={f.goBack}
            />
          ) : (
            <TaskChrome title={f.headerTitle} dark={f.dark} onBack={f.goBack} />
          )}
        </View>
      ) : null}

      {f.step === "window_closed" ? (
        <WindowClosedStep
          closedAt={f.closedAt}
          onBack={f.exit}
          forbidden={f.windowForbidden}
        />
      ) : null}

      {f.step === "blocked" ? (
        <BlockedStep
          windowStatus={f.windowEval.status}
          windowStart={f.config.schedule_window_start}
          windowEnd={f.config.schedule_window_end}
          place={f.place}
          radius={f.radius}
          gpsMeters={f.gps?.m ?? null}
          onCheckAgain={() => void f.refreshGps()}
          onExit={f.exit}
        />
      ) : null}

      {f.step === "entry" && f.taskType === "timer" ? (
        <TimerEntryStep
          taskName={f.taskName}
          headerTitle={f.headerTitle}
          requiredSeconds={f.requiredSeconds}
          soundOn={f.soundOn}
          onSoundOn={f.setSoundOn}
          onStart={() => void f.startTimer()}
          onBack={f.goBack}
          footerCaption={f.footerCaption}
          footerBrand={f.footerBrand}
        />
      ) : null}

      {f.step === "entry" && f.taskType === "checkin" ? (
        <CheckinEntryStep
          taskName={f.taskName}
          radius={f.radius}
          place={f.place}
          gps={f.gps}
          onHere={f.onHere}
        />
      ) : null}

      {f.step === "log" ? (
        <LogStep
          taskType={f.taskType}
          taskName={f.taskName}
          headerTitle={f.headerTitle}
          footerCaption={f.footerCaption}
          footerBrand={f.footerBrand}
          onToggleUnit={() => f.persistUnit(f.unit === "km" ? "mi" : "km")}
          unit={f.unit}
          distance={f.distance}
          durationSec={f.durationSec}
          workoutMin={f.workoutMin}
          minDurationMinutes={f.config.min_duration_minutes ?? 0}
          kind={f.kind}
          onKind={f.setKind}
          onDistance={f.setDistance}
          onDuration={f.setDurationSec}
          onMinutes={f.setWorkoutMin}
          onUseTimer={f.onUseTimer}
          onNextPhoto={f.onNextPhoto}
          onPost={f.onPostRun}
          onBack={f.goBack}
          fromGps={f.fromGps}
          hasCamera={f.requirePhoto}
          targetDistance={f.targetDistance}
        />
      ) : null}

      {f.step === "session" ? (
        <SessionStep
          taskType={f.taskType}
          sessionUp={f.sessionUp}
          onStop={f.onSessionStop}
          onCancel={f.onSessionCancel}
        />
      ) : null}

      {f.step === "capture" ? (
        <CaptureStep
          challengeName={f.challengeName}
          taskName={f.taskName}
          currentDay={f.currentDay}
          workDone={f.workDone}
          photoAfter={f.photoAfter}
          windowLabel={f.windowLabel}
          onCancel={f.goBack}
          onCaptured={f.onCaptured}
        />
      ) : null}

      {f.step === "review" && f.photoUri ? (
        <ReviewStep
          photoUri={f.photoUri}
          challengeName={f.challengeName}
          currentDay={f.currentDay}
          taskName={f.taskName}
          gateLabel={f.chromeTitle}
          caption={f.caption}
          onCaption={f.setCaption}
          onRetake={f.onRetake}
          onPost={f.onReviewPost}
        />
      ) : null}

      {f.step === "running" ? (
        <RunningStep
          remainingSec={f.remainingSec}
          taskName={f.taskName}
          headerTitle={f.headerTitle}
          startedAtIso={f.startedAtIso}
          requiredSeconds={f.requiredSeconds}
          onPause={f.pauseTimer}
          onReset={() => void f.resetTimer()}
          onPost={() => void f.submitTimer()}
          onBack={f.goBack}
          footerCaption={f.footerCaption}
          footerBrand={f.footerBrand}
        />
      ) : null}

      {f.step === "write" ? (
        <WriteStep
          text={f.text}
          minWords={f.minWords}
          currentDay={f.currentDay}
          taskName={f.taskName}
          headerTitle={f.headerTitle}
          footerCaption={f.writeFooterCaption}
          footerBrand={f.footerBrand}
          onChangeText={f.setText}
          onPost={f.onJournalPost}
          onBack={f.goBack}
        />
      ) : null}

      {f.step === "count" ? (
        <CountStep
          count={f.count}
          counterGoal={f.counterGoal}
          counterUnit={f.counterUnit}
          taskName={f.taskName}
          headerTitle={f.headerTitle}
          footerCaption={f.footerCaption}
          footerBrand={f.footerBrand}
          keypadOpen={f.keypad?.field === "count"}
          onTypeCount={f.onTypeCount}
          onAddOne={f.onAddOne}
          onOpenKeypad={f.onOpenCountKeypad}
          onRemoveOne={f.onRemoveOne}
          onSubmit={f.onSubmitCount}
          onBack={f.goBack}
        />
      ) : null}

      {f.step === "ask" ? (
        <AskStep
          taskName={f.taskName}
          loading={f.saving}
          footerCaption={f.footerCaption}
          footerBrand={f.footerBrand}
          onDidIt={f.onDidIt}
          onNotYet={f.exit}
        />
      ) : null}

      {f.step === "verifying" ? <VerifyingStep taskType={f.taskType} /> : null}

      {f.step === "confirmation" && f.result ? (
        <ConfirmationStep
          result={f.result}
          taskName={f.taskName}
          honest={f.isHonest}
          optional={!f.taskRequired}
          proofUri={f.photoUri ?? undefined}
          verifyLine={f.verifyLine}
          onDone={f.exit}
          onShare={f.onShare}
        />
      ) : null}

      {f.step === "day_open" && f.dayOpen ? (
        <ChallengeDoneStep
          model={f.dayOpen}
          proofUri={f.photoUri}
          shareFailed={f.shareFailed}
          sharing={f.sharing}
          onOpenTask={f.openDayOpenTask}
          onNext={f.goNextTask}
          onDone={f.exit}
          onShare={f.onShareProof}
          onKeep={f.onKeepProof}
        />
      ) : null}

      {f.step === "failed" ? (
        <FailedStep
          fail={f.fail}
          hasPhoto={!!f.photoUri}
          onPrimary={() => {
            if (f.fail.primaryAction === "back") f.goBackFromFailure();
            else f.retryFailedSubmit();
          }}
          onKeepLater={f.exit}
        />
      ) : null}

      <DiscardPhotoModal
        visible={f.discardAsk}
        onDiscard={f.onDiscardPhoto}
        onKeep={f.onKeepPhoto}
      />
    </View>
  );
}
