import assert from "node:assert";
import test from "node:test";
import { areCoordinatesCustomized } from "./coordinates-helper.js";
import type { CoordinatesSystemType } from "./coordinates-system.object.js";

test("should correctly validate non-customized coordinated", () => {
  const lieudit = {
    id: 1,
    coordinatesSystem: "gps" as CoordinatesSystemType,
    longitude: 10,
    latitude: -4,
    altitude: 45,
  };

  assert.strictEqual(areCoordinatesCustomized(lieudit, 45, 10, -4, "gps"), false);
});

test("should correctly validate customized coordinated", () => {
  const lieudit = {
    id: 1,
    coordinatesSystem: "gps" as CoordinatesSystemType,
    longitude: 10,
    latitude: -4,
    altitude: 45,
  };

  assert.strictEqual(areCoordinatesCustomized(lieudit, 33, 22, 11, "gps"), true);
});
