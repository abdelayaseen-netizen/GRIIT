import fs from "fs";
import path from "path";
import type { Spend } from "./loop";

export function runDirectory(root: string): string {
  return path.join(root, process.env.AGENTS_RUN ?? "agents/oct15");
}

export function selectedPeople<T extends { id: string }>(people: T[]): T[] {
  const only = (process.env.AGENTS_ONLY ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!only.length) return people;
  return people.filter((person) => only.includes(person.id));
}

export function loadSpend(runDir: string): Spend {
  const file = path.join(runDir, "spend.json");
  if (!fs.existsSync(file)) return { usd: 0, input: 0, output: 0, calls: 0 };
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<Spend>;
  return {
    usd: Number(data.usd) || 0,
    input: Number(data.input) || 0,
    output: Number(data.output) || 0,
    calls: Number(data.calls) || 0,
  };
}

export function saveSpend(runDir: string, spend: Spend): void {
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, "spend.json"), JSON.stringify(spend));
  fs.writeFileSync(path.join(runDir, "spend.txt"), `${spend.usd.toFixed(2)}\n`);
}

export function inviteFor(runDir: string, personaId: string): string | undefined {
  if (personaId !== "p22b" && personaId !== "p22c") return undefined;
  const file = path.join(runDir, "invite-link.txt");
  if (!fs.existsSync(file)) return undefined;
  const link = fs.readFileSync(file, "utf8").trim();
  return link || undefined;
}

export function alreadyProved(runDir: string, personaId: string): boolean {
  if (process.env.AGENTS_FORCE === "1") return false;
  const resultFile = path.join(runDir, personaId, "result.json");
  const interviewFile = path.join(runDir, personaId, "interview.json");
  if (!fs.existsSync(resultFile) || !fs.existsSync(interviewFile)) return false;
  const result = JSON.parse(fs.readFileSync(resultFile, "utf8")) as { steps?: number };
  return (result.steps ?? 0) >= 15;
}
