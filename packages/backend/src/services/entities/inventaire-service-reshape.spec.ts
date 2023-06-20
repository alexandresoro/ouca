import { type UpsertInventoryInput } from "@ou-ca/common/api/inventory";
import { mock } from "vitest-mock-extended";
import { type Lieudit } from "../../repositories/lieudit/lieudit-repository-types.js";
import { reshapeInputInventaireUpsertData } from "./inventaire-service-reshape.js";

describe("Reshape input inventory", () => {
  test("should handle when custom coordinates are provided", () => {
    const inventory = mock<UpsertInventoryInput>({
      coordinates: {
        altitude: 23,
        latitude: 45,
        longitude: 67,
      },
    });
    const locality = mock<Lieudit>({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventaireUpsertData(inventory, locality);
    expect(inventoryReshaped.latitude).toEqual(45);
    expect(inventoryReshaped.longitude).toEqual(67);
    expect(inventoryReshaped.altitude).toEqual(23);
  });

  test("should handle when custom coordinates are provided and at least one differs from locality", () => {
    const inventory = mock<UpsertInventoryInput>({
      coordinates: {
        altitude: 23,
        latitude: 34,
        longitude: 56,
      },
    });
    const locality = mock<Lieudit>({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventaireUpsertData(inventory, locality);
    expect(inventoryReshaped.latitude).toEqual(34);
    expect(inventoryReshaped.longitude).toEqual(56);
    expect(inventoryReshaped.altitude).toEqual(23);
  });

  test("should handle when custom coordinates provided are similar to locality ones", () => {
    const inventory = mock<UpsertInventoryInput>({
      coordinates: {
        altitude: 12,
        latitude: 34,
        longitude: 56,
      },
    });
    const locality = mock<Lieudit>({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventaireUpsertData(inventory, locality);
    expect(inventoryReshaped.latitude).toBeNull();
    expect(inventoryReshaped.longitude).toBeNull();
    expect(inventoryReshaped.altitude).toBeNull();
  });

  test("should handle when custom coordinates are not provided", () => {
    const inventory = mock<UpsertInventoryInput>({
      coordinates: null,
    });
    const locality = mock<Lieudit>({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventaireUpsertData(inventory, locality);
    expect(inventoryReshaped.latitude).toBeNull();
    expect(inventoryReshaped.longitude).toBeNull();
    expect(inventoryReshaped.altitude).toBeNull();
  });
});
