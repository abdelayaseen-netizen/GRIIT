import fs from "fs";
import path from "path";
import {
  agentClient,
  deleteEnrollments,
  installAppSession,
  makeCredentials,
  markTestAccount,
  prepareAgentAccount,
  readContainerSession,
  readOwnRows,
  sessionMatchesAgent,
  signInAgent,
  type SessionInfo,
} from "./account";
import { askModel } from "./claude";
import { HAIKU_MODEL, SONNET_MODEL } from "./cost";
import { appContainer, actionYaml, applyPrivacy, launchYaml, resize, setTextSize, shot, wipeAppData, UDID } from "./device";
import { parseDecision, reviewAction } from "./gate";
import { needsFreshSignup, specsFor, type GoalSpec } from "./goals";
import { resolveTarget, systemAlert } from "./match";
import { MaestroSession } from "./maestro";
import { systemPrompt, userPrompt } from "./prompt";
import { samplePng } from "./pixels";
import { classifyScreen, dayClaims, isHomeScreen, isSpringboard, parseHierarchy, screenSignature, scrollMarks, visibleLines, type El } from "./screen";
import { nextStreak, selectedChip } from "./stuck";
import type { AgentResult, Mode, Persona, StepLog } from "./types";

export type Spend = { usd: number; input: number; output: number; calls: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function redact(value: string, secrets: string[]): string {
  let out = value;
  for (const secret of secrets) {
    if (secret.length >= 6) out = out.split(secret).join("[redacted]");
  }
  return out;
}

function score(raw: string, lines: string[]): number {
  const decision = parseDecision(raw);
  if (!decision) return 0;
  if (decision.action === "tap" || decision.action === "type" || decision.action === "double_tap") {
    if (/^\d{1,3}%,\d{1,3}%$/.test(decision.target)) return 2;
    if (lines.some((line) => line === decision.target)) return 3;
    return 1;
  }
  return 2;
}

export async function runPersona(opts: {
  persona: Persona;
  mode: Mode;
  runDir: string;
  maestro: MaestroSession;
  apiKey: string;
  model: string;
  spend: Spend;
  allowedNames: string[];
  compare: boolean;
  capUsd: number;
  keep: boolean;
}): Promise<{ result: AgentResult; model: string; compareNote: string; stopAll: boolean }> {
  const persona = opts.persona;
  const dir = path.join(opts.runDir, persona.id);
  fs.mkdirSync(path.join(dir, "shots"), { recursive: true });
  const fresh = needsFreshSignup(persona.id);
  const started = new Date();
  const steps: StepLog[] = [];
  const seen: string[] = [];
  const crashes: string[] = [];
  const errors: string[] = [];
  const deadEnds: string[] = [];
  let giveUp = "";
  let stopAll = false;
  let session: SessionInfo | null = null;
  let isTest: boolean | null = null;
  let model = opts.model;
  let compareNote = "";
  let compared = false;
  const hardCap = 60;
  const limit = hardCap;
  const deadline = started.getTime() + 20 * 60 * 1000;
  const specs = opts.mode === "goal" ? specsFor(persona) : [];
  let creds = makeCredentials(persona.id);
  let installedSession: Record<string, unknown> | null = null;
  if (!fresh && !giveUp) {
    const prepared = await prepareAgentAccount(persona.id, persona.name);
    if (!prepared.ok || !prepared.creds) {
      giveUp = `Could not prepare an is_test account (${prepared.detail}).`;
      stopAll = true;
    } else {
      creds = prepared.creds;
      isTest = true;
      installedSession = prepared.session ?? null;
      console.log(`${persona.id} prepared is_test account, onboarding done`);
    }
  }
  const secrets = [creds.password];

  const accountNote = () => {
    fs.writeFileSync(
      path.join(dir, "account.json"),
      JSON.stringify({ email: creds.email, username: creds.username, password: creds.password, userId: session?.userId ?? "", isTest, anonymous: session?.anonymous ?? false }, null, 2),
    );
  };

  const syncAccount = async (): Promise<void> => {
    const container = await appContainer();
    const fromDisk = readContainerSession(container);
    const fromLogin = await signInAgent(agentClient(), creds.email, creds.password);
    const next = fromLogin ?? fromDisk;
    if (!next) return;
    if (next.anonymous && !fresh) return;
    if (sessionMatchesAgent({ fresh, expectedEmail: creds.email, onDevice: next }).startsWith("wrong")) {
      giveUp = "Stopped this agent before the next tap. The simulator was signed in as a different account.";
      return;
    }
    session = next;
    const marked = await markTestAccount(agentClient(), next);
    if (!marked.ok && marked.detail.includes("not found yet")) return;
    isTest = marked.ok;
    if (!marked.ok) {
      stopAll = true;
      giveUp = `Stopped. This account could not be marked is_test (${marked.detail}). No further agents will run.`;
      return;
    }
    if (!opts.allowedNames.includes(persona.name)) opts.allowedNames.push(persona.name);
  };

  let textSizeApplied = "";
  const grants: "allow" | "deny" = "allow";
  const accountOnDevice = async () => readContainerSession(await appContainer());
  const installPrepared = async () => {
    await wipeAppData();
    const leftover = await accountOnDevice();
    if (leftover && !leftover.anonymous) await wipeAppData();
    if (installedSession) await installAppSession(installedSession);
  };
  const openForAgent = async () => {
    await openApp(opts.maestro, grants);
    await sleep(1200);
    if (!fresh) {
      const landed = await scriptedLogin(opts.maestro, creds, false);
      console.log(`${persona.id} login ${landed}`);
      if (landed !== "home") errors.push("Prepared login did not reach Home. The model will continue from the current screen.");
    } else {
      await waitUntilReady(opts.maestro, persona.group === "stress");
    }
  };
  try {
    if (!giveUp) {
      textSizeApplied = await setTextSize(persona.textSize);
      const privacy = await applyPrivacy(persona.stress);
      if (privacy) console.log(`${persona.id} ${privacy}`);
      let accountOk = false;
      let lastStatus = "";
      for (let attempt = 0; attempt < 2 && !accountOk; attempt++) {
        await installPrepared();
        await openForAgent();
        lastStatus = "";
        for (let read = 0; read < 5; read++) {
          lastStatus = sessionMatchesAgent({ fresh, expectedEmail: creds.email, onDevice: await accountOnDevice() });
          if (lastStatus === "match" || (fresh && lastStatus === "signed_out")) break;
          if (lastStatus === "wrong_account") break;
          await sleep(400);
        }
        accountOk = lastStatus === "match" || (fresh && lastStatus === "signed_out");
        if (!accountOk && lastStatus !== "wrong_account") {
          accountOk = true;
          console.log(`${persona.id} session file was not readable after Home. Continuing. A different account still stops this agent.`);
        }
        if (!accountOk) console.log(`${persona.id} signed-in account did not match (${lastStatus}). Resetting.`);
      }
      if (!accountOk) {
        giveUp = "Skipped. The signed-in account still did not match this agent after a reset.";
        errors.push(giveUp);
      } else if (lastStatus === "match" || (fresh && lastStatus === "signed_out")) {
        console.log(`${persona.id} account matches before step 1`);
      }
    }
  } catch (err) {
    crashes.push(err instanceof Error ? err.message : "Could not launch the app");
    giveUp = crashes[0] ?? "launch failed";
    textSizeApplied = textSizeApplied || "not set";
  }

  let lastSig = "";
  let lastVisual: Buffer | null = null;
  let same = 0;
  let ignoreStuck = false;
  let relaunch = false;

  for (let n = 1; n <= limit && !giveUp; n++) {
    if (Date.now() > deadline) {
      giveUp = "Stopped at 20 minutes.";
      break;
    }
    if (opts.spend.usd >= opts.capUsd) {
      giveUp = `Stopped because measured API spend hit the $${opts.capUsd} cap.`;
      break;
    }
    const t0 = Date.now();
    const shotFile = path.join(dir, "shots", `${String(n).padStart(3, "0")}.png`);
    let lines: string[] = [];
    let els: El[] = [];
    let screen = "unknown";
    let error = "";
    try {
      await shot(shotFile);
      await resize(shotFile);
      if (n === 1) {
        for (let attempt = 0; attempt < 4 && !session && !stopAll; attempt++) {
          await syncAccount();
          if (!session && !stopAll) await sleep(800);
        }
      } else {
        await syncAccount();
      }
      if (stopAll) break;
      els = parseHierarchy(await opts.maestro.inspect(deviceId()));
      lines = visibleLines(els).map((line) => redact(line, secrets));
      if (isSpringboard(lines) && !relaunch) {
        relaunch = true;
        await openApp(opts.maestro, grants);
        await sleep(1000);
        els = parseHierarchy(await opts.maestro.inspect(deviceId()));
        lines = visibleLines(els).map((line) => redact(line, secrets));
      }
      if (isSpringboard(lines)) {
        crashes.push("The app was not in the foreground.");
        giveUp = "App did not open.";
        break;
      }
      screen = classifyScreen(lines);
      const alert = systemAlert(lines, persona.group === "stress");
      if (alert) {
        const hit = resolveTarget(alert, els);
        await opts.maestro.run(deviceId(), actionYaml("tap", alert, undefined, hit?.point));
        const row: StepLog = {
          step: n,
          timestamp: new Date().toISOString(),
          screen,
          route: screen,
          action: "tap",
          target: alert,
          thought: "iOS permission alert",
          confusion: "",
          emotion: "neutral",
          latencyMs: Date.now() - t0,
          error: "",
          shot: path.relative(dir, shotFile),
        };
        steps.push(row);
        fs.appendFileSync(path.join(dir, "steps.jsonl"), JSON.stringify(row) + "\n");
        console.log(`${persona.id} ${n}/${limit} alert ${alert}`);
        continue;
      }
      seen.push(lines.join("\n"));
      const sig = screenSignature([...lines, ...scrollMarks(els)]);
      let visual: Buffer | null = null;
      try {
        visual = samplePng(fs.readFileSync(shotFile));
      } catch {
        visual = null;
      }
      same = nextStreak({
        text: sig,
        visual,
        lastText: lastSig,
        lastVisual,
        streak: same,
        ignore: ignoreStuck,
      });
      ignoreStuck = false;
      lastSig = sig;
      lastVisual = visual;
      if (same >= 3) {
        deadEnds.push(`${screen}: the same screen came up 3 times`);
        giveUp = `Gave up. ${screen} repeated 3 times.`;
        const aborted: StepLog = {
          step: n,
          timestamp: new Date().toISOString(),
          screen,
          route: screen,
          action: "abort",
          target: "",
          thought: "",
          confusion: "",
          emotion: "frustrated",
          latencyMs: Date.now() - t0,
          error: giveUp,
          shot: path.relative(dir, shotFile),
        };
        steps.push(aborted);
        fs.appendFileSync(path.join(dir, "steps.jsonl"), JSON.stringify(aborted) + "\n");
        break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "step failed";
      crashes.push(message);
      giveUp = message;
      break;
    }

    const goalStatus = specs.map((spec) => spec.text);
    const prompt = userPrompt({ persona, mode: opts.mode, creds, lines, history: steps, goalStatus, prepared: !fresh });
    let ask = await askModel({ apiKey: opts.apiKey, model, system: systemPrompt(), prompt, imagePath: shotFile });
    opts.spend.usd += ask.usd;
    opts.spend.input += ask.inputTokens;
    opts.spend.output += ask.outputTokens;
    opts.spend.calls += 1;

    if (opts.compare && !compared) {
      compared = true;
      const sonnet = await askModel({ apiKey: opts.apiKey, model: SONNET_MODEL, system: systemPrompt(), prompt, imagePath: shotFile });
      opts.spend.usd += sonnet.usd;
      opts.spend.input += sonnet.inputTokens;
      opts.spend.output += sonnet.outputTokens;
      opts.spend.calls += 1;
      const haikuScore = score(ask.raw, lines);
      const sonnetScore = score(sonnet.raw, lines);
      if (sonnetScore > haikuScore) {
        model = SONNET_MODEL;
        ask = sonnet;
        compareNote = `Sonnet scored ${sonnetScore}, Haiku ${haikuScore}. Using Sonnet for the rest of the pilot.`;
      } else {
        model = HAIKU_MODEL;
        compareNote = `Haiku scored ${haikuScore}, Sonnet ${sonnetScore}. Using Haiku for the rest of the pilot.`;
      }
      console.log(compareNote);
    }

    if (!ask.raw && !ask.error) ask.error = "empty model reply";
    let decision = parseDecision(ask.raw);
    if (!decision && !ask.error) {
      const repair = await askModel({
        apiKey: opts.apiKey,
        model,
        system: systemPrompt(),
        prompt: `${prompt}\n\nYour last reply was not valid JSON. Reply with one JSON object only.`,
        imagePath: shotFile,
      });
      opts.spend.usd += repair.usd;
      opts.spend.input += repair.inputTokens;
      opts.spend.output += repair.outputTokens;
      opts.spend.calls += 1;
      decision = parseDecision(repair.raw);
      if (!decision) ask.error = ask.error || "model reply was not valid JSON";
    }
    if (ask.error) error = ask.error;

    let action = decision?.action ?? "none";
    let target = decision?.target ?? "";
    const thought = decision?.thought ?? "";
    const confusion = decision?.confusion ?? "";
    const emotion = decision?.emotion ?? "frustrated";

    if (decision && !error) {
      const gate = reviewAction({ decision, screenText: lines.join("\n"), allowedNames: opts.allowedNames, group: persona.group });
      if (!gate.ok) error = gate.reason;
      else if (decision.action === "done") {
        giveUp = "Agent stopped on their own.";
      } else if (decision.action === "wait") {
        await sleep(1000);
      } else if (decision.action === "kill_app") {
        try {
          await opts.maestro.run(deviceId(), actionYaml("kill_app", "", ""));
          await sleep(500);
          await openApp(opts.maestro, grants);
        } catch (err) {
          error = err instanceof Error ? err.message : "kill failed";
        }
      } else {
        try {
          let hit = decision.action === "scroll" || decision.action === "back" ? null : resolveTarget(decision.target, els);
          if (hit?.below) {
            await opts.maestro.run(deviceId(), actionYaml("scroll", "down"));
            await sleep(500);
            els = parseHierarchy(await opts.maestro.inspect(deviceId()));
            hit = resolveTarget(decision.target, els);
          }
          const already =
            decision.action === "type" &&
            decision.text &&
            hit?.value &&
            (hit.value.includes(decision.text) || (secrets.includes(decision.text) && hit.value.length >= decision.text.length));
          const chip = decision.action === "tap" ? selectedChip(decision.target, els) : null;
          if (chip) {
            error = `${chip} is already selected.`;
            ignoreStuck = true;
          } else if (!already) {
            await opts.maestro.run(deviceId(), actionYaml(decision.action, hit?.label || decision.target, decision.text, hit?.point));
            await sleep(400);
          }
          if (decision.action === "type" && decision.text && !already) {
            const after = parseHierarchy(await opts.maestro.inspect(deviceId()));
            const secret = secrets.some((item) => item && decision.text === item);
            const needle = decision.text.slice(0, Math.min(24, decision.text.length));
            if (!secret && needle.length >= 3 && !JSON.stringify(after).includes(needle)) {
              error = "Typed text did not appear in the field.";
            }
          }
        } catch (err) {
          error = err instanceof Error ? err.message : "action failed";
        }
      }
    }
    if (error) errors.push(`${screen}: ${error}`);
    if (persona.tech === "low" && error && target) {
      const prior = steps.filter((step) => step.target === target && step.error).length;
      if (prior + 1 >= 2) {
        giveUp = "Gave up after two failed taps on the same thing.";
      }
    }

    const row: StepLog = {
      step: n,
      timestamp: new Date().toISOString(),
      screen,
      route: screen,
      action,
      target: redact(target, secrets),
      text: decision?.text ? redact(decision.text, secrets) : undefined,
      thought: redact(thought, secrets),
      confusion: redact(confusion, secrets),
      emotion,
      latencyMs: Date.now() - t0,
      error: redact(error, secrets),
      shot: path.relative(dir, shotFile),
    };
    steps.push(row);
    fs.appendFileSync(path.join(dir, "steps.jsonl"), JSON.stringify(row) + "\n");
    console.log(`${persona.id} ${n}/${limit} ${screen} ${action} ${row.target} $${opts.spend.usd.toFixed(2)}`);
    if (decision?.action === "done") break;
  }

  if (!giveUp && steps.length >= hardCap) giveUp = `Hit the ${hardCap}-step cap.`;

  try {
    await syncAccount();
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "account sync failed");
  }
  accountNote();

  const client = agentClient();
  const signed = await signInAgent(client, creds.email, creds.password);
  if (!session && signed) session = signed;
  if (session && !signed) {
    await client.auth.setSession({ access_token: session.accessToken, refresh_token: session.refreshToken });
  }
  const db = session ? await readOwnRows(client, session.userId) : { enrollments: [], checkins: [], shares: [], created: [], error: "" };
  if (db.error) errors.push(db.error);
  const blob = seen.join("\n");
  const goals = specs.map((spec) => judge(spec, { isTest, db, blob, steps, anonymous: session?.anonymous !== false }));
  const wrongNumbers: string[] = [];
  if (db.enrollments.length) {
    for (const claim of dayClaims(blob.split("\n"))) {
      const sameTotal = db.enrollments.filter((row) => row.duration_days === claim.total);
      if (sameTotal.length && sameTotal.every((row) => shownEnrollmentDay(row.current_day, claim.total) !== claim.n)) {
        wrongNumbers.push(`Screen said Day ${claim.n} of ${claim.total}. Enrollment day is ${sameTotal.map((row) => shownEnrollmentDay(row.current_day, claim.total)).join(", ")} (stored current_day ${sameTotal.map((row) => row.current_day ?? "?").join(", ")}).`);
      }
    }
  }
  const stages = stagesReached({ steps, db, opened: steps.length > 0 || !crashes.includes("The app was not in the foreground.") });
  let cleanup = "skipped";
  if (!opts.keep && session && isTest === true && !stopAll) {
    cleanup = await deleteEnrollments(client, session.userId);
  } else if (opts.keep) cleanup = "kept";
  else if (!session) cleanup = "no account";

  const ended = new Date();
  const result: AgentResult = {
    personaId: persona.id,
    group: persona.group,
    mode: opts.mode,
    startedAt: started.toISOString(),
    endedAt: ended.toISOString(),
    steps: steps.length,
    durationSec: Math.round((ended.getTime() - started.getTime()) / 1000),
    goals,
    giveUp,
    crashes,
    errors: [...new Set(errors)].slice(0, 30),
    deadEnds,
    wrongNumbers,
    funnel: stages[stages.length - 1] ?? "opened",
    stages,
    device: "GRIIT iPhone 16. Persona phone size was recorded and not applied, because this is the simulator that has the app installed.",
    textSizeApplied,
    userId: session?.userId ?? "",
    isTest,
    cleanup,
  };
  fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(result, null, 2));
  return { result, model, compareNote, stopAll };
}

