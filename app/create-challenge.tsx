import { Redirect } from "expo-router";

/** Alias route — empty Discover state and deep links use `/create-challenge`. */
export default function CreateChallengeRedirect() {
  return <Redirect href="/create" />;
}
