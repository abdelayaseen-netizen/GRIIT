import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { safeText } from "./env";
import { usablePoint } from "./match";

export const APP_ID = "app.griit.challenge-tracker";
/** GRIIT iPhone 16 (iOS 26.4), the simulator the build 90 Maestro flows ran on. AGENTS_UDID overrides it. */
export const UDID = process.env.AGENTS_UDID?.trim() || "B10E65A0-C453-4E58-97BD-A3696ED848AE";

/** Booted simulators other than `udid`, from `xcrun simctl list devices booted -j`. */
export function otherBooted(listJson: string, udid: string): string[] {
  let data: { devices?: Record<string, { udid?: string; name?: string; state?: string }[]> };
  try {
    data = JSON.parse(listJson);
  } catch {
    return [];
  }
  return Object.values(data.devices ?? {})
    .flat()
    .filter((d) => d.state === "Booted" && d.udid && d.udid !== udid)
    .map((d) => `${d.name ?? "simulator"} (${d.udid})`);
}

/**
 * Build 92 12b.5: with two simulators booted, Maestro MCP answers every device_id from one of them
 * (an SE screen came back for a Pro Max on its home screen). Refuse to start instead.
 */
export async function assertOnlySimulator(udid = UDID): Promise<void> {
  const listed = await run("xcrun", ["simctl", "list", "devices", "booted", "-j"]);
  const others = otherBooted(listed.stdout, udid);
  if (others.length) {
    throw new Error(`Another simulator is booted: ${others.join(", ")}. Shut it down so Maestro drives ${udid} only.`);
  }
}

export function run(cmd: string, args: string[], timeoutMs = 20000): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function appContainer(): Promise<string> {
  const result = await run("xcrun", ["simctl", "get_app_container", UDID, APP_ID, "data"]);
  if (result.code !== 0) throw new Error(safeText(result.stderr || "App container was not found. Is GRIIT installed on the simulator?"));
  return result.stdout.trim();
}

export async function wipeAppData(): Promise<void> {
  await run("xcrun", ["simctl", "terminate", UDID, APP_ID]);
  await new Promise((resolve) => setTimeout(resolve, 700));
  const container = await appContainer();
  const support = path.join(container, "Library", "Application Support", APP_ID);
  fs.rmSync(path.join(support, "RCTAsyncLocalStorage_V1"), { recursive: true, force: true });
  fs.rmSync(path.join(container, "Documents"), { recursive: true, force: true });
  fs.rmSync(path.join(container, "Library", "Saved Application State"), { recursive: true, force: true });
  fs.rmSync(path.join(container, "Library", "HTTPStorages", APP_ID), { recursive: true, force: true });
  fs.rmSync(path.join(container, "Library", "SplashBoard"), { recursive: true, force: true });
}

export async function setTextSize(size: "default" | "large" | "largest"): Promise<string> {
  const options =
    size === "largest"
      ? ["accessibility-extra-extra-extra-large", "extra-extra-extra-large"]
      : size === "large"
        ? ["extra-extra-large", "xLarge"]
        : ["large"];
  let last = "";
  for (const option of options) {
    const result = await run("xcrun", ["simctl", "ui", UDID, "content_size", option]);
    last = result.code === 0 ? option : safeText(result.stderr || result.stdout);
    if (result.code === 0) return option;
  }
  return `unchanged (${last || "simctl rejected the size"})`;
}

export async function resetTextSize(): Promise<void> {
  await run("xcrun", ["simctl", "ui", UDID, "content_size", "large"]);
}

export async function applyPrivacy(stress: string | undefined): Promise<string> {
  if (stress === "camera-denied") {
    const result = await run("xcrun", ["simctl", "privacy", UDID, "revoke", "camera", APP_ID]);
    return result.code === 0 ? "camera revoked" : "camera revoke failed";
  }
  if (stress === "location-denied") {
    const result = await run("xcrun", ["simctl", "privacy", UDID, "revoke", "location", APP_ID]);
    return result.code === 0 ? "location revoked" : "location revoke failed";
  }
  if (stress === "offline") return "Offline was not applied. This Mac has no simulator network conditioner wired up.";
  return "";
}