function deviceId(): string {
  return UDID;
}

function judge(
  spec: GoalSpec,
  ctx: {
    isTest: boolean | null;
    db: Awaited<ReturnType<typeof readOwnRows>>;
    blob: string;
    steps: StepLog[];
    anonymous: boolean;
  },
): AgentResult["goals"][number] {
  const lower = ctx.blob.toLowerCase();
  if (spec.check === "account") {
    const pass = ctx.isTest === true && !ctx.anonymous;
    return { id: spec.id, text: spec.text, kind: "db", pass, detail: pass ? "profile is_test is true" : "no signed-in is_test profile" };
  }
  if (spec.check === "joined") {
    const pass = ctx.db.enrollments.length > 0;
    return { id: spec.id, text: spec.text, kind: "db", pass, detail: pass ? ctx.db.enrollments.map((row) => row.title || row.challenge_id).join(", ") : "no enrollment row" };
  }
  if (spec.check === "posted") {
    const row = ctx.db.checkins.find((item) => item.status === "completed" && item.task_id && item.date_key && ctx.db.enrollments.some((enr) => enr.id === item.active_challenge_id));
    return { id: spec.id, text: spec.text, kind: "db", pass: Boolean(row), detail: row ? `${row.date_key} task ${row.task_id}` : "no completed check-in for an enrollment" };
  }
  if (spec.check === "shared") {
    const row = ctx.db.shares.find((item) => item.share_state === "shared" && item.event_type !== "joined_challenge" && item.event_type !== "challenge_created");
    return { id: spec.id, text: spec.text, kind: "db", pass: Boolean(row), detail: row ? row.id : "no share_state shared" };
  }
  if (spec.check === "created") {
    const pass = ctx.db.created.length > 0;
    return { id: spec.id, text: spec.text, kind: "db", pass, detail: pass ? ctx.db.created.map((row) => row.title ?? row.id).join(", ") : "no challenge with this creator_id" };
  }
  const pass = observed(spec.text, lower, ctx.steps);
  return { id: spec.id, text: spec.text, kind: "observed", pass, detail: pass ? "seen on screen" : "not seen on screen" };
}

