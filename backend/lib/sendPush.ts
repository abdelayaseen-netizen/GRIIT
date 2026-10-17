import type { SupabaseClient } from "@supabase/supabase-js";
import ExpoSdk from "expo-server-sdk";

type ExpoClient = {
  chunkPushNotifications: (messages: object[]) => object[][];
  sendPushNotificationsAsync: (messages: object[]) => Promise<unknown>;
};
type ExpoCtor = (new (options?: object) => ExpoClient) & {
  isExpoPushToken: (token: unknown) => boolean;
};

/** CJS default is the class under Bun. Node ESM hands back `{ Expo, default }`. */
function expoCtor(): ExpoCtor {
  if (typeof ExpoSdk === "function") return ExpoSdk as ExpoCtor;
  const mod = ExpoSdk as unknown as { Expo?: ExpoCtor; default?: ExpoCtor };
  const ctor = mod.Expo ?? mod.default;
  if (typeof ctor !== "function") throw new Error("expo-server-sdk Expo client missing");
  return ctor;
}

const Expo = expoCtor();
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
 * Loads the recipient's Expo push token from profiles.
 * expo_push_token is the canonical column (original schema, written since launch).
 * push_token is a later alias (20260429083000); both are written by registerToken.
 * We select both and prefer the canonical one so either column satisfies the read.
 */
export async function sendPushToProfile(
  supabase: SupabaseClient,
  recipientUserId: string,
  params: { title: string; body: string; data?: Record<string, unknown> }
): Promise<void> {
  const { data } = await supabase
    .from("profiles")
    .select("expo_push_token, push_token")
    .eq("user_id", recipientUserId)
    .maybeSingle();
  const row = data as { expo_push_token?: string | null; push_token?: string | null } | null;
  const token = (row?.expo_push_token ?? row?.push_token)?.trim();
  if (!token) return;
  await sendPush({ toToken: token, ...params });
}
