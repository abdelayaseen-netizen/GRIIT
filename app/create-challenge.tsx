import { Redirect } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Screen from "@/components/ds/Screen";

/** Alias route — empty Discover state and deep links use `/create-challenge`. */
function CreateChallengeRedirectInner() {
  return <Redirect href="/create" />;
}

export default function CreateChallengeRedirect() {
  return (
    <Screen>
      <ErrorBoundary>
        <CreateChallengeRedirectInner />
      </ErrorBoundary>
    </Screen>
  );
}
