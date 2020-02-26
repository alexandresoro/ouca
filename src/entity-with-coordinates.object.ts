import { CoordinatesSystemType } from "./coordinates-system/coordinates-system.object";
import { Coordinates } from "./coordinates.object";

export interface EntityWithCoordinates {
  coordinates: Partial<Record<CoordinatesSystemType, Coordinates>>;
}
