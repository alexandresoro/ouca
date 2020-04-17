import { Coordinates } from "../coordinates.object";
import { EntityWithCoordinates } from "../entity-with-coordinates.model";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getCoordinates = (
  object: EntityWithCoordinates,
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};
