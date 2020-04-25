import { Coordinates } from "../coordinates.object";
import { EntityWithCoordinates } from "../entity-with-coordinates.model";
import { Lieudit } from "../lieudit.model";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getCoordinates = (
  object: EntityWithCoordinates,
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};

export const areCoordinatesCustomized = (
  lieudit: Lieudit,
  altitude: number,
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType
): boolean => {
  if (lieudit?.id) {
    const lieuditCoordinates: Coordinates = getCoordinates(lieudit, system);

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
