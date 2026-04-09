import { Redirect } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/** Alias route — empty Discover state and deep links use `/create-challenge`. */
function CreateChallengeRedirectInner() {
  return <Redirect href="/create" />;
}

export default function CreateChallengeRedirect() {
  return (
    <ErrorBoundary>
      <CreateChallengeRedirectInner />
    </ErrorBoundary>
  );
}
