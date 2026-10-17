/**
 * Build 90 chunk 08 (Friend loop), app side.
 *  08.1 the invite link is visible text with Copy and Share on create-success, Day secured
 *       (first secured day) and the board's "A board needs two".
 *  08.2 a griit://i/ link lands a sessionless guest on the challenge with Join; the link opens
 *       a non-team challenge (openLinkRoute "open"); the join leads to the first task.
 *  08.3 Discover search by name or invite code.
 *  Duo waiting room: a still-waiting join opens the challenge page (waiting room), not Home.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveAuthRedirect, isInviteLinkSegment } from "./auth-redirect";
import { openLinkRoute } from "./group-ui";
import { parseInviteCode, searchKind } from "./invite-code";
import {
  inviteLinkFor,
  joinLeftWaitingRoom,
  showInviteAfterSecured,
  viewerInWaitingRoom,
  COPY_LINK_LABEL,
  COPIED_LABEL,
  SHARE_LINK_LABEL,
  WAITING_FOR_PARTNER_HEADING,
  INVITE_AFTER_FIRST_DAY_HEADING,
} from "./invite-link";
import { openHrefForResult, searchEmptyLine, searchRowSubtitle, SEARCH_PLACEHOLDER } from "./discover-search";
import { ROUTES } from "./routes";

const read = (rel: string) => readFileSync(resolve(__dirname, "..", rel), "utf8");
const CH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("08.1 invite link visible (source)", () => {
  it("one shared InviteLinkRow: link text, Copy → Copied, Share", () => {
    const src = read("components/InviteLinkRow.tsx");
    expect(src).toMatch(/inviteLinkFor\(challengeId/);
    expect(src).toMatch(/copyChallengeInvite\(/);
    expect(src).toMatch(/inviteToChallenge\(/);
    expect(src).toMatch(/copied \? COPIED_LABEL : COPY_LINK_LABEL/);
    expect(src).toMatch(/selectable/);
    expect([COPY_LINK_LABEL, COPIED_LABEL, SHARE_LINK_LABEL]).toEqual(["Copy", "Copied", "Share"]);
  });
  it("create-success renders it for every launch (not only groups) with the new challenge id", () => {
    const launched = read("components/create/v2/LaunchedScreen.tsx");
    expect(launched).toMatch(/<InviteLinkRow challengeId=\{challengeId\}/);
    const wizard = read("components/create/CreateWizardV2.tsx");
    expect(wizard).toMatch(/<LaunchedScreen[\s\S]*?challengeId=\{launched\.challengeId\}/);
  });
  it("Day secured renders it after the first secured day", () => {
    const screen = read("components/task-v2/SecuredDayScreen.tsx");
    expect(screen).toMatch(/<InviteLinkRow challengeId=\{invite\.challengeId\}/);
    expect(screen).toContain("INVITE_AFTER_FIRST_DAY_HEADING");
    const route = read("app/task/secured.tsx");
    expect(route).toMatch(/showInviteAfterSecured\(\{/);
    expect(route).toMatch(/challengeId: typeof own\?\.challenge_id === "string"/);
  });
  it("the board's 'A board needs two' renders it", () => {
    const tab = read("components/activity/LeaderboardTab.tsx");
    expect(tab).toMatch(/A board needs two|boardEmptyState/);
    expect(tab).toMatch(/<InviteLinkRow[\s\S]*?challengeId=\{selectedChallengeId\}/);
  });
  it("showInviteAfterSecured: day 1, secured, not finished", () => {
    expect(showInviteAfterSecured({ challengeDay: 1, daySecured: true })).toBe(true);
    expect(showInviteAfterSecured({ challengeDay: 2, daySecured: true })).toBe(false);
    expect(showInviteAfterSecured({ challengeDay: 1, daySecured: false })).toBe(false);
    expect(showInviteAfterSecured({ challengeDay: 1, daySecured: true, challengeDone: true })).toBe(false);
    expect(INVITE_AFTER_FIRST_DAY_HEADING).not.toMatch(/!/);
  });
  it("the link is griit://i/<challenge id>", () => {
    expect(inviteLinkFor(CH)).toMatch(new RegExp(`/i/${CH}$`));
    expect(inviteLinkFor(CH, "u1")).toMatch(/\?ref=u1$/);
  });
});

describe("08.2 opening an invite", () => {
  it("resolveAuthRedirect: no session on an invite link stays (Join is there), elsewhere → onboarding", () => {
    const base = {
      onboardingCompleted: null,
      loading: false,
      profileChecked: true,
      inOnboarding: false,
      inAuth: false,
      onCreateProfile: false,
      inTabs: false,
    };
    expect(resolveAuthRedirect({ ...base, sessionKind: "none", onInviteLink: true })).toEqual({ action: "stay" });
    expect(resolveAuthRedirect({ ...base, sessionKind: "none" })).toEqual({ action: "replace", href: ROUTES.ONBOARDING });
    expect(resolveAuthRedirect({ ...base, sessionKind: "guest", onboardingCompleted: false, onInviteLink: true })).toEqual({ action: "stay" });
    expect(resolveAuthRedirect({ ...base, sessionKind: "guest", onboardingCompleted: false })).toEqual({ action: "replace", href: ROUTES.ONBOARDING });
    // A finished account on a challenge page is unchanged.
    expect(resolveAuthRedirect({ ...base, sessionKind: "real", onboardingCompleted: true, onInviteLink: true })).toEqual({ action: "stay" });
    expect(resolveAuthRedirect({ ...base, sessionKind: "real", onboardingCompleted: true, onInviteLink: true, inOnboarding: true, inTabs: false })).toEqual({ action: "replace", href: "/(tabs)" });
  });
  it("the invite-link segments are i, invite and challenge", () => {
    expect(isInviteLinkSegment("i")).toBe(true);
    expect(isInviteLinkSegment("invite")).toBe(true);
    expect(isInviteLinkSegment("challenge")).toBe(true);
    expect(isInviteLinkSegment("(tabs)")).toBe(false);
    expect(isInviteLinkSegment(undefined)).toBe(false);
    const layout = read("app/_layout.tsx");
    expect(layout).toMatch(/onInviteLink: isInviteLinkSegment\(first\)/);
  });
  it("openLinkRoute: 'open' (non-team) goes to the challenge page", () => {
    expect(openLinkRoute(CH, { state: "open" })).toEqual({ kind: "challenge", challengeId: CH, inviteId: undefined });
    expect(openLinkRoute(CH, {})).toEqual({ kind: "challenge", challengeId: CH, inviteId: undefined });
    expect(openLinkRoute(CH, { state: "ended" })).toEqual({ kind: "ended" });
  });
  it("the invite screen sends a sessionless viewer straight to the challenge with invite=1", () => {
    const src = read("app/invite/[code].tsx");
    expect(src).toMatch(/if \(authLoading\) return;/);
    expect(src).toMatch(/if \(!user\) \{[\s\S]*?router\.replace\(`\$\{ROUTES\.CHALLENGE_ID\(challengeId\)\}\?\$\{guestQuery\.toString\(\)\}`/);
    expect(src).toMatch(/new URLSearchParams\(\{ invite: "1" \}\)/);
    expect(src).not.toMatch(/if \(!user\) return;/);
  });
  it("the challenge page: a link guest gets a session, is marked onboarded, then lands on the first task", () => {
    const src = read("app/challenge/[id].tsx");
    expect(src).toMatch(/const viaInvite = /);
    expect(src).toMatch(/viaInvite \? \{ id: id!, viaInvite: true \} : \{ id: id! \}/);
    expect(src).toMatch(/viaInvite \? \{ challengeId: id, viaInvite: true \} : \{ challengeId: id \}/);
    expect(src).toMatch(/setKnownOnboardingCompleted\(anon\.user\.id, true\)/);
    expect(src).toMatch(/if \(linkGuest\) \{\s*await completeOnboardingV2\(\{ destination: taskHref \?\? ROUTES\.TABS_HOME \}\)/);
    expect(src).toMatch(/router\.replace\(\(taskHref \?\? ROUTES\.TABS_HOME\) as never\)/);
  });
  it("server: openLink opens non-team, getById/join take viaInvite (source)", () => {
    const groups = read("backend/trpc/routes/groups.ts");
    expect(groups).toMatch(/participation_type !== "team"\) \{\s*return \{ state: "open" as const \};/);
    const challenges = read("backend/trpc/routes/challenges.ts");
    expect(challenges).toMatch(/getById: publicProcedure\s*\.input\(z\.object\(\{ id: z\.string\(\)\.uuid\(\), viaInvite: z\.boolean\(\)\.optional\(\) \}\)\)/);
    const join = read("backend/trpc/routes/challenges-join.ts");
    expect(join).toMatch(/viaInvite: z\.boolean\(\)\.optional\(\)/);
    expect(join).toMatch(/const viaInvite = input\.viaInvite === true && canOpenViaInviteLink\(ch\)/);
  });
});

describe("08.3 Discover search", () => {
  it("parseInviteCode reads a bare uuid, a griit://i/ link, a web link, the share sentence", () => {
    expect(parseInviteCode(CH)).toBe(CH);
    expect(parseInviteCode(` ${CH.toUpperCase()} `)).toBe(CH);
    expect(parseInviteCode(`griit://i/${CH}`)).toBe(CH);
    expect(parseInviteCode(`griit://i/${CH}?ref=11111111-1111-4111-8111-111111111111`)).toBe(CH);
    expect(parseInviteCode(`https://griit.app/i/${CH}`)).toBe(CH);
    expect(parseInviteCode(`griit://challenge/${CH}`)).toBe(CH);
    expect(parseInviteCode(`Join me on GRIIT · code ${CH}`)).toBe(CH);
    expect(parseInviteCode(`Join me on Morning run on GRIIT. griit://i/${CH}`)).toBe(CH);
  });
  it("parseInviteCode ignores words, partial ids and ids glued to letters", () => {
    expect(parseInviteCode("morning run")).toBeNull();
    expect(parseInviteCode("aaaaaaaa-aaaa-4aaa-8aaa")).toBeNull();
    expect(parseInviteCode(`x${CH}`)).toBeNull();
    expect(parseInviteCode(`${CH}z`)).toBeNull();
    expect(parseInviteCode("")).toBeNull();
    expect(parseInviteCode(null)).toBeNull();
  });
  it("searchKind: empty under two letters, code, title", () => {
    expect(searchKind("")).toBe("empty");
    expect(searchKind("m")).toBe("empty");
    expect(searchKind("mo")).toBe("title");
    expect(searchKind(CH)).toBe("code");
  });
  it("empty lines name the query; an exact code opens via invite", () => {
    expect(searchEmptyLine("morning", { code: null, exact: null, results: [] })).toBe('No challenge named "morning".');
    expect(searchEmptyLine(CH, { code: CH, exact: null, results: [] })).toBe("No challenge has that code.");
    expect(searchEmptyLine("morning", { code: null, exact: null, results: [{ id: CH, title: "Morning run", duration_days: 7, participation_type: "solo", participants_count: 3 }] })).toBeNull();
    expect(searchEmptyLine("", null)).toBeNull();
    expect(openHrefForResult("/challenge/x", true)).toBe("/challenge/x?invite=1&source=discover");
    expect(openHrefForResult("/challenge/x", false)).toBe("/challenge/x?source=discover");
  });
  it("row subtitle: days · mode · Strict/Standard · people", () => {
    expect(searchRowSubtitle({ id: CH, title: "x", duration_days: 7, participation_type: "duo", participants_count: 2, is_hard_mode: true })).toBe("7 days · Duo · Strict · 2 people");
    expect(searchRowSubtitle({ id: CH, title: "x", duration_days: 1, participation_type: null, participants_count: 0 })).toBe("1 day · Solo · Standard");
    expect(SEARCH_PLACEHOLDER).not.toMatch(/!/);
  });
  it("Discover renders the search field and opens results (source)", () => {
    const v3 = read("components/discover/DiscoverV3.tsx");
    expect(v3).toMatch(/<DiscoverSearch onOpen=\{onOpenSearchResult\} \/>/);
    const search = read("components/discover/DiscoverSearch.tsx");
    expect(search).toMatch(/TRPC\.challenges\.search/);
    expect(search).toMatch(/returnKeyType="search"/);
    const tab = read("app/(tabs)/discover.tsx");
    expect(tab).toMatch(/openHrefForResult\(ROUTES\.CHALLENGE_ID\(challengeId\), viaInvite\)/);
  });
});

describe("duo waiting room", () => {
  it("joinLeftWaitingRoom: joined + waiting + no enrollment", () => {
    expect(joinLeftWaitingRoom({ joined: true, runStatus: "waiting" })).toBe(true);
    expect(joinLeftWaitingRoom({ joined: true, runStatus: "active" })).toBe(false);
    expect(joinLeftWaitingRoom({ id: "ac1", joined: true, runStatus: "waiting" })).toBe(false);
    expect(joinLeftWaitingRoom(null)).toBe(false);
  });
  it("viewerInWaitingRoom: a member of a waiting duo / shared goal, nobody else", () => {
    expect(viewerInWaitingRoom({ participationType: "duo", runStatus: "waiting", viewerId: "a", memberIds: ["a"] })).toBe(true);
    expect(viewerInWaitingRoom({ participationType: "shared_goal", runStatus: "waiting", viewerId: "a", memberIds: ["a", "b"] })).toBe(true);
    expect(viewerInWaitingRoom({ participationType: "duo", runStatus: "waiting", viewerId: "b", memberIds: ["a"] })).toBe(false);
    expect(viewerInWaitingRoom({ participationType: "duo", runStatus: "active", viewerId: "a", memberIds: ["a"] })).toBe(false);
    expect(viewerInWaitingRoom({ participationType: "solo", runStatus: "waiting", viewerId: "a", memberIds: ["a"] })).toBe(false);
    expect(viewerInWaitingRoom({ participationType: "duo", runStatus: "waiting", viewerId: null, memberIds: ["a"] })).toBe(false);
    expect(WAITING_FOR_PARTNER_HEADING).not.toMatch(/!/);
  });
  it("Discover and the challenge page route a still-waiting join to the waiting room (source)", () => {
    const tab = read("app/(tabs)/discover.tsx");
    expect(tab.match(/else if \(joinLeftWaitingRoom\(join\)\) router\.push\(ROUTES\.CHALLENGE_ID\(/g)?.length).toBe(2);
    const detail = read("app/challenge/[id].tsx");
    expect(detail).toMatch(/else if \(joinLeftWaitingRoom\(result\)\)/);
    expect(detail).toMatch(/waitingRoom=\{waitingRoom && id && !finished \? \{ challengeId: id \} : undefined\}/);
    const v3 = read("components/challenge/ChallengeDetailV3.tsx");
    expect(v3).toMatch(/p\.waitingRoom \? \([\s\S]*?WAITING_FOR_PARTNER_HEADING[\s\S]*?<InviteLinkRow/);
    const byId = read("backend/trpc/routes/challenges.ts");
    expect(byId).toMatch(/participationType === "shared_goal" \|\| participationType === "duo"/);
  });
});
