import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import type { Router } from "expo-router";
import { trpcMutate } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import { ROUTES } from "@/lib/routes";
import { captureError } from "@/lib/sentry";
import { trackEvent } from "@/lib/analytics";
import { sharePlainMessage } from "@/lib/share";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import {
  buildCreatePayload,
  validateDraftTasks,
  canProceedStep1,
  type ParticipationTypeUI,
  type CreateChallengeDraft,
} from "@/lib/create-challenge-helpers";
import type { ChallengeType, ChallengeVisibility, ReplayPolicy } from "@/types";
import type { TaskEditorTask } from "@/components/TaskEditorModal";
import { useCelebrationStore } from "@/store/celebrationStore";
import type { GateContext } from "@/components/AuthGateModal";

export const CREATE_CHALLENGE_DRAFT_KEY = "griit_challenge_draft";

type Who = "solo" | "duo" | "squad";
type PhotoProof = "off" | "optional" | "required";
type TeamRules = "all" | "shared";
type DifficultyMode = "standard" | "hard";

type WizardPersistenceArgs = {
  router: Router;
  user: { id: string } | null;
  isGuest: boolean;
  showGate: (context: GateContext) => void;
  clearWizardError: () => void;
  showWizardError: (msg: string) => void;
  pendingNavId: MutableRefObject<string | null>;
  step: number;
  setStep: (n: number) => void;
  title: string;
  setTitle: (v: string) => void;
  who: Who;
  setWho: (v: Who) => void;
  durationDays: number | null;
  setDurationDays: (v: number | null) => void;
  customDur: string;
  setCustomDur: (v: string) => void;
  challengeType: ChallengeType;
  setChallengeType: (v: ChallengeType) => void;
  tasks: (TaskEditorTask & { wizardType?: string })[];
  setTasks: Dispatch<SetStateAction<(TaskEditorTask & { wizardType?: string })[]>>;
  selectedPackId: string | null;
  setSelectedPackId: (v: string | null) => void;
  difficultyMode: DifficultyMode;
  setDifficultyMode: (v: DifficultyMode) => void;
  photoProof: PhotoProof;
  setPhotoProof: (v: PhotoProof) => void;
  categories: string[];
  setCategories: Dispatch<SetStateAction<string[]>>;
  teamRules: TeamRules;
  setTeamRules: (v: TeamRules) => void;
  visibility: ChallengeVisibility;
  setVisibility: (v: ChallengeVisibility) => void;
  duoInvite: string;
  setDuoInvite: (v: string) => void;
  setResumeBanner: (v: boolean) => void;
  setSubmitting: (v: boolean) => void;
  setCancelDraftVisible: (v: boolean) => void;
  participation: ParticipationTypeUI;
  teamSize: number;
  duration: number;
  applyPhotoPolicyToTasks: (list: (TaskEditorTask & { wizardType?: string })[]) => (TaskEditorTask & { wizardType?: string })[];
};

