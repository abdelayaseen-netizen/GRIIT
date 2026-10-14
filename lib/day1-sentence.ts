import { day1Defers } from "@/backend/lib/late-join-window";
import { JOIN_CAPTION_TODAY, JOIN_CAPTION_TOMORROW, day1StartCopy } from "@/lib/challenge-detail-mapping";

/** The one Day 1 sentence. Today or tomorrow, taken from whether start_at is today. */
export function day1Sentence(defer: boolean): string {
  return defer ? JOIN_CAPTION_TOMORROW : JOIN_CAPTION_TODAY;
}

export function predictedDay1Sentence(args: { todaySecured: boolean; windowClosed: boolean }): string {
  return day1Sentence(day1Defers(args));
}

export function day1SentenceFromStart(
  startAtIso: string | null | undefined,
  timeZone: string,
  now?: Date,
): string {
  return day1StartCopy(startAtIso, timeZone, now);
}
