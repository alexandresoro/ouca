import { Coordinates } from "../coordinates.object";
import { EntityWithCoordinates } from "../entity-with-coordinates.model";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getOriginCoordinates = (
  object: EntityWithCoordinates
): Coordinates => {
  return object?.coordinates ? object.coordinates : null;
};

export const getCoordinates = (
  object: EntityWithCoordinates,
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  const originCoordinates: Coordinates = getOriginCoordinates(object);
  return transformCoordinates(originCoordinates, coordinatesSystem);
};
