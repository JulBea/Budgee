import { describe, expect, it } from "vitest";
import { mapBridgeCategoryToBudgeeCategoryName } from "./bridgeCategoryMap";

describe("mapBridgeCategoryToBudgeeCategoryName", () => {
  it("maps known Bridge subcategory ids to their Budgee category", () => {
    expect(mapBridgeCategoryToBudgeeCategoryName(83)).toBe("Alimentation");
    expect(mapBridgeCategoryToBudgeeCategoryName(216)).toBe("Logement");
    expect(mapBridgeCategoryToBudgeeCategoryName(277)).toBe("Abonnements");
    expect(mapBridgeCategoryToBudgeeCategoryName(230)).toBe("Salaire");
  });

  it("returns null for null input", () => {
    expect(mapBridgeCategoryToBudgeeCategoryName(null)).toBeNull();
  });

  it("returns null for an id outside the known taxonomy", () => {
    expect(mapBridgeCategoryToBudgeeCategoryName(999999)).toBeNull();
  });
});
