import { CoordinatesSystem, GPS } from "./coordinates-system.object";

export const GPS_COORDINATES: CoordinatesSystem = {
  code: GPS,
  name: "GPS",
  decimalPlaces: 5,
  unitName: "degrés",
  longitudeRange: { min: -180, max: 180 },
  latitudeRange: { min: -90, max: 90 }
};