export async function restorePrivacy(): Promise<void> {
  await run("xcrun", ["simctl", "privacy", UDID, "grant", "camera", APP_ID]);
  await run("xcrun", ["simctl", "privacy", UDID, "grant", "location", APP_ID]);
}

/** Opens a deep link (griit://i/<id>) in the simulator, the way a tapped invite would. */
export async function openUrl(url: string): Promise<string> {
  const result = await run("xcrun", ["simctl", "openurl", UDID, url]);
  return result.code === 0 ? "opened" : safeText(result.stderr || result.stdout || "openurl failed");
}

export function shot(file: string): Promise<void> {
  return run("xcrun", ["simctl", "io", UDID, "screenshot", file], 15000).then((result) => {
    if (result.code !== 0) throw new Error(safeText(result.stderr || "screenshot failed"));
  });
}

export async function resize(file: string): Promise<void> {
  await run("sips", ["-Z", "1000", file]);
}

export function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Build 92 12.3. What a type action should do with what the field already holds. Text that starts with the
 * current value only appends the rest, so a journal grows sentence by sentence. Anything else replaces the
 * whole value: a bare eraseText removes only 50 characters, which left the end of a long journal behind.
 */
export function typePlan(existing: string, text: string): { erase: number; input: string } {
  const current = existing ?? "";
  if (current && text.startsWith(current)) return { erase: 0, input: text.slice(current.length) };
  return { erase: current.length ? current.length + 10 : 50, input: text };
}

export function actionYaml(action: string, target: string, text?: string, point?: string, existing = ""): string {
  const safePoint = point ? usablePoint(point) : null;
  const tapAt = safePoint ? `    point: ${yamlQuote(safePoint)}` : `    text: ${yamlQuote(target || " ")}`;
  const lines = [`appId: ${APP_ID}`, "---"];
  if (action === "tap" || action === "double_tap") {
    lines.push("- tapOn:", tapAt);
    if (action === "double_tap") lines.push("- tapOn:", tapAt);
  } else if (action === "type") {
    const plan = typePlan(existing, text ?? "");
    lines.push("- tapOn:", tapAt);
    if (plan.erase) lines.push("- eraseText:", `    charactersToErase: ${plan.erase}`, "    optional: true");
    if (plan.input) lines.push(`- inputText: ${yamlQuote(plan.input).replace(/\n/g, "\\n")}`);
    lines.push("- hideKeyboard:", "    optional: true");
  } else if (action === "scroll") {
    const dir = /down/i.test(target) ? "DOWN" : /left/i.test(target) ? "LEFT" : /right/i.test(target) ? "RIGHT" : "UP";
    lines.push("- swipe:", `    direction: ${dir}`);
  } else if (action === "back") {
    lines.push("- swipe:", `    start: "1%,50%"`, `    end: "70%,50%"`);
  } else if (action === "kill_app") {
    lines.push("- stopApp");
  }
  return lines.join("\n");
}

/** Build 92 12.5: only the cold launch, so the time to the first screen has no optional-tap waits in it. */
export function bareLaunchYaml(grants: "allow" | "deny" = "allow", photos = true): string {
  return launchYaml(grants, photos).split("\n- tapOn:")[0]!;
}

export function launchYaml(grants: "allow" | "deny" = "allow", photos = true): string {
  const location = grants === "allow" ? "always" : "never";
  const permissions = [`      camera: ${grants}`, photos ? `      photos: ${grants}` : "", `      location: ${location}`, `      notifications: ${grants}`].filter(Boolean);
  return [
    `appId: ${APP_ID}`,
    "---",
    "- launchApp:",
    "    stopApp: true",
    "    permissions:",
    ...permissions,
    "- tapOn:",
    '    text: "http://localhost:8082"',
    "    optional: true",
    "- tapOn:",
    '    text: "Not now"',
    "    optional: true",
    "- tapOn:",
    '    text: "Dismiss"',
    "    optional: true",
  ].join("\n");
}
