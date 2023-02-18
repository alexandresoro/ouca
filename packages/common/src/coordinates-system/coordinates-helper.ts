import { type Coordinates } from "../types/coordinates.object.js";
import { type CoordinatesSystemType } from "./coordinates-system.object.js";
import { transformCoordinates } from "./coordinates-transformer.js";

type LieuDitForCoordinates = {
  id?: unknown;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  coordinatesSystem?: CoordinatesSystemType;
};

export const getCoordinates = (
  object: { coordinates: Coordinates },
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};

export const areCoordinatesCustomized = (
  lieudit: LieuDitForCoordinates,
  altitude: number,
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType
): boolean => {
  if (lieudit?.id) {
    const lieuditCoordinates: Coordinates = getCoordinates(
      {
        coordinates: {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          latitude: lieudit.latitude!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          longitude: lieudit.longitude!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          system: lieudit.coordinatesSystem!,
        },
      },
      system
    );

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
  firstCoordinates: Coordinates | null | undefined,
  secondCoordinates: Coordinates | null | undefined
): boolean => {
  if (!firstCoordinates && !secondCoordinates) {
    return true;
  }

  if (firstCoordinates?.longitude && secondCoordinates?.longitude) {
    const firstCoordinatesTransformed = getCoordinates({ coordinates: firstCoordinates }, secondCoordinates.system);

    if (
      firstCoordinatesTransformed.longitude === secondCoordinates.longitude &&
      firstCoordinatesTransformed.latitude === secondCoordinates.latitude
    ) {
      return true;
    }
  }

  return false;
};