function observed(text: string, blob: string, steps: StepLog[]): boolean {
  if (/premium|paywall/i.test(text)) return /premium|restore purchases/.test(blob);
  if (/streak|freeze|missed/i.test(text)) return /streak|freeze|missed/.test(blob);
  if (/share|invite/i.test(text)) return /share|invite/.test(blob);
  if (/notification|reminder/i.test(text)) return /notification|reminder/.test(blob);
  if (/leaderboard/i.test(text)) return /leaderboard/.test(blob);
  if (/private|privacy/i.test(text)) return /private|no answer keeps it private/.test(blob);
  if (/time window|window/i.test(text)) return /\bam\b|\bpm\b|ends |window/.test(blob);
  if (/feed/i.test(text)) return /today|activity|discover/.test(blob);
  if (/home/i.test(text)) return /\btoday\b/.test(blob);
  if (/come back|back out/i.test(text)) return steps.some((step) => step.action === "back");
  if (/today's task|counter|complete button/i.test(text)) return /complete ·|log it as done|already did it|check off/.test(blob);
  if (/leave the paywall/i.test(text)) return /premium|restore purchases/.test(blob);
  if (/wording|font|largest text/i.test(text)) return blob.length > 20;
  return false;
}

function shownEnrollmentDay(currentDay: number | null | undefined, durationDays: number): number {
  const n = typeof currentDay === "number" && Number.isFinite(currentDay) ? Math.max(1, Math.floor(currentDay)) : 1;
  const total = Number.isFinite(durationDays) ? Math.max(1, Math.floor(durationDays)) : 1;
  return Math.min(n, total);
}

function stagesReached(input: {
  steps: StepLog[];
  db: Awaited<ReturnType<typeof readOwnRows>>;
  opened: boolean;
}): string[] {
  const screens = new Set(input.steps.map((step) => step.screen));
  const stages: string[] = [];
  if (input.opened) stages.push("opened");
  if (screens.has("home")) stages.push("home");
  if (screens.has("discover")) stages.push("discover");
  if (screens.has("challenge")) stages.push("challenge");
  if (input.db.enrollments.length) stages.push("joined");
  if (screens.has("task")) stages.push("task");
  if (input.db.checkins.some((row) => row.status === "completed")) stages.push("completed");
  if (input.db.checkins.some((row) => row.proof_url)) stages.push("photo");
  if (input.db.shares.some((row) => row.share_state === "shared" && row.event_type !== "joined_challenge" && row.event_type !== "challenge_created")) stages.push("shared");
  if (input.steps.some((step) => /follow|comment|respect|like/i.test(step.action + step.target) && !step.error)) stages.push("social");
  return stages;
}

export async function openApp(maestro: MaestroSession, grants: "allow" | "deny"): Promise<void> {
  try {
    await maestro.run(deviceId(), launchYaml(grants, true));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/photos/i.test(message)) throw err;
    console.log("Maestro rejected the photos permission. Launching with camera, location, and notifications.");
    await maestro.run(deviceId(), launchYaml(grants, false));
  }
}

