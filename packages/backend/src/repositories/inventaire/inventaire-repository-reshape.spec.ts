import { mock } from "vitest-mock-extended";
import { reshapeRawInventaire } from "./inventaire-repository-reshape.js";
import { type Inventaire, type RawInventaire } from "./inventaire-repository-types.js";

describe("Inventaire reshaper", () => {
  describe("customized coordinates", () => {
    test("should handle complete customized coordinates", () => {
      const rawInventaire = mock<RawInventaire>({
        altitude: 12,
        latitude: 45,
        longitude: 0,
      });

      const inventaire = reshapeRawInventaire(rawInventaire);

      expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>({
        altitude: 12,
        latitude: 45,
        longitude: 0,
      });
    });

    test("should not return incomplete customized coordinates", () => {
      const rawInventaire = mock<RawInventaire>({
        altitude: 12,
        latitude: null,
        longitude: 0,
      });

      const inventaire = reshapeRawInventaire(rawInventaire);

      expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>(null);
    });

    test("should handle no customized coordinates", () => {
      const rawInventaire = mock<RawInventaire>({
        altitude: null,
        latitude: null,
        longitude: null,
      });

      const inventaire = reshapeRawInventaire(rawInventaire);

      expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>(null);
    });
  });
});