export function useCreateChallengeWizardPersistence(a: WizardPersistenceArgs) {
  const {
    router,
    user,
    isGuest,
    showGate,
    clearWizardError,
    showWizardError,
    pendingNavId,
    step,
    setStep,
    title,
    setTitle,
    who,
    setWho,
    durationDays,
    setDurationDays,
    customDur,
    setCustomDur,
    challengeType,
    setChallengeType,
    tasks,
    setTasks,
    selectedPackId,
    setSelectedPackId,
    difficultyMode,
    setDifficultyMode,
    photoProof,
    setPhotoProof,
    categories,
    setCategories,
    teamRules,
    setTeamRules,
    visibility,
    setVisibility,
    duoInvite,
    setDuoInvite,
    setResumeBanner,
    setSubmitting,
    setCancelDraftVisible,
    participation,
    teamSize,
    duration,
    applyPhotoPolicyToTasks,
  } = a;

  const draftPayload = useCallback(
    () => ({
      step,
      title,
      who,
      durationDays,
      customDur,
      challengeType,
      tasks,
      difficultyMode,
      photoProof,
      categories,
      teamRules,
      visibility,
      duoInvite,
      selectedPackId,
    }),
    [
      step,
      title,
      who,
      durationDays,
      customDur,
      challengeType,
      tasks,
      difficultyMode,
      photoProof,
      categories,
      teamRules,
      visibility,
      duoInvite,
      selectedPackId,
    ]
  );

  const saveDraft = useCallback(async () => {
    try {
      await AsyncStorage.setItem(CREATE_CHALLENGE_DRAFT_KEY, JSON.stringify(draftPayload()));
    } catch (e) {
      captureError(e, "CreateChallengeWizardSaveDraft");
    }
    router.back();
  }, [draftPayload, router]);

  const tryCancel = useCallback(() => {
    const hasData =
      title.trim().length > 0 ||
      tasks.length > 0 ||
      categories.length > 0 ||
      step > 1;
    if (!hasData) {
      router.back();
      return;
    }
    setCancelDraftVisible(true);
  }, [title, tasks.length, categories.length, step, router, setCancelDraftVisible]);

  const resumeDraft = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CREATE_CHALLENGE_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Record<string, unknown>;
      if (typeof d.title === "string") setTitle(d.title);
      if (d.who === "solo" || d.who === "duo" || d.who === "squad") setWho(d.who);
      if (typeof d.durationDays === "number" || d.durationDays === null) setDurationDays(d.durationDays as number | null);
      if (typeof d.customDur === "string") setCustomDur(d.customDur);
      if (d.challengeType === "standard" || d.challengeType === "one_day") setChallengeType(d.challengeType);
      if (Array.isArray(d.tasks)) setTasks(d.tasks as unknown as (TaskEditorTask & { wizardType?: string })[]);
      if (typeof d.selectedPackId === "string" || d.selectedPackId === null) setSelectedPackId(d.selectedPackId as string | null);
      if (d.difficultyMode === "standard" || d.difficultyMode === "hard") setDifficultyMode(d.difficultyMode);
      if (d.photoProof === "off" || d.photoProof === "optional" || d.photoProof === "required") setPhotoProof(d.photoProof);
      if (Array.isArray(d.categories)) setCategories(d.categories as string[]);
      if (d.teamRules === "all" || d.teamRules === "shared") setTeamRules(d.teamRules);
      if (d.visibility === "PUBLIC" || d.visibility === "FRIENDS" || d.visibility === "PRIVATE") setVisibility(d.visibility);
      if (typeof d.duoInvite === "string") setDuoInvite(d.duoInvite);
      if (typeof d.step === "number") setStep(Math.min(4, Math.max(1, d.step)));
      setResumeBanner(false);
    } catch (e) {
      captureError(e, "CreateChallengeWizardResumeDraft");
    }
  }, [
    setTitle,
    setWho,
    setDurationDays,
    setCustomDur,
    setChallengeType,
    setTasks,
    setSelectedPackId,
    setDifficultyMode,
    setPhotoProof,
    setCategories,
    setTeamRules,
    setVisibility,
    setDuoInvite,
    setStep,
    setResumeBanner,
  ]);

  const submitChallenge = useCallback(
    async (publishStatus: "published" | "draft") => {
      if (isGuest) {
        showGate("create");
        return;
      }
      clearWizardError();
      const list = applyPhotoPolicyToTasks(tasks);
      const draftTasks = list as unknown as CreateChallengeDraft["tasks"];
      const v = validateDraftTasks(draftTasks, participation);
      if (!v.valid) {
        showWizardError(v.error ?? "Fix tasks and try again.");
        return;
      }
      const liveDate =
        challengeType === "one_day" ? new Date().toISOString().slice(0, 10) : "";
      if (!canProceedStep1(title, duration, challengeType, liveDate, participation)) {
        showWizardError("Add a title and duration.");
        return;
      }
      setSubmitting(true);
      const draft: CreateChallengeDraft = {
        title,
        description: "",
        type: challengeType,
        durationDays,
        customDuration: customDur,
        categories,
        tasks: draftTasks,
        liveDate,
        replayPolicy: "allow_replay" as ReplayPolicy,
        requireSameRules: true,
        showReplayLabel: true,
        visibility,
        participationType: participation,
        teamSize,
        difficulty: difficultyMode === "hard" ? "hard" : "standard",
        status: publishStatus,
      };
      const payload = buildCreatePayload(draft);
      try {
        const challenge = (await trpcMutate(TRPC.challenges.create, payload)) as { id?: string };
        await AsyncStorage.removeItem(CREATE_CHALLENGE_DRAFT_KEY);
        const { queryClient } = await import("@/lib/query-client");
        void queryClient.invalidateQueries({ queryKey: ["home"] });
        void queryClient.invalidateQueries({ queryKey: ["profile", user?.id, "activeChallenges"] });
        void queryClient.invalidateQueries({ queryKey: ["discover"] });

        if (publishStatus === "draft") {
          if (challenge?.id) {
            router.replace(ROUTES.TABS_PROFILE as never);
          }
          return;
        }

        const newId = challenge?.id;
        if (newId) {
          try {
            trackEvent("challenge_created", {
              challenge_id: newId,
              duration_days: typeof durationDays === "number" ? durationDays : 0,
              is_hard_mode: difficultyMode === "hard",
            });
          } catch {
            /* non-fatal */
          }
        }
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        if (newId) {
          pendingNavId.current = newId;
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_JOINED_CHALLENGE, "true");
          useCelebrationStore.getState().show({
            title: "Challenge created!",
            subtitle: `${title.trim()} is live.`,
            type: "badge",
            shareMessage: `I just launched "${title.trim()}" on GRIIT. Day 1 starts now. Join me: https://griit.fit`,
          });
          if (who === "duo") {
            setTimeout(() => {
              void sharePlainMessage(`Join my challenge on GRIIT: ${title.trim()}`);
            }, 400);
          }
        } else {
          router.replace(ROUTES.TABS_DISCOVER as never);
        }
      } catch (e: unknown) {
        captureError(
          e,
          publishStatus === "draft" ? "CreateChallengeWizardSaveServerDraft" : "CreateChallengeWizardLaunch"
        );
        showWizardError(e instanceof Error ? e.message : "Try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [
      isGuest,
      user?.id,
      showGate,
      applyPhotoPolicyToTasks,
      tasks,
      participation,
      title,
      duration,
      challengeType,
      customDur,
      categories,
      visibility,
      teamSize,
      who,
      router,
      clearWizardError,
      showWizardError,
      difficultyMode,
      durationDays,
      pendingNavId,
      setSubmitting,
    ]
  );

  return { draftPayload, saveDraft, tryCancel, resumeDraft, submitChallenge };
}
