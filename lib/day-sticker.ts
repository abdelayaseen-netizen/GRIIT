/**
 * Frame 111 / v38.2 — Share today after Secured.
 * Today's sticker stays reachable until local midnight in the profile IANA zone.
 */
import { homeDayLine } from "@/lib/home-day-total";

export const SHARE_TODAY = "Share today";
export const WHICH_DAY = "Which day";
export const DAY_STICKER_SHARE = "Share";
export const DAY_SECURED = "Day secured.";
export const TODAY_IS_SECURED = "Today is secured.";
export const UNTIL_MIDNIGHT = "Until midnight";

export type ShareTodayChallenge = {
  id: string;
  name: string;
  day: number;
  dayTotal: number | null;
  photoCount: number;
};

function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Civil YYYY-MM-DD in a required IANA zone. Never device / UTC fallback. */
export function dateKeyInProfileZone(
  instant: Date,
  profileTimeZone: string | null | undefined,
): string | null {
  const tz = profileTimeZone?.trim();
  if (!tz) return null;
  try {
    const s = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(instant);
    return isDateKey(s) ? s : null;
  } catch {
    return null;
  }
}

/**
 * Server `getSecuredDateKeys` only, compared to now in the profile IANA zone.
 * Device UTC must not decide midnight.
 */
export function shareTodayVisible(args: {
  serverSecuredDateKeys: readonly string[];
  profileTimeZone: string | null | undefined;
  now: Date;
}): boolean {
  const nowKey = dateKeyInProfileZone(args.now, args.profileTimeZone);
  if (!nowKey) return false;
  return args.serverSecuredDateKeys.includes(nowKey);
}

export function shareTodayCaption(challengeCount: number): string {
  const n = Math.max(0, Math.floor(challengeCount));
  if (n > 1) return `${UNTIL_MIDNIGHT} · ${n} challenges`;
  return UNTIL_MIDNIGHT;
}

export function shareTodayChallenges(
  sections: readonly {
    id: string;
    challenge: string;
    day: number;
    dayTotal: number | null;
    securedToday: boolean;
    photoCount?: number;
  }[],
): ShareTodayChallenge[] {
  return sections
    .filter((s) => s.securedToday)
    .map((s) => ({
      id: s.id,
      name: s.challenge,
      day: s.day,
      dayTotal: s.dayTotal,
      photoCount: Math.max(0, Math.floor(s.photoCount ?? 0)),
    }));
}

export function showWhichDayPicker(challenges: readonly { id: string }[]): boolean {
  return challenges.length > 1;
}

/** Detail preselects that challenge; Home uses the last secured (most recent in list order). */
export function defaultShareTodayChallenge(
  challenges: readonly ShareTodayChallenge[],
  preselectedId?: string | null,
): ShareTodayChallenge | null {
  if (challenges.length === 0) return null;
  if (preselectedId) {
    const hit = challenges.find((c) => c.id === preselectedId);
    if (hit) return hit;
  }
  return challenges[challenges.length - 1] ?? null;
}

export function shareTodayPickerLine(challenge: ShareTodayChallenge): string {
  const day = homeDayLine(challenge.day, challenge.dayTotal);
  if (challenge.photoCount <= 0) return `${day} · no photo`;
  const photos = challenge.photoCount === 1 ? "1 photo" : `${challenge.photoCount} photos`;
  return `${day} · ${photos}`;
}

export function dayStickerCopy(challenge: Pick<ShareTodayChallenge, "name" | "day" | "dayTotal">): string {
  return `${homeDayLine(challenge.day, challenge.dayTotal)}. ${challenge.name}.`;
}
