import React from "react";
import { Redirect } from "expo-router";
import { ROUTES } from "@/lib/routes";

/**
 * Create tab opens the full-screen modal wizard (tab bar hidden).
 */
export default function CreateTabEntry() {
  return <Redirect href={ROUTES.CREATE_WIZARD} />;
}
