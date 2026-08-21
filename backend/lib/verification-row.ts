/**
 * Shared verification row. `role` is additive — clients that only read
 * `label` + `verified` keep working until they opt in.
 *
 * check  — evaluated server-side; `verified` can be false
 * record — a fact about the submission; never a passed test
 */
export type VerificationRowRole = "check" | "record";

export type VerificationRow = {
  key: string;
  label: string;
  verified: boolean;
  role: VerificationRowRole;
};
