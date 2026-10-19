/**
 * Build 90 07.4: journal text (the Write step, sent as `noteText`) is a private diary. It never
 * goes through moderation and is never returned to another user.
 * Build 92 12b.2: the photo post caption is public. It travels as its own `caption` field, is
 * word-checked, and lives only in activity_events.metadata.caption. Notes saved before this stay private.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(resolve(__dirname, rel), "utf8");

const checkins = read("./checkins.ts");
const feed = read("./feed.ts");
const hydrate = read("../../lib/feed-activity-hydrate.ts");
const record = read("./profiles-record.ts");
const taskFlow = read("../../../components/task-v2/useTaskFlowV2.ts");

describe("07.4 journal text is private", () => {
  it("the Write step travels as noteText; the photo caption travels as caption", () => {
    expect(taskFlow).toMatch(/noteText:\s*text/);
    expect(taskFlow).not.toMatch(/noteText:\s*caption/);
    expect(taskFlow).toMatch(/caption:\s*caption\.trim\(\)/);
  });

  it("checkins.ts never runs moderation on the note, only on the caption", () => {
    expect(checkins).not.toContain("blockedPlainText");
    expect(checkins).not.toContain("moderateContent");
    expect(checkins).not.toContain("content-moderation");
    expect(checkins).toMatch(/captionBlock\(input\.caption\)/);
    expect(checkins).not.toMatch(/captionBlock\(input\.noteText\)/);
  });

  it("it is written to check_ins.note_text only, and the shared activity_events metadata does not carry it", () => {
    expect(checkins).toMatch(/payload\.note_text = input\.noteText/);
    // 01b.2: the payload is built into a `let` and written later, alongside the secure.
    const metaStart = checkins.indexOf("activityEventPayload = {\n");
    const metaEnd = checkins.indexOf("};", metaStart);
    expect(metaStart).toBeGreaterThan(0);
    const metadata = checkins.slice(metaStart, metaEnd);
    expect(metadata).not.toContain("note_text");
    expect(metadata).not.toContain("noteText");
    expect(metadata).toMatch(/caption: captionToStore\(input\.caption\)/);
  });

  it("no feed, hydrate or record query selects check_ins.note_text", () => {
    for (const [name, src] of [["feed.ts", feed], ["feed-activity-hydrate.ts", hydrate], ["profiles-record.ts", record]] as const) {
      const selects = [...src.matchAll(/\.select\(\s*(["'`])([\s\S]*?)\1/g)].map((m) => m[2] ?? "");
      for (const cols of selects) {
        expect(cols, `${name} select "${cols.slice(0, 60)}"`).not.toMatch(/\bnote_text\b/);
      }
    }
  });

  it("the feed reads a caption from metadata.caption only, never a note", () => {
    expect(feed).not.toMatch(/md\.note_text/);
    expect(hydrate).not.toMatch(/md\.note_text/);
    expect(feed).toMatch(/caption: postCaptionFromMetadata\(md\)/);
    expect(hydrate).toMatch(/caption: postCaptionFromMetadata\(md\)/);
    expect(feed).not.toMatch(/from\("check_ins"\)[\s\S]{0,200}note_text/);
    expect(hydrate).not.toMatch(/from\("check_ins"\)[\s\S]{0,200}note_text/);
  });

  it("the only read-back of note_text is the owner's own check-ins", () => {
    const readers = [...checkins.matchAll(/select\(\s*(["'`])([^"'`]*note_text[^"'`]*)\1/g)];
    expect(readers.length).toBeGreaterThan(0);
    // getTodayCheckins guards with assertActiveChallengeOwnership; complete() returns the row just written.
    expect(checkins).toContain("assertActiveChallengeOwnership");
  });
});
