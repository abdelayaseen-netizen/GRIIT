import { Redirect } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";
import { ROUTES } from "@/lib/routes";

/** Retired. The tab is hidden. Old links land on Home. */
function TeamsRedirect() {
  return <Redirect href={ROUTES.TABS_HOME} />;
}

export default function TeamsTabScreen() {
  return (
    <Screen>
      <ErrorBoundary>
        <TeamsRedirect />
      </ErrorBoundary>
    </Screen>
  );
}
