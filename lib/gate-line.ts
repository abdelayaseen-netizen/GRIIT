/** Gate order is Camera, then Time, then Location. No gate and no photo is Self-reported. */

export type Gate =
  | { kind: "camera" }
  | { kind: "time"; by?: string; from?: string; to?: string }
  | { kind: "location" };

export type TaskLine = {
  target?: string;
  gates: Gate[];
  photoMode: "required" | "optional" | "none";
  window?: "open" | "notOpen" | "closed";
  minutesLeft?: number;
};

export type GatePart = { icon?: "camera" | "clock" | "pin"; text: string };

export function gateParts(line: TaskLine): GatePart[] {
  const time = line.gates.find((g): g is Extract<Gate, { kind: "time" }> => g.kind === "time");
  if (line.window === "closed" && time) {
    return [{ icon: "clock", text: `Window closed · ${time.from}–${time.to}` }];
  }
  if (line.window === "notOpen" && time) {
    return [{ icon: "clock", text: `Opens at ${time.from ?? time.by}` }];
  }
  const out: GatePart[] = [];
  if (line.target) out.push({ text: line.target });
  if (line.photoMode === "required") out.push({ icon: "camera", text: "Camera" });
  if (line.photoMode === "optional") out.push({ icon: "camera", text: "Photo optional" });
  if (time) {
    const when = time.by ? `By ${time.by}` : `${time.from}–${time.to}`;
    const left = line.minutesLeft != null ? ` · ${line.minutesLeft} min left` : "";
    out.push({ icon: "clock", text: `${when}${left}` });
  }
  if (line.gates.some((g) => g.kind === "location")) out.push({ icon: "pin", text: "Location" });
  if (line.photoMode === "none" && !line.gates.some((g) => g.kind === "location")) {
    out.splice(line.target ? 1 : 0, 0, { text: "Self-reported" });
  }
  return out;
}
