import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BADGE_TIERS,
  FINISH_TEXT_CARD_H,
  SHARE_BG_ITEMS,
  SHARE_CLEAR_CAPTION,
  SHARE_EMPTY,
  SHARE_PHOTO_PRIVATE,
  SHARE_SHEET,
  STICKER_W,
  backgroundFromSegment,
  badgeHeadline,
  consistencyProofLine,
  dayStickerCaption,
  defaultStickerBackground,
  facebookAppId,
  fitNumeral,
  instagramStoriesShareInput,
  photoBackgroundAllowed,
  proofLabel,
  shareNativeModules,
  showStoryAction,
  stickerBackgrounds,
} from "@/lib/share-sticker";

describe("share sticker A–C reductions", () => {
  it("fits numerals, proof lines, and badge names from the record", () => {
    expect(fitNumeral(1)).toBe(64);
    expect(fitNumeral(10)).toBe(58);
    expect(fitNumeral(100)).toBe(46);
    expect(STICKER_W).toBe(300);
    expect(FINISH_TEXT_CARD_H).toBe(252);
    expect(proofLabel("camera")).toBe("Camera");
    expect(proofLabel("camera_place")).toBe("Camera · Place");
    expect(proofLabel("self")).toBe("Self-reported");
    expect(consistencyProofLine({ secured: 4, cameraSecured: 4 })).toBe("Camera, all 4");
    expect(consistencyProofLine({ secured: 4, cameraSecured: 2 })).toBe("Camera, 2 of 4");
    expect(consistencyProofLine({ secured: 4, cameraSecured: 0 })).toBe("All self-reported");
    expect(badgeHeadline(1)).toBe("First day secured day");
    expect(badgeHeadline(7)).toBe("One week secured days");
    expect(BADGE_TIERS.map((t) => t.count)).toEqual([1, 7, 21, 30, 75]);
    expect(dayStickerCaption({ challenge: "Iron man", day: 12, durationDays: 30 })).toBe(
      "Iron man · Day 12 of 30",
    );
  });
});

describe("photo background is only offered for a shared photo", () => {
  it("hides Photo with no camera, disables it when the photo was kept", () => {
    expect(photoBackgroundAllowed({ hasPhoto: false, photoShared: false })).toBe("absent");
    expect(photoBackgroundAllowed({ hasPhoto: true, photoShared: false })).toBe("private");
    expect(photoBackgroundAllowed({ hasPhoto: true, photoShared: true })).toBe("ok");
    expect(stickerBackgrounds("absent")).toEqual(["clear", "card"]);
    expect(stickerBackgrounds("private")).toEqual(["clear", "card", "photo"]);
    expect(defaultStickerBackground("ok")).toBe("photo");
    expect(defaultStickerBackground("private")).toBe("card");
    expect(backgroundFromSegment("Photo")).toBe("photo");
    expect(SHARE_PHOTO_PRIVATE).toBe("This photo is private, so it can't be used here.");
    expect(SHARE_CLEAR_CAPTION).toContain("transparent sticker");
    expect(SHARE_SHEET).toBe("Share");
    expect(SHARE_EMPTY).toBe("Nothing to share yet.");
    expect([...SHARE_BG_ITEMS]).toEqual(["Clear", "Card", "Photo"]);
  });
});

describe("Meta App ID comes from config only", () => {
  it("reads EXPO_PUBLIC_FACEBOOK_APP_ID and never ships a hardcoded id", () => {
    expect(facebookAppId({})).toBe("");
    expect(facebookAppId({ EXPO_PUBLIC_FACEBOOK_APP_ID: " 123 " })).toBe("123");
    expect(
      instagramStoriesShareInput({ imageUri: "file://s.png", asSticker: true, appId: "123" }),
    ).toEqual({
      social: "instagramstories",
      appId: "123",
      stickerImage: "file://s.png",
    });
    expect(
      instagramStoriesShareInput({ imageUri: "file://s.png", asSticker: false, appId: "123" }),
    ).toEqual({
      social: "instagramstories",
      appId: "123",
      backgroundImage: "file://s.png",
    });
    expect(instagramStoriesShareInput({ imageUri: "file://s.png", asSticker: true, appId: "" })).toBe(
      null,
    );
    expect(showStoryAction("")).toBe(false);
    expect(showStoryAction("   ")).toBe(false);
    expect(showStoryAction("123")).toBe(true);
    const cfg = readFileSync(resolve(__dirname, "./config.ts"), "utf8");
    const share = readFileSync(resolve(__dirname, "./share.ts"), "utf8");
    const sticker = readFileSync(resolve(__dirname, "./share-sticker.ts"), "utf8");
    expect(cfg).toContain("EXPO_PUBLIC_FACEBOOK_APP_ID");
    expect(share).toContain("facebookAppId");
    expect(share).toContain("shareSingle");
    expect(share).toContain("InstagramStories");
    expect(share).not.toContain("instagramStoriesUrl");
    expect(sticker).not.toContain("instagramStoriesUrl");
    expect(share).not.toContain("instagram-stories://share?");
    expect(sticker).not.toMatch(/facebookAppId\([^)]*['"][0-9]{5,}/);
  });
});

describe("native share modules vs package.json", () => {
  it("uses view-shot, expo-sharing, and react-native-share; media-library is still absent", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "../package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    const mods = shareNativeModules(pkg.dependencies);
    expect(mods.viewShot).toBe(true);
    expect(mods.expoSharing).toBe(true);
    expect(mods.reactNativeShare).toBe(true);
    expect(mods.mediaLibrary).toBe(false);
    const ios = readFileSync(resolve(__dirname, "../app.json"), "utf8");
    expect(ios).toContain("react-native-share");
    expect(ios).toContain("instagram-stories");
  });
});

describe("ShareCardV3 is gone and Story uses the text card or ShareSticker", () => {
  it("has no ShareCardV3 callers; FinishMoment Story opens the sticker sheet", () => {
    const finish = readFileSync(
      resolve(__dirname, "../components/task-v2/FinishMomentV3.tsx"),
      "utf8",
    );
    const flow = readFileSync(resolve(__dirname, "../components/task-v2/TaskFlowV2.tsx"), "utf8");
    const daySheet = readFileSync(
      resolve(__dirname, "../components/share/DayStickerSheet.tsx"),
      "utf8",
    );
    const moment = readFileSync(
      resolve(__dirname, "../components/task-v2/MomentScreenV3.tsx"),
      "utf8",
    );
    expect(finish).toContain("FinishTextCard");
    expect(finish).toContain("ShareStickerSheet");
    expect(flow).not.toContain("ShareCardV3");
    expect(daySheet).not.toContain("ShareCardV3");
    expect(moment).not.toContain("ShareCardV3");
    expect(finish).not.toContain("ShareCardV3");
  });
});

describe("empty id → no Story action rendered", () => {
  it("hides Instagram Story when the Meta App ID is empty", () => {
    expect(showStoryAction("")).toBe(false);
    const sheet = readFileSync(
      resolve(__dirname, "../components/share/ShareStickerSheet.tsx"),
      "utf8",
    );
    expect(sheet).toContain("showStoryAction(facebookAppId())");
    expect(sheet).toContain("{showStory ? (");
    expect(sheet).toContain("SHARE_STORY");
    expect(sheet).toContain("SHARE_COPY");
    expect(sheet).toContain("SHARE_SAVE");
    expect(sheet).toContain("SHARE_MORE");
  });
});
