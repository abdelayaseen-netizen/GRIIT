import { describe, expect, it } from "vitest";
import { rateLimitSubject } from "./rate-limit";

function token(sub: string): string {
  const payload = Buffer.from(JSON.stringify({ sub })).toString("base64url");
  return `header.${payload}.sig`;
}

describe("rateLimitSubject", () => {
  it("gives each signed-in user their own bucket", () => {
    expect(rateLimitSubject(`Bearer ${token("user-a")}`, "10.0.0.1")).toBe("user:user-a");
    expect(rateLimitSubject(`Bearer ${token("user-b")}`, "10.0.0.1")).toBe("user:user-b");
  });

  it("keeps anonymous traffic on the IP bucket", () => {
    expect(rateLimitSubject(null, "10.0.0.1")).toBe("ip:10.0.0.1");
    expect(rateLimitSubject("Bearer not-a-jwt", "")).toBe("ip:unknown");
  });
});
