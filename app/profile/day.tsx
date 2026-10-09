import { Redirect, useLocalSearchParams } from "expo-router";
import Screen from "@/components/ds/Screen";
import { firstString } from "@/lib/task-helpers";

/** Old proof list. The stories viewer owns profile/proof/[date]. */
export default function ProfileDayRedirect() {
  const params = useLocalSearchParams<{ dateKey?: string; userId?: string; at?: string }>();
  const dateKey = firstString(params.dateKey);
  const userId = firstString(params.userId);
  const at = firstString(params.at);
  return (
    <Screen>
      <Redirect
        href={{
          pathname: "/profile/proof/[date]",
          params: { date: dateKey || "today", userId, at },
        }}
      />
    </Screen>
  );
}
