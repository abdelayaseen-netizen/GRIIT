import { describe, expect, it, vi } from "vitest";
import { deleteAccountSteps } from "./delete-account-plan";
import { eraseUserData } from "./delete-account";
import { blockedPlainText } from "./content-moderation";

describe("delete account", () => {
  it("covers the user-owned tables, storage, and the auth user", () => {
    const steps = deleteAccountSteps();
    expect(steps).toContain("check_ins.user_id");
    expect(steps).toContain("challenges.creator_id=null");
    expect(steps).toContain("storage.task-proofs");
    expect(steps).toContain("auth.users");
  });

  it("calls delete for each planned row and then the auth user", async () => {
    const calls: string[] = [];
    const eq = (table: string) => (column: string) => {
      calls.push(`${table}.${column}`);
      return Promise.resolve({ error: null });
    };
    const admin = {
      from: (table: string) => ({
        delete: () => ({ eq: eq(table) }),
        update: () => ({ eq: eq(`${table}=null`) }),
      }),
      storage: {
        from: (bucket: string) => ({
          list: async () => {
            calls.push(`storage.${bucket}`);
            return { data: [{ name: "a.jpg" }], error: null };
          },
          remove: async () => {
            calls.push(`storage.${bucket}.remove`);
            return { error: null };
          },
        }),
      },
      auth: { admin: { deleteUser: async () => { calls.push("auth.users"); return { error: null }; } } },
    };
    await eraseUserData(admin, "user-1");
    expect(calls).toContain("profiles.user_id");
    expect(calls).toContain("auth.users");
    expect(calls).toContain("storage.task-proofs.remove");
  });
});

describe("blockedPlainText", () => {
  it("rejects a profane caption and allows an ordinary name", () => {
    expect(blockedPlainText("what the shit")).toBe("That isn't allowed. Try different words.");
    expect(blockedPlainText("Maya Adeyemi")).toBeNull();
  });
});

describe("logger stays quiet in the delete test", () => {
  it("does not throw when a step returns an error", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const admin = {
      from: () => ({
        delete: () => ({ eq: async () => ({ error: { message: "missing" } }) }),
        update: () => ({ eq: async () => ({ error: null }) }),
      }),
      storage: {
        from: () => ({
          list: async () => ({ data: [], error: null }),
          remove: async () => ({ error: null }),
        }),
      },
      auth: { admin: { deleteUser: async () => ({ error: null }) } },
    };
    await expect(eraseUserData(admin, "user-1")).resolves.toBeUndefined();
  });
});
