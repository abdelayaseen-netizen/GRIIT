/**
 * Build 92 chunk 08.1 / 08.2: short invite codes and the public landing page.
 *
 * A code is 8 characters from a 62-character alphabet (62^8 ≈ 2.2e14), drawn from the
 * platform's crypto RNG. Codes live in the existing `invite_tracking` table
 * (`invite_code`, `source = 'invite_link'`, `referrer_user_id` = inviter,
 * `challenge_id`); no new table, no migration.
 */
import { randomInt } from "node:crypto";

export const INVITE_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const INVITE_CODE_LENGTH = 8;
export const INVITE_LINK_SOURCE = "invite_link";
export const DEFAULT_INVITE_BASE_URL = "https://grit-backend-production.up.railway.app";

/** `rng` returns a float in [0, 1). Defaults to the crypto RNG; tests inject a fixed one. */
export function generateInviteCode(rng?: () => number): string {
  let out = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    const idx = rng
      ? Math.min(INVITE_CODE_ALPHABET.length - 1, Math.max(0, Math.floor(rng() * INVITE_CODE_ALPHABET.length)))
      : randomInt(INVITE_CODE_ALPHABET.length);
    out += INVITE_CODE_ALPHABET[idx];
  }
  return out;
}

/** 6–16 alphabet characters. A challenge UUID is not a code. */
export function isInviteCode(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  return /^[A-Za-z0-9]{6,16}$/.test(value);
}

/** Web origin the backend prints into links and pages. */
export function inviteBaseUrl(env: Record<string, string | undefined> = process.env): string {
  const raw = (env.INVITE_BASE_URL ?? "").trim().replace(/\/$/, "");
  return /^https:\/\//i.test(raw) ? raw : DEFAULT_INVITE_BASE_URL;
}

export type InviteRowLike = {
  challenge_id?: string | null;
  referrer_user_id?: string | null;
  invite_code?: string | null;
  source?: string | null;
};

export type ResolvedInvite = { code: string; challengeId: string; inviterId: string };

export function resolveInviteRow(row: InviteRowLike | null | undefined): ResolvedInvite | null {
  if (!row) return null;
  if (!row.challenge_id || !row.referrer_user_id || !row.invite_code) return null;
  return { code: row.invite_code, challengeId: row.challenge_id, inviterId: row.referrer_user_id };
}

export type InviteOutcome = "self" | "member" | "full" | "ended" | "open";

/**
 * What opening a code means for this viewer. Only team / duo / shared-goal runs have a seat
 * cap and a run status; a public challenge is always "open" unless the viewer is the inviter
 * or already in it.
 */
export function inviteOutcome(input: {
  viewerId: string;
  inviterId: string;
  memberIds: readonly string[];
  seats: number;
  cap: number;
  runStatus: string | null;
  participationType: string | null;
}): InviteOutcome {
  if (input.viewerId === input.inviterId) return "self";
  if (input.memberIds.includes(input.viewerId)) return "member";
  const roomed =
    input.participationType === "team" ||
    input.participationType === "duo" ||
    input.participationType === "shared_goal";
  if (!roomed) return "open";
  if (input.runStatus && input.runStatus !== "active" && input.runStatus !== "waiting") return "ended";
  if (input.seats >= input.cap) return "full";
  return "open";
}

/* ----------------------------- landing page (P2-18) ----------------------------- */

/** Same app id as `components/ds/ForceUpdate.tsx`. */
export const APP_STORE_URL = "https://apps.apple.com/app/id6761116285";
export const APP_STORE_CTA = "Get GRIIT on the App Store";
export const OPEN_APP_CTA = "Already have GRIIT? Open it";
export const LANDING_NOT_FOUND_TITLE = "This invite link doesn't work any more.";
export const LANDING_NOT_FOUND_BODY = "Ask your friend for a new one, or start your own challenge.";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export type LandingInput = {
  code: string;
  challengeName: string;
  category: string | null;
  days: number;
  people: number;
  task: string | null;
  proofLine: string | null;
  inviterName: string;
};

const CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif;
         background: #F6F4EF; color: #15130F; display: flex; min-height: 100vh; align-items: center; justify-content: center; }
  main { width: 100%; max-width: 420px; padding: 32px 24px 40px; }
  .brand { font-size: 13px; letter-spacing: .18em; font-weight: 700; color: #6B665C; }
  h1 { font-size: 15px; font-weight: 600; color: #6B665C; margin: 20px 0 6px; }
  .name { font-size: 32px; font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; line-height: 1.1; }
  .meta { font-size: 15px; color: #6B665C; margin: 0 0 24px; }
  .card { background: #FFFFFF; border-radius: 16px; padding: 18px; margin-bottom: 28px; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
  .card .k { font-size: 12px; font-weight: 700; letter-spacing: .12em; color: #6B665C; text-transform: uppercase; }
  .card .v { font-size: 18px; font-weight: 600; margin: 4px 0 10px; }
  .card .p { font-size: 14px; color: #6B665C; margin: 0; }
  .lead { font-size: 15px; color: #15130F; margin: 0 0 16px; }
  .btn { display: block; text-align: center; text-decoration: none; font-weight: 700; font-size: 17px;
         padding: 16px; border-radius: 14px; background: #15130F; color: #FFFFFF; }
  .open { display: block; text-align: center; margin-top: 16px; font-size: 15px; color: #15130F; text-decoration: underline; min-height: 44px; line-height: 44px; }
`;

function page(title: string, body: string, openUrl: string | null): string {
  const redirect = openUrl
    ? `<script>(function(){var u=${JSON.stringify(openUrl)};var t=setTimeout(function(){},1200);try{window.location.href=u;}catch(e){}})();</script>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><style>${CSS}</style></head>
<body><main>${body}</main>${redirect}</body></html>`;
}

export function renderInviteLanding(input: LandingInput): string {
  const openUrl = `griit://invite/${encodeURIComponent(input.code)}`;
  const meta = [input.category, plural(input.days, "day", "days"), plural(input.people, "person", "people")]
    .filter((x): x is string => !!x)
    .map(escapeHtml)
    .join(" · ");
  const task = input.task
    ? `<div class="card"><div class="k">Every day</div><div class="v">${escapeHtml(input.task)}</div>${
        input.proofLine ? `<p class="p">${escapeHtml(input.proofLine)}</p>` : ""
      }</div>`
    : "";
  const body = `
<div class="brand">GRIIT</div>
<h1>${escapeHtml(input.inviterName)} invited you</h1>
<p class="name">${escapeHtml(input.challengeName)}</p>
<p class="meta">${meta}</p>
${task}
<p class="lead">Get the app and you'll land in this challenge, ready to join.</p>
<a class="btn" href="${APP_STORE_URL}" role="button">${APP_STORE_CTA}</a>
<a class="open" href="${openUrl}">${OPEN_APP_CTA}</a>`;
  return page(`${input.inviterName} invited you to ${input.challengeName}`, body, openUrl);
}

export function renderInviteNotFound(): string {
  const body = `
<div class="brand">GRIIT</div>
<p class="name">${escapeHtml(LANDING_NOT_FOUND_TITLE)}</p>
<p class="meta">${escapeHtml(LANDING_NOT_FOUND_BODY)}</p>
<a class="btn" href="${APP_STORE_URL}" role="button">${APP_STORE_CTA}</a>`;
  return page("GRIIT invite", body, null);
}
