/**
 * Frame 160 local-push candidates. Max two. Empty when the day is secured.
 */

export const G2A_PUSH_A = "g2a-day-a";
export const G2A_PUSH_B = "g2a-day-b";

export type G2aPushCandidate = {
  at: Date;
  title: string;
  body: string;
};

export function g2aPushCandidates(args: {
  now: Date;
  securedToday: boolean;
  morningHour?: number;
  eveningTime?: string;
  windowCloseAt?: Date | null;
  challengeLine: string;
  windowBody?: string | null;
  eveningBody: string;
  morningBody: string;
}): G2aPushCandidate[] {
  if (args.securedToday) return [];
  const evening = parseHm(args.eveningTime ?? "20:00");
  const morningHour = args.morningHour ?? 7;
  const list: G2aPushCandidate[] = [];
  if (args.windowCloseAt) {
    const at = new Date(args.windowCloseAt.getTime() - 45 * 60 * 1000);
    if (at.getTime() > args.now.getTime() && args.windowBody) {
      list.push({ at, title: args.challengeLine, body: args.windowBody });
    }
  }
  const eveningAt = onDay(args.now, evening.h, evening.m);
  if (eveningAt.getTime() > args.now.getTime()) {
    list.push({ at: eveningAt, title: args.challengeLine, body: args.eveningBody });
  }
  const morningAt = onDay(args.now, morningHour, 0);
  if (morningAt.getTime() > args.now.getTime()) {
    list.push({ at: morningAt, title: args.challengeLine, body: args.morningBody });
  }
  list.sort((a, b) => a.at.getTime() - b.at.getTime());
  return list.slice(0, 2);
}

function parseHm(hhmm: string): { h: number; m: number } {
  const parts = hhmm.split(":");
  const hRaw = Number(parts[0]);
  const mRaw = Number(parts[1]);
  return {
    h: Number.isFinite(hRaw) ? hRaw : 20,
    m: Number.isFinite(mRaw) ? mRaw : 0,
  };
}

function onDay(now: Date, h: number, m: number): Date {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}
