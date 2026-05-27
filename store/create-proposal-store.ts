/**
 * In-flight create-proposal state.
 *
 * Owns the data passed between `ProposalScreen` → `CalendarPreviewScreen` →
 * `AdjustSheet`. Not persisted (per-session state); discarded when the user
 * commits or backs out.
 */
import { create } from "zustand";
import type { ChallengePackDef } from "@/lib/challenge-packs";
import type { ProposalReason } from "@/lib/create-proposal";
import type {
  CreateDifficulty,
  CreatePhotoProof,
  CreateWho,
} from "@/lib/build-create-payload";

export type CreateProposalState = {
  pack: ChallengePackDef | null;
  reason: ProposalReason | null;
  durationDays: number;
  difficulty: CreateDifficulty;
  photoProof: CreatePhotoProof;
  who: CreateWho;
  category: string;
  setProposal: (input: {
    pack: ChallengePackDef;
    reason: ProposalReason;
    durationDays: number;
    difficulty: CreateDifficulty;
  }) => void;
  setPack: (pack: ChallengePackDef) => void;
  setDuration: (days: number) => void;
  setDifficulty: (d: CreateDifficulty) => void;
  setPhotoProof: (p: CreatePhotoProof) => void;
  setWho: (w: CreateWho) => void;
  setCategory: (c: string) => void;
  reset: () => void;
};

const INITIAL: Omit<CreateProposalState,
  | "setProposal"
  | "setPack"
  | "setDuration"
  | "setDifficulty"
  | "setPhotoProof"
  | "setWho"
  | "setCategory"
  | "reset"
> = {
  pack: null,
  reason: null,
  durationDays: 30,
  difficulty: "standard",
  photoProof: "optional",
  who: "solo",
  category: "lifestyle",
};

export const useCreateProposalStore = create<CreateProposalState>()((set) => ({
  ...INITIAL,
  setProposal: (input) =>
    set({
      pack: input.pack,
      reason: input.reason,
      durationDays: input.durationDays,
      difficulty: input.difficulty,
    }),
  setPack: (pack) => set({ pack }),
  setDuration: (durationDays) => set({ durationDays }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setPhotoProof: (photoProof) => set({ photoProof }),
  setWho: (who) => set({ who }),
  setCategory: (category) => set({ category }),
  reset: () => set({ ...INITIAL }),
}));
