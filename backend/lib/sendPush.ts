import type { SupabaseClient } from "@supabase/supabase-js";
import Expo from "expo-server-sdk";

const expo = new Expo();

export async function sendPush(params: {
  toToken: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  if (!Expo.isExpoPushToken(params.toToken)) return;
  const messages = [
    {
      to: params.toToken,
      sound: "default" as const,
      title: params.title,
      body: params.body,
      data: params.data ?? {},
    },
  ];
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}

/**
 * Loads profiles.push_token for the recipient. Skips if missing or empty.
 * Yaseen: ensure `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;` has been run in Supabase.
 */
export async function sendPushToProfile(
  supabase: SupabaseClient,
  recipientUserId: string,
  params: { title: string; body: string; data?: Record<string, unknown> }
): Promise<void> {
  const { data } = await supabase.from("profiles").select("push_token").eq("user_id", recipientUserId).maybeSingle();
  const token = (data as { push_token?: string | null } | null)?.push_token?.trim();
  if (!token) return;
  await sendPush({ toToken: token, ...params });
}
