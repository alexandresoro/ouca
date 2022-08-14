import { Coordinates } from "../types/coordinates.object";
import { transformCoordinates } from "./coordinates-transformer";

test("should throw an error if coordinates are missing", () => {
  expect(() => transformCoordinates(null, "gps")).toThrowError();
});

test("should throw an error if system is missing", () => {
  const inputCoordinates: Coordinates = {
    system: "gps",
    latitude: 10,
    longitude: -3,
  };

  expect(() => transformCoordinates(inputCoordinates, undefined)).toThrowError();
});

test("should not transform coordinates if the system is the same", () => {
  const inputCoordinates: Coordinates = {
    system: "gps",
    latitude: 10,
    longitude: -3,
  };

  expect(transformCoordinates(inputCoordinates, "gps")).toBe<Coordinates>(inputCoordinates);
});

test("should convert coordinates from Lambert to GPS", () => {
  const inputCoordinates: Coordinates = {
    system: "lambert93",
    latitude: 6250000,
    longitude: 460000,
  };

  expect(transformCoordinates(inputCoordinates, "gps")).toEqual<Coordinates>({
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

  expect(transformCoordinates(inputCoordinates, "lambert93")).toEqual<Coordinates>({
    latitude: 909838.93,
    longitude: 253531.13,
    system: "lambert93",
    areTransformed: true,
    areInvalid: true,
  });
});
