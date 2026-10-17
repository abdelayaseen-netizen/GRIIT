export type El = { text: string; a11y: string; id: string; bounds: string; value: string; selected?: boolean };

export function parseHierarchy(raw: string): El[] {
  const start = raw.indexOf("{");
  if (start < 0) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start));
  } catch {
    return [];
  }
  const out: El[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    const attrs = (rec.attributes as Record<string, unknown> | undefined) ?? rec;
    const text = String(attrs.txt ?? attrs.text ?? "").trim();
    const a11y = String(attrs.a11y ?? attrs.accessibilityText ?? "").trim();
    const id = String(attrs.rid ?? attrs["resource-id"] ?? "").trim();
    const bounds = String(attrs.b ?? attrs.bounds ?? "");
    const value = String(attrs.val ?? "").trim();
    const selected = attrs.selected === true || attrs.selected === "true";
    if (text || a11y || id || value) out.push({ text, a11y, id, bounds, value, selected });
    const kids = (rec.c ?? rec.children) as unknown;
    if (Array.isArray(kids)) kids.forEach(walk);
  };
  const root = data as Record<string, unknown>;
  if (Array.isArray(root.elements)) root.elements.forEach(walk);
  else walk(data);
  return out;
}

export function visibleLines(els: El[]): string[] {
  const lines: string[] = [];
  for (const el of els) {
    const raw = (el.text || el.a11y || el.id).replace(/\s+/g, " ").trim();
    const label = el.selected ? `${raw} (selected)` : raw;
    if (!label || label.length > 120) continue;
    if (label === "Home screen icons") continue;
    const box = el.bounds.match(/\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/);
    const tall = box ? Math.abs(Number(box[4]) - Number(box[2])) >= 32 : false;
    lines.push(tall && el.value && el.value !== label ? `${label} ${el.value}` : label);
  }
  return [...new Set(lines)].slice(0, 80);
}

/** Scroll-bar percents. A scroll that moves the page changes these even when the labels do not. */
export function scrollMarks(els: El[]): string[] {
  const marks: string[] = [];
  for (const el of els) {
    if (!/scroll bar/i.test(el.a11y) || !el.value) continue;
    marks.push(`${el.a11y} ${el.value}`);
  }
  return marks;
}

export function screenSignature(lines: string[]): string {
  return lines
    .map((line) => line.replace(/\d{1,2}:\d{2}(?::\d{2})?/g, "#"))
    .sort()
    .join("|")
    .slice(0, 2000);
}

export function isSpringboard(lines: string[]): boolean {
  const blob = lines.join(" ");
  return blob.includes("Home screen icons") || (lines.includes("Fitness") && lines.includes("Watch") && lines.includes("Photos"));
}

export function isHomeScreen(lines: string[]): boolean {
  return lines.some(
    (line) =>
      line === "Today" ||
      line.startsWith("Today ") ||
      /^good (morning|afternoon|evening)\b/i.test(line) ||
      /days in a row/i.test(line),
  );
}
/** Build 90 10.3: the first onboarding screen. Start + "I already have an account" or the headline. */
export function isWelcomeScreen(lines: string[]): boolean {
  const start = lines.some((line) => line === "Start");
  const marker = lines.some((line) => line === "I already have an account" || /prove with a photo/i.test(line));
  return start && marker;
}

export function classifyScreen(lines: string[]): string {
  const blob = lines.join("\n");
  const has = (re: RegExp) => re.test(blob);
  if (has(/premium|restore purchases|paywall/i)) return "paywall";
  if (isWelcomeScreen(lines)) return "welcome";
  if (isHomeScreen(lines)) return "home";
  if (has(/continue with email|email address|send it|what should we call you|display name|save your streak|create account|you@example.com/i)) return "auth";
  if (has(/already did it|time's up|take photo|complete ·|log it as done|write here/i)) return "task";
  if (has(/step 1 of 3|new challenge|add a task|name your challenge/i)) return "create";
  if (has(/you're in|open challenge|day \d+ of \d+|join\b/i) && has(/challenge|tasks|members|proof/i)) return "challenge";
  if (has(/\bdiscover\b|featured/i)) return "discover";
  if (has(/\bactivity\b|notifications/i) && has(/leaderboard|activity/i)) return "activity";
  if (has(/\bproofs\b|your data|edit profile/i)) return "profile";
  if (has(/\bsettings\b/i)) return "settings";
  if (has(/discipline,\s*witnessed|start here|one reminder a day|why proof|pick at least one|continue/i)) return "onboarding";
  if (lines.length === 0) return "unknown";
  return "other";
}

export function funnelRank(stage: string): number {
  const order = [
    "opened",
    "discover",
    "challenge",
    "joined",
    "task",
    "completed",
    "photo",
    "shared",
    "social",
  ];
  const i = order.indexOf(stage);
  return i < 0 ? 0 : i;
}

export function dayClaims(lines: string[]): { n: number; total: number }[] {
  const blob = lines.join("\n");
  const out: { n: number; total: number }[] = [];
  for (const match of blob.matchAll(/Day\s+(\d+)\s+of\s+(\d+)/gi)) {
    out.push({ n: Number(match[1]), total: Number(match[2]) });
  }
  return out;
}
