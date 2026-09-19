/** One keypad, four masks. README §4.3. */

export type KeypadMask = "distance" | "duration" | "minutes" | "count";

export const KEYPAD_MAX: Record<KeypadMask, number> = {
  distance: 5,
  duration: 4,
  minutes: 3,
  count: 2,
};

export function pushKeypadDigit(buffer: string, digit: string, mask: KeypadMask): string {
  const next = (buffer + digit).replace(/^0+(?=\d)/, "");
  return next.slice(0, KEYPAD_MAX[mask]);
}

export function formatKeypadBuffer(buffer: string, mask: KeypadMask): string {
  if (mask === "distance") return buffer ? (parseInt(buffer, 10) / 100).toFixed(2) : "0.00";
  if (mask === "duration") {
    const p = buffer.padStart(4, "0");
    return `${p.slice(0, 2)}:${p.slice(2)}`;
  }
  return buffer || "0";
}

export function parseKeypadBuffer(buffer: string, mask: KeypadMask): number | null {
  if (!buffer) return mask === "count" ? 0 : null;
  if (mask === "distance") return parseInt(buffer, 10) / 100;
  if (mask === "duration") {
    const p = buffer.padStart(4, "0");
    return parseInt(p.slice(0, 2), 10) * 60 + Math.min(59, parseInt(p.slice(2), 10));
  }
  return parseInt(buffer, 10);
}

/** System keyboard — keep one decimal, 3+2 digits (was keypad distance). */
export function sanitizeDistanceInput(text: string): string {
  let out = "";
  let dot = false;
  for (const ch of text.replace(",", ".")) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === "." && !dot) {
      out += ".";
      dot = true;
    }
  }
  const [whole = "", frac] = out.split(".");
  const w = whole.slice(0, 3);
  if (out.includes(".")) return `${w}.${(frac ?? "").slice(0, 2)}`;
  return w;
}

export function parseDistanceInput(text: string): number | null {
  const n = parseFloat(text);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function durationDigitsFromText(text: string): string {
  return text.replace(/\D/g, "").slice(0, KEYPAD_MAX.duration);
}

export function formatDurationInput(digits: string): string {
  if (!digits) return "";
  return formatKeypadBuffer(digits, "duration");
}

export function parseDurationInput(digits: string): number | null {
  if (!digits) return null;
  return parseKeypadBuffer(digits, "duration");
}

/** Number-pad on a formatted mm:ss field — keep a raw digit buffer. */
export function applyDurationFieldChange(prevDigits: string, nextText: string): string {
  const prevDisplay = formatDurationInput(prevDigits);
  if (!nextText) return "";
  if (!nextText.includes(":") && nextText.length <= KEYPAD_MAX.duration) {
    return durationDigitsFromText(nextText);
  }
  if (nextText.length > prevDisplay.length) {
    const last = nextText.match(/(\d)$/);
    if (last) return (prevDigits + last[1]).slice(0, KEYPAD_MAX.duration);
  }
  if (nextText.length < prevDisplay.length) return prevDigits.slice(0, -1);
  return prevDigits;
}

export function durationDigitsFromSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = Math.min(99, Math.floor(s / 60));
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}${String(ss).padStart(2, "0")}`.replace(/^0+(?=\d)/, "");
}

export function sanitizeCountInput(text: string): string {
  return text.replace(/\D/g, "").slice(0, KEYPAD_MAX.count);
}

export function parseCountInput(text: string): number {
  const n = parseInt(sanitizeCountInput(text), 10);
  return Number.isFinite(n) ? n : 0;
}

export function sanitizeMinutesInput(text: string): string {
  return text.replace(/\D/g, "").slice(0, KEYPAD_MAX.minutes);
}

export function parseMinutesInput(text: string): number | null {
  const digits = sanitizeMinutesInput(text);
  if (!digits) return null;
  return parseInt(digits, 10);
}
