/**
 * Signed OAuth state for CSRF protection.
 * State = base64url(json) + '.' + HMAC hex.
 */

import { createHmac, randomBytes } from "crypto";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface StravaStatePayload {
  userId: string;
  nonce: string;
  ts: number;
}

const getSecret = (): string => {
  const s = process.env.STRAVA_OAUTH_STATE_SECRET || process.env.STRAVA_CLIENT_SECRET;
  if (!s) throw new Error("STRAVA_OAUTH_STATE_SECRET or STRAVA_CLIENT_SECRET required for OAuth state");
  return s;
};

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64");
}

export function createState(userId: string): string {
  const payload: StravaStatePayload = {
    userId,
    nonce: randomBytes(16).toString("hex"),
    ts: Date.now(),
  };
  const json = JSON.stringify(payload);
  const encoded = base64UrlEncode(Buffer.from(json, "utf8"));
  const sig = createHmac("sha256", getSecret()).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

export function verifyState(state: string): StravaStatePayload | null {
  try {
    const [encoded, sig] = state.split(".");
    if (!encoded || !sig) return null;
    const payload = JSON.parse(base64UrlDecode(encoded).toString("utf8")) as StravaStatePayload;
    if (!payload.userId || !payload.ts || !payload.nonce) return null;
    const expectedSig = createHmac("sha256", getSecret()).update(encoded).digest("hex");
    if (sig !== expectedSig) return null;
    if (Date.now() - payload.ts > STATE_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
