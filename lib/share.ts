import { Share, Platform, Alert } from "react-native";
import {
  challengeDeepLink,
  inviteDeepLink,
  profileDeepLink,
} from "@/lib/deep-links";
import { DEEP_LINK_BASE_URL, APP_STORE_URLS } from "@/lib/config";

const APP_STORE_URL = Platform.select(APP_STORE_URLS);

async function shareOrCopy(message: string, title?: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: title ?? "GRIIT", text: message });
      } else {
        await navigator.clipboard.writeText(message);
        Alert.alert("Copied!", "Share link copied to clipboard.");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        Alert.alert("Copied!", "Share link copied to clipboard.");
      }
    }
    return;
  }
  await Share.share({ message, title: title ?? "GRIIT" });
}

export async function shareChallenge(
  challenge: {
    name: string;
    duration: number;
    id: string;
    tasksPerDay?: number;
  },
  refUserId?: string | null
): Promise<void> {
  const url = challengeDeepLink(challenge.id, refUserId);
  const tasksLine = challenge.tasksPerDay ? `${challenge.tasksPerDay} tasks per day. ` : "";
  const message = `I'm doing "${challenge.name}" — a ${challenge.duration}-day discipline challenge on GRIIT. ${tasksLine}Think you can keep up?\n\n${url}`;
  await shareOrCopy(message, challenge.name);
}

export async function inviteToChallenge(
  challenge: {
    name: string;
    id: string;
    inviteCode?: string;
  },
  refUserId?: string | null
): Promise<void> {
  const inviteCode = challenge.inviteCode ?? challenge.id;
  const url = inviteDeepLink(inviteCode, refUserId);
  const message = `Join me on "${challenge.name}" on GRIIT. Let's hold each other accountable.\n\n${url}`;
  await shareOrCopy(message, "Join my challenge");
}

export async function shareProfile(
  profile: {
    username: string;
    streak: number;
    totalDaysSecured: number;
    tier: string;
  }
): Promise<void> {
  const url = profileDeepLink(profile.username);
  let message: string;
  if (profile.streak > 0) {
    message = `${profile.streak}-day discipline streak on GRIIT. ${profile.totalDaysSecured} total days secured. ${profile.tier} tier. No excuses.\n\n${url}`;
  } else {
    message = `Building discipline one day at a time on GRIIT. ${profile.totalDaysSecured} days secured so far.\n\n${url}`;
  }
  await shareOrCopy(message, "My discipline stats");
}

export async function shareDaySecured(data: {
  streak: number;
  challengeName?: string;
  dayNumber?: number;
}): Promise<void> {
  const url = DEEP_LINK_BASE_URL;
  let message = "Day secured. ";
  if (data.challengeName && data.dayNumber) {
    message += `Day ${data.dayNumber} of "${data.challengeName}" complete. `;
  }
  if (data.streak > 1) {
    message += `${data.streak}-day streak and counting. 🔥`;
  } else {
    message += "Day 1 starts now. 🔥";
  }
  message += `\n\n${url}`;
  await shareOrCopy(message, "Day secured");
}

export async function shareMilestone(data: {
  streak: number;
  milestoneMessage: string;
}): Promise<void> {
  const url = DEEP_LINK_BASE_URL;
  const message = `${data.streak}-day streak on GRIIT. ${data.milestoneMessage}\n\nNo shortcuts. No excuses.\n\n${url}`;
  await shareOrCopy(message, "My streak on GRIIT");
}

export async function shareChallengeComplete(data: {
  name: string;
  duration: number;
  daysCompleted: number;
  isHardMode?: boolean;
}): Promise<void> {
  const url = DEEP_LINK_BASE_URL;
  const hardLine = data.isHardMode ? " Hard Mode." : "";
  const message = `I completed "${data.name}" on GRIIT. ${data.daysCompleted} of ${data.duration} days secured.${hardLine}\n\n${url}`;
  await shareOrCopy(message, "Challenge Complete");
}

export async function shareApp(): Promise<void> {
  const message = `GRIIT — discipline challenges that actually hold you accountable. Join me.\n\n${APP_STORE_URL}`;
  await shareOrCopy(message, "GRIIT");
}
