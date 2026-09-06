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