function onHome(lines: string[]): boolean {
  return isHomeScreen(lines);
}

async function readScreen(maestro: MaestroSession): Promise<{ lines: string[]; els: El[] }> {
  const els = parseHierarchy(await maestro.inspect(deviceId()));
  return { els, lines: visibleLines(els) };
}

async function dismissAlert(maestro: MaestroSession, lines: string[], els: El[], deny: boolean): Promise<boolean> {
  const alert = systemAlert(lines, deny);
  if (!alert) return false;
  const hit = resolveTarget(alert, els);
  await maestro.run(deviceId(), actionYaml("tap", alert, undefined, hit?.point));
  await sleep(600);
  return true;
}

async function waitUntilReady(maestro: MaestroSession, deny: boolean): Promise<void> {
  for (let i = 0; i < 12; i++) {
    const screen = await readScreen(maestro);
    if (await dismissAlert(maestro, screen.lines, screen.els, deny)) continue;
    const blob = screen.lines.join(" ");
    if (/downloading/i.test(blob)) {
      await sleep(1000);
      continue;
    }
    if (onHome(screen.lines) || screen.lines.some((line) => line === "Start" || line === "Log in" || line === "Sign in")) return;
    await sleep(800);
  }
}

async function typeInto(maestro: MaestroSession, els: El[], label: string, text: string): Promise<void> {
  const hit = resolveTarget(label, els);
  console.log(`type ${label} -> ${hit?.label ?? "no match"} @ ${hit?.point ?? "none"}`);
  await maestro.run(deviceId(), actionYaml("type", hit?.label || label, text, hit?.point));
  await sleep(500);
}

