import React from "react";
import { useRouter } from "expo-router";
import { ROUTES } from "@/lib/routes";
import PushedHeader from "@/components/ds/PushedHeader";

export function SettingsNav({ title }: { title: string }) {
  const router = useRouter();
  return (
    <PushedHeader
      title={title}
      onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.TABS_PROFILE as never))}
    />
  );
}
