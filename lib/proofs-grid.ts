/**
 * Frame 60 — Profile Proofs. Date sections, task on the tile, no self-reported tiles.
 */
import type { GateTime, TaskGate } from "@/backend/lib/task-model";
import { gateLine } from "@/lib/task-ui";
import { clockLabel } from "@/lib/task-flow-state";
import { securedChallengeLine } from "@/lib/secured-day";
import { MIN_PROOF_IMAGE_BYTES } from "@/lib/proof-image-bytes";

export const PROOFS_EMPTY_HEADING = "No camera proofs yet";
export const PROOFS_EMPTY_NEW =
  "A proof lands here when a task with the Camera gate is done. Nothing can be added from your library.";
export const PROOFS_TAKEN_IN_APP = "Taken in the app";
export const PROOFS_PHOTO_NOT_SAVED = "Photo not saved";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type ProofsGridItem = {
  id: string;
  uri: string;
  dateKey: string;
  day: number;
  durationDays: number;
  challengeName: string;
  taskName: string;
  capturedAt: string | null;
  gates: TaskGate[];
  gateTime: GateTime | null;
  eventId: string | null;
  shared: boolean;
  /** Object size when known. Below `MIN_PROOF_IMAGE_BYTES` is a stub. */
  bytes?: number | null;
};

export type ProofsSection = {
  dateKey: string;
  label: string;
  items: ProofsGridItem[];
};

let openProof: ProofsGridItem | null = null;

export function setOpenProof(item: ProofsGridItem): void {
  openProof = item;
}

export function readOpenProof(): ProofsGridItem | null {
  return openProof;
}

export function proofsDateLabel(dateKey: string): string {
  const parts = dateKey.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d || m < 1 || m > 12) return dateKey;
  return `${d} ${MONTHS[m - 1]}`;
}

export function proofsSectionHeader(dateKey: string, count: number): string {
  return `${proofsDateLabel(dateKey)} · ${count} ${count === 1 ? "proof" : "proofs"}`;
}

export function proofsEmptyBody(selfReportedDays: number): string {
  const n = Math.max(0, Math.floor(selfReportedDays));
  if (n <= 0) return PROOFS_EMPTY_NEW;
  return `Your ${n} secured day${n === 1 ? " was" : "s were"} all self-reported. A task with the Camera gate puts a photo here.`;
}

export function proofsCountLine(cameraProofs: number): string {
  const k = Math.max(0, Math.floor(cameraProofs));
  return `${k} camera proof${k === 1 ? "" : "s"}.`;
}

export function proofsSectionShowsChallenge(
  items: readonly { challengeName: string }[],
): boolean {
  return new Set(items.map((i) => i.challengeName)).size > 1;
}

export function proofsTileLabel(
  item: { taskName: string; challengeName: string },
  showChallenge: boolean,
): string {
  return showChallenge ? item.challengeName : item.taskName;
}

/** Failed load or a 19 Sept-style stub (below the persist threshold). */
export function proofsTileIsMissing(item: {
  bytes?: number | null;
  failed?: boolean;
}): boolean {
  if (item.failed === true) return true;
  if (typeof item.bytes === "number" && item.bytes < MIN_PROOF_IMAGE_BYTES) return true;
  return false;
}

export function proofsTileA11y(
  taskName: string,
  dateKey: string,
  shared: boolean,
): string {
  return `${taskName}, ${proofsDateLabel(dateKey)}, ${shared ? "shared" : "private"}`;
}

export function proofsGatePill(item: Pick<ProofsGridItem, "gates" | "gateTime">): string {
  const line = gateLine(item.gates, item.gateTime);
  if (!item.gates.includes("camera")) return line;
  return line.includes(PROOFS_TAKEN_IN_APP) ? line : `${line} · ${PROOFS_TAKEN_IN_APP}`;
}

export function proofsFullBody(item: ProofsGridItem): string {
  const when = item.capturedAt
    ? `${proofsDateLabel(item.dateKey)}, ${clockLabel(item.capturedAt)}`
    : proofsDateLabel(item.dateKey);
  return `${securedChallengeLine(item.challengeName, item.day, item.durationDays)} · ${when}`;
}

export function itemsFromRecordProofs(
  proofs: {
    dateKey: string;
    day: number;
    imageUrl?: string | null;
    bytes?: number | null;
    challengeName?: string;
    gates?: string[];
    eventId?: string | null;
    durationDays?: number;
    capturedAt?: string | null;
    taskName?: string;
    gateTime?: GateTime | null;
    shared?: boolean;
  }[],
): ProofsGridItem[] {
  const out: ProofsGridItem[] = [];
  proofs.forEach((p, i) => {
    if (!p.imageUrl) return;
    const gates = (p.gates ?? []).filter(
      (g): g is TaskGate => g === "camera" || g === "time" || g === "location",
    );
    out.push({
      id: p.eventId ?? `${p.dateKey}-${p.challengeName ?? ""}-${i}`,
      uri: p.imageUrl,
      dateKey: p.dateKey,
      day: p.day,
      durationDays: p.durationDays ?? 30,
      challengeName: p.challengeName ?? "Challenge",
      taskName: (p.taskName ?? "").trim() || "Untitled task",
      capturedAt: p.capturedAt ?? null,
      gates,
      gateTime: p.gateTime ?? null,
      eventId: p.eventId ?? null,
      shared: p.shared !== false,
      bytes: typeof p.bytes === "number" ? p.bytes : null,
    });
  });
  return out;
}

export function proofsSections(items: ProofsGridItem[]): ProofsSection[] {
  const byDate = new Map<string, ProofsGridItem[]>();
  for (const item of items) {
    const list = byDate.get(item.dateKey) ?? [];
    list.push(item);
    byDate.set(item.dateKey, list);
  }
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, sectionItems]) => ({
      dateKey,
      label: proofsSectionHeader(dateKey, sectionItems.length),
      items: sectionItems,
    }));
}
