import { describe, expect, it } from "vitest";
import { DS_V3, avatarTints, categoryTint, dynamicType } from "@/lib/design-system";

describe("v46 tokens", () => {
  it("uses weight 600 only on Title L, Title, and Headline", () => {
    expect(DS_V3.type.titleL.fontWeight).toBe("600");
    expect(DS_V3.type.title.fontWeight).toBe("600");
    expect(DS_V3.type.headline.fontWeight).toBe("600");
    expect(DS_V3.type.body.fontWeight).toBe("400");
    expect(DS_V3.type.secondary.fontWeight).toBe("400");
    expect(DS_V3.type.caption.fontWeight).toBe("500");
    expect(DS_V3.type.label.fontWeight).toBe("500");
    expect(DS_V3.type.number.fontWeight).toBe("800");
  });

  it("maps the retired names onto the v46 roles", () => {
    expect(DS_V3.type.display).toEqual(DS_V3.type.titleL);
    expect(DS_V3.type.heading).toEqual(DS_V3.type.title);
    expect(DS_V3.type.bodyStrong).toEqual(DS_V3.type.headline);
  });

  it("remaps Dynamic Type onto the v46 roles", () => {
    expect(dynamicType.titleL).toBe("title1");
    expect(dynamicType.title).toBe("title3");
    expect(dynamicType.headline).toBe("headline");
    expect(dynamicType.body).toBe("body");
    expect(dynamicType.secondary).toBe("subheadline");
    expect(dynamicType.caption).toBe("footnote");
    expect(DS_V3.type.headline).toMatchObject({ fontSize: 17, lineHeight: 22, fontWeight: "600" });
    expect(DS_V3.type.body).toMatchObject({ fontSize: 17, lineHeight: 22, fontWeight: "400" });
    expect(DS_V3.type.secondary).toMatchObject({ fontSize: 15, lineHeight: 20, fontWeight: "400" });
    expect(DS_V3.type.caption).toMatchObject({ fontSize: 13, lineHeight: 18, fontWeight: "500" });
    expect(dynamicType.number).toBeNull();
    expect(dynamicType.display).toBe(dynamicType.titleL);
    expect(dynamicType.heading).toBe(dynamicType.title);
    expect(dynamicType.bodyStrong).toBe("headline");
  });

  it("ports the flag 199 cover tints and six avatar pairs", () => {
    expect(categoryTint.Fitness).toBe("#2F4A66");
    expect(categoryTint.Learning).toBe("#5A5420");
    expect(Object.keys(categoryTint)).toEqual([
      "Fitness",
      "Faith",
      "Mind",
      "Health",
      "Discipline",
      "Learning",
    ]);
    expect(avatarTints).toHaveLength(6);
    expect(DS_V3.color.surface).toBe("#1A1918");
    expect(DS_V3.color.raised).toBe("#242322");
    expect(DS_V3.color.hairline).toBe("#2A2928");
    expect(DS_V3.color.border).toBe(DS_V3.color.hairline);
    expect(DS_V3.color.selectedBg).toBe("#F2F0EB");
    expect(DS_V3.color.selectedText).toBe("#0F0F0F");
    expect(DS_V3.numberSize.L).toBe(56);
    expect(DS_V3.space.gutter).toBe(16);
    expect(DS_V3.radius.card).toBe(16);
  });
});
