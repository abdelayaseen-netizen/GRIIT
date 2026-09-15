import { describe, expect, it } from "vitest";
import { HOME_BOOTSTRAP_QUERY_KEY, homeBootstrapQueryKey } from "@/lib/home-bootstrap-key";

describe("home bootstrap query key", () => {
  it("is [home, bootstrap, userId]", () => {
    expect(HOME_BOOTSTRAP_QUERY_KEY).toEqual(["home", "bootstrap"]);
    expect(homeBootstrapQueryKey("u1")).toEqual(["home", "bootstrap", "u1"]);
  });
});
