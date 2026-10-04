import { Redirect, useLocalSearchParams } from "expo-router";
import Screen from "@/components/ds/Screen";
import { firstString } from "@/lib/task-helpers";

/** Public invite shape `{INVITE_BASE}/i/{code}` lands on the existing invite screen. */
export default function InviteShortLink() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = firstString(params.code);
  return (
    <Screen>
      <Redirect href={code ? `/invite/${code}` : "/(tabs)"} />
    </Screen>
  );
}
