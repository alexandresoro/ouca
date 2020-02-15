import { LAMBERT_93_COORDINATES } from "./lambert-93.object";
import { GPS_COORDINATES } from "./gps.object";
import {
  CoordinatesSystemType,
  CoordinatesSystem
} from "./coordinates-system.object";

export const COORDINATES_SYSTEMS: Record<
  CoordinatesSystemType,
  CoordinatesSystem
> = {
  lambert93: LAMBERT_93_COORDINATES,
  gps: GPS_COORDINATES
};
