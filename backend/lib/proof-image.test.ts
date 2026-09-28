import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROOF_SIGN_TTL_SEC,
  canSignProofPath,
  ownedProofWrite,
  pathOwnerId,
  sharedPathsFromEvents,
  signProofPaths,
  storedProofValue,
  toProofPath,
} from "./proof-image";

const OWNER = "10556c76-3c37-4204-8915-fc7fd3b16a59";
const OTHER = "00000000-0000-4000-8000-000000000099";
const PATH = `${OWNER}/1789831043561-74pcldt5.jpg`;

describe("storedProofValue", () => {
  it("normalises a public URL to a path and leaves a path alone", () => {
    expect(
      storedProofValue(`https://x.supabase.co/storage/v1/object/public/task-proofs/${PATH}`),
    ).toBe(PATH);
    expect(storedProofValue(PATH)).toBe(PATH);
    expect(storedProofValue("file:///var/mobile/p.jpg")).toBe("file:///var/mobile/p.jpg");
  });
});

describe("ownedProofWrite", () => {
  it("user A cannot write B's path; file:// is never stored", () => {
    const publicA = `https://x.supabase.co/storage/v1/object/public/task-proofs/${PATH}`;
    const publicB = `https://x.supabase.co/storage/v1/object/public/task-proofs/${OTHER}/secret.jpg`;
    expect(ownedProofWrite(publicA, OWNER)).toBe(PATH);
    expect(ownedProofWrite(PATH, OWNER)).toBe(PATH);
    expect(ownedProofWrite(publicB, OWNER)).toBeNull();
    expect(ownedProofWrite(`${OTHER}/secret.jpg`, OWNER)).toBeNull();
    expect(ownedProofWrite("file:///var/mobile/p.jpg", OWNER)).toBeNull();
  });
});

describe("toProofPath", () => {
  it("accepts a public URL or a bare path", () => {
    expect(
      toProofPath(`https://x.supabase.co/storage/v1/object/public/task-proofs/${PATH}`),
    ).toBe(PATH);
    expect(
      toProofPath(`https://x.supabase.co/storage/v1/object/sign/task-proofs/${PATH}?token=abc`),
    ).toBe(PATH);
    expect(toProofPath(PATH)).toBe(PATH);
    expect(toProofPath(`task-proofs/${PATH}`)).toBe(PATH);
    expect(toProofPath("file:///var/mobile/p.jpg")).toBeNull();
    expect(toProofPath("https://cdn.example/not-storage.jpg")).toBeNull();
    expect(toProofPath(null)).toBeNull();
  });
});

describe("canSignProofPath", () => {
  it("owner first-folder or a shared activity path", () => {
    expect(pathOwnerId(PATH)).toBe(OWNER);
    expect(canSignProofPath(PATH, OWNER, new Set())).toBe(true);
    expect(canSignProofPath(PATH, OTHER, new Set())).toBe(false);
    expect(canSignProofPath(PATH, OTHER, new Set([PATH]))).toBe(true);
  });
});

describe("signProofPaths", () => {
  it("batches one createSignedUrls call at TTL 300 and nulls unshared others", async () => {
    const signed = new Map<string, string | null>([
      [PATH, `https://x.supabase.co/storage/v1/object/sign/task-proofs/${PATH}?token=t`],
    ]);
    let calls = 0;
    const out = await signProofPaths(
      [
        `https://x.supabase.co/storage/v1/object/public/task-proofs/${PATH}`,
        `${OTHER}/secret.jpg`,
        null,
      ],
      OWNER,
      {
        sharedPaths: new Set(),
        createSignedUrls: async (paths, ttl) => {
          calls += 1;
          expect(ttl).toBe(PROOF_SIGN_TTL_SEC);
          expect(paths).toEqual([PATH]);
          return signed;
        },
      },
    );
    expect(calls).toBe(1);
    expect(out[0]).toContain("/object/sign/task-proofs/");
    expect(out[1]).toBeNull();
    expect(out[2]).toBeNull();
  });

  it("signs another user's path only when a shared row references it", async () => {
    const sharedPath = `${OTHER}/public.jpg`;
    const out = await signProofPaths([sharedPath], OWNER, {
      sharedPaths: sharedPathsFromEvents([
        {
          user_id: OTHER,
          share_state: "shared",
          metadata: {
            photo_url: `https://x.supabase.co/storage/v1/object/public/task-proofs/${sharedPath}`,
          },
        },
      ]),
      createSignedUrls: async (paths) => new Map(paths.map((p) => [p, `signed:${p}`])),
    });
    expect(out[0]).toBe(`signed:${sharedPath}`);
  });

  it("A's shared post with B's path never signs B's photo", async () => {
    const bPath = `${OTHER}/secret.jpg`;
    const out = await signProofPaths([bPath], OWNER, {
      sharedPaths: sharedPathsFromEvents([
        {
          user_id: OWNER,
          share_state: "shared",
          metadata: { photo_url: bPath },
        },
      ]),
      createSignedUrls: async (paths) => new Map(paths.map((p) => [p, `signed:${p}`])),
    });
    expect(out[0]).toBeNull();
  });
});

describe("API call sites", () => {
  it("every proof-returning route signs through proof-image", () => {
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const record = readFileSync(resolve(__dirname, "../trpc/routes/profiles-record.ts"), "utf8");
    const checkins = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    const hydrate = readFileSync(resolve(__dirname, "./feed-activity-hydrate.ts"), "utf8");
    expect(hydrate).toContain("signProofPaths");
    expect(feed).toContain("signProofPair");
    expect(feed).toContain("signProofPaths");
    expect(record).toContain("cover_url");
    expect(record).toContain("signProofPaths");
    expect(checkins).toContain("signProofPaths");
    expect(feed).not.toContain("object/public/task-proofs");
    expect(record).not.toContain("object/public/task-proofs");
    expect(checkins).not.toContain("object/public/task-proofs");
    expect(hydrate).not.toContain("object/public/task-proofs");
    expect(checkins).toContain("signProofPaths");
  });

  it("new uploads store a path and writes normalise URLs", () => {
    const checkins = readFileSync(resolve(__dirname, "../trpc/routes/checkins.ts"), "utf8");
    const feed = readFileSync(resolve(__dirname, "../trpc/routes/feed.ts"), "utf8");
    const upload = readFileSync(resolve(__dirname, "../../lib/uploadProofImage.ts"), "utf8");
    expect(checkins).toContain("ownedProofWrite");
    expect(feed).toContain("ownedProofWrite");
    expect(feed).toContain("proofPhotoUrl: z.string().max(2000)");
    expect(feed).not.toContain("proofPhotoUrl: z.string().url()");
    expect(upload).toContain("return { url: data.path }");
    expect(upload).not.toContain("getPublicUrl");
  });
});
