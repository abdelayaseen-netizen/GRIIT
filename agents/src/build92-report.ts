import type { Run } from "./build90";

const WASTED_ACTIONS = new Set(["repeat_refused", "done_refused", "none"]);

/** A tap that did nothing useful: refused, errored, or the persona said it was stuck. */
export function isWasted(step: Run["steps"][number]): boolean {
  if (WASTED_ACTIONS.has(step.action)) return true;
  if (step.stuck) return true;
  return /^(tap|double_tap|type)$/.test(step.action) && !!step.error;
}

/** Build 92 12.5: per persona and screen, time spent, steps, wasted taps and stuck notes. */
export function screensCsv(runs: Run[]): string {
  const header = ["persona", "group", "screen", "visits", "seconds", "steps", "wasted_taps", "stuck_notes"];
  const rows = [header.join(",")];
  const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  for (const run of runs) {
    const per = new Map<string, { visits: number; ms: number; steps: number; wasted: number; stuck: number }>();
    let previous = "";
    run.steps.forEach((step, index) => {
      const screen = step.screenName || step.screen;
      const entry = per.get(screen) ?? { visits: 0, ms: 0, steps: 0, wasted: 0, stuck: 0 };
      if (screen !== previous) entry.visits += 1;
      previous = screen;
      const next = run.steps[index + 1];
      // A step's timestamp is written when it ends; it began latencyMs earlier.
      const began = Date.parse(step.timestamp) - step.latencyMs;
      const ended = next ? Date.parse(next.timestamp) - next.latencyMs : Date.parse(step.timestamp);
      if (Number.isFinite(ended) && Number.isFinite(began) && ended >= began) entry.ms += ended - began;
      entry.steps += 1;
      if (isWasted(step)) entry.wasted += 1;
      if (step.stuck) entry.stuck += 1;
      per.set(screen, entry);
    });
    for (const [screen, e] of per) {
      rows.push([run.result.personaId, run.result.group, screen, e.visits, Math.round(e.ms / 100) / 10, e.steps, e.wasted, e.stuck].map(cell).join(","));
    }
  }
  return rows.join("\n") + "\n";
}

const said = (run: Run, re: RegExp) => run.steps.some((s) => re.test(`${s.screenName} ${s.target} ${s.thought} ${s.confusion} ${s.text ?? ""}`));

export function securedDay(run: Run): boolean {
  return said(run, /day secured/i) || run.result.doneTimings.some((t) => /day secured/i.test(t.marker));
}

/** Social actions B took on A's proofs, read from B's own steps. */
export function socialActions(run: Run): { likes: number; doubleTaps: number; comments: number; profileOpens: number; inviteAccepted: boolean } {
  const ok = run.steps.filter((s) => !s.error);
  return {
    likes: ok.filter((s) => s.action === "tap" && /\blike\b|heart|respect/i.test(s.target)).length,
    doubleTaps: ok.filter((s) => s.action === "double_tap").length,
    comments: ok.filter((s) => (s.action === "tap" && /^(send|post|reply)\b/i.test(s.target.trim()) && /comment/i.test(`${s.screenName} ${s.thought}`)) || (s.action === "type" && /comment|reply/i.test(`${s.target} ${s.screenName}`))).length,
    profileOpens: new Set(ok.filter((s) => s.screen === "profile" || /profile/i.test(s.screenName)).map((s) => s.screenName)).size,
    inviteAccepted: run.result.stages.includes("joined"),
  };
}

export type Day2Check = { personaId: string; lastSecured: string; securedToday: boolean; sawStreak: boolean; sawFreeze: boolean; missedDays: number };

export function median(values: (number | null | undefined)[]): number | null {
  const sorted = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

/** Calendar days between two YYYY-MM-DD keys, b minus a. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

export function headline(input: { firstDay: Run[]; day2: Day2Check[]; social: Run[]; all: Run[] }): string[] {
  const secured = input.firstDay.filter(securedDay).length;
  const returned = input.day2.filter((d) => d.securedToday).length;
  const quiz = input.all.filter((r) => r.result.interview?.asked);
  const right = quiz.reduce((n, r) => n + (r.result.interview!.securedRight ? 1 : 0) + (r.result.interview!.freezeRight ? 1 : 0) + (r.result.interview!.selfReportedRight ? 1 : 0), 0);
  const actions = input.social.map(socialActions);
  const sum = (key: "likes" | "doubleTaps" | "comments" | "profileOpens") => actions.reduce((n, a) => n + a[key], 0);
  const cold = median(input.all.map((r) => r.result.coldStartMs));
  return [
    `New users who secured Day 1: ${secured} of ${input.firstDay.length}.`,
    `Day 2 return (secured again on the next day): ${returned} of ${input.day2.length}.`,
    `Social actions by partners (${input.social.length} sessions): ${sum("likes")} likes, ${sum("doubleTaps")} double-taps, ${sum("comments")} comments, ${sum("profileOpens")} profile screens, ${actions.filter((a) => a.inviteAccepted).length} invites accepted.`,
    `Cold start, launch to first screen with text, median: ${cold == null ? "not measured" : `${cold} ms`} (through Maestro, so it includes its launch overhead).`,
    `3-word quiz: ${right} right of ${quiz.length * 3} answers (${quiz.length} people).`,
  ];
}

export function endTable(runs: Run[]): string[] {
  const lines = ["| Persona | Group | Model | Steps | Ended | Tag | Stuck notes |", "|---|---|---|---|---|---|---|"];
  for (const r of runs) {
    lines.push(`| ${r.result.personaId} ${r.persona.name} | ${r.result.group} | ${r.result.model ?? "—"} | ${r.result.steps} | ${(r.result.giveUp || "finished").replace(/\|/g, "/")} | ${r.result.endTag ?? "—"} | ${(r.result.stuckNotes ?? []).length} |`);
  }
  return lines;
}