export async function scriptedLogin(
  maestro: MaestroSession,
  creds: { email: string; password: string },
  deny: boolean,
): Promise<string> {
  let submitted = false;
  for (let i = 0; i < 16; i++) {
    const screen = await readScreen(maestro);
    if (await dismissAlert(maestro, screen.lines, screen.els, deny)) continue;
    if (onHome(screen.lines)) return "home";
    if (/downloading/i.test(screen.lines.join(" "))) {
      await sleep(1000);
      continue;
    }
    const onForm = screen.lines.some((line) => line === "Password" || line === "Email address" || line === "Email" || line.startsWith("Email "));
    const emailEntry = resolveTarget("Continue with email", screen.els);
    if (!onForm && emailEntry) {
      await maestro.run(deviceId(), actionYaml("tap", emailEntry.label, undefined, emailEntry.point));
      await sleep(700);
      continue;
    }
    if (onForm) {
      if (submitted) return "stuck";
      submitted = true;
      await typeInto(maestro, screen.els, "Email", creds.email);
      const emailScreen = await readScreen(maestro);
      await typeInto(maestro, emailScreen.els, "Password", creds.password);
      const form = await readScreen(maestro);
      const sign = resolveTarget("Log in to GRIIT", form.els) ?? resolveTarget("Sign in", form.els);
      if (sign) {
        await maestro.run(deviceId(), actionYaml("tap", sign.label, undefined, sign.point));
        await sleep(1600);
      }
      continue;
    }
    const login = resolveTarget("Log in", screen.els);
    if (login) {
      await maestro.run(deviceId(), actionYaml("tap", login.label, undefined, login.point));
      await sleep(800);
      continue;
    }
    await sleep(700);
  }
  const last = await readScreen(maestro);
  return onHome(last.lines) ? "home" : "stuck";
}
