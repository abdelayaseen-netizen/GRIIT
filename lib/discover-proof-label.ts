/**
 * Discover card proof line. Camera when the proof type is photo.
 * "text proof" only when a task type is actually Text. Otherwise Self-reported.
 */

export function discoverProofLabel(input: {
  proofType?: string | null;
  taskTypes?: readonly string[] | null;
}): string {
  const proof = String(input.proofType ?? "").toLowerCase();
  if (proof === "photo") return "Camera";
  const types = (input.taskTypes ?? []).map((t) => String(t).toLowerCase());
  if (proof === "text" || types.includes("text")) return "text proof";
  return "Self-reported";
}
