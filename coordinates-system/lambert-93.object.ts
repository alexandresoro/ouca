import { CoordinatesSystem, LAMBERT_93 } from "./coordinates-system.object";

export const LAMBERT_93_COORDINATES: CoordinatesSystem = {
  code: LAMBERT_93,
  name: "Lambert 93",
  decimalPlaces: 1,
  unitName: "mètres",
  longitudeRange: { min: 0, max: 1300000 },
  latitudeRange: { min: 6000000, max: 7200000 }
};
