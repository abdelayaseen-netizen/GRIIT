/**
 * Diagnostic copy — maps a `ProposalReason` to a safe headline + eyebrow string
 * shown above the proposal hero card. Each line is conservative: we never tell
 * a user something that could be wrong (e.g. claiming a marathoner "hasn't moved").
 */

import type { ProposalReason } from "./create-proposal";

export type ProposalHeadline = {
  /** Small, label-style line above the headline (e.g. "For you · Sunday night"). */
  eyebrow: string;
  /** Human-readable diagnostic line (e.g. "3 days since your last day. Try this."). */
  line: string;
};

export function headlineForReason(reason: ProposalReason): ProposalHeadline {
  switch (reason.kind) {
    case "first_challenge":
      return {
        eyebrow: "Your first one",
        line: "Start with this. You can change it before you commit.",
      };
    case "back_after_break": {
      const days = reason.days_since_last_activity;
      if (days >= 3 && days <= 14) {
        return {
          eyebrow: "For you",
          line: `${days} days since your last day. Try this.`,
        };
      }
      return {
        eyebrow: "For you",
        line: "Something to lock in. Try this.",
      };
    }
    case "weekend_reset":
      return {
        eyebrow: "Sunday night",
        line: "Time to pick something. Try this.",
      };
    default:
      return {
        eyebrow: "For you",
        line: "Try this one.",
      };
  }
}
