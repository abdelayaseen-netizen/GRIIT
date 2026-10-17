import { addCalendarDaysToDateKey, inclusiveDayCount } from "./date-utils";

export type DayState = "secured" | "held" | "missed" | "none";
export type StatsRange = "7d" | "30d" | "all";
export type ProofMethod = "camera" | "self_reported" | "apple_health";

export type MeStatsEnrollment = {
  id: string;
  title: string;
  startKey: string;
  durationDays: number;
  status: "running" | "finished";
  finishedAt: string | null;
};

export type MeStatsProof = {
  atIso: string;
  method: ProofMethod;
  /** Same photo on two events counts once. */
  photoKey?: string | null;
};

export type MeStatsInput = {
  range: StatsRange;
  todayKey: string;
  timeZone: string;
  currentStreak: number;
  securedKeys: readonly string[];
  heldKeys: readonly string[];
  enrollments: readonly MeStatsEnrollment[];
  proofs: readonly MeStatsProof[];
};

export type UserStats = {
  secured_days: number;
  due_days: number;
  held_days: number;
  missed_days: number;
  current_streak: number;
  best_streak: number;
  best_streak_start: string | null;
  best_streak_end: string | null;
  proofs_by_method: { camera: number; self_reported: number; apple_health: number };
  /** Lifetime photo proofs. A photo on a self-reported task counts once. */
  proof_count: number;
  proof_hour_histogram: number[];
  lifetime_secured_days: number;
};

export type MeStatsResult = {
  range: StatsRange;
  user_stats: UserStats;
  day_secures: { date: string; state: DayState }[];
  enrollments: {
    id: string;
    title: string;
    secured_days: number;
    due_days: number;
    status: "running" | "finished";
    finished_at: string | null;
    line: string;
  }[];
};

function nextKey(key: string): string {
  return addCalendarDaysToDateKey(key, 1);
}

/** Longest run of consecutive secured or freeze-held days. The inclusive span equals the count. */
export function bestStreakRun(securedKeys: readonly string[], heldKeys: readonly string[] = []): {
  count: number;
  start: string;
  end: string;
} | null {
  const keys = [...new Set([...securedKeys, ...heldKeys])].filter(Boolean).sort();
  if (keys.length === 0) return null;
  let best = { count: 1, start: keys[0]!, end: keys[0]! };
  let runStart = keys[0]!;
  let runEnd = keys[0]!;
  let runCount = 1;
  for (let i = 1; i < keys.length; i++) {
    const key = keys[i]!;
    if (key === nextKey(runEnd)) {
      runEnd = key;
      runCount += 1;
    } else {
      runStart = key;
      runEnd = key;
      runCount = 1;
    }
    if (runCount > best.count) best = { count: runCount, start: runStart, end: runEnd };
  }
  if (inclusiveDayCount(best.start, best.end) !== best.count) {
    throw new Error("Best streak dates do not match the count.");
  }
  return best;
}

export function consistencyPct(secured: number, due: number): number | null {
  if (due < 7) return null;
  return Math.round((secured / due) * 100);
}

function isUtcZone(zone: string): boolean {
  const value = zone.trim().toUpperCase();
  return value === "UTC" || value === "ETC/UTC" || value === "ETC/GMT";
}

/** Phone zone wins over a stored UTC default. A real stored zone still wins over the phone. */
export function resolveStatsTimeZone(stored: string | null | undefined, device: string | null | undefined): string {
  const profile = stored?.trim() ?? "";
  const fromDevice = device?.trim() ?? "";
  if (profile && !isUtcZone(profile)) return profile;
  if (fromDevice && !isUtcZone(fromDevice)) return fromDevice;
  if (profile) return profile;
  if (fromDevice) return fromDevice;
  return "UTC";
}

export function usualHour(histogram: readonly number[]): number | null {
  const sum = histogram.reduce((a, b) => a + b, 0);
  if (sum < 5) return null;
  let max = -1;
  let idx = 0;
  histogram.forEach((n, i) => {
    if (n > max) {
      max = n;
      idx = i;
    }
  });
  return idx;
}

/** A photo counts once, as a photo, even when the task was self-reported. */
export function proofMethodFromMetadata(metadata: Record<string, unknown> | null | undefined): ProofMethod {
  if (metadata?.photo_url || metadata?.proof_photo_url) return "camera";
  const method = metadata?.verification_method;
  if (method === "apple_health") return "apple_health";
  if (method === "photo") return "camera";
  if (method === "self_reported" || method === "manual") return "self_reported";
  return "self_reported";
}

function hourInZone(iso: string, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: timeZone.trim() || "UTC",
  }).formatToParts(new Date(iso));
  let h = parts.find((p) => p.type === "hour")?.value ?? "0";
  if (h === "24") h = "0";
  return Number(h);
}

function dateInZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone.trim() || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function enrollmentEnd(row: MeStatsEnrollment): string {
  const last = addCalendarDaysToDateKey(row.startKey, Math.max(0, row.durationDays - 1));
  if (row.status === "finished" && row.finishedAt) {
    const finishedKey = row.finishedAt.slice(0, 10);
    return finishedKey < last ? finishedKey : last;
  }
  return last;
}

function keysFrom(start: string, end: string): string[] {
  if (!start || !end || end < start) return [];
  const out: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    out.push(cursor);
    cursor = nextKey(cursor);
  }
  return out;
}

function rangeStart(todayKey: string, range: StatsRange, earliest: string | null): string {
  if (range === "7d") return addCalendarDaysToDateKey(todayKey, -6);
  if (range === "30d") return addCalendarDaysToDateKey(todayKey, -29);
  return earliest ?? todayKey;
}

export function buildMeStats(input: MeStatsInput): MeStatsResult {
  const secured = new Set(input.securedKeys);
  const held = new Set(input.heldKeys.filter((k) => !secured.has(k)));
  const due = new Set<string>();
  for (const row of input.enrollments) {
    if (!row.startKey) continue;
    for (const key of keysFrom(row.startKey, enrollmentEnd(row))) {
      if (key < input.todayKey) due.add(key);
    }
  }
  const earliest = input.enrollments.map((e) => e.startKey).filter(Boolean).sort()[0] ?? null;
  const start = rangeStart(input.todayKey, input.range, earliest);
  const inRange = (key: string) => key >= start && key < input.todayKey;
  const rangeDue = [...due].filter(inRange);
  const rangeSecured = rangeDue.filter((k) => secured.has(k));
  const rangeHeld = rangeDue.filter((k) => held.has(k));
  const rangeMissed = rangeDue.filter((k) => !secured.has(k) && !held.has(k));
  const best = bestStreakRun([...secured], [...held]);
  const histogram = Array.from({ length: 24 }, () => 0);
  const methods = { camera: 0, self_reported: 0, apple_health: 0 };
  const seenPhotos = new Set<string>();
  let proofCount = 0;
  for (const proof of input.proofs) {
    if (proof.method === "camera") {
      const key = proof.photoKey?.trim() || proof.atIso;
      if (!seenPhotos.has(key)) {
        seenPhotos.add(key);
        proofCount += 1;
      }
    }
    const day = dateInZone(proof.atIso, input.timeZone);
    if (day < start || day > input.todayKey) continue;
    methods[proof.method] += 1;
    const hour = hourInZone(proof.atIso, input.timeZone);
    const bucket = hour >= 0 && hour < 24 ? histogram[hour] : undefined;
    if (bucket != null) histogram[hour] = bucket + 1;
  }
  const heatEnd = input.range === "all" ? input.todayKey : input.todayKey;
  const heatStart =
    input.range === "all"
      ? (earliest && inclusiveDayCount(earliest, heatEnd) > 84
          ? addCalendarDaysToDateKey(heatEnd, -83)
          : start)
      : start;
  const day_secures = keysFrom(heatStart, heatEnd).map((date) => {
    let state: DayState = "none";
    if (date > input.todayKey) state = "none";
    else if (secured.has(date)) state = "secured";
    else if (held.has(date)) state = "held";
    else if (date < input.todayKey && due.has(date)) state = "missed";
    return { date, state };
  });
  const enrollments = input.enrollments.map((row) => {
    const duration = Math.max(1, row.durationDays);
    const end = enrollmentEnd(row);
    const started = Boolean(row.startKey) && input.todayKey >= row.startKey;
    const last = !started ? row.startKey : input.todayKey <= end ? input.todayKey : end;
    const day = started && last ? Math.min(duration, inclusiveDayCount(row.startKey, last)) : 0;
    const todayCounts = started && input.todayKey <= end;
    const unit = duration === 1 ? "day" : "days";
    const todayBit = todayCounts ? "Today counts." : "Today does not count.";
    return {
      id: row.id,
      title: row.title,
      secured_days: day,
      due_days: duration,
      status: row.status,
      finished_at: row.finishedAt,
      line: `${day} of ${duration} ${unit}. ${todayBit}`,
    };
  });
  return {
    range: input.range,
    user_stats: {
      secured_days: rangeSecured.length,
      due_days: rangeDue.length,
      held_days: rangeHeld.length,
      missed_days: rangeMissed.length,
      current_streak: input.currentStreak,
      best_streak: best?.count ?? 0,
      best_streak_start: best?.start ?? null,
      best_streak_end: best?.end ?? null,
      proofs_by_method: methods,
      proof_count: proofCount,
      proof_hour_histogram: histogram,
      lifetime_secured_days: [...secured].filter((k) => k <= input.todayKey).length,
    },
    day_secures,
    enrollments,
  };
}

export const EMPTY_STATS_COPY = {
  due: "No due days yet. Your first day counts tonight, once it ends.",
  proofs: "No proofs yet.",
  histogram: "Shows after 5 proofs.",
} as const;
