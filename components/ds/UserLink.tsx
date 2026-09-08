import React, { useEffect } from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import { addBreadcrumb } from "@/lib/sentry";

export function isProfileUsername(
  username: string | null | undefined,
): username is string {
  const u = username?.trim() ?? "";
  return u.length >= 2 && u !== "?" && u !== "Someone" && !/^user_[0-9a-f]+$/i.test(u);
}

export type UserLinkProps = {
  username: string | null | undefined;
  userId?: string;
  children: React.ReactNode;
};

export default function UserLink({ username, userId, children }: UserLinkProps) {
  const router = useRouter();
  const handle = username?.trim() ?? "";
  const open = isProfileUsername(handle);

  useEffect(() => {
    if (open) return;
    addBreadcrumb({
      category: "nav",
      message: "UserLink: username missing",
      data: { userId, username: username ?? null },
      level: "info",
    });
  }, [open, userId, username]);

  if (!open) {
    return <>{children}</>;
  }

  return (
    <Pressable
      hitSlop={8}
      onPress={() => router.push(ROUTES.PROFILE_USERNAME(encodeURIComponent(handle)) as never)}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={handle}
    >
      {children}
    </Pressable>
  );
}
