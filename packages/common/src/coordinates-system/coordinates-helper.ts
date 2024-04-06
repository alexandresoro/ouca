import type { Locality } from "../api/entities/locality.js";
import type { Coordinates } from "../types/coordinates.object.js";
import type { CoordinatesSystemType } from "./coordinates-system.object.js";
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
  coordinatesSystem: CoordinatesSystemType,
): Coordinates => {
  return transformCoordinates(object.coordinates, coordinatesSystem);
};

/**
 * @deprecated use areCoordinatesCustom instead
 */
export const areCoordinatesCustomized = (
  lieudit: LieuDitForCoordinates,
  altitude: number,
  longitude: number,
  latitude: number,
  system: CoordinatesSystemType,
): boolean => {
  if (lieudit?.id) {
    const lieuditCoordinates: Coordinates = getCoordinates(
      {
        coordinates: {
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          latitude: lieudit.latitude!,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          longitude: lieudit.longitude!,
          system: "gps",
        },
      },
      system,
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

export const areCoordinatesCustom = (
  locality: Locality,
  altitude: number,
  longitude: number,
  latitude: number,
): boolean => {
  return (
    locality.coordinates.altitude !== altitude ||
    locality.coordinates.longitude !== longitude ||
    locality.coordinates.latitude !== latitude
  );
};
