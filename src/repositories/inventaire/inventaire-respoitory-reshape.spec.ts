import { mock } from "jest-mock-extended";
import { reshapeRawInventaire } from "./inventaire-repository-reshape";
import { type Inventaire, type RawInventaire } from "./inventaire-repository-types";

describe("Inventaire reshaper", () => {
  test("should handle complete customized coordinates", () => {
    const rawInventaire = mock<RawInventaire>({
      altitude: 12,
      latitude: 45,
      longitude: 0,
      coordinatesSystem: "gps",
    });

    const inventaire = reshapeRawInventaire(rawInventaire);

    expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>({
      altitude: 12,
      latitude: 45,
      longitude: 0,
      system: "gps",
    });
  });

  test("should not return incomplete customized coordinates", () => {
    const rawInventaire = mock<RawInventaire>({
      altitude: 12,
      latitude: null,
      longitude: 0,
      coordinatesSystem: "gps",
    });

    const inventaire = reshapeRawInventaire(rawInventaire);

    expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>(null);
  });

  test("should handle no customized coordinates", () => {
    const rawInventaire = mock<RawInventaire>({
      altitude: null,
      latitude: null,
      longitude: null,
      coordinatesSystem: null,
    });

    const inventaire = reshapeRawInventaire(rawInventaire);

    expect(inventaire?.customizedCoordinates).toEqual<Inventaire["customizedCoordinates"]>(null);
  });
});
