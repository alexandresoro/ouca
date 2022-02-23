import { LieuDit } from "../graphql";
import { Coordinates } from "../types/coordinates.object";
import { areCoordinatesCustomized, areSameCoordinates } from "./coordinates-helper";

test("should correctly validate non-customized coordinated", () => {
  const lieudit: Omit<Partial<LieuDit>, "commune"> = {
    id: 1,
    coordinatesSystem: "gps",
    longitude: 10,
    latitude: -4,
    altitude: 45
  };

  expect(areCoordinatesCustomized(lieudit, 45, 10, -4, "gps")).toBe<boolean>(false);
});

test("should correctly validate customized coordinated", () => {
  const lieudit: Omit<Partial<LieuDit>, "commune"> = {
    id: 1,
    coordinatesSystem: "gps",
    longitude: 10,
    latitude: -4,
    altitude: 45
  };

  expect(areCoordinatesCustomized(lieudit, 33, 22, 11, "gps")).toBe<boolean>(true);
});

test("should correctly compare empty coordinates", () => {
  expect(areSameCoordinates(null, undefined)).toBe(true);
});

test("should correctly validate similar coordinates", () => {
  const coordinates: Coordinates = {
    system: "gps",
    longitude: 10,
    latitude: -4
  };

  expect(areSameCoordinates(coordinates, coordinates)).toBe<boolean>(true);
});

test("should correctly validate different coordinates", () => {
  const coordinates: Coordinates = {
    system: "gps",
    longitude: 10,
    latitude: -4
  };

  const differentCoordinates: Coordinates = {
    system: "gps",
    longitude: 11,
    latitude: -4
  };

  expect(areSameCoordinates(coordinates, differentCoordinates)).toBe<boolean>(false);
});
