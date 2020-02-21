import {
  CoordinatesSystem,
  CoordinatesSystemType
} from "./coordinates-system.object";
import { GPS_COORDINATES } from "./gps.object";
import { LAMBERT_93_COORDINATES } from "./lambert-93.object";

export const COORDINATES_SYSTEMS_CONFIG: Record<
  CoordinatesSystemType,
  CoordinatesSystem
> = {
  lambert93: LAMBERT_93_COORDINATES,
  gps: GPS_COORDINATES
};
