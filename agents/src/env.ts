import fs from "fs";
import path from "path";

function applyFile(file: string) {
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim().replace(/^export\s+/, "");
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
  }
}

export function loadEnv(root: string) {
  applyFile(path.join(root, ".env"));
  applyFile(path.join(root, ".env.local"));
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw new Error(`Missing ${name}. Put it in .env.local and do not commit that file.`);
  return value;
}

export function safeText(value: string): string {
  return value.replace(/sk-ant-[A-Za-z0-9_\-]+/g, "sk-ant-[redacted]").slice(0, 400);
}
