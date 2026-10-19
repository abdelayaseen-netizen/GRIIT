/**
 * Build 92 11.1: startup phases for the Release-simulator measurement.
 * Off unless the bundle was built with EXPO_PUBLIC_STARTUP_TRACE=1. Release strips console.log,
 * so the trace is written to AsyncStorage and read from the simulator's app container.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const STARTUP_TRACE_KEY = "griit.startupTrace.v1";
export const PROFILE_TRACE_KEY = "griit.profileTrace.v1";

export const INTERACTIVE_MARKS = ["splash_hidden", "overlay_gone", "home_data"] as const;

export type StartupMark =
  | "bundle_start"
  | "js_start"
  | "fonts_loaded"
  | "splash_hidden"
  | "session_restored"
  | "profile_checked"
  | "overlay_gone"
  | "bootstrap_start"
  | "bootstrap_done"
  | "home_cache"
  | "home_mount"
  | "home_data";

const enabled = process.env.EXPO_PUBLIC_STARTUP_TRACE === "1";
const marks: Partial<Record<StartupMark, number>> = {};
let flushed = false;

export function startupTraceEnabled(): boolean {
  return enabled;
}

/** Wall-clock ms of the first time each mark is reached in this process. */
export function traceMark(name: StartupMark, at = Date.now()): void {
  if (!enabled || marks[name] != null) return;
  marks[name] = at;
  if (!flushed && INTERACTIVE_MARKS.every((m) => marks[m] != null)) {
    flushed = true;
    setTimeout(() => void flushStartupTrace(), 0);
  }
}

export function interactiveAt(m: Partial<Record<StartupMark, number>>): number | null {
  let max = 0;
  for (const k of INTERACTIVE_MARKS) {
    const v = m[k];
    if (v == null) return null;
    if (v > max) max = v;
  }
  return max;
}

type PerfWithStartup = {
  now(): number;
  rnStartupTiming?: Record<string, number | null | undefined>;
};

async function flushStartupTrace(): Promise<void> {
  try {
    const bundleStart = (globalThis as { __griitBundleStart?: number }).__griitBundleStart;
    if (typeof bundleStart === "number") marks.bundle_start = bundleStart;
    const perf = (globalThis as { performance?: PerfWithStartup }).performance;
    const rn = perf?.rnStartupTiming;
    const perfToWall = perf ? Date.now() - perf.now() : null;
    const native: Record<string, number | null> = {};
    if (rn && perfToWall != null) {
      for (const k of [
        "startTime",
        "initializeRuntimeStart",
        "initializeRuntimeEnd",
        "executeJavaScriptBundleEntryPointStart",
        "executeJavaScriptBundleEntryPointEnd",
        "endTime",
      ]) {
        const v = rn[k];
        native[k] = typeof v === "number" && v > 0 ? Math.round(v + perfToWall) : null;
      }
    }
    await AsyncStorage.setItem(
      STARTUP_TRACE_KEY,
      JSON.stringify({ marks, native, interactive: interactiveAt(marks), writtenAt: Date.now() })
    );
  } catch {
    // measurement only
  }
}

/** One profile open: tab mount to the first header paint. Appends; the shell clears it between runs. */
export async function traceProfileOpen(ms: number, source: "cache" | "live"): Promise<void> {
  if (!enabled) return;
  try {
    const raw = await AsyncStorage.getItem(PROFILE_TRACE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    list.push({ ms, source, at: Date.now() });
    await AsyncStorage.setItem(PROFILE_TRACE_KEY, JSON.stringify(list));
  } catch {
    // measurement only
  }
}
