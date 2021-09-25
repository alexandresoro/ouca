import { LieuDit } from "../graphql";
import { Coordinates } from "../types/coordinates.object";
import { EntityWithCoordinates } from "../types/entity-with-coordinates.model";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getCoordinates = (
  object: EntityWithCoordinates,
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};

export const areCoordinatesCustomized = (
  lieudit: LieuDit,
  altitude: number,
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType
): boolean => {
  if (lieudit?.id) {
    const lieuditCoordinates: Coordinates = getCoordinates({
      coordinates: {
        latitude: lieudit.latitude,
        longitude: lieudit.longitude,
        system: lieudit.coordinatesSystem
      }
    }, system);

    if (
      lieudit.altitude !== altitude ||
      lieuditCoordinates.longitude !== longitude ||
      lieuditCoordinates.latitude !== latitude
    ) {
      return true;
    }
  }

  return false;
};

export const areSameCoordinates = (
  firstCoordinates: Coordinates,
  secondCoordinates: Coordinates
): boolean => {
  if (!firstCoordinates && !secondCoordinates) {
    return true;
  }

  if (firstCoordinates?.longitude && secondCoordinates?.longitude) {
    const firstCoordinatesTransformed = getCoordinates(
      { coordinates: firstCoordinates },
      secondCoordinates.system
    );

    if (
      firstCoordinatesTransformed.longitude === secondCoordinates.longitude &&
      firstCoordinatesTransformed.latitude === secondCoordinates.latitude
    ) {
      return true;
    }
  }

  return false;
};
