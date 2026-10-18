import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
export const INVITE_BASE = 'https://griit.app/i/'; // short code, never a griit:// UUID
export const inviteUrl = (code: string) => INVITE_BASE + code;
export const INVITE_PLACES = ['afterCreate', 'emptyLeaderboard', 'challengeInviteButton'] as const; // nowhere else
export async function shareInvite(c: { name: string; day: number; code: string }) {
  return Share.share({ message: `Join me on ${c.name}. Day ${c.day} is today. ${inviteUrl(c.code)}`, url: inviteUrl(c.code) }); // Share first
}
export async function copyInvite(code: string, toast: (m: string) => void) { await Clipboard.setStringAsync(inviteUrl(code)); toast('Link copied.'); } // secondary
// Landing: griit.app/i/{code} → App Store; deferred deep link → /invite/{code} accept screen after install.
// Accept: group room → "Accept · Day 1 is today" (the invite is the approval; no owner step). Public → "Join · Day 1 is today". "Not now" keeps it in Activity 7 days.
