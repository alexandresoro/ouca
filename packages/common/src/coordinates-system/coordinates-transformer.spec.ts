import assert from "node:assert";
import test from "node:test";
import type { Coordinates } from "../types/coordinates.object.js";
import { transformCoordinates } from "./coordinates-transformer.js";

test("should throw an error if coordinates are missing", () => {
  assert.throws(() => transformCoordinates(null, "gps"));
});

test("should throw an error if system is missing", () => {
  const inputCoordinates: Coordinates = {
    system: "gps",
    latitude: 10,
    longitude: -3,
  };

  assert.throws(() => transformCoordinates(inputCoordinates, undefined));
});

test("should not transform coordinates if the system is the same", () => {
  const inputCoordinates: Coordinates = {
    system: "gps",
    latitude: 10,
    longitude: -3,
  };

  assert.deepStrictEqual(transformCoordinates(inputCoordinates, "gps"), inputCoordinates);
});

test("should convert coordinates from Lambert to GPS", () => {
  const inputCoordinates: Coordinates = {
    system: "lambert93",
    latitude: 6250000,
    longitude: 460000,
  };

  assert.deepStrictEqual(transformCoordinates(inputCoordinates, "gps"), {
    latitude: 43.308711,
    longitude: 0.042885,
    system: "gps",
    areTransformed: true,
    areInvalid: false,
  });
});

test("should detect transformation to invalid coordinates", () => {
  const inputCoordinates: Coordinates = {
    system: "gps",
    latitude: 0,
    longitude: 0,
  };

  assert.deepStrictEqual(transformCoordinates(inputCoordinates, "lambert93"), {
    latitude: 909838.93,
    longitude: 253531.13,
    system: "lambert93",
    areTransformed: true,
    areInvalid: true,
  });
});
