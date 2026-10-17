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
import { appContainer, actionYaml, applyPrivacy, launchYaml, openUrl, resize, setTextSize, shot, wipeAppData, UDID } from "./device";
import { parseDecision, reviewAction } from "./gate";
import { needsFreshSignup, specsFor, type GoalSpec } from "./goals";
import { scoreInterview } from "./interview";
import { resolveTarget, systemAlert } from "./match";
import { MaestroSession } from "./maestro";
import { interviewPrompt, MIN_STEPS, systemPrompt, userPrompt } from "./prompt";
import { samplePng } from "./pixels";
import { classifyScreen, dayClaims, isHomeScreen, isSpringboard, isWelcomeScreen, parseHierarchy, screenSignature, scrollMarks, visibleLines, type El } from "./screen";
import { nextStreak, selectedChip } from "./stuck";
import type { AgentResult, DoneTiming, Interview, Mode, Persona, StepLog } from "./types";

export type Spend = { usd: number; input: number; output: number; calls: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Build 90 10.3: what "the task shows as done" looks like after Done. */
const DONE_SHEET = /keep it private|post to friends|post to everyone|only me/i;
const DONE_MARKER = /\b\d+ of \d+ done\b|day secured/i;

export function doneMarker(lines: string[]): { sheet: boolean; visible: string } {
  const blob = lines.join("\n");
  const marker = blob.match(DONE_MARKER);
  return { sheet: DONE_SHEET.test(blob), visible: marker ? marker[0] : "" };
}

/** True when the agent's target is the Done button of a task (Done, Done · 7,000 steps, Done for today). */
export function isDoneTap(action: string, target: string, label: string): boolean {
  if (action !== "tap" && action !== "double_tap") return false;
  return /^done\b/i.test(target.trim()) || /^done\b/i.test(label.trim());
}

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
  const fresh = needsFreshSignup(persona);
  /** A prepared account on a wiped app: the device starts signed out at Welcome and the person logs in. */
  const signedOut = !fresh && persona.startSignedOut === true;
  /** What the device should look like before step 1: signed out for fresh and signed-out personas. */
  const deviceFresh = fresh || signedOut;
  const chunk = persona.chunk ?? path.basename(opts.runDir);
  const started = new Date();
  const steps: StepLog[] = [];
  const seen: string[] = [];
  const crashes: string[] = [];
  const errors: string[] = [];
  const deadEnds: string[] = [];
  const doneTimings: DoneTiming[] = [];
  let pendingDone: { step: number; at: number; label: string; sheetMs: number | null; choice: string; choiceAt: number | null; prior: string } | null = null;
  let startedOn = "";
  let freshStartOk: boolean | null = fresh ? false : null;
  let earlyStopsRefused = 0;
  let timingsLogged = 0;
  let note = "";
  let giveUp = "";
  let stopAll = false;
  const logStep = (row: StepLog) => {
    steps.push(row);
    fs.appendFileSync(path.join(dir, "steps.jsonl"), JSON.stringify(row) + "\n");
  };
  /** Polls the screen after a Done tap until the sheet or a done marker shows. Returns the lines it last saw. */
  const watchDone = async (maxMs: number): Promise<void> => {
    if (!pendingDone) return;
    const until = Date.now() + maxMs;
    while (Date.now() < until && pendingDone) {
      const now = parseHierarchy(await opts.maestro.inspect(deviceId()));
      const found = doneMarker(visibleLines(now));
      const sinceDone = Date.now() - pendingDone.at;
      if (found.sheet && pendingDone.sheetMs == null) pendingDone.sheetMs = sinceDone;
      // A marker that was already on screen before the tap (e.g. "2 of 3 done" on Home) does not count;
      // only a new or changed marker, or any marker after the sheet, means this task showed as done.
      const isNew = found.visible && (found.visible.toLowerCase() !== pendingDone.prior.toLowerCase() || pendingDone.sheetMs != null);
      if (isNew) {
        // Done → sheet is pure UI time. Sheet choice → done marker is pure UI time. The person's
        // thinking time between the two is not counted.
        const elapsed = Date.now() - (pendingDone.choiceAt ?? pendingDone.at);
        doneTimings.push({ step: pendingDone.step, taskLabel: pendingDone.label, tappedAt: new Date(pendingDone.at).toISOString(), toSheetMs: pendingDone.sheetMs, toVisibleMs: elapsed, marker: found.visible, choice: pendingDone.choice });
        console.log(`${persona.id} done→visible ${elapsed} ms (${found.visible}${pendingDone.choice ? ` after ${pendingDone.choice}` : ""})${pendingDone.sheetMs != null ? `, sheet at ${pendingDone.sheetMs} ms` : ""}`);
        pendingDone = null;
        return;
      }
      if (found.sheet && pendingDone.choiceAt == null) return;
      await sleep(150);
    }
  };
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
  if (!fresh && persona.id === "p36") {
    const email = process.env.APP_REVIEW_LOGIN?.trim() ?? "";
    const password = process.env.APP_REVIEW_PASSWORD?.trim() ?? "";
    if (!email || !password) {
      giveUp = "Review login is missing from the environment.";
      stopAll = true;
    } else {
      creds = { email, password, username: "review" };
      isTest = true;
      console.log("p36 using the review login");
    }
  } else if (!fresh && !giveUp) {
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
    if (sessionMatchesAgent({ fresh: deviceFresh, expectedEmail: creds.email, onDevice: next }).startsWith("wrong")) {
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
    if (installedSession && !signedOut) await installAppSession(installedSession);
  };
  const openForAgent = async () => {
    await openApp(opts.maestro, grants);
    await sleep(1200);
    if (!deviceFresh) {
      const landed = await scriptedLogin(opts.maestro, creds, false);
      console.log(`${persona.id} login ${landed}`);
      if (landed !== "home") errors.push("Prepared login did not reach Home. The model will continue from the current screen.");
      startedOn = landed === "home" ? "home" : classifyScreen((await readScreen(opts.maestro)).lines);
    } else {
      // Build 90 10.3: a fresh persona must see Welcome. A leftover session or onboarding flag
      // in the container sends a wiped install straight to Home; wipe again and relaunch, up to 3 times.
      for (let attempt = 0; attempt < 3; attempt++) {
        await waitUntilReady(opts.maestro, persona.group === "stress");
        const first = await readScreen(opts.maestro);
        if (isWelcomeScreen(first.lines)) {
          startedOn = "welcome";
          freshStartOk = true;
          break;
        }
        startedOn = classifyScreen(first.lines);
        console.log(`${persona.id} fresh persona opened on ${startedOn}, not Welcome (attempt ${attempt + 1}). Wiping and relaunching.`);
        await wipeAppData();
        await openApp(opts.maestro, grants);
        await sleep(1200);
      }
      if (!freshStartOk) errors.push(`Fresh persona did not start at Welcome after 3 wipes (opened on ${startedOn}).`);
    }
    for (const link of persona.links ?? []) {
      const opened = await openUrl(link);
      console.log(`${persona.id} link ${link} ${opened}`);
      if (opened !== "opened") errors.push(`Could not open ${link}: ${opened}`);
      await sleep(1500);
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
          lastStatus = sessionMatchesAgent({ fresh: deviceFresh, expectedEmail: creds.email, onDevice: await accountOnDevice() });
          if (lastStatus === "match" || (deviceFresh && lastStatus === "signed_out")) break;
          if (lastStatus === "wrong_account") break;
          await sleep(400);
        }
        accountOk = lastStatus === "match" || (deviceFresh && lastStatus === "signed_out");
        if (!accountOk && lastStatus !== "wrong_account") {
          accountOk = true;
          console.log(`${persona.id} session file was not readable after Home. Continuing. A different account still stops this agent.`);
        }
        if (!accountOk) console.log(`${persona.id} signed-in account did not match (${lastStatus}). Resetting.`);
      }
      if (!accountOk) {
        giveUp = "Skipped. The signed-in account still did not match this agent after a reset.";
        errors.push(giveUp);
      } else if (lastStatus === "match" || (deviceFresh && lastStatus === "signed_out")) {
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
        logStep({
          step: n,
          timestamp: new Date().toISOString(),
          screen,
          route: screen,
          screenName: "iOS permission alert",
          chunk,
          action: "tap",
          target: alert,
          thought: "iOS permission alert",
          confusion: "",
          emotion: "neutral",
          latencyMs: Date.now() - t0,
          error: "",
          shot: path.relative(dir, shotFile),
        });
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
        if (steps.length < MIN_STEPS) {
          // Build 90 10.3: the 15-tap minimum holds. Before it, a repeated screen is a nudge, not an exit.
          note = `The screen has not changed for 3 steps. Do something different: scroll, a different button, the tab bar, or back.`;
          same = 0;
          earlyStopsRefused += 1;
          console.log(`${persona.id} ${n}/${limit} ${screen} repeated 3 times before ${MIN_STEPS} steps; nudging instead of stopping`);
        } else {
          giveUp = `Gave up. ${screen} repeated 3 times.`;
          logStep({
            step: n,
            timestamp: new Date().toISOString(),
            screen,
            route: screen,
            screenName: screen,
            chunk,
            action: "abort",
            target: "",
            thought: "",
            confusion: "",
            emotion: "frustrated",
            latencyMs: Date.now() - t0,
            error: giveUp,
            shot: path.relative(dir, shotFile),
          });
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "step failed";
      crashes.push(message);
      giveUp = message;
      break;
    }

    const goalStatus = specs.map((spec) => spec.text);
    const prompt = userPrompt({ persona, mode: opts.mode, creds, lines, history: steps, goalStatus, prepared: !deviceFresh, signedOut, note });
    note = "";
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

    let doneTapped = false;
    if (decision && !error) {
      const gate = reviewAction({ decision, screenText: lines.join("\n"), allowedNames: opts.allowedNames, group: persona.group });
      if (!gate.ok) error = gate.reason;
      else if (decision.action === "done") {
        if (steps.length < MIN_STEPS) {
          // Build 90 10.3: the 15-tap minimum. Oct 15: 11 of 38 sessions ended early on action done.
          earlyStopsRefused += 1;
          error = `Stopping was refused: ${steps.length} of the ${MIN_STEPS} actions owed. Keep going.`;
          note = "You tried to stop too early. Keep using the app the way you would if a friend asked you to give it a real try.";
          action = "done_refused";
        } else {
          giveUp = "Agent stopped on their own.";
        }
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
            // The screen classifier often calls the task screen "home" or "challenge", so do not gate on it:
            // a real Done button on screen (hit) or a done marker in reach is enough.
            const priorMarker = doneMarker(lines).visible;
            doneTapped =
              isDoneTap(decision.action, decision.target, hit?.label ?? "") &&
              // "Done" on the Day secured screen only dismisses it; the task was already done.
              !/day secured/i.test(priorMarker) &&
              (screen === "task" || hit != null || /\bday \d+ of \d+\b/i.test(lines.join("\n")));
            const tappedAt = Date.now();
            await opts.maestro.run(deviceId(), actionYaml(decision.action, hit?.label || decision.target, decision.text, hit?.point));
            if (doneTapped) {
              // Build 90 10.3: time from tapping Done until the task shows as done.
              const chrome = /^(griit|home|today|discover|profile|feed|me|back|go back|done|skip)$/i;
              const taskLine =
                lines.find((line) => line !== hit?.label && line.length > 3 && line.length < 60 && !/^done\b/i.test(line) && !chrome.test(line.trim()) && !/^\d+:\d+$/.test(line.trim())) ??
                decision.screen ??
                "";
              pendingDone = { step: n, at: tappedAt, label: taskLine, sheetMs: null, choice: "", choiceAt: null, prior: priorMarker };
              await watchDone(12000);
            } else if (pendingDone) {
              const choiceLabel = hit?.label || decision.target;
              if (DONE_SHEET.test(choiceLabel)) {
                pendingDone.choice = choiceLabel;
                pendingDone.choiceAt = tappedAt;
                await watchDone(8000);
              } else {
                // Not a sheet choice: the Done tap did not show as done inside its window. Record it as
                // not seen instead of letting a later screen inherit the whole elapsed time.
                doneTimings.push({ step: pendingDone.step, taskLabel: pendingDone.label, tappedAt: new Date(pendingDone.at).toISOString(), toSheetMs: pendingDone.sheetMs, toVisibleMs: null, marker: "", choice: pendingDone.choice });
                pendingDone = null;
                await sleep(400);
              }
            } else {
              await sleep(400);
            }
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
    if (persona.tech === "low" && error && target && steps.length >= MIN_STEPS) {
      const prior = steps.filter((step) => step.target === target && step.error).length;
      if (prior + 1 >= 2) {
        giveUp = "Gave up after two failed taps on the same thing.";
      }
    }

    // Build 90 10.3: the real screen name. The classifier's bucket stays in `screen`; when it says
    // other/unknown, or the agent named a screen the classifier cannot tell apart, log the agent's name.
    const agentScreen = decision?.screen ? redact(decision.screen, secrets) : "";
    const screenName = agentScreen && (screen === "other" || screen === "unknown" || agentScreen.toLowerCase() !== screen) ? agentScreen : screen;
    const timing = doneTimings.length > timingsLogged ? doneTimings[doneTimings.length - 1] : undefined;
    timingsLogged = doneTimings.length;
    const row: StepLog = {
      step: n,
      timestamp: new Date().toISOString(),
      screen,
      route: screen,
      screenName,
      chunk,
      action,
      target: redact(target, secrets),
      text: decision?.text ? redact(decision.text, secrets) : undefined,
      thought: redact(thought, secrets),
      confusion: redact(confusion, secrets),
      emotion,
      latencyMs: Date.now() - t0,
      error: redact(error, secrets),
      shot: path.relative(dir, shotFile),
      doneToSheetMs: doneTapped ? (timing?.toSheetMs ?? pendingDone?.sheetMs ?? undefined) : undefined,
      doneToVisibleMs: timing?.toVisibleMs ?? undefined,
    };
    logStep(row);
    console.log(`${persona.id} ${n}/${limit} ${chunk} ${screenName} ${action} ${row.target} $${opts.spend.usd.toFixed(2)}`);
    if (decision?.action === "done" && giveUp) break;
  }

  if (!giveUp && steps.length >= hardCap) giveUp = `Hit the ${hardCap}-step cap.`;
  if (pendingDone) {
    doneTimings.push({ step: pendingDone.step, taskLabel: pendingDone.label, tappedAt: new Date(pendingDone.at).toISOString(), toSheetMs: pendingDone.sheetMs, toVisibleMs: null, marker: "", choice: pendingDone.choice });
    pendingDone = null;
  }

  // Build 90 10.4 chunk 6: the exit interview, asked of every persona, scored right or wrong.
  let interview: Interview | null = null;
  if (steps.length > 0 && !stopAll) {
    const lastShot = steps[steps.length - 1]?.shot;
    const imagePath = lastShot ? path.join(dir, lastShot) : "";
    if (imagePath && fs.existsSync(imagePath)) {
      const asked = await askModel({ apiKey: opts.apiKey, model, system: "You answer as the person described. Reply with one JSON object only.", prompt: interviewPrompt(persona, steps), imagePath });
      opts.spend.usd += asked.usd;
      opts.spend.input += asked.inputTokens;
      opts.spend.output += asked.outputTokens;
      opts.spend.calls += 1;
      interview = scoreInterview(asked.raw);
      fs.writeFileSync(path.join(dir, "interview.json"), JSON.stringify(interview, null, 2));
    }
  }

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
      // lib/challenge-day.ts displayDay: after secure_day, current_day already points at tomorrow, so the
      // screen shows current_day - 1 for the rest of a secured day. Both values are right on that day.
      const shownDays = (row: (typeof sameTotal)[number]) => {
        const stored = shownEnrollmentDay(row.current_day, claim.total);
        return row.last_secured_date_key ? [stored, Math.max(1, stored - 1)] : [stored];
      };
      if (sameTotal.length && sameTotal.every((row) => !shownDays(row).includes(claim.n))) {
        wrongNumbers.push(`Screen said Day ${claim.n} of ${claim.total}. Enrollment day is ${sameTotal.map((row) => shownDays(row).join("/")).join(", ")} (stored current_day ${sameTotal.map((row) => row.current_day ?? "?").join(", ")}${sameTotal.some((row) => row.last_secured_date_key) ? ", secured" : ""}).`);
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
    chunk,
    startedOn: startedOn || "unknown",
    freshStartOk,
    earlyStopsRefused,
    doneTimings,
    interview,
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
