import { LieuDit } from "../graphql";
import { Coordinates } from "../types/coordinates.object";
import { CoordinatesSystemType } from "./coordinates-system.object";
import { transformCoordinates } from "./coordinates-transformer";

export const getCoordinates = (
  object: { coordinates: Coordinates },
  coordinatesSystem: CoordinatesSystemType
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};

export const areCoordinatesCustomized = (
  lieudit: Omit<Partial<LieuDit>, "commune">,
  altitude: number,
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType
): boolean => {
  if (lieudit?.id) {
    const lieuditCoordinates: Coordinates = getCoordinates(
      {
        coordinates: {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          latitude: lieudit.latitude as number,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          longitude: lieudit.longitude as number,
          system: lieudit.coordinatesSystem as CoordinatesSystemType,
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
