import type { NotifRow } from "@/components/activity/types";
import {
  challengeInviteFromNotification,
  isChallengeInviteNotification,
} from "@/lib/group-ui";
import { calendarDayFromStartAt, dateKeyFromIso } from "@/lib/home-day-total";

export function notifEnrollmentId(md: Record<string, unknown> | null | undefined): string | null {
  const id = md?.active_challenge_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export function notifAsOfKey(
  md: Record<string, unknown> | null | undefined,
  createdAt: string,
  timeZone: string,
): string {
  const dk = md?.date_key;
  if (typeof dk === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dk)) return dk;
  return dateKeyFromIso(createdAt, timeZone);
}

/** Calendar Day n from enrollment start_at. No metadata.day_number / current_day. */
export function notifProofDay(args: {
  startAt?: string | null;
  timeZone: string;
  asOfKey: string;
  durationDays?: number | null;
}): number | null {
  if (!args.startAt) return null;
  return calendarDayFromStartAt(args.startAt, args.timeZone, args.asOfKey, args.durationDays);
}

export function notifTitle(n: NotifRow, day: number | null): string {
  const name = n.actorDisplayName ?? n.actorUsername ?? null;
  switch (n.type) {
    case "respect":
      if (name) {
        return day != null
          ? `${name} liked your day ${day} proof`
          : `${name} liked your proof`;
      }
      break;
    case "comment":
      if (name) {
        return day != null
          ? `${name} commented on your day ${day} proof`
          : `${name} commented on your proof`;
      }
      break;
    case "follow":
      if (name) return `${name} started following you`;
      break;
    case "follow_request":
      if (name) return `${name} wants to follow you`;
      break;
    case "rank": {
      const challengeName = String(
        n.metadata.challenge_title ?? n.metadata.challenge_name ?? "challenge",
      );
      const rank = n.metadata.rank;
      const gap = n.metadata.rankGap;
      return `You're #${rank} on ${challengeName}. ${gap} pts behind #${Number(rank) - 1}`;
    }
    case "challenge_invite":
      return challengeInviteFromNotification(n);
    default:
      if (isChallengeInviteNotification(n)) return challengeInviteFromNotification(n);
      break;
  }
  const t = (n.title ?? "").trim();
  const b = (n.body ?? "").trim();
  if (t || b) return [t, b].filter(Boolean).join(" ");
  return "Notification";
}
