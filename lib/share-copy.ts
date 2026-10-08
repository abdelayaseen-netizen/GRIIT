import { joinMeOnGriitCode } from "@/lib/deep-links";

/** Share-sheet sentence. The link is inviteDeepLink / inviteUrl, never a hard-coded host. */
export function challengeInviteShareText(name: string, link: string): string {
  return `Join me on ${name} on GRIIT. ${link}`;
}

export function defaultInviteShareText(inviteCode?: string | null): string {
  const code = inviteCode?.trim();
  return code ? joinMeOnGriitCode(code) : "Join me on GRIIT";
}

export function challengeShareText(
  challenge: { name: string; duration: number; tasksPerDay?: number },
): string {
  const tasksLine = challenge.tasksPerDay ? `${challenge.tasksPerDay} tasks per day. ` : "";
  return `I'm doing "${challenge.name}" — a ${challenge.duration}-day discipline challenge on GRIIT. ${tasksLine}Think you can keep up?\n\n${defaultInviteShareText()}`;
}

export function profileShareText(profile: {
  username: string;
  streak: number;
  totalDaysSecured: number;
  tier: string;
}): string {
  const { streak, totalDaysSecured, tier } = profile;
  if (streak > 0) {
    return `${streak}-day discipline streak on GRIIT. ${totalDaysSecured} total days secured. ${tier} tier. No excuses.\n\n${defaultInviteShareText()}`;
  }
  return `Building discipline one day at a time on GRIIT. ${totalDaysSecured} days secured so far.\n\n${defaultInviteShareText()}`;
}

export function challengeCompleteShareText(data: {
  name: string;
  duration: number;
  daysCompleted: number;
  isHardMode?: boolean;
}): string {
  const hardLine = data.isHardMode ? " Hard Mode." : "";
  return `I completed "${data.name}" on GRIIT. ${data.daysCompleted} of ${data.duration} days secured.${hardLine}`;
}
