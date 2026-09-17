import type { GateTime } from "@/backend/lib/task-model";
import type { WindowState } from "@/backend/lib/task-time-gate";
import {
  WINDOW_CLOSED_FORBIDDEN,
  flowHeaderTitle,
  minutesLeftCaption,
} from "@/lib/task-ui";

export { WINDOW_CLOSED_FORBIDDEN, flowHeaderTitle, minutesLeftCaption };

export function gateTimeFromConfig(config: Record<string, unknown> | null | undefined): GateTime | null {
  const raw = config?.gateTime;
  if (!raw || typeof raw !== "object") return null;
  const mode = (raw as GateTime).mode;
  if (mode !== "by" && mode !== "between") return null;
  return {
    mode,
    start: typeof (raw as GateTime).start === "string" ? (raw as GateTime).start : null,
    end: typeof (raw as GateTime).end === "string" ? (raw as GateTime).end : null,
  };
}

export function windowStateFromConfig(
  config: Record<string, unknown> | null | undefined,
): WindowState {
  const raw = config?.windowState;
  if (raw === "open" || raw === "closing" || raw === "closed") return raw;
  return null;
}

export function minutesLeftFromConfig(
  config: Record<string, unknown> | null | undefined,
): number | null {
  const n = config?.minutesLeft;
  return typeof n === "number" && n >= 0 ? n : null;
}

export function flowFooterCaption(
  windowState: WindowState,
  minutesLeft: number | null,
  fallback: string,
): string {
  if (windowState === "closing" && minutesLeft != null) return minutesLeftCaption(minutesLeft);
  return fallback;
}

export function flowFooterBrand(windowState: WindowState): boolean {
  return windowState === "closing";
}

export function flowAllowsSubmit(windowState: WindowState): boolean {
  return windowState !== "closed";
}

export function isWindowClosedError(message: string | null | undefined): boolean {
  return message === WINDOW_CLOSED_FORBIDDEN;
}
