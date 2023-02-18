import { type CoordinatesSystem, type CoordinatesSystemType } from "./coordinates-system.object.js";
import { GPS_COORDINATES } from "./gps.object.js";
import { LAMBERT_93_COORDINATES } from "./lambert-93.object.js";

export const COORDINATES_SYSTEMS_CONFIG: Record<CoordinatesSystemType, CoordinatesSystem> = {
  lambert93: LAMBERT_93_COORDINATES,
  gps: GPS_COORDINATES,
};
