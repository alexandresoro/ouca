import { type Inventaire, type RawInventaire } from "./inventaire-repository-types";

export const reshapeRawInventaire = (rawInventaire: RawInventaire | null): Inventaire | null => {
  if (!rawInventaire) {
    return null;
  }

  const { altitude, latitude, longitude, coordinatesSystem, ...restInventaire } = rawInventaire;

  const customizedCoordinates =
    coordinatesSystem != null && altitude != null && latitude != null && longitude != null
      ? {
          altitude,
          latitude,
          longitude,
          system: coordinatesSystem,
        }
      : null;

  return {
    ...restInventaire,
    customizedCoordinates,
  };
};
