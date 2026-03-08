import { Share, Platform, Alert } from "react-native";
import * as Haptics from "expo-haptics";

// App links — update when deep links or web URLs are ready
// TODO: Add deep links when available (e.g. grit://challenge/[id] or https://griit.app/challenge/[id])
const APP_URL = "https://griit.app";
const APP_STORE_URL = Platform.select({
  ios: "https://apps.apple.com/app/griit/idXXXXXX",
  android: "https://play.google.com/store/apps/details?id=app.grit.challenge_tracker",
  default: APP_URL,
});

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

export async function shareChallenge(challenge: {
  name: string;
  duration: number;
  id: string;
  tasksPerDay?: number;
}): Promise<void> {
  const tasksLine = challenge.tasksPerDay ? `${challenge.tasksPerDay} tasks per day. ` : "";
  const message = `I'm doing "${challenge.name}" — a ${challenge.duration}-day discipline challenge on GRIIT. ${tasksLine}Think you can keep up?\n\n${APP_URL}`;
  await shareOrCopy(message, challenge.name);
}

export async function inviteToChallenge(challenge: {
  name: string;
  id: string;
  inviteCode?: string;
}): Promise<void> {
  const message = `Join me on "${challenge.name}" on GRIIT. Let's hold each other accountable.\n\n${APP_URL}`;
  await shareOrCopy(message, "Join my challenge");
}

export async function shareProfile(profile: {
  username: string;
  streak: number;
  totalDaysSecured: number;
  tier: string;
}): Promise<void> {
  let message: string;
  if (profile.streak > 0) {
    message = `${profile.streak}-day discipline streak on GRIIT. ${profile.totalDaysSecured} total days secured. ${profile.tier} tier. No excuses.\n\n${APP_URL}`;
  } else {
    message = `Building discipline one day at a time on GRIIT. ${profile.totalDaysSecured} days secured so far.\n\n${APP_URL}`;
  }
  await shareOrCopy(message, "My discipline stats");
}

export async function shareDaySecured(data: {
  streak: number;
  challengeName?: string;
  dayNumber?: number;
}): Promise<void> {
  let message = "Day secured. ";
  if (data.challengeName && data.dayNumber) {
    message += `Day ${data.dayNumber} of "${data.challengeName}" complete. `;
  }
  if (data.streak > 1) {
    message += `${data.streak}-day streak and counting. 🔥`;
  } else {
    message += "Day 1 starts now. 🔥";
  }
  message += `\n\n${APP_URL}`;
  await shareOrCopy(message, "Day secured");
}

export async function shareMilestone(data: {
  streak: number;
  milestoneMessage: string;
}): Promise<void> {
  const message = `${data.streak}-day streak on GRIIT. ${data.milestoneMessage}\n\nNo shortcuts. No excuses.\n\n${APP_URL}`;
  await shareOrCopy(message, "My streak on GRIIT");
}

export async function shareChallengeComplete(data: {
  name: string;
  duration: number;
  daysCompleted: number;
  isHardMode?: boolean;
}): Promise<void> {
  const hardLine = data.isHardMode ? " Hard Mode." : "";
  const message = `I completed "${data.name}" on GRIIT. ${data.daysCompleted} of ${data.duration} days secured.${hardLine}\n\n${APP_URL}`;
  await shareOrCopy(message, "Challenge Complete");
}

export async function shareApp(): Promise<void> {
  const message = `GRIIT — discipline challenges that actually hold you accountable. Join me.\n\n${APP_STORE_URL}`;
  await shareOrCopy(message, "GRIIT");
}
