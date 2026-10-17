import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 15 * 60 * 1000;

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function signGuestMergeTicket(fromUserId: string, secret: string, nowMs: number): string {
  const body = Buffer.from(JSON.stringify({ fromUserId, exp: nowMs + TTL_MS }), "utf8").toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function readGuestMergeTicket(
  ticket: string,
  secret: string,
  nowMs: number,
): { fromUserId: string } | null {
  const [body, mac] = ticket.split(".");
  if (!body || !mac) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      fromUserId?: string;
      exp?: number;
    };
    if (!parsed.fromUserId || typeof parsed.exp !== "number" || parsed.exp < nowMs) return null;
    return { fromUserId: parsed.fromUserId };
  } catch {
    return null;
  }
}
